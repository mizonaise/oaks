/**
 * LES PORTES SUR LEUR FAÇADE (d10, board de situations du 23/09) : le contour d'une porte, projeté sur la façade — `u` horizontal le long
 * de la façade, `v` la hauteur au-dessus du sol fini, en mm — depuis ce que la page a dessiné :
 *
 *  - **une porte de fox-cad** (HEX, HEX 2) : la pièce telle que l'API la rend (`/api/foxcad/calcul/lot` : contour dans son plan local,
 *    point d'insertion, trois angles, `charnieres`), posée par `matricePiece` (la géométrie du front, `src/lib/foxcad/geometrie.ts`) puis
 *    par la matrice monde du groupe intérieur de sa position (`fox-cad <ligne> <article>` → son premier enfant : le repère du Set, en mètres
 *    dans la scène) — rien n'est recalculé : les sommets sont ceux de l'API ;
 *  - **une porte du designer d'Otman** (F, L : formes de production, fox-cad n'y calcule rien) : la boîte du capteur de `DoorAnimator` (son
 *    premier enfant, invisible, `BoxGeometry`), en bornes monde — un rectangle, sans côté de charnières (sur un rectangle le haut est le même
 *    partout : le côté ne change pas le verdict).
 *
 * Le sol fini est le y = 0 de la scène (mesuré le 23/09 : les socles de HEX partent de 0, le Set d'une colonne est posé à 80 = `BASE_HEIGHT`).
 */
import * as THREE from 'three'
import { estContour, estPorte, matricePiece } from '../../src/lib/foxcad/geometrie.ts'

/** une sous-pièce de façade multipart (`0.1.0.mp6`) n'est pas une porte à elle seule : son parent l'est */
export const estSousPiece = (p) => /\.mp\d+$/.test(p?.hierarchie ?? '')

/** les portes d'une position fox-cad : `estPorte` du front, hors sous-pièces de façade multipart */
export const portesDePieces = (pieces) => (pieces ?? []).filter((p) => estPorte(p) && !estSousPiece(p))

/** les sommets locaux de la face d'une pièce (z = 0) : son contour, sinon son rectangle largeur × profondeur */
function sommetsFace (p) {
  if (estContour(p)) return p.contour.map((s) => new THREE.Vector3(s.x, s.y, 0))
  const { largeur: w, profondeur: d } = p.cotes
  return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(w, 0, 0), new THREE.Vector3(w, d, 0), new THREE.Vector3(0, d, 0)]
}

/**
 * Le contour d'une porte de fox-cad sur sa façade. `elementsGroupe` : les 16 nombres (`Matrix4.elements`, colonne par colonne) de la matrice
 * monde du groupe intérieur de sa position. L'axe `u` est la direction monde de l'axe x du Set (horizontale) : `charnieres` du moteur
 * (« gauche » = x minimal du Set) se lit donc tel quel en `u`.
 */
export function contourPorteFoxCad (piece, elementsGroupe) {
  const G = new THREE.Matrix4().fromArray(elementsGroupe)
  const M = G.clone().multiply(matricePiece(piece))
  const axeU = new THREE.Vector3(1, 0, 0).transformDirection(G)
  axeU.y = 0
  axeU.normalize()
  let ancre = null
  const poly = sommetsFace(piece).map((s) => {
    const m = s.clone().applyMatrix4(M).multiplyScalar(1000)
    const q = { u: m.dot(axeU), v: m.y }
    if (!ancre) ancre = { ...q, x: m.x, y: m.y, z: m.z }
    return q
  })
  return { poly, charnieres: piece.charnieres === 'gauche' || piece.charnieres === 'droite' ? piece.charnieres : null, axeU: [axeU.x, axeU.y, axeU.z], ancre }
}

/**
 * Le point MONDE (mm) d'un point `(u, v)` de la façade d'une porte — le chemin inverse du contour, pour dessiner sur une capture : une
 * porte de fox-cad par son ancre (un sommet de sa face, en monde, avec son `(u, v)`) et l'axe `u` (horizontal) ; une porte du designer
 * par son plan (x pour une porte de face, z pour une porte de côté). `null` sans de quoi le poser.
 */
export function pointMonde (porte, u, v) {
  if (porte.ancre && porte.axeU) {
    const a = porte.ancre
    const d = u - a.u
    return [a.x + d * porte.axeU[0], v, a.z + d * porte.axeU[2]]
  }
  if (porte.orientation && Number.isFinite(porte.plan)) return porte.orientation === 'côté' ? [porte.plan, v, u] : [u, v, porte.plan]
  return null
}

/**
 * Une poignée DESSINÉE par la page (monde, mm) vue sur la façade d'une porte : `{ u, v }` par le même axe que son contour — l'axe du Set
 * pour une porte de fox-cad, x ou z pour une porte du designer
 */
export function projeterSurFacade (pos, porte) {
  if (porte.axeU) return { u: pos[0] * porte.axeU[0] + pos[1] * porte.axeU[1] + pos[2] * porte.axeU[2], v: pos[1] }
  return { u: porte.orientation === 'côté' ? pos[2] : pos[0], v: pos[1] }
}

/**
 * Le contour d'une porte du designer (F, L) : la boîte monde de son capteur, en mm `{ min: [x, y, z], max: [x, y, z] }` — la façade est le
 * plan vertical de la plus grande étendue horizontale (x pour une porte de face, z pour une porte de l'aile d'un L).
 */
export function contourPorteDesigner (boite) {
  const [x0, y0, z0] = boite.min
  const [x1, y1, z1] = boite.max
  const deFace = x1 - x0 >= z1 - z0
  const [u0, u1] = deFace ? [x0, x1] : [z0, z1]
  return {
    poly: [{ u: u0, v: y0 }, { u: u1, v: y0 }, { u: u1, v: y1 }, { u: u0, v: y1 }],
    charnieres: null,
    orientation: deFace ? 'face' : 'côté',
    /** le plan de la façade : la coordonnée mince (z d'une porte de face, x d'une porte de côté) */
    plan: deFace ? (z0 + z1) / 2 : (x0 + x1) / 2
  }
}
