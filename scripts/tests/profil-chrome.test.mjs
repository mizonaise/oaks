// Le Chrome des outils sur un PROFIL FIXE (ligne du lead à d10 24/09 10:1x ; incident du 24/09 08:15 : chaque Chrome lancé par Playwright
// sur un profil temporaire neuf fait un LogonUser qui échoue — 4625 — et dix échecs verrouillent le compte dorian de WIN-DORIAN-1). Mesuré
// le 24/09 à 10:38 : le premier lancement du profil fixe coûte un échec (Chrome garde dans `Local State` son test du mot de passe Windows,
// `password_manager.os_password_blank`), le second aucun. Ce test garde la règle : aucun script ne lance Chrome ailleurs que par
// `scripts/navigateur.mjs`, et le profil n'est jamais effacé, seulement ce qui est volatil. Sans navigateur.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PROFIL_DEFAUT, PROFILS, VOLATILS, dossierProfil, preparerProfil, profilDesArguments } from '../navigateur.mjs'

const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), '..')

async function fichiersMjs (dossier) {
  const sortie = []
  for (const e of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, e.name)
    if (e.isDirectory()) sortie.push(...(await fichiersMjs(chemin)))
    else if (/\.m?js$/.test(e.name)) sortie.push(chemin)
  }
  return sortie
}

test('aucun script ne lance Chrome sans le profil fixe : navigateur.mjs est le seul lanceur', async () => {
  const interdits = [
    [/\bchromium\s*\.\s*launch\s*\(/, 'chromium.launch( — un profil temporaire neuf'],
    [/\.\s*newContext\s*\(/, 'newContext( — un contexte sur un Chrome lancé ailleurs'],
    [/\blaunchPersistentContext\s*\(/, 'launchPersistentContext( hors de navigateur.mjs'],
    [/import\s*\{[^}]*\bchromium\b[^}]*\}\s*from\s*['"]playwright['"]/, 'chromium importé de playwright hors de navigateur.mjs']
  ]
  const fautes = []
  for (const f of await fichiersMjs(SCRIPTS)) {
    const nom = relative(SCRIPTS, f).replace(/\\/g, '/')
    if (nom === 'navigateur.mjs' || nom === 'tests/profil-chrome.test.mjs') continue
    const texte = await readFile(f, 'utf8')
    for (const [motif, dit] of interdits) if (motif.test(texte)) fautes.push(`${nom} : ${dit}`)
  }
  assert.deepEqual(fautes, [])
})

test('le dossier du profil : un nom, jamais un chemin', () => {
  assert.equal(PROFIL_DEFAUT, 'd10')
  assert.equal(dossierProfil(), join(PROFILS, 'd10'))
  assert.equal(dossierProfil('d10-board', 'C:/x'), join('C:/x', 'd10-board'))
  for (const mauvais of ['', '../d10', 'a/b', 'a\\b', 'a b', 'C:', null]) assert.throws(() => dossierProfil(mauvais), /refusé/, String(mauvais))
  assert.equal(profilDesArguments({}), 'd10')
  assert.equal(profilDesArguments({ 'profil-chrome': 'd10-b' }), 'd10-b')
  assert.equal(profilDesArguments({ 'profil-chrome': true }), 'd10', '--profil-chrome sans valeur : le défaut')
})

test('préparer le profil efface le volatil (cache, cookies, stockage) et garde Local State et les préférences', async () => {
  const dossier = await mkdtemp(join(tmpdir(), 'd10-profil-'))
  try {
    await writeFile(join(dossier, 'Local State'), '{"password_manager":{"os_password_blank":false}}')
    await mkdir(join(dossier, 'Default', 'Cache', 'Cache_Data'), { recursive: true })
    await writeFile(join(dossier, 'Default', 'Cache', 'Cache_Data', 'f_000001'), 'x')
    await mkdir(join(dossier, 'Default', 'Local Storage', 'leveldb'), { recursive: true })
    await mkdir(join(dossier, 'Default', 'Network'), { recursive: true })
    await writeFile(join(dossier, 'Default', 'Network', 'Cookies'), 'x')
    await writeFile(join(dossier, 'Default', 'Preferences'), '{}')
    await writeFile(join(dossier, 'lockfile'), '')
    const r = await preparerProfil(dossier)
    assert.equal(r.neuf, false, 'Local State présent : le profil a déjà servi')
    assert.ok(existsSync(join(dossier, 'Local State')), 'Local State garde le test du mot de passe')
    assert.ok(existsSync(join(dossier, 'Default', 'Preferences')))
    for (const v of ['Default/Cache', 'Default/Local Storage', 'Default/Network']) assert.ok(!existsSync(join(dossier, v)), v)
    assert.ok(!existsSync(join(dossier, 'lockfile')), 'un lockfile que personne ne tient est effacé')
    assert.ok(VOLATILS.every((v) => v.startsWith('Default/')), 'rien hors de Default/ n’est effacé')
    assert.ok(!VOLATILS.includes('Default/Preferences'))
  } finally {
    await rm(dossier, { recursive: true, force: true })
  }
  const vide = await mkdtemp(join(tmpdir(), 'd10-profil-'))
  try {
    assert.equal((await preparerProfil(join(vide, 'neuf'))).neuf, true, 'jamais lancé : le seul lancement qui coûte un échec')
  } finally {
    await rm(vide, { recursive: true, force: true })
  }
})
