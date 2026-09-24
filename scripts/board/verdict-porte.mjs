/**
 * LE VERDICT D'UNE PORTE : POIGNÉE OU PTO (d10) — la partie pure du board de situations (`scripts/board-situations.mjs`) : sans DOM, sans
 * navigateur, jouée par `scripts/tests/verdict-porte.test.mjs`.
 *
 * v3 (24/09, ligne du lead 07:5x) — LA RÈGLE DU REPLI EST L'ALIGNEMENT, PAS UN SEUIL. Le mot de Dorian (07:4x), devant le board (HEX 5, 6,
 * 16) : « les boutons ne peuvent pas descendre sous la ligne horizontale des autres — c'est à ce moment-là qu'on met un PTO sur les portes
 * qui ne peuvent pas avoir une poignée à la même hauteur que les autres ». Les trois lectures de la v1 / v2 (A « la ligne tient ou rien »,
 * B plancher 900, C la garde « 1 256 ») disparaissent : il reste UNE règle.
 *
 *  1. **La hauteur de la poignée d'une porte** est celle d'IMOS, relue par d3 (57 portes de 18 lots) et par d11 (`oaksome-stack/produits/
 *     hex/recettes/PTO-PORTE-COUPEE.md` § 1, la ligne GRIFF de `Pull_Middle` : `PULLHEIGHT = KI_PH_Bottom`, `HEIGHT 1050`, `DIST_TOP 500`,
 *     `DIST_BOT 200`) : **1 050 au-dessus du sol fini, bornée à 500 sous le haut de la porte à la ligne de la poignée** (la verticale à
 *     `PULL_X` du bord libre, le côté opposé aux charnières) et à 200 au-dessus du bas. Imos ne perce jamais dans la coupe : la poignée
 *     d'une porte coupée DESCEND.
 *  2. **La ligne de hauteur du meuble** : la hauteur imos de ses portes NON COUPÉES (un rectangle : 1 050 sur un meuble de hauteur
 *     normale ; plus bas sur un meuble bas, où la butée de 500 sous le haut joue pour toutes les portes à la fois — elles restent alignées
 *     entre elles). Une rangée sans porte non coupée prend la hauteur de sa porte la plus haute (dit dans le verdict). Les portes se rangent
 *     par leur bas (à `ECART_RANGEE` près) : les surmeubles d'un placard de 3 m sont une autre rangée que les portes du bas.
 *  3. **La porte orpheline** : sa poignée bornée par imos n'est pas SUR la ligne de sa rangée (à `TOLERANCE_LIGNE` près : le bruit des
 *     contours, jamais une tolérance de dessin — celle-là, si elle vient, est à Dorian), ou la porte n'a pas de poignée possible (moins de
 *     500 + 200 mm sur la ligne de la poignée, bord libre absent à cette hauteur) → **PTO-repli**.
 *  4. Inchangé : le choix du client (« Push and Open ») → **PTO-choix** pour toute porte ; la poignée intégrée (rainure) sur la ligne →
 *     « poignée intégrée » ; une **petite** porte (hauteur < `petite`, 800 mm par défaut — la borne est à nous, [À CONFIRMER] Dorian) n'est
 *     jamais en repli et ne fait pas la ligne.
 *  5. **La rangée sous la ligne d'imos** (d11 `sousLaNorme`, d2 : imos tient une ligne ABSOLUE à 1 050 ; oaksome-stack refuse un HEX de
 *     moins de 1 630) : quand la ligne d'une rangée est sous 1 050 (un meuble bas : toutes ses portes s'arrêtent à la même garde), une porte
 *     SUR cette ligne est « **à trancher** » — alignée si la ligne est celle du meuble, orpheline si elle est absolue : à Dorian, d11
 *     demande de ne pas l'étiqueter avant son mot. Une porte déjà orpheline sous la ligne du meuble l'est sous les deux lectures : PTO-repli.
 *
 * Le repère d'une porte ici : son contour projeté sur SA façade — `u` horizontal le long de la façade (mm, croissant vers la droite vue de
 * face), `v` la hauteur au-dessus du sol fini (mm).
 */

/** la règle de hauteur d'imos (`GRIFF.Pull_Middle`, `KI_PH_Bottom`) */
export const REGLE_IMOS = Object.freeze({ ligne: 1050, distTop: 500, distBot: 200 })

export const PETITE_DEFAUT = 800
/** « sur la ligne » : à 0,5 mm près — le bruit numérique des contours (sur le board du 24/09, l'orpheline la plus proche est à 30,5 mm) */
export const TOLERANCE_LIGNE = 0.5
/** deux portes sont de la même rangée quand leurs bas sont à moins de 100 mm l'un de l'autre */
export const ECART_RANGEE = 100
/** une porte est « coupée » quand son contour perd plus de 100 mm² sur son rectangle englobant (un triangle de 14 × 14 mm) */
export const AIRE_COUPE_MIN = 100

const EPS = 1e-6

/** les bornes d'un polygone { u, v } */
export function bornes (poly) {
  let uMin = Infinity
  let uMax = -Infinity
  let vMin = Infinity
  let vMax = -Infinity
  for (const p of poly) {
    if (p.u < uMin) uMin = p.u
    if (p.u > uMax) uMax = p.u
    if (p.v < vMin) vMin = p.v
    if (p.v > vMax) vMax = p.v
  }
  return { uMin, uMax, vMin, vMax, largeur: uMax - uMin, hauteur: vMax - vMin }
}

/** l'aire d'un polygone { u, v } (Gauss, valeur absolue) */
export function aire (poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    s += a.u * b.v - b.u * a.v
  }
  return Math.abs(s) / 2
}

/** une porte coupée : son contour n'est pas son rectangle englobant (la pente lui a pris un coin ou tout le haut) */
export function estCoupee (poly) {
  const b = bornes(poly)
  return b.largeur * b.hauteur - aire(poly) > AIRE_COUPE_MIN
}

/**
 * la coupe du polygone par la verticale `u` : le plus bas et le plus haut de ses intersections (le polygone d'une porte est convexe : un
 * segment) ; `null` si la verticale ne touche pas la porte. Une verticale sur un bord vertical rend ce bord entier.
 */
export function coupeVerticale (poly, u) {
  const vs = []
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % n]
    const du = b.u - a.u
    if (Math.abs(du) < EPS) {
      if (Math.abs(a.u - u) < 1e-3) vs.push(a.v, b.v)
      continue
    }
    const t = (u - a.u) / du
    if (t < -EPS || t > 1 + EPS) continue
    vs.push(a.v + t * (b.v - a.v))
  }
  if (!vs.length) return null
  return { bas: Math.min(...vs), haut: Math.max(...vs) }
}

/**
 * la hauteur de la poignée par la règle d'imos sur la verticale de la poignée `{ bas, haut }` : la ligne 1 050, bornée à `distTop` sous le
 * haut ; `contradiction` quand `haut − distTop` passe sous `bas + distBot` (les deux bornes ne tiennent pas ensemble : aucun lot ne l'a
 * mesuré, d11 § 6) ; `DIST_BOT` quand la ligne est sous le bas de la porte + 200 (une porte posée plus haut : un surmeuble)
 */
export function hauteurImos (coupe, regle = REGLE_IMOS) {
  if (!coupe) return { h: null, borne: 'hors-porte' }
  const plafond = coupe.haut - regle.distTop
  const plancherPorte = coupe.bas + regle.distBot
  if (plafond < plancherPorte) return { h: null, borne: 'contradiction', plafond, plancherPorte }
  if (regle.ligne > plafond) return { h: plafond, borne: 'DIST_TOP', plafond, plancherPorte }
  if (regle.ligne < plancherPorte) return { h: plancherPorte, borne: 'DIST_BOT', plafond, plancherPorte }
  return { h: regle.ligne, borne: 'ligne', plafond, plancherPorte }
}

/**
 * La géométrie de la poignée d'une porte : le bord libre, la ligne de la poignée, la coupe à cette ligne, la hauteur imos, le haut au bord
 * libre, coupée ou non. `porte` : { poly: [{u, v}], charnieres: 'gauche' | 'droite' | null, pullX } — sans côté de charnières (une porte
 * rectangulaire du designer), le bord libre est pris à droite : sur un rectangle le haut est le même partout.
 */
export function geometriePoignee (porte, regle = REGLE_IMOS) {
  const b = bornes(porte.poly)
  const libreADroite = porte.charnieres !== 'droite'
  const uLibre = libreADroite ? b.uMax : b.uMin
  const pullX = Number.isFinite(porte.pullX) ? porte.pullX : 0
  const uLigne = libreADroite ? uLibre - pullX : uLibre + pullX
  const coupe = coupeVerticale(porte.poly, uLigne)
  const bordLibre = coupeVerticale(porte.poly, libreADroite ? uLibre - 1e-3 : uLibre + 1e-3)
  const imos = hauteurImos(coupe, regle)
  // la poignée n'existe que si la porte existe à sa hauteur sur la verticale de la poignée ET au bord libre
  let possible = imos.h !== null
  let raison = null
  if (imos.h === null) {
    raison = imos.borne === 'contradiction'
      ? `la porte n’a pas ${regle.distTop} + ${regle.distBot} mm de haut sur la ligne de la poignée (haut ${fr(coupe?.haut)}, bas ${fr(coupe?.bas)})`
      : 'la ligne de la poignée ne coupe pas la porte'
  } else if (bordLibre && (imos.h > bordLibre.haut + EPS || imos.h < bordLibre.bas - EPS)) {
    possible = false
    raison = `le bord libre ne monte qu’à ${fr(bordLibre.haut)} : il n’existe pas à ${fr(imos.h)}`
  }
  return { bornes: b, libre: libreADroite ? 'droite' : 'gauche', uLibre, uLigne, coupe, bordLibre, imos, possible, raison, coupee: estCoupee(porte.poly) }
}

/** la valeur la plus fréquente d'une liste de hauteurs (à `TOLERANCE_LIGNE` près), la plus haute à fréquence égale */
function modeDesHauteurs (hs) {
  const classes = []
  for (const h of [...hs].sort((a, b) => b - a)) {
    const c = classes.find((x) => Math.abs(x.h - h) <= TOLERANCE_LIGNE)
    if (c) c.n++
    else classes.push({ h, n: 1 })
  }
  classes.sort((a, b) => b.n - a.n || b.h - a.h)
  return { h: classes[0]?.h ?? null, valeurs: classes.map((c) => c.h) }
}

/**
 * LES RANGÉES ET LEURS LIGNES : les portes groupées par leur bas (à `ECART_RANGEE` près, de bas en haut), et pour chaque rangée la ligne
 * de hauteur — la hauteur imos de ses portes non coupées (la plus fréquente ; `desaccord` si elles ne disent pas toutes la même), sinon
 * celle de sa porte la plus haute. Les petites portes ne font pas la ligne. Rend `{ rangees: [{ bas, portes: [indices], ligne, source,
 * desaccord }], parPorte: [indice de rangée] }`.
 */
export function rangeesEtLignes (portes, options = {}) {
  const petiteMax = Number.isFinite(options.petite) ? options.petite : PETITE_DEFAUT
  const g = portes.map((p) => geometriePoignee(p))
  const ordre = portes.map((_, i) => i).sort((a, b) => g[a].bornes.vMin - g[b].bornes.vMin)
  const rangees = []
  for (const i of ordre) {
    const bas = g[i].bornes.vMin
    const r = rangees.find((x) => Math.abs(x.bas - bas) <= ECART_RANGEE)
    if (r) r.portes.push(i)
    else rangees.push({ bas, portes: [i] })
  }
  const parPorte = []
  rangees.forEach((r, k) => {
    for (const i of r.portes) parPorte[i] = k
    const comptent = r.portes.filter((i) => g[i].bornes.hauteur >= petiteMax - EPS)
    const nonCoupees = comptent.filter((i) => !g[i].coupee && g[i].possible)
    if (nonCoupees.length) {
      const m = modeDesHauteurs(nonCoupees.map((i) => g[i].imos.h))
      r.ligne = m.h
      r.source = `la hauteur imos de ${nonCoupees.length} porte${nonCoupees.length > 1 ? 's' : ''} non coupée${nonCoupees.length > 1 ? 's' : ''}`
      r.desaccord = m.valeurs.length > 1 ? m.valeurs : null
    } else {
      const hs = comptent.filter((i) => g[i].possible).map((i) => g[i].imos.h)
      r.ligne = hs.length ? Math.max(...hs) : null
      r.source = hs.length ? 'aucune porte non coupée : la hauteur imos de la porte la plus haute' : 'aucune porte qui fasse la ligne (petites portes seulement)'
      r.desaccord = null
    }
    r.nonCoupees = nonCoupees.length
  })
  return { rangees, parPorte }
}

/**
 * LE VERDICT d'une porte sous la règle d'alignement. `porte` : { poly, charnieres, pullX, pullY } ; `contexte` : { choixPTO (le client a
 * pris « Push and Open »), integree (façade à poignée intégrée : rainure), pdf: { prevu, fa, raison }, formulaire: { offert } } ;
 * `options` : { ligne: { h, source, rangee } — la ligne de sa rangée (`rangeesEtLignes`), petite }.
 *
 * Rend l'étiquette — « poignée », « poignée intégrée », « PTO-repli », « PTO-choix », « poignée (petite porte) » —, `orpheline` (la
 * poignée n'est pas sur la ligne : vrai même quand le client a choisi la PTO, pour le dire), l'écart à la ligne, les mesures, la raison.
 */
export function verdictPorte (porte, contexte = {}, options = {}) {
  const petiteMax = Number.isFinite(options.petite) ? options.petite : PETITE_DEFAUT
  const g = geometriePoignee(porte)
  const petite = g.bornes.hauteur < petiteMax - EPS
  const ligne = options.ligne ?? { h: REGLE_IMOS.ligne, source: 'la ligne d’imos (aucune rangée donnée)', rangee: null }
  const h = g.imos.h
  const ecart = g.possible && Number.isFinite(ligne.h) ? h - ligne.h : null
  const surLaLigne = ecart !== null && Math.abs(ecart) <= TOLERANCE_LIGNE
  const orpheline = !petite && !surLaLigne
  // la rangée sous la ligne d'imos (un meuble bas) : une porte SUR la ligne du meuble est alignée, mais sous la ligne absolue d'imos
  const sousLaNorme = Number.isFinite(ligne.h) && ligne.h < REGLE_IMOS.ligne - TOLERANCE_LIGNE
  const aTrancher = !petite && surLaLigne && sousLaNorme
  let raison
  if (petite) raison = `petite porte (hauteur ${fr(g.bornes.hauteur)} < ${fr(petiteMax)}) : jamais en repli, elle ne fait pas la ligne${g.possible ? ` — poignée imos à ${fr(h)}` : ''}`
  else if (!g.possible) raison = `orpheline : ${g.raison}`
  else if (aTrancher) raison = `à trancher : sur la ligne du meuble (${fr(h)}, ${REGLE_IMOS.distTop} sous le haut ${fr(g.coupe.haut)} — toutes ses portes s’y arrêtent), mais sous la ligne d’imos ${fr(REGLE_IMOS.ligne)} : poignée si la ligne est celle du meuble, PTO si elle est absolue — à Dorian`
  else if (surLaLigne) raison = `sur la ligne : poignée à ${fr(h)} du sol${g.imos.borne === 'ligne' ? '' : ` (${g.imos.borne} : ${REGLE_IMOS.distTop} sous le haut ${fr(g.coupe.haut)})`}`
  else raison = `orpheline : poignée imos à ${fr(h)} (${g.imos.borne === 'DIST_TOP' ? `${REGLE_IMOS.distTop} sous le haut ${fr(g.coupe.haut)} à la ligne de la poignée` : g.imos.borne}), ${fr(Math.abs(ecart))} mm ${ecart < 0 ? 'SOUS' : 'AU-DESSUS DE'} la ligne ${fr(ligne.h)}`
  let etiquette
  if (contexte.choixPTO) etiquette = 'PTO-choix'
  else if (petite) etiquette = 'poignée (petite porte)'
  else if (orpheline) etiquette = 'PTO-repli'
  else if (aTrancher) etiquette = 'à trancher'
  else etiquette = contexte.integree ? 'poignée intégrée' : 'poignée'
  return {
    etiquette,
    orpheline,
    surLaLigne,
    sousLaNorme,
    petite,
    raison: contexte.choixPTO ? `« Push and Open » choisi par le client — ${raison}` : raison,
    ligne: { h: Number.isFinite(ligne.h) ? arr(ligne.h) : null, source: ligne.source ?? null, rangee: ligne.rangee ?? null },
    ecartALaLigne: ecart === null ? null : arr(ecart),
    mesures: {
      largeur: arr(g.bornes.largeur),
      hauteur: arr(g.bornes.hauteur),
      bas: arr(g.bornes.vMin),
      haut: arr(g.bornes.vMax),
      coupee: g.coupee,
      libre: g.libre,
      uLigne: arr(g.uLigne),
      pullX: porte.pullX ?? null,
      pullY: porte.pullY ?? null,
      basALaLigne: g.coupe ? arr(g.coupe.bas) : null,
      hautALaLigne: g.coupe ? arr(g.coupe.haut) : null,
      hautAuBordLibre: g.bordLibre ? arr(g.bordLibre.haut) : null,
      hauteurImos: h === null ? null : arr(h),
      borne: g.imos.borne
    },
    petiteMax,
    ptoAuChoix: { pdf: contexte.pdf ?? null, formulaire: contexte.formulaire ?? null }
  }
}

/**
 * les verdicts de toutes les portes d'un meuble : les rangées et leurs lignes d'abord, puis chaque porte contre la ligne de SA rangée.
 * Rend `{ verdicts, rangees }` (les rangées avec leur ligne, leur source et le compte des orphelines).
 */
export function jugerPortes (portes, contexte = {}, options = {}) {
  const { rangees, parPorte } = rangeesEtLignes(portes, options)
  const verdicts = portes.map((p, i) => {
    const r = rangees[parPorte[i]]
    return verdictPorte(p, contexte, { ...options, ligne: { h: r.ligne, source: r.source, rangee: parPorte[i] } })
  })
  return {
    verdicts,
    rangees: rangees.map((r, k) => ({
      rangee: k,
      bas: arr(r.bas),
      ligne: r.ligne === null ? null : arr(r.ligne),
      source: r.source,
      desaccord: r.desaccord ? r.desaccord.map(arr) : null,
      /** la ligne est sous celle d'imos (un meuble bas) : ses portes alignées sont « à trancher » (d11 `sousLaNorme`) */
      sousLaNorme: r.ligne !== null && r.ligne < REGLE_IMOS.ligne - TOLERANCE_LIGNE,
      portes: r.portes.length,
      nonCoupees: r.nonCoupees,
      orphelines: r.portes.filter((i) => verdicts[i].orpheline).length
    }))
  }
}

/** un nombre dit à la française (1 050 ; 994,2) — pour les raisons, jamais pour décider */
export function fr (x) {
  if (!Number.isFinite(x)) return '?'
  const [e, d] = String(Math.round(Math.abs(x) * 10) / 10).split('.')
  return `${x < 0 ? '−' : ''}${e.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${d ? ',' + d : ''}`
}

/** arrondi au dixième, pour dire (jamais pour décider) */
export function arr (x) {
  return Number.isFinite(x) ? Math.round(x * 10) / 10 : null
}

// --- la gamme : le PDF, la correspondance FR ↔ FA, le formulaire ------------------------------------------------------------------------

/** `COLLECTION_02` → 2 */
export const numeroCollection = (c) => {
  const m = /(\d+)\s*$/.exec(String(c ?? ''))
  return m ? Number(m[1]) : null
}

/** `FR_08_LAM` → `FR_08` */
export const frDe = (front) => {
  const m = /^(FR_\d{2})/.exec(String(front ?? ''))
  return m ? m[1] : null
}

/**
 * P p&o prévu par le PDF de la gamme pour cette façade et cette collection : `{ prevu, fa, source, raison }` — `prevu` null quand la
 * façade n'a pas de FA connu (le dire, ne pas deviner)
 */
export function ptoPrevuParLePdf (front, collection, gamme, correspondance) {
  const fr = frDe(front)
  const n = numeroCollection(collection)
  const entree = fr ? correspondance?.[fr] : null
  if (!entree) return { prevu: null, fa: null, source: null, raison: `${front ?? '?'} : aucun FA du PDF connu pour ${fr ?? '?'}` }
  const fa = (gamme?.facades ?? []).find((f) => f.fa === entree.fa)
  if (!fa) return { prevu: null, fa: entree.fa, source: entree.source, raison: `${entree.fa} absent du relevé du PDF` }
  const cols = fa.table['P p&o'] ?? []
  const prevu = n !== null && cols.includes(n)
  return {
    prevu,
    fa: entree.fa,
    source: entree.source,
    raison: `${entree.fa} (${entree.source}) : P p&o en collection${cols.length > 1 ? 's' : ''} ${cols.length ? cols.join(', ') : 'aucune'} — ${prevu ? 'prévu' : 'NON prévu'} en ${n ?? '?'}`
  }
}

/** « Push and Open » offert par le formulaire dans cette collection : la ligne `TIPON` de la source des poignées, son filtre `COLLECTION_nnX` */
export function ptoOffertParLeFormulaire (collection, poignees) {
  const tipon = (poignees ?? []).find((p) => p.value === 'TIPON')
  if (!tipon) return { offert: null, raison: 'pas de ligne TIPON dans la source des poignées' }
  const filtres = [].concat(tipon.data?.filter ?? [])
  const offert = filtres.includes(`${collection}X`)
  return { offert, raison: `TIPON « ${tipon.label} » filtré ${filtres.join(', ')} — ${offert ? 'offert' : 'NON offert'} en ${collection}` }
}

/**
 * la ligne attendue d'un cas (les situations de d11 du 23/09 : le Set, `HEX_H_court`, la poignée imos, ses lectures A / B / C) contre ce que
 * le board rend sur la même colonne. Sous l'alignement, on compare à la lecture **A** de d11 (« la ligne tient ou rien ») : sur un meuble
 * de hauteur normale — ses quatre situations le sont (2 500) — la ligne est 1 050 et « sur la ligne » est exactement A. La poignée est
 * comparée à 5 mm près (la porte de fox-cad n'est pas celle du modèle imos de d11 au millimètre : dit, pas caché).
 */
export function comparerAttendu (attendu, portes) {
  if (!attendu) return null
  const porte = portes.find((p) => p.zone.startsWith(`col. ${attendu.set - 1} `))
  if (!porte) return { attendu, conforme: false, texte: `aucune porte jugée au Set ${attendu.set}` }
  const lu = (x) => (x === 'PTO-repli' ? 'PTO' : x)
  const e = lu(porte.verdict.etiquette)
  const etiquetteOk = e === attendu.etiquettes.A
  const h = porte.verdict.mesures.hauteurImos
  const ecart = Number.isFinite(h) ? Math.round((h - attendu.poignee) * 10) / 10 : null
  const conforme = etiquetteOk && ecart !== null && Math.abs(ecart) <= 5
  const texte = `Set ${attendu.set} (${porte.zone}) : ${e}, poignée ${h} (attendu sous A, « la ligne tient ou rien » : ${attendu.etiquettes.A}, ${attendu.poignee} ; écart ${ecart === null ? '?' : (ecart > 0 ? '+' : '') + ecart} mm)`
  return { attendu, conforme, etiquetteOk, ecartPoignee: ecart, texte }
}

/** le compte des étiquettes d'un ensemble de verdicts */
export function compteEtiquettes (verdicts) {
  const c = {}
  for (const v of verdicts) c[v.etiquette] = (c[v.etiquette] ?? 0) + 1
  return c
}
