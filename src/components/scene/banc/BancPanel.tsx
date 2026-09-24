'use client'

import { useEffect, useMemo, useRef } from 'react'
import { button, folder, useControls } from 'leva'
import {
  BANC_DEFAULTS,
  encodeSettings,
  type BancSettings
} from './BancContext'

/**
 * The tuning panel (leva). Mounted only with `?banc=1`. Every change is pushed
 * up through `onChange`; « Copier le lien » puts a shareable URL on the
 * clipboard that reopens the bench with the same values.
 *
 * `external` is the same settings object seen from outside: the viewer's own
 * toolbar edits the « Mode » values too, and without this the panel would keep
 * showing the value it last wrote while the scene shows another.
 */
export function BancPanel ({
  initial,
  external,
  onChange
}: {
  initial: BancSettings
  external?: BancSettings
  onChange: (s: BancSettings) => void
}) {
  const latest = useRef<BancSettings>(initial)
  // The schema is registered ONCE from the initial values: re-registering it
  // on every change would re-emit, re-render and re-register — a render loop
  // (measured at 3 fps before this guard).
  const init = useRef(initial).current

  const [values, set] = useControls(
    () => ({
      Mode: folder({
        mode: {
          label: 'visualisation',
          value: init.mode,
          options: {
            'réaliste': 'realiste',
            'filaire': 'filaire',
            'schéma (Flora)': 'schema',
            'basse définition': 'bassedef'
          }
        },
        camera: {
          label: 'caméra',
          value: init.camera,
          options: {
            'auto (selon le meuble)': 'auto',
            'face': 'face',
            'trois-quarts gauche': 'tq_gauche',
            'trois-quarts droite': 'tq_droite',
            'détail (poignée)': 'detail',
            'plongée légère': 'plongee'
          }
        },
        fov: { label: 'focale (fov)', value: init.fov, min: 20, max: 70, step: 1 },
        camHeight: {
          label: 'hauteur de vue (m)',
          value: init.camHeight,
          min: 0.8,
          max: 3,
          step: 0.05
        },
        doors: {
          label: 'portes',
          value: init.doors,
          options: { 'fermées': 'fermees', 'ouvertes': 'ouvertes', 'retirées': 'retirees' }
        },
        dims: {
          label: 'cotes',
          value: init.dims,
          options: {
            'aucune': 'aucune',
            'globales (L × H × P)': 'globales',
            'détaillées (zones, niveaux)': 'detaillees',
            'celles du renderer': 'designer'
          }
        }
      }),
      Lumière: folder(
        {
          envPreset: {
            label: 'environnement',
            value: init.envPreset,
            options: {
              'appartement (chaud)': 'apartment',
              'studio': 'studio',
              'aube': 'dawn',
              'coucher de soleil': 'sunset',
              'hall': 'lobby',
              'ville': 'city',
              'forêt': 'forest',
              'parc': 'park',
              'entrepôt': 'warehouse',
              'aucun': 'none'
            }
          },
          envIntensity: { label: 'env. intensité', value: init.envIntensity, min: 0, max: 2, step: 0.05 },
          toneMapping: {
            label: 'tone mapping',
            value: init.toneMapping,
            options: { ACES: 'aces', AgX: 'agx', Neutral: 'neutral', 'aucun': 'none' }
          },
          exposure: { label: 'exposition', value: init.exposure, min: 0.4, max: 1.6, step: 0.05 },
          keyIntensity: { label: 'clé (fenêtre)', value: init.keyIntensity, min: 0, max: 5, step: 0.1 },
          keyWarmth: { label: 'clé chaleur', value: init.keyWarmth, min: 0, max: 1, step: 0.05 },
          ambient: { label: 'ambiance', value: init.ambient, min: 0, max: 2, step: 0.05 },
          fill: { label: 'débouchage', value: init.fill, min: 0, max: 2, step: 0.05 },
          hemi: { label: 'sol / ciel', value: init.hemi, min: 0, max: 1.5, step: 0.05 }
        },
        { collapsed: true }
      ),
      Ombres: folder(
        {
          shadowType: {
            label: 'type',
            value: init.shadowType,
            options: { 'douces (VSM)': 'vsm', 'nettes (PCF)': 'pcf', 'aucune': 'off' }
          },
          shadowMapSize: {
            label: 'résolution',
            value: init.shadowMapSize,
            options: { '1024': 1024, '2048': 2048, '4096': 4096 }
          },
          shadowRadius: { label: 'flou', value: init.shadowRadius, min: 0, max: 20, step: 0.5 },
          shadowSamples: { label: 'échantillons', value: init.shadowSamples, min: 4, max: 32, step: 1 }
        },
        { collapsed: true }
      ),
      Matière: folder(
        {
          roughness: { label: 'rugosité', value: init.roughness, min: 0, max: 1, step: 0.02 },
          envMapIntensity: { label: 'reflets', value: init.envMapIntensity, min: 0, max: 3, step: 0.05 },
          edges: { label: 'arêtes', value: init.edges }
        },
        { collapsed: true }
      ),
      Pièce: folder(
        {
          roomEnabled: { label: 'pièce', value: init.roomEnabled },
          roomFade: { label: 'fondu (× largeur)', value: init.roomFade, min: 0.5, max: 4, step: 0.1 },
          ceilingGap: { label: 'jeu plafond (m)', value: init.ceilingGap, min: 0, max: 0.6, step: 0.01 },
          wallColor: { label: 'mur', value: init.wallColor },
          floorColor: { label: 'sol', value: init.floorColor },
          background: { label: 'fond', value: init.background },
          humanShadow: { label: 'ombre de personnage', value: init.humanShadow }
        },
        { collapsed: true }
      ),
      Performance: folder(
        {
          dpr: {
            label: 'densité pixels',
            value: init.dpr,
            options: {
              'auto (navigateur)': 'auto',
              '1': 1,
              '1.5': 1.5,
              '2': 2
            }
          },
          stats: { label: 'compteur fps', value: init.stats }
        },
        { collapsed: true }
      ),
      'Copier le lien': button(() => {
        const url = new URL(window.location.href)
        url.searchParams.set('banc', '1')
        url.searchParams.set('rendu', encodeSettings(latest.current))
        void navigator.clipboard.writeText(url.toString())
      }),
      'Réinitialiser': button(() => {
        set({ ...BANC_DEFAULTS } as never)
      })
    }),
    []
  )

  // leva hands back a flat object of the leaf values.
  const settings = useMemo(() => {
    const v = values as unknown as Record<string, unknown>
    const out: BancSettings = { ...BANC_DEFAULTS }
    for (const k of Object.keys(BANC_DEFAULTS) as Array<keyof BancSettings>) {
      if (k in v && v[k] !== undefined) {
        ;(out as Record<string, unknown>)[k] = v[k]
      }
    }
    return out
  }, [values])

  // Push up only when a value actually changed: leva may hand back a new
  // object identity per render, and re-emitting the same values would spin
  // the parent (setState → re-render → new object → effect → setState …).
  const lastJson = useRef('')
  useEffect(() => {
    const json = JSON.stringify(settings)
    if (json === lastJson.current) return
    lastJson.current = json
    latest.current = settings
    onChange(settings)
  }, [settings, onChange])

  // The other direction: a value changed outside (the viewer toolbar). Writing
  // `lastJson` *before* calling leva's `set` is what stops the round trip —
  // the push-up effect above then sees no change and stays quiet.
  useEffect(() => {
    if (!external) return
    const json = JSON.stringify(external)
    if (json === lastJson.current) return
    lastJson.current = json
    latest.current = external
    set({ ...external } as never)
  }, [external, set])

  return null
}
