'use client'

import { useSyncExternalStore } from 'react'
import type { Piece } from './types'
import { direMultipart, direMultipartZone, type MultipartZone, type TraverseEnPente } from './multipart.ts'

/**
 * LE CHEMIN D'OTMAN SUR LES FORMES FOX-CAD (d5, 23/09/2026 — retours de Dorian 06:4x / 06:5x, lignes du lead) : sur `OS_SHAPE_HEX` /
 * `OS_SHAPE_HEX2`, **les panneaux viennent de fox-cad et tout le reste — tringles, façades spéciales, poignées, accessoires — se dessine
 * par le chemin d'Otman**, superposé, à la pose que le graphe rp-engine lui donne. Le designer d'Otman (`@processandtools/rp-article-designer`,
 * code fermé, lu dans sa source map le 23/09) rend chaque élément par `KmsRenderer` : un rendu SPÉCIAL enregistré par nom de CP, par motif de
 * CP ou par nom de KMS (`construction_principle/kms/spec-kms/special.kms.ts`, `components/spec-kms-render/*`), sinon le panneau standard
 * `PD_3D` (une `BoxGeometry` — ou une `ExtrudeGeometry` à onglet — avec `userData = elemInfo`). Ce module dit, sans dessiner :
 *
 *   - ce que le designer d'Otman tient pour spécial (la table de ses enregistrements, recopiée et datée — elle n'est pas exportée) ;
 *   - comment reconnaître, dans la scène three.js du designer, un panneau standard à masquer (`estPanneauDuDesigner`) et le sous-arbre d'une
 *     porte (`estPorteDuDesigner` : le maillage-sonde invisible de `DoorAnimator`) ;
 *   - le masque lui-même (`masquerPanneauxOtman`) : les panneaux disparaissent, les portes du designer ne restent que si fox-cad n'a PAS
 *     produit la porte de la zone (une façade spéciale KMS est un manque chez fox-cad ; chez Otman une `SpecialKms` de `@oak-some/special-kms`),
 *     tout le reste (tringle `BarHanger`, poignée GLB, machine à laver) reste. LA RÈGLE D'ATTENTE (23/09 13:5x, `multipart.ts`) : une porte que
 *     fox-cad rend en FAÇADE MULTIPART (le parent `MP_1_FR_SHELL_…` et ses six sous-pièces) ne compte pas comme « porte par fox-cad » — la
 *     porte du designer reste, fox-cad ne dessine pas ces pièces, le badge le dit ;
 *   - ce qu'une pièce de fox-cad est quand elle n'est pas un panneau (`genrePieceFoxCad` : la tringle `MP_SPP_HC_ELITE_*` est une pièce de
 *     554 × 30 × 0 chez fox-cad — jamais dessinée par lui, dessinée par le chemin d'Otman) ;
 *   - le magasin de ce que la scène a fait, par zone, pour le badge et l'outil de preuve (`useCheminOtman`).
 */

export type GenreOtman = 'panneau' | 'tringle' | 'facade-speciale' | 'tiroir-special' | 'machine-a-laver'

/**
 * Les rendus spéciaux du designer d'Otman, tels qu'il les enregistre (source map `rp-article-designer`, 23/09/2026) :
 *   - par nom de KMS (`registerSpecialKms`) : `bar-handle.kms.tsx` (la tringle — une capsule de 12 × 30 mm à embouts, grise si le CP dit
 *     INOX, noire sinon), `DR_SPECIAL.tsx` (les fronts de tiroir laqués → `SpecialKms` Drawer_FA_6_*) ;
 *   - par nom de CP (`registerSpecialCp`) : `WM_CONN_01.tsx` (la machine à laver, `/glb/models.glb` — en 404 chez Otman comme chez nous) ;
 *   - par motif de CP (`registerSpecialCpPattern`) : `FR_SPECIAL.kms.tsx` — TOUTES les portes `CP_SDO_FRnn_*` / `CP_DDO_FRnn_*` d'Oaksome
 *     (FR01 compris : `SpecialFrontConfig.ts` donne le modèle `Door_FA_*` de `@oak-some/special-kms`, CSG, pas un GLB).
 * L'ordre est celui de `getSpecialRenderer` : le CP exact, puis les motifs, puis le KMS.
 */
export const KMS_SPECIAUX_OTMAN: Readonly<Record<string, GenreOtman>> = {
  C_PD_SPP_WRDRB_inf_1000mm_VAR: 'tringle',
  MP_SPP_HC_ELITE_INOX: 'tringle',
  MP_SPP_HC_ELITE_BLACK: 'tringle',
  MP_1_DR_LAQ_TOP: 'tiroir-special',
  MP_1_DR_LAQ_MID: 'tiroir-special',
  MP_1_DR_LAQ_BOT: 'tiroir-special',
}

export const CP_SPECIAUX_OTMAN: Readonly<Record<string, GenreOtman>> = {
  WM_CONN_01: 'machine-a-laver',
  WM_CONN_02: 'machine-a-laver',
}

export const MOTIFS_CP_SPECIAUX_OTMAN: ReadonlyArray<{ motif: RegExp; genre: GenreOtman }> = [
  { motif: /^CP_SDO_FR\d{2}_(LAM|LAQ|VRN)_(HL|HR)_(PM|PB|PT)$/, genre: 'facade-speciale' },
  { motif: /^CP_DDO_FR\d{2}_(LAM|LAQ|VRN)_(PM|PB|PT)$/, genre: 'facade-speciale' },
]

/**
 * Le modèle `@oak-some/special-kms` que le designer d'Otman donne à une porte `CP_SDO_FRnn_…` (`SpecialFrontConfig.ts`, 23/09/2026) : le nom
 * du CP sans ses suffixes de charnière, de finition et de poignée (`CP_SDO_FR08_LAM_HL_PM` → `CP_FR08`). `null` quand Otman n'a pas de modèle
 * (il ne dessine alors rien pour cette porte).
 */
export const MODELES_FACADES_OTMAN: Readonly<Record<string, string>> = {
  CP_FR01: 'Door_FA_1',
  CP_FR02: 'Door_FA_1',
  CP_FR03: 'Door_FA_1',
  CP_FR04: 'Door_FA_1',
  CP_FR05: 'Door_FA_1',
  CP_FR06: 'Door_FA_1',
  CP_FR07: 'Door_FA_3',
  CP_FR08: 'Door_FA_4a',
  CP_FR09: 'Door_FA_4b',
  CP_FR10: 'Door_FA_5a',
  CP_FR11: 'Door_FA_5b',
  CP_FR12: 'Door_FA_6',
  CP_FR13: 'Door_FA_7',
  CP_FR14: 'Door_FA_7',
}

export function modeleFacadeOtman(cpName: string | null | undefined): string | null {
  if (!cpName) return null
  const normalise = cpName.replace(/_(HL|HR|VRN|LAQ|LAM|SDO|DDO)/g, '').replace(/_(PM|PB|PT)/g, '')
  return MODELES_FACADES_OTMAN[normalise] ?? null
}

/** ce que le designer d'Otman dessinerait pour cet élément : un rendu spécial (son genre) ou le panneau standard */
export function genreOtman(cpName: string | null | undefined, kmsName: string | null | undefined): GenreOtman {
  if (cpName) {
    const exact = CP_SPECIAUX_OTMAN[cpName]
    if (exact) return exact
    const motif = MOTIFS_CP_SPECIAUX_OTMAN.find((m) => m.motif.test(cpName))
    if (motif) return motif.genre
  }
  if (kmsName) {
    const kms = KMS_SPECIAUX_OTMAN[kmsName]
    if (kms) return kms
  }
  return 'panneau'
}

/** une pièce de fox-cad qui n'est pas un panneau : sa définition (`KMS`) est un rendu spécial du designer d'Otman (la tringle, 0 mm d'épaisseur) */
export function genrePieceFoxCad(p: Pick<Piece, 'definition'>): GenreOtman {
  return p.definition ? (KMS_SPECIAUX_OTMAN[p.definition] ?? 'panneau') : 'panneau'
}

export const estHorsPanneau = (p: Pick<Piece, 'definition'>): boolean => genrePieceFoxCad(p) !== 'panneau'

/* ─── la scène three.js du designer, en canard (testable sans three) ───────────────────────────────────────────────────────────────── */

export interface BoiteLocale {
  min: { x: number; y: number; z: number }
  max: { x: number; y: number; z: number }
}

export interface ObjetScene {
  isMesh?: boolean
  visible: boolean
  userData?: unknown
  geometry?: {
    type?: string
    parameters?: { options?: { steps?: number; curveSegments?: number; bevelEnabled?: boolean } }
    boundingBox?: BoiteLocale | null
    computeBoundingBox?: () => void
  }
  children: ObjetScene[]
  parent?: ObjetScene | null
}

/** les cotes d'une façade que le designer a rendue (ses statistiques de panneaux, `elemType` D) : `length` × `width` × `thk`, en mm */
export interface CotesFacade {
  length: number
  width: number
  thk: number
}

/**
 * les façades que le designer a rendues dans une zone — celles à masquer quand fox-cad a la porte : tout élément qu'Otman rend par
 * `FR_SPECIAL` (le genre `facade-speciale`, quel que soit l'`elemType` : sur `WACA_LY_D_Q4L` le front de 500 × 590 est enregistré SANS
 * `elemType`, mesuré le 23/09), et tout élément déclaré porte (`elemType` D)
 */
export function facadesDuDesigner(
  panneaux: ReadonlyArray<{ cpName?: string | null; kmsName?: string | null; elemType?: string | null; length: number; width: number; thk: number }>,
): CotesFacade[] {
  return panneaux
    .filter((p) => p.elemType === 'D' || genreOtman(p.cpName ?? null, p.kmsName ?? null) === 'facade-speciale')
    .map((p) => ({ length: p.length, width: p.width, thk: p.thk }))
}

const facesTriees = (a: number, b: number, c: number) => [a, b, c].sort((x, y) => y - x).slice(0, 2)

/**
 * un maillage aux cotes d'une façade du designer (la boîte locale de sa géométrie, en mm — `SpecialKms` travaille en mm) : la façade spéciale
 * `FR_SPECIAL` rendue HORS d'un animateur de porte (un front fixe, `Front.tsx` : `isDoor(cp)` faux), que le masque des portes ne voit pas.
 * Les deux grandes cotes seulement (la face) : l'épaisseur du modèle `special-kms` est celle de sa config (18 ou 22), pas celle du KMS (19)
 */
export function estFacadeAuxCotes(o: ObjetScene, facades: ReadonlyArray<CotesFacade>): boolean {
  if (!o.isMesh || facades.length === 0) return false
  const g = o.geometry
  if (!g) return false
  if (!g.boundingBox && g.computeBoundingBox) g.computeBoundingBox()
  const bb = g.boundingBox
  if (!bb) return false
  const face = facesTriees(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z)
  return facades.some((f) => {
    const attendu = facesTriees(f.length, f.width, f.thk)
    return attendu.every((v, i) => Math.abs(v - face[i]) <= Math.max(1, v * 0.005))
  })
}

const sourceDe = (o: ObjetScene): string | null => {
  const u = o.userData as { source?: unknown } | undefined
  return u && typeof u.source === 'string' ? u.source : null
}
const typeElem = (o: ObjetScene): string | null => {
  const u = o.userData as { elemType?: unknown } | undefined
  return u && typeof u.elemType === 'string' ? u.elemType : null
}

/**
 * un panneau standard du designer (`PD_3D`) : un maillage dont `userData` est l'`elemInfo` (`source` : elem / divider / …) ; ou, quand le
 * designer ne le renseigne pas (les côtés et fonds de tiroir, `DrLeft` / `DrBack` / `DrBottom` / `DrRight`), une `BoxGeometry`, ou
 * l'`ExtrudeGeometry` à onglet de `PD_3D` (`steps: 1`, sans `curveSegments` — la tringle `BarHanger` extrude avec `curveSegments: 32`)
 */
export function estPanneauDuDesigner(o: ObjetScene): boolean {
  if (!o.isMesh) return false
  if (sourceDe(o) !== null) return true
  const g = o.geometry
  if (!g) return false
  if (g.type === 'BoxGeometry') return true
  if (g.type === 'ExtrudeGeometry') {
    const opt = g.parameters?.options ?? {}
    return opt.steps === 1 && opt.curveSegments === undefined
  }
  return false
}

/**
 * le sous-arbre d'une porte du designer (`DoorAnimator`) : un groupe dont le premier enfant est le maillage-sonde INVISIBLE (`scanMeshRef`,
 * une `BoxGeometry` aux cotes de la porte) — le seul maillage invisible que le designer pose
 */
export function estPorteDuDesigner(o: ObjetScene, masques?: Masques): boolean {
  if (o.isMesh) return false
  const premier = o.children[0]
  // un panneau que NOUS avons caché (une BoxGeometry de PD_3D, invisible depuis) n'est pas la sonde d'une porte
  return Boolean(premier && premier.isMesh && premier.visible === false && premier.geometry?.type === 'BoxGeometry' && !(masques && masques.has(premier)))
}

export interface BilanMasque {
  /** maillages de panneaux standard rendus invisibles (un panneau de porte compte pour un, sa poignée GLB part avec lui) */
  panneauxMasques: number
  /** sous-arbres de porte du designer rendus invisibles (fox-cad a la porte) */
  portesMasquees: number
  /** façades spéciales du designer rendues hors d'un animateur de porte (fronts fixes), invisibles parce que fox-cad a la porte */
  facadesMasquees: number
  /** sous-arbres de porte du designer gardés (fox-cad n'a pas la porte : la façade se dessine par le chemin d'Otman) */
  portesGardees: number
  /** maillages visibles gardés (tringle, poignée GLB, machine à laver, la façade spéciale d'une porte gardée) */
  maillagesGardes: number
}

/**
 * POURQUOI un objet du designer est invisible par nous : `panneau` (il vient de fox-cad — pour toujours), `porte` ou `facade-fixe` (parce que
 * fox-cad avait la porte de la zone À CE MOMENT-LÀ — une raison qui peut cesser : le front change, la façade devient un manque chez fox-cad, et
 * la porte doit revenir par le chemin d'Otman)
 */
export type RaisonMasque = 'panneau' | 'porte' | 'facade-fixe'

/** ce que NOUS avons caché dans la scène du designer, et pourquoi — un par zone, tenu d'une image à l'autre */
export type Masques = WeakMap<object, RaisonMasque>

/**
 * LE MASQUE : parcourt la scène du designer d'une zone ; chaque panneau standard devient invisible (un panneau de porte emporte son groupe
 * de porte, poignée GLB comprise : `mesh.parent.parent` = le groupe `offset` de `DoorPanel` ou de `DrawerSensor`), chaque sous-arbre de porte
 * est masqué si fox-cad a produit la porte de cette zone, gardé sinon ; tout le reste reste visible. À rejouer à chaque image (le designer
 * monte ses maillages après coup, sans re-rendre le parent — comme `ArticleMaterials`) : `masques` retient ce que NOUS avons caché et pourquoi,
 * pour que le bilan soit le même à chaque passage et qu'un objet invisible par le designer (le maillage-sonde) ne soit jamais compté.
 * `visible = false` sur un objet cache tout son sous-arbre chez three.
 *
 * LE MASQUE SUIT FOX-CAD (23/09 07:43, capture de Dorian sur le build figé : « 3 façades (Door_FA_4a) · 46 panneaux masqués », aucune porte à
 * l'écran) : la page s'ouvre sur le front par défaut — fox-cad a toutes les portes, celles du designer sont cachées — puis Dorian choisit
 * Collection 2 / FR08 dans le formulaire : la façade à cadre est un manque chez fox-cad, la porte du designer doit REVENIR. Le designer garde
 * les mêmes objets three (il ne remonte pas ses portes), et le masque, qui ne rendait jamais ce qu'il avait caché, comptait la même porte en
 * « façade gardée » ET en « panneau masqué » (43 + 3 = 46), invisible. Désormais un objet caché pour `porte` ou `facade-fixe` est RENDU dès que
 * fox-cad n'a plus la porte de la zone, et sous une porte gardée rien de ce que nous avons caché ne reste caché. Hier (mesure du 23/09 06:xx)
 * le front FR08 était semé par l'adresse dès le chargement : pas de transition, la porte se voyait — le défaut ne se voyait qu'après un geste.
 */
export function masquerPanneauxOtman(
  racine: ObjetScene,
  porteParFoxCad: boolean,
  masques: Masques = new WeakMap(),
  facades: ReadonlyArray<CotesFacade> = [],
): BilanMasque {
  const bilan: BilanMasque = { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 0 }
  const cacher = (o: ObjetScene, raison: RaisonMasque) => {
    if (o.visible) o.visible = false
    masques.set(o, raison)
  }
  const rendre = (o: ObjetScene) => {
    o.visible = true
    masques.delete(o)
  }
  const visiter = (o: ObjetScene, sousPorteGardee: boolean) => {
    const raison = masques.get(o)
    if (raison !== undefined) {
      // caché par nous à un passage précédent
      if (raison === 'panneau' && !sousPorteGardee) {
        // un panneau (ou le groupe d'une porte / d'un front de tiroir emporté avec sa poignée) : il vient de fox-cad, il reste caché
        bilan.panneauxMasques++
        return
      }
      if ((raison === 'porte' || raison === 'facade-fixe') && porteParFoxCad) {
        // la porte d'Otman ou son front fixe, fox-cad a toujours la porte : ils restent cachés
        if (raison === 'porte') bilan.portesMasquees++
        else bilan.facadesMasquees++
        return
      }
      // la raison a cessé (fox-cad n'a plus la porte de la zone, ou l'objet vit sous une porte que nous gardons) : on rend l'objet, et il est
      // jugé comme s'il n'avait jamais été caché
      rendre(o)
    }
    if (estPorteDuDesigner(o, masques)) {
      if (porteParFoxCad) {
        cacher(o, 'porte')
        bilan.portesMasquees++
        return
      }
      bilan.portesGardees++
      sousPorteGardee = true
    }
    if (o.isMesh) {
      if (!o.visible) return
      if (porteParFoxCad && !sousPorteGardee && estFacadeAuxCotes(o, facades)) {
        // la façade spéciale d'un front FIXE (hors animateur de porte) alors que fox-cad a la porte de la zone : masquée comme une porte
        cacher(o, 'facade-fixe')
        bilan.facadesMasquees++
        return
      }
      if (estPanneauDuDesigner(o)) {
        if (sousPorteGardee) {
          // sous une porte gardée : la façade spéciale d'Otman — rien à masquer, on la garde
          bilan.maillagesGardes++
          return
        }
        cacher(typeElem(o) === 'D' && o.parent?.parent ? o.parent.parent : o, 'panneau')
        bilan.panneauxMasques++
        return
      }
      bilan.maillagesGardes++
      return
    }
    for (const enfant of o.children) {
      visiter(enfant, sousPorteGardee)
      // un panneau de porte vient de cacher CE groupe (le `offset` de DoorPanel / DrawerSensor) : ses autres enfants — la poignée — partent avec lui
      if (masques.has(o)) return
    }
  }
  for (const enfant of racine.children) visiter(enfant, false)
  return bilan
}

/* ─── le magasin : ce que la scène a fait, par zone ─────────────────────────────────────────────────────────────────────────────────── */

export interface ElementOtman {
  genre: GenreOtman
  cpName: string
  kmsName: string | null
  /** le modèle `special-kms` d'une façade (`Door_FA_4a`), quand Otman en a un */
  modele: string | null
}

/** les éléments spéciaux d'une zone, depuis les statistiques de panneaux du designer (`onStatsReady`) */
export function elementsSpeciaux(panneaux: ReadonlyArray<{ cpName: string; kmsName?: string | null }>): ElementOtman[] {
  const out: ElementOtman[] = []
  for (const p of panneaux) {
    const genre = genreOtman(p.cpName, p.kmsName ?? null)
    if (genre === 'panneau') continue
    out.push({ genre, cpName: p.cpName, kmsName: p.kmsName ?? null, modele: genre === 'facade-speciale' ? modeleFacadeOtman(p.cpName) : null })
  }
  return out
}

/**
 * LA FAÇADE SPÉCIALE COUPÉE (23/09, mot de Dorian 09:5x) : ce que la découpe d'une zone a fait — `attente` (le contour de la porte pleine
 * n'est pas encore là : la façade est cachée), `coupee` (au moins un plan du contour a coupé la façade du designer), `entiere` (le contour
 * ne la coupe pas : une porte rectangulaire), `indisponible` (fox-cad n'a pas rendu la porte pleine non plus : façade entière, non coupée).
 * Dans tous les cas la façade est RENDUE, PAS CALCULÉE : le KMS multi-pièces reste un manque chez fox-cad.
 */
export type EtatDecoupe = 'attente' | 'coupee' | 'entiere' | 'indisponible'

export interface DecoupeZone {
  etat: EtatDecoupe
  /** le module coupé de fox-cad, et le module plein monté dans le designer d'Otman (le seul dont il sait dessiner la façade spéciale) */
  module: string
  plein: string
  /** le KMS multi-pièces que le moteur a refusé (`MP_1_FR_SHELL_FR08_LAM`) */
  kms: string | null
  /** les plans issus du contour de la porte pleine, ceux qui ont effectivement coupé, les sommets du contour */
  plans: number
  coupes: number
  sommets: number
  /** le chant de la coupe : refermé par la section exacte, ou approché (une boucle de section refermée de force) */
  chant: 'exact' | 'approche' | null
  /**
   * d'où vient le contour : la porte pleine du second calcul (la façade est un manque chez le moteur — absent = celle-ci, comme avant le
   * 24/09), ou le parent de la façade coupée que le moteur sert et que l'écran ne dessine pas (`facade-servie`, la garde du pourtour)
   */
  source?: 'porte-pleine' | 'facade-servie'
  /** pourquoi l'écran ne dessine pas la façade servie (`facade-servie`) */
  raison?: string | null
}

export interface BilanZoneOtman extends BilanMasque {
  index: string
  /** fox-cad a produit la porte de la zone (les portes du designer sont alors masquées) */
  porteParFoxCad: boolean
  /** les éléments que le designer tient pour spéciaux dans cette zone */
  speciaux: ElementOtman[]
  /** les façades que le designer a rendues (ses statistiques, `elemType` D), pour l'écran et l'outil de preuve */
  facades: CotesFacade[]
  /** la découpe de la façade spéciale par le contour de fox-cad (23/09), quand la zone en a une */
  decoupe?: DecoupeZone | null
  /** le designer d'Otman a planté dans cette zone (`GardeDesigner`) : son message ; la zone est vide */
  erreur?: string | null
  /** la façade multipart de fox-cad dans cette zone (23/09, la règle d'attente) : comptée par fox-cad, dessinée par Otman ; `null` sans */
  multipart?: MultipartZone | null
}

export interface ResumeOtman {
  zones: BilanZoneOtman[]
  panneauxMasques: number
  portesMasquees: number
  /** les façades dessinées par le chemin d'Otman (portes du designer gardées) */
  facades: number
  /** les modèles `special-kms` de ces façades */
  modeles: string[]
  tringles: number
  autres: number
  maillagesGardes: number
  /** les façades spéciales coupées par le contour de la porte pleine de fox-cad (rendu, pas calculé), et celles qui attendent ce contour */
  facadesCoupees: number
  facadesEnAttente: number
  /** les KMS que le moteur refuse sur ces colonnes coupées (`MP_1_FR_SHELL_5PD10_LAM`) — la façade à cadre qui vient avec MD2 */
  kmsCoupees: string[]
  /** les zones dont le designer d'Otman a planté : « index : article : message » */
  erreurs: string[]
  /** les façades multipart de fox-cad (23/09) : comptées par fox-cad ; dessinées par fox-cad (b) ou par Otman (a) — leurs pièces, leurs définitions, les décors, les raisons */
  facadesMultipart: number
  piecesMultipart: number
  kmsMultipart: string[]
  multipartParFoxCad: number
  multipartParOtman: number
  /** les façades multipart COUPÉES que fox-cad dessine, et leurs traverses en pente mesurées (24/09) */
  multipartCoupees: number
  multipartTraverses: TraverseEnPente[]
  multipartRaisons: string[]
  multipartCadres: string[]
  multipartToiles: string[]
  multipartToileDuLot: boolean
}

const parZone = new Map<string, BilanZoneOtman>()
const parZoneDecoupe = new Map<string, DecoupeZone>()
const parZoneErreur = new Map<string, string>()
const parZoneMultipart = new Map<string, MultipartZone>()
const abonnes = new Set<() => void>()
const VIDE: ResumeOtman = { zones: [], panneauxMasques: 0, portesMasquees: 0, facades: 0, modeles: [], tringles: 0, autres: 0, maillagesGardes: 0, facadesCoupees: 0, facadesEnAttente: 0, kmsCoupees: [], erreurs: [], facadesMultipart: 0, piecesMultipart: 0, kmsMultipart: [], multipartParFoxCad: 0, multipartParOtman: 0, multipartCoupees: 0, multipartTraverses: [], multipartRaisons: [], multipartCadres: [], multipartToiles: [], multipartToileDuLot: false }
let resume: ResumeOtman = VIDE
let programme = false

export function resumerOtman(zones: BilanZoneOtman[]): ResumeOtman {
  const r: ResumeOtman = { zones, panneauxMasques: 0, portesMasquees: 0, facades: 0, modeles: [], tringles: 0, autres: 0, maillagesGardes: 0, facadesCoupees: 0, facadesEnAttente: 0, kmsCoupees: [], erreurs: [], facadesMultipart: 0, piecesMultipart: 0, kmsMultipart: [], multipartParFoxCad: 0, multipartParOtman: 0, multipartCoupees: 0, multipartTraverses: [], multipartRaisons: [], multipartCadres: [], multipartToiles: [], multipartToileDuLot: false }
  const modeles = new Set<string>()
  const kmsMultipart = new Set<string>()
  const raisonsMultipart = new Set<string>()
  const cadresMultipart = new Set<string>()
  const toilesMultipart = new Set<string>()
  const kmsCoupees = new Set<string>()
  for (const z of zones) {
    if (z.erreur) r.erreurs.push(`${z.index} : ${z.erreur}`)
    if (z.multipart) {
      r.facadesMultipart += z.multipart.facades
      r.piecesMultipart += z.multipart.pieces
      r.multipartParFoxCad += z.multipart.parFoxCad
      r.multipartParOtman += z.multipart.facades - z.multipart.parFoxCad
      r.multipartCoupees += z.multipart.coupees ?? 0
      if (z.multipart.traverses?.length) r.multipartTraverses.push(...z.multipart.traverses)
      for (const k of z.multipart.kms.split(', ')) kmsMultipart.add(k)
      for (const x of z.multipart.raisons) raisonsMultipart.add(x)
      if (z.multipart.cadre) cadresMultipart.add(z.multipart.cadre)
      if (z.multipart.toile) toilesMultipart.add(z.multipart.toile)
      if (z.multipart.toileSource === 'lot') r.multipartToileDuLot = true
    }
    if (z.decoupe?.etat === 'coupee') {
      r.facadesCoupees++
      if (z.decoupe.kms) kmsCoupees.add(z.decoupe.kms)
    }
    if (z.decoupe?.etat === 'attente') r.facadesEnAttente++
    r.panneauxMasques += z.panneauxMasques
    r.portesMasquees += z.portesMasquees + z.facadesMasquees
    r.facades += z.portesGardees
    r.maillagesGardes += z.maillagesGardes
    for (const s of z.speciaux) {
      if (s.genre === 'tringle') r.tringles++
      else if (s.genre === 'facade-speciale') {
        if (z.portesGardees > 0 && s.modele) modeles.add(s.modele)
      } else r.autres++
    }
  }
  r.modeles = [...modeles].sort()
  r.kmsMultipart = [...kmsMultipart].sort()
  r.multipartRaisons = [...raisonsMultipart]
  r.multipartCadres = [...cadresMultipart].sort()
  r.multipartToiles = [...toilesMultipart].sort()
  r.kmsCoupees = [...kmsCoupees].sort()
  return r
}

const BILAN_VIDE: Omit<BilanZoneOtman, 'index'> = { porteParFoxCad: false, panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 0, speciaux: [], facades: [] }

/** les zones du magasin, le masque, la découpe et l'erreur fusionnés (une zone en erreur sans bilan de masque existe quand même) */
const zonesFusionnees = (): BilanZoneOtman[] => {
  const index = new Set<string>([...parZone.keys(), ...parZoneErreur.keys(), ...parZoneMultipart.keys()])
  return [...index]
    .sort((a, b) => a.localeCompare(b))
    .map((i) => ({ ...(parZone.get(i) ?? { index: i, ...BILAN_VIDE }), decoupe: parZoneDecoupe.get(i) ?? null, erreur: parZoneErreur.get(i) ?? null, multipart: parZoneMultipart.get(i) ?? null }))
}

const recompter = () => {
  resume = resumerOtman(zonesFusionnees())
  for (const f of abonnes) f()
}

const planifier = () => {
  if (programme) return
  programme = true
  setTimeout(() => {
    programme = false
    recompter()
  }, 0)
}

const memeBilan = (a: BilanZoneOtman, b: BilanZoneOtman) =>
  a.porteParFoxCad === b.porteParFoxCad &&
  a.panneauxMasques === b.panneauxMasques &&
  a.portesMasquees === b.portesMasquees &&
  a.facadesMasquees === b.facadesMasquees &&
  a.portesGardees === b.portesGardees &&
  a.maillagesGardes === b.maillagesGardes &&
  a.speciaux.length === b.speciaux.length &&
  a.speciaux.every((s, i) => s.genre === b.speciaux[i].genre && s.cpName === b.speciaux[i].cpName && s.kmsName === b.speciaux[i].kmsName) &&
  a.facades.length === b.facades.length &&
  a.facades.every((f, i) => f.length === b.facades[i].length && f.width === b.facades[i].width && f.thk === b.facades[i].thk)

/** « 590×500×18 » — une façade du designer, pour l'attribut de l'écran */
export const direFacade = (f: CotesFacade): string => `${f.length}×${f.width}×${f.thk}`

/** une zone signale son bilan (le masque et les spéciaux), ou son départ (`null`) */
export function signalerZoneOtman(index: string, bilan: Omit<BilanZoneOtman, 'index'> | null): void {
  if (bilan === null) {
    if (!parZone.delete(index)) return
  } else {
    const avant = parZone.get(index)
    const apres = { index, ...bilan }
    if (avant && memeBilan(avant, apres)) return
    parZone.set(index, apres)
  }
  planifier()
}

const memeDecoupe = (a: DecoupeZone, b: DecoupeZone) =>
  a.etat === b.etat &&
  a.module === b.module &&
  a.plein === b.plein &&
  a.kms === b.kms &&
  a.plans === b.plans &&
  a.coupes === b.coupes &&
  a.sommets === b.sommets &&
  a.chant === b.chant &&
  (a.source ?? 'porte-pleine') === (b.source ?? 'porte-pleine') &&
  (a.raison ?? null) === (b.raison ?? null)

/** une zone signale ce que la découpe de sa façade spéciale a fait, ou son départ (`null`) */
export function signalerDecoupeOtman(index: string, decoupe: DecoupeZone | null): void {
  if (decoupe === null) {
    if (!parZoneDecoupe.delete(index)) return
  } else {
    const avant = parZoneDecoupe.get(index)
    if (avant && memeDecoupe(avant, decoupe)) return
    parZoneDecoupe.set(index, decoupe)
  }
  planifier()
}

const memeMultipart = (a: MultipartZone, b: MultipartZone) =>
  a.kms === b.kms &&
  a.pieces === b.pieces &&
  a.facades === b.facades &&
  a.parFoxCad === b.parFoxCad &&
  (a.coupees ?? 0) === (b.coupees ?? 0) &&
  JSON.stringify(a.traverses ?? []) === JSON.stringify(b.traverses ?? []) &&
  a.raisons.join('|') === b.raisons.join('|') &&
  a.cadre === b.cadre &&
  a.toile === b.toile &&
  a.toileSource === b.toileSource

/**
 * une zone signale que fox-cad y rend la porte en FAÇADE MULTIPART (23/09, la règle d'attente : comptée par fox-cad, dessinée par Otman), ou
 * que ce n'est plus le cas (`null`)
 */
export function signalerMultipartOtman(index: string, multipart: MultipartZone | null): void {
  if (multipart === null) {
    if (!parZoneMultipart.delete(index)) return
  } else {
    const avant = parZoneMultipart.get(index)
    if (avant && memeMultipart(avant, multipart)) return
    parZoneMultipart.set(index, multipart)
  }
  planifier()
}

/** une zone signale que le designer d'Otman y a planté (le message), ou que l'erreur a cessé (`null`) */
export function signalerErreurOtman(index: string, message: string | null): void {
  if (message === null) {
    if (!parZoneErreur.delete(index)) return
  } else {
    if (parZoneErreur.get(index) === message) return
    parZoneErreur.set(index, message)
  }
  planifier()
}

const abonner = (f: () => void) => {
  abonnes.add(f)
  return () => {
    abonnes.delete(f)
  }
}
const lire = () => resume
const lireServeur = () => VIDE

/** ce que le chemin d'Otman dessine dans la scène, par zone et en tout */
export function useCheminOtman(): ResumeOtman {
  return useSyncExternalStore(abonner, lire, lireServeur)
}

/**
 * « chemin d'Otman : façade dessinée (Door_FA_4a) · tringle MP_SPP_HC_ELITE_BLACK · 11 panneaux du designer masqués » — la ligne d'une zone
 * dans le détail du lot
 */
export function direZoneOtman(z: BilanZoneOtman): string {
  const morceaux: string[] = []
  if (z.erreur) morceaux.push(`designer d'Otman en erreur, zone vide (${z.erreur})`)
  // 23/09, la règle d'attente : la porte de cette zone est une façade multipart chez fox-cad — comptée par lui, dessinée par Otman
  if (z.multipart) morceaux.push(direMultipartZone(z.multipart))
  if (z.portesGardees > 0) {
    const modeles = [...new Set(z.speciaux.filter((s) => s.genre === 'facade-speciale' && s.modele).map((s) => s.modele as string))]
    morceaux.push(`${z.portesGardees > 1 ? `${z.portesGardees} façades dessinées` : 'façade dessinée'} par Otman${modeles.length ? ` (${modeles.join(', ')})` : ' (sans modèle : rien)'}`)
  } else if (z.porteParFoxCad && z.portesMasquees + z.facadesMasquees > 0) {
    const parts = [
      z.portesMasquees > 0 ? `${z.portesMasquees} porte${z.portesMasquees > 1 ? 's' : ''}` : '',
      z.facadesMasquees > 0 ? `${z.facadesMasquees} façade${z.facadesMasquees > 1 ? 's' : ''} fixe${z.facadesMasquees > 1 ? 's' : ''}` : '',
    ].filter(Boolean)
    morceaux.push(`porte de fox-cad (${parts.join(' + ')} d'Otman masquée${z.portesMasquees + z.facadesMasquees > 1 ? 's' : ''})`)
  }
  if (z.decoupe) morceaux.push(direDecoupe(z.decoupe))
  for (const s of z.speciaux) {
    if (s.genre === 'tringle') morceaux.push(`tringle ${s.kmsName ?? s.cpName} par Otman`)
    else if (s.genre === 'tiroir-special' || s.genre === 'machine-a-laver') morceaux.push(`${s.genre} ${s.kmsName ?? s.cpName} par Otman`)
  }
  morceaux.push(`${z.panneauxMasques} panneau${z.panneauxMasques > 1 ? 'x' : ''} du designer masqué${z.panneauxMasques > 1 ? 's' : ''}`)
  return `chemin d'Otman : ${morceaux.join(' · ')}`
}

/**
 * LA VÉRITÉ SUR LA COLONNE COUPÉE (ligne du lead 23/09 21:3x ①, mot de Dorian devant le public : « les portes sur le front HEX sont
 * simplement coupées en biais et pas avec l'encadrement complet en bois ») : ce que la découpe montre est la façade PLATE d'Otman tranchée
 * par le contour — les montants s'arrêtent à la pente, aucune traverse ne la longe. Un provisoire, pas la façade : la porte à cadre complet
 * (la traverse en pente, les montants en trapèze, le panneau et la toile polygonaux) vient du moteur avec MD2B — la forme B, décidée par
 * Dorian le 24/09 à 07:3x (« la traverse doit avoir la même largeur même avec l'angle » ; MD2, la lecture A, devient un témoin) : alors
 * `FoxCadPieces` la dessine (`geometriePrisme`, préparé). Le 24/09 le moteur sert déjà la définition d'Otman coupée (fox-cad `61f81c9`) :
 * sur QUAD un cadre complet en lecture A, dessiné ; sur HEXA des enfants plats hors du pourtour, NON dessinés (la garde du pourtour,
 * `multipart.ts`) — la façade d'Otman y reste découpée, provisoire. La phrase ne dit MD2B que pour une façade à cadre `MP_1_FR_SHELL_…` ;
 * un autre KMS refusé est nommé tel quel.
 */
export const PROVISOIRE_CADRE = 'provisoire : le cadre complet vient avec MD2B'

/** « provisoire : le cadre complet vient avec MD2B » pour les façades à cadre ; « provisoire : fox-cad ne calcule pas encore <KMS> » sinon */
export function direProvisoire(kms: ReadonlyArray<string | null>): string {
  const connus = kms.filter((k): k is string => !!k)
  if (connus.length === 0 || connus.every((k) => /^MP_1_FR_SHELL_/i.test(k))) return PROVISOIRE_CADRE
  return `provisoire : fox-cad ne calcule pas encore ${connus.join(', ')}`
}

/**
 * « façade d'Otman DÉCOUPÉE par le contour de la porte pleine de fox-cad (5 sommets, 1 plan, chant exact) — provisoire : le cadre complet vient
 * avec MD2 (le KMS MP_1_FR_SHELL_5PD10_LAM reste un manque) ; modèle d'Otman du module plein WACA_LY_D pour WACA_LY_D_H5L » — la phrase d'une
 * découpe
 */
export function direDecoupe(d: DecoupeZone): string {
  // 24/09 : le contour vient du parent de la façade coupée que le moteur SERT (et que l'écran ne dessine pas : `raison`), ou de la porte pleine
  const servie = d.source === 'facade-servie'
  const kms = servie
    ? `le moteur sert ${d.kms ?? 'la façade à cadre'}, non dessinée${d.raison ? ` : ${d.raison}` : ''}`
    : d.kms
      ? `le KMS ${d.kms} reste un manque`
      : 'le KMS multi-pièces reste un manque'
  const contour = servie ? 'le contour de la façade servie par fox-cad' : 'le contour de la porte pleine de fox-cad'
  const modulePlein = d.plein !== d.module ? ` ; modèle d'Otman du module plein ${d.plein} pour ${d.module}` : ''
  switch (d.etat) {
    case 'coupee':
      return `façade d'Otman DÉCOUPÉE par ${contour} (${d.sommets} sommets, ${d.coupes} plan${d.coupes > 1 ? 's' : ''}, chant ${d.chant === 'approche' ? 'approché' : 'exact'}) — ${direProvisoire([d.kms])} (${kms})${modulePlein}`
    case 'entiere':
      return `façade spéciale entière : ${contour} (${d.sommets} sommets) ne la coupe pas — rendu, pas calculé : ${kms}${modulePlein}`
    case 'indisponible':
      return `façade spéciale entière, NON coupée : fox-cad n'a pas rendu la porte pleine de cette position — rendu, pas calculé : ${kms}${modulePlein}`
    default:
      return `façade spéciale cachée en attendant ${contour} — ${kms}${modulePlein}`
  }
}

/** « chemin d'Otman : 5 façades (Door_FA_4a) · 1 tringle · 61 panneaux masqués » — la phrase du badge ; vide quand rien n'est superposé */
export function direCheminOtman(r: ResumeOtman): string {
  if (r.zones.length === 0) return ''
  const morceaux: string[] = []
  if (r.facades > 0) {
    // ligne du lead 23/09 21:3x ① : sur une colonne coupée, la façade d'Otman est DÉCOUPÉE par le contour — un provisoire, dit comme tel
    const modeles = r.modeles.length ? ` (${r.modeles.join(', ')})` : ''
    const n = r.facadesCoupees
    const s = n > 1 ? 's' : ''
    const provisoire = direProvisoire(r.kmsCoupees)
    if (n > 0 && n === r.facades) morceaux.push(`${n} façade${s} d'Otman${modeles} découpée${s} par le contour — ${provisoire}`)
    else if (n > 0) morceaux.push(`${r.facades} façades${modeles}, dont ${n} façade${s} d'Otman découpée${s} par le contour — ${provisoire}`)
    else morceaux.push(`${r.facades} façade${r.facades > 1 ? 's' : ''}${modeles}`)
  }
  // 23/09, la règle d'attente : « 3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) : dessin d'Otman, pièces fox-cad »
  if (r.facadesMultipart > 0)
    morceaux.push(
      direMultipart({
        facades: r.facadesMultipart,
        pieces: r.piecesMultipart,
        kms: r.kmsMultipart,
        parFoxCad: r.multipartParFoxCad,
        parOtman: r.multipartParOtman,
        ...(r.multipartCoupees > 0 ? { coupees: r.multipartCoupees, traverses: r.multipartTraverses } : {}),
        raisons: r.multipartRaisons,
        cadres: r.multipartCadres,
        toiles: r.multipartToiles,
        toileDuLot: r.multipartToileDuLot,
      }),
    )
  if (r.facadesEnAttente > 0) morceaux.push(`${r.facadesEnAttente} façade${r.facadesEnAttente > 1 ? 's' : ''} en attente du contour de fox-cad`)
  if (r.erreurs.length > 0) morceaux.push(`${r.erreurs.length} zone${r.erreurs.length > 1 ? 's' : ''} du designer en erreur`)
  if (r.tringles > 0) morceaux.push(`${r.tringles} tringle${r.tringles > 1 ? 's' : ''}`)
  if (r.autres > 0) morceaux.push(`${r.autres} autre${r.autres > 1 ? 's' : ''}`)
  if (morceaux.length === 0) morceaux.push('rien à dessiner')
  morceaux.push(`${r.panneauxMasques} panneau${r.panneauxMasques > 1 ? 'x' : ''} masqué${r.panneauxMasques > 1 ? 's' : ''}`)
  return `chemin d'Otman : ${morceaux.join(' · ')}`
}
