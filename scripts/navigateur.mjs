/**
 * LE CHROME DES OUTILS, TOUJOURS SUR UN PROFIL FIXE (ligne du lead à d10 24/09 10:1x ; incident du 24/09 08:15, `orchestre/revues/2026-09-24_
 * lettres-dessin-2309.md` « Incident de séance ») — le seul endroit de `scripts/` qui lance un navigateur.
 *
 * Un Chrome lancé par Playwright sur un profil temporaire neuf (`chromium.launch()`) fait, dans la seconde, un `LogonUser` qui échoue
 * (journal de sécurité : 4625, `chrome.exe`, ouverture de type 2) : Chrome teste, au premier lancement d'un profil, si le mot de passe Windows
 * est vide, et garde la réponse dans le profil. Dix échecs en dix minutes verrouillent le compte `dorian` de WIN-DORIAN-1 dix minutes (4740 :
 * le RDP de Dorian refusé, les ssh qui arrivent refusés) — trois verrous le 24/09 avant 10:00. Un profil GARDÉ ne refait pas le test : au plus
 * un échec, au tout premier lancement de son dossier.
 *
 * Donc : `chromium.launchPersistentContext` sur un dossier fixe (`PROFILS/<nom>`, `d10` par défaut ; `OAKS_PROFILS_CHROME` pour un autre
 * parent). Une capture ne doit rien à la précédente : avant chaque lancement, le cache, les cookies et le stockage des pages sont effacés du
 * profil (`VOLATILS`) — le reste (`Local State`, `Default/Preferences`, où Chrome garde son test) ne bouge pas. Un profil ne sert qu'à un
 * Chrome à la fois : s'il est déjà ouvert, le lancement s'arrête (jamais de repli sur un profil neuf) ; un autre nom (`--profil-chrome=…`)
 * coûte UN échec, à son premier lancement.
 *
 *   const contexte = await lancerChrome({ channel: 'chrome', args: [...], viewport: { width: 1600, height: 900 } })
 *   const page = await contexte.newPage()   // … ; contexte.close() ferme Chrome
 */
import { existsSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

/** le parent des profils : `%LOCALAPPDATA%\oaksome-front\profils-chrome` (hors de `_out`, qu'on nettoie), ou `OAKS_PROFILS_CHROME` */
export const PROFILS = resolve(
  process.env.OAKS_PROFILS_CHROME ?? join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'oaksome-front', 'profils-chrome')
)
export const PROFIL_DEFAUT = 'd10'

/** ce qu'une capture ne doit pas hériter de la précédente : effacé avant chaque lancement (le profil lui-même reste) */
export const VOLATILS = [
  'Default/Cache',
  'Default/Code Cache',
  'Default/GPUCache',
  'Default/DawnGraphiteCache',
  'Default/DawnWebGPUCache',
  'Default/Network',
  'Default/Local Storage',
  'Default/Session Storage',
  'Default/IndexedDB',
  'Default/Service Worker',
  'Default/Storage',
  'Default/File System',
  'Default/WebStorage',
  'Default/blob_storage',
  'Default/shared_proto_db'
]

/** le dossier du profil `nom` (lettres, chiffres, `-`, `_` : jamais un chemin) */
export function dossierProfil (nom = PROFIL_DEFAUT, parent = PROFILS) {
  const n = String(nom ?? '').trim()
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(n)) throw new Error(`nom de profil Chrome refusé : « ${nom} » (lettres, chiffres, - et _ seulement)`)
  return join(parent, n)
}

/**
 * efface du profil ce qui est volatil (`VOLATILS`) et vérifie qu'aucun Chrome ne le tient : sous Windows, Chrome garde `lockfile` ouvert
 * sans partage d'effacement tant qu'il tourne. Rend `{ dossier, neuf }` — `neuf` : jamais lancé (le seul lancement qui coûte un échec).
 */
export async function preparerProfil (dossier) {
  await mkdir(dossier, { recursive: true })
  const neuf = !existsSync(join(dossier, 'Local State'))
  const verrou = join(dossier, 'lockfile')
  try {
    if (existsSync(verrou)) await rm(verrou, { force: true })
    for (const v of VOLATILS) await rm(join(dossier, v), { recursive: true, force: true, maxRetries: 2 })
  } catch (e) {
    throw new Error(`le profil Chrome ${dossier} est ouvert par un autre Chrome (${e.code ?? e.message}) — un Chrome à la fois par profil ; fermer l'autre, ou --profil-chrome=<autre nom> (UN échec LogonUser à son premier lancement)`)
  }
  return { dossier, neuf }
}

/**
 * Chrome sur le profil fixe `profil` : le contexte PERSISTANT de Playwright (`contexte.newPage()` pour une page, `contexte.close()` ferme
 * Chrome). Les autres options sont celles de `launchPersistentContext` (`channel`, `args`, `viewport`…) ; `deviceScaleFactor` vaut 1 par défaut.
 */
export async function lancerChrome ({ profil = PROFIL_DEFAUT, ...options } = {}) {
  const { dossier, neuf } = await preparerProfil(dossierProfil(profil))
  if (neuf) console.log(`→ Chrome : profil fixe NEUF ${dossier} (son premier lancement : un seul échec LogonUser attendu, puis aucun)`)
  try {
    return await chromium.launchPersistentContext(dossier, { deviceScaleFactor: 1, ...options })
  } catch (e) {
    throw new Error(`Chrome sur le profil fixe ${dossier} : ${String(e?.message ?? e).split('\n')[0]} — un Chrome à la fois par profil ; jamais de repli sur un profil temporaire`)
  }
}

/** `--profil-chrome=<nom>` des lignes de commande (le défaut sinon) */
export function profilDesArguments (args) {
  const v = args?.['profil-chrome']
  return typeof v === 'string' && v ? v : PROFIL_DEFAUT
}
