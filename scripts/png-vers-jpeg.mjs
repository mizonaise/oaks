#!/usr/bin/env node
/**
 * Un PNG de relevé trop lourd pour le dépôt (règle git : rien au-dessus de 1 Mo sans validation) → sa copie JPEG, par le Chrome du poste sans
 * fenêtre (aucune bibliothèque d'image dans le dépôt) : l'image est dessinée sur un canvas et ré-encodée. Le PNG reste sur le poste, le
 * relevé dit lequel. Une image à la fois.
 *
 *   node scripts/png-vers-jpeg.mjs [--qualite=0.85] fichier1.png [fichier2.png …]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { lancerChrome } from './navigateur.mjs'

const args = process.argv.slice(2)
const qualite = Number((args.find((a) => a.startsWith('--qualite=')) ?? '--qualite=0.85').split('=')[1])
const fichiers = args.filter((a) => !a.startsWith('--'))
if (fichiers.length === 0) {
  console.error('aucun fichier')
  process.exit(1)
}
const contexte = await lancerChrome({ channel: 'chrome' }) // le profil fixe (`navigateur.mjs`)
try {
  const page = await contexte.newPage()
  for (const f of fichiers) {
    const chemin = resolve(f)
    const png = await readFile(chemin)
    const dataUrl = 'data:image/png;base64,' + png.toString('base64')
    const jpeg = await page.evaluate(
      async ([src, q]) => {
        const img = new Image()
        await new Promise((ok, ko) => {
          img.onload = ok
          img.onerror = ko
          img.src = src
        })
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d').drawImage(img, 0, 0)
        return c.toDataURL('image/jpeg', q)
      },
      [dataUrl, qualite],
    )
    const sortie = chemin.replace(/\.png$/i, '.jpg')
    const octets = Buffer.from(jpeg.split(',')[1], 'base64')
    await writeFile(sortie, octets)
    console.log(`${f} (${Math.round(png.length / 1024)} Ko) → ${sortie} (${Math.round(octets.length / 1024)} Ko, qualité ${qualite})`)
  }
} finally {
  await contexte.close()
}
