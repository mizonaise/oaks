// La PTO à l'écran (ligne du lead 23/09 19:5x, la règle de Dorian ; d5 21:0x) : une porte en push to open ne porte NI poignée NI pastille, et
// le badge dit « PTO : choix » (le client a pris « Push and Open ») ou « PTO : repli » (l'arbre l'impose dans la zone). Les lots sont ceux
// MESURÉS sur 3025 le 23/09 20:57 (HEX, collection 1, `OV_PULL=TIPON` / la poignée Circle par défaut) et la forme que l'arbre émettra
// (`PTO-PORTE-COUPEE.md` § 4 de d11 : `Handle_Type := STANDARD` + `HINGE_OPTION := Tipon`, `HEX_PTO := 1` en zone). Joué par `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { codePoignee, direPto, estTipon, naturePoignee, naturePoigneePortees } from './pto.ts'

// le lot d'une position de HEX, tel que la page l'envoie à fox-cad (mesuré)
const LOT_CIRCLE = { Handle_Type: 'FU_HN_103820050052', HINGE_OPTION: 'data.hinge_option', PULL_GLB: 'oaksome/pull_glb/FU_HN_103820050052.glb', PULL_X: '75', PULL_Z: '12' }
const LOT_TIPON = { Handle_Type: 'TIPON', HINGE_OPTION: 'data.hinge_option', PULL_GLB: 'oaksome/pull_glb/TIPON.glb', PULL_X: '50', PULL_Z: '0' }
// ce que l'arbre émettra (d11 § 4) : l'option « Push and Open » → STANDARD + Tipon ; le repli → la même chose EN ZONE, avec HEX_PTO
const LOT_ROUTE_PTO = { Handle_Type: 'STANDARD', HINGE_OPTION: 'Tipon', PULL_GLB: 'oaksome/pull_glb/TIPON.glb' }
const LOT_REPLI = { ...LOT_CIRCLE, Handle_Type: 'STANDARD', HINGE_OPTION: 'Tipon', HEX_PTO: '1' }
// la porte technique d'Otman (TEC_ZONE des formulaires F, HEX, HEX 2)
const LOT_TECHNIQUE = { Handle_Type: 'STANDARD', HINGE_OPTION: 'Tipon', PULL_GLB: 'STANDARD', IS_TEC_DOOR: '1' }
const GLOBAL_CIRCLE = { OV_PULL: 'FU_HN_103820050052', Handle_Type: 'FU_HN_103820050052', HINGE_OPTION: 'data.hinge_option' }
const GLOBAL_TIPON = { OV_PULL: 'TIPON', Handle_Type: 'TIPON', HINGE_OPTION: 'data.hinge_option' }

test('le code de la poignée : Handle_Type, sinon le nom du GLB ; Tipon sans casse', () => {
  assert.equal(codePoignee(LOT_TIPON), 'TIPON')
  assert.equal(codePoignee({ PULL_GLB: 'oaksome/pull_glb/WC_OS_GR_FR04.glb' }), 'WC_OS_GR_FR04')
  assert.equal(codePoignee({ PULL_GLB: 'STANDARD' }), 'STANDARD')
  assert.equal(codePoignee({}), '')
  assert.equal(estTipon('Tipon'), true)
  assert.equal(estTipon('TIPON'), true)
  assert.equal(estTipon('data.hinge_option'), false, 'le littéral que l’arbre émet aujourd’hui n’est pas Tipon')
  assert.equal(estTipon('Blumotion'), false)
})

test('une poignée choisie (Circle) : une poignée à poser', () => {
  assert.deepEqual(naturePoignee(LOT_CIRCLE, GLOBAL_CIRCLE), { genre: 'poignee' })
})

test('« Push and Open » choisi dans le formulaire (mesuré le 23/09 : Handle_Type TIPON, HINGE_OPTION littéral) : PTO, choix', () => {
  const n = naturePoignee(LOT_TIPON, GLOBAL_TIPON)
  assert.equal(n.genre, 'pto')
  assert.equal(n.nature, 'choix')
})

test('la route de d11 (STANDARD + Tipon) sur l’option du client reste un CHOIX, pas un repli', () => {
  const n = naturePoignee(LOT_ROUTE_PTO, GLOBAL_TIPON)
  assert.equal(n.genre, 'pto')
  assert.equal(n.nature, 'choix')
})

test('la zone impose la PTO alors que le client a une poignée : REPLI (la surcharge de zone de l’arbre, HEX_PTO = 1)', () => {
  const n = naturePoignee(LOT_REPLI, GLOBAL_CIRCLE)
  assert.equal(n.genre, 'pto')
  assert.equal(n.nature, 'repli')
  assert.match(n.raison, /HEX_PTO = 1/)
  assert.match(n.raison, /FU_HN_103820050052/)
})

test('la porte technique d’Otman (IS_TEC_DOOR = 1) : PTO, technique — même si le client a choisi Push and Open', () => {
  assert.equal(naturePoignee(LOT_TECHNIQUE, GLOBAL_CIRCLE).nature, 'technique')
  assert.equal(naturePoignee(LOT_TECHNIQUE, GLOBAL_TIPON).nature, 'technique')
})

test('« None » (STANDARD, charnière normale) : sans poignée ; une poignée intégrée WC_OS_GR : rien à poser', () => {
  assert.equal(naturePoignee({ Handle_Type: 'STANDARD', HINGE_OPTION: 'Blumotion', PULL_GLB: 'oaksome/pull_glb/STANDARD.glb' }, {}).genre, 'sans')
  const n = naturePoignee({ Handle_Type: 'WC_OS_GR_FR04', PULL_GLB: 'oaksome/pull_glb/WC_OS_GR_FR04.glb' }, {})
  assert.equal(n.genre, 'integree')
  assert.equal(n.code, 'WC_OS_GR_FR04')
})

test('les portées de FoxCadPieces : la position en tête, la globale en dernier', () => {
  assert.equal(naturePoigneePortees([LOT_REPLI, { X: 1 }, { Y: 2 }, GLOBAL_CIRCLE]).nature, 'repli')
  assert.equal(naturePoigneePortees([LOT_TIPON, {}, {}, GLOBAL_TIPON]).nature, 'choix')
  assert.deepEqual(naturePoigneePortees([]), { genre: 'poignee' })
})

test('le badge : « PTO : choix » / « PTO : repli », le compte des portes ; rien quand il n’y en a pas', () => {
  assert.equal(direPto({ ptoChoix: 5, ptoRepli: 0, ptoTechnique: 0, sans: 0, integree: 0 }), 'PTO : choix (5 portes, ni poignée ni perçage)')
  assert.equal(direPto({ ptoChoix: 0, ptoRepli: 1, ptoTechnique: 0, sans: 0, integree: 0 }), 'PTO : repli (1 porte, poignée non installable)')
  assert.equal(direPto({ ptoChoix: 0, ptoRepli: 0, ptoTechnique: 0, sans: 0, integree: 0 }), '')
})
