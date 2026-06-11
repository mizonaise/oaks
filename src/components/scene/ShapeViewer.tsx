'use client'

import { useEffect, useMemo, useState } from 'react'
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
  /** Dev mode also shows the box Hierarchy alongside the canvas. */
  dev?: boolean
  /** When set, selects the box whose zone `name` matches (e.g. from goToZone). */
  selectedName?: string | null
}

export function readDim (
  raw: unknown,
  vars: FlatVars,
  fallback: number
): number {
  if (typeof raw !== 'string') return fallback
  const expr = raw.replace(/(\s*mm)+\s*$/i, '').trim()
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr)
  const n = evalExpr(expr, {}, {}, vars)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function ShapeViewer ({
  shape,
  scopes,
  dev = false,
  selectedName
}: Props) {
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

  // When a zone name is requested (e.g. via goToZone), select the first box
  // whose name matches it. `null`/no match leaves the current selection alone.
  useEffect(() => {
    if (!selectedName) return
    const match = boxes.find(b => b.name === selectedName)
    if (match) setSelectedIndex(match.index)
  }, [selectedName, boxes])

  return (
    <div className={dev ? 'grid gap-3 sm:grid-cols-[30rem_1fr]' : 'grid gap-3'}>
      {dev && (
        <Hierarchy
          boxes={boxes}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      )}
      <Shape3D
        dev={dev}
        boxes={boxes}
        bounds={bounds}
        globalVars={scopes.globalVars}
        selectedIndex={selectedIndex}
        onSelect={() => {}}
      />
    </div>
  )
}
