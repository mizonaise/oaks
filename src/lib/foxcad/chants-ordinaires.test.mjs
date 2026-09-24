// LES CHANTS DES PIÈCES ORDINAIRES (d5, 24/09/2026 — ligne du lead 23/09 06:3x ④, mot de Dorian « il y a aussi les chants ») : le moteur
// sert les chants par côté sur toutes les pièces (contrat v0.2.42 ; mesuré le 24/09 sur HEX FR_08 avec fox-cad 61f81c9 : 57 / 57 pièces
// ordinaires, le côté 1 = le bord y = 0, l'avant). L'écran dessine un bord NU au noyau de la pièce et un chant COLLÉ au décor de la face ;
// le décor du chant lui-même (un ABS noyer sur un côté en F416) n'est servi par aucune API de la page — dit, ligne à d1. Sans chants servis,
// rien ne change (tout au décor). Les cas ci-dessous sont les pièces servies ce matin, telles quelles.
// Joué par `npm test`, sans réseau.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FACE_BOITE, facesPieceOrdinaire } from './multipart.ts'

const nu = (cote) => ({ cote, pose: false, epaisseur: 0, hauteur: 999 })
const colle = (cote, profil) => ({ cote, pose: true, profil, epaisseur: 1, hauteur: 23 })

test('une tablette (PD_1_AS_1000, 553 × 447) : son chant avant (côté 1 = y 0) au décor, ses trois autres bords au noyau, ses faces au décor', () => {
  const f = facesPieceOrdinaire({ chants: [colle(1, 'EG_ABS_F416_ST10_1'), nu(2), nu(3), nu(4)] })
  assert.equal(f.geometrie, 'boite')
  assert.equal(f.chants, 'par-cote')
  const attendu = ['noyau', 'noyau', 'noyau', 'noyau', 'face', 'face']
  attendu[FACE_BOITE.cote1] = 'chant'
  assert.deepEqual(f.matieres, attendu)
  assert.equal(f.matieres[FACE_BOITE.cote1], 'chant', 'le bord y = 0 : la face −y de la boîte')
  assert.deepEqual(f.faces, [FACE_BOITE.dessus, FACE_BOITE.dessous])
})

test('la plinthe (PD_1_BA_E001, 80 × 1 205) : chant sur le côté 4 (x = 0), nue ailleurs — ses bouts montrent le noyau (MDF)', () => {
  const f = facesPieceOrdinaire({ chants: [nu(1), nu(2), nu(3), colle(4, 'UN_ABS_0H251_W06_1')] })
  assert.equal(f.matieres[FACE_BOITE.cote4], 'chant')
  for (const c of ['cote1', 'cote2', 'cote3']) assert.equal(f.matieres[FACE_BOITE[c]], 'noyau', c)
})

test('un filler chanté des quatre côtés (PD_1_FI_1111) : tout au décor, comme avant ; un fond nu des quatre (PD_1_BP_0000) : ses bords au noyau', () => {
  const f = facesPieceOrdinaire({ chants: [1, 2, 3, 4].map((k) => colle(k, 'UN_ABS_0H251_W06_1')) })
  assert.deepEqual(f.matieres, ['chant', 'chant', 'chant', 'chant', 'face', 'face'])
  const fond = facesPieceOrdinaire({ chants: [1, 2, 3, 4].map(nu) })
  assert.deepEqual(fond.matieres, ['noyau', 'noyau', 'noyau', 'noyau', 'face', 'face'])
})

test('sans chants servis (une API d avant v0.2.42) : null — la pièce reste au décor sur ses six faces', () => {
  assert.equal(facesPieceOrdinaire({}), null)
  assert.equal(facesPieceOrdinaire({ chants: [] }), null)
})

test('une pièce à contour (un côté coupé par le rampant) : son prisme, un chant par segment', () => {
  const contour = [
    { x: 1890, y: 0, z: 0 },
    { x: 1362, y: 500, z: 0 },
    { x: 0, y: 500, z: 0 },
    { x: 0, y: 0, z: 0 },
  ]
  const f = facesPieceOrdinaire({ contour, chants: [colle(1, 'UN_ABS_0H251_W06_1'), nu(2), nu(3), nu(4)] })
  assert.equal(f.geometrie, 'prisme')
  assert.deepEqual(f.matieres, ['face', 'face', 'chant', 'noyau', 'noyau', 'noyau'])
  assert.deepEqual(f.faces, [0, 1])
})
