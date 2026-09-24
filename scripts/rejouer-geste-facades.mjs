#!/usr/bin/env node
/**
 * LE GESTE DE DORIAN (23/09 07:43, capture `orchestre/revues/2026-09-23_capture-dorian-0743-facades-invisibles.png`) rejoué dans un Chrome
 * sans fenêtre : la page HEX s'ouvre PAR DÉFAUT (fox-cad a toutes les portes, celles du designer d'Otman sont masquées), puis, dans le
 * formulaire, Styler → Collection 2 → Front FR_08_LAM (→ Color category CAT_X → la première finition) — la façade à cadre est un manque chez
 * fox-cad, la porte doit revenir par le chemin d'Otman. À chaque étape : le badge (`data-foxcad-otman-*`), la scène three.js (les sous-arbres
 * de porte du designer : visibles ou non, combien de maillages visibles dessous), une capture à la pose initiale puis à une pose proche de
 * celle de Dorian (de face gauche, en plongée : un glissement de souris sur le canvas).
 *
 *   node scripts/rejouer-geste-facades.mjs --base=http://localhost:3026 --out=docs/releves/2026-09-23_facades-otman-apres-geste/avant
 *        [--largeur=1280] [--hauteur=900] [--nom=hex-geste] [--front=FR_08_LAM] [--collection=COLLECTION_02] [--attente=120000]
 *        [--resolveur=media.tecnibo.com=104.21.77.66] [--origine-publique]
 *
 * `--resolveur` (23/09 16:5x, comme `preuve-fox-cad.mjs`) : sur le réseau Tecnibo (ce poste), `media.tecnibo.com` résout en 192.168.30.92 —
 * même une requête DNS adressée à 1.1.1.1 ou 8.8.8.8 est interceptée ; le DNS sur HTTPS rend Cloudflare (104.21.77.66, 172.67.205.35) — et
 * Chrome refuse, depuis une page publique, une adresse privée (Local Network Access) : textures, vignettes du formulaire et GLB tombent. Sans
 * l'option, l'outil voit ce que voit un navigateur SUR le réseau Tecnibo ; avec, ce que voit un navigateur hors de ce réseau.
 * Le journal relève aussi le réseau (`reseau` : les requêtes des textures et des API, leur statut ou leur échec) et, dans la scène, l'origine
 * des textures posées sur les maillages visibles (`textures` : CDN, relais de l'hôte, image de repli, aucune).
 *
 * Rien n'est inventé : ce que la scène dit est relevé tel quel (`<nom>.json`), les captures sont celles du navigateur.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  }),
)
const BASE = String(args.base ?? 'http://localhost:3025').replace(/\/$/, '')
const LARGEUR = Number(args.largeur ?? 1280)
const HAUTEUR = Number(args.hauteur ?? 900)
const OUT = resolve(String(args.out ?? '_tmp/2026-09-23/repro'))
const NOM = String(args.nom ?? 'hex-geste')
const FRONT = String(args.front ?? 'FR_08_LAM')
const COLLECTION = String(args.collection ?? 'COLLECTION_02')
const ATTENTE = Number(args.attente ?? 120_000)
const SHAPE = String(args.shape ?? 'OS_SHAPE_HEX')
const url = `${BASE}/shape/${encodeURIComponent(SHAPE)}`
const RESOLVEUR = typeof args.resolveur === 'string' ? args.resolveur : null
const reglesResolveur = RESOLVEUR
  ? RESOLVEUR.split(',')
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => {
        const [hote, ip] = r.split('=')
        return `MAP ${hote} ${ip}`
      })
      .join(', ')
  : null
/**
 * `--origine-publique` (23/09 17:0x) : la page servie par ce poste (3025, 3026) est traitée par Chrome comme une page PUBLIQUE
 * (`--ip-address-space-overrides`, le commutateur de test de Local Network Access) — la condition exacte du public vu depuis le réseau
 * Tecnibo, sans passer par l'hôte en ligne : une requête de la page vers `media.tecnibo.com` (192.168.30.92, privée) est alors refusée.
 */
const ORIGINE_PUBLIQUE = args['origine-publique'] === true
const portBase = (() => {
  const u = new URL(BASE)
  return u.port || (u.protocol === 'https:' ? '443' : '80')
})()
const espacesAdresses = ORIGINE_PUBLIQUE ? `127.0.0.1:${portBase}=public,[::1]:${portBase}=public` : null
await mkdir(OUT, { recursive: true })

/** la famille d'une requête pour le relevé du réseau : les textures et les GLB (CDN ou relais de l'hôte), les API relayées ; `null` = non relevée */
const familleRequete = (u) => {
  if (/media\.tecnibo\.com/.test(u)) return /\.glb/i.test(u) ? 'CDN glb' : 'CDN image'
  const m = /\/api\/(media|rp-engine|foxcad|shape|oaksome|form-expo)\//.exec(u)
  if (m) return m[1] === 'media' ? (/\.glb/i.test(u) ? 'relais glb' : 'relais image') : `/api/${m[1]}`
  if (/fallback-texture/.test(u)) return 'image de repli'
  return null
}

const heureLocale = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/** ce que la page dit : le badge de fox-cad et ses attributs du chemin d'Otman */
const LIRE_BADGE = () => {
  const e = document.querySelector('[data-foxcad-etat]')
  return e ? { ...e.dataset } : null
}

/**
 * ce que la scène three.js dit (crochet `__THREE_DEVTOOLS__`, comme `mesure-textures.mjs`) : sous chaque groupe « chemin d'Otman … », les
 * sous-arbres de porte du designer (un groupe dont le premier enfant est un maillage invisible à `BoxGeometry` : la sonde de `DoorAnimator`),
 * leur visibilité EFFECTIVE (aucun ancêtre invisible), le nombre de maillages effectivement visibles dessous
 */
const LIRE_SCENE = () => {
  const scenes = (window.__threeObserves ?? []).filter((o) => o && o.isScene)
  if (!scenes.length) return { erreur: 'aucune scène annoncée' }
  const scene = scenes[scenes.length - 1]
  const effectivementVisible = (o) => {
    for (let p = o; p; p = p.parent) if (!p.visible) return false
    return true
  }
  const zones = []
  scene.traverse((g) => {
    if (!g.name || !g.name.startsWith("chemin d'Otman")) return
    const portes = []
    let maillagesVisibles = 0
    let maillages = 0
    g.traverse((o) => {
      if (o.isMesh) {
        maillages++
        if (effectivementVisible(o)) maillagesVisibles++
      }
      if (o.isMesh || !o.children.length) return
      const premier = o.children[0]
      if (premier && premier.isMesh && premier.visible === false && premier.geometry && premier.geometry.type === 'BoxGeometry') {
        let sous = 0
        let sousVisibles = 0
        o.traverse((m) => {
          if (m.isMesh && m !== premier) {
            sous++
            if (effectivementVisible(m)) sousVisibles++
          }
        })
        // un groupe dont le premier enfant est un panneau que le masque a caché ressemble à une sonde : la vraie porte a des maillages dessous
        if (sous > 0) {
          // qui la cache : elle-même, ou un ancêtre (son nom, son type, le nombre d'enfants) — pour lire la cause, pas la deviner
          const ancetresInvisibles = []
          for (let p = o.parent; p && p !== g; p = p.parent) if (!p.visible) ancetresInvisibles.push(`${p.type}${p.name ? `:${p.name}` : ''}(${p.children.length})`)
          // chaque maillage dessous : sa propre visibilité, sa géométrie, ce que le designer en dit (userData), sa matière — pour nommer ce qui reste caché
          const details = []
          o.traverse((m) => {
            if (!m.isMesh || m === premier) return
            const u = m.userData ?? {}
            details.push(`${m.visible ? 'v' : 'INV'}:${m.geometry?.type ?? '?'}${u.source ? `:${u.source}/${u.elemType ?? ''}` : ''}${m.material?.name ? `:${m.material.name}` : ''}${m.name ? `:${m.name}` : ''}`)
          })
          portes.push({ visible: o.visible, effectivementVisible: effectivementVisible(o), maillages: sous, maillagesVisibles: sousVisibles, ancetresInvisibles, details })
        }
      }
    })
    zones.push({ zone: g.name, visible: g.visible, maillages, maillagesVisibles, portes })
  })
  // l'origine des textures posées sur les maillages VISIBLES (chaque matériau d'un maillage à plusieurs matériaux compte) : le CDN de Tecnibo,
  // le relais de l'hôte (`/api/media/`), l'image de repli du front (`fallback-texture.jpg` : la texture n'a pas pu se charger), aucune
  const textures = {}
  scene.traverse((m) => {
    if (!m.isMesh || !effectivementVisible(m)) return
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      if (!mat || mat.visible === false) continue
      const img = mat.map ? (mat.map.image ?? mat.map.source?.data) : null
      const src = img ? String(img.currentSrc || img.src || '') : ''
      const cle = !mat.map
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
      textures[cle] = (textures[cle] ?? 0) + 1
    }
  })
  return { zones, portes: zones.reduce((n, z) => n + z.portes.length, 0), portesVisibles: zones.reduce((n, z) => n + z.portes.filter((p) => p.effectivementVisible).length, 0), textures }
}

const journal = { quand: heureLocale(), url, largeur: LARGEUR, hauteur: HAUTEUR, resolveur: reglesResolveur, espacesAdresses, collection: COLLECTION, front: FRONT, etapes: [], erreursConsole: [], reponsesEnEchec: [], reseau: {}, requetesEchouees: [] }
const contexte = await lancerChrome({
  profil: profilDesArguments(args),
  channel: 'chrome',
  viewport: { width: LARGEUR, height: HAUTEUR },
  args: [
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-gpu-sandbox',
    '--hide-scrollbars',
    ...(reglesResolveur ? [`--host-resolver-rules=${reglesResolveur}`] : []),
    ...(espacesAdresses ? [`--ip-address-space-overrides=${espacesAdresses}`] : []),
  ],
})
try {
  await contexte.addInitScript(() => {
    const cible = new EventTarget()
    const vus = []
    cible.addEventListener('observe', (e) => vus.push(e.detail))
    window.__THREE_DEVTOOLS__ = cible
    window.__threeObserves = vus
  })
  const page = await contexte.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.erreursConsole.push(`[${m.type()}] ${m.text().slice(0, 300)}`)
  })
  page.on('pageerror', (e) => journal.erreursConsole.push(`[pageerror] ${e.message.slice(0, 300)}`))
  page.on('response', (r) => {
    if (r.status() >= 400) journal.reponsesEnEchec.push(`${r.status()} ${r.request().url().slice(0, 200)}`)
    const f = familleRequete(r.url())
    if (f) journal.reseau[`${f} ${r.status()}`] = (journal.reseau[`${f} ${r.status()}`] ?? 0) + 1
  })
  page.on('requestfailed', (r) => {
    const f = familleRequete(r.url())
    const texte = r.failure()?.errorText ?? '?'
    if (f) journal.reseau[`${f} ÉCHEC ${texte}`] = (journal.reseau[`${f} ÉCHEC ${texte}`] ?? 0) + 1
    if (journal.requetesEchouees.length < 40) journal.requetesEchouees.push(`${r.method()} ${r.url().slice(0, 200)} ${texte}`)
  })

  const attendreCalcul = async () => {
    await page.waitForFunction(() => ['ok', 'erreur'].includes(document.querySelector('[data-foxcad-etat]')?.getAttribute('data-foxcad-etat') ?? ''), null, { timeout: ATTENTE })
  }
  const relever = async (etape, capture = true) => {
    // quelques images de plus : le masque et le magasin du badge tournent à chaque image, les GLB arrivent après les pièces
    await page.waitForTimeout(4000)
    const badge = await page.evaluate(LIRE_BADGE)
    const scene = await page.evaluate(LIRE_SCENE)
    const e = { etape, quand: heureLocale(), badge, scene }
    if (capture) {
      const png = resolve(OUT, `${NOM}_${etape}_${LARGEUR}.png`)
      await page.screenshot({ path: png, fullPage: false })
      e.capture = png
    }
    e.texteBadge = await page.evaluate(() => (document.querySelector('[data-foxcad-etat]')?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 300))
    journal.etapes.push(e)
    const b = badge ?? {}
    console.log(
      `[${etape}] badge : ${b.foxcadPieces ?? '?'} pièces · ${b.foxcadManques ?? '?'} manques · Otman : ${b.foxcadOtmanFacades ?? '?'} façade(s) (${b.foxcadOtmanModeles ?? ''}) · ${b.foxcadOtmanPanneauxMasques ?? '?'} panneaux masqués · ${b.foxcadOtmanPortesMasquees ?? '?'} portes masquées · ${b.foxcadOtmanMaillagesGardes ?? '?'} maillages gardés` +
        `\n       scène : ${scene.erreur ?? `${scene.portes} sous-arbre(s) de porte du designer, ${scene.portesVisibles} visible(s) — ${scene.zones.map((z) => `${z.zone.replace("chemin d'Otman ", '')}: ${z.maillagesVisibles}/${z.maillages} maillages visibles, portes ${z.portes.map((p) => (p.effectivementVisible ? `VISIBLE(${p.maillagesVisibles}/${p.maillages})` : `cachée(${p.maillagesVisibles}/${p.maillages})`)).join(',') || '—'}`).join(' ; ')}`}` +
        `\n       textures des maillages visibles : ${JSON.stringify(scene.textures ?? {})}`,
    )
    return e
  }
  const cliquer = async (selecteur, libelle) => {
    const el = page.locator(selecteur).first()
    await el.waitFor({ state: 'visible', timeout: 30_000 })
    await el.scrollIntoViewIfNeeded()
    await el.click()
    journal.etapes.push({ etape: `clic ${libelle}`, quand: heureLocale(), selecteur })
    console.log(`clic : ${libelle}`)
  }

  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'load', timeout: ATTENTE })
  await attendreCalcul()
  journal.chargeeMs = Date.now() - t0
  await relever('1-defaut')

  // le geste de Dorian : l'onglet Styler, la collection, le front (le filtre du front dépend de la collection), la catégorie, une finition
  await cliquer('button[data-tab][data-name="OV_STYLER"]', 'onglet Styler')
  await page.waitForTimeout(500)
  await cliquer(`div[data-name="OV_COLLECTION"] button[data-option][data-value="${COLLECTION}"]`, `Collection ${COLLECTION}`)
  await page.waitForTimeout(1500)
  await cliquer(`div[data-name="OV_FRONT_TYPE"] button[data-option][data-value="${FRONT}"]`, `Front ${FRONT}`)
  await page.waitForTimeout(1500)
  // la catégorie de couleur et la finition : les premières que le filtre admet (le formulaire ne les pose pas seul)
  const cat = page.locator('div[data-name="OV_CAT_COLOR"] button[data-option]').first()
  if (await cat.count()) {
    await cat.scrollIntoViewIfNeeded()
    await cat.click()
    journal.etapes.push({ etape: 'clic catégorie', quand: heureLocale(), valeur: await cat.getAttribute('data-value') })
    console.log(`clic : catégorie ${await cat.getAttribute('data-value')}`)
    await page.waitForTimeout(1500)
  }
  const fin = page.locator('div[data-name="OV_FINISH_EXT"] button[data-option]').first()
  if (await fin.count()) {
    await fin.scrollIntoViewIfNeeded()
    await fin.click()
    journal.etapes.push({ etape: 'clic finition', quand: heureLocale(), valeur: await fin.getAttribute('data-value') })
    console.log(`clic : finition ${await fin.getAttribute('data-value')}`)
  }
  // le recalcul de fox-cad : on attend que le badge dise le nouveau lot (des manques), puis l'état final
  try {
    await page.waitForFunction(() => document.querySelector('[data-foxcad-etat]')?.getAttribute('data-foxcad-etat') === 'en-cours', null, { timeout: 15_000 })
  } catch {
    journal.recalculNonVu = true
  }
  await attendreCalcul()
  await relever('2-apres-front')

  // la pose de Dorian : de face gauche, en plongée — un glissement de souris sur le canvas (OrbitControls)
  const canvas = page.locator('canvas').first()
  const boite = await canvas.boundingBox()
  if (boite) {
    const cx = boite.x + boite.width / 2
    const cy = boite.y + boite.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + Math.round(boite.width * 0.18), cy + Math.round(boite.height * 0.22), { steps: 24 })
    await page.mouse.up()
    journal.etapes.push({ etape: 'orbite', quand: heureLocale(), glissement: { dx: Math.round(boite.width * 0.18), dy: Math.round(boite.height * 0.22) } })
    await page.waitForTimeout(1500)
    await relever('3-pose-dorian')
  }
  journal.texteVisible = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500)
  journal.detailLot = await page.evaluate(() => {
    const bloc = Array.from(document.querySelectorAll('details')).find((d) => /Pièces par fox-cad/.test(d.textContent ?? ''))
    if (!bloc) return null
    const ouvert = bloc.open
    bloc.open = true
    const texte = bloc.innerText.replace(/[ \t]+/g, ' ').trim()
    bloc.open = ouvert
    return texte.slice(0, 6000)
  })
  await writeFile(resolve(OUT, `${NOM}.json`), JSON.stringify(journal, null, 2), 'utf8')
  console.log(`réseau : ${JSON.stringify(journal.reseau)}`)
  console.log(`console : ${journal.erreursConsole.length} erreur(s)/avertissement(s)${journal.erreursConsole.length ? ' — ' + journal.erreursConsole.slice(0, 3).join(' | ') : ''}\n→ ${resolve(OUT, `${NOM}.json`)}`)
} finally {
  await contexte.close()
}
