#!/usr/bin/env node
/**
 * LA CHARGE DU CLIC « Add to cart », INTERCEPTÉE COMME LE SITE LA REÇOIT (ligne du lead à d10 24/09 11:0x ; mot de Dorian 11:0x : « on doit
 * pouvoir tout donner à Rachid : JSON, XML, prix, photo, description… il le stocke dans Odoo » ; relevé `docs/releves/2026-09-24_charge-panier.md`).
 *
 * Une page « site », servie par un petit serveur local de l'outil (`127.0.0.1`, un port libre : une AUTRE origine, comme `oaksome.com`
 * devant `slop.oaksome.com` ; une page rendue par la route du navigateur serait « publique » et Chrome refuserait l'iframe locale —
 * `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`, mesuré), porte l'iframe du configurateur à la géométrie d'`oaksome-web` (`configure.css` :
 * 80 px de bandeau, l'iframe à 100 % × le reste de la fenêtre) et écoute `message` comme `configurer/_client.tsx`. Pour chaque cas et
 * chaque appareil :
 *
 *  1. la page prête : un prix au bandeau, aucun calcul, le réseau calme 2 s, le badge de fox-cad posé ; la réponse de prix et la forme
 *     servie (`/api/shape/product/<forme>`) relevées en route ;
 *  2. clic sur « Add to cart » DANS l'iframe → le message reçu par le parent : son origine, ses clés, chaque champ pesé (octets du JSON) ;
 *     `image` décodée (type, définition lue dans l'en-tête PNG, octets), gardée en PNG et en JPEG q85 ; le XML gardé ; la charge posée en
 *     JSON, l'image et le XML remplacés par leur fichier ;
 *  3. les bornes du site rejouées (`oaksome-web` `src/app/api/odoo/configurator/route.ts`, origin/main 4ecc4e1) : `config_json` = la charge
 *     SANS `xmlFile` — image comprise — ≤ 512 Kio ; `image_base64` ≤ 2 Mio de caractères ; le verdict par appareil ;
 *  4. les champs ajoutés (`totalPrice`, `details`, `tva`, `pays`, `versions`) recoupés contre l'API relevée, l'adresse, la forme servie
 *     (sha256 du JSON, 12 caractères : l'empreinte du board et d'oaksome-stack ; la forme par son JSON canonique, l'API en change l'ordre)
 *     et `--build=<commit>` ; absents sur un build d'avant : dit ;
 *  5. `--orbite` (bureau) : la caméra tournée à la souris puis un second clic — l'image suit-elle la caméra du moment ?
 *  6. `--recalcul` (bureau) : « FREE STANDING » puis un clic AUSSITÔT — la charge ne porte aucun prix (celui de la configuration envoyée
 *     n'est pas encore rendu) —, puis un clic une fois le prix rendu : le nouveau HT ;
 *  7. `--s16` (bureau) : la prise S16 de la chaîne de capture (`?capture=1&prise=S16`, la configuration semée par le `form` de la charge)
 *     en JPEG q85 à 1 920 et 1 280 px de large — la proposition pour `image`, pesée contre les mêmes bornes.
 *
 * Les appareils : `bureau` (1440 × 900, densité 1 : la page telle quelle), `retina` (densité 2) et `telephone` (390 × 844, tactile, densité
 * 1,5). Ce poste n'a pas de GPU (WebGL logiciel) : la page s'y mettrait d'elle-même en densité 1 (`perf.ts`, palier bas) ; pour `retina` et
 * `telephone`, la densité que `perf.ts` donne à ces appareils (×2 un bureau haut de gamme, ×1,5 un téléphone à plus de 6 cœurs) est POSÉE
 * par `?banc=1&panneau=0&rendu=` — le même rendu, sans le correcteur de cadence ni le panneau du banc.
 *
 *   node scripts/capture-panier.mjs [--base=http://localhost:3026] [--cas=HEX,F] [--appareils=bureau,retina,telephone] [--taxe=BE/6]
 *        [--etiquette=3026] [--out=C:/Users/dorian/scripts/_out/d10-panier] [--build=<commit attendu dans versions.front>]
 *        [--orbite] [--recalcul] [--s16] [--profil-chrome=d10] [--resolveur=public|aucun|hôte[=ip]] [--delai=150000]
 *
 * Chrome sur le profil fixe (`navigateur.mjs` : un lancement par appareil, le même dossier), le média par son adresse publique.
 */
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'
import { argumentsChrome, lireOptionResolveur, resoudrePublic, resumeResolution } from './resolveur-public.mjs'
import { jsonCanonique } from '../src/lib/panier/charge.ts'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  })
)
const BASE = String(args.base ?? 'http://localhost:3026').replace(/\/$/, '')
const ETIQUETTE = String(args.etiquette ?? new URL(BASE).port ?? 'base')
const OUT = resolve(String(args.out ?? 'C:/Users/dorian/scripts/_out/d10-panier'), ETIQUETTE)
const DELAI_MS = Number(args.delai ?? 150_000)
const BUILD = args.build ? String(args.build) : null
const [PAYS, TVA] = String(args.taxe ?? 'BE/6').split('/')

/** les cas : la forme et ce que le site met dans l'adresse de l'iframe (décision A : `pays` et `tva` ; `id` = une carte du site) */
const TOUS = {
  HEX: { forme: 'OS_SHAPE_HEX', params: {}, titre: 'HEX, la configuration par défaut' },
  F: { forme: 'OS_SHAPE_F', params: {}, titre: 'F, la configuration par défaut' },
  'HEX-01': { forme: 'OS_SHAPE_HEX', params: { id: '1275457' }, titre: 'la carte « Placard sous pente » (products-config du site)' },
  'F-01': { forme: 'OS_SHAPE_F', params: { id: '1275000' }, titre: 'la carte « Shape F » (products-config du site)' }
}
const CAS = (args.cas ? String(args.cas).split(',').map((s) => s.trim()) : ['HEX', 'F']).filter((id) => TOUS[id])

/** les appareils : la fenêtre, la densité de l'écran, la densité que la page prendrait sur ce matériel (posée quand ce poste ne l'a pas) */
const TOUS_APPAREILS = {
  bureau: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, dpr: null },
  retina: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false, dpr: 2 },
  telephone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, dpr: 1.5 }
}
const APPAREILS = (args.appareils ? String(args.appareils).split(',').map((s) => s.trim()) : Object.keys(TOUS_APPAREILS)).filter((a) => TOUS_APPAREILS[a])

/** les bornes du site (`api/odoo/configurator/route.ts`) : `CONFIG_JSON_MAX_BYTES = 512 * 1024` ; `image_base64: z.string().max(2 * 1024 * 1024)` */
const BORNE_CONFIG_JSON = 512 * 1024
const BORNE_IMAGE = 2 * 1024 * 1024
/** les clés d'avant la ligne de 11:0x (`buildMessagePayload`), puis les cinq ajoutées */
const CLES_AVANT = ['action', 'name', 'pricing', 'form', 'description', 'shape', 'xmlFile', 'image']
const CLES_AJOUTEES = ['totalPrice', 'details', 'tva', 'pays', 'versions']

const sha12 = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 12)
/** la forme servie change l'ordre de ses clés d'une réponse à l'autre (cps, variables, descriptors : mesuré sur 4848) — son empreinte se prend sur le JSON canonique */
const sha12Canonique = (x) => createHash('sha256').update(jsonCanonique(x)).digest('hex').slice(0, 12)
const octetsJson = (v) => (v === undefined ? 0 : Buffer.byteLength(JSON.stringify(v), 'utf8'))
const ko = (n) => `${(n / 1024).toFixed(1).replace('.', ',')} Kio`
const heureLocale = () => new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' })
const encoderRendu = (reglages) => Buffer.from(JSON.stringify(reglages), 'utf8').toString('base64url')

/** la page « site » : le bandeau de 80 px et l'iframe, l'écoute de `message` (tout ce qui arrive, avec son origine) */
const pageSite = (src) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>harnais du site (d10)</title><style>html,body{margin:0;height:100%;background:#fff}.bandeau{height:80px;background:#EEEDE7}
.configurator-iframe-wrapper{position:relative;width:100%;height:calc(100vh - 80px)}iframe{display:block;width:100%;height:100%;border:none}</style></head>
<body><div class="bandeau"></div><div class="configurator-iframe-wrapper"><iframe id="product-iframe" allow="private-network-access-in-iframes; fullscreen"
title="Configurateur 3D" src="${src.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe></div>
<script>window.__recus=[];addEventListener('message',function(e){window.__recus.push({origine:e.origin,recuA:Date.now(),data:e.data})})</script></body></html>`

/** le bandeau VISIBLE de l'iframe, le badge de fox-cad, le canvas */
const LIRE_ETAT = () => {
  const b = [...document.querySelectorAll('header.k-prix')].filter((e) => e.getClientRects().length > 0)[0] ?? null
  const f = document.querySelector('[data-foxcad-etat]')
  const c = document.querySelector('canvas')
  return {
    bandeau: b && {
      montant: (b.querySelector('.k-prix-val .k-cap')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      etiquette: b.querySelector('.k-tag-xxs')?.textContent ?? null,
      spinner: Boolean(b.querySelector('[aria-label="Updating price"]')),
      data: { ...b.dataset }
    },
    foxcad: f ? f.getAttribute('data-foxcad-etat') : null,
    canvas: c && { largeur: c.width, hauteur: c.height, cssLargeur: Math.round(c.getBoundingClientRect().width), cssHauteur: Math.round(c.getBoundingClientRect().height) },
    densite: window.devicePixelRatio,
    pointeurGrossier: matchMedia('(pointer: coarse)').matches
  }
}

/** ce que dit l'en-tête d'une image en data URL (PNG : largeur / hauteur de l'IHDR ; JPEG : le marqueur SOF) */
function decrireImage (dataUrl) {
  if (typeof dataUrl !== 'string') return { present: false, valeur: dataUrl === null ? null : typeof dataUrl }
  const m = /^data:([^;,]+)(;base64)?,/.exec(dataUrl)
  if (!m) return { present: true, format: 'pas une data URL', caracteres: dataUrl.length }
  const octets = Buffer.from(dataUrl.slice(m[0].length), 'base64')
  let largeur = null
  let hauteur = null
  if (octets.subarray(1, 4).toString('latin1') === 'PNG') {
    largeur = octets.readUInt32BE(16)
    hauteur = octets.readUInt32BE(20)
  } else if (octets[0] === 0xff && octets[1] === 0xd8) {
    for (let i = 2; i + 9 < octets.length; ) {
      if (octets[i] !== 0xff) break
      const marqueur = octets[i + 1]
      const longueur = octets.readUInt16BE(i + 2)
      if (marqueur >= 0xc0 && marqueur <= 0xc3) {
        hauteur = octets.readUInt16BE(i + 5)
        largeur = octets.readUInt16BE(i + 7)
        break
      }
      i += 2 + longueur
    }
  }
  return { present: true, mime: m[1], caracteres: dataUrl.length, octets: octets.length, largeur, hauteur, sha12: createHash('sha256').update(octets).digest('hex').slice(0, 12), buffer: octets }
}

/** la charge pesée : chaque champ (octets du JSON), `config_json` du site (la charge sans `xmlFile`), les bornes */
function peser (data) {
  const champs = Object.fromEntries(Object.keys(data).map((k) => [k, octetsJson(data[k])]))
  const configJson = { ...data }
  delete configJson.xmlFile
  const configOctets = octetsJson(configJson)
  const imageCaracteres = typeof data.image === 'string' ? data.image.length : 0
  return {
    cles: Object.keys(data),
    clesAvantPresentes: CLES_AVANT.every((k) => k in data),
    ordreAvantGarde: JSON.stringify(Object.keys(data).slice(0, CLES_AVANT.length)) === JSON.stringify(CLES_AVANT),
    clesAjoutees: CLES_AJOUTEES.filter((k) => k in data),
    autres: Object.keys(data).filter((k) => !CLES_AVANT.includes(k) && !CLES_AJOUTEES.includes(k)),
    champs,
    total: octetsJson(data),
    configJson: { octets: configOctets, borne: BORNE_CONFIG_JSON, passe: configOctets <= BORNE_CONFIG_JSON, sansImage: configOctets - octetsJson(data.image) },
    imageBase64: { caracteres: imageCaracteres, borne: BORNE_IMAGE, passe: imageCaracteres <= BORNE_IMAGE }
  }
}

/** une image (data URL) réencodée DANS la page : JPEG `qualite`, à `largeur` px (proportions gardées) — ce qu'un navigateur enverrait */
const REENCODER = async ({ dataUrl, largeur, qualite }) => {
  const img = new Image()
  img.src = dataUrl
  await img.decode()
  const l = largeur ?? img.naturalWidth
  const h = Math.round((img.naturalHeight * l) / img.naturalWidth)
  const c = document.createElement('canvas')
  c.width = l
  c.height = h
  const g = c.getContext('2d')
  g.imageSmoothingQuality = 'high'
  g.drawImage(img, 0, 0, l, h)
  return c.toDataURL('image/jpeg', qualite)
}

/** la charge sans ses deux gros champs (l'image et le XML, remplacés par leur fichier) : le JSON posé dans le relevé */
function chargeLisible (data, fichiers) {
  const out = {}
  for (const [k, v] of Object.entries(data)) {
    if (k === 'image' && typeof v === 'string') out[k] = `‹${fichiers.image} — data URL ${v.slice(0, v.indexOf(',') + 1)}… ${v.length} caractères›`
    else if (k === 'xmlFile' && v && typeof v === 'object') out[k] = { ...v, content: `‹${fichiers.xml} — ${Buffer.byteLength(String(v.content ?? ''), 'utf8')} octets›` }
    else out[k] = v
  }
  return out
}

/** les champs ajoutés recoupés : contre la dernière réponse de prix, l'adresse, la forme servie, le build */
function recouper (data, { api, produit, taxe }) {
  if (!CLES_AJOUTEES.some((k) => k in data)) return { presents: false }
  const ht = api ? (typeof api.prices?.price_ht === 'number' ? api.prices.price_ht : api.totalPrice) : null
  const r = {
    presents: true,
    totalPrice: { charge: data.totalPrice, api: ht, egal: data.totalPrice === ht },
    details: { egal: JSON.stringify(data.details ?? null) === JSON.stringify(api?.details ?? null) },
    tva: { charge: data.tva, adresse: taxe.tva, egal: data.tva === taxe.tva },
    pays: { charge: data.pays, adresse: taxe.pays, egal: data.pays === taxe.pays },
    versions: {
      charge: data.versions ?? null,
      arbreServi: produit ? sha12(produit.form) : null,
      formeServie: produit ? sha12Canonique(produit.shape) : null,
      formeServieBrute: produit ? sha12(produit.shape) : null,
      buildAttendu: BUILD
    }
  }
  r.versions.arbreEgal = r.versions.charge?.arbre === r.versions.arbreServi
  r.versions.formeEgale = r.versions.charge?.forme === r.versions.formeServie
  r.versions.frontEgal = BUILD ? r.versions.charge?.front === BUILD : null
  r.conforme = r.totalPrice.egal && r.details.egal && r.tva.egal && r.pays.egal && r.versions.arbreEgal && r.versions.formeEgale && r.versions.frontEgal !== false
  return r
}

/** ouvre la page « site » et attend que l'iframe soit prête ; relève les réponses de prix et la forme servie */
async function ouvrir (contexte, cas, appareil, parent) {
  const params = new URLSearchParams({ ...cas.params, pays: PAYS, tva: TVA })
  if (appareil.dpr) {
    params.set('banc', '1')
    params.set('panneau', '0')
    params.set('rendu', encoderRendu({ dpr: appareil.dpr }))
  }
  const src = `${BASE}/shape/${cas.forme}?${params}`
  const page = await contexte.newPage()
  const suivi = { prix: [], produit: null, echouees: [], erreurs: [], activite: Date.now() }
  page.on('request', () => { suivi.activite = Date.now() })
  page.on('requestfailed', (req) => {
    suivi.activite = Date.now()
    suivi.echouees.push({ erreur: req.failure()?.errorText ?? '?', url: req.url().slice(0, 160) })
  })
  page.on('requestfinished', async (req) => {
    suivi.activite = Date.now()
    const u = req.url()
    try {
      if (/\/api\/shape\/pricing\//.test(u) && req.method() === 'POST') {
        const r = await req.response()
        suivi.prix.push(r ? await r.json() : null)
      } else if (u.includes(`/api/shape/product/${cas.forme}`)) {
        const r = await req.response()
        if (r?.ok()) suivi.produit = await r.json()
      }
    } catch (e) {
      suivi.erreurs.push(`réponse illisible ${u.slice(0, 100)} : ${e.message}`)
    }
  })
  page.on('pageerror', (e) => suivi.erreurs.push(`page : ${e.message.slice(0, 200)}`))
  const debut = Date.now()
  await page.goto(`${parent}/${encodeURIComponent(cas.id)}?src=${encodeURIComponent(src)}`, { waitUntil: 'load', timeout: DELAI_MS })
  let cadre = null
  while (Date.now() - debut < DELAI_MS && !cadre) {
    cadre = page.frames().find((f) => f.url().startsWith(`${BASE}/shape/`)) ?? null
    if (!cadre) await page.waitForTimeout(250)
  }
  if (!cadre) throw new Error(`l'iframe du configurateur n'est pas chargée en ${DELAI_MS / 1000} s`)
  const o = { page, cadre, src, suivi }
  o.etat = await attendrePrete(o, debut)
  o.secondes = Math.round((Date.now() - debut) / 100) / 10
  return o
}

/** la page prête : un prix au bandeau sans calcul, le badge de fox-cad posé, aucune requête depuis 2 s ; puis le canvas finit son image */
async function attendrePrete (o, debut = Date.now()) {
  let etat = null
  while (Date.now() - debut < DELAI_MS) {
    etat = await o.cadre.evaluate(LIRE_ETAT).catch(() => null)
    const prixPose = etat?.bandeau?.data?.prixHt && !etat.bandeau.spinner
    const foxcadPose = etat && (etat.foxcad === null || etat.foxcad === 'ok' || etat.foxcad === 'erreur')
    if (prixPose && foxcadPose && Date.now() - (o.suivi.activite ?? 0) >= 2000) break
    await o.page.waitForTimeout(250)
  }
  if (!etat?.bandeau?.data?.prixHt) throw new Error(`aucun prix au bandeau en ${DELAI_MS / 1000} s`)
  await o.page.waitForTimeout(1500) // le canvas finit sa dernière image
  return o.cadre.evaluate(LIRE_ETAT)
}

/** un clic sur « Add to cart » dans l'iframe → le message reçu par le parent (et le temps du clic au message) */
async function cliquerPanier (o) {
  const avant = await o.page.evaluate(() => window.__recus.length)
  const t0 = Date.now()
  await o.cadre.getByRole('button', { name: 'Add to cart' }).click()
  while (Date.now() - t0 < 30_000) {
    const n = await o.page.evaluate(() => window.__recus.length)
    if (n > avant) break
    await o.page.waitForTimeout(50)
  }
  const recu = await o.page.evaluate((i) => {
    const r = window.__recus.slice(i).find((x) => x.data && x.data.action === 'addToCart')
    return r ? { origine: r.origine, recuA: r.recuA, data: r.data } : null
  }, avant)
  if (!recu) throw new Error('aucun message addToCart reçu par le parent en 30 s')
  return { ...recu, ms: recu.recuA - t0 }
}

async function garderImage (page, dossier, nom, image) {
  if (!image.present || !image.buffer) return null
  const ext = image.mime === 'image/jpeg' ? 'jpg' : 'png'
  await writeFile(join(dossier, `${nom}.${ext}`), image.buffer)
  // le même cadre en JPEG q85, à la même définition : ce qu'un JPEG ferait gagner, sans rien changer d'autre
  const jpeg = decrireImage(await page.evaluate(REENCODER, { dataUrl: `data:${image.mime};base64,${image.buffer.toString('base64')}`, largeur: null, qualite: 0.85 }))
  await writeFile(join(dossier, `${nom}_q85.jpg`), jpeg.buffer)
  return { fichier: `${nom}.${ext}`, jpegQ85: { fichier: `${nom}_q85.jpg`, octets: jpeg.octets, caracteres: jpeg.caracteres } }
}

/** la prise S16 de la chaîne, semée par le `form` de la charge : PNG 1 920 × 1 080, JPEG q85 à 1 920 et 1 280 */
async function priseS16 (contexte, cas, form, dossier) {
  const params = new URLSearchParams({ banc: '1', capture: '1', prise: 'S16', rendu: encoderRendu({ mode: 'realiste', dpr: 1 }) })
  for (const [k, v] of Object.entries(form ?? {})) if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  const url = `${BASE}/shape/${cas.forme}?${params}`
  const page = await contexte.newPage()
  try {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const debut = Date.now()
    await page.goto(url, { waitUntil: 'load', timeout: DELAI_MS })
    await page.waitForFunction(() => (window.__oaks?.version ?? 0) >= 2, null, { timeout: DELAI_MS })
    let etat = null
    while (Date.now() - debut < DELAI_MS) {
      etat = await page.evaluate(() => window.__oaks.etat())
      if (etat.stable && (etat.prise === 'posée' || String(etat.prise ?? '').startsWith('impossible'))) break
      await page.waitForTimeout(250)
    }
    if (!etat?.stable) throw new Error(`S16 jamais stable — ${etat?.attente ?? '?'}`)
    const fiche = await page.evaluate(() => window.__oaks.fiche())
    const png = decrireImage(await page.evaluate(() => window.__oaks.capture()))
    await writeFile(join(dossier, 'S16.png'), png.buffer)
    const pngUrl = `data:image/png;base64,${png.buffer.toString('base64')}`
    const j1920 = decrireImage(await page.evaluate(REENCODER, { dataUrl: pngUrl, largeur: 1920, qualite: 0.85 }))
    const j1280 = decrireImage(await page.evaluate(REENCODER, { dataUrl: pngUrl, largeur: 1280, qualite: 0.85 }))
    await writeFile(join(dossier, 'S16_1920_q85.jpg'), j1920.buffer)
    await writeFile(join(dossier, 'S16_1280_q85.jpg'), j1280.buffer)
    // le rejeu : la configuration que la page S16 a posée, contre le `form` de la charge
    const valeurs = fiche?.valeurs ?? {}
    const ecarts = Object.keys(form ?? {}).filter((k) => String(valeurs[k] ?? '') !== String(form[k] ?? ''))
    return {
      url: url.length > 300 ? `${url.slice(0, 300)}… (${url.length} caractères)` : url,
      secondes: Math.round((Date.now() - debut) / 100) / 10,
      prise: etat.prise,
      camera: fiche?.prise?.camera ? { position: fiche.prise.camera.position, cible: fiche.prise.camera.cible, fov: fiche.prise.camera.fov } : null,
      rejeu: { champs: Object.keys(form ?? {}).length, ecarts: ecarts.length, exemples: ecarts.slice(0, 8).map((k) => [k, form[k], valeurs[k] ?? null]) },
      png: { fichier: 'S16.png', largeur: png.largeur, hauteur: png.hauteur, octets: png.octets, caracteres: png.caracteres },
      jpeg1920: { fichier: 'S16_1920_q85.jpg', largeur: j1920.largeur, hauteur: j1920.hauteur, octets: j1920.octets, caracteres: j1920.caracteres },
      jpeg1280: { fichier: 'S16_1280_q85.jpg', largeur: j1280.largeur, hauteur: j1280.hauteur, octets: j1280.octets, caracteres: j1280.caracteres }
    }
  } finally {
    await page.close().catch(() => {})
  }
}

async function main () {
  await mkdir(OUT, { recursive: true })
  const resolution = await resoudrePublic(lireOptionResolveur(args.resolveur))
  console.log(`→ résolveur : ${resumeResolution(resolution)}`)
  if (resolution.echecs.length) {
    console.error(`ARRÊT — aucune adresse publique pour ${resolution.echecs.join(', ')} (--resolveur=aucun pour le DNS du poste)`)
    process.exit(2)
  }
  // la page « site » : un serveur de l'outil, fermé à la fin (jamais laissé ouvert)
  const serveur = createServer((req, res) => {
    const src = new URL(req.url, 'http://127.0.0.1').searchParams.get('src') ?? ''
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    res.end(pageSite(src))
  })
  await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok))
  const parent = `http://127.0.0.1:${serveur.address().port}/site`
  const sortie = { quand: heureLocale(), base: BASE, parent, build: BUILD, taxe: { pays: PAYS, tva: Number(TVA) }, resolveur: resumeResolution(resolution), bornes: { configJson: BORNE_CONFIG_JSON, imageBase64: BORNE_IMAGE }, resultats: [] }
  let echecs = 0
  for (const nomAppareil of APPAREILS) {
    const appareil = TOUS_APPAREILS[nomAppareil]
    const options = { viewport: appareil.viewport, deviceScaleFactor: appareil.deviceScaleFactor, isMobile: appareil.isMobile, hasTouch: appareil.hasTouch }
    const contexte = await lancerChrome({
      profil: profilDesArguments(args),
      channel: String(args.navigateur ?? 'chrome'),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--hide-scrollbars', ...argumentsChrome(resolution)],
      ...options
    })
    try {
      for (const idCas of CAS) {
        const cas = { id: idCas, ...TOUS[idCas] }
        const nom = `${idCas}_${nomAppareil}`
        const dossier = join(OUT, nom)
        await mkdir(dossier, { recursive: true })
        process.stdout.write(`→ ${nom.padEnd(18)} … `)
        const r = { cas: idCas, titre: cas.titre, appareil: nomAppareil, fenetre: appareil.viewport, densiteEcran: appareil.deviceScaleFactor, densitePosee: appareil.dpr }
        let o = null
        try {
          o = await ouvrir(contexte, cas, appareil, parent)
          r.src = o.src
          r.secondes = o.secondes
          r.etat = o.etat
          await o.page.screenshot({ path: join(dossier, 'page.jpg'), type: 'jpeg', quality: 80 })
          const recu = await cliquerPanier(o)
          const image = decrireImage(recu.data.image)
          const fichierImage = await garderImage(o.page, dossier, 'image', image)
          const xml = recu.data.xmlFile?.content
          if (typeof xml === 'string') await writeFile(join(dossier, 'charge.xml'), xml)
          const lisible = chargeLisible(recu.data, { image: fichierImage?.fichier ?? '—', xml: 'charge.xml' })
          await writeFile(join(dossier, 'charge.json'), JSON.stringify(lisible, null, 1))
          const api = [...o.suivi.prix].reverse().find((x) => x && typeof x.totalPrice === 'number') ?? null
          r.message = { origine: recu.origine, msClicMessage: recu.ms }
          r.poids = peser(recu.data)
          r.image = { ...Object.fromEntries(Object.entries(image).filter(([k]) => k !== 'buffer')), ...fichierImage }
          r.image.canvasEgal = image.largeur === o.etat.canvas?.largeur && image.hauteur === o.etat.canvas?.hauteur
          r.image.jpegPasserait = fichierImage ? {
            configJson: r.poids.configJson.sansImage + fichierImage.jpegQ85.caracteres + 2 <= BORNE_CONFIG_JSON,
            imageBase64: fichierImage.jpegQ85.caracteres <= BORNE_IMAGE
          } : null
          r.api = api && { totalPrice: api.totalPrice, details: api.details ?? null, prices: api.prices ?? null, reponses: o.suivi.prix.length }
          r.produit = o.suivi.produit ? { arbre: sha12(o.suivi.produit.form), forme: sha12Canonique(o.suivi.produit.shape), formeBrute: sha12(o.suivi.produit.shape) } : null
          r.recoupement = recouper(recu.data, { api, produit: o.suivi.produit, taxe: { pays: PAYS, tva: Number(TVA) } })
          r.echouees = o.suivi.echouees.length
          r.erreurs = o.suivi.erreurs.slice(0, 6)
          // la caméra du moment : tourner la vue à la souris, recliquer
          if (args.orbite && nomAppareil === 'bureau') {
            const boite = await o.cadre.locator('canvas').first().boundingBox()
            const x = boite.x + boite.width / 2
            const y = boite.y + boite.height / 2
            await o.page.mouse.move(x, y)
            await o.page.mouse.down()
            await o.page.mouse.move(x + boite.width * 0.3, y - boite.height * 0.08, { steps: 16 })
            await o.page.mouse.up()
            await o.page.waitForTimeout(2500)
            await o.page.screenshot({ path: join(dossier, 'page_orbite.jpg'), type: 'jpeg', quality: 80 })
            const second = await cliquerPanier(o)
            const image2 = decrireImage(second.data.image)
            const f2 = await garderImage(o.page, dossier, 'image_orbite', image2)
            r.orbite = { image: { ...Object.fromEntries(Object.entries(image2).filter(([k]) => k !== 'buffer')), ...f2 }, differente: image2.sha12 !== image.sha12, formInchange: JSON.stringify(second.data.form) === JSON.stringify(recu.data.form), xmlInchange: second.data.xmlFile?.content?.replace(/\d{13}/g, '') === recu.data.xmlFile?.content?.replace(/\d{13}/g, '') }
          }
          // un changement du formulaire, un clic AUSSITÔT (le prix de cette configuration n'est pas encore rendu), puis un clic une fois rendu
          if (args.recalcul && nomAppareil === 'bureau') {
            const nPrix = o.suivi.prix.length
            await o.cadre.getByText(/^free standing$/i).first().click()
            const pendant = await cliquerPanier(o)
            await attendrePrete(o)
            const apres = await cliquerPanier(o)
            const apiApres = [...o.suivi.prix].reverse().find((x) => x && typeof x.totalPrice === 'number') ?? null
            r.recalcul = {
              geste: 'Installation type → FREE STANDING, puis Add to cart aussitôt',
              pendant: { totalPrice: pendant.data.totalPrice, details: pendant.data.details ?? null, formChange: JSON.stringify(pendant.data.form) !== JSON.stringify(recu.data.form), reponsesAvant: nPrix },
              apres: { totalPrice: apres.data.totalPrice, api: apiApres?.totalPrice ?? null, details: JSON.stringify(apres.data.details ?? null) === JSON.stringify(apiApres?.details ?? null), reponses: o.suivi.prix.length }
            }
            r.recalcul.conforme = 'totalPrice' in pendant.data ? pendant.data.totalPrice === null && pendant.data.details === null && apres.data.totalPrice === (apiApres?.totalPrice ?? NaN) && r.recalcul.apres.details && r.recalcul.apres.totalPrice !== recu.data.totalPrice : null
          }
          if (args.s16 && nomAppareil === 'bureau') r.s16 = await priseS16(contexte, cas, recu.data.form, dossier)
          const verdict = `${r.image.largeur}×${r.image.hauteur} ${r.image.mime} ${ko(r.image.octets)} · config_json ${ko(r.poids.configJson.octets)} ${r.poids.configJson.passe ? '≤' : '>'} 512 Kio · image ${r.poids.imageBase64.passe ? '≤' : '>'} 2 Mio`
          console.log(`${o.secondes}s · ${o.etat.bandeau.montant} · ${verdict} · clic→message ${recu.ms} ms${r.recoupement.presents ? ` · ajoutés ${r.recoupement.conforme ? 'CONFORMES' : 'ÉCART'}` : ' · champs ajoutés absents (build d’avant)'}${r.orbite ? ` · orbite : image ${r.orbite.differente ? 'DIFFÉRENTE' : 'identique'}` : ''}${r.s16 ? ` · S16 ${ko(r.s16.jpeg1920.octets)} (1920) / ${ko(r.s16.jpeg1280.octets)} (1280), rejeu ${r.s16.rejeu.ecarts} écart(s)` : ''}`)
          if (r.recalcul) console.log(`   recalcul : pendant → totalPrice ${r.recalcul.pendant.totalPrice}, details ${JSON.stringify(r.recalcul.pendant.details)} ; après → ${r.recalcul.apres.totalPrice} (API ${r.recalcul.apres.api}) · ${r.recalcul.conforme === null ? 'build d’avant' : r.recalcul.conforme ? 'CONFORME' : 'ÉCART'}`)
          if (r.recoupement.presents && !r.recoupement.conforme) echecs++
          if (r.recalcul?.conforme === false) echecs++
        } catch (e) {
          r.echec = String(e?.message ?? e)
          echecs++
          console.log(`ÉCHEC — ${r.echec}`)
        } finally {
          await o?.page.close().catch(() => {})
        }
        sortie.resultats.push(r)
      }
    } finally {
      await contexte.close().catch(() => {})
    }
  }
  serveur.close()
  await writeFile(join(OUT, 'panier.json'), JSON.stringify(sortie, null, 1))
  console.log(`\n${echecs ? `${echecs} écart(s) ou échec(s)` : 'rien à redire'} — ${join(OUT, 'panier.json')}`)
  return echecs
}

main()
  .then((n) => process.exit(n ? 1 : 0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
