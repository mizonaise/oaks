/**
 * LE MÉDIA PAR L'HÔTE (d5, 23/09/2026 16:5x, ligne du lead 16:3x : « portes blanches et colonnes coupées vides » en public après la repose
 * de `5830c30`, alors que 3026 en local est juste).
 *
 * Mesuré : ce n'était pas le code, c'était le RÉSEAU DU VISITEUR. Sur le réseau Tecnibo, `media.tecnibo.com` résout en 192.168.30.92 (DNS
 * scindé ; même une requête DNS adressée à 1.1.1.1 est interceptée), et Chrome refuse, depuis une page publique (`configurator.dormal.net`),
 * toute requête vers une adresse privée (Local Network Access) : les textures IVIS tombaient sur l'image de repli (le blanc), les GLB de
 * poignée et les portes texturées du designer d'Otman ne se chargeaient pas, les vignettes du formulaire étaient cassées. Hors de ce réseau,
 * tout se chargeait (Cloudflare). Une page servie depuis `localhost` (3025, 3026) n'est pas bloquée : d'où « local juste, public faux ».
 *
 * Le correctif : le navigateur ne parle plus au CDN, il demande le média À L'HÔTE qui sert la page — `/api/media/<chemin>`, relayé côté
 * serveur vers `https://media.tecnibo.com/<chemin>` par une réécriture de `next.config.ts`, comme les quatre API. Le serveur résout le CDN
 * avec SON DNS (Cloudflare sur le VPS, le nginx interne sur ce poste : mêmes fichiers, mêmes etags) ; le visiteur n'a plus d'adresse à
 * résoudre que celle de la page. Les adresses du CDN restent écrites telles quelles dans le code (et dans le designer d'Otman, code fermé) :
 * le `LoadingManager` par défaut de three les réécrit au chargement, un seul point pour tous les chargeurs (textures, GLB, `useTexture` /
 * `useGLTF` de drei, ceux du designer et de `special-kms` — un seul `three` dans `node_modules`).
 */
import { DefaultLoadingManager } from 'three'

/** la racine du CDN de Tecnibo, telle que le code et le designer d'Otman l'écrivent */
export const MEDIA_CDN = 'https://media.tecnibo.com/'

/** le relais de l'hôte : `next.config.ts` réécrit `/api/media/:path*` vers `MEDIA_CDN` */
export const RELAIS_MEDIA = '/api/media/'

/** une adresse du CDN devient la même adresse sous le relais de l'hôte (le reste du chemin, `%2F` compris, est gardé tel quel) ; les autres passent */
export function versRelais(url: string): string {
  return url.startsWith(MEDIA_CDN) ? `${RELAIS_MEDIA}${url.slice(MEDIA_CDN.length)}` : url
}

let installe = false

/** pose la réécriture sur le `LoadingManager` par défaut de three, une fois ; dans le navigateur seulement (le serveur ne charge rien) */
export function installerRelaisMedia(): void {
  if (installe || typeof window === 'undefined') return
  DefaultLoadingManager.setURLModifier(versRelais)
  installe = true
}
