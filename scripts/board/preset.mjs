/**
 * LA PRÉCONFIGURATION D'UNE SITUATION DU BOARD (d10, board v2, ligne du lead 23/09 22:4x) — la partie pure : sans DOM, sans navigateur,
 * jouée par `scripts/tests/preset.test.mjs`.
 *
 * Ce qu'est un preset (oaksome-stack `5a45f43`, `produits/hex/releves/2026-09-24_preconfigurations-du-site.md` § 1 et § 4) : une fiche
 * `product.template` d'Odoo publiée sur le site 10 « Oaksome » (la carte : nom, catégorie, dimensions, image, prix, `webpage_url` = le
 * configurateur qui l'ouvre) + un `form` sur sa variante (`config_json.form`), que le configurateur charge en valeurs initiales sous
 * `/shape/<forme>?id=<template>` — exactement le chemin de `?banc=1&CHAMP=valeur` (`ShapeConfigurator.tsx` : `initialValues` = le `form`
 * sauvé, puis l'adresse par-dessus). Ce module calcule ce qui se MESURE sur la page :
 *
 *  - le `form` : les champs de l'UTILISATEUR (hors `HIDEN_FIELDS`, les champs calculés d'Otman) tels que la page les a RÉSOLUS — pas les
 *    seules valeurs semées : un défaut qui change chez Otman changerait sinon le preset sans le dire ; avec le sha de l'arbre qui les a
 *    validés (le même calcul que `presets-depuis-board.mjs` d'oaksome-stack : sha256 du JSON du formulaire, 12 caractères) ;
 *  - les dimensions de la carte (cm) ; le prix HT (ce que la page affiche : le moteur, à quelques centimes) et TTC (la convention des cinq
 *    cartes d'Otman : la taxe 1427, 21 %) — la promotion du configurateur d'Otman dite à part ;
 *  - l'écart à la carte ACTUELLE du site de la même forme (dont les prix sont faux : oaksome-stack § 2).
 *
 * Le reste de la carte (nom, sous-titre, ordre, filtres, image choisie) est à Dorian : rien n'est inventé ici, un champ à lui reste `null`.
 */
import { createHash } from 'node:crypto'

/** le sha d'un arbre (le formulaire servi par `/api/shape/product/<forme>`) : sha256 de son JSON, 12 caractères — celui d'oaksome-stack */
export const sha12 = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 12)

/**
 * les champs du formulaire d'une forme, dans l'ordre de l'arbre : `{ nom, cache }` — `cache` = sous le nœud `HIDEN_FIELDS` (les champs
 * calculés, que le preset ne porte pas). Le parcours est celui de `presets-depuis-board.mjs` (les enfants de `configurator.items[0]`).
 */
export function champsDuFormulaire (form) {
  const champs = []
  const marcher = (it, sous) => {
    for (const c of it?.children ?? []) {
      const cache = sous || c.name === 'HIDEN_FIELDS'
      if (c.type === 'FIELD') champs.push({ nom: c.name, cache })
      marcher(c, cache)
    }
  }
  marcher(form?.configurator?.items?.[0], false)
  return champs
}

/** le `form` d'un preset : les champs de l'utilisateur (non cachés) et leur valeur RÉSOLUE par la page, les vides omis */
export function formDuPreset (valeurs, champs) {
  const form = {}
  for (const c of champs) {
    if (c.cache) continue
    const v = valeurs?.[c.nom]
    if (v === undefined || v === null || String(v) === '') continue
    form[c.nom] = String(v)
  }
  return form
}

/** les clés dont la valeur diffère entre deux jeux de valeurs (l'union des clés, comparées en texte) */
export function ecartsDeValeurs (a, b) {
  const cles = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])
  return [...cles].filter((k) => String(a?.[k] ?? '') !== String(b?.[k] ?? '')).sort()
}

/** les valeurs semées que la page a ramenées (une borne du formulaire, une option filtrée) : `CLÉ semé → rendu` */
export function replisDuSemis (semees, valeurs) {
  return Object.entries(semees ?? {})
    .filter(([k, v]) => valeurs?.[k] !== undefined && String(valeurs[k]) !== String(v))
    .map(([k, v]) => ({ cle: k, seme: String(v), rendu: String(valeurs[k]) }))
}

/**
 * les dimensions de la carte, en cm (la carte ne dit qu'une boîte L × H × P ; le configurateur ne les lit pas) — les champs de la forme,
 * comme oaksome-stack : F, HEX, HEX 2 `ZF_WIDTH` / `ZF_HEIGHT` / `ZF_DEPTH` ; le L ses deux ailes (`ZL_WIDTH` + `ZM_WIDTH`, `OV_HEIGHT`,
 * `ZL_DEPTH`) ; `null` sans ces champs
 */
export function dimensionsCm (valeurs) {
  const cm = (mm) => {
    const n = Number(mm)
    return Number.isFinite(n) && String(mm ?? '').trim() !== '' ? Math.round(n / 10) : null
  }
  const v = valeurs ?? {}
  if (v.ZF_WIDTH !== undefined) return { largeur: cm(v.ZF_WIDTH), hauteur: cm(v.ZF_HEIGHT), profondeur: cm(v.ZF_DEPTH) }
  if (v.ZL_WIDTH !== undefined) return { largeur: cm(v.ZL_WIDTH), aile: cm(v.ZM_WIDTH), hauteur: cm(v.OV_HEIGHT), profondeur: cm(v.ZL_DEPTH) }
  return null
}

/** le prix affiché par la page (« 3 274,66 € », espaces fines ou insécables) → 3274.66 ; `null` s'il n'y a pas de nombre */
export function lirePrix (texte) {
  const s = String(texte ?? '').replace(/[\s  €]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null
  return Number(s)
}

const arrondi2 = (n) => Math.round(n * 100) / 100

/** la convention de prix des cartes (oaksome-stack § 2 et § 3.3) : la TVA de la taxe 1427 ; la promotion du configurateur d'Otman */
export const CONVENTION = Object.freeze({
  tva: 0.21,
  taxe: '1427 « 21 % » (HT, la convention des cinq cartes d’Otman : × 1,21 à l’affichage)',
  promotion: 0.72,
  promotionTexte: 'le configurateur d’Otman affiche le TTC après deux promotions (Rentrée −10 %, Fin de Saison −20 % : × 0,72, jusqu’au 30/09) ; la carte non'
})

/** le prix d'un preset : HT (la page), TTC, TTC après la promotion du configurateur d'Otman */
export function prixDuPreset (ht, convention = CONVENTION) {
  if (!Number.isFinite(ht)) return { ht: null, ttc: null, ttcPromotion: null }
  const ttc = arrondi2(ht * (1 + convention.tva))
  return { ht: arrondi2(ht), ttc, ttcPromotion: arrondi2(ttc * convention.promotion) }
}

/** la carte ACTUELLE du site pour une forme (`cartes` : le relevé du site, `scripts/situations/cartes-du-site-*.json`), ou `null` */
export function carteDeLaForme (forme, cartes) {
  return (cartes?.cartes ?? []).find((c) => c.forme === forme) ?? null
}

/**
 * l'écart entre le prix d'un preset et ce que dit la carte actuelle de sa forme (« À partir de {price_ttc} € », sans dire HT ni TTC) :
 * au TTC (ce que la carte prétend être) et au HT (ce qu'elle est pour F, U, CMB : le HT par défaut présenté comme un TTC) ; `null` sans
 * carte
 */
export function ecartALaCarte (prix, carte) {
  if (!carte || !Number.isFinite(prix?.ttc)) return null
  return {
    template_id: carte.template_id,
    nom: carte.nom,
    prixCarte: carte.prix_carte,
    ecartTtc: arrondi2(prix.ttc - carte.prix_carte),
    ecartHt: arrondi2(prix.ht - carte.prix_carte),
    sousLaCarte: prix.ttc < carte.prix_carte
  }
}

/** l'adresse du configurateur que la carte ouvre : `https://<hôte>/shape/<forme>` SANS paramètre (le site ajoute `id` — oaksome-stack § 3.4) */
export function webpageUrl (forme, hotes) {
  const h = hotes?.[forme]
  return h ? `https://${h}/shape/${forme}` : null
}

/**
 * le recoupement avec la preuve à blanc d'oaksome-stack (`presets-depuis-board.mjs` : SON `form` résolu par la réplique du previewer, SON
 * prix HT au moteur, le mur de HEX / HEX 2 sur l'arbre de son dépôt) pour la même situation ; `null` sans elle
 */
export function recoupement (form, prixHt, p) {
  if (!p) return null
  const ecarts = ecartsDeValeurs(form, p.form)
  return {
    arbre: p.arbre?.sha12 ?? null,
    origine: p.arbre?.origine ?? null,
    formIdentique: ecarts.length === 0,
    nEcarts: ecarts.length,
    ecarts: ecarts.slice(0, 12).map((k) => ({ cle: k, page: form?.[k] ?? null, stack: p.form?.[k] ?? null })),
    prixHt: Number.isFinite(p.prix?.ht) ? p.prix.ht : null,
    ecartPrixHt: Number.isFinite(prixHt) && Number.isFinite(p.prix?.ht) ? arrondi2(prixHt - p.prix.ht) : null,
    mur: p.mur && typeof p.mur === 'object' ? { refus: p.mur.refus, regles: p.mur.regles ?? [] } : null,
    pto: p.pto ?? null
  }
}

/**
 * le preset d'un cas du board : ce qui se mesure (form, arbre, rejeu, dimensions, prix, écart à la carte, images, verdicts) et les champs
 * de la carte laissés à Dorian. `mesures` : `{ forme, valeurs, semees, prixTexte, prixHt, champs, arbre, rejeu, images, pto, stack }` —
 * `stack` : la situation dans la preuve à blanc d'oaksome-stack (facultative) ; `prixHt` : le `data-prix-ht` du bandeau (décision A du 24/09 :
 * le bandeau dit le TTC au taux de l'adresse) — absent, le texte du bandeau est le HT (les builds d'avant).
 */
export function presetDuCas (mesures, cartes) {
  const { forme, valeurs, semees, prixTexte, prixHt, champs, arbre, rejeu, images, pto, stack } = mesures
  const form = formDuPreset(valeurs, champs ?? [])
  const htDuBandeau = Number.isFinite(prixHt)
  const prix = prixDuPreset(htDuBandeau ? prixHt : lirePrix(prixTexte))
  const carte = carteDeLaForme(forme, cartes)
  const recoupe = recoupement(form, prix.ht, stack)
  return {
    etat: 'proposé',
    forme,
    configurateur: webpageUrl(forme, cartes?.hotes),
    arbre,
    form,
    champs: Object.keys(form).length,
    replis: replisDuSemis(semees, valeurs),
    rejeu: rejeu ?? null,
    dimensionsCm: dimensionsCm(valeurs),
    prix: { ...prix, source: htDuBandeau ? 'le HT du bandeau de la page (data-prix-ht ; son texte dit le TTC au taux de l’adresse depuis le 24/09)' : 'la barre de prix de la page (le moteur, HT)', taxe: CONVENTION.taxe, promotion: CONVENTION.promotionTexte },
    carteActuelle: carte ? { ...ecartALaCarte(prix, carte), lecture: carte.lecture ?? null, defautHt: carte.defautHt ?? null } : null,
    images: images ?? null,
    verdicts: {
      pto: pto ?? null,
      mur: recoupe?.mur ? { ...recoupe.mur, arbre: recoupe.arbre, source: 'oaksome-stack, presets-depuis-board.mjs (l’arbre de son dépôt)' } : null,
      imos: 'non compilé (aucun lot d’Astra par situation)'
    },
    recoupement: recoupe,
    carte: { nom: null, sous_titre: null, categorie: carte?.categorie ?? 'Placards', sequence: null, is_new: null, filtres: null, a_remplir: 'Dorian' },
    odoo: { template_id: null, variant_id: null }
  }
}
