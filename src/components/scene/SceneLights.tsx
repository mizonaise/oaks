'use client'

import { memo } from 'react'

export const SceneLights = memo(function SceneLights () {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={['#ffffff', '#444444', 0.4]} />
    </>
  )
})
