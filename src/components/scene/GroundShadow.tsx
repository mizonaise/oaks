'use client'

import { memo } from 'react'

export const GroundShadow = memo(function GroundShadow ({
  w,
  d
}: {
  w: number
  d: number
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[w / 2, 0, d / 2]}
      receiveShadow
    >
      <planeGeometry args={[w * 4, d * 8]} />
      <shadowMaterial opacity={0.2} />
    </mesh>
  )
})
