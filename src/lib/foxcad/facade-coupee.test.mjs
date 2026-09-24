// LA FAÇADE COUPÉE (d5, nuit du 23 au 24/09/2026, lignes du lead 23/09 21:3x et 22:4x, mot de Dorian devant le public : « les portes sur le
// front HEX sont simplement coupées en biais et pas avec l'encadrement complet en bois »).
// ① Le badge dit la vérité sur les colonnes coupées en FR_08 : la façade d'Otman DÉCOUPÉE par le contour est un provisoire, le cadre complet
//    vient avec MD2 — pas « dont 2 coupées » seul.
// ② Le rendu de la façade coupée par fox-cad est PRÉPARÉ pour quand le moteur servira ses enfants (d1) : la traverse en pente (six coins sur
//    HEXA, un parallélogramme sur QUAD), les montants en trapèze, le panneau et la surface polygonaux, la même matière que la façade plate —
//    éprouvé sur `facade-coupee.attendu.json`, fabriqué par `docs/releves/2026-09-23_facade-coupee-preparee/outils/fixture-facade-coupee.mjs` :
//    ce qu'imos a SORTI (MD-corrige Sets 2 / 4, AUTRE ; MD2 Sets 1-4, CONFORME au juge de d11, joué le 23/09 au soir), ce que la recette de
//    d11 ATTEND de MD2, et la façade plate servie par 4311 (le témoin de la matière).
// Joué par `npm test`, sans réseau. Le test vit à côté du module (les chemins de d10 depuis le 23/09 17:3x).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as THREE from 'three'
import { aireContour, cotesContour, geometriePrisme, geometrieToile, GROUPE_PRISME, matricePiece } from './geometrie.ts'
import { decorPieceFacade, direMultipart, estFacadeCoupee, facadesMultipart, facesPieceFacade, multipartDePosition, porteDessineeParFoxCad, renduFacadeMultipart, resumeMultipart } from './multipart.ts'
import { lireReponseLot } from './types.ts'
import { direCheminOtman, direDecoupe, direProvisoire, PROVISOIRE_CADRE, resumerOtman } from './chemin-otman.ts'

const ATTENDU = JSON.parse(readFileSync(new URL('./facade-coupee.attendu.json', import.meta.url), 'utf8'))
const lot = (nom) => ATTENDU.imos.find((l) => l.lot === nom)
const MD_CORRIGE = lot('MD-corrige')
const MD2 = lot('MD2')
/** le lot d'un Set HEX en Collection 2 FR_08 : la toile « Exterior 02 » du formulaire d'Otman (la surface n'a pas de matière servie) */
const LOT = { SRF_FR_2_TOP: 'NA_E6127_NATURAL' }
const role = (p) => (p.definition.startsWith('MP_') ? 'parent' : p.cotes.hauteur <= 0 ? 'surface' : p.definition === 'PD_1_FR_MAIN_FR08_VRN' ? 'panneau' : 'cadre')

/**
 * LES TROIS FAMILLES : ce qu'imos sort (MD-corrige — AUTRE de quelques dixièmes — et MD2 — conforme), et ce que la recette de d11 attend
 * de MD2 (lecture A de la traverse en pente). Le rendu doit dessiner les trois sans rien savoir de plus ; rien ici ne dépend de la largeur de
 * la traverse (A / B : Dorian tranche le 24/09).
 */
const FAMILLES = [
  { nom: 'MD-corrige (imos)', sets: MD_CORRIGE.sets, depassement: 0.5 },
  { nom: 'MD2 (imos)', sets: MD2.sets, depassement: 0.001 },
  { nom: 'MD2 attendu (recette de d11)', sets: ATTENDU.recette.sets, depassement: 0.001 },
]
const chaqueSet = (f) => {
  for (const fam of FAMILLES) for (const s of fam.sets) f(s, fam)
}

/** un point du plan local d'une pièce dans le repère de la position (x à droite, y vers l'arrière, z en haut) */
const monde = (p, s, z = 0) => new THREE.Vector3(s.x, s.y, z).applyMatrix4(matricePiece(p))

/** les côtés d'une pièce qui penchent dans le plan de la porte (x, z), avec leur angle depuis l'horizontale */
const cotesEnPente = (p) =>
  cotesContour(p.contour)
    .map((c) => {
      const a = monde(p, c.debut)
      const b = monde(p, c.fin)
      return { cote: c.cote, longueur: c.longueur, angle: (Math.atan2(Math.abs(b.z - a.z), Math.abs(b.x - a.x)) * 180) / Math.PI }
    })
    .filter((c) => c.angle > 1 && c.angle < 89)

test('les pièces attendues passent la porte du contrat (lireReponseLot) et forment UNE façade multipart coupée par Set — imos et recette', () => {
  chaqueSet((s, fam) => {
    const lu = lireReponseLot({ positions: [{ article: s.article, pieces: s.pieces, manques: [] }], calculees: 1, reprises: 0, dureeMs: 0 })
    assert.ok(lu.ok, `${fam.nom} Set ${s.set} : ${lu.ok ? '' : lu.raison}`)
    const facades = facadesMultipart(s.pieces)
    assert.equal(facades.length, 1, `${fam.nom} Set ${s.set}`)
    assert.match(facades[0].kms, /^MP_1_FR_SHELL_5PD10_(HEXA|LAM)$/)
    assert.equal(facades[0].sousPieces.length, 6)
    assert.ok(estFacadeCoupee(facades[0]), 'le parent porte le contour de la colonne sous rampant')
  })
  assert.equal(estFacadeCoupee(facadesMultipart(ATTENDU.plate.pieces)[0]), false, 'la façade plate n a pas de contour')
})

test('la forme : HEXA — traverse à six coins, montants et traverse basse en trapèze, panneau / surface / parent à cinq ; QUAD — tout à quatre', () => {
  const HEXA = { '0.0': 5, '0.0.mp1': 4, '0.0.mp2': 4, '0.0.mp3': 4, '0.0.mp4': 6, '0.0.mp5': 5, '0.0.mp6': 5 }
  const QUAD = { '0.0': 4, '0.0.mp1': 4, '0.0.mp2': 4, '0.0.mp3': 4, '0.0.mp4': 4, '0.0.mp5': 4, '0.0.mp6': 4 }
  chaqueSet((s, fam) => {
    const coins = Object.fromEntries(s.pieces.map((p) => [p.hierarchie, p.contour.length]))
    assert.deepEqual(coins, s.forme === 'HEXA' ? HEXA : QUAD, `${fam.nom} Set ${s.set}`)
    // la recette de d11 dit elle-même combien de sommets chaque enfant doit avoir (`nombreDeSommets`) : le contour la suit
    if (s.sommets) for (const [h, n] of Object.entries(s.sommets)) assert.equal(coins[h], n, `${fam.nom} Set ${s.set} ${h}`)
  })
  assert.equal(MD2.sets.length + MD_CORRIGE.sets.length, 6)
})

test('les côtés d imos : le côté k FINIT au k-ième point — leurs longueurs sont celles d idbprf (CONTLEN), sur les 42 pièces sorties par imos', () => {
  let n = 0
  for (const l of ATTENDU.imos) {
    for (const s of l.sets) {
      for (const p of s.pieces) {
        const longueurs = cotesContour(p.contour).map((c) => c.longueur)
        const imos = s.imos[p.hierarchie].contlen
        assert.equal(longueurs.length, imos.length, `${l.lot} Set ${s.set} ${p.hierarchie}`)
        longueurs.forEach((x, k) => assert.ok(Math.abs(x - imos[k]) < 0.01, `${l.lot} Set ${s.set} ${p.hierarchie} côté ${k + 1} : ${x.toFixed(3)} contre ${imos[k]}`))
        n++
      }
    }
  }
  assert.equal(n, 42)
})

test('la traverse haute longe le rampant : le parent a UN côté en pente (41,81° / 45° / 60°), les deux grands côtés de la traverse lui sont parallèles', () => {
  chaqueSet((s, fam) => {
    const [pente, ...autres] = cotesEnPente(s.pieces[0])
    assert.equal(autres.length, 0, `${fam.nom} Set ${s.set} : un seul côté en pente au parent`)
    assert.ok(Math.abs(pente.angle - s.angle) < 0.01, `${fam.nom} Set ${s.set} : la pente du parent ${pente.angle.toFixed(3)}° contre ${s.angle}°`)
    const traverse = s.pieces.find((p) => p.hierarchie === '0.0.mp4')
    const [a, b] = cotesContour(traverse.contour).sort((x, y) => y.longueur - x.longueur)
    for (const c of [a, b]) {
      const e = cotesEnPente(traverse).find((x) => x.cote === c.cote)
      assert.ok(e && Math.abs(e.angle - pente.angle) < 0.01, `${fam.nom} Set ${s.set} : le côté ${c.cote} de la traverse (${e?.angle.toFixed(3)}°) contre le rampant ${pente.angle.toFixed(3)}°`)
    }
  })
})

test('posé comme la façade plate (90 / −90 / 0) : tout le cadre tient dans le pourtour du parent — exactement pour MD2, à 0,5 mm près pour MD-corrige (AUTRE)', () => {
  chaqueSet((s, fam) => {
    const parent = s.pieces[0]
    const poly = parent.contour.map((c) => monde(parent, c))
    // le parent est dans le plan x-z (y constant) : la distance signée d'un sommet à chaque côté, positive dehors
    const aire = poly.reduce((a, p, i) => a + (p.x * poly[(i + 1) % poly.length].z - poly[(i + 1) % poly.length].x * p.z), 0) / 2
    const signe = Math.sign(aire)
    const depassement = (q) =>
      Math.max(
        ...poly.map((a, i) => {
          const b = poly[(i + 1) % poly.length]
          return (-signe * ((b.x - a.x) * (q.z - a.z) - (b.z - a.z) * (q.x - a.x))) / Math.hypot(b.x - a.x, b.z - a.z)
        }),
      )
    let max = 0
    for (const p of s.pieces.slice(1)) for (const c of p.contour) max = Math.max(max, depassement(monde(p, c)))
    assert.ok(max < fam.depassement, `${fam.nom} Set ${s.set} : un sommet sort du pourtour de ${max.toFixed(3)} mm`)
    // et en profondeur : chaque sous-pièce dans l'épaisseur du parent (y de −2,5 à −25,1) — la toile 4 mm derrière le devant du cadre
    const yParent = [parent.position.y - parent.cotes.hauteur, parent.position.y]
    for (const p of s.pieces.slice(1)) {
      for (const z of [0, p.cotes.hauteur]) {
        const y = monde(p, p.contour[0], z).y
        assert.ok(y >= yParent[0] - 1e-6 && y <= yParent[1] + 1e-6, `${fam.nom} Set ${s.set} ${p.hierarchie} : y ${y} hors de [${yParent}]`)
      }
    }
  })
})

test('la même matière que la façade plate : le décor de chaque rôle suit la même règle (Piece.matiere, la toile du lot) ; fox-cad dessine, le masque cache Otman', () => {
  const plate = ATTENDU.plate.pieces
  const parRolePlate = Object.fromEntries(plate.slice(1).map((p) => [role(p), decorPieceFacade(p, LOT)]))
  chaqueSet((s, fam) => {
    const [f] = facadesMultipart(s.pieces)
    const rendu = renduFacadeMultipart(f, s.pieces, LOT)
    assert.equal(rendu.parFoxCad, true, `${fam.nom} Set ${s.set} : ${rendu.raisons.join(' ; ')}`)
    assert.equal(rendu.cadre, s.pieces[1].matiere.dessus, 'le cadre : la surface dessus servie')
    assert.deepEqual(rendu.toile, { decor: 'NA_E6127_NATURAL', source: 'lot', raison: null }, 'la toile : SRF_FR_2_TOP du Set, comme la façade plate')
    assert.equal(porteDessineeParFoxCad(s.pieces, LOT), true, 'fox-cad a la porte et la dessine : la façade d Otman est masquée, plus découpée')
    for (const p of s.pieces.slice(1)) {
      const d = decorPieceFacade(p, LOT)
      const t = parRolePlate[role(p)]
      assert.equal(d.source, t.source, `${fam.nom} Set ${s.set} ${p.hierarchie} (${role(p)}) : même source de décor que la façade plate`)
      if (role(p) === 'surface') assert.equal(d.decor, t.decor, 'la même toile')
      else assert.equal(d.decor, p.matiere.dessus, `${p.hierarchie} : sa surface dessus`)
    }
  })
})

test('le prisme d une pièce à contour : un groupe par côté, chacun SUR son segment, normales vers l extérieur, volume = aire × épaisseur', () => {
  chaqueSet((s, fam) => {
    for (const p of s.pieces.filter((x) => x.cotes.hauteur > 0)) {
      const g = geometriePrisme(p.contour, p.cotes.hauteur)
      const n = p.contour.length
      const nom = `${fam.nom} Set ${s.set} ${p.hierarchie}`
      assert.equal(g.groups.length, 2 + n, nom)
      const pos = g.getAttribute('position')
      const nor = g.getAttribute('normal')
      for (const c of cotesContour(p.contour)) {
        const gr = g.groups.find((x) => x.materialIndex === GROUPE_PRISME.cote(c.cote))
        assert.equal(gr.count, 6)
        const dir = c.fin.clone().sub(c.debut).normalize()
        const milieu = c.debut.clone().add(c.fin).multiplyScalar(0.5)
        for (let i = gr.start; i < gr.start + gr.count; i++) {
          // sur la droite du segment
          const v = new THREE.Vector2(pos.getX(i), pos.getY(i)).sub(c.debut)
          assert.ok(Math.abs(v.x * dir.y - v.y * dir.x) < 1e-3, `${nom} côté ${c.cote} : sommet hors de son segment`)
          // la normale vers l'extérieur : un pas le long d'elle depuis le milieu du côté sort du contour
          const dehors = milieu.clone().add(new THREE.Vector2(nor.getX(i), nor.getY(i)).multiplyScalar(0.01))
          assert.equal(dansContour(p.contour, dehors), false, `${nom} côté ${c.cote} : normale vers l intérieur`)
        }
      }
      const attendu = Math.abs(aireContour(p.contour)) * p.cotes.hauteur
      assert.ok(Math.abs(volume(g) - attendu) < 1e-5 * attendu, `${nom} : prisme fermé (${volume(g)} contre ${attendu})`)
    }
  })
})

test('les faces : chaque chant sur SON segment, le pourtour sans faces, une sous-pièce sans contour sans ses chants', () => {
  // la traverse HEXA : le chant d'imos sur son côté 3 — le bout de 23 mm contre le montant court — dans MD-corrige ET dans MD2 (ses bords
  // intérieurs 4 et 5 restent nus : le rendu le montre, c'est la donnée) ; la traverse QUAD de MD2 : sur son bord intérieur en pente
  for (const s of [...MD_CORRIGE.sets, ...MD2.sets]) {
    const traverse = s.pieces.find((p) => p.hierarchie === '0.0.mp4')
    const f = facesPieceFacade(traverse, false)
    assert.equal(f.geometrie, 'prisme')
    assert.deepEqual(f.faces, [0, 1])
    const cotes = cotesContour(traverse.contour)
    const chant = f.matieres.indexOf('chant') - 1
    if (s.forme === 'HEXA') {
      assert.deepEqual(f.matieres, ['face', 'face', 'noyau', 'noyau', 'chant', 'noyau', 'noyau', 'noyau'], `Set ${s.set} HEXA`)
      assert.ok(Math.abs(cotes[chant - 1].longueur - 23.1) < 0.2, `Set ${s.set} : le côté chanté fait ${cotes[chant - 1].longueur.toFixed(2)} mm (le bout)`)
    } else {
      assert.deepEqual(f.matieres, ['face', 'face', 'noyau', 'noyau', 'chant', 'noyau'], `Set ${s.set} QUAD`)
      assert.equal(cotesEnPente(traverse).find((x) => x.cote === chant)?.angle.toFixed(2), s.angle.toFixed(2), 'le bord intérieur en pente')
    }
    // le montant du bord court : son bord intérieur long (côté 2), jamais son bout haut
    const montant = s.pieces.find((p) => p.hierarchie === '0.0.mp2')
    assert.deepEqual(facesPieceFacade(montant, false).matieres, ['face', 'face', 'noyau', 'chant', 'noyau', 'noyau'], `Set ${s.set} montant court`)
    // le pourtour : tous ses côtés chantés, ses faces cachées par l'appelant (sansFaces)
    const fp = facesPieceFacade(s.pieces[0], true)
    assert.equal(fp.geometrie, 'prisme')
    assert.deepEqual(fp.matieres, ['face', 'face', ...Array(s.pieces[0].contour.length).fill('chant')], `Set ${s.set} pourtour`)
  }
  // la façade plate : son parent rectangle par les côtés de sa boîte ; ses sous-pièces sans contour ne disent plus un chant au bout d'un montant
  const [pp, ...sp] = ATTENDU.plate.pieces
  assert.deepEqual(facesPieceFacade(pp, true), { geometrie: 'boite', matieres: ['chant', 'chant', 'chant', 'chant', 'face', 'face'], faces: [4, 5], chants: 'par-cote' })
  for (const p of sp) {
    const f = facesPieceFacade(p, false)
    assert.equal(f.chants, 'non-dessines', p.hierarchie)
    assert.deepEqual(f.matieres, ['noyau', 'noyau', 'noyau', 'noyau', 'face', 'face'], `${p.hierarchie} : côtés au noyau`)
  }
})

test('la toile coupée : le polygone de son contour, vers l avant, de la même aire', () => {
  chaqueSet((s, fam) => {
    const surface = s.pieces.find((p) => p.cotes.hauteur <= 0)
    const g = geometrieToile(surface)
    const aire = Math.abs(aireContour(surface.contour))
    // à la précision des sommets (Float32) près : 1e-6 de l'aire
    assert.ok(Math.abs(aireTriangles(g) - aire) < 1e-6 * aire, `${fam.nom} Set ${s.set}`)
    assert.ok(aire < surface.cotes.largeur * surface.cotes.profondeur - 1000, 'le coin coupé par la pente est retiré')
    const nor = g.getAttribute('normal')
    for (let i = 0; i < nor.count; i++) assert.equal(Math.sign(nor.getZ(i)), 1)
  })
  // sans contour : le rectangle, comme avant
  const plate = ATTENDU.plate.pieces.find((p) => p.cotes.hauteur <= 0)
  const aire = plate.cotes.largeur * plate.cotes.profondeur
  assert.ok(Math.abs(aireTriangles(geometrieToile(plate)) - aire) < 1e-6 * aire)
})

test('le compte : « dont 2 coupées par le moteur (cadre complet) » dans le badge des façades multipart', () => {
  const [q4l, h5l] = MD2.sets
  const m = multipartDePosition({ article: h5l.article, pieces: h5l.pieces, manques: [] }, LOT)
  assert.equal(m.coupees, 1)
  assert.equal(m.parFoxCad, 1)
  assert.equal(multipartDePosition({ article: 'WACA_LY_D', pieces: ATTENDU.plate.pieces, manques: [] }, LOT).coupees, undefined, 'la façade plate : rien de coupé, le champ absent')
  // HEX par défaut en FR_08 après MD2 : les deux colonnes coupées (Q4L, H5L) et une colonne pleine
  const positions = [
    { article: q4l.article, pieces: q4l.pieces, manques: [] },
    { article: h5l.article, pieces: h5l.pieces, manques: [] },
    { article: 'WACA_LY_D', pieces: ATTENDU.plate.pieces, manques: [] },
  ]
  const r = resumeMultipart(positions, [LOT, LOT, LOT])
  assert.equal(r.coupees, 2)
  // 24/09 : la traverse en pente MESURÉE sur son contour (MD2 = la lecture A : 23 en hauteur, 17,1 en travers à 41,81°)
  assert.match(direMultipart(r), /^3 façades multipart \(MP_1_FR_SHELL_5PD10_HEXA, MP_1_FR_SHELL_5PD10_LAM, MP_1_FR_SHELL_FR08_LAM, 21 pièces\) dessinées par fox-cad, dont 2 coupées par le moteur \(cadre complet ; traverses en pente 17,1 mm en travers, cadre 23\) : cadre /)
})

/* ─── ① le badge des colonnes coupées d'aujourd'hui (la façade d'Otman découpée) ─────────────────────────────────────────────────── */

const facadeOtman = { genre: 'facade-speciale', cpName: 'CP_SDO_FR08_LAM_HR_PM', kmsName: 'MP_1_FR_SHELL_5PD10_LAM', modele: 'Door_FA_4a' }
const zoneCoupee = (index, module) => ({
  index,
  porteParFoxCad: false,
  panneauxMasques: 11,
  portesMasquees: 0,
  facadesMasquees: 0,
  portesGardees: 1,
  maillagesGardes: 3,
  speciaux: [facadeOtman],
  facades: [],
  decoupe: { etat: 'coupee', module, plein: 'WACA_LY_D', kms: 'MP_1_FR_SHELL_5PD10_LAM', plans: 1, coupes: 1, sommets: 5, chant: 'exact' },
})

test('① le badge : sur les colonnes coupées en FR_08, la façade d Otman DÉCOUPÉE par le contour est dite provisoire — le cadre complet vient avec MD2', () => {
  const r = resumerOtman([zoneCoupee('1', 'WACA_LY_D_Q4L'), zoneCoupee('2', 'WACA_LY_D_H5L')])
  assert.equal(r.facadesCoupees, 2)
  assert.deepEqual(r.kmsCoupees, ['MP_1_FR_SHELL_5PD10_LAM'])
  const phrase = direCheminOtman(r)
  assert.equal(phrase, `chemin d'Otman : 2 façades d'Otman (Door_FA_4a) découpées par le contour — ${PROVISOIRE_CADRE} · 22 panneaux masqués`)
  assert.doesNotMatch(phrase, /dont 2 coupées par le contour de fox-cad/, 'avant la nuit du 23/09 : « dont 2 coupées … (rendu, pas calculé) », seul')
  // une façade d'Otman entière à côté (une colonne pleine gardée) : le compte dit lesquelles sont découpées
  const entiere = { ...zoneCoupee('3', 'WACA_LY_D'), decoupe: null }
  assert.equal(
    direCheminOtman(resumerOtman([zoneCoupee('1', 'WACA_LY_D_Q4L'), entiere])),
    `chemin d'Otman : 2 façades (Door_FA_4a), dont 1 façade d'Otman découpée par le contour — ${PROVISOIRE_CADRE} · 22 panneaux masqués`,
  )
  // la ligne de la zone, dans le détail du lot
  assert.equal(
    direDecoupe(zoneCoupee('2', 'WACA_LY_D_H5L').decoupe),
    `façade d'Otman DÉCOUPÉE par le contour de la porte pleine de fox-cad (5 sommets, 1 plan, chant exact) — ${PROVISOIRE_CADRE} (le KMS MP_1_FR_SHELL_5PD10_LAM reste un manque) ; modèle d'Otman du module plein WACA_LY_D pour WACA_LY_D_H5L`,
  )
})

test('① MD2 n est promis que pour une façade à cadre MP_1_FR_SHELL_… ; un autre KMS refusé est nommé', () => {
  assert.equal(direProvisoire(['MP_1_FR_SHELL_5PD10_LAM', 'MP_1_FR_SHELL_FR08_LAM']), PROVISOIRE_CADRE)
  assert.equal(direProvisoire([null]), PROVISOIRE_CADRE, 'l ancien texte du moteur, sans KMS lu : la découpe ne vise que les façades à cadre')
  assert.equal(direProvisoire(['MP_1_FR_SHELL_5PD10_LAM', 'MP_2_XYZ']), 'provisoire : fox-cad ne calcule pas encore MP_1_FR_SHELL_5PD10_LAM, MP_2_XYZ')
})

/* ─── outils ─────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

function dansContour(contour, q) {
  let dedans = false
  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    const a = contour[i]
    const b = contour[j]
    if (a.y > q.y !== b.y > q.y && q.x < ((b.x - a.x) * (q.y - a.y)) / (b.y - a.y) + a.x) dedans = !dedans
  }
  return dedans
}

function volume(g) {
  const pos = g.getAttribute('position')
  let v = 0
  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i)
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1)
    const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2)
    v += a.dot(b.clone().cross(c)) / 6
  }
  return v
}

function aireTriangles(g) {
  const pos = g.getAttribute('position')
  const index = g.getIndex()
  const sommet = (k) => new THREE.Vector3().fromBufferAttribute(pos, index ? index.getX(k) : k)
  const n = index ? index.count : pos.count
  let a = 0
  for (let k = 0; k < n; k += 3) a += new THREE.Triangle(sommet(k), sommet(k + 1), sommet(k + 2)).getArea()
  return a
}
