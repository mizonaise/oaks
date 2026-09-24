// La façade spéciale coupée par le contour de la porte de fox-cad (d5, 23/09) : le module plein, la position sans porte, les plans depuis le
// contour, la coupe d'une géométrie avec son chant refermé, les arêtes. Joué par `npm test` (node --test ; node 24 lit le TypeScript).
// Les portes sont celles que l'API fox-cad (4311, fox-cad du 23/09) a rendues pour les colonnes coupées de HEX avec la porte pleine
// (`_tmp/2026-09-23/portes-pente/hex-fr08.porte-pleine.reponse.json`, recopiées ici telles quelles).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {
  aretesDeBord,
  articlePleinOtman,
  chainerBoucles,
  contourDansLaZone,
  decouperGeometrie,
  decouperSegments,
  distanceAuPlan,
  facadeSansPorte,
  lotPortePleine,
  planCoupeBoite,
  plansPorte,
  planThree,
  volume,
} from '../../src/lib/foxcad/decoupe.ts'

/** la porte pleine de WACA_LY_D_Q4L (HEX, pente à gauche) : 4 sommets, charnières à droite */
const PORTE_Q4L = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  cotes: { largeur: 1888.281, profondeur: 586, hauteur: 16.4 },
  position: { x: 588, y: -2.5, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  charnieres: 'droite',
  contour: [
    { x: 1888.281, y: 0, z: 0 },
    { x: 1364.149, y: 586, z: 0 },
    { x: 0, y: 586, z: 0 },
    { x: 0, y: 0, z: 0 },
  ],
}
/** la porte pleine de WACA_LY_D_H5L : 5 sommets (83 mm de plat en haut à droite) */
const PORTE_H5L = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  cotes: { largeur: 2340, profondeur: 587, hauteur: 16.4 },
  position: { x: 588.5, y: -2.5, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  charnieres: 'droite',
  contour: [
    { x: 2340, y: 0, z: 0 },
    { x: 2340, y: 83.22, z: 0 },
    { x: 1889.399, y: 587, z: 0 },
    { x: 0, y: 587, z: 0 },
    { x: 0, y: 0, z: 0 },
  ],
}
/** la porte pleine de WACA_LY_D_Q4R (pente à droite) : le miroir, charnières à gauche */
const PORTE_Q4R = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  cotes: { largeur: 1886.716, profondeur: 586.98, hauteur: 16.4 },
  position: { x: 588.48, y: -2.5, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  charnieres: 'gauche',
  contour: [
    { x: 1361.689, y: 0, z: 0 },
    { x: 1886.716, y: 586.98, z: 0 },
    { x: 0, y: 586.98, z: 0 },
    { x: 0, y: 0, z: 0 },
  ],
}
/** la porte pleine du module plein WACA_LY_D : un rectangle, sans contour */
const PORTE_PLEINE = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  cotes: { largeur: 2340, profondeur: 587, hauteur: 16.4 },
  position: { x: 588.5, y: -2.5, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  charnieres: 'gauche',
}
/** la boîte de la zone (le Set : SIZEX 590, SIZEZ 2340) */
const BOITE = { w: 590, h: 2340, d: 500 }
/** la façade Door_FA_4a du designer d'Otman pour WACA_LY_D dans cette boîte (mesurée le 23/09 : 586 × 2340 × 24, centrée, z de −6 à 18) */
const FACADE = { min: [-293, -1170, -6], max: [293, 1170, 18] }
const MANQUE = 'zone 0.0 (porte) : pas encore compris : KMS MP_1_FR_SHELL_5PD10_LAM : pièce multiple à 6 sous-pièces (PD_1_FR_EE1E, PD_1_FR_E1EE, PD_1_FR_E1EE, PD_1_FR_EE1E, PD_1_FR_MAIN_FR08_VRN, SRF_FR_3_TOP_EEEE) — seule UNE sous-pièce est mesurée. Règle 6 du briefing : on ne devine pas une valeur pour rendre un test vert — on écrit dans releves/ ce qui manque, et on s\'arrête.'

test('le module plein que le designer d Otman sait dessiner, pour chaque module coupé', () => {
  assert.equal(articlePleinOtman('WACA_LY_D_Q4L'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D_H5L'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D_Q4R'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D_H5R'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D_SS'), 'WACA_LY_D', 'HEX 2 : le designer plante sur _SS (HORDEFTYPE = A)')
  assert.equal(articlePleinOtman('WACA_LY_D_SS0'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D_SS0_C3'), 'WACA_LY_D')
  assert.equal(articlePleinOtman('WACA_LY_D'), null, 'le module plein n est pas coupé')
  assert.equal(articlePleinOtman('OAKSOME_SHAPE_HEX'), null)
  assert.equal(articlePleinOtman(undefined), null)
})

test('la position sans porte : le KMS multi-pièces refusé, et rien quand la porte est là', () => {
  const sans = facadeSansPorte({ article: 'WACA_LY_D_Q4L', pieces: [{ nom: 'Side Panel_Ri', cotes: { largeur: 1, profondeur: 1, hauteur: 1 }, position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0 } }], manques: [MANQUE] })
  assert.deepEqual(sans && sans.kms, 'MP_1_FR_SHELL_5PD10_LAM')
  assert.equal(facadeSansPorte({ article: 'WACA_LY_D_Q4L', pieces: [PORTE_Q4L], manques: [MANQUE] }), null, 'une porte rendue : rien à découper')
  assert.equal(facadeSansPorte({ article: 'WACA_LY_D_Q4L', pieces: [], manques: ['zone 0.1 : autre manque'] }), null, 'un autre manque n est pas une façade multi-pièces')
  assert.equal(facadeSansPorte({ article: 'X', erreur: 'Interne', message: 'boum' }), null)
  assert.equal(facadeSansPorte(undefined), null)
})

test('le lot de la porte pleine : Door_Name seul, et rien quand le lot ne nomme pas sa porte', () => {
  assert.deepEqual(lotPortePleine({ Door_Name: 'FR_08_LAM', FR_1_THK: '21.4', SIZEZ: '2340' }), { Door_Name: 'FR_01_LAM', FR_1_THK: '21.4', SIZEZ: '2340' })
  assert.equal(lotPortePleine({ Door_Name: 'FR_01_LAM' }), null, 'déjà la porte pleine')
  assert.equal(lotPortePleine({ SIZEZ: '2340' }), null)
})

test('le contour de la porte dans le repère centré de la zone : la porte de fox-cad est centrée en X, posée au sol', () => {
  const pts = contourDansLaZone(PORTE_Q4L, BOITE)
  // la porte va de x = 2 à 588 (largeur 586 centrée sur 295) et de z = 0 à 1888.281 ; en haut à droite le sommet (1888.281, 0) local
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  assert.ok(Math.abs(Math.max(...xs) - 293) < 0.01 && Math.abs(Math.min(...xs) + 293) < 0.01, `X de −293 à 293, lu ${Math.min(...xs)}..${Math.max(...xs)}`)
  assert.ok(Math.abs(Math.min(...ys) + 1170) < 0.01, 'le bas de la porte au bas de la boîte')
  assert.ok(Math.abs(Math.max(...ys) - (1888.281 - 1170)) < 0.01, 'le haut de la porte à 1888.281 du sol')
  // le sommet haut est à DROITE (x local 1888.281 à y local 0 → X = +293) : la pente descend vers la gauche
  const haut = pts.find((p) => Math.abs(p[1] - (1888.281 - 1170)) < 0.01)
  assert.ok(haut && Math.abs(haut[0] - 293) < 0.01, `le point haut à droite, lu ${JSON.stringify(haut)}`)
})

test('les plans de coupe : la seule arête en pente coupe la façade du designer, du bon côté (Q4L, H5L, Q4R), aucun plan pour une porte pleine', () => {
  const coupants = (porte) => plansPorte(porte, BOITE).filter((p) => planCoupeBoite(p, FACADE))
  const q4l = coupants(PORTE_Q4L)
  assert.equal(plansPorte(PORTE_Q4L, BOITE).length, 1, 'les trois arêtes droites du contour sont le rectangle du designer : pas de plan')
  assert.equal(q4l.length, 1, 'Q4L : le plan de la pente')
  assert.ok(distanceAuPlan(q4l[0], -293, 1170, 0) > 0, 'le coin haut gauche est enlevé')
  assert.ok(distanceAuPlan(q4l[0], 293, 715, 0) < 0 && distanceAuPlan(q4l[0], 293, 722, 0) > 0, 'à droite la coupe passe à 1888.281 du sol')
  assert.ok(distanceAuPlan(q4l[0], -293, 190, 0) < 0 && distanceAuPlan(q4l[0], -293, 200, 0) > 0, 'à gauche la coupe passe à 1364.149 du sol')
  assert.ok(distanceAuPlan(q4l[0], 0, -1170, 0) < 0, 'le bas est gardé')

  const h5l = coupants(PORTE_H5L)
  assert.equal(plansPorte(PORTE_H5L, BOITE).length, 1, 'le plat de 83 mm est horizontal : le haut du rectangle, pas un plan')
  assert.equal(h5l.length, 1, 'H5L : le plan de la pente seul (le plat de 83 mm est le haut de la boîte)')
  assert.ok(distanceAuPlan(h5l[0], 280, 1169, 0) < 0, 'le plat du haut à droite est gardé')
  assert.ok(distanceAuPlan(h5l[0], -293, 1169, 0) > 0, 'le coin haut gauche est enlevé')
  assert.ok(distanceAuPlan(h5l[0], -293, 715, 0) < 0 && distanceAuPlan(h5l[0], -293, 725, 0) > 0, 'à gauche la coupe passe à 1889.399 du sol')

  const q4r = coupants(PORTE_Q4R)
  assert.equal(q4r.length, 1, 'Q4R : le miroir')
  assert.ok(distanceAuPlan(q4r[0], 293, 1170, 0) > 0, 'le coin haut DROIT est enlevé')
  assert.ok(distanceAuPlan(q4r[0], -293, 700, 0) < 0, 'à gauche la porte monte à 1886.716')

  assert.equal(plansPorte(PORTE_PLEINE, BOITE).length, 0, 'une porte rectangulaire ne donne aucun plan : son rectangle est celui du designer (586 ou 587 mm selon le chargement)')
})

test('la coupe d une boîte par le plan de Q4L : fermée (chant refermé), le bon volume, le chant avec le matériau de la face avant', () => {
  const source = new THREE.BoxGeometry(586, 2340, 24).translate(0, 0, 6)
  const [plan] = plansPorte(PORTE_Q4L, BOITE).filter((p) => planCoupeBoite(p, FACADE))
  const r = decouperGeometrie(source, [planThree(plan)])
  assert.equal(r.coupee, true)
  assert.equal(r.coupes, 1, 'un seul plan a coupé')
  assert.equal(r.chantApproche, false, 'la section d une boîte est une boucle propre')
  assert.equal(r.boucles.length, 1)
  const g = r.geometrie
  g.computeBoundingBox()
  assert.ok(Math.abs(g.boundingBox.max.y - (1888.281 - 1170)) < 0.01, `le haut de la coupe à droite, lu ${g.boundingBox.max.y}`)
  assert.ok(Math.abs(g.boundingBox.min.y + 1170) < 0.01)
  assert.equal(aretesDeBord(g), 0, 'aucune arête de bord : la surface est fermée, le chant est là')
  const attendu = (586 * (1888.281 + 1364.149)) / 2 * 24
  assert.ok(Math.abs(volume(g) - attendu) / attendu < 1e-6, `le volume du trapèze extrudé, lu ${volume(g)} pour ${attendu}`)
  // les groupes : ceux de la boîte (six faces), puis le chant avec le matériau de la face AVANT (+Z, index 4 de BoxGeometry)
  const chant = g.groups[g.groups.length - 1]
  assert.equal(chant.materialIndex, 4, 'le chant prend la matière du triangle coupé le plus en avant')
  assert.ok(chant.count >= 6, 'le chant est triangulé')
  // les UV et normales existent pour chaque sommet
  assert.equal(g.getAttribute('uv').count, g.getAttribute('position').count)
  assert.equal(g.getAttribute('normal').count, g.getAttribute('position').count)
  assert.notEqual(g, source, 'la source n est jamais modifiée')
  assert.equal(source.getAttribute('position').count, 24)
})

test('un plan qui ne traverse pas la géométrie ne coupe rien ; un plan qui enlève tout rend une géométrie vide', () => {
  const source = new THREE.BoxGeometry(586, 2340, 24)
  const loin = new THREE.Plane(new THREE.Vector3(0, 1, 0), -5000)
  const r = decouperGeometrie(source, [loin])
  assert.equal(r.coupee, false)
  assert.equal(r.coupes, 0)
  assert.equal(r.geometrie, source)
  const tout = new THREE.Plane(new THREE.Vector3(0, 1, 0), 5000)
  const t = decouperGeometrie(source, [tout])
  assert.equal(t.coupee, true)
  assert.equal(t.geometrie.getAttribute('position').count, 0)
})

test('les arêtes : coupées par le plan, et le tour de la section ajouté', () => {
  const [plan] = plansPorte(PORTE_Q4L, BOITE).filter((p) => planCoupeBoite(p, FACADE))
  const p = planThree(plan)
  // le rectangle avant de la façade (quatre segments) : le haut disparaît, les côtés sont raccourcis, la section (une boucle carrée) s ajoute
  const rect = [-293, -1170, 18, 293, -1170, 18, 293, -1170, 18, 293, 1170, 18, 293, 1170, 18, -293, 1170, 18, -293, 1170, 18, -293, -1170, 18]
  const boucle = [new THREE.Vector3(-293, 194.149, -6), new THREE.Vector3(293, 718.281, -6), new THREE.Vector3(293, 718.281, 18), new THREE.Vector3(-293, 194.149, 18)]
  const r = decouperSegments(rect, [p], [boucle])
  assert.equal(r.coupee, true)
  assert.equal(r.positions.length % 6, 0)
  const segments = []
  for (let i = 0; i < r.positions.length; i += 6) segments.push(r.positions.slice(i, i + 6))
  assert.equal(segments.length, 3 + 4, 'le bas, les deux côtés raccourcis, et les quatre segments de la section')
  const droit = segments.find((s) => s[0] === 293 && s[3] === 293)
  assert.ok(droit && Math.abs(Math.max(s(droit, 1), s(droit, 4)) - 718.281) < 0.01, `le côté droit s arrête à la coupe, lu ${JSON.stringify(droit)}`)
  assert.ok(segments.every((sg) => sg.every((v) => Number.isFinite(v))))
})
const s = (seg, i) => seg[i]

test('le chaînage des boucles : un carré se ferme, une chaîne ouverte est refermée de force et dite', () => {
  const v = (x, y) => new THREE.Vector3(x, y, 0)
  const carre = [[v(0, 0), v(1, 0)], [v(1, 1), v(0, 1)], [v(1, 0), v(1, 1)], [v(0, 1), v(0, 0)]]
  const b = chainerBoucles(carre)
  assert.equal(b.boucles.length, 1)
  assert.equal(b.boucles[0].length, 4)
  assert.equal(b.approche, false)
  const ouverte = [[v(0, 0), v(1, 0)], [v(1, 0), v(1, 1)], [v(1, 1), v(0, 1)]]
  const o = chainerBoucles(ouverte)
  assert.equal(o.boucles.length, 1)
  assert.equal(o.approche, true)
})
