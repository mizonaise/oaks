import * as THREE from 'three'
import PLAN from './prises-de-vue.json'
import type { Mesures } from './mesures'
import { hauteurPlafond, type ModeleScene, type Rampant } from './scene'

/**
 * Stations de caméra du plan de prises de vue (Dorian, 2026-09-15).
 *
 * Une prise du plan (`prises-de-vue.json`) décrit une INTENTION de photographe
 * — focale, hauteur, azimut, inclinaison, décentrement, cible. Ce module la
 * résout en une caméra concrète à partir du meuble et de la pièce, teste que la
 * caméra est bien DANS la pièce, applique la politique de dégradation déclarée
 * quand elle n'y est pas, et renvoie la caméra EFFECTIVE — celle que la fiche
 * publie. Jamais l'intention : une image dont le cadrage déclaré n'est pas le
 * cadrage réel est pire qu'une image sans cadrage.
 *
 * Repères : le meuble occupe x∈[0,w], y∈[0,h], z∈[0,d] en mètres « locaux »
 * (le groupe est décalé de (-w/2, 0, -d/2) dans le monde). Ici on travaille en
 * coordonnées MONDE : centre du meuble en (0, h/2, 0), façade en z = +d/2, la
 * pièce s'étend vers +z. Azimut négatif = caméra à gauche (x < 0).
 */

export type Cadrage = 'meuble' | 'cotes' | 'detail' | 'zone' | 'piece' | 'seuil' | 'plan' | 'station'
export type Lumiere = 'cle' | 'douce' | 'rasante-gauche' | 'rasante-droite'
export type Portes = 'fermees' | 'ouvertes' | 'retirees' | 'une-ouverte' | 'une-entrouverte'
export type Politique = 'nominale' | 'omettre' | 'partiel' | 'degrade'
export type ModeImage = 'client' | 'schema'
export type Cotes = 'aucune' | 'globales' | 'detaillees'

export type PriseSpec = {
  id: string
  serie: 'heros' | 'details' | 'interieurs' | 'ambiances'
  titre: string
  cible: string
  cadrage: Cadrage
  focale_mm: number
  distance_m?: number
  /** Marge de cadrage propre à la prise (1,15 par défaut) : 1,25 met un meuble large à ~80 % du carré. */
  marge?: number
  /** Format de l'image de cette prise ; le plan reste en 1:1 par défaut. Le script de capture règle la fenêtre. */
  format?: '1:1' | '16:9' | '4:5'
  /** Stations (couche 2, 20/09) : part de la largeur d'image que le meuble doit occuper (0,55 en 16:9, 0,80 en carré). */
  part_largeur?: number
  /** Stations : hauteur de caméra sur un L ou un U (1,30 m ; 1,15 m de face sur un corps droit). */
  hauteur_angle?: number
  /** Stations : focale sur un U, pris dans l'axe depuis l'ouverture (28 mm). */
  focale_u_mm?: number
  hauteur: number | 'mi-hauteur' | 'oeil' | 'cible'
  azimut_deg: number
  inclinaison_deg: number
  decentrement: boolean
  lumiere: Lumiere
  portes: Portes
  cotes: Record<ModeImage, Cotes>
  modes: ModeImage[]
  conditions: string[]
  politique: Politique
  prouve: string[]
}

export type Colonne = {
  /** Index du nœud de zone dans l'arbre (`Box.index`). */
  index: string
  nom?: string
  /** Rang de gauche à droite, 1-based — celui des champs `ZF_COLnn_*`. */
  rang: number
  /** Boîte en mètres MONDE. */
  min: [number, number, number]
  max: [number, number, number]
  /** `ZF_COLnn_Z1_TYPE` (AS / DR / HC / OP_DR / X …), si connu. */
  type?: string
  sousArticle?: string
  porte?: string
  ouverture?: string
}

export type Contexte = {
  /** Encombrement du meuble (m). */
  bounds: { w: number; h: number; d: number }
  /** Distance axe → mur (m), null si le côté est libre. */
  walls: { left: number | null; right: number | null }
  /** Pièce telle que `RoomWalls` la construit : profondeur devant la façade, hauteur sous plafond. */
  room: { depth: number; height: number }
  /** Hauteur d'œil du réglage client, déjà plafonnée. */
  eye: number
  aspect: number
  mesures: Mesures | null
  colonnes: Colonne[]
  /** Des chaînes de cotes sont dessinées autour du meuble : le cadrage leur réserve la place. */
  cotesVisibles?: boolean
  /** Le modèle de scène (emprise réelle, plan de pièce, rampants) : les stations se calent dessus, pas sur la boîte englobante. */
  scene?: Pick<ModeleScene, 'emprise' | 'plan' | 'piece' | 'fenetre' | 'cote_ouvert'> & { rampants?: Rampant[] }
}

/** B4 : le plafond à l'aplomb d'un point MONDE (x, z) — les rampants du modèle de scène, sinon la hauteur sous plafond. */
function plafondEn (ctx: Contexte, xMonde: number, zMonde: number): number {
  const r = ctx.scene?.rampants
  if (!r || !r.length) return ctx.room.height
  return hauteurPlafond(r, xMonde + ctx.bounds.w / 2, zMonde + ctx.bounds.d / 2, ctx.room.height)
}

export type CameraEffective = {
  faisable: true
  position: [number, number, number]
  cible: [number, number, number]
  up: [number, number, number]
  fov_v_deg: number
  focale_eq_mm: number
  distance_m: number
  azimut_deg: number
  polaire_deg: number
  inclinaison_deg: number
  hauteur_m: number
  /** Décentrement du cadre, en fraction de la largeur / hauteur d'image (0 = aucun). */
  decentrement: [number, number]
  cadrage: 'entier' | 'partiel'
  politique: Politique
  /** Ce que la caméra vise, en clair (« poignée de la colonne 3 »). */
  sujet: string
  /** Colonne ouverte pour cette prise, s'il y en a une. */
  colonne_ouverte: number | null
  notes: string[]
}

export type PriseInfaisable = {
  faisable: false
  raison: string
  politique: Politique
}

export type Resolution = CameraEffective | PriseInfaisable

/** Marge de sécurité caméra → mur / plafond / façade (m). */
const MARGE_MUR = 0.4
const MARGE_FACADE = 0.12
const MARGE_PLAFOND = 0.1
/** Champ maximal admis en politique « partiel » (≈ 24 mm en équivalent 24×36). */
const FOV_MAX_PARTIEL = 53
/** Cotes d'architecte (`banc/Dimensions.tsx`) : première ligne à 120 mm, rangées de 160 mm. */
const COTES_GAP = 0.12
const COTES_ROW = 0.16
const COTES_LABEL = 0.14

const deg = THREE.MathUtils.degToRad
const rad2deg = THREE.MathUtils.radToDeg

export function listePrises (): PriseSpec[] {
  return (PLAN as { prises: PriseSpec[] }).prises
}

export function prise (id: string): PriseSpec | null {
  return listePrises().find(p => p.id === id) ?? null
}

/** Focale équivalente 24×36 → fov vertical (deg), pour un cadre carré (côté 24 mm). */
export function fovDeFocale (focaleMm: number): number {
  return rad2deg(2 * Math.atan(12 / focaleMm))
}

export function focaleDeFov (fovDeg: number): number {
  return 12 / Math.tan(deg(fovDeg) / 2)
}

/** Position de la clé lumière pour une intention de lumière : azimut / élévation (deg) et intensité. */
export function lumierePour (l: Lumiere): { keyAz: number; keyEl: number; keyIntensity: number } {
  switch (l) {
    case 'douce':
      return { keyAz: -34, keyEl: 44, keyIntensity: 1.2 }
    case 'rasante-gauche':
      return { keyAz: -70, keyEl: 20, keyIntensity: 2.2 }
    case 'rasante-droite':
      return { keyAz: 70, keyEl: 20, keyIntensity: 2.2 }
    default:
      return { keyAz: -34, keyEl: 44, keyIntensity: 1.8 }
  }
}

/** Les conditions d'une prise sont-elles remplies par la configuration ? */
export function conditionsRemplies (
  spec: PriseSpec,
  ctx: Contexte
): { ok: true } | { ok: false; raison: string } {
  const encastreG = ctx.walls.left !== null
  const encastreD = ctx.walls.right !== null
  for (const c of spec.conditions) {
    if (c === 'encastre' && !(encastreG && encastreD)) {
      return { ok: false, raison: 'meuble non encastré des deux côtés' }
    }
    if (c === 'encastre-un-cote' && !(encastreG || encastreD)) {
      return { ok: false, raison: 'aucun mur déclaré' }
    }
    if (c === 'flanc-libre' && encastreG && encastreD) {
      return { ok: false, raison: 'aucun flanc libre' }
    }
    if (c === 'poignee' && !(ctx.mesures?.poignees.length)) {
      return { ok: false, raison: 'aucune poignée trouvée dans la géométrie' }
    }
    if (c === 'deux-facades' && (ctx.mesures?.facades.length ?? 0) < 2) {
      return { ok: false, raison: 'moins de deux façades' }
    }
    if (c === 'porte' && !ctx.colonnes.some(k => (k.porte ?? '') !== '')) {
      return { ok: false, raison: 'aucune colonne à porte' }
    }
    if (c === 'porte-entrouverte') {
      return { ok: false, raison: "angle d'ouverture non réglable par le renderer d'article (90° seulement)" }
    }
    if (c.startsWith('fonction:')) {
      const code = c.slice('fonction:'.length)
      if (!colonnePourFonction(ctx.colonnes, code)) {
        return { ok: false, raison: `aucune colonne de fonction ${code} dans la configuration` }
      }
    }
  }
  return { ok: true }
}

/** Première colonne dont le type ou le sous-article porte la fonction demandée. */
export function colonnePourFonction (colonnes: Colonne[], code: string): Colonne | null {
  const alias: Record<string, string[]> = {
    HC: ['HC', 'IHC'],
    AS: ['AS', 'IAS'],
    DR: ['DR', 'IDR'],
    OP: ['OP_DR', 'OP'],
    PDT: ['PDT'],
    BC: ['BC', 'BC45']
  }
  const cles = alias[code] ?? [code]
  return (
    colonnes.find(k =>
      cles.some(c => (k.type ?? '').toUpperCase() === c || (k.sousArticle ?? '').toUpperCase().includes(c))
    ) ?? null
  )
}

type Sujet = { point: THREE.Vector3; boite?: { min: THREE.Vector3; max: THREE.Vector3 }; nom: string; colonne?: Colonne }

function v (a: [number, number, number]) {
  return new THREE.Vector3(a[0], a[1], a[2])
}

/** Le point (monde) que la caméra vise, selon `cible`. */
function sujetPour (spec: PriseSpec, ctx: Contexte, colonneOuverte: Colonne | null): Sujet | { erreur: string } {
  const { w, h, d } = ctx.bounds
  const m = ctx.mesures
  const front = d / 2
  const centre = new THREE.Vector3(0, h / 2, 0)
  switch (spec.cible) {
    case 'meuble':
      return { point: centre, boite: { min: new THREE.Vector3(-w / 2, 0, -d / 2), max: new THREE.Vector3(w / 2, h, d / 2) }, nom: 'le meuble entier' }
    case 'piece':
    case 'plan':
      return { point: new THREE.Vector3(0, h / 2, 0), nom: 'la pièce et le meuble' }
    case 'poignee': {
      const p = m?.poignees
      if (!p?.length) return { erreur: 'aucune poignée' }
      // La poignée la plus proche de l'axe : celle qu'un photographe cadrerait.
      const proche = [...p].sort((a, b) => Math.abs((a.min[0] + a.max[0]) / 2) - Math.abs((b.min[0] + b.max[0]) / 2))[0]
      const c = milieu(proche)
      return { point: c, boite: boite(proche), nom: `la poignée de la colonne ${colonneDe(ctx, c.x)}` }
    }
    case 'joint': {
      const f = m?.facades ?? []
      if (f.length < 2) return { erreur: 'moins de deux façades' }
      // Le joint le plus proche de l'axe, à 1,20 m du sol.
      let meilleur: { x: number; z: number } | null = null
      for (let i = 0; i < f.length - 1; i++) {
        const x = (f[i].max[0] + f[i + 1].min[0]) / 2
        if (!meilleur || Math.abs(x) < Math.abs(meilleur.x)) meilleur = { x, z: Math.max(f[i].max[2], f[i + 1].max[2]) }
      }
      const y = Math.min(1.2, h * 0.5)
      return { point: new THREE.Vector3(meilleur!.x, y, meilleur!.z), nom: 'le joint entre deux portes' }
    }
    case 'texture': {
      const f = m?.facades ?? []
      const cible = f.length ? f[Math.floor(f.length / 2)] : null
      const x = cible ? (cible.min[0] + cible.max[0]) / 2 : 0
      const z = cible ? cible.max[2] : front
      return { point: new THREE.Vector3(x, Math.min(1.3, h * 0.55), z), nom: 'la surface d une façade' }
    }
    case 'plinthe': {
      const pl = m?.plinthe
      const y = pl ? pl.hauteur_mm / 2000 : 0.04
      const z = pl ? front - pl.retrait_mm / 1000 : front
      return { point: new THREE.Vector3(0, y, z), nom: 'la plinthe et le sol' }
    }
    case 'bandeau': {
      const b = m?.bandeau
      const y = b ? h - b.hauteur_mm / 2000 : h - 0.04
      const z = b ? front - b.retrait_mm / 1000 : front
      return { point: new THREE.Vector3(0, y, z), nom: 'le bandeau haut et le plafond' }
    }
    case 'fileur': {
      // Le côté encastré : gauche si les deux le sont (la clé lumière vient de droite pour D08).
      const gauche = ctx.walls.left !== null
      const x = gauche ? -w / 2 : w / 2
      return { point: new THREE.Vector3(x, Math.min(1.2, h * 0.5), front), nom: `le fileur ${gauche ? 'gauche' : 'droit'} et le mur` }
    }
    case 'porte_ouverte': {
      if (!colonneOuverte) return { erreur: 'aucune colonne à ouvrir' }
      return { point: milieuColonne(colonneOuverte), boite: { min: v(colonneOuverte.min), max: v(colonneOuverte.max) }, nom: `la porte ouverte de la colonne ${colonneOuverte.rang}`, colonne: colonneOuverte }
    }
    default: {
      if (spec.cible.startsWith('zone:')) {
        const k = colonnePourFonction(ctx.colonnes, spec.cible.slice(5))
        if (!k) return { erreur: `aucune colonne ${spec.cible}` }
        return { point: milieuColonne(k), boite: { min: v(k.min), max: v(k.max) }, nom: `la colonne ${k.rang} (${k.type ?? spec.cible.slice(5)})`, colonne: k }
      }
      return { erreur: `cible inconnue : ${spec.cible}` }
    }
  }
}

function milieu (b: { min: [number, number, number]; max: [number, number, number] }) {
  return new THREE.Vector3((b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2)
}
function boite (b: { min: [number, number, number]; max: [number, number, number] }) {
  return { min: v(b.min), max: v(b.max) }
}
function milieuColonne (k: Colonne) {
  return new THREE.Vector3((k.min[0] + k.max[0]) / 2, (k.min[1] + k.max[1]) / 2, (k.min[2] + k.max[2]) / 2)
}
function colonneDe (ctx: Contexte, x: number): number | string {
  const k = ctx.colonnes.find(c => x >= c.min[0] - 0.005 && x <= c.max[0] + 0.005)
  return k ? k.rang : '?'
}

/** La colonne qu'on ouvre pour une prise « une porte ouverte » : la plus proche du côté de la caméra. */
export function colonneAOuvrir (spec: PriseSpec, colonnes: Colonne[]): Colonne | null {
  if (spec.portes !== 'une-ouverte' && spec.portes !== 'une-entrouverte') return null
  const avecPorte = colonnes.filter(k => (k.porte ?? '') !== '')
  if (!avecPorte.length) return null
  if (spec.azimut_deg < 0) return avecPorte[0]
  if (spec.azimut_deg > 0) return avecPorte[avecPorte.length - 1]
  // De face : parmi les colonnes à porte, les plus HAUTES (une colonne toute hauteur montre un vrai aménagement, pas une
  // petite porte de meuble haut), puis la plus proche de l axe du meuble.
  const hauteur = (k: Colonne) => k.max[1] - k.min[1]
  const hMax = Math.max(...avecPorte.map(hauteur))
  const hautes = avecPorte.filter(k => hauteur(k) >= 0.9 * hMax)
  return [...hautes].sort((p, q) => Math.abs((p.min[0] + p.max[0]) / 2) - Math.abs((q.min[0] + q.max[0]) / 2))[0]
}

/** Distance qui cadre une boîte (demi-largeur `hw`, demi-hauteur `hh`) au fov donné, avec marge. */
function distanceDeCadrage (hw: number, hh: number, fovDeg: number, aspect: number, marge: number): number {
  const tanV = Math.tan(deg(fovDeg) / 2)
  const tanH = tanV * (aspect || 1)
  return Math.max(hh / tanV, hw / tanH, 0.3) * marge
}

/** Largeur apparente d'une boîte vue sous l'azimut `az` (la diagonale se projette). */
function largeurApparente (w: number, d: number, azDeg: number): number {
  const a = Math.abs(deg(azDeg))
  return w * Math.cos(a) + d * Math.sin(a)
}

/** Caméra à `dist` du point visé, sous `az` et `incl` ; renvoie position et angles. */
function placer (cible: THREE.Vector3, dist: number, azDeg: number, inclDeg: number) {
  const az = deg(azDeg)
  const incl = deg(inclDeg)
  const position = new THREE.Vector3(
    cible.x + dist * Math.cos(incl) * Math.sin(az),
    cible.y + dist * Math.sin(incl),
    cible.z + dist * Math.cos(incl) * Math.cos(az)
  )
  return position
}

/** Marge au mur : 40 cm pour un cadrage large, 12 cm pour un gros plan (un photographe colle l'appareil au mur). */
function margeMur (spec: PriseSpec): number {
  return spec.cadrage === 'detail' ? 0.12 : MARGE_MUR
}

/** La caméra est-elle dans la pièce ? Renvoie la première raison de refus, sinon null. */
function horsPiece (p: THREE.Vector3, ctx: Contexte, marge = MARGE_MUR): string | null {
  const { d } = ctx.bounds
  if (ctx.walls.left !== null && p.x < -ctx.walls.left + marge) return 'la caméra traverse le mur gauche'
  if (ctx.walls.right !== null && p.x > ctx.walls.right - marge) return 'la caméra traverse le mur droit'
  if (p.z < d / 2 + MARGE_FACADE) return 'la caméra est dans le meuble'
  if (p.z > d / 2 + ctx.room.depth - 0.2) return 'la caméra sort de la pièce par l arrière'
  const plafond = plafondEn(ctx, p.x, p.z)
  if (p.y > plafond - MARGE_PLAFOND) return plafond < ctx.room.height - 1e-6 ? 'la caméra traverse le rampant' : 'la caméra traverse le plafond'
  if (p.y < 0.05) return 'la caméra traverse le sol'
  return null
}

/**
 * Résout une prise en caméra effective. Ne lève jamais : une prise impossible
 * revient avec `faisable: false` et sa raison, que le script publie.
 */
export function resoudrePrise (spec: PriseSpec, ctx: Contexte): Resolution {
  const cond = conditionsRemplies(spec, ctx)
  if (!cond.ok) return { faisable: false, raison: cond.raison, politique: spec.politique }
  if (spec.cadrage === 'station') return resoudreStation(spec, ctx)

  const { w, h, d } = ctx.bounds
  const notes: string[] = []
  const colonneOuverte = colonneAOuvrir(spec, ctx.colonnes)
  const s = sujetPour(spec, ctx, colonneOuverte)
  if ('erreur' in s) return { faisable: false, raison: s.erreur, politique: spec.politique }
  // Un cadrage « meuble » dont UN des jumeaux porte des cotes devient un cadrage
  // « cotes » pour les DEUX : les jumeaux client / schéma doivent partager la
  // même caméra au pixel près, et les chaînes vivent à 120-440 mm hors du meuble
  // (mesuré le 15/09 sur `schema_face` : l'étiquette de largeur sortait du cadre).
  // Là où un mur ou le plafond affleure, la chaîne est dessinée à l'intérieur
  // (`banc/Dimensions.tsx`) : ce côté-là n'a pas besoin de place.
  const cotesQuelquePart = spec.cotes.client !== 'aucune' || spec.cotes.schema !== 'aucune'
  const plafondAffleurant = ctx.room.height - h < 0.3
  const extraHaut = plafondAffleurant ? 0 : COTES_GAP + 2 * COTES_ROW + COTES_LABEL
  const extraGauche = ctx.walls.left !== null ? 0 : COTES_GAP + COTES_ROW + COTES_LABEL
  const extraDroite = ctx.walls.right !== null ? 0 : COTES_GAP + COTES_LABEL
  if (spec.cadrage === 'meuble' && cotesQuelquePart) {
    spec = { ...spec, cadrage: 'cotes' }
    if (extraHaut + extraGauche + extraDroite > 0) notes.push('cadrage élargi pour les chaînes de cotes')
  }

  let fov = fovDeFocale(spec.focale_mm)
  let politique: Politique = 'nominale'
  let cadrage: 'entier' | 'partiel' = 'entier'
  let up: [number, number, number] = [0, 1, 0]

  // --- le plan : orthographique approché par une longue focale de très haut ---
  if (spec.cadrage === 'plan') {
    const pc = ctx.scene?.piece
    const roomW = pc ? pc.largeur_m : (ctx.walls.left ?? w / 2 + Math.max(0.6, 0.25 * w)) + (ctx.walls.right ?? w / 2 + Math.max(0.6, 0.25 * w))
    const profondeur = pc ? pc.profondeur_m : d + Math.min(ctx.room.depth, 3)
    fov = 5
    const dist = distanceDeCadrage(roomW / 2, profondeur / 2, fov, ctx.aspect, 1.1)
    const cible = new THREE.Vector3(pc ? pc.x_centre_m - w / 2 : 0, 0, -d / 2 + profondeur / 2)
    const position = new THREE.Vector3(cible.x, dist, cible.z)
    up = [0, 0, -1]
    return {
      faisable: true,
      position: position.toArray() as [number, number, number],
      cible: cible.toArray() as [number, number, number],
      up,
      fov_v_deg: fov,
      focale_eq_mm: Math.round(focaleDeFov(fov)),
      distance_m: dist,
      azimut_deg: 0,
      polaire_deg: 0,
      inclinaison_deg: 90,
      hauteur_m: dist,
      decentrement: [0, 0],
      cadrage: 'entier',
      politique: 'nominale',
      sujet: 'la pièce vue de dessus, orthographique (dessin, pas photo)',
      colonne_ouverte: null,
      notes: ['perspective quasi nulle (fov 5°) : lecture en plan']
    }
  }

  // --- hauteur de caméra ---
  const hauteurDemandee = (): number => {
    if (spec.hauteur === 'mi-hauteur') return h / 2
    if (spec.hauteur === 'oeil') return ctx.eye
    if (spec.hauteur === 'cible') return s.point.y
    return spec.hauteur
  }
  let hauteur = Math.max(0.15, Math.min(hauteurDemandee(), ctx.room.height - MARGE_PLAFOND))
  if (hauteur !== hauteurDemandee()) notes.push(`hauteur plafonnée à ${hauteur.toFixed(2)} m par la pièce`)

  // --- distance ---
  let dist: number
  const marge = spec.marge ?? (spec.cadrage === 'cotes' ? 1.1 : spec.cadrage === 'zone' ? 1.25 : 1.15)
  const boiteCadrage = (() => {
    if (spec.cadrage === 'cotes') {
      // Réserver la place des chaînes de cotes là où elles sont dehors : deux
      // rangées au-dessus (sauf plafond affleurant), une à gauche et une à droite
      // (sauf mur). Le centre du cadrage monte d'autant — la caméra, elle, reste
      // de niveau : le décalage passe par le décentrement (voir plus bas).
      return {
        hw: (w + extraGauche + extraDroite) / 2,
        hh: (h + extraHaut) / 2,
        cy: (h + extraHaut) / 2,
        cx: (extraDroite - extraGauche) / 2
      }
    }
    if (spec.cadrage === 'piece') {
      return { hw: w / 2 + 1.2, hh: Math.max(h, ctx.room.height) / 2 + 0.2, cy: Math.max(h, ctx.room.height) / 2 }
    }
    if (spec.cadrage === 'zone' && s.boite) {
      return { hw: (s.boite.max.x - s.boite.min.x) / 2, hh: (s.boite.max.y - s.boite.min.y) / 2, cy: (s.boite.min.y + s.boite.max.y) / 2, cx: 0 }
    }
    return { hw: w / 2, hh: h / 2, cy: h / 2, cx: 0 }
  })()
  // Le point visé : le centre du cadrage choisi (pour le meuble : son centre).
  const cible = spec.cadrage === 'detail' ? s.point.clone() : new THREE.Vector3(s.point.x + (boiteCadrage.cx ?? 0), boiteCadrage.cy, s.point.z)
  // Une élévation (caméra de niveau, sans inclinaison voulue) dont le cadrage est
  // décalé par les cotes se décentre au lieu de s'incliner : verticales d'aplomb.
  const decentrer = spec.decentrement || (spec.cadrage === 'cotes' && spec.inclinaison_deg === 0)

  if (spec.cadrage === 'detail') {
    dist = spec.distance_m ?? 0.5
  } else if (spec.cadrage === 'seuil') {
    dist = Math.max(1, d / 2 + ctx.room.depth - 0.3 - cible.z)
  } else {
    const hw = largeurApparente(boiteCadrage.hw * 2, spec.cible === 'meuble' || spec.cadrage === 'cotes' ? d : 0, spec.azimut_deg) / 2
    dist = distanceDeCadrage(hw, boiteCadrage.hh, fov, ctx.aspect, marge)
  }

  // --- inclinaison et décentrement ---
  // Décentrement : la caméra reste de NIVEAU à `hauteur` et vise l'horizontale ;
  // le cadre est décalé pour centrer la cible (objectif à bascule). Sinon, avec
  // une inclinaison explicite la hauteur découle de la géométrie ; sans
  // inclinaison, la caméra de niveau à `hauteur` vise (cible.x, hauteur, cible.z).
  let incl = spec.inclinaison_deg
  let position: THREE.Vector3
  let look: THREE.Vector3
  let decentrement: [number, number] = [0, 0]
  if (decentrer) {
    incl = 0
    look = new THREE.Vector3(cible.x, hauteur, cible.z)
    position = placer(look, dist, spec.azimut_deg, 0)
  } else if (incl !== 0) {
    look = cible.clone()
    position = placer(look, dist, spec.azimut_deg, incl)
    hauteur = position.y
  } else {
    // Caméra de niveau ; si `hauteur` n'est pas celle de la cible, on la vise quand même
    // (prises de détail : `hauteur: 'cible'` les rend égales).
    look = new THREE.Vector3(cible.x, hauteur, cible.z)
    position = placer(look, dist, spec.azimut_deg, 0)
    if (Math.abs(hauteur - cible.y) > 0.01) {
      incl = rad2deg(Math.atan2(hauteur - cible.y, dist))
      look = cible.clone()
      notes.push(`caméra inclinée de ${incl.toFixed(1)}° pour viser la cible depuis ${hauteur.toFixed(2)} m`)
    }
  }

  // --- faisabilité et politique ---
  const mm = margeMur(spec)
  let refus = horsPiece(position, ctx, mm)
  let azimut = spec.azimut_deg
  if (refus) {
    if (spec.politique === 'omettre' || spec.politique === 'nominale') {
      return { faisable: false, raison: refus, politique: spec.politique }
    }
    if (spec.politique === 'degrade') {
      // L'azimut est borné par le mur du côté visé (même règle que `clampedAzimuth`).
      const mur = spec.azimut_deg < 0 ? ctx.walls.left : ctx.walls.right
      if (mur !== null) {
        const lim = rad2deg(Math.asin(Math.min(1, (mur - mm) / dist)))
        azimut = Math.sign(spec.azimut_deg) * Math.min(Math.abs(spec.azimut_deg), Math.max(0, lim))
        position = placer(look, dist, azimut, decentrer ? 0 : incl)
        politique = 'degrade'
        notes.push(`azimut réduit de ${spec.azimut_deg}° à ${azimut.toFixed(1)}° par le mur`)
      }
      refus = horsPiece(position, ctx, mm)
    }
    if (spec.politique === 'partiel') {
      // On garde l'angle, on se rapproche jusqu'à tenir entre les murs, on ouvre
      // la focale — et si elle dépasse le 24 mm, la façade proche sera coupée.
      // La place disponible se compte depuis la CIBLE (une colonne de droite
      // visée depuis la droite n'a que quelques centimètres avant le mur) ; si
      // ce côté est trop court, la caméra passe de l'autre côté du sujet.
      const place = (az: number) => {
        const mur = az < 0 ? ctx.walls.left : ctx.walls.right
        if (mur === null) return Infinity
        return mur - mm - Math.sign(az) * look.x
      }
      if (place(azimut) < 0.5 && place(-azimut) > place(azimut)) {
        azimut = -azimut
        notes.push(`caméra passée de l'autre côté du sujet (azimut ${azimut}°) : pas de place contre le mur`)
      }
      const sinAz = Math.abs(Math.sin(deg(azimut))) || 1e-6
      let distMax = dist
      const dispo = place(azimut)
      if (Number.isFinite(dispo)) distMax = Math.min(distMax, Math.max(0.3, dispo) / sinAz)
      distMax = Math.min(distMax, d / 2 + ctx.room.depth - 0.2 - cible.z)
      dist = Math.max(0.6, distMax)
      const hw = largeurApparente(boiteCadrage.hw * 2, spec.cible === 'meuble' ? d : 0, azimut) / 2
      const tanNecessaire = Math.max(boiteCadrage.hh, hw / (ctx.aspect || 1)) * marge / dist
      let fovNecessaire = rad2deg(2 * Math.atan(tanNecessaire))
      if (fovNecessaire > FOV_MAX_PARTIEL) {
        fovNecessaire = FOV_MAX_PARTIEL
        cadrage = 'partiel'
        notes.push('champ plafonné à 53° (24 mm) : la façade proche peut être coupée')
      }
      fov = Math.max(fov, fovNecessaire)
      position = placer(look, dist, azimut, decentrer ? 0 : incl)
      politique = 'partiel'
      notes.push(`caméra rapprochée à ${dist.toFixed(2)} m, focale ouverte à ${Math.round(focaleDeFov(fov))} mm`)
      refus = horsPiece(position, ctx, mm)
    }
    if (refus) return { faisable: false, raison: refus, politique: spec.politique }
  }

  // Décentrement effectif : fraction de la hauteur d'image qui ramène la cible au centre.
  if (decentrer) {
    const tanV = Math.tan(deg(fov) / 2)
    const dy = (cible.y - hauteur) / (dist * tanV)
    decentrement = [0, dy / 2]
    if (Math.abs(dy) > 1.6) notes.push('décentrement très fort : la cible est loin de l axe optique')
  }

  const dirCam = position.clone().sub(look)
  const polaire = rad2deg(Math.acos(THREE.MathUtils.clamp(dirCam.y / dirCam.length(), -1, 1)))

  return {
    faisable: true,
    position: position.toArray() as [number, number, number],
    cible: look.toArray() as [number, number, number],
    up,
    fov_v_deg: Math.round(fov * 10) / 10,
    focale_eq_mm: Math.round(focaleDeFov(fov)),
    distance_m: Math.round(dist * 1000) / 1000,
    azimut_deg: Math.round(azimut * 10) / 10,
    polaire_deg: Math.round(polaire * 10) / 10,
    inclinaison_deg: Math.round(incl * 10) / 10,
    hauteur_m: Math.round(position.y * 1000) / 1000,
    decentrement,
    cadrage,
    politique,
    sujet: s.nom,
    colonne_ouverte: colonneOuverte ? colonneOuverte.rang : null,
    notes
  }
}

/**
 * Stations « œil du photographe » (couche 2, arbitrages du 20/09).
 *
 * Ce que font les photographes de mobilier sur mesure (215 images de concurrents, charte Stoëmp, finales V1) :
 * la caméra est de NIVEAU, elle regarde droit vers le mur du fond, elle ne PIVOTE pas — elle se DÉPLACE le long
 * du meuble, et le cadre est décentré. Tout se calcule sur l'EMPRISE réelle et le plan de pièce du modèle.
 *
 * - corps droit : de face, œil à 1,15 m ; le meuble occupe `part_largeur` de l'image ; la grande marge est du
 *   côté de la fenêtre ; encastré d'un seul côté → la caméra se place du côté libre ;
 * - L : l'aile du fond parallèle au cadre, l'autre en fuite et coupée par le bord ; l'angle du meuble à 35 % de
 *   la largeur, du côté de l'aile ; œil à 1,30 m ;
 * - U : dans l'axe, depuis l'ouverture, au 28 mm ; les deux ailes fuient vers les bords ;
 * - en hauteur : un liseré de plafond (~35 % de la place libre) et du sol (~65 %) ; jamais le meuble coupé en haut.
 *
 * Repère local : x ∈ [0, w], z = 0 au mur du fond ; monde : X = x − w/2, Z = z − d/2.
 */
function resoudreStation (spec: PriseSpec, ctx: Contexte): Resolution {
  const sc = ctx.scene
  if (!sc) return { faisable: false, raison: 'modèle de scène absent du contexte', politique: spec.politique }
  const { w, h, d } = ctx.bounds
  const e = sc.emprise
  const aspect = ctx.aspect || 1
  const notes: string[] = []
  const focale = e.forme === 'U' ? spec.focale_u_mm ?? 28 : spec.focale_mm
  let fov = fovDeFocale(focale)
  const hauteurVoulue = e.forme === 'droit' ? (typeof spec.hauteur === 'number' ? spec.hauteur : 1.15) : spec.hauteur_angle ?? 1.3
  let hauteur = Math.min(hauteurVoulue, sc.piece.hauteur_m - MARGE_PLAFOND)
  const part = spec.part_largeur ?? 0.55
  const zSujet = e.p_corps_m
  // B4 : sous un rampant, le photographe RECULE (le cadre garde 10 % de plafond au-dessus du meuble, pour que la pente se lise) et BAISSE
  // L'ŒIL si le plafond à son aplomb l'y oblige — après s'être déplacé vers la zone plate quand c'est possible (voir plus bas).
  const rampants = sc.rampants ?? []
  const sousRampant = rampants.length > 0

  // Largeur du cadre au plan des façades du corps, selon la forme.
  const ag = e.aile_gauche
  const ad = e.aile_droite
  let largeurVoulue: number
  if (e.forme === 'U') largeurVoulue = (w - (ag?.largeur_m ?? 0) - (ad?.largeur_m ?? 0)) / 0.6
  else if (e.forme === 'L') largeurVoulue = (w - (ag ?? ad)!.largeur_m) / 0.57
  else largeurVoulue = w / part
  // Le meuble n'est jamais coupé en haut : le cadre fait au moins h / 0,89 de haut (3 % de plafond, 8 % de sol).
  // B4 : sous un rampant, h / 0,82 (10 % de plafond, 8 % de sol) : la pente du plafond au-dessus du meuble est le sujet — le photographe recule.
  const hauteurMin = h / (sousRampant ? 0.82 : 0.89)
  if (sousRampant) notes.push(`rampant (${rampants.map(r => `${r.cote} ${r.angle_deg}°, ${Math.round(r.bas_m * 1000)} mm au mur`).join(' ; ')}) : cadre ≥ h / 0,82 pour montrer la pente`)
  // Sur un L ou un U, le cadre ne dépasse pas 1,15 fois la hauteur utile : en carré on serre sur l angle plutôt que de reculer.
  if (e.forme !== 'droit') largeurVoulue = Math.min(largeurVoulue, 1.15 * hauteurMin * aspect)
  let Hf = Math.max(largeurVoulue / aspect, hauteurMin)
  let Wf = Hf * aspect

  // Le recul tient-il dans la pièce ? Sinon on se rapproche et on ouvre la focale (24 mm au plus).
  let tanV = Math.tan(deg(fov) / 2)
  let dist = Hf / (2 * tanV)
  const reculMax = sc.piece.profondeur_m - zSujet - 0.25
  if (dist > reculMax) {
    const tanMax = Math.tan(deg(FOV_MAX_PARTIEL) / 2)
    const tanNecessaire = Hf / (2 * reculMax)
    if (tanNecessaire > tanMax) {
      dist = reculMax
      tanV = tanMax
      Hf = 2 * dist * tanV
      Wf = Hf * aspect
      notes.push('pièce trop courte : cadre resserré au 24 mm')
    } else {
      dist = reculMax
      tanV = tanNecessaire
    }
    fov = rad2deg(2 * Math.atan(tanV))
    notes.push(`recul limité à ${dist.toFixed(2)} m par la pièce, focale ouverte à ${Math.round(focaleDeFov(fov))} mm`)
  }

  // Cadre horizontal [xCadre − Wf/2, xCadre + Wf/2] et position de la caméra, en x local.
  const cote = sc.fenetre.cote
  const s = cote === 'droite' ? 1 : cote === 'gauche' ? -1 : 0
  let xCadre: number
  let xCam: number
  let sujet: string
  let cadrage: 'entier' | 'partiel' = 'entier'
  if (e.forme === 'U') {
    xCadre = w / 2
    xCam = w / 2
    sujet = 'le U dans l axe, depuis l ouverture ; les ailes fuient vers les bords'
    cadrage = 'partiel'
  } else if (e.forme === 'L') {
    const aGauche = !!ag
    const aw = (ag ?? ad)!.largeur_m
    const xAngle = aGauche ? aw : w - aw
    const dir = aGauche ? 1 : -1
    xCadre = xAngle - dir * 0.35 * Wf + dir * Wf / 2
    xCam = xAngle + dir * 0.55 * (w - aw)
    sujet = `le L : aile du fond parallèle au cadre, aile ${aGauche ? 'gauche' : 'droite'} en fuite, angle à 35 % de la largeur`
    cadrage = 'partiel'
  } else {
    // Grande marge du côté de la fenêtre ; caméra du côté libre s'il n'y en a qu'un, sinon du côté de la fenêtre.
    const murG = ctx.walls.left !== null
    const murD = ctx.walls.right !== null
    // Adossé à au moins un vrai mur (angle de pièce, retour de cloison) : la caméra se place du côté où la pièce
    // continue, et le mur d'adossement n'est qu'un liseré. De mur à mur ou posé libre : pas de côté imposé.
    const ouvert = sc.cote_ouvert === 'droite' ? 1 : sc.cote_ouvert === 'gauche' ? -1 : 0
    const libre = murG || murD ? ouvert : 0
    // Encastré d un seul côté : le mur d encastrement n est qu un liseré (12 % du cadre), toute la marge va au côté libre.
    xCadre = libre === 1 ? -0.12 * Wf + Wf / 2 : libre === -1 ? w + 0.12 * Wf - Wf / 2 : w / 2 + s * 0.05 * Wf
    xCam = w / 2 + (libre !== 0 ? libre * 0.18 * w : (ouvert || s) * 0.1 * w)
    sujet = 'le meuble de face, caméra de niveau déplacée le long du meuble, cadre décentré'
    const partReelle = w / Wf
    notes.push(`meuble à ${Math.round(partReelle * 100)} % de la largeur (visé ${Math.round(part * 100)} %)`)
    if (partReelle < 0.45) notes.push('sous le plancher de 45 % : meuble trop étroit pour ce format sans le couper en haut')
  }
  // La caméra reste dans la pièce.
  xCam = Math.min(Math.max(xCam, sc.piece.x_gauche_m + MARGE_MUR), sc.piece.x_droite_m - MARGE_MUR)
  // B4 : la caméra reste SOUS le plafond à son aplomb. Sous un rampant : d'abord se déplacer vers la zone plate (au plus 35 % de la
  // largeur du meuble, dans la pièce), sinon baisser l'œil — jamais une tête dans le rampant.
  if (sousRampant) {
    const zCam = zSujet + dist
    const plafondA = (x: number) => hauteurPlafond(rampants, x, zCam, sc.piece.hauteur_m)
    if (plafondA(xCam) - MARGE_PLAFOND < hauteur) {
      const cible = hauteur + MARGE_PLAFOND
      let xMin = sc.piece.x_gauche_m + MARGE_MUR
      let xMax = sc.piece.x_droite_m - MARGE_MUR
      for (const r of rampants) {
        if (r.axe !== 'x') continue
        const t = ((cible - r.bas_m) / (r.haut_m - r.bas_m)) * r.projection_m
        const xLimite = r.depuis_m + r.sens * t
        if (r.sens === 1) xMin = Math.max(xMin, xLimite)
        else xMax = Math.min(xMax, xLimite)
      }
      const xOk = Math.min(Math.max(xCam, xMin), xMax)
      if (xMin <= xMax && Math.abs(xOk - xCam) <= 0.35 * w) {
        notes.push(`rampant : plafond à ${plafondA(xCam).toFixed(2)} m à l'aplomb voulu — caméra déplacée de ${(xOk - xCam).toFixed(2)} m vers la zone plate`)
        xCam = xOk
      } else {
        const basse = Math.max(0.6, plafondA(xCam) - MARGE_PLAFOND)
        notes.push(`rampant : plafond à ${plafondA(xCam).toFixed(2)} m à l'aplomb de la caméra — œil baissé de ${hauteur.toFixed(2)} à ${basse.toFixed(2)} m`)
        hauteur = basse
      }
    }
  }

  // Cadre vertical : la place libre se partage 35 % au plafond, 65 % au sol ; un meuble bas garde 18 % de sol.
  const libreV = Hf - h
  const sol = libreV > 0.5 * Hf ? 0.18 * Hf : 0.65 * libreV
  const yCadre = -sol + Hf / 2
  notes.push(`cadre ${Wf.toFixed(2)} × ${Hf.toFixed(2)} m au nu des façades : sol ${Math.round((sol / Hf) * 100)} %, au-dessus du meuble ${Math.round(((libreV - sol) / Hf) * 100)} %`)

  const position = new THREE.Vector3(xCam - w / 2, hauteur, zSujet + dist - d / 2)
  const look = new THREE.Vector3(xCam - w / 2, hauteur, zSujet - d / 2)
  // Décentrement en fraction du cadre (convention du rig : il applique l'opposé en pixels ; +x monde = droite de l'image).
  const decentrement: [number, number] = [-(xCadre - xCam) / Wf, (yCadre - hauteur) / Hf]

  return {
    faisable: true,
    position: position.toArray() as [number, number, number],
    cible: look.toArray() as [number, number, number],
    up: [0, 1, 0],
    fov_v_deg: Math.round(fov * 10) / 10,
    focale_eq_mm: Math.round(focaleDeFov(fov)),
    distance_m: Math.round(dist * 1000) / 1000,
    azimut_deg: 0,
    polaire_deg: 90,
    inclinaison_deg: 0,
    hauteur_m: Math.round(hauteur * 1000) / 1000,
    decentrement,
    cadrage,
    politique: 'nominale',
    sujet,
    colonne_ouverte: colonneAOuvrir(spec, ctx.colonnes)?.rang ?? null,
    notes
  }
}
