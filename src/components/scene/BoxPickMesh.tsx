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
    <group>
      {/* Invisible full-volume box: the click/pick target for the zone. */}
      <mesh
        onClick={e => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <boxGeometry args={[sx + 10, sy + 10, sz + 10]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Highlight rendered as a flat plan on top of the zone instead of a
          full box, so it reads as a footprint rather than an enclosing cage. */}
      {selected && (
        <mesh
          position={[0, sy / 2 + 5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[sx + 10, sz + 10]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.35}
            depthWrite={false}
            side={2}
          />
        </mesh>
      )}
    </group>
  )
})
