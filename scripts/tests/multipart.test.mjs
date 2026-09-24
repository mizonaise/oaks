// La façade multipart de fox-cad — (a) la règle d'attente, (b) le rendu par fox-cad (d5, 23/09, ligne du lead 13:5x : les portes blanches en
// public). Les pièces sont celles que l'API 4311 (fox-cad a8dca99) a rendues le 23/09 pour WACA_LY_D plat en Collection 2 FR_08_LAM
// (docs/releves/2026-09-23_facade-multipart/mesures/hex-fr08.reponse.json), recopiées telles quelles, matière et chants compris.
// Joué par `npm test` (node --test ; node 24 lit le TypeScript sans outil).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  decorPieceFacade,
  direMultipart,
  direMultipartZone,
  estDefinitionMultiple,
  estSousPiece,
  estSurface,
  FACE_BOITE,
  facadesMultipart,
  indicesMultipart,
  indicesSousPieces,
  matieresFaces,
  multipartDePosition,
  porteDessineeParFoxCad,
  renduFacadeMultipart,
  resumeMultipart,
  VARIABLE_TOILE_LOT,
} from '../../src/lib/foxcad/multipart.ts'
import { direCheminOtman, direZoneOtman, resumerOtman } from '../../src/lib/foxcad/chemin-otman.ts'
// `lot.ts` (resumeLot : facadesMultipart / piecesMultipart / facadesMultipartFoxCad) n'est pas joué ici : il importe `@/lib/shape/xmlExport`, un
// alias que node ne résout pas ; son compte est celui de `multipartDePosition`, joué ci-dessous, et il est mesuré à l'écran (`data-foxcad-*-multipart`)

const piece = (nom, hierarchie, definition, cotes, position, extra = {}) => ({
  nom,
  hierarchie,
  definition,
  cotes: { largeur: cotes[0], profondeur: cotes[1], hauteur: cotes[2] },
  position: { x: position[0], y: position[1], z: position[2] },
  orientation: { x: 90, y: -90, z: 0 },
  ...extra,
})

const HPL = { noyau: 'MDF15', dessus: 'UN_HPL_HGP_0H251_W06_0_7', dessous: 'UN_HPL_HGP_0H251_W06_0_7' }
const ABS = 'UN_ABS_0H251_W06_1'
const nu = (cote) => ({ cote, pose: false, epaisseur: 0, hauteur: 999, profil: 'ME_00_OFF_02MM' })
const colle = (cote) => ({ cote, pose: true, epaisseur: 1, hauteur: 23, profil: ABS })

/** la position WACA_LY_D plat, FR_08_LAM, telle que 4311 la rend depuis bbfff6b : 12 panneaux + le parent + six sous-pièces (19 pièces, 0 manque) */
const facadeFR08 = () => [
  piece('front', '0.1.0', 'MP_1_FR_SHELL_FR08_LAM', [2340, 587, 22.4], [588.5, -2.5, 0], { charnieres: 'gauche', matiere: {}, chants: [1, 2, 3, 4].map((c) => ({ cote: c, pose: true, epaisseur: 1, hauteur: 33, profil: ABS })) }),
  piece('front', '0.1.0.mp1', 'PD_1_FR_EE1E', [2340, 23, 16.4], [588.5, -7.5, 0], { charnieres: 'gauche', matiere: HPL, fil: { present: false, angle: 0 }, chants: [nu(1), nu(2), colle(3), nu(4)] }),
  piece('front', '0.1.0.mp2', 'PD_1_FR_E1EE', [2340, 23, 16.4], [24.5, -7.5, 0], { charnieres: 'gauche', matiere: HPL, fil: { present: false, angle: 0 }, chants: [nu(1), colle(2), nu(3), nu(4)] }),
  piece('front', '0.1.0.mp3', 'PD_1_FR_E1EE', [23, 587, 16.4], [588.5, -7.5, 0], { charnieres: 'gauche', matiere: HPL, fil: { present: false, angle: 0 }, chants: [nu(1), colle(2), nu(3), nu(4)] }),
  piece('front', '0.1.0.mp4', 'PD_1_FR_EE1E', [23, 587, 16.4], [588.5, -7.5, 2317], { charnieres: 'gauche', matiere: HPL, fil: { present: false, angle: 0 }, chants: [nu(1), nu(2), colle(3), nu(4)] }),
  piece('front', '0.1.0.mp5', 'PD_1_FR_MAIN_FR08_VRN', [2340, 587, 16.4], [588.5, -2.5, 0], { charnieres: 'gauche', matiere: HPL, fil: { present: false, angle: 0 }, chants: [nu(1), nu(2), nu(3), nu(4)] }),
  piece('Door Left', '0.1.0.mp6', 'SRF_FR_3_TOP_EEEE', [2294, 541, 0], [565.5, -24.9, 23], { charnieres: 'gauche', matiere: {}, chants: [1, 2, 3, 4].map((c) => ({ cote: c, pose: false, epaisseur: 0, hauteur: 999, profil: 'ME_00_OFF_05MM', debut: 'none', fin: 'none' })) }),
]
const panneaux = () => [
  piece('Side Panel', '0', 'PD_EMPTY', [2340, 554, 0], [572, 0, 0], { matiere: {} }),
  piece('Side Panel_Ri', '0', 'PD_1_RS_1000', [2340, 500, 18], [590, 0, 0], { matiere: { noyau: 'EG_ED_HGS_PBO_F416_ST10_18' } }),
  piece('Side Panel_Le', '0', 'PD_1_LS_1000', [2340, 500, 18], [18, 0, 0], { matiere: { noyau: 'EG_ED_HGS_PBO_F416_ST10_18' } }),
  piece('Bottom shelf', '0', 'PD_1_BS_1000_BHA', [554, 500, 18], [18, 0, 0], { matiere: { noyau: 'EG_ED_HGS_PBO_F416_ST10_18' } }),
]
/** le lot du Set (extrait) : la toile « Exterior 02 » est publiée en SRF_FR_2_TOP, SRF_FR_3_TOP n'y est pas */
const LOT = { Door_Name: 'FR_08_LAM', FR_1_THK: '21.4', MAT_FR_1: 'MDF15', SRF_FR_1_TOP: 'UN_HPL_HGP_0H251_W06_0_7', SRF_FR_2_TOP: 'NA_E6127_NATURAL', PRF_FR_1: ABS, PULL_X: '56', PULL_Z: '17.00' }
const positionFR08 = () => ({ article: 'WACA_LY_D', pieces: [...panneaux(), ...facadeFR08()], manques: [], lot: { porte: 'xml', parametresIgnores: [] } })
/** la même position en FR_01 : la porte pleine PD_1_FR_1111, une seule pièce */
const positionFR01 = () => ({ article: 'WACA_LY_D', pieces: [...panneaux(), piece('Door Left', '0.1.0', 'PD_1_FR_1111', [2340, 587, 18], [588.5, -2.5, 0], { charnieres: 'gauche', matiere: HPL })], manques: [], lot: { porte: 'xml', parametresIgnores: [] } })
/** le module coupé : la façade reste un manque, aucune porte */
const positionCoupee = () => ({ article: 'WACA_LY_D_Q4L', pieces: panneaux(), manques: ['zone 0.0 (porte) : pas encore compris : CP_SDO_FR08_LAM_HR_PM : façade à cadre MP_1_FR_SHELL_5PD10_LAM (6 sous-pièces) hors du cas mesuré (plate, en applique, un vantail aux jeux du design)'], lot: { porte: 'xml', parametresIgnores: [] } })

test('la définition multiple, la sous-pièce, les sous-pièces d un parent par la hiérarchie', () => {
  assert.equal(estDefinitionMultiple('MP_1_FR_SHELL_FR08_LAM'), true)
  assert.equal(estDefinitionMultiple('MP_1_FR_SHELL_5PD10_LAM'), true)
  assert.equal(estDefinitionMultiple('PD_1_FR_1111'), false)
  assert.equal(estDefinitionMultiple(undefined), false)
  assert.equal(estSousPiece({ hierarchie: '0.1.0.mp6' }), true)
  assert.equal(estSousPiece({ hierarchie: '0.1.0' }), false)
  assert.equal(estSousPiece({}), false)
  const pieces = positionFR08().pieces
  assert.deepEqual(indicesSousPieces(pieces[4], pieces), [5, 6, 7, 8, 9, 10], 'les six .mpN du parent 0.1.0')
  assert.deepEqual(indicesSousPieces({ hierarchie: '0.1' }, pieces), [], '0.1 n est pas le préfixe .mp de 0.1.0.mp1')
  assert.deepEqual(indicesSousPieces({ hierarchie: undefined }, pieces), [])
})

test('WACA_LY_D plat en FR_08 (4311, 23/09) : UNE façade multipart, le parent et ses six sous-pièces, sept pièces hors de la boucle ordinaire', () => {
  const pieces = positionFR08().pieces
  const f = facadesMultipart(pieces)
  assert.equal(f.length, 1)
  assert.equal(f[0].index, 4)
  assert.equal(f[0].kms, 'MP_1_FR_SHELL_FR08_LAM')
  assert.deepEqual(f[0].sousPieces, [5, 6, 7, 8, 9, 10])
  assert.deepEqual([...indicesMultipart(pieces)].sort((a, b) => a - b), [4, 5, 6, 7, 8, 9, 10], 'sept pièces comptées, hors de la boucle des pièces ordinaires')
})

test('(a) sans décor servi pour la toile, la porte du designer d Otman reste : porteDessineeParFoxCad faux, la raison dite', () => {
  const r = positionFR08()
  // sans le lot : la surface d épaisseur 0 n a ni matière servie ni SRF_FR_2_TOP → la façade reste à Otman, et on sait pourquoi
  assert.equal(porteDessineeParFoxCad(r.pieces), false)
  const rendu = renduFacadeMultipart(facadesMultipart(r.pieces)[0], r.pieces)
  assert.equal(rendu.parFoxCad, false)
  assert.equal(rendu.cadre, 'UN_HPL_HGP_0H251_W06_0_7', 'le cadre a son décor (matiere.dessus)')
  assert.deepEqual(rendu.toile, { decor: null, source: null, raison: `SRF_FR_3_TOP_EEEE : aucune surface servie (matiere {}) et ${VARIABLE_TOILE_LOT} absent du lot` })
  assert.deepEqual(rendu.raisons, [rendu.toile.raison])
  const m = multipartDePosition(r)
  assert.deepEqual(m, { kms: 'MP_1_FR_SHELL_FR08_LAM', pieces: 7, facades: 1, parFoxCad: 0, raisons: rendu.raisons, cadre: 'UN_HPL_HGP_0H251_W06_0_7', toile: null, toileSource: null })
  assert.equal(direMultipartZone(m), `façade multipart de fox-cad (MP_1_FR_SHELL_FR08_LAM, 7 pièces comptées, non dessinées) : dessin d'Otman (${rendu.toile.raison})`)
})

test('(b) avec le lot du Set (SRF_FR_2_TOP = NA_E6127_NATURAL), fox-cad dessine la façade : la toile vient du lot, DITE ; la porte d Otman est masquée', () => {
  const r = positionFR08()
  assert.equal(porteDessineeParFoxCad(r.pieces, LOT), true)
  const rendu = renduFacadeMultipart(facadesMultipart(r.pieces)[0], r.pieces, LOT)
  assert.equal(rendu.parFoxCad, true)
  assert.deepEqual(rendu.raisons, [])
  assert.deepEqual(rendu.toile, { decor: 'NA_E6127_NATURAL', source: 'lot', raison: null })
  const m = multipartDePosition(r, LOT)
  assert.deepEqual(m, { kms: 'MP_1_FR_SHELL_FR08_LAM', pieces: 7, facades: 1, parFoxCad: 1, raisons: [], cadre: 'UN_HPL_HGP_0H251_W06_0_7', toile: 'NA_E6127_NATURAL', toileSource: 'lot' })
  assert.equal(direMultipartZone(m), "façade multipart de fox-cad (MP_1_FR_SHELL_FR08_LAM, 7 pièces) dessinée par fox-cad : cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie)")
  // la surface servie par le moteur gagne sur le lot
  const servie = positionFR08()
  servie.pieces[10].matiere = { dessus: 'NA_E6127_NATURAL' }
  assert.deepEqual(decorPieceFacade(servie.pieces[10], { SRF_FR_2_TOP: 'AUTRE' }), { decor: 'NA_E6127_NATURAL', source: 'matiere', raison: null })
  // NO_SURF dans le lot ne vaut pas une toile
  assert.equal(renduFacadeMultipart(facadesMultipart(r.pieces)[0], r.pieces, { SRF_FR_2_TOP: 'NO_SURF' }).parFoxCad, false)
})

test('le décor d une pièce : la surface dessus, sinon dessous, sinon le noyau ; NO_SURF / NO_MAT ne comptent pas ; une pièce épaisse sans matière est dite', () => {
  const p = piece('x', '0.1.0.mp1', 'PD_1_FR_EE1E', [2340, 23, 16.4], [0, 0, 0])
  assert.deepEqual(decorPieceFacade({ ...p, matiere: { noyau: 'MDF15', dessus: 'NO_SURF', dessous: 'UN_HPL_X' } }), { decor: 'UN_HPL_X', source: 'matiere', raison: null })
  assert.deepEqual(decorPieceFacade({ ...p, matiere: { noyau: 'MDF15', dessus: 'NO_SURF', dessous: 'NO_SURF' } }), { decor: 'MDF15', source: 'matiere', raison: null })
  assert.deepEqual(decorPieceFacade({ ...p, matiere: { noyau: 'NO_MAT' } }), { decor: null, source: null, raison: 'PD_1_FR_EE1E : aucune matière servie (matiere {"noyau":"NO_MAT"})' })
  assert.deepEqual(decorPieceFacade(p), { decor: null, source: null, raison: 'PD_1_FR_EE1E : aucune matière servie (matiere null)' })
  assert.equal(estSurface(p), false)
  assert.equal(estSurface(piece('s', '0.1.0.mp6', 'SRF_FR_3_TOP_EEEE', [2294, 541, 0], [0, 0, 0])), true)
})

test('la porte pleine FR_01 et le module coupé : rien de multipart ; la porte pleine est dessinée par fox-cad', () => {
  assert.deepEqual(facadesMultipart(positionFR01().pieces), [])
  assert.equal(porteDessineeParFoxCad(positionFR01().pieces), true)
  assert.equal(multipartDePosition(positionFR01()), null)
  assert.deepEqual(facadesMultipart(positionCoupee().pieces), [])
  assert.equal(porteDessineeParFoxCad(positionCoupee().pieces, LOT), false, 'aucune porte : le manque, la façade d Otman découpée comme avant')
  assert.equal(multipartDePosition(positionCoupee()), null)
  assert.equal(multipartDePosition({ article: 'X', erreur: 'Interne', message: 'boum' }), null, 'une position en erreur n a rien')
})

test('une pièce multiple qui n est pas une porte (la tringle MP_SPP_HC_ELITE_BLACK, un panneau de liaison) n est pas une façade multipart', () => {
  const tringle = piece('Bar', '0.2.0', 'MP_SPP_HC_ELITE_BLACK', [554, 30, 0], [18, 250, 1800])
  const liaison = piece('Link panel', '0.3', 'P_PD_CPA_40_AC02_R_H3', [1000, 40.7, 2340], [0, 0, 0])
  const sous = piece('Link panel', '0.3.mp1', 'PD_1_LINK', [1000, 18, 2340], [0, 0, 0])
  assert.deepEqual(facadesMultipart([tringle, liaison, sous]), [])
  assert.equal(indicesMultipart([tringle, liaison, sous]).size, 0)
})

test('un parent porte SANS définition multiple mais avec des sous-pièces .mpN est une façade multipart ; un parent MP_ sans sous-pièce aussi (comptée seule, jamais dessinée par fox-cad)', () => {
  const parent = piece('front', '0.1.0', 'X_FR_SHELL', [2340, 587, 22.4], [588.5, -2.5, 0])
  const sous = piece('front', '0.1.0.mp1', 'PD_1_FR_EE1E', [2340, 23, 16.4], [588.5, -7.5, 0], { matiere: HPL })
  assert.deepEqual(facadesMultipart([parent, sous]).map((f) => [f.index, f.sousPieces]), [[0, [1]]])
  assert.equal(porteDessineeParFoxCad([parent, sous], LOT), true, 'une sous-pièce épaisse avec décor, pas de toile à servir : fox-cad dessine')
  const seul = piece('front', '0.1.0', 'MP_1_FR_SHELL_FR08_LAM', [2340, 587, 22.4], [588.5, -2.5, 0])
  assert.deepEqual(facadesMultipart([seul]).map((f) => [f.index, f.sousPieces, f.kms]), [[0, [], 'MP_1_FR_SHELL_FR08_LAM']])
  assert.equal(porteDessineeParFoxCad([seul], LOT), false)
  assert.deepEqual(renduFacadeMultipart(facadesMultipart([seul])[0], [seul], LOT).raisons, ['MP_1_FR_SHELL_FR08_LAM : aucune sous-pièce servie'])
})

test('le résumé du lot HEX en FR_08 : 3 façades multipart, 21 pièces, dessinées par fox-cad avec le lot, par Otman sans — et les phrases du badge', () => {
  const positions = [positionCoupee(), positionCoupee(), positionFR08(), positionFR08(), positionFR08()]
  const avec = resumeMultipart(positions, [LOT, LOT, LOT, LOT, LOT])
  assert.deepEqual(avec, { facades: 3, pieces: 21, kms: ['MP_1_FR_SHELL_FR08_LAM'], parFoxCad: 3, parOtman: 0, raisons: [], cadres: ['UN_HPL_HGP_0H251_W06_0_7'], toiles: ['NA_E6127_NATURAL'], toileDuLot: true })
  assert.equal(direMultipart(avec), "3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) dessinées par fox-cad : cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie)")
  const sans = resumeMultipart(positions)
  assert.equal(sans.parFoxCad, 0)
  assert.equal(sans.parOtman, 3)
  assert.equal(direMultipart(sans), `3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) : dessin d'Otman, pièces fox-cad (SRF_FR_3_TOP_EEEE : aucune surface servie (matiere {}) et ${VARIABLE_TOILE_LOT} absent du lot)`)
  const mele = resumeMultipart(positions, [LOT, LOT, LOT, undefined, LOT])
  assert.equal(direMultipart(mele), `3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) : 2 dessinées par fox-cad (cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie)), 1 par Otman (SRF_FR_3_TOP_EEEE : aucune surface servie (matiere {}) et ${VARIABLE_TOILE_LOT} absent du lot)`)
  assert.equal(direMultipart({ facades: 0, pieces: 0, kms: [], parFoxCad: 0, parOtman: 0, raisons: [], cadres: [], toiles: [], toileDuLot: false }), '')
  // le compte du lot reste celui de fox-cad : 78 pièces (4 + 4 + 3 × 19 ici — les 21 de la façade sont DEDANS, jamais retirées)
  assert.equal(positions.reduce((n, p) => n + p.pieces.length, 0), 4 + 4 + 11 * 3)
  assert.equal(positions.reduce((n, p) => n + p.manques.length, 0), 2)
})

test('le bilan d une zone à façade multipart : (a) porte NON par fox-cad, la porte d Otman gardée ; (b) porte par fox-cad — les phrases de zone et du badge', () => {
  const speciaux = [{ genre: 'facade-speciale', cpName: 'CP_SDO_FR08_LAM_HL_PM', kmsName: 'MP_1_FR_SHELL_FR08_LAM', modele: 'Door_FA_4a' }]
  const attente = { kms: 'MP_1_FR_SHELL_FR08_LAM', pieces: 7, facades: 1, parFoxCad: 0, raisons: [], cadre: null, toile: null, toileSource: null }
  const zone = { index: '0.1', porteParFoxCad: false, panneauxMasques: 11, portesMasquees: 0, facadesMasquees: 0, portesGardees: 1, maillagesGardes: 3, speciaux, facades: [], multipart: attente }
  assert.equal(
    direZoneOtman(zone),
    "chemin d'Otman : façade multipart de fox-cad (MP_1_FR_SHELL_FR08_LAM, 7 pièces comptées, non dessinées) : dessin d'Otman · façade dessinée par Otman (Door_FA_4a) · 11 panneaux du designer masqués",
  )
  const r = resumerOtman([zone, { ...zone, index: '0.2' }, { ...zone, index: '0.3' }])
  assert.equal(r.facades, 3)
  assert.equal(r.facadesMultipart, 3)
  assert.equal(r.piecesMultipart, 21)
  assert.equal(r.multipartParOtman, 3)
  assert.deepEqual(r.kmsMultipart, ['MP_1_FR_SHELL_FR08_LAM'])
  assert.equal(direCheminOtman(r), "chemin d'Otman : 3 façades (Door_FA_4a) · 3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) : dessin d'Otman, pièces fox-cad · 33 panneaux masqués")
  // (b) fox-cad dessine : la porte d Otman est masquée (porteParFoxCad vrai, 1 porte masquée), la zone le dit avec ses décors
  const dessinee = { ...attente, parFoxCad: 1, cadre: 'UN_HPL_HGP_0H251_W06_0_7', toile: 'NA_E6127_NATURAL', toileSource: 'lot' }
  const zoneB = { ...zone, porteParFoxCad: true, portesMasquees: 1, portesGardees: 0, maillagesGardes: 0, multipart: dessinee }
  assert.equal(
    direZoneOtman(zoneB),
    "chemin d'Otman : façade multipart de fox-cad (MP_1_FR_SHELL_FR08_LAM, 7 pièces) dessinée par fox-cad : cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie) · porte de fox-cad (1 porte d'Otman masquée) · 11 panneaux du designer masqués",
  )
  const rb = resumerOtman([zoneB, { ...zoneB, index: '0.2' }, { ...zoneB, index: '0.3' }])
  assert.equal(rb.multipartParFoxCad, 3)
  assert.equal(rb.multipartToileDuLot, true)
  assert.equal(direCheminOtman(rb), "chemin d'Otman : 3 façades multipart (MP_1_FR_SHELL_FR08_LAM, 21 pièces) dessinées par fox-cad : cadre UN_HPL_HGP_0H251_W06_0_7, toile NA_E6127_NATURAL (SRF_FR_2_TOP du Set : la surface n'a pas de matière servie) · 33 panneaux masqués")
  // une zone sans façade multipart ne change rien
  const sans = resumerOtman([{ ...zone, multipart: null }])
  assert.equal(sans.facadesMultipart, 0)
  assert.equal(direCheminOtman(sans), "chemin d'Otman : 1 façade (Door_FA_4a) · 11 panneaux masqués")
})

test('(b) les six faces d une sous-pièce : le décor dessus / dessous, le chant collé avec le décor, le bord nu avec le noyau — dans l ordre des groupes de BoxGeometry', () => {
  assert.deepEqual(FACE_BOITE, { cote1: 3, cote2: 0, cote3: 2, cote4: 1, dessus: 4, dessous: 5 })
  // le montant droit PD_1_FR_EE1E : le côté 3 collé (+y), les autres nus
  assert.deepEqual(matieresFaces([nu(1), nu(2), colle(3), nu(4)]), ['noyau', 'noyau', 'chant', 'noyau', 'face', 'face'])
  // le montant gauche PD_1_FR_E1EE : le côté 2 collé (+x)
  assert.deepEqual(matieresFaces([nu(1), colle(2), nu(3), nu(4)]), ['chant', 'noyau', 'noyau', 'noyau', 'face', 'face'])
  // le parent : quatre chants collés (le pourtour) ; sans chants servis : tout nu
  assert.deepEqual(matieresFaces([colle(1), colle(2), colle(3), colle(4)]), ['chant', 'chant', 'chant', 'chant', 'face', 'face'])
  assert.deepEqual(matieresFaces(undefined), ['noyau', 'noyau', 'noyau', 'noyau', 'face', 'face'])
})
