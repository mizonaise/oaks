/**
 * LA CHARGE DU CLIC « Add to cart » (et du cœur) — ce que le configurateur poste au site (`window.parent.postMessage`, `ShapeConfigurator`
 * `buildMessagePayload`) et que le site garde dans Odoo. Mot de Dorian (24/09 11:0x) : « on doit pouvoir tout donner à Rachid : JSON, XML,
 * prix, photo, description… il le stocke dans Odoo » ; ligne du lead à d10 11:0x ; relevé oaksome-stack
 * `produits/hex/releves/2026-09-24_chaine-de-commande-configurateur-odoo-imos.md` § 3 ; le nôtre : `docs/releves/2026-09-24_charge-panier.md`.
 *
 * Les huit champs d'avant ne bougent pas (`action`, `name`, `pricing`, `form`, `description`, `shape`, `xmlFile`, `image` : le site lit
 * `data.image`, `data.xmlFile`, `data.pricing`, `data.shape`). Cinq s'ajoutent derrière eux, pour qu'une commande se rejoue à l'identique :
 *  - `totalPrice` : le HT de NOTRE moteur pour la configuration envoyée (`htDeLaReponse`) — `null` quand la dernière réponse de prix ne répond
 *    pas à cette configuration (un changement de moins d'une demi-seconde : l'anti-rebond et l'API) ; jamais le prix d'une autre ;
 *  - `details` : le HT par groupe de prix, tel que l'API le rend (groupes à 0 compris) — `null` dans le même cas ;
 *  - `tva`, `pays` : ceux du bandeau (l'adresse de l'iframe, sinon BE / 21 — décision A) : le TTC montré = arrondi2(totalPrice × (1 + tva / 100)) ;
 *  - `versions` : `arbre` — sha256 du JSON du formulaire servi par `/api/shape/product/<forme>`, 12 caractères : l'empreinte d'oaksome-stack
 *    et du board (`scripts/board/preset.mjs`) ; `forme` — sha256 du JSON CANONIQUE (clés triées) de la forme servie : l'API rend `cps`,
 *    `variables` et `descriptors` dans un ordre qui change d'une réponse à l'autre (mesuré le 24/09 sur 4848) ; `front` — le commit du front,
 *    gravé au build (`next.config.ts`).
 */
import { htDeLaReponse, type ReponsePrix } from '../prix/taxe'

/** les clés du message avant la ligne de 11:0x, dans leur ordre — le site les lit, elles ne bougent pas */
export const CLES_AVANT = ['action', 'name', 'pricing', 'form', 'description', 'shape', 'xmlFile', 'image'] as const
/** les clés ajoutées le 24/09, derrière les autres */
export const CLES_AJOUTEES = ['totalPrice', 'details', 'tva', 'pays', 'versions'] as const

export interface VersionsDeLaCharge {
  /** sha256 du JSON du formulaire servi, 12 caractères (l'empreinte d'oaksome-stack) ; `null` : pas de formulaire, ou pas de `crypto.subtle` */
  arbre: string | null
  /** sha256 du JSON canonique de la forme servie, 12 caractères ; `null` dans les mêmes cas */
  forme: string | null
  /** le commit du front (7 caractères, `-modifie` si le build partait d'un arbre modifié) ; `null` s'il n'a pas été gravé */
  front: string | null
}

export interface PrixDeLaCharge {
  totalPrice: number | null
  details: Record<string, number | null> | null
  tva: number
  pays: string
}

/** le prix de la charge : la réponse servie seulement si elle répond à la configuration envoyée (`aJour`, `usePricing`) */
export function prixDeLaCharge (reponse: ReponsePrix | undefined, aJour: boolean, taxe: { tva: number; pays: string }): PrixDeLaCharge {
  const servie = aJour && reponse ? reponse : null
  return {
    totalPrice: servie ? htDeLaReponse(servie) : null,
    details: servie?.details ?? null,
    tva: taxe.tva,
    pays: taxe.pays
  }
}

/** le JSON de `valeur`, les clés de chaque objet triées : le même texte quel que soit l'ordre où l'API les a rendues */
export function jsonCanonique (valeur: unknown): string {
  if (Array.isArray(valeur)) return `[${valeur.map((v) => (v === undefined ? 'null' : jsonCanonique(v))).join(',')}]`
  if (valeur !== null && typeof valeur === 'object') {
    const o = valeur as Record<string, unknown>
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${jsonCanonique(o[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(valeur) ?? 'null'
}

/**
 * sha256 d'un texte, 12 caractères hexadécimaux — `null` sans `crypto.subtle` : une page servie en http ailleurs que sur localhost n'est pas
 * un contexte sûr (le site et le VPS sont en https : l'empreinte y est toujours).
 */
export async function empreinte12 (texte: string | null): Promise<string | null> {
  if (texte === null) return null
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null
  const h = new Uint8Array(await subtle.digest('SHA-256', new TextEncoder().encode(texte)))
  return Array.from(h, (o) => o.toString(16).padStart(2, '0')).join('').slice(0, 12)
}

/** `arbre` et `forme` de ce que `/api/shape/product/<forme>` a servi (le formulaire peut manquer : `null`) */
export async function empreintesServies (form: unknown, shape: unknown): Promise<Pick<VersionsDeLaCharge, 'arbre' | 'forme'>> {
  const [arbre, forme] = await Promise.all([
    empreinte12(form === null || form === undefined ? null : JSON.stringify(form)),
    empreinte12(shape === null || shape === undefined ? null : jsonCanonique(shape))
  ])
  return { arbre, forme }
}

/** le commit gravé au build (`NEXT_PUBLIC_FRONT_COMMIT`, `next.config.ts`) : vide → `null` */
export function commitDuFront (brut: string | undefined = process.env.NEXT_PUBLIC_FRONT_COMMIT): string | null {
  const c = (brut ?? '').trim()
  return c === '' ? null : c
}
