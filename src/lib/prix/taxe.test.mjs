// Le prix TTC au taux de la modale (décision A de Dorian, 24/09 10:1x ; la spéc : oaksome-stack `produits/hex/releves/2026-09-24_prix-ttc-
// decision-A-contrat-site-configurateur.md`) : `pays` et `tva` lus dans l'adresse (défaut BE / 21), le bandeau = arrondi2(HT × (1 + tva /
// 100)), les groupes de `details` au même taux. Les nombres de F-01 sont ceux de la spéc et de l'API mesurée sur slop (oaks_server
// `1338d50`) : totalPrice 2 646,54, details { Carcase & Fittings 2 032,17, Handle 20,2, Door 114,2, Pose 480, HEX supplement 0 }.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TAXE_DEFAUT, etiquetteTaxe, htDeLaReponse, lignesDuDetail, lireTaxe, sommeDesLignes, ttc } from './taxe.ts'

const DETAILS_F01 = { 'Carcase & Fittings': 2032.17, Handle: 20.2, Door: 114.2, Pose: 480, 'HEX supplement colonne coupee': 0 }

test('pays et tva lus dans l’adresse ; absents : BE / 21', () => {
  assert.deepEqual(lireTaxe(''), TAXE_DEFAUT)
  assert.deepEqual(lireTaxe('?id=1275000'), TAXE_DEFAUT, 'le template n’est pas une taxe')
  assert.deepEqual(lireTaxe('?id=1275000&pays=BE&tva=6'), { pays: 'BE', tva: 6, origine: { pays: 'adresse', tva: 'adresse' } })
  assert.deepEqual(lireTaxe('?tva=21&pays=lu'), { pays: 'LU', tva: 21, origine: { pays: 'adresse', tva: 'adresse' } })
  assert.deepEqual(lireTaxe(new URLSearchParams({ tva: '6' })), { pays: 'BE', tva: 6, origine: { pays: 'defaut', tva: 'adresse' } })
  assert.equal(lireTaxe('?tva=06').tva, 6)
})

test('hors contrat : le défaut, et le refus est dit', () => {
  for (const t of ['17', '0', '6.0', '6%', 'six', '', '121']) {
    const r = lireTaxe(`?tva=${encodeURIComponent(t)}`)
    assert.equal(r.tva, 21, t)
    assert.equal(r.origine.tva, 'refus', t)
  }
  for (const p of ['Belgique', 'B', 'B1', '']) {
    const r = lireTaxe(`?pays=${encodeURIComponent(p)}&tva=6`)
    assert.equal(r.pays, 'BE', p)
    assert.equal(r.origine.pays, 'refus', p)
    assert.equal(r.tva, 6, 'un pays refusé ne touche pas au taux')
  }
})

test('le bandeau : arrondi2(HT × (1 + tva / 100)) — F-01 et HEX-01', () => {
  assert.equal(ttc(2646.54, 6), 2805.33, 'la spéc : F-01 à 6 %')
  assert.equal(ttc(2646.54, 21), 3202.31, 'la spéc : F-01 à 21 %')
  assert.equal(ttc(3274.66, 21), 3962.34, 'HEX-01 à 21 % (le board v3)')
  assert.equal(ttc(3274.66, 6), 3471.14)
  assert.equal(ttc(0.25, 6), 0.27, 'le demi-centime monte (26,5 c)')
  assert.equal(ttc(1.15, 21), 1.39, '139,15 c : le bruit des flottants ne fait pas monter')
  assert.equal(ttc(0, 21), 0)
})

test('l’étiquette', () => {
  assert.equal(etiquetteTaxe(6), 'TTC 6 %')
  assert.equal(etiquetteTaxe(21), 'TTC 21 %')
})

test('le HT de la réponse : totalPrice, ou prices.price_ht quand l’API a mis le TTC en tête (a218984)', () => {
  assert.equal(htDeLaReponse({ totalPrice: 2646.54, details: DETAILS_F01 }), 2646.54)
  assert.equal(htDeLaReponse({ totalPrice: 2646.54, prices: null }), 2646.54, '1338d50 : prices à null')
  assert.equal(htDeLaReponse({ totalPrice: 2305.66, prices: { price_ht: 2646.54 } }), 2646.54, 'jamais deux TVA')
})

test('l’écran « Détail du prix » : les groupes de details non nuls, dans l’ordre de l’API, au même taux', () => {
  const l21 = lignesDuDetail(DETAILS_F01, 21)
  assert.deepEqual(l21.map((l) => l.nom), ['Carcase & Fittings', 'Handle', 'Door', 'Pose'], 'le groupe à 0 ne s’affiche pas')
  assert.deepEqual(l21.map((l) => l.ttc), [2458.93, 24.44, 138.18, 580.8])
  const l6 = lignesDuDetail(DETAILS_F01, 6)
  assert.deepEqual(l6.map((l) => l.ttc), [2154.1, 21.41, 121.05, 508.8])
  assert.deepEqual(lignesDuDetail(null, 21), [])
  assert.deepEqual(lignesDuDetail(undefined, 21), [])
  assert.deepEqual(lignesDuDetail({ a: 0, b: null }, 21), [], 'tout nul : ni lignes ni bouton')
})

test('l’écart dit, pas caché : les groupes de l’API somment leurs lignes ARRONDIES, totalPrice la somme brute (F-01 : 3 centimes HT)', () => {
  // oaks_server `evaluatePricing` : chaque ligne de `breakdown` est arrondie au centime, `details` somme ces lignes arrondies ;
  // `totalPrice` arrondit la somme brute. Sur F-01 : 2 646,57 contre 2 646,54 — au taux, 4 centimes entre les lignes et le bandeau.
  const ht = Object.values(DETAILS_F01).reduce((s, x) => s + Math.round(x * 100), 0) / 100
  assert.equal(ht, 2646.57)
  assert.equal(sommeDesLignes(lignesDuDetail(DETAILS_F01, 21)), 3202.35)
  assert.equal(ttc(2646.54, 21), 3202.31)
  assert.equal(sommeDesLignes(lignesDuDetail(DETAILS_F01, 6)), 2805.36)
  assert.equal(ttc(2646.54, 6), 2805.33)
})
