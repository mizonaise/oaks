'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import { buildFieldIndex, reconcile } from '@/lib/form/state'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Node } from './Node'

const EMPTY_VARS: FlatVars = Object.freeze({})

type State = {
  values: Values
  selected: SelectedMap
  flatVariables: FlatVars
}

type Props = {
  schema: FormNode
  variables?: FlatVars
  onVariableChange?: (name: string, value: unknown) => void
}

export function FormRenderer ({ schema, variables, onVariableChange }: Props) {
  const vars = variables ?? EMPTY_VARS
  const index = useMemo(() => buildFieldIndex(schema), [schema])
  const [state, setState] = useState<State>(() =>
    reconcile(schema, {}, {}, vars)
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
  // Note: we intentionally do NOT re-reconcile when `vars` changes. The form
  // is a one-way consumer of the initial vars; subsequent reconciles happen
  // only from user `set` calls, where they read `varsRef.current`. This
  // breaks the feedback cycle when `vars` is derived from form-emitted
  // variables in the parent.

  const set = useCallback<SetFn>(
    (name, v, option) => {
      setState(prev => {
        const nextValues = { ...prev.values, [name]: v }
        const field = index[name]
        const nextSelected =
          field?.type === 'COMBO'
            ? { ...prev.selected, [name]: option }
            : prev.selected
        return reconcile(schema, nextValues, nextSelected, varsRef.current)
      })
    },
    [index, schema]
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

