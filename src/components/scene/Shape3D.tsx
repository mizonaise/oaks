'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
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
import { RoomWalls, findCpWalls } from './RoomWalls'
import { BoxItem } from './BoxItem'
import type { ArticleData } from '@processandtools/rp-article-designer'

type Props = {
  dev?: boolean
  /** The shape's article bundle, fetched server-side by the page. */
  articleData?: ArticleData | null
  /** False while the shape's dimensions are still `$VAR` expressions awaiting
   *  the form's variables — the geometry falls back to default sizes until
   *  then, so the opening camera fit waits rather than framing the wrong box. */
  dimsResolved?: boolean
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
  /** Per-CP dimension config: panels whose `cpName` is a key here get an
   *  in-scene label, with the `w`/`h`/`d` flags selecting which of the box's
   *  dimensions to include. */
  dimCpConfig?: DimCpConfig
  /** The zone name the form is currently requesting (`goToZone`). While one is
   *  active the free-look toggle is disabled, since that zone owns the camera. */
  selectedZone?: string | null
  /** Receives a `() => string | null` that snapshots the WebGL canvas as a PNG
   *  data URL (null if the canvas isn't ready). Called on mount so a parent can
   *  capture the current view on demand (e.g. for add-to-cart). */
  onCaptureReady?: (capture: () => string | null) => void
}

const MM = 1

// Perspective camera settings for the non-dev view. Declared here (rather than
// only as JSX props) because `FitToShape` must compute its distance from the
// SAME values: an effect can run before R3F has applied these props, and the
// camera then still reports three.js defaults (fov 75, zoom 1), which yields a
// wildly wrong fit.
const CAM_FOV = 65
const CAM_ZOOM = 20
// Module-level constant so the array identity never changes: drei re-applies
// `position` when the prop changes, which would overwrite the fitted distance.
const CAM_INITIAL_POS: [number, number, number] = [0, 1.25, 100]
const SCALE = 0.001

/**
 * The index of the `camera`-declaring zone that governs a box index, found by
 * walking up its ancestors (the box itself, then each shorter dotted-index
 * prefix). `camera` lives only on the declaring node, so a selected descendant
 * resolves to its enclosing camera zone via this lookup.
 *
 * Returns the *zone's* index rather than its `camera` side so callers can frame
 * and cull against the zone itself — the camera stays on the camera zone even
 * when the selection moves to a box inside it.
 * Returns null when no ancestor declares `camera` — i.e. not a camera zone.
 */
function cameraZoneFor (boxes: ShapeBox[], index: string | null): string | null {
  if (!index) return null
  const byIndex = new Map(boxes.map(b => [b.index, b]))
  for (
    let key: string | undefined = index;
    key;
    key = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : undefined
  ) {
    if (byIndex.get(key)?.camera) return key
  }
  return null
}

/**
 * Indexes of boxes to hide so the selected camera zone is seen in isolation:
 * everything outside that zone's subtree. Empty unless the selection resolves
 * to a camera zone.
 *
 * The zone's own subtree stays visible — its ancestors and descendants share
 * its volume, so hiding them would hide the zone itself.
 */
function hiddenForCameraZone (
  boxes: ShapeBox[],
  selectedIndex: string | null
): Set<string> {
  const empty = new Set<string>()
  if (!selectedIndex) return empty
  // Anchor on the governing camera zone, not on the selection. Selecting a zone
  // *inside* a camera zone must not narrow the cull to that inner zone: the
  // camera still frames the whole camera zone, so the zone's other contents stay
  // visible.
  const camZone = cameraZoneFor(boxes, selectedIndex)
  const sel = camZone ? boxes.find(b => b.index === camZone) : undefined
  const camSide = sel?.camera
  if (!sel || !camSide) return empty

  // Is `b` part of the selected zone's own subtree (itself, an ancestor, or a
  // descendant)? Those share the zone's volume and must stay visible.
  const inSubtree = (b: ShapeBox) =>
    b.index === sel.index ||
    b.index.startsWith(`${sel.index}.`) ||
    sel.index.startsWith(`${b.index}.`)

  // Framing a camera zone isolates it: everything outside its subtree is hidden,
  // so the zone is seen alone regardless of where the camera looks from.
  return new Set(boxes.filter(b => !inSubtree(b)).map(b => b.index))
}

const DEFAULT_DIM_CP_CONFIG: DimCpConfig = {

  "CP_1_FI_*": { w: false, h: true, d: false },
  "CP_1_BA_*": { w: false, h: true, d: false },
  "CP_1_CM_*": { w: false, h: true, d: false }
}

export function Shape3D ({
  dev = false,
  articleData,
  dimsResolved = true,
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect,
  dimCpConfig = DEFAULT_DIM_CP_CONFIG,
  selectedZone,
  onCaptureReady
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  // True extent of everything drawn, in world units. `bounds` is only the
  // shape's declared envelope; `walkZone` can place boxes outside it (and
  // panel oversize pushes them further), so framing on `bounds` alone can
  // clip the unit. Union the box extents with the envelope and keep the
  // widest span either side of centre, since the camera looks down the
  // centreline and the view is symmetric about it.
  const fit = useMemo(() => {
    let minX = 0
    let maxX = bounds.w
    let minY = 0
    let maxY = bounds.h
    let minZ = 0
    let maxZ = bounds.d
    for (const b of boxes) {
      if (b.x < minX) minX = b.x
      if (b.y < minY) minY = b.y
      if (b.z < minZ) minZ = b.z
      if (b.x + b.w > maxX) maxX = b.x + b.w
      if (b.y + b.h > maxY) maxY = b.y + b.h
      if (b.z + b.d > maxZ) maxZ = b.z + b.d
    }
    // The camera centres on the shape's own mid-line (x: bounds.w/2,
    // y: fitH/2), so what must fit is twice the larger half-span.
    const halfX = Math.max(bounds.w / 2 - minX, maxX - bounds.w / 2)
    return {
      w: halfX * 2 * MM * SCALE,
      h: maxY * MM * SCALE,
      d: (maxZ - minZ) * MM * SCALE
    }
  }, [boxes, bounds])

  // The underlying <canvas> element, so a parent can snapshot the current view.
  // `preserveDrawingBuffer` (below) keeps the framebuffer readable after the
  // frame, which `toDataURL` needs.
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!onCaptureReady) return
    onCaptureReady(() => {
      const canvas = canvasRef.current
      if (!canvas) return null
      try {
        return canvas.toDataURL('image/png')
      } catch {
        return null
      }
    })
  }, [onCaptureReady])

  const [showDims, setShowDims] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  // Whether the article designer builds doors at all (`hasDoor`), distinct
  // from `doorsOpen`, which only swings the doors it has built.
  const [hasDoor, setHasDoor] = useState(true)
  const [contrasted, setContrasted] = useState(false)
  // Dev-only: hide the article designer so only the box shell/panels show.
  const [hideArticle, setHideArticle] = useState(false)
  // Dev-only walls toggle, driven by the in-canvas button below. Outside dev
  // the walls are always on, so this only gates the dev view.
  const [wallsShown, setWallsShown] = useState(false)

  // Constrain the horizontal orbit so the camera can't swing past a built-in
  // wall and see the unit from outside. A built-in side limits the camera to
  // the corridor between the walls; open sides allow free rotation.
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // The form emits a `goToZone` as soon as it mounts, for whatever zone it
  // opens on. Framing that would drop the user into a close-up of a single
  // (often article-sized) zone instead of the whole unit, so it is ignored;
  // every later request is a real navigation and frames normally.
  //
  // Owned here rather than inside `CameraHandler`, which unmounts whenever
  // free-look is toggled — a ref there would reset and make the next zone
  // request look like the mount-time one again.
  const formRequestSeen = useRef(false)
  // True for the form's very first zone request only.
  const isInitialZoneRequest = useCallback(() => {
    if (formRequestSeen.current) return false
    formRequestSeen.current = true
    return true
  }, [])

  // Set once a zone has actually taken the camera, so `FitToShape` stops
  // refitting rather than yanking the view back mid-navigation.
  const zoneOwnsCamera = useRef(false)
  const claimCameraForZone = useCallback(() => {
    zoneOwnsCamera.current = true
  }, [])

  // Set by `FitToShape` once it has framed the resolved shape. Until then a
  // zone claim must not lock the camera: a `goToZone` arriving while the
  // dimensions are still in flight would otherwise freeze the view on the
  // fallback framing, which is what "the first render doesn't show all the
  // shape" looks like.
  const openingFitDone = useRef(false)
  const markOpeningFitDone = useCallback(() => {
    openingFitDone.current = true
  }, [])

  // Free-look: when on, the user drives the camera (clamped by the walls) and
  // zone-camera framing is ignored. Off by default so the configurator keeps
  // its current behaviour of framing whatever zone the form points at.
  const [freeLook, setFreeLook] = useState(false)

  // A zone is actively requested while `selectedZone` is a non-empty name other
  // than "0" (the form's "nothing selected" sentinel). That zone owns the
  // camera, so free-look can't be toggled until it's cleared.
  const zoneActive =
    selectedZone != null &&
    selectedZone !== '' &&
    selectedZone.includes('OV') === false

  // Holding the toggle off while a zone is active would strand the camera in
  // free-look; turn it off as soon as a zone takes over.
  useEffect(() => {
    if (zoneActive) setFreeLook(false)
  }, [zoneActive])

  // How far the camera may swing off the shape's centerline before a room wall
  // cuts in front of the unit — one distance per side, null when that side is
  // open. `findCpWalls` reports `at` in the scaled group's local space (0..w)
  // while the orbit target sits at the world origin, so shift by `ox` first.
  // A wall's `sign` is the face it looks along, so it picks the side; the
  // *nearest* wall on each side binds, since that's what blocks the view first.
  const { wallLeft, wallRight } = useMemo(() => {
    const xWalls = findCpWalls(boxes, SCALE).filter(k => k.axis === 'x')
    let wallLeft: number | null = null
    let wallRight: number | null = null
    for (const k of xWalls) {
      const dist = Math.abs(k.at + ox)
      if (k.sign === -1) {
        wallLeft = wallLeft === null ? dist : Math.min(wallLeft, dist)
      } else {
        wallRight = wallRight === null ? dist : Math.min(wallRight, dist)
      }
    }
    return { wallLeft, wallRight }
  }, [boxes, ox])

  // When a zone with a `camera` side is selected, hide every box outside that
  // zone so it is shown on its own.
  const hiddenIndexes = useMemo(
    () => hiddenForCameraZone(boxes, selectedIndex),
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
    <div
      /*
        Below `lg` the canvas is portrait-capped: `aspect-[1/1.4]` makes the
        height track the width at 1.4×, and `max-h-[calc(100dvh-3rem)]` stops
        a wide phone from pushing it past the window. From `lg` up it takes
        the full window height (minus the dev gutters), matching the form
        column beside it, so `aspect` is released.
      */
      className={`relative aspect-[1/1.1] max-h-[calc(100dvh-3rem)] w-full overflow-hidden rounded lg:aspect-auto lg:h-[calc(100dvh-3rem)] lg:max-h-none${
        dev ? ' border border-zinc-200 dark:border-zinc-800' : ''
      }`}
    >
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
      <button
        type='button'
        onClick={() => setFreeLook(open => !open)}
        disabled={zoneActive}
        title={
          zoneActive
            ? 'Rotation unavailable while a zone is selected'
            : freeLook
            ? 'Disable rotation'
            : 'Enable rotation'
        }
        aria-pressed={freeLook}
        className={`absolute right-3 top-39 z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-md backdrop-blur transition ${
          zoneActive
            ? 'cursor-not-allowed border-zinc-200 bg-white/60 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-600'
            : freeLook
            ? 'border-zinc-800 bg-zinc-800 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900'
            : 'border-zinc-200 bg-white/90 text-zinc-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        }`}
      >
        <OrbitIcon />
      </button>
      {dev && (
        <button
          type='button'
          onClick={() => setHideArticle(open => !open)}
          title={hideArticle ? 'Show article' : 'Hide article'}
          aria-pressed={hideArticle}
          className='absolute right-3 top-51 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <EyeIcon off={hideArticle} />
        </button>
      )}
      {dev && (
        <button
          type='button'
          onClick={() => setWallsShown(open => !open)}
          title={wallsShown ? 'Hide walls' : 'Show walls'}
          aria-pressed={wallsShown}
          className='absolute right-3 top-63 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <WallIcon off={!wallsShown} />
        </button>
      )}
      {dev && (
        <button
          type='button'
          onClick={() => setHasDoor(open => !open)}
          title={hasDoor ? 'Remove doors' : 'Add doors'}
          aria-pressed={hasDoor}
          className='absolute right-3 top-75 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <DoorPanelIcon off={!hasDoor} />
        </button>
      )}
      <Canvas
        ref={canvasRef}
        shadows='soft'
        dpr={[1, 2]}
        // R3F defaults to ACES Filmic tone mapping, which renders a material
        // `#ffffff` as a slightly off (grayish) white — so the canvas white
        // doesn't match the page's CSS white. Disable it for true white.
        // `preserveDrawingBuffer` keeps the framebuffer readable after each
        // frame so `canvas.toDataURL()` can snapshot the current view.
        gl={{ toneMapping: THREE.NoToneMapping, preserveDrawingBuffer: true }}
      >
        {/* The canvas is transparent by default, so the page shows through.
            Paint it with the kit's BACKGROUND token (Light Beige `--fond`,
            #F6F5F0) so the viewer reads as its own surface. `attach` sets
            `scene.background`, which also lands in `toDataURL()` snapshots —
            a CSS background would be missing from those. */}
        <color attach='background' args={['#ffffff']} />
        <SceneLights
          radius={Math.hypot(w, h, d) / 2}
          contrasted={contrasted}
        />
        {/* <OrthographicCamera makeDefault zoom={100} position={[0, h / 2, 100]} /> */}
        {dev ? (
          <OrthographicCamera
            makeDefault
            zoom={100}
            position={[0, h / 2, 100]}
          />
        ) : (
          // A wider-than-default FOV (drei's default is 50) takes in more of
          // the room around the shape. `CameraHandler` reads `fov` off the
          // camera, so zone framing follows it.
          //
          // NO `position` prop: drei re-applies it on every re-render, which
          // would clobber the distance `FitToShape` computes (and the position
          // `CameraHandler` lerps to). The camera's placement is owned
          // imperatively by those two, starting from the fit.
          // `position` is the INITIAL placement only: drei re-applies this
          // prop whenever it changes, so it is deliberately a constant. The
          // real distance is set imperatively by `FitToShape` (and then by
          // `CameraHandler` for zone framing); a changing prop here would
          // clobber both, and omitting it entirely leaves the camera at the
          // origin, where OrbitControls collapses it onto its own target.
          <PerspectiveCamera
            makeDefault
            position={CAM_INITIAL_POS}
            fov={CAM_FOV}
            zoom={CAM_ZOOM}
          />
        )}
        {/* <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} /> */}
        <group position={[ox, 0, oz]}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map(b => {
              if (b.depth === 0 && !b.isArticle) return null
              return (
                <BoxItem
                  key={b.index}
                  box={b}
                  dev={dev}
                  articleData={articleData}
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
                  hasDoor={hasDoor}
                  doorOpen={doorsOpen}
                  dimCpConfig={showDims ? dimCpConfig : null}
                  showDims={showDims}
                  contrasted={contrasted}
                  hideArticle={hideArticle}
                />
              )
            })}
          </group>

          {(!dev || wallsShown) && (
            <Suspense fallback={null}>
              <RoomWalls
                dev={dev}
                w={w}
                h={h}
                d={d}
                boxes={boxes}
                scale={SCALE}
              />
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
          // Dev keeps its free camera; outside dev, rotation is what the
          // free-look toggle grants (WallClamp below bounds it).
          enableRotate={dev || freeLook}
          // Panning is never offered outside dev: it slides the unit off
          // centre, which free-look's rotation clamp can't pull back.
          enablePan={dev}
        />
        {/* Opening view: frame the whole unit rather than sitting at a fixed
            distance that suits only one shape size. */}
        {!dev && (
          <FitToShape
            controlsRef={controlsRef}
            zoneOwnsCamera={zoneOwnsCamera}
            enabled={dimsResolved}
            onFitted={markOpeningFitDone}
            w={fit.w}
            h={fit.h}
            d={fit.d}
            targetY={h / 2}
          />
        )}
        {/* Free-look hands the camera to the user, so the zone framing stands
            down entirely — unmounting it also drops its per-frame lerp. */}
        {!dev && !freeLook && (
          <CameraHandler
            controlsRef={controlsRef}
            isInitialZoneRequest={isInitialZoneRequest}
            claimCameraForZone={claimCameraForZone}
            openingFitDone={openingFitDone}
            boxes={boxes}
            selectedIndex={selectedIndex}
            ox={ox}
            oz={oz}
            scale={SCALE}
          />
        )}
        {!dev && freeLook && (
          <WallClamp
            controlsRef={controlsRef}
            wallLeft={wallLeft}
            wallRight={wallRight}
            halfHeight={h / 2.4}
          />
        )}
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
 * - Azimuth: offset is `distXZ · sin(azimuth)`, bound per side by that side's
 *   wall distance (`wallLeft` bounds negative azimuth, `wallRight` positive).
 *   A side with no wall gets the full quarter turn, past which the camera would
 *   be looking at the unit edge-on.
 * - Polar: offset from the equator is `radius · cos(polar)`, bound by the
 *   floor and ceiling. These are always drawn, so the polar clamp always
 *   applies. `polar = π/2 ± asin(halfHeight / radius)`.
 */
function WallClamp ({
  controlsRef,
  wallLeft,
  wallRight,
  halfHeight
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** Centerline→left-wall distance, or null when that side is open. */
  wallLeft: number | null
  /** Centerline→right-wall distance, or null when open. */
  wallRight: number | null
  halfHeight: number
}) {
  // Writes the current angle limits onto the controls. Returns false when there
  // is nothing to clamp against yet.
  const applyLimits = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return false

    // Derive the limits from the orbit *radius*, not from the camera's current
    // x/z offsets. Rotation preserves the radius, so the bounds hold still while
    // dragging. Measuring the in-plane distance instead feeds back on itself —
    // OrbitControls pushes the camera to satisfy the limit, which changes the
    // distance, which moves the limit — and the view judders at the stops. Only
    // zoom changes the radius, and there a re-derived limit is what we want.
    const radius = controls.object.position.distanceTo(controls.target)
    if (radius <= 0) return false

    // A wall `e` from the centerline is cleared once the camera's x-offset
    // reaches `e`; that offset is `radius · sin(azimuth)`, so the bound is
    // `asin(e / radius)`. Quarter turn on an open side, past which the unit is
    // edge-on. Close in the wall subtends a wider angle, so the range opens up.
    const limit = (wall: number | null) =>
      wall === null
        ? Math.PI / 2
        : Math.min(Math.PI / 2, Math.asin(Math.min(1, wall / radius)))
    controls.minAzimuthAngle = -limit(wallLeft)
    controls.maxAzimuthAngle = limit(wallRight)

    // Polar bound off the same radius, centered on the horizontal equator
    // (π/2), keeping the camera between the floor and ceiling at every zoom.
    const polarHalf = Math.asin(Math.min(1, halfHeight / radius))
    controls.minPolarAngle = Math.PI / 2 - polarHalf
    controls.maxPolarAngle = Math.PI / 2 + polarHalf
    return true
  }, [controlsRef, wallLeft, wallRight, halfHeight])

  // Free-look was just switched on, so the camera sits wherever the last zone
  // framing left it — possibly outside the walls. Set the limits and apply them
  // once, since OrbitControls only enforces them inside `update()`. The frame
  // loop below deliberately does *not* call `update()`, so this is the only
  // place the camera is moved to satisfy the clamp.
  useEffect(() => {
    if (applyLimits()) controlsRef.current?.update()
  }, [applyLimits, controlsRef])

  useFrame(() => {
    applyLimits()
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
/**
 * Frames the whole shape on mount: pushes the camera back to the distance at
 * which the unit's full width and height fit the frustum.
 *
 * The static camera sits at a fixed `z = 100`, which frames a large unit
 * acceptably but leaves a small one tiny in the middle of the view (a 900mm
 * unit fills about 8% of the width). Fitting to the real bounds makes the
 * opening shot consistent at any size.
 *
 * Runs once, and only before any zone framing has happened — `CameraHandler`
 * owns the camera after that.
 */
function FitToShape ({
  controlsRef,
  zoneOwnsCamera,
  enabled,
  onFitted,
  w,
  h,
  d,
  targetY
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** Set by `CameraHandler` once a zone has taken the camera. While false the
   *  opening view is ours to (re)fit; once true we stand down for good. */
  zoneOwnsCamera: React.RefObject<boolean>
  /** False while the shape dimensions are still unresolved; fitting then would
   *  frame the fallback box and, once a zone claims the camera, never correct
   *  itself. */
  enabled: boolean
  /** Called after the opening fit lands, releasing zone framing to take over. */
  onFitted: () => void
  /** Full extent of everything drawn, in world units — not just the shape's
   *  declared envelope, so nothing sitting outside it gets clipped. */
  w: number
  h: number
  d: number
  /** Height the orbit target sits at, matching `OrbitControls`' own target so
   *  the fit and the controls agree on what the camera looks at. */
  targetY: number
}) {
  const { camera, size } = useThree()
  // The bounds come from form variables and the canvas is measured
  // asynchronously, so the first render often has fallback dimensions or a
  // zero-width canvas. Refit whenever the inputs actually change rather than
  // locking in that first guess; the key keeps it to one fit per distinct size.
  const lastFit = useRef<string | null>(null)
  // Placement computed by the effect, applied on the next frame (see above).
  const pending = useRef<{ y: number; dist: number } | null>(null)

  // `fov`/`zoom` come from the JSX props; only the placement is imperative.
  useFrame(() => {
    const p = pending.current
    if (!p) return
    pending.current = null
    camera.position.set(0, p.y, p.dist)
    const controls = controlsRef.current
    if (controls) {
      controls.target.set(0, p.y, 0)
      controls.update()
    }
    camera.updateProjectionMatrix()
    onFitted()
  })

  useEffect(() => {
    // Dimensions still in flight: the bounds are placeholders, so fitting now
    // would frame the wrong box.
    if (!enabled) return
    // A zone owns the camera now — never pull the view back to the whole shape.
    if (zoneOwnsCamera.current) return
    // Nothing to fit until the shape has real dimensions and the canvas has
    // been measured (aspect is meaningless at zero width).
    if (w <= 0 || h <= 0 || size.width === 0) return
    const key = `${w}x${h}x${d}x${targetY}x${size.width}x${size.height}`
    if (lastFit.current === key) return
    lastFit.current = key

    const persp = camera as THREE.PerspectiveCamera
    // Derive the frustum from the canvas and the INTENDED camera settings, not
    // from whatever is on the camera object right now: this effect can run
    // before R3F applies the `fov`/`zoom` props, when the camera still reports
    // three.js defaults and the fit comes out an order of magnitude too close.
    const aspect = size.width / size.height || persp.aspect || 1
    // `zoom` magnifies the view, so fold it into the effective FOV — the same
    // adjustment `CameraHandler` makes when fitting a zone.
    const tanV = Math.tan(THREE.MathUtils.degToRad(CAM_FOV) / 2) / CAM_ZOOM
    const tanH = tanV * aspect

    // The camera looks at `targetY`, so the vertical half-span that must fit
    // is the larger distance from there to the top or the bottom of the
    // content — not simply half the height.
    const halfV = Math.max(targetY, h - targetY)

    // Fit both axes and take the larger distance so neither is clipped.
    //
    // The frustum widens with distance, so the *nearest* geometry is what
    // constrains the view: a deep shape (the CMB combinations are as deep as
    // they are wide) has its front face `d / 2` closer to the camera than the
    // orbit target at z = 0. Fit against that near face, then push back by
    // `d / 2` so the measured distance is preserved — adding the depth to a
    // centre-measured fit would leave the front corners overflowing.
    const margin = 1.12
    const halfD = d / 2
    const dist = Math.max(halfV / tanV, w / 2 / tanH) * margin + halfD

    // Hand the computed placement to the frame loop rather than applying it
    // here: drei re-applies the camera's `position` prop after this effect, so
    // an imperative write now is immediately overwritten. `useFrame` runs after
    // that commit, so applying there sticks.
    pending.current = { y: targetY, dist }
  }, [
    camera,
    size,
    w,
    h,
    d,
    targetY,
    enabled,
    onFitted,
    controlsRef,
    zoneOwnsCamera
  ])

  return null
}

function CameraHandler ({
  controlsRef,
  isInitialZoneRequest,
  claimCameraForZone,
  openingFitDone,
  boxes,
  selectedIndex,
  ox,
  oz,
  scale
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** True for the form's mount-time `goToZone` only, which is ignored so the
   *  page opens on the whole unit rather than a close-up of one zone. Later
   *  requests are real navigations and frame normally. State lives in the
   *  parent so free-look unmounting this doesn't reset it. */
  isInitialZoneRequest: () => boolean
  /** Called when a zone actually takes the camera, so `FitToShape` stops
   *  refitting the opening view. */
  claimCameraForZone: () => void
  /** Whether the opening fit has landed. A zone request arriving before it
   *  (the dimensions are still resolving) must not claim the camera, or the
   *  view stays stuck on the fallback framing. */
  openingFitDone: React.RefObject<boolean>
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

    // The form's mount-time request: ignore it so the opening fit survives.
    if (isInitialZoneRequest()) return

    // Wait for the opening fit: claiming the camera before the shape has been
    // framed at its real size would strand the view on the fallback framing.
    if (!openingFitDone.current) return

    // From here the camera belongs to this zone.
    claimCameraForZone()

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
  }, [
    selectedIndex,
    boxes,
    ox,
    oz,
    scale,
    controlsRef,
    isInitialZoneRequest,
    claimCameraForZone,
    openingFitDone
  ])

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

// Orbit glyph for the rotation toggle: a body with a ring swung around it.
function OrbitIcon () {
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
      <circle cx='12' cy='12' r='3.2' />
      <ellipse cx='12' cy='12' rx='10' ry='4.6' transform='rotate(-30 12 12)' />
    </svg>
  )
}

// Eye glyph; a slash crosses it out when `off` (article hidden).
function EyeIcon ({ off }: { off: boolean }) {
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
      <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' />
      <circle cx='12' cy='12' r='3' />
      {off && <path d='M3 3l18 18' />}
    </svg>
  )
}

// Door-panel glyph; a slash crosses it out when `off` (article has no door).
function DoorPanelIcon ({ off }: { off: boolean }) {
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
      <rect x='5' y='3' width='14' height='18' rx='1' />
      <circle cx='15.5' cy='12' r='1' />
      {off && <path d='M3 3l18 18' />}
    </svg>
  )
}

// Brick-wall glyph; a slash crosses it out when `off` (walls hidden).
function WallIcon ({ off }: { off: boolean }) {
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
      <rect x='3' y='5' width='18' height='14' rx='1' />
      <path d='M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19' />
      {off && <path d='M3 3l18 18' />}
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
