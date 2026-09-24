'use client'

import { memo } from 'react'

export const GroundShadow = memo(function GroundShadow ({
  w,
  d,
  opacity = 0.35
}: {
  w: number
  d: number
  opacity?: number
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[w / 2, 0.002, d / 2]}
      receiveShadow
    >
      <planeGeometry args={[w * 4, d * 8]} />
      <shadowMaterial opacity={opacity} />
    </mesh>
  )
})
