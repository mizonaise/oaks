'use client'

import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Node } from './Node'

type Props = {
  node: Extract<FormNode, { type: 'NONE' }>
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function Section ({ node, values, selected, vars, set }: Props) {
  return (
    <section className='flex flex-col gap-3'>
      {node.label && (
        <h3 className='text-sm font-semibold text-zinc-600 dark:text-zinc-400'>
          {node.label}
        </h3>
      )}
      {node.children.map(c => (
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
