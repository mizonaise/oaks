'use client'

import { memo, useCallback } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import { type Box as ShapeBox, type DimCpConfig } from './shapeTree'
import { resolveArticleName } from './resolveArticle'
import { BoxEdges } from './BoxEdges'
import { BoxPickMesh } from './BoxPickMesh'
import { BoxSidePanels } from './BoxSidePanels'
import { ArticleInBox } from './ArticleInBox'
import type { ArticleData } from '@processandtools/rp-article-designer'

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
  articleData,
  isSelected,
  inSelectedSubtree = false,
  isCameraZone = false,
  onSelect,
  globalVars,
  hidden = false,
  hasDoor = true,
  doorOpen,
  doorsRemoved = false,
  dimCpConfig,
  showDims = false,
  contrasted = false,
  hideArticle = false,
  frameOnly = false,
  sansContenu = false
}: {
  box: ShapeBox
  dev?: boolean
  /** Shared article bundle for the whole shape, fetched server-side. */
  articleData?: ArticleData | null
  /** True only for the exact selected box; drives the highlight. */
  isSelected: boolean
  /** True for the selected box and its descendants; drives the door cascade. */
  inSelectedSubtree?: boolean
  /** Whether the current selection is a camera zone (framed, not opened). */
  isCameraZone?: boolean
  onSelect: (index: string) => void
  globalVars: FlatVars
  /** When true, the box is between the framed zone and the camera; render nothing. */
  hidden?: boolean
  /** Whether articles are built with doors at all. */
  hasDoor?: boolean
  doorOpen: boolean
  /** Banc de rendu: render articles without their doors. */
  doorsRemoved?: boolean
  /** Per-CP dimension config; `null` hides all labels. */
  dimCpConfig?: DimCpConfig | null
  /** Whether dimensioning is on (drives the article designer's labels). */
  showDims?: boolean
  /** Whether contrast rendering is on (drives the article designer's contrast). */
  contrasted?: boolean
  /** Dev-only: when true, skip rendering the article designer. */
  hideArticle?: boolean
  /** Dev-only: when true, draw the whole box as a wireframe — its CP side
   *  panels and the article designer's contents alike — so the structure reads
   *  through the shape. */
  frameOnly?: boolean
  /** B3 (22/09) : les pièces de cette forme viennent de fox-cad — ni panneaux CP, ni designer d'Otman ; seules les arêtes et la sélection du mode dev restent. */
  sansContenu?: boolean
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

  // A camera zone is framed, not opened: its doors stay shut (only the global
  // toggle opens them) and it highlights in a distinct color. A normal selected
  // zone opens its doors and its children's, highlighting yellow.
  const doorOpenForBox = isCameraZone ? doorOpen : doorOpen || inSelectedSubtree
  const highlightColor = isCameraZone ? '#38bdf8' : '#facc15'

  return (
    <group position={[cx, cy, cz]}>
      {dev && !frameOnly && (
        <BoxEdges
          sx={sx}
          sy={sy}
          sz={sz}
          color={isSelected ? highlightColor : colorForBox(box)}
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
          color={highlightColor}
        />
      )}
      {box.sides && !sansContenu && (
        <BoxSidePanels
          sx={sx}
          sy={sy}
          sz={sz}
          sides={box.sides}
          vars={box.vars ?? globalVars}
          dimCpConfig={dimCpConfig}
          wireframe={frameOnly}
          contrasted={contrasted}
        />
      )}
      {box.isArticle && !sansContenu && articleName && box.vars && box.w > 10 && box.h > 10 && box.d > 10 && (
        <ArticleInBox
          box={box}
          articleName={articleName}
          articleData={articleData}
          hasDoor={hasDoor}
          doorOpen={doorOpenForBox}
          doorsRemoved={doorsRemoved}
          showDims={showDims}
          contrasted={contrasted}
          hidden={hideArticle}
          wireframe={frameOnly}
        />
      )}
    </group>
  )
})
