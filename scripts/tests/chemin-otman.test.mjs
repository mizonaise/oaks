// Le chemin d'Otman sur les formes fox-cad (d5, 23/09) : ce que le designer tient pour spécial, le masque de ses panneaux, le bilan.
// Joué par `npm test` (node --test ; node 24 lit le TypeScript sans outil). Les objets de scène sont des canards : pas de three ici.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  direCheminOtman,
  elementsSpeciaux,
  estFacadeAuxCotes,
  estHorsPanneau,
  estPanneauDuDesigner,
  facadesDuDesigner,
  estPorteDuDesigner,
  genreOtman,
  genrePieceFoxCad,
  masquerPanneauxOtman,
  modeleFacadeOtman,
  resumerOtman,
} from '../../src/lib/foxcad/chemin-otman.ts'

test('le genre d un élément, comme le designer d Otman (CP exact, motif de CP, puis KMS)', () => {
  // les noms sont ceux du graphe rp-engine de WACA_LY_D (article-data, 23/09)
  assert.equal(genreOtman('CP_SDO_FR08_LAM_HL_PM', 'MP_1_FR_SHELL_FR08_LAM'), 'facade-speciale')
  assert.equal(genreOtman('CP_SDO_FR01_LAM_HR_PM', 'PD_1_FR_1111'), 'facade-speciale', 'FR01 aussi : Otman dessine toutes les portes FRnn par special-kms')
  assert.equal(genreOtman('CP_DDO_FR08_LAQ_PB', 'MP_1_FR_SHELL_FR08_LAQ'), 'facade-speciale')
  assert.equal(genreOtman('CP_FS_HC_ELITE_INOX_NC', 'MP_SPP_HC_ELITE_INOX'), 'tringle')
  assert.equal(genreOtman('CP_FS_HC_ELITE_BLACK_NC', 'MP_SPP_HC_ELITE_BLACK'), 'tringle')
  assert.equal(genreOtman('WM_CONN_01', undefined), 'machine-a-laver')
  assert.equal(genreOtman(undefined, 'MP_1_DR_LAQ_TOP'), 'tiroir-special')
  assert.equal(genreOtman('CP_1_TSI_1000_C1', 'PD_1_TS_1000'), 'panneau')
  assert.equal(genreOtman('#DS_CP_PI_IDR', 'PD_1_PI_1000'), 'panneau')
  assert.equal(genreOtman(undefined, undefined), 'panneau')
})

test('le modèle special-kms d une façade, par le nom normalisé du CP (SpecialFrontConfig d Otman)', () => {
  assert.equal(modeleFacadeOtman('CP_SDO_FR08_LAM_HL_PM'), 'Door_FA_4a')
  assert.equal(modeleFacadeOtman('CP_SDO_FR01_LAM_HR_PM'), 'Door_FA_1')
  assert.equal(modeleFacadeOtman('CP_DDO_FR13_VRN_PB'), 'Door_FA_7')
  assert.equal(modeleFacadeOtman('CP_SDO_FR15_LAM_HL_PM'), null, 'FR15 : pas de modèle chez Otman, il ne dessine rien')
  assert.equal(modeleFacadeOtman(null), null)
})

test('une pièce de fox-cad hors panneau : la tringle (MP_SPP_HC_ELITE_*, 554 × 30 × 0 chez fox-cad le 23/09)', () => {
  assert.equal(genrePieceFoxCad({ definition: 'MP_SPP_HC_ELITE_BLACK' }), 'tringle')
  assert.equal(estHorsPanneau({ definition: 'MP_SPP_HC_ELITE_INOX' }), true)
  assert.equal(estHorsPanneau({ definition: 'PD_EMPTY' }), false, 'la pièce vide reste vide, pas une tringle')
  assert.equal(estHorsPanneau({ definition: 'PD_1_FS_1000' }), false)
  assert.equal(estHorsPanneau({}), false)
})

// des canards à la forme de la scène du designer (PD_3D, DoorAnimator, BarHanger, GLB)
const groupe = (children = [], extra = {}) => {
  const g = { visible: true, children, parent: null, ...extra }
  for (const c of children) c.parent = g
  return g
}
const maillage = (extra = {}) => ({ isMesh: true, visible: true, children: [], parent: null, ...extra })
const pd3d = (elemInfo) => groupe([maillage({ userData: elemInfo, geometry: { type: 'BoxGeometry' } })])
const boiteNue = () => maillage({ userData: {}, geometry: { type: 'BoxGeometry' } })
const ongletPd3d = () => maillage({ userData: {}, geometry: { type: 'ExtrudeGeometry', parameters: { options: { steps: 1, bevelEnabled: false } } } })
const tringle = () => groupe([maillage({ geometry: { type: 'ExtrudeGeometry', parameters: { options: { depth: 0.53, bevelEnabled: false, curveSegments: 32 } } } })])
const glb = () => groupe([maillage({ geometry: { type: 'BufferGeometry' } })])
const facadeSpeciale = () => groupe([groupe([maillage({ geometry: { type: 'BufferGeometry' } })])])
/** DoorAnimator : le maillage-sonde invisible, puis DoorPanel → offset → [KmsRenderer, DoorHandle] */
const porteDesigner = (contenu) => {
  const sonde = maillage({ visible: false, geometry: { type: 'BoxGeometry' } })
  const offset = groupe(contenu)
  return groupe([sonde, groupe([groupe([offset])])])
}

test('reconnaître un panneau standard du designer et le sous-arbre d une porte', () => {
  assert.equal(estPanneauDuDesigner(maillage({ userData: { source: 'elem', elemType: 'S' }, geometry: { type: 'BoxGeometry' } })), true)
  assert.equal(estPanneauDuDesigner(maillage({ userData: { source: 'divider', elemType: 'F' }, geometry: { type: 'ExtrudeGeometry', parameters: { options: { steps: 1 } } } })), true)
  assert.equal(estPanneauDuDesigner(boiteNue()), true, 'un côté de tiroir : BoxGeometry sans elemInfo')
  assert.equal(estPanneauDuDesigner(ongletPd3d()), true)
  assert.equal(estPanneauDuDesigner(tringle().children[0]), false, 'la capsule de BarHanger : curveSegments 32')
  assert.equal(estPanneauDuDesigner(glb().children[0]), false)
  assert.equal(estPanneauDuDesigner(groupe()), false)
  assert.equal(estPorteDuDesigner(porteDesigner([pd3d({ source: 'elem', elemType: 'D' })])), true)
  assert.equal(estPorteDuDesigner(groupe([maillage({ geometry: { type: 'BoxGeometry' } })])), false, 'un maillage visible en tête : pas une porte')
  assert.equal(estPorteDuDesigner(groupe([groupe()])), false)
})

test('le masque : les panneaux disparaissent, la porte du designer part avec sa poignée quand fox-cad a la porte', () => {
  const poignee = glb()
  const porte = porteDesigner([pd3d({ source: 'elem', elemType: 'D' }), poignee])
  const zone = groupe([pd3d({ source: 'elem', elemType: 'S' }), pd3d({ source: 'divider', elemType: 'T' }), porte, tringle(), groupe([boiteNue(), ongletPd3d()])])
  const masques = new WeakMap()
  const bilan = masquerPanneauxOtman(zone, true, masques)
  assert.deepEqual(bilan, { panneauxMasques: 4, portesMasquees: 1, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 1 })
  assert.equal(porte.visible, false, 'le sous-arbre de la porte est invisible (poignée comprise)')
  assert.equal(zone.children[0].children[0].visible, false)
  assert.equal(zone.children[4].children[0].visible, false, 'le côté de tiroir (boîte nue)')
  assert.equal(zone.children[4].children[1].visible, false, 'l onglet')
  assert.equal(tringle().children[0].visible, true)
  assert.equal(zone.children[3].children[0].visible, true, 'la tringle reste')
  // idempotent : le second passage rend le même bilan, sans recompter le maillage-sonde du designer
  assert.deepEqual(masquerPanneauxOtman(zone, true, masques), bilan)
})

test('le masque : sans porte chez fox-cad, la façade spéciale du designer et sa poignée restent', () => {
  const porte = porteDesigner([facadeSpeciale(), glb()])
  const zone = groupe([pd3d({ source: 'elem', elemType: 'S' }), porte])
  const masques = new WeakMap()
  const bilan = masquerPanneauxOtman(zone, false, masques)
  assert.deepEqual(bilan, { panneauxMasques: 1, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 2 })
  assert.equal(porte.visible, true)
  assert.deepEqual(masquerPanneauxOtman(zone, false, masques), bilan)
  // une porte standard PD_3D sous une porte gardée (le cas où fox-cad n aurait pas la porte d une zone standard) : gardée telle quelle
  const porteStandard = porteDesigner([pd3d({ source: 'elem', elemType: 'D' })])
  const b2 = masquerPanneauxOtman(groupe([porteStandard]), false)
  assert.deepEqual(b2, { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 1 })
  assert.equal(porteStandard.visible, true)
})

test('le masque : un panneau de porte sans sous-arbre DoorAnimator (le front de tiroir) emporte son groupe offset', () => {
  const front = pd3d({ source: 'elem', elemType: 'D' })
  const poignee = glb()
  const offset = groupe([front, poignee])
  const zone = groupe([offset])
  const bilan = masquerPanneauxOtman(zone, true)
  assert.deepEqual(bilan, { panneauxMasques: 1, portesMasquees: 0, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 0 })
  assert.equal(offset.visible, false)
})

test('le masque : la façade FIXE d Otman (SpecialKms hors animateur de porte, 500 × 590 × 18 mesurée sur WACA_LY_D_Q4L) est masquée quand fox-cad a la porte, gardée sinon', () => {
  const boite = (w, h, t) => ({ min: { x: -w / 2, y: -h / 2, z: -t / 2 }, max: { x: w / 2, y: h / 2, z: t / 2 } })
  const facadeFixe = () => groupe([groupe([maillage({ geometry: { type: 'BufferGeometry', boundingBox: boite(500, 590, 18) } })])])
  const facades = facadesDuDesigner([
    // le front fixe de WACA_LY_D_Q4L tel que le designer l enregistre (23/09) : le CP d une façade, SANS elemType, épaisseur du KMS 19
    { cpName: 'CP_SDO_FR01_LAM_HR_PM', kmsName: 'MP_1_FR_SHELL_5PD10_LAM', length: 590, width: 500, thk: 19 },
    { cpName: 'CP_1_TSI_1000_C1', elemType: 'T', length: 554, width: 462, thk: 18 },
    { cpName: 'CP_FS_HC_ELITE_BLACK_NC', kmsName: 'MP_SPP_HC_ELITE_BLACK', length: 554, width: 30, thk: 0 },
  ])
  assert.deepEqual(facades, [{ length: 590, width: 500, thk: 19 }])
  const zone = groupe([facadeFixe(), tringle()])
  const masques = new WeakMap()
  const bilan = masquerPanneauxOtman(zone, true, masques, facades)
  assert.deepEqual(bilan, { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 1, portesGardees: 0, maillagesGardes: 1 })
  assert.equal(zone.children[0].children[0].children[0].visible, false, 'la façade fixe est cachée')
  assert.equal(zone.children[1].children[0].visible, true, 'la tringle (12 × 30) ne ressemble pas à une façade')
  assert.deepEqual(masquerPanneauxOtman(zone, true, masques, facades), bilan, 'idempotent')
  // sans porte chez fox-cad : la façade fixe d Otman reste (c est son chemin)
  const zone2 = groupe([facadeFixe()])
  assert.deepEqual(masquerPanneauxOtman(zone2, false, new WeakMap(), facades), { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 1 })
  // la face à 0,5 % près, l épaisseur libre (special-kms : 18 ou 22 selon sa config, le KMS dit 19) ; une autre face ne trompe pas le masque
  const presque = maillage({ geometry: { type: 'BufferGeometry', boundingBox: boite(502, 592, 22) } })
  assert.equal(estFacadeAuxCotes(presque, facades), true)
  const autre = maillage({ geometry: { type: 'BufferGeometry', boundingBox: boite(500, 700, 18) } })
  assert.equal(estFacadeAuxCotes(autre, facades), false)
  const capsule = maillage({ geometry: { type: 'ExtrudeGeometry', boundingBox: boite(12, 30, 534) } })
  assert.equal(estFacadeAuxCotes(capsule, facades), false, 'la tringle n a pas la face d une façade')
  // une géométrie sans boîte calculée la calcule
  let calculee = false
  const sansBoite = maillage({ geometry: { type: 'BufferGeometry', boundingBox: null, computeBoundingBox() { calculee = true; this.boundingBox = boite(500, 590, 18) } } })
  assert.equal(estFacadeAuxCotes(sansBoite, facades), true)
  assert.equal(calculee, true)
})

test('le masque SUIT fox-cad (geste de Dorian, 23/09 07:43) : la porte d Otman cachée quand fox-cad avait la porte revient quand il ne l a plus', () => {
  // la page s ouvre sur le front par défaut : fox-cad a la porte de WACA_LY_D, la porte du designer (façade spéciale + poignée) est cachée
  const porte = porteDesigner([facadeSpeciale(), glb()])
  const zone = groupe([pd3d({ source: 'elem', elemType: 'S' }), pd3d({ source: 'elem', elemType: 'S' }), porte])
  const masques = new WeakMap()
  const b1 = masquerPanneauxOtman(zone, true, masques)
  assert.deepEqual(b1, { panneauxMasques: 2, portesMasquees: 1, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 0 })
  assert.equal(porte.visible, false)
  assert.deepEqual(masquerPanneauxOtman(zone, true, masques), b1, 'idempotent tant que fox-cad a la porte')
  // Dorian choisit Collection 2 / FR08 : la façade à cadre est un manque chez fox-cad — le designer garde les mêmes objets, la porte doit REVENIR
  const b2 = masquerPanneauxOtman(zone, false, masques)
  assert.deepEqual(b2, { panneauxMasques: 2, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 2 }, 'la porte est gardée, pas comptée en panneau (avant : 3 panneaux masqués ET 1 façade gardée)')
  assert.equal(porte.visible, true, 'la porte d Otman est rendue')
  assert.equal(porte.children[1].children[0].children[0].children[0].children[0].children[0].visible, true, 'la façade spéciale sous la porte est visible')
  assert.deepEqual(masquerPanneauxOtman(zone, false, masques), b2, 'idempotent sans porte chez fox-cad')
  // et retour au front par défaut : fox-cad a de nouveau la porte, celle du designer se cache de nouveau
  const b3 = masquerPanneauxOtman(zone, true, masques)
  assert.deepEqual(b3, b1)
  assert.equal(porte.visible, false)
  // la façade FIXE cachée pour la même raison revient de même
  const boite = (w, h, t) => ({ min: { x: -w / 2, y: -h / 2, z: -t / 2 }, max: { x: w / 2, y: h / 2, z: t / 2 } })
  const fixe = maillage({ geometry: { type: 'BufferGeometry', boundingBox: boite(500, 590, 18) } })
  const zoneFixe = groupe([groupe([groupe([fixe])])])
  const facades = [{ length: 590, width: 500, thk: 19 }]
  const m2 = new WeakMap()
  assert.deepEqual(masquerPanneauxOtman(zoneFixe, true, m2, facades), { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 1, portesGardees: 0, maillagesGardes: 0 })
  assert.equal(fixe.visible, false)
  assert.deepEqual(masquerPanneauxOtman(zoneFixe, false, m2, facades), { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 1 })
  assert.equal(fixe.visible, true, 'le front fixe d Otman est rendu quand fox-cad n a plus la porte')
  // un panneau que nous avions caché sous une porte que nous gardons désormais (une porte non reconnue à une image précoce) : rendu aussi
  const facadeStd = pd3d({ source: 'elem', elemType: 'D' })
  const porteStd = porteDesigner([facadeStd, glb()])
  const offset = facadeStd.parent
  offset.visible = false
  const m3 = new WeakMap([[offset, 'panneau']])
  assert.deepEqual(masquerPanneauxOtman(groupe([porteStd]), false, m3), { panneauxMasques: 0, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 2 })
  assert.equal(offset.visible, true, 'sous une porte gardée, rien de ce que nous avons caché ne reste caché')
})

test('les éléments spéciaux d une zone depuis les statistiques du designer, le résumé et la phrase du badge', () => {
  const panneaux = [
    { cpName: 'CP_SDO_FR08_LAM_HL_PM', kmsName: 'MP_1_FR_SHELL_FR08_LAM' },
    { cpName: 'CP_1_TSI_1000_C1', kmsName: 'PD_1_TS_1000' },
    { cpName: 'CP_FS_HC_ELITE_BLACK_NC', kmsName: 'MP_SPP_HC_ELITE_BLACK' },
  ]
  const speciaux = elementsSpeciaux(panneaux)
  assert.deepEqual(speciaux, [
    { genre: 'facade-speciale', cpName: 'CP_SDO_FR08_LAM_HL_PM', kmsName: 'MP_1_FR_SHELL_FR08_LAM', modele: 'Door_FA_4a' },
    { genre: 'tringle', cpName: 'CP_FS_HC_ELITE_BLACK_NC', kmsName: 'MP_SPP_HC_ELITE_BLACK', modele: null },
  ])
  const zoneFacade = { index: '0.1', porteParFoxCad: false, panneauxMasques: 11, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 3, speciaux: speciaux.slice(0, 1) }
  const zonePenderie = { index: '0.2', porteParFoxCad: true, panneauxMasques: 10, portesMasquees: 1, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 3, speciaux: speciaux.slice(1) }
  const zoneStandard = { index: '0.3', porteParFoxCad: true, panneauxMasques: 12, portesMasquees: 1, facadesMasquees: 0, portesGardees: 0, maillagesGardes: 0, speciaux: elementsSpeciaux([{ cpName: 'CP_SDO_FR01_LAM_HL_PM', kmsName: 'PD_1_FR_1111' }]) }
  const r = resumerOtman([zoneFacade, zonePenderie, zoneStandard])
  assert.equal(r.facades, 1)
  assert.deepEqual(r.modeles, ['Door_FA_4a'], 'la porte FR01 masquée ne compte pas parmi les façades dessinées')
  assert.equal(r.tringles, 1)
  assert.equal(r.autres, 0)
  assert.equal(r.panneauxMasques, 33)
  assert.equal(r.portesMasquees, 2)
  assert.equal(direCheminOtman(r), "chemin d'Otman : 1 façade (Door_FA_4a) · 1 tringle · 33 panneaux masqués")
  assert.equal(direCheminOtman(resumerOtman([])), '', 'rien de superposé : pas de phrase')
  assert.equal(direCheminOtman(resumerOtman([zoneStandard])), "chemin d'Otman : rien à dessiner · 12 panneaux masqués")
})
