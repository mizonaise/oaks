// La pose de la poignée d'Otman sur une porte de fox-cad (d5, 23/09) : la règle de son designer 1.0.102 — le centre à PULL_X du bord libre,
// PULL_Z devant la face, la hauteur par le MANINFO de l'élément de porte (descripteur → division linéaire → première section), le repli
// 1 050 − socle DIT quand le MANINFO manque, et notre descente dans le contour d'une porte coupée. Joué par `npm test` (node --test).
// Les portes sont celles que l'API fox-cad (4311, fox-cad du 23/09) a rendues pour HEX par défaut (`hex-defaut.reponse.json`), le
// descripteur `DS_LD_PULL_OS_D1` et l'élément 0.1.0 sont ceux du graphe `article-data/WACA_LY_D` du rp-engine (23/09), recopiés tels quels.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {
  dansContour,
  elementPorte,
  evaluerArithmetique,
  evaluerDescripteur,
  hauteurPoignee,
  posePoignee,
  premiereDivision,
  resoudreVariables,
  simplifierExpressions,
} from '../../src/lib/foxcad/pose-poignee.ts'
import { matricePiece, sommetsLocaux } from '../../src/lib/foxcad/geometrie.ts'

const PORTE_PLEINE = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  hierarchie: '0.1.0',
  achat: false,
  cotes: { largeur: 2340, profondeur: 587, hauteur: 18 },
  position: { x: 588.5, y: -2.5, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  charnieres: 'gauche',
}
const PORTE_COUPEE = {
  nom: 'front',
  definition: 'PD_1_FR_1111',
  hierarchie: '0.0',
  achat: false,
  cotes: { largeur: 1888.281, profondeur: 586, hauteur: 18 },
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
const jamais = (id) => ({ condition: { CONDITIONID: id, COMMENT: '', ROOTTERMNUM: 1 }, roots: [{ kind: 'comparison', data: { CONDITIONID: id, TERMNUM: 1, PARENTTERMNUM: 0, LEFTVALUE: '0', COMPARISONTYPE: '=', RIGHTVALUE: '1', DATATYPE: 'FL' }, children: [] }] })
const D1 = {
  descriptor: { NAME: 'DS_LD_PULL_OS_D1', DESC_TYPE: 11, COMMENT: 'Standard', SOURCE: 'o.abidlmerabetine' },
  nodes: [
    { nodeNum: 1, lindiv: '$PULL_X $PULL_Y $PULL_Z $PULL_GLB $PULL_ROT', comment: 'never true', conditionId: 67796, conditionTree: jamais(67796) },
    { nodeNum: 2, lindiv: '$SRF_FR_2_TOP $SRF_FR_3_TOP $SRF_HN_1_TOP', comment: 'never true', conditionId: 67797, conditionTree: jamais(67797) },
    { nodeNum: 3, lindiv: '(1050 - $BASE_HEIGHT)mm:1', comment: 'DEFAULT', conditionId: 0, conditionTree: null },
  ],
}
const descripteur = (nom, lindiv) => ({ descriptor: { NAME: nom, DESC_TYPE: 11 }, nodes: [{ nodeNum: 1, lindiv, comment: 'DEFAULT', conditionId: 0, conditionTree: null }] })
const ELEMENT_PORTE = { NAME: 'WACA_LY_D', TREEID: '0.1.0', PARTTYPE: 'D', INORDER: '', CPNAME: '#DS_WACA_CP_FR_PM', MANINFO: '#DS_LD_PULL_OS_D1' }
const TABLES_D = { anglelem: [{ NAME: 'WACA_SUB_1IDR', TREEID: '0.0.1', PARTTYPE: 'S', MANINFO: '' }, ELEMENT_PORTE], descriptors: [D1] }
const TABLES_Q4L = { anglelem: [{ NAME: 'WACA_LY_D_Q4L', TREEID: '0.0', PARTTYPE: 'D', MANINFO: '' }], descriptors: [] }
const LOT = { BASE_HEIGHT: '80', PULL_X: '75', PULL_Y: '75.00', PULL_Z: '12.00', PULL_GLB: 'oaksome/pull_glb/FU_HN_103820050052.glb', PULL_ROT: '0', WACA_HEIGHT_1: '600' }

const boiteDe = (p) => {
  const m = matricePiece(p)
  const b = new THREE.Box3()
  for (const s of sommetsLocaux(p)) b.expandByPoint(s.clone().applyMatrix4(m))
  return b
}
const proche = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg ?? ''} : ${a} ≠ ${b}`)

test('le calcul sûr : nombres, opérateurs, parenthèses, fonctions — rien d’autre', () => {
  assert.equal(evaluerArithmetique('1050 - 80'), 970)
  assert.equal(evaluerArithmetique('3/2*(600)'), 900)
  assert.equal(evaluerArithmetique('round(1000/3)'), 333)
  assert.equal(evaluerArithmetique('max(1, 2) + min(5, 4)'), 6)
  assert.equal(evaluerArithmetique('-(2 + 3) * 2'), -10)
  assert.equal(evaluerArithmetique('79,9 + 0,1'), 80)
  assert.equal(evaluerArithmetique('abc'), null)
  assert.equal(evaluerArithmetique('2 * $X'), null)
  assert.equal(evaluerArithmetique('alert(1)'), null)
})

test('les expressions d’une division se simplifient du plus intérieur au plus extérieur, les variables se résolvent dans les portées', () => {
  assert.equal(simplifierExpressions('(1050 - 80)mm:1'), '970mm:1')
  assert.equal(simplifierExpressions('1:(122.5)mm'), '1:122.5mm')
  assert.equal(simplifierExpressions('(1050 - 3/2*(600) - 80 + 122.5)mm:1'), '192.5mm:1')
  assert.equal(resoudreVariables('(1050 - $BASE_HEIGHT)mm:1', [LOT]), '(1050 - 80)mm:1')
  // une variable qui en cite une autre (WACA_HEIGHT_2 = 3/2*($WACA_HEIGHT_1) dans le graphe) : résolue de proche en proche
  assert.equal(resoudreVariables('($WACA_HEIGHT_2)mm:1', [{ WACA_HEIGHT_2: '3/2*($WACA_HEIGHT_1)' }, LOT]), '(3/2*(600))mm:1')
  assert.equal(resoudreVariables('$INCONNUE', [LOT]), '$INCONNUE')
})

test('la première section d’une division linéaire — depuis le bas de la porte, comme DoorSensor', () => {
  proche(premiereDivision('970mm:1', 2340, []).valeur, 970)
  proche(premiereDivision('(1050 - $BASE_HEIGHT)mm:1', 2340, [LOT]).valeur, 970, 'D1')
  proche(premiereDivision('($PULL_Y)mm:1', 2340, [LOT]).valeur, 75, 'DW : PULL_Y depuis le bas')
  proche(premiereDivision('1:($PULL_Y)mm', 700, [{ PULL_Y: '150' }]).valeur, 550, 'DB : PULL_Y depuis le haut')
  proche(premiereDivision('(1050 - $WACA_HEIGHT_1 - $BASE_HEIGHT + $PULL_Y)mm:1', 2340, [LOT]).valeur, 445, 'DM')
  const manque = premiereDivision('($PULL_Y)mm:1', 2340, [])
  assert.equal(manque.valeur, null)
  assert.match(manque.raison, /PULL_Y/)
  const couleur = premiereDivision('red', 2340, [])
  assert.equal(couleur.valeur, null)
  assert.match(couleur.raison, /refusée/)
})

test('un descripteur rend le premier nœud dont la condition est vraie, sinon le nœud DEFAULT', () => {
  const d1 = evaluerDescripteur(D1, [LOT])
  assert.deepEqual(d1, { lindiv: '(1050 - $BASE_HEIGHT)mm:1', nodeNum: 3, parDefaut: true })
  const cond = (nom, valeur) => ({ kind: 'comparison', data: { LEFTVALUE: nom, COMPARISONTYPE: '=', RIGHTVALUE: valeur }, children: [] })
  const d = {
    descriptor: { NAME: 'DS_ESSAI' },
    nodes: [
      { nodeNum: 1, lindiv: '(900)mm:1', conditionId: 1, conditionTree: { roots: [cond('$Door_Name', 'FR_08_LAM')] } },
      { nodeNum: 2, lindiv: '(800)mm:1', conditionId: 2, conditionTree: { roots: [{ kind: 'operation', data: { OPSTRING: 'OR' }, children: [cond('$Door_Name', 'FR_10_LAM'), { kind: 'comparison', data: { LEFTVALUE: '$BASE_HEIGHT', COMPARISONTYPE: '>', RIGHTVALUE: '100' }, children: [] }] }] } },
      { nodeNum: 3, lindiv: '(1050 - $BASE_HEIGHT)mm:1', conditionId: 0, conditionTree: null },
    ],
  }
  assert.equal(evaluerDescripteur(d, [{ Door_Name: 'FR_08_LAM' }, LOT]).nodeNum, 1)
  assert.equal(evaluerDescripteur(d, [{ Door_Name: 'FR_01_LAM', BASE_HEIGHT: '150' }]).nodeNum, 2)
  assert.equal(evaluerDescripteur(d, [{ Door_Name: 'FR_01_LAM' }, LOT]).nodeNum, 3)
  assert.equal(evaluerDescripteur({ descriptor: { NAME: 'VIDE' }, nodes: [] }, [LOT]), null)
})

test('l’élément de porte se trouve par la hiérarchie de la pièce (= le TREEID), sinon par l’unique porte de l’article', () => {
  assert.equal(elementPorte(TABLES_D, PORTE_PLEINE, 'WACA_LY_D'), ELEMENT_PORTE)
  assert.equal(elementPorte(TABLES_Q4L, PORTE_COUPEE, 'WACA_LY_D_Q4L').TREEID, '0.0')
  assert.equal(elementPorte(TABLES_D, { ...PORTE_PLEINE, hierarchie: undefined }, 'WACA_LY_D'), ELEMENT_PORTE)
  assert.equal(elementPorte({ anglelem: [ELEMENT_PORTE, { ...ELEMENT_PORTE, TREEID: '0.1.1' }] }, { ...PORTE_PLEINE, hierarchie: '9.9' }, 'WACA_LY_D'), null)
  assert.equal(elementPorte(undefined, PORTE_PLEINE, 'WACA_LY_D'), null)
})

test('la hauteur par le MANINFO : D1 sur WACA_LY_D = 1 050 − socle ; DW, DB, DM par leur division ; le repli est DIT quand il manque', () => {
  const h = hauteurPoignee(PORTE_PLEINE, [LOT], TABLES_D, 2340, 'WACA_LY_D')
  assert.deepEqual(h, { hauteur: 970, source: 'maninfo', descripteur: 'DS_LD_PULL_OS_D1', lindiv: '(1050 - $BASE_HEIGHT)mm:1', resolu: '970mm:1', raison: null })
  const avec = (nom, lindiv) => hauteurPoignee(PORTE_PLEINE, [LOT], { anglelem: [{ ...ELEMENT_PORTE, MANINFO: `#${nom}` }], descriptors: [descripteur(nom, lindiv)] }, 2340, 'WACA_LY_D')
  proche(avec('DS_LD_PULL_OS_DW', '($PULL_Y)mm:1').hauteur, 75, 'DW')
  proche(avec('DS_LD_PULL_OS_DB', '1:($PULL_Y)mm').hauteur, 2265, 'DB')
  proche(avec('DS_LD_PULL_OS_DM', '(1050 - $WACA_HEIGHT_1 - $BASE_HEIGHT + $PULL_Y)mm:1').hauteur, 445, 'DM')
  // une division en clair dans le MANINFO (sans descripteur) se lit aussi
  const clair = hauteurPoignee(PORTE_PLEINE, [LOT], { anglelem: [{ ...ELEMENT_PORTE, MANINFO: '(1050 - $BASE_HEIGHT)mm:1' }] }, 2340, 'WACA_LY_D')
  assert.equal(clair.hauteur, 970)
  assert.equal(clair.descripteur, null)
  // le repli, et sa raison
  const coupee = hauteurPoignee(PORTE_COUPEE, [LOT], TABLES_Q4L, 1888.281, 'WACA_LY_D_Q4L')
  assert.equal(coupee.hauteur, 970)
  assert.equal(coupee.source, 'repli')
  assert.match(coupee.raison, /MANINFO vide sur l'élément 0\.0 de WACA_LY_D_Q4L/)
  assert.match(hauteurPoignee(PORTE_PLEINE, [LOT], undefined, 2340, 'WACA_LY_D').raison, /non chargé/)
  assert.match(hauteurPoignee(PORTE_PLEINE, [LOT], { anglelem: [ELEMENT_PORTE], descriptors: [] }, 2340, 'WACA_LY_D').raison, /DS_LD_PULL_OS_D1 absent/)
  const nonResolu = hauteurPoignee(PORTE_PLEINE, [{ BASE_HEIGHT: '80' }], { anglelem: [{ ...ELEMENT_PORTE, MANINFO: '#DS_LD_PULL_OS_DW' }], descriptors: [descripteur('DS_LD_PULL_OS_DW', '($PULL_Y)mm:1')] }, 2340, 'WACA_LY_D')
  assert.equal(nonResolu.source, 'repli')
  assert.match(nonResolu.raison, /PULL_Y/)
  // socle absent : 1 050 tel quel
  assert.equal(hauteurPoignee(PORTE_PLEINE, [], undefined, 2340).hauteur, 1050)
})

test('la pose sur une porte pleine : PULL_X du bord libre, PULL_Z devant la face, la hauteur du MANINFO depuis le bas', () => {
  const b = boiteDe(PORTE_PLEINE)
  const g = posePoignee(PORTE_PLEINE, 'gauche', [LOT], TABLES_D, 'WACA_LY_D')
  proche(g.position[0], b.max.x - 75, 'charnières à gauche : le bord libre est à droite, à PULL_X (plus PULL_X / 2)')
  proche(g.position[1], b.min.y - 12, 'PULL_Z devant la face (plus PULL_Z / 2)')
  proche(g.position[2], b.min.z + 970, '1 050 − socle depuis le bas')
  assert.equal(g.hauteur.source, 'maninfo')
  assert.equal(g.descendue, false)
  assert.equal(g.glb, 'oaksome/pull_glb/FU_HN_103820050052.glb')
  const d = posePoignee(PORTE_PLEINE, 'droite', [LOT], TABLES_D, 'WACA_LY_D')
  proche(d.position[0], b.min.x + 75, 'charnières à droite : le bord libre est à gauche')
  // une poignée de chant : PULL_Z = 0, le GLB est sur le chant
  const chant = posePoignee(PORTE_PLEINE, 'gauche', [{ ...LOT, PULL_X: '7', PULL_Z: '0' }], TABLES_D, 'WACA_LY_D')
  proche(chant.position[0], b.max.x - 7)
  proche(chant.position[1], b.min.y)
  // la barre du lot FR_08 (JO_HN_J0203AB) : PULL_X 56, PULL_Z 17
  const barre = posePoignee(PORTE_PLEINE, 'gauche', [{ ...LOT, PULL_X: '56', PULL_Z: '17.00' }], TABLES_D, 'WACA_LY_D')
  proche(barre.position[0], b.max.x - 56)
  proche(barre.position[1], b.min.y - 17)
})

// 24/09 (d5, ligne de d11 08:5x — le test de `src/lib/foxcad/pose-poignee.ts`, écrit ici avant le partage des chemins du 23/09 17:3x ; dit à
// d10) : la règle à nous du 22/09 (descendre par pas de 20 mm dans le contour) est REMPLACÉE par la garde haute d'imos, mesurée (d2,
// `orchestre/revues/2026-09-24_alignement-poignees-imos.md` § 2.4 : 57 portes, MT Set 2 à 10⁻⁹ mm) — la poignée s'arrête à 500 sous le haut
// de la porte pris à son aplomb quand ce haut est trop bas pour la ligne.
test('une porte coupée par le rampant : le repli D1, puis la GARDE HAUTE d’imos — 500 sous le haut de la porte à l’aplomb de la poignée', () => {
  const b = boiteDe(PORTE_COUPEE)
  const p = posePoignee(PORTE_COUPEE, 'droite', [LOT], TABLES_Q4L, 'WACA_LY_D_Q4L')
  assert.equal(p.hauteur.source, 'repli')
  assert.match(p.hauteur.raison, /MANINFO vide/)
  proche(p.position[0], b.min.x + 75, 'le bord libre à gauche')
  // la porte servie à la page (1 888,281 × 586, côté court 1 364,149) : à 75 du bord libre, le haut est à 1 431,23 → la poignée à 931,23, pas 970
  const haut = 1888.281 - ((1888.281 - 1364.149) * (586 - 75)) / 586
  assert.equal(p.descendue, true)
  proche(p.hauteurPorte, haut - 500)
  proche(p.butee.hautALaplomb, haut)
  assert.equal(p.butee.garde, 500)
  const inverse = matricePiece(PORTE_COUPEE).clone().invert()
  const local = new THREE.Vector3(p.position[0], b.min.y, p.position[2]).applyMatrix4(inverse)
  assert.ok(dansContour(PORTE_COUPEE.contour, local.x, local.y), 'le point de pose est dans le contour')
  // LA MESURE D'IMOS, refaite : la porte coupée du mur de référence telle qu'imos la sort (MD2 / MT Set 2 : 1 886,716 × 587, côté court
  // 1 361,689) — le haut à l'aplomb 1 428,771, le trou à 928,771
  const imos = { ...PORTE_COUPEE, cotes: { largeur: 1886.716, profondeur: 587, hauteur: 18 }, contour: [{ x: 1886.716, y: 0, z: 0 }, { x: 1361.689, y: 587, z: 0 }, { x: 0, y: 587, z: 0 }, { x: 0, y: 0, z: 0 }] }
  const r = posePoignee(imos, 'droite', [LOT], TABLES_Q4L, 'WACA_LY_D_Q4L')
  assert.ok(Math.abs(r.hauteurPorte - 928.771) < 0.02, `928,771 chez imos, ${r.hauteurPorte.toFixed(3)} ici`)
  // une porte coupée haute (côté court 1 600) : le haut à l'aplomb − 500 dépasse la ligne — la poignée reste sur la ligne (970)
  const haute = { ...PORTE_COUPEE, contour: [{ x: 1888.281, y: 0, z: 0 }, { x: 1600, y: 586, z: 0 }, { x: 0, y: 586, z: 0 }, { x: 0, y: 0, z: 0 }] }
  const h = posePoignee(haute, 'droite', [LOT], TABLES_Q4L, 'WACA_LY_D_Q4L')
  assert.equal(h.descendue, false)
  proche(h.hauteurPorte, 970)
  assert.equal(h.butee, undefined)
  // un côté court de 900 : la butée, sans pas ni marge à nous
  const raide = { ...PORTE_COUPEE, contour: [{ x: 1888.281, y: 0, z: 0 }, { x: 900, y: 586, z: 0 }, { x: 0, y: 586, z: 0 }, { x: 0, y: 0, z: 0 }] }
  const q = posePoignee(raide, 'droite', [LOT], TABLES_Q4L, 'WACA_LY_D_Q4L')
  assert.equal(q.descendue, true)
  proche(q.hauteurPorte, 1888.281 - ((1888.281 - 900) * (586 - 75)) / 586 - 500)
})

test('dansContour : un point dedans, un point dehors, un point dans la coupe', () => {
  assert.equal(dansContour(PORTE_COUPEE.contour, 500, 300), true)
  assert.equal(dansContour(PORTE_COUPEE.contour, 1800, 500), false)
  assert.equal(dansContour(PORTE_COUPEE.contour, -1, 1), false)
})

// 23/09 13:1x (ligne du lead) — le formulaire d'Otman RECHARGÉ (base `conf` des dumps du 23/09) publie les PULL_* par des FORMULES sur la source des
// poignées (`dim_x` / `dim_y` / `dim_z`, `on_edge`, `offset_x`) et celle des fronts (`frame_width`), au lieu des `pos_*` figés d'avant — lu dans
// `GET 4848/product/OS_SHAPE_F` (23/09 13:1x) ; HEX / HEX 2 (arbres 9001 / 9002, pas encore régénérés par oaksome-stack) publient encore `pos_*`.
// Ici : ces formules telles quelles, les données réelles de trois poignées, et ce que la pose en fait — les mêmes nombres que le designer 1.0.102
// mesuré sur F (relevé `docs/releves/2026-09-23_pull-neuf/`).
const formulaire = ({ dim_x, dim_y, dim_z, on_edge, offset_x }, frame_width) => {
  const cadreLarge = Math.round(frame_width / (frame_width + 50)) // le round(…, 0) du previewer : 0 sous 50 de cadre (FR_08 : 22)
  return {
    PULL_X: (on_edge * dim_x) / 2 + (1 - on_edge) * ((cadreLarge * frame_width) / 2 + (1 - cadreLarge) * (50 + dim_x / 2)) + offset_x,
    PULL_Y: 50 + dim_y / 2,
    PULL_Z: ((1 - on_edge) * dim_z) / 2,
  }
}
const CIRCLE = { dim_x: 50, dim_y: 50, dim_z: 24, on_edge: 0, offset_x: 0 } // FU_HN_103820050052, Collection 1 (avant : pos 75 / 75 / 12)
const CORE = { dim_x: 12, dim_y: 145, dim_z: 34, on_edge: 0, offset_x: 0 } // JO_HN_J0203AB, Collection 2 (avant : pos 56 / 122,5 / 17)
const EDGE_STRAIGHT = { dim_x: 18, dim_y: 200, dim_z: 40.9, on_edge: 1, offset_x: -2 } // FU_HN_419720200661, poignée de chant (avant : pos 70,45 / 9 / 9)
const FR_01 = 0
const FR_08 = 22

test('le formulaire rechargé (dim_*, on_edge, offset_x, frame_width) : ce qu’il publie, et la pose en fait les positions du designer 1.0.102', () => {
  // un bouton et une barre : les formules rendent les mêmes nombres que les pos_* d'avant
  assert.deepEqual(formulaire(CIRCLE, FR_01), { PULL_X: 75, PULL_Y: 75, PULL_Z: 12 })
  assert.deepEqual(formulaire(CORE, FR_01), { PULL_X: 56, PULL_Y: 122.5, PULL_Z: 17 })
  // FR_08 (cadre 22, sous 50) ne change pas PULL_X
  assert.deepEqual(formulaire(CORE, FR_08), formulaire(CORE, FR_01))
  // la poignée de chant change : 70,45 / 9 / 9 → 7 du bord libre (dim_x / 2 + offset_x), 150 de PULL_Y, 0 devant (SUR le chant)
  assert.deepEqual(formulaire(EDGE_STRAIGHT, FR_01), { PULL_X: 7, PULL_Y: 150, PULL_Z: 0 })
  const b = boiteDe(PORTE_PLEINE)
  const pose = (d, fw) => {
    const f = formulaire(d, fw)
    return posePoignee(PORTE_PLEINE, 'gauche', [{ ...LOT, PULL_X: String(f.PULL_X), PULL_Y: String(f.PULL_Y), PULL_Z: String(f.PULL_Z) }], TABLES_D, 'WACA_LY_D')
  }
  // mesuré sur F (designer 1.0.102, 23/09 13:3x) : Circle 75 / 970 / 12, Core 56 / 970 / 17, Edge Straight 7 / 970 / 0 — la pose rend les mêmes
  const c = pose(CIRCLE, FR_01)
  proche(b.max.x - c.position[0], 75)
  proche(b.min.y - c.position[1], 12)
  proche(c.position[2] - b.min.z, 970)
  const k = pose(CORE, FR_08)
  proche(b.max.x - k.position[0], 56)
  proche(b.min.y - k.position[1], 17)
  proche(k.position[2] - b.min.z, 970)
  const e = pose(EDGE_STRAIGHT, FR_01)
  proche(b.max.x - e.position[0], 7)
  proche(b.min.y - e.position[1], 0)
  proche(e.position[2] - b.min.z, 970)
  // PULL_Y (9 → 150 sur la poignée de chant) ne joue que sur DW / DB / DM : sur D1 (WACA_LY_D) la hauteur reste 1 050 − socle, par MANINFO
  assert.equal(e.hauteur.source, 'maninfo')
  assert.equal(e.pullX, 7)
  assert.equal(e.pullZ, 0)
})
