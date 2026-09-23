import { evalExpr, type FlatVars } from './expr'

const REF = /[@$]/

/**
 * Resolves expression strings in a flat variables map.
 *
 * Strategy: keep two buckets — `resolved` (no remaining refs) and `pending`
 * (string expressions still containing `$`/`@`). Each pass, evaluate each
 * pending expression against `resolved` only. If the result has no remaining
 * refs, move it to `resolved`; otherwise leave it pending for the next pass.
 *
 * This avoids the trap of feeding a half-resolved expression into another
 * expression — `evalExpr` would `Number("$X") → NaN → 0`, silently producing
 * a wrong scalar that then propagates.
 *
 * Loops at most `maxIterations` times. Anything still pending at the end
 * (cycle or unknown ref) is written back as-is.
 */
export function resolveVariables (
  flat: FlatVars,
  maxIterations = 20
): FlatVars {
  const resolved: FlatVars = {}
  const pending: Record<string, string> = {}

  for (const k in flat) {
    const v = flat[k]
    // Spec strings (`a mm : b mm : …`) are passed through verbatim: they are
    // parsed later by `parseLinDiv`, and `evalExpr` would collapse them to a
    // single number. See {@link isSpecString}.
    if (typeof v === 'string' && REF.test(v) && !isSpecString(v)) pending[k] = v
    else resolved[k] = v
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    let progress = false
    for (const k in pending) {
      const expr = pending[k]
      // Only evaluate if every $-ref this expression depends on is already resolved.
      // Otherwise evalExpr would read undefined and treat it as 0.
      if (!allDepsResolved(expr, resolved)) continue
      // Pure `$REF` (single token) → pass through the value as-is so
      // non-numeric strings like material names survive. evalExpr always
      // returns a number and would clobber them to 0.
      const pure = /^\s*\$([A-Za-z_][A-Za-z0-9_.]*)\s*$/.exec(expr)
      if (pure) {
        resolved[k] = resolved[pure[1]]
      } else {
        const n = evalExpr(expr, {}, {}, resolved)
        resolved[k] = String(n)
      }
      delete pending[k]
      progress = true
    }
    if (!progress) break
  }

  // Anything still pending stays as its original expression string.
  for (const k in pending) resolved[k] = pending[k]
  return resolved
}

/**
 * True when a string is a layout *spec* rather than an arithmetic expression.
 *
 * `evalExpr` only ever yields a single number, so running it over a spec
 * destroys it: `"($A*(1-$F))+($F*$W)mm : ($B*…)mm : …"` evaluates its first
 * term and stops at the `:` its tokenizer doesn't know, collapsing ten slices
 * to `"1"`. Such values are consumed verbatim by `parseLinDiv` (which does
 * understand `:` and `mm`), so they must survive resolution untouched.
 *
 * A spec is recognised by a `:` outside parentheses, or a trailing `mm`.
 */
function isSpecString (expr: string): boolean {
  if (/(\s*mm)+\s*$/i.test(expr)) return true
  // Conditional-unit form `…mm(<cond>)`, see parseLinDiv.
  if (/\bmm\s*\([^)]*\)\s*$/i.test(expr)) return true
  let depth = 0
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i]
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (c === ':' && depth === 0) return true
  }
  return false
}

function allDepsResolved (expr: string, resolved: FlatVars): boolean {
  const re = /\$([A-Za-z_][A-Za-z0-9_.]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(expr)) !== null) {
    if (!(m[1] in resolved)) return false
  }
  return true
}
