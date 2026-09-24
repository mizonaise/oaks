'use client'

import * as THREE from 'three'

/**
 * Where the camera stands. One formula, used by the three places that place a
 * camera — the mount-time guess, the reframe once the canvas knows its real
 * aspect (`InitialFrame`), and the named presets (`CameraPreset`) — so a change
 * to the eye height or to the wall clamp cannot land in one and not the others.
 */

/**
 * Three-quarter azimuth (rad, negative = from the left) that keeps the camera
 * inside a built-in room: a wall `e` from the centreline is cleared once the
 * camera's sideways offset reaches `e`, i.e. at `asin(e / dist)`; stay 4°
 * short of it. Open side: the wanted angle, unchanged.
 */
export function clampedAzimuth (
  wanted: number,
  dist: number,
  wallLeft: number | null,
  wallRight: number | null
): number {
  const wall = wanted < 0 ? wallLeft : wallRight
  if (wall === null) return wanted
  const limit = Math.asin(Math.min(1, wall / dist)) - THREE.MathUtils.degToRad(4)
  const mag = Math.min(Math.abs(wanted), Math.max(0, limit))
  return Math.sign(wanted) * mag
}

/**
 * The eye height actually used, in metres. The setting is what the customer
 * asked for; the room is what physics allows. A built-in's ceiling is flush
 * with the top of the unit (`ceilingGap` adds to it), and standing with your
 * head through the ceiling shows the unit from a place no photograph could be
 * taken from — so a low unit caps the eye height at just under its ceiling.
 */
export function eyeHeight (
  camHeight: number,
  h: number,
  roomEnabled: boolean,
  ceilingGap: number
): number {
  if (!roomEnabled) return camHeight
  const ceiling = h + ceilingGap
  return Math.max(0.5, Math.min(camHeight, ceiling - 0.15))
}

export type Framing = {
  /** Straight-line camera→target distance. */
  distance: number
  /** Polar angle of that position (rad) — 90° is horizontal. */
  polar: number
  azimuth: number
  target: THREE.Vector3
  position: THREE.Vector3
}

/**
 * Frame the whole unit: the distance at which it fits the view, seen from
 * `azDeg` at `eye` metres above the floor, looking at its centre.
 *
 * The eye height drives the polar angle rather than the other way round
 * (it used to be a fixed 82°): asking for an eye height and getting whatever
 * an angle happens to produce at that distance is how the view ended up
 * lower than a standing person's on tall units.
 */
export function frameUnit ({
  bounds,
  fov,
  aspect = 1.6,
  margin = 1.15,
  eye,
  azDeg = -35,
  distFactor = 1,
  wallLeft = null,
  wallRight = null,
  look
}: {
  bounds: { w: number; h: number; d: number }
  /** Vertical field of view, degrees. */
  fov: number
  aspect?: number
  margin?: number
  /** Eye height above the floor (m) — already clamped by `eyeHeight`. */
  eye: number
  azDeg?: number
  /** Preset distance multiplier (a close-up is < 1). */
  distFactor?: number
  wallLeft?: number | null
  wallRight?: number | null
  /** Orbit target; defaults to the unit's centre. */
  look?: THREE.Vector3
}): Framing {
  const v = THREE.MathUtils.degToRad(fov)
  const tanV = Math.tan(v / 2)
  const tanH = tanV * (aspect || 1.6)
  const { w, h } = bounds
  const distance =
    Math.max(h / 2 / tanV, w / 2 / tanH, 1) * margin * distFactor
  const target = look ? look.clone() : new THREE.Vector3(0, h / 2, 0)
  const azimuth = clampedAzimuth(
    THREE.MathUtils.degToRad(azDeg),
    distance,
    wallLeft,
    wallRight
  )
  // Height → polar. Clamped short of the poles so a very low unit (target
  // below the eye by more than the distance) still yields a usable angle.
  const cos = THREE.MathUtils.clamp((eye - target.y) / distance, -0.9, 0.9)
  const polar = Math.acos(cos)
  const position = new THREE.Vector3(
    distance * Math.sin(polar) * Math.sin(azimuth),
    distance * Math.cos(polar),
    distance * Math.sin(polar) * Math.cos(azimuth)
  ).add(target)
  return { distance, polar, azimuth, target, position }
}

/**
 * Orbit polar limits that contain the framing instead of fighting it: the
 * customer may look from the standing height down to the charte's floor
 * limit, and the initial angle is always reachable. Without this an eye at
 * 1.75 m would be dragged back to 70° by OrbitControls on its first update.
 */
export function polarLimits (polar: number): { min: number; max: number } {
  const min = Math.min(THREE.MathUtils.degToRad(60), polar - 0.02)
  const max = Math.max(THREE.MathUtils.degToRad(95), polar + 0.02)
  return { min: Math.max(0.05, min), max: Math.min(Math.PI - 0.05, max) }
}
