// Le rouge du schéma sur les façades de fox-cad (demande de d10, 23/09 19:2x ; d5 19:4x) : en mode schéma, une porte ou un morceau d'une
// façade multipart prend le rouge plat des portes du designer d'Otman, mesuré dans sa scène (`MeshStandardMaterial` #e74c3c, sans carte) ;
// les autres pièces gardent leur rendu. Joué par `npm test` ; à côté du module (scripts/ est à d10 depuis le 23/09 17:3x).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enRougeSchema, ROUGE_SCHEMA_FACADE } from './multipart.ts'

test('le rouge est celui des portes du designer en schéma, mesuré dans sa scène', () => {
  assert.equal(ROUGE_SCHEMA_FACADE, '#e74c3c')
})

test('une porte de fox-cad (Door Left, front) et chaque morceau d une façade multipart sont peints ; un panneau, un tiroir non', () => {
  assert.equal(enRougeSchema({ nom: 'Door Left' }, false), true)
  assert.equal(enRougeSchema({ nom: 'front' }, false), true, 'le parent MP_1_FR_SHELL_… et la porte pleine PD_1_FR_1111 s appellent « front »')
  assert.equal(enRougeSchema({ nom: 'Door Left' }, true), true, 'la toile de la façade')
  assert.equal(enRougeSchema({ nom: 'front' }, true), true, 'un montant, une traverse, le panneau')
  assert.equal(enRougeSchema({ nom: 'Side Panel_Ri' }, false), false)
  assert.equal(enRougeSchema({ nom: 'Shelf' }, false), false)
  assert.equal(enRougeSchema({ nom: 'Drawer front' }, false), false, 'une façade de tiroir n est pas une porte (estPorte)')
})
