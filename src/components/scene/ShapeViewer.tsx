'use client'

import { useMemo, useState } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { evalExpr } from '@/lib/form/expr'
import { Hierarchy } from './Hierarchy'
import { Shape3D } from './Shape3D'
import { walkZone, type Box } from './shapeTree'

type Props = {
  shape: {
    width?: unknown
    depth?: unknown
    height?: unknown
    zone?: unknown
  }
  scopes: {
    globalVars: FlatVars
    namespaces: Record<string, FlatVars>
  }
}

function readDim (raw: unknown, vars: FlatVars, fallback: number): number {
  if (typeof raw !== 'string') return fallback
  const expr = raw.replace(/(\s*mm)+\s*$/i, '').trim()
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr)
  const n = evalExpr(expr, {}, {}, vars)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function ShapeViewer ({ shape, scopes }: Props) {
  const { boxes, bounds } = useMemo(() => {
    const { globalVars, namespaces } = scopes
    const w = readDim(shape.width, globalVars, 6000)
    const d = readDim(shape.depth, globalVars, 500)
    const h = readDim(shape.height, globalVars, 3000)
    const boxes: Box[] = walkZone(
      shape.zone as Parameters<typeof walkZone>[0],
      { x: 0, y: 0, z: 0, w, h, d },
      globalVars,
      namespaces
    )
    return { boxes, bounds: { w, h, d } }
  }, [shape, scopes])

  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)

  return (
    <div className='grid gap-3 sm:grid-cols-[18rem_1fr]'>
      <Hierarchy
        boxes={boxes}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
      <Shape3D
        boxes={boxes}
        bounds={bounds}
        globalVars={scopes.globalVars}
        selectedIndex={selectedIndex}
        onSelect={() => {}}
      />
    </div>
  )
}
