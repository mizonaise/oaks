'use client'

import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import { evalFilters } from '@/lib/form/rules'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'

type Props = {
  node: Extract<FormNode, { type: 'COMBO' }>
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function ComboField ({ node, values, selected, vars, set }: Props) {
  const value = values[node.name] ?? ''
  const visible = (node.options ?? []).filter(o =>
    evalFilters(node.filters, o, values, selected, vars)
  )

  return (
    <label className='flex flex-col gap-1'>
      <span className='text-sm font-medium'>{node.label}</span>
      <select
        value={value}
        disabled={visible.length === 0}
        onChange={e => {
          const v = e.target.value
          set(node.name, v, visible.find(o => o.value === v))
        }}
        className='rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5'
      >
        <option value=''>—</option>
        {visible.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
