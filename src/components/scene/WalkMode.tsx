'use client'

import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/**
 * Walk-through (FPS) mode — Clément, 11/09: « un bouton qui permettrait de
 * passer en mode fps pour changer de position de vue, et quand on arrête on
 * revient à la place initiale ».
 *
 * While active the orbit is handed over: the mouse looks around, the keyboard
 * walks. The camera stays at eye height and inside the room, and it cannot
 * walk through the unit. Leaving the mode flies back to the exact view the
 * user left — position, orientation and orbit target — so nothing is lost by
 * having a look around.
 *
 * Mouse look uses the pointer lock when the browser grants it, and falls back
 * to drag-to-look when it does not. That fallback is not cosmetic: the
 * configurator is embedded in an `<iframe>` on the Oaksome site, and a sandboxed
 * or unpermissioned frame refuses `requestPointerLock()` outright. Without the
 * fallback the mode would be dead in the very place it ships.
 */

/** Physical key → direction. `event.code` is layout-independent: the key at the
 *  W position is `KeyW` on QWERTY and on AZERTY (where it is labelled Z). */
const MOVE_KEYS: Record<string, 'forward' | 'back' | 'left' | 'right'> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right'
}

/** Metres per second, walking and running (shift). */
const SPEED = 1.9
const RUN = 3.8
/** Look sensitivity, radians per pixel of mouse movement. */
const LOOK = 0.0022
const MAX_PITCH = THREE.MathUtils.degToRad(80)

export type WalkLimits = {
  /** Room extents in world units (the unit is centred on x = 0). */
  xMin: number
  xMax: number
  zMin: number
  zMax: number
  /** Half-width and front face of the unit, so the walker cannot enter it. */
  unitHalfW: number
  unitFrontZ: number
}

export function WalkMode ({
  active,
  controlsRef,
  eye,
  limits,
  onExit
}: {
  active: boolean
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** Eye height above the floor (m). */
  eye: number
  limits: WalkLimits
  /** Called when the user leaves the mode from inside it (Escape). */
  onExit: () => void
}) {
  const camera = useThree(s => s.camera)
  const gl = useThree(s => s.gl)

  // The view to come back to, taken the moment the mode is entered.
  const saved = useRef<{
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    target: THREE.Vector3
  } | null>(null)
  const returning = useRef(false)

  const pressed = useRef<Set<string>>(new Set())
  const yaw = useRef(0)
  const pitch = useRef(0)
  const dragging = useRef(false)
  const wasLocked = useRef(false)

  const applyLook = useCallback(() => {
    const e = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(e)
  }, [camera])

  // Enter / leave.
  useEffect(() => {
    const controls = controlsRef.current
    if (active) {
      saved.current = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        target: controls ? controls.target.clone() : new THREE.Vector3()
      }
      returning.current = false
      // Seed the look angles from where the camera already points, so entering
      // the mode does not snap the view.
      const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
      yaw.current = e.y
      pitch.current = THREE.MathUtils.clamp(e.x, -MAX_PITCH, MAX_PITCH)
      if (controls) controls.enabled = false
      return
    }
    // Leaving: fly back to the saved view. The orbit stays disabled until the
    // flight lands, otherwise its own update would fight the interpolation.
    if (saved.current) {
      returning.current = true
      if (controls) controls.enabled = false
    }
    pressed.current.clear()
    dragging.current = false
  }, [active, camera, controlsRef])

  // Input, only while the mode is on.
  useEffect(() => {
    if (!active) return
    const dom = gl.domElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onExit()
        return
      }
      if (e.code in MOVE_KEYS || e.code === 'Space' || e.code === 'ShiftLeft') {
        // Space and the arrows scroll the page otherwise, which would move the
        // configurator under the user while they walk.
        e.preventDefault()
      }
      pressed.current.add(e.code)
    }
    const onKeyUp = (e: KeyboardEvent) => pressed.current.delete(e.code)

    const onClick = () => {
      if (document.pointerLockElement === dom) return
      // May be refused (iframe policy, or a browser that wants a user gesture
      // it does not recognise here) — the drag fallback covers it.
      void dom.requestPointerLock?.()
    }
    const onPointerDown = () => {
      dragging.current = true
    }
    const onPointerUp = () => {
      dragging.current = false
    }
    const onMouseMove = (e: MouseEvent) => {
      const locked = document.pointerLockElement === dom
      if (!locked && !dragging.current) return
      yaw.current -= e.movementX * LOOK
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - e.movementY * LOOK,
        -MAX_PITCH,
        MAX_PITCH
      )
      applyLook()
    }
    // The browser drops the lock on its own Escape; that is the user leaving.
    const onLockChange = () => {
      if (document.pointerLockElement !== dom && !dragging.current) {
        // Only treat it as an exit if we had actually been locked: a refused
        // request also fires nothing, and a refusal must leave the mode on so
        // the drag fallback works.
        if (wasLocked.current) onExit()
      }
      wasLocked.current = document.pointerLockElement === dom
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    dom.addEventListener('click', onClick)
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      dom.removeEventListener('click', onClick)
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      if (document.pointerLockElement === dom) document.exitPointerLock()
      wasLocked.current = false
    }
  }, [active, gl, applyLook, onExit])

  const dir = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const controls = controlsRef.current

    if (returning.current && saved.current) {
      const step = 1 - Math.pow(0.001, delta) // ~frame-rate independent lerp
      camera.position.lerp(saved.current.position, step)
      camera.quaternion.slerp(saved.current.quaternion, step)
      if (camera.position.distanceTo(saved.current.position) < 0.01) {
        camera.position.copy(saved.current.position)
        camera.quaternion.copy(saved.current.quaternion)
        if (controls) {
          controls.target.copy(saved.current.target)
          controls.enabled = true
          controls.update()
        }
        returning.current = false
        saved.current = null
      }
      return
    }

    if (!active) return

    // Walk on the floor plane: the look direction projected flat, so looking
    // up at the top of the unit does not lift the walker off the ground.
    forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.current.y = 0
    if (forward.current.lengthSq() < 1e-6) forward.current.set(0, 0, -1)
    forward.current.normalize()
    right.current.crossVectors(forward.current, camera.up).normalize()

    dir.current.set(0, 0, 0)
    for (const code of pressed.current) {
      const move = MOVE_KEYS[code]
      if (move === 'forward') dir.current.add(forward.current)
      else if (move === 'back') dir.current.sub(forward.current)
      else if (move === 'right') dir.current.add(right.current)
      else if (move === 'left') dir.current.sub(right.current)
    }

    const speed =
      pressed.current.has('ShiftLeft') || pressed.current.has('ShiftRight')
        ? RUN
        : SPEED
    if (dir.current.lengthSq() > 0) {
      dir.current.normalize().multiplyScalar(speed * delta)
      camera.position.x += dir.current.x
      camera.position.z += dir.current.z
    }

    // Stay in the room…
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      limits.xMin,
      limits.xMax
    )
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      limits.zMin,
      limits.zMax
    )
    // …and out of the furniture: the unit stands against the back wall, so the
    // only way in is from the front. Push back out through the face entered.
    if (
      Math.abs(camera.position.x) < limits.unitHalfW &&
      camera.position.z < limits.unitFrontZ
    ) {
      camera.position.z = limits.unitFrontZ
    }
    camera.position.y = eye

    // The orbit target is kept just ahead of the walker so that, were the mode
    // to be left by any path other than the flight home, the orbit resumes
    // around what is being looked at rather than snapping back to the unit.
    if (controls) {
      controls.target
        .copy(camera.position)
        .addScaledVector(forward.current, 1.5)
    }
  })

  return null
}
