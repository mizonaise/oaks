'use client'

import { memo } from 'react'

export const BoxPickMesh = memo(function BoxPickMesh ({
  sx,
  sy,
  sz,
  selected,
  onSelect,
  color = '#facc15'
}: {
  sx: number
  sy: number
  sz: number
  selected: boolean
  onSelect: () => void
  /** Fill color of the pick overlay when selected. */
  color?: string
}) {
  return (
    <mesh
      onClick={e => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <boxGeometry args={[sx + 10, sy + 10, sz + 10]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={selected ? 0.25 : 0}
        depthWrite={false}
      />
    </mesh>
  )
})
