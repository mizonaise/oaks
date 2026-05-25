/**
 * Turns the resolved variables map into a description of the cabinet shape.
 * All dimensions are in millimeters; the caller scales for the canvas.
 */

export type Zone = {
  index: number // 1-based, matches ZF_CNT_NN naming
  x: number // left edge, mm, in the inner usable area
  width: number
  articleType: string | undefined // DS_WACA_FR_ART_NN
}

export type Shape = {
  // Outer bounding box (built-ins occupy the same footprint; we still draw it)
  width: number
  depth: number
  height: number
  // Inner usable area (after side fillers + built-in walls)
  inner: { x: number; width: number; y: number; height: number }
  // Side fillers
  leftFiller: { width: number; isBuiltIn: boolean }
  rightFiller: { width: number; isBuiltIn: boolean }
  // Base/crown bands across the inner width
  baseHeight: number
  crownHeight: number
  zones: Zone[]
}

// Looks up a name in either a flat map (`ZF_W`) or a nested-by-namespace map
// (`{ global: { ZF_W: ... }, OAKSOME_SHAPE_U_TEST: { ZF_CNT: ... } }`).
// Bare names check `global` first, then the top level; dotted names walk.
function read (vars: Record<string, unknown>, name: string): unknown {
  if (name.includes('.')) {
    let cur: unknown = vars
    for (const p of name.split('.')) {
      if (cur && typeof cur === 'object' && p in (cur as object)) {
        cur = (cur as Record<string, unknown>)[p]
      } else return undefined
    }
    return cur
  }
  const g = vars.global
  if (g && typeof g === 'object' && name in (g as object)) {
    return (g as Record<string, unknown>)[name]
  }
  return vars[name]
}

function num (vars: Record<string, unknown>, name: string, fallback = 0): number {
  const v = read(vars, name)
  if (v === undefined || v === null || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str (vars: Record<string, unknown>, name: string): string | undefined {
  const v = read(vars, name)
  return typeof v === 'string' ? v : undefined
}

export function shapeFromVariables (vars: Record<string, unknown>): Shape {
  const width = num(vars, 'ZF_W', 6000)
  const depth = num(vars, 'ZF_D', 500)
  const height = num(vars, 'ZONE_H', 3000)
  const zfl = num(vars, 'ZFL_W', 50)
  const zfr = num(vars, 'ZFR_W', 50)
  const isBiL = num(vars, 'IS_BI_L', 0) === 1
  const isBiR = num(vars, 'IS_BI_R', 0) === 1
  const baseHeight = num(vars, 'BASE_HEIGHT', 100)
  const crownHeight = num(vars, 'CROWN_HEIGHT', 100)
  const count = Math.max(1, Math.floor(num(vars, 'ZF_CNT', 1)))

  // Inner usable area (excluding side fillers). Built-in walls live inside
  // the filler band; for the mockup we treat fillers identically and just
  // mark `isBuiltIn` so the renderer can color them differently.
  const innerX = zfl
  const innerWidth = Math.max(0, width - zfl - zfr)
  const innerY = baseHeight
  const innerHeight = Math.max(0, height - baseHeight - crownHeight)

  // Equal-width zones across the inner area for the mockup. The real schema
  // can override per-zone widths via $ZF_STEP / $ZFA_W; we keep it simple here.
  const step = innerWidth / count
  const zones: Zone[] = Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const tag = String(n).padStart(2, '0')
    return {
      index: n,
      x: i * step,
      width: step,
      articleType: str(vars, `DS_WACA_FR_ART_${tag}`)
    }
  })

  return {
    width,
    depth,
    height,
    inner: { x: innerX, width: innerWidth, y: innerY, height: innerHeight },
    leftFiller: { width: zfl, isBuiltIn: isBiL },
    rightFiller: { width: zfr, isBuiltIn: isBiR },
    baseHeight,
    crownHeight,
    zones
  }
}
