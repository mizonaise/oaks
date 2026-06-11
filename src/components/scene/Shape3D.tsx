'use client'

import { useState } from 'react'
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { type Box as ShapeBox, type DimCpConfig } from './shapeTree'
import type { FlatVars } from '@/lib/form/expr'
import { SceneLights } from './SceneLights'
import { GroundShadow } from './GroundShadow'
import { RoomWalls } from './RoomWalls'
import { BoxItem } from './BoxItem'

type Props = {
  dev?: boolean
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
  /** Per-CP dimension config: panels whose `cpName` is a key here get an
   *  in-scene label, with the `w`/`h`/`d` flags selecting which of the box's
   *  dimensions to include. */
  dimCpConfig?: DimCpConfig
}

const MM = 1
const SCALE = 0.001

const DEFAULT_DIM_CP_CONFIG: DimCpConfig = {
  CP_1_FI_1000: { w: false, h: true, d: false },
  CP_1_FI_1111: { w: false, h: true, d: false },
  CP_1_BA_1000: { w: false, h: true, d: false },
  CP_1_CM_0000: { w: false, h: true, d: false },
  CP_1_TSI_1000_C1: { w: false, h: true, d: false }
}

export function Shape3D ({
  dev = false,
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect,
  dimCpConfig = DEFAULT_DIM_CP_CONFIG
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  const [showDims, setShowDims] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [contrasted, setContrasted] = useState(false)

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
      <Canvas shadows>
        <SceneLights />
        <PerspectiveCamera makeDefault position={[0, h / 2, 100]} zoom={20} />
        {/* <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} /> */}
        <group position={[ox, 0, oz]}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map((b, i) => {
              if (b.depth === 0 && !b.isArticle) return null
              return (
                <BoxItem
                  key={`${b.index}-${i}`}
                  box={b}
                  dev={dev}
                  isSelected={
                    selectedIndex != null &&
                    (b.index === selectedIndex ||
                      b.index.startsWith(`${selectedIndex}.`))
                  }
                  onSelect={onSelect}
                  globalVars={globalVars}
                  doorOpen={doorsOpen}
                  dimCpConfig={showDims ? dimCpConfig : null}
                  showDims={showDims}
                  contrasted={contrasted}
                />
              )
            })}
          </group>

          <RoomWalls w={w} h={h} d={d} globalVars={globalVars} />
          <GroundShadow w={w} d={d} />
        </group>
        <OrbitControls
          target={[0, h / 2, 0]}
          enableDamping
          minDistance={10}
          maxDistance={124}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  )
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
