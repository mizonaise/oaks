// La ligne et les pastilles sur la capture (d10, board v3, ligne du lead 24/09 07:5x) : la caméra que la page a posée pour la prise
// (`fiche().prise.camera`), rejouée à l'identique du rig de capture (`src/components/scene/capture/CaptureRig.tsx` : lookAt, setViewOffset
// en pixels arrondis), et le dessin d'un cas en pixels de l'image. Les données réelles : HEX-05 du board v3 (3026 1fa0a99), recopiées dans
// docs/releves/2026-09-23_board-pto/mesures/hex-05-v3.portes.json — ses 5 portes projetées sur leur façade, la caméra S16, et les boutons
// que la page dessine, lus dans la scène (position monde, mm) : deux chemins indépendants qui doivent tomber au même pixel.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cameraDeLaPrise, dessinDuCas, projeter } from '../board/annotation.mjs'
import { pointMonde } from '../board/portes-facade.mjs'
import { bornes, jugerPortes } from '../board/verdict-porte.mjs'

const F = JSON.parse(readFileSync(new URL('../../docs/releves/2026-09-23_board-pto/mesures/hex-05-v3.portes.json', import.meta.url), 'utf8'))
const { largeur, hauteur } = F.image
const proche = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} ≠ ${b} (± ${tol})`)

/** le cas jugé tel que le board le passe au dessin : les portes, leur verdict, le bouton que la page dessine (le plus proche du point) */
function jugeHex05 () {
  const cam = cameraDeLaPrise(F.camera, largeur, hauteur)
  const { verdicts } = jugerPortes(F.portes)
  const portes = F.portes.map((p, i) => {
    const b = bornes(p.poly)
    const u = verdicts[i].mesures.libre === 'gauche' ? b.uMin + 75 : b.uMax - 75
    const a = projeter(cam, pointMonde(p, u, F.attendu[i].pageV), largeur, hauteur)
    const bouton = [...F.boutonsPage].sort((x, y) => {
      const px = projeter(cam, x.pos, largeur, hauteur)
      const py = projeter(cam, y.pos, largeur, hauteur)
      return Math.hypot(px.x - a.x, px.y - a.y) - Math.hypot(py.x - a.x, py.y - a.y)
    })[0]
    return { ...p, verdict: verdicts[i], poigneePage: { v: F.attendu[i].pageV, duBordLibre: 75, qui: 'fox-cad', type: 'glb', pos: bouton.pos } }
  })
  return { id: F.cas, portes }
}

test('la caméra rejouée : la cible tombe au centre du cadre décalé du décentrement ARRONDI au pixel, comme le rig le pose', () => {
  const cam = cameraDeLaPrise(F.camera, largeur, hauteur)
  const c = projeter(cam, F.camera.cible.map((x) => x * 1000), largeur, hauteur)
  const [dx, dy] = F.camera.decentrement
  proche(c.x, largeur / 2 - Math.round(-dx * largeur), 1e-6, 'x')
  proche(c.y, hauteur / 2 - Math.round(-dy * hauteur), 1e-6, 'y')
  assert.equal(c.devant, true)
  assert.equal(projeter(cam, [300, 1150, 9000], largeur, hauteur).devant, false, 'un point derrière la caméra')
})

test('sans caméra posée (une capture d’avant la v3, une prise impossible) : pas de dessin, et c’est dit', () => {
  assert.equal(cameraDeLaPrise(null, largeur, hauteur), null)
  assert.equal(cameraDeLaPrise({ faisable: false, raison: 'x' }, largeur, hauteur), null)
  assert.match(dessinDuCas(jugeHex05(), { camera: null, largeur, hauteur }).erreur, /aucune caméra posée/)
})

test('HEX-05 : chaque bouton que la page dessine (lu dans la scène) tombe à moins de 6 px du point de sa porte — le contour, PULL_X et sa hauteur', () => {
  const cam = cameraDeLaPrise(F.camera, largeur, hauteur)
  for (const p of jugeHex05().portes) {
    const b = bornes(p.poly)
    const u = p.verdict.mesures.libre === 'gauche' ? b.uMin + 75 : b.uMax - 75
    const a = projeter(cam, pointMonde(p, u, p.poigneePage.v), largeur, hauteur)
    const q = projeter(cam, p.poigneePage.pos, largeur, hauteur)
    // le bouton est en saillie, 30 mm devant la face de la porte : l'écart grandit loin du centre de l'image (0,4 px au centre, 5,4 au bord)
    assert.ok(Math.hypot(a.x - q.x, a.y - q.y) < 6, `${p.zone} : ${a.x}, ${a.y} contre ${q.x}, ${q.y}`)
  }
})

test('HEX-05 dessiné : une ligne d’un bord à l’autre à 1 050, trois pastilles SUR la ligne, deux « PTO » sous elle avec leur chute, deux croix sur les boutons de la page', () => {
  const d = dessinDuCas(jugeHex05(), { camera: F.camera, largeur, hauteur })
  assert.equal(d.erreur, undefined)
  assert.equal(d.horsCadre, 0)
  assert.equal(d.lignes.length, 1)
  const l = d.lignes[0]
  assert.equal(l.h, 1050)
  assert.equal(l.texte, 'ligne des poignées 1 050')
  const ys = l.points.map((p) => p[1])
  assert.ok(Math.max(...ys) - Math.min(...ys) < 1, 'une horizontale, caméra de niveau')
  assert.ok(l.points[0][0] < 400 && l.points[l.points.length - 1][0] > 1450, 'du bord gauche de la col. 1 au bord droit de la col. 5')
  assert.deepEqual(d.pastilles.map((p) => p.genre), ['repli', 'repli', 'poignee', 'poignee', 'poignee'])
  assert.deepEqual(d.pastilles.map((p) => p.texte), ['PTO', 'PTO', '', '', ''])
  for (const p of d.pastilles.slice(2)) proche(p.y, ys[0], 0.5, 'une poignée sur la ligne')
  for (const p of d.pastilles.slice(0, 2)) assert.ok(p.y > ys[0] + 20, 'une orpheline sous la ligne')
  assert.equal(d.chutes.length, 2)
  for (const c of d.chutes) proche(c.de[1], ys[0], 0.5, 'la chute part de la ligne')
  assert.equal(d.croix.length, 2)
  // les croix sont sur les boutons de la page (col. 1 descendu à 750, col. 2 à 1 050 : sur la ligne)
  const cam = cameraDeLaPrise(F.camera, largeur, hauteur)
  const boutons = jugeHex05().portes.slice(0, 2).map((p) => projeter(cam, p.poigneePage.pos, largeur, hauteur))
  d.croix.forEach((c, i) => {
    proche(c.x, boutons[i].x, 0.1)
    proche(c.y, boutons[i].y, 0.1)
  })
  proche(d.croix[1].y, ys[0], 1, 'la col. 2 : la page dessine son bouton SUR la ligne')
})
