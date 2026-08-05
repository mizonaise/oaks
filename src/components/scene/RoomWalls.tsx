'use client'

import { memo, useMemo } from 'react'
import { CanvasTexture, DoubleSide, FrontSide, SRGBColorSpace } from 'three'
import type { Box as ShapeBox } from './shapeTree'

/** The cp a zone puts on a face to say "a room wall stands here". */
export const WALL_CP = 'CP_SPO_WALL'

/**
 * A room wall derived from a box face carrying {@link WALL_CP}: the axis the
 * face looks along, which side of the box it is, and the face's extent — all in
 * *scene units* (mm × scale), since the room renders outside the scaled group
 * the boxes live in.
 */
export type CpWall = {
  key: string
  /** Face normal axis. */
  axis: 'x' | 'z'
  /** -1 = low side of the box (left / front), +1 = high side (right / back). */
  sign: -1 | 1
  /** Plane position along the normal axis. */
  at: number
  /** Center of the face along its in-plane horizontal axis. */
  center: number
  /** Face size along that in-plane axis. */
  size: number
}

/**
 * One wall per box face referencing {@link WALL_CP}. `left`/`right` are the
 * x-normal faces, `front`/`back` the z-normal ones; `top`/`bottom` are ignored
 * since a room wall is vertical (and the floor/ceiling are always drawn).
 *
 * Box coords are mm — `scale` converts them to the room's scene units.
 */
export function findCpWalls (
  boxes: Array<Pick<ShapeBox, 'index' | 'x' | 'z' | 'w' | 'd' | 'sides'>>,
  scale: number
): CpWall[] {
  const walls: CpWall[] = []
  for (const b of boxes) {
    if (!b.sides) continue
    // `sides[*].cp` is already resolved from any `#DS_*` descriptor ref by
    // walkZone, so comparing the concrete name is enough.
    const faces = [
      ['left', 'x', -1, b.x, b.z, b.d],
      ['right', 'x', 1, b.x + b.w, b.z, b.d],
      ['front', 'z', -1, b.z, b.x, b.w],
      ['back', 'z', 1, b.z + b.d, b.x, b.w]
    ] as const
    for (const [face, axis, sign, at, spanStart, spanSize] of faces) {
      if (b.sides[face]?.cp !== WALL_CP) continue
      walls.push({
        key: `${b.index}:${face}`,
        axis,
        sign,
        at: at * scale,
        center: (spanStart + spanSize / 2) * scale,
        size: spanSize * scale
      })
    }
  }
  return walls
}

// A linear gradient band on a wall: gray at `at` (0..1 along the axis, where the
// unit contacts the wall) fading to transparent over `reach` (0..1) on each
// side. `axis` 'u' runs along the first plane arg, 'v' along the second (V up).
type WallBand = { axis: 'u' | 'v'; at: number; reach: number }

const GRAY = 'rgba(196, 199, 204, 1)'
const GRAY_TRANSPARENT = 'rgba(255, 255, 255, 1)'

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
 * and ceiling are always drawn; the side walls come from the shape itself — one
 * per box face carrying the `CP_SPO_WALL` cp, standing at that face.
 *
 * `w`/`h`/`d` are the shape's scene-unit dimensions; `boxes` is the walked shape
 * tree (mm), converted to scene units via `scale`. See {@link findCpWalls}.
 */
export const RoomWalls = memo(function RoomWalls ({
  w,
  h,
  d,
  boxes,
  scale
}: {
  w: number
  h: number
  d: number
  boxes: ShapeBox[]
  /** mm → scene units, matching the scaled group the boxes render in. */
  scale: number
}) {
  const cpWalls = useMemo(() => findCpWalls(boxes, scale), [boxes, scale])

  // Room extends a bit beyond the shape so it doesn't feel cramped.
  const wallH = h
  const margin = Math.max(w, d) * 60
  const roomD = d + margin

  // Horizontal extent of the floor / ceiling / back wall: it must reach exactly
  // to each x-normal wall and overhang by `margin` only where the room is open,
  // otherwise the ceiling juts past one wall and falls short of the other.
  //
  // Clamp by the wall's actual position, not its `sign`: a `left` face belonging
  // to a box at the far end of the shape still has sign -1 but stands on the
  // right. A wall at or left of the shape's midpoint bounds the left edge, one
  // right of it bounds the right edge; the outermost wins on each side.
  const xWalls = cpWalls.filter(k => k.axis === 'x')
  const mid = w / 2
  const leftWallAt = xWalls
    .filter(k => k.at <= mid)
    .reduce<number | null>(
      (m, k) => (m === null ? k.at : Math.min(m, k.at)),
      null
    )
  const rightWallAt = xWalls
    .filter(k => k.at > mid)
    .reduce<number | null>(
      (m, k) => (m === null ? k.at : Math.max(m, k.at)),
      null
    )
  // Walled sides land exactly on their wall's plane. A wall is nudged inward by
  // `WALL_GAP` (see its render below: `at - sign * WALL_GAP`), so the left edge
  // moves +GAP and the right edge −GAP — otherwise the ceiling overshoots each
  // wall by that gap. Open sides just overhang by `margin`.
  const left = leftWallAt !== null ? leftWallAt : -margin
  const right = rightWallAt !== null ? rightWallAt : w + margin
  const roomW = right - left
  const cx = (left + right) / 2

  // A straight gray band per wall where the unit meets it, fading to nothing.
  // Back wall: a vertical band centered on the unit's mid-height (V axis).
  const backTex = useMemo(() => {
    const at = wallH > 0 ? h / 2 / wallH : 0.5
    const reach = wallH > 0 ? Math.max(h / wallH, 0.15) * 0.6 : 0.5
    return makeLinearGradient({ axis: 'v', at, reach })
  }, [h, wallH])

  // The two side walls are rotated oppositely about Y (+π/2 vs −π/2), so their
  // local U axis (world z) points opposite ways on screen. Mirror the band's
  // position so the gray stays at the front (by the unit) on both.
  const sideReach = roomD > 0 ? Math.max(d / roomD, 0.15) * 1.2 : 0.5
  const sideAt = roomD > 0 ? d / 2 / roomD : 0.1
  const rightSideTex = useMemo(
    () => makeLinearGradient({ axis: 'u', at: sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const leftSideTex = useMemo(
    () => makeLinearGradient({ axis: 'u', at: 1 - sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )

  // Front/back walls span the room's full width, so their band follows the same
  // rule as the side walls but along the room's X extent: gray where the unit
  // stands, fading outward into the open part of the room. Both orientations are
  // rotated oppositely about Y as well, so mirror the position the same way.
  const frontReach = roomW > 0 ? Math.max(w / roomW, 0.15) * 1.2 : 0.5
  const frontAt = roomW > 0 ? (w / 2 - left) / roomW : 0.5
  const zTexA = useMemo(
    () => makeLinearGradient({ axis: 'u', at: frontAt, reach: frontReach }),
    [frontAt, frontReach]
  )
  const zTexB = useMemo(
    () => makeLinearGradient({ axis: 'u', at: 1 - frontAt, reach: frontReach }),
    [frontAt, frontReach]
  )

  // Ceiling: same banded gradient as the side walls, along its V axis (world z),
  // so the gray band has the same width and sits at the front (by the unit).
  const topTex = useMemo(
    () => makeLinearGradient({ axis: 'v', at: sideAt, reach: sideReach }),
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
      <meshBasicMaterial
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
      {/* <Plane
        position={[cx, 0, roomD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[roomW, roomD]}
      /> */}

      {/* Ceiling — back→front linear gradient (gray at back fading to white).
          `cx`/`roomW` already carry the WALL_GAP shift on each walled side, so
          the ceiling meets the walls without a seam or an overhang.

          `FrontSide` like the side walls: its front face points down (−Y) into
          the room, so it reads as a ceiling from inside but is culled when the
          camera orbits above it, where it would otherwise hide the unit. */}
      <Plane
        position={[cx, wallH, roomD / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[roomW, roomD]}
        side={FrontSide}
        map={topTex}
      />

      {/* Back wall (behind the shape, at z = 0) */}
      {/* <Plane
        position={[cx, wallH / 2, 0]}
        rotation={[0, 0, 0]}
        args={[roomW, wallH]}
        // map={backTex}
      /> */}

      {/* Side walls, one per box face carrying CP_SPO_WALL. Each is rotated so
          its front face points back into the room (+X for a low/left face, −X
          for a high/right face), so it's visible from inside only.

          An x-normal wall spans the room's full depth like the old left/right
          walls did; a z-normal one spans the room's full width. */}
      {cpWalls.map(wall =>
        wall.axis === 'x' ? (
          <Plane
            key={wall.key}
            position={[wall.at, wallH / 2, roomD / 2]}
            rotation={[0, -(wall.sign * Math.PI) / 2, 0]}
            args={[roomD, wallH]}
            side={FrontSide}
            // The two orientations mirror their local U axis (world z), so flip
            // the band's position to keep the gray at the front on both.
            map={wall.sign === -1 ? leftSideTex : rightSideTex}
          />
        ) : (
          <Plane
            key={wall.key}
            position={[cx, wallH / 2, wall.at]}
            rotation={[0, wall.sign === -1 ? Math.PI : 0, 0]}
            args={[roomW, wallH]}
            side={FrontSide}
            // Same mirroring as the x-normal pair: the π rotation flips the
            // local U axis (world x), so the band position flips with it to keep
            // the gray on the unit and the fade running outward.
            map={wall.sign === -1 ? zTexB : zTexA}
          />
        )
      )}
    </group>
  )
})
