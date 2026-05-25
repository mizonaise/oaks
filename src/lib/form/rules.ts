import type {
  Dependency,
  FilterGroup,
  FilterRule,
  FilterRuleGroup,
  Option
} from '@/lib/form/schema'
import { evalExpr, type FlatVars } from './expr'
import type { SelectedMap, Values } from './types'

// Arithmetic operators outside CONCAT signal that leftValue is a numeric expression.
const HAS_ARITH = /[+\-*/]/

// "@FIELD", "@FIELD.data.x", "CONCAT(@A,@B.data.x)", "@X - $Y + 1"
function resolveLeft (
  expr: string,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars
): string {
  const concatMatch = expr.match(/^CONCAT\((.+)\)$/)
  if (concatMatch) {
    return concatMatch[1]
      .split(',')
      .map(s => resolveLeft(s.trim(), values, selected, vars))
      .join('')
  }
  // Arithmetic expression — evaluate as number.
  if (HAS_ARITH.test(expr) && (expr.includes('@') || expr.includes('$'))) {
    return String(evalExpr(expr, values, selected, vars))
  }
  if (expr.startsWith('$')) {
    const v = vars[expr.slice(1)]
    return v === undefined ? '' : String(v)
  }
  if (!expr.startsWith('@')) return expr
  const [fieldName, ...path] = expr.slice(1).split('.')
  if (path.length === 0) {
    const v = values[fieldName]
    return v === undefined ? '' : String(v)
  }
  const opt = selected[fieldName]
  if (!opt) return ''
  return walkPath(opt, path)
}

// ".data.filter" → read against a candidate option; literal otherwise
function resolveRight (expr: string, opt: Option): string {
  if (!expr.startsWith('.')) return expr
  return walkPath(opt, expr.slice(1).split('.'))
}

function walkPath (root: unknown, path: string[]): string {
  let cur: unknown = root
  for (const p of path) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return ''
  }
  return cur == null ? '' : String(cur)
}

function compare (op: string, left: string, right: string): boolean {
  switch (op) {
    case 'I':
      return right !== '' && right.includes(left)
    case '=':
    case 'E':
      return left === right
    case '!=':
      return left !== right
    case '>':
    case '<':
    case '>=':
    case '<=': {
      const l = Number(left)
      const r = Number(right)
      if (!Number.isFinite(l) || !Number.isFinite(r)) return false
      if (op === '>') return l > r
      if (op === '<') return l < r
      if (op === '>=') return l >= r
      return l <= r
    }
    default:
      return right !== '' && right.includes(left)
  }
}

function evalRule (
  rule: FilterRule,
  opt: Option,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars
): boolean {
  const op = rule.comparison ?? rule.comparaison ?? 'I'
  return compare(
    op,
    resolveLeft(rule.leftValue, values, selected, vars),
    resolveRight(rule.rightValue, opt)
  )
}

function evalRuleGroup (
  rg: FilterRuleGroup,
  opt: Option | undefined,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars
): boolean {
  const dummy: Option = opt ?? { value: '', label: '' }
  const results = rg.roles.map(r => evalRule(r, dummy, values, selected, vars))
  return rg.operator === 'OR' ? results.some(Boolean) : results.every(Boolean)
}

export function evalFilters (
  filters: FilterGroup[] | undefined,
  opt: Option,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars = {}
): boolean {
  if (!filters || filters.length === 0) return true
  return filters.every(group =>
    group.roles.some(rg => evalRuleGroup(rg, opt, values, selected, vars))
  )
}

export function isVisible (
  deps: Dependency[] | undefined,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars = {}
): boolean {
  if (!deps || deps.length === 0) return true
  for (const dep of deps) {
    const matched = dep.roles.some(rg =>
      evalRuleGroup(rg, undefined, values, selected, vars)
    )
    if (dep.action === 'HIDE' && matched) return false
    if (dep.action === 'SHOW' && !matched) return false
  }
  return true
}
