// LE FIL QUE LA PIÈCE PORTE (d5, 24/09/2026 — ligne du lead 08:5x, mot de Dorian 08:4x : « la plinthe et le resserrage plafond doivent avoir
// le sens du fil dans la longueur ; c'est toujours comme ça pour ces contiguous parts en menuiserie »). Le viewer AFFICHE le fil de la pièce,
// sans règle propre : `Piece.fil.angle` (contrat v0.2.42 : 0 = le long de l'axe local x, 90 = le long de y). Les images bois d'imos ont leurs
// veines le long de u (mesuré sur `UN_0H251_W06`) : le fil à l'écran = la direction où croît u sur la face.
// Mesuré le 24/09 (fox-cad 61f81c9) : la plinthe `PD_1_BA_E001` est servie 80 × 1 205 × 17,4 (x = la HAUTEUR, comme imos : FLENG 80), posée
// (90 ; −90 ; 0), `fil { present: false, angle: 0 }` → fil vertical à l'écran, ce que Dorian a vu. Quand le moteur servira `angle: 90`
// (la définition de pièce d'imos, ligne du lead à d1), la plinthe sera veinée le long du mur — sans une ligne de plus ici.
// Joué par `npm test`, sans réseau.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { filLeLongDeY, geometriePiece, geometriePrisme, matricePiece } from './geometrie.ts'

/** la direction (repère local, ou monde si `matrice`) où croît u sur la face de normale locale `normale` : dP/du sur un de ses triangles */
function directionU(g, normale, matrice = null) {
  const pos = g.getAttribute('position')
  const nor = g.getAttribute('normal')
  const uv = g.getAttribute('uv')
  const index = g.getIndex()
  const n = index ? index.count : pos.count
  const k = (i) => (index ? index.getX(i) : i)
  for (let t = 0; t + 2 < n; t += 3) {
    const [a, b, c] = [k(t), k(t + 1), k(t + 2)]
    const nn = new THREE.Vector3().fromBufferAttribute(nor, a)
    if (nn.dot(normale) < 0.99) continue
    const pa = new THREE.Vector3().fromBufferAttribute(pos, a)
    const ab = new THREE.Vector3().fromBufferAttribute(pos, b).sub(pa)
    const ac = new THREE.Vector3().fromBufferAttribute(pos, c).sub(pa)
    const [u0, v0, u1, v1, u2, v2] = [uv.getX(a), uv.getY(a), uv.getX(b), uv.getY(b), uv.getX(c), uv.getY(c)]
    const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)
    if (Math.abs(det) < 1e-12) continue
    const dPdu = ab.multiplyScalar((v2 - v0) / det).add(ac.multiplyScalar(-(v1 - v0) / det))
    if (matrice) dPdu.transformDirection(matrice)
    return dPdu.normalize()
  }
  throw new Error('aucun triangle sur cette face')
}
const Z = new THREE.Vector3(0, 0, 1)
const X = new THREE.Vector3(1, 0, 0)
const suit = (d, axe) => Math.abs(d.dot(axe)) > 0.999

const plinthe = (fil) => ({
  nom: 'Base Parts',
  definition: 'PD_1_BA_E001',
  cotes: { largeur: 80, profondeur: 1204.992, hauteur: 17.4 },
  position: { x: 1500, y: -250, z: 0 },
  orientation: { x: 90, y: -90, z: 0 },
  ...(fil === undefined ? {} : { fil }),
})

test('filLeLongDeY lit l angle servi, rien d autre : 90 (et −90, 270) → y ; 0, 45, absent → x ; même quand present est faux', () => {
  assert.equal(filLeLongDeY({}), false)
  assert.equal(filLeLongDeY({ fil: { present: true, angle: 0 } }), false)
  assert.equal(filLeLongDeY({ fil: { present: true, angle: 90 } }), true)
  assert.equal(filLeLongDeY({ fil: { present: true, angle: -90 } }), true)
  assert.equal(filLeLongDeY({ fil: { present: true, angle: 270 } }), true)
  assert.equal(filLeLongDeY({ fil: { present: true, angle: 45 } }), false, 'imos ne connaît que 0 / 90')
  assert.equal(filLeLongDeY({ fil: { present: false, angle: 90 } }), true, 'present = le noyau ; la surface d un HPL peut être veinée')
})

test('la boîte : sur les grandes faces, u (les veines) suit x sous le fil 0, y sous le fil 90 ; les chants ne bougent pas', () => {
  for (const [fil, axe] of [
    [undefined, 'x'],
    [{ present: true, angle: 0 }, 'x'],
    [{ present: true, angle: 90 }, 'y'],
  ]) {
    const g = geometriePiece(plinthe(fil))
    for (const face of [Z, Z.clone().negate()]) {
      const d = directionU(g, face)
      assert.ok(suit(d, axe === 'x' ? X : new THREE.Vector3(0, 1, 0)), `fil ${JSON.stringify(fil)} face ${face.z} : u suit ${d.toArray().map((v) => v.toFixed(2))}`)
    }
    // les chants : sur la face de normale ±x (le long de y) u suit y, sur ±y u suit x — comme avant, quel que soit le fil
    assert.ok(suit(directionU(g, X), new THREE.Vector3(0, 1, 0)))
    assert.ok(suit(directionU(g, new THREE.Vector3(0, 1, 0)), X))
  }
})

test('la plinthe servie par 61f81c9 (80 × 1 205, posée 90 / −90 / 0) : fil 0 → veines VERTICALES à l écran (le mot de Dorian) ; fil 90 → le long du mur', () => {
  const avant = plinthe({ present: false, angle: 0 })
  const dAvant = directionU(geometriePiece(avant), Z, matricePiece(avant))
  assert.ok(suit(dAvant, new THREE.Vector3(0, 0, 1)), `aujourd hui : les veines suivent la hauteur (z du repère de fox-cad) : ${dAvant.toArray().map((v) => v.toFixed(2))}`)
  const apres = plinthe({ present: true, angle: 90 })
  const dApres = directionU(geometriePiece(apres), Z, matricePiece(apres))
  assert.ok(Math.abs(dApres.z) < 1e-6, 'plus rien de vertical')
  assert.ok(suit(dApres, new THREE.Vector3(1, 0, 0)) || suit(dApres, new THREE.Vector3(0, 1, 0)), `dans le plan horizontal : ${dApres.toArray().map((v) => v.toFixed(2))}`)
  // la longueur de la plinthe, dans le monde, est cette direction même
  const longueur = new THREE.Vector3(0, 1, 0).transformDirection(matricePiece(apres))
  assert.ok(suit(dApres, longueur), 'le long de la plinthe')
})

test('le prisme (une pièce à contour, un groupe par côté) suit le même fil', () => {
  const contour = [
    { x: 0, y: 0 },
    { x: 2340, y: 0 },
    { x: 2317, y: 23 },
    { x: 23, y: 23 },
  ]
  assert.ok(suit(directionU(geometriePrisme(contour, 16.4), Z), X), 'défaut : le long de x')
  assert.ok(suit(directionU(geometriePrisme(contour, 16.4, 1000, true), Z), new THREE.Vector3(0, 1, 0)), 'fil 90 : le long de y')
  // et une pièce à contour par geometriePiece (l'extrusion) : le même
  const p = { nom: 'front', cotes: { largeur: 2340, profondeur: 23, hauteur: 16.4 }, position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0 }, contour: contour.map((s) => ({ ...s, z: 0 })), fil: { present: true, angle: 90 } }
  assert.ok(suit(directionU(geometriePiece(p), Z), new THREE.Vector3(0, 1, 0)))
})
