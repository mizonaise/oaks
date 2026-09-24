/**
 * LA FAÇADE MULTIPART DE FOX-CAD (d5, 23/09/2026, ligne du lead 13:5x : régression visible en public, capture de Dorian 13:01).
 *
 * Depuis la règle de d1 (fox-cad `bbfff6b`, « la façade à cadre FR_08_LAM — le plus petit cas vert »), `POST /calcul` ne refuse plus la façade
 * à cadre d'un module plein : il rend LE PARENT (`front`, définition `MP_1_FR_SHELL_FR08_LAM`, 2 340 × 587 × 22,4, charnières) ET SES SIX
 * SOUS-PIÈCES (`<hiérarchie>.mp1` … `.mp6` : quatre pièces de cadre `PD_1_FR_EE1E` / `E1EE` de 23 mm, le panneau `PD_1_FR_MAIN_FR08_VRN`, la
 * surface `SRF_FR_3_TOP_EEEE` d'épaisseur 0). Mesuré sur 4311 le 23/09 : `WACA_LY_D` plat en FR_08 passe de 12 pièces + 1 manque à 19 pièces
 * + 0 manque. Le compte et le prix sont justes ; mais toutes ces pièces passent `estPorte` — le masque du chemin d'Otman cachait alors la
 * porte du designer (« fox-cad a la porte »), et `FoxCadPieces` dessinait sept panneaux nus (MDF brut sans texture = blanc, la surface
 * d'épaisseur 0 non rendue) : les trois colonnes droites de HEX sortaient en portes BLANCHES, sans cadre ni toile, et six poignées par porte.
 *
 * (a) La règle d'attente : quand la pièce de fox-cad est une façade multipart — une porte dont la définition est une pièce multiple (`MP_…`)
 * ou qui a des sous-pièces de rôle porte — et que fox-cad ne sait pas encore la dessiner, le masque NE cache PAS la porte du designer
 * d'Otman, et fox-cad ne dessine ni le parent ni ses sous-pièces : LE REGARD RESTE À OTMAN, LE COMPTE À FOX-CAD, et le badge le dit.
 *
 * (b) Le rendu par fox-cad (ligne du lead 13:5x, suite) : quand chaque sous-pièce a un décor servi — la surface `dessus` de `Piece.matiere`
 * (contrat v0.2.42) pour le cadre et le panneau, la toile pour la surface d'épaisseur 0 —, fox-cad dessine la façade lui-même
 * (`FoxCadPieces` : le cadre et le panneau texturés face par face avec leurs chants, la surface en plan visible, le pourtour du parent avec
 * ses chants, une charnière et une poignée sur le parent) et la porte du designer d'Otman est masquée comme pour toute porte de fox-cad.
 * Ce module décide, sans scène, et dit pourquoi quand il ne dessine pas. Rien n'est retiré du compte, rien n'est deviné : ce qui n'est pas
 * servi laisse le dessin à Otman et le nomme.
 */
import * as THREE from 'three'
import type { Piece, PositionCalculee } from './types'
import { estErreur } from './types.ts'
import { estPorte, matricePiece } from './geometrie.ts'

/** la définition d'une pièce multiple d'imos (`MP_1_FR_SHELL_FR08_LAM`, `MP_1_FR_SHELL_5PD10_LAM`) — le parent d'une façade à cadre */
export const estDefinitionMultiple = (definition: string | undefined | null): boolean => /^MP_/i.test(definition ?? '')

/** une sous-pièce d'une pièce multiple : sa hiérarchie finit par `.mpN` (fox-cad `orientation.ts` : `${zone}.mp${i + 1}`) */
export const estSousPiece = (p: Pick<Piece, 'hierarchie'>): boolean => /\.mp\d+$/i.test(p.hierarchie ?? '')

/** les indices des sous-pièces d'un parent : celles dont la hiérarchie est `<la sienne>.mpN` ; aucune sans hiérarchie */
export function indicesSousPieces(parent: Pick<Piece, 'hierarchie'>, pieces: ReadonlyArray<Pick<Piece, 'hierarchie'>>): number[] {
  const h = parent.hierarchie
  if (!h) return []
  const prefixe = `${h}.mp`
  const out: number[] = []
  pieces.forEach((p, i) => {
    const ph = p.hierarchie ?? ''
    if (ph.length > prefixe.length && ph.startsWith(prefixe) && /^\d+$/.test(ph.slice(prefixe.length))) out.push(i)
  })
  return out
}

export interface FacadeMultipart {
  /** le parent : la porte dont la définition est multiple, ou qui a des sous-pièces `.mpN` */
  parent: Piece
  /** l'index du parent dans `pieces` */
  index: number
  /** les indices de ses sous-pièces dans `pieces` */
  sousPieces: number[]
  /** la définition du parent (`MP_1_FR_SHELL_FR08_LAM`), ou le nom du parent quand la définition manque */
  kms: string
}

/**
 * les façades multipart d'une position : chaque PORTE (`estPorte`) qui n'est pas elle-même une sous-pièce et dont la définition est une pièce
 * multiple (`MP_…`) ou qui a des sous-pièces `.mpN`. Une pièce multiple qui n'est pas une porte (le panneau de liaison acoustique, une
 * cloison) n'est pas une façade : elle se dessine comme avant.
 */
export function facadesMultipart(pieces: ReadonlyArray<Piece>): FacadeMultipart[] {
  const out: FacadeMultipart[] = []
  pieces.forEach((p, i) => {
    if (!estPorte(p) || estSousPiece(p)) return
    const sousPieces = indicesSousPieces(p, pieces)
    if (!estDefinitionMultiple(p.definition) && sousPieces.length === 0) return
    out.push({ parent: p, index: i, sousPieces, kms: p.definition || p.nom })
  })
  return out
}

/** les indices de TOUTES les pièces d'une façade multipart (parents et sous-pièces) : hors de la boucle des pièces ordinaires */
export function indicesMultipart(pieces: ReadonlyArray<Piece>): Set<number> {
  const s = new Set<number>()
  for (const f of facadesMultipart(pieces)) {
    s.add(f.index)
    for (const j of f.sousPieces) s.add(j)
  }
  return s
}

/** une pièce d'une façade multipart (le parent ou une sous-pièce) — pour l'écran, pièce par pièce */
export const estPieceMultipart = (p: Piece, pieces: ReadonlyArray<Piece>): boolean => indicesMultipart(pieces).has(pieces.indexOf(p))

/* ─── (b) le décor de chaque pièce de la façade, et la décision « fox-cad dessine » ─────────────────────────────────────────────────── */

/**
 * LA TOILE : la surface d'épaisseur 0 de la façade (`SRF_FR_3_TOP_EEEE`) sort avec `matiere {}` — sa définition lit `SURF1 $SRF_FR_3_TOP`, que
 * le graphe rp-engine de `WACA_LY_D` pose à `NO_SURF` et que le lot ne nomme pas ; le formulaire d'Otman publie la toile (« Exterior 02 »)
 * dans `SRF_FR_2_TOP` (`NA_E6127_NATURAL`) — le code de finition du Set (ligne du lead 13:5x). Tant que d1 n'a pas tranché (ligne d5 → d1 du
 * 23/09 14:2x), la toile vient de LÀ, et l'écran dit sa source (`lot`) ; `matiere.dessus` gagne dès qu'il est servi.
 */
export const VARIABLE_TOILE_LOT = 'SRF_FR_2_TOP'

const nomServi = (v: string | undefined | null): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s !== '' && !/^NO_(SURF|MAT)$/i.test(s) ? s : null
}

export type SourceDecor = 'matiere' | 'lot'

export interface DecorPiece {
  /** le nom de matière / surface dont le RENDER fait la texture (`UN_HPL_HGP_0H251_W06_0_7`, `NA_E6127_NATURAL`) ; `null` = rien de servi */
  decor: string | null
  source: SourceDecor | null
  /** pourquoi il n'y a pas de décor, quand il n'y en a pas */
  raison: string | null
}

/** une pièce d'épaisseur nulle : la surface (la toile) d'une façade à cadre */
export const estSurface = (p: Pick<Piece, 'cotes'>): boolean => p.cotes.hauteur <= 0

/**
 * LE ROUGE DU SCHÉMA (demande de d10, 23/09 19:2x — la chaîne Flora du lead dit « chaque aplat rouge est une façade pleine ») : en mode
 * schéma, le designer d'Otman peint ses portes d'un rouge plat, sa palette de contraste — mesuré dans sa scène le 23/09 19:3x (HEX FR_08,
 * `rendu={"mode":"schema"}`) : `MeshStandardMaterial` `#e74c3c`, sans carte. Les façades que fox-cad dessine prennent le même : la porte, et
 * chaque morceau d'une façade multipart (pourtour, cadre, panneau, toile). Les poignées et les autres pièces gardent leur rendu.
 */
export const ROUGE_SCHEMA_FACADE = '#e74c3c'

/** vrai pour une pièce que le schéma peint en rouge plat : une porte, ou un morceau d'une façade multipart (`dansFacade`) */
export const enRougeSchema = (p: Pick<Piece, 'nom'>, dansFacade: boolean): boolean => dansFacade || estPorte(p as Piece)

/**
 * le décor visible d'une pièce de la façade : sa surface `dessus` servie par le moteur (`Piece.matiere`, sinon `dessous`), sinon son noyau ;
 * pour la toile (épaisseur 0) sans matière servie, la variable du lot — dite. `null` et sa raison quand rien n'est servi.
 */
export function decorPieceFacade(p: Piece, lot?: Record<string, string>): DecorPiece {
  const m = p.matiere
  const surface = nomServi(m?.dessus) ?? nomServi(m?.dessous)
  if (surface) return { decor: surface, source: 'matiere', raison: null }
  const noyau = nomServi(m?.noyau)
  if (noyau) return { decor: noyau, source: 'matiere', raison: null }
  const nom = p.definition ?? p.nom
  if (estSurface(p)) {
    const toile = nomServi(lot?.[VARIABLE_TOILE_LOT])
    if (toile) return { decor: toile, source: 'lot', raison: null }
    return { decor: null, source: null, raison: `${nom} : aucune surface servie (matiere ${JSON.stringify(m ?? null)}) et ${VARIABLE_TOILE_LOT} absent du lot` }
  }
  return { decor: null, source: null, raison: `${nom} : aucune matière servie (matiere ${JSON.stringify(m ?? null)})` }
}

export interface RenduFacadeMultipart {
  /** fox-cad dessine la façade : chaque sous-pièce a un décor et, sur une façade coupée, tient dans le pourtour ; sinon le dessin reste à Otman, et `raisons` dit pourquoi */
  parFoxCad: boolean
  raisons: string[]
  /** le décor du cadre (la première sous-pièce épaisse qui en a un), et celui de la toile quand la façade en a une */
  cadre: string | null
  toile: DecorPiece | null
  /** les sous-pièces d'une façade coupée qui sortent de son pourtour (la garde du 24/09) ; vide sinon */
  horsPourtour: SousPieceHorsPourtour[]
}

/** « 450,6 » — un nombre de millimètres à une décimale, virgule française */
const mm = (x: number): string => (Math.round(x * 10) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** ce que fox-cad peut dessiner d'une façade multipart, sous-pièce par sous-pièce — et ce qui manque */
export function renduFacadeMultipart(f: FacadeMultipart, pieces: ReadonlyArray<Piece>, lot?: Record<string, string>): RenduFacadeMultipart {
  const raisons: string[] = []
  let cadre: string | null = null
  let toile: DecorPiece | null = null
  if (f.sousPieces.length === 0) raisons.push(`${f.kms} : aucune sous-pièce servie`)
  for (const j of f.sousPieces) {
    const p = pieces[j]
    if (!p) continue
    const d = decorPieceFacade(p, lot)
    if (estSurface(p)) toile = d
    else if (cadre === null && d.decor) cadre = d.decor
    if (!d.decor && d.raison) raisons.push(d.raison)
  }
  // (c) LA GARDE DU POURTOUR (24/09) : une façade coupée dont une sous-pièce sort du pourtour n'est pas un cadre complet — voir plus bas
  const horsPourtour = sousPiecesHorsPourtour(f, pieces)
  if (horsPourtour.length > 0) {
    const n = horsPourtour.length
    const s = n > 1 ? 's' : ''
    raisons.push(`${f.kms} : ${n} sous-pièce${s} hors du pourtour coupé (jusqu'à ${mm(Math.max(...horsPourtour.map((h) => h.depassementMm)))} mm, ${horsPourtour.map((h) => h.hierarchie.replace(/^.*\./, '')).join(', ')}) — non dessinée${s} par fox-cad`)
  }
  return { parFoxCad: f.sousPieces.length > 0 && raisons.length === 0, raisons, cadre, toile, horsPourtour }
}

/**
 * fox-cad a la porte de la position ET LA DESSINE : une pièce porte hors façade multipart, ou une façade multipart qu'il sait dessiner.
 * C'est ce que le masque du chemin d'Otman lit (`porteParFoxCad`) : une position dont la seule porte est une façade multipart sans décor
 * servi garde la porte du designer d'Otman.
 */
export function porteDessineeParFoxCad(pieces: ReadonlyArray<Piece>, lot?: Record<string, string>): boolean {
  const facades = facadesMultipart(pieces)
  const multipart = new Set<number>()
  for (const f of facades) {
    multipart.add(f.index)
    for (const j of f.sousPieces) multipart.add(j)
  }
  if (pieces.some((p, i) => estPorte(p) && !multipart.has(i))) return true
  return facades.some((f) => renduFacadeMultipart(f, pieces, lot).parFoxCad)
}

export interface MultipartZone {
  /** la définition du parent (`MP_1_FR_SHELL_FR08_LAM`) */
  kms: string
  /** le nombre de pièces de façades multipart (parents et sous-pièces), toutes façades de la position confondues — comptées par fox-cad */
  pieces: number
  /** le nombre de façades multipart de la position (une par porte) */
  facades: number
  /** (b) : celles que fox-cad dessine ; les autres restent à Otman, et `raisons` dit pourquoi */
  parFoxCad: number
  /** parmi elles, celles que le moteur sert COUPÉES (parent à contour : la colonne sous rampant, le cadre complet — après MD2) ; absent = 0 */
  coupees?: number
  /** la traverse en pente de chacune de ces façades coupées, MESURÉE sur son contour (`traverseEnPente`) ; absent sans façade coupée dessinée */
  traverses?: TraverseEnPente[]
  raisons: string[]
  /** le décor du cadre et celui de la toile (les noms servis), et d'où vient la toile */
  cadre: string | null
  toile: string | null
  toileSource: SourceDecor | null
}

/** ce que la position porte de façades multipart, pour le badge et le détail ; `null` quand elle n'en a pas (ou est en erreur) */
export function multipartDePosition(r: PositionCalculee | undefined | null, lot?: Record<string, string>): MultipartZone | null {
  if (!r || estErreur(r)) return null
  const facades = facadesMultipart(r.pieces)
  if (facades.length === 0) return null
  let pieces = 0
  let parFoxCad = 0
  let coupees = 0
  const traverses: TraverseEnPente[] = []
  const raisons: string[] = []
  let cadre: string | null = null
  let toile: string | null = null
  let toileSource: SourceDecor | null = null
  for (const f of facades) {
    pieces += 1 + f.sousPieces.length
    const rendu = renduFacadeMultipart(f, r.pieces, lot)
    if (rendu.parFoxCad) parFoxCad++
    if (rendu.parFoxCad && estFacadeCoupee(f)) {
      coupees++
      const t = traverseEnPente(f, r.pieces)
      if (t) traverses.push(t)
    }
    raisons.push(...rendu.raisons)
    if (cadre === null) cadre = rendu.cadre
    if (toile === null && rendu.toile?.decor) {
      toile = rendu.toile.decor
      toileSource = rendu.toile.source
    }
  }
  const kms = [...new Set(facades.map((f) => f.kms))].sort().join(', ')
  return { kms, pieces, facades: facades.length, parFoxCad, ...(coupees > 0 ? { coupees } : {}), ...(traverses.length > 0 ? { traverses } : {}), raisons: [...new Set(raisons)], cadre, toile, toileSource }
}

export interface ResumeMultipart {
  /** les façades multipart du lot (une par porte) */
  facades: number
  /** les pièces de ces façades, comptées par fox-cad (parents et sous-pièces) */
  pieces: number
  /** les définitions rencontrées, triées */
  kms: string[]
  /** (b) : combien fox-cad en dessine, combien restent à Otman, et pourquoi ; combien il en dessine COUPÉES (cadre complet, après MD2 ; absent = 0) */
  parFoxCad: number
  parOtman: number
  coupees?: number
  /** les traverses en pente des façades coupées dessinées, mesurées (absent sans) */
  traverses?: TraverseEnPente[]
  raisons: string[]
  /** les décors servis (cadre, toile) et la source de la toile */
  cadres: string[]
  toiles: string[]
  toileDuLot: boolean
}

/** le résumé du lot : combien de façades multipart, combien de pièces, qui les dessine, quels décors ; `lots` = le lot de chaque position, dans l'ordre */
export function resumeMultipart(positions: ReadonlyArray<PositionCalculee>, lots?: ReadonlyArray<Record<string, string> | undefined>): ResumeMultipart {
  const r: ResumeMultipart = { facades: 0, pieces: 0, kms: [], parFoxCad: 0, parOtman: 0, raisons: [], cadres: [], toiles: [], toileDuLot: false }
  const kms = new Set<string>()
  const cadres = new Set<string>()
  const toiles = new Set<string>()
  const raisons = new Set<string>()
  positions.forEach((p, i) => {
    const m = multipartDePosition(p, lots?.[i])
    if (!m) return
    r.facades += m.facades
    r.pieces += m.pieces
    r.parFoxCad += m.parFoxCad
    r.parOtman += m.facades - m.parFoxCad
    if (m.coupees) r.coupees = (r.coupees ?? 0) + m.coupees
    if (m.traverses?.length) r.traverses = [...(r.traverses ?? []), ...m.traverses]
    for (const k of m.kms.split(', ')) kms.add(k)
    for (const x of m.raisons) raisons.add(x)
    if (m.cadre) cadres.add(m.cadre)
    if (m.toile) toiles.add(m.toile)
    if (m.toileSource === 'lot') r.toileDuLot = true
  })
  r.kms = [...kms].sort()
  r.cadres = [...cadres].sort()
  r.toiles = [...toiles].sort()
  r.raisons = [...raisons]
  return r
}

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

/**
 * « , dont 2 coupées par le moteur (cadre complet ; traverse en pente 17,1 mm en travers, cadre 23) » — les façades multipart que fox-cad sert à
 * contour ; la largeur de la traverse en pente est MESURÉE sur son contour (24/09, décision de Dorian 07:3x : la forme B, la traverse de la
 * même largeur que le cadre quel que soit l'angle — la lecture A la mesure en hauteur, plus mince en travers) ; vide sans façade coupée
 */
export function direCoupees(n: number, traverses: ReadonlyArray<TraverseEnPente> = []): string {
  if (n <= 0) return ''
  const largeurs = [...new Set(traverses.map((t) => mm(t.largeurMm)))]
  const cadres = [...new Set(traverses.flatMap((t) => (t.cadreMm === null ? [] : [mm(t.cadreMm)])))]
  const mesure = largeurs.length ? ` ; traverse${traverses.length > 1 ? 's' : ''} en pente ${largeurs.join(' / ')} mm en travers${cadres.length ? `, cadre ${cadres.join(' / ')}` : ''}` : ''
  return `, dont ${n} coupée${n > 1 ? 's' : ''} par le moteur (cadre complet${mesure})`
}

/** « … : cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie) » */
function direDecors(cadres: ReadonlyArray<string>, toiles: ReadonlyArray<string>, toileDuLot: boolean): string {
  const parts: string[] = []
  if (cadres.length) parts.push(`cadre ${cadres.join(', ')}`)
  if (toiles.length) parts.push(`toile ${toiles.join(', ')}${toileDuLot ? ` (${VARIABLE_TOILE_LOT} du Set : la surface n'a pas de matière servie)` : ''}`)
  return parts.join(', ')
}

/**
 * la phrase du badge : « 3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) dessinées par fox-cad : cadre …, toile … » quand il les
 * dessine toutes ; « … : dessin d'Otman, pièces fox-cad (raison) » quand aucune ; les deux comptes quand c'est mêlé. Vide sans façade multipart.
 */
export function direMultipart(r: ResumeMultipart): string {
  if (r.facades === 0) return ''
  const tete = `${pluriel(r.facades, 'façade')} multipart (${r.kms.join(', ')}, ${pluriel(r.pieces, 'pièce')})`
  const s = r.facades > 1 ? 's' : ''
  const raison = r.raisons.length ? ` (${r.raisons[0]}${r.raisons.length > 1 ? ` ; +${r.raisons.length - 1}` : ''})` : ''
  const coupees = direCoupees(r.coupees ?? 0, r.traverses)
  if (r.parOtman === 0) return `${tete} dessinée${s} par fox-cad${coupees} : ${direDecors(r.cadres, r.toiles, r.toileDuLot)}`
  if (r.parFoxCad === 0) return `${tete} : dessin d'Otman, pièces fox-cad${raison}`
  return `${tete} : ${r.parFoxCad} dessinée${r.parFoxCad > 1 ? 's' : ''} par fox-cad${coupees} (${direDecors(r.cadres, r.toiles, r.toileDuLot)}), ${r.parOtman} par Otman${raison}`
}

/** la phrase d'une zone : « façade multipart de fox-cad (MP_1_FR_SHELL_FR08_LAM, 7 pièces) dessinée par fox-cad : cadre …, toile … » / « … comptées, non dessinées : dessin d'Otman (raison) » */
export function direMultipartZone(m: MultipartZone): string {
  const f = m.facades > 1 ? `${m.facades} façades multipart` : 'façade multipart'
  const n = m.pieces
  if (m.parFoxCad === m.facades) return `${f} de fox-cad (${m.kms}, ${pluriel(n, 'pièce')}) dessinée${m.facades > 1 ? 's' : ''} par fox-cad${direCoupees(m.coupees ?? 0, m.traverses)} : ${direDecors(m.cadre ? [m.cadre] : [], m.toile ? [m.toile] : [], m.toileSource === 'lot')}`
  const raison = m.raisons.length ? ` (${m.raisons[0]}${m.raisons.length > 1 ? ` ; +${m.raisons.length - 1}` : ''})` : ''
  if (m.parFoxCad === 0) return `${f} de fox-cad (${m.kms}, ${n} pièce${n > 1 ? 's' : ''} comptée${n > 1 ? 's' : ''}, non dessinée${n > 1 ? 's' : ''}) : dessin d'Otman${raison}`
  return `${f} de fox-cad (${m.kms}, ${pluriel(n, 'pièce')}) : ${m.parFoxCad} dessinée${m.parFoxCad > 1 ? 's' : ''} par fox-cad${direCoupees(m.coupees ?? 0, m.traverses)}, ${m.facades - m.parFoxCad} par Otman${raison}`
}

/* ─── (b) les faces d'une sous-pièce : quel côté porte quel chant ────────────────────────────────────────────────────────────────── */

/**
 * l'index de matériau d'une `BoxGeometry` de three (ses six groupes : +x, −x, +y, −y, +z, −z) pour chaque côté du contrat : le côté 1 est
 * le bord y = 0 de la face locale (−y), puis dans le sens direct — 2 = x = largeur (+x), 3 = y = profondeur (+y), 4 = x = 0 (−x) ; la face
 * `dessus` est +z (l'épaisseur va de 0 à `hauteur` en z local, et la pose met +z vers l'avant), `dessous` −z
 */
export const FACE_BOITE = { cote1: 3, cote2: 0, cote3: 2, cote4: 1, dessus: 4, dessous: 5 } as const

export type MatiereFace = 'face' | 'chant' | 'noyau'

/**
 * la matière de chacune des six faces de la boîte d'une sous-pièce : `face` (le décor de la surface) dessus et dessous ; sur un côté, `chant`
 * quand un chant y est collé (`pose`), `noyau` sinon (le bord nu de la pièce : son noyau) — l'ordre est celui des groupes de `BoxGeometry`
 */
export function matieresFaces(chants: ReadonlyArray<{ cote: number; pose: boolean }> | undefined): MatiereFace[] {
  const out: MatiereFace[] = ['noyau', 'noyau', 'noyau', 'noyau', 'face', 'face']
  for (const c of chants ?? []) {
    const i = c.cote === 1 ? FACE_BOITE.cote1 : c.cote === 2 ? FACE_BOITE.cote2 : c.cote === 3 ? FACE_BOITE.cote3 : c.cote === 4 ? FACE_BOITE.cote4 : -1
    if (i >= 0) out[i] = c.pose ? 'chant' : 'noyau'
  }
  return out
}

/**
 * la matière de chaque groupe du PRISME d'une pièce à contour (`geometriePrisme` : dessus, dessous, puis un groupe par côté) : `face` dessus
 * et dessous ; le côté k porte `chant` quand un chant y est collé, `noyau` sinon. Le côté k est le k-ième segment du contour (la règle
 * d'imos, `cotesContour`) : c'est la seule numérotation où le `cote` d'un chant se lit juste sur une pièce à onglet ou en pente.
 */
export function matieresFacesContour(nombreCotes: number, chants: ReadonlyArray<{ cote: number; pose: boolean }> | undefined): MatiereFace[] {
  const out: MatiereFace[] = ['face', 'face', ...Array.from({ length: nombreCotes }, () => 'noyau' as MatiereFace)]
  for (const c of chants ?? []) if (Number.isInteger(c.cote) && c.cote >= 1 && c.cote <= nombreCotes) out[1 + c.cote] = c.pose ? 'chant' : 'noyau'
  return out
}

/**
 * LES FACES D'UNE PIÈCE DE FAÇADE MULTIPART, et pourquoi (d1, `d1-vers-d5` 23/09 16:3x) : les pièces de cadre sont des TRAPÈZES À ONGLET et
 * le `cote` d'un chant est le k-ième segment de LEUR POLYGONE, pas le côté de la boîte dans la pose (sur `PD_1_FR_E1EE` il est tourné d'un
 * quart : le chant du bord intérieur tombait au bout haut du montant). Donc :
 * - une pièce À CONTOUR : le prisme, un groupe par côté, chaque chant sur son segment (`matieresFacesContour`) ;
 * - le PARENT sans contour (le pourtour d'une façade plate) : un rectangle, ses quatre côtés sont ceux de la boîte (« le pourtour du parent est
 *   juste », d1) ;
 * - une SOUS-PIÈCE sans contour : ses chants ne se dessinent pas — tous ses côtés montrent le noyau — tant que le moteur ne sert pas son
 *   contour (la file de d1 : « contour et chants des régions à onglet »). Sur la façade FR_08 ces côtés sont sous la toile ou dans le
 *   pourtour : rien ne change à l'écran, mais la scène ne dit plus un chant à un bout de montant.
 */
export interface FacesPieceFacade {
  geometrie: 'boite' | 'prisme'
  matieres: MatiereFace[]
  /** les indices de groupe du dessus et du dessous (cachés pour le pourtour) : [4, 5] sur la boîte, [0, 1] sur le prisme */
  faces: [number, number]
  /** les chants dessinés, ou pourquoi ils ne le sont pas */
  chants: 'par-cote' | 'non-dessines'
}

export function facesPieceFacade(p: Pick<Piece, 'contour' | 'chants'>, parent: boolean): FacesPieceFacade {
  if (p.contour && p.contour.length >= 3) return { geometrie: 'prisme', matieres: matieresFacesContour(p.contour.length, p.chants), faces: [0, 1], chants: 'par-cote' }
  if (parent) return { geometrie: 'boite', matieres: matieresFaces(p.chants), faces: [FACE_BOITE.dessus, FACE_BOITE.dessous], chants: 'par-cote' }
  return { geometrie: 'boite', matieres: matieresFaces(undefined), faces: [FACE_BOITE.dessus, FACE_BOITE.dessous], chants: 'non-dessines' }
}

/**
 * LES FACES D'UNE PIÈCE ORDINAIRE (24/09, ligne du lead 23/09 06:3x ④, mot de Dorian : « il y a aussi les chants ») : le moteur sert les chants
 * par côté sur toutes les pièces (contrat v0.2.42 ; mesuré le 24/09 sur HEX FR_08 : 57 / 57 pièces, `cote` 1 = le bord y = 0 — le chant avant
 * d'une tablette, d'un côté) : un bord NU montre le noyau de la pièce, un chant COLLÉ le décor de la face — le décor du chant lui-même
 * (`UN_ABS_0H251_W06_1`, un noyer sur un côté en F416) n'est servi par aucune API de la page (`material-data` et `/mat/` rendent vide pour
 * un ABS : ligne à d1). Une pièce à contour : son prisme, chaque chant sur son segment. `null` sans chants servis : tout au décor, comme avant.
 */
export function facesPieceOrdinaire(p: Pick<Piece, 'contour' | 'chants'>): FacesPieceFacade | null {
  if (!p.chants || p.chants.length === 0) return null
  if (p.contour && p.contour.length >= 3) return { geometrie: 'prisme', matieres: matieresFacesContour(p.contour.length, p.chants), faces: [0, 1], chants: 'par-cote' }
  return { geometrie: 'boite', matieres: matieresFaces(p.chants), faces: [FACE_BOITE.dessus, FACE_BOITE.dessous], chants: 'par-cote' }
}

/**
 * une façade multipart COUPÉE par fox-cad (après MD2, quand le moteur servira ses enfants) : son parent porte un contour — le pentagone de
 * la colonne sous rampant (`MP_1_FR_SHELL_5PD10_HEXA`), ses sous-pièces les leurs (la traverse en pente à six coins, les montants en
 * trapèze, le panneau et la surface polygonaux). La même matière que la façade plate : rien ne change dans le décor, seulement la forme.
 */
export const estFacadeCoupee = (f: Pick<FacadeMultipart, 'parent'>): boolean => (f.parent.contour?.length ?? 0) >= 3

/* ─── (c) la garde du pourtour, et la traverse en pente mesurée (24/09) ──────────────────────────────────────────────────────────────── */

/**
 * LA GARDE DU POURTOUR (d5, 24/09/2026 — mesuré EN PUBLIC à 08:21, après l'auto-déploiement de fox-cad `61f81c9`, « la façade à cadre coupée
 * par le rampant est au moteur ») : sur la colonne HEXA de HEX (`WACA_LY_D_H5L`, Collection 2 FR_08), la définition d'Otman
 * `MP_1_FR_SHELL_5PD10_LAM` sur une porte à cinq arêtes donne, chez imos comme chez le moteur (fr08-lam Set 3 : « ce qu'imos rend on le
 * rend », d1), un parent coupé et SIX ENFANTS PLATS — le montant court de 2 340 (toute la boîte), la traverse haute en haut de la boîte
 * (z 2 317), le panneau et la toile en rectangles pleins. Dessinés, ils sortaient du pourtour jusqu'à 450 mm : de face le rampant les
 * cachait (la toile paraissait coupée sans traverse), en vue 3D le montant court perçait le plafond, et le badge disait « coupée par le
 * moteur (cadre complet) ». Une façade coupée dont une sous-pièce sort de son pourtour de plus de `TOLERANCE_POURTOUR_MM` n'est donc PAS
 * dessinée par fox-cad : la façade d'Otman reste, DÉCOUPÉE par le contour du parent servi (`facadeCoupeeNonDessinee`), et le badge dit
 * pourquoi. Le compte et le prix restent ceux du moteur. La tolérance d'un millimètre laisse passer MD-corrige (le panneau déborde de 0,5,
 * imos le laisse) ; MD2 tient au millième.
 */
export const TOLERANCE_POURTOUR_MM = 1

export interface SousPieceHorsPourtour {
  hierarchie: string
  definition: string
  /** de combien son sommet le plus éloigné sort du pourtour du parent, dans le plan de la porte (mm, une décimale) */
  depassementMm: number
}

/** le polygone d'une pièce — son contour, sinon le rectangle de ses cotes — dans le plan local x-y d'une autre (son parent), par leurs poses */
export function polygoneDansLePlanDe(p: Piece, repere: Piece): [number, number][] {
  const vers = matricePiece(repere).invert().multiply(matricePiece(p))
  const { largeur: w, profondeur: d } = p.cotes
  const sommets: ReadonlyArray<{ x: number; y: number }> = p.contour && p.contour.length >= 3 ? p.contour : [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: d }, { x: 0, y: d }]
  return sommets.map((s) => {
    const v = new THREE.Vector3(s.x, s.y, 0).applyMatrix4(vers)
    return [v.x, v.y]
  })
}

const distanceAuSegment = (a: readonly [number, number], b: readonly [number, number], q: readonly [number, number]): number => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2)) : 0
  return Math.hypot(q[0] - (a[0] + t * dx), q[1] - (a[1] + t * dy))
}

/** de combien un point sort d'un polygone : 0 dedans (règle pair-impair), sa distance au bord le plus proche dehors */
export function depassementPolygone(poly: ReadonlyArray<readonly [number, number]>, q: readonly [number, number]): number {
  let dedans = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[j]
    if (ay > q[1] !== by > q[1] && q[0] < ((bx - ax) * (q[1] - ay)) / (by - ay) + ax) dedans = !dedans
  }
  if (dedans) return 0
  let min = Infinity
  for (let i = 0; i < poly.length; i++) min = Math.min(min, distanceAuSegment(poly[i], poly[(i + 1) % poly.length], q))
  return min
}

/** les sous-pièces d'une façade COUPÉE qui sortent de son pourtour de plus de `TOLERANCE_POURTOUR_MM` ; vide pour une façade plate */
export function sousPiecesHorsPourtour(f: FacadeMultipart, pieces: ReadonlyArray<Piece>): SousPieceHorsPourtour[] {
  if (!estFacadeCoupee(f)) return []
  const pourtour = (f.parent.contour ?? []).map((s) => [s.x, s.y] as const)
  const out: SousPieceHorsPourtour[] = []
  for (const j of f.sousPieces) {
    const p = pieces[j]
    if (!p) continue
    const d = Math.max(0, ...polygoneDansLePlanDe(p, f.parent).map((q) => depassementPolygone(pourtour, q)))
    if (d > TOLERANCE_POURTOUR_MM) out.push({ hierarchie: p.hierarchie ?? p.nom, definition: p.definition ?? p.nom, depassementMm: Math.round(d * 10) / 10 })
  }
  return out
}

export interface FacadeCoupeeNonDessinee {
  /** la définition du parent (`MP_1_FR_SHELL_5PD10_LAM`) */
  kms: string
  /** le parent servi : son contour découpe la façade d'Otman gardée (à la place de la porte pleine du second calcul) */
  porte: Piece
  /** pourquoi fox-cad ne la dessine pas (sous-pièces hors du pourtour, décor absent) */
  raisons: string[]
}

/**
 * la façade COUPÉE que le moteur sert et que l'écran ne dessine pas (`renduFacadeMultipart` : sous-pièces hors du pourtour, décor absent) —
 * la porte d'Otman reste, et le contour du PARENT servi la découpe (le même que celui de la porte pleine : la porte de la colonne) ; `null`
 * quand la position n'en a pas (façade dessinée, plate, manque, erreur)
 */
export function facadeCoupeeNonDessinee(r: PositionCalculee | undefined | null, lot?: Record<string, string>): FacadeCoupeeNonDessinee | null {
  if (!r || estErreur(r)) return null
  for (const f of facadesMultipart(r.pieces)) {
    if (!estFacadeCoupee(f)) continue
    const rendu = renduFacadeMultipart(f, r.pieces, lot)
    if (!rendu.parFoxCad) return { kms: f.kms, porte: f.parent, raisons: rendu.raisons }
  }
  return null
}

/**
 * la largeur d'une bande en travers : la distance entre les droites de ses deux plus longs côtés quand ils sont parallèles (à 0,5° près) —
 * une pièce de cadre : 23 pour un montant ; `null` quand ses deux plus longs côtés ne sont pas parallèles
 */
export function largeurEnTravers(contour: ReadonlyArray<{ x: number; y: number }>): { largeur: number; enPente: boolean } | null {
  if (contour.length < 3) return null
  const cotes = contour.map((a, i) => {
    const b = contour[(i + 1) % contour.length]
    return { a, dx: b.x - a.x, dy: b.y - a.y, l: Math.hypot(b.x - a.x, b.y - a.y) }
  })
  const [c1, c2] = [...cotes].sort((u, v) => v.l - u.l)
  if (!c2 || c1.l <= 0 || c2.l <= 0) return null
  const sinus = Math.abs(c1.dx * c2.dy - c1.dy * c2.dx) / (c1.l * c2.l)
  if (sinus > Math.sin((0.5 * Math.PI) / 180)) return null
  // la distance du début du second côté à la droite du premier
  const largeur = Math.abs(c1.dx * (c2.a.y - c1.a.y) - c1.dy * (c2.a.x - c1.a.x)) / c1.l
  // en pente : ni le long de x ni le long de y (plus d'un degré des deux axes)
  const angle = (Math.atan2(Math.abs(c1.dy), Math.abs(c1.dx)) * 180) / Math.PI
  return { largeur, enPente: angle > 1 && angle < 89 }
}

export interface TraverseEnPente {
  /** la traverse en pente : sa largeur en travers, MESURÉE (lecture A : 23 × cos α ; lecture B, la décision de Dorian : celle du cadre) */
  largeurMm: number
  /** la largeur des autres pièces du cadre (les montants, la traverse basse : la plus petite bande droite), `null` sans */
  cadreMm: number | null
  hierarchie: string
}

/**
 * LA TRAVERSE EN PENTE d'une façade coupée, MESURÉE (24/09, décision de Dorian 07:3x : « la traverse doit avoir la même largeur même avec
 * l'angle » — la forme B, MD2B, est le produit ; la définition d'Otman plaquée par imos et par le moteur mesure ses 23 mm en HAUTEUR, soit
 * 17,1 mm en travers à 41,81°) : la sous-pièce de cadre (épaisse, hors panneau) dont les deux plus longs côtés sont parallèles et en pente,
 * sa largeur en travers, et celle des autres pièces du cadre. `null` sans traverse en pente (façade plate, enfants plats).
 */
export function traverseEnPente(f: FacadeMultipart, pieces: ReadonlyArray<Piece>): TraverseEnPente | null {
  let traverse: { largeur: number; hierarchie: string } | null = null
  let cadre: number | null = null
  for (const j of f.sousPieces) {
    const p = pieces[j]
    if (!p || estSurface(p) || !p.contour || p.contour.length < 3) continue
    const b = largeurEnTravers(p.contour)
    if (!b) continue
    if (b.enPente) {
      if (!traverse) traverse = { largeur: b.largeur, hierarchie: p.hierarchie ?? p.nom }
    } else cadre = cadre === null ? b.largeur : Math.min(cadre, b.largeur)
  }
  return traverse ? { largeurMm: Math.round(traverse.largeur * 10) / 10, cadreMm: cadre === null ? null : Math.round(cadre * 10) / 10, hierarchie: traverse.hierarchie } : null
}
