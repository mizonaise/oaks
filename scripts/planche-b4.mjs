#!/usr/bin/env node
/**
 * La PLANCHE avant / après de B4 (d5, 22/09) : pour chaque forme et chaque largeur, la capture de la page AVANT (la pièce d'aujourd'hui)
 * à côté de la capture APRÈS (la pièce à rampant, les poignées), avec ce que chaque journal dit (adresse ouverte, prix, pièces, poignées) ;
 * et, par forme, les stations S16 (16:9) et S11 (1:1) avant / après avec la caméra effective. Une page HTML rendue en PNG par le Chrome du
 * poste, sans fenêtre, profil fixe de `navigateur.mjs`. Rien n'est inventé : chaque légende vient d'un journal ou d'une fiche écrits par les outils de mesure.
 *
 *   node scripts/planche-b4.mjs [--dossier=docs/releves/2026-09-22_b4] [--formes=hex-gauche,hex-deux,hex2,f] [--largeurs=1680,1280]
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  }),
)
const DOSSIER = resolve(String(args.dossier ?? 'docs/releves/2026-09-22_b4'))
const FORMES = String(args.formes ?? 'hex-gauche,hex-deux,hex2,f').split(',').map((s) => s.trim()).filter(Boolean)
const LARGEURS = String(args.largeurs ?? '1680,1280').split(',').map((s) => Number(s.trim())).filter(Boolean)
const TITRES = { 'hex-gauche': 'HEX — pente gauche (formulaire par défaut)', 'hex-deux': 'HEX — pente des deux côtés (ZH_SLOPE_TYPE=BOTH)', hex2: 'HEX 2 — pente arrière (formulaire par défaut)', f: 'OS_SHAPE_F — forme de production, témoin (aucun rampant attendu)' }

const echapper = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const existe = async (p) => access(p).then(() => true, () => false)
const lireJson = async (p) => ((await existe(p)) ? JSON.parse(await readFile(p, 'utf8')) : null)

/** la légende d'une capture de page : ce que le journal de preuve-fox-cad.mjs dit */
const legendePage = (j) => {
  if (!j) return 'journal absent'
  const a = j.foxcad?.attributs ?? {}
  const poignees = a.foxcadPoigneesGlb !== undefined ? ` · poignées ${a.foxcadPoigneesGlb} GLB / ${a.foxcadPoigneesPastille} pastille(s)` : ''
  const fox = j.foxcad ? `fox-cad ${j.foxcad.etat} · ${a.foxcadPositions ?? '?'} positions · ${a.foxcadPieces ?? '?'} pièces · ${a.foxcadManques ?? '?'} manque(s)${poignees}` : 'sans fox-cad'
  return `${j.quand} · ${j.url}<br>prix ${j.prix ?? 'AUCUN'} · ${fox} · canvas ${j.canvas?.ok ? 'dessiné' : 'VIDE'} · console ${j.erreursConsole?.length ?? 0} message(s)`
}

/** la légende d'une station : la caméra effective de la fiche du pipeline */
const legendeStation = (fiche, id) => {
  const p = (fiche?.prises ?? []).find((x) => x.id === id)
  if (!p) return 'prise absente'
  const c = p.camera
  if (!c || c.faisable === false) return `${id} : ${p.statut ?? '?'} — ${echapper(p.raison ?? c?.raison ?? '')}`
  const sc = fiche.scene ?? {}
  const rampants = (sc.rampants ?? []).map((r) => `${r.cote} ${r.angle_deg}° (mur ${Math.round(r.bas_m * 1000)} mm, projection ${Math.round(r.projection_m * 1000)} mm)`).join(' ; ')
  return `${id} : ${c.focale_eq_mm} mm · ${c.distance_m} m · œil ${c.hauteur_m} m · décentrement ${c.decentrement.map((x) => x.toFixed(2)).join(' / ')}<br>pièce ${sc.piece?.largeur_m} × ${sc.piece?.profondeur_m} × ${sc.piece?.hauteur_m} m, plafond min ${sc.piece?.plafond_min_m ?? sc.piece?.hauteur_m} m · fenêtre ${sc.fenetre?.cote ?? '?'}${rampants ? `<br>rampants : ${rampants}` : '<br>aucun rampant'}<br>${(c.notes ?? []).map(echapper).join(' · ')}<br>poignées mesurées : ${fiche.mesures?.poignees?.length ?? '?'} · façades : ${fiche.mesures?.facades?.length ?? '?'}`
}

async function main () {
  const sortie = resolve(DOSSIER, 'planches')
  await mkdir(sortie, { recursive: true })
  const contexte = await lancerChrome({ profil: profilDesArguments(args), channel: 'chrome', args: ['--hide-scrollbars'], viewport: { width: 2400, height: 1200 } })
  const faites = []
  try {
    const page = await contexte.newPage()
    const rendre = async (nom, titre, corps) => {
      const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${echapper(titre)}</title>
<style>
  body{margin:0;background:#F6F5F0;color:#2B2B2B;font:15px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:24px;width:2352px}
  h1{font-size:22px;margin:0 0 4px} .sous{color:#555;margin:0 0 16px}
  .deux{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  figure{margin:0;background:#fff;border:1px solid #DDD8CC;border-radius:6px;padding:10px}
  figure img{width:100%;height:auto;display:block;border:1px solid #E5E1D6}
  figcaption{margin-top:8px;font-size:13px;color:#333} figcaption b{font-size:15px;display:block;margin-bottom:4px}
  .vide{height:300px;display:flex;align-items:center;justify-content:center;color:#A33;background:#FBEFEF}
</style></head><body><h1>${echapper(titre)}</h1><p class="sous">B4 — la pièce à rampant, les stations, les poignées (d5, ${new Date().toISOString().slice(0, 10)}) · à gauche AVANT (commit A : la pièce d'aujourd'hui), à droite APRÈS (B4)</p>${corps}</body></html>`
      const fichier = resolve(sortie, `${nom}.html`)
      await writeFile(fichier, html, 'utf8')
      await page.goto(pathToFileURL(fichier).href, { waitUntil: 'load' })
      await page.waitForTimeout(500)
      const png = resolve(sortie, `${nom}.png`)
      await page.screenshot({ path: png, fullPage: true })
      faites.push(png)
      console.log(`→ ${png}`)
    }
    const figure = async (src, legende) => {
      const ok = await existe(src)
      return `<figure>${ok ? `<img src="${pathToFileURL(src).href}">` : '<div class="vide">capture absente</div>'}<figcaption>${legende}</figcaption></figure>`
    }
    for (const forme of FORMES) {
      for (const largeur of LARGEURS) {
        const av = resolve(DOSSIER, 'avant', `${forme}_${largeur}.png`)
        const ap = resolve(DOSSIER, 'apres', `${forme}_${largeur}.png`)
        // le journal porte la dernière largeur mesurée sous ce nom : on le lit s'il correspond, sinon on le dit
        const jAv = await lireJson(resolve(DOSSIER, 'avant', `${forme}_${largeur}.json`)) ?? (await lireJson(resolve(DOSSIER, 'avant', `${forme}.json`)))
        const jAp = await lireJson(resolve(DOSSIER, 'apres', `${forme}_${largeur}.json`)) ?? (await lireJson(resolve(DOSSIER, 'apres', `${forme}.json`)))
        const note = (j) => (j && j.largeur !== largeur ? ` (journal de la mesure à ${j.largeur} px : même adresse)` : '')
        const corps = `<div class="deux">${await figure(av, `<b>AVANT — ${largeur} px${note(jAv)}</b>${legendePage(jAv)}`)}${await figure(ap, `<b>APRÈS — ${largeur} px${note(jAp)}</b>${legendePage(jAp)}`)}</div>`
        await rendre(`${forme}_${largeur}`, `${TITRES[forme] ?? forme} — page entière à ${largeur} px`, corps)
      }
      if (forme === 'f') continue
      const dAv = resolve(DOSSIER, 'avant', `stations-${forme}`)
      const dAp = resolve(DOSSIER, 'apres', `stations-${forme}`)
      const fAv = await lireJson(resolve(dAv, 'fiche.json'))
      const fAp = await lireJson(resolve(dAp, 'fiche.json'))
      let corps = ''
      for (const id of ['S16', 'S11']) {
        corps += `<div class="deux" style="margin-bottom:20px">${await figure(resolve(dAv, `${id}_client.png`), `<b>AVANT — ${id}</b>${legendeStation(fAv, id)}`)}${await figure(resolve(dAp, `${id}_client.png`), `<b>APRÈS — ${id}</b>${legendeStation(fAp, id)}`)}</div>`
      }
      await rendre(`stations-${forme}`, `${TITRES[forme] ?? forme} — stations S16 (16:9) et S11 (1:1), mode client`, corps)
    }
  } finally {
    await contexte.close()
  }
  console.log(`${faites.length} planche(s) dans ${sortie}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
