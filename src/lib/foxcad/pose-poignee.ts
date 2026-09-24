/**
 * LA POSE DE LA POIGNÉE D'OTMAN SUR UNE PORTE DE FOX-CAD — la règle de son designer, sans DOM ni React (testable par `npm test`).
 *
 * La règle, lue dans `@processandtools/rp-article-designer` **1.0.102** (source map, 23/09 : `DoorHandle.tsx`, `DoorSensor.tsx`,
 * `UseElemHelper.tsx`, `safeProcessLindiv.ts`, `DescriptorEvaluator.ts`, `ConditionTreeEvaluator.tsx`) — c'est celle de Dorian
 * (« avancer comme Otman », 23/09) :
 *  - **le côté** : sur le bord opposé aux charnières, le centre de la poignée à **`PULL_X`** du bord (1.0.100 le mettait à `PULL_X / 2` ;
 *    depuis 1.0.101, `posX = ∓(w / 2 − PULL_X)`). Le formulaire d'Otman publie `PULL_X` = 50 + `dim_x` / 2 sur un front plein, la moitié du
 *    cadre sur un front à cadre large, `dim_x` / 2 + `offset_x` pour une poignée de chant : ici on lit `PULL_X` tel quel.
 *  - **devant la face** : **`PULL_Z`** (1.0.100 : `PULL_Z / 2`) ; une poignée de chant a `PULL_Z` = 0 : son GLB est SUR le chant.
 *  - **la hauteur** : la PREMIÈRE DIVISION du `MANINFO` de l'élément de porte (`anglelem[].MANINFO` du graphe `article-data`, `#DS_LD_PULL_OS_D1`
 *    sur `WACA_LY_D` 0.1.0), évaluée comme le designer : le descripteur rend sa division (le premier nœud dont la condition est vraie, sinon
 *    le nœud DEFAULT), ses `$variables` se résolvent dans les portées du Set, la division se calcule sur la hauteur de la porte
 *    (`imos-linear-division`, `processLindiv`) et sa première section est la hauteur depuis le BAS de la porte — `D1` `(1050 − $BASE_HEIGHT)mm:1`
 *    (1 050 mm du sol fini), `DW` `($PULL_Y)mm:1` (porte du haut), `DB` `1:($PULL_Y)mm` (porte du bas : `PULL_Y` depuis son haut), `DM`
 *    `(1050 − $WACA_HEIGHT_1 − $BASE_HEIGHT + $PULL_Y)mm:1`. Sans `MANINFO` (les modules coupés de d11, `_Q4L`… : ligne d'oaksome-stack à d11),
 *    sans graphe, ou sans division calculable : le **repli `D1`**, 1 050 − socle — et la pose le DIT (`source: 'repli'`, `raison`).
 *  - **une porte coupée par le rampant** : la GARDE HAUTE d'imos (24/09, mesurée par d3 et Astra, ligne de d11 08:5x) — la poignée s'arrête à
 *    500 sous le haut de la porte pris à son aplomb quand ce haut est trop bas pour la ligne (`hautALaplomb`, `GARDE_HAUTE_POIGNEE`) ; elle
 *    remplace la règle à nous du 22/09 (descendre par pas de 20 mm dans le contour). Le repli PTO (la porte orpheline, sans poignée) est
 *    l'affaire de l'arbre et de `pto.ts`.
 *  - **l'orientation** : celle du designer (repère du panneau X haut / Y gauche / Z avant ; rotation π/2, + π si charnières à droite, + `PULL_ROT`).
 *
 * Le repère ici est celui de la position (x à droite, y vers l'arrière, z en haut, mm) : la boîte de la porte posée par sa matrice.
 */
import * as THREE from 'three'
import { processLindiv } from 'imos-linear-division'
import { estContour, matricePiece, sommetsLocaux, type CoteCharnieres } from './geometrie'
import type { Piece } from './types'

/** une portée de variables (le `PVarString` du Set, les `variables[].WERT` de l'article, celles du squelette, le formulaire) */
export type Portee = Record<string, unknown>

/** la hauteur de la poignée depuis le sol fini, mm — le repli `D1` du designer : `(1050 - $BASE_HEIGHT)mm:1` */
export const HAUTEUR_POIGNEE_SOL = 1050

/** un élément d'article du graphe `article-data` (`anglelem[]`) — seuls les champs lus ici */
export interface ElementArticle {
  NAME?: string | null
  TREEID?: string | null
  /** `D` = porte */
  PARTTYPE?: string | null
  /** le « Manual info » de l'élément, qu'Otman réquisitionne pour la hauteur de poignée (`#DS_LD_PULL_OS_*`) */
  MANINFO?: string | null
}

/** un terme de condition d'un nœud de descripteur (`conditionTree.roots[]`), tel que le rp-engine le sert */
export interface TermeCondition {
  kind: 'comparison' | 'operation' | string
  data: { LEFTVALUE?: string | null; COMPARISONTYPE?: string | null; RIGHTVALUE?: string | null; OPSTRING?: string | null }
  children?: TermeCondition[]
}

export interface NoeudDescripteur {
  nodeNum: number
  lindiv: string
  comment?: string
  conditionId: number
  conditionTree: { roots: TermeCondition[] } | null
}

/** un descripteur du graphe `article-data` (`descriptors[]`) */
export interface DescripteurArticle {
  descriptor: { NAME: string; DESC_TYPE?: number }
  nodes: NoeudDescripteur[]
}

/** ce que la pose lit dans `article-data` — le reste du graphe n'est pas lu */
export interface TablesPoignee {
  anglelem?: ElementArticle[]
  descriptors?: DescripteurArticle[]
}

export const nombre = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** la première valeur non vide d'un nom dans les portées */
export function lirePortees (portees: Portee[], nom: string): unknown {
  for (const p of portees) {
    const v = p[nom]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

/** `$NOM` → sa valeur dans les portées, récursivement (huit passes) — ce que fait `resolveVarRecursive` du designer ; un nom inconnu reste `$NOM` */
export function resoudreVariables (texte: string, portees: Portee[]): string {
  let t = texte
  for (let i = 0; i < 8 && t.includes('$'); i++) {
    let change = false
    t = t.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (tout, nom: string) => {
      const v = lirePortees(portees, nom)
      if (v === undefined) return tout
      change = true
      return String(v).trim()
    })
    if (!change) break
  }
  return t
}

/**
 * un calcul sûr : nombres, + − × ÷, parenthèses, signe, `round` / `floor` / `ceil` / `abs` / `sqrt` / `min` / `max` — rien d'autre
 * (pas d'`eval`) ; `null` dès qu'un caractère n'y est pas
 */
export function evaluerArithmetique (expr: string): number | null {
  const src = expr.replace(/(\d),(\d)/g, '$1.$2')
  const jetons = src.match(/\d+(?:\.\d+)?|\.\d+|[A-Za-z_]+|[()+\-*/,]/g) ?? []
  if (jetons.join('').replace(/\s+/g, '') !== src.replace(/\s+/g, '')) return null
  let i = 0
  const fonctions: Record<string, (...a: number[]) => number> = {
    round: (a) => Math.round(a),
    floor: (a) => Math.floor(a),
    ceil: (a) => Math.ceil(a),
    abs: (a) => Math.abs(a),
    sqrt: (a) => Math.sqrt(a),
    min: (...a) => Math.min(...a),
    max: (...a) => Math.max(...a),
  }
  const echec = (): never => {
    throw new Error('expression')
  }
  const somme = (): number => {
    let v = produit()
    while (jetons[i] === '+' || jetons[i] === '-') {
      const op = jetons[i++]
      const d = produit()
      v = op === '+' ? v + d : v - d
    }
    return v
  }
  const produit = (): number => {
    let v = unaire()
    while (jetons[i] === '*' || jetons[i] === '/') {
      const op = jetons[i++]
      const d = unaire()
      v = op === '*' ? v * d : v / d
    }
    return v
  }
  const unaire = (): number => {
    if (jetons[i] === '-') {
      i++
      return -unaire()
    }
    if (jetons[i] === '+') {
      i++
      return unaire()
    }
    return atome()
  }
  const atome = (): number => {
    const j = jetons[i++]
    if (j === undefined) return echec()
    if (j === '(') {
      const v = somme()
      if (jetons[i++] !== ')') echec()
      return v
    }
    if (/^[\d.]/.test(j)) return Number(j)
    const f = fonctions[j.toLowerCase()]
    if (!f || jetons[i++] !== '(') return echec()
    const args = [somme()]
    while (jetons[i] === ',') {
      i++
      args.push(somme())
    }
    if (jetons[i++] !== ')') echec()
    return f(...args)
  }
  try {
    const v = somme()
    if (i !== jetons.length || !Number.isFinite(v)) return null
    return v
  } catch {
    return null
  }
}

const formater = (v: number): string => String(Math.round(v * 1e6) / 1e6)

/**
 * les groupes `(…)` et `fn(…)` purement numériques d'une division remplacés par leur valeur, du plus intérieur au plus extérieur —
 * `(1050 - 80)mm:1` → `970mm:1`, `1:($PULL_Y)mm` résolu → `1:122.5mm` : `processLindiv` refuse un nombre seul entre parenthèses
 */
export function simplifierExpressions (texte: string): string {
  let t = texte
  for (let n = 0; n < 32; n++) {
    const m = /(?:\b(round|floor|ceil|abs|sqrt|min|max)\s*)?\(([^()]*)\)/i.exec(t)
    if (!m) break
    const v = evaluerArithmetique(`${m[1] ?? ''}(${m[2]})`)
    if (v === null) break
    t = t.slice(0, m.index) + formater(v) + t.slice(m.index + m[0].length)
  }
  return t
}

/** une valeur de condition : résolue dans les portées, puis calculée si c'est un nombre ou une arithmétique, sinon la chaîne */
const valeurCondition = (v: string | null | undefined, portees: Portee[]): string | number => {
  const r = resoudreVariables(String(v ?? ''), portees).trim()
  const n = evaluerArithmetique(r)
  return n === null ? r : n
}

const nombreSur = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}
const compareNombres = (a: unknown, b: unknown, f: (x: number, y: number) => boolean): boolean => {
  const x = nombreSur(a)
  const y = nombreSur(b)
  return x === null || y === null ? false : f(x, y)
}
const compareChaines = (a: unknown, b: unknown, f: (x: string, y: string) => boolean): boolean => (a == null || b == null ? false : f(String(a), String(b)))

/** la table de comparaison du designer (`ComparisonMap.tsx`), telle quelle */
const comparaisons: Record<string, (a: unknown, b: unknown) => boolean> = {
  '=': (a, b) => (a == null || b == null ? a === b : String(a).trim() === String(b).trim()),
  '!=': (a, b) => (a == null || b == null ? a !== b : String(a).trim() !== String(b).trim()),
  '>': (a, b) => compareNombres(a, b, (x, y) => x > y),
  '<': (a, b) => compareNombres(a, b, (x, y) => x < y),
  '>=': (a, b) => compareNombres(a, b, (x, y) => x >= y),
  '<=': (a, b) => compareNombres(a, b, (x, y) => x <= y),
  '&gt;': (a, b) => compareNombres(a, b, (x, y) => x > y),
  '&gt;=': (a, b) => compareNombres(a, b, (x, y) => x >= y),
  '&lt;': (a, b) => compareNombres(a, b, (x, y) => x < y),
  '&lt;=': (a, b) => compareNombres(a, b, (x, y) => x <= y),
  B: (a, b) => compareChaines(a, b, (x, y) => x.startsWith(y)),
  '!B': (a, b) => compareChaines(a, b, (x, y) => !x.startsWith(y)),
  E: (a, b) => compareChaines(a, b, (x, y) => x.endsWith(y)),
  '!E': (a, b) => compareChaines(a, b, (x, y) => !x.endsWith(y)),
  C: (a, b) => compareChaines(a, b, (x, y) => x.includes(y)),
  '!C': (a, b) => compareChaines(a, b, (x, y) => !x.includes(y)),
}

/** un terme de condition, comme `ConditionTreeEvaluator.evaluateNode` (sans `inputData` : les portées seules) */
export function evaluerCondition (t: TermeCondition | null | undefined, portees: Portee[]): boolean {
  if (!t) return false
  if (t.kind === 'comparison') {
    const f = comparaisons[String(t.data?.COMPARISONTYPE ?? '')]
    if (!f) return false
    return f(valeurCondition(t.data?.LEFTVALUE, portees), valeurCondition(t.data?.RIGHTVALUE, portees))
  }
  if (t.kind === 'operation') {
    const r = (t.children ?? []).map((c) => evaluerCondition(c, portees))
    switch (t.data?.OPSTRING) {
      case 'AND':
        return r.every(Boolean)
      case 'OR':
        return r.some(Boolean)
      case 'NOT':
        return !r.every(Boolean)
      case 'NOT OR':
        return !r.some(Boolean)
      default:
        return false
    }
  }
  return false
}

/** la division que rend un descripteur : le premier nœud dont toutes les racines de condition sont vraies, sinon le nœud DEFAULT ; `null` sans nœud */
export function evaluerDescripteur (d: DescripteurArticle, portees: Portee[]): { lindiv: string; nodeNum: number; parDefaut: boolean } | null {
  const noeuds = d.nodes ?? []
  const defaut = noeuds.find((n) => n.conditionId === 0 || n.conditionTree === null)
  for (const n of noeuds) {
    if (n.conditionId === 0 || n.conditionTree === null) continue
    const racines = n.conditionTree?.roots ?? []
    if (racines.length > 0 && racines.every((r) => evaluerCondition(r, portees))) return { lindiv: n.lindiv, nodeNum: n.nodeNum, parDefaut: false }
  }
  return defaut ? { lindiv: defaut.lindiv, nodeNum: defaut.nodeNum, parDefaut: true } : null
}

export interface Division {
  /** la première section de la division, mm depuis le bas — `null` si elle ne se calcule pas */
  valeur: number | null
  /** la division telle qu'elle a été donnée au calcul (variables résolues, expressions simplifiées) */
  resolu: string
  raison: string | null
}

/**
 * la première section d'une division linéaire d'imos sur une longueur (`safeProcessLindiv` du designer : `,` décimale → `.`, `x` = la
 * longueur, variables résolues, puis `processLindiv`) — `970mm:1` sur 2 340 → 970 ; `1:150mm` sur 700 → 550
 */
export function premiereDivision (lindiv: string, longueur: number, portees: Portee[]): Division {
  const resolu0 = resoudreVariables(lindiv, portees)
  const manque = resolu0.match(/\$[A-Za-z_][A-Za-z0-9_]*/g)
  if (manque) return { valeur: null, resolu: resolu0, raison: `variable non résolue : ${[...new Set(manque)].join(', ')}` }
  const resolu = simplifierExpressions(resolu0.replace(/(\d),(\d)/g, '$1.$2').replace(/\bx\b/gi, formater(longueur))).trim()
  if (resolu === '') return { valeur: null, resolu, raison: 'division vide' }
  try {
    const r = processLindiv(resolu, longueur) as unknown
    if (!Array.isArray(r)) return { valeur: null, resolu, raison: `division refusée : ${(r as { message?: string })?.message ?? String(r)}` }
    const v = Number(r[0])
    if (!Number.isFinite(v)) return { valeur: null, resolu, raison: 'division sans première section' }
    return { valeur: v, resolu, raison: null }
  } catch (e) {
    return { valeur: null, resolu, raison: `division refusée : ${e instanceof Error ? e.message : String(e)}` }
  }
}

/**
 * l'élément de porte d'une pièce dans le graphe de son article : par `hierarchie` (= le `TREEID` de l'élément, `0.1.0` sur `WACA_LY_D`),
 * sinon l'unique élément `D` de l'article ; `null` quand rien ne le désigne sans ambiguïté
 */
export function elementPorte (tables: TablesPoignee | undefined, p: Piece, article?: string): ElementArticle | null {
  const elems = tables?.anglelem ?? []
  const hier = p.hierarchie?.trim()
  if (hier) {
    const e = elems.find((x) => x.TREEID === hier && (!article || x.NAME === article)) ?? elems.find((x) => x.TREEID === hier)
    if (e) return e
  }
  const portes = elems.filter((x) => x.PARTTYPE === 'D' && (!article || x.NAME === article))
  return portes.length === 1 ? portes[0] : null
}

export type SourceHauteur = 'maninfo' | 'repli'

export interface HauteurPoignee {
  /** la hauteur du centre de la poignée depuis le bas de la porte, mm */
  hauteur: number
  source: SourceHauteur
  /** le descripteur du `MANINFO` (`DS_LD_PULL_OS_D1`), ou `null` (division en clair, ou rien) */
  descripteur: string | null
  /** la division retenue (`(1050 - $BASE_HEIGHT)mm:1`) et sa forme résolue (`970mm:1`) */
  lindiv: string | null
  resolu: string | null
  /** pourquoi c'est le repli, quand c'est le repli */
  raison: string | null
}

/** la hauteur de la poignée par le `MANINFO` de l'élément de porte, sinon le repli `D1` (1 050 − socle), dit */
export function hauteurPoignee (p: Piece, portees: Portee[], tables: TablesPoignee | undefined, hauteurPorte: number, article?: string): HauteurPoignee {
  const repli = HAUTEUR_POIGNEE_SOL - (nombre(lirePortees(portees, 'BASE_HEIGHT')) ?? 0)
  const parRepli = (raison: string, extra: Partial<HauteurPoignee> = {}): HauteurPoignee => ({ hauteur: repli, source: 'repli', descripteur: null, lindiv: null, resolu: null, ...extra, raison })
  if (!tables || (!tables.anglelem && !tables.descriptors)) return parRepli(`article-data de ${article ?? "l'article"} non chargé`)
  const e = elementPorte(tables, p, article)
  if (!e) return parRepli(`aucun élément de porte pour ${p.hierarchie ?? p.nom} dans ${article ?? 'le graphe'}`)
  const man = String(e.MANINFO ?? '').trim()
  if (man === '') return parRepli(`MANINFO vide sur l'élément ${e.TREEID ?? '?'} de ${e.NAME ?? article ?? '?'}`)
  let lindiv = man
  let descripteur: string | null = null
  if (man.startsWith('#')) {
    descripteur = man.slice(1)
    const d = (tables.descriptors ?? []).find((x) => x.descriptor?.NAME === descripteur)
    if (!d) return parRepli(`descripteur ${descripteur} absent du graphe`, { descripteur })
    const ev = evaluerDescripteur(d, portees)
    if (!ev) return parRepli(`descripteur ${descripteur} sans nœud`, { descripteur })
    lindiv = ev.lindiv
  }
  const div = premiereDivision(lindiv, hauteurPorte, portees)
  if (div.valeur === null) return parRepli(div.raison ?? 'division non calculée', { descripteur, lindiv, resolu: div.resolu })
  return { hauteur: div.valeur, source: 'maninfo', descripteur, lindiv, resolu: div.resolu, raison: null }
}

/** un point (u, v) est-il dans un contour (rayon vers +u) */
export function dansContour (contour: { x: number; y: number }[], u: number, v: number): boolean {
  let dedans = false
  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    const a = contour[i]
    const b = contour[j]
    if (a.y > v !== b.y > v && u < ((b.x - a.x) * (v - a.y)) / (b.y - a.y) + a.x) dedans = !dedans
  }
  return dedans
}

/**
 * LA GARDE HAUTE D'IMOS (24/09 ; mesurée : `orchestre/revues/2026-09-24_alignement-poignees-imos.md` § 2.4 — 57 portes lues par d3, MT Set 2
 * d'Astra à 10⁻⁹ mm ; ligne de d11 08:5x) : le principe `KI_PH_Bottom` (branché sur `Pull_Middle`) tire la poignée sur la ligne de 1 050 du
 * sol fini, sauf si le haut de la porte À L'APLOMB DE LA POIGNÉE moins `DIST_TOP` (500) est plus bas : elle s'arrête alors à cette butée —
 * 928,771 sur la porte coupée `_Q4L` du mur de référence (haut 1 428,771 à 75 du bord libre). La garde basse (200) n'a jamais été éprouvée :
 * pas appliquée ici.
 */
export const GARDE_HAUTE_POIGNEE = 500

/**
 * le haut d'une porte à contour sur la verticale d'abscisse `x` (le repère de la position : x à droite, z en haut) : le plus haut point où
 * cette verticale coupe le contour posé ; `null` sans contour ou hors de la porte
 */
export function hautALaplomb (p: Piece, x: number): number | null {
  if (!estContour(p)) return null
  const m = matricePiece(p)
  const points = p.contour.map((s) => new THREE.Vector3(s.x, s.y, 0).applyMatrix4(m))
  let haut: number | null = null
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const [x0, x1] = a.x <= b.x ? [a.x, b.x] : [b.x, a.x]
    if (x < x0 - 1e-6 || x > x1 + 1e-6) continue
    // une arête verticale (à cette abscisse) : ses deux bouts ; sinon le point de l'arête à cette abscisse
    const zs = Math.abs(b.x - a.x) < 1e-9 ? [a.z, b.z] : [a.z + ((x - a.x) * (b.z - a.z)) / (b.x - a.x)]
    for (const z of zs) haut = haut === null ? z : Math.max(haut, z)
  }
  return haut
}

export interface PosePoignee {
  /** le point de pose dans le repère de la position (mm) */
  position: [number, number, number]
  quaternion: [number, number, number, number]
  /** la hauteur retenue depuis le bas de la porte (mm), et si elle a dû descendre à la butée d'imos (le haut à l'aplomb − 500) */
  hauteurPorte: number
  descendue: boolean
  /** la butée d'imos quand elle a joué : le haut de la porte à l'aplomb de la poignée (depuis le bas de la porte) et la garde */
  butee?: { hautALaplomb: number; garde: number }
  /** d'où vient la hauteur (MANINFO ou repli), et pourquoi */
  hauteur: HauteurPoignee
  glb: string | null
  pullX: number
  pullZ: number
  baseHeight: number | null
}

/** la pose de la poignée d'une porte : le point et l'orientation du designer d'Otman (1.0.102), transposés dans le repère de la position */
export function posePoignee (p: Piece, cote: CoteCharnieres, portees: Portee[], tables?: TablesPoignee, article?: string): PosePoignee {
  const m = matricePiece(p)
  const boite = new THREE.Box3()
  for (const s of sommetsLocaux(p)) boite.expandByPoint(s.clone().applyMatrix4(m))
  const pullX = nombre(lirePortees(portees, 'PULL_X')) ?? 0
  const pullZ = nombre(lirePortees(portees, 'PULL_Z')) ?? 0
  const pullRot = nombre(lirePortees(portees, 'PULL_ROT')) ?? 0
  const baseHeight = nombre(lirePortees(portees, 'BASE_HEIGHT'))
  const glbBrut = lirePortees(portees, 'PULL_GLB')
  const glb = typeof glbBrut === 'string' && glbBrut.trim() !== '' ? glbBrut.trim() : null

  // 1.0.102 : le centre de la poignée à PULL_X du bord libre, à PULL_Z devant la face
  const x = cote === 'gauche' ? boite.max.x - pullX : boite.min.x + pullX
  const y = boite.min.y - pullZ
  const hauteur = hauteurPoignee(p, portees, tables, boite.max.z - boite.min.z, article)
  let hauteurPorte = hauteur.hauteur
  let descendue = false
  let butee: PosePoignee['butee']
  // une porte coupée : la GARDE HAUTE d'imos (24/09) — la poignée s'arrête à 500 sous le haut de la porte pris à son aplomb, quand ce haut est
  // trop bas pour la ligne ; avant, une règle à nous (descendre par pas de 20 mm pour rester dans le contour, marge 60)
  const haut = hautALaplomb(p, x)
  if (haut !== null) {
    const hautLocal = haut - boite.min.z
    const limite = hautLocal - GARDE_HAUTE_POIGNEE
    if (limite < hauteurPorte) {
      hauteurPorte = limite
      descendue = true
      butee = { hautALaplomb: hautLocal, garde: GARDE_HAUTE_POIGNEE }
    }
  }
  const z = boite.min.z + hauteurPorte

  // le repère du panneau du designer (X haut, Y gauche, Z avant) dans celui de la position (x droite, y arrière, z haut), puis sa rotation
  const base = new THREE.Matrix4().set(0, -1, 0, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0, 0, 1)
  const theta = Math.PI / 2 + (cote === 'droite' ? Math.PI : 0) + (pullRot * Math.PI) / 180
  const rotation = base.multiply(new THREE.Matrix4().makeRotationZ(theta))
  const q = new THREE.Quaternion().setFromRotationMatrix(rotation)
  return { position: [x, y, z], quaternion: [q.x, q.y, q.z, q.w], hauteurPorte, descendue, ...(butee ? { butee } : {}), hauteur, glb, pullX, pullZ, baseHeight }
}
