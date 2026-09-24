'use client'

/**
 * Device/browser performance profile for the 3D viewer.
 *
 * The rendering recipe (lights, shadows, materials, room) is fixed by the
 * design team — see `BANC_DEFAULTS` in `banc/BancContext`. The *cost* of that
 * recipe, though, cannot be fixed: the same scene runs on a workstation with a
 * discrete GPU and on a three-year-old phone. So the pixel density and the
 * shadow budget are derived from the browser at mount, then corrected live by
 * drei's `<PerformanceMonitor>` (see `Shape3D`).
 *
 * Nothing here changes *what* is rendered — only how many samples it costs.
 * A tier never turns the room, the environment or the materials off: the
 * picture stays the design team's, it just gets cheaper.
 */

export type PerfTier = 'low' | 'medium' | 'high'

export type PerfProfile = {
  tier: PerfTier
  /** Pixel ratio cap (the renderer never goes above the device's own). */
  dpr: number
  shadowMapSize: 1024 | 2048 | 4096
  shadowSamples: number
  /** Soft VSM shadows are the design recipe; a low tier falls back to PCF. */
  shadowType: 'vsm' | 'pcf'
  /** What the decision was based on, for the bench and for support. */
  reason: string
}

/** Renderer strings that mean "no GPU behind this context". */
const SOFTWARE = /swiftshader|llvmpipe|software|basic render|microsoft basic/i

/** The GPU renderer string, when the browser agrees to tell us. */
function rendererString (): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return 'no-webgl'
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const name = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER))
    // Release the context straight away: browsers cap the number of live ones
    // (~16), and this probe must never be the one that evicts the viewer's.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name
  } catch {
    return 'unknown'
  }
}

function measure (): PerfProfile {
  // SSR / static export: no browser to ask. Assume the middle tier — the
  // client re-measures on mount before the first frame that matters.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      tier: 'medium',
      dpr: 1.5,
      shadowMapSize: 2048,
      shadowSamples: 12,
      shadowType: 'vsm',
      reason: 'server render'
    }
  }

  const cores = navigator.hardwareConcurrency || 4
  // `deviceMemory` is Chromium-only (GiB, capped at 8) — absent elsewhere.
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0
  const devicePixelRatio = window.devicePixelRatio || 1
  const coarse =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  const renderer = rendererString()
  const software = renderer === 'no-webgl' || SOFTWARE.test(renderer)

  let tier: PerfTier = 'medium'
  if (software || cores <= 2 || (memory > 0 && memory <= 2)) {
    tier = 'low'
  } else if (!coarse && cores >= 8 && (memory === 0 || memory >= 8)) {
    tier = 'high'
  } else if (coarse && cores <= 6) {
    // A phone or tablet: the fill rate, not the core count, is the ceiling.
    tier = 'low'
  }

  const profile: Record<PerfTier, Omit<PerfProfile, 'tier' | 'reason'>> = {
    low: {
      dpr: 1,
      shadowMapSize: 1024,
      shadowSamples: 8,
      shadowType: 'pcf'
    },
    medium: {
      dpr: Math.min(1.5, devicePixelRatio),
      shadowMapSize: 2048,
      shadowSamples: 12,
      shadowType: 'vsm'
    },
    high: {
      dpr: Math.min(2, devicePixelRatio),
      shadowMapSize: 2048,
      shadowSamples: 16,
      shadowType: 'vsm'
    }
  }

  return {
    tier,
    ...profile[tier],
    reason: `${cores} cores, ${memory || '?'} GB, dpr ${devicePixelRatio}${
      coarse ? ', touch' : ''
    }, ${renderer}`
  }
}

let cached: PerfProfile | null = null

/** The profile of this browser, measured once per page. */
export function perfProfile (): PerfProfile {
  if (!cached) cached = measure()
  return cached
}
