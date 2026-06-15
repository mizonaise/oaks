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
  dev = false,
  isSelected,
  onSelect,
  globalVars,
  hidden = false,
  doorOpen,
  dimCpConfig,
  showDims = false,
  contrasted = false
}: {
  box: ShapeBox
  dev?: boolean
  isSelected: boolean
  onSelect: (index: string) => void
  globalVars: FlatVars
  /** When true, the box is between the framed zone and the camera; render nothing. */
  hidden?: boolean
  doorOpen: boolean
  /** Per-CP dimension config; `null` hides all labels. */
  dimCpConfig?: DimCpConfig | null
  /** Whether dimensioning is on (drives the article designer's labels). */
  showDims?: boolean
  /** Whether contrast rendering is on (drives the article designer's contrast). */
  contrasted?: boolean
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

  // Sitting between the framed zone and the camera — render nothing so it
  // doesn't occlude the zone.
  if (hidden) return null

  return (
    <group position={[cx, cy, cz]}>
      {dev && (
        <BoxEdges
          sx={sx}
          sy={sy}
          sz={sz}
          color={isSelected ? '#facc15' : colorForBox(box)}
          selected={isSelected}
        />
      )}
      {dev && (
        <BoxPickMesh
          sx={sx}
          sy={sy}
          sz={sz}
          selected={isSelected}
          onSelect={handlePick}
        />
      )}
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
          showDims={showDims}
          contrasted={contrasted}
        />
      )}
    </group>
  )
})
