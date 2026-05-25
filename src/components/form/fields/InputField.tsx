'use client'

import type { FormNode } from '@/lib/form/schema'
import { resolveBound, type FlatVars } from '@/lib/form/expr'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'

type Props = {
  node: Extract<FormNode, { type: 'INPUT' }>
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function InputField ({ node, values, selected, vars, set }: Props) {
  const value = values[node.name] ?? ''
  const min = resolveBound(node.min, values, selected, vars)
  const max = resolveBound(node.max, values, selected, vars)
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-sm font-medium'>
        {node.label}
        {(min !== undefined || max !== undefined) && (
          <span className='ml-2 text-xs text-zinc-500'>
            ({min ?? '-∞'} – {max ?? '∞'})
          </span>
        )}
      </span>
      <input
        type='number'
        value={value}
        min={min}
        max={max}
        onChange={e => set(node.name, e.target.value)}
        className='rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5'
      />
    </label>
  )
}
