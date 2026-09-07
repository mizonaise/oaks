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
      {node.label && <h2 className='k-titre-xs'>{node.label}</h2>}
      {/* The kit's Switch (4346:20843): the tabs are Tag XS Config pills in
          fill, gap 8 — the selected one goes Beige-on-black, the rest stay
          white with the 1px interior Beige outline. */}
      <div className='k-switch'>
        {node.children.map(c => (
          <button
            key={c.name}
            type='button'
            onClick={() => set(node.name, c.name)}
            aria-pressed={active === c.name}
            className={`k-pill${active === c.name ? ' is-selected' : ''}`}
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
