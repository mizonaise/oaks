'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import { buildFieldIndex, reconcile } from '@/lib/form/state'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Node } from './Node'

const EMPTY_VARS: FlatVars = Object.freeze({})

function shallowEqualValues (a: Values, b: Values): boolean {
  const ak = Object.keys(a)
  if (ak.length !== Object.keys(b).length) return false
  for (const k of ak) if (a[k] !== b[k]) return false
  return true
}

function shallowEqualSelected (a: SelectedMap, b: SelectedMap): boolean {
  const ak = Object.keys(a)
  if (ak.length !== Object.keys(b).length) return false
  for (const k of ak) if (a[k] !== b[k]) return false
  return true
}

function shallowEqualVars (a: FlatVars, b: FlatVars): boolean {
  const ak = Object.keys(a)
  if (ak.length !== Object.keys(b).length) return false
  for (const k of ak) if (!Object.is(a[k], b[k])) return false
  return true
}

type State = {
  values: Values
  selected: SelectedMap
  flatVariables: FlatVars
}

type Props = {
  schema: FormNode
  variables?: FlatVars
  onVariableChange?: (name: string, value: unknown) => void
  // Optional: resolves form-emitted overrides against parent seed/global vars,
  // returning the full $VAR scope reconcile should see. When provided,
  // FormRenderer iterates reconcile until the cascade stabilizes within a
  // single render, instead of waiting for round-trips through the parent.
  resolveScope?: (formVars: FlatVars) => FlatVars
}

export function FormRenderer ({
  schema,
  variables,
  onVariableChange,
  resolveScope
}: Props) {
  const vars = variables ?? EMPTY_VARS
  const index = useMemo(() => buildFieldIndex(schema), [schema])

  const resolveScopeRef = useRef(resolveScope)
  resolveScopeRef.current = resolveScope

  // Iterate reconcile until `flatVariables` is stable. Each pass feeds the
  // emitted form vars back through `resolveScope` (parent seed + cascade
  // resolution) so that filters/bounds depending on derived $VARs see the
  // updated cascade in the *same* render, avoiding an N-render round-trip
  // ping-pong with the parent.
  const reconcileSettled = useCallback(
    (
      nextValues: Values,
      nextSelected: SelectedMap,
      baseVars: FlatVars
    ): State => {
      let scope = baseVars
      let result = reconcile(schema, nextValues, nextSelected, scope)
      const resolver = resolveScopeRef.current
      if (!resolver) return result
      for (let i = 0; i < 32; i++) {
        const nextScope = resolver(result.flatVariables)
        if (shallowEqualVars(nextScope, scope)) return result
        scope = nextScope
        const nextResult = reconcile(
          schema,
          result.values,
          result.selected,
          scope
        )
        if (
          shallowEqualValues(result.values, nextResult.values) &&
          shallowEqualSelected(result.selected, nextResult.selected) &&
          shallowEqualVars(result.flatVariables, nextResult.flatVariables)
        ) {
          return nextResult
        }
        result = nextResult
      }
      return result
    },
    [schema]
  )

  const [state, setState] = useState<State>(() =>
    reconcileSettled({}, {}, vars)
  )
  const { values, selected, flatVariables } = state

  const onVarRef = useRef(onVariableChange)
  onVarRef.current = onVariableChange
  const prevFlatRef = useRef<FlatVars>({})

  useEffect(() => {
    const prev = prevFlatRef.current
    const cb = onVarRef.current
    if (cb) {
      for (const name in flatVariables) {
        if (!Object.is(prev[name], flatVariables[name])) {
          cb(name, flatVariables[name])
        }
      }
    }
    prevFlatRef.current = flatVariables
  }, [flatVariables])

  const varsRef = useRef(vars)
  varsRef.current = vars

  // Re-reconcile during render when `vars` changes so cascading filters/bounds
  // that read `$VAR` refs (resolved by the parent) settle within the same edit.
  // Using setState during render (instead of in an effect) lets the new
  // `flatVariables` show up in the *current* render — and the bail-out below
  // breaks the feedback loop once reconcile produces equal output.
  const prevVarsRef = useRef<FlatVars | null>(null)
  if (prevVarsRef.current !== vars) {
    prevVarsRef.current = vars
    const next = reconcileSettled(state.values, state.selected, vars)
    if (
      !shallowEqualValues(state.values, next.values) ||
      !shallowEqualSelected(state.selected, next.selected) ||
      !shallowEqualVars(state.flatVariables, next.flatVariables)
    ) {
      setState(next)
    }
  }

  const set = useCallback<SetFn>(
    (name, v, option) => {
      setState(prev => {
        const nextValues = { ...prev.values, [name]: v }
        const field = index[name]
        const nextSelected =
          field?.type === 'COMBO'
            ? { ...prev.selected, [name]: option }
            : prev.selected
        return reconcileSettled(nextValues, nextSelected, varsRef.current)
      })
    },
    [index, reconcileSettled]
  )

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        const out: Record<string, string> = {}
        for (const name in index) {
          const field = index[name]
          if (field.render !== 'FIELD') continue
          const v = values[name]
          if (v === undefined || v === '') continue
          out[field.label] =
            field.type === 'COMBO' ? selected[name]?.label ?? v : v
        }
        // console.log(out)
      }}
      className='flex flex-col gap-4 w-full max-w-2xl'
    >
      <Node
        node={schema}
        values={values}
        selected={selected}
        vars={vars}
        set={set}
      />
      <button
        type='submit'
        className='self-start rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black'
      >
        Submit
      </button>
    </form>
  )
}

