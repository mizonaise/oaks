'use client'

import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Node } from './Node'

type Props = {
  node: Extract<FormNode, { type: 'TAB' }>
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function Tab ({ node, values, selected, vars, set }: Props) {
  const active = values[node.name] ?? node.children[0]?.name
  return (
    <section className='flex flex-col gap-3'>
      {node.label && <h2 className='text-lg font-semibold'>{node.label}</h2>}
      <div className='flex gap-2 border-b border-zinc-200 dark:border-zinc-800'>
        {node.children.map(c => (
          <button
            key={c.name}
            type='button'
            onClick={() => set(node.name, c.name)}
            className={`px-3 py-1.5 text-sm ${
              active === c.name
                ? 'border-b-2 border-black dark:border-white font-medium'
                : 'text-zinc-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {node.children
        .filter(c => c.name === active)
        .map(c => (
          <Node
            key={c.name}
            node={c}
            values={values}
            selected={selected}
            vars={vars}
            set={set}
          />
        ))}
    </section>
  )
}
