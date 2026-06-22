'use client'

import { memo, useMemo } from 'react'
import { CanvasTexture, DoubleSide, FrontSide, SRGBColorSpace } from 'three'
import type { FlatVars } from '@/lib/form/expr'

/** `"1"`/`1`/`true` → built-in on that side; anything else → freestanding. */
export function isBuiltIn (raw: unknown): boolean {
  if (raw == null) return false
  const s = String(raw).trim().toLowerCase()
  return s === '1' || s === 'true'
}

// A linear gradient band on a wall: gray at `at` (0..1 along the axis, where the
// unit contacts the wall) fading to transparent over `reach` (0..1) on each
// side. `axis` 'u' runs along the first plane arg, 'v' along the second (V up).
type WallBand = { axis: 'u' | 'v'; at: number; reach: number }

const GRAY = 'rgba(196, 199, 204, 1)'
const GRAY_TRANSPARENT = 'rgba(196, 199, 204, 0)'

/**
 * Builds a straight (linear) gradient texture: a gray band at `band.at` fading
 * to fully transparent over `band.reach` to either side, like a soft shadow
 * line where the unit meets the wall. Mapped onto a transparent plane (which
 * still receives the unit's cast shadow).
 */
function makeLinearGradient (band: WallBand): CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const N = 256
  const horizontal = band.axis === 'u'
  const canvas = document.createElement('canvas')
  canvas.width = horizontal ? N : 1
  canvas.height = horizontal ? 1 : N
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Position along the axis in canvas space. Canvas Y grows downward, texture V
  // grows upward, so flip for the vertical axis.
  const pos = horizontal ? band.at : 1 - band.at
  const grad = horizontal
    ? ctx.createLinearGradient(0, 0, N, 0)
    : ctx.createLinearGradient(0, 0, 0, N)
  const lo = Math.max(0, pos - band.reach)
  const hi = Math.min(1, pos + band.reach)
  grad.addColorStop(0, GRAY_TRANSPARENT)
  if (lo > 0) grad.addColorStop(lo, GRAY_TRANSPARENT)
  grad.addColorStop(pos, GRAY)
  if (hi < 1) grad.addColorStop(hi, GRAY_TRANSPARENT)
  grad.addColorStop(1, GRAY_TRANSPARENT)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
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

  // A straight gray band per wall where the unit meets it, fading to nothing.
  // Back wall: a vertical band centered on the unit's mid-height (V axis).
  const backTex = useMemo(() => {
    const at = wallH > 0 ? (h / 2) / wallH : 0.5
    const reach = wallH > 0 ? Math.max(h / wallH, 0.15) * 0.6 : 0.5
    return makeLinearGradient({ axis: 'v', at, reach })
  }, [h, wallH])

  // The two side walls are rotated oppositely about Y (+π/2 vs −π/2), so their
  // local U axis (world z) points opposite ways on screen. Mirror the band's
  // position so the gray stays at the front (by the unit) on both.
  const sideReach = roomD > 0 ? Math.max(d / roomD, 0.15) * 1.2 : 0.5
  const sideAt = roomD > 0 ? (d / 2) / roomD : 0.1
  const rightSideTex = useMemo(
    () => makeLinearGradient({ axis: 'u', at: sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const leftSideTex = useMemo(
    () => makeLinearGradient({ axis: 'u', at: 1 - sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )

  const Plane = ({
    position,
    rotation,
    args,
    // Side walls use FrontSide so they're visible from inside the room but
    // transparent when viewed from outside; the front face points inward.
    side = DoubleSide,
    // Vertical walls pass a radial gradient texture; floor/ceiling stay plain.
    map = null
  }: {
    position: [number, number, number]
    rotation: [number, number, number]
    args: [number, number]
    side?: typeof DoubleSide | typeof FrontSide
    map?: CanvasTexture | null
  }) => (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      {/* A mapped wall is transparent: only the gray pool shows, fading to
          nothing. Floor/ceiling (no map) stay opaque white. */}
      <meshStandardMaterial
        color='#ffffff'
        map={map}
        transparent={map != null}
        side={side}
      />
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
        map={backTex}
      />

      {/* Left wall — only when built-in on the left.
          Front face points +X (into the room) → visible from inside only. */}
      {builtInLeft && (
        <Plane
          position={[0, wallH / 2, roomD / 2]}
          rotation={[0, Math.PI / 2, 0]}
          args={[roomD, wallH]}
          side={FrontSide}
          map={leftSideTex}
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
          map={rightSideTex}
        />
      )}
    </group>
  )
})
