#!/usr/bin/env node
/**
 * LA PREUVE DU PRIX TTC (décision A de Dorian, 24/09 10:1x ; ligne du lead à d10 ; la spéc : oaksome-stack `produits/hex/releves/2026-09-24_
 * prix-ttc-decision-A-contrat-site-configurateur.md`). Pour chaque cas — un template du site, ouvert par l'adresse EXACTE que le site donne à
 * son iframe (`/shape/<forme>?id=<template>[&pays=…&tva=…]`, sans `banc` ni `capture`) — et chaque variante de taxe (sans paramètre, 6 %, 21 %) :
 *
 *  1. le bandeau : le TTC affiché, son étiquette, ses `data-*` (HT, TTC, taux, pays, origine), contre la réponse de l'API relevée en route
 *     (`/api/shape/pricing/…` : `totalPrice`, `details`, `prices`) recalculée ici par `src/lib/prix/taxe.ts` ;
 *  2. l'écran « Détail du prix » ouvert par le Question Box : chaque ligne contre `details` × le même facteur, le Total contre le bandeau,
 *     la somme des lignes dite (l'API somme des lignes arrondies dans `details`, la somme brute dans `totalPrice`) ;
 *  3. une fois par cas, `addToCart` : les clés du message posté au site (aucun prix n'y entre, rien n'a changé) ;
 *
 * les captures (JPEG de la fenêtre : le bandeau, puis l'écran ouvert ; `--mobile` : le bandeau à 390 px) et `prix.json`. Chrome sur le
 * profil fixe (`navigateur.mjs`), le média par son adresse publique (`resolveur-public.mjs`).
 *
 *   node scripts/capture-prix.mjs [--base=http://localhost:3027] [--out=C:/Users/dorian/scripts/_out/d10-prix-ttc/captures]
 *        [--cas=F-01,HEX-01] [--largeur=1440] [--hauteur=900] [--mobile] [--build=<commit>] [--resolveur=public|aucun|hôte[=ip]]
 *        [--profil-chrome=d10] [--delai=120000]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'
import { argumentsChrome, lireOptionResolveur, resoudrePublic, resumeResolution } from './resolveur-public.mjs'
import { etiquetteTaxe, htDeLaReponse, lignesDuDetail, sommeDesLignes, ttc } from '../src/lib/prix/taxe.ts'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  })
)
const BASE = String(args.base ?? 'http://localhost:3027').replace(/\/$/, '')
const OUT = resolve(String(args.out ?? 'C:/Users/dorian/scripts/_out/d10-prix-ttc/captures'))
const LARGEUR = Number(args.largeur ?? 1440)
const HAUTEUR = Number(args.hauteur ?? 900)
const DELAI_MS = Number(args.delai ?? 120_000)
const BUILD = args.build ? String(args.build) : null

/** les cas : les cartes du site (templates écrits par le lead le 24/09, `products-config` = le form du board, 0 écart relu à 10:4x) */
const TOUS = {
  'F-01': { forme: 'OS_SHAPE_F', template: '1275000', titre: 'F 2,4 m × 2,5 m, 4 colonnes — la carte « Shape F »' },
  'HEX-01': { forme: 'OS_SHAPE_HEX', template: '1275457', titre: 'HEX pente gauche 1 500 / 1 500, 3 m, 5 colonnes — la carte « Placard sous pente »' }
}
const CAS = (args.cas ? String(args.cas).split(',').map((s) => s.trim()) : Object.keys(TOUS)).filter((id) => TOUS[id])
/** les variantes : l'adresse du site (le contrat : `pays` + `tva`) ou rien (lien direct) ; l'attendu du bandeau */
const VARIANTES = [
  { id: 'sans', params: {}, attendu: { pays: 'BE', tva: 21, taxe: 'defaut/defaut' } },
  { id: 'tva6', params: { pays: 'BE', tva: '6' }, attendu: { pays: 'BE', tva: 6, taxe: 'adresse/adresse' } },
  { id: 'tva21', params: { pays: 'BE', tva: '21' }, attendu: { pays: 'BE', tva: 21, taxe: 'adresse/adresse' } }
]
/** les clés du message `addToCart` avant la décision A (ShapeConfigurator, `buildMessagePayload`) : aucune ne doit bouger */
const CLES_ADD_TO_CART = ['action', 'name', 'pricing', 'form', 'description', 'shape', 'xmlFile', 'image']

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const espaces = (s) => String(s ?? '').replace(/[\s\u00a0\u202f]+/g, ' ').trim()
const heureLocale = () => new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' })

/** le bandeau VISIBLE (la page en a deux : mobile et desktop, l'un caché selon la largeur) */
const LIRE_BANDEAU = () => {
  const visibles = [...document.querySelectorAll('header.k-prix')].filter((e) => e.getClientRects().length > 0)
  const e = visibles[0]
  if (!e) return null
  return {
    montant: e.querySelector('.k-prix-val .k-cap')?.textContent ?? null,
    etiquette: e.querySelector('.k-tag-xxs')?.textContent ?? null,
    question: Boolean(e.querySelector('button.k-qbox')),
    spinner: Boolean(e.querySelector('[aria-label="Updating price"]')),
    data: { ...e.dataset },
    bandeaux: document.querySelectorAll('header.k-prix').length
  }
}

/** l'écran « Détail du prix » ouvert */
const LIRE_DETAIL = () => {
  const s = [...document.querySelectorAll('section[data-somme-lignes]')].find((e) => e.getClientRects().length > 0)
  if (!s) return null
  return {
    titre: s.querySelector('.k-titre-m span')?.textContent ?? null,
    lignes: [...s.querySelectorAll('.k-ligne[data-ttc]')].map((l) => ({
      nom: l.querySelector('.k-ligne-nom')?.textContent ?? null,
      texte: l.querySelector('.k-ligne-prix')?.textContent ?? null,
      ht: Number(l.dataset.ht),
      ttc: Number(l.dataset.ttc)
    })),
    total: s.querySelector('.k-ligne--total .k-ligne-prix')?.textContent ?? null,
    etiquette: s.querySelector('.k-ligne--total .k-tag-xxs')?.textContent ?? null,
    data: { ...s.dataset }
  }
}

/** ouvre l'adresse, relève les réponses de prix, attend : un prix au bandeau, sans spinner, aucune requête en vol — tenu 2 s */
async function ouvrir (contexte, url, fenetre) {
  const page = await contexte.newPage()
  await page.setViewportSize(fenetre)
  const suivi = { reponses: [], echouees: [], erreurs: [] }
  // le calme = aucune requête commencée ni finie depuis 2 s (pas « zéro en vol » : une requête qui ne finit jamais tenait la page 120 s,
  // mesuré au premier passage) ; celles encore en vol sont notées
  const enVol = new Map()
  let activite = Date.now()
  page.on('request', (req) => {
    enVol.set(req, Date.now())
    activite = Date.now()
  })
  page.on('requestfinished', async (req) => {
    enVol.delete(req)
    activite = Date.now()
    if (!/\/api\/shape\/pricing\//.test(req.url()) || req.method() !== 'POST') return
    try {
      const r = await req.response()
      suivi.reponses.push({ statut: r?.status() ?? null, corps: r ? await r.json() : null })
    } catch (e) {
      suivi.reponses.push({ erreur: String(e?.message ?? e) })
    }
  })
  page.on('requestfailed', (req) => {
    enVol.delete(req)
    activite = Date.now()
    suivi.echouees.push({ erreur: req.failure()?.errorText ?? '?', url: req.url().slice(0, 160) })
  })
  page.on('pageerror', (e) => suivi.erreurs.push(`page : ${e.message.slice(0, 200)}`))
  const debut = Date.now()
  await page.goto(url, { waitUntil: 'load', timeout: DELAI_MS })
  let bandeau = null
  while (Date.now() - debut < DELAI_MS) {
    bandeau = await page.evaluate(LIRE_BANDEAU)
    if (bandeau?.data?.prixTtc && !bandeau.spinner && Date.now() - activite >= 2000) break
    await page.waitForTimeout(250)
  }
  if (!bandeau?.data?.prixTtc) throw new Error(`aucun prix au bandeau en ${DELAI_MS / 1000} s`)
  suivi.enVol = [...enVol].map(([req, t]) => ({ url: req.url().slice(0, 160), type: req.resourceType(), depuis: Math.round((Date.now() - t) / 100) / 10 }))
  await page.waitForTimeout(1500) // le canvas finit sa dernière image
  return { page, suivi, secondes: Math.round((Date.now() - debut) / 100) / 10 }
}

/** ce que la page dit, contre l'API recalculée par `taxe.ts` */
function verifier (v, api, bandeau, detail) {
  const ht = htDeLaReponse(api)
  const attenduTtc = ttc(ht, v.attendu.tva)
  const attendues = lignesDuDetail(api.details, v.attendu.tva)
  const somme = detail ? sommeDesLignes(detail.lignes) : null
  return {
    ht,
    bandeau: Number(bandeau.data.prixTtc) === attenduTtc && espaces(bandeau.montant) === espaces(euro.format(attenduTtc)),
    etiquette: bandeau.etiquette === etiquetteTaxe(v.attendu.tva),
    taxe: Number(bandeau.data.tva) === v.attendu.tva && bandeau.data.pays === v.attendu.pays && bandeau.data.taxe === v.attendu.taxe,
    htAuBandeau: Number(bandeau.data.prixHt) === ht,
    question: bandeau.question === attendues.length > 0,
    lignes: detail
      ? JSON.stringify(detail.lignes.map((l) => [espaces(l.nom), l.ttc, espaces(l.texte)])) ===
        JSON.stringify(attendues.map((l) => [espaces(l.nom), l.ttc, espaces(euro.format(l.ttc))]))
      : attendues.length === 0,
    totalEgalBandeau: detail ? espaces(detail.total) === espaces(bandeau.montant) : null,
    etiquetteDetail: detail ? detail.etiquette === etiquetteTaxe(v.attendu.tva) : null,
    attenduTtc,
    sommeLignes: somme,
    ecartSommeBandeau: somme === null ? null : Math.round((somme - attenduTtc) * 100) / 100,
    sommeDetailsHt: api.details ? Object.values(api.details).reduce((s, x) => s + (typeof x === 'number' ? Math.round(x * 100) : 0), 0) / 100 : null
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
  const contexte = await lancerChrome({
    profil: profilDesArguments(args),
    channel: String(args.navigateur ?? 'chrome'),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--hide-scrollbars', ...argumentsChrome(resolution)]
  })
  const sortie = { quand: heureLocale(), base: BASE, build: BUILD, fenetre: { largeur: LARGEUR, hauteur: HAUTEUR }, resolveur: resumeResolution(resolution), cas: [] }
  let echecs = 0
  try {
    for (const id of CAS) {
      const c = TOUS[id]
      const cas = { id, ...c, variantes: [] }
      for (const v of VARIANTES) {
        const url = `${BASE}/shape/${c.forme}?${new URLSearchParams({ id: c.template, ...v.params })}`
        const nom = `${id}_${v.id}`
        process.stdout.write(`→ ${nom.padEnd(12)} … `)
        let o = null
        const r = { variante: v.id, url, attendu: v.attendu }
        try {
          o = await ouvrir(contexte, url, { width: LARGEUR, height: HAUTEUR })
          const bandeau = await o.page.evaluate(LIRE_BANDEAU)
          await o.page.screenshot({ path: join(OUT, `${nom}_bandeau.jpg`), type: 'jpeg', quality: 85 })
          let detail = null
          if (bandeau.question) {
            await o.page.locator('button.k-qbox:visible').first().click()
            await o.page.waitForSelector('section[data-somme-lignes]', { state: 'visible', timeout: 10_000 })
            await o.page.waitForTimeout(600)
            detail = await o.page.evaluate(LIRE_DETAIL)
            await o.page.screenshot({ path: join(OUT, `${nom}_detail.jpg`), type: 'jpeg', quality: 85 })
          }
          const derniere = [...o.suivi.reponses].reverse().find((x) => x.corps && typeof x.corps.totalPrice === 'number')
          if (!derniere) throw new Error('aucune réponse de prix relevée')
          const api = derniere.corps
          r.api = {
            reponses: o.suivi.reponses.length,
            totalPrice: api.totalPrice,
            details: api.details ?? null,
            prices: api.prices ?? null,
            tva: api.tva ?? null,
            promotion: api.promotion ?? null,
            descriptorTotals: 'descriptorTotals' in api,
            breakdown: Array.isArray(api.breakdown) ? api.breakdown.length : null
          }
          r.bandeau = { ...bandeau, montant: espaces(bandeau.montant), etiquette: espaces(bandeau.etiquette) }
          r.detail = detail && { ...detail, total: espaces(detail.total), etiquette: espaces(detail.etiquette), lignes: detail.lignes.map((l) => ({ ...l, nom: espaces(l.nom), texte: espaces(l.texte) })) }
          r.verification = verifier(v, api, bandeau, detail)
          // une fois par cas : le message `addToCart` (ses clés) — posté à window.parent, ici la page elle-même
          if (v.id === 'tva6') {
            await o.page.evaluate(() => {
              window.__messagesD10 = []
              window.addEventListener('message', (e) => window.__messagesD10.push(e.data))
            })
            await o.page.getByRole('button', { name: 'Add to cart' }).click()
            await o.page.waitForTimeout(1500)
            const m = await o.page.evaluate(() => (window.__messagesD10 ?? []).map((d) => ({ cles: Object.keys(d ?? {}), action: d?.action ?? null, pricing: d?.pricing ?? null, champs: d?.form ? Object.keys(d.form).length : null })))
            const a = m.find((x) => x.action === 'addToCart') ?? null
            r.addToCart = a && { ...a, clesInchangees: JSON.stringify(a.cles) === JSON.stringify(CLES_ADD_TO_CART), aucunPrix: !a.cles.some((k) => /prix|price|ttc|tva|total/i.test(k)) }
          }
          r.secondes = o.secondes
          r.enVol = o.suivi.enVol
          r.echouees = o.suivi.echouees.length
          r.erreurs = o.suivi.erreurs.slice(0, 6)
          const ok = Object.entries(r.verification).filter(([k, x]) => typeof x === 'boolean').every(([, x]) => x)
          console.log(`${o.secondes}s · ${r.bandeau.montant} [${r.bandeau.etiquette}] (HT ${r.verification.ht}) · détail ${detail ? `${detail.lignes.length} lignes, somme ${r.verification.sommeLignes} (écart ${r.verification.ecartSommeBandeau})` : 'fermé'}${r.addToCart ? ` · addToCart ${r.addToCart.clesInchangees && r.addToCart.aucunPrix ? 'inchangé' : 'CHANGÉ'}` : ''} · ${ok ? 'CONFORME' : 'ÉCART : ' + Object.entries(r.verification).filter(([, x]) => x === false).map(([k]) => k).join(', ')}`)
          if (!ok) echecs++
        } catch (e) {
          r.echec = String(e?.message ?? e)
          echecs++
          console.log(`ÉCHEC — ${r.echec}`)
        } finally {
          await o?.page.close().catch(() => {})
        }
        cas.variantes.push(r)
      }
      // le bandeau mobile (390 px) : la même étiquette sur le téléphone
      if (args.mobile) {
        const url = `${BASE}/shape/${c.forme}?${new URLSearchParams({ id: c.template, pays: 'BE', tva: '6' })}`
        process.stdout.write(`→ ${`${id}_mobile`.padEnd(12)} … `)
        let o = null
        try {
          o = await ouvrir(contexte, url, { width: 390, height: 844 })
          const bandeau = await o.page.evaluate(LIRE_BANDEAU)
          await o.page.screenshot({ path: join(OUT, `${id}_mobile_tva6.jpg`), type: 'jpeg', quality: 85 })
          cas.mobile = { url, montant: espaces(bandeau.montant), etiquette: espaces(bandeau.etiquette), data: bandeau.data }
          console.log(`${o.secondes}s · ${cas.mobile.montant} [${cas.mobile.etiquette}]`)
        } catch (e) {
          cas.mobile = { url, echec: String(e?.message ?? e) }
          echecs++
          console.log(`ÉCHEC — ${cas.mobile.echec}`)
        } finally {
          await o?.page.close().catch(() => {})
        }
      }
      sortie.cas.push(cas)
    }
  } finally {
    await contexte.close().catch(() => {})
  }
  await writeFile(join(OUT, 'prix.json'), JSON.stringify(sortie, null, 1))
  console.log(`\n${echecs ? `${echecs} écart(s) ou échec(s)` : 'tout conforme'} — ${join(OUT, 'prix.json')}`)
  return echecs
}

main()
  .then((n) => process.exit(n ? 1 : 0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
