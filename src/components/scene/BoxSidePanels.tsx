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
  const faces = useMemo<FaceSpec[]>(
    () => [
      { cpRef: sides.top?.cp, inSet: sides.top?.inSet ?? 0, axis: 'y', sign: 1 },
      {
        cpRef: sides.bottom?.cp,
        inSet: sides.bottom?.inSet ?? 0,
        axis: 'y',
        sign: -1
      },
      {
        cpRef: sides.front?.cp,
        inSet: sides.front?.inSet ?? 0,
        axis: 'z',
        sign: 1
      },
      {
        cpRef: sides.back?.cp,
        inSet: sides.back?.inSet ?? 0,
        axis: 'z',
        sign: -1
      },
      {
        cpRef: sides.right?.cp,
        inSet: sides.right?.inSet ?? 0,
        axis: 'x',
        sign: 1
      },
      {
        cpRef: sides.left?.cp,
        inSet: sides.left?.inSet ?? 0,
        axis: 'x',
        sign: -1
      }
    ],
    [sides]
  )
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
