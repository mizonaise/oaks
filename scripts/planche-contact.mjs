/**
 * Planche-contact du plan de prises de vue (Dorian, 2026-09-15).
 *
 * Une page HTML — une vignette par prise, son id, son titre, la ligne caméra et
 * la légende courte — rendue par le navigateur de la capture en un PNG. Deux
 * usages : la relecture humaine (Clément, Raphaël), et l'image UNIQUE qu'on
 * donne là où Flora n'en accepte qu'une.
 */

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function htmlPlanche (fiche) {
  const cartes = fiche.prises.map(p => {
    const img = p.fichiers?.client ?? p.fichiers?.schema ?? null
    const cam = p.camera
      ? `${p.camera.focale_eq_mm} mm · ${p.camera.distance_m} m · h ${p.camera.hauteur_m} m · az ${p.camera.azimut_deg}° · incl ${p.camera.inclinaison_deg}°${p.camera.cadrage === 'partiel' ? ' · partiel' : ''}`
      : `omise — ${echapper(p.raison)}`
    return `<figure class="${p.statut}">
  ${img ? `<img src="${echapper(img)}" alt="${echapper(p.id)}">` : '<div class="vide">non réalisée</div>'}
  <figcaption>
    <b>${echapper(p.id)}</b> ${echapper(p.titre)}<br>
    <span class="cam">${cam}</span><br>
    <span class="txt">${echapper(p.legende).slice(0, 260)}${p.legende && p.legende.length > 260 ? '…' : ''}</span>
    ${p.fichiers?.schema && p.fichiers?.client ? '<span class="badge">client + schéma</span>' : p.fichiers?.schema ? '<span class="badge">schéma</span>' : ''}
  </figcaption>
</figure>`
  })
  const cfg = fiche.config ?? {}
  const sc = fiche.scene ?? {}
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Planche-contact ${echapper(cfg.shape)}</title>
<style>
  body{margin:0;background:#F6F5F0;color:#2B2B2B;font:14px/1.35 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding:28px}
  h1{font-size:20px;margin:0 0 6px}
  .meta{color:#555;margin-bottom:18px}
  .grille{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  figure{margin:0;background:#fff;border:1px solid #e3e0d8;border-radius:6px;overflow:hidden}
  figure.omise{opacity:.55}
  img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#ddd}
  .vide{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#eee;color:#888}
  figcaption{padding:8px 10px 10px}
  .cam{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#444}
  .txt{color:#333;font-size:12px}
  .badge{display:inline-block;margin-top:6px;padding:1px 6px;border:1px solid #bbb;border-radius:10px;font-size:10px;color:#555}
</style></head><body>
<h1>Plan de prises de vue — ${echapper(cfg.shape)} ${echapper(cfg.modele ?? '')}</h1>
<div class="meta">${echapper(sc.installation ?? '')} · ${echapper(sc.meuble ? `${sc.meuble.l_mm} × ${sc.meuble.h_mm} × ${sc.meuble.p_mm} mm` : '')} · ${fiche.prises.filter(p => p.statut === 'capturee').length} prises réalisées sur ${fiche.prises.length} · ${echapper(fiche.capture?.le ?? '')}</div>
<div class="grille">
${cartes.join('\n')}
</div>
</body></html>`
}

/** Écrit `planche.html` et `planche.png` dans `dossier` avec le Chrome de la capture (son contexte à profil fixe, `navigateur.mjs`). */
export async function planche (dossier, fiche, contexte) {
  const html = htmlPlanche(fiche)
  const fichier = resolve(dossier, 'planche.html')
  await writeFile(fichier, html, 'utf8')
  const page = await contexte.newPage()
  await page.setViewportSize({ width: 2400, height: 1600 })
  await page.goto(pathToFileURL(fichier).href, { waitUntil: 'load' })
  await page.screenshot({ path: resolve(dossier, 'planche.png'), fullPage: true })
  await page.close()
  return { html: fichier, png: resolve(dossier, 'planche.png') }
}
