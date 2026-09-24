'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * « Ombre de personnage » (rule B3 of the cahier — what Tylko does): an
 * invisible silhouette, 1.75 m tall, standing front-left of the unit between
 * the key light and the wall. It only exists through the shadow it casts on
 * the floor and the unit, giving the human scale without showing anyone.
 *
 * The silhouette is an alpha mask drawn on a canvas; `customDepthMaterial`
 * makes the shadow pass respect the mask, so the shadow has the outline.
 */
export function HumanShadow ({
  w,
  d,
  keyDir
}: {
  /** Unit width / depth in scene units (metres), group-local (0..w, 0..d). */
  w: number
  d: number
  /** Direction *towards* the key light (unit vector) — the silhouette faces it. */
  keyDir: [number, number, number]
}) {
  const { alpha, depthMaterial } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 384
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#fff'
    // Head, neck, shoulders, torso, legs — a plain standing figure.
    ctx.beginPath()
    ctx.ellipse(64, 40, 22, 26, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(56, 60, 16, 14)
    ctx.beginPath()
    ctx.moveTo(22, 90)
    ctx.quadraticCurveTo(64, 66, 106, 90)
    ctx.lineTo(100, 230)
    ctx.lineTo(28, 230)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(34, 226, 26, 150)
    ctx.fillRect(68, 226, 26, 150)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.NoColorSpace
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaMap: tex,
      alphaTest: 0.5
    })
    return { alpha: tex, depthMaterial }
  }, [])

  // Front-left of the unit, one step out, facing the light so the plane's
  // projection on the floor is the figure, not a sliver.
  const x = -0.45
  const z = d + 0.9
  const yaw = Math.atan2(keyDir[0], keyDir[2])
  void w

  return (
    <mesh
      position={[x, 0.875, z]}
      rotation={[0, yaw, 0]}
      castShadow
      customDepthMaterial={depthMaterial}
      raycast={() => null}
    >
      <planeGeometry args={[0.58, 1.75]} />
      <meshBasicMaterial
        alphaMap={alpha}
        transparent
        alphaTest={0.5}
        colorWrite={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
