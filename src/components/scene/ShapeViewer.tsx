'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  /** Receives a `() => string | null` that snapshots the canvas as a PNG data
   *  URL, so a parent can capture the current view on demand. */
  onCaptureReady?: (capture: () => string | null) => void
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
  selectedName,
  onCaptureReady
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
  const [showHierarchy, setShowHierarchy] = useState(false)

  // Last requested zone that resolved to a box with a `camera`. An empty
  // goToZone falls back to this so the camera returns to the previous framed
  // zone instead of clearing the selection.
  const lastCameraZone = useRef<string | null>(null)

  // When a zone name is requested (e.g. via goToZone), select the first box
  // whose name matches it. An empty request falls back to the last zone that
  // had a camera; if there's none, the current selection is left alone.
  useEffect(() => {
    const target = selectedName || lastCameraZone.current
    if (!target) {
      setSelectedIndex(null)
      return
    }
    const match = boxes.find(b => b.name === target)
    if (!match) return
    setSelectedIndex(match.index)
    // Remember camera zones so a later empty request can return here.
    if (selectedName && match.camera) lastCameraZone.current = selectedName
  }, [selectedName, boxes])

  return (
    <div>
      {dev && (
        <button
          type='button'
          onClick={() => setShowHierarchy(open => !open)}
          aria-pressed={showHierarchy}
          className='mb-2 rounded border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
        >
          {showHierarchy ? 'Hide hierarchy' : 'Show hierarchy'}
        </button>
      )}
      <div
        className={
          dev && showHierarchy
            ? 'grid gap-3 sm:grid-cols-[30rem_1fr]'
            : 'grid gap-3'
        }
      >
        {dev && showHierarchy && (
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
          onCaptureReady={onCaptureReady}
        />
      </div>
    </div>
  )
}
