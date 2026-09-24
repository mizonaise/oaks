// La résolution publique des hôtes du média pour les navigateurs de capture (d10, 23/09 17:3x, ligne du lead : « la sonde qui dit la vérité
// depuis ce poste »). Les réponses sont celles mesurées d'ici le 23/09 : le DNS du réseau Tecnibo rend 192.168.30.92, le DNS sur HTTPS rend
// Cloudflare (104.21.77.66, 172.67.205.35). Aucun réseau dans ces tests : fetch, lookup et la vérification sont injectés.
//   node --test scripts/tests/resolveur-public.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  HOTES_MEDIA,
  adressePrivee,
  adressesDoH,
  argumentsChrome,
  lireOptionResolveur,
  resoudreDoH,
  resoudrePublic,
  resumeResolution,
} from '../resolveur-public.mjs'

/** la réponse JSON de cloudflare-dns.com du 23/09 pour media.tecnibo.com */
const REPONSE_CLOUDFLARE = {
  Status: 0,
  Answer: [
    { name: 'media.tecnibo.com', type: 1, TTL: 300, data: '104.21.77.66' },
    { name: 'media.tecnibo.com', type: 1, TTL: 300, data: '172.67.205.35' },
  ],
}
const reponse = (corps, status = 200) => ({ ok: status < 400, status, json: async () => corps })
const posteTecnibo = async () => [{ address: '192.168.30.92', family: 4 }]
const verifie = async () => ({ statut: 307, ms: 12 })

test('adresses privées au sens de Local Network Access : RFC 1918, bouclage, lien local ; le public passe', () => {
  for (const ip of ['192.168.30.92', '192.168.30.39', '10.0.0.1', '172.16.0.1', '172.31.255.254', '127.0.0.1', '169.254.1.1', '::1', 'fd00::1', 'fe80::1', '::ffff:192.168.1.1']) {
    assert.equal(adressePrivee(ip), true, ip)
  }
  for (const ip of ['104.21.77.66', '172.67.205.35', '172.15.0.1', '172.32.0.1', '1.1.1.1', '2606:4700::6810:4d42', 'pas-une-ip']) {
    assert.equal(adressePrivee(ip), false, ip)
  }
})

test('--resolveur : absent ou « public » = les hôtes du média ; « aucun » = le DNS du poste ; hôte=ip gardé tel quel (usage de d5)', () => {
  assert.deepEqual(lireOptionResolveur(undefined), HOTES_MEDIA.map((hote) => ({ hote })))
  assert.deepEqual(lireOptionResolveur(true), HOTES_MEDIA.map((hote) => ({ hote })))
  assert.deepEqual(lireOptionResolveur('public'), HOTES_MEDIA.map((hote) => ({ hote })))
  assert.equal(lireOptionResolveur('aucun'), null)
  assert.equal(lireOptionResolveur('poste'), null)
  assert.deepEqual(lireOptionResolveur('media.tecnibo.com=104.21.77.66'), [{ hote: 'media.tecnibo.com', ip: '104.21.77.66' }])
  assert.deepEqual(lireOptionResolveur('media.tecnibo.com, backend.tecnibo.com=172.67.205.35'), [
    { hote: 'media.tecnibo.com' },
    { hote: 'backend.tecnibo.com', ip: '172.67.205.35' },
  ])
  assert.throws(() => lireOptionResolveur('media.tecnibo.com=pas-une-ip'), /n'est pas une adresse IP/)
})

test('réponse DNS sur HTTPS : les A seulement (les CNAME passés), rien si le statut n’est pas 0', () => {
  assert.deepEqual(adressesDoH(REPONSE_CLOUDFLARE), [
    { ip: '104.21.77.66', ttl: 300 },
    { ip: '172.67.205.35', ttl: 300 },
  ])
  assert.deepEqual(adressesDoH({ Status: 0, Answer: [{ type: 5, TTL: 60, data: 'x.cdn.cloudflare.net.' }, { type: 1, TTL: 60, data: '104.21.77.66' }] }), [{ ip: '104.21.77.66', ttl: 60 }])
  assert.deepEqual(adressesDoH({ Status: 3 }), [])
  assert.deepEqual(adressesDoH(null), [])
})

test('DNS sur HTTPS : le premier fournisseur qui rend une adresse PUBLIQUE ; une réponse privée ou en erreur passe au suivant, et c’est dit', async () => {
  const appels = []
  const doh = await resoudreDoH('media.tecnibo.com', {
    fetch: async (url) => {
      appels.push(url)
      if (url.includes('cloudflare-dns.com')) return reponse({ Status: 0, Answer: [{ type: 1, TTL: 300, data: '192.168.30.92' }] })
      return reponse(REPONSE_CLOUDFLARE)
    },
  })
  assert.equal(appels.length, 2)
  assert.equal(doh.fournisseur, 'dns.google')
  assert.deepEqual(doh.adresses, ['104.21.77.66', '172.67.205.35'])
  assert.match(doh.essais[0], /cloudflare-dns\.com : aucune adresse publique \(192\.168\.30\.92\)/)

  const rien = await resoudreDoH('media.tecnibo.com', {
    fetch: async (url) => {
      if (url.includes('cloudflare-dns.com')) return reponse({}, 503)
      throw new Error('fetch failed')
    },
  })
  assert.deepEqual(rien, { fournisseur: null, adresses: [], essais: ['cloudflare-dns.com : HTTP 503', 'dns.google : fetch failed'] })
})

test('sur le réseau Tecnibo : la règle MAP vers l’adresse publique lue en DNS sur HTTPS, le DNS du poste relevé, la vérification gardée', async () => {
  const r = await resoudrePublic(lireOptionResolveur(undefined), { fetch: async () => reponse(REPONSE_CLOUDFLARE), lookup: posteTecnibo, verifier: verifie })
  assert.equal(r.mode, 'public')
  assert.equal(r.regles, 'MAP media.tecnibo.com 104.21.77.66')
  assert.deepEqual(r.echecs, [])
  assert.deepEqual(r.hotes[0].poste, { adresses: ['192.168.30.92'], privee: true })
  assert.equal(r.hotes[0].source, 'DNS sur HTTPS (cloudflare-dns.com)')
  assert.deepEqual(r.hotes[0].verification, { statut: 307, ms: 12 })
  assert.deepEqual(argumentsChrome(r), ['--host-resolver-rules=MAP media.tecnibo.com 104.21.77.66'])
  assert.match(resumeResolution(r), /media\.tecnibo\.com → 104\.21\.77\.66 \(DNS sur HTTPS \(cloudflare-dns\.com\) ; le poste rendait 192\.168\.30\.92, privée\) — répond 307/)
})

test('une ip donnée à la main ne consulte pas le DNS sur HTTPS', async () => {
  const r = await resoudrePublic(lireOptionResolveur('media.tecnibo.com=172.67.205.35'), {
    fetch: async () => assert.fail('le DNS sur HTTPS ne doit pas être appelé'),
    lookup: posteTecnibo,
    verifier: verifie,
  })
  assert.equal(r.regles, 'MAP media.tecnibo.com 172.67.205.35')
  assert.equal(r.hotes[0].source, 'donnée à la main')
})

test('aucune adresse publique lisible alors que le poste résout en privé : un échec nommé, aucune règle (à l’outil de s’arrêter)', async () => {
  const r = await resoudrePublic(lireOptionResolveur(undefined), { fetch: async () => { throw new Error('fetch failed') }, lookup: posteTecnibo, verifier: verifie })
  assert.equal(r.regles, null)
  assert.deepEqual(r.echecs, ['media.tecnibo.com'])
  assert.deepEqual(argumentsChrome(r), [])
  assert.match(resumeResolution(r), /AUCUNE adresse publique/)
  // hors du réseau Tecnibo, le poste rend déjà le public : pas d'échec, pas de règle
  const dehors = await resoudrePublic(lireOptionResolveur(undefined), {
    fetch: async () => { throw new Error('fetch failed') },
    lookup: async () => [{ address: '104.21.77.66', family: 4 }],
    verifier: verifie,
  })
  assert.deepEqual(dehors.echecs, [])
  assert.equal(dehors.regles, null)
})

test('« aucun » : le DNS du poste seulement relevé pour les hôtes du média, aucune règle', async () => {
  const r = await resoudrePublic(null, { fetch: async () => assert.fail('pas de DNS sur HTTPS'), lookup: posteTecnibo })
  assert.equal(r.mode, 'poste')
  assert.equal(r.regles, null)
  assert.deepEqual(argumentsChrome(r), [])
  assert.deepEqual(r.hotes, [{ hote: 'media.tecnibo.com', poste: { adresses: ['192.168.30.92'], privee: true } }])
  assert.match(resumeResolution(r), /le DNS du poste, sans règle \(192\.168\.30\.92, privée\)/)
})
