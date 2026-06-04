'use client'

import { useCallback, useMemo, useState } from 'react'
import { ShapeViewer } from '@/components/scene/ShapeViewer'
import { resolveVariables } from '@/lib/form/variables'
import type { FlatVars } from '@/lib/form/expr'
import { setShapeData } from '@/lib/shape/registry'
import type { Dataset } from '@/data'

import {
  ConfiguratorPreviewDialog,
  type ExportedConfigurator
} from '@oak-some/configurator-previewer'

/**
 * Inverse of `setNested`: `{ global: { X: 1 }, A: { B: 2 } }` → `{ X: 1, "A.B": 2 }`.
 * The `global` namespace is dropped (bare names live at the top of the flat map).
 */
function flattenNested (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k in obj) {
    const v = obj[k]
    const isGlobal = prefix === '' && k === 'global'
    const path = isGlobal ? '' : prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenNested(v as Record<string, unknown>, path))
    } else if (path) {
      out[path] = v
    }
  }
  return out
}

/**
 * Equality for variable values across the form↔parent round-trip. The form
 * emits raw values (numbers, `undefined`) but `resolveVariables` stores the
 * string-normalized form, so a strict `Object.is` would treat the same logical
 * value as changed on every cycle. Treat `undefined`/`''` as equal (an
 * unresolved path is no value) and otherwise compare by string.
 */
function sameVar (a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  const empty = (v: unknown) => v === undefined || v === null || v === ''
  if (empty(a) && empty(b)) return true
  if (empty(a) || empty(b)) return false
  return String(a) === String(b)
}

function readNested (target: Record<string, unknown>, name: string): unknown {
  const parts = name.includes('.') ? name.split('.') : ['global', name]
  let cur: unknown = target
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return undefined
  }
  return cur
}

function setNested (
  target: Record<string, unknown>,
  name: string,
  value: unknown
): Record<string, unknown> {
  const parts = name.includes('.') ? name.split('.') : ['global', name]
  const out: Record<string, unknown> = { ...target }
  let cur: Record<string, unknown> = out
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    const existing = cur[k]
    cur[k] =
      existing && typeof existing === 'object'
        ? { ...(existing as Record<string, unknown>) }
        : {}
    cur = cur[k] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
  return out
}

export function ShapeConfigurator ({
  dev = false,
  dataset
}: {
  dev?: boolean
  dataset: Dataset
}) {
  const { shape, formExpo } = dataset

  // Register this dataset's descriptors/cps BEFORE any child runs walkZone /
  // cp resolution. Calling synchronously in the render body (not inside a
  // useMemo) avoids any chance of useMemo cache + Strict-Mode replay leaving
  // the registry pointed at the previous dataset.
  setShapeData(shape)

  // Nested-by-dots updates emitted by the form (bare names → under "global",
  // dotted names → nested objects).
  const [nestedUpdates, setNestedUpdates] = useState<Record<string, unknown>>(
    {}
  )

  const handleChangeVariables = useCallback((name: string, value: unknown) => {
    setNestedUpdates(prev => {
      const current = readNested(prev, name)
      // The form emits raw values (numbers, undefined for unresolved paths)
      // while `resolveVariables` stores them string-normalized. Compare by the
      // same normalized form so a `5` ↔ "5" round-trip is a no-op — otherwise
      // every emit produces a new `nestedUpdates`, which re-derives
      // `flatForForm`, which re-runs the form's reconcile, which re-emits …
      // (Maximum update depth exceeded).
      if (sameVar(current, value)) return prev
      return setNested(prev, name, value)
    })
  }, [])

  // Flatten nestedUpdates back to dotted/bare names, merged on top of seed,
  // then resolve `$VAR` expressions.
  const flatForForm = useMemo(
    () =>
      resolveVariables({ ...shape.variables, ...flattenNested(nestedUpdates) }),
    [nestedUpdates, shape]
  )

  // Merged display view: `global` namespace combines seed + form overrides,
  // and any other dotted namespaces from `nestedUpdates` sit alongside.
  const mergedView = useMemo(() => {
    const { global: globalOverrides, ...rest } = nestedUpdates as {
      global?: Record<string, unknown>
    } & Record<string, unknown>
    return {
      global: { ...shape.variables, ...(globalOverrides ?? {}) },
      ...rest
    }
  }, [nestedUpdates, shape])

  // Resolve $-refs once: global on its own, then each zone namespace against
  // `{ ...global, ...own }` so it can reference both. Strip global keys back
  // out so each namespace only carries what it actually defines.
  const resolvedScopes = useMemo(() => {
    const flatten = (raw: unknown): FlatVars => {
      if (!raw || typeof raw !== 'object') return {}
      const out: FlatVars = {}
      for (const k in raw as object) {
        const v = (raw as Record<string, unknown>)[k]
        if (v && typeof v === 'object') continue
        out[k] = v
      }
      return out
    }
    const globalVars = resolveVariables(flatten(mergedView.global))
    const namespaces: Record<string, FlatVars> = {}
    for (const k in mergedView) {
      if (k === 'global') continue
      const own = flatten((mergedView as Record<string, unknown>)[k])
      const merged = resolveVariables({ ...globalVars, ...own })
      const ns: FlatVars = {}
      for (const key in own) ns[key] = merged[key]
      namespaces[k] = ns
    }
    return { globalVars, namespaces }
  }, [mergedView])

  return (
    <div className='flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black min-h-screen'>
      <main className='flex flex-1 w-full gap-6 p-6 bg-white dark:bg-black lg:flex-row flex-col'>
        <div className='flex flex-col gap-4 lg:flex-2 min-w-0'>
          <ShapeViewer shape={shape} scopes={resolvedScopes} dev={dev} />
          {dev && (
            <>
              <Panel
                title='flated variables (seed + form overrides) used in form'
                data={flatForForm}
              />
              <Panel
                title='variables (seed + form overrides) used in shape resolution'
                data={resolvedScopes}
              />
            </>
          )}
        </div>
        <aside className='lg:flex-1 lg:max-w-md min-w-0 overflow-auto'>
          <ConfiguratorPreviewDialog
            onVariableSetChange={vars => {
              // console.log('onVariableSetChange', vars)
              for (const [name, value] of Object.entries(vars)) {
                handleChangeVariables(name, value)
              }
            }}
            imageSuffix='/public'
            imagePrefix='https://imagedelivery.net/aYYmWUcv7lRhpLdU4ojPsA/'
            configuratorJson={formExpo as unknown as ExportedConfigurator}
          />
        </aside>
      </main>
    </div>
  )
}

function Panel ({ title, data }: { title: string; data: unknown }) {
  return (
    <div>
      <h3 className='mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500'>
        {title}
      </h3>
      <pre className='rounded bg-zinc-100 dark:bg-zinc-900 p-3 text-xs overflow-auto'>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
