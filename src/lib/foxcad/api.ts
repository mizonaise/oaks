/**
 * L'API fox-cad, vue du navigateur : UN chemin relatif, `/api/foxcad/*`, relayé par Next (`next.config.ts`, rewrite vers
 * `NEXT_PUBLIC_FOXCAD_API` — en développement `http://127.0.0.1:4311`, en ligne `https://fox-cad.dormal.net/api`). Le front ne calcule
 * rien : `POST /calcul/lot` et rien d'autre ; quand l'API ne répond pas, on le dit à l'écran, on ne dessine pas de boîtes à la place.
 */
import { lireReponseLot, type DemandeCalculLot, type ReponseCalculLot } from './types'

export const CHEMIN_API_FOXCAD = '/api/foxcad'

export type ResultatLot = { ok: true; valeur: ReponseCalculLot; dureeMs: number } | { ok: false; message: string; statut: number | null }

export async function calculerLot(demande: DemandeCalculLot, signal?: AbortSignal): Promise<ResultatLot> {
  const adresse = `${CHEMIN_API_FOXCAD}/calcul/lot`
  const debut = Date.now()
  let rep: Response
  try {
    rep = await fetch(adresse, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(demande), cache: 'no-store', signal })
  } catch (e) {
    const cause = e instanceof Error ? e.message : String(e)
    return { ok: false, statut: null, message: `l’API fox-cad ne répond pas à ${adresse} — ${cause}` }
  }
  const texte = await rep.text()
  let corps: unknown
  try {
    corps = JSON.parse(texte)
  } catch {
    return { ok: false, statut: rep.status, message: `réponse illisible de ${adresse} (HTTP ${rep.status}) : ${texte.slice(0, 200)}` }
  }
  if (!rep.ok) {
    const e = (typeof corps === 'object' && corps !== null ? corps : {}) as { erreur?: unknown; message?: unknown }
    const message = typeof e.message === 'string' ? e.message : `HTTP ${rep.status} sur ${adresse}`
    return { ok: false, statut: rep.status, message: `${typeof e.erreur === 'string' ? `${e.erreur} — ` : ''}${message}` }
  }
  const lu = lireReponseLot(corps)
  if (!lu.ok) return { ok: false, statut: rep.status, message: `la réponse de ${adresse} ne suit pas le contrat fox-cad — ${lu.raison}` }
  return { ok: true, valeur: lu.valeur, dureeMs: Date.now() - debut }
}
