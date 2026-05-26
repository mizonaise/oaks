'use client'

import { memo } from 'react'

export const BoxPickMesh = memo(function BoxPickMesh ({
  sx,
  sy,
  sz,
  selected,
  onSelect
}: {
  sx: number
  sy: number
  sz: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <mesh
      onClick={e => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <boxGeometry args={[sx, sy, sz]} />
      <meshStandardMaterial
        color='#facc15'
        transparent
        opacity={selected ? 0.25 : 0}
        depthWrite={false}
      />
    </mesh>
  )
})
