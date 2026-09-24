// LA PORTE AU SEUL COIN COUPÉ (d5, 24/09/2026 — ligne du lead 08:5x ③, mot de Dorian 08:4x : « la troisième porte en partant de la gauche a
// encore un coin droit ») : là où le rampant FINIT dans une colonne, la porte de cette colonne doit être coupée au coin — un petit triangle —,
// pas seulement une colonne entière sous le rampant. La règle est au moteur (d1 : servir le contour de cette porte) ; ce test prouve que
// l'écran, lui, la rend déjà, par ses trois chemins : ① la porte d'Otman découpée par le contour (`plansPorte` : un plan, la seule arête en
// pente) ; ② une façade à cadre servie avec ses enfants PLATS sous un parent au coin coupé → la garde du pourtour rend la main à Otman,
// découpée par le parent ; ③ une porte pleine à contour (FR_01, une seule pièce) → le prisme du contour, un côté par segment.
// Mesuré sur la configuration la plus proche de la sienne (HEX pente gauche 1 500 / 1 500, 4 m, 7 colonnes, FR_08 ; fox-cad 61f81c9, en
// public le 24/09) : le rampant finit à x = −882, DANS la colonne 2 (−1 409 → −848), et le moteur y sert un parent à cinq sommets ; la
// colonne 3 commence à −845, au-delà : rectangulaire. Où finit le rampant sur SA largeur, et si la bande du filler de rampant (80) doit
// entamer le coin de la porte suivante : la règle du moteur (d1 / d11).
// Joué par `npm test`, sans réseau.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { cotesContour, geometriePiece, geometriePrisme, GROUPE_PRISME } from './geometrie.ts'
import { distanceAuPlan, plansPorte } from './decoupe.ts'
import { facadeCoupeeNonDessinee, facadesMultipart, renduFacadeMultipart, sousPiecesHorsPourtour } from './multipart.ts'

// une porte de 2 340 × 587 posée comme celles des colonnes de HEX (90 ; −90 ; 0 ; x = la hauteur, y = la largeur depuis le bord droit),
// son coin haut du côté du rampant coupé par un triangle de 60 (en hauteur) × 90 (en largeur)
const POSE = { position: { x: 588.5, y: -2.5, z: 0 }, orientation: { x: 90, y: -90, z: 0 } }
const CONTOUR_COIN = [
  { x: 2340, y: 0, z: 0 },
  { x: 2340, y: 497, z: 0 },
  { x: 2280, y: 587, z: 0 },
  { x: 0, y: 587, z: 0 },
  { x: 0, y: 0, z: 0 },
]
const BOITE = { w: 590, h: 2340 }

test('① la porte d Otman DÉCOUPÉE au seul coin : un plan (l arête en pente), qui n enlève que le triangle', () => {
  const porte = { nom: 'Door Right', definition: 'PD_1_FR_1111', cotes: { largeur: 2340, profondeur: 587, hauteur: 18 }, ...POSE, contour: CONTOUR_COIN }
  const plans = plansPorte(porte, BOITE)
  assert.equal(plans.length, 1, 'le haut et les côtés restent ceux du rectangle : un seul plan')
  // dans le repère centré de la zone : X = x − 295, Y = z − 1 170 ; le coin coupé est en haut, du côté y = 587 (à gauche une fois posé)
  const [p] = plans
  const coin = { x: -295 + 1.5 + 5, y: 1170 - 5 } // tout près du coin haut gauche de la porte
  const centre = { x: 0, y: 0 }
  const basDroit = { x: 250, y: -1100 }
  assert.ok(distanceAuPlan(p, coin.x, coin.y, 0) > 0, 'le coin est enlevé')
  assert.ok(distanceAuPlan(p, centre.x, centre.y, 0) < 0, 'le reste de la porte demeure')
  assert.ok(distanceAuPlan(p, basDroit.x, basDroit.y, 0) < 0)
  // le triangle enlevé : l'arête fait √(60² + 90²) ≈ 108,2 mm
  const [[ax, ay], [bx, by]] = p.arete
  assert.ok(Math.abs(Math.hypot(bx - ax, by - ay) - Math.hypot(60, 90)) < 0.01)
})

test('② une façade à cadre servie avec des enfants PLATS sous un parent au coin coupé : la garde rend la main à Otman, découpée par le parent', () => {
  const parent = { nom: 'front', hierarchie: '0.0', definition: 'MP_1_FR_SHELL_FR08_LAM', cotes: { largeur: 2340, profondeur: 587, hauteur: 22.4 }, ...POSE, contour: CONTOUR_COIN }
  // la traverse haute plate, d'un bord à l'autre (23 de haut, en haut de la porte) : son bout gauche sort du triangle
  const traverse = { nom: 'front', hierarchie: '0.0.mp4', definition: 'PD_1_FR_EE1E', cotes: { largeur: 23, profondeur: 587, hauteur: 16.4 }, position: { x: 588.5, y: -7.5, z: 2317 }, orientation: POSE.orientation, matiere: { dessus: 'UN_HPL_HGP_0H251_W06_0_7' } }
  const montant = { nom: 'front', hierarchie: '0.0.mp1', definition: 'PD_1_FR_EE1E', cotes: { largeur: 2340, profondeur: 23, hauteur: 16.4 }, position: { x: 588.5, y: -7.5, z: 0 }, orientation: POSE.orientation, matiere: { dessus: 'UN_HPL_HGP_0H251_W06_0_7' } }
  const pieces = [parent, montant, traverse]
  const [f] = facadesMultipart(pieces)
  const hors = sousPiecesHorsPourtour(f, pieces)
  assert.deepEqual(hors.map((h) => h.hierarchie), ['0.0.mp4'], 'la traverse plate sort du coin coupé ; le montant du bord droit tient')
  assert.ok(hors[0].depassementMm > 10 && hors[0].depassementMm < 60, `de quelques centimètres : ${hors[0].depassementMm}`)
  assert.equal(renduFacadeMultipart(f, pieces, {}).parFoxCad, false)
  const c = facadeCoupeeNonDessinee({ article: 'WACA_LY_D', pieces, manques: [] }, {})
  assert.equal(c?.porte, parent)
  assert.equal(plansPorte(c.porte, BOITE).length, 1, 'le parent découpe la porte d Otman au seul coin')
})

test('③ une porte pleine à contour (une seule pièce) : le prisme de son contour, cinq côtés, le petit côté en pente compris', () => {
  const porte = { nom: 'Door Right', definition: 'PD_1_FR_1111', cotes: { largeur: 2340, profondeur: 587, hauteur: 18 }, ...POSE, contour: CONTOUR_COIN }
  const g = geometriePiece(porte)
  g.computeBoundingBox()
  assert.ok(Math.abs(g.boundingBox.max.x - 2340) < 1e-6 && Math.abs(g.boundingBox.max.y - 587) < 1e-6)
  const prisme = geometriePrisme(CONTOUR_COIN, 18)
  assert.equal(prisme.groups.length, 2 + 5)
  const cotes = cotesContour(CONTOUR_COIN)
  const pente = cotes.find((c) => Math.abs(c.longueur - Math.hypot(60, 90)) < 0.01)
  assert.ok(pente, 'le côté du coin coupé existe, à sa longueur')
  assert.ok(prisme.groups.some((gr) => gr.materialIndex === GROUPE_PRISME.cote(pente.cote)))
  // l'aire du dessus = le rectangle moins le triangle
  const aire = 2340 * 587 - (60 * 90) / 2
  const pos = prisme.getAttribute('position')
  const dessus = prisme.groups.find((gr) => gr.materialIndex === GROUPE_PRISME.dessus)
  let a = 0
  for (let i = dessus.start; i < dessus.start + dessus.count; i += 3) a += new THREE.Triangle(new THREE.Vector3().fromBufferAttribute(pos, i), new THREE.Vector3().fromBufferAttribute(pos, i + 1), new THREE.Vector3().fromBufferAttribute(pos, i + 2)).getArea()
  assert.ok(Math.abs(a - aire) < 1e-3 * aire, `aire ${a} contre ${aire}`)
})
