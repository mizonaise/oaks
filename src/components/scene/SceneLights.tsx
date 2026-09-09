'use client'

import { memo } from 'react'

/**
 * Multiplier applied to every light when contrast is enabled. Three divides
 * PBR diffuse by π, so a face angled away from the key light renders well
 * below its material hex; ~1.35× lifts those faces back to (or just past)
 * their nominal colour without pushing white past 255 on lit faces.
 */
const CONTRAST_BOOST = 2.35

export const SceneLights = memo(function SceneLights ({
  radius = 8,
  contrasted = false
}: {
  /** Half-extent (scene units) the shadow camera must cover; size to the unit. */
  radius?: number
  /** Brightens every light so material colours read closer to their true hex. */
  contrasted?: boolean
}) {
  // Fit the directional light's orthographic shadow camera tightly to the
  // scene. The default frustum is a small ±5 box, so over a wide unit each
  // shadow-map texel stretches across many world units and the shadow edge
  // looks pixelized/jagged. A snug frustum + a larger map keeps texels dense.
  const ortho = radius * 1.4
  const far = radius * 6
  // Scales all three lights together, so the balance between them is kept.
  const boost = contrasted ? CONTRAST_BOOST : 1
  return (
    <>
      <ambientLight intensity={1.5 * boost} />
      <directionalLight
        position={[radius, radius * 1.6, radius]}
        intensity={1.5 * boost}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={far}
        shadow-camera-left={-ortho}
        shadow-camera-right={ortho}
        shadow-camera-top={ortho}
        shadow-camera-bottom={-ortho}
        // Bias tuned to the scene scale: kills shadow acne without peter-panning.
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <hemisphereLight args={['#ffffff', '#444444', 0.4 * boost]} />
    </>
  )
})
