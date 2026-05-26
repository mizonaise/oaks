'use client'

import { useCallback, useMemo, useState } from 'react'
import { form, shape } from '@/data/shapeF'
import { FormRenderer } from '@/components/form/FormRenderer'
import { ShapeViewer } from '@/components/scene/ShapeViewer'
import { resolveVariables } from '@/lib/form/variables'
import type { FlatVars } from '@/lib/form/expr'

const globalVariables: Record<string, unknown> = {
  ZF_W: '6000',
  ZF_D: '500',
  ZONE_H: '3000',
  FI_1_THK: '($MAT_FI_1_THK + 2*($SRF_FI_1_THK))',
  MAT_FI_1_THK: '$MAT_FR_1_THK',
  MAT_FR_1_THK: '16',
  SRF_FI_1_THK: '$SRF_FR_1_THK',
  SRF_FR_1_THK: '0.8',
  IS_BI_L: '1',
  IS_BI_R: '1',
  IS_ZF_BI_T: '1',
  IS_ZF_BI_B: '1',
  BASE_HEIGHT: '100',
  CROWN_HEIGHT: '100',
  ZFL_W: '50',
  ZFR_W: '50',
  Front_Side_GAP: '2.5',
  ZF_STEP: '($ZFA_W / $ZF_CNT)',
  ZFA_W:
    '($ZF_W - ($FI_1_THK *(1-$IS_BI_R)) - ($FI_1_THK *(1-$IS_BI_L)) - ($IS_BI_R*$ZFR_W)  -($IS_BI_L*$ZFL_W))',
  ZF_CNT: '10',
  ZF_CNT_ACC_01: '$ZF_CNT_01',
  ZF_CNT_01: '1',
  DS_WACA_FR_ART_01: '#DS_WACA_U_ART_01',
  MAT_TS_1: '$MAT_1',
  MAT_FI_1: '$MAT_FR_1',
  ZF_CNT_ACC_02: '($ZF_CNT_ACC_01 + $ZF_CNT_02)',
  MAT_FR_1: 'UN_RW_HGS_MDFFB_16',
  MAT_1: 'EG_ED_W980_ST2_18mm',
  SRF_TS_1_EXT: '$SURF_TS_1_EXT',
  SRF_FI_1_TOP: '$SRF_FR_1_TOP',
  ZF_CNT_02: '1',
  SURF_TS_1_EXT: 'NO_SURF',
  SRF_FR_1_TOP: 'EG_HPL_HGP_W980_ST7_0_8',
  DS_WACA_FR_ART_02: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_03: '($ZF_CNT_ACC_02 + $ZF_CNT_03)',
  MAT_BA_1: '$MAT_FR_1',
  ZF_CNT_03: '2',
  SRF_BA_1_TOP: '$SRF_FR_1_TOP',
  DS_WACA_FR_ART_03: '#DS_WACA_U_ART_01',
  MAT_CM_1: '$MAT_FR_1',
  SRF_CM_1_TOP: '$SRF_FR_1_TOP',
  ZF_CNT_ACC_04: '($ZF_CNT_ACC_03 + $ZF_CNT_04)',
  ZF_CNT_04: '1',
  DS_WACA_FR_ART_04: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_05: '($ZF_CNT_ACC_04 + $ZF_CNT_05)',
  ZF_CNT_05: '2',
  DS_WACA_FR_ART_05: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_06: '($ZF_CNT_ACC_05 + $ZF_CNT_06)',
  ZF_CNT_06: '1',
  DS_WACA_FR_ART_06: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_07: '($ZF_CNT_ACC_06 + $ZF_CNT_07)',
  ZF_CNT_07: '2',
  DS_WACA_FR_ART_07: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_08: '($ZF_CNT_ACC_07 + $ZF_CNT_08)',
  ZF_CNT_08: '1',
  DS_WACA_FR_ART_08: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_09: '($ZF_CNT_ACC_08 + $ZF_CNT_09)',
  ZF_CNT_09: '1',
  DS_WACA_FR_ART_09: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_10: '($ZF_CNT_ACC_09 + $ZF_CNT_10)',
  ZF_CNT_10: '1',
  DS_WACA_FR_ART_10: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_11: '($ZF_CNT_ACC_10 + $ZF_CNT_11)',
  ZF_CNT_11: '1',
  DS_WACA_FR_ART_11: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_12: '($ZF_CNT_ACC_11 + $ZF_CNT_12)',
  ZF_CNT_12: '1',
  DS_WACA_FR_ART_12: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_13: '($ZF_CNT_ACC_12 + $ZF_CNT_13)',
  ZF_CNT_13: '1',
  DS_WACA_FR_ART_13: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_14: '($ZF_CNT_ACC_13 + $ZF_CNT_14)',
  ZF_CNT_14: '1',
  DS_WACA_FR_ART_14: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_15: '($ZF_CNT_ACC_14 + $ZF_CNT_15)',
  ZF_CNT_15: '1',
  DS_WACA_FR_ART_15: '#DS_WACA_U_ART_01',
  ZF_CNT_ACC_16: '($ZF_CNT_ACC_15 + $ZF_CNT_16)',
  ZF_CNT_16: '1',
  ZF_CNT_ACC_17: '($ZF_CNT_ACC_16 + $ZF_CNT_17)',
  ZF_CNT_17: '1'
}

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

export default function Home () {
  // Nested-by-dots updates emitted by the form (bare names → under "global",
  // dotted names → nested objects).
  const [nestedUpdates, setNestedUpdates] = useState<Record<string, unknown>>(
    {}
  )

  const handleChangeVariables = useCallback((name: string, value: unknown) => {
    setNestedUpdates(prev => {
      const current = readNested(prev, name)
      if (Object.is(current, value)) return prev
      return setNested(prev, name, value)
    })
  }, [])

  // Flatten nestedUpdates back to dotted/bare names, merged on top of seed,
  // then resolve `$VAR` expressions.
  const flatForForm = useMemo(
    () =>
      resolveVariables({ ...globalVariables, ...flattenNested(nestedUpdates) }),
    [nestedUpdates]
  )

  // Lets FormRenderer settle cascading $VAR refs in a single render: it calls
  // this with the form's currently-emitted variables and gets back the full
  // resolved scope (seed + form overrides + cascade).
  const resolveScope = useCallback(
    (formVars: FlatVars) =>
      resolveVariables({ ...globalVariables, ...formVars }),
    []
  )

  // Merged display view: `global` namespace combines seed + form overrides,
  // and any other dotted namespaces from `nestedUpdates` sit alongside.
  const mergedView = useMemo(() => {
    const { global: globalOverrides, ...rest } = nestedUpdates as {
      global?: Record<string, unknown>
    } & Record<string, unknown>
    return {
      global: { ...globalVariables, ...(globalOverrides ?? {}) },
      ...rest
    }
  }, [nestedUpdates])

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
          <ShapeViewer shape={shape} scopes={resolvedScopes} />
          <Panel
            title='flated variables (seed + form overrides) used in form'
            data={flatForForm}
          />
          {/* ;<Panel title='variables (seed + form overrides) ' data={mergedView} /> */}
          <Panel
            title='variables (seed + form overrides) used in shape resolution'
            data={resolvedScopes}
          />
        </div>
        <aside className='lg:flex-1 lg:max-w-md min-w-0 overflow-auto'>
          <FormRenderer
            schema={form}
            variables={flatForForm}
            onVariableChange={handleChangeVariables}
            resolveScope={resolveScope}
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
