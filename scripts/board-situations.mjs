#!/usr/bin/env node
/**
 * LE BOARD DE SITUATIONS (mot de Dorian 23/09 20:0x : « la règle PTO doit se tester avec un BOARD de plein de situations, des projections
 * réalistes — par exemple pour faire les préconfigurations du site » ; ligne du lead à d10 23/09 20:0x) — v2 (ligne du lead 22:4x) : chaque
 * situation devient aussi une PRÉCONFIGURATION du site (les champs d'oaksome-stack, `produits/hex/releves/2026-09-24_preconfigurations-du-
 * site.md` § 4), avec ses prix HT / TTC et l'écart à la carte actuelle du site de sa forme, et ses captures 16:9. Pour chaque situation
 * d'une liste JSON (`scripts/situations/pto-2026-09-24.json`) :
 *
 *  1. la page du configurateur ouverte avec ses valeurs SEMÉES par l'adresse (`?banc=1&CHAMP=valeur` : le formulaire résout le reste),
 *     la prise S16 (station site 16:9, `--taille16` px de large), mode client — la capture du CANVAS (`window.__oaks.capture()`), PNG et
 *     JPEG q92 (+ une vignette) ; tout ce que la page dit se lit sur CE chargement (la scène ne dépend pas de la caméra) :
 *     le badge de fox-cad (positions, pièces, manques — HEX, HEX 2) ou rien (F, L : formes de production, le designer d'Otman dessine
 *     tout), le PRIX affiché, la configuration résolue (`__oaks.fiche()`), les réponses de `/api/foxcad/calcul/lot` telles que la page les
 *     a reçues (le lot et, pour une façade que fox-cad refuse, la PORTE PLEINE redemandée), les matrices des groupes de positions, les
 *     capteurs de porte du designer, l'origine des textures, les requêtes en échec ;
 *  2. LE PRESET (`scripts/board/preset.mjs`) : le `form` = les champs de l'utilisateur (hors `HIDEN_FIELDS`) tels que la page les a
 *     résolus, et le sha de l'arbre servi ; puis ce `form` REJOUÉ tel quel — l'adresse sème le `form` entier, le chemin exact d'un
 *     `?id=<template>` (`initialValues`) — pour les deux autres prises : S16 schéma et S11 client (la carte produit 1:1) ; chaque rejeu
 *     compare toutes les valeurs, le prix et le badge à ceux du chargement 1 (un preset qui bouge à l'ouverture est faux) ;
 *  3. PAR PORTE, le verdict (`scripts/board/verdict-porte.mjs`) — v3 (ligne du lead 24/09 07:5x, mot de Dorian 07:4x : « les boutons ne
 *     peuvent pas descendre sous la ligne horizontale des autres ») : LA RÈGLE D'ALIGNEMENT, une seule. La hauteur imos de la poignée
 *     (1 050 du sol fini, bornée à 500 sous le haut de la porte à la ligne de la poignée, d3 / d11) ; la ligne de hauteur du meuble = la
 *     hauteur imos de ses portes non coupées, rangée par rangée ; la porte dont la poignée n'est pas SUR la ligne est orpheline →
 *     « PTO-repli » ; « PTO-choix » quand le client a pris « Push and Open » (prévu par le PDF de la gamme ? offert par le formulaire ?).
 *     Chaque porte est aussi rapprochée de son étiquette de la v2 publiée (`--v2`, le seuil B 900 d'hier) ;
 *  4. LA LIGNE ET LES PASTILLES SUR L'IMAGE (`scripts/board/annotation.mjs`) : la caméra que la page a posée (`fiche().prise.camera`) est
 *     rejouée, la ligne du meuble et une pastille par porte sont dessinées sur les S16 client et schéma, dans un navigateur sans serveur —
 *     des fichiers À PART (`S16_client_ligne.jpg`…) : les PNG et JPEG propres restent la matière de Flora ;
 *  5. LA PLANCHE : une page HTML statique pour le mur de revue (CSP stricte : aucun script, `<style>` seul, images locales) — en tête les
 *     cas de référence (`--references`, HEX 5, 6, 16 : avant = la page telle qu'elle dessine, après = la règle tracée), la règle, ce qui
 *     change contre la v2, le catalogue des préconfigurations, puis un cas par vignette — dans `--site` (le lead publie), avec `board.json`
 *     et `presets.json` (les préconfigurations seules, au format d'oaksome-stack).
 *
 *   node scripts/board-situations.mjs [--situations=scripts/situations/pto-2026-09-24.json] [--base=http://localhost:3026]
 *        [--out=C:/Users/dorian/scripts/_out/board-pto-v3] [--site=<oaksome-website>/docs/mur-revue/_site/board-pto]
 *        [--cartes=scripts/situations/cartes-du-site-2026-09-23.json] [--presets-stack=<oaksome-stack>/preuves/…/presets-candidats.json]
 *        [--v2=<board.json de la v2 publiée>] [--references=HEX-05,HEX-06,HEX-16] [--petite=800] [--taille16=2048] [--taille11=1600]
 *        [--cas=HEX-01,F-07] [--build=<commit servi>] [--planche-seule] [--sans-annotation] [--resolveur=public|aucun|hôte[=ip]]
 *        [--delai=120000] [--profil-chrome=d10]
 *
 * `--planche-seule` : refait la planche depuis les `cas.json` déjà écrits (une autre borne de petite porte, un autre relevé des cartes : le
 * verdict, le preset et les images annotées sont recalculés — un navigateur sans serveur suffit —, les captures ne bougent pas). Rien n'est
 * inventé : ce qui manque (une porte sans contour, une position sans groupe dans la scène, une prise sans caméra, un champ de carte qui est à
 * Dorian) est dit dans le cas, pas deviné.
 */
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'
import { argumentsChrome, lireOptionResolveur, resoudrePublic, resumeResolution } from './resolveur-public.mjs'
import { comparerAttendu, compteEtiquettes, jugerPortes, ptoOffertParLeFormulaire, ptoPrevuParLePdf, ECART_RANGEE, PETITE_DEFAUT, REGLE_IMOS, TOLERANCE_LIGNE, numeroCollection } from './board/verdict-porte.mjs'
import { contourPorteDesigner, contourPorteFoxCad, portesDePieces, projeterSurFacade } from './board/portes-facade.mjs'
import { champsDuFormulaire, ecartsDeValeurs, formDuPreset, presetDuCas, sha12 } from './board/preset.mjs'
import { DESSINER, dessinDuCas } from './board/annotation.mjs'
import { planche } from './board/planche.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  })
)
const SITUATIONS = resolve(String(args.situations ?? join(ICI, 'situations/pto-2026-09-24.json')))
const BASE = String(args.base ?? 'http://localhost:3026').replace(/\/$/, '')
const OUT = resolve(String(args.out ?? 'C:/Users/dorian/scripts/_out/board-pto-v3'))
const SITE = resolve(String(args.site ?? 'C:/Users/dorian/repogithub/oaksome-website/docs/mur-revue/_site/board-pto'))
if (args.seuil !== undefined) {
  console.error('--seuil n’existe plus (v3, ligne du lead 24/09 07:5x) : la règle du repli est l’alignement, sans seuil')
  process.exit(2)
}
const PETITE = Number(args.petite ?? PETITE_DEFAUT)
const REFERENCES = String(args.references ?? 'HEX-05,HEX-06,HEX-16').split(',').map((s) => s.trim()).filter(Boolean)
const ANNOTER = args['sans-annotation'] !== true
/** le profil Chrome fixe (`navigateur.mjs`) : un Chrome à la fois — les captures, puis l'annotation */
const PROFIL_CHROME = profilDesArguments(args)
/** la v2 publiée (le seuil B 900 d'hier) : chaque porte y est rapprochée de son étiquette d'hier, jamais recalculée */
const V2_FICHIER = resolve(String(args.v2 ?? 'C:/Users/dorian/scripts/_out/d10-board-v3/board-v2-publie.json'))
const V2 = existsSync(V2_FICHIER) ? JSON.parse(await readFile(V2_FICHIER, 'utf8')) : null
const TAILLE_16 = Number(args.taille16 ?? 2048)
const TAILLE_11 = Number(args.taille11 ?? 1600)
/** la fenêtre de chaque prise : S16 garde la largeur et prend 9 / 16 de hauteur (la forme de `capture-pipeline.mjs`), S11 est carrée */
const FENETRE = { S16: { width: TAILLE_16, height: Math.round((TAILLE_16 * 9) / 16) }, S11: { width: TAILLE_11, height: TAILLE_11 } }
const DELAI_MS = Number(args.delai ?? 120_000)
const CAS = args.cas ? String(args.cas).split(',').map((s) => s.trim()) : null
const BUILD = args.build ? String(args.build) : null
const PLANCHE_SEULE = args['planche-seule'] === true
const GAMME = JSON.parse(await readFile(join(ICI, 'situations/gamme-facades-pdf.json'), 'utf8'))
const CORRESPONDANCE = JSON.parse(await readFile(join(ICI, 'situations/correspondance-fr-fa.json'), 'utf8'))
const CARTES_FICHIER = resolve(String(args.cartes ?? join(ICI, 'situations/cartes-du-site-2026-09-23.json')))
const CARTES = JSON.parse(await readFile(CARTES_FICHIER, 'utf8'))
/**
 * la preuve à blanc d'oaksome-stack (`scripts/hex/presets-depuis-board.mjs` sur ces mêmes situations : son `form`, son prix HT, le mur de
 * HEX / HEX 2 sur l'arbre de SON dépôt) — facultative : lue pour la recouper, jamais pour remplacer ce que la page dit
 */
const PRESETS_STACK_FICHIER = resolve(String(args['presets-stack'] ?? 'C:/Users/dorian/repogithub/oaksome-stack/preuves/2026-09-23/presets/presets-candidats.json'))
const PRESETS_STACK = existsSync(PRESETS_STACK_FICHIER) ? JSON.parse(await readFile(PRESETS_STACK_FICHIER, 'utf8')) : null

const heureLocale = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
const nombre = (v) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : null
}

// --- ce que la page expose (évalué DANS la page) ---------------------------------------------------------------------------------------

/**
 * la scène : la matrice monde du groupe INTÉRIEUR de chaque position fox-cad (le repère du Set, en mètres), les capteurs de porte du
 * designer (`DoorAnimator` : un groupe dont le premier enfant est un maillage invisible à `BoxGeometry` — le plus externe seulement), en
 * bornes monde mm, et l'origine des textures des maillages visibles
 */
const LIRE_SCENE = () => {
  const scenes = (window.__threeObserves ?? []).filter((o) => o && o.isScene)
  if (!scenes.length) return { erreur: 'aucune scène annoncée' }
  const s = scenes[scenes.length - 1]
  s.updateMatrixWorld(true)
  const visible = (o) => {
    for (let p = o; p; p = p.parent) if (!p.visible) return false
    return true
  }
  const groupes = {}
  s.traverse((o) => {
    const m = /^fox-cad (\d+) (.+)$/.exec(o.name ?? '')
    if (m && o.children[0]) groupes[m[1]] = { article: m[2], visible: visible(o), elements: Array.from(o.children[0].matrixWorld.elements) }
  })
  const capteurs = []
  const racines = new Set()
  s.traverse((o) => {
    if (o.isMesh || !o.children.length) return
    const premier = o.children[0]
    if (!(premier && premier.isMesh && premier.visible === false && premier.geometry?.type === 'BoxGeometry')) return
    for (let p = o.parent; p; p = p.parent) if (racines.has(p)) return
    racines.add(o)
    premier.geometry.computeBoundingBox()
    const bb = premier.geometry.boundingBox.clone().applyMatrix4(premier.matrixWorld)
    capteurs.push({ visible: visible(o), min: bb.min.toArray().map((v) => Math.round(v * 10000) / 10), max: bb.max.toArray().map((v) => Math.round(v * 10000) / 10) })
  })
  // les poignées DESSINÉES par la page : celles de fox-cad (`poignee glb` / `poignee pastille`, la pose dans leur userData) et celles du
  // designer (un GLB : un maillage sous un nœud « Scene », hors fox-cad — la forme de sonder-poignees-v2 de d5), position monde en mm
  const poignees = []
  const groupesVus = new Set()
  const mondeMm = (o) => {
    const v = o.position.clone()
    o.getWorldPosition(v)
    return [Math.round(v.x * 10000) / 10, Math.round(v.y * 10000) / 10, Math.round(v.z * 10000) / 10]
  }
  // les portes que fox-cad laisse SANS poignée (d5, 8be6647 : un groupe vide `poignee pto-choix | pto-repli | pto-technique | sans |
  // integree`, la nature dans son userData) — comptées par nature, pas appariées (un groupe vide n'a pas de position à lui)
  const natures = {}
  s.traverse((o) => {
    if (o.name === 'poignee glb' || o.name === 'poignee pastille') {
      const u = o.userData ?? {}
      poignees.push({ qui: 'fox-cad', type: o.name.replace('poignee ', ''), visible: visible(o), pos: mondeMm(o), source: u.hauteurSource ?? null, descendue: u.descendue ?? null, raison: u.raison ?? null })
      return
    }
    if (/^poignee /.test(o.name ?? '') && o.userData?.foxcad) {
      const mode = o.name.replace('poignee ', '')
      natures[mode] = (natures[mode] ?? 0) + 1
      return
    }
    if (o.isMesh && o.parent && o.parent.name === 'Scene' && o.parent.parent && !o.userData?.foxcad) {
      const g = o.parent.parent
      if (groupesVus.has(g)) return
      groupesVus.add(g)
      poignees.push({ qui: 'designer', type: o.name || 'glb', visible: visible(g), pos: mondeMm(g) })
    }
  })
  const origines = {}
  let maillages = 0
  s.traverse((m) => {
    if (!m.isMesh || !visible(m)) return
    maillages++
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      if (!mat || mat.visible === false) continue
      const img = mat.map ? (mat.map.image ?? mat.map.source?.data) : null
      const src = img ? String(img.currentSrc || img.src || '') : ''
      const o = !mat.map ? 'sans texture' : /fallback-texture/.test(src) ? 'image de repli' : /media\.tecnibo\.com/.test(src) ? 'CDN' : /\/api\/media\//.test(src) ? 'relais de l’hôte' : src ? 'autre' : 'texture sans adresse (GLB, canvas)'
      origines[o] = (origines[o] ?? 0) + 1
    }
  })
  return { groupes, capteurs, poignees, natures, textures: { maillages, origines } }
}

/**
 * la capture du canvas, PNG, et ses JPEG (`variantes` : `{ nom, largeur?, qualite }` — pleine taille sans largeur), encodés par le
 * navigateur (aucune bibliothèque d'image ; q92 = `toDataURL('image/jpeg', 0.92)`, la qualité des JPEG du lead relue le 23/09 à 19:0x)
 */
const CAPTURER = async (variantes) => {
  const png = window.__oaks.capture()
  if (!png) return null
  const img = new Image()
  await new Promise((ok, ko) => {
    img.onload = ok
    img.onerror = ko
    img.src = png
  })
  const jpeg = (largeur, qualite) => {
    const c = document.createElement('canvas')
    c.width = largeur
    c.height = Math.round((img.height * largeur) / img.width)
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', qualite)
  }
  const sorties = {}
  for (const v of variantes) sorties[v.nom] = jpeg(Math.min(v.largeur ?? img.width, img.width), v.qualite)
  return { png, jpeg: sorties, largeur: img.width, hauteur: img.height }
}

/**
 * ce que la page dit d'elle-même : la configuration résolue (`__oaks.fiche()`), le badge de fox-cad (ses attributs et son texte ; `null` sur
 * une forme dont les pièces ne viennent pas de fox-cad), le prix affiché (la barre de prix), et — v3 — la caméra que le rig de capture a
 * POSÉE pour cette prise (`fiche().prise.camera` : position, cible, haut, fov, décentrement) : de quoi tracer la ligne sur l'image
 */
const LIRE_PAGE = () => {
  const f = window.__oaks.fiche()
  const e = document.querySelector('[data-foxcad-etat]')
  const p = f?.prise ?? null
  return {
    config: f?.config ?? null,
    valeurs: f?.valeurs ?? {},
    libelles: f?.libelles ?? {},
    badge: e ? { attributs: { ...e.dataset }, texte: (e.textContent ?? '').replace(/\s+/g, ' ').trim() } : null,
    prix: (document.querySelector('.k-prix-val .k-cap')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    // décision A (24/09) : le bandeau dit le TTC au taux de l'adresse ; le HT et la taxe sont dans ses `data-*` (absents : un build d'avant,
    // dont le texte ÉTAIT le HT)
    prixHt: (() => {
      const v = document.querySelector('.k-prix')?.dataset.prixHt
      return v === undefined || v === '' ? null : Number(v)
    })(),
    taxe: (() => {
      const d = document.querySelector('.k-prix')?.dataset
      return d?.tva ? { pays: d.pays ?? null, tva: Number(d.tva), origine: d.taxe ?? null, ttc: d.prixTtc ? Number(d.prixTtc) : null } : null
    })(),
    camera: p ? { prise: p.id ?? null, etat: p.etat ?? null, ...(p.camera ?? {}) } : null
  }
}

// --- le formulaire : les sources du produit (poignées, fronts) -------------------------------------------------------------------------

const produits = new Map()
/**
 * les sources d'un produit : la ligne de chaque poignée (dimensions, filtre, `hinge_option`) et de chaque front (`info_01`, cadre) — lues
 * sur le configurateur (`/api/shape/product/<forme>`) et gardées à côté des captures (`produit-<forme>.json`) : `--planche-seule` les relit
 * de là, le serveur peut être arrêté
 */
async function sourcesDuProduit (forme) {
  if (produits.has(forme)) return produits.get(forme)
  const cache = join(OUT, `produit-${forme}.json`)
  if (PLANCHE_SEULE && existsSync(cache)) {
    const lu = JSON.parse(await readFile(cache, 'utf8'))
    produits.set(forme, lu)
    return lu
  }
  const r = await fetch(`${BASE}/api/shape/product/${encodeURIComponent(forme)}`)
  if (!r.ok) throw new Error(`/api/shape/product/${forme} : HTTP ${r.status}`)
  const j = await r.json()
  const champs = []
  const parcourir = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) return n.forEach(parcourir)
    if (n.type === 'FIELD') champs.push(n)
    for (const v of Object.values(n)) if (typeof v === 'object') parcourir(v)
  }
  parcourir(j.form?.configurator)
  const sourceDe = (nom) => {
    const c = champs.find((f) => f.name === nom)
    const s = c ? j.form?.sources?.[c.attributes?.source] : null
    return s ? Object.values(s) : []
  }
  // le preset : les champs du formulaire (cachés ou non) et le sha de l'arbre servi — celui d'oaksome-stack (`presets-depuis-board.mjs`)
  const out = {
    lu: `${BASE}/api/shape/product/${forme}, ${heureLocale()}`,
    arbre: sha12(j.form),
    champs: champsDuFormulaire(j.form),
    poignees: sourceDe('OV_PULL'),
    fronts: sourceDe('OV_FRONT_TYPE'),
    collections: sourceDe('OV_COLLECTION')
  }
  await mkdir(OUT, { recursive: true })
  await writeFile(cache, JSON.stringify(out, null, 1))
  produits.set(forme, out)
  return out
}

// --- un cas ---------------------------------------------------------------------------------------------------------------------------

/** l'adresse d'une prise : la forme, la prise du plan, le mode (client / schéma), les valeurs semées par `?banc=1&CHAMP=valeur` */
function adresse (forme, prise, mode, valeurs) {
  const rendu = Buffer.from(JSON.stringify({ mode: mode === 'schema' ? 'schema' : 'realiste', dpr: 1 })).toString('base64url')
  const params = new URLSearchParams({ banc: '1', capture: '1', prise, rendu })
  for (const [k, v] of Object.entries(valeurs ?? {})) params.set(k, String(v))
  return `${BASE}/shape/${encodeURIComponent(forme)}?${params}`
}

/**
 * ouvre une adresse dans une page neuve du Chrome à profil fixe (`navigateur.mjs` : cache et stockage effacés au lancement, une page par
 * prise ; les observateurs de three posés avant la page) et attend que la page soit calme : stable, la prise posée, aucun calcul fox-cad en
 * vol — tenu 1,5 s (la porte pleine part APRÈS la première réponse). Rend la page ouverte et ce qui a été vu en route (les lots de
 * `/api/foxcad/calcul/lot`, les requêtes en échec, les erreurs) ; la page est à fermer par l'appelant.
 */
async function ouvrir (contexte, url, fenetre) {
  const page = await contexte.newPage()
  await page.setViewportSize(fenetre)
  await page.addInitScript(() => {
    const cible = new EventTarget()
    const vus = []
    cible.addEventListener('observe', (e) => vus.push(e.detail))
    window.__THREE_DEVTOOLS__ = cible
    window.__threeObserves = vus
  })
  const suivi = { lots: [], echouees: [], erreurs: [], etat: null }
  let enVol = 0
  page.on('request', (req) => {
    if (/\/api\/foxcad\/calcul\/lot/.test(req.url())) enVol++
  })
  page.on('requestfinished', async (req) => {
    if (!/\/api\/foxcad\/calcul\/lot/.test(req.url())) return
    try {
      const r = await req.response()
      suivi.lots.push({ demande: JSON.parse(req.postData() ?? 'null'), statut: r?.status() ?? null, reponse: r ? await r.json() : null })
    } catch (e) {
      suivi.lots.push({ erreur: String(e?.message ?? e) })
    } finally {
      enVol--
    }
  })
  page.on('requestfailed', (req) => {
    if (/\/api\/foxcad\/calcul\/lot/.test(req.url())) enVol--
    suivi.echouees.push({ erreur: req.failure()?.errorText ?? '?', url: req.url().slice(0, 200) })
  })
  page.on('response', (r) => {
    if (r.status() >= 400) suivi.echouees.push({ statut: r.status(), url: r.url().slice(0, 200) })
  })
  page.on('pageerror', (e) => suivi.erreurs.push(`page : ${e.message.slice(0, 200)}`))
  page.on('console', (m) => {
    if (m.type() === 'error') suivi.erreurs.push(`console : ${m.text().slice(0, 200)}`)
  })
  const debut = Date.now()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: DELAI_MS })
    await page.waitForFunction(() => (window.__oaks?.version ?? 0) >= 2, null, { timeout: DELAI_MS })
    let calmeDepuis = 0
    while (Date.now() - debut < DELAI_MS) {
      suivi.etat = await page.evaluate(() => window.__oaks.etat())
      const priseOk = suivi.etat.prise === 'posée' || String(suivi.etat.prise ?? '').startsWith('impossible')
      if (suivi.etat.stable && priseOk && enVol <= 0) {
        if (!calmeDepuis) calmeDepuis = Date.now()
        if (Date.now() - calmeDepuis >= 1500) break
      } else calmeDepuis = 0
      await page.waitForTimeout(250)
    }
    if (!suivi.etat?.stable) throw new Error(`vue jamais stable — ${suivi.etat?.attente ?? '?'}`)
  } catch (e) {
    await page.close().catch(() => {})
    e.suivi = suivi
    throw e
  }
  return { page, suivi, debut }
}

/** les attributs du badge qu'un rejeu doit retrouver (la durée du calcul varie, le reste non) */
const BADGE_STABLE = ['foxcadEtat', 'foxcadPositions', 'foxcadPieces', 'foxcadManques', 'foxcadErreurs']

/** les JPEG de chaque prise : la pleine taille en q92 (la matière de Flora, la qualité des JPEG du lead), une vignette pour la planche */
const VARIANTES = {
  S16_client: [{ nom: 'jpg', qualite: 0.92 }, { nom: 'vignette', largeur: 960, qualite: 0.85 }],
  S16_schema: [{ nom: 'jpg', qualite: 0.92 }, { nom: 'vignette', largeur: 960, qualite: 0.85 }],
  S11_client: [{ nom: 'jpg', qualite: 0.92 }, { nom: 'vignette', largeur: 900, qualite: 0.85 }]
}

async function capturerCas (contexte, sit) {
  const dossier = join(OUT, sit.id)
  await mkdir(dossier, { recursive: true })
  const ecrire = async (nom, dataUrl) => {
    await writeFile(join(dossier, nom), Buffer.from(dataUrl.split(',')[1], 'base64'))
    return nom
  }
  /** la capture d'une prise ouverte : PNG + ses JPEG, écrits sous `<cle>.png`, `<cle>.jpg`, `<cle>_<largeur>.jpg` ; la caméra posée */
  const capturer = async (o, cle, camera) => {
    const img = await o.page.evaluate(CAPTURER, VARIANTES[cle])
    if (!img) throw new Error(`capture() n’a rien rendu (${cle})`)
    const f = cle.startsWith('S16') ? FENETRE.S16 : FENETRE.S11
    const v = VARIANTES[cle].find((x) => x.nom === 'vignette')
    return {
      png: await ecrire(`${cle}.png`, img.png),
      jpg: await ecrire(`${cle}.jpg`, img.jpeg.jpg),
      vignette: await ecrire(`${cle}_${v.largeur}.jpg`, img.jpeg.vignette),
      largeur: img.largeur,
      hauteur: img.hauteur,
      fenetreJuste: img.largeur === f.width && img.hauteur === f.height,
      camera: camera ?? null,
      secondes: Math.round((Date.now() - o.debut) / 100) / 10
    }
  }
  const debut = Date.now()
  const url = adresse(sit.forme, 'S16', 'client', sit.valeurs)
  const cas = { id: sit.id, titre: sit.titre, forme: sit.forme, intention: sit.intention ?? null, valeursSemees: sit.valeurs ?? {}, url, base: BASE, build: BUILD, quand: heureLocale(), version: 3, prises: {} }
  const reseau = []
  const erreurs = []
  let o = null
  const fermer = async () => {
    if (!o) return
    reseau.push(...o.suivi.echouees)
    erreurs.push(...o.suivi.erreurs)
    await o.page.close().catch(() => {})
    o = null
  }
  try {
    // ① S16 client, les valeurs SEMÉES : tout se mesure sur ce chargement
    o = await ouvrir(contexte, url, FENETRE.S16)
    const lu = await o.page.evaluate(LIRE_PAGE)
    Object.assign(cas, { etat: o.suivi.etat, config: lu.config, valeurs: lu.valeurs, libelles: lu.libelles, badge: lu.badge, prix: lu.prix, prixHt: lu.prixHt, taxe: lu.taxe })
    const scene = await o.page.evaluate(LIRE_SCENE)
    cas.scene = { groupes: scene.groupes, capteurs: scene.capteurs, poignees: scene.poignees ?? [], natures: scene.natures ?? {}, erreur: scene.erreur ?? null }
    cas.textures = scene.textures ?? null
    cas.prises.S16_client = await capturer(o, 'S16_client', lu.camera)
    cas.lots = o.suivi.lots
    await fermer()
    // ② le preset : le form résolu, rejoué TEL QUEL (S16 schéma, S11 client) — ce qu'un `?id=` ouvrirait
    const sources = await sourcesDuProduit(sit.forme)
    cas.arbre = { sha12: sources.arbre, lu: sources.lu }
    cas.form = formDuPreset(cas.valeurs, sources.champs)
    for (const [cle, prise, mode] of [['S16_schema', 'S16', 'schema'], ['S11_client', 'S11', 'client']]) {
      const u = adresse(sit.forme, prise, mode, cas.form)
      o = await ouvrir(contexte, u, FENETRE[prise])
      const l = await o.page.evaluate(LIRE_PAGE)
      const capture = await capturer(o, cle, l.camera)
      const badgeA = BADGE_STABLE.map((k) => cas.badge?.attributs?.[k] ?? null)
      const badgeB = BADGE_STABLE.map((k) => l.badge?.attributs?.[k] ?? null)
      capture.rejeu = {
        adresse: u.length,
        ecarts: ecartsDeValeurs(cas.valeurs, l.valeurs).map((k) => ({ cle: k, avant: cas.valeurs[k] ?? null, rejeu: l.valeurs[k] ?? null })),
        prix: l.prix,
        prixIdentique: l.prix === cas.prix,
        badgeIdentique: JSON.stringify(badgeA) === JSON.stringify(badgeB),
        badge: l.badge ? badgeB.join(' / ') : null
      }
      cas.prises[cle] = capture
      await fermer()
    }
  } catch (e) {
    cas.echec = String(e?.message ?? e)
    if (e?.suivi) {
      reseau.push(...e.suivi.echouees)
      erreurs.push(...e.suivi.erreurs)
      cas.lots = cas.lots ?? e.suivi.lots
    }
  } finally {
    await fermer()
  }
  cas.reseau = reseau
  cas.erreurs = erreurs.slice(0, 16)
  cas.secondes = Math.round((Date.now() - debut) / 100) / 10
  await writeFile(join(dossier, 'cas.json'), JSON.stringify(cas, null, 1))
  return cas
}

// --- les portes et leurs verdicts (hors navigateur : rejouable par --planche-seule) -----------------------------------------------------

const estSquelette = (article) => /^OAKSOME_SHAPE_/.test(article ?? '')

/** le lot principal (celui qui porte le squelette) et les demandes de porte pleine (Door_Name = FR_01_LAM, par ___REFID) */
function lotsDuCas (cas) {
  const bons = (cas.lots ?? []).filter((l) => l.reponse && Array.isArray(l.reponse.positions) && l.demande?.positions)
  const principaux = bons.filter((l) => l.demande.positions.some((p) => estSquelette(p.article)))
  const principal = principaux[principaux.length - 1] ?? null
  const pleines = new Map()
  for (const l of bons) {
    if (l === principal || principaux.includes(l)) continue
    l.demande.positions.forEach((p, i) => {
      const r = l.reponse.positions[i]
      if (r && !r.erreur) pleines.set(String(p.lot?.___REFID ?? ''), { article: p.article, lot: p.lot, reponse: r })
    })
  }
  return { principal, pleines }
}

/** les portes d'un cas, sur leur façade, avec ce qu'il faut pour le verdict — fox-cad d'abord, le designer à défaut */
function portesDuCas (cas, sources) {
  const avertissements = []
  const portes = []
  const { principal, pleines } = lotsDuCas(cas)
  const pullDe = (code) => sources?.poignees?.find((p) => p.value === code) ?? null
  const pullForm = pullDe(cas.valeurs?.OV_PULL)
  const pullYForm = pullForm ? 50 + (nombre(pullForm.data?.dim_y) ?? 0) / 2 : null
  if (principal) {
    principal.demande.positions.forEach((pos, i) => {
      if (estSquelette(pos.article)) return
      const r = principal.reponse.positions[i]
      const ligne = String(i + 1)
      const lot = pos.lot ?? {}
      const zone = `col. ${i} · ${pos.article}${lot.HEX_SIT ? ` (${lot.HEX_SIT}${lot.HEX_SIT !== 'PLAT' ? `, H_L ${lot.HEX_H_L} / H_R ${lot.HEX_H_R}` : ''})` : ''}`
      if (!r || r.erreur) {
        avertissements.push(`${zone} : position en erreur chez fox-cad — ${r?.message ?? r?.erreur ?? 'pas de réponse'}`)
        return
      }
      let doors = portesDePieces(r.pieces).map((p) => ({ piece: p, source: 'fox-cad' }))
      if (!doors.length) {
        const pl = pleines.get(String(lot.___REFID ?? ligne))
        const d = pl ? portesDePieces(pl.reponse.pieces) : []
        doors = d.map((p) => ({ piece: p, source: `porte pleine (${pl.lot?.Door_Name}) redemandée par la page : la façade ${lot.Door_Name} est un manque chez fox-cad` }))
        if (!doors.length) {
          avertissements.push(`${zone} : aucune porte chez fox-cad${(r.manques ?? []).length ? ` (manque : ${String(r.manques[0]).slice(0, 140)})` : ''} et aucune porte pleine reçue — non jugée`)
          return
        }
      }
      const groupe = cas.scene?.groupes?.[ligne]
      if (!groupe) {
        avertissements.push(`${zone} : le groupe « fox-cad ${ligne} ${pos.article} » manque dans la scène — non jugée`)
        return
      }
      for (const d of doors) {
        const c = contourPorteFoxCad(d.piece, groupe.elements)
        portes.push({ zone, article: pos.article, hierarchie: d.piece.hierarchie ?? null, definition: d.piece.definition ?? null, source: d.source, charnieres: c.charnieres, poly: c.poly, axeU: c.axeU, ancre: c.ancre, pullX: nombre(lot.PULL_X), pullY: nombre(lot.PULL_Y), handleType: lot.Handle_Type ?? null, hingeOption: lot.HINGE_OPTION ?? null, doorName: lot.Door_Name ?? null })
      }
    })
  } else {
    const capteurs = (cas.scene?.capteurs ?? []).filter((c) => c.visible)
    if (!capteurs.length) avertissements.push('aucune porte : ni lot fox-cad, ni capteur de porte du designer dans la scène')
    capteurs
      .map((c) => ({ c, p: contourPorteDesigner(c) }))
      .sort((a, b) => (a.p.orientation === b.p.orientation ? a.p.poly[0].u - b.p.poly[0].u : a.p.orientation === 'côté' ? -1 : 1))
      .forEach(({ p }, i) => portes.push({ zone: `porte ${i + 1} (${p.orientation})`, article: null, source: 'designer d’Otman (capteur de DoorAnimator) — forme de production, fox-cad n’y calcule rien', charnieres: null, poly: p.poly, orientation: p.orientation, plan: p.plan, pullX: nombre(cas.valeurs?.OV_PULL_X), pullY: pullYForm }))
  }
  // la poignée que la page DESSINE sur chaque porte : une poignée visible dont la projection tombe dans la porte (et, pour le designer, sur
  // le plan de sa façade) ; la plus proche de la ligne de la poignée si plusieurs
  const dessinees = (cas.scene?.poignees ?? []).filter((q) => q.visible)
  for (const p of portes) {
    const us = p.poly.map((q) => q.u)
    const vs = p.poly.map((q) => q.v)
    const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)]
    // une porte de fox-cad peut porter la poignée du designer (la façade FR_08 d'une colonne coupée reste à Otman, découpée) : les deux comptent
    const candidates = dessinees
      .filter((q) => (p.plan === undefined ? true : Math.abs((p.orientation === 'côté' ? q.pos[0] : q.pos[2]) - p.plan) < 150))
      .map((q) => ({ q, ...projeterSurFacade(q.pos, p) }))
      .filter((x) => x.u >= u0 - 30 && x.u <= u1 + 30 && x.v >= v0 - 30 && x.v <= v1 + 30)
    if (!candidates.length) continue
    const libreADroite = p.charnieres !== 'droite'
    const uLibre = libreADroite ? u1 : u0
    candidates.sort((a, b) => Math.abs(a.u - uLibre) - Math.abs(b.u - uLibre))
    const x = candidates[0]
    p.poigneePage = { v: Math.round(x.v * 10) / 10, duBordLibre: Math.round(Math.abs(x.u - uLibre) * 10) / 10, qui: x.q.qui, type: x.q.type, source: x.q.source ?? null, descendue: x.q.descendue ?? null, autres: candidates.length - 1, pos: x.q.pos }
  }
  return { portes, avertissements, principal: Boolean(principal), pleines: pleines.size }
}

/** le verdict de toutes les portes d'un cas sous les paramètres du board ; `sit` : la situation (son `attendu`, s'il y en a un) */
async function jugerCas (cas, sit = null) {
  const sources = await sourcesDuProduit(cas.forme).catch((e) => {
    console.error(`sources du produit ${cas.forme} : ${e.message ?? e}`)
    return null
  })
  const { portes, avertissements, principal, pleines } = portesDuCas(cas, sources)
  const collection = cas.valeurs?.OV_COLLECTION ?? cas.valeursSemees?.OV_COLLECTION
  const front = cas.valeurs?.OV_FRONT_TYPE ?? cas.valeursSemees?.OV_FRONT_TYPE
  const pull = cas.valeurs?.OV_PULL ?? null
  const frontLigne = sources?.fronts?.find((f) => f.value === front) ?? null
  const integree = /GROOVED/.test(frontLigne?.data?.info_01 ?? '')
  const pdf = ptoPrevuParLePdf(front, collection, GAMME, CORRESPONDANCE)
  const formulaire = ptoOffertParLeFormulaire(collection, sources?.poignees)
  const choixPTO = pull === 'TIPON' || portes.some((p) => p.handleType === 'TIPON')
  // LA RÈGLE D'ALIGNEMENT : les rangées et leurs lignes, puis chaque porte contre la ligne de sa rangée
  const jugement = jugerPortes(portes, { choixPTO, integree, pdf, formulaire }, { petite: PETITE })
  const verdicts = portes.map((p, i) => ({ ...p, verdict: jugement.verdicts[i] }))
  // hier : l'étiquette de la même porte dans la v2 publiée (seuil B 900) — rapprochée par le rang et la zone, jamais recalculée
  const casV2 = V2?.cas?.find((c) => c.id === cas.id) ?? null
  for (const [i, p] of verdicts.entries()) {
    const q = casV2?.portes?.[i]
    p.hier = q && q.zone === p.zone ? { etiquette: q.verdict?.etiquette ?? null, hauteurImos: q.verdict?.mesures?.hauteurImos ?? null } : null
  }
  for (const r of jugement.rangees) {
    if (r.desaccord) avertissements.push(`rangée ${r.rangee + 1} : ses portes non coupées ne disent pas la même hauteur (${r.desaccord.join(' / ')}) — la ligne prend la plus fréquente, ${r.ligne}`)
    if (!r.nonCoupees && r.ligne !== null) avertissements.push(`rangée ${r.rangee + 1} : ${r.source} (${r.ligne})`)
  }
  // les valeurs semées que la page n'a pas gardées (une borne du formulaire)
  for (const [k, v] of Object.entries(cas.valeursSemees ?? {})) {
    const r = cas.valeurs?.[k]
    if (r !== undefined && String(r) !== String(v)) avertissements.push(`semé ${k} = ${v}, la page rend ${r}`)
  }
  const tex = cas.textures?.origines ?? {}
  if (tex['image de repli']) avertissements.push(`${tex['image de repli']} matériau(x) sur l’image de repli`)
  // les requêtes en échec, une fois par adresse (v2 ouvre trois fois la même configuration : le même 404 revient trois fois)
  const echecs = new Map()
  for (const e of (cas.reseau ?? []).filter((x) => !/door_handler_demo\.glb/.test(x.url))) {
    const cle = `${e.statut ?? e.erreur} ${e.url.slice(0, 90)}`
    echecs.set(cle, (echecs.get(cle) ?? 0) + 1)
  }
  if (echecs.size) avertissements.push(`${echecs.size} adresse(s) en échec (hors démo) : ${[...echecs].slice(0, 3).map(([k, n]) => `${k}${n > 1 ? ` (× ${n})` : ''}`).join(' ; ')}`)
  if (/HEX/.test(cas.forme) && !principal) avertissements.push('forme à pièces fox-cad sans lot reçu')
  if (cas.echec) avertissements.unshift(`ÉCHEC : ${cas.echec}`)
  const tipon = portes.find((p) => p.handleType === 'TIPON')
  if (tipon) avertissements.push(`le lot envoie Handle_Type = TIPON et HINGE_OPTION = ${tipon.hingeOption} : imos refuse TIPON (lot MT de d11 : E1mv, aucun connecteur de poignée) — la route prouvée est Handle_Type = STANDARD + HINGE_OPTION = Tipon (MT-bis), la branche d'oaksome-stack (PTO-PORTE-COUPEE.md § 4)`)
  if (choixPTO && pdf.prevu === false) avertissements.push(`PTO choisi mais NON prévu par le PDF (${pdf.raison})`)
  if (choixPTO && formulaire.offert === false) avertissements.push(`PTO choisi mais non offert par le formulaire (${formulaire.raison})`)
  const comparaison = comparerAttendu(sit?.attendu ?? null, verdicts)
  if (comparaison && !comparaison.conforme) avertissements.unshift(`ÉCART À L'ATTENDU (${comparaison.attendu.source}) : ${comparaison.texte}`)
  const compte = compteEtiquettes(verdicts.map((v) => v.verdict))
  // la préconfiguration : ce que la page a résolu, rejoué, et ce qu'il reste à Dorian
  const rejeu = resumeRejeu(cas)
  const preset = cas.valeurs && Object.keys(cas.valeurs).length
    ? presetDuCas(
      {
        forme: cas.forme,
        valeurs: cas.valeurs,
        semees: cas.valeursSemees,
        prixTexte: cas.prix,
        prixHt: cas.prixHt ?? null,
        champs: sources?.champs ?? [],
        arbre: cas.arbre ?? (sources?.arbre ? { sha12: sources.arbre, lu: sources.lu } : null),
        rejeu,
        images: imagesDuCas(cas),
        pto: { regle: 'alignement', compte, orphelines: verdicts.filter((v) => v.verdict.orpheline).length, lignes: jugement.rangees.map((r) => r.ligne), choisi: choixPTO, pdf: pdf.prevu, formulaire: formulaire.offert },
        stack: PRESETS_STACK?.presets?.find((p) => p.id === cas.id) ?? null
      },
      CARTES
    )
    : null
  if (rejeu && !rejeu.identique) avertissements.unshift(`LE PRESET BOUGE AU REJEU : ${[...rejeu.ecarts.slice(0, 6), ...(rejeu.prix ? [] : ['prix']), ...(rejeu.badge ? [] : ['badge'])].join(', ')}`)
  if (preset?.recoupement && !preset.recoupement.formIdentique) avertissements.push(`form ≠ celui d’oaksome-stack sur ${preset.recoupement.nEcarts} clé(s) : ${preset.recoupement.ecarts.slice(0, 4).map((e) => `${e.cle} ${e.page ?? '∅'} / ${e.stack ?? '∅'}`).join(' ; ')}`)
  return {
    id: cas.id,
    titre: cas.titre,
    forme: cas.forme,
    intention: cas.intention,
    url: cas.url,
    base: cas.base,
    build: cas.build,
    quand: cas.quand,
    secondes: cas.secondes,
    valeursSemees: cas.valeursSemees,
    libelles: cas.libelles ?? {},
    resolu: {
      collection,
      numeroCollection: numeroCollection(collection),
      front,
      frontInfo: frontLigne?.data?.info_01 ?? null,
      pull,
      pullLibelle: sources?.poignees?.find((p) => p.value === pull)?.label ?? null,
      finition: cas.valeurs?.OV_FINISH_EXT ?? null,
      pullX: nombre(cas.valeurs?.OV_PULL_X)
    },
    badge: cas.badge?.texte ?? null,
    // ce que la PAGE dit de la PTO (d5, 8be6647) : les compteurs du badge (`data-foxcad-pto-choix`…) et les portes laissées sans poignée
    pageSansPoignee: cas.scene?.natures ?? {},
    pagePto: Object.fromEntries(Object.entries(cas.badge?.attributs ?? {}).filter(([k]) => /^foxcad(Pto|PoigneesSans|PoigneesIntegree)/.test(k)).map(([k, v]) => [k.replace(/^foxcad/, ''), v])),
    prix: cas.prix ?? null,
    lot: principal ? resumeLot(cas) : null,
    pleines,
    portes: verdicts.map(({ poly, ...p }) => ({ ...p, poly: poly.map((q) => ({ u: Math.round(q.u * 10) / 10, v: Math.round(q.v * 10) / 10 })) })),
    compte,
    rangees: jugement.rangees,
    /** hier (v2 publiée, seuil B 900) contre aujourd'hui (l'alignement) : les portes dont l'étiquette change */
    changements: verdicts.filter((p) => p.hier && p.hier.etiquette !== p.verdict.etiquette).map((p) => ({ zone: p.zone, hier: p.hier.etiquette, aujourdhui: p.verdict.etiquette, hauteurImos: p.verdict.mesures.hauteurImos, ligne: p.verdict.ligne.h, ecart: p.verdict.ecartALaLigne })),
    hierApparie: verdicts.filter((p) => p.hier).length,
    ptoAuChoix: { pdf, formulaire, choisi: choixPTO },
    textures: cas.textures,
    avertissements,
    attendu: comparaison,
    preset,
    images: imagesDuCas(cas),
    prises: cas.prises ?? null,
    capture: cas.capture ?? null,
    echec: cas.echec ?? null
  }
}

/** le rejeu du `form` (S16 schéma, S11 client) résumé : identique si aucune valeur, ni le prix, ni le badge n'a bougé ; `null` en v1 */
function resumeRejeu (cas) {
  const r = ['S16_schema', 'S11_client'].map((k) => [k, cas.prises?.[k]?.rejeu]).filter(([, x]) => x)
  if (!r.length) return null
  return {
    prises: r.map(([k]) => k),
    identique: r.every(([, x]) => !x.ecarts.length && x.prixIdentique && x.badgeIdentique),
    ecarts: [...new Set(r.flatMap(([, x]) => x.ecarts.map((e) => e.cle)))],
    prix: r.every(([, x]) => x.prixIdentique),
    badge: r.every(([, x]) => x.badgeIdentique),
    adresse: Math.max(...r.map(([, x]) => x.adresse ?? 0))
  }
}

/** les images d'un cas dans la planche (`img/` du site) : v2 les prises S16 et S11, v1 la seule S11 */
function imagesDuCas (cas) {
  if (cas.prises?.S16_client) {
    return {
      s16: `img/${cas.id}_S16.jpg`,
      s16Vignette: `img/${cas.id}_S16_960.jpg`,
      s16Schema: cas.prises.S16_schema ? `img/${cas.id}_S16_schema_960.jpg` : null,
      s16SchemaPlein: cas.prises.S16_schema ? `img/${cas.id}_S16_schema.jpg` : null,
      s11: cas.prises.S11_client ? `img/${cas.id}_S11_900.jpg` : null,
      s11Plein: cas.prises.S11_client ? `img/${cas.id}_S11.jpg` : null,
      horsSite: `${OUT.replace(/\\/g, '/')}/${cas.id}/ (PNG et JPEG q92 pleine taille : S16 client ${cas.prises.S16_client.largeur} × ${cas.prises.S16_client.hauteur}, S16 schéma, S11 client)`
    }
  }
  return cas.capture ? { s11: `img/${cas.id}_S11_900.jpg`, s11Plein: `img/${cas.id}_S11.jpg` } : null
}

/** les prises annotées : la S16 client (la vignette du board, l'« après » des cas de référence) et la S16 schéma */
const PRISES_ANNOTEES = ['S16_client', 'S16_schema']
const VARIANTES_LIGNE = [{ nom: 'jpg', qualite: 0.92 }, { nom: 'vignette', largeur: 960, qualite: 0.85 }]

/**
 * la ligne du meuble et les pastilles dessinées sur les prises d'un cas (`scripts/board/annotation.mjs`) — des fichiers À PART
 * (`<prise>_ligne.jpg`, `<prise>_ligne_960.jpg`, et `<prise>_ligne.json` : le dessin et son empreinte) ; une image n'est refaite que si son
 * dessin ou son PNG a changé. Pose `juge.annotation` ; rend le nombre d'images refaites.
 */
async function annoterCas (page, juge) {
  const dossier = join(OUT, juge.id)
  juge.annotation = { notes: [] }
  let refaites = 0
  for (const cle of PRISES_ANNOTEES) {
    const p = juge.prises?.[cle]
    if (!p?.png || !existsSync(join(dossier, p.png))) continue
    const dessin = dessinDuCas(juge, { camera: p.camera, largeur: p.largeur, hauteur: p.hauteur })
    if (dessin.erreur) {
      juge.annotation.notes.push(`${cle} : ${dessin.erreur}`)
      continue
    }
    const st = await stat(join(dossier, p.png))
    // l'empreinte : le dessin, le PNG, les variantes ET le code qui dessine (un style changé refait les images ; les fins de ligne du fichier,
    // que git réécrit en CRLF sur ce poste, n'y comptent pas)
    const style = DESSINER.toString().replace(/\r\n/g, '\n')
    const empreinte = createHash('sha256').update(JSON.stringify({ dessin, png: p.png, taille: st.size, mtime: st.mtimeMs, variantes: VARIANTES_LIGNE, style })).digest('hex').slice(0, 16)
    const noms = { jpg: `${cle}_ligne.jpg`, vignette: `${cle}_ligne_960.jpg`, trace: `${cle}_ligne.json` }
    let deja = false
    if (existsSync(join(dossier, noms.trace)) && existsSync(join(dossier, noms.jpg)) && existsSync(join(dossier, noms.vignette))) {
      deja = JSON.parse(await readFile(join(dossier, noms.trace), 'utf8')).empreinte === empreinte
    }
    if (!deja) {
      const png = `data:image/png;base64,${(await readFile(join(dossier, p.png))).toString('base64')}`
      const sorties = await page.evaluate(DESSINER, { png, dessin, variantes: VARIANTES_LIGNE })
      await writeFile(join(dossier, noms.jpg), Buffer.from(sorties.jpg.split(',')[1], 'base64'))
      await writeFile(join(dossier, noms.vignette), Buffer.from(sorties.vignette.split(',')[1], 'base64'))
      await writeFile(join(dossier, noms.trace), JSON.stringify({ empreinte, quand: heureLocale(), prise: cle, camera: p.camera, dessin }, null, 1))
      refaites++
    }
    juge.annotation[cle] = { jpg: noms.jpg, vignette: noms.vignette, lignes: dessin.lignes.length, pastilles: dessin.pastilles.length, chutes: dessin.chutes.length, croix: dessin.croix.length, horsCadre: dessin.horsCadre }
    if (dessin.horsCadre) juge.annotation.notes.push(`${cle} : ${dessin.horsCadre} pastille(s) hors du cadre`)
  }
  if (juge.annotation.S16_client) {
    Object.assign(juge.images, {
      s16Ligne: `img/${juge.id}_S16_ligne.jpg`,
      s16LigneVignette: `img/${juge.id}_S16_ligne_960.jpg`,
      s16SchemaLigne: juge.annotation.S16_schema ? `img/${juge.id}_S16_schema_ligne.jpg` : null,
      s16SchemaLigneVignette: juge.annotation.S16_schema ? `img/${juge.id}_S16_schema_ligne_960.jpg` : null
    })
  }
  return refaites
}

function resumeLot (cas) {
  const { principal } = lotsDuCas(cas)
  let pieces = 0
  let manques = 0
  let erreurs = 0
  for (const p of principal.reponse.positions) {
    if (p.erreur) erreurs++
    else {
      pieces += (p.pieces ?? []).length
      manques += (p.manques ?? []).length
    }
  }
  return { positions: principal.reponse.positions.length, pieces, manques, erreurs }
}

// --- main -----------------------------------------------------------------------------------------------------------------------------

async function main () {
  const liste = JSON.parse(await readFile(SITUATIONS, 'utf8'))
  const situations = liste.situations.filter((s) => !CAS || CAS.includes(s.id))
  await mkdir(OUT, { recursive: true })
  if (!PLANCHE_SEULE) {
    const resolution = await resoudrePublic(lireOptionResolveur(args.resolveur))
    console.log(`→ résolveur : ${resumeResolution(resolution)}`)
    if (resolution.echecs.length) {
      console.error(`ARRÊT — aucune adresse publique pour ${resolution.echecs.join(', ')} (--resolveur=aucun pour le DNS du poste)`)
      process.exit(2)
    }
    // le Chrome du poste sur le profil FIXE (`navigateur.mjs` : un profil temporaire neuf coûte un échec LogonUser au compte dorian)
    const contexte = await lancerChrome({
      profil: PROFIL_CHROME,
      channel: String(args.navigateur ?? 'chrome'),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', ...argumentsChrome(resolution)]
    })
    try {
      for (const sit of situations) {
        process.stdout.write(`→ ${sit.id.padEnd(8)} ${sit.forme.padEnd(14)} … `)
        const cas = await capturerCas(contexte, sit)
        const j = await jugerCas(cas, sit)
        const b = Object.entries(j.compte).map(([k, n]) => `${n} ${k}`).join(', ')
        const r = j.preset?.rejeu
        const lignes = j.rangees.map((x) => x.ligne ?? '—').join(' / ')
        console.log(cas.echec ? `ÉCHEC — ${cas.echec}` : `${cas.secondes}s · ${j.prix || 'sans prix'} · form ${j.preset?.champs ?? '?'} champs, rejeu ${r ? (r.identique ? 'identique' : `BOUGE (${r.ecarts.length} clé(s)${r.prix ? '' : ', prix'}${r.badge ? '' : ', badge'})`) : '—'} · ligne ${lignes} · ${j.portes.length} porte(s) : ${b || '—'}${j.changements.length ? ` · ${j.changements.length} change(nt) contre la v2` : ''}${j.avertissements.length ? ` · ⚠ ${j.avertissements.length}` : ''}`)
      }
    } finally {
      await contexte.close().catch(() => {})
    }
  }
  // la planche : tous les cas écrits dans OUT (ceux de la liste, dans son ordre)
  const juges = []
  for (const sit of liste.situations) {
    const f = join(OUT, sit.id, 'cas.json')
    if (!existsSync(f)) continue
    juges.push(await jugerCas(JSON.parse(await readFile(f, 'utf8')), sit))
  }
  // la ligne et les pastilles sur les images (un navigateur sans serveur ; seules les images dont le dessin a changé sont refaites)
  if (ANNOTER) {
    const contexte = await lancerChrome({ profil: PROFIL_CHROME, channel: String(args.navigateur ?? 'chrome') })
    try {
      const page = await contexte.newPage()
      let refaites = 0
      for (const j of juges) refaites += await annoterCas(page, j)
      console.log(`annotation : ${refaites} image(s) refaite(s), ${juges.filter((j) => j.annotation?.S16_client?.pastilles).length} / ${juges.length} cas annotés`)
    } finally {
      await contexte.close().catch(() => {})
    }
  }
  await mkdir(join(SITE, 'img'), { recursive: true })
  const manquantes = []
  const copier = async (id, depuis, vers) => {
    if (!depuis) return
    if (!existsSync(join(OUT, id, depuis))) return manquantes.push(`${id}/${depuis}`)
    await copyFile(join(OUT, id, depuis), join(SITE, 'img', vers))
  }
  for (const j of juges) {
    if (j.prises?.S16_client) {
      // le site : les trois prises en JPEG q92 pleine taille (au clic) et leurs vignettes ; les PNG restent dans OUT (la matière de Flora)
      await copier(j.id, j.prises.S16_client.jpg, `${j.id}_S16.jpg`)
      await copier(j.id, j.prises.S16_client.vignette, `${j.id}_S16_960.jpg`)
      await copier(j.id, j.prises.S16_schema?.jpg, `${j.id}_S16_schema.jpg`)
      await copier(j.id, j.prises.S16_schema?.vignette, `${j.id}_S16_schema_960.jpg`)
      await copier(j.id, j.prises.S11_client?.jpg, `${j.id}_S11.jpg`)
      await copier(j.id, j.prises.S11_client?.vignette, `${j.id}_S11_900.jpg`)
      // v3 : les images annotées (la ligne du meuble, une pastille par porte)
      for (const [cle, suffixe] of [['S16_client', 'S16'], ['S16_schema', 'S16_schema']]) {
        const a = j.annotation?.[cle]
        if (!a?.jpg) continue
        await copier(j.id, a.jpg, `${j.id}_${suffixe}_ligne.jpg`)
        await copier(j.id, a.vignette, `${j.id}_${suffixe}_ligne_960.jpg`)
      }
    } else if (j.capture) {
      await copier(j.id, j.capture.vignette, `${j.id}_S11_900.jpg`)
      await copier(j.id, j.capture.jpg, `${j.id}_S11.jpg`)
    }
  }
  if (manquantes.length) console.error(`${manquantes.length} image(s) absente(s) de ${OUT} (non copiées) : ${manquantes.slice(0, 4).join(', ')}${manquantes.length > 4 ? '…' : ''}`)
  const board = {
    titre: 'Board PTO et préconfigurations — la règle d’alignement',
    version: 3,
    date: liste.date,
    genere: heureLocale(),
    base: BASE,
    build: BUILD ?? juges.find((j) => j.build)?.build ?? null,
    parametres: { regle: 'alignement', regleImos: REGLE_IMOS, tolerance: TOLERANCE_LIGNE, ecartRangee: ECART_RANGEE, petite: PETITE, fenetres: FENETRE },
    references: REFERENCES,
    v2: V2 ? { fichier: V2_FICHIER.replace(/\\/g, '/'), genere: V2.genere, build: V2.build, seuil: V2.parametres?.seuil ?? null } : null,
    situations: SITUATIONS.replace(/\\/g, '/').replace(/^.*\/oaksome-front\//, ''),
    cartes: { ...CARTES, fichier: CARTES_FICHIER.replace(/\\/g, '/').replace(/^.*\/oaksome-front\//, '') },
    presetsStack: PRESETS_STACK ? { fichier: PRESETS_STACK_FICHIER.replace(/\\/g, '/'), quand: PRESETS_STACK.quand, api: PRESETS_STACK.api } : null,
    sortie: OUT.replace(/\\/g, '/'),
    gamme: GAMME,
    correspondance: CORRESPONDANCE,
    cas: juges
  }
  // les préconfigurations seules, dans l'ordre du board — la matière des fiches Odoo (rien n'est posé : l'état reste « proposé »)
  const presets = {
    _lisezmoi: 'Les préconfigurations proposées par le board de situations (d10, v3 : le verdict PTO par la règle d’alignement) : une par situation, au format de la page d’oaksome-stack (produits/hex/releves/2026-09-24_preconfigurations-du-site.md § 4). Mesuré sur la page du configurateur : le form résolu (champs de l’utilisateur, hors HIDEN_FIELDS) et le sha de l’arbre servi, le rejeu du form dans la page, les dimensions, le prix HT affiché (le moteur) et son TTC (taxe 1427, 21 %), l’écart à la carte actuelle de la forme. À Dorian : la carte (nom, sous-titre, ordre, filtres, image retenue). Rien n’est écrit dans Odoo : chaque fiche se pose sur son OK (node odoo.js).',
    genere: board.genere,
    base: BASE,
    build: board.build,
    presets: juges.filter((j) => j.preset).map((j) => ({ id: j.id, titre: j.titre, ...j.preset }))
  }
  await writeFile(join(OUT, 'board.json'), JSON.stringify(board, null, 1))
  await writeFile(join(SITE, 'board.json'), JSON.stringify(board, null, 1))
  await writeFile(join(OUT, 'presets.json'), JSON.stringify(presets, null, 1))
  await writeFile(join(SITE, 'presets.json'), JSON.stringify(presets, null, 1))
  const html = planche(board)
  await writeFile(join(SITE, 'index.html'), html)
  const tous = compteEtiquettes(juges.flatMap((j) => j.portes.map((p) => p.verdict)))
  console.log(`\nplanche : ${join(SITE, 'index.html')} (${html.length} o, ${juges.length} cas, ${juges.reduce((n, j) => n + j.portes.length, 0)} portes)`)
  console.log(`  l’alignement : ${Object.entries(tous).map(([k, n]) => `${n} ${k}`).join(', ')} ; orphelines ${juges.reduce((n, j) => n + j.portes.filter((p) => p.verdict.orpheline).length, 0)}`)
  const chg = juges.flatMap((j) => j.changements.map((c) => `${j.id} ${c.zone.replace(/ · .*$/, '')} ${c.hier} → ${c.aujourdhui}`))
  console.log(`  contre la v2 (seuil B 900) : ${chg.length} porte(s) changent sur ${juges.reduce((n, j) => n + j.hierApparie, 0)} appariées${chg.length ? `\n    ${chg.join('\n    ')}` : ''}`)
  const avecRejeu = juges.filter((j) => j.preset?.rejeu)
  const recoupes = juges.filter((j) => j.preset?.recoupement)
  console.log(`  presets : ${presets.presets.length} ; rejeu identique ${avecRejeu.filter((j) => j.preset.rejeu.identique).length} / ${avecRejeu.length} ; form = oaksome-stack ${recoupes.filter((j) => j.preset.recoupement.formIdentique).length} / ${recoupes.length}`)
  const echecs = juges.filter((j) => j.echec).length
  return echecs
}

main()
  .then((echecs) => process.exit(echecs ? 1 : 0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
