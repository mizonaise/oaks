/**
 * LA LIGNE ET LES PASTILLES SUR LA CAPTURE (d10, board v3, ligne du lead 24/09 07:5x : « la ligne de hauteur du meuble tracée sur la
 * capture ; l'étiquette et la ligne dessinées sur l'image — un trait, une pastille »).
 *
 * Rien n'est deviné sur l'image : la caméra est celle que le rig de capture a POSÉE (`src/components/scene/capture/CaptureRig.tsx`, publiée
 * par `window.__oaks.fiche().prise.camera` : position, cible, vecteur haut, fov vertical, décentrement), rejouée ici avec les mêmes appels
 * de three (`lookAt`, `setViewOffset` en pixels du cadre, `near` 0,02, `far` 500) ; les points sont ceux des portes jugées (leur contour sur
 * la façade et son ancre en monde, `portes-facade.mjs`) ; la hauteur est celle du verdict (`verdict-porte.mjs`).
 *
 * Deux parties : `dessinDuCas` (pure : la liste des traits et des pastilles, en pixels de l'image — jouée par `npm test`) et `DESSINER`
 * (évaluée DANS un navigateur, sans serveur : le PNG de la capture, le dessin par-dessus, les JPEG — aucune bibliothèque d'image, la forme
 * de `CAPTURER` dans `board-situations.mjs`). Les PNG et les JPEG propres ne sont jamais touchés (la matière de Flora) : l'image annotée
 * est un fichier à part (`<prise>_ligne.jpg`).
 */
import * as THREE from 'three'
import { bornes } from './verdict-porte.mjs'
import { pointMonde } from './portes-facade.mjs'

/** la caméra d'une prise, rejouée à l'identique du rig ; `null` si la prise n'a pas été posée */
export function cameraDeLaPrise (res, largeur, hauteur) {
  if (!res || res.faisable === false || !Array.isArray(res.position)) return null
  const cam = new THREE.PerspectiveCamera(res.fov_v_deg, largeur / hauteur, 0.02, 500)
  cam.position.set(res.position[0], res.position[1], res.position[2])
  cam.up.set(res.up[0], res.up[1], res.up[2])
  cam.lookAt(res.cible[0], res.cible[1], res.cible[2])
  const [dx, dy] = res.decentrement ?? [0, 0]
  if (dx !== 0 || dy !== 0) cam.setViewOffset(largeur, hauteur, Math.round(-dx * largeur), Math.round(-dy * hauteur), largeur, hauteur)
  else cam.clearViewOffset()
  cam.updateProjectionMatrix()
  cam.updateMatrixWorld()
  return cam
}

/** un point monde (mm) → pixels de l'image `{ x, y, devant }` (y vers le bas) ; `devant` faux derrière la caméra */
export function projeter (cam, pointMm, largeur, hauteur) {
  const v = new THREE.Vector3(pointMm[0] / 1000, pointMm[1] / 1000, pointMm[2] / 1000)
  const vueCam = v.clone().applyMatrix4(cam.matrixWorldInverse)
  v.project(cam)
  return { x: ((v.x + 1) / 2) * largeur, y: ((1 - v.y) / 2) * hauteur, devant: vueCam.z < 0 }
}

/** la façade d'une porte, pour tracer la ligne d'un seul trait par façade (un L en a deux) */
function cleFacade (p) {
  if (p.ancre && p.axeU) {
    const [ax, , az] = p.axeU
    const normale = -az * p.ancre.x + ax * p.ancre.z
    return `f ${ax.toFixed(3)} ${az.toFixed(3)} ${Math.round(normale / 50)}`
  }
  return `d ${p.orientation ?? '?'} ${Math.round((p.plan ?? 0) / 50)}`
}

const GENRE = { poignée: 'poignee', 'poignée intégrée': 'integree', 'poignée (petite porte)': 'petite', 'PTO-choix': 'choix', 'PTO-repli': 'repli', 'à trancher': 'trancher' }

/**
 * LE DESSIN D'UN CAS sur une prise : `juge` = le cas jugé (ses `portes` avec `poly`, `ancre` / `axeU` ou `orientation` / `plan`, `verdict`,
 * `poigneePage`) ; `prise` = `{ camera, largeur, hauteur }`. Rend `{ largeur, hauteur, echelle, lignes, chutes, croix, pastilles, horsCadre }`
 * en pixels de l'image, ou `{ erreur }`.
 *
 *  - **lignes** : par rangée et par façade, la ligne de hauteur du meuble d'un bord à l'autre de ses portes (un trait), et son texte ;
 *  - **pastilles** : par porte, à la ligne de sa poignée (`PULL_X` du bord libre) et à sa hauteur imos — sur la ligne pour une poignée ;
 *    pour une orpheline, là où imos la descendrait (au milieu de la porte sur cette verticale quand elle n'a pas de hauteur possible) ;
 *  - **chutes** : pour une orpheline, le pointillé de la ligne jusqu'à sa pastille (ce qu'il faudrait descendre) ;
 *  - **croix** : la poignée que la page DESSINE aujourd'hui sur une porte orpheline (elle disparaît sous la règle).
 */
export function dessinDuCas (juge, prise) {
  const { largeur, hauteur } = prise ?? {}
  const cam = cameraDeLaPrise(prise?.camera, largeur, hauteur)
  if (!cam) return { erreur: 'aucune caméra posée pour cette prise (capture d’avant la v3 ?)' }
  const echelle = largeur / 2048
  const px = (p, u, v) => {
    const m = pointMonde(p, u, v)
    return m ? projeter(cam, m, largeur, hauteur) : null
  }
  const portes = (juge.portes ?? []).filter((p) => p.poly?.length && (p.ancre || p.orientation))
  const lignes = []
  const rangees = new Map()
  for (const p of portes) {
    const r = p.verdict.ligne?.rangee
    if (r === null || r === undefined || !Number.isFinite(p.verdict.ligne?.h) || p.verdict.petite) continue
    const cle = `${r} | ${cleFacade(p)}`
    if (!rangees.has(cle)) rangees.set(cle, { h: p.verdict.ligne.h, rangee: r, portes: [] })
    rangees.get(cle).portes.push(p)
  }
  for (const { h, rangee, portes: ps } of rangees.values()) {
    const points = []
    for (const p of [...ps].sort((a, b) => bornes(a.poly).uMin - bornes(b.poly).uMin)) {
      const b = bornes(p.poly)
      for (const u of [b.uMin, b.uMax]) {
        const q = px(p, u, h)
        if (q?.devant) points.push([arr1(q.x), arr1(q.y)])
      }
    }
    if (points.length >= 2) lignes.push({ rangee, h, points: points.sort((a, b) => a[0] - b[0]), texte: '' })
  }
  // un seul texte par rangée : au bout droit de sa façade la plus à droite (un L a deux façades, une seule légende)
  for (const r of new Set(lignes.map((l) => l.rangee))) {
    const ls = lignes.filter((l) => l.rangee === r)
    const droite = ls.reduce((a, b) => (b.points[b.points.length - 1][0] > a.points[a.points.length - 1][0] ? b : a))
    // une ligne sous celle d'imos (un meuble bas) : la question ouverte, dite sur l'image
    droite.texte = droite.h < 1049.5 ? `ligne du meuble ${mmTexte(droite.h)} (imos : 1 050) — à trancher` : `ligne des poignées ${mmTexte(droite.h)}`
  }
  const pastilles = []
  const chutes = []
  const croix = []
  let horsCadre = 0
  for (const p of portes) {
    const v = p.verdict
    const m = v.mesures
    const genre = GENRE[v.etiquette] ?? 'poignee'
    // une porte du designer (un rectangle sans côté de charnières connu) : la verticale de la poignée est celle que la page dessine, quand
    // elle en dessine une (le verdict prend le bord libre à droite — sans effet sur un rectangle, mais la pastille irait du mauvais côté)
    const d0 = p.poigneePage
    const u = !p.charnieres && d0 && Number.isFinite(d0.duBordLibre) ? bornes(p.poly).uMax - d0.duBordLibre : m.uLigne
    let hPastille = m.hauteurImos
    if (!Number.isFinite(hPastille)) hPastille = Number.isFinite(m.basALaLigne) && Number.isFinite(m.hautALaLigne) ? (m.basALaLigne + m.hautALaLigne) / 2 : (m.bas + m.haut) / 2
    const q = Number.isFinite(u) ? px(p, u, hPastille) : null
    if (!q?.devant) {
      horsCadre++
      continue
    }
    const dedans = q.x >= 0 && q.x <= largeur && q.y >= 0 && q.y <= hauteur
    if (!dedans) horsCadre++
    pastilles.push({ x: arr1(q.x), y: arr1(q.y), genre, texte: genre === 'repli' || genre === 'choix' ? 'PTO' : genre === 'trancher' ? '?' : '', zone: p.zone })
    if (v.orpheline && !v.petite && Number.isFinite(v.ligne?.h) && hPastille < v.ligne.h - 1) {
      const l = px(p, u, v.ligne.h)
      if (l?.devant) chutes.push({ de: [arr1(l.x), arr1(l.y)], a: [arr1(q.x), arr1(q.y)], genre })
    }
    // la croix sur le bouton que la page dessine : sa position monde lue dans la scène (le bouton est en saillie, ~30 mm devant la face :
    // à 5 px près du point de la façade) ; à défaut, le point de la façade à sa hauteur et à sa distance du bord libre
    const d = p.poigneePage
    if (d && (v.etiquette === 'PTO-repli' || v.etiquette === 'PTO-choix')) {
      const b = bornes(p.poly)
      const c = Array.isArray(d.pos) ? projeter(cam, d.pos, largeur, hauteur) : px(p, m.libre === 'gauche' ? b.uMin + d.duBordLibre : b.uMax - d.duBordLibre, d.v)
      if (c?.devant) croix.push({ x: arr1(c.x), y: arr1(c.y) })
    }
  }
  return { largeur, hauteur, echelle, lignes, chutes, croix, pastilles, horsCadre }
}

const arr1 = (x) => Math.round(x * 10) / 10
const mmTexte = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/**
 * ÉVALUÉ DANS LE NAVIGATEUR (page vide, aucun serveur) : `{ png (data URL), dessin, variantes: [{ nom, largeur?, qualite }] }` → les JPEG
 * annotés (data URLs). Le trait : jaune, liseré sombre, pointillé ; les pastilles : vert (poignée sur la ligne), orange-rouge « PTO »
 * (repli), bleu « PTO » (choix), violet « ? » (à trancher : un meuble bas), sarcelle (intégrée), gris creux (petite porte) ; la chute en pointillé ; la croix sur la poignée que la
 * page dessine sur une porte en PTO.
 */
export const DESSINER = async ({ png, dessin, variantes }) => {
  const img = new Image()
  await new Promise((ok, ko) => {
    img.onload = ok
    img.onerror = ko
    img.src = png
  })
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  // les tailles sont pensées pour une image de 2 048 px lue à ~600 px sur la planche (× 1,7 : une pastille de ~12 px à l'écran)
  const k = (dessin.echelle || 1) * 1.7
  const COULEURS = { poignee: '#2e9d4a', repli: '#e5471c', choix: '#2f6fd6', integree: '#1f8f86', petite: '#8a8a8a', trancher: '#7b61c9' }
  const trait = (points, largeurTrait, couleur, tirets) => {
    ctx.beginPath()
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.lineWidth = largeurTrait
    ctx.strokeStyle = couleur
    ctx.setLineDash(tirets)
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // la ligne des poignées : un liseré sombre sous un pointillé jaune
  for (const l of dessin.lignes) {
    trait(l.points, 7 * k, 'rgba(20,20,18,0.85)', [])
    trait(l.points, 3.5 * k, '#ffd400', [22 * k, 12 * k])
  }
  // les chutes : de la ligne à la pastille de l'orpheline
  for (const ch of dessin.chutes) {
    trait([ch.de, ch.a], 5 * k, 'rgba(20,20,18,0.8)', [])
    trait([ch.de, ch.a], 2.5 * k, COULEURS[ch.genre] ?? COULEURS.repli, [9 * k, 7 * k])
  }
  // les croix : la poignée que la page dessine sur une porte en PTO
  for (const x of dessin.croix) {
    const r = 13 * k
    for (const [w, col] of [[7 * k, 'rgba(255,255,255,0.9)'], [3.5 * k, COULEURS.repli]]) {
      trait([[x.x - r, x.y - r], [x.x + r, x.y + r]], w, col, [])
      trait([[x.x - r, x.y + r], [x.x + r, x.y - r]], w, col, [])
    }
  }
  // les pastilles — un liseré sombre sous le blanc, pour tenir sur n'importe quel fond (les façades rouges du schéma, le mur clair)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const SOMBRE = 'rgba(20,20,18,0.9)'
  for (const p of dessin.pastilles) {
    const col = COULEURS[p.genre] ?? '#555'
    if (p.texte) {
      ctx.font = `700 ${Math.round(21 * k)}px Segoe UI, Helvetica, Arial, sans-serif`
      const w = ctx.measureText(p.texte).width + 20 * k
      const h = 30 * k
      const x0 = p.x - w / 2
      const y0 = p.y - h / 2
      ctx.beginPath()
      ctx.roundRect(x0, y0, w, h, h / 2)
      ctx.lineWidth = 7 * k
      ctx.strokeStyle = SOMBRE
      ctx.stroke()
      ctx.fillStyle = col
      ctx.fill()
      ctx.lineWidth = 3 * k
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(p.texte, p.x, p.y + 1 * k)
    } else {
      const r = (p.genre === 'petite' ? 9 : 11) * k
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      if (p.genre === 'petite') {
        ctx.lineWidth = 6.5 * k
        ctx.strokeStyle = SOMBRE
        ctx.stroke()
        ctx.lineWidth = 3.5 * k
        ctx.strokeStyle = '#dddddd'
        ctx.stroke()
      } else {
        ctx.lineWidth = 7 * k
        ctx.strokeStyle = SOMBRE
        ctx.stroke()
        ctx.fillStyle = col
        ctx.fill()
        ctx.lineWidth = 3 * k
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
      }
    }
  }
  // le texte de chaque ligne, au-dessus de son bout droit
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.font = `700 ${Math.round(24 * k)}px Segoe UI, Helvetica, Arial, sans-serif`
  for (const l of dessin.lignes) {
    if (!l.texte) continue
    const [x, y] = l.points[l.points.length - 1]
    ctx.lineWidth = 6 * k
    ctx.strokeStyle = 'rgba(20,20,18,0.9)'
    ctx.strokeText(l.texte, x, y - 12 * k)
    ctx.fillStyle = '#ffd400'
    ctx.fillText(l.texte, x, y - 12 * k)
  }
  const sorties = {}
  for (const v of variantes) {
    const largeur = Math.min(v.largeur ?? c.width, c.width)
    if (largeur === c.width) {
      sorties[v.nom] = c.toDataURL('image/jpeg', v.qualite)
      continue
    }
    const r = document.createElement('canvas')
    r.width = largeur
    r.height = Math.round((c.height * largeur) / c.width)
    const rc = r.getContext('2d')
    rc.imageSmoothingQuality = 'high'
    rc.drawImage(c, 0, 0, r.width, r.height)
    sorties[v.nom] = r.toDataURL('image/jpeg', v.qualite)
  }
  return sorties
}
