/**
 * LA FAÇADE SPÉCIALE COUPÉE PAR LE CONTOUR DE LA PORTE (d5, 23/09/2026 — mot de Dorian 09:5x : « on doit gérer les portes en pente
 * maintenant avec le spécial KMS d'Otman », ligne du lead) — la partie pure, sans scène.
 *
 * Le problème, mesuré le 23/09 (`docs/releves/2026-09-23_portes-pente-special-kms/`) :
 *   - sur les modules coupés de HEX (`WACA_LY_D_Q4L`, `_H5L`, `_Q4R`, `_H5R`) et sur ceux de HEX 2 (`_SS`), une façade spéciale (Collection 2,
 *     `FR_08_LAM`… : le KMS multi-pièces `MP_1_FR_SHELL_FRnn_LAM`, six sous-pièces) est un MANQUE chez fox-cad — la position rend ses panneaux
 *     sans la porte (« pièce multiple à 6 sous-pièces — seule UNE sous-pièce est mesurée » ; depuis fox-cad `bbfff6b`, « façade à cadre
 *     MP_1_FR_SHELL_5PD10_LAM (6 sous-pièces) hors du cas mesuré ») ;
 *   - le designer d'Otman ne sait pas non plus : `@oak-some/special-kms` (`Door_FA_4a` = cinq boîtes CSG — dos, deux montants, deux traverses —
 *     un panneau intérieur, des arêtes) ne prend que `width` / `height` / `depth` : AUCUN contour ; et le graphe rp-engine des modules coupés
 *     ne porte qu'un front FR01 factice (`CP_SDO_FR01_LAM_HR_PM`, 500 × 590, sans matière, posé au-dessus du plafond) — le designer ne
 *     dessine la façade spéciale que sur le module PLEIN `WACA_LY_D`.
 *
 * Ce qui est posé, et dit à l'écran (« rendu, pas calculé ») :
 *   1. sur un module coupé, le designer d'Otman est monté sur le module PLEIN (`articlePleinOtman`) dans la même boîte : il y dessine la façade
 *      spéciale entière (le modèle `special-kms` de la collection), rectangulaire ;
 *   2. le CONTOUR de la porte vient de fox-cad : la même position recalculée avec la porte pleine (`Door_Name = FR_01_LAM`, la seule variable
 *      qui change la géométrie de la porte entre FR_01 et FR_08 — mesuré : `FR_1_THK` 18 ↔ 21,4 ne change ni le contour ni la pose) rend la
 *      porte `PD_1_FR_1111` avec son contour (4 sommets sur `_Q4L`, 5 sur `_H5L`) et ses charnières ;
 *   3. chaque arête du contour devient un plan de coupe vertical (`plansPorte`) dans le repère centré de la zone ; la façade du designer est
 *      DÉCOUPÉE par ces plans (`decouperGeometrie` : coupe par demi-espace, triangle par triangle, et le chant REFERMÉ par la section — jamais
 *      une porte creuse), ses arêtes aussi (`decouperSegments`). Un plan qui ne traverse pas la façade ne coupe rien (la porte pleine de
 *      HEX 2 est un rectangle : la façade reste entière).
 * Ce module ne devine aucune cote : les contours sont ceux de l'API, les plans en découlent, la géométrie coupée est celle du designer.
 */
import * as THREE from 'three'
import type { Piece, PositionCalculee, Vecteur3 } from './types'
import { estErreur } from './types.ts'
import { estPorte, matricePiece } from './geometrie.ts'
import { estFacadeAuxCotes, type CotesFacade, type ObjetScene } from './chemin-otman.ts'

/* ─── le module plein que le designer d'Otman sait dessiner ───────────────────────────────────────────────────────────────────────── */

/**
 * les modules coupés (HEX : quadrant et hexagone, gauche et droite ; HEX 2 : `_SS`, et ses corrections `_SS0`, `_SS0_C3`…) et le module PLEIN
 * dont ils dérivent — celui dont le graphe rp-engine porte la vraie façade (`CP_SDO_FRnn_…` par `Door_Name`), donc celui que le designer
 * d'Otman sait dessiner. Mesuré le 23/09 : `WACA_LY_D_Q4L` dans le graphe = un front `CP_SDO_FR01_LAM_HR_PM` de 500 × 590 (`anglprim`
 * `SIZEY 2750` pour un module de 2 340) ; `WACA_LY_D_SS` = « Unhandled case: HORDEFTYPE = A » (le designer plante).
 */
export const MODULES_COUPES_OTMAN: ReadonlyArray<{ motif: RegExp; plein: string }> = [
  { motif: /^WACA_LY_D_(Q4|H5)[LR]$/, plein: 'WACA_LY_D' },
  { motif: /^WACA_LY_D_SS\d*(_C\d+)?$/, plein: 'WACA_LY_D' },
]

/** le module plein à monter dans le designer d'Otman à la place d'un module coupé ; `null` quand l'article n'est pas un module coupé */
export function articlePleinOtman(article: string | null | undefined): string | null {
  if (!article) return null
  const m = MODULES_COUPES_OTMAN.find((r) => r.motif.test(article))
  return m ? m.plein : null
}

/* ─── la position sans porte : la façade spéciale multi-pièces ─────────────────────────────────────────────────────────────────────── */

export interface FacadeSansPorte {
  /** le KMS multi-pièces que le moteur refuse (`MP_1_FR_SHELL_FR08_LAM`, `MP_1_FR_SHELL_5PD10_LAM`) */
  kms: string
  /** le manque tel que le moteur l'écrit */
  manque: string
}

/**
 * les deux textes du moteur pour une façade à plusieurs sous-pièces qu'il ne produit pas — le KMS est le premier groupe :
 *   - « KMS MP_1_FR_SHELL_5PD10_LAM : pièce multiple à 6 sous-pièces (…) — seule UNE sous-pièce est mesurée » (`epaisseur.ts`) : le texte
 *     d'avant fox-cad `bbfff6b`, toujours celui d'une pièce multiple hors façade à cadre ;
 *   - depuis `bbfff6b` (23/09 12:15, la façade à cadre FR_08_LAM), la façade à cadre d'un module COUPÉ : « CP_SDO_FR08_LAM_HR_PM : façade à
 *     cadre MP_1_FR_SHELL_5PD10_LAM (6 sous-pièces) hors du cas mesuré (plate, en applique, un vantail aux jeux du design) — non mesuré »
 *     (`elements/index.ts`). Mesuré le 23/09 19:1x : seul le premier texte était connu ici — depuis 12:15, la façade d'Otman des colonnes
 *     coupées de HEX restait ENTIÈRE (rectangulaire, au-dessus du rampant) et le badge ne disait plus « coupée ».
 */
const MOTIFS_MANQUE_MULTIPLE: readonly RegExp[] = [/KMS\s+(\S+)\s*:\s*pièce multiple/i, /façade à cadre\s+(\S+)\s+\(\d+\s+sous-pièces?\)/i]

/**
 * une position dont la porte est une façade spéciale que le moteur n'a pas produite : aucune pièce porte, et un manque qui nomme le KMS
 * multi-pièces (`MOTIFS_MANQUE_MULTIPLE`, les deux textes du moteur) ; `null` sinon (porte rendue, autre manque, position en erreur)
 */
export function facadeSansPorte(r: PositionCalculee | undefined | null): FacadeSansPorte | null {
  if (!r || estErreur(r)) return null
  if (r.pieces.some(estPorte)) return null
  for (const m of r.manques) {
    for (const motif of MOTIFS_MANQUE_MULTIPLE) {
      const x = motif.exec(m)
      if (x) return { kms: x[1], manque: m }
    }
  }
  return null
}

/* ─── le lot de la porte pleine ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * la porte PLEINE d'Oaksome : le front par défaut du formulaire (`OV_FRONT_TYPE = FR_01_LAM`, Collection 1). Mesuré le 23/09 sur le lot HEX
 * (`_tmp/2026-09-23/portes-pente/hex-defaut.demande.json` contre `hex-fr08.demande.json`) : entre FR_01 et FR_08, le lot change `Door_Name`,
 * `FR_1_THK` (18 → 21,4), les matières / surfaces / profils de la façade et la poignée — et seul `Door_Name` change la géométrie de la porte
 * rendue par fox-cad (contour, pose, charnières identiques avec `FR_1_THK` 18 ou 21,4).
 */
export const PORTE_PLEINE_LOT: Readonly<Record<string, string>> = { Door_Name: 'FR_01_LAM' }

/** le même lot avec la porte pleine ; `null` quand le lot ne nomme pas sa porte (`Door_Name` absent : rien à substituer) */
export function lotPortePleine(lot: Record<string, string>): Record<string, string> | null {
  if (lot.Door_Name === undefined) return null
  if (lot.Door_Name === PORTE_PLEINE_LOT.Door_Name) return null
  return { ...lot, ...PORTE_PLEINE_LOT }
}

/* ─── la façade du designer à découper, dans la scène ──────────────────────────────────────────────────────────────────────────────── */

/**
 * visible jusqu'à la zone : `o` et chacun de ses ancêtres jusqu'au groupe de la zone compris — un ancêtre que NOUS avons caché
 * (`cacheesParNous` : la façade cachée en attendant le contour) compte pour visible, il n'est caché que le temps de l'attente
 */
export function visibleJusqua(o: THREE.Object3D, zone: THREE.Object3D, cacheesParNous?: ReadonlySet<THREE.Object3D>): boolean {
  for (let p: THREE.Object3D | null = o; p && p !== zone.parent; p = p.parent) if (!p.visible && !cacheesParNous?.has(p)) return false
  return true
}

/**
 * les RACINES de la façade spéciale du designer dans le groupe d'une zone (`DecoupeOtman`, à chaque image) : le parent de chaque maillage
 * CSG de `special-kms` (matériaux en tableau, groupes) aux cotes d'une façade des statistiques du designer, sous une porte gardée (visible),
 * mesuré sur sa géométrie d'ORIGINE quand nous l'avons déjà coupée (`sourceDe`). Mesuré le 23/09 19:2x (HEX Collection 2 FR_08, 4311 sur
 * fox-cad `3164169`) : la façade cachée pendant l'attente n'était plus retrouvée quand le contour arrivait (son parent invisible — caché
 * par nous) — l'état restait « en attente » et la façade cachée pour toujours dès que le designer la dessinait AVANT que le second calcul
 * réponde (1,2 s) ; d'où `cacheesParNous`.
 */
export function racinesFacadeSpeciale(
  zone: THREE.Object3D,
  facades: ReadonlyArray<CotesFacade>,
  sourceDe: (m: THREE.Mesh) => THREE.BufferGeometry,
  cacheesParNous?: ReadonlySet<THREE.Object3D>,
): THREE.Object3D[] {
  const racines: THREE.Object3D[] = []
  zone.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || !Array.isArray(m.material) || !m.geometry || m.geometry.groups.length === 0) return
    const parent = o.parent
    if (!parent || !visibleJusqua(parent, zone, cacheesParNous)) return
    const source = sourceDe(m)
    source.computeBoundingBox()
    const canard: ObjetScene = { isMesh: true, visible: true, children: [], geometry: source as unknown as ObjetScene['geometry'] }
    if (!estFacadeAuxCotes(canard, facades)) return
    if (!racines.includes(parent)) racines.push(parent)
  })
  return racines
}

/* ─── les plans de coupe, depuis le contour de la porte ────────────────────────────────────────────────────────────────────────────── */

/**
 * un plan de coupe dans le REPÈRE CENTRÉ DE LA ZONE — celui du designer d'Otman et de sa façade `special-kms` (mesuré le 23/09 : le groupe
 * de la porte du designer a les axes de la zone, X à droite, Y en haut, Z vers l'avant, et son origine au centre de la porte, elle-même
 * centrée dans la boîte) : X = x − largeur / 2, Y = z − hauteur / 2 du repère de fox-cad (x à droite, y vers l'arrière, z en haut, coin
 * avant-gauche-bas). Le plan est VERTICAL (il contient l'axe Z : la coupe traverse l'épaisseur de la porte) ; `normal · P + constant > 0` =
 * la matière ENLEVÉE.
 */
export interface PlanDecoupe {
  normal: [number, number, number]
  constant: number
  /** l'arête du contour qui fait ce plan, dans le repère centré (pour l'écran et les tests) */
  arete: [[number, number], [number, number]]
}

/** le contour fini d'une porte dans son plan local x-y : le sien, sinon le rectangle de ses cotes (largeur × profondeur) */
export function contourPorte(p: Piece): Vecteur3[] {
  if (p.contour !== undefined && p.contour.length >= 3) return p.contour
  const { largeur: w, profondeur: d } = p.cotes
  return [
    { x: 0, y: 0, z: 0 },
    { x: w, y: 0, z: 0 },
    { x: w, y: d, z: 0 },
    { x: 0, y: d, z: 0 },
  ]
}

/** le contour d'une porte dans le repère centré de la zone (X, Y), par la pose de la pièce ; le troisième axe est oublié */
export function contourDansLaZone(p: Piece, boite: { w: number; h: number }): [number, number][] {
  const m = matricePiece(p)
  return contourPorte(p).map((s) => {
    const v = new THREE.Vector3(s.x, s.y, s.z).applyMatrix4(m)
    return [v.x - boite.w / 2, v.z - boite.h / 2]
  })
}

/** une arête EN PENTE : ni horizontale ni verticale dans le repère de la zone (plus d'un millimètre dans les deux directions) */
export const areteEnPente = (a: [number, number], b: [number, number]): boolean => Math.abs(b[0] - a[0]) > 1 && Math.abs(b[1] - a[1]) > 1

/**
 * les plans de coupe d'une porte : un par arête EN PENTE de son contour, la normale vers l'extérieur du polygone (loin de son centre). Les
 * arêtes parallèles aux axes (le rectangle de la porte) ne coupent JAMAIS : ce rectangle est celui du designer — mesuré le 23/09, sa porte
 * fait 586 ou 587 mm selon le chargement (son balayage asynchrone des voisins décide d'un demi-millimètre de jeu), et un plan à 0,5 mm du
 * bord comptait une façade pleine « coupée ». Une porte rectangulaire ne donne donc aucun plan ; une porte coupée par le rampant en donne un
 * (le plat de 83 mm en haut de `_H5L` est horizontal : le haut du rectangle). Le polygone est supposé convexe (les contours d'imos sous pente
 * le sont : 4 ou 5 sommets) — dit, pas vérifié.
 */
export function plansPorte(p: Piece, boite: { w: number; h: number }): PlanDecoupe[] {
  const pts = contourDansLaZone(p, boite)
  if (pts.length < 3) return []
  const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length
  const cy = pts.reduce((s, q) => s + q[1], 0) / pts.length
  const plans: PlanDecoupe[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    if (!areteEnPente(a, b)) continue
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const l = Math.hypot(dx, dy)
    if (l < 1e-6) continue
    let nx = -dy / l
    let ny = dx / l
    // la normale regarde loin du centre : ce côté-là est enlevé
    if (nx * (cx - a[0]) + ny * (cy - a[1]) > 0) {
      nx = -nx
      ny = -ny
    }
    plans.push({ normal: [nx, ny, 0], constant: -(nx * a[0] + ny * a[1]), arete: [[a[0], a[1]], [b[0], b[1]]] })
  }
  return plans
}

/** la distance signée d'un point au plan : > 0 = enlevé */
export const distanceAuPlan = (plan: PlanDecoupe, x: number, y: number, z: number): number => plan.normal[0] * x + plan.normal[1] * y + plan.normal[2] * z + plan.constant

/** un plan coupe-t-il une boîte (min / max dans le même repère) : des coins des deux côtés, à `tolerance` près (mm) */
export function planCoupeBoite(plan: PlanDecoupe, boite: { min: [number, number, number]; max: [number, number, number] }, tolerance = 0.5): boolean {
  let dedans = false
  let dehors = false
  for (const x of [boite.min[0], boite.max[0]])
    for (const y of [boite.min[1], boite.max[1]])
      for (const z of [boite.min[2], boite.max[2]]) {
        const d = distanceAuPlan(plan, x, y, z)
        if (d > tolerance) dehors = true
        else if (d < -tolerance) dedans = true
      }
  return dedans && dehors
}

/** le plan de three, dans le repère où la géométrie est décrite (`matrice` = la pose de l'objet dans le repère centré de la zone, ou rien) */
export function planThree(plan: PlanDecoupe, matrice?: THREE.Matrix4): THREE.Plane {
  const p = new THREE.Plane(new THREE.Vector3(plan.normal[0], plan.normal[1], plan.normal[2]), plan.constant)
  if (matrice) p.applyMatrix4(matrice.clone().invert())
  return p
}

/* ─── la coupe d'une géométrie par un demi-espace, le chant refermé ───────────────────────────────────────────────────────────────── */

export interface ResultatDecoupe {
  geometrie: THREE.BufferGeometry
  /** au moins un triangle a été coupé ou enlevé */
  coupee: boolean
  /** combien de plans ont effectivement coupé (un plan qui ne traverse pas la géométrie ne compte pas) */
  coupes: number
  /** les boucles de la section (le chant), dans le repère de la géométrie — pour les arêtes */
  boucles: THREE.Vector3[][]
  /** une boucle de section n'a pas pu être fermée proprement : le chant est approché (refermé de force) */
  chantApproche: boolean
  /** l'index de matériau donné au chant */
  materiauChant: number
}

/**
 * la tolérance de la coupe, en mm : un sommet à moins de 0,05 mm du plan est SUR le plan (gardé), un triangle dont aucun sommet ne dépasse
 * n'est pas coupé — un plan qui affleure une face (l'arête droite du contour de fox-cad sur le bord droit de la façade du designer, au bruit
 * flottant près) ne « coupe » donc rien, ne compte pas, n'ajoute aucun triangle dégénéré (mesuré le 23/09 : 3 plans comptés pour 1 réel)
 */
const EPS = 0.05

type Sommet = { p: THREE.Vector3; n: THREE.Vector3; uv: THREE.Vector2 }

const lerpSommet = (a: Sommet, b: Sommet, t: number): Sommet => ({
  p: a.p.clone().lerp(b.p, t),
  n: a.n.clone().lerp(b.n, t).normalize(),
  uv: a.uv.clone().lerp(b.uv, t),
})

/** la clé d'un point, arrondi au centième de mm — pour chaîner les segments de la section */
const cle = (v: THREE.Vector3): string => `${Math.round(v.x * 100)}|${Math.round(v.y * 100)}|${Math.round(v.z * 100)}`

/** chaîne des segments en boucles fermées ; une chaîne qui ne se referme pas est refermée de force et signalée */
export function chainerBoucles(segments: [THREE.Vector3, THREE.Vector3][]): { boucles: THREE.Vector3[][]; approche: boolean } {
  const restants = segments.filter(([a, b]) => a.distanceTo(b) > 1e-3)
  const parCle = new Map<string, number[]>()
  restants.forEach(([a, b], i) => {
    for (const k of [cle(a), cle(b)]) {
      const l = parCle.get(k)
      if (l) l.push(i)
      else parCle.set(k, [i])
    }
  })
  const utilise = new Array<boolean>(restants.length).fill(false)
  const boucles: THREE.Vector3[][] = []
  let approche = false
  for (let depart = 0; depart < restants.length; depart++) {
    if (utilise[depart]) continue
    utilise[depart] = true
    const chaine: THREE.Vector3[] = [restants[depart][0], restants[depart][1]]
    let courant = restants[depart][1]
    const debut = cle(chaine[0])
    for (let garde = 0; garde < restants.length; garde++) {
      const k = cle(courant)
      if (k === debut) break
      const candidats = (parCle.get(k) ?? []).filter((i) => !utilise[i])
      if (candidats.length === 0) break
      const i = candidats[0]
      utilise[i] = true
      const [a, b] = restants[i]
      const suivant = cle(a) === k ? b : a
      chaine.push(suivant)
      courant = suivant
    }
    // fermée : le dernier point revient au premier
    if (cle(chaine[chaine.length - 1]) === debut) chaine.pop()
    else approche = true
    if (chaine.length >= 3) boucles.push(chaine)
  }
  return { boucles, approche }
}

/** la base (e1, e2) du plan telle que e1 × e2 = normale ; e2 suit l'axe Z quand il le peut (le chant d'une porte est vertical) */
function baseDuPlan(normale: THREE.Vector3): { e1: THREE.Vector3; e2: THREE.Vector3 } {
  const n = normale.clone().normalize()
  let e2 = new THREE.Vector3(0, 0, 1)
  e2.sub(n.clone().multiplyScalar(e2.dot(n)))
  if (e2.lengthSq() < 1e-6) e2 = new THREE.Vector3(1, 0, 0).sub(n.clone().multiplyScalar(n.x))
  e2.normalize()
  const e1 = e2.clone().cross(n).normalize()
  return { e1, e2 }
}

/**
 * coupe une géométrie par UN plan (`plan.distanceToPoint > 0` = enlevé) : chaque triangle est gardé, enlevé, ou coupé (Sutherland–Hodgman
 * contre le demi-espace, positions / normales / UV interpolées) ; les groupes de matériaux sont conservés ; la section est chaînée en
 * boucles, triangulées (`ShapeUtils`) et ajoutées comme un groupe de plus — le chant — avec le matériau du triangle coupé le plus en avant
 * (le cadre d'une porte à cadre, la face d'une porte pleine), sinon `materiauChant`. La géométrie source n'est pas modifiée.
 */
export function decouperParUnPlan(source: THREE.BufferGeometry, plan: THREE.Plane, materiauChant = 0): ResultatDecoupe {
  const g = source.index ? source.toNonIndexed() : source
  const position = g.getAttribute('position')
  if (!position) return { geometrie: source, coupee: false, coupes: 0, boucles: [], chantApproche: false, materiauChant }
  const normal = g.getAttribute('normal')
  const uv = g.getAttribute('uv')
  const groupes = g.groups.length > 0 ? g.groups : [{ start: 0, count: position.count, materialIndex: 0 }]
  const outP: number[] = []
  const outN: number[] = []
  const outUv: number[] = []
  const outGroupes: { start: number; count: number; materialIndex: number }[] = []
  const segments: [THREE.Vector3, THREE.Vector3][] = []
  let coupee = false
  let zChant = -Infinity
  let nzChant = -Infinity
  let matChant: number | null = null

  const lire = (i: number): Sommet => ({
    p: new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)),
    n: normal ? new THREE.Vector3(normal.getX(i), normal.getY(i), normal.getZ(i)) : new THREE.Vector3(0, 0, 1),
    uv: uv ? new THREE.Vector2(uv.getX(i), uv.getY(i)) : new THREE.Vector2(),
  })
  const pousser = (s: Sommet) => {
    outP.push(s.p.x, s.p.y, s.p.z)
    outN.push(s.n.x, s.n.y, s.n.z)
    outUv.push(s.uv.x, s.uv.y)
  }

  for (const grp of groupes) {
    const debut = outP.length / 3
    const fin = Math.min(grp.start + grp.count, position.count)
    for (let t = grp.start; t + 2 < fin; t += 3) {
      const v = [lire(t), lire(t + 1), lire(t + 2)]
      const d = v.map((s) => plan.distanceToPoint(s.p))
      if (d.every((x) => x <= EPS)) {
        v.forEach(pousser)
        continue
      }
      coupee = true
      if (d.every((x) => x >= -EPS)) continue
      // coupé : le polygone gardé (3 ou 4 sommets) et le segment de section
      const garde: Sommet[] = []
      const section: THREE.Vector3[] = []
      for (let i = 0; i < 3; i++) {
        const a = v[i]
        const b = v[(i + 1) % 3]
        const da = d[i]
        const db = d[(i + 1) % 3]
        if (da <= EPS) garde.push(a)
        if (da <= EPS !== db <= EPS) {
          const s = lerpSommet(a, b, da / (da - db))
          garde.push(s)
          section.push(s.p)
        }
      }
      for (let i = 1; i + 1 < garde.length; i++) {
        pousser(garde[0])
        pousser(garde[i])
        pousser(garde[i + 1])
      }
      if (section.length === 2) segments.push([section[0], section[1]])
      // le triangle coupé « le plus en avant » : la normale la plus tournée vers +Z (la face avant : le cadre d'une porte à cadre), puis
      // le z le plus grand — les faces de côté d'une boîte atteignent aussi z max, leur normale ne regarde pas l'avant
      const nzTri = Math.round(((v[0].n.z + v[1].n.z + v[2].n.z) / 3) * 1000) / 1000
      const zMax = Math.max(v[0].p.z, v[1].p.z, v[2].p.z)
      if (nzTri > nzChant || (nzTri === nzChant && zMax > zChant)) {
        nzChant = nzTri
        zChant = zMax
        matChant = grp.materialIndex ?? 0
      }
    }
    const count = outP.length / 3 - debut
    if (count > 0) outGroupes.push({ start: debut, count, materialIndex: grp.materialIndex ?? 0 })
  }

  const { boucles, approche } = chainerBoucles(segments)
  const indexChant = matChant ?? materiauChant
  if (boucles.length > 0) {
    const debut = outP.length / 3
    const { e1, e2 } = baseDuPlan(plan.normal)
    const nz = plan.normal.clone().normalize()
    for (const boucle of boucles) {
      let pts2 = boucle.map((p) => new THREE.Vector2(p.dot(e1), p.dot(e2)))
      let pts3 = boucle
      if (THREE.ShapeUtils.area(pts2) < 0) {
        pts2 = pts2.slice().reverse()
        pts3 = boucle.slice().reverse()
      }
      const tris = THREE.ShapeUtils.triangulateShape(pts2, [])
      for (const [a, b, c] of tris) {
        for (const i of [a, b, c]) {
          const p = pts3[i]
          outP.push(p.x, p.y, p.z)
          outN.push(nz.x, nz.y, nz.z)
          // des UV provisoires (le balayage des textures à l'échelle réelle les réécrit par la normale dominante)
          outUv.push(pts2[i].x / 1000, pts2[i].y / 1000)
        }
      }
    }
    const count = outP.length / 3 - debut
    if (count > 0) outGroupes.push({ start: debut, count, materialIndex: indexChant })
  }

  const geometrie = new THREE.BufferGeometry()
  geometrie.setAttribute('position', new THREE.Float32BufferAttribute(outP, 3))
  geometrie.setAttribute('normal', new THREE.Float32BufferAttribute(outN, 3))
  geometrie.setAttribute('uv', new THREE.Float32BufferAttribute(outUv, 2))
  for (const grp of outGroupes) geometrie.addGroup(grp.start, grp.count, grp.materialIndex)
  geometrie.computeBoundingBox()
  geometrie.computeBoundingSphere()
  return { geometrie, coupee, coupes: coupee ? 1 : 0, boucles, chantApproche: approche, materiauChant: indexChant }
}

/** coupe par plusieurs plans, l'un après l'autre ; les boucles de toutes les coupes sont rendues ensemble */
export function decouperGeometrie(source: THREE.BufferGeometry, plans: THREE.Plane[], materiauChant = 0): ResultatDecoupe {
  let courante = source
  let coupee = false
  let coupes = 0
  let approche = false
  const boucles: THREE.Vector3[][] = []
  let mat = materiauChant
  for (const plan of plans) {
    const r = decouperParUnPlan(courante, plan, mat)
    if (!r.coupee) continue
    if (courante !== source) courante.dispose()
    courante = r.geometrie
    coupee = true
    coupes++
    approche = approche || r.chantApproche
    boucles.push(...r.boucles)
    mat = r.materiauChant
  }
  return { geometrie: courante, coupee, coupes, boucles, chantApproche: approche, materiauChant: mat }
}

/* ─── les arêtes : segments coupés, la section ajoutée ─────────────────────────────────────────────────────────────────────────────── */

/**
 * coupe des segments (x0 y0 z0 x1 y1 z1, à plat) par les plans, et ajoute le tour de chaque boucle de section ; rend les segments à plat
 * et si quelque chose a changé
 */
export function decouperSegments(positions: ArrayLike<number>, plans: THREE.Plane[], boucles: THREE.Vector3[][]): { positions: number[]; coupee: boolean } {
  const out: number[] = []
  let coupee = false
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  for (let i = 0; i + 5 < positions.length; i += 6) {
    a.set(positions[i], positions[i + 1], positions[i + 2])
    b.set(positions[i + 3], positions[i + 4], positions[i + 5])
    let garde = true
    for (const plan of plans) {
      const da = plan.distanceToPoint(a)
      const db = plan.distanceToPoint(b)
      if (da <= EPS && db <= EPS) continue
      coupee = true
      if (da >= -EPS && db >= -EPS) {
        garde = false
        break
      }
      const t = da / (da - db)
      const m = a.clone().lerp(b, t)
      if (da > EPS) a.copy(m)
      else b.copy(m)
    }
    if (garde) out.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }
  for (const boucle of boucles) {
    for (let i = 0; i < boucle.length; i++) {
      const p = boucle[i]
      const q = boucle[(i + 1) % boucle.length]
      out.push(p.x, p.y, p.z, q.x, q.y, q.z)
    }
    if (boucle.length > 0) coupee = true
  }
  return { positions: out, coupee }
}

/** les arêtes de bord d'une géométrie non indexée (une arête portée par un seul triangle) : 0 sur une surface fermée — pour la preuve */
export function aretesDeBord(g: THREE.BufferGeometry, precision = 2): number {
  const position = g.getAttribute('position')
  if (!position) return 0
  const k = (i: number) => `${position.getX(i).toFixed(precision)}|${position.getY(i).toFixed(precision)}|${position.getZ(i).toFixed(precision)}`
  const compte = new Map<string, number>()
  for (let t = 0; t + 2 < position.count; t += 3) {
    const ks = [k(t), k(t + 1), k(t + 2)]
    for (let i = 0; i < 3; i++) {
      const a = ks[i]
      const b = ks[(i + 1) % 3]
      const e = a < b ? `${a}—${b}` : `${b}—${a}`
      compte.set(e, (compte.get(e) ?? 0) + 1)
    }
  }
  let bord = 0
  for (const n of compte.values()) if (n === 1) bord++
  return bord
}

/** le volume signé d'une géométrie fermée non indexée (théorème de la divergence) — pour la preuve */
export function volume(g: THREE.BufferGeometry): number {
  const position = g.getAttribute('position')
  if (!position) return 0
  let v = 0
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let t = 0; t + 2 < position.count; t += 3) {
    a.set(position.getX(t), position.getY(t), position.getZ(t))
    b.set(position.getX(t + 1), position.getY(t + 1), position.getZ(t + 1))
    c.set(position.getX(t + 2), position.getY(t + 2), position.getZ(t + 2))
    v += a.dot(b.clone().cross(c)) / 6
  }
  return v
}
