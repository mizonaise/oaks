#!/usr/bin/env node
/**
 * L'adresse PUBLIQUE des hôtes du média, pour les navigateurs de capture (d10, 23/09/2026, ligne du lead 17:3x).
 *
 *   node scripts/resolveur-public.mjs [hôte …]     → ce que résout ce poste, ce que dit le DNS sur HTTPS, la vérification
 *
 * Sur le réseau Tecnibo (WIN-DORIAN-1, WIN-JONES, le bureau), `media.tecnibo.com` résout en 192.168.30.92 : DNS scindé, et le réseau
 * intercepte même une requête adressée à 1.1.1.1 ou 8.8.8.8. Depuis une page PUBLIQUE, Chrome refuse alors toute requête vers cette
 * adresse privée (Local Network Access) : textures sur l'image de repli (le blanc), GLB de poignée et vignettes absents — une capture
 * faite d'ici ne montre pas ce que voit un visiteur (la fausse alerte du 23/09 16:3x, mesurée par d5). Le DNS sur HTTPS passe : l'adresse
 * publique y est relue à chaque lancement (jamais écrite en dur : Cloudflare peut en changer) et donnée à Chrome par
 * `--host-resolver-rules`. Le relevé dit d'où vient chaque adresse, ce que rendait le DNS du poste, et si l'hôte répond bien à cette
 * adresse (une requête HTTPS qui présente son nom : le certificat le prouve).
 *
 * L'option des outils, `--resolveur` :
 *   public (le défaut de capture-pipeline)   les hôtes du média (`HOTES_MEDIA`) par le DNS sur HTTPS : ce que voit un visiteur
 *   aucun                                    le DNS du poste, sans règle : ce que voit un navigateur SUR le réseau Tecnibo
 *   hôte[=ip][,hôte…]                        ces hôtes ; une ip donnée est prise telle quelle, sinon le DNS sur HTTPS
 */
import { lookup } from 'node:dns/promises'
import { request } from 'node:https'
import { isIP } from 'node:net'
import { pathToFileURL } from 'node:url'

/** les hôtes que le DNS du réseau Tecnibo rend en adresse privée (mesuré le 23/09 : le CDN des textures, des GLB et des vignettes) */
export const HOTES_MEDIA = ['media.tecnibo.com']

/** les résolveurs DNS sur HTTPS, dans l'ordre (réponse JSON : `Answer[]`, `type` 1 = A) */
export const FOURNISSEURS_DOH = [
  { nom: 'cloudflare-dns.com', url: (hote) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hote)}&type=A` },
  { nom: 'dns.google', url: (hote) => `https://dns.google/resolve?name=${encodeURIComponent(hote)}&type=A` },
]

/** une adresse que Local Network Access tient pour locale : RFC 1918, bouclage, lien local ; en IPv6 ::1, fc00::/7, fe80::/10 */
export const adressePrivee = (ip) => {
  const x = String(ip).toLowerCase()
  if (isIP(x) === 4) {
    const [a, b] = x.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  }
  if (isIP(x) === 6) {
    if (x.startsWith('::ffff:') && isIP(x.slice(7)) === 4) return adressePrivee(x.slice(7))
    return x === '::' || x === '::1' || /^f[cd]/.test(x) || /^fe[89ab]/.test(x)
  }
  return false
}

/**
 * `--resolveur` lu : `null` = le DNS du poste, aucune règle ; sinon les hôtes à résoudre publiquement, avec `ip` quand elle est donnée
 * à la main (l'usage de d5 du 23/09 : `media.tecnibo.com=104.21.77.66`). Sans valeur : les hôtes du média.
 */
export const lireOptionResolveur = (valeur) => {
  if (valeur === undefined || valeur === null || valeur === true) return HOTES_MEDIA.map((hote) => ({ hote }))
  const texte = String(valeur).trim()
  if (texte === '' || /^public$/i.test(texte)) return HOTES_MEDIA.map((hote) => ({ hote }))
  if (/^(aucun|poste|systeme|système|non)$/i.test(texte)) return null
  return texte
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [hote, ip] = s.split('=').map((x) => x.trim())
      if (!hote) throw new Error(`--resolveur : hôte vide dans « ${s} »`)
      if (ip !== undefined && !isIP(ip)) throw new Error(`--resolveur : « ${ip} » n'est pas une adresse IP (« ${s} »)`)
      return ip ? { hote, ip } : { hote }
    })
}

/** les adresses IPv4 d'une réponse DNS sur HTTPS en JSON (les CNAME de la chaîne sont passés), avec leur durée de vie */
export const adressesDoH = (json) =>
  json?.Status === 0 && Array.isArray(json.Answer) ? json.Answer.filter((r) => r.type === 1 && isIP(r.data) === 4).map((r) => ({ ip: r.data, ttl: r.TTL })) : []

/** l'hôte par le DNS sur HTTPS : le premier fournisseur qui rend une adresse publique ; chaque essai manqué est gardé */
export const resoudreDoH = async (hote, { fetch: chercher = fetch, delaiMs = 8000 } = {}) => {
  const essais = []
  for (const fournisseur of FOURNISSEURS_DOH) {
    try {
      const r = await chercher(fournisseur.url(hote), { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(delaiMs) })
      if (!r.ok) {
        essais.push(`${fournisseur.nom} : HTTP ${r.status}`)
        continue
      }
      const adresses = adressesDoH(await r.json())
      const publiques = adresses.filter((a) => !adressePrivee(a.ip))
      if (publiques.length) return { fournisseur: fournisseur.nom, adresses: publiques.map((a) => a.ip), ttl: Math.min(...publiques.map((a) => a.ttl)), essais }
      essais.push(`${fournisseur.nom} : aucune adresse publique (${adresses.map((a) => a.ip).join(', ') || 'réponse vide'})`)
    } catch (e) {
      essais.push(`${fournisseur.nom} : ${e?.message ?? e}`)
    }
  }
  return { fournisseur: null, adresses: [], essais }
}

/** l'hôte répond-il à cette adresse ? Une requête HTTPS HEAD qui présente son nom : sans certificat valide pour ce nom, pas de réponse */
export const verifierAdresse = (hote, ip, { delaiMs = 8000, chemin = '/' } = {}) =>
  new Promise((fin) => {
    const debut = Date.now()
    const famille = isIP(ip)
    const req = request(
      {
        host: hote,
        servername: hote,
        path: chemin,
        method: 'HEAD',
        agent: false,
        timeout: delaiMs,
        lookup: (_hote, options, rappel) => (options?.all ? rappel(null, [{ address: ip, family: famille }]) : rappel(null, ip, famille)),
      },
      (res) => {
        res.resume()
        fin({ statut: res.statusCode, ms: Date.now() - debut })
      },
    )
    req.on('timeout', () => req.destroy(new Error(`pas de réponse en ${delaiMs} ms`)))
    req.on('error', (e) => fin({ erreur: String(e?.message ?? e), ms: Date.now() - debut }))
    req.end()
  })

/** ce que rend le DNS du poste : les adresses, et si l'une est privée */
const resoudrePoste = async (hote, chercher) => {
  try {
    const adresses = (await chercher(hote, { all: true })).map((a) => a.address)
    return { adresses, privee: adresses.some(adressePrivee) }
  } catch (e) {
    return { erreur: e?.code ?? String(e?.message ?? e) }
  }
}

/**
 * Pour chaque hôte : ce que rend le DNS du poste, l'adresse publique retenue (donnée à la main, sinon la première du DNS sur HTTPS), sa
 * vérification. `regles` = la valeur de `--host-resolver-rules` (null : aucune) ; `echecs` = les hôtes que le poste ne résout pas en
 * public et dont aucune adresse publique n'a pu être lue — une capture ne dirait pas la vérité, à l'outil de s'arrêter.
 * `specs` null (`--resolveur=aucun`) : le DNS du poste est seulement relevé, pour les hôtes du média.
 */
export const resoudrePublic = async (specs, { fetch: chercher = fetch, lookup: chercherPoste = lookup, verifier = verifierAdresse } = {}) => {
  if (!specs) {
    const hotes = []
    for (const hote of HOTES_MEDIA) hotes.push({ hote, poste: await resoudrePoste(hote, chercherPoste) })
    return { mode: 'poste', hotes, regles: null, echecs: [] }
  }
  const hotes = []
  for (const { hote, ip } of specs) {
    const entree = { hote, poste: await resoudrePoste(hote, chercherPoste) }
    if (ip) Object.assign(entree, { adresse: ip, source: 'donnée à la main' })
    else {
      entree.doh = await resoudreDoH(hote, { fetch: chercher })
      if (entree.doh.adresses.length) Object.assign(entree, { adresse: entree.doh.adresses[0], source: `DNS sur HTTPS (${entree.doh.fournisseur})` })
    }
    if (entree.adresse) entree.verification = await verifier(hote, entree.adresse)
    hotes.push(entree)
  }
  const regles = hotes.filter((h) => h.adresse).map((h) => `MAP ${h.hote} ${h.adresse}`).join(', ') || null
  const echecs = hotes.filter((h) => !h.adresse && h.poste.privee !== false).map((h) => h.hote)
  return { mode: 'public', hotes, regles, echecs }
}

/** les arguments de lancement de Chrome : la règle de résolution, s'il y en a une */
export const argumentsChrome = (resolution) => (resolution?.regles ? [`--host-resolver-rules=${resolution.regles}`] : [])

/** une ligne par hôte, pour la console et les relevés */
export const resumeResolution = (resolution) => {
  const poste = (p) => (p?.adresses ? `${p.adresses.join(', ')}${p.privee ? ', privée' : ''}` : `échec ${p?.erreur ?? '?'}`)
  if (resolution.mode === 'poste') {
    return resolution.hotes.map((h) => `${h.hote} → le DNS du poste, sans règle (${poste(h.poste)})`).join(' ; ')
  }
  return resolution.hotes
    .map((h) => {
      if (!h.adresse) return `${h.hote} → AUCUNE adresse publique (${(h.doh?.essais ?? []).join(' ; ')}) ; le poste rend ${poste(h.poste)}`
      const v = h.verification ?? {}
      const verif = v.statut ? `répond ${v.statut} en ${v.ms} ms` : `NE RÉPOND PAS : ${v.erreur ?? '?'}`
      return `${h.hote} → ${h.adresse} (${h.source} ; le poste rendait ${poste(h.poste)}) — ${verif}`
    })
    .join(' ; ')
}

// --- en ligne de commande : la résolution vue d'ici ------------------------------------------------------------------------------------

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hotes = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const resolution = await resoudrePublic(hotes.length ? lireOptionResolveur(hotes.join(',')) : lireOptionResolveur(undefined))
  console.log(JSON.stringify(resolution, null, 2))
  console.log(`\n${resumeResolution(resolution)}\n--host-resolver-rules : ${resolution.regles ?? '(aucune)'}`)
  process.exit(resolution.echecs.length ? 2 : 0)
}
