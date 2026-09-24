'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { BancSettings } from './banc/BancContext'

/**
 * The viewer's own toolbar — what the *customer* may change (Dorian, 11/09).
 *
 * One round button per decision, each opening a small menu: how the unit is
 * shown, from where, with which doors, with which dimension lines. These are
 * exactly the `MODE_KEYS` of `BancContext`; the lighting, shadow, material and
 * room settings are the design team's recipe and have no control here by
 * design, and the pixel budget is the browser's business (`perf.ts`).
 *
 * The whole toolbar is a thin wrapper over one `onChange(patch)` callback, so
 * the same values can be driven from the bench panel, from a shared link, or
 * from here without a second source of truth.
 */

type ModeSettings = Pick<
  BancSettings,
  'mode' | 'camera' | 'camHeight' | 'fov' | 'doors' | 'dims'
>

export function ViewerControls ({
  settings,
  onChange,
  walk,
  onWalk,
  walkDisabled = false,
  freeLook,
  onFreeLook,
  maxEye = 2.6
}: {
  settings: ModeSettings
  onChange: (patch: Partial<BancSettings>) => void
  /** Walk-through (FPS) mode is on. */
  walk: boolean
  onWalk: (on: boolean) => void
  /** A form-driven zone owns the camera: walking would fight it. */
  walkDisabled?: boolean
  /** Free rotation: the user drives the orbit, zone framing stands down. */
  freeLook: boolean
  onFreeLook: (on: boolean) => void
  /** Ceiling cap on the eye height, in metres (see `eyeHeight`). */
  maxEye?: number
}) {
  const [open, setOpen] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)

  // A menu closes on Escape and on any click outside the toolbar — including a
  // drag on the canvas, which is the most likely next gesture.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Walking takes over the keyboard and the pointer: an open menu would eat
  // the first click, which is the one that grabs the pointer lock.
  useEffect(() => {
    if (walk) setOpen(null)
  }, [walk])

  const menu = (id: string, label: string, icon: ReactNode, body: ReactNode) => (
    <Row
      id={id}
      label={label}
      icon={icon}
      open={open === id}
      onToggle={() => setOpen(cur => (cur === id ? null : id))}
      active={false}
    >
      {body}
    </Row>
  )

  return (
    <div
      ref={root}
      className='absolute right-3 top-3 z-10 flex flex-col items-end gap-2'
    >
      {menu(
        'doors',
        'Doors',
        <DoorIcon open={settings.doors === 'ouvertes'} />,
        <Choices
          title='Doors'
          value={settings.doors}
          onPick={v => onChange({ doors: v })}
          options={[
            ['fermees', 'Closed'],
            ['ouvertes', 'Open'],
            ['retirees', 'No doors (see inside)']
          ]}
        />
      )}

      {menu(
        'mode',
        'Visualisation',
        <LayersIcon />,
        <Choices
          title='Visualisation'
          value={settings.mode}
          onPick={v => onChange({ mode: v })}
          options={[
            ['realiste', 'Realistic — high'],
            ['bassedef', 'Realistic — low (faster)'],
            ['filaire', 'Wireframe'],
            ['schema', 'Schematic (Flora)']
          ]}
        />
      )}

      {menu(
        'dims',
        'Dimensions',
        <RulerIcon />,
        <Choices
          title='Dimensions'
          value={settings.dims}
          onPick={v => onChange({ dims: v })}
          options={[
            ['aucune', 'None'],
            ['globales', 'Overall (W × H × D)'],
            ['detaillees', 'Detailed (zones, levels)'],
            ['designer', 'Renderer labels']
          ]}
        />
      )}

      {menu(
        'camera',
        'Camera',
        <CameraIcon />,
        <div className='flex flex-col gap-3'>
          <Choices
            title='Camera'
            value={settings.camera}
            onPick={v => onChange({ camera: v })}
            options={[
              ['auto', 'Auto (fits the unit)'],
              ['face', 'Front'],
              ['tq_gauche', 'Three-quarter left'],
              ['tq_droite', 'Three-quarter right'],
              ['detail', 'Close-up (handle)'],
              ['plongee', 'Slight high angle']
            ]}
          />
          <Slider
            label='Eye height'
            value={settings.camHeight}
            min={1.2}
            max={2.6}
            step={0.05}
            unit=' m'
            note={
              settings.camHeight > maxEye
                ? `capped at ${maxEye.toFixed(2)} m by the ceiling`
                : undefined
            }
            onChange={v => onChange({ camHeight: v })}
          />
          <Slider
            label='Focal length'
            value={settings.fov}
            min={24}
            max={60}
            step={1}
            unit='°'
            onChange={v => onChange({ fov: v })}
          />
        </div>
      )}

      <Row
        id='orbit'
        label={
          walkDisabled
            ? 'Rotation unavailable while a zone is selected'
            : freeLook
            ? 'Disable free rotation'
            : 'Enable free rotation'
        }
        icon={<OrbitIcon />}
        open={false}
        active={freeLook}
        disabled={walkDisabled}
        onToggle={() => onFreeLook(!freeLook)}
      />

      <Row
        id='walk'
        label={
          walkDisabled
            ? 'Walk-through unavailable while a zone is selected'
            : walk
            ? 'Leave walk-through (Esc) — returns to the starting view'
            : 'Walk through the room'
        }
        icon={<WalkIcon />}
        open={false}
        active={walk}
        disabled={walkDisabled}
        onToggle={() => onWalk(!walk)}
      />

      {walk && (
        <p className='max-w-[13rem] rounded-lg bg-zinc-900/85 px-3 py-2 text-right text-[11px] leading-snug text-white shadow-lg'>
          Move with W A S D or the arrows, hold Shift to go faster, look around
          by moving the mouse. Esc returns to the starting view.
        </p>
      )}
    </div>
  )
}

/** One round button, with its menu card floating to its left. */
function Row ({
  id,
  label,
  icon,
  open,
  active,
  disabled = false,
  onToggle,
  children
}: {
  id: string
  label: string
  icon: ReactNode
  open: boolean
  active: boolean
  disabled?: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  return (
    <div className='relative flex items-start'>
      {open && children && (
        <div
          id={`${id}-menu`}
          className='absolute right-12 top-0 w-60 rounded-xl border border-zinc-200 bg-white/95 p-3 text-left shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95'
        >
          {children}
        </div>
      )}
      <button
        type='button'
        onClick={onToggle}
        disabled={disabled}
        title={label}
        aria-label={label}
        aria-expanded={children ? open : undefined}
        aria-controls={children ? `${id}-menu` : undefined}
        aria-pressed={children ? undefined : active}
        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md backdrop-blur transition ${
          disabled
            ? 'cursor-not-allowed border-zinc-200 bg-white/60 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-600'
            : active || open
            ? 'border-zinc-800 bg-zinc-800 text-white dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900'
            : 'border-zinc-200 bg-white/90 text-zinc-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        }`}
      >
        {icon}
      </button>
    </div>
  )
}

/** A titled list of exclusive choices. */
function Choices<T extends string> ({
  title,
  value,
  options,
  onPick
}: {
  title: string
  value: T
  options: Array<[T, string]>
  onPick: (v: T) => void
}) {
  return (
    <div>
      <p className='mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400'>
        {title}
      </p>
      <div className='flex flex-col'>
        {options.map(([key, label]) => (
          <button
            key={key}
            type='button'
            onClick={() => onPick(key)}
            aria-pressed={value === key}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
              value === key
                ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                value === key ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-transparent'
              }`}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Slider ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  note,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  note?: string
  onChange: (v: number) => void
}) {
  return (
    <label className='block'>
      <span className='mb-1 flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-400'>
        {label}
        <span className='font-mono text-[11px] normal-case text-zinc-500'>
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </span>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className='w-full accent-zinc-800 dark:accent-zinc-200'
      />
      {note && <span className='text-[11px] text-zinc-400'>{note}</span>}
    </label>
  )
}

// --- glyphs -------------------------------------------------------------

const stroke = {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

/** Door glyph; the panel is ajar when `open`. */
function DoorIcon ({ open }: { open: boolean }) {
  return (
    <svg {...stroke}>
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

/** Stacked sheets — the visualisation quality menu. */
function LayersIcon () {
  return (
    <svg {...stroke}>
      <path d='M12 3 3 7.5 12 12l9-4.5z' />
      <path d='m3 12 9 4.5L21 12' />
      <path d='m3 16.5 9 4.5 9-4.5' />
    </svg>
  )
}

function RulerIcon () {
  return (
    <svg {...stroke}>
      <path d='M3 8.5 8.5 3 21 15.5 15.5 21z' />
      <path d='M8 8l1.5 1.5M11 5l2 2M14 8l1.5 1.5M5 11l2 2' />
    </svg>
  )
}

function CameraIcon () {
  return (
    <svg {...stroke}>
      <path d='M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z' />
      <circle cx='12' cy='13' r='3.4' />
    </svg>
  )
}

/** Orbit glyph: a body with a ring swung around it — free rotation. */
function OrbitIcon () {
  return (
    <svg {...stroke}>
      <circle cx='12' cy='12' r='3.2' />
      <ellipse cx='12' cy='12' rx='10' ry='4.6' transform='rotate(-30 12 12)' />
    </svg>
  )
}

/** Walking figure — the FPS / walk-through toggle. */
function WalkIcon () {
  return (
    <svg {...stroke}>
      <circle cx='13' cy='4' r='1.6' />
      <path d='M13.5 21v-5l-2.5-2.5.8-4.5' />
      <path d='m11.8 9-3 2.2L7 14' />
      <path d='m11.8 9 3.4 1.6 1.8 3.4' />
      <path d='M13.5 16 10 21' />
    </svg>
  )
}
