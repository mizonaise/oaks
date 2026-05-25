'use client'

import type { FormNode } from '@/lib/form/schema'
import type { FlatVars } from '@/lib/form/expr'
import { isVisible } from '@/lib/form/rules'
import type { SelectedMap, SetFn, Values } from '@/lib/form/types'
import { Accordion } from './Accordion'
import { Section } from './Section'
import { Tab } from './Tab'
import { ComboField } from './fields/ComboField'
import { InputField } from './fields/InputField'

export type NodeProps = {
  node: FormNode
  values: Values
  selected: SelectedMap
  vars: FlatVars
  set: SetFn
}

export function Node ({ node, values, selected, vars, set }: NodeProps) {
  if (!isVisible(node.dependencies, values, selected, vars)) return null

  if (node.render === 'FIELD') {
    if (node.type === 'COMBO')
      return (
        <ComboField
          node={node}
          values={values}
          selected={selected}
          vars={vars}
          set={set}
        />
      )
    return (
      <InputField
        node={node}
        values={values}
        selected={selected}
        vars={vars}
        set={set}
      />
    )
  }

  if (node.type === 'TAB')
    return (
      <Tab
        node={node}
        values={values}
        selected={selected}
        vars={vars}
        set={set}
      />
    )
  if (node.type === 'ACCORDION')
    return (
      <Accordion
        node={node}
        values={values}
        selected={selected}
        vars={vars}
        set={set}
      />
    )
  return (
    <Section
      node={node}
      values={values}
      selected={selected}
      vars={vars}
      set={set}
    />
  )
}
