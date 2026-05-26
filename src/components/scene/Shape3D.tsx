'use client'

import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { type Box as ShapeBox } from './shapeTree'
import type { FlatVars } from '@/lib/form/expr'
import { SceneLights } from './SceneLights'
import { GroundShadow } from './GroundShadow'
import { BoxItem } from './BoxItem'

type Props = {
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
}

const MM = 1
const SCALE = 0.001

export function Shape3D ({
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  return (
    <div className='h-125 w-full overflow-hidden rounded border border-zinc-200 dark:border-zinc-800'>
      <Canvas shadows>
        <SceneLights />
        <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} />
        <group position={[ox, 0, oz]}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map((b, i) => {
              if (b.depth === 0 && !b.isArticle) return null
              return (
                <BoxItem
                  key={`${b.index}-${i}`}
                  box={b}
                  isSelected={selectedIndex === b.index}
                  onSelect={onSelect}
                  globalVars={globalVars}
                />
              )
            })}
          </group>

          <GroundShadow w={w} d={d} />
        </group>
        <OrbitControls
          target={[0, h / 2, 0]}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  )
}
