'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { autoCameraPreset, type CameraPresetId } from './BancContext'
import { frameUnit, polarLimits } from '../framing'

/** Azimuth (deg) and distance factor of each named camera. */
const PRESETS: Record<
  Exclude<CameraPresetId, 'auto'>,
  { az: number; dist: number; eye?: number }
> = {
  face: { az: 0, dist: 1 },
  tq_gauche: { az: -35, dist: 1 },
  tq_droite: { az: 35, dist: 1 },
  // The close-up looks at the handle, not at the middle of the unit, so it
  // keeps its own eye height: at standing height it would frame the wall above.
  detail: { az: -20, dist: 0.45, eye: 1.05 },
  plongee: { az: -30, dist: 1.05 }
}

/**
 * Drives the camera to a named preset (rule C3 of the cahier), animated. The
 * distance is the one that fits the whole unit at the current fov and aspect,
 * the height the customer's eye height — except for the close-up, which frames
 * a handle and has its own.
 */
export function CameraPreset ({
  preset,
  bounds,
  walls,
  wallsM = { left: null, right: null },
  controlsRef,
  fov,
  eye,
  margin = 1.15
}: {
  /** Fit margin (1.15; wider when dimension lines surround the unit). */
  margin?: number
  preset: CameraPresetId
  bounds: { w: number; h: number; d: number }
  walls: { left: boolean; right: boolean }
  /** Centreline → wall distances (m), null on an open side. */
  wallsM?: { left: number | null; right: number | null }
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  fov: number
  /** Eye height above the floor (m), already clamped by the ceiling. */
  eye: number
}) {
  const { camera } = useThree()
  const animating = useRef(false)
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())

  useEffect(() => {
    const id = preset === 'auto' ? autoCameraPreset(bounds, walls) : preset
    const p = PRESETS[id]
    const persp = camera as THREE.PerspectiveCamera
    const { d } = bounds
    const look =
      id === 'detail'
        ? new THREE.Vector3(0, p.eye ?? 1.05, d / 2)
        : undefined
    const f = frameUnit({
      bounds,
      fov,
      aspect: persp.aspect || 1.6,
      margin,
      eye: p.eye ?? eye,
      azDeg: p.az,
      distFactor: p.dist,
      wallLeft: wallsM.left,
      wallRight: wallsM.right,
      look
    })
    targetLook.current.copy(f.target)
    targetPos.current.copy(f.position)
    const controls = controlsRef.current
    if (controls) {
      if (f.distance > controls.maxDistance) controls.maxDistance = f.distance
      if (f.distance < controls.minDistance) controls.minDistance = f.distance
      // Same reason as the initial framing: a polar limit that excludes the
      // preset would undo it on the next `update()`.
      const limits = polarLimits(f.polar)
      controls.minPolarAngle = limits.min
      controls.maxPolarAngle = limits.max
    }
    animating.current = true
  }, [preset, bounds, walls, wallsM, camera, controlsRef, fov, eye, margin])

  useFrame(() => {
    if (!animating.current) return
    const controls = controlsRef.current
    camera.position.lerp(targetPos.current, 0.08)
    if (controls) {
      controls.target.lerp(targetLook.current, 0.08)
      controls.update()
    }
    if (camera.position.distanceTo(targetPos.current) < 0.005) {
      animating.current = false
    }
  })

  return null
}
