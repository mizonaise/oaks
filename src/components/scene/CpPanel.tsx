'use client'

import { memo } from 'react'
import type { ResolvedCp } from './resolveCp'
import { useTextureWithFallback } from './useTextureWithFallback'

export type FaceAxis = 'x' | 'y' | 'z'

const MM = 1

export const CpPanel = memo(function CpPanel ({
  cp,
  axis,
  sign,
  sx,
  sy,
  sz
}: {
  cp: ResolvedCp
  axis: FaceAxis
  sign: 1 | -1
  sx: number
  sy: number
  sz: number
}) {
  const tex = useTextureWithFallback(cp.textureUrl)
  // Thickness in scene units; fall back to 2mm so a 0-thickness cp still shows.
  const t = Math.max(cp.thickness, 2) * MM
  const args: [number, number, number] =
    axis === 'x' ? [t, sy, sz] : axis === 'y' ? [sx, t, sz] : [sx, sy, t]
  const pos: [number, number, number] = [
    axis === 'x' ? sign * (sx / 2 - t / 2) : 0,
    axis === 'y' ? sign * (sy / 2 - t / 2) : 0,
    axis === 'z' ? sign * (sz / 2 - t / 2) : 0
  ]
  return (
    <mesh position={pos}>
      <boxGeometry args={args} />
      {/* Distinct keys force a fresh material when the texture finishes loading.
          Without them R3F reuses the no-map material instance and just assigns
          `map`, but the shader was compiled without USE_MAP so it renders black. */}
      {tex ? (
        <meshStandardMaterial key='mapped' map={tex} />
      ) : (
        <meshStandardMaterial key='plain' color='#888' />
      )}
    </mesh>
  )
})
