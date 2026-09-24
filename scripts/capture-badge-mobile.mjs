#!/usr/bin/env node
/**
 * LE BADGE DE FOX-CAD SUR LE TÉLÉPHONE, EN CAPTURES (ligne du lead à d10 24/09 13:1x : « une question de Dorian en attente sur le badge de
 * diagnostic qui recouvre le prix sur mobile : ne change rien avant son mot, mais prépare les deux variantes — replié sous 640 px ; masqué
 * sauf `?diag=1` — en captures à 390 px pour qu'il choisisse » ; relevé `docs/releves/2026-09-24_badge-mobile/`).
 *
 * Une adresse de la page, ouverte à 390 × 844 (densité 2, tactile), prête : un prix au bandeau sans calcul, le badge de fox-cad posé, aucune
 * requête depuis 2 s. Puis la capture de l'écran et la MESURE : la boîte de la ligne du prix (montant, Question Box, étiquette TTC), celle
 * du badge visible (texte, ou pastille de la variante A : `[data-foxcad-pastille]`), et leur recouvrement en px² — « le badge recouvre-t-il
 * le prix ? » se lit en nombre, pas seulement à l'œil. `--deplier` : un tap sur la pastille, une seconde capture, la même mesure.
 *
 *   node scripts/capture-badge-mobile.mjs --base=http://localhost:3027 --variante=A [--forme=OS_SHAPE_HEX] [--params=pays=BE&tva=6]
 *        [--diag] [--deplier] [--largeur=390] [--hauteur=844] [--out=C:/Users/dorian/scripts/_out/d10-badge] [--profil-chrome=d10]
 *
 * Chrome sur le profil fixe (`navigateur.mjs`), le média par son adresse publique (`resolveur-public.mjs`).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'
import { argumentsChrome, lireOptionResolveur, resoudrePublic, resumeResolution } from './resolveur-public.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  })
)
const BASE = String(args.base ?? 'http://localhost:3027').replace(/\/$/, '')
const VARIANTE = String(args.variante ?? 'actuel')
const FORME = String(args.forme ?? 'OS_SHAPE_HEX')
const PARAMS = new URLSearchParams(String(args.params ?? 'pays=BE&tva=6'))
if (args.diag) PARAMS.set('diag', '1')
const LARGEUR = Number(args.largeur ?? 390)
const HAUTEUR = Number(args.hauteur ?? 844)
const OUT = resolve(String(args.out ?? 'C:/Users/dorian/scripts/_out/d10-badge'))
const DELAI_MS = Number(args.delai ?? 150_000)
const NOM = `${VARIANTE}_${LARGEUR}${args.diag ? '_diag' : ''}`
const heureLocale = () => new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' })

/** les boîtes : la ligne du prix VISIBLE, le badge visible (texte ou pastille), leur recouvrement */
const MESURER = () => {
  const visible = (e) => Boolean(e) && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'
  const boite = (e) => {
    if (!visible(e)) return null
    const r = e.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), l: Math.round(r.width), h: Math.round(r.height) }
  }
  const inter = (a, b) =>
    a && b ? Math.max(0, Math.min(a.x + a.l, b.x + b.l) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)) : 0
  const entete = [...document.querySelectorAll('header.k-prix')].find(visible) ?? null
  const ligne = entete?.querySelector('.k-prix-val') ?? null
  const donnees = document.querySelector('[data-foxcad-etat]')
  // le texte du badge : son bloc à fond arrondi, s'il est visible ; la pastille de la variante A
  const texteVisible = donnees ? [...donnees.querySelectorAll('div.rounded')].find(visible) ?? null : null
  const pastille = document.querySelector('[data-foxcad-pastille]')
  const bPrix = boite(ligne)
  const bTexte = boite(texteVisible)
  const bPastille = boite(pastille)
  return {
    prix: { boite: bPrix, montant: (ligne?.querySelector('.k-cap')?.textContent ?? '').replace(/\s+/g, ' ').trim(), etiquette: ligne?.querySelector('.k-tag-xxs')?.textContent ?? null },
    badge: {
      present: Boolean(donnees),
      etat: donnees?.getAttribute('data-foxcad-etat') ?? null,
      pieces: donnees?.getAttribute('data-foxcad-pieces') ?? null,
      texteDansLaPage: (donnees?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 160),
      texte: bTexte,
      pastille: bPastille && { ...bPastille, libelle: (pastille.textContent ?? '').replace(/\s+/g, ' ').trim(), deplie: pastille.getAttribute('aria-expanded') },
      replie: donnees?.getAttribute('data-foxcad-replie') ?? null,
      diag: donnees?.getAttribute('data-foxcad-diag') ?? null
    },
    recouvrement: { texte: inter(bPrix, bTexte), pastille: inter(bPrix, bPastille), prix: bPrix ? bPrix.l * bPrix.h : null },
    canvas: boite(document.querySelector('canvas'))
  }
}

async function main () {
  await mkdir(OUT, { recursive: true })
  const resolution = await resoudrePublic(lireOptionResolveur(args.resolveur))
  if (resolution.echecs.length) {
    console.error(`ARRÊT — aucune adresse publique pour ${resolution.echecs.join(', ')} (--resolveur=aucun pour le DNS du poste)`)
    process.exit(2)
  }
  const url = `${BASE}/shape/${FORME}?${PARAMS}`
  const contexte = await lancerChrome({
    profil: profilDesArguments(args),
    channel: String(args.navigateur ?? 'chrome'),
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--hide-scrollbars', ...argumentsChrome(resolution)],
    viewport: { width: LARGEUR, height: HAUTEUR },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  })
  const sortie = { nom: NOM, quand: heureLocale(), variante: VARIANTE, url, fenetre: { largeur: LARGEUR, hauteur: HAUTEUR, densite: 2 }, resolveur: resumeResolution(resolution), prises: [] }
  try {
    const page = await contexte.newPage()
    let activite = Date.now()
    page.on('request', () => { activite = Date.now() })
    page.on('requestfinished', () => { activite = Date.now() })
    page.on('requestfailed', () => { activite = Date.now() })
    const debut = Date.now()
    await page.goto(url, { waitUntil: 'load', timeout: DELAI_MS })
    while (Date.now() - debut < DELAI_MS) {
      const e = await page.evaluate(() => {
        const b = [...document.querySelectorAll('header.k-prix')].find((x) => x.getClientRects().length > 0)
        const f = document.querySelector('[data-foxcad-etat]')
        return { prix: b?.dataset.prixHt ?? null, spinner: Boolean(b?.querySelector('[aria-label="Updating price"]')), foxcad: f ? f.getAttribute('data-foxcad-etat') : null }
      })
      if (e.prix && !e.spinner && (e.foxcad === null || e.foxcad === 'ok' || e.foxcad === 'erreur') && Date.now() - activite >= 2000) break
      await page.waitForTimeout(250)
    }
    await page.waitForTimeout(1500)
    const prendre = async (suffixe) => {
      const fichier = `${NOM}${suffixe}.jpg`
      await page.screenshot({ path: join(OUT, fichier), type: 'jpeg', quality: 85 })
      const m = await page.evaluate(MESURER)
      sortie.prises.push({ fichier, ...m })
      const couvre = m.recouvrement.texte + m.recouvrement.pastille
      console.log(`→ ${fichier} · prix « ${m.prix.montant} » [${m.prix.etiquette}] · badge ${m.badge.texte ? `texte ${m.badge.texte.l}×${m.badge.texte.h} en (${m.badge.texte.x}, ${m.badge.texte.y})` : 'texte caché'}${m.badge.pastille ? ` · pastille « ${m.badge.pastille.libelle} » ${m.badge.pastille.l}×${m.badge.pastille.h} en (${m.badge.pastille.x}, ${m.badge.pastille.y})` : ''} · recouvre le prix : ${couvre ? `${couvre} px² sur ${m.recouvrement.prix}` : 'non'}`)
    }
    await prendre('')
    if (args.deplier) {
      const p = page.locator('[data-foxcad-pastille]')
      if (await p.count()) {
        await p.first().tap()
        await page.waitForTimeout(600)
        await prendre('_deplie')
      } else console.log('→ --deplier : aucune pastille dans cette page')
    }
  } finally {
    await contexte.close().catch(() => {})
  }
  const chemin = join(OUT, 'badge.json')
  const avant = await readFile(chemin, 'utf8').then(JSON.parse).catch(() => ({ passes: [] }))
  avant.passes = [...avant.passes.filter((p) => p.nom !== NOM), sortie]
  await writeFile(chemin, JSON.stringify(avant, null, 1))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
