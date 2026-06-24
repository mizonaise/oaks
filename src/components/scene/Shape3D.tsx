'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  OrbitControls,
  OrthographicCamera,
  // OrthographicCamera,
  PerspectiveCamera
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { type Box as ShapeBox, type DimCpConfig } from './shapeTree'
import type { FlatVars } from '@/lib/form/expr'
import { SceneLights } from './SceneLights'
import { GroundShadow } from './GroundShadow'
import { RoomWalls, isBuiltIn } from './RoomWalls'
import { BoxItem } from './BoxItem'

type Props = {
  dev?: boolean
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
  /** Per-CP dimension config: panels whose `cpName` is a key here get an
   *  in-scene label, with the `w`/`h`/`d` flags selecting which of the box's
   *  dimensions to include. */
  dimCpConfig?: DimCpConfig
}

const MM = 1
const SCALE = 0.001

// Small epsilon (mm) so a box merely touching the zone's near face (a shared
// panel) isn't treated as being in front of it.
const EPS = 1

/**
 * The `camera` side that governs a box index, found by walking up its ancestors
 * (the box itself, then each shorter dotted-index prefix). `camera` lives only
 * on the declaring node, so a selected descendant inherits it via this lookup.
 * Returns undefined when no ancestor declares `camera` — i.e. not a camera zone.
 */
function cameraSideFor (
  boxes: ShapeBox[],
  index: string | null
): string | undefined {
  if (!index) return undefined
  const byIndex = new Map(boxes.map(b => [b.index, b]))
  for (
    let key: string | undefined = index;
    key;
    key = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : undefined
  ) {
    const camera = byIndex.get(key)?.camera
    if (camera) return camera
  }
  return undefined
}

/**
 * Indexes of boxes that sit between the selected camera zone and the camera and
 * would occlude it. Empty unless the selection resolves to a camera zone.
 *
 * Works in mm box space: pick the viewing axis from the `camera` side, keep
 * boxes that overlap the zone on the two perpendicular axes, then keep those
 * lying on the camera's side of the zone. The selected zone's own subtree (its
 * ancestors and descendants share its volume) is never hidden.
 */
function occludingIndexes (
  boxes: ShapeBox[],
  selectedIndex: string | null
): Set<string> {
  const empty = new Set<string>()
  if (!selectedIndex) return empty
  const sel = boxes.find(b => b.index === selectedIndex)
  const camSide = cameraSideFor(boxes, selectedIndex)
  if (!sel || !camSide) return empty

  const side = camSide.toUpperCase()
  // axis = the viewing axis; `front` is true when the camera looks from the
  // axis-max side toward the min (so occluders are at greater coords).
  let axis: 'x' | 'y' | 'z'
  let front: boolean
  switch (side) {
    case 'BACK':
      axis = 'z'
      front = false
      break
    case 'LEFT':
      axis = 'x'
      front = false
      break
    case 'RIGHT':
      axis = 'x'
      front = true
      break
    case 'TOP':
      axis = 'y'
      front = true
      break
    case 'BOTTOM':
      axis = 'y'
      front = false
      break
    case 'FRONT':
    default:
      axis = 'z'
      front = true
  }

  const selMax =
    sel[axis] + (axis === 'x' ? sel.w : axis === 'y' ? sel.h : sel.d)
  const selFace = front ? selMax : sel[axis]

  // Is `b` part of the selected zone's own subtree (itself, an ancestor, or a
  // descendant)? Those share the zone's volume and must stay visible.
  const inSubtree = (b: ShapeBox) =>
    b.index === sel.index ||
    b.index.startsWith(`${sel.index}.`) ||
    sel.index.startsWith(`${b.index}.`)

  const hidden = new Set<string>()
  for (const b of boxes) {
    if (inSubtree(b)) continue

    // Hide everything on the camera side of the zone's near face, regardless of
    // whether it overlaps the zone's footprint — clears the whole space between
    // the camera and the framed zone, not just what directly occludes it.
    const bMin = b[axis]
    const bMax = bMin + (axis === 'x' ? b.w : axis === 'y' ? b.h : b.d)
    const onCameraSide = front ? bMax > selFace + EPS : bMin < selFace - EPS
    if (onCameraSide) hidden.add(b.index)
  }
  return hidden
}

const DEFAULT_DIM_CP_CONFIG: DimCpConfig = {
  CP_1_FI_1000: { w: false, h: true, d: false },
  CP_1_FI_1111: { w: false, h: true, d: false },
  CP_1_BA_1000: { w: false, h: true, d: false },
  CP_1_CM_0000: { w: false, h: true, d: false },
  CP_1_TSI_1000_C1: { w: false, h: true, d: false }
}

export function Shape3D ({
  dev = false,
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect,
  dimCpConfig = DEFAULT_DIM_CP_CONFIG
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  const [showDims, setShowDims] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [contrasted, setContrasted] = useState(false)

  // Constrain the horizontal orbit so the camera can't swing past a built-in
  // wall and see the unit from outside. A built-in side limits the camera to
  // the corridor between the walls; open sides allow free rotation.
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // When a zone with a `camera` side is selected, hide anything sitting between
  // it and the camera so the framed zone is never occluded. Computed in mm box
  // space (shared by every box).
  const hiddenIndexes = useMemo(
    () => occludingIndexes(boxes, selectedIndex),
    [boxes, selectedIndex]
  )

  // True only when the selected box is itself a `camera`-declaring node. That
  // node is framed, not opened (doors stay shut); selecting a zone *inside* a
  // camera zone is a normal selection and opens its doors.
  const selectedIsCameraNode = useMemo(
    () =>
      selectedIndex != null &&
      Boolean(boxes.find(b => b.index === selectedIndex)?.camera),
    [boxes, selectedIndex]
  )

  return (
    <div className='relative h-175 w-full overflow-hidden rounded border border-zinc-200 dark:border-zinc-800'>
      <button
        type='button'
        onClick={() => setDoorsOpen(open => !open)}
        title={doorsOpen ? 'Close all doors' : 'Open all doors'}
        aria-pressed={doorsOpen}
        className='absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
      >
        <DoorIcon open={doorsOpen} />
      </button>
      <button
        type='button'
        onClick={() => setShowDims(open => !open)}
        title={showDims ? 'Hide dimensions' : 'Show dimensions'}
        aria-pressed={showDims}
        className='absolute right-3 top-15 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
      >
        <RulerIcon />
      </button>
      <button
        type='button'
        onClick={() => setContrasted(open => !open)}
        title={contrasted ? 'Disable contrast' : 'Enable contrast'}
        aria-pressed={contrasted}
        className='absolute right-3 top-27 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
      >
        <ContrastIcon />
      </button>
      <Canvas
        shadows='soft'
        dpr={[1, 2]}
        // R3F defaults to ACES Filmic tone mapping, which renders a material
        // `#ffffff` as a slightly off (grayish) white — so the canvas white
        // doesn't match the page's CSS white. Disable it for true white.
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <SceneLights radius={Math.hypot(w, h, d) / 2} />
        {/* <OrthographicCamera makeDefault zoom={100} position={[0, h / 2, 100]} /> */}
        {dev ? (
          <OrthographicCamera
            makeDefault
            zoom={100}
            position={[0, h / 2, 100]}
          />
        ) : (
          <PerspectiveCamera makeDefault position={[0, h / 2, 100]} zoom={20} />
        )}
        {/* <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} /> */}
        <group position={[ox, 0, oz]}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map((b, i) => {
              if (b.depth === 0 && !b.isArticle) return null
              return (
                <BoxItem
                  key={`${b.index}-${i}`}
                  box={b}
                  dev={dev}
                  isSelected={b.index === selectedIndex}
                  inSelectedSubtree={
                    selectedIndex != null &&
                    (b.index === selectedIndex ||
                      b.index.startsWith(`${selectedIndex}.`))
                  }
                  isCameraZone={selectedIsCameraNode}
                  onSelect={onSelect}
                  globalVars={globalVars}
                  hidden={hiddenIndexes.has(b.index)}
                  doorOpen={doorsOpen}
                  dimCpConfig={showDims ? dimCpConfig : null}
                  showDims={showDims}
                  contrasted={contrasted}
                />
              )
            })}
          </group>

          {!dev && (
            <Suspense fallback={null}>
              <RoomWalls w={w} h={h} d={d} globalVars={globalVars} />
            </Suspense>
          )}
          <GroundShadow w={w} d={d} />
        </group>
        <OrbitControls
          ref={controlsRef}
          target={[0, h / 2, 0]}
          // enableDamping
          rotateSpeed={0.5}
          // minDistance={dev ? 1 : 60}
          // maxDistance={dev ? 500 : 124}
          dampingFactor={0.05}
          enableZoom={dev}
          enableRotate={dev}
        />
        {!dev && (
          <CameraHandler
            controlsRef={controlsRef}
            boxes={boxes}
            selectedIndex={selectedIndex}
            ox={ox}
            oz={oz}
            scale={SCALE}
          />
        )}
        {/* {!dev && (
          <WallClamp
            controlsRef={controlsRef}
            halfWidth={w / 2.1}
            halfHeight={h / 2.4}
            limitLeft={builtInLeft}
            limitRight={builtInRight}
          />
        )} */}
      </Canvas>
    </div>
  )
}

/**
 * Per-frame orbit clamp that keeps the camera inside the room so it can't swing
 * past a wall, the floor, or the ceiling and see the unit from outside.
 *
 * The camera's offset from the target along an axis is `radius · trig(angle)`.
 * To stay within a half-extent `e` of the (centered) unit we need the offset
 * `≤ e`, giving the angle bound `asin(e / radius)`. We recompute each frame
 * because `radius` changes with zoom.
 *
 * - Azimuth: offset is `distXZ · sin(azimuth)`, bound by the side walls
 *   (left = -x bounds negative azimuth, right = +x bounds positive). Applied
 *   only on built-in sides; open sides rotate freely.
 * - Polar: offset from the equator is `radius · cos(polar)`, bound by the
 *   floor and ceiling. These are always drawn, so the polar clamp always
 *   applies. `polar = π/2 ± asin(halfHeight / radius)`.
 */
function WallClamp ({
  controlsRef,
  halfWidth,
  halfHeight,
  limitLeft,
  limitRight
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  halfWidth: number
  halfHeight: number
  limitLeft: boolean
  limitRight: boolean
}) {
  useFrame(() => {
    const controls = controlsRef.current
    if (!controls) return

    const cam = controls.object
    const t = controls.target
    const dx = cam.position.x - t.x
    const dy = cam.position.y - t.y
    const dz = cam.position.z - t.z

    // Azimuth limit from the horizontal distance to the target.
    const distXZ = Math.hypot(dx, dz)
    if (distXZ > 0) {
      const azLimit = Math.asin(Math.min(1, halfWidth / distXZ))
      controls.minAzimuthAngle = limitLeft ? -azLimit : -Math.PI / 4
      controls.maxAzimuthAngle = limitRight ? azLimit : Math.PI / 4
    }

    // Polar limit from the full 3D radius, centered on the horizontal equator
    // (π/2). Keeps the camera between the floor and ceiling at every zoom.
    const radius = Math.hypot(distXZ, dy)
    if (radius > 0) {
      const polarHalf = Math.asin(Math.min(1, halfHeight / radius))
      controls.minPolarAngle = Math.PI / 2 - polarHalf
      controls.maxPolarAngle = Math.PI / 2 + polarHalf
    }
  })

  return null
}

/**
 * Frames the camera onto the selected box. When the selection changes, it
 * looks up the box's `camera` side (inherited from the nearest `camera`
 * ancestor in the zone tree) and animates the camera to face the box's center
 * from that side, lerping both the camera position and the orbit target.
 *
 * Box coords are in mm and the scene group is offset by `[ox, 0, oz]` then
 * scaled by `scale`, so a box point `(x, y, z)` lands at world
 * `(ox + x·scale, y·scale, oz + z·scale)`.
 */
function CameraHandler ({
  controlsRef,
  boxes,
  selectedIndex,
  ox,
  oz,
  scale
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  boxes: ShapeBox[]
  selectedIndex: string | null
  ox: number
  oz: number
  scale: number
}) {
  const { camera } = useThree()

  const isAnimating = useRef(false)
  const targetLookAt = useRef(new THREE.Vector3())
  const targetCameraPos = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!selectedIndex) return
    const box = boxes.find(b => b.index === selectedIndex)
    // `camera` is set only on zones that explicitly define it, so this fires
    // exactly for those zones (not inherited descendants).
    if (!box || !box.camera) return

    // Box center in world units. The scene group applies the offset
    // `[ox, 0, oz]` in world units first, then an inner group scales box
    // coords by `scale` — so only the box coords are scaled, not the offset.
    const center = new THREE.Vector3(
      ox + (box.x + box.w / 2) * scale,
      (box.y + box.h / 2) * scale,
      oz + (box.z + box.d / 2) * scale
    )
    targetLookAt.current.copy(center)

    // Box dimensions in world units.
    const bw = box.w * scale
    const bh = box.h * scale
    const bd = box.d * scale

    // Distance needed so the whole zone fits in view, derived from the camera
    // FOV. We fit the two dimensions perpendicular to the viewing axis: the
    // vertical one against the vertical FOV, the horizontal one against the
    // horizontal FOV (vFOV adjusted by aspect). Take the larger so neither is
    // clipped, with a small margin so the zone isn't flush to the edges.
    const side = box.camera.toUpperCase()
    const persp = camera as THREE.PerspectiveCamera
    const aspect = persp.aspect || 1
    // The camera has a `zoom` factor that magnifies the view; fold it into the
    // effective FOV so the fit distance accounts for it (otherwise the zone
    // looks `zoom`× too large and stays zoomed in).
    const zoom = persp.zoom || 1
    const rawVFov = THREE.MathUtils.degToRad(persp.fov ?? 50)
    const tanV = Math.tan(rawVFov / 2) / zoom
    const tanH = tanV * aspect

    // Pick the on-screen width/height of the box for each viewing axis.
    let fitW = bw
    let fitH = bh
    if (side === 'LEFT' || side === 'RIGHT') {
      fitW = bd
      fitH = bh
    } else if (side === 'TOP' || side === 'BOTTOM') {
      fitW = bw
      fitH = bd
    }

    const margin = 1.15
    const distH = fitH / 2 / tanV
    const distW = fitW / 2 / tanH
    const dist = Math.max(distH, distW, 1) * margin

    const offset = new THREE.Vector3()
    switch (side) {
      case 'FRONT':
        offset.set(0, 0, dist)
        break
      case 'BACK':
        offset.set(0, 0, -dist)
        break
      case 'LEFT':
        offset.set(-dist, 0, 0)
        break
      case 'RIGHT':
        offset.set(dist, 0, 0)
        break
      case 'TOP':
        offset.set(0, dist, 0)
        break
      case 'BOTTOM':
        offset.set(0, -dist, 0)
        break
      default:
        offset.set(0, 0, dist)
    }

    targetCameraPos.current.copy(center).add(offset)

    // Let the orbit controls reach this distance — otherwise `update()` in the
    // lerp loop would clamp the camera back to `maxDistance` and re-zoom in.
    const controls = controlsRef.current
    if (controls && dist > controls.maxDistance) controls.maxDistance = dist

    isAnimating.current = true
  }, [selectedIndex, boxes, ox, oz, scale, controlsRef])

  useFrame(() => {
    if (!isAnimating.current) return
    const controls = controlsRef.current

    const step = 0.08 // lerp factor (higher = faster)
    camera.position.lerp(targetCameraPos.current, step)

    if (controls) {
      controls.target.lerp(targetLookAt.current, step)
      controls.update()
    }

    // Stop once we're close enough, to free the orbit controls again.
    if (camera.position.distanceTo(targetCameraPos.current) < 0.01) {
      isAnimating.current = false
    }
  })

  return null
}

// Ruler glyph for the dimensions toggle.
function RulerIcon () {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M3 8.5 8.5 3 21 15.5 15.5 21z' />
      <path d='M8 8l1.5 1.5M11 5l2 2M14 8l1.5 1.5M5 11l2 2' />
    </svg>
  )
}

// Contrast glyph: a circle split into a filled and an empty half.
function ContrastIcon () {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='9' />
      <path d='M12 3a9 9 0 0 1 0 18z' fill='currentColor' stroke='none' />
    </svg>
  )
}

// Simple door glyph: a panel with a knob; the panel is ajar when `open`.
function DoorIcon ({ open }: { open: boolean }) {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M3 21h18' />
      {open ? (
        <>
          <path d='M14 21V5l6-2v18' />
          <path d='M11 21V8' />
          <circle cx='17' cy='12' r='0.6' fill='currentColor' stroke='none' />
        </>
      ) : (
        <>
          <rect x='6' y='3' width='12' height='18' rx='1' />
          <circle cx='15' cy='12' r='0.6' fill='currentColor' stroke='none' />
        </>
      )}
    </svg>
  )
}
