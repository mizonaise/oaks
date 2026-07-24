'use client'

import { useMemo } from 'react'
import type { Box } from './shapeTree'

type Props = {
  boxes: Box[]
  selectedIndex: string | null
  onSelect: (index: string) => void
}

// Builds a parent → children map keyed by `index` ("0", "0.1", "0.1.0", …)
// from the flat box list, so the tree mirrors the original recursion.
type TreeNode = { box: Box; children: TreeNode[] }

function parentIndex (idx: string): string | null {
  if (!idx) return null
  // Synthetic children produced for empty slices: "0.1.0#2"
  const hashAt = idx.indexOf('#')
  if (hashAt >= 0) return idx.slice(0, hashAt)
  const dot = idx.lastIndexOf('.')
  return dot < 0 ? '' : idx.slice(0, dot)
}

function buildForest (boxes: Box[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  for (const b of boxes) map.set(b.index, { box: b, children: [] })
  const roots: TreeNode[] = []
  for (const n of map.values()) {
    const p = parentIndex(n.box.index)
    const parent = p !== null ? map.get(p) : undefined
    if (parent) parent.children.push(n)
    else roots.push(n)
  }
  return roots
}

export function Hierarchy ({ boxes, selectedIndex, onSelect }: Props) {
  const roots = useMemo(() => buildForest(boxes), [boxes])
  return (
    <div className='h-125 overflow-auto rounded border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono'>
      {roots.map(n => (
        <Row
          key={n.box.index}
          node={n}
          depth={0}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function Row ({
  node,
  depth,
  selectedIndex,
  onSelect
}: {
  node: TreeNode
  depth: number
  selectedIndex: string | null
  onSelect: (index: string) => void
}) {
  const { box } = node
  const isSelected = selectedIndex === box.index
  return (
    <div>
      <button
        type='button'
        onClick={() => onSelect(box.index)}
        style={{ paddingLeft: depth * 12 + 4 }}
        className={`flex w-full min-w-max items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
          isSelected ? 'bg-yellow-200 dark:bg-yellow-900' : ''
        }`}
      >
        <span className='shrink-0 text-zinc-400'>{box.index || '·'}</span>
        <span className='whitespace-nowrap'>
          {box.name ?? (box.isArticle ? 'article' : 'box')}
        </span>
        <span className='ml-auto shrink-0 pl-4 text-zinc-400'>
          {box.w.toFixed(2)}×{box.h.toFixed(2)}×{box.d.toFixed(2)}
        </span>
      </button>
      {node.children.map(c => (
        <Row
          key={c.box.index}
          node={c}
          depth={depth + 1}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
