// LA FORME B DES ENFANTS COUPÉS (d5, 24/09/2026 — ligne du lead 07:3x, décision de Dorian : « la traverse doit avoir la même largeur même
// avec l'angle » → B, 23 perpendiculaires, MD2B est le produit ; MD2 (A) devient un témoin). Le lot MD2B d'Astra n'a rien sorti ce matin (refus
// SQL 2628 : deux descriptions OPTINFO trop longues, à relancer par d11) : l'écran est préparé sur la forme EXACTE que d11 a publiée
// (`MD2B-enfants-attendus.json`, famille `recetteB` de `facade-coupee.attendu.json`, fabriquée par
// `docs/releves/2026-09-24_facade-coupee-forme-b/outils/fixture-facade-coupee.mjs`). La méthode (la liste de d11 tournée d'un cran, les
// chants par la lettre k de la sous-définition) est d'abord PROUVÉE sur MD2 : la recette A ainsi mise en forme EST la sortie d'imos.
// Quand le lot MD2B sera joué, ses Sets entreront dans la famille `imos` et ce test les jugera de même.
// Joué par `npm test`, sans réseau.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cotesContour } from './geometrie.ts'
import { depassementPolygone, facadesMultipart, facesPieceFacade, polygoneDansLePlanDe, renduFacadeMultipart, sousPiecesHorsPourtour, traverseEnPente } from './multipart.ts'

const ATTENDU = JSON.parse(readFileSync(new URL('./facade-coupee.attendu.json', import.meta.url), 'utf8'))
const MD2 = ATTENDU.imos.find((l) => l.lot === 'MD2')
const A = ATTENDU.recette.sets
const B = ATTENDU.recetteB.sets
const LOT = { SRF_FR_2_TOP: 'NA_E6127_NATURAL' }
const piece = (s, h) => s.pieces.find((p) => p.hierarchie === h)

/** la distance d'un point du plan du parent au bord le plus proche de son pourtour (dedans ou dehors) */
const auBord = (pourtour, q) =>
  Math.min(
    ...pourtour.map((a, i) => {
      const b = pourtour[(i + 1) % pourtour.length]
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy)))
      return Math.hypot(q[0] - (a[0] + t * dx), q[1] - (a[1] + t * dy))
    }),
  )

/** le milieu du côté k d'une sous-pièce, dans le plan du parent : [x, y] et sa distance au bord du pourtour (0 = sur le pourtour) */
const milieuCote = (s, p, k) => {
  const poly = polygoneDansLePlanDe(p, s.pieces[0])
  const n = poly.length
  // le côté k FINIT au k-ième sommet (le contrat) : du sommet k − 1 au sommet k
  const a = poly[(k - 2 + n) % n]
  const b = poly[k - 1]
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const pourtour = s.pieces[0].contour.map((c) => [c.x, c.y])
  return { m, bord: auBord(pourtour, m), dehors: depassementPolygone(pourtour, m) }
}

test('la méthode, prouvée sur MD2 : la recette A de d11, tournée d un cran et chantée par ses sous-définitions, EST la sortie d imos — mêmes sommets dans le même ordre, mêmes côtés chantés', () => {
  let n = 0
  for (const sa of A) {
    const si = MD2.sets.find((x) => x.set === sa.set)
    for (const pa of sa.pieces) {
      const pi = piece(si, pa.hierarchie)
      assert.equal(pa.contour.length, pi.contour.length, `Set ${sa.set} ${pa.hierarchie}`)
      pa.contour.forEach((c, i) => assert.ok(Math.abs(c.x - pi.contour[i].x) < 0.06 && Math.abs(c.y - pi.contour[i].y) < 0.06, `Set ${sa.set} ${pa.hierarchie} sommet ${i + 1} : (${c.x} ; ${c.y}) contre imos (${pi.contour[i].x} ; ${pi.contour[i].y})`))
      const poses = (p) => p.chants.filter((c) => c.pose).map((c) => `${c.cote}:${c.profil}`)
      assert.deepEqual(poses(pa), poses(pi), `Set ${sa.set} ${pa.hierarchie} : les côtés chantés`)
      n++
    }
  }
  assert.equal(n, 28, 'quatre Sets, le parent et ses six enfants')
})

test('la forme B : HEXA — parent, panneau et toile à cinq, traverse à six (d11 : nombreDeSommets) ; QUAD — tout à quatre ; les Sets de MD2B (41,81 / 60° QUAD, 41,81 / 45° HEXA)', () => {
  assert.deepEqual(
    B.map((s) => `${s.set} ${s.article} ${s.forme} ${s.lecture} ${s.angle}`),
    ['1 ZZ_MDB_Q4L QUAD B 41.81', '2 ZZ_MDB_H5L HEXA B 41.811', '3 ZZ_MDB_Q4L QUAD B 60', '4 ZZ_MDB_H5L HEXA B 45'],
  )
  const HEXA = { '0.0': 5, '0.0.mp1': 4, '0.0.mp2': 4, '0.0.mp3': 4, '0.0.mp4': 6, '0.0.mp5': 5, '0.0.mp6': 5 }
  const QUAD = { '0.0': 4, '0.0.mp1': 4, '0.0.mp2': 4, '0.0.mp3': 4, '0.0.mp4': 4, '0.0.mp5': 4, '0.0.mp6': 4 }
  for (const s of B) {
    const coins = Object.fromEntries(s.pieces.map((p) => [p.hierarchie, p.contour.length]))
    assert.deepEqual(coins, s.forme === 'HEXA' ? HEXA : QUAD, `Set ${s.set}`)
    for (const [h, n] of Object.entries(s.sommets)) assert.equal(coins[h], n, `Set ${s.set} ${h} (nombreDeSommets de d11)`)
    assert.match(s.pieces[0].definition, /^MP_1_FR_SHELL_5PD10_(QUAD|HEXA)B$/)
  }
})

test('LA DÉCISION DE DORIAN, mesurée : en B la traverse en pente fait 23 mm EN TRAVERS à chaque angle — la largeur du cadre ; en A, 23 × cos α (17,1 / 11,5 / 17,1 / 16,3)', () => {
  for (const s of B) {
    const [f] = facadesMultipart(s.pieces)
    const t = traverseEnPente(f, s.pieces)
    assert.ok(t, `Set ${s.set}`)
    assert.equal(t.hierarchie, '0.0.mp4')
    assert.ok(Math.abs(t.largeurMm - 23) <= 0.05, `B Set ${s.set} (${s.angle}°) : ${t.largeurMm} mm en travers`)
    assert.equal(t.cadreMm, 23)
  }
  for (const s of A) {
    const [f] = facadesMultipart(s.pieces)
    const t = traverseEnPente(f, s.pieces)
    assert.ok(Math.abs(t.largeurMm - 23 * Math.cos((s.angle * Math.PI) / 180)) <= 0.1, `A Set ${s.set} : ${t.largeurMm}`)
  }
})

test('la forme B tient dans le pourtour (la garde la laisse passer) et fox-cad la dessine, avec la même matière que la façade plate', () => {
  for (const s of B) {
    const [f] = facadesMultipart(s.pieces)
    assert.deepEqual(sousPiecesHorsPourtour(f, s.pieces), [], `Set ${s.set}`)
    const rendu = renduFacadeMultipart(f, s.pieces, LOT)
    assert.equal(rendu.parFoxCad, true, `Set ${s.set} : ${rendu.raisons.join(' ; ')}`)
    assert.equal(rendu.cadre, 'EG_HPL_HGP_W980_ST7_0_8', 'le décor du cadre : la face servie (d11 : celle de la façade plate FR_08_LAM)')
    assert.deepEqual(rendu.toile, { decor: 'NA_E6127_NATURAL', source: 'lot', raison: null }, 'la toile : celle du Set, comme la façade plate')
  }
})

test('les chants de B tombent sur les bords VUS : la traverse HEXA (PD_1_FR_11EE) sur ses deux bords intérieurs, à 23 mm du pourtour — la correction du défaut vu le 23/09 (en A, le chant sur le bout de 23)', () => {
  for (const s of B) {
    const traverse = piece(s, '0.0.mp4')
    const f = facesPieceFacade(traverse, false)
    assert.equal(f.geometrie, 'prisme')
    const chantes = traverse.chants.filter((c) => c.pose).map((c) => c.cote)
    if (s.forme === 'HEXA') {
      assert.equal(traverse.definition, 'PD_1_FR_11EE')
      assert.deepEqual(chantes, [1, 2])
      assert.deepEqual(f.matieres, ['face', 'face', 'chant', 'chant', 'noyau', 'noyau', 'noyau', 'noyau'], `Set ${s.set}`)
      const cotes = cotesContour(traverse.contour)
      // le côté 1 longe le rampant, le côté 2 est le plat sous le coude ; tous deux à 23 mm DANS le pourtour ; les côtés 4 et 5 SUR le pourtour
      for (const k of [1, 2]) {
        const c = milieuCote(s, traverse, k)
        assert.equal(c.dehors, 0)
        assert.ok(Math.abs(c.bord - 23) < 0.05, `Set ${s.set} côté ${k} (${cotes[k - 1].longueur.toFixed(1)} mm) : à ${c.bord.toFixed(3)} mm du pourtour`)
      }
      for (const k of [4, 5]) assert.ok(milieuCote(s, traverse, k).bord < 0.05, `Set ${s.set} côté ${k} : sur le pourtour`)
    } else {
      assert.deepEqual(chantes, [3])
      const c = milieuCote(s, traverse, 3)
      assert.ok(Math.abs(c.bord - 23) < 0.05, `Set ${s.set} QUAD : le bord intérieur en pente à ${c.bord.toFixed(3)} mm du pourtour`)
    }
    // les montants et la traverse basse : leur chant sur le long bord intérieur, à 23 mm du pourtour
    for (const h of ['0.0.mp1', '0.0.mp2', '0.0.mp3']) {
      const p = piece(s, h)
      const [k] = p.chants.filter((c) => c.pose).map((c) => c.cote)
      const c = milieuCote(s, p, k)
      assert.ok(Math.abs(c.bord - 23) < 0.05, `Set ${s.set} ${h} côté ${k} : à ${c.bord.toFixed(3)} mm du pourtour`)
    }
  }
  // en A (MD2, la recette comme imos) : le chant de la traverse HEXA sur son côté 3 — le bout de 23 contre le montant court (le défaut)
  for (const s of A.filter((x) => x.forme === 'HEXA')) {
    const traverse = piece(s, '0.0.mp4')
    const [k] = traverse.chants.filter((c) => c.pose).map((c) => c.cote)
    assert.equal(k, 3)
    assert.ok(Math.abs(cotesContour(traverse.contour)[k - 1].longueur - 23.1) < 0.2, `A Set ${s.set} : le côté chanté est le bout`)
  }
})
