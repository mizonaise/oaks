'use client'

import { createContext, useContext } from 'react'
import { perfProfile } from '../perf'

/**
 * Banc de rendu (Dorian, 2026-09-10) — the tunable rendering parameters.
 *
 * Everything the design team (Clément, Raphaël) may want to compare lives
 * here, with a default that is the lot A recipe. The panel (BancPanel) edits
 * them, the scene components read them through `useBanc()`, and a setting set
 * can be shared as a link (`?banc=1&rendu=<encoded>`).
 *
 * Who may change what (Dorian, 2026-09-11) — three groups, on purpose:
 *
 * 1. **The customer**, from the viewer's own toolbar: the `MODE_KEYS` below —
 *    how the unit is shown (quality), from where (camera, eye height, focal),
 *    with which doors, with which dimension lines. Nothing else: these are
 *    *what* is shown, not *how well it is lit*.
 * 2. **The design team**, through this file: light, shadows, materials, room.
 *    Those values are the brand's rendering recipe. They are hard-coded here
 *    and the customer never sees a control for them; the bench panel
 *    (`?banc=1`) exists precisely so the team can retune them and hand the new
 *    numbers back as a change to `BANC_DEFAULTS`.
 * 3. **The browser**, through `perf.ts`: pixel density and shadow budget. A
 *    setting the user would only ever get wrong, and that depends on their
 *    machine, not on their taste.
 */

export type BancMode = 'realiste' | 'filaire' | 'schema' | 'bassedef'
export type CameraPresetId =
  | 'auto'
  | 'face'
  | 'tq_gauche'
  | 'tq_droite'
  | 'detail'
  | 'plongee'
export type EnvPreset =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse'
  | 'none'
export type ToneMappingId = 'aces' | 'agx' | 'neutral' | 'none'
export type ShadowTypeId = 'vsm' | 'pcf' | 'off'
/** `auto` = taken from the browser profile (see `perf.ts`). */
export type DprSetting = 'auto' | 1 | 1.5 | 2

export type BancSettings = {
  mode: BancMode
  camera: CameraPresetId
  /** Camera vertical field of view (deg). */
  fov: number
  /**
   * Eye height above the floor, in metres — the height the camera sits at in
   * the initial framing, in every named preset, and while walking through the
   * room. Looking slightly *down* into the unit is what a person sees standing
   * in front of a floor-to-ceiling built-in (Clément, 11/09: « mettre la
   * hauteur de la caméra à 2 m pour voir de plus haut »).
   *
   * 1.75 m, not 2 (Dorian, 11/09, after seeing it live): 2 m is a viewpoint
   * nobody has, and the picture reads as a camera on a pole rather than as a
   * person in the room. The slider still goes up to 2.6.
   *
   * Clamped below the ceiling by the scene: in a built-in room the ceiling is
   * flush with the top of the unit, so a low unit caps the eye height.
   */
  camHeight: number
  envPreset: EnvPreset
  envIntensity: number
  toneMapping: ToneMappingId
  exposure: number
  keyIntensity: number
  /** 0 = cold (#EEF2FF), 1 = warm (#FFE0B8). */
  keyWarmth: number
  ambient: number
  fill: number
  hemi: number
  shadowType: ShadowTypeId
  shadowMapSize: 1024 | 2048 | 4096
  shadowRadius: number
  shadowSamples: number
  roughness: number
  envMapIntensity: number
  edges: boolean
  roomEnabled: boolean
  /** Fade distance as a multiple of the unit width. */
  roomFade: number
  /** Gap between the unit top and the ceiling (m). 0 = flush (built-in). */
  ceilingGap: number
  wallColor: string
  floorColor: string
  background: string
  dpr: DprSetting
  stats: boolean
  humanShadow: boolean
  /** Doors: closed (as configured), open, or removed (interior visible). */
  doors: 'fermees' | 'ouvertes' | 'retirees'
  /** Dimension lines: none, overall (W/H/D), detailed (+ zones, levels), or the
   *  article renderer's own labels. */
  dims: 'aucune' | 'globales' | 'detaillees' | 'designer'
  /**
   * Key light direction (plan de prises de vue, 2026-09-15): azimuth in degrees
   * (negative = from the left, like the charte's side window) and elevation
   * above the horizon. The defaults reproduce the lot A position
   * `[-0.8, 1.4, 1.2] × radius`; a photographer moves the light per shot
   * (raking at 20° for a texture, soft for an interior).
   */
  keyAz: number
  keyEl: number
  /**
   * Columns whose doors are open on top of `doors` (plan de prises de vue):
   * comma-separated 1-based ranks from the left, e.g. "1" or "2,3". Empty =
   * none. Lets one shot open ONE door while the others stay shut.
   */
  doorsOpenOn: string
}

export const BANC_DEFAULTS: BancSettings = {
  mode: 'realiste',
  camera: 'auto',
  fov: 35,
  camHeight: 1.75,
  envPreset: 'apartment',
  envIntensity: 0.8,
  toneMapping: 'aces',
  exposure: 0.9,
  keyIntensity: 1.8,
  keyWarmth: 0.6,
  ambient: 0.25,
  fill: 0.5,
  hemi: 0.35,
  shadowType: 'vsm',
  shadowMapSize: 2048,
  shadowRadius: 6,
  shadowSamples: 12,
  roughness: 0.62,
  envMapIntensity: 1,
  edges: false,
  roomEnabled: true,
  roomFade: 2,
  ceilingGap: 0,
  wallColor: '#F1EFE8',
  floorColor: '#E6E1D6',
  background: '#F6F5F0',
  dpr: 'auto',
  stats: false,
  humanShadow: false,
  doors: 'fermees',
  dims: 'aucune',
  keyAz: -34,
  keyEl: 44,
  doorsOpenOn: ''
}

/** Key light position from azimuth / elevation (deg), at the lot A distance (2 × radius). */
export function keyPosition (az: number, el: number, radius: number): [number, number, number] {
  const a = (az * Math.PI) / 180
  const e = (el * Math.PI) / 180
  const r = 2 * radius
  return [r * Math.cos(e) * Math.sin(a), r * Math.sin(e), r * Math.cos(e) * Math.cos(a)]
}

/**
 * The settings the *customer* drives from the viewer toolbar — the « Mode »
 * folder of the bench panel, and nothing else. Everything absent from this
 * list is the design team's recipe or the browser's business.
 */
export const MODE_KEYS = [
  'mode',
  'camera',
  'camHeight',
  'fov',
  'doors',
  'dims'
] as const satisfies ReadonlyArray<keyof BancSettings>

export const BancContext = createContext<BancSettings>(BANC_DEFAULTS)
export const useBanc = () => useContext(BancContext)

/** Key light colour from the warmth slider. */
export function keyColor (warmth: number): string {
  const cold = [0xee, 0xf2, 0xff]
  const warm = [0xff, 0xe0, 0xb8]
  const t = Math.min(1, Math.max(0, warmth))
  const c = cold.map((a, i) => Math.round(a + (warm[i] - a) * t))
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`
}

/** Derived flags used by the scene. */
export function bancFlags (s: BancSettings) {
  const lowRes = s.mode === 'bassedef'
  const dpr = s.dpr === 'auto' ? perfProfile().dpr : s.dpr
  return {
    wireframe: s.mode === 'filaire',
    schema: s.mode === 'schema',
    lowRes,
    shadows: !lowRes && s.shadowType !== 'off',
    environment: !lowRes && s.envPreset !== 'none' && s.mode === 'realiste',
    dpr: lowRes ? 1 : dpr
  }
}

/**
 * The settings the scene actually renders with: the design recipe, with the
 * parts the browser cannot afford turned down.
 *
 * `bench` = the design team has the panel open (`?banc=1`). Then nothing is
 * turned down: they are judging the recipe itself, and an image silently
 * degraded by the machine it was opened on would be a lie — on a laptop
 * without a GPU every comparison would be made at half resolution. Only the
 * explicit `auto` pixel density is resolved.
 */
export function withPerf (
  s: BancSettings,
  perf: { dpr: number; shadowMapSize: 1024 | 2048 | 4096; shadowSamples: number; tier: string },
  bench: boolean
): BancSettings {
  const dpr = s.dpr === 'auto' ? (perf.dpr as 1 | 1.5 | 2) : s.dpr
  if (bench) return s.dpr === 'auto' ? { ...s, dpr } : s
  return {
    ...s,
    dpr,
    shadowMapSize: Math.min(s.shadowMapSize, perf.shadowMapSize) as
      | 1024
      | 2048
      | 4096,
    shadowSamples: Math.min(s.shadowSamples, perf.shadowSamples),
    // VSM blurs the shadow map in a second pass; on a low tier that pass costs
    // more than the softness is worth, so fall back to the cheaper PCF.
    shadowType:
      perf.tier === 'low' && s.shadowType === 'vsm' ? 'pcf' : s.shadowType
  }
}

// --- sharing -----------------------------------------------------------

const toBase64Url = (s: string) =>
  btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
const fromBase64Url = (s: string) =>
  decodeURIComponent(
    escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))
  )

/** Only the values that differ from the defaults, base64url-encoded. */
export function encodeSettings (s: BancSettings): string {
  const diff: Record<string, unknown> = {}
  for (const k of Object.keys(BANC_DEFAULTS) as Array<keyof BancSettings>) {
    if (s[k] !== BANC_DEFAULTS[k]) diff[k] = s[k]
  }
  return toBase64Url(JSON.stringify(diff))
}

export function decodeSettings (encoded: string | null): Partial<BancSettings> {
  if (!encoded) return {}
  try {
    const obj = JSON.parse(fromBase64Url(encoded)) as Record<string, unknown>
    const out: Partial<BancSettings> = {}
    for (const k of Object.keys(BANC_DEFAULTS) as Array<keyof BancSettings>) {
      if (!(k in obj)) continue
      // `dpr` is the one key whose union mixes types ('auto' | 1 | 1.5 | 2), so
      // the type-of-the-default test would reject every explicit density in a
      // shared link. Check its values instead.
      const ok =
        k === 'dpr'
          ? obj[k] === 'auto' || obj[k] === 1 || obj[k] === 1.5 || obj[k] === 2
          : typeof obj[k] === typeof BANC_DEFAULTS[k]
      if (ok) (out as Record<string, unknown>)[k] = obj[k]
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Camera preset chosen from the unit itself (rule A9 / C3 of the cahier):
 * a wide low unit reads best from a three-quarter on the free side, a tall
 * narrow one from the front, a unit walled on the left from the right.
 */
export function autoCameraPreset (
  bounds: { w: number; h: number; d: number },
  walls: { left: boolean; right: boolean }
): Exclude<CameraPresetId, 'auto'> {
  const { w, h } = bounds
  if (w < 1.6 && h > w * 1.4) return 'face'
  if (walls.left && !walls.right) return 'tq_droite'
  if (walls.right && !walls.left) return 'tq_gauche'
  if (w > 3 * h) return 'tq_gauche'
  return 'tq_gauche'
}
