#!/usr/bin/env node
/**
 * La PREUVE d'un écran du configurateur (d5, B3 du plan du 22/09) : une page à la fois, dans un Chrome sans fenêtre (Playwright,
 * le Chrome du poste sur le profil fixe de `navigateur.mjs`), à une largeur donnée — Dorian relit sur un portable : 1680, puis 1280.
 *
 *   node scripts/preuve-fox-cad.mjs --shape=OS_SHAPE_HEX [--base=http://localhost:3025] [--largeur=1680] [--hauteur=1050]
 *        [--out=docs/releves/2026-09-22_b3] [--nom=hex-apres] [--dev] [--attente=120000] [--query=f.ZF_WIDTH=3500]
 *
 * Ce qui est relevé, sans rien inventer :
 *   - la capture PNG de la page entière telle que le navigateur la montre (`<nom>_<largeur>.png`) ;
 *   - le prix affiché (le premier montant en euros du document) et le temps pour l'avoir ;
 *   - quand la page porte les pièces de fox-cad (`[data-foxcad-etat]`, `#foxcad-pieces`) : l'état (ok / erreur / en-cours), le compte de
 *     pièces et de positions, et la liste des pièces en TSV (`<nom>.pieces.tsv`) — la même liste que l'API a rendue, telle que la page l'a reçue ;
 *   - les requêtes vers `/api/foxcad/` (statut, durée) et les erreurs de console, dans `<nom>.json`.
 * Rien n'est écrit ailleurs que dans `--out`.
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

const SHAPE = String(args.shape ?? 'OS_SHAPE_HEX')
const BASE = String(args.base ?? 'http://localhost:3025').replace(/\/$/, '')
const LARGEUR = Number(args.largeur ?? 1680)
const HAUTEUR = Number(args.hauteur ?? 1050)
const OUT = resolve(String(args.out ?? 'docs/releves/2026-09-22_b3'))
const NOM = String(args.nom ?? SHAPE.toLowerCase())
const ATTENTE = Number(args.attente ?? 120_000)
const DEV = args.dev === true || args.dev === 'true'
/**
 * `--sans-banc` (B4, 22/09) : hors du mode dev, la page ne lit les champs dans l'adresse (`?ZH_SLOPE_TYPE=BOTH…`) que sous `?banc=1`
 * (ShapeConfigurator : « `?banc=1` also opens URL seeding outside dev ») — et `banc=1` monte le panneau de réglages du banc (leva), qui fait
 * planter la page hors capture (mesuré le 22/09 : « reading 'path' », pas de canvas). `panneau=0` (Shape3D, B4) garde le banc sans son
 * panneau : l'option ajoute `banc=1&panneau=0` à la requête ; le journal garde l'adresse réellement ouverte.
 */
const SANS_BANC = args['sans-banc'] === true || args['sans-banc'] === 'true'
const QUERY = [typeof args.query === 'string' ? args.query : '', SANS_BANC ? 'banc=1&panneau=0' : ''].filter(Boolean).join('&')

const heureLocale = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * `--chemin=/` (B4 ②, 22/09) : une page qui n'est pas un configurateur (la racine et son menu des formes) — pas de prix ni de canvas à attendre ;
 * le journal relève les liens `/shape/…` de la page et le statut de chacun (`liens`), en plus de la capture et du texte visible.
 */
const CHEMIN = typeof args.chemin === 'string' ? args.chemin : null
const url = CHEMIN !== null ? `${BASE}${CHEMIN.startsWith('/') ? '' : '/'}${CHEMIN}${QUERY ? `?${QUERY}` : ''}` : `${BASE}/shape/${DEV ? 'dev/' : ''}${encodeURIComponent(SHAPE)}${QUERY ? `?${QUERY}` : ''}`
await mkdir(OUT, { recursive: true })

/**
 * `--resolveur=media.tecnibo.com=104.21.77.66` (23/09) : depuis ce poste, `media.tecnibo.com` résout en 192.168.30.92 (DNS interne Tecnibo) et
 * Chrome refuse alors, depuis une page publique, toute requête vers cette adresse privée (« Permission was denied for this request to access
 * the `local` address space », Private Network Access) — un artefact du poste, pas de l'hôte. L'option fait résoudre l'hôte donné à l'adresse
 * donnée (`--host-resolver-rules`), celle que voit un navigateur hors du réseau Tecnibo ; le journal garde la règle appliquée.
 */
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
const journal = { quand: heureLocale(), url, largeur: LARGEUR, hauteur: HAUTEUR, resolveur: reglesResolveur, requetesFoxCad: [], erreursConsole: [], requetesEchouees: [], reponsesEnEchec: [] }
const contexte = await lancerChrome({
  profil: profilDesArguments(args),
  channel: 'chrome',
  viewport: { width: LARGEUR, height: HAUTEUR },
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--hide-scrollbars', ...(reglesResolveur ? [`--host-resolver-rules=${reglesResolveur}`] : [])],
})
try {
  const page = await contexte.newPage()
  const debuts = new Map()
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.erreursConsole.push(`[${m.type()}] ${m.text().slice(0, 400)}`)
  })
  page.on('pageerror', (e) => journal.erreursConsole.push(`[pageerror] ${e.message.slice(0, 400)}`))
  page.on('requestfailed', (r) => journal.requetesEchouees.push(`${r.method()} ${r.url().slice(0, 200)} ${r.failure()?.errorText ?? ''}`))
  page.on('request', (r) => {
    if (r.url().includes('/api/foxcad/')) debuts.set(r, Date.now())
  })
  page.on('response', async (r) => {
    const req = r.request()
    // B4 : toute réponse en erreur, avec son adresse (la console ne dit que « Failed to load resource »)
    if (r.status() >= 400) journal.reponsesEnEchec.push(`${r.status()} ${req.method()} ${req.url().slice(0, 220)}`)
    if (!req.url().includes('/api/foxcad/')) return
    let taille = null
    try {
      taille = (await r.body()).length
    } catch {
      /* corps illisible : on garde le statut */
    }
    journal.requetesFoxCad.push({ methode: req.method(), url: req.url().replace(BASE, ''), statut: r.status(), dureeMs: Date.now() - (debuts.get(req) ?? Date.now()), octets: taille })
  })

  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'load', timeout: ATTENTE })
  journal.chargeeMs = Date.now() - t0

  if (CHEMIN !== null) {
    // une page sans configurateur : on attend que la liste des liens soit là (ou 30 s), puis on relève chaque lien
    try {
      await page.waitForFunction(() => document.querySelectorAll('a[href^="/shape/"]').length > 0, null, { timeout: Math.min(ATTENTE, 30_000) })
    } catch {
      journal.liensAttenteDepassee = true
    }
    await page.waitForTimeout(1500)
    const liens = await page.evaluate(() => [...document.querySelectorAll('a[href^="/shape/"]')].map((a) => ({ href: a.getAttribute('href'), texte: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120) })))
    journal.liens = []
    for (const l of liens) {
      const r = await page.request.get(`${BASE}${l.href}`, { timeout: ATTENTE })
      journal.liens.push({ ...l, statut: r.status() })
    }
    const png = resolve(OUT, `${NOM}_${LARGEUR}.png`)
    await page.screenshot({ path: png, fullPage: false })
    journal.capture = png
    journal.texteVisible = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500)
    await writeFile(resolve(OUT, `${NOM}.json`), JSON.stringify(journal, null, 2), 'utf8')
    console.log(
      `${journal.quand} ${url}\n  chargée ${journal.chargeeMs} ms · ${journal.liens.length} lien(s) /shape/ : ${journal.liens.map((l) => `${l.href} ${l.statut}`).join(' ; ')}` +
        `\n  console : ${journal.erreursConsole.length} erreur(s)/avertissement(s)${journal.erreursConsole.length ? ' — ' + journal.erreursConsole.slice(0, 3).join(' | ') : ''}\n  → ${png}`,
    )
  } else {
  // le prix : le premier montant en euros du document (PriceDisplay écrit « 3 274,66 € ») — « 0,00 € » est l'état d'attente du kit, pas un prix
  const lirePrix = () => (document.body.innerText.match(/\d[\d\s  ]*,\d{2}\s?€/) ?? [null])[0]
  let prix = null
  try {
    await page.waitForFunction(
      () => {
        const m = document.body.innerText.match(/\d[\d\s  ]*,\d{2}\s?€/)
        return Boolean(m) && !/^0,00/.test(m[0])
      },
      null,
      { timeout: ATTENTE },
    )
    prix = await page.evaluate(lirePrix)
    journal.prixMs = Date.now() - t0
  } catch {
    prix = await page.evaluate(lirePrix)
    journal.prixMs = null
    journal.prixAttenteDepassee = true
  }
  journal.prix = prix

  // les pièces de fox-cad, quand la page les porte : attendre la fin du calcul (ok ou erreur), jamais un état intermédiaire
  const porteFoxCad = await page.evaluate(() => Boolean(document.querySelector('[data-foxcad-etat]')))
  if (porteFoxCad) {
    try {
      await page.waitForFunction(
        () => {
          const e = document.querySelector('[data-foxcad-etat]')?.getAttribute('data-foxcad-etat')
          return e === 'ok' || e === 'erreur'
        },
        null,
        { timeout: ATTENTE },
      )
    } catch {
      journal.foxcadAttenteDepassee = true
    }
    journal.foxcadMs = Date.now() - t0
    journal.foxcad = await page.evaluate(() => {
      const e = document.querySelector('[data-foxcad-etat]')
      const brut = document.getElementById('foxcad-pieces')?.textContent ?? null
      return { etat: e?.getAttribute('data-foxcad-etat') ?? null, attributs: e ? { ...e.dataset } : null, pieces: brut ? JSON.parse(brut) : null }
    })
  } else journal.foxcad = null

  // le canvas a-t-il dessiné quelque chose (une scène uniforme = pas encore rendue, ou panne) : on l'attend jusqu'à 40 s, puis 4 s de plus
  // pour les textures — SwiftShader compile ses shaders en temps réel, la première image peut tarder
  const CONTROLE_CANVAS = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return { ok: false, raison: 'aucun canvas' }
    const petit = document.createElement('canvas')
    petit.width = 64
    petit.height = 64
    const ctx = petit.getContext('2d')
    if (!ctx) return { ok: false, raison: 'pas de contexte 2d' }
    ctx.drawImage(canvas, 0, 0, 64, 64)
    const { data } = ctx.getImageData(0, 0, 64, 64)
    const niveaux = new Set()
    for (let i = 0; i < data.length; i += 4) niveaux.add((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0)
    return { ok: niveaux.size >= 12, niveaux: niveaux.size, largeur: canvas.width, hauteur: canvas.height }
  }
  for (let essai = 0; essai < 40; essai++) {
    journal.canvas = await page.evaluate(CONTROLE_CANVAS)
    if (journal.canvas.ok) break
    await page.waitForTimeout(1000)
  }
  journal.canvasMs = Date.now() - t0
  await page.waitForTimeout(4000)
  journal.canvas = await page.evaluate(CONTROLE_CANVAS)
  // B4 : le badge change encore après le calcul — les poignées (GLB chargés dans la scène) arrivent après les pièces : on relit ses attributs
  // au moment de la capture, pas au moment du calcul
  if (journal.foxcad) {
    const tard = await page.evaluate(() => {
      const e = document.querySelector('[data-foxcad-etat]')
      return e ? { ...e.dataset } : null
    })
    if (tard) journal.foxcad.attributs = tard
  }

  const png = resolve(OUT, `${NOM}_${LARGEUR}.png`)
  await page.screenshot({ path: png, fullPage: false })
  journal.capture = png
  journal.texteVisible = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500)
  // 23/09 : le détail du lot (Set par Set : pièces, porte, MANQUES, ce que le chemin d'Otman dessine) — le texte du bloc, tel que l'écran le dit
  journal.detailLot = await page.evaluate(() => {
    const bloc = Array.from(document.querySelectorAll('details')).find((d) => /Pièces par fox-cad/.test(d.textContent ?? ''))
    if (!bloc) return null
    const ouvert = bloc.open
    bloc.open = true
    const texte = bloc.innerText.replace(/[ \t]+/g, ' ').trim()
    bloc.open = ouvert
    return texte.slice(0, 6000)
  })

  if (journal.foxcad?.pieces) {
    const lignes = journal.foxcad.pieces
    const colonnes = ['set', 'article', 'index', 'nom', 'hierarchie', 'definition', 'achat', 'largeur', 'profondeur', 'hauteur', 'x', 'y', 'z', 'orx', 'ory', 'orz', 'sousArticle', 'contour', 'charnieres']
    const tsv = [colonnes.join('\t'), ...lignes.map((l) => colonnes.map((c) => (l[c] === undefined || l[c] === null ? '' : String(l[c]))).join('\t'))].join('\n') + '\n'
    await writeFile(resolve(OUT, `${NOM}.pieces.tsv`), tsv, 'utf8')
    journal.tsv = resolve(OUT, `${NOM}.pieces.tsv`)
    journal.nbPieces = lignes.length
  }
  await writeFile(resolve(OUT, `${NOM}.json`), JSON.stringify(journal, null, 2), 'utf8')
  const f = journal.foxcad
  console.log(
    `${journal.quand} ${url}\n  chargée ${journal.chargeeMs} ms · prix ${prix ?? 'AUCUN'} à ${journal.prixMs ?? '—'} ms · canvas ${journal.canvas.ok ? 'dessiné' : 'VIDE'} (${journal.canvas.niveaux ?? '?'} niveaux)` +
      (f ? `\n  fox-cad : ${f.etat} — ${JSON.stringify(f.attributs)} · ${journal.nbPieces ?? 0} pièce(s) dans le TSV · poignées ${f.attributs?.foxcadPoigneesGlb ?? '?'} GLB / ${f.attributs?.foxcadPoigneesPastille ?? '?'} pastille(s)` : '\n  fox-cad : la page ne porte pas [data-foxcad-etat]') +
      `\n  requêtes /api/foxcad/ : ${journal.requetesFoxCad.map((r) => `${r.methode} ${r.url} ${r.statut} ${r.dureeMs} ms ${r.octets ?? '?'} o`).join(' ; ') || 'aucune'}` +
      `\n  console : ${journal.erreursConsole.length} erreur(s)/avertissement(s)${journal.erreursConsole.length ? ' — ' + journal.erreursConsole.slice(0, 3).join(' | ') : ''}` +
      `\n  réponses ≥ 400 : ${journal.reponsesEnEchec.join(' ; ') || 'aucune'}` +
      `\n  → ${png}`,
  )
  }
} finally {
  await contexte.close()
}
