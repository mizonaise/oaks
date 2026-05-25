import type { SelectedMap, Values } from './types'

// Tiny expression evaluator.
// Supports: numbers, + - * /, parens,
//   @FIELD / @FIELD.data.x  (form values / selected option)
//   $VAR                    (flat variables)
//   round/floor/ceil/min/max/abs

type Token =
  | { kind: 'num'; v: number }
  | { kind: 'fieldRef'; v: string }
  | { kind: 'varRef'; v: string }
  | { kind: 'op'; v: '+' | '-' | '*' | '/' }
  | { kind: 'lp' }
  | { kind: 'rp' }
  | { kind: 'comma' }
  | { kind: 'fn'; v: string }

export type FlatVars = Record<string, unknown>

type Ctx = { values: Values; selected: SelectedMap; vars: FlatVars }

function tokenize (src: string): Token[] {
  const out: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (c === ' ' || c === '\t') { i++; continue }
    if (c === '(') { out.push({ kind: 'lp' }); i++; continue }
    if (c === ')') { out.push({ kind: 'rp' }); i++; continue }
    if (c === ',') { out.push({ kind: 'comma' }); i++; continue }
    if (c === '+' || c === '-' || c === '*' || c === '/') {
      out.push({ kind: 'op', v: c }); i++; continue
    }
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      out.push({ kind: 'num', v: Number(src.slice(i, j)) })
      i = j; continue
    }
    if (c === '@') {
      let j = i + 1
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j])) j++
      out.push({ kind: 'fieldRef', v: src.slice(i + 1, j) })
      i = j; continue
    }
    if (c === '$') {
      let j = i + 1
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j])) j++
      out.push({ kind: 'varRef', v: src.slice(i + 1, j) })
      i = j; continue
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++
      out.push({ kind: 'fn', v: src.slice(i, j) })
      i = j; continue
    }
    i++
  }
  return out
}

function toNumber (raw: unknown): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function readFieldRef (body: string, ctx: Ctx): number {
  const [name, ...path] = body.split('.')
  if (path.length === 0) return toNumber(ctx.values[name])
  const opt = ctx.selected[name]
  if (!opt) return 0
  let cur: unknown = opt
  for (const p of path) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return 0
  }
  return toNumber(cur)
}

function readVarRef (body: string, ctx: Ctx): number {
  // Dotted paths like A.B.C: try flat key first, then walk.
  const raw = ctx.vars[body]
  if (raw !== undefined) return toNumber(raw)
  const parts = body.split('.')
  let cur: unknown = ctx.vars
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return 0
  }
  return toNumber(cur)
}

function parseAddSub (tok: Token[], i: number, ctx: Ctx): [number, number] {
  let [left, j] = parseMulDiv(tok, i, ctx)
  while (j < tok.length) {
    const t = tok[j]
    if (t.kind !== 'op' || (t.v !== '+' && t.v !== '-')) break
    const [right, k] = parseMulDiv(tok, j + 1, ctx)
    left = t.v === '+' ? left + right : left - right
    j = k
  }
  return [left, j]
}

function parseMulDiv (tok: Token[], i: number, ctx: Ctx): [number, number] {
  let [left, j] = parseUnary(tok, i, ctx)
  while (j < tok.length) {
    const t = tok[j]
    if (t.kind !== 'op' || (t.v !== '*' && t.v !== '/')) break
    const [right, k] = parseUnary(tok, j + 1, ctx)
    left = t.v === '*' ? left * right : left / right
    j = k
  }
  return [left, j]
}

function parseUnary (tok: Token[], i: number, ctx: Ctx): [number, number] {
  const t = tok[i]
  if (t && t.kind === 'op' && (t.v === '+' || t.v === '-')) {
    const [v, j] = parseUnary(tok, i + 1, ctx)
    return [t.v === '-' ? -v : v, j]
  }
  return parsePrimary(tok, i, ctx)
}

function parsePrimary (tok: Token[], i: number, ctx: Ctx): [number, number] {
  const t = tok[i]
  if (!t) return [0, i]
  if (t.kind === 'num') return [t.v, i + 1]
  if (t.kind === 'fieldRef') return [readFieldRef(t.v, ctx), i + 1]
  if (t.kind === 'varRef') return [readVarRef(t.v, ctx), i + 1]
  if (t.kind === 'lp') {
    const [v, j] = parseAddSub(tok, i + 1, ctx)
    return [v, tok[j]?.kind === 'rp' ? j + 1 : j]
  }
  if (t.kind === 'fn' && tok[i + 1]?.kind === 'lp') {
    const args: number[] = []
    let j = i + 2
    if (tok[j]?.kind !== 'rp') {
      while (true) {
        const [v, k] = parseAddSub(tok, j, ctx)
        args.push(v)
        j = k
        if (tok[j]?.kind === 'comma') { j++; continue }
        break
      }
    }
    if (tok[j]?.kind === 'rp') j++
    return [applyFn(t.v, args), j]
  }
  return [0, i + 1]
}

function applyFn (name: string, args: number[]): number {
  switch (name.toLowerCase()) {
    case 'round': return Math.round(args[0] ?? 0)
    case 'floor': return Math.floor(args[0] ?? 0)
    case 'ceil': return Math.ceil(args[0] ?? 0)
    case 'abs': return Math.abs(args[0] ?? 0)
    case 'min': return Math.min(...args)
    case 'max': return Math.max(...args)
    default: return 0
  }
}

export function evalExpr (
  expr: string,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars = {}
): number {
  const tok = tokenize(expr)
  const [v] = parseAddSub(tok, 0, { values, selected, vars })
  return v
}

export function resolveBound (
  bound: string | undefined,
  values: Values,
  selected: SelectedMap,
  vars: FlatVars = {}
): number | undefined {
  if (bound === undefined || bound === '') return undefined
  if (/^-?\d+(?:\.\d+)?$/.test(bound)) return Number(bound)
  return evalExpr(bound, values, selected, vars)
}
