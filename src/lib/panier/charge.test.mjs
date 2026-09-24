// La charge du clic « Add to cart » (ligne du lead à d10 24/09 11:0x, « tout donner à Rachid ») : les cinq champs ajoutés — le prix de la
// configuration envoyée ou rien, la taxe du bandeau, les empreintes de ce que l'API a servi, le commit du front. Les nombres de F-01 sont ceux
// de l'API mesurée sur slop (oaks_server `1338d50`) ; les empreintes se recoupent avec `sha12` du board (`scripts/board/preset.mjs`).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { CLES_AJOUTEES, CLES_AVANT, commitDuFront, empreinte12, empreintesServies, jsonCanonique, prixDeLaCharge } from './charge.ts'
import { sha12 } from '../../../scripts/board/preset.mjs'

const DETAILS_F01 = { 'Carcase & Fittings': 2032.17, Handle: 20.2, Door: 114.2, Pose: 480, 'HEX supplement colonne coupee': 0 }
const F01 = { totalPrice: 2646.54, details: DETAILS_F01, prices: null, breakdown: [] }

test('les clés : les huit d’avant, puis les cinq ajoutées — aucune en double', () => {
  assert.deepEqual([...CLES_AVANT], ['action', 'name', 'pricing', 'form', 'description', 'shape', 'xmlFile', 'image'])
  assert.deepEqual([...CLES_AJOUTEES], ['totalPrice', 'details', 'tva', 'pays', 'versions'])
  assert.equal(new Set([...CLES_AVANT, ...CLES_AJOUTEES]).size, 13)
})

test('le prix : le HT et son détail quand la réponse répond à la configuration envoyée', () => {
  assert.deepEqual(prixDeLaCharge(F01, true, { tva: 6, pays: 'BE' }), { totalPrice: 2646.54, details: DETAILS_F01, tva: 6, pays: 'BE' })
  // l'API d'avant 1338d50 remettait le TTC réduit en tête : le HT est dans prices.price_ht — jamais deux TVA
  assert.equal(prixDeLaCharge({ totalPrice: 2805.33, prices: { price_ht: 2646.54 } }, true, { tva: 6, pays: 'BE' }).totalPrice, 2646.54)
})

test('le prix : rien plutôt que celui d’une autre configuration (un recalcul en cours) ; la taxe reste', () => {
  assert.deepEqual(prixDeLaCharge(F01, false, { tva: 21, pays: 'BE' }), { totalPrice: null, details: null, tva: 21, pays: 'BE' })
  assert.deepEqual(prixDeLaCharge(undefined, true, { tva: 21, pays: 'BE' }), { totalPrice: null, details: null, tva: 21, pays: 'BE' })
  assert.equal(prixDeLaCharge({ totalPrice: 10 }, true, { tva: 21, pays: 'BE' }).details, null, 'une API sans details : null, pas undefined')
})

test('le JSON canonique : le même texte quel que soit l’ordre des clés (la forme servie par 4848 le change d’une réponse à l’autre)', () => {
  const a = { cps: { CP_1_FI_1001: { a: 1 }, CP_1_BA_E001: { b: [2, { y: 1, x: 0 }] } }, name: 'OAKSOME_SHAPE_HEX' }
  const b = { name: 'OAKSOME_SHAPE_HEX', cps: { CP_1_BA_E001: { b: [2, { x: 0, y: 1 }] }, CP_1_FI_1001: { a: 1 } } }
  assert.notEqual(JSON.stringify(a), JSON.stringify(b))
  assert.equal(jsonCanonique(a), jsonCanonique(b))
  assert.deepEqual(JSON.parse(jsonCanonique(a)), a, 'le même contenu')
  assert.equal(jsonCanonique({ z: undefined, a: null, t: [undefined] }), '{"a":null,"t":[null]}', 'comme JSON.stringify pour undefined')
  assert.equal(jsonCanonique('é'), '"é"')
})

test('les empreintes : celles du board (sha256 du JSON, 12 caractères) ; la forme par son JSON canonique', async () => {
  const form = { configurator: { type: 'ROOT', children: [{ type: 'FIELD', name: 'OV_PULL' }] }, sources: { s1: { A: 'a' } } }
  const shape = { variables: { ZF_W: '3000', ZF_D: '500' }, zone: { name: 'Z' } }
  const e = await empreintesServies(form, shape)
  assert.equal(e.arbre, sha12(form), 'l’empreinte d’oaksome-stack et du board')
  assert.equal(e.forme, createHash('sha256').update(jsonCanonique(shape)).digest('hex').slice(0, 12))
  assert.equal((await empreintesServies(form, { zone: { name: 'Z' }, variables: { ZF_D: '500', ZF_W: '3000' } })).forme, e.forme)
  assert.deepEqual(await empreintesServies(null, undefined), { arbre: null, forme: null }, 'une forme sans formulaire')
  assert.match(await empreinte12(''), /^[0-9a-f]{12}$/)
})

test('le commit du front : ce que le build a gravé, sinon null', () => {
  assert.equal(commitDuFront('29fbcba'), '29fbcba')
  assert.equal(commitDuFront(' 29fbcba-modifie '), '29fbcba-modifie')
  assert.equal(commitDuFront(''), null)
  assert.equal(commitDuFront(undefined), null)
})
