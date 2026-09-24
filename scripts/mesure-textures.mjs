#!/usr/bin/env node
/**
 * LA MESURE DES TEXTURES D'UNE SCÈNE (d5, nuit du 22 au 23/09 — ligne du lead 22:2x : le facteur d'échelle des textures) : une page du
 * configurateur ouverte en mode capture (`?capture=1`, la vue stable de `window.__oaks.ready()`), la scène three.js observée par le crochet
 * `__THREE_DEVTOOLS__` (three.js y annonce chaque Scene et chaque WebGLRenderer à sa construction : rien à changer dans la page), puis chaque
 * maillage relevé : son origine (pièce de fox-cad, panneau CP d'Otman, designer d'Otman, pièce / murs), sa géométrie, sa taille dans le monde
 * (mm), l'étendue de ses UV, et sa texture (fichier, taille en pixels, `repeat`, `wrapS` / `wrapT`, rotation, espace de couleur).
 *
 *   node scripts/mesure-textures.mjs --shape=OS_SHAPE_F [--base=http://localhost:3025] [--largeur=1680] [--hauteur=1050]
 *        [--out=docs/releves/2026-09-23_textures-echelle/avant] [--nom=f] [--query=ZF_FINISH_EXT=…] [--attente=120000]
 *
 * Ce qui est écrit dans `--out` : `<nom>.textures.json` (le relevé complet), `<nom>.textures.tsv` (une ligne par maillage texturé),
 * `<nom>_canvas.png` (le canvas tel que rendu, `window.__oaks.capture()`), `<nom>_page.png` (la page entière). Rien d'autre.
 *
 * La lecture qui compte, pour une texture ÉTIRÉE (UV dans [0, 1] sur chaque face, `repeat` 1) : « mm par tuile » = la taille de la face en mm —
 * deux portes de largeurs différentes montrent le même motif à deux échelles. Pour une texture À L'ÉCHELLE : « mm par tuile » est le même
 * nombre sur toutes les faces (la taille réelle de l'image de la texture, en mm).
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

const SHAPE = String(args.shape ?? 'OS_SHAPE_F')
const BASE = String(args.base ?? 'http://localhost:3025').replace(/\/$/, '')
const LARGEUR = Number(args.largeur ?? 1680)
const HAUTEUR = Number(args.hauteur ?? 1050)
const OUT = resolve(String(args.out ?? 'docs/releves/2026-09-23_textures-echelle/avant'))
const NOM = String(args.nom ?? SHAPE.toLowerCase())
const ATTENTE = Number(args.attente ?? 120_000)
// les champs semés par l'adresse (`--query=ZF_FINISH_EXT=…`) ne sont lus que sous `banc=1` (ShapeConfigurator) ; `panneau=0` = sans le panneau leva
const QUERY = [typeof args.query === 'string' ? args.query : '', typeof args.query === 'string' ? 'banc=1&panneau=0' : '', 'capture=1'].filter(Boolean).join('&')

const heureLocale = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const url = `${BASE}/shape/${encodeURIComponent(SHAPE)}?${QUERY}`
await mkdir(OUT, { recursive: true })

const journal = { quand: heureLocale(), url, largeur: LARGEUR, hauteur: HAUTEUR, erreursConsole: [], reponsesEnEchec: [], texturesChargees: [] }
const contexte = await lancerChrome({
  profil: profilDesArguments(args),
  channel: 'chrome',
  viewport: { width: LARGEUR, height: HAUTEUR },
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--hide-scrollbars'],
})
try {
  // le crochet des outils de développement de three.js : chaque Scene / WebGLRenderer construit s'annonce ici (« observe »)
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
    const u = r.request().url()
    if (r.status() >= 400) journal.reponsesEnEchec.push(`${r.status()} ${u.slice(0, 200)}`)
    if (/\.(jpe?g|png|webp)(\/public)?(\?|$)/i.test(u) || /media\.tecnibo\.com/.test(u)) journal.texturesChargees.push(`${r.status()} ${u.slice(0, 200)}`)
  })

  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: ATTENTE })
  await page.waitForFunction(() => (window.__oaks?.version ?? 0) >= 2, null, { timeout: ATTENTE })
  const stable = await page.evaluate((ms) => window.__oaks.ready(ms), ATTENTE)
  journal.vueStable = stable
  journal.dureeMs = Date.now() - t0
  // les textures qui arrivent après la vue stable (celles du designer d'Otman, chargées hors du gestionnaire de three) : une seconde de plus
  await page.waitForTimeout(1500)
  const etatFoxCad = await page.evaluate(() => {
    const b = document.querySelector('[data-foxcad-etat]')
    return b ? { etat: b.getAttribute('data-foxcad-etat'), pieces: b.getAttribute('data-foxcad-pieces'), positions: b.getAttribute('data-foxcad-positions') } : null
  })
  journal.foxcad = etatFoxCad
  // la ligne « Textures à l'échelle réelle » que la page dit sous la scène (après ② ; absente avant)
  journal.texturesEchelle = await page.evaluate(() => {
    const p = document.querySelector('[data-textures-echelle]')
    return p ? { attribut: p.getAttribute('data-textures-echelle'), maillages: p.getAttribute('data-textures-maillages'), texte: (p.textContent || '').trim().slice(0, 500) } : null
  })

  journal.releve = await page.evaluate(() => {
    const vus = window.__threeObserves ?? []
    const scenes = vus.filter((o) => o && o.isScene)
    const renderers = vus.filter((o) => o && o.isWebGLRenderer)
    const nomWrap = (w) => ({ 1000: 'RepeatWrapping', 1001: 'ClampToEdgeWrapping', 1002: 'MirroredRepeatWrapping' })[w] ?? String(w)
    const nomTexture = (src) => {
      if (!src) return null
      const s = String(src)
      const m = s.match(/IVIS%2F([^/]+)\.jpg/i) ?? s.match(/\/([^/]+\.(?:jpe?g|png|webp))/i)
      return m ? decodeURIComponent(m[1]) : s.slice(-60)
    }
    const chemin = (o) => {
      const noms = []
      for (let p = o.parent; p; p = p.parent) if (p.name) noms.push(p.name)
      return noms.reverse().join(' / ')
    }
    // les ancêtres : le designer d'Otman vit sous un groupe d'échelle 1000 (ArticleInBox : ses unités sont le mètre, la scène tourne en mm × 0,001)
    const ancetres = (o) => {
      const out = []
      for (let p = o.parent; p; p = p.parent) out.push({ type: p.type, nom: p.name || '', echelle: Math.round(p.scale.x * 1e4) / 1e4 })
      return out
    }
    const sousDesigner = (o) => ancetres(o).some((a) => Math.abs(a.echelle - 1000) < 1e-6)
    const maillages = []
    for (const scene of scenes) {
      scene.updateMatrixWorld(true)
      scene.traverse((obj) => {
        if (!obj.isMesh) return
        const geo = obj.geometry
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        // la boîte englobante locale (la géométrie) et l'échelle du monde : la taille réelle en mm de la pièce dessinée
        if (!geo.boundingBox) geo.computeBoundingBox()
        const bb = geo.boundingBox
        const echelle = obj.getWorldScale(new (Object.getPrototypeOf(obj.position).constructor)())
        const tailleLocale = bb ? [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z] : null
        // le monde est en MÈTRES (le groupe de l'unité est à l'échelle 0,001 des mm) : taille réelle en mm = locale × échelle du monde × 1000
        const tailleMonde = tailleLocale ? tailleLocale.map((t, i) => t * [echelle.x, echelle.y, echelle.z][i] * 1000) : null
        const uv = geo.getAttribute('uv')
        let uvEtendue = null
        if (uv) {
          let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
          for (let i = 0; i < uv.count; i++) {
            const u = uv.getX(i), v = uv.getY(i)
            if (u < minU) minU = u
            if (u > maxU) maxU = u
            if (v < minV) minV = v
            if (v > maxV) maxV = v
          }
          uvEtendue = { u: [minU, maxU], v: [minV, maxV], sommets: uv.count }
        }
        const ud = obj.userData ?? {}
        const parents = chemin(obj)
        const origine = ud.foxcad || /fox-cad/.test(parents) ? 'fox-cad' : sousDesigner(obj) ? 'designer-otman' : /Room|Wall|room|wall|sol|floor|plafond/i.test(obj.name + ' ' + parents) ? 'piece' : obj.geometry?.type === 'LineSegmentsGeometry' || (obj.material && !Array.isArray(obj.material) && obj.material.type === 'MeshBasicMaterial') ? 'auxiliaire' : 'cp-otman'
        for (const m of mats) {
          if (!m) continue
          const map = m.map ?? null
          const img = map?.image ?? map?.source?.data ?? null
          maillages.push({
            nom: obj.name || '',
            parents,
            origine,
            definition: ud.definition ?? null,
            materiau: ud.materiau ?? null,
            surface: ud.surface ?? null,
            echelleMm: ud.echelleMm ?? geo.userData?.echelleTextureMm ?? null,
            echelleSource: ud.echelleSource ?? null,
            geometrie: geo.type,
            tailleLocale: tailleLocale?.map((t) => Math.round(t * 100) / 100),
            echelleMonde: [echelle.x, echelle.y, echelle.z].map((e) => Math.round(e * 1e4) / 1e4),
            ancetres: ancetres(obj).slice(0, 6),
            tailleMondeMm: tailleMonde?.map((t) => Math.round(t * 10) / 10),
            uv: uvEtendue,
            materiel: {
              type: m.type,
              couleur: m.color ? '#' + m.color.getHexString() : null,
              opacite: m.opacity,
              transparent: m.transparent,
              roughness: m.roughness,
            },
            texture: map
              ? {
                  fichier: nomTexture(img?.src ?? img?.currentSrc ?? map.source?.data?.src),
                  src: (img?.src ?? '').slice(0, 160),
                  pixels: img ? [img.width ?? img.naturalWidth ?? null, img.height ?? img.naturalHeight ?? null] : null,
                  repeat: [map.repeat.x, map.repeat.y],
                  offset: [map.offset.x, map.offset.y],
                  center: [map.center.x, map.center.y],
                  rotation: map.rotation,
                  wrapS: nomWrap(map.wrapS),
                  wrapT: nomWrap(map.wrapT),
                  colorSpace: map.colorSpace,
                  anisotropy: map.anisotropy,
                }
              : null,
          })
        }
      })
    }
    return { scenes: scenes.length, renderers: renderers.length, maillages }
  })

  // le canvas rendu, tel quel
  const dataUrl = await page.evaluate(() => window.__oaks.capture())
  if (dataUrl) await writeFile(resolve(OUT, `${NOM}_canvas.png`), Buffer.from(dataUrl.split(',')[1], 'base64'))
  await page.screenshot({ path: resolve(OUT, `${NOM}_page.png`), fullPage: false })
} finally {
  await contexte.close()
}

// la synthèse : par origine et par texture, les tailles de faces (mm) sur lesquelles la même image est posée, et le « mm par tuile »
const m = journal.releve?.maillages ?? []
const synthese = {}
for (const x of m) {
  if (!x.texture) continue
  const cle = `${x.origine} · ${x.texture.fichier ?? 'sans fichier'}`
  const s = (synthese[cle] ??= { maillages: 0, wrap: new Set(), repeat: new Set(), pixels: null, facesMm: [], mmParTuile: new Set(), echelles: new Set() })
  if (x.echelleMm !== null && x.echelleMm !== undefined) s.echelles.add(`${x.echelleMm} (${x.echelleSource ?? 'géométrie'})`)
  s.maillages++
  s.wrap.add(`${x.texture.wrapS}/${x.texture.wrapT}`)
  s.repeat.add(x.texture.repeat.map((r) => Math.round(r * 1000) / 1000).join('×'))
  s.pixels = x.texture.pixels
  if (x.tailleMondeMm) {
    // la plus grande face : les deux plus grandes cotes de la boîte
    const t = [...x.tailleMondeMm].sort((a, b) => b - a)
    s.facesMm.push(`${Math.round(t[0])}×${Math.round(t[1])}`)
    // « mm par tuile » : la plus grande cote du maillage divisée par la plus grande étendue d'UV (× repeat) — pour une texture étirée c'est la
    // cote elle-même (une valeur par taille de pièce) ; à l'échelle réelle c'est l'échelle, la même sur tous les maillages
    if (x.uv) {
      const du = x.uv.u[1] - x.uv.u[0]
      const dv = x.uv.v[1] - x.uv.v[0]
      const rep = Math.max(x.texture.repeat[0], x.texture.repeat[1]) || 1
      const etendue = Math.max(du, dv) * rep
      if (etendue > 0) s.mmParTuile.add(Math.round(t[0] / etendue))
    }
  }
}
journal.synthese = Object.fromEntries(
  Object.entries(synthese).map(([k, s]) => [k, { maillages: s.maillages, wrap: [...s.wrap], repeat: [...s.repeat], pixels: s.pixels, facesMm: [...new Set(s.facesMm)].slice(0, 12), mmParTuile: [...s.mmParTuile].sort((a, b) => a - b), echelles: [...s.echelles] }]),
)
await writeFile(resolve(OUT, `${NOM}.textures.json`), JSON.stringify(journal, null, 1))
const lignes = ['origine\tnom\tdefinition\tmateriau\tsurface\tgeometrie\ttailleMondeMm\tuvU\tuvV\ttexture\tpixels\trepeat\twrapS\twrapT\trotation\tcolorSpace\tcouleur\topacite']
for (const x of m) {
  lignes.push(
    [
      x.origine,
      x.nom,
      x.definition ?? '',
      x.materiau ?? '',
      x.surface ?? '',
      x.geometrie,
      x.tailleMondeMm?.join('×') ?? '',
      x.uv ? `${x.uv.u[0].toFixed(3)}..${x.uv.u[1].toFixed(3)}` : '',
      x.uv ? `${x.uv.v[0].toFixed(3)}..${x.uv.v[1].toFixed(3)}` : '',
      x.texture?.fichier ?? '',
      x.texture?.pixels?.join('×') ?? '',
      x.texture?.repeat.map((r) => Math.round(r * 1000) / 1000).join('×') ?? '',
      x.texture?.wrapS ?? '',
      x.texture?.wrapT ?? '',
      x.texture ? String(Math.round(x.texture.rotation * 1000) / 1000) : '',
      x.texture?.colorSpace ?? '',
      x.materiel.couleur ?? '',
      String(x.materiel.opacite),
    ].join('\t'),
  )
}
await writeFile(resolve(OUT, `${NOM}.textures.tsv`), lignes.join('\n') + '\n')
console.log(`${journal.quand} ${url}\n  vue stable : ${journal.vueStable} en ${journal.dureeMs} ms · scènes ${journal.releve.scenes} · maillages ${m.length} (texturés ${m.filter((x) => x.texture).length}) · fox-cad ${JSON.stringify(journal.foxcad)}`)
for (const [k, s] of Object.entries(journal.synthese)) console.log(`  ${k} : ${s.maillages} maillages · ${s.pixels?.join('×')} px · wrap ${s.wrap.join(',')} · repeat ${s.repeat.join(',')} · faces mm ${s.facesMm.join(' ')} · mm/tuile ${s.mmParTuile.slice(0, 10).join(' ')}${s.mmParTuile.length > 10 ? '…' : ''}${s.echelles.length ? ` · échelle ${s.echelles.join(', ')}` : ''}`)
if (journal.texturesEchelle) console.log(`  page : ${journal.texturesEchelle.texte}`)
if (journal.erreursConsole.length) console.log(`  console : ${journal.erreursConsole.length} message(s) — ${journal.erreursConsole[0]}`)
if (journal.reponsesEnEchec.length) console.log(`  réponses ≥ 400 : ${journal.reponsesEnEchec.join(' | ')}`)
