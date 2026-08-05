'use client'

import { memo, useMemo } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { type BoxSides as ShapeBoxSides, type DimCpConfig } from './shapeTree'
import { useResolveCp } from './resolveCp'
import { CpPanel, type FaceAxis, type DimMeasure } from './CpPanel'

type FaceSpec = {
  cpRef: string | null | undefined
  /** Inward offset (mm) from the box face, from the side's `inSet`. */
  inSet: number
  /** Per-edge oversize (mm): grow the panel outward past the box footprint. */
  startOff: number
  endOff: number
  topOff: number
  botOff: number
  /** Horizontal axis runs opposite the anti-clockwise side walk (right/back),
   *  so `startOff`/`endOff` swap which edge they move. */
  flipH: boolean
  axis: FaceAxis
  sign: 1 | -1
}

/**
 * One box face. Split into its own component so `useResolveCp` (which fires the
 * material/surface queries) is called once per face at the top level — hooks
 * can't run inside the `.map` callback below.
 */
const FacePanel = memo(function FacePanel ({
  face,
  vars,
  dimCpConfig,
  sx,
  sy,
  sz
}: {
  face: FaceSpec
  vars: FlatVars
  dimCpConfig?: DimCpConfig | null
  sx: number
  sy: number
  sz: number
}) {
  const cp = useResolveCp(face.cpRef ?? '', vars)
  if (!face.cpRef || !cp) return null
  // A cp of "empty" (any case) is a placeholder for "no panel here" — skip it.
  if (face.cpRef.toLowerCase().includes('empty')) return null
  if (face.cpRef.toLowerCase().includes('spo_wall')) return null
  // Each enabled dimension becomes an arrowed measurement along its axis.
  // w/h/d map to x/y/z; whichever axis is the panel's thickness uses the
  // cp thickness (with CpPanel's 2mm floor), the others use the box span.
  const cfg = dimCpConfig?.[face.cpRef]
  const t = Math.max(cp.thickness, 2)
  const dims: DimMeasure[] = cfg
    ? (
        [
          ['w', 'x', face.axis === 'x' ? t : sx],
          ['h', 'y', face.axis === 'y' ? t : sy],
          ['d', 'z', face.axis === 'z' ? t : sz]
        ] as Array<['w' | 'h' | 'd', FaceAxis, number]>
      )
        .filter(([dim]) => cfg[dim])
        .map(([, axis, value]) => ({ axis, value: Math.round(value) }))
    : []
  return (
    <CpPanel
      cp={cp}
      axis={face.axis}
      sign={face.sign}
      inSet={face.inSet}
      startOff={face.startOff}
      endOff={face.endOff}
      topOff={face.topOff}
      botOff={face.botOff}
      flipH={face.flipH}
      sx={sx}
      sy={sy}
      sz={sz}
      dims={dims}
    />
  )
})

export const BoxSidePanels = memo(function BoxSidePanels ({
  sx,
  sy,
  sz,
  sides,
  vars,
  dimCpConfig
}: {
  sx: number
  sy: number
  sz: number
  sides: ShapeBoxSides
  vars: FlatVars
  /** Per-CP dimension config; `null`/`undefined` hides all labels. */
  dimCpConfig?: DimCpConfig | null
}) {
  const faces = useMemo<FaceSpec[]>(() => {
    const spec = (
      face: ShapeBoxSides[keyof ShapeBoxSides],
      axis: FaceAxis,
      sign: 1 | -1,
      flipH = false
    ): FaceSpec => ({
      cpRef: face?.cp,
      inSet: face?.inSet ?? 0,
      startOff: face?.startOff ?? 0,
      endOff: face?.endOff ?? 0,
      topOff: face?.topOff ?? 0,
      botOff: face?.botOff ?? 0,
      flipH,
      axis,
      sign
    })
    // Vertical sides walk anti-clockwise like a circle: 0 front → 1 right →
    // 2 back → 3 left. front & left run with their horizontal axis; right &
    // back run against it, so their start/end edges swap (flipH).
    return [
      spec(sides.top, 'y', 1),
      spec(sides.bottom, 'y', -1),
      spec(sides.front, 'z', 1),
      spec(sides.back, 'z', -1, true),
      spec(sides.right, 'x', 1, true),
      spec(sides.left, 'x', -1)
    ]
  }, [sides])
  return (
    <>
      {faces.map((f, i) =>
        f.cpRef
          ? (
            <FacePanel
              key={i}
              face={f}
              vars={vars}
              dimCpConfig={dimCpConfig}
              sx={sx}
              sy={sy}
              sz={sz}
            />
            )
          : null
      )}
    </>
  )
})
