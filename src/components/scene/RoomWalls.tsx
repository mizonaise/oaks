'use client'

import { memo } from 'react'
import { DoubleSide, FrontSide } from 'three'
import type { FlatVars } from '@/lib/form/expr'

/** `"1"`/`1`/`true` → built-in on that side; anything else → freestanding. */
export function isBuiltIn (raw: unknown): boolean {
  if (raw == null) return false
  const s = String(raw).trim().toLowerCase()
  return s === '1' || s === 'true'
}

/**
 * Decorative white-plane room around the shape. The shape occupies the box
 * x∈[0,w], y∈[0,h], z∈[0,d] (scene units) in the parent group. Back wall, floor
 * and ceiling are always drawn; the left/right walls appear only when the unit
 * is built-in on that side (`IS_BI_L` / `IS_BI_R` = 1) and are hidden when
 * freestanding (0).
 *
 * `w`/`h`/`d` are the shape's scene-unit dimensions; `globalVars` carries the
 * resolved `IS_BI_*` flags.
 */
export const RoomWalls = memo(function RoomWalls ({
  w,
  h,
  d,
  globalVars
}: {
  w: number
  h: number
  d: number
  globalVars: FlatVars
}) {
  const builtInLeft = isBuiltIn(globalVars.IS_BI_L)
  const builtInRight = isBuiltIn(globalVars.IS_BI_R)

  // Room extends a bit beyond the shape so it doesn't feel cramped.
  const wallH = h
  const margin = Math.max(w, d) * 60
  const roomD = d + margin

  // Horizontal extent of the floor / ceiling / back wall. On a built-in side
  // the panel stops flush at that wall (x = 0 left, x = w right); on an open
  // side it overhangs by `margin` so the room doesn't feel cramped.
  const left = builtInLeft ? 0 : -margin
  const right = builtInRight ? w : w + margin
  const roomW = right - left
  const cx = (left + right) / 2

  const Plane = ({
    position,
    rotation,
    args,
    // Side walls use FrontSide so they're visible from inside the room but
    // transparent when viewed from outside; the front face points inward.
    side = DoubleSide
  }: {
    position: [number, number, number]
    rotation: [number, number, number]
    args: [number, number]
    side?: typeof DoubleSide | typeof FrontSide
  }) => (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial color='#ffffff' side={side} />
    </mesh>
  )

  return (
    <group>
      {/* Floor */}
      <Plane
        position={[cx, 0, roomD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[roomW, roomD]}
      />

      {/* Ceiling */}
      <Plane
        position={[cx, wallH, roomD / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[roomW, roomD]}
      />

      {/* Back wall (behind the shape, at z = 0) */}
      <Plane
        position={[cx, wallH / 2, 0]}
        rotation={[0, 0, 0]}
        args={[roomW, wallH]}
      />

      {/* Left wall — only when built-in on the left.
          Front face points +X (into the room) → visible from inside only. */}
      {builtInLeft && (
        <Plane
          position={[0, wallH / 2, roomD / 2]}
          rotation={[0, Math.PI / 2, 0]}
          args={[roomD, wallH]}
          side={FrontSide}
        />
      )}

      {/* Right wall — only when built-in on the right.
          Front face points -X (into the room) → visible from inside only. */}
      {builtInRight && (
        <Plane
          position={[w, wallH / 2, roomD / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          args={[roomD, wallH]}
          side={FrontSide}
        />
      )}
    </group>
  )
})
