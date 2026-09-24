// Le verdict d'une porte, poignée ou PTO (d10, board de situations) — v3 (24/09, ligne du lead 07:5x, mot de Dorian 07:4x) : LA RÈGLE
// D'ALIGNEMENT, une seule. La hauteur imos de la poignée (1 050 du sol fini, bornée à 500 sous le haut de la porte à la ligne de la poignée,
// 200 au-dessus du bas — d3 / d11) ; la ligne de hauteur du meuble = la hauteur imos de ses portes non coupées, rangée par rangée ; la
// porte dont la poignée n'est pas SUR la ligne est orpheline → PTO-repli ; la petite porte jamais ; PTO au choix selon le PDF et le
// formulaire. Les portes réelles : HEX par défaut (API fox-cad 4311 via 3027 1a6b6c2, docs/releves/2026-09-23_board-pto/mesures/
// hex-defaut.portes.json) et HEX-05 du board v3 (3026 1fa0a99, mesures/hex-05-v3.portes.json), recopiées telles quelles.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  comparerAttendu,
  compteEtiquettes,
  coupeVerticale,
  estCoupee,
  hauteurImos,
  jugerPortes,
  ptoOffertParLeFormulaire,
  ptoPrevuParLePdf,
  rangeesEtLignes,
  verdictPorte
} from '../board/verdict-porte.mjs'
import { contourPorteDesigner, contourPorteFoxCad, portesDePieces } from '../board/portes-facade.mjs'

const GAMME = JSON.parse(readFileSync(new URL('../situations/gamme-facades-pdf.json', import.meta.url), 'utf8'))
const CORRESPONDANCE = JSON.parse(readFileSync(new URL('../situations/correspondance-fr-fa.json', import.meta.url), 'utf8'))
const HEX05 = JSON.parse(readFileSync(new URL('../../docs/releves/2026-09-23_board-pto/mesures/hex-05-v3.portes.json', import.meta.url), 'utf8'))

// HEX par défaut : la colonne _Q4L (HEX_SIT QUAD_L, HEX_H_L 1 522,36 — le « mur de référence » de d11) et la _H5L (HEXA_L)
const Q4L = {
  nom: 'front', definition: 'PD_1_FR_1111', hierarchie: '0.0', achat: false,
  cotes: { largeur: 1888.281, profondeur: 586, hauteur: 18 },
  position: { x: 588, y: -2.5, z: 0 }, orientation: { x: 90, y: -90, z: 0 }, charnieres: 'droite',
  contour: [{ x: 1888.281, y: 0, z: 0 }, { x: 1364.149, y: 586, z: 0 }, { x: 0, y: 586, z: 0 }, { x: 0, y: 0, z: 0 }]
}
const GROUPE_Q4L = [0.001, 0, 0, 0, 0, 0, -0.001, 0, 0, 0.001, 0, 0, -1.475, 0.08, 0.25, 1]
const H5L = {
  nom: 'front', definition: 'PD_1_FR_1111', hierarchie: '0.0', achat: false,
  cotes: { largeur: 2340, profondeur: 587, hauteur: 18 },
  position: { x: 588.5, y: -2.5, z: 0 }, orientation: { x: 90, y: -90, z: 0 }, charnieres: 'droite',
  contour: [{ x: 2340, y: 0, z: 0 }, { x: 2340, y: 83.22, z: 0 }, { x: 1889.399, y: 587, z: 0 }, { x: 0, y: 587, z: 0 }, { x: 0, y: 0, z: 0 }]
}
const GROUPE_H5L = [0.001, 0, 0, 0, 0, 0, -0.001, 0, 0, 0.001, 0, 0, -0.885, 0.08, 0.25, 1]
const PLEINE = {
  nom: 'front', definition: 'PD_1_FR_1111', hierarchie: '0.1.0', achat: false,
  cotes: { largeur: 2340, profondeur: 587, hauteur: 18 },
  position: { x: 588.5, y: -2.5, z: 0 }, orientation: { x: 90, y: -90, z: 0 }, charnieres: 'gauche'
}
const GROUPE_PLEINE = [0.001, 0, 0, 0, 0, 0, -0.001, 0, 0, 0.001, 0, 0, -0.295, 0.08, 0.25, 1]
const proche = (a, b, tol = 0.05, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≠ ${b} (± ${tol})`)

test('la coupe verticale : un rectangle, un trapèze, hors de la porte', () => {
  const rect = [{ u: 0, v: 80 }, { u: 587, v: 80 }, { u: 587, v: 2420 }, { u: 0, v: 2420 }]
  assert.deepEqual(coupeVerticale(rect, 100), { bas: 80, haut: 2420 })
  const trap = [{ u: 0, v: 80 }, { u: 600, v: 80 }, { u: 600, v: 1680 }, { u: 0, v: 1080 }]
  const c = coupeVerticale(trap, 75)
  proche(c.haut, 1155, 1e-9)
  proche(c.bas, 80, 1e-9)
  assert.equal(coupeVerticale(rect, 700), null)
})

test('la hauteur d’imos : la ligne 1 050, la butée à 500 sous le haut, la contradiction', () => {
  assert.deepEqual(hauteurImos({ bas: 80, haut: 2420 }).h, 1050)
  assert.equal(hauteurImos({ bas: 80, haut: 2420 }).borne, 'ligne')
  const b = hauteurImos({ bas: 80, haut: 1508.8 })
  proche(b.h, 1008.8, 1e-9)
  assert.equal(b.borne, 'DIST_TOP')
  assert.equal(hauteurImos({ bas: 80, haut: 700 }).borne, 'contradiction')
  assert.equal(hauteurImos(null).borne, 'hors-porte')
})

/** une porte rectangulaire du designer (F, L) : sa boîte monde en mm */
const rect = (x0, y0, x1, y1) => ({ ...contourPorteDesigner({ min: [x0, y0, 253], max: [x1, y1, 270] }), pullX: 75, pullY: 75 })

test('coupée ou non : un rectangle ne l’est pas (même avec un sommet de plus sur un bord), un trapèze et un coin coupé le sont', () => {
  assert.equal(estCoupee([{ u: 0, v: 80 }, { u: 587, v: 80 }, { u: 587, v: 2420 }, { u: 0, v: 2420 }]), false)
  assert.equal(estCoupee([{ u: 0, v: 80 }, { u: 300, v: 80 }, { u: 587, v: 80 }, { u: 587, v: 2420 }, { u: 0, v: 2420 }]), false)
  assert.equal(estCoupee([{ u: 0, v: 80 }, { u: 600, v: 80 }, { u: 600, v: 1680 }, { u: 0, v: 1080 }]), true)
  assert.equal(estCoupee([{ u: 0, v: 80 }, { u: 587, v: 80 }, { u: 587, v: 2300 }, { u: 470, v: 2420 }, { u: 0, v: 2420 }]), true)
})

test('la porte réelle _Q4L du mur de référence (HEX par défaut) : bord libre à GAUCHE (le côté court), poignée imos à 1 011 → orpheline, 39 mm SOUS la ligne', () => {
  const porte = contourPorteFoxCad(Q4L, GROUPE_Q4L)
  assert.equal(porte.charnieres, 'droite')
  const vs = porte.poly.map((p) => p.v)
  proche(Math.min(...vs), 80, 1e-6, 'le bas de la porte au sol fini')
  proche(Math.max(...vs), 80 + 1888.281, 1e-6, 'le côté long')
  const v = verdictPorte({ ...porte, pullX: 75, pullY: 75 }, {}, { ligne: { h: 1050, source: 'test', rangee: 0 } })
  assert.equal(v.mesures.libre, 'gauche')
  assert.equal(v.mesures.coupee, true)
  // le haut à 75 du bord court : 1 364,149 + 75 × (1 888,281 − 1 364,149) / 586, depuis le bas posé à 80
  const haut = 80 + 1364.149 + (75 * (1888.281 - 1364.149)) / 586
  proche(v.mesures.hautALaLigne, haut, 0.05)
  proche(v.mesures.hauteurImos, haut - 500, 0.05)
  assert.equal(v.mesures.borne, 'DIST_TOP')
  assert.equal(v.orpheline, true)
  assert.equal(v.etiquette, 'PTO-repli')
  proche(v.ecartALaLigne, haut - 500 - 1050, 0.05)
  assert.match(v.raison, /^orpheline : poignée imos à 1 011,2 .* 38,8 mm SOUS la ligne 1 050$/)
})

test('la porte réelle _H5L (HEXA, le coude) : coupée, mais sa poignée reste à 1 050 — sur la ligne', () => {
  const porte = contourPorteFoxCad(H5L, GROUPE_H5L)
  const v = verdictPorte({ ...porte, pullX: 75, pullY: 75 }, {}, { ligne: { h: 1050, source: 'test', rangee: 0 } })
  assert.equal(v.mesures.libre, 'gauche')
  assert.equal(v.mesures.coupee, true)
  const haut = 80 + 1889.399 + (75 / (587 - 83.22)) * (2340 - 1889.399)
  proche(v.mesures.hautALaLigne, haut, 0.05)
  assert.equal(v.mesures.hauteurImos, 1050)
  assert.equal(v.surLaLigne, true)
  assert.equal(v.etiquette, 'poignée')
})

test('la porte pleine réelle d’une colonne PLAT : non coupée, charnières à gauche, bord libre à droite, 1 050', () => {
  const porte = contourPorteFoxCad(PLEINE, GROUPE_PLEINE)
  const v = verdictPorte({ ...porte, pullX: 75, pullY: 75 })
  assert.equal(v.mesures.libre, 'droite')
  assert.equal(v.mesures.coupee, false)
  proche(v.mesures.haut, 2420, 1e-6)
  assert.equal(v.etiquette, 'poignée')
})

test('HEX par défaut, les trois portes réelles ensemble : la ligne vient de la porte NON coupée (1 050) ; la _Q4L orpheline, la _H5L sur la ligne', () => {
  const portes = [contourPorteFoxCad(Q4L, GROUPE_Q4L), contourPorteFoxCad(H5L, GROUPE_H5L), contourPorteFoxCad(PLEINE, GROUPE_PLEINE)].map((p) => ({ ...p, pullX: 75, pullY: 75 }))
  const { verdicts, rangees } = jugerPortes(portes)
  assert.equal(rangees.length, 1)
  assert.equal(rangees[0].ligne, 1050)
  assert.equal(rangees[0].nonCoupees, 1)
  assert.equal(rangees[0].orphelines, 1)
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['PTO-repli', 'poignée', 'poignée'])
  assert.deepEqual(compteEtiquettes(verdicts), { 'PTO-repli': 1, poignée: 2 })
})

test('HEX-05 réel (800 / 2 550, 41,8°) : la ligne 1 050 de la seule porte non coupée ; col. 1 (311) et col. 2 (839) orphelines — la col. 2 que la page dessine SUR la ligne', () => {
  const { verdicts, rangees } = jugerPortes(HEX05.portes)
  assert.equal(rangees[0].ligne, 1050)
  assert.equal(rangees[0].nonCoupees, 1)
  assert.deepEqual(verdicts.map((v) => v.etiquette), HEX05.attendu.map((a) => a.etiquette))
  // le contour du fichier est arrondi au dixième : la hauteur imos à 0,15 mm près
  verdicts.forEach((v, i) => proche(v.mesures.hauteurImos, HEX05.attendu[i].hauteurImos, 0.15, v.mesures.borne))
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['PTO-repli', 'PTO-repli', 'poignée', 'poignée', 'poignée'])
  proche(verdicts[1].ecartALaLigne, 838.9 - 1050, 0.15)
  // ce que la page dessine aujourd'hui : la col. 2 à 1 050 (sur la ligne), là où imos ne descend qu'à 839
  assert.equal(HEX05.attendu[1].pageV, 1050)
})

test('un meuble bas (F de 1 400 : portes 98 → 1 320) : toutes les poignées descendent ensemble à 820 — alignées, aucune orpheline, mais « à trancher » (sous la ligne d’imos, d11 sousLaNorme)', () => {
  const portes = [rect(0, 98, 552, 1320), rect(556, 98, 1108, 1320), rect(1112, 98, 1664, 1320)]
  const { verdicts, rangees } = jugerPortes(portes)
  proche(rangees[0].ligne, 820, 1e-9)
  assert.match(rangees[0].source, /3 portes non coupées/)
  assert.equal(rangees[0].sousLaNorme, true)
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['à trancher', 'à trancher', 'à trancher'])
  assert.deepEqual(verdicts.map((v) => v.orpheline), [false, false, false])
  assert.match(verdicts[0].raison, /^à trancher : sur la ligne du meuble \(820, 500 sous le haut 1 320 .* sous la ligne d’imos 1 050 : poignée si la ligne est celle du meuble, PTO si elle est absolue — à Dorian$/)
  // une porte coupée d'un meuble bas, sous SA ligne : orpheline sous les deux lectures → PTO-repli
  const coupee = { poly: [{ u: 1668, v: 98 }, { u: 2220, v: 98 }, { u: 2220, v: 1320 }, { u: 1668, v: 1100 }], charnieres: 'droite', pullX: 75 }
  assert.equal(jugerPortes([...portes, coupee]).verdicts[3].etiquette, 'PTO-repli')
})

test('les surmeubles d’un placard de 3 m : une autre rangée, de petites portes qui ne font pas la ligne et ne sont jamais en repli', () => {
  const portes = [rect(0, 98, 551.5, 2502), rect(0, 2538, 551.5, 2902), rect(555.5, 98, 1107, 2502), rect(555.5, 2538, 1107, 2902)]
  const { verdicts, rangees } = jugerPortes(portes)
  assert.equal(rangees.length, 2)
  assert.equal(rangees[0].ligne, 1050)
  assert.equal(rangees[1].ligne, null)
  assert.match(rangees[1].source, /petites portes seulement/)
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['poignée', 'poignée (petite porte)', 'poignée', 'poignée (petite porte)'])
  assert.match(verdicts[1].raison, /^petite porte \(hauteur 364 < 800\) : jamais en repli, elle ne fait pas la ligne/)
})

test('une rangée sans porte non coupée : la ligne est celle de sa porte la plus haute, et la raison le dit', () => {
  const trap = (u0, hautGauche, hautDroite) => ({ poly: [{ u: u0, v: 80 }, { u: u0 + 587, v: 80 }, { u: u0 + 587, v: hautDroite }, { u: u0, v: hautGauche }], charnieres: 'droite', pullX: 75 })
  const { verdicts, rangees } = jugerPortes([trap(0, 1200, 1700), trap(591, 1700, 2200)])
  assert.equal(rangees[0].nonCoupees, 0)
  assert.equal(rangees[0].ligne, 1050)
  assert.match(rangees[0].source, /^aucune porte non coupée/)
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['PTO-repli', 'poignée'])
})

test('rangeesEtLignes : des portes non coupées qui ne disent pas la même hauteur → la plus fréquente, et le désaccord est rendu', () => {
  const { rangees } = rangeesEtLignes([rect(0, 98, 552, 2402), rect(556, 98, 1108, 2402), rect(1112, 98, 1664, 1320)])
  assert.equal(rangees[0].ligne, 1050)
  assert.deepEqual(rangees[0].desaccord, [1050, 820])
})

test('les portes d’une position : la façade multipart compte pour UNE porte (ses sous-pièces .mpN ne sont pas des portes)', () => {
  const pieces = [
    { ...PLEINE, nom: 'front', hierarchie: '0.1.0', definition: 'MP_1_FR_SHELL_FR08_LAM' },
    { ...PLEINE, nom: 'front', hierarchie: '0.1.0.mp1', definition: 'PD_1_FR_EE1E' },
    { ...PLEINE, nom: 'Door Left', hierarchie: '0.1.0.mp6', definition: 'SRF_FR_3_TOP_EEEE' },
    { ...PLEINE, nom: 'Top', hierarchie: '0.2', definition: 'PD_1_TOP' }
  ]
  assert.deepEqual(portesDePieces(pieces).map((p) => p.hierarchie), ['0.1.0'])
})

test('« Push and Open » choisi → PTO-choix partout, et l’orpheline le reste (dit)', () => {
  const portes = [contourPorteFoxCad(Q4L, GROUPE_Q4L), contourPorteFoxCad(PLEINE, GROUPE_PLEINE)].map((p) => ({ ...p, pullX: 75, pullY: 75 }))
  const { verdicts } = jugerPortes(portes, { choixPTO: true })
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['PTO-choix', 'PTO-choix'])
  assert.deepEqual(verdicts.map((v) => v.orpheline), [true, false])
  assert.match(verdicts[0].raison, /^« Push and Open » choisi par le client — orpheline/)
})

test('une poignée intégrée sur la ligne → « poignée intégrée » ; une porte trop courte pour 500 + 200 → orpheline sans hauteur', () => {
  const { verdicts } = jugerPortes([rect(0, 98, 552, 2402), rect(556, 98, 1108, 2402)], { integree: true })
  assert.deepEqual(verdicts.map((v) => v.etiquette), ['poignée intégrée', 'poignée intégrée'])
  const courte = { poly: [{ u: 0, v: 80 }, { u: 582, v: 80 }, { u: 582, v: 1000 }, { u: 0, v: 700 }], charnieres: 'droite', pullX: 75 }
  const j = jugerPortes([courte, rect(586, 80, 1168, 2420)])
  assert.equal(j.verdicts[0].mesures.hauteurImos, null)
  assert.equal(j.verdicts[0].mesures.borne, 'contradiction')
  assert.equal(j.verdicts[0].etiquette, 'PTO-repli')
  assert.equal(j.verdicts[0].ecartALaLigne, null)
  assert.match(j.verdicts[0].raison, /^orpheline : la porte n’a pas 500 \+ 200 mm de haut/)
})

test('une porte de l’aile d’un L (de côté) : la façade est le plan de la plus grande étendue horizontale', () => {
  const p = contourPorteDesigner({ min: [-1247, 98, -1092], max: [-1230, 2402, -543] })
  assert.equal(p.orientation, 'côté')
  assert.equal(verdictPorte({ ...p, pullX: 75, pullY: 75 }).mesures.largeur, 549)
})

test('PTO au choix selon le PDF de la gamme (colonne P p&o) : FA_1 partout, FA_4a en 1–3, FA_5a en 3–4, FA 2x jamais, inconnu dit', () => {
  assert.equal(ptoPrevuParLePdf('FR_01_LAM', 'COLLECTION_01', GAMME, CORRESPONDANCE).prevu, true)
  assert.equal(ptoPrevuParLePdf('FR_01_LAQ', 'COLLECTION_04', GAMME, CORRESPONDANCE).prevu, true)
  assert.equal(ptoPrevuParLePdf('FR_08_LAM', 'COLLECTION_02', GAMME, CORRESPONDANCE).prevu, true)
  const fr10 = ptoPrevuParLePdf('FR_10_LAM', 'COLLECTION_02', GAMME, CORRESPONDANCE)
  assert.equal(fr10.prevu, false)
  assert.equal(fr10.fa, 'FA_5a')
  assert.equal(ptoPrevuParLePdf('FR_02_VRN', 'COLLECTION_03', GAMME, CORRESPONDANCE).prevu, false)
  assert.equal(ptoPrevuParLePdf('FR_99_XXX', 'COLLECTION_01', GAMME, CORRESPONDANCE).prevu, null)
})

test('le PDF relu : quinze pages, la légende à part, les tables des FA 1 à 8, les pastilles hors page ne valent rien', () => {
  assert.deepEqual(GAMME.source.pages_de_legende, [1])
  assert.equal(GAMME.facades.length, 14)
  assert.equal(GAMME.source.pages, 15)
  const fa = Object.fromEntries(GAMME.facades.map((f) => [f.fa, f.table['P p&o'].join('')]))
  assert.deepEqual(fa, { FA_1: '1234', FA_2a: '', FA_2b: '', FA_2c: '', FA_2d: '', FA_2e: '', FA_3: '134', FA_4a: '123', FA_4b: '123', FA_5a: '34', FA_5b: '34', FA_6: '234', FA_7: '234', FA_8: '23' })
})

test('« Push and Open » offert par le formulaire : le filtre de la ligne TIPON', () => {
  const poignees = [{ label: 'Push and Open', value: 'TIPON', data: { hinge_option: 'Tipon', filter: ['COLLECTION_01X', 'COLLECTION_04X'] } }]
  assert.equal(ptoOffertParLeFormulaire('COLLECTION_01', poignees).offert, true)
  assert.equal(ptoOffertParLeFormulaire('COLLECTION_02', poignees).offert, false)
  assert.equal(ptoOffertParLeFormulaire('COLLECTION_04', poignees).offert, true)
  assert.equal(ptoOffertParLeFormulaire('COLLECTION_01', []).offert, null)
})

test('la planche du mur v3 : statique (aucun script), images locales, les cas de référence en tête, plus de A / B / C', async () => {
  const { planche } = await import('../board/planche.mjs')
  const { verdicts, rangees } = jugerPortes(HEX05.portes)
  const portes = HEX05.portes.map((p, i) => ({ ...p, source: 'fox-cad', verdict: verdicts[i], hier: { etiquette: i < 2 ? 'PTO-repli' : 'poignée' }, poigneePage: { v: HEX05.attendu[i].pageV, duBordLibre: 75, qui: 'fox-cad', type: 'glb' } }))
  const cas = {
    id: 'HEX-05', titre: 'HEX <800 / 2 550>', forme: 'OS_SHAPE_HEX', intention: 'le mur', valeursSemees: { ZH_LOW_H_L: '800' },
    resolu: { collection: 'COLLECTION_01', front: 'FR_01_LAM', frontInfo: 'STANDARD', pull: 'FU_HN_103820050052', pullLibelle: 'Circle', pullX: 75, finition: 'UN_00113_CST' },
    badge: 'pièces par fox-cad', prix: '3 374,39 €', lot: { positions: 6, pieces: 62, manques: 0, erreurs: 0 }, pleines: 0,
    portes, rangees, changements: [], hierApparie: 5,
    compte: compteEtiquettes(verdicts), ptoAuChoix: { pdf: ptoPrevuParLePdf('FR_01_LAM', 'COLLECTION_01', GAMME, CORRESPONDANCE), formulaire: { offert: true, raison: 'TIPON « Push and Open » filtré COLLECTION_01X, COLLECTION_04X — offert en COLLECTION_01' }, choisi: false },
    avertissements: [],
    images: { s16: 'img/HEX-05_S16.jpg', s16Vignette: 'img/HEX-05_S16_960.jpg', s16Ligne: 'img/HEX-05_S16_ligne.jpg', s16LigneVignette: 'img/HEX-05_S16_ligne_960.jpg', s11: 'img/HEX-05_S11_900.jpg', s11Plein: 'img/HEX-05_S11.jpg' }
  }
  const html = planche({ titre: 'Board PTO', version: 3, date: '2026-09-24', genere: 'x', base: 'http://localhost:3026', build: '1fa0a99', parametres: { regle: 'alignement', regleImos: { ligne: 1050, distTop: 500, distBot: 200 }, tolerance: 0.5, ecartRangee: 100, petite: 800 }, references: ['HEX-05'], v2: { seuil: 900, genere: '2026-09-23 23:46' }, situations: 'scripts/situations/pto-2026-09-24.json', gamme: GAMME, correspondance: CORRESPONDANCE, cas: [cas] })
  assert.doesNotMatch(html, /<script/i)
  assert.doesNotMatch(html, /\son[a-z]+=/i)
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) assert.match(m[1], /^img\//)
  assert.match(html, /HEX &lt;800 \/ 2 550&gt;/)
  assert.ok(html.indexOf('id="ref-HEX-05"') < html.indexOf('id="HEX-05"'), 'le cas de référence avant la liste des cas')
  assert.ok(html.indexOf('id="ref-HEX-05"') < html.indexOf('<h3>La règle, porte par porte'), 'le cas de référence en tête, avant la règle détaillée')
  assert.ok(html.indexOf('id="ref-HEX-05"') < html.indexOf('<h3>Cas par cas'), 'le cas de référence avant le tableau des cas')
  assert.match(html, /img\/HEX-05_S16_ligne_960\.jpg/)
  assert.match(html, /la page la dessine SUR la ligne \(1\s050\)/)
  assert.match(html, /Ce qui change contre la v2/)
  assert.doesNotMatch(html, /Ce qui change d'un seuil à l'autre|la garde « 1 256 »/)
  assert.match(html, /PTO-repli/)
})

test('la planche dit la seule question ouverte : un meuble bas, alignées sous la ligne du meuble, en PTO sous la ligne absolue d’imos', async () => {
  const { planche } = await import('../board/planche.mjs')
  const portes = [rect(0, 98, 552, 1320), rect(556, 98, 1108, 1320), rect(1112, 98, 1664, 1320)]
  const { verdicts, rangees } = jugerPortes(portes)
  const cas = {
    id: 'F-07', titre: 'F bas', forme: 'OS_SHAPE_F', valeursSemees: {}, resolu: { collection: 'COLLECTION_01', front: 'FR_01_LAM', pull: 'X', pullX: 75 },
    portes: portes.map((p, i) => ({ ...p, zone: `porte ${i + 1} (face)`, verdict: verdicts[i] })), rangees, changements: [], hierApparie: 0, compte: compteEtiquettes(verdicts), ptoAuChoix: {}, avertissements: [], images: null
  }
  const board = { titre: 'Board', version: 3, date: 'x', genere: 'x', base: 'x', parametres: { regleImos: { ligne: 1050, distTop: 500, distBot: 200 }, tolerance: 0.5, ecartRangee: 100, petite: 800 }, references: [], cas: [cas] }
  const html = planche(board)
  assert.match(html, /La seule question ouverte : la ligne d’un meuble bas/)
  assert.match(html, /La seule question ouverte : la ligne d’un meuble bas<\/b> — 3 portes <span class="e e-trancher">à trancher<\/span>/)
  assert.match(html, /ligne absolue : elles passent en PTO-repli, le meuble entier sans poignée \(0 \+ 3 = 3\)/)
  // un meuble de hauteur normale : pas de question
  const hautes = [rect(0, 98, 552, 2402)]
  const jn = jugerPortes(hautes)
  const normal = { ...cas, portes: hautes.map((p, i) => ({ ...p, zone: `porte ${i + 1} (face)`, verdict: jn.verdicts[i] })), rangees: jn.rangees, compte: compteEtiquettes(jn.verdicts) }
  assert.doesNotMatch(planche({ ...board, cas: [normal] }), /La seule question ouverte/)
})

test('la ligne attendue de d11 contre le board : sa lecture A (la ligne tient ou rien = l’alignement à 2 500) et la poignée à 5 mm près', () => {
  const portes = [contourPorteFoxCad(Q4L, GROUPE_Q4L), contourPorteFoxCad(PLEINE, GROUPE_PLEINE)].map((p) => ({ ...p, pullX: 75, pullY: 75 }))
  const { verdicts } = jugerPortes(portes)
  const jugees = [{ zone: 'col. 1 · WACA_LY_D_Q4L (QUAD_L)', verdict: verdicts[0] }]
  const attendu = { source: 'd11', set: 2, hexSit: 'QUAD_L', hexHCourt: 1522.36, poignee: 1008.8, etiquettes: { A: 'PTO', B: 'poignée', C: 'poignée' } }
  const c = comparerAttendu(attendu, jugees)
  assert.equal(c.conforme, true)
  assert.equal(c.ecartPoignee, 2.4)
  assert.equal(comparerAttendu({ ...attendu, etiquettes: { A: 'poignée', B: 'poignée', C: 'poignée' } }, jugees).conforme, false)
  assert.equal(comparerAttendu({ ...attendu, poignee: 1000 }, jugees).conforme, false)
  assert.equal(comparerAttendu({ ...attendu, set: 4 }, jugees).texte, 'aucune porte jugée au Set 4')
  assert.equal(comparerAttendu(null, jugees), null)
})

