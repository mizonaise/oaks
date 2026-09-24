// L'échelle des textures (nuit du 22 au 23/09) : la règle des sources (rp-engine vivant, table imos, défaut dit) et les UV à l'échelle réelle —
// le même motif en mm sur une porte de 587 et une de 1 170 mm, sur une boîte, sur un contour extrudé, et sur une géométrie en mètres (le
// designer d'Otman). Joué par `npm test` (node --test ; node 24 lit le TypeScript sans outil).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { ECHELLE_BOIS_MM, ECHELLE_DEFAUT_MM, echelleTexture, nomTextureDepuisAdresse, direEchelle } from '../../src/lib/textures/echelle.ts'
import { DECORS_FABRICANTS, decorFabricant } from '../../src/data/echelle-decors.ts'
import { etendueUv, uvEchelleReelle, MARQUE_ECHELLE } from '../../src/lib/textures/uv.ts'
import { geometriePiece } from '../../src/lib/foxcad/geometrie.ts'

const pres = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`)

test('la source, dans l ordre : le SCALEFAKT vivant du rp-engine, puis la taille réelle lue chez le fabricant (mesurée), puis la famille de la texture (imos étire), puis le défaut — toujours dite', () => {
  assert.deepEqual(echelleTexture('EG_W980', 450), { mm: 450, source: 'rp-engine', texture: 'EG_W980' })
  // le rp-engine public (23/09) : EG_ED_W980_ST2_18mm → 300 ; les 51 finitions intérieures → 0 (imos étire) → le fabricant, puis la famille
  assert.deepEqual(echelleTexture('EG_W980', 300), { mm: 300, source: 'rp-engine', texture: 'EG_W980' })
  // un vivant > 0 passe avant le fabricant
  assert.deepEqual(echelleTexture('UN_0H251_W06', 1000), { mm: 1000, source: 'rp-engine', texture: 'UN_0H251_W06' })
  // textile Egger : la période du tissage mesurée contre l'échantillon A3 d'Egger (23/09) → 120 mm, source fabricant (F416, F417, F433)
  assert.deepEqual(echelleTexture('EG_F416', 0), { mm: 120, source: 'fabricant', fabricant: 'Egger', texture: 'EG_F416' })
  assert.equal(echelleTexture('EG_F433').source, 'fabricant')
  // F422 : l'image IVIS est presque plate, sa période ne se lit pas → à confirmer → la famille textile (120, la valeur de la série), dite à confirmer
  assert.deepEqual(echelleTexture('EG_F422', 0), { mm: 120, source: 'famille', famille: 'textile', texture: 'EG_F422' })
  assert.equal(decorFabricant('EG_F422').statut, 'à confirmer')
  // unis : 300 comme les unis d'imos — 0WE31 BST, 00113 CST (Elegant Black), 00551 CST sont des unis (images IVIS plates, 5 Ko)
  assert.deepEqual(echelleTexture('UN_0U640_BST', 0), { mm: 300, source: 'famille', famille: 'uni', texture: 'UN_0U640_BST' })
  assert.equal(echelleTexture('UN_00113_CST').famille, 'uni')
  assert.equal(echelleTexture('UN_0WE31_BST').famille, 'uni')
  assert.equal(echelleTexture('EG_W980', null).famille, 'uni')
  assert.equal(echelleTexture('W_MDF00', 0).mm, 300)
  assert.equal(echelleTexture('NA_E6127_NATURAL').famille, 'uni')
  // bois Unilin : l'image IVIS est une découpe de l'image du panneau entier publiée par Unilin — 0H251 W06 : 540 mm (r 0,77)
  assert.deepEqual(echelleTexture('UN_0H251_W06'), { mm: 540, source: 'fabricant', fabricant: 'Unilin', texture: 'UN_0H251_W06' })
  // chaque décor MESURÉ de la table vient du fabricant, avec sa valeur et une source chez le fabricant ; « à confirmer » retombe sur la famille
  for (const d of DECORS_FABRICANTS) {
    assert.match(d.source, /^https:\/\/www\.(unilinpanels|egger|decospan)\.com\//, d.texture)
    const e = echelleTexture(d.texture, 0)
    if (d.statut === 'mesuré') {
      assert.ok(d.mm > 0, d.texture)
      assert.deepEqual(e, { mm: d.mm, source: 'fabricant', fabricant: d.fabricant, texture: d.texture })
    } else assert.equal(e.source, 'famille', d.texture)
  }
  // un bois sans mesure propre (placage Decospan, autre bois Unilin) : la famille bois = la médiane des bois Unilin mesurés, à confirmer
  assert.deepEqual(echelleTexture('DE_S4_02'), { mm: ECHELLE_BOIS_MM, source: 'famille', famille: 'bois', texture: 'DE_S4_02' })
  assert.equal(echelleTexture('UN_0H999_XXX', 0).famille, 'bois')
  // aucune famille : le défaut, et la source le dit
  assert.deepEqual(echelleTexture('XY_INCONNUE'), { mm: ECHELLE_DEFAUT_MM, source: 'defaut', texture: 'XY_INCONNUE' })
  assert.deepEqual(echelleTexture(null), { mm: ECHELLE_DEFAUT_MM, source: 'defaut', texture: null })
  assert.deepEqual(echelleTexture('  '), { mm: ECHELLE_DEFAUT_MM, source: 'defaut', texture: null })
  // un vivant nul ou négatif ne compte pas
  assert.equal(echelleTexture('EG_W980', -5).source, 'famille')
  assert.equal(echelleTexture('EG_W980', Number.NaN).source, 'famille')
  // les finitions intérieures de HEX (nuanciers OV_FINISH_INT du 23/09, un nom par famille et par nuancier) ont toutes une source dite, jamais le défaut
  const interieur = ['EG_F416', 'EG_F417', 'EG_F422', 'EG_F433', 'UN_00113_CST', 'UN_00551_CST', 'UN_0H251_W06', 'UN_0H362_BST', 'UN_0H591_W07', 'UN_0H720_BST', 'UN_0H912_V2A', 'UN_0U115_CST', 'UN_0U135_BST', 'UN_0U640_BST', 'UN_0UD59_BST', 'UN_0UD81_CST', 'UN_0WE31_BST']
  for (const t of interieur) assert.ok(['famille', 'fabricant'].includes(echelleTexture(t, 0).source), t)
})

test('le nom de la texture se lit dans l adresse du CDN (les deux formes vues : %2F et /), sinon null', () => {
  assert.equal(nomTextureDepuisAdresse('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/IVIS%2FUN_0H251_W06.jpg/public'), 'UN_0H251_W06')
  assert.equal(nomTextureDepuisAdresse('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/IVIS/EG_F416.jpg/public'), 'EG_F416')
  assert.equal(nomTextureDepuisAdresse('http://localhost:3025/textures/fallback-texture.jpg'), null)
  assert.equal(nomTextureDepuisAdresse(''), null)
  assert.equal(direEchelle(echelleTexture('EG_W980', 300)), 'EG_W980 à 300 mm (rp-engine)')
  assert.equal(direEchelle(echelleTexture('EG_F416', 0)), 'EG_F416 à 120 mm (fabricant Egger, mesuré ; imos 0, étirée)')
  assert.equal(direEchelle(echelleTexture('EG_F422', 0)), 'EG_F422 à 120 mm (famille textile, à confirmer ; imos 0, étirée)')
  assert.equal(direEchelle(echelleTexture('UN_0H251_W06')), 'UN_0H251_W06 à 540 mm (fabricant Unilin, mesuré ; imos 0, étirée)')
  assert.match(direEchelle(echelleTexture('DE_S4_02')), /^DE_S4_02 à \d+ mm \(famille bois, à confirmer/)
  assert.match(direEchelle(echelleTexture('XY_INCONNUE')), /^XY_INCONNUE à 1.000 mm \(défaut/)
  // le magasin de la scène ne porte ni la famille ni le fabricant : la phrase les retrouve par le nom de la texture
  assert.equal(direEchelle({ mm: 120, source: 'fabricant', texture: 'EG_F416' }), 'EG_F416 à 120 mm (fabricant Egger, mesuré ; imos 0, étirée)')
  assert.equal(direEchelle({ mm: 300, source: 'famille', texture: 'UN_0U640_BST' }), 'UN_0U640_BST à 300 mm (famille uni ; imos 0, étirée)')
})

/** l'étendue des UV des seuls sommets d'une face (par sa normale) : la face avant d'une boîte = normale +z */
const etendueFace = (g, axe, signe) => {
  const n = g.getAttribute('normal')
  const uv = g.getAttribute('uv')
  const e = { u: [Infinity, -Infinity], v: [Infinity, -Infinity] }
  for (let i = 0; i < uv.count; i++) {
    const c = axe === 'x' ? n.getX(i) : axe === 'y' ? n.getY(i) : n.getZ(i)
    if (Math.sign(c) !== signe || Math.abs(c) < 0.5) continue
    e.u = [Math.min(e.u[0], uv.getX(i)), Math.max(e.u[1], uv.getX(i))]
    e.v = [Math.min(e.v[0], uv.getY(i)), Math.max(e.v[1], uv.getY(i))]
  }
  return e
}

test('une boîte : chaque face porte ses mm / échelle — la porte de 587 et celle de 1 170 mm ont le même motif (300 mm par tuile)', () => {
  const porte = (largeur) => uvEchelleReelle(new THREE.BoxGeometry(largeur, 2340, 18), 300)
  const a = etendueFace(porte(587), 'z', 1)
  const b = etendueFace(porte(1170), 'z', 1)
  // la face avant (normale +z) : u = x / 300 sur la largeur, v = y / 300 sur la hauteur — l'étendue en u dit combien de tuiles couvrent la porte
  pres(a.u[1] - a.u[0], 587 / 300)
  pres(b.u[1] - b.u[0], 1170 / 300)
  pres(a.v[1] - a.v[0], 2340 / 300)
  pres(b.v[1] - b.v[0], 2340 / 300)
  // mm par tuile : identique sur les deux portes
  pres(587 / (a.u[1] - a.u[0]), 1170 / (b.u[1] - b.u[0]))
  // le chant du haut (normale +y) : u = x / 300, v = z / 300 (18 mm d'épaisseur)
  const haut = etendueFace(porte(587), 'y', 1)
  pres(haut.u[1] - haut.u[0], 587 / 300)
  pres(haut.v[1] - haut.v[0], 18 / 300)
  // sur toute la géométrie, l'étendue en u mêle x (faces z, y) et y (faces x) : max(587, 2340) / 300
  const tout = etendueUv(porte(587))
  pres(tout.u[1] - tout.u[0], 2340 / 300)
  assert.equal(porte(587).userData[MARQUE_ECHELLE], 300)
})

test('une boîte de BoxGeometry sans le réglage : l image entière étirée sur chaque face (UV [0, 1]) — c est l avant, mesuré', () => {
  const e = etendueUv(new THREE.BoxGeometry(1170, 2340, 18))
  assert.deepEqual(e, { u: [0, 1], v: [0, 1] })
})

test('un contour extrudé de fox-cad (porte coupée) : la face porte x / échelle et y / échelle, pas [0, 1]', () => {
  const p = {
    nom: 'front',
    definition: 'PD_1_FR_1111',
    cotes: { largeur: 1888, profondeur: 586, hauteur: 18 },
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0 },
    contour: [
      { x: 0, y: 0, z: 0 },
      { x: 1888, y: 0, z: 0 },
      { x: 1888, y: 586, z: 0 },
      { x: 1400, y: 586, z: 0 },
      { x: 0, y: 200, z: 0 },
    ],
  }
  const g = geometriePiece(p, 1000)
  const e = etendueUv(g)
  pres(e.u[0], 0)
  pres(e.u[1], 1888 / 1000)
  pres(e.v[0], 0)
  pres(e.v[1], 586 / 1000)
  // la boîte simple, au défaut
  const b = etendueUv(geometriePiece({ ...p, contour: undefined }))
  pres(b.u[1] - b.u[0], 1888 / ECHELLE_DEFAUT_MM)
})

test('une géométrie en mètres (le designer d Otman, échelle du monde × 1000) : mmParUnite = 1000', () => {
  const g = uvEchelleReelle(new THREE.BoxGeometry(2.34, 0.5, 0.02), 300, 1000)
  const e = etendueFace(g, 'z', 1)
  pres(e.u[1] - e.u[0], 2340 / 300)
  pres(e.v[1] - e.v[0], 500 / 300)
})

test('une géométrie sans normales en reçoit (computeVertexNormals) et se laisse projeter', () => {
  const g = new THREE.BufferGeometry()
  // deux triangles, une face carrée de 400 × 400 mm dans le plan z = 0
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 400, 0, 0, 400, 400, 0, 0, 0, 0, 400, 400, 0, 0, 400, 0], 3))
  uvEchelleReelle(g, 200)
  const e = etendueUv(g)
  pres(e.u[1], 2)
  pres(e.v[1], 2)
})
