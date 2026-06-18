'use client'

import { memo } from 'react'

export const SceneLights = memo(function SceneLights ({
  radius = 8
}: {
  /** Half-extent (scene units) the shadow camera must cover; size to the unit. */
  radius?: number
}) {
  // Fit the directional light's orthographic shadow camera tightly to the
  // scene. The default frustum is a small ±5 box, so over a wide unit each
  // shadow-map texel stretches across many world units and the shadow edge
  // looks pixelized/jagged. A snug frustum + a larger map keeps texels dense.
  const ortho = radius * 1.4
  const far = radius * 6
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[radius, radius * 1.6, radius]}
        intensity={1.2}
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
      <hemisphereLight args={['#ffffff', '#444444', 0.4]} />
    </>
  )
})
