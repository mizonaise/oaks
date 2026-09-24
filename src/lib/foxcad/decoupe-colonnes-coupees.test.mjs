// Les colonnes coupées de HEX en Collection 2 FR_08 (d5, 23/09 19:1x-19:3x, ligne du lead 18:5x ②) : la façade d'Otman n'y était plus découpée
// par le contour de fox-cad — deux causes, deux gardes. ① `facadeSansPorte` ne connaissait que l'ancien texte du moteur ; ② la façade cachée
// pendant l'attente du contour n'était plus retrouvée quand il arrivait (`racinesFacadeSpeciale`). Joué par `npm test`. Le test vit à côté du
// module (et non dans `scripts/tests/`, les chemins de d10 depuis 17:3x). Les manques sont ceux que l'API fox-cad a rendus le 23/09 : l'ancien
// texte (4311 du matin, `docs/releves/2026-09-23_portes-pente-special-kms/`) et le nouveau (fox-cad `bbfff6b`+, 4311 relancée sur `3164169`
// à 19:0x, HEX Collection 2 FR_08, Sets 2 et 3 : `WACA_LY_D_Q4L` / `_H5L`).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { facadeSansPorte, lotPortePleine, racinesFacadeSpeciale, visibleJusqua } from './decoupe.ts'

const REGLE_6 = " Règle 6 du briefing : on ne devine pas une valeur pour rendre un test vert — on écrit dans releves/ ce qui manque, et on s'arrête."
const ANCIEN = `zone 0.0 (porte) : pas encore compris : KMS MP_1_FR_SHELL_5PD10_LAM : pièce multiple à 6 sous-pièces (PD_1_FR_EE1E, PD_1_FR_E1EE, PD_1_FR_E1EE, PD_1_FR_EE1E, PD_1_FR_MAIN_FR08_VRN, SRF_FR_3_TOP_EEEE) — seule UNE sous-pièce est mesurée.${REGLE_6}`
const NOUVEAU = `zone 0.0 (porte) : pas encore compris : CP_SDO_FR08_LAM_HR_PM : façade à cadre MP_1_FR_SHELL_5PD10_LAM (6 sous-pièces) hors du cas mesuré (plate, en applique, un vantail aux jeux du design) — non mesuré.${REGLE_6}`

const cotes = { largeur: 1, profondeur: 1, hauteur: 1 }
const origine = { x: 0, y: 0, z: 0 }
const joue = { nom: 'Side Panel_Ri', cotes, position: origine, orientation: origine }
const porte = { nom: 'Door Left', cotes, position: origine, orientation: origine, charnieres: 'gauche' }
const position = (pieces, manques) => ({ article: 'WACA_LY_D_Q4L', pieces, manques })

test('le texte de fox-cad depuis bbfff6b (« façade à cadre … hors du cas mesuré ») nomme le KMS : la façade d Otman sera découpée', () => {
  const sans = facadeSansPorte(position([joue], [NOUVEAU]))
  assert.ok(sans, 'avant le 23/09 19:1x : null — la façade du designer restait entière, au-dessus du rampant')
  assert.equal(sans.kms, 'MP_1_FR_SHELL_5PD10_LAM')
  assert.equal(sans.manque, NOUVEAU)
})

test('l ancien texte (« KMS … : pièce multiple ») reste reconnu', () => {
  assert.equal(facadeSansPorte(position([joue], [ANCIEN]))?.kms, 'MP_1_FR_SHELL_5PD10_LAM')
})

test('une porte rendue par fox-cad, un autre manque ou une position en erreur : rien à découper', () => {
  assert.equal(facadeSansPorte(position([joue, porte], [NOUVEAU])), null, 'la porte est là : fox-cad la dessine')
  assert.equal(facadeSansPorte(position([joue], ['zone 0.1 (tablette) : pas encore compris : CP_XYZ : profil inconnu'])), null)
  assert.equal(facadeSansPorte({ article: 'WACA_LY_D_Q4L', erreur: 'ArticleInconnu', message: 'x' }), null)
  assert.equal(facadeSansPorte(undefined), null)
})

test('la position reconnue appelle le second calcul : son lot avec la porte pleine', () => {
  assert.deepEqual(lotPortePleine({ Door_Name: 'FR_08_LAM', FR_1_THK: '21.4' }), { Door_Name: 'FR_01_LAM', FR_1_THK: '21.4' })
})

/**
 * la zone d'un module coupé telle que le designer la monte : le groupe de la zone → la porte (`DoorAnimator`) → le groupe de la façade
 * `special-kms` (la RACINE) → le maillage CSG à matériaux en tableau et groupes, aux cotes de la façade de ses statistiques (586 × 2 340)
 */
const STATS = [{ length: 2340, width: 586, thk: 19 }]
function zoneDuDesigner() {
  const zone = new THREE.Group()
  const porte = new THREE.Group()
  const racine = new THREE.Group()
  const materiaux = Array.from({ length: 6 }, () => new THREE.MeshStandardMaterial())
  const csg = new THREE.Mesh(new THREE.BoxGeometry(586, 2340, 24), materiaux)
  racine.add(csg)
  porte.add(racine)
  zone.add(porte)
  return { zone, porte, racine, csg }
}
const sourceDe = (m) => m.geometry

test('la façade du designer est retrouvée sous une porte gardée', () => {
  const { zone, racine } = zoneDuDesigner()
  assert.deepEqual(racinesFacadeSpeciale(zone, STATS, sourceDe), [racine])
})

test('la façade que NOUS avons cachée pendant l attente du contour est retrouvée quand il arrive — sans cela elle restait cachée pour toujours', () => {
  const { zone, racine, csg } = zoneDuDesigner()
  // l'attente (DecoupeOtman) : la façade entière ne se montre pas, même une image — la racine est cachée et retenue
  racine.visible = false
  const cacheesParNous = new Set([racine])
  assert.deepEqual(racinesFacadeSpeciale(zone, STATS, sourceDe, cacheesParNous), [racine], 'le contour arrive : la racine est retrouvée, montrée, découpée')
  assert.deepEqual(racinesFacadeSpeciale(zone, STATS, sourceDe), [], 'avant le 23/09 19:2x : plus rien à découper, l état restait « en attente »')
  assert.equal(visibleJusqua(csg.parent, zone, cacheesParNous), true)
  assert.equal(visibleJusqua(csg.parent, zone), false)
})

test('une façade cachée par un autre (le masque : fox-cad a la porte) n est pas à découper', () => {
  const { zone, porte, racine } = zoneDuDesigner()
  porte.visible = false
  assert.deepEqual(racinesFacadeSpeciale(zone, STATS, sourceDe, new Set([racine])), [], 'seul ce que nous avons caché compte pour visible')
})

test('ni un maillage à un seul matériau, ni une façade à d autres cotes que celles des statistiques', () => {
  const { zone, csg } = zoneDuDesigner()
  assert.deepEqual(racinesFacadeSpeciale(zone, [{ length: 2340, width: 500, thk: 19 }], sourceDe), [], 'cotes des statistiques différentes')
  csg.material = new THREE.MeshStandardMaterial()
  assert.deepEqual(racinesFacadeSpeciale(zone, STATS, sourceDe), [], 'un seul matériau : pas le CSG de special-kms')
})
