/**
 * LA PLANCHE DU BOARD (d10) : une page HTML STATIQUE pour le mur de revue (`oaksome-review`, CSP de la racine : `script-src 'self'`,
 * `style-src 'self' 'unsafe-inline'`, `img-src 'self'` — donc aucun script, un `<style>` seul, les images dans `img/`), la forme des pages
 * du lead (`dorian-brain/oak-agent/_outils/revue-flora-hex-web.mjs`).
 *
 * v3 (24/09, ligne du lead 07:5x, mot de Dorian 07:4x) — LA RÈGLE D'ALIGNEMENT, une seule (A / B / C disparaissent) : en tête les CAS DE
 * RÉFÉRENCE (HEX 5, 6, 16 : avant = la capture telle que la page dessine, après = la ligne du meuble et une pastille par porte tracées sur
 * la même capture), puis la règle, les totaux et ce qui change contre la v2 publiée (le seuil B 900), ce que la page dessine, les situations
 * de d11, le catalogue des préconfigurations (v2, inchangé), la gamme, et un cas par vignette. Les verdicts se donnent par e-mail (mailto).
 */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const mm = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString('fr-BE').replace(/ /g, ' ') : '—')
/** un écart signé en mm (« −211 », « +0 ») */
const mmSigne = (x) => (Number.isFinite(x) ? `${x > 0 ? '+' : x < 0 ? '−' : '±'}${mm(Math.abs(x))}` : '—')
/** un montant en euros, deux décimales, les milliers séparés par une espace (« 3 274,66 € ») ; `signe` : « + » / « − » devant */
export const eur = (x, signe = false) => {
  if (!Number.isFinite(x)) return '—'
  const t = Math.abs(x).toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ')
  return `${signe ? (x > 0 ? '+' : x < 0 ? '−' : '±') : x < 0 ? '−' : ''}${t} €`
}
/** les dimensions d'une carte : L × H × P (cm) — le L dit ses deux ailes */
const dims = (d) => (d ? `${d.largeur ?? '?'}${d.aile ? ` + ${d.aile}` : ''} × ${d.hauteur ?? '?'} × ${d.profondeur ?? '?'}` : '—')
const ORDRE = ['poignée', 'poignée intégrée', 'poignée (petite porte)', 'à trancher', 'PTO-choix', 'PTO-repli']
const CLASSE = { poignée: 'e-poignee', 'poignée intégrée': 'e-integree', 'poignée (petite porte)': 'e-petite', 'à trancher': 'e-trancher', 'PTO-choix': 'e-choix', 'PTO-repli': 'e-repli' }
const pastille = (e) => `<span class="e ${CLASSE[e] ?? ''}">${esc(e)}</span>`
const compteTexte = (c) =>
  Object.entries(c ?? {})
    .sort((a, b) => ORDRE.indexOf(a[0]) - ORDRE.indexOf(b[0]))
    .map(([k, n]) => `${n} ${pastille(k)}`)
    .join(' ') || '—'
/** `col. 1 · WACA_LY_D_Q4L (QUAD_L, …)` → `col. 1` ; `porte 2 (face)` inchangé */
const zoneCourte = (z) => String(z ?? '').replace(/ · .*$/, '')
const estPto = (e) => e === 'PTO-repli' || e === 'PTO-choix'

/**
 * l'écart entre ce que la page DESSINE aujourd'hui et ce que dit la règle : une poignée dessinée sur une porte étiquetée PTO, ou à plus
 * de 50 mm de la hauteur imos — `null` quand rien ne s'écarte
 */
export function ecartPage (p) {
  const v = p.verdict
  const d = p.poigneePage
  if (!d) return null
  if (estPto(v.etiquette)) return `poignée dessinée (${mm(d.v)}) sur une porte ${v.etiquette}`
  const h = v.mesures.hauteurImos
  if (Number.isFinite(h) && Math.abs(d.v - h) > 50) return `dessinée à ${mm(d.v)}, imos ${mm(h)} (${d.v > h ? '+' : '−'}${mm(Math.abs(d.v - h))})`
  return null
}

/** la colonne « la page dessine » : la hauteur de la poignée dessinée (fox-cad : sa source ; le designer), l'écart surligné */
function cellulePage (p) {
  const d = p.poigneePage
  if (!d) return '<td class="n gris">aucune</td>'
  const ecart = ecartPage(p)
  const note = d.qui === 'fox-cad' ? `fox-cad, ${d.type}${d.source ? ` · ${d.source}` : ''}${d.descendue ? ' · descendue' : ''}` : `designer, ${d.type}`
  return `<td class="n${ecart ? ' change' : ''}">${mm(d.v)}<div class="src">${esc(note)}</div>${ecart ? `<div class="src rouge">${esc(ecart)}</div>` : ''}</td>`
}

/** la colonne « hier » : l'étiquette de la v2 publiée (seuil B 900), surlignée quand elle change */
function celluleHier (p) {
  if (!p.hier) return '<td class="gris">—</td>'
  const change = p.hier.etiquette !== p.verdict.etiquette
  return `<td class="${change ? 'change' : 'meme'}">${change ? pastille(p.hier.etiquette) : '='}</td>`
}

/** l'écart à la ligne, dit : « sur la ligne », « −211 » (rouge si orpheline) */
function celluleEcart (v) {
  if (v.petite) return '<td class="n gris">hors ligne</td>'
  if (v.ecartALaLigne === null) return '<td class="n rouge">pas de poignée possible</td>'
  if (v.etiquette === 'à trancher') return `<td class="n"><span class="violet">sur la ligne du meuble</span><div class="src">${mmSigne(v.ligne.h - 1050)} sous 1 050 (imos)</div></td>`
  if (v.surLaLigne) return '<td class="n vert">sur la ligne</td>'
  return `<td class="n rouge">${mmSigne(v.ecartALaLigne)}</td>`
}

/** les lignes du meuble d'un cas : « 1 050 (5 portes non coupées) » par rangée */
const lignesTexte = (c) =>
  (c.rangees ?? []).map((r) => `${c.rangees.length > 1 ? `rangée ${r.rangee + 1} (bas ${mm(r.bas)}) : ` : ''}<b>${r.ligne === null ? '—' : mm(r.ligne)}</b> <span class="src">(${esc(r.source)}${r.orphelines ? ` ; ${r.orphelines} orpheline${r.orphelines > 1 ? 's' : ''}` : ''})</span>`).join(' · ') || '—'

/** une vignette cliquable (la pleine taille au clic) */
const vignette = (src, plein, alt) => (src ? `<a href="${esc(plein ?? src)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></a>` : '')

/** la figure d'un cas : la S16 client ANNOTÉE (v3) en grand, dessous la même sans trait, la S16 schéma annotée, la S11 client */
function figure (c) {
  const im = c.images
  if (im?.s16Vignette) {
    const grande = im.s16LigneVignette ? vignette(im.s16LigneVignette, im.s16Ligne, `${c.titre} — la ligne et les pastilles`) : vignette(im.s16Vignette, im.s16, c.titre)
    return `<figure>${grande}
      <div class="autres trois">${im.s16LigneVignette ? vignette(im.s16Vignette, im.s16, 'S16 client sans trait') : ''}${vignette(im.s16SchemaLigneVignette ?? im.s16Schema, im.s16SchemaLigne ?? im.s16SchemaPlein, 'S16 schéma')}${vignette(im.s11, im.s11Plein, 'S11 client')}</div>
      <figcaption>${im.s16LigneVignette ? 'S16 client, la ligne du meuble et une pastille par porte tracées' : 'S16 client 16:9 (pas de caméra posée : pas de trait)'} · dessous : ${im.s16LigneVignette ? 'la même sans trait, ' : ''}S16 schéma${im.s16SchemaLigneVignette && im.s16Schema ? ` (<a href="${esc(im.s16SchemaPlein ?? im.s16Schema)}">sans trait</a>, <a href="${esc(im.s16Schema)}">vignette</a>)` : ''}, S11 client (la carte 1:1) — au clic, chaque prise en pleine taille · ${esc(c.forme)} · ${c.secondes ?? '?'} s pour les trois prises</figcaption></figure>`
  }
  if (im?.s11) return `<figure>${vignette(im.s11, im.s11Plein, c.titre)}<figcaption>S11 client · ${esc(c.forme)} · ${c.secondes ?? '?'} s</figcaption></figure>`
  return '<figure><div class="sans-image">pas de capture</div></figure>'
}

/** le rejeu du `form` dit en clair */
const rejeuTexte = (r) => (r ? (r.identique ? '<span class="vert">identique</span>' : `<span class="rouge">BOUGE</span> (${esc([...r.ecarts, ...(r.prix ? [] : ['prix']), ...(r.badge ? [] : ['badge'])].join(', '))})`) : '<span class="gris">non rejoué</span>')

/** la préconfiguration d'un cas : prix, carte actuelle, form rejoué, recoupement d'oaksome-stack, ce qui reste à Dorian */
function blocPreset (c) {
  const p = c.preset
  if (!p) return ''
  const r = p.rejeu
  const k = p.carteActuelle
  const s = p.recoupement
  const hexPto = s?.pto?.HEX_PTO && !/non emis/.test(s.pto.HEX_PTO) ? ` · émet <code>HEX_PTO ${esc(s.pto.HEX_PTO)}</code>, <code>Handle_Type ${esc(s.pto.Handle_Type)}</code>, <code>HINGE_OPTION ${esc(s.pto.HINGE_OPTION)}</code>` : ''
  return `<div class="preset">
      <p><b>Préconfiguration</b> <span class="e e-etat">${esc(p.etat)}</span> — <span class="prix">${eur(p.prix.ht)} HT</span> · <span class="prix">${eur(p.prix.ttc)} TTC</span> <span class="src">(21 % ; ${eur(p.prix.ttcPromotion)} avec les promotions du configurateur d’Otman)</span> · carte ${dims(p.dimensionsCm)} cm</p>
      <p><b>Carte actuelle de la forme :</b> ${k ? `« ${esc(k.nom)} » (template ${esc(k.template_id)}) dit « à partir de ${eur(k.prixCarte)} » — ce preset <b>${eur(k.ecartTtc, true)}</b> au TTC <span class="src">(${esc(k.lecture ?? '')})</span>` : '<span class="gris">aucune carte de cette forme sur le site</span>'}</p>
      <p><b>Form :</b> ${p.champs} champs résolus, arbre servi <code>${esc(p.arbre?.sha12 ?? '?')}</code> · rejoué tel quel : ${rejeuTexte(r)}${r ? ` <span class="src">(${esc(r.prises.join(' + '))}, adresse de ${mm(r.adresse)} caractères)</span>` : ''}${p.replis?.length ? ` · <b>replis</b> ${p.replis.map((x) => `<code>${esc(x.cle)} ${esc(x.seme)} → ${esc(x.rendu)}</code>`).join(' ')}` : ''}</p>
      ${s ? `<p><b>oaksome-stack</b> <span class="src">(sa preuve à blanc, arbre de son dépôt <code>${esc(s.arbre ?? '?')}</code>)</span> : form ${s.formIdentique ? '<span class="vert">identique</span>' : `<span class="rouge">${s.nEcarts} écart(s)</span>`} · HT ${eur(s.prixHt)} (${eur(s.ecartPrixHt, true)}) · mur ${s.mur ? (s.mur.refus === 0 ? '<span class="vert">0 refus</span>' : `<span class="rouge">${esc(s.mur.refus)} refus</span>`) : '<span class="gris">hors HEX</span>'}${hexPto}</p>` : ''}
      <p><b>Ouvre :</b> <code>${esc(p.configurateur ?? '—')}</code> · <b>à Dorian :</b> le nom, le sous-titre, l’ordre, les filtres, l’image retenue <span class="gris">[À CONFIRMER]</span></p>
    </div>`
}

/** le tableau des portes d'un cas */
function tableauPortes (c) {
  const lignes = c.portes
    .map((p) => {
      const v = p.verdict
      const m = v.mesures
      return `<tr title="${esc(v.raison)}">
        <td>${esc(p.zone)}${p.source && !/^fox-cad$/.test(p.source) ? `<div class="src">${esc(p.source)}</div>` : ''}</td>
        <td class="n">${mm(m.largeur)} × ${mm(m.hauteur)}<div class="src">${m.coupee ? 'coupée' : 'non coupée'} · ${esc(m.libre === 'gauche' ? 'libre à gauche' : m.libre === 'droite' && p.charnieres ? 'libre à droite' : 'rectangle')}</div></td>
        <td class="n">${mm(m.hautALaLigne)}</td>
        <td class="n">${m.hauteurImos === null ? `<span class="rouge">${esc(m.borne)}</span>` : `${mm(m.hauteurImos)}${m.borne !== 'ligne' ? `<div class="src">${esc(m.borne)}</div>` : ''}`}</td>
        <td class="n">${v.petite ? '<span class="gris">—</span>' : mm(v.ligne.h)}</td>
        ${celluleEcart(v)}
        ${cellulePage(p)}
        ${celluleHier(p)}
        <td>${pastille(v.etiquette)}<div class="src">${esc(v.raison)}</div></td>
      </tr>`
    })
    .join('\n')
  return `<table class="portes">
    <thead><tr><th>Porte</th><th>l × h (mm)</th><th>haut à la ligne de la poignée</th><th>poignée imos (du sol)</th><th>ligne du meuble</th><th>écart à la ligne</th><th>la page dessine</th><th>hier (v2, B 900)</th><th>aujourd’hui — l’alignement</th></tr></thead>
    <tbody>${lignes || '<tr><td colspan="9">aucune porte jugée</td></tr>'}</tbody>
  </table>`
}

function carte (c) {
  const semees = Object.entries(c.valeursSemees ?? {}).map(([k, v]) => `<code>${esc(k)}=${esc(v)}</code>`).join(' ')
  const r = c.resolu
  const lot = c.lot ? `${c.lot.positions} positions · ${c.lot.pieces} pièces · ${c.lot.manques} manque${c.lot.manques > 1 ? 's' : ''}${c.pleines ? ` · ${c.pleines} porte${c.pleines > 1 ? 's' : ''} pleine${c.pleines > 1 ? 's' : ''} redemandée${c.pleines > 1 ? 's' : ''}` : ''}` : 'forme de production : le designer d’Otman dessine tout (aucun lot fox-cad)'
  const pdf = c.ptoAuChoix?.pdf
  const form = c.ptoAuChoix?.formulaire
  return `<section class="cas${c.echec ? ' echec' : ''}" id="${esc(c.id)}">
  <div class="tete"><span class="id">${esc(c.id)}</span> <h2>${esc(c.titre)}</h2>${(c.changements ?? []).length ? ` <span class="e e-change">${c.changements.length} change${c.changements.length > 1 ? 'nt' : ''} contre la v2</span>` : ''}</div>
  <div class="corps">
    ${figure(c)}
    <div class="infos">
      <p class="intention">${esc(c.intention ?? '')}</p>
      <p class="semees">${semees}</p>
      <p><b>Rendu :</b> ${esc(r.collection ?? '?')} · ${esc(r.front ?? '?')}${r.frontInfo ? ` (${esc(r.frontInfo)})` : ''} · ${esc(r.pullLibelle ?? r.pull ?? 'sans poignée')}${r.pullX !== null ? ` · PULL_X ${esc(r.pullX)}` : ''}${r.finition ? ` · <span class="src">${esc(r.finition)}</span>` : ''}</p>
      <p><b>Ligne du meuble :</b> ${lignesTexte(c)}</p>
      <p><b>Étiquettes :</b> ${compteTexte(c.compte)}</p>
      ${blocPreset(c)}
      <p><b>Prix affiché par la page :</b> <span class="prix">${esc(c.prix || '—')}</span> <span class="src">(HT)</span> · <b>Lot :</b> ${lot}</p>
      ${c.badge ? `<p class="badge">${esc(c.badge)}</p>` : ''}
      <p><b>PTO au choix :</b> PDF ${pdf?.prevu === true ? '<span class="vert">prévu</span>' : pdf?.prevu === false ? '<span class="rouge">non prévu</span>' : '<span class="gris">inconnu</span>'} <span class="src">(${esc(pdf?.raison ?? '')})</span> · formulaire ${form?.offert === true ? '<span class="vert">offert</span>' : form?.offert === false ? '<span class="rouge">non offert</span>' : '<span class="gris">?</span>'}${c.ptoAuChoix?.choisi ? ' · <b>choisi dans ce cas</b>' : ''}</p>
      ${c.attendu ? `<p><b>Attendu</b> <span class="src">(${esc(c.attendu.attendu.source)})</span> : ${c.attendu.conforme ? '<span class="vert">CONFORME</span>' : '<span class="rouge">ÉCART</span>'} — ${esc(c.attendu.texte)}</p>` : ''}
      ${Object.keys(c.pageSansPoignee ?? {}).length ? `<p><b>La page laisse sans poignée :</b> ${Object.entries(c.pageSansPoignee).map(([k, n]) => `${n} « ${esc(k)} »`).join(', ')} <span class="src">(fox-cad, la nature lue dans le lot — d5)</span></p>` : ''}
    </div>
  </div>
  ${tableauPortes(c)}
  ${[...(c.avertissements ?? []), ...(c.annotation?.notes ?? [])].length ? `<ul class="avert">${[...(c.avertissements ?? []), ...(c.annotation?.notes ?? [])].map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
</section>`
}

/**
 * UN CAS DE RÉFÉRENCE (HEX 5, 6, 16) : avant = la capture telle que la page la dessine aujourd'hui ; après = la même capture, la ligne du
 * meuble et une pastille par porte tracées ; dessous, porte par porte, la hauteur imos, l'écart à la ligne, ce que la page dessine, hier
 * (v2) et aujourd'hui ; et la phrase qui dit les orphelines
 */
function reference (c) {
  const im = c.images ?? {}
  const orphelines = c.portes.filter((p) => p.verdict.orpheline && !p.verdict.petite)
  const phrases = orphelines.map((p) => {
    const v = p.verdict
    const m = v.mesures
    const d = p.poigneePage
    const imos = m.hauteurImos === null ? `aucune hauteur possible (${m.borne} : ${mm(m.hautALaLigne)} de haut à la ligne de la poignée)` : `imos la descendrait à ${mm(m.hauteurImos)}, ${mm(Math.abs(v.ecartALaLigne))} mm sous la ligne (500 sous le haut, ${mm(m.hautALaLigne)} à la ligne de la poignée)`
    const page = d ? (Math.abs(d.v - (v.ligne.h ?? 0)) <= 5 ? ` — la page la dessine SUR la ligne (${mm(d.v)}), ce qu’imos ne permet pas` : ` — la page la dessine à ${mm(d.v)}, sous la ligne`) : ''
    return `<b>${esc(zoneCourte(p.zone))}</b> : ${imos}${page}`
  })
  const lignes = c.portes
    .map((p) => {
      const v = p.verdict
      const m = v.mesures
      return `<tr title="${esc(v.raison)}"><td>${esc(zoneCourte(p.zone))}<div class="src">${esc(String(p.zone).replace(/^[^·]*· /, ''))}</div></td><td class="n">${mm(m.hautALaLigne)}</td><td class="n">${m.hauteurImos === null ? `<span class="rouge">${esc(m.borne)}</span>` : mm(m.hauteurImos)}</td>${celluleEcart(v)}${cellulePage(p)}${celluleHier(p)}<td>${pastille(v.etiquette)}</td></tr>`
    })
    .join('\n')
  return `<section class="ref" id="ref-${esc(c.id)}">
  <div class="tete"><a class="id" href="#${esc(c.id)}">${esc(c.id)}</a> <h2>${esc(c.titre)}</h2></div>
  <div class="avant-apres">
    <figure>${vignette(im.s16Vignette, im.s16, `${c.id} avant`)}<figcaption><b>Avant</b> — la capture telle que la page la dessine aujourd’hui : les boutons des portes coupées descendent avec la coupe.</figcaption></figure>
    <figure>${im.s16LigneVignette ? vignette(im.s16LigneVignette, im.s16Ligne, `${c.id} après`) : '<div class="sans-image">pas de caméra posée : pas de trait</div>'}<figcaption><b>Après</b> — la règle sur la même capture : la <span class="jaune">ligne des poignées</span> (${mm(c.rangees?.[0]?.ligne)}), <span class="rond vert-fond"></span> poignée sur la ligne, <span class="pill rouge-fond">PTO</span> porte orpheline (le pointillé : ce qu’il faudrait descendre), <span class="croix">✕</span> le bouton que la page dessine aujourd’hui sur une porte orpheline.</figcaption></figure>
  </div>
  <p>${orphelines.length ? `<b>${orphelines.length} porte${orphelines.length > 1 ? 's' : ''} orpheline${orphelines.length > 1 ? 's' : ''} sur ${c.portes.length}</b> → PTO-repli : ${phrases.join(' ; ')}.` : `Aucune orpheline sur ${c.portes.length} portes.`} ${(c.changements ?? []).length ? `<b>Contre la v2 :</b> ${c.changements.map((x) => `${esc(zoneCourte(x.zone))} ${pastille(x.hier)} → ${pastille(x.aujourdhui)}`).join(', ')}.` : '<span class="src">Contre la v2 (seuil B 900) : les mêmes étiquettes — ce qui change, c’est la raison : la ligne des autres, pas un plancher.</span>'}</p>
  <table class="portes"><thead><tr><th>Porte</th><th>haut à la ligne de la poignée</th><th>poignée imos</th><th>écart à la ligne</th><th>la page dessine</th><th>hier (v2)</th><th>aujourd’hui</th></tr></thead><tbody>${lignes}</tbody></table>
</section>`
}

/**
 * LES PRÉCONFIGURATIONS (v2, inchangé en v3 sauf la colonne PTO) : ce qu'est un preset et d'où viennent ses champs, le catalogue (une ligne
 * par situation), les cartes actuelles du site et, par forme, ce que les presets coûtent contre ce que la carte dit
 */
function sectionPresets (board, cas) {
  const avec = cas.filter((c) => c.preset)
  if (!avec.length) return ''
  const rejoues = avec.filter((c) => c.preset.rejeu)
  const identiques = rejoues.filter((c) => c.preset.rejeu.identique).length
  const recoupes = avec.filter((c) => c.preset.recoupement)
  const memesForms = recoupes.filter((c) => c.preset.recoupement.formIdentique).length
  const ecartsHt = recoupes.map((c) => Math.abs(c.preset.recoupement.ecartPrixHt ?? 0))
  const lignes = avec
    .map((c) => {
      const p = c.preset
      const k = p.carteActuelle
      const r = p.rejeu
      const im = c.images?.s16Vignette ?? c.images?.s11
      return `<tr${r && !r.identique ? ' class="echec"' : ''}>
      <td class="vign">${im ? `<a href="#${esc(c.id)}"><img src="${esc(im)}" alt="${esc(c.id)}" loading="lazy"></a>` : ''}</td>
      <td><a href="#${esc(c.id)}">${esc(c.id)}</a></td>
      <td>${esc(c.titre)}</td>
      <td class="n">${dims(p.dimensionsCm)}</td>
      <td class="n">${eur(p.prix.ht)}</td>
      <td class="n"><b>${eur(p.prix.ttc)}</b></td>
      <td class="n">${k ? `${eur(k.prixCarte)}<div class="src">${esc(k.nom)}</div>` : '<span class="gris">pas de carte</span>'}</td>
      <td class="n${k?.sousLaCarte ? ' change' : ''}">${k ? eur(k.ecartTtc, true) : ''}</td>
      <td>${p.champs} champs · ${rejeuTexte(r)}${p.recoupement ? (p.recoupement.formIdentique ? ' · <span class="vert">= stack</span>' : ' · <span class="rouge">≠ stack</span>') : ''}${p.replis?.length ? `<div class="src">replis : ${esc(p.replis.map((x) => `${x.cle} ${x.seme} → ${x.rendu}`).join(' ; '))}</div>` : ''}</td>
      <td>${compteTexte(p.verdicts?.pto?.compte)}</td>
    </tr>`
    })
    .join('\n')
  const formes = [...new Set(avec.map((c) => c.forme))]
  const parForme = formes
    .map((f) => {
      const cs = avec.filter((c) => c.forme === f)
      const ttc = cs.map((c) => c.preset.prix.ttc).filter(Number.isFinite)
      const k = cs[0].preset.carteActuelle
      const servis = [...new Set(cs.map((c) => c.preset.arbre?.sha12).filter(Boolean))]
      const stack = [...new Set(cs.map((c) => c.preset.recoupement?.arbre).filter(Boolean))]
      const sous = cs.filter((c) => c.preset.carteActuelle?.sousLaCarte).length
      return `<tr><td>${esc(f)}</td><td class="n">${cs.length}</td><td class="n">${eur(Math.min(...ttc))} – ${eur(Math.max(...ttc))}</td><td>${k ? `« ${esc(k.nom)} » ${eur(k.prixCarte)}` : '<span class="gris">aucune</span>'}</td><td class="n">${k ? `${sous} / ${cs.length}` : ''}</td><td><code>${esc(servis.join(', '))}</code></td><td><code>${esc(stack.join(', '))}</code>${stack.length && servis.length && stack.join() !== servis.join() ? ' <span class="rouge">≠</span>' : ''}</td></tr>`
    })
    .join('\n')
  const k = board.cartes
  const cartes = (k?.cartes ?? [])
    .map((x) => `<tr><td>${esc(x.nom)}<div class="src">template ${esc(x.template_id)}</div></td><td><code>${esc(x.forme)}</code></td><td class="n"><b>${eur(x.prix_carte)}</b></td><td class="n">${Number.isFinite(x.defautHt) ? `${eur(x.defautHt)} HT<div class="src">${eur(Math.round(x.defautHt * 121) / 100)} TTC</div>` : '—'}</td><td>${esc(x.lecture ?? '')}</td><td class="src"><code>${esc(x.webpage_url)}</code></td></tr>`)
    .join('\n')
  return `<h3>Les préconfigurations — ${avec.length} situations, chacune une fiche produit possible</h3>
<div class="note"><b>Ce qu'est un preset</b> (oaksome-stack <code>5a45f43</code>, <code>produits/hex/releves/2026-09-24_preconfigurations-du-site.md</code>) : une fiche <code>product.template</code> d'Odoo publiée sur le site 10 « Oaksome » — la carte : nom, catégorie, dimensions, image, prix, l'adresse du configurateur — et, sur sa variante, un <code>form</code> que le configurateur charge en valeurs initiales quand la carte l'ouvre (<code>/shape/&lt;forme&gt;?id=&lt;template&gt;</code>). Ce board mesure, par situation :
<b>le <code>form</code></b> = les champs de l'utilisateur (hors <code>HIDEN_FIELDS</code>) tels que la page les a <i>résolus</i>, avec le sha de l'arbre servi — puis <b>rejoué tel quel</b> dans la vraie page pour les deux autres prises (S16 schéma, S11 client) : <b>${identiques} / ${rejoues.length} identiques</b> (toutes les valeurs, le prix, le badge) ;
<b>le prix</b> : le HT est ce que la barre de prix de la page affiche (le moteur ; ${recoupes.length ? `à ${eur(Math.max(...ecartsHt))} au plus du HT mesuré par oaksome-stack sur les mêmes situations` : 'sans recoupement'}), le TTC = HT × 1,21 (la taxe 1427 « 21 % ») — le configurateur d'Otman affiche en plus deux promotions (× 0,72), dites à part dans chaque cas ;
<b>les dimensions</b> de la carte (cm), <b>les images</b> (S16 client 16:9 et S11 client 1:1), <b>les verdicts</b> (la PTO par porte sous la règle d’alignement ; le mur de HEX / HEX 2 par la preuve à blanc d'oaksome-stack${recoupes.length ? ` : son <code>form</code> est le même que celui de la page sur <b>${memesForms} / ${recoupes.length}</b> situations` : ''}) ; imos n'a rien compilé.
<b>Reste à Dorian</b> : quelles situations deviennent des cartes, leur nom, sous-titre, ordre, filtres, l'image retenue, la convention de prix — puis chaque fiche se pose dans Odoo sur son OK. Les données : <code>presets.json</code> à côté de cette page.</div>
<table class="catalogue"><thead><tr><th></th><th>cas</th><th>situation</th><th>carte L × H × P (cm)</th><th>HT</th><th>TTC</th><th>carte actuelle</th><th>écart TTC</th><th>form</th><th>PTO (alignement)</th></tr></thead><tbody>
${lignes}
</tbody></table>
<h3>Par forme : les presets contre la carte actuelle</h3>
<table><thead><tr><th>forme</th><th>presets</th><th>TTC des presets</th><th>carte actuelle (« à partir de »)</th><th>presets moins chers que la carte</th><th>arbre servi (la page)</th><th>arbre d'oaksome-stack</th></tr></thead><tbody>
${parForme}
</tbody></table>
<div class="note"><b>L'arbre.</b> La page a résolu chaque <code>form</code> sur l'arbre que le configurateur sert (la pile locale 4848). L'arbre de la PTO à deux natures d'oaksome-stack (« Push and Open » → <code>Handle_Type STANDARD</code> + <code>HINGE_OPTION Tipon</code> + <code>HEX_PTO 2</code>) et le repli par l’alignement (<code>HEX_PTO 1</code> sur la porte orpheline, la spéc de d11 à venir) ne sont pas encore semés sur cette pile : un preset HEX / HEX 2 se rejoue au semis — un <code>form</code> se revalide à chaque arbre neuf.</div>
<h3>Les cartes actuelles du site (relues le ${esc(k?.lu ?? '?')})</h3>
<div class="note">La carte dit « À partir de {prix} € » sans dire HT ni TTC. <b>Ses prix sont faux</b> (oaksome-stack les a mesurés) : F, U, CMB montrent le HT de la forme par défaut comme un TTC ; la carte L ne suit plus son défaut et ouvre une 404 ; la carte HEX recopie le prix du F avec une autre taxe. Source : <code>${esc(k?.source?.liste ?? '')}</code> et le détail de chaque carte ; le fichier : <code>${esc(k?.fichier ?? '')}</code>.</div>
<table><thead><tr><th>carte</th><th>forme</th><th>prix affiché</th><th>la forme par défaut (moteur)</th><th>lecture</th><th>adresse de la carte</th></tr></thead><tbody>
${cartes}
</tbody></table>`
}

/** ce qui change contre la v2 publiée : les portes dont l'étiquette bouge, et les orphelines au plus près de la ligne */
function sectionChangements (board, cas) {
  const tous = cas.flatMap((c) => (c.changements ?? []).map((x) => ({ c, x })))
  const apparies = cas.reduce((n, c) => n + (c.hierApparie ?? 0), 0)
  const nPortes = cas.reduce((n, c) => n + c.portes.length, 0)
  const versPto = tous.filter(({ x }) => x.aujourdhui === 'PTO-repli')
  const versTrancher = tous.filter(({ x }) => x.aujourdhui === 'à trancher')
  const versPoignee = tous.filter(({ x }) => x.aujourdhui !== 'PTO-repli' && x.aujourdhui !== 'à trancher')
  const lignes = tous
    .map(({ c, x }) => `<tr><td><a href="#${esc(c.id)}">${esc(c.id)}</a></td><td>${esc(c.titre)}</td><td>${esc(zoneCourte(x.zone))}</td><td>${pastille(x.hier)}</td><td>${pastille(x.aujourdhui)}</td><td class="n">${mm(x.hauteurImos)}</td><td class="n">${mm(x.ligne)}</td><td class="n">${x.ecart === null ? '—' : mmSigne(x.ecart)}</td></tr>`)
    .join('\n')
  const proches = cas
    .flatMap((c) => c.portes.filter((p) => p.verdict.orpheline && !p.verdict.petite && Number.isFinite(p.verdict.ecartALaLigne) && Math.abs(p.verdict.ecartALaLigne) <= 50).map((p) => ({ c, p })))
    .sort((a, b) => Math.abs(a.p.verdict.ecartALaLigne) - Math.abs(b.p.verdict.ecartALaLigne))
  const v2 = board.v2
  return `<h3>Ce qui change contre la v2 (le seuil B ${esc(v2?.seuil ?? 900)} publié${v2?.genere ? ` le ${esc(v2.genere)}` : ''})</h3>
<div class="note"><b>${tous.length} porte${tous.length > 1 ? 's' : ''} sur ${apparies} changent d’étiquette</b>${apparies < nPortes ? ` (${nPortes - apparies} non appariée${nPortes - apparies > 1 ? 's' : ''} : zone différente)` : ''} :
<b>${versPto.length}</b> passent en PTO-repli — leur poignée descendrait sous la ligne des autres, mais au-dessus de 900 : la v2 la gardait ;
<b>${versTrancher.length}</b> deviennent « à trancher » — ${versTrancher.length ? 'les portes des meubles bas (la question ouverte ci-dessous) : alignées entre elles, mais sous la ligne d’imos ; la v2 les mettait en PTO sous 900, ou gardait leur poignée au-dessus' : 'aucune'}${versPoignee.length ? ` ; <b>${versPoignee.length}</b> retrouvent leur poignée` : ''}.
Les autres portes gardent l’étiquette d’hier : sur un meuble de hauteur normale, la ligne est 1 050 et « sur la ligne » est exactement la lecture A de d11 ; les orphelines entre 900 et 1 050 sont celles qui changent.</div>
${tous.length ? `<table><thead><tr><th>cas</th><th>situation</th><th>porte</th><th>hier</th><th>aujourd’hui</th><th>poignée imos</th><th>ligne</th><th>écart</th></tr></thead><tbody>${lignes}</tbody></table>` : ''}
<div class="note"><b>Les orphelines au plus près de la ligne</b> (50 mm ou moins) — la règle stricte les met en PTO ; si Dorian admet une tolérance de dessin (quelques centimètres sous la ligne), ce sont elles qui gardent leur poignée : ${proches.length ? proches.map(({ c, p }) => `<a href="#${esc(c.id)}">${esc(c.id)}</a> ${esc(zoneCourte(p.zone))} <b>${mmSigne(p.verdict.ecartALaLigne)}</b> <span class="src">(${mm(p.verdict.mesures.hauteurImos)} contre ${mm(p.verdict.ligne.h)})</span>`).join(' · ') : 'aucune'}. La plus proche est à ${proches.length ? `${mm(Math.abs(proches[0].p.verdict.ecartALaLigne))} mm` : '—'} : aucune porte du board n’est « presque » sur la ligne à quelques millimètres près.</div>`
}

/**
 * LA SEULE QUESTION OUVERTE (d2 24/09 08:2x, d11 08:5x [À CONFIRMER], oaksome-stack 09:0x) : imos (« Pull Heights », `KI_PH_Bottom`) tient
 * une ligne ABSOLUE à 1 050 pour toute la pièce ; le board prend la ligne des portes non coupées du meuble. Les deux ne diffèrent que sur
 * un meuble bas (toutes ses portes sous 1 050) : les portes qui deviendraient orphelines sous la ligne absolue, cas par cas.
 */
function sectionQuestionOuverte (board, cas) {
  const ligneImos = board.parametres?.regleImos?.ligne ?? 1050
  const bas = cas
    .map((c) => ({ c, touchees: c.portes.filter((p) => p.verdict.etiquette === 'à trancher'), ligne: (c.rangees ?? []).find((r) => r.sousLaNorme)?.ligne ?? null }))
    .filter((x) => x.touchees.length)
  if (!bas.length) return ''
  const n = bas.reduce((s, x) => s + x.touchees.length, 0)
  const repli = cas.reduce((s, c) => s + c.portes.filter((p) => p.verdict.etiquette === 'PTO-repli').length, 0)
  return `<div class="note"><b>La seule question ouverte : la ligne d’un meuble bas</b> — ${n} porte${n > 1 ? 's' : ''} <span class="e e-trancher">à trancher</span>. imos (d2, « Pull Heights » : <code>KI_PH_Bottom</code>) tient une ligne <i>absolue</i> à ${mm(ligneImos)} du sol, la même pour toute la pièce, sans regarder les portes voisines ; le board prend la ligne <i>des portes non coupées du meuble</i> (la ligne du lead, « la ligne horizontale des autres » de Dorian). Les deux ne diffèrent que sur un meuble dont toutes les portes sont sous ${mm(ligneImos)} : imos les pose alors toutes plus bas, alignées entre elles. d11 demande de ne pas les étiqueter avant le mot de Dorian (<code>sousLaNorme</code>, [À CONFIRMER] dans sa spécification) ; oaksome-stack refuse pour l’instant un HEX de moins de 1 630 de haut. Sur ce board : ${bas.map((x) => `<a href="#${esc(x.c.id)}">${esc(x.c.id)}</a> (ligne ${mm(x.ligne)}, ${x.touchees.length} porte${x.touchees.length > 1 ? 's' : ''})`).join(' · ')} — <b>ligne du meuble : elles gardent leur poignée (${repli} PTO-repli au board) ; ligne absolue : elles passent en PTO-repli, le meuble entier sans poignée (${repli} + ${n} = ${repli + n})</b>. <b>À Dorian.</b></div>`
}

/** ce que la page DESSINE aujourd'hui contre la règle */
function sectionPage (cas) {
  const toutes = cas.flatMap((c) => c.portes.map((p) => ({ c, p })))
  const sansPoignee = toutes.filter(({ p }) => !p.poigneePage).length
  const surPto = toutes.filter(({ p }) => p.poigneePage && estPto(p.verdict.etiquette))
  const surRepli = surPto.filter(({ p }) => p.verdict.etiquette === 'PTO-repli')
  const surLaLigneMaisOrpheline = surRepli.filter(({ p }) => Number.isFinite(p.verdict.ligne.h) && Math.abs(p.poigneePage.v - p.verdict.ligne.h) <= 5)
  const decalees = toutes.filter(({ p }) => ecartPage(p) && !estPto(p.verdict.etiquette))
  const natures = {}
  for (const c of cas) for (const [k, n] of Object.entries(c.pageSansPoignee ?? {})) natures[k] = (natures[k] ?? 0) + n
  const repli = toutes.filter(({ p }) => p.verdict.etiquette === 'PTO-repli').length
  return `<div class="note"><b>Ce que la page dessine aujourd'hui</b> (la colonne « la page dessine » : la poignée visible dans la scène, fox-cad ou designer) : ${toutes.length - sansPoignee} portes sur ${toutes.length} portent une poignée dessinée ; <b>${surRepli.length}</b> sont des orphelines de la règle (PTO-repli) — dont <b>${surLaLigneMaisOrpheline.length}</b> dessinées SUR la ligne, là où imos ne le permet pas (moins de 500 mm sous le haut)${surLaLigneMaisOrpheline.length ? ` : ${esc([...new Set(surLaLigneMaisOrpheline.map(({ c, p }) => `${c.id} ${zoneCourte(p.zone)}`))].join(', '))}` : ''} ; <b>${decalees.length}</b> poignées sont dessinées à plus de 50 mm de la hauteur imos${decalees.length ? ` (${esc([...new Set(decalees.map(({ c }) => c.id))].join(', '))})` : ''}. Fox-cad laisse sans poignée : ${Object.entries(natures).map(([k, n]) => `${n} « ${esc(k)} »`).join(', ') || 'aucune porte'} (la nature LUE dans le lot, d5) — le repli : le board en compte <b>${repli}</b>, la page en montre <b>${natures['pto-repli'] ?? 0}</b>${natures['pto-repli'] ? '' : ' (le front lit le repli dans le lot ; l’arbre ne l’émet pas encore)'}.</div>`
}

export function planche (board) {
  const cas = board.cas
  const nPortes = cas.reduce((n, c) => n + c.portes.length, 0)
  const tous = {}
  for (const c of cas) for (const [k, n] of Object.entries(c.compte ?? {})) tous[k] = (tous[k] ?? 0) + n
  const orphelines = cas.reduce((n, c) => n + c.portes.filter((p) => p.verdict.orpheline && !p.verdict.petite).length, 0)
  const refs = (board.references ?? []).map((id) => cas.find((c) => c.id === id)).filter(Boolean)
  const p = board.parametres
  const resume = cas
    .map((c) => `<tr class="${(c.changements ?? []).length ? 'bouge' : ''}${c.echec ? ' echec' : ''}"><td><a href="#${esc(c.id)}">${esc(c.id)}</a></td><td>${esc(c.titre)}</td><td class="n">${esc(c.prix || '—')}</td><td class="n">${(c.rangees ?? []).map((r) => mm(r.ligne)).join(' / ')}</td><td class="n">${c.portes.length}</td><td>${compteTexte(c.compte)}</td><td>${(c.changements ?? []).map((x) => `${esc(zoneCourte(x.zone))} ${pastille(x.hier)} → ${pastille(x.aujourdhui)}`).join('<br>') || '='}</td><td class="n">${c.avertissements?.length || ''}</td></tr>`)
    .join('\n')
  const fa = (board.gamme?.facades ?? [])
    .map((f) => `<tr><td>${esc(f.fa.replace('_', ' '))}</td><td class="n">${f.page}</td>${[1, 2, 3, 4].map((n) => `<td class="c">${f.table['P p&o'].includes(n) ? '●' : ''}</td>`).join('')}<td>${esc(Object.entries(board.correspondance ?? {}).filter(([k, v]) => k.startsWith('FR_') && v.fa === f.fa).map(([k]) => k).join(', '))}</td></tr>`)
    .join('\n')
  const attendus = cas.filter((c) => c.attendu)
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(board.titre)} — ${esc(board.date)}</title>
<style>
body{margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1d1d1b;background:#f6f4ef;font-size:14px}
main{max-width:1500px;margin:0 auto;padding:24px 20px 60px}
h1{font-size:26px;margin:0 0 6px}h2{font-size:16px;margin:0;display:inline}h3{font-size:17px;margin:30px 0 8px;border-top:2px solid #1d1d1b;padding-top:12px}
.etat{color:#555}.note{background:#fff;border:1px solid #ddd;padding:12px 14px;margin:14px 0;line-height:1.45}
.note blockquote,blockquote.dorian{margin:6px 0 10px;padding-left:10px;border-left:3px solid #c0392b;font-style:italic}
table{border-collapse:collapse;background:#fff;width:100%}th,td{border:1px solid #ddd;padding:4px 6px;vertical-align:top;text-align:left}th{background:#ecebe6;font-weight:600}
td.n{text-align:right;white-space:nowrap}td.c{text-align:center}tr.bouge td{background:#fff8e6}tr.echec td{background:#fdecea}
.e{display:inline-block;padding:1px 7px;border-radius:9px;font-size:12px;font-weight:600;white-space:nowrap}
.e-poignee{background:#e3efe0;color:#2e5d27}.e-integree{background:#dff0ef;color:#1f5f5b}.e-petite{background:#eee;color:#555}.e-choix{background:#e0e9f7;color:#1f4f8f}.e-repli{background:#f9dcd2;color:#9c2a0c}.e-trancher{background:#ece6fa;color:#4b2f99}.e-change{background:#fff3cd;color:#7a5a00}
.cas,.ref{background:#fff;border:1px solid #ccc;margin:22px 0;padding:12px 14px}.cas.echec{border-color:#c0392b}.ref{border:2px solid #1d1d1b}
.tete{margin-bottom:8px}.id{display:inline-block;background:#1d1d1b;color:#fff;padding:2px 8px;border-radius:3px;font-weight:700;margin-right:6px;text-decoration:none}
.corps{display:grid;grid-template-columns:minmax(300px,520px) 1fr;gap:14px}
.avant-apres{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px}
figure{margin:0}figure img{width:100%;height:auto;display:block;border:1px solid #ddd}figcaption{font-size:12px;color:#555;padding-top:4px;line-height:1.4}
.infos p{margin:0 0 6px;line-height:1.4}.semees code{background:#f1efe9;padding:1px 4px;border-radius:3px;font-size:12px;margin-right:2px;display:inline-block}
.intention{color:#333;font-style:italic}.badge{font-size:12px;color:#555;background:#f7f7f4;padding:4px 6px}
.prix{font-weight:700}.src{font-size:11.5px;color:#666}.vert{color:#2e7d32;font-weight:600}.rouge{color:#c0392b;font-weight:600}.gris{color:#777}
.jaune{background:#1d1d1b;color:#ffd400;padding:0 4px;font-weight:700}.rond{display:inline-block;width:11px;height:11px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #999;vertical-align:-1px}
.vert-fond{background:#2e9d4a}.pill{display:inline-block;color:#fff;font-weight:700;font-size:11px;padding:0 6px;border-radius:8px}.rouge-fond{background:#e5471c}.bleu-fond{background:#2f6fd6}.violet-fond{background:#7b61c9}.violet{color:#4b2f99;font-weight:600}.croix{color:#e5471c;font-weight:700}
table.portes{margin-top:10px;font-size:13px}td.change{background:#fff3cd}td.meme{color:#999;text-align:center}
ul.avert{margin:8px 0 0;padding-left:18px;color:#8a4b00;font-size:12.5px}
.pied{color:#666;font-size:12px;margin-top:40px;line-height:1.5}
a.bouton{display:inline-block;background:#1d1d1b;color:#fff;padding:8px 14px;text-decoration:none;border-radius:4px}
.legende .e{margin-right:4px}
.autres{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}.autres.trois{grid-template-columns:1fr 1fr 1fr}.autres img{border:1px solid #ddd}
.preset{background:#f4f7fb;border:1px solid #d5deea;padding:6px 8px;margin:6px 0}.preset p{margin:0 0 4px}.e-etat{background:#fff4d6;color:#7a5a00}
table.catalogue td{vertical-align:middle}td.vign{width:170px;padding:2px}td.vign img{width:170px;height:auto;display:block}
@media (max-width:900px){.corps,.avant-apres{grid-template-columns:1fr}}
</style></head><body><main>
<h1>${esc(board.titre)}</h1>
<p class="etat">${esc(board.date)} · ${cas.length} situations · ${nPortes} portes · configurateur ${esc(board.base)}${board.build ? ` (build ${esc(board.build)})` : ''} · API fox-cad locale · généré le ${esc(board.genere)} · v${esc(board.version)}</p>
<div class="note"><b>La règle du repli, depuis le 24/09 : l’alignement, pas un seuil.</b> Dorian, devant le board (HEX 5, 6, 16) :
<blockquote>« Les boutons ne peuvent pas descendre sous la ligne horizontale des autres — c’est à ce moment-là qu’on met un PTO sur les portes qui ne peuvent pas avoir une poignée à la même hauteur que les autres. »</blockquote>
Chaque meuble a sa <span class="jaune">ligne des poignées</span> : la hauteur que prennent ses portes <i>non coupées</i> (imos : ${mm(p.regleImos?.ligne)} du sol fini, ou plus bas sur un meuble bas, où toutes descendent ensemble à ${mm(p.regleImos?.distTop)} sous le haut). La poignée d’une porte coupée descend avec la coupe (imos : ${mm(p.regleImos?.distTop)} sous le haut de la porte à la ligne de la poignée) : si elle n’est plus <b>sur</b> la ligne, la porte est <b>orpheline → PTO</b>. Une seule règle : les lectures A / B / C d’hier disparaissent. (Sur un meuble bas — toutes ses portes sous 1 050 —, imos garde une ligne absolue : ses portes sont « à trancher », la seule question ouverte, dite plus bas.)
<span class="legende">${ORDRE.map(pastille).join(' ')}</span></div>

<h3>Les cas de référence — avant / après</h3>
${refs.map(reference).join('\n') || '<p class="gris">aucun cas de référence dans ce board</p>'}

<h3>La règle, porte par porte</h3>
<div class="note">
<b>La hauteur de la poignée</b> est celle d'imos (lue par d3 et d11 : <code>GRIFF.Pull_Middle</code>, <code>PULLHEIGHT = KI_PH_Bottom</code>, <code>HEIGHT ${esc(p.regleImos?.ligne)}</code>, <code>DIST_TOP ${esc(p.regleImos?.distTop)}</code>, <code>DIST_BOT ${esc(p.regleImos?.distBot)}</code>) : ${mm(p.regleImos?.ligne)} mm au-dessus du sol fini, bornée à ${mm(p.regleImos?.distTop)} sous le haut de la porte à la ligne de la poignée (la verticale à <code>PULL_X</code> du bord libre, le bord opposé aux charnières) et à ${mm(p.regleImos?.distBot)} au-dessus du bas. Le contour de chaque porte est celui que la page a reçu de fox-cad (HEX, HEX 2 — pour une façade que fox-cad refuse, la porte pleine que la page redemande) ou la boîte de porte du designer d'Otman (F, L).<br>
<b>La ligne du meuble</b> : les portes se rangent par leur bas (à ${esc(p.ecartRangee)} mm près — les surmeubles d’un placard de 3 m sont une autre rangée) ; la ligne d’une rangée est la hauteur imos de ses portes non coupées (la plus fréquente) ; une rangée sans porte non coupée prend celle de sa porte la plus haute (dit dans le cas).<br>
<b>Sur la ligne</b> : à ${esc(String(p.tolerance).replace('.', ','))} mm près — le bruit des contours, pas une tolérance de dessin (voir « les orphelines au plus près » : aucune n’est à moins de 30 mm).
Une porte plus basse que <b>${esc(p.petite)} mm</b> est « petite » : jamais en repli, elle ne fait pas la ligne [À CONFIRMER : le PDF dessine la petite porte à 60 cm]. Le choix du client (« Push and Open ») → PTO-choix, quelle que soit la ligne.<br>
<b>Sur l’image</b> : la caméra est celle que la page a posée pour la prise (<code>fiche().prise.camera</code>), rejouée à l’identique ; la <span class="jaune">ligne</span> est tracée d’un bord à l’autre des portes de chaque façade, une pastille par porte à la ligne de sa poignée : <span class="rond vert-fond"></span> sur la ligne, <span class="pill rouge-fond">PTO</span> orpheline (placée là où imos la descendrait, le pointillé depuis la ligne), <span class="pill bleu-fond">PTO</span> choix du client, <span class="pill violet-fond">?</span> à trancher (un meuble bas, voir la question ouverte), <span class="croix">✕</span> le bouton que la page dessine aujourd’hui sur une porte en PTO. Les images propres (sans trait) restent la matière des rendus Flora.
</div>
<p><a class="bouton" href="mailto:d.dormal@tecnibo.com?subject=${encodeURIComponent('Board PTO v3 (alignement) — ' + board.date)}">Répondre par e-mail : les cas faux, la tolérance (« sur la ligne » à combien de mm ?), les petites portes, les presets retenus</a></p>

<h3>Totaux (${nPortes} portes)</h3>
<table><tbody><tr><td><b>L’alignement</b></td><td>${compteTexte(tous)} · <b>${orphelines}</b> orpheline${orphelines > 1 ? 's' : ''} (dont celles où le client a déjà choisi la PTO)</td></tr></tbody></table>
${sectionChangements(board, cas)}
${sectionQuestionOuverte(board, cas)}
${sectionPage(cas)}
${attendus.length ? `<div class="note"><b>Les situations de d11 du 23/09</b> (la ligne attendue par colonne : le Set, <code>HEX_H_court</code>, la poignée imos ; comparées à sa lecture A « la ligne tient ou rien », qui est l’alignement sur un meuble de hauteur normale) : <b>${attendus.filter((c) => c.attendu.conforme).length} / ${attendus.length} conformes</b> — ${attendus.map((c) => `<a href="#${esc(c.id)}">${esc(c.id)}</a> ${c.attendu.conforme ? '<span class="vert">conforme</span>' : '<span class="rouge">écart</span>'} (poignée ${c.attendu.ecartPoignee > 0 ? '+' : ''}${esc(c.attendu.ecartPoignee)} mm)`).join(' · ')}. La poignée est comparée à 5 mm près : la porte de fox-cad n'est pas la porte imos du modèle de d11 au millimètre.</div>` : ''}

<h3>Cas par cas</h3>
<table><thead><tr><th>cas</th><th>situation</th><th>prix (HT)</th><th>ligne</th><th>portes</th><th>étiquettes</th><th>contre la v2</th><th>⚠</th></tr></thead><tbody>
${resume}
</tbody></table>

${sectionPresets(board, cas)}

<h3>PTO au choix : ce que la gamme prévoit (PDF, colonne « P p&amp;o ») et ce que le formulaire offre</h3>
<div class="note">Relevé dans le dessin du PDF de Dorian (<code>${esc(board.gamme?.source?.pdf ?? '')}</code>, sha256 <code>${esc((board.gamme?.source?.sha256 ?? '').slice(0, 12))}…</code>) : les pastilles de la table de chaque planche, par mupdf. Correspondance FR ↔ FA : la table de d2 (orchestre, <code>revues/2026-09-24_gamme-oaksome-facades-kms-pto.md</code> § 1). Le formulaire offre « Push and Open » (<code>TIPON</code>) par le filtre de sa ligne : ${esc(cas.find((c) => c.ptoAuChoix?.formulaire?.raison)?.ptoAuChoix.formulaire.raison.replace(/ — .*$/, '') ?? '?')}.</div>
<table><thead><tr><th>planche</th><th>page</th><th>C1</th><th>C2</th><th>C3</th><th>C4</th><th>façades du styler</th></tr></thead><tbody>
${fa}
</tbody></table>

<h3>Les situations</h3>
${cas.map(carte).join('\n')}

<p class="pied">Généré par <code>scripts/board-situations.mjs</code> (oaksome-front, cellule d10) depuis <code>${esc(board.situations)}</code> : par situation, trois pages du configurateur — la prise S16 (station site 16:9) en mode client avec les valeurs semées par l'adresse (<code>?banc=1</code>), puis le <code>form</code> résolu rejoué pour la S16 schéma et la S11 client — la capture du canvas et la caméra posée ; le badge, le prix et les réponses de <code>/api/foxcad/calcul/lot</code> tels que la page les a reçus ; le verdict par <code>scripts/board/verdict-porte.mjs</code> (la règle d’alignement), le trait et les pastilles par <code>scripts/board/annotation.mjs</code>, la préconfiguration par <code>scripts/board/preset.mjs</code> (testés : <code>scripts/tests/verdict-porte.test.mjs</code>, <code>scripts/tests/annotation.test.mjs</code>, <code>scripts/tests/preset.test.mjs</code>). Les PNG et les JPEG q92 pleine taille, propres (la matière des rendus Flora) et annotés : <code>${esc(board.sortie ?? '')}/&lt;cas&gt;/</code> sur le poste. Refaire la planche sans recapturer : <code>node scripts/board-situations.mjs --planche-seule</code>. Les données : <code>board.json</code> et <code>presets.json</code> à côté de cette page.</p>
</main></body></html>`
}
