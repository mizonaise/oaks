// La préconfiguration d'une situation du board (d10, board v2, ligne du lead 23/09 22:4x) : le form résolu (champs de l'utilisateur hors
// HIDEN_FIELDS), les dimensions de la carte, le prix HT / TTC, l'écart à la carte actuelle du site, le recoupement avec la preuve à blanc
// d'oaksome-stack. Les cas réels sont HEX-01 et L-01 tels que la page de 3026 (build 93c37e9) les a résolus le 23/09 à 23:1x, avec le form
// et le prix d'oaksome-stack (presets-candidats.json, 5a45f43), recopiés dans docs/releves/2026-09-23_board-pto/mesures/presets-reels.json.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  carteDeLaForme,
  champsDuFormulaire,
  dimensionsCm,
  ecartALaCarte,
  ecartsDeValeurs,
  formDuPreset,
  lirePrix,
  presetDuCas,
  prixDuPreset,
  recoupement,
  replisDuSemis,
  sha12,
  webpageUrl
} from '../board/preset.mjs'

const CARTES = JSON.parse(readFileSync(new URL('../situations/cartes-du-site-2026-09-23.json', import.meta.url), 'utf8'))
const REELS = JSON.parse(readFileSync(new URL('../../docs/releves/2026-09-23_board-pto/mesures/presets-reels.json', import.meta.url), 'utf8'))

test('sha12 : sha256 du JSON, 12 caractères (le calcul de presets-depuis-board.mjs)', () => {
  assert.equal(sha12({ a: 1 }), '015abd7f5cc5')
  assert.notEqual(sha12({ a: 1 }), sha12({ a: '1' }))
})

test('champsDuFormulaire : les FIELD dans l’ordre de l’arbre, cachés sous HIDEN_FIELDS à toute profondeur', () => {
  const form = {
    configurator: {
      items: [
        {
          children: [
            { type: 'GROUP', name: 'DIMENSIONS', children: [{ type: 'FIELD', name: 'ZF_WIDTH' }, { type: 'FIELD', name: 'ZF_HEIGHT' }] },
            { type: 'GROUP', name: 'HIDEN_FIELDS', children: [{ type: 'FIELD', name: 'PULL_Y' }, { type: 'GROUP', name: 'X', children: [{ type: 'FIELD', name: 'ZF_W' }] }] },
            { type: 'FIELD', name: 'OV_PULL' }
          ]
        }
      ]
    }
  }
  assert.deepEqual(champsDuFormulaire(form), [
    { nom: 'ZF_WIDTH', cache: false },
    { nom: 'ZF_HEIGHT', cache: false },
    { nom: 'PULL_Y', cache: true },
    { nom: 'ZF_W', cache: true },
    { nom: 'OV_PULL', cache: false }
  ])
  assert.deepEqual(champsDuFormulaire(null), [])
})

test('formDuPreset : les champs non cachés, leur valeur résolue en texte, les vides omis', () => {
  const champs = [{ nom: 'A', cache: false }, { nom: 'B', cache: true }, { nom: 'C', cache: false }, { nom: 'D', cache: false }]
  assert.deepEqual(formDuPreset({ A: 3000, B: 'x', C: '', D: 'FR_01_LAM', E: 'hors arbre' }, champs), { A: '3000', D: 'FR_01_LAM' })
})

test('ecartsDeValeurs et replisDuSemis : comparés en texte, sur l’union des clés', () => {
  assert.deepEqual(ecartsDeValeurs({ a: '1', b: 2, c: 'x' }, { a: 1, b: '2', d: 'y' }), ['c', 'd'])
  assert.deepEqual(ecartsDeValeurs({}, {}), [])
  assert.deepEqual(replisDuSemis({ ZH_RUN_L: '1000', ZF_CNT: '5', ABSENT: '1' }, { ZH_RUN_L: '1155', ZF_CNT: '5' }), [{ cle: 'ZH_RUN_L', seme: '1000', rendu: '1155' }])
})

test('dimensionsCm : ZF_* (F, HEX, HEX 2), les deux ailes du L, rien sinon', () => {
  assert.deepEqual(dimensionsCm({ ZF_WIDTH: '2995', ZF_HEIGHT: '2500', ZF_DEPTH: '500' }), { largeur: 300, hauteur: 250, profondeur: 50 })
  assert.deepEqual(dimensionsCm({ ZL_WIDTH: '3000', ZM_WIDTH: '2400', OV_HEIGHT: '2500', ZL_DEPTH: '600' }), { largeur: 300, aile: 240, hauteur: 250, profondeur: 60 })
  assert.equal(dimensionsCm({ OV_COLLECTION: 'COLLECTION_01' }), null)
})

test('lirePrix : le texte de la barre de prix, espaces ordinaires, fines ou insécables', () => {
  assert.equal(lirePrix('3 274,66 €'), 3274.66)
  assert.equal(lirePrix('12 444,83 €'), 12444.83)
  assert.equal(lirePrix('3.274,66 €'), 3274.66)
  assert.equal(lirePrix('1751.28'), 1751.28)
  assert.equal(lirePrix(''), null)
  assert.equal(lirePrix('sans prix'), null)
  assert.equal(lirePrix(null), null)
})

test('prixDuPreset : TTC = HT × 1,21, la promotion du configurateur d’Otman × 0,72 sur le TTC', () => {
  assert.deepEqual(prixDuPreset(3274.66), { ht: 3274.66, ttc: 3962.34, ttcPromotion: 2852.88 })
  assert.deepEqual(prixDuPreset(1751.28), { ht: 1751.28, ttc: 2119.05, ttcPromotion: 1525.72 })
  assert.deepEqual(prixDuPreset(null), { ht: null, ttc: null, ttcPromotion: null })
})

test('la carte actuelle de la forme et l’écart : HEX au-dessus de la carte, un F bas sous « à partir de », HEX 2 sans carte', () => {
  const hex = carteDeLaForme('OS_SHAPE_HEX', CARTES)
  assert.equal(hex.template_id, 1275457)
  assert.deepEqual(ecartALaCarte(prixDuPreset(3274.66), hex), { template_id: 1275457, nom: 'Placard sous pente', prixCarte: 2623.91, ecartTtc: 1338.43, ecartHt: 650.75, sousLaCarte: false })
  const f = ecartALaCarte(prixDuPreset(1751.28), carteDeLaForme('OS_SHAPE_F', CARTES))
  assert.equal(f.ecartTtc, -1055.88)
  assert.equal(f.sousLaCarte, true)
  assert.equal(carteDeLaForme('OS_SHAPE_HEX2', CARTES), null)
  assert.equal(ecartALaCarte(prixDuPreset(1000), null), null)
})

test('webpageUrl : https://<hôte>/shape/<forme> sans paramètre, rien sans hôte', () => {
  assert.equal(webpageUrl('OS_SHAPE_HEX2', CARTES.hotes), 'https://slop.oaksome.com/shape/OS_SHAPE_HEX2')
  assert.equal(webpageUrl('OS_SHAPE_F', CARTES.hotes), 'https://oaks-indol.vercel.app/shape/OS_SHAPE_F')
  assert.equal(webpageUrl('OS_SHAPE_U', CARTES.hotes), null)
})

test('recoupement : form identique ou non, écart de prix, le mur (objet) ou hors HEX (texte)', () => {
  const p = { arbre: { sha12: 'fec1e19cc201', origine: 'arbre 9001 du depot' }, form: { A: '1', B: '2' }, prix: { ht: 100 }, mur: { refus: 0, regles: [] }, pto: { HEX_PTO: '0' } }
  const r = recoupement({ A: '1', B: '2' }, 100.02, p)
  assert.equal(r.formIdentique, true)
  assert.equal(r.ecartPrixHt, 0.02)
  assert.deepEqual(r.mur, { refus: 0, regles: [] })
  const r2 = recoupement({ A: '1', B: '3' }, 100, { ...p, mur: 'hors HEX (le mur ne juge que HEX / HEX 2)' })
  assert.equal(r2.nEcarts, 1)
  assert.deepEqual(r2.ecarts, [{ cle: 'B', page: '3', stack: '2' }])
  assert.equal(r2.mur, null)
  assert.equal(recoupement({}, 1, null), null)
})

for (const [nom, cas, nChamps] of [['HEX-01', REELS.HEX01, 119], ['L-01', REELS.L01, 230]]) {
  test(`cas réel ${nom} : le form de la page = celui d’oaksome-stack (clés et valeurs), le prix HT au centime près`, () => {
    const form = formDuPreset(cas.valeurs, cas.champs)
    assert.equal(Object.keys(form).length, nChamps)
    assert.deepEqual(ecartsDeValeurs(form, cas.stack.form), [])
    const prix = prixDuPreset(lirePrix(cas.prixTexte))
    assert.ok(Math.abs(prix.ht - cas.stack.prix.ht) <= 0.07, `${prix.ht} contre ${cas.stack.prix.ht}`)
    assert.deepEqual(dimensionsCm(cas.valeurs), cas.stack.dimensionsCm)
  })
}

test('presetDuCas : le HT du bandeau (data-prix-ht) prime sur son texte, qui dit le TTC depuis la décision A du 24/09', () => {
  const c = REELS.HEX01
  const base = { forme: c.forme, valeurs: c.valeurs, semees: c.semees, champs: c.champs, arbre: { sha12: c.arbre }, rejeu: null, images: null, pto: null, stack: c.stack }
  const apres = presetDuCas({ ...base, prixTexte: '3 962,34 €', prixHt: 3274.66 }, CARTES)
  assert.deepEqual([apres.prix.ht, apres.prix.ttc], [3274.66, 3962.34], 'le TTC du texte n’est jamais repris pour un HT')
  assert.match(apres.prix.source, /data-prix-ht/)
  const avant = presetDuCas({ ...base, prixTexte: c.prixTexte, prixHt: null }, CARTES)
  assert.deepEqual([avant.prix.ht, avant.prix.ttc], [3274.66, 3962.34], 'un build d’avant : le texte est le HT')
  assert.match(avant.prix.source, /le moteur, HT/)
})

test('presetDuCas (HEX-01 réel) : proposé, la carte à Dorian, l’écart à la carte HEX, le mur d’oaksome-stack', () => {
  const c = REELS.HEX01
  const p = presetDuCas({ forme: c.forme, valeurs: c.valeurs, semees: c.semees, prixTexte: c.prixTexte, champs: c.champs, arbre: { sha12: c.arbre }, rejeu: null, images: null, pto: null, stack: c.stack }, CARTES)
  assert.equal(p.etat, 'proposé')
  assert.equal(p.champs, 119)
  assert.equal(p.configurateur, 'https://slop.oaksome.com/shape/OS_SHAPE_HEX')
  assert.deepEqual(p.replis, [])
  assert.deepEqual(p.dimensionsCm, { largeur: 300, hauteur: 250, profondeur: 50 })
  assert.deepEqual([p.prix.ht, p.prix.ttc], [3274.66, 3962.34])
  assert.equal(p.carteActuelle.ecartTtc, 1338.43)
  assert.equal(p.recoupement.formIdentique, true)
  assert.equal(p.verdicts.mur.refus, 0)
  assert.equal(p.carte.nom, null)
  assert.equal(p.carte.a_remplir, 'Dorian')
  assert.deepEqual(p.odoo, { template_id: null, variant_id: null })
})
