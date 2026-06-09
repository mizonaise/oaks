'use client'

import { useState } from 'react'
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

  const [doorsOpen, setDoorsOpen] = useState(false)

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
                  isSelected={
                    selectedIndex != null &&
                    (b.index === selectedIndex ||
                      b.index.startsWith(`${selectedIndex}.`))
                  }
                  onSelect={onSelect}
                  globalVars={globalVars}
                  doorOpen={doorsOpen}
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
