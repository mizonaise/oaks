import type { FormNode, Option, Variable } from '@/lib/form/schema'
import { resolveBound, type FlatVars } from './expr'
import { evalFilters } from './rules'
import type { FieldIndex, SelectedMap, Values } from './types'

export function buildFieldIndex (
  node: FormNode,
  acc: FieldIndex = {}
): FieldIndex {
  if (node.render === 'FIELD') acc[node.name] = node
  else for (const c of node.children) buildFieldIndex(c, acc)
  return acc
}

function readVariable (
  v: Variable,
  fieldValue: string | undefined,
  selectedOpt: Option | undefined
): unknown {
  if (v.path === '.') return fieldValue
  if (!v.path.startsWith('.')) return v.path
  if (!selectedOpt) return undefined
  let cur: unknown = selectedOpt
  for (const p of v.path.slice(1).split('.')) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return undefined
  }
  return cur
}

/**
 * Walks the schema in declaration order, settling each field:
 *  - COMBO: keep current value if still visible; else try defaultValue;
 *    else fall back to the first visible option.
 *  - INPUT: apply defaultValue if empty, then clamp to min/max.
 * Collects field-declared `variables` into a flat map keyed by name.
 */
export function reconcile (
  root: FormNode,
  values: Values = {},
  selected: SelectedMap = {},
  vars: FlatVars = {}
): {
  values: Values
  selected: SelectedMap
  flatVariables: FlatVars
} {
  const nextValues: Values = { ...values }
  const nextSelected: SelectedMap = { ...selected }
  const flatVariables: FlatVars = {}

  const collectVars = (
    fieldVars: Variable[] | undefined,
    fieldValue: string | undefined,
    selectedOpt: Option | undefined
  ) => {
    if (!fieldVars) return
    for (const v of fieldVars) {
      flatVariables[v.name] = readVariable(v, fieldValue, selectedOpt)
    }
  }

  const walk = (node: FormNode) => {
    if (node.render === 'FIELD') {
      if (node.type === 'COMBO') {
        const visible = (node.options ?? []).filter(o =>
          evalFilters(node.filters, o, nextValues, nextSelected, vars)
        )
        const current = nextValues[node.name]
        let picked: Option | undefined
        if (current !== undefined && current !== '') {
          picked = visible.find(o => o.value === current)
        }
        if (!picked && node.defaultValue !== undefined) {
          picked = visible.find(o => o.value === node.defaultValue)
        }
        if (!picked) picked = visible[0]
        if (picked) {
          nextValues[node.name] = picked.value
          nextSelected[node.name] = picked
        } else {
          delete nextValues[node.name]
          delete nextSelected[node.name]
        }
        collectVars(node.variables, nextValues[node.name], nextSelected[node.name])
      } else {
        if (
          nextValues[node.name] === undefined &&
          node.defaultValue !== undefined
        ) {
          nextValues[node.name] = node.defaultValue
        }
        const raw = nextValues[node.name]
        if (raw !== undefined && raw !== '') {
          const n = Number(raw)
          if (Number.isFinite(n)) {
            const min = resolveBound(node.min, nextValues, nextSelected, vars)
            const max = resolveBound(node.max, nextValues, nextSelected, vars)
            let clamped = n
            if (min !== undefined && clamped < min) clamped = min
            if (max !== undefined && clamped > max) clamped = max
            if (clamped !== n) nextValues[node.name] = String(clamped)
          }
        }
        collectVars(node.variables, nextValues[node.name], undefined)
      }
    } else {
      if (
        node.type === 'TAB' &&
        nextValues[node.name] === undefined &&
        node.defaultValue !== undefined
      ) {
        nextValues[node.name] = node.defaultValue
      }
      for (const c of node.children) walk(c)
    }
  }
  walk(root)
  return { values: nextValues, selected: nextSelected, flatVariables }
}
