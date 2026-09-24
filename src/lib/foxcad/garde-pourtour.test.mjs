// LA GARDE DU POURTOUR (d5, 24/09/2026 — mesuré EN PUBLIC à 08:21, après l'auto-déploiement de fox-cad `61f81c9`, « la façade à cadre coupée
// par le rampant est au moteur ») : sur la colonne HEXA de HEX (`WACA_LY_D_H5L`, Collection 2 FR_08), le moteur sert la définition d'Otman
// `MP_1_FR_SHELL_5PD10_LAM` comme imos la rend sur cinq arêtes (fr08-lam Set 3) : un parent coupé et six enfants PLATS — dessinés, le montant
// court perçait le plafond en pente et le badge disait « cadre complet ». Une façade coupée dont une sous-pièce sort de son pourtour n'est
// plus dessinée par fox-cad : la porte d'Otman reste, découpée par le contour du parent servi, et le badge dit pourquoi. Sur la colonne QUAD
// (`_Q4L`), le cadre complet du moteur est dessiné — et la traverse en pente MESURÉE : 17,1 mm en travers pour un cadre de 23 (la lecture A ;
// Dorian a choisi B le 24/09 à 07:3x, la traverse de la même largeur quel que soit l'angle — MD2B).
// Les pièces du moteur : `facade-coupee.moteur.json` (fox-cad `61f81c9` sur l'API locale 4312, le lot HEX FR_08 du geste de Dorian, 24/09).
// Joué par `npm test`, sans réseau.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  depassementPolygone,
  direCoupees,
  direMultipartZone,
  facadeCoupeeNonDessinee,
  facadesMultipart,
  largeurEnTravers,
  multipartDePosition,
  porteDessineeParFoxCad,
  renduFacadeMultipart,
  sousPiecesHorsPourtour,
  TOLERANCE_POURTOUR_MM,
  traverseEnPente,
} from './multipart.ts'
import { plansPorte } from './decoupe.ts'
import { direCheminOtman, direDecoupe, PROVISOIRE_CADRE, resumerOtman } from './chemin-otman.ts'

const MOTEUR = JSON.parse(readFileSync(new URL('./facade-coupee.moteur.json', import.meta.url), 'utf8'))
const ATTENDU = JSON.parse(readFileSync(new URL('./facade-coupee.attendu.json', import.meta.url), 'utf8'))
const colonne = (article) => {
  const p = MOTEUR.positions.find((x) => x.article === article)
  return { position: { article: p.article, pieces: p.pieces, manques: p.manques }, lot: { SRF_FR_2_TOP: p.srfFr2Top } }
}
const H5L = colonne('WACA_LY_D_H5L')
const Q4L = colonne('WACA_LY_D_Q4L')

test('H5L servie par le moteur 61f81c9 : quatre sous-pièces hors du pourtour — la façade n est PAS dessinée par fox-cad, la porte d Otman reste', () => {
  const { position, lot } = H5L
  const [f, ...autres] = facadesMultipart(position.pieces)
  assert.equal(autres.length, 0)
  assert.equal(f.kms, 'MP_1_FR_SHELL_5PD10_LAM')
  assert.equal(f.parent.contour.length, 5, 'le parent est coupé : cinq arêtes')
  const hors = sousPiecesHorsPourtour(f, position.pieces)
  // le montant court (2 340 : toute la boîte), la traverse haute (en haut de la boîte), le panneau et la toile (rectangles pleins)
  assert.deepEqual(
    hors.map((h) => h.hierarchie),
    ['0.0.mp2', '0.0.mp4', '0.0.mp5', '0.0.mp6'],
  )
  assert.ok(Math.min(...hors.map((h) => h.depassementMm)) > 300, `chacune sort de plus de 30 cm : ${hors.map((h) => h.depassementMm)}`)
  const rendu = renduFacadeMultipart(f, position.pieces, lot)
  assert.equal(rendu.parFoxCad, false)
  assert.deepEqual(rendu.raisons, ["MP_1_FR_SHELL_5PD10_LAM : 4 sous-pièces hors du pourtour coupé (jusqu'à 335,9 mm, mp2, mp4, mp5, mp6) — non dessinées par fox-cad"])
  assert.equal(porteDessineeParFoxCad(position.pieces, lot), false, 'le masque garde la porte du designer d Otman')
  // le compte reste celui du moteur ; la zone dit le dessin d'Otman et pourquoi
  const m = multipartDePosition(position, lot)
  assert.equal(m.pieces, 7)
  assert.equal(m.parFoxCad, 0)
  assert.equal(m.coupees, undefined, 'rien de coupé DESSINÉ par le moteur')
  assert.match(direMultipartZone(m), /7 pièces comptées, non dessinées\) : dessin d'Otman \(MP_1_FR_SHELL_5PD10_LAM : 4 sous-pièces hors du pourtour coupé/)
})

test('H5L : le contour du PARENT servi découpe la porte d Otman — un plan, le rampant, sans second calcul', () => {
  const { position, lot } = H5L
  const c = facadeCoupeeNonDessinee(position, lot)
  assert.ok(c)
  assert.equal(c.kms, 'MP_1_FR_SHELL_5PD10_LAM')
  assert.equal(c.porte.hierarchie, '0.0')
  assert.equal(c.porte.contour.length, 5)
  // la boîte de la colonne (590 de large, 2 340 de haut — le parent est posé à x = 588,5 = 590 − 1,5) : seul le rampant est en pente
  const plans = plansPorte(c.porte, { w: 590, h: 2340 })
  assert.equal(plans.length, 1)
  const [[ax, ay], [bx, by]] = plans[0].arete
  const angle = (Math.atan2(Math.abs(by - ay), Math.abs(bx - ax)) * 180) / Math.PI
  assert.ok(Math.abs(angle - 41.81) < 0.05, `le rampant à 41,81° : ${angle.toFixed(3)}°`)
  // la phrase de la découpe dit d'où vient le contour et pourquoi fox-cad ne dessine pas
  const phrase = direDecoupe({ etat: 'coupee', module: 'WACA_LY_D_H5L', plein: 'WACA_LY_D', kms: c.kms, plans: 1, coupes: 1, sommets: 5, chant: 'exact', source: 'facade-servie', raison: c.raisons[0] })
  assert.equal(
    phrase,
    `façade d'Otman DÉCOUPÉE par le contour de la façade servie par fox-cad (5 sommets, 1 plan, chant exact) — ${PROVISOIRE_CADRE} (le moteur sert MP_1_FR_SHELL_5PD10_LAM, non dessinée : MP_1_FR_SHELL_5PD10_LAM : 4 sous-pièces hors du pourtour coupé (jusqu'à 335,9 mm, mp2, mp4, mp5, mp6) — non dessinées par fox-cad) ; modèle d'Otman du module plein WACA_LY_D pour WACA_LY_D_H5L`,
  )
  assert.equal(PROVISOIRE_CADRE, 'provisoire : le cadre complet vient avec MD2B', 'la cible est la forme B (Dorian, 24/09 07:3x)')
})

test('Q4L servie par le moteur 61f81c9 : tout tient dans le pourtour, fox-cad dessine — et la traverse en pente est MESURÉE : 17,1 en travers, cadre 23', () => {
  const { position, lot } = Q4L
  const [f] = facadesMultipart(position.pieces)
  assert.deepEqual(sousPiecesHorsPourtour(f, position.pieces), [])
  assert.equal(renduFacadeMultipart(f, position.pieces, lot).parFoxCad, true)
  assert.equal(facadeCoupeeNonDessinee(position, lot), null)
  assert.deepEqual(traverseEnPente(f, position.pieces), { largeurMm: 17.1, cadreMm: 23, hierarchie: '0.0.mp4' })
  const m = multipartDePosition(position, lot)
  assert.equal(m.coupees, 1)
  assert.match(direMultipartZone(m), /dessinée par fox-cad, dont 1 coupée par le moteur \(cadre complet ; traverse en pente 17,1 mm en travers, cadre 23\) : cadre /)
})

test('la largeur en travers de la traverse suit la pente en lecture A — 23 × cos α sur ce qu imos SORT (MD2, MD-corrige) et sur la recette A de d11', () => {
  const sets = [...ATTENDU.imos.flatMap((l) => l.sets.map((s) => ({ ...s, nom: `${l.lot} Set ${s.set}` }))), ...ATTENDU.recette.sets.map((s) => ({ ...s, nom: `recette A Set ${s.set}` }))]
  assert.equal(sets.length, 10)
  for (const s of sets) {
    const [f] = facadesMultipart(s.pieces)
    const t = traverseEnPente(f, s.pieces)
    assert.ok(t, s.nom)
    const attendu = 23 * Math.cos((s.angle * Math.PI) / 180)
    assert.ok(Math.abs(t.largeurMm - attendu) <= 0.1, `${s.nom} (${s.angle}°) : ${t.largeurMm} contre 23 × cos α = ${attendu.toFixed(2)}`)
    assert.equal(t.cadreMm, 23, `${s.nom} : les montants et la traverse basse`)
    assert.equal(t.hierarchie, '0.0.mp4')
  }
})

test('la garde laisse passer ce qu imos sort : aucune sous-pièce hors du pourtour sur MD2 et MD-corrige (le panneau y déborde de 0,5 : sous la tolérance)', () => {
  assert.equal(TOLERANCE_POURTOUR_MM, 1)
  for (const l of ATTENDU.imos)
    for (const s of l.sets) {
      const [f] = facadesMultipart(s.pieces)
      assert.deepEqual(sousPiecesHorsPourtour(f, s.pieces), [], `${l.lot} Set ${s.set}`)
    }
  // une façade plate : rien à garder, pas de traverse en pente
  const [plate] = facadesMultipart(ATTENDU.plate.pieces)
  assert.deepEqual(sousPiecesHorsPourtour(plate, ATTENDU.plate.pieces), [])
  assert.equal(traverseEnPente(plate, ATTENDU.plate.pieces), null)
})

test('fox-cad 339930e (d1, 24/09 09:2x) : les enfants dans l ordre d imos — chaque chant du cadre de Q4L sur un LONG bord, jamais sur un onglet (avant : 61f81c9, sur les onglets)', () => {
  const avant = MOTEUR.positions.find((x) => x.article === 'WACA_LY_D_Q4L').pieces
  const apres = JSON.parse(readFileSync(new URL('./facade-coupee.moteur-339930e.json', import.meta.url), 'utf8')).positions.find((x) => x.article === 'WACA_LY_D_Q4L').pieces
  const coteChante = (p) => {
    const k = p.chants.find((c) => c.pose).cote
    const n = p.contour.length
    const a = p.contour[(k - 2 + n) % n]
    const b = p.contour[k - 1]
    return Math.hypot(b.x - a.x, b.y - a.y)
  }
  for (const h of ['0.0.mp1', '0.0.mp2', '0.0.mp3', '0.0.mp4']) {
    const l0 = coteChante(avant.find((p) => p.hierarchie === h))
    const l1 = coteChante(apres.find((p) => p.hierarchie === h))
    assert.ok(l0 < 60, `${h} avec 61f81c9 : le chant sur un bout de ${l0.toFixed(1)} mm (l onglet)`)
    assert.ok(l1 > 500, `${h} avec 339930e : le chant sur un bord de ${l1.toFixed(1)} mm (le bord intérieur)`)
  }
  // la garde ne change pas : Q4L dans son pourtour, H5L (la définition d'Otman sur cinq arêtes) toujours plate
  const h5l = JSON.parse(readFileSync(new URL('./facade-coupee.moteur-339930e.json', import.meta.url), 'utf8')).positions.find((x) => x.article === 'WACA_LY_D_H5L').pieces
  const [f] = facadesMultipart(h5l)
  assert.equal(sousPiecesHorsPourtour(f, h5l).length, 4)
  const [fq] = facadesMultipart(apres)
  assert.deepEqual(sousPiecesHorsPourtour(fq, apres), [])
})

test('depassementPolygone et largeurEnTravers : les deux mesures, à la main', () => {
  const carre = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ]
  assert.equal(depassementPolygone(carre, [5, 5]), 0, 'dedans')
  assert.equal(depassementPolygone(carre, [10, 5]), 0, 'sur le bord')
  assert.equal(depassementPolygone(carre, [13, 5]), 3, 'dehors : la distance au bord')
  assert.equal(depassementPolygone(carre, [13, 14]), 5, 'dehors, au coin : la distance au sommet')
  // un parallélogramme de 23 mesurés en hauteur le long d'une pente à 60° : 11,5 en travers
  const b = largeurEnTravers([
    { x: 0, y: 0 },
    { x: 100, y: 100 * Math.tan(Math.PI / 3) },
    { x: 100, y: 100 * Math.tan(Math.PI / 3) + 23 },
    { x: 0, y: 23 },
  ])
  assert.ok(Math.abs(b.largeur - 11.5) < 1e-9)
  assert.equal(b.enPente, true)
  assert.deepEqual(largeurEnTravers([{ x: 0, y: 0 }, { x: 2340, y: 0 }, { x: 2317, y: 23 }, { x: 23, y: 23 }]), { largeur: 23, enPente: false }, 'un montant à onglet')
})

test('le badge : la découpe de H5L et le cadre de Q4L dans la même phrase — le provisoire dit MD2B, la traverse sa mesure', () => {
  const { position, lot } = H5L
  const zoneH5L = {
    index: '3',
    porteParFoxCad: false,
    panneauxMasques: 11,
    portesMasquees: 0,
    facadesMasquees: 0,
    portesGardees: 1,
    maillagesGardes: 3,
    speciaux: [{ genre: 'facade-speciale', cpName: 'CP_SDO_FR08_LAM_HR_PM', kmsName: 'MP_1_FR_SHELL_5PD10_LAM', modele: 'Door_FA_4a' }],
    facades: [],
    decoupe: { etat: 'coupee', module: 'WACA_LY_D_H5L', plein: 'WACA_LY_D', kms: 'MP_1_FR_SHELL_5PD10_LAM', plans: 1, coupes: 1, sommets: 5, chant: 'exact', source: 'facade-servie', raison: 'x' },
    multipart: multipartDePosition(position, lot),
  }
  const zoneQ4L = { ...zoneH5L, index: '2', porteParFoxCad: true, portesGardees: 0, portesMasquees: 1, speciaux: [], decoupe: null, multipart: multipartDePosition(Q4L.position, Q4L.lot) }
  const r = resumerOtman([zoneQ4L, zoneH5L])
  assert.equal(r.multipartCoupees, 1)
  assert.deepEqual(r.multipartTraverses, [{ largeurMm: 17.1, cadreMm: 23, hierarchie: '0.0.mp4' }])
  const phrase = direCheminOtman(r)
  assert.match(phrase, /^chemin d'Otman : 1 façade d'Otman \(Door_FA_4a\) découpée par le contour — provisoire : le cadre complet vient avec MD2B · 2 façades multipart \(MP_1_FR_SHELL_5PD10_LAM, 14 pièces\) : 1 dessinée par fox-cad, dont 1 coupée par le moteur \(cadre complet ; traverse en pente 17,1 mm en travers, cadre 23\) \(/)
  assert.match(phrase, /1 par Otman \(MP_1_FR_SHELL_5PD10_LAM : 4 sous-pièces hors du pourtour coupé/)
  assert.equal(direCoupees(0), '')
  assert.equal(direCoupees(2), ', dont 2 coupées par le moteur (cadre complet)', 'sans mesure : la phrase d avant')
})
