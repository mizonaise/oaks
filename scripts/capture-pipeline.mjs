#!/usr/bin/env node
/**
 * Capture du plan de prises de vue (Dorian, 2026-09-14, refondu le 15/09).
 *
 *   node scripts/capture-pipeline.mjs --shape=OS_SHAPE_F --out=./sorties \
 *        [--prises=H01,D02] [--series=details] [--modes=client,schema] \
 *        [--valeurs=OV_FINISH_EXT=…,OV_PULL=…] [--base=http://localhost:3021] [--gpu] \
 *        [--resolveur=public|aucun|hôte[=ip],…] [--origine-publique] [--profil-chrome=d10]
 *
 * Ouvre le configurateur sans écran, une fois par (prise × mode), et écrit un
 * PNG carré par image plus une `fiche.json` qui décrit la configuration, la
 * scène paramétrique, les mesures relevées sur la géométrie ET, pour chaque
 * prise, la caméra effective et sa légende (JSON + prose). Une planche-contact
 * ferme le lot. C'est ce paquet-là qu'on envoie à Flora : des rendus du
 * configurateur à angle connu, jamais un meuble inventé par le modèle.
 *
 * Partis pris (inchangés) : une page par image ; on photographie le canvas, pas
 * la page ; chaque image est contrôlée avant d'être gardée. Ajouts du 15/09 :
 *
 * - **La prise est nommée dans l'URL** (`?prise=D02`) et c'est la page qui
 *   résout la caméra depuis le modèle de scène (`lib/pipeline/stations.ts`) —
 *   le script ne calcule aucune caméra, il relit celle qui a été posée.
 * - **Journal des requêtes de poignée.** Le renderer va chercher le GLB de la
 *   poignée sur l'entrepôt d'assets ; quand il n'y arrive pas il retombe sur un
 *   fichier de démonstration absent (`/models/handles/door_handler_demo.glb`) et
 *   dessine une pastille. On journalise les deux, et — si la poignée
 *   configurée est connue — on sert le GLB réel à la place de la démo, pour
 *   que l'image porte la vraie poignée. Le repli est écrit dans la fiche.
 * - **Une prise impossible n'est pas un échec** : elle est publiée avec sa
 *   raison (« la caméra traverse le mur gauche »). Un échec, c'est une image
 *   attendue qui n'est pas sortie.
 *
 * Ajouts du 23/09 (d10, ligne du lead 17:3x : la sonde qui dit la vérité depuis
 * ce poste) :
 *
 * - **Le média par son adresse PUBLIQUE** (`--resolveur`, `resolveur-public.mjs`).
 *   Sur le réseau Tecnibo, `media.tecnibo.com` résout en 192.168.30.92 et Chrome
 *   refuse à une page publique toute adresse privée (Local Network Access) : la
 *   sonde voyait des portes blanches qu'aucun visiteur ne voit. Par défaut, le
 *   navigateur de capture reçoit l'adresse que rend le DNS sur HTTPS, relue à
 *   chaque lancement (`--host-resolver-rules`) ; `--resolveur=aucun` garde le DNS
 *   du poste (ce que voit un navigateur SUR le réseau Tecnibo). Sans adresse
 *   publique lisible, la sonde s'arrête (code 2) plutôt que de mentir.
 * - **Le navigateur charge lui-même les GLB de poignée** : ils ne passent plus
 *   par Node (`route.fetch` les sortait à 200 même quand la page les perdait) ;
 *   le journal des assets est observé, pas relayé (le CDN sert
 *   `access-control-allow-origin: *`, mesuré le 23/09).
 * - **Toutes les requêtes échouées** (échec réseau ou réponse ≥ 400), avec la
 *   prise et le mode où elles tombent, et le compte par hôte (`diagnostic.reseau`).
 * - **L'origine des textures** des maillages visibles, prise par prise (CDN,
 *   relais de l'hôte, image de repli, aucune) et image par image : une façade
 *   blanche se lit dans la fiche, pas seulement sur l'image.
 *
 * 24/09 (d10, ligne du lead 10:1x) : **Chrome sur un profil FIXE**
 * (`navigateur.mjs`, `--profil-chrome`) — un profil temporaire neuf fait un
 * `LogonUser` qui échoue, et dix échecs verrouillent le compte dorian du poste.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'
import { legende } from './legendes.mjs'
import { planche } from './planche-contact.mjs'
import { argumentsChrome, lireOptionResolveur, resoudrePublic, resumeResolution } from './resolveur-public.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const PLAN = JSON.parse(await readFile(resolve(ICI, '../src/lib/pipeline/prises-de-vue.json'), 'utf8'))

// --- arguments ------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  })
)

const SHAPE = args.shape ?? 'OS_SHAPE_F'
const TEMPLATE_ID = args.id ?? null
const BASE = (args.base ?? 'http://localhost:3021').replace(/\/$/, '')
const TAILLE = Number(args.taille ?? PLAN.pixels ?? 2048)
const SORTIE = resolve(String(args.out ?? './sorties-pipeline'))
const DELAI_MS = Number(args.delai ?? 120_000)
const MODES = String(args.modes ?? 'client,schema').split(',').map(s => s.trim()).filter(Boolean)
const PRISES = args.prises ? String(args.prises).split(',').map(s => s.trim()) : null
const SERIES = args.series ? String(args.series).split(',').map(s => s.trim()) : null
const RESOLVEUR = lireOptionResolveur(args.resolveur)
/**
 * `--origine-publique` (comme `rejouer-geste-facades.mjs`) : la page servie par ce
 * poste (3025, 3026) est traitée par Chrome comme une page PUBLIQUE
 * (`--ip-address-space-overrides`, le commutateur de test de Local Network Access)
 * — la condition d'une page en ligne vue d'ici, sans rien mettre en ligne.
 */
const ORIGINE_PUBLIQUE = args['origine-publique'] === true
const ESPACES_ADRESSES = (() => {
  if (!ORIGINE_PUBLIQUE) return null
  const u = new URL(BASE)
  const port = u.port || (u.protocol === 'https:' ? '443' : '80')
  return `127.0.0.1:${port}=public,[::1]:${port}=public`
})()
const R2 ='https://backend.tecnibo.com/api/cloudflare/r2-object?key='
const ASSET_POIGNEE = /\/pull_glb\/|\/api\/cloudflare\/r2-object/

const encoderRendu = reglages => Buffer.from(JSON.stringify(reglages), 'utf8').toString('base64url')

const urlDeLaPrise = (prise, mode) => {
  const rendu = encoderRendu({ mode: mode === 'schema' ? 'schema' : 'realiste', dpr: 1 })
  const params = new URLSearchParams({ banc: '1', capture: '1', prise: prise.id, rendu })
  if (TEMPLATE_ID) params.set('id', String(TEMPLATE_ID))
  for (const paire of String(args.valeurs ?? '').split(',').filter(Boolean)) {
    const [cle, ...reste] = paire.split('=')
    params.set(cle.trim(), reste.join('='))
  }
  return `${BASE}/shape/${encodeURIComponent(SHAPE)}?${params}`
}

/**
 * Contrôle DANS la page : taille exacte et variété des pixels (un canvas uni = panne).
 * `seuil` : nombre de niveaux de gris minimal — 12 pour une vue d'ensemble ; un gros
 * plan en mode schéma (un joint entre deux façades rouges) est uni PAR NATURE et n'en
 * compte que 4-6 : mesuré le 15/09 sur D03, refusé à tort. Un détail se contente de 3.
 */
const CONTROLE = ({ largeur, hauteur, seuil }) => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return { ok: false, raison: 'aucun canvas' }
  if (canvas.width !== largeur || canvas.height !== hauteur) {
    return { ok: false, raison: `canvas ${canvas.width}x${canvas.height}, attendu ${largeur}x${hauteur}` }
  }
  const petit = document.createElement('canvas')
  petit.width = 64
  petit.height = 64
  const ctx = petit.getContext('2d')
  if (!ctx) return { ok: false, raison: 'pas de contexte 2d' }
  ctx.drawImage(canvas, 0, 0, 64, 64)
  const { data } = ctx.getImageData(0, 0, 64, 64)
  const niveaux = new Set()
  for (let i = 0; i < data.length; i += 4) {
    niveaux.add((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0)
  }
  return niveaux.size >= seuil ? { ok: true, niveaux: niveaux.size } : { ok: false, raison: `canvas quasi uni (${niveaux.size} niveaux de gris)` }
}

/**
 * L'origine des textures posées sur les maillages VISIBLES de la scène (crochet
 * `__THREE_DEVTOOLS__` posé avant le chargement de la page, comme
 * `rejouer-geste-facades.mjs`) : chaque matériau d'un maillage à plusieurs
 * matériaux compte. `origines` : CDN de Tecnibo, relais de l'hôte (`/api/media/`),
 * image de repli du front (`fallback-texture.jpg` : la texture n'a pas pu se
 * charger), sans texture ; `images` : le compte par image (chemin du média sans
 * le compte ni `/public`).
 */
const TEXTURES = () => {
  const scenes = (window.__threeObserves ?? []).filter(o => o && o.isScene)
  if (!scenes.length) return null
  const scene = scenes[scenes.length - 1]
  const visible = o => {
    for (let p = o; p; p = p.parent) if (!p.visible) return false
    return true
  }
  const nomImage = src => {
    try {
      const u = new URL(src, location.href)
      const chemin = decodeURIComponent(u.pathname).replace(/^\/api\/media/, '').replace(/^\/[A-Za-z0-9_-]{16,}\//, '/').replace(/\/public$/, '')
      return u.host === location.host ? chemin : `${u.host}${chemin}`
    } catch {
      return src.slice(0, 120)
    }
  }
  const origines = {}
  const images = {}
  let maillages = 0
  scene.traverse(m => {
    if (!m.isMesh || !visible(m)) return
    maillages++
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      if (!mat || mat.visible === false) continue
      const img = mat.map ? (mat.map.image ?? mat.map.source?.data) : null
      const src = img ? String(img.currentSrc || img.src || '') : ''
      const origine = !mat.map
        ? 'sans texture'
        : /fallback-texture/.test(src)
          ? 'image de repli'
          : /media\.tecnibo\.com/.test(src)
            ? 'CDN'
            : /\/api\/media\//.test(src)
              ? 'relais de l’hôte'
              : src
                ? 'autre'
                : 'texture sans adresse (GLB, canvas)'
      origines[origine] = (origines[origine] ?? 0) + 1
      if (src) images[nomImage(src)] = (images[nomImage(src)] ?? 0) + 1
    }
  })
  return { maillages, origines, images }
}

const resumeTextures = t =>
  t ? Object.entries(t.origines).map(([k, n]) => `${k} ${n}`).join(' · ') || 'aucun matériau' : 'scène non annoncée'

// --- capture --------------------------------------------------------------

async function main () {
  await mkdir(SORTIE, { recursive: true })

  // Le média par son adresse publique (défaut) ou par le DNS du poste (`--resolveur=aucun`).
  const resolution = await resoudrePublic(RESOLVEUR)
  console.log(`→ résolveur : ${resumeResolution(resolution)}`)
  if (resolution.echecs.length) {
    console.error(`ARRÊT — aucune adresse publique pour ${resolution.echecs.join(', ')} : depuis ce poste, la capture verrait le réseau Tecnibo, pas un visiteur. --resolveur=aucun pour le vouloir, --resolveur=hôte=ip pour la donner.`)
    process.exit(2)
  }

  // Le Chrome DU POSTE (le CDN de Playwright est injoignable depuis WIN-DORIAN-1), sur le profil FIXE (`navigateur.mjs`).
  const contexte = await lancerChrome({
    profil: profilDesArguments(args),
    ...(args.navigateur === 'chromium' ? {} : { channel: String(args.navigateur ?? 'chrome') }),
    viewport: { width: TAILLE, height: TAILLE },
    args: [
      // WebGL logiciel sur une VM sans GPU ; `--gpu` reprend le pipeline matériel.
      ...(args.gpu ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']),
      '--disable-gpu-sandbox',
      ...argumentsChrome(resolution),
      ...(ESPACES_ADRESSES ? [`--ip-address-space-overrides=${ESPACES_ADRESSES}`] : [])
    ]
  })
  if (ESPACES_ADRESSES) console.log(`→ origine publique : ${ESPACES_ADRESSES}`)
  try {
    return await capturer(contexte, resolution)
  } finally {
    await contexte.close().catch(() => {})
  }
}

async function capturer (contexte, resolution) {
  // Le crochet des outils de three.js : chaque scène créée par la page est annoncée (lu par TEXTURES).
  await contexte.addInitScript(() => {
    const cible = new EventTarget()
    const vus = []
    cible.addEventListener('observe', e => vus.push(e.detail))
    window.__THREE_DEVTOOLS__ = cible
    window.__threeObserves = vus
  })
  const page = await contexte.newPage()

  // Où en est la capture : chaque requête échouée est rangée sous la prise et le mode où elle tombe.
  let ou = 'pré-vol'

  // Journal des requêtes d'assets de poignée : les GLB sont servis par
  // `media.tecnibo.com/…/oaksome/pull_glb/<code>.glb` (mesuré le 15/09 : 200, CORS
  // ouvert) ; l'entrepôt R2 de `backend.tecnibo.com` est l'autre chemin connu. Le
  // navigateur les charge lui-même (23/09) : le journal observe, il ne relaie plus.
  const requetesR2 = []
  let pullCode = null
  let replisDemo = 0
  await page.route('**/models/handles/door_handler_demo.glb', async route => {
    if (!pullCode) return route.continue()
    try {
      const r = await contexte.request.get(`${R2}oaksome/pull_glb/${pullCode}.glb`)
      if (!r.ok()) return route.continue()
      replisDemo++
      await route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: await r.body() })
    } catch {
      await route.continue()
    }
  })

  // Le réseau vu par le navigateur : TOUTES les requêtes échouées — échec réseau
  // (refus Local Network Access, DNS, CORS, annulation) ou réponse ≥ 400 — et, par
  // hôte, le compte des réponses par statut et des échecs par erreur.
  const reseau = { par_hote: {}, echouees: [] }
  const hoteDe = url => {
    try {
      const u = new URL(url)
      return u.host || `${u.protocol}`
    } catch {
      return '?'
    }
  }
  const compter = (hote, cle) => {
    const h = (reseau.par_hote[hote] ??= {})
    h[cle] = (h[cle] ?? 0) + 1
  }
  page.on('response', r => {
    const req = r.request()
    compter(hoteDe(r.url()), String(r.status()))
    if (r.status() >= 400) reseau.echouees.push({ ou, statut: r.status(), type: req.resourceType(), methode: req.method(), url: r.url() })
    if (ASSET_POIGNEE.test(r.url())) requetesR2.push({ url: r.url(), status: r.status() })
  })
  page.on('requestfailed', req => {
    const erreur = req.failure()?.errorText ?? '?'
    compter(hoteDe(req.url()), erreur)
    reseau.echouees.push({ ou, erreur, type: req.resourceType(), methode: req.method(), url: req.url() })
    if (ASSET_POIGNEE.test(req.url())) requetesR2.push({ url: req.url(), status: 0, erreur })
  })

  const erreurs = []
  const FATALES = /WebGL|Error creating|context lost|out of memory/i
  let fatale = null
  const noter = message => {
    erreurs.push(message)
    if (!fatale && FATALES.test(message)) fatale = message
  }
  page.on('pageerror', e => noter(`page: ${e.message}`))
  page.on('console', m => {
    if (m.type() === 'error') noter(`console: ${m.text()}`)
  })

  /**
   * Fenêtre d'une prise : carrée par défaut ; une prise `format: "16:9"` (stations de vente du
   * 19/09) garde la largeur du plan et réduit la hauteur. La page cadre d'après l'aspect du canvas.
   */
  const fenetre = prise => (prise.format === '16:9' ? { width: TAILLE, height: Math.round((TAILLE * 9) / 16) } : { width: TAILLE, height: TAILLE })

  /** Ouvre une prise et attend que la page l'ait posée (ou déclarée impossible). */
  const ouvrir = async (prise, mode) => {
    const url = urlDeLaPrise(prise, mode)
    erreurs.length = 0
    fatale = null
    await page.setViewportSize(fenetre(prise))
    await page.goto(url, { waitUntil: 'load', timeout: DELAI_MS })
    await page.waitForFunction(() => (window.__oaks?.version ?? 0) >= 2, null, { timeout: DELAI_MS })
    const limite = Date.now() + DELAI_MS
    let etat = null
    while (Date.now() < limite) {
      if (fatale) throw new Error(`rendu impossible — ${fatale}`)
      etat = await page.evaluate(() => window.__oaks.etat())
      const priseOk = etat.prise === 'posée' || (etat.prise ?? '').startsWith('impossible')
      if (etat.stable && priseOk) break
      await page.waitForTimeout(250)
    }
    if (!etat || !etat.stable) throw new Error(`vue jamais stable — ${etat?.attente ?? '?'}`)
    return etat
  }

  // Le lot : les prises demandées, dans l'ordre du plan.
  const lot = PLAN.prises.filter(p => (!PRISES || PRISES.includes(p.id)) && (!SERIES || SERIES.includes(p.serie)))

  // Pré-vol : une page rapide pour lire la configuration (le code de poignée
  // sert au repli) — la première image reprend de toute façon la page.
  process.stdout.write('→ pré-vol … ')
  try {
    await ouvrir(PLAN.prises[0], 'schema')
    const f = await page.evaluate(() => window.__oaks.fiche())
    pullCode = f?.valeurs?.OV_PULL ?? null
    console.log(`ok (poignée ${pullCode ?? 'inconnue'}, ${requetesR2.length} requête(s) d'asset)`)
  } catch (e) {
    console.log(`ÉCHEC — ${e.message ?? e}`)
  }

  const resultats = []
  let fiche = null
  let scene = null
  let mesures = null

  for (const prise of lot) {
    const modes = prise.modes.filter(m => MODES.includes(m))
    const fichiers = {}
    const textures = {}
    let camera = null
    let secondes = 0
    let echec = null
    const echoueesAvant = reseau.echouees.length
    for (const mode of modes) {
      const debut = Date.now()
      ou = `${prise.id} ${mode}`
      process.stdout.write(`→ ${prise.id} ${mode} … `)
      try {
        await ouvrir(prise, mode)
        const complete = await page.evaluate(() => window.__oaks.fiche())
        if (complete && !fiche) {
          const { vue: _v, prise: _p, ...config } = complete
          fiche = config
        }
        if (complete?.vue?.scene && !scene) scene = complete.vue.scene
        camera = complete?.prise?.camera ?? null
        if (complete?.prise?.mesures && !mesures) mesures = complete.prise.mesures
        if (!camera || camera.faisable === false) {
          console.log(`omise — ${camera?.raison ?? 'prise non résolue'}`)
          break
        }
        // Un gros plan en schéma peut n'avoir que DEUX aplats (fileur + mur, D08) : seul un
        // canvas à un niveau est une panne.
        const f = fenetre(prise)
        const controle = await page.evaluate(CONTROLE, { largeur: f.width, hauteur: f.height, seuil: prise.cadrage === 'detail' ? 2 : 12 })
        if (!controle.ok) throw new Error(controle.raison)
        // Les textures telles qu'elles sont au moment de la photo.
        textures[mode] = await page.evaluate(TEXTURES)
        const dataUrl = await page.evaluate(() => window.__oaks.capture())
        if (!dataUrl) throw new Error('capture() n a rien renvoyé')
        const png = Buffer.from(dataUrl.split(',')[1], 'base64')
        const nom = `${prise.id}_${mode}.png`
        await writeFile(resolve(SORTIE, nom), png)
        fichiers[mode] = nom
        const s = Math.round((Date.now() - debut) / 100) / 10
        secondes += s
        console.log(`ok (${(png.length / 1024) | 0} Ko, ${s}s${camera.politique !== 'nominale' ? `, ${camera.politique}` : ''}) — textures : ${resumeTextures(textures[mode])}`)
      } catch (e) {
        echec = String(e.message ?? e)
        console.log(`ÉCHEC — ${echec}`)
      }
    }
    resultats.push({ prise, fichiers, camera, secondes, echec, erreurs_console: [...erreurs], textures, requetes_echouees: reseau.echouees.length - echoueesAvant })
  }

  // Légendes et fiche. `--fusionner` : un lot partiel (quelques prises rejouées)
  // remplace ses prises dans la fiche existante du dossier au lieu de l'écraser.
  let anciennes = []
  if (args.fusionner) {
    try {
      const f = JSON.parse(await readFile(resolve(SORTIE, 'fiche.json'), 'utf8'))
      anciennes = (f.prises ?? []).filter(p => !lot.some(q => q.id === p.id))
      fiche = fiche ?? (({ scene: _s, mesures: _m, capture: _c, diagnostic: _d, prises: _p, ...reste }) => reste)(f)
      scene = scene ?? f.scene ?? null
      mesures = mesures ?? f.mesures ?? null
    } catch {
      /* pas de fiche à fusionner */
    }
  }
  const prises = resultats.map(r => {
    const { json, prose } = legende(r.prise, {
      valeurs: fiche?.valeurs ?? {},
      libelles: fiche?.libelles ?? {},
      scene,
      mesures,
      camera: r.camera,
      fichiers: r.fichiers
    })
    return {
      ...json,
      secondes: r.secondes,
      echec: r.echec,
      erreurs_console: r.erreurs_console.slice(0, 5),
      textures: r.textures,
      requetes_echouees: r.requetes_echouees,
      legende: prose
    }
  })
  // Dans l'ordre du plan, anciennes et nouvelles confondues.
  const ordre = new Map(PLAN.prises.map((p, i) => [p.id, i]))
  const toutes = [...anciennes, ...prises].sort((a, b) => (ordre.get(a.id) ?? 999) - (ordre.get(b.id) ?? 999))
  const fait = toutes.filter(p => p.statut === 'capturee').length
  const echecs = prises.filter(p => p.echec).length
  const sortie = {
    ...(fiche ?? { config: { shape: SHAPE, template_id: TEMPLATE_ID } }),
    scene,
    mesures,
    capture: {
      base: BASE,
      origine_publique: ESPACES_ADRESSES,
      taille_px: TAILLE,
      format: PLAN.format,
      plan_version: PLAN.version,
      le: new Date().toISOString(),
      prises_demandees: toutes.length,
      prises_realisees: fait,
      echecs
    },
    diagnostic: {
      poignee_configuree: pullCode,
      requetes_assets: requetesR2,
      replis_poignee_demo: replisDemo,
      resolveur: resolution,
      reseau: { requetes_echouees: reseau.echouees.length, par_hote: reseau.par_hote, echouees: reseau.echouees }
    },
    prises: toutes
  }
  await writeFile(resolve(SORTIE, 'fiche.json'), JSON.stringify(sortie, null, 2))

  try {
    const p = await planche(SORTIE, sortie, contexte)
    console.log(`planche-contact : ${p.png}`)
  } catch (e) {
    console.log(`planche-contact : ÉCHEC — ${e.message ?? e}`)
  }

  // Le réseau en une ligne : les échecs regroupés par hôte et par erreur ou statut.
  const groupes = {}
  for (const e of reseau.echouees) {
    const cle = `${hoteDe(e.url)} ${e.erreur ?? e.statut}`
    groupes[cle] = (groupes[cle] ?? 0) + 1
  }
  const lignes = Object.entries(groupes).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} × ${n}`)
  console.log(`réseau : ${reseau.echouees.length} requête(s) en échec${lignes.length ? ` — ${lignes.join(' ; ')}` : ''}`)
  console.log(`\n${fait}/${toutes.length} prises réalisées, ${echecs} échec(s) — ${SORTIE}`)
  return echecs
}

main()
  .then(echecs => process.exit(echecs === 0 ? 0 : 1))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
