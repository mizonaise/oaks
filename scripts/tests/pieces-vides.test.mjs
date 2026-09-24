// La pièce VIDE d'imos n'a jamais de maillage (B4, 22/09 — le « voile » sur les modules d'Otman : cinq pièces PD_EMPTY d'épaisseur 0 dessinées
// en plan de 0,01 mm). Ce test est joué par `node --test scripts/tests/` (node 24 lit le TypeScript sans outil ; le dépôt n'a pas de vitest).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aUneCoteNulle, estVide, geometriePiece } from '../../src/lib/foxcad/geometrie.ts'

const piece = (partiel) => ({
  nom: 'Side Panel',
  cotes: { largeur: 2340, profondeur: 554, hauteur: 18 },
  position: { x: 0, y: 0, z: 0 },
  orientation: { x: 0, y: 0, z: 0 },
  ...partiel,
})

test('une pièce d épaisseur 0 est vide (les cinq PD_EMPTY de HEX : 2340 × 554 × 0, 1340 × 500 × 0, 2340 × 500 × 0)', () => {
  for (const cotes of [{ largeur: 2340, profondeur: 554, hauteur: 0 }, { largeur: 1340, profondeur: 500, hauteur: 0 }, { largeur: 2340, profondeur: 500, hauteur: 0 }]) {
    const p = piece({ cotes, definition: 'PD_EMPTY' })
    assert.equal(aUneCoteNulle(p), true)
    assert.equal(estVide(p), true)
  }
})

test('une définition PD_EMPTY est vide même avec une cote (le côté partagé, dans le compte, sans matière)', () => {
  assert.equal(estVide(piece({ definition: 'PD_EMPTY' })), true)
  assert.equal(estVide(piece({ definition: 'pd_empty_2' })), true)
})

test('une pièce de matière n est pas vide : PD_1_FR_1111 18 mm, ou sans définition', () => {
  assert.equal(estVide(piece({ definition: 'PD_1_FR_1111' })), false)
  assert.equal(estVide(piece({})), false)
  assert.equal(aUneCoteNulle(piece({})), false)
})

test('le rendu refuse un maillage pour une pièce vide : c est estVide qui décide, avant geometriePiece', () => {
  // ce que FoxCadPieces fait : `if (estVide(p)) return null` — aucune géométrie n est construite pour une pièce vide ;
  // et si on la construisait quand même, elle serait le plan dégénéré de 0,01 mm (le voile) : on le mesure pour ne plus l oublier
  const vide = piece({ cotes: { largeur: 2340, profondeur: 554, hauteur: 0 }, definition: 'PD_EMPTY' })
  const dessiner = (p) => (estVide(p) ? null : geometriePiece(p))
  assert.equal(dessiner(vide), null)
  const g = geometriePiece(vide)
  g.computeBoundingBox()
  assert.ok(g.boundingBox.max.z - g.boundingBox.min.z <= 0.01, 'sans le garde, le maillage est un plan de 0,01 mm')
  g.dispose()
  const pleine = dessiner(piece({}))
  assert.ok(pleine !== null)
  pleine.dispose()
})
