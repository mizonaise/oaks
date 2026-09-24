'use client'

import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { Billboard, Line, Text } from '@react-three/drei'
import type { Box as ShapeBox } from '../shapeTree'

/**
 * Cotes (banc de rendu, 2026-09-10) — architectural dimension lines drawn
 * OUTSIDE the unit, in the scene's metres, with the site's typography.
 *
 * `globales` : overall width (above, in front), height (left), depth (right).
 * `detaillees` : + one width per top-level zone (above) and one height per
 *   stacked level of the first column (left, second row of lines).
 *
 * Drawing grammar (charte : sobre, lisible) : hairline in ink, extension
 * lines from the unit to the dimension line, small 45° ticks at both ends,
 * the value centred on the line in a white pill, mm without unit (like the
 * form), thousands separated by a thin space. Labels always face the camera
 * (`Html`), lines live in the scene so they follow every angle.
 */

export type DimLevel = 'globales' | 'detaillees'

const INK = '#2B2B2B'
const GAP = 0.12 // first dimension line: 120 mm from the unit
const ROW = 0.16 // distance between stacked rows of lines
const TICK = 0.03 // half-length of the 45° tick
const EXT_OVER = 0.04 // extension line overshoot past the dimension line

export const fmt = (mm: number) => Math.round(mm).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

type V3 = [number, number, number]

/** One dimension line from `a` to `b` (metres), with extension lines going from
 *  `fromA`/`fromB` (points on the unit) to the line. `tickDir` is the in-plane
 *  direction of the 45° ticks. */
export function DimLine ({
  a,
  b,
  fromA,
  fromB,
  tickDir,
  label,
  small = false
}: {
  /** Interior chain: smaller figures, no extension lines. */
  small?: boolean
  a: V3
  b: V3
  fromA: V3
  fromB: V3
  tickDir: V3
  label: string
}) {
  const pts = useMemo(() => {
    const A = new THREE.Vector3(...a)
    const B = new THREE.Vector3(...b)
    const dir = B.clone().sub(A).normalize()
    const t = new THREE.Vector3(...tickDir).normalize()
    // 45° tick: along (dir + t) normalised, both sides of the end point
    const tk = dir.clone().add(t).normalize().multiplyScalar(TICK)
    const over = (from: THREE.Vector3, to: THREE.Vector3) =>
      to.clone().add(to.clone().sub(from).normalize().multiplyScalar(EXT_OVER))
    const FA = new THREE.Vector3(...fromA)
    const FB = new THREE.Vector3(...fromB)
    return {
      main: [A, B] as [THREE.Vector3, THREE.Vector3],
      extA: [FA, over(FA, A)] as [THREE.Vector3, THREE.Vector3],
      extB: [FB, over(FB, B)] as [THREE.Vector3, THREE.Vector3],
      tickA: [A.clone().sub(tk), A.clone().add(tk)] as [THREE.Vector3, THREE.Vector3],
      tickB: [B.clone().sub(tk), B.clone().add(tk)] as [THREE.Vector3, THREE.Vector3],
      mid: A.clone().add(B).multiplyScalar(0.5)
    }
  }, [a, b, fromA, fromB, tickDir])

  const size = small ? 0.075 : 0.11
  return (
    <group>
      <Line points={pts.main} color={INK} lineWidth={small ? 0.9 : 1.1} />
      {!small && <Line points={pts.extA} color={INK} lineWidth={0.8} opacity={0.55} transparent />}
      {!small && <Line points={pts.extB} color={INK} lineWidth={0.8} opacity={0.55} transparent />}
      <Line points={pts.tickA} color={INK} lineWidth={1.1} />
      <Line points={pts.tickB} color={INK} lineWidth={1.1} />
      {/* In-canvas label (so it lands in captures and `toDataURL`), always
          facing the camera, white pill behind the figures. Empty label: the
          gap is too small for a figure (overlap rule) — line and ticks only. */}
      {label && (
      <Billboard position={pts.mid} follow>
        <mesh position={[0, 0, -0.001]} raycast={() => null}>
          <planeGeometry args={[size * 0.7 + label.length * size * 0.66, size * 1.55]} />
          <meshBasicMaterial color='#ffffff' transparent opacity={0.92} depthWrite={false} />
        </mesh>
        {/* troika (drei Text) reads TTF/OTF/WOFF, not WOFF2 — the site's PP Air
            Mono only exists in woff2 here, so the default font serves the bench;
            hand the TTF to Otman with the lot. */}
        <Text
          fontSize={size}
          color={INK}
          anchorX='center'
          anchorY='middle'
          letterSpacing={0.02}
          raycast={() => null}
        >
          {label}
        </Text>
      </Billboard>
      )}
    </group>
  )
}

export const Dimensions = memo(function Dimensions ({
  w,
  h,
  d,
  boxes,
  scale,
  level,
  walls = { left: false, right: false },
  ceilingFlush = false
}: {
  /** Unit bounds in metres (group-local: x 0..w, y 0..h, z 0..d). */
  w: number
  h: number
  d: number
  boxes: ShapeBox[]
  scale: number
  level: DimLevel
  /**
   * A room wall stands flush with that side (built-in): a chain drawn OUTSIDE
   * the unit there would be behind the wall, invisible. It is drawn inside the
   * room instead, in front of the façade (plan de prises de vue, 2026-09-15 —
   * measured: the height figure clipped by the left wall on `schema_face`).
   */
  walls?: { left: boolean; right: boolean }
  /** The ceiling sits on the unit top: the width chain goes below it. */
  ceilingFlush?: boolean
}) {
  const zones = useMemo(() => {
    // Top-level zones: the shallowest non-root boxes that partition the width.
    const depths = boxes.map(b => b.depth).filter(x => x > 0)
    if (!depths.length) return []
    const first = Math.min(...depths)
    return boxes
      .filter(b => b.depth === first && b.w > 10)
      .sort((p, q) => p.x - q.x)
  }, [boxes])

  const levels = useMemo(() => {
    // Stacked levels of the left-most column: its children sorted by y.
    if (!zones.length) return []
    const col = zones[0]
    const kids = boxes
      .filter(b => b.index.startsWith(`${col.index}.`) && b.depth === col.depth + 1 && b.h > 10)
      .sort((p, q) => p.y - q.y)
    return kids.length > 1 ? kids : []
  }, [boxes, zones])

  const zFront = d + GAP
  const rows = level === 'detaillees' && zones.length > 1 ? 2 : 1
  // Sides flip INTO the room where a wall or the ceiling would hide the chain:
  // the top rows hang below the unit top, the height chain stands just inside
  // the left edge, the depth chain just inside the right edge.
  const yRow1 = ceilingFlush ? h - GAP : h + GAP
  const yTop = ceilingFlush ? h - GAP - (rows - 1) * ROW : h + GAP + (rows - 1) * ROW
  const xHeight = walls.left ? GAP : -GAP
  const xLeft = walls.left
    ? GAP + (level === 'detaillees' && levels.length ? ROW : 0)
    : -GAP - (level === 'detaillees' && levels.length ? ROW : 0)
  const xDepth = walls.right ? w - GAP : w + GAP

  return (
    <group>
      {/* Overall width — above the unit (or just below its top), in front, top row. */}
      <DimLine
        a={[0, yTop, zFront]}
        b={[w, yTop, zFront]}
        fromA={[0, h, zFront]}
        fromB={[w, h, zFront]}
        tickDir={[0, 1, 0]}
        label={fmt(w / scale)}
      />
      {/* Overall height — left of the unit (or just inside it), in front. */}
      <DimLine
        a={[xLeft, 0, zFront]}
        b={[xLeft, h, zFront]}
        fromA={[0, 0, zFront]}
        fromB={[0, h, zFront]}
        tickDir={[1, 0, 0]}
        label={fmt(h / scale)}
      />
      {/* Overall depth — right of the unit (or just inside it), along z, at floor level. */}
      <DimLine
        a={[xDepth, 0, 0]}
        b={[xDepth, 0, d]}
        fromA={[w, 0, 0]}
        fromB={[w, 0, d]}
        tickDir={[1, 0, 0]}
        label={fmt(d / scale)}
      />
      {level === 'detaillees' && zones.length > 1 && zones.map(z => (
        <DimLine
          key={`zw-${z.index}`}
          a={[z.x * scale, yRow1, zFront]}
          b={[(z.x + z.w) * scale, yRow1, zFront]}
          fromA={[z.x * scale, h, zFront]}
          fromB={[(z.x + z.w) * scale, h, zFront]}
          tickDir={[0, 1, 0]}
          label={fmt(z.w)}
        />
      ))}
      {level === 'detaillees' && levels.map(l => (
        <DimLine
          key={`lh-${l.index}`}
          a={[xHeight, l.y * scale, zFront]}
          b={[xHeight, (l.y + l.h) * scale, zFront]}
          fromA={[0, l.y * scale, zFront]}
          fromB={[0, (l.y + l.h) * scale, zFront]}
          tickDir={[1, 0, 0]}
          label={fmt(l.h)}
        />
      ))}
    </group>
  )
})
