'use client'

import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Node } from './Node'

type Props = {
  node: Extract<FormNode, { type: 'ACCORDION' }>
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function Accordion ({ node, values, selected, vars, set }: Props) {
  return (
    <details className='rounded border border-zinc-200 dark:border-zinc-800 p-3'>
      <summary className='cursor-pointer font-medium'>{node.label}</summary>
      <div className='mt-3 flex flex-col gap-3'>
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
      </div>
    </details>
  )
}
