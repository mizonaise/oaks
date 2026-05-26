'use client'

import { memo, useMemo } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { type BoxSides as ShapeBoxSides } from './shapeTree'
import { resolveCp } from './resolveCp'
import { CpPanel, type FaceAxis } from './CpPanel'

type FaceSpec = {
  cpRef: string | null | undefined
  axis: FaceAxis
  sign: 1 | -1
}

export const BoxSidePanels = memo(function BoxSidePanels ({
  sx,
  sy,
  sz,
  sides,
  vars
}: {
  sx: number
  sy: number
  sz: number
  sides: ShapeBoxSides
  vars: FlatVars
}) {
  const faces = useMemo<FaceSpec[]>(
    () => [
      { cpRef: sides.top, axis: 'y', sign: 1 },
      { cpRef: sides.bottom, axis: 'y', sign: -1 },
      { cpRef: sides.front, axis: 'z', sign: 1 },
      { cpRef: sides.back, axis: 'z', sign: -1 },
      { cpRef: sides.right, axis: 'x', sign: 1 },
      { cpRef: sides.left, axis: 'x', sign: -1 }
    ],
    [sides]
  )
  return (
    <>
      {faces.map((f, i) => {
        if (!f.cpRef) return null
        const cp = resolveCp(f.cpRef, vars)
        if (!cp) return null
        return (
          <CpPanel
            key={i}
            cp={cp}
            axis={f.axis}
            sign={f.sign}
            sx={sx}
            sy={sy}
            sz={sz}
          />
        )
      })}
    </>
  )
})
