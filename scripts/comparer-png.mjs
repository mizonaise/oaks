#!/usr/bin/env node
/**
 * Compare deux captures PNG pixel à pixel (d5, B4 22/09) — pour dire d'une forme témoin (OS_SHAPE_F) qu'elle n'a pas bougé : la part de
 * pixels qui diffèrent (au-delà d'un seuil par canal), la boîte englobante de ce qui diffère, et une image de la différence. Décodage par le
 * Chrome du poste (une page locale, sans fenêtre, le profil fixe de `navigateur.mjs`) : aucune bibliothèque d'image dans ce dépôt.
 *
 *   node scripts/comparer-png.mjs --a=avant/f_1680.png --b=apres/f_1680.png [--seuil=8] [--diff=planches/f_1680.diff.png]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { lancerChrome, profilDesArguments } from './navigateur.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...reste] = a.replace(/^--/, '').split('=')
    return [k, reste.length ? reste.join('=') : true]
  }),
)
const A = resolve(String(args.a))
const B = resolve(String(args.b))
const SEUIL = Number(args.seuil ?? 8)
const DIFF = args.diff ? resolve(String(args.diff)) : null

const dataUrl = async (p) => `data:image/png;base64,${(await readFile(p)).toString('base64')}`

const contexte = await lancerChrome({ profil: profilDesArguments(args), channel: 'chrome' })
try {
  const page = await contexte.newPage()
  await page.setContent('<!doctype html><html><body></body></html>')
  const resultat = await page.evaluate(
    async ({ a, b, seuil, voulueDiff }) => {
      const charger = (src) =>
        new Promise((ok, ko) => {
          const img = new Image()
          img.onload = () => ok(img)
          img.onerror = () => ko(new Error('image illisible'))
          img.src = src
        })
      const [ia, ib] = await Promise.all([charger(a), charger(b)])
      if (ia.width !== ib.width || ia.height !== ib.height) return { tailleDifferente: true, a: [ia.width, ia.height], b: [ib.width, ib.height] }
      const w = ia.width
      const h = ia.height
      const lire = (img) => {
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return ctx.getImageData(0, 0, w, h).data
      }
      const da = lire(ia)
      const db = lire(ib)
      let differents = 0
      let x0 = w, y0 = h, x1 = -1, y1 = -1
      let maxEcart = 0
      const diff = voulueDiff ? new Uint8ClampedArray(w * h * 4) : null
      for (let i = 0, p = 0; i < da.length; i += 4, p++) {
        const e = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]))
        if (e > maxEcart) maxEcart = e
        if (diff) {
          diff[i] = e > seuil ? 220 : da[i] / 4 + 190
          diff[i + 1] = e > seuil ? 30 : da[i + 1] / 4 + 190
          diff[i + 2] = e > seuil ? 30 : da[i + 2] / 4 + 190
          diff[i + 3] = 255
        }
        if (e > seuil) {
          differents++
          const x = p % w
          const y = (p / w) | 0
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
      let diffPng = null
      if (diff) {
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        c.getContext('2d').putImageData(new ImageData(diff, w, h), 0, 0)
        diffPng = c.toDataURL('image/png')
      }
      return { largeur: w, hauteur: h, pixels: w * h, differents, part: differents / (w * h), maxEcart, boite: differents ? [x0, y0, x1, y1] : null, diffPng }
    },
    { a: await dataUrl(A), b: await dataUrl(B), seuil: SEUIL, voulueDiff: Boolean(DIFF) },
  )
  if (DIFF && resultat.diffPng) await writeFile(DIFF, Buffer.from(resultat.diffPng.split(',')[1], 'base64'))
  delete resultat.diffPng
  console.log(JSON.stringify({ a: A, b: B, seuil: SEUIL, ...resultat, diff: DIFF }, null, 2))
} finally {
  await contexte.close()
}
