'use client'

import { memo } from 'react'
import { Html } from '@react-three/drei'
import type { ResolvedCp } from './resolveCp'
import { useTextureWithFallback } from './useTextureWithFallback'

export type FaceAxis = 'x' | 'y' | 'z'

/** One arrowed measurement: the value (mm) shown along the given axis. */
export type DimMeasure = { axis: FaceAxis; value: number }

const MM = 1

export const CpPanel = memo(function CpPanel ({
  cp,
  axis,
  sign,
  sx,
  sy,
  sz,
  dims
}: {
  cp: ResolvedCp
  axis: FaceAxis
  sign: 1 | -1
  sx: number
  sy: number
  sz: number
  /** Arrowed dimension lines to draw at this panel's face. */
  dims?: DimMeasure[]
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
  // Arrows float just in front of the box, through its center. Each successive
  // arrow is nudged a little further forward so they don't z-fight or overlap.
  const lift = Math.max(sx, sy, sz) * 0.06
  const frontZ = sz / 2 + lift
  // Half-spans along each axis used to size/place the arrows.
  const half: Record<FaceAxis, number> = {
    x: (axis === 'x' ? t : sx) / 2,
    y: (axis === 'y' ? t : sy) / 2,
    z: (axis === 'z' ? t : sz) / 2
  }
  return (
    <>
      <mesh position={pos} castShadow receiveShadow>
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
      {dims?.map((d, k) => {
        // Centered on the box center, floating just in front of the front face.
        // width (x) and height (y) arrows lie in the front plane; the depth (z)
        // arrow runs front-to-back through the center. Each successive arrow is
        // nudged forward so they don't overlap.
        const z = frontZ + k * lift
        const base: [number, number, number] =
          d.axis === 'z' ? [0, 0, 0] : [0, 0, z]
        return (
          <DimArrow
            key={d.axis}
            dimAxis={d.axis}
            value={d.value}
            half={half[d.axis]}
            base={base}
          />
        )
      })}
    </>
  )
})

// A double-headed dimension arrow of length `half * 2` along `dimAxis`,
// centered at `base`, with the value label at its midpoint.
function DimArrow ({
  dimAxis,
  value,
  half,
  base
}: {
  dimAxis: FaceAxis
  value: number
  half: number
  base: [number, number, number]
}) {
  const ai = dimAxis === 'x' ? 0 : dimAxis === 'y' ? 1 : 2
  const head = Math.min(half * 0.5, 60) // arrowhead length, capped
  const radius = Math.min(half * 0.01, 3)

  // Cylinders/cones default to +Y; rotate so they align with the measured axis.
  const alignRot: [number, number, number] =
    dimAxis === 'x'
      ? [0, 0, -Math.PI / 2]
      : dimAxis === 'z'
      ? [Math.PI / 2, 0, 0]
      : [0, 0, 0]

  // Tip positions, then pull each cone inward by half its length, and flip the
  // negative-side cone 180° about an in-plane axis so it points outward.
  const cone = (s: 1 | -1) => {
    const p: [number, number, number] = [...base]
    p[ai] += s * (half - head / 2)
    const rot: [number, number, number] = [...alignRot]
    if (s < 0) rot[(ai + 1) % 3] += Math.PI
    return { p, rot }
  }
  const c1 = cone(1)
  const c2 = cone(-1)

  // Label sits to the left of the arrow: nudge it perpendicular to the arrow's
  // direction. For a horizontal (x) arrow "left" is along -x past the end; for
  // vertical (y) / depth (z) arrows, shift it sideways off the shaft.
  const offset = half * 0.6 + head
  const labelPos: [number, number, number] = [...base]
  if (dimAxis === 'x') {
    labelPos[2] += half + head
    labelPos[0] -= half + head
  } else {
    labelPos[2] += 30
    labelPos[0] -= 30
  }

  return (
    <group>
      {/* Shaft */}
      <mesh position={base} rotation={alignRot}>
        <cylinderGeometry args={[radius, radius, half * 2, 6]} />
        <meshBasicMaterial color='#2563eb' />
      </mesh>
      <mesh position={c1.p} rotation={c1.rot}>
        <coneGeometry args={[head * 0.35, head, 12]} />
        <meshBasicMaterial color='#2563eb' />
      </mesh>
      <mesh position={c2.p} rotation={c2.rot}>
        <coneGeometry args={[head * 0.35, head, 12]} />
        <meshBasicMaterial color='#2563eb' />
      </mesh>
      <Html position={labelPos} center zIndexRange={[100, 0]}>
        <div
          className='pointer-events-none select-none whitespace-nowrap px-1.5 py-0.5 text-[9px] font-medium text-blue-600'
          // Rotate the label to run along its arrow: height (y) reads bottom-to
          // -top, the others stay horizontal.
          style={{ transform: dimAxis === 'y' ? 'rotate(-90deg)' : undefined }}
        >
          {value}
        </div>
      </Html>
    </group>
  )
}
