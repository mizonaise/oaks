/**
 * La géométrie d'une pièce de fox-cad, PORTÉE de `fox-cad-viewer/src/rendu/geometrie.ts` (elle-même portée du viewer three.js de fox-cad) :
 * la partie sans DOM ni scène. Le rendu ne recalcule jamais une cote : il consomme les `Piece[]` de l'API (largeur × profondeur × hauteur,
 * point d'insertion, trois angles, contour éventuel) et rien d'autre.
 *
 * Repère du moteur : x à droite, y vers l'arrière (depuis la façade), z en haut. La scène d'Otman est « Y en haut, Z vers le spectateur » :
 * c'est le GROUPE qui porte les pièces (`FoxCadPieces`) qui tourne de −90° autour de X — la même rotation que `ArticleInBox` applique au
 * designer d'Otman, dont le repère est celui d'imos.
 *
 * Rotation d'une pièce : la boîte locale [0..largeur] × [0..profondeur] × [0..hauteur] a son coin à l'origine ; orx autour de X, PUIS ory
 * autour de Y, PUIS orz autour de Z (axes fixes), puis la translation au point d'insertion (+ l'origine du sous-article). Un contour est
 * extrudé de `hauteur` (son épaisseur) dans son plan local x-y.
 */
import * as THREE from 'three'
import type { Piece, Vecteur3 } from './types'
import { ECHELLE_DEFAUT_MM } from '../textures/echelle'
import { uvEchelleReelle } from '../textures/uv'

const rad = (deg: number): number => (deg * Math.PI) / 180

/** la matrice de pose : T · Rz · Ry · Rx (Rx s'applique en premier au point local) ; une pièce de sous-article ajoute l'origine de sa cellule */
export function matricePiece(p: Piece): THREE.Matrix4 {
  const o = p.sousArticle?.origine ?? { x: 0, y: 0, z: 0 }
  return new THREE.Matrix4()
    .makeTranslation(p.position.x + o.x, p.position.y + o.y, p.position.z + o.z)
    .multiply(new THREE.Matrix4().makeRotationZ(rad(p.orientation.z)))
    .multiply(new THREE.Matrix4().makeRotationY(rad(p.orientation.y)))
    .multiply(new THREE.Matrix4().makeRotationX(rad(p.orientation.x)))
}

/** une pièce non rectangulaire (porte coupée le long du rampant, dos, joue à contour) : son contour fini, dans son plan local x-y */
export const estContour = (p: Piece): p is Piece & { contour: Vecteur3[] } => p.contour !== undefined && p.contour.length >= 3

/** une cote nulle ou négative : la pièce « vide » d'imos (`PD_EMPTY`, épaisseur 0) */
export const aUneCoteNulle = (p: Piece): boolean => p.cotes.largeur <= 0 || p.cotes.profondeur <= 0 || p.cotes.hauteur <= 0

/**
 * La pièce VIDE d'imos — une cote nulle ou négative, ou la définition `PD_EMPTY` (le côté partagé de deux modules, ou le côté contre le mur,
 * `CP_SPO_WALL` : une pièce dans le compte, aucune matière). Elle n'est JAMAIS dessinée (B4, 22/09, mot de Dorian : dessinée en plan de 0,01 mm,
 * elle faisait un « voile » translucide sur les modules) et JAMAIS retirée du compte : le badge la compte, le détail la nomme « vide, non dessinée ».
 * Le contrat ne porte pas de `FUNCT` : seules la cote et la définition le disent.
 */
export const estVide = (p: Piece): boolean => aUneCoteNulle(p) || /^PD_EMPTY/i.test(p.definition ?? '')

export interface Pose {
  position: [number, number, number]
  quaternion: [number, number, number, number]
}

/** la même pose que `matricePiece`, décomposée en position + quaternion : ce que React Three Fiber prend en propriétés */
export function posePiece(p: Piece): Pose {
  const position = new THREE.Vector3()
  const quaternion = new THREE.Quaternion()
  const echelle = new THREE.Vector3()
  matricePiece(p).decompose(position, quaternion, echelle)
  return { position: [position.x, position.y, position.z], quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] }
}

/**
 * LE FIL QUE LA PIÈCE PORTE (24/09, ligne du lead 08:5x : « le viewer AFFICHE le fil de la pièce, sans règle propre ») : `Piece.fil.angle`
 * (contrat v0.2.42 : l'angle dans le repère LOCAL de la pièce, 0 = le long de x — `cotes.largeur` —, 90 = le long de y ; imos ne connaît que
 * 0 / 90) ; vrai quand il vaut 90. Lu même quand `present` est faux : sur un décor uni l'angle ne se voit pas, et sur une pièce revêtue le
 * `present` servi est celui du NOYAU (`IDBGPL.MATGRID` : 0 sous un HPL noyer — mesuré le 24/09 sur la plinthe et le cadre FR_08) alors que
 * c'est la surface qui se voit. Absent ou 0 : le fil suit x (les images bois ont leurs veines le long de u — `lib/textures/uv.ts`).
 */
export const filLeLongDeY = (p: Pick<Piece, 'fil'>): boolean => {
  const a = p.fil?.angle
  if (typeof a !== 'number' || !Number.isFinite(a)) return false
  const modulo = ((a % 180) + 180) % 180
  return Math.abs(modulo - 90) < 1
}

/**
 * la géométrie locale d'une pièce : son contour extrudé de son épaisseur, sinon sa boîte, coin local à l'origine. Ses UV sont à l'ÉCHELLE
 * RÉELLE (nuit du 22 au 23/09) : mm / `echelleMm` par projection selon la normale dominante (`lib/textures/uv.ts`) — avant, les UV [0, 1]
 * de `BoxGeometry` et un contour ramené dans [0, 1] (`normaliserUv`, retiré) étiraient l'image entière sur chaque face, quelle que soit sa
 * taille. `echelleMm` = le `SCALEFAKT` du principe de couleur d'imos, ou le défaut (dit par l'appelant). Le fil : celui que la pièce porte
 * (`filLeLongDeY`, 24/09).
 */
export function geometriePiece(p: Piece, echelleMm: number = ECHELLE_DEFAUT_MM): THREE.BufferGeometry {
  const { largeur: w, profondeur: d, hauteur: h } = p.cotes
  const filY = filLeLongDeY(p)
  if (estContour(p)) {
    const forme = new THREE.Shape(p.contour.map((s) => new THREE.Vector2(s.x, s.y)))
    return uvEchelleReelle(new THREE.ExtrudeGeometry(forme, { depth: Math.max(h, 0.0001), bevelEnabled: false }), echelleMm, 1, filY)
  }
  // une cote à 0 (PD_EMPTY) ferait une géométrie dégénérée : un plan de 0,01 mm, invisible de tranche, jamais un NaN
  const sx = Math.max(w, 0.01)
  const sy = Math.max(d, 0.01)
  const sz = Math.max(h, 0.01)
  return uvEchelleReelle(new THREE.BoxGeometry(sx, sy, sz).translate(sx / 2, sy / 2, sz / 2), echelleMm, 1, filY)
}

/**
 * LES CÔTÉS D'UN CONTOUR, numérotés comme imos (d1, `d1-vers-d5` 23/09 16:3x ; mesuré sur le lot MD-corrige d'Astra, `idbprf.CONTLEN`) :
 * le côté k est le segment qui FINIT au k-ième point — le côté 1 va du dernier point au premier. Sur un rectangle écrit comme imos
 * ((w, 0), (w, d), (0, d), (0, 0)) c'est la règle du contrat : 1 = y = 0, 2 = x = w, 3 = y = d, 4 = x = 0 ; sur la traverse en pente à six
 * coins, six côtés, le chant d'imos se lit au sien.
 */
export interface CoteContour {
  cote: number
  debut: THREE.Vector2
  fin: THREE.Vector2
  longueur: number
}

export function cotesContour(contour: ReadonlyArray<Pick<Vecteur3, 'x' | 'y'>>): CoteContour[] {
  const n = contour.length
  return contour.map((s, i) => {
    const a = contour[(i + n - 1) % n]
    const debut = new THREE.Vector2(a.x, a.y)
    const fin = new THREE.Vector2(s.x, s.y)
    return { cote: i + 1, debut, fin, longueur: debut.distanceTo(fin) }
  })
}

/** l'aire signée d'un contour dans son plan (positive quand il tourne dans le sens direct) */
export function aireContour(contour: ReadonlyArray<Pick<Vecteur3, 'x' | 'y'>>): number {
  let a = 0
  for (let i = 0; i < contour.length; i++) {
    const p = contour[i]
    const q = contour[(i + 1) % contour.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

/** les groupes du prisme d'un contour : le dessus (z = épaisseur, la face avant une fois posée), le dessous, puis un groupe par côté k */
export const GROUPE_PRISME = { dessus: 0, dessous: 1, cote: (k: number) => 1 + k } as const

/**
 * LE PRISME D'UN CONTOUR, UN GROUPE PAR CÔTÉ (23/09 nuit, la façade coupée préparée) : le contour extrudé de `hauteur` comme
 * `geometriePiece`, mais chaque côté k (`cotesContour`) a son groupe de matériau — une traverse en pente porte son chant sur SON côté, le
 * pourtour d'une façade coupée se dessine sans ses faces. `ExtrudeGeometry` met tous les côtés dans un seul groupe (et retourne un contour
 * écrit dans le sens horaire) : il ne sait pas dire quel côté est lequel. Normales vers l'extérieur quel que soit le sens du contour ; UV à
 * l'échelle réelle comme toute pièce ; `filY` : le fil que la pièce porte le long de son axe y (`filLeLongDeY`).
 */
export function geometriePrisme(contour: ReadonlyArray<Pick<Vecteur3, 'x' | 'y'>>, hauteur: number, echelleMm: number = ECHELLE_DEFAUT_MM, filY = false): THREE.BufferGeometry {
  const h = Math.max(hauteur, 0.0001)
  const points = contour.map((s) => new THREE.Vector2(s.x, s.y))
  const direct = aireContour(contour) >= 0
  const positions: number[] = []
  const g = new THREE.BufferGeometry()
  // les deux faces : la triangulation du contour (earcut), dans le sens direct vue de +z pour le dessus, retournée pour le dessous
  const triangles = THREE.ShapeUtils.triangulateShape(points, [])
  const face = (z: number, versLeHaut: boolean) => {
    const debut = positions.length / 3
    for (const [a, b, c] of triangles) {
      const ordre = versLeHaut === direct ? [a, b, c] : [a, c, b]
      for (const i of ordre) positions.push(points[i].x, points[i].y, z)
    }
    return { debut, compte: positions.length / 3 - debut }
  }
  const dessus = face(h, true)
  const dessous = face(0, false)
  g.addGroup(dessus.debut, dessus.compte, GROUPE_PRISME.dessus)
  g.addGroup(dessous.debut, dessous.compte, GROUPE_PRISME.dessous)
  // un quadrilatère par côté, tourné vers l'extérieur : à droite du segment quand le contour tourne dans le sens direct, à gauche sinon
  for (const c of cotesContour(contour)) {
    const debut = positions.length / 3
    const a0 = [c.debut.x, c.debut.y, 0]
    const b0 = [c.fin.x, c.fin.y, 0]
    const b1 = [c.fin.x, c.fin.y, h]
    const a1 = [c.debut.x, c.debut.y, h]
    const quad = direct ? [a0, b0, b1, a0, b1, a1] : [a0, b1, b0, a0, a1, b1]
    for (const v of quad) positions.push(v[0], v[1], v[2])
    g.addGroup(debut, 6, GROUPE_PRISME.cote(c.cote))
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.computeVertexNormals()
  return uvEchelleReelle(g, echelleMm, 1, filY)
}

/**
 * LA TOILE d'une façade à cadre (la surface d'épaisseur 0, `SRF_FR_3_TOP_EEEE`) en plan, face vers +z (l'avant une fois posée) : son contour
 * quand le moteur le sert — le pentagone d'une colonne coupée — sinon le rectangle largeur × profondeur, coin à l'origine. UV à l'échelle réelle.
 */
export function geometrieToile(p: Pick<Piece, 'cotes' | 'contour'>, echelleMm: number = ECHELLE_DEFAUT_MM): THREE.BufferGeometry {
  if (p.contour && p.contour.length >= 3) return uvEchelleReelle(new THREE.ShapeGeometry(new THREE.Shape(p.contour.map((s) => new THREE.Vector2(s.x, s.y)))), echelleMm)
  const { largeur: w, profondeur: d } = p.cotes
  return uvEchelleReelle(new THREE.PlaneGeometry(Math.max(w, 0.01), Math.max(d, 0.01)).translate(w / 2, d / 2, 0), echelleMm)
}

/** les sommets locaux qui bornent une pièce : les 8 coins de sa boîte, ou son contour à z = 0 et z = hauteur */
export function sommetsLocaux(p: Piece): THREE.Vector3[] {
  const h = p.cotes.hauteur
  if (estContour(p)) return p.contour.flatMap((s) => [new THREE.Vector3(s.x, s.y, 0), new THREE.Vector3(s.x, s.y, h)])
  const { largeur: w, profondeur: d } = p.cotes
  const out: THREE.Vector3[] = []
  for (const x of [0, w]) for (const y of [0, d]) for (const z of [0, h]) out.push(new THREE.Vector3(x, y, z))
  return out
}

/** une porte : une pièce dont le nom le dit (`Door`, `front`, « porte ») — pas un tiroir */
export const estPorte = (p: Piece): boolean => /\b(door|porte|front)\b/i.test(p.nom) && !/drawer|tiroir/i.test(p.nom)

export type CoteCharnieres = 'gauche' | 'droite'

/** le côté des charnières : `Piece.charnieres` (résolu par le moteur), à défaut le nom (« Door Right ») ; `undefined` quand rien ne le dit */
export function coteCharnieres(p: Piece): CoteCharnieres | undefined {
  if (p.charnieres === 'gauche' || p.charnieres === 'droite') return p.charnieres
  if (p.charnieres !== undefined) return undefined
  if (/\b(right|droite?)\b/i.test(p.nom)) return 'droite'
  if (/\b(left|gauche)\b/i.test(p.nom)) return 'gauche'
  return undefined
}

/**
 * Le pivot d'une porte dans le repère de sa position : l'arête verticale de ses charnières, sur sa face avant (y minimal) — x minimal pour des
 * charnières à gauche, maximal à droite — et l'angle d'ouverture (radians) qui la fait tourner VERS L'AVANT (−y).
 */
export function pivotPorte(p: Piece, cote: CoteCharnieres, ouverture = Math.PI / 2): { pivot: [number, number, number]; angle: number } {
  const m = matricePiece(p)
  const boite = new THREE.Box3()
  for (const s of sommetsLocaux(p)) boite.expandByPoint(s.clone().applyMatrix4(m))
  const x = cote === 'droite' ? boite.max.x : boite.min.x
  return { pivot: [x, boite.min.y, boite.min.z], angle: cote === 'droite' ? ouverture : -ouverture }
}
