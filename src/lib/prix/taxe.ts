/**
 * Le prix affiché TTC au taux de la modale du site — décision A de Dorian (24/09 10:1x), la spéc : oaksome-stack
 * `produits/hex/releves/2026-09-24_prix-ttc-decision-A-contrat-site-configurateur.md`.
 *
 * Le site passe le pays et le taux dans l'adresse de l'iframe (`/shape/OS_SHAPE_F?id=1275000&pays=BE&tva=6`) ; absents (lien direct, mur
 * de revue, banc des cellules) : `BE` / `21`, dits comme tels. Ce ne sont PAS des champs du formulaire : ils ne sèment rien, en prod comme
 * en dev. L'API rend le HT (`totalPrice` depuis oaks_server `1338d50`, et `details`, le HT par groupe) : le bandeau et l'écran « Détail du
 * prix » l'affichent × (1 + tva / 100), arrondi au centime, avec l'étiquette « TTC 6 % » / « TTC 21 % ». Le message `addToCart` ne change
 * pas (le HT et le formulaire : le panier du site fait le TTC). Pas de promotion à l'affichage.
 */

export const PAYS_DEFAUT = 'BE'
export const TVA_DEFAUT = 21
/** les taux du contrat : ceux de la modale (6 % — habitation de plus de 10 ans —, 21 % sinon) ; un autre taux reste au défaut, dit */
export const TAUX_ADMIS: readonly number[] = [6, 21]

/** d'où vient une valeur : l'adresse, le défaut (absente), le défaut parce que la valeur de l'adresse sort du contrat */
export type Origine = 'adresse' | 'defaut' | 'refus'

export interface Taxe {
  /** ISO-2, en capitales */
  pays: string
  /** le taux en pour cent, entier */
  tva: number
  origine: { pays: Origine; tva: Origine }
}

export const TAXE_DEFAUT: Taxe = { pays: PAYS_DEFAUT, tva: TVA_DEFAUT, origine: { pays: 'defaut', tva: 'defaut' } }

/** `pays` et `tva` de l'adresse de la page (`window.location.search`) ; le défaut pour ce qui manque ou sort du contrat */
export function lireTaxe (recherche: string | URLSearchParams): Taxe {
  const p = typeof recherche === 'string' ? new URLSearchParams(recherche) : recherche
  const brutPays = p.get('pays')
  const brutTva = p.get('tva')
  const pays = (brutPays ?? '').trim().toUpperCase()
  const tva = /^\s*\d{1,2}\s*$/.test(brutTva ?? '') ? Number(brutTva) : NaN
  const paysLu = /^[A-Z]{2}$/.test(pays)
  const tvaLue = TAUX_ADMIS.includes(tva)
  return {
    pays: paysLu ? pays : PAYS_DEFAUT,
    tva: tvaLue ? tva : TVA_DEFAUT,
    origine: {
      pays: paysLu ? 'adresse' : brutPays === null ? 'defaut' : 'refus',
      tva: tvaLue ? 'adresse' : brutTva === null ? 'defaut' : 'refus'
    }
  }
}

/** un montant en euros × (1 + tva / 100), arrondi au centime (demi vers le haut), calculé en centimes sans le bruit des flottants */
export function ttc (ht: number, tva: number): number {
  const centimes = ht * (100 + tva)
  return Math.round(Number(centimes.toFixed(6))) / 100
}

/** « TTC 6 % » (espace fine insécable avant le signe, comme les nombres de `Intl` en fr-FR) */
export function etiquetteTaxe (tva: number): string {
  return `TTC ${tva} %`
}

/** ce que la réponse de l'API porte du prix (le type complet : `PricingResponse`, `tecniboApi.ts`) */
export interface ReponsePrix {
  totalPrice: number
  details?: Record<string, number | null> | null
  prices?: { price_ht?: number | null } | null
}

/**
 * le HT de la réponse : `totalPrice`, sauf si l'API remplit `prices` — du 10/09 au 21/09 (oaks_server `a218984`, retiré par `1338d50`) elle
 * rendait en tête le TTC réduit promotionné quand la requête portait un `country` : `prices.price_ht` est alors le HT. Jamais deux TVA.
 */
export function htDeLaReponse (r: ReponsePrix): number {
  const ht = r.prices?.price_ht
  return typeof ht === 'number' && Number.isFinite(ht) ? ht : r.totalPrice
}

export interface LigneDetail {
  /** le libellé du groupe tel que l'API l'envoie (le commentaire du descripteur de prix : « Carcase & Fittings », « Door », « Pose »…) */
  nom: string
  ht: number
  ttc: number
}

/** les groupes de `details` non nuls, dans l'ordre de l'API, chacun au même taux */
export function lignesDuDetail (details: ReponsePrix['details'], tva: number): LigneDetail[] {
  if (!details || typeof details !== 'object') return []
  const lignes: LigneDetail[] = []
  for (const [nom, ht] of Object.entries(details)) {
    if (typeof ht !== 'number' || !Number.isFinite(ht) || ht === 0) continue
    lignes.push({ nom, ht, ttc: ttc(ht, tva) })
  }
  return lignes
}

/** la somme des lignes, au centime */
export function sommeDesLignes (lignes: LigneDetail[]): number {
  return lignes.reduce((s, l) => s + Math.round(l.ttc * 100), 0) / 100
}
