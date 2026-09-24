#!/usr/bin/env node
/**
 * Sonde d'une prise (Dorian, 2026-09-15) — diagnostic, pas capture.
 *
 *   node scripts/sonder-prise.mjs --prise=H01 --mode=schema [--base=http://localhost:3021] [--secondes=60]
 *
 * Ouvre la page comme le script de capture, puis imprime toutes les 2 s l'état
 * du pont (`etat()`), l'état de la prise, l'empreinte des mesures et le nombre
 * de façades / poignées trouvées — jusqu'à ce que la prise soit posée ou que
 * le délai passe. Les erreurs de console sont imprimées telles quelles.
 */
import { lancerChrome, profilDesArguments } from './navigateur.mjs'

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...r] = a.replace(/^--/, '').split('='); return [k, r.length ? r.join('=') : true] }))
const BASE = (args.base ?? 'http://localhost:3021').replace(/\/$/, '')
const SHAPE = args.shape ?? 'OS_SHAPE_F'
const rendu = Buffer.from(JSON.stringify({ mode: args.mode === 'schema' ? 'schema' : 'realiste', dpr: 1 }), 'utf8').toString('base64url')
const url = `${BASE}/shape/${SHAPE}?banc=1&capture=1&prise=${args.prise ?? 'H01'}&rendu=${rendu}`
const SECONDES = Number(args.secondes ?? 60)

const contexte = await lancerChrome({ profil: profilDesArguments(args), channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox'], viewport: { width: 1024, height: 1024 } })
const page = await contexte.newPage()
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[console ${m.type()}] ${m.text().slice(0, 300)}`) })
page.on('pageerror', e => console.log(`[pageerror] ${e.message}`))
page.on('requestfailed', r => console.log(`[requestfailed] ${r.url().slice(0, 140)} ${r.failure()?.errorText ?? ''}`))
page.on('response', r => { const u = r.url(); if (/glb|r2-object/.test(u)) console.log(`[asset] ${r.status()} ${u.slice(0, 160)}`) })

console.log('URL', url)
const t0 = Date.now()
await page.goto(url, { waitUntil: 'load', timeout: 120000 })
console.log(`chargée en ${Date.now() - t0} ms`)
await page.waitForFunction(() => (window.__oaks?.version ?? 0) >= 2, null, { timeout: 120000 })
console.log(`pont v${await page.evaluate(() => window.__oaks.version)} après ${Date.now() - t0} ms`)

const fin = Date.now() + SECONDES * 1000
while (Date.now() < fin) {
  const e = await page.evaluate(() => {
    const etat = window.__oaks.etat()
    const f = window.__oaks.fiche()
    const m = f?.prise?.mesures
    return {
      etat,
      valeurs: f?.valeurs ? Object.keys(f.valeurs).length : 0,
      scene: f?.vue?.scene ? { inst: f.vue.scene.installation, murs: [f.vue.scene.murs.gauche.present, f.vue.scene.murs.droite.present], col: f.vue.scene.colonnes.length } : null,
      mesures: m ? { sig: m.signature, mailles: m.mailles, facades: m.facades.length, poignees: m.poignees.length, porte: m.porte, plinthe: m.plinthe, bandeau: m.bandeau } : null,
      camera: f?.prise?.camera ? { faisable: f.prise.camera.faisable, raison: f.prise.camera.raison, pos: f.prise.camera.position, fov: f.prise.camera.fov_v_deg, dist: f.prise.camera.distance_m, az: f.prise.camera.azimut_deg, pol: f.prise.camera.politique, notes: f.prise.camera.notes } : null
    }
  })
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`, JSON.stringify(e))
  if (e.etat.stable && (e.etat.prise === 'posée' || String(e.etat.prise ?? '').startsWith('impossible'))) break
  await page.waitForTimeout(2000)
}
if (args.image) {
  const dataUrl = await page.evaluate(() => window.__oaks.capture())
  if (dataUrl) { const { writeFileSync } = await import('node:fs'); writeFileSync(String(args.image), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('image', args.image) }
}
await contexte.close()
