'use client'

import { memo, useMemo } from 'react'
import * as THREE from 'three'

export const BoxEdges = memo(function BoxEdges ({
  sx,
  sy,
  sz,
  color,
  selected
}: {
  sx: number
  sy: number
  sz: number
  color: string
  selected: boolean
}) {
  const geom = useMemo(() => new THREE.BoxGeometry(sx, sy, sz), [sx, sy, sz])
  return (
    <lineSegments>
      <edgesGeometry args={[geom]} />
      <lineBasicMaterial color={color} linewidth={selected ? 2 : 1} />
    </lineSegments>
  )
})
