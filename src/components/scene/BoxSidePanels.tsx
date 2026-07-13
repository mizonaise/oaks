'use client'

import { memo, useMemo } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { type BoxSides as ShapeBoxSides, type DimCpConfig } from './shapeTree'
import { resolveCp } from './resolveCp'
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
  axis: FaceAxis
  sign: 1 | -1
}

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
      sign: 1 | -1
    ): FaceSpec => ({
      cpRef: face?.cp,
      inSet: face?.inSet ?? 0,
      startOff: face?.startOff ?? 0,
      endOff: face?.endOff ?? 0,
      topOff: face?.topOff ?? 0,
      botOff: face?.botOff ?? 0,
      axis,
      sign
    })
    return [
      spec(sides.top, 'y', 1),
      spec(sides.bottom, 'y', -1),
      spec(sides.front, 'z', 1),
      spec(sides.back, 'z', -1),
      spec(sides.right, 'x', 1),
      spec(sides.left, 'x', -1)
    ]
  }, [sides])
  return (
    <>
      {faces.map((f, i) => {
        if (!f.cpRef) return null
        const cp = resolveCp(f.cpRef, vars)
        if (!cp) return null
        // Each enabled dimension becomes an arrowed measurement along its axis.
        // w/h/d map to x/y/z; whichever axis is the panel's thickness uses the
        // cp thickness (with CpPanel's 2mm floor), the others use the box span.
        const cfg = f.cpRef ? dimCpConfig?.[f.cpRef] : undefined
        const t = Math.max(cp.thickness, 2)
        const dims: DimMeasure[] = cfg
          ? (
              [
                ['w', 'x', f.axis === 'x' ? t : sx],
                ['h', 'y', f.axis === 'y' ? t : sy],
                ['d', 'z', f.axis === 'z' ? t : sz]
              ] as Array<['w' | 'h' | 'd', FaceAxis, number]>
            )
              .filter(([dim]) => cfg[dim])
              .map(([, axis, value]) => ({ axis, value: Math.round(value) }))
          : []
        return (
          <CpPanel
            key={i}
            cp={cp}
            axis={f.axis}
            sign={f.sign}
            inSet={f.inSet}
            startOff={f.startOff}
            endOff={f.endOff}
            topOff={f.topOff}
            botOff={f.botOff}
            sx={sx}
            sy={sy}
            sz={sz}
            dims={dims}
          />
        )
      })}
    </>
  )
})
