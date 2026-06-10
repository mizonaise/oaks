'use client'

import { memo, useCallback } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { type Box as ShapeBox, type DimCpConfig } from './shapeTree'
import { resolveArticleName } from './resolveArticle'
import { BoxEdges } from './BoxEdges'
import { BoxPickMesh } from './BoxPickMesh'
import { BoxSidePanels } from './BoxSidePanels'
import { ArticleInBox } from './ArticleInBox'

const MM = 1

function colorForBox (b: ShapeBox): string {
  if (b.isArticle) return `hsl(${(b.depth * 37) % 360}, 65%, 55%)`
  const hue = (b.depth * 47) % 360
  const sat = 25 + (b.depth % 4) * 10
  const light = 75 - (b.depth % 6) * 6
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

export const BoxItem = memo(function BoxItem ({
  box,
  isSelected,
  onSelect,
  globalVars,
  doorOpen,
  dimCpConfig
}: {
  box: ShapeBox
  isSelected: boolean
  onSelect: (index: string) => void
  globalVars: FlatVars
  doorOpen: boolean
  /** Per-CP dimension config; `null` hides all labels. */
  dimCpConfig?: DimCpConfig | null
}) {
  const inset = box.isArticle ? 2 : 0
  const sx = Math.max((box.w - inset) * MM, 0.0001)
  const sy = Math.max((box.h - inset) * MM, 0.0001)
  const sz = Math.max((box.d - inset) * MM, 0.0001)
  const cx = (box.x + box.w / 2) * MM
  const cy = (box.y + box.h / 2) * MM
  const cz = (box.z + box.d / 2) * MM
  const articleName =
    box.isArticle && box.node && box.vars
      ? resolveArticleName(box.node, box.vars)
      : null

  const handlePick = useCallback(
    () => onSelect(box.index),
    [onSelect, box.index]
  )

  return (
    <group position={[cx, cy, cz]}>
      <BoxEdges
        sx={sx}
        sy={sy}
        sz={sz}
        color={isSelected ? '#facc15' : colorForBox(box)}
        selected={isSelected}
      />
      <BoxPickMesh
        sx={sx}
        sy={sy}
        sz={sz}
        selected={isSelected}
        onSelect={handlePick}
      />
      {box.sides && (
        <BoxSidePanels
          sx={sx}
          sy={sy}
          sz={sz}
          sides={box.sides}
          vars={box.vars ?? globalVars}
          dimCpConfig={dimCpConfig}
        />
      )}
      {box.isArticle && articleName && box.vars && (
        <ArticleInBox
          box={box}
          articleName={articleName}
          doorOpen={doorOpen || isSelected}
        />
      )}
    </group>
  )
})
