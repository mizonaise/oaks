import type { Box as ShapeBox } from '@/components/scene/shapeTree'
import type { Colonne } from './stations'

/**
 * Modèle paramétrique de la scène (Dorian, 2026-09-15).
 *
 * La pièce ne se dessine pas : elle se DÉDUIT du meuble. Deux sources, et rien
 * d'autre :
 *
 * 1. les **CP posés sur les faces de la forme** (`sides[*].cp`) — un
 *    `CP_SPO_WALL` sur une face dit « un mur réel est ici », un `CP_1_FI_*` dit
 *    « un fileur », un `CP_1_BA_*` « une bande basse / haute » ;
 * 2. le **panneau de configuration** (les `valeurs` du formulaire) — type de
 *    pose, cotes, fileurs, colonnes et leurs fonctions, collection, finition,
 *    poignée.
 *
 * Le résultat est consommé par `RoomWalls` (la pièce dessinée), par les stations
 * de caméra (`stations.ts` : où la caméra peut être) et publié tel quel dans la
 * fiche — la même vérité pour l'image, la caméra et Flora.
 *
 * Règles (cahier § 3 bis, A1-A11) : marge libre `max(600 mm, 25 % de L)` ; le
 * plafond affleure le meuble (+ jeu réglable) ; profondeur de pièce
 * et fenêtre : voir « Couche 1 » plus bas (P4, P5), qui remplace A7 et A8.
 */

export const WALL_CP = 'CP_SPO_WALL'

export type CpWall = {
  key: string
  axis: 'x' | 'z'
  sign: -1 | 1
  at: number
  center: number
  size: number
}

/**
 * Un mur par face de boîte portant `CP_SPO_WALL` (mêmes unités que la pièce :
 * mm × `scale`). `top`/`bottom` sont ignorés — un mur est vertical.
 */
export function findCpWalls (
  boxes: Array<Pick<ShapeBox, 'index' | 'x' | 'z' | 'w' | 'd' | 'sides'>>,
  scale: number
): CpWall[] {
  const walls: CpWall[] = []
  for (const b of boxes) {
    if (!b.sides) continue
    const faces = [
      ['left', 'x', -1, b.x, b.z, b.d],
      ['right', 'x', 1, b.x + b.w, b.z, b.d],
      // z croît du mur du fond vers le spectateur : la face « front » d'une boîte est
      // la plus éloignée du fond (mesuré le 20/09 : le panneau de bout d'aile d'un L,
      // z = 2575, d = 25, porte le mur sur sa face « front », donc en z = 2600).
      ['front', 'z', 1, b.z + b.d, b.x, b.w],
      ['back', 'z', -1, b.z, b.x, b.w]
    ] as const
    for (const [face, axis, sign, at, spanStart, spanSize] of faces) {
      if (b.sides[face]?.cp !== WALL_CP) continue
      walls.push({
        key: `${b.index}:${face}`,
        axis,
        sign,
        at: at * scale,
        center: (spanStart + spanSize / 2) * scale,
        size: spanSize * scale
      })
    }
  }
  return walls
}

/**
 * Couche 1 (2026-09-20) — le PLAN de la pièce vient de l'EMPRISE du meuble, pas
 * de sa boîte englobante. Sur un L ou un U la boîte de la forme est un volume de
 * construction de 8 m de profondeur : seule une partie est occupée.
 *
 * P1 tout dos de module est contre un mur (fond ; L : + le mur le long de l'aile ;
 *    U : + les deux) — quelle que soit la pose ;
 * P2 la pose (les `CP_SPO_WALL`) décide des extrémités libres : flanc d'un corps
 *    droit, bout d'une aile ;
 * P3 au bout d'une aile, le mur est un retour COURT (jambage), pas un mur qui
 *    traverse la pièce ;
 * P4 la pièce a des dimensions de pièce ;
 * P5 la fenêtre a une géométrie, sur un mur qui ne porte pas de meuble ;
 * P6 la fiche publie ce plan.
 */
export type Aile = { largeur_m: number; longueur_m: number; mur_au_bout: boolean }
export type Emprise = {
  l_m: number
  /** Profondeur réellement occupée (la plus longue aile, sinon le corps). */
  p_m: number
  /** Profondeur du corps contre le mur du fond. */
  p_corps_m: number
  aile_gauche: Aile | null
  aile_droite: Aile | null
  forme: 'droit' | 'L' | 'U'
}
export type FenetrePlan = { type: 'fenetre' | 'passage'; centre_m: number; largeur_m: number; hauteur_m: number; allege_m: number; tableau_m: number }
/** Un mur : plan vertical en `axe` = `at`, de `de` à `a` sur l'autre axe ; `normale` pointe dans la pièce. */
export type MurPlan = {
  id: string
  nature: 'dos' | 'cote' | 'face' | 'libre'
  axe: 'x' | 'z'
  at: number
  de: number
  a: number
  normale: 1 | -1
  fenetre?: FenetrePlan
}
/** Un retour de mur (jambage) : un bloc plein, du sol au plafond. */
export type RetourPlan = { id: string; x0: number; x1: number; z0: number; z1: number }
/**
 * Habillage minimal posé par NOUS (2026-09-20, après le contrôle du lot de 20). Flora comble ce qu'on laisse vide :
 * sur un pan nu du mur du fond elle invente une fenêtre (4 cas sur les 10 produits qui en avaient un) ; dans une
 * grande niche vide elle fabrique une bibliothèque (5 cas sur 5). On occupe donc ces deux vides par des volumes
 * simples qu'elle n'aura plus qu'à rendre : un cadre (et une console si le pan est large), un téléviseur dans la niche.
 * Boîtes en mètres, repère local (x 0..w, z = 0 au mur du fond).
 */
export type Habillage = { id: string; type: 'cadre' | 'console' | 'tele'; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }
export type VarianteU = 'alcove' | 'piece'
/** Ce qu'il y a derrière un bout libre (lecture des concurrents, 20/09) : le mur continue, un passage, ou la fenêtre toute proche. */
export type IssueBoutLibre = 'mur' | 'passage' | 'fenetre'
/** Un meuble encastré des deux côtés : de mur à mur, ou dans une niche maçonnée (deux jambages, la pièce est plus large). */
export type VarianteEncastre = 'mur-a-mur' | 'niche'
export type Variantes = { u: VarianteU; cote_fenetre: 'gauche' | 'droite'; issue: IssueBoutLibre; encastre: VarianteEncastre; graine: number }

/** Graine stable d'un produit : la même configuration redonne la même pièce (FNV-1a sur les valeurs triées). */
export function graineDe (valeurs: Record<string, string>): number {
  // En capture, la configuration du produit est dans l URL (?CHAMP=valeur) : c est elle qui fait la graine. Mesuré le
  // 20/09 : les valeurs du formulaire arrivent en plusieurs temps, et deux chargements du même produit (rendu client,
  // jumeau schéma, carré) tiraient des pièces DIFFÉRENTES selon l instant du calcul.
  if (typeof window !== 'undefined') {
    const q = [...new URLSearchParams(window.location.search).entries()].filter(([k]) => /^[A-Z][A-Z0-9_]*$/.test(k))
    if (q.length >= 3) valeurs = Object.fromEntries(q)
  }
  const s = Object.keys(valeurs).filter(k => !k.startsWith('piece_')).sort().map(k => k + '=' + valeurs[k]).join('&')
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h >>> 0
}

/** Les variantes de pièce : tirées de la graine du produit, chacune forçable par l'URL (piece_u, piece_fenetre, piece_issue, piece_encastre). */
export function variantesPour (valeurs: Record<string, string>): Variantes {
  const graine = graineDe(valeurs)
  const q = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const parmi = <T extends string>(cle: string, choix: readonly T[], tire: T): T => (choix as readonly string[]).includes(q.get(cle) ?? '') ? (q.get(cle) as T) : tire
  const issues: IssueBoutLibre[] = ['mur', 'mur', 'passage', 'fenetre']
  return {
    graine,
    u: parmi('piece_u', ['alcove', 'piece'] as const, 'alcove'),
    cote_fenetre: parmi('piece_fenetre', ['gauche', 'droite'] as const, graine % 2 === 0 ? 'gauche' : 'droite'),
    issue: parmi('piece_issue', ['mur', 'passage', 'fenetre'] as const, issues[(graine >>> 3) % issues.length]),
    encastre: parmi('piece_encastre', ['mur-a-mur', 'niche'] as const, (graine >>> 7) % 3 === 0 ? 'niche' : 'mur-a-mur')
  }
}

const DEBORD_RETOUR = 0.1
const EPAISSEUR_RETOUR = 0.1
const FENETRE = { largeur_m: 1.2, hauteur_m: 1.5, allege_m: 0.9, tableau_m: 0.2 }
const PASSAGE = { largeur_m: 0.85, hauteur_m: 2.05, tableau_m: 0.15 }
// Pas de « hauteur de pièce » : un meuble Oaksome est toujours intégré au plafond (Dorian, 20/09).

/** Variante du U, commutable par l'URL (`?piece_u=piece`) : l'alcôve EST la pièce, ou le U ouvre sur une pièce plus grande. */
export function varianteUCourante (): VarianteU {
  if (typeof window === 'undefined') return 'alcove'
  return new URLSearchParams(window.location.search).get('piece_u') === 'piece' ? 'piece' : 'alcove'
}

/**
 * Emprise par balayage de colonnes : pour chaque tranche de largeur, la profondeur
 * atteinte par les boîtes OCCUPÉES (celles qui portent un CP ou un article). Une
 * aile = des tranches contiguës depuis un bord, plus profondes que le corps d'au
 * moins 0,5 m.
 */
export function empriseDe (
  boxes: Array<Pick<ShapeBox, 'x' | 'z' | 'w' | 'd' | 'sides'> & { isArticle?: boolean }>,
  bounds: { w: number; d: number },
  cpWalls: CpWall[],
  scale: number
): Emprise {
  const occ = boxes.filter(b => b.isArticle || (b.sides && Object.values(b.sides).some(s => s?.cp)))
  const repli: Emprise = { l_m: bounds.w, p_m: bounds.d, p_corps_m: bounds.d, aile_gauche: null, aile_droite: null, forme: 'droit' }
  if (!occ.length) return repli
  const bords = [...new Set(occ.flatMap(b => [b.x, b.x + b.w]))].sort((p, q) => p - q)
  const tranches: Array<{ x0: number; x1: number; p: number }> = []
  for (let i = 0; i + 1 < bords.length; i++) {
    const x0 = bords[i]
    const x1 = bords[i + 1]
    if (x1 - x0 < 1) continue
    const m = (x0 + x1) / 2
    const p = occ.filter(b => b.x <= m && m <= b.x + b.w).reduce((mx, b) => Math.max(mx, b.z + b.d), 0)
    if (p > 0) tranches.push({ x0, x1, p })
  }
  if (!tranches.length) return repli
  const corps = Math.min(...tranches.map(t => t.p))
  const aile = (liste: typeof tranches): Aile | null => {
    let largeur = 0
    let longueur = 0
    let xa = Infinity
    let xb = -Infinity
    for (const t of liste) {
      if (t.p < corps + 500) break
      largeur += t.x1 - t.x0
      longueur = Math.max(longueur, t.p)
      xa = Math.min(xa, t.x0)
      xb = Math.max(xb, t.x1)
    }
    if (!largeur || largeur > 0.6 * (bounds.w / scale)) return null
    const mur = cpWalls.some(k => k.axis === 'z' && k.at > (corps + 250) * scale && k.center >= xa * scale - 0.01 && k.center <= xb * scale + 0.01)
    return { largeur_m: r3(largeur * scale), longueur_m: r3(longueur * scale), mur_au_bout: mur }
  }
  const aile_gauche = aile(tranches)
  const aile_droite = aile([...tranches].reverse())
  return {
    l_m: bounds.w,
    p_m: r3(Math.max(...tranches.map(t => t.p)) * scale),
    p_corps_m: r3(corps * scale),
    aile_gauche,
    aile_droite,
    forme: aile_gauche && aile_droite ? 'U' : aile_gauche || aile_droite ? 'L' : 'droit'
  }
}

/**
 * B4 (22/09, plan « vendre un placard sous pente », mots de Dorian : « la pièce doit avoir des murs qui épousent les formes du
 * meuble ») — LE RAMPANT : le plafond descend en pente vers un mur. Il est piloté par les CHAMPS du formulaire des panneaux sous pente
 * (arbres 9001 / 9002 de d11, `oaksome-stack/produits/hex/configurateur/PLAN.md` § 1), jamais deviné :
 *  - HEX (`OS_SHAPE_HEX`) : `ZH_SLOPE_TYPE` (LEFT / RIGHT / BOTH), `ZH_LOW_H_L` / `_R` (la hauteur au mur, mm depuis le sol — le point bas),
 *    `ZH_RUN_L` / `_R` (la longueur du rampant, le long de la pente) ; la hauteur `ZF_HEIGHT` est celle du meuble (`bounds.h`) : le meuble
 *    est toujours intégré au plafond, le plafond plat est à sa hauteur ; la projection au sol = √(L² − (H − h)²), l'angle = asin((H − h) / L)
 *    (les mêmes dérivations que `HEX_RUN_L_H` du formulaire et que le viewer fox-cad) ;
 *  - HEX 2 (`OS_SHAPE_HEX2`) : `ZH2_LOW_H` (la hauteur au mur du FOND, le point bas) et `ZH2_TOP_D` (la profondeur du dessus plat depuis
 *    la façade) : le rampant descend vers l'arrière, sa projection au sol = profondeur du meuble − dessus plat.
 * Les cinq formes de production n'ont aucun de ces champs : pas de rampant, leur pièce ne change pas.
 * Un rampant de la pièce épouse le meuble : le mur au pied du rampant a la hauteur du point bas, le plafond en pente touche le dessus en
 * pente du meuble (à son filler de rampant près, 80 mm — décision 15) et rejoint le plafond plat à la projection au sol.
 */
export type Rampant = {
  cote: 'gauche' | 'droite' | 'arriere'
  /** l'axe le long duquel le plafond descend : x (HEX, vers un bord), z (HEX 2, vers le fond) */
  axe: 'x' | 'z'
  /** la coordonnée locale (m) du pied du rampant — le mur où le plafond est le plus bas : 0 à gauche et au fond, la largeur du meuble à droite */
  depuis_m: number
  /** +1 : le plafond monte quand la coordonnée croît ; −1 : quand elle décroît */
  sens: 1 | -1
  /** la hauteur au mur (le point bas), m depuis le sol */
  bas_m: number
  /** le plafond plat (la hauteur du meuble + le jeu), m */
  haut_m: number
  /** la projection au sol du rampant : où il rejoint le plafond plat, m depuis le pied */
  projection_m: number
  /** la longueur le long de la pente, m */
  longueur_m: number
  angle_deg: number
  /** les champs du formulaire lus, tels quels */
  champs: Record<string, string>
}

/** la hauteur de genou minimale d'une pièce sous comble (m) : un côté libre sous un rampant ne s'étend pas au-delà (800 mm, comme le minimum du formulaire) */
export const GENOU_M = 0.8

/** les rampants que le formulaire publie (champs `ZH_*` / `ZH2_*`) ; vide pour un formulaire sans pente. `haut` = le plafond plat (m). */
export function lireRampants (valeurs: Record<string, string>, meuble: { w: number; d: number; haut: number }): { rampants: Rampant[]; remarques: string[] } {
  const rampants: Rampant[] = []
  const remarques: string[] = []
  const H = meuble.haut
  const type = String(valeurs.ZH_SLOPE_TYPE ?? '').toUpperCase()
  for (const [cote, suffixe] of [['gauche', 'L'], ['droite', 'R']] as const) {
    const voulu = type === 'BOTH' || (cote === 'gauche' ? type === 'LEFT' : type === 'RIGHT')
    if (!voulu) continue
    const bas = num(valeurs[`ZH_LOW_H_${suffixe}`])
    const run = num(valeurs[`ZH_RUN_${suffixe}`])
    if (bas === null || run === null) {
      remarques.push(`rampant ${cote} annoncé (ZH_SLOPE_TYPE = ${type}) mais ZH_LOW_H_${suffixe} / ZH_RUN_${suffixe} non publiés : pas dessiné`)
      continue
    }
    const basM = bas / 1000
    const runM = run / 1000
    const chute = H - basM
    if (chute <= 0 || runM <= chute) {
      remarques.push(`rampant ${cote} impossible : hauteur au mur ${bas} mm, longueur ${run} mm, hauteur du meuble ${Math.round(H * 1000)} mm : pas dessiné`)
      continue
    }
    const projection = Math.sqrt(runM * runM - chute * chute)
    rampants.push({
      cote,
      axe: 'x',
      depuis_m: cote === 'gauche' ? 0 : meuble.w,
      sens: cote === 'gauche' ? 1 : -1,
      bas_m: r3(basM),
      haut_m: r3(H),
      projection_m: r3(projection),
      longueur_m: r3(runM),
      angle_deg: Math.round((Math.asin(chute / runM) * 180) / Math.PI * 10) / 10,
      champs: { ZH_SLOPE_TYPE: type, [`ZH_LOW_H_${suffixe}`]: String(bas), [`ZH_RUN_${suffixe}`]: String(run), ZF_HEIGHT: String(valeurs.ZF_HEIGHT ?? '') }
    })
  }
  const bas2 = num(valeurs.ZH2_LOW_H)
  if (bas2 !== null) {
    const topD = num(valeurs.ZH2_TOP_D) ?? 0
    const basM = bas2 / 1000
    const chute = H - basM
    const projection = meuble.d - topD / 1000
    if (chute <= 0 || projection <= 0.01) {
      remarques.push(`rampant arrière impossible : hauteur au mur du fond ${bas2} mm, dessus plat ${topD} mm, profondeur ${Math.round(meuble.d * 1000)} mm : pas dessiné`)
    } else {
      rampants.push({
        cote: 'arriere',
        axe: 'z',
        depuis_m: 0,
        sens: 1,
        bas_m: r3(basM),
        haut_m: r3(H),
        projection_m: r3(projection),
        longueur_m: r3(Math.hypot(projection, chute)),
        angle_deg: Math.round((Math.atan2(chute, projection) * 180) / Math.PI * 10) / 10,
        champs: { ZH2_LOW_H: String(bas2), ZH2_TOP_D: String(topD), ZF_HEIGHT: String(valeurs.ZF_HEIGHT ?? ''), ZF_DEPTH: String(valeurs.ZF_DEPTH ?? '') }
      })
    }
  }
  return { rampants, remarques }
}

/**
 * La hauteur du plafond en un point de la pièce (repère local : x 0..w, z 0 au mur du fond), m : le plafond plat `haut`, abaissé par chaque
 * rampant — sous un rampant, la droite du point bas (au pied) au plafond plat (à la projection) ; au-delà du pied (côté libre), elle continue
 * de descendre. Une seule formule pour la pièce dessinée, les stations de caméra et la fiche.
 */
export function hauteurPlafond (rampants: Rampant[], x: number, z: number, haut: number): number {
  let h = haut
  for (const r of rampants) {
    const t = ((r.axe === 'x' ? x : z) - r.depuis_m) * r.sens
    const y = t >= r.projection_m ? r.haut_m : r.bas_m + ((r.haut_m - r.bas_m) * t) / r.projection_m
    if (y < h) h = y
  }
  return h
}

export type Installation ='BUILT_IN' | 'BUILT_IN_LEFT' | 'BUILT_IN_RIGHT' | 'FREE_STANDING' | 'inconnu'

export type ModeleScene = {
  installation: Installation
  meuble: { l_mm: number; h_mm: number; p_mm: number }
  /** Murs latéraux : distance de l'axe du meuble (m), null si libre ; d'où on le sait. */
  murs: {
    gauche: { present: boolean; distance_axe_m: number | null; source: 'cp' | 'formulaire' | 'aile' | null }
    droite: { present: boolean; distance_axe_m: number | null; source: 'cp' | 'formulaire' | 'aile' | null }
    fond: { present: true }
  }
  /** L'emprise réellement occupée et le plan de la pièce qui en découle (couche 1). */
  emprise: Emprise
  plan: { variante_u: VarianteU; variantes: Variantes; murs: MurPlan[]; retours: RetourPlan[]; habillage: Habillage[] }
  /** La pièce telle qu'elle est dessinée, en mètres (repère local : x 0..w, z 0..d). */
  piece: {
    /** Le meuble monte-t-il au plafond ? Sinon la pièce garde sa hauteur propre, avec du mur au-dessus. */
    sol_plafond: boolean
    largeur_m: number
    profondeur_m: number
    hauteur_m: number
    marge_libre_m: number
    jeu_plafond_m: number
    /** Bord gauche / droit et centre de la pièce, en x local. */
    x_gauche_m: number
    x_droite_m: number
    x_centre_m: number
    /** B4 : le point le plus bas du plafond dans la pièce (aux murs des rampants) ; = hauteur_m sans rampant */
    plafond_min_m: number
  }
  /** B4 : les rampants de la pièce (vide pour les cinq formes de production), et ce que le formulaire dit d'impossible */
  rampants: Rampant[]
  rampants_remarques: string[]
  fenetre: { cote: 'gauche' | 'droite' | 'face'; regle: string; mur?: string }
  /** Le côté où la pièce continue au-delà du meuble (bout libre ou retour de cloison) ; null : de mur à mur, U. */
  cote_ouvert: 'gauche' | 'droite' | null
  /** Clé lumière déduite de la fenêtre : azimut (négatif = gauche) et élévation, degrés. */
  lumiere: { keyAz: number; keyEl: number }
  fileurs_mm: { haut: number | null; bas: number | null; gauche: number | null; droite: number | null }
  colonnes: Colonne[]
  /** Les CP relevés sur la forme, pour la traçabilité. */
  cp: { murs: string[]; faces: Record<string, number> }
  cpWalls: CpWall[]
}

const num = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Construit le modèle depuis les boîtes (mm), l'encombrement (m) et les valeurs
 * du panneau. `scale` = mm → m. `ceilingGap` = jeu au-dessus du meuble (m).
 */
export function modeleScene (
  boxes: ShapeBox[],
  bounds: { w: number; h: number; d: number },
  valeurs: Record<string, string>,
  scale: number,
  ceilingGap = 0,
  variantes: Variantes = variantesPour(valeurs),
  /** B4 : les rampants déjà lus (la scène les passe à la pièce dessinée, qui n'a pas toujours les valeurs du formulaire sous la main) */
  rampantsForces?: Rampant[]
): ModeleScene {
  const varianteU = variantes.u
  const { w, h, d } = bounds
  const cpWalls = findCpWalls(boxes, scale)
  const xWalls = cpWalls.filter(k => k.axis === 'x')
  const mid = w / 2
  const leftAt = xWalls.filter(k => k.at <= mid).reduce<number | null>((m, k) => (m === null ? k.at : Math.min(m, k.at)), null)
  const rightAt = xWalls.filter(k => k.at > mid).reduce<number | null>((m, k) => (m === null ? k.at : Math.max(m, k.at)), null)

  // Type de pose : le formulaire d'abord, sinon déduit des murs.
  const brut = String(valeurs.INSTALLATION_TYPE ?? '').toUpperCase()
  let installation: Installation = 'inconnu'
  if (brut.includes('FREE')) installation = 'FREE_STANDING'
  else if (brut.includes('LEFT')) installation = 'BUILT_IN_LEFT'
  else if (brut.includes('RIGHT')) installation = 'BUILT_IN_RIGHT'
  else if (brut.includes('BUILT')) installation = 'BUILT_IN'
  else if (leftAt !== null && rightAt !== null) installation = 'BUILT_IN'
  else if (leftAt !== null) installation = 'BUILT_IN_LEFT'
  else if (rightAt !== null) installation = 'BUILT_IN_RIGHT'
  else installation = 'FREE_STANDING'

  // ── Couche 1 : l'emprise, puis le plan ──
  const emprise = empriseDe(boxes, { w, d }, cpWalls, scale)
  const { aile_gauche: ag, aile_droite: ad } = emprise
  // Le meuble Oaksome est TOUJOURS intégré au plafond (Dorian, 20/09) : le plafond affleure le meuble, sans exception.
  const solPlafond = true
  const wallH = h + ceilingGap
  // B4 : les rampants du formulaire (HEX / HEX 2) ; le plafond en tout point de la pièce en découle.
  const lus = rampantsForces === undefined ? lireRampants(valeurs, { w, d, haut: wallH }) : { rampants: rampantsForces, remarques: [] }
  const rampants = lus.rampants
  const plafond = (x: number, z: number) => hauteurPlafond(rampants, x, z, wallH)
  const rG = rampants.find(r => r.cote === 'gauche')
  const rD = rampants.find(r => r.cote === 'droite')
  /** jusqu'où la pièce peut continuer au-delà du pied d'un rampant en gardant un genou de GENOU_M (m) */
  const margeSousRampant = (r: Rampant) => Math.max(0, ((r.bas_m - GENOU_M) / (r.haut_m - r.bas_m)) * r.projection_m)
  // P4 : profondeur = emprise réelle + le recul d'une caméra à 35 mm (1,3 × L), borné.
  const recul = Math.min(4.5, Math.max(3.2, 1.3 * w)) // 3,2 m : un placard de 2,5 m de haut tient dans le cadre au 25 mm
  const roomD = emprise.p_m + recul
  const ouvertureU = emprise.forme === 'U' && varianteU === 'piece'
  const margeU = Math.max(1, 0.25 * w)

  // ── La pièce est une VRAIE pièce, et la place du meuble y dépend de son intégration (Dorian, 20/09) ──
  // Une pièce ne fait pas 1,5 m de large parce que le meuble fait 1,5 m. Largeur tirée par produit (3,4 à 4,6 m) ;
  // le meuble y est placé selon sa pose :
  // · encastré des deux côtés, largeur de pièce (≥ 2,8 m) → de mur à mur ;
  // · encastré des deux côtés, plus étroit → dans un angle de la pièce : un vrai mur d'un côté, un retour de cloison
  //   (jambage au nu des façades) de l'autre, et la pièce continue ; variante « niche » : deux jambages ;
  // · encastré d'un côté → dans l'angle, contre ce mur ; de l'autre côté une joue, puis le mur du fond continue ;
  // · posé libre → sur le mur du fond, décentré : un passage d'un côté (un bout libre a toujours une raison), le
  //   reste du mur de l'autre ;
  // · L → dans l'angle par construction ; U → l'alcôve (ou la pièce ouverte, variante).
  const LARGEURS_PIECE = [3.4, 3.8, 4.2, 4.6]
  const cpG = leftAt !== null
  const cpD = rightAt !== null
  const droit = !ag && !ad
  // B4 : sous un rampant, un meuble encastré des deux côtés est TOUJOURS de mur à mur (les murs touchent les joues — mot du lead) : ni niche, ni jambage.
  const murAMur = droit && cpG && cpD && (rampants.length > 0 || (w >= 2.8 && variantes.encastre !== 'niche'))
  const resteMin = droit && !cpG && !cpD ? 1.9 : 1.4
  const largeurPiece = Math.max(LARGEURS_PIECE[(variantes.graine >>> 11) % LARGEURS_PIECE.length], w + resteMin)
  const reste = largeurPiece - w
  let gapG = 0
  let gapD = 0
  let jambG = false
  let jambD = false
  if (emprise.forme === 'U' || murAMur) {
    // la pièce a la largeur du meuble
  } else if (!droit) {
    // L : l'autre extrémité du corps est soit encastrée (mur), soit libre (le mur du fond continue).
    if (ag && !cpD) gapD = reste
    if (ad && !cpG) gapG = reste
  } else if (cpG && cpD) {
    if (variantes.encastre === 'niche' && reste >= 1.8) {
      jambG = jambD = true
      gapG = variantes.cote_fenetre === 'gauche' ? 0.65 * reste : 0.35 * reste
      gapD = reste - gapG
    } else if (variantes.cote_fenetre === 'gauche') { jambG = true; gapG = reste } else { jambD = true; gapD = reste }
  } else if (cpG) gapD = reste
  else if (cpD) gapG = reste
  else {
    const cotePassage = Math.max(1.25, 0.4 * reste)
    if (variantes.cote_fenetre === 'gauche') { gapD = cotePassage; gapG = reste - cotePassage } else { gapG = cotePassage; gapD = reste - cotePassage }
  }
  // B4 : un côté libre sous un rampant — la pièce continue à la marge des couches 1-3, mais pas au-delà du genou (GENOU_M) : le plafond y
  // continue de descendre, et une pièce n'a pas de mur de 20 cm. Le mur de ce côté a la hauteur du plafond à son aplomb.
  if (rG) gapG = Math.min(gapG, margeSousRampant(rG))
  if (rD) gapD = Math.min(gapD, margeSousRampant(rD))
  const niche = jambG || jambD
  const marge = Math.max(gapG, gapD)

  const boutsLibres: Array<'gauche' | 'droite'> = []
  const mursPlan: MurPlan[] = []
  const retours: RetourPlan[] = []
  const bord = (c: 'gauche' | 'droite'): number => {
    const aile = c === 'gauche' ? ag : ad
    const cpAt = c === 'gauche' ? leftAt : rightAt
    const gap = c === 'gauche' ? gapG : gapD
    const jamb = c === 'gauche' ? jambG : jambD
    const normale: 1 | -1 = c === 'gauche' ? 1 : -1
    const x0 = c === 'gauche' ? 0 : w
    const arete = c === 'gauche' ? -gap : w + gap
    if (aile) {
      const bout = aile.longueur_m
      if (aile.mur_au_bout) {
        retours.push({
          id: `retour-${c}`,
          x0: c === 'gauche' ? 0 : w - aile.largeur_m - DEBORD_RETOUR,
          x1: c === 'gauche' ? aile.largeur_m + DEBORD_RETOUR : w,
          z0: bout,
          z1: bout + EPAISSEUR_RETOUR
        })
      }
      const finAile = bout + (aile.mur_au_bout ? EPAISSEUR_RETOUR : 0)
      if (ouvertureU) {
        mursPlan.push({ id: `dos-aile-${c}`, nature: 'dos', axe: 'x', at: x0, de: 0, a: finAile, normale })
        mursPlan.push({ id: `face-${c}`, nature: 'face', axe: 'z', at: finAile, de: c === 'gauche' ? -margeU : w, a: c === 'gauche' ? 0 : w + margeU, normale: 1 })
      } else {
        mursPlan.push({ id: `dos-aile-${c}`, nature: 'dos', axe: 'x', at: x0, de: 0, a: roomD, normale })
      }
      return x0
    }
    if (cpAt !== null && !jamb) {
      // Un vrai mur de la pièce, sur toute sa profondeur.
      mursPlan.push({ id: `cote-${c}`, nature: 'cote', axe: 'x', at: cpAt, de: 0, a: roomD, normale })
      return cpAt
    }
    if (cpAt !== null && jamb) {
      // Retour de cloison : le jambage s'arrête au nu des façades, le mur repart de face, et la pièce continue.
      const nu = emprise.p_corps_m
      mursPlan.push({ id: `jambage-${c}`, nature: 'cote', axe: 'x', at: cpAt, de: 0, a: nu, normale })
      mursPlan.push({ id: `face-${c}`, nature: 'face', axe: 'z', at: nu, de: Math.min(cpAt, arete), a: Math.max(cpAt, arete), normale: 1 })
      mursPlan.push({ id: `libre-${c}`, nature: 'libre', axe: 'x', at: arete, de: nu, a: roomD, normale })
      return arete
    }
    // Bout libre : une joue, puis le mur du fond continue jusqu'au mur de la pièce.
    boutsLibres.push(c)
    mursPlan.push({ id: `libre-${c}`, nature: 'libre', axe: 'x', at: arete, de: 0, a: roomD, normale })
    return arete
  }
  let left = bord('gauche')
  let right = bord('droite')
  const fond: MurPlan = { id: 'fond', nature: 'dos', axe: 'z', at: 0, de: jambG ? leftAt! : left, a: jambD ? rightAt! : right, normale: 1 }
  mursPlan.unshift(fond)

  const gPresent = !!ag || leftAt !== null
  const dPresent = !!ad || rightAt !== null
  const gauche = { present: gPresent, distance_axe_m: gPresent ? Math.abs((ag ? 0 : leftAt!) - mid) : null, source: gPresent ? (ag ? ('aile' as const) : ('cp' as const)) : null }
  const droite = { present: dPresent, distance_axe_m: dPresent ? Math.abs((ad ? w : rightAt!) - mid) : null, source: dPresent ? (ad ? ('aile' as const) : ('cp' as const)) : null }

  // P5 — la fenêtre : jamais derrière le meuble, toujours dans un mur de côté de la pièce. U : la lumière vient de la
  // caméra. L : le côté opposé à l'aile. Sinon : le côté où la pièce continue ; de mur à mur : tiré par produit.
  let coteFenetre: 'gauche' | 'droite' | 'face'
  let regle: string
  if (emprise.forme === 'U') { coteFenetre = 'face'; regle = 'P5 : U — aucun mur sans meuble en vue, la lumière vient de la caméra' }
  else if (emprise.forme === 'L') { coteFenetre = ag ? 'droite' : 'gauche'; regle = "P5 : L — le côté opposé à l'aile" }
  else if (murAMur) { coteFenetre = variantes.cote_fenetre; regle = 'P5 : de mur à mur — fenêtre dans un mur de côté, en avant du meuble ; côté tiré par produit' }
  else if (gapG === 0 || gapD === 0) { coteFenetre = gapD > 0 ? 'droite' : 'gauche'; regle = 'P5 : le côté où la pièce continue' }
  else { coteFenetre = variantes.cote_fenetre; regle = 'P5 : pièce ouverte des deux côtés — côté tiré par produit' }
  // B4 : la fenêtre est du côté OPPOSÉ au rampant (mot du lead) ; sous deux rampants aucun mur de côté n'est assez haut : la lumière vient de la caméra.
  if (rG && rD) { coteFenetre = 'face'; regle = 'B4 : rampants des deux côtés — aucun mur de côté assez haut pour une fenêtre, la lumière vient de la caméra' }
  else if (rG) { coteFenetre = 'droite'; regle = 'B4 : le côté opposé au rampant gauche' }
  else if (rD) { coteFenetre = 'gauche'; regle = 'B4 : le côté opposé au rampant droit' }
  const fenetre: ModeleScene['fenetre'] = { cote: coteFenetre, regle }
  if (coteFenetre !== 'face') {
    // « Fenêtre toute proche » : la baie commence 35 cm après le nu des façades ; sinon son centre est à ~1,7 m du fond.
    const proche = variantes.issue === 'fenetre' && boutsLibres.includes(coteFenetre)
    const centre = Math.min(proche ? emprise.p_corps_m + 0.35 + FENETRE.largeur_m / 2 : Math.max(emprise.p_corps_m + 1.1, 1.6), roomD - FENETRE.largeur_m / 2 - 0.2)
    const mur = mursPlan.find(m => m.id === `cote-${coteFenetre}` || m.id === `libre-${coteFenetre}`)
    // B4 : la baie tient sous le plafond à son aplomb (un rampant arrière abaisse le plafond près du fond)
    const plafondBaie = mur ? Math.min(plafond(mur.at, centre - FENETRE.largeur_m / 2), plafond(mur.at, centre + FENETRE.largeur_m / 2)) : wallH
    const hauteur = Math.min(FENETRE.hauteur_m, plafondBaie - FENETRE.allege_m - 0.1)
    if (hauteur >= 0.6 && mur) {
      mur.fenetre = { type: 'fenetre', centre_m: r3(centre), largeur_m: FENETRE.largeur_m, hauteur_m: r3(hauteur), allege_m: FENETRE.allege_m, tableau_m: FENETRE.tableau_m }
      fenetre.mur = mur.id
    }
  }
  // Le passage : dans le mur du fond, juste après un bout libre qui a 1,25 m de mur derrière lui — de préférence du
  // côté opposé à la fenêtre. Un meuble posé libre en a toujours un (un bout libre a toujours une raison).
  // B4 : jamais de passage sous un rampant (le plafond y est trop bas), ni là où le plafond du fond ne le laisse pas passer.
  const candidats = boutsLibres.filter(c => (c === 'gauche' ? gapG : gapD) >= 1.25 && !rampants.some(r => r.cote === c))
  const veutPassage = variantes.issue === 'passage' || (droit && !cpG && !cpD)
  if (veutPassage && candidats.length && wallH - PASSAGE.hauteur_m > 0.15) {
    const c = candidats.find(k => k !== coteFenetre) ?? candidats[0]
    const centre = c === 'gauche' ? -(0.25 + PASSAGE.largeur_m / 2) : w + 0.25 + PASSAGE.largeur_m / 2
    if (plafond(centre, 0) - PASSAGE.hauteur_m > 0.15) {
      fond.fenetre = { type: 'passage', centre_m: r3(centre), largeur_m: PASSAGE.largeur_m, hauteur_m: PASSAGE.hauteur_m, allege_m: 0, tableau_m: PASSAGE.tableau_m }
    }
  }
  // ── Habillage minimal : pans nus du mur du fond, grande niche vide ──
  const habillage: Habillage[] = []
  for (const c of ['gauche', 'droite'] as const) {
    const gap = c === 'gauche' ? gapG : gapD
    const jamb = c === 'gauche' ? jambG : jambD
    // Le pan visible à côté du meuble : le mur du fond, ou le mur de face d'un retour de cloison (au nu des façades).
    const zPan = jamb ? emprise.p_corps_m : 0
    let a = c === 'gauche' ? -gap : w
    let b = c === 'gauche' ? 0 : w + gap
    const pas = fond.fenetre?.type === 'passage' ? fond.fenetre : null
    if (pas && pas.centre_m > a && pas.centre_m < b) {
      // Le passage prend le début du pan : on n'habille que ce qui reste au-delà.
      if (c === 'gauche') b = pas.centre_m - pas.largeur_m / 2 - 0.2
      else a = pas.centre_m + pas.largeur_m / 2 + 0.2
    }
    if (b - a < 0.9 || wallH < 2) continue
    const xc = (a + b) / 2
    // B4 : pas de cadre sous un plafond de moins de 2 m (le rampant y passerait au travers) ; la console, basse, reste.
    if (plafond(xc, zPan) >= 2) habillage.push({ id: `cadre-${c}`, type: 'cadre', x0: xc - 0.3, x1: xc + 0.3, y0: 1.1, y1: 1.9, z0: zPan, z1: zPan + 0.03 })
    if (b - a >= 1.4) habillage.push({ id: `console-${c}`, type: 'console', x0: xc - 0.5, x1: xc + 0.5, y0: 0, y1: 0.45, z0: zPan, z1: zPan + 0.35 })
  }
  // Grande niche vide d'un ensemble mural : entre les portes basses et les portes hautes du groupe central (Z2x).
  {
    const centrales = boxes.filter(b => /^Z2\d_ART_ZONE_\d+$/.test(b.name ?? '') && b.w > 10 && b.h > 10)
    if (centrales.length) {
      const x0 = Math.min(...centrales.map(b => b.x)) * scale
      const x1 = Math.max(...centrales.map(b => b.x + b.w)) * scale
      const basses = centrales.filter(b => b.y + b.h / 2 < (h / scale) / 2)
      const hautes = centrales.filter(b => b.y + b.h / 2 >= (h / scale) / 2)
      const y0 = basses.length ? Math.max(...basses.map(b => b.y + b.h)) * scale : 0.08
      const y1 = hautes.length ? Math.min(...hautes.map(b => b.y)) * scale : h - 0.08
      const dedans = (b: ShapeBox) => { const cx = (b.x + b.w / 2) * scale; const cy = (b.y + b.h / 2) * scale; return cx > x0 + 0.05 && cx < x1 - 0.05 && cy > y0 + 0.08 && cy < y1 - 0.08 }
      // Une niche déjà étagée (tablettes = articles minces à l'intérieur) est respectée par Flora : on n'y met rien.
      const etagee = boxes.some(b => b.isArticle && b.h < 60 && dedans(b))
      if (x1 - x0 >= 0.9 && y1 - y0 >= 0.55 && !etagee) {
        const larg = Math.min(0.72 * (x1 - x0), ((y1 - y0) - 0.16) * (16 / 9))
        const haut = larg * (9 / 16)
        const xc = (x0 + x1) / 2
        habillage.push({ id: 'tele', type: 'tele', x0: xc - larg / 2, x1: xc + larg / 2, y0: y0 + 0.06, y1: y0 + 0.06 + haut, z0: 0.08, z1: 0.12 })
      }
    }
  }

  const lumiere = fenetre.cote === 'gauche' ? { keyAz: -34, keyEl: 44 } : fenetre.cote === 'droite' ? { keyAz: 34, keyEl: 44 } : { keyAz: -10, keyEl: 40 }
  // Le côté où la pièce continue : c'est de là qu'un photographe se place (stations).
  const coteOuvert: 'gauche' | 'droite' | null = gapG < 0.3 && gapD < 0.3 ? null : gapD >= gapG ? 'droite' : 'gauche'

  if (ouvertureU) { left = -margeU; right = w + margeU }
  const roomW = right - left
  const cx = (left + right) / 2

  // Colonnes : le niveau le moins profond de l'arbre dont les boîtes se
  // partagent la LARGEUR côte à côte (≥ 2, et elles couvrent ≥ 90 % du front).
  // Le premier niveau non racine ne suffit pas : sur la forme F il ne contient
  // qu'une zone (le front entier), les colonnes sont un cran plus bas.
  const niveaux = [...new Set(boxes.map(b => b.depth).filter(x => x > 0))].sort((a, b) => a - b)
  let zones: ShapeBox[] = []
  for (const niveau of niveaux) {
    const candidates = boxes.filter(b => b.depth === niveau && b.w > 10 && b.h > 10).sort((p, q) => p.x - q.x)
    if (candidates.length < 2) continue
    // Côte à côte : chaque boîte commence là où la précédente finit (à 5 mm près).
    let tuilees = true
    for (let i = 1; i < candidates.length; i++) {
      if (Math.abs(candidates[i].x - (candidates[i - 1].x + candidates[i - 1].w)) > 5) {
        tuilees = false
        break
      }
    }
    const couverture = candidates.reduce((s, b) => s + b.w, 0) / (w / scale)
    if (tuilees && couverture >= 0.9) {
      zones = candidates
      break
    }
  }
  if (!zones.length) {
    const first = niveaux[0] ?? 0
    zones = boxes.filter(b => b.depth === first && b.w > 10).sort((p, q) => p.x - q.x)
  }
  // Les VRAIES colonnes sont nommées par le configurateur : `ART_ZONE_FR_03` (placard droit), `ART_ZONE_ZL_02` /
  // `ZM` / `ZR` (ailes d'un L ou d'un U), `Z10_ART_ZONE_01` (ensemble mural). Mesuré le 20/09 : la détection par
  // « boîtes côte à côte » prenait le fileur gauche et le groupe entier pour deux colonnes — « ouvrir une colonne »
  // ouvrait donc tout le meuble, et les champs `ZF_COLnn_*` étaient lus sur la mauvaise colonne.
  const PREFIXE: Record<string, string> = { FR: 'ZF', ZL: 'ZL', ZM: 'ZM', ZR: 'ZR' }
  const nommees = boxes
    .map(b => ({ b, m: /^(?:(Z\d+)_)?ART_ZONE_(?:([A-Z]{2})_)?(\d+)$/.exec(b.name ?? '') }))
    .filter((x): x is { b: ShapeBox; m: RegExpExecArray } => x.m !== null && x.b.w > 10 && x.b.h > 10)
    .map(({ b, m }) => ({ b, groupe: m[1] ?? PREFIXE[m[2] ?? 'FR'] ?? 'ZF', numero: Number(m[3]) }))
  const ordinal = new Map<ShapeBox, number>()
  for (const g of new Set(nommees.map(n => n.groupe))) {
    nommees.filter(n => n.groupe === g).sort((p, q) => p.numero - q.numero).forEach((n, i) => ordinal.set(n.b, i + 1))
  }
  const groupeDe = new Map(nommees.map(n => [n.b, n.groupe] as const))
  if (nommees.length) {
    // De gauche à droite ; à abscisse égale (une aile en retour), du fond vers l'avant.
    zones = nommees.map(n => n.b).sort((p, q) => (p.x + p.w / 2) - (q.x + q.w / 2) || p.z - q.z)
  }
  const colonnes: Colonne[] = zones.map((z, i) => {
    const nn = String(ordinal.get(z) ?? i + 1).padStart(2, '0')
    const prefixe = groupeDe.get(z) ?? 'ZF'
    const champ = (suffixe: string) => {
      const v = valeurs[`${prefixe}_COL${nn}_${suffixe}`]
      return v === undefined || v === '' ? undefined : String(v)
    }
    return {
      index: z.index,
      nom: z.name,
      rang: i + 1,
      min: [z.x * scale - w / 2, z.y * scale, z.z * scale - d / 2],
      max: [(z.x + z.w) * scale - w / 2, (z.y + z.h) * scale, (z.z + z.d) * scale - d / 2],
      type: champ('Z1_TYPE'),
      sousArticle: champ('Z1_SUB_ART') ?? champ('Z2_SUB_ART'),
      porte: champ('DOOR_TYPE'),
      ouverture: champ('OPENING')
    }
  })

  // Les CP relevés sur les faces (traçabilité : d'où viennent les murs et les bandes).
  const faces: Record<string, number> = {}
  for (const b of boxes) {
    if (!b.sides) continue
    for (const f of Object.values(b.sides)) {
      if (!f?.cp) continue
      faces[f.cp] = (faces[f.cp] ?? 0) + 1
    }
  }

  return {
    installation,
    meuble: { l_mm: Math.round(w / scale), h_mm: Math.round(h / scale), p_mm: Math.round(d / scale) },
    murs: { gauche, droite, fond: { present: true } },
    emprise,
    plan: { variante_u: varianteU, variantes, murs: mursPlan.map(m => ({ ...m, at: r3(m.at), de: r3(m.de), a: r3(m.a) })), retours: retours.map(q => ({ ...q, x0: r3(q.x0), x1: r3(q.x1), z0: r3(q.z0), z1: r3(q.z1) })), habillage: habillage.map(q => ({ ...q, x0: r3(q.x0), x1: r3(q.x1), y0: r3(q.y0), y1: r3(q.y1), z0: r3(q.z0), z1: r3(q.z1) })) },
    piece: {
      sol_plafond: solPlafond,
      largeur_m: r3(roomW),
      profondeur_m: r3(roomD),
      hauteur_m: r3(wallH),
      marge_libre_m: r3(marge),
      jeu_plafond_m: ceilingGap,
      x_gauche_m: r3(left),
      x_droite_m: r3(right),
      x_centre_m: r3(cx),
      plafond_min_m: r3(Math.min(wallH, plafond(left, 0), plafond(right, 0), plafond(left, roomD), plafond(right, roomD)))
    },
    rampants,
    rampants_remarques: lus.remarques,
    fenetre,
    cote_ouvert: coteOuvert,
    lumiere,
    fileurs_mm: {
      haut: num(valeurs.FILLER_TOP),
      bas: num(valeurs.FILLER_BOTTOM),
      gauche: num(valeurs.FILLER_LEFT),
      droite: num(valeurs.FILLER_RIGHT)
    },
    colonnes,
    cp: { murs: cpWalls.map(k => k.key), faces },
    cpWalls
  }
}

const r3 = (x: number) => Math.round(x * 1000) / 1000
