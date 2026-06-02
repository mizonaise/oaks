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

// Resolves either side of a rule against the candidate option and form state.
// Handles: "&(...)" explicit expression, ".data.x" candidate-option read,
//   "@FIELD"/"@FIELD.data.x", "$VAR", "CONCAT(@A,@B.data.x)", "@X - $Y + 1",
//   and bare literals.
function resolveOperand (
  expr: string,
  opt: Option,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars
): string {
  // Explicit expression marker "&(...)" — always evaluate the inner expression.
  const exprMatch = expr.match(/^&\((.+)\)$/)
  if (exprMatch) {
    return String(evalExpr(exprMatch[1], values, selected, vars))
  }
  const concatMatch = expr.match(/^CONCAT\((.+)\)$/)
  if (concatMatch) {
    return concatMatch[1]
      .split(',')
      .map(s => resolveOperand(s.trim(), opt, values, selected, vars))
      .join('')
  }
  // Arithmetic expression — evaluate as number.
  if (HAS_ARITH.test(expr) && (expr.includes('@') || expr.includes('$'))) {
    return String(evalExpr(expr, values, selected, vars))
  }
  // ".data.x" — read against the candidate option, then evaluate the read
  // value if it is itself an expression (e.g. "$ZF_CNT_01 + $ZF_CNT_02").
  if (expr.startsWith('.')) {
    const raw = walkPath(opt, expr.slice(1).split('.'))
    if (
      (HAS_ARITH.test(raw) && (raw.includes('@') || raw.includes('$'))) ||
      raw.startsWith('$') || raw.startsWith('@') || raw.startsWith('&(')
    ) {
      return resolveOperand(raw, opt, values, selected, vars)
    }
    return raw
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
  const refOpt = selected[fieldName]
  if (!refOpt) return ''
  return walkPath(refOpt, path)
}

function walkPath(root: unknown, path: string[]): string {
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
    case 'C':
    case 'CONTAINS':
      return right !== '' && right.includes(left)
    // Negated contains. Was previously unhandled and fell through to the
    // `default` (contains) branch, evaluating as the *opposite* of intent —
    // which made self-referential filters (e.g. `@FIELD.value !C "X"`) flip an
    // option in/out across reconcile passes and never settle.
    case '!C':
    case 'DNCONTAINS':
      return !(right !== '' && right.includes(left))
    case '=':
    case 'E':
    case 'EQ':
    case 'EQUAL':
      return left === right
    case '!=':
    case 'NEQ':
    case 'NOT_EQUAL':
      return left !== right
    case 'B':
    case 'BW':
      return left !== '' && right.startsWith(left)
    case '!B':
    case 'DNBW':
      return !(left !== '' && right.startsWith(left))
    case 'EW':
      return left !== '' && right.endsWith(left)
    case '!E':
    case 'DNEW':
      return !(left !== '' && right.endsWith(left))
    case 'isEmpty':
      return left === ''
    case 'isNotEmpty':
      return left !== ''
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
    resolveOperand(rule.leftValue, opt, values, selected, vars),
    resolveOperand(rule.rightValue, opt, values, selected, vars)
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
