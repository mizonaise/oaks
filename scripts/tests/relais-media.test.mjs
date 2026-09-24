// Le média de Tecnibo par l'hôte de la page (d5, 23/09 16:5x, ligne du lead 16:3x : « portes blanches » en public, mesurées depuis le réseau
// Tecnibo où `media.tecnibo.com` résout en une adresse privée que Chrome refuse à une page publique). Les adresses sont celles que le front
// et le designer d'Otman chargent réellement (relevé docs/releves/2026-09-23_regression-publique-5830c30/, journal réseau du geste).
// Joué par `npm test` (node --test ; node 24 lit le TypeScript sans outil).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DefaultLoadingManager } from 'three'
import { installerRelaisMedia, MEDIA_CDN, RELAIS_MEDIA, versRelais } from '../../src/lib/media/relais.ts'

test('une adresse du CDN passe par le relais de l’hôte, chemin gardé tel quel (%2F compris)', () => {
  assert.equal(versRelais('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/IVIS%2FEG_F416.jpg/public'), '/api/media/aYYmWUcv7lRhpLdU4ojPsA/IVIS%2FEG_F416.jpg/public')
  assert.equal(versRelais('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/IVIS/UN_00113_CST.jpg/public'), '/api/media/aYYmWUcv7lRhpLdU4ojPsA/IVIS/UN_00113_CST.jpg/public')
  assert.equal(versRelais('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/oaksome/pull_glb/JO_HN_J0203AB.glb'), '/api/media/aYYmWUcv7lRhpLdU4ojPsA/oaksome/pull_glb/JO_HN_J0203AB.glb')
  // le préfixe des vignettes du formulaire (ShapeConfigurator : imagePrefix)
  assert.equal(versRelais('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/'), '/api/media/aYYmWUcv7lRhpLdU4ojPsA/')
  assert.equal(`${RELAIS_MEDIA}x`, versRelais(`${MEDIA_CDN}x`))
})

test('le reste passe sans changement : chemins de l’hôte, autres hôtes, une adresse qui ne COMMENCE pas par le CDN', () => {
  for (const u of [
    '/textures/fallback-texture.jpg',
    '/models/handles/door_handler_demo.glb',
    '/api/rp-engine/material-data/MDF15',
    'https://www.gstatic.com/draco/versioned/decoders/1.5.5/draco_decoder.wasm',
    'http://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/x.jpg',
    'https://example.com/?u=https://media.tecnibo.com/x',
    'blob:https://configurator.dormal.net/0b1c',
    'data:image/png;base64,AAAA',
  ]) assert.equal(versRelais(u), u)
})

test('installé dans un navigateur, le LoadingManager par défaut de three réécrit ; hors navigateur, rien n’est posé', () => {
  // hors navigateur (le rendu serveur de Next) : aucune réécriture
  installerRelaisMedia()
  assert.equal(DefaultLoadingManager.resolveURL(`${MEDIA_CDN}a/IVIS%2FX.jpg/public`), `${MEDIA_CDN}a/IVIS%2FX.jpg/public`)
  // dans un navigateur : tous les chargeurs de three (TextureLoader, FileLoader du GLTFLoader) passent par resolveURL
  globalThis.window = globalThis.window ?? {}
  try {
    installerRelaisMedia()
    assert.equal(DefaultLoadingManager.resolveURL(`${MEDIA_CDN}a/IVIS%2FX.jpg/public`), '/api/media/a/IVIS%2FX.jpg/public')
    assert.equal(DefaultLoadingManager.resolveURL('/glb/models.glb'), '/glb/models.glb')
  } finally {
    DefaultLoadingManager.setURLModifier(undefined)
    delete globalThis.window
  }
})
