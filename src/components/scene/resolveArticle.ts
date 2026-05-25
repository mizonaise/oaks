import { shape as shapeData } from '@/data/shapeF'
import type { FlatVars } from '@/lib/form/expr'
import type { DescriptorBranch, ShapeData, ZoneNode } from '@/lib/shape/schema'

const descriptors: Record<string, DescriptorBranch[]> =
  (shapeData as ShapeData).descriptors ?? {}

/**
 * Resolves an article descriptor by matching its branches against the article
 * node's `grtx` map. Rules look like:
 *   { leftValue: "AD zone info01", comparison: "=", rightValue: "0" }
 * `leftValue` is a `grtx` key; `rightValue` is a literal or `$VAR` looked up
 * against `vars`. First matching branch wins.
 */
function resolveDescriptorWithGrtx (
  name: string,
  grtx: Record<string, string>,
  vars: FlatVars
): string | null {
  const branches = descriptors[name]
  if (!branches) return null

  const lookupGrtx = (key: string): string => {
    const raw = grtx[key]
    if (raw === undefined) return ''
    if (typeof raw === 'string' && raw.startsWith('$')) {
      const v = vars[raw.slice(1)]
      return v === undefined ? '' : String(v)
    }
    return String(raw)
  }

  const lookupRight = (raw: string | undefined): string => {
    if (raw === undefined) return ''
    if (raw.startsWith('$')) {
      const v = vars[raw.slice(1)]
      return v === undefined ? '' : String(v)
    }
    return raw
  }

  for (const branch of branches) {
    const groups = branch.roles ?? []
    const ok =
      groups.length === 0 ||
      groups.every(group => {
        const rules = group.roles ?? []
        if (rules.length === 0) return true
        const results = rules.map(rule => {
          const op = rule.comparison ?? rule.comparaison ?? '='
          const l = lookupGrtx(rule.leftValue ?? '')
          const r = lookupRight(rule.rightValue)
          switch (op) {
            case '=':
            case 'E': return l === r
            case '!=': return l !== r
            case '>': return Number(l) > Number(r)
            case '<': return Number(l) < Number(r)
            case '>=': return Number(l) >= Number(r)
            case '<=': return Number(l) <= Number(r)
            default: return l === r
          }
        })
        return group.operator === 'OR'
          ? results.some(Boolean)
          : results.every(Boolean)
      })
    if (ok) return branch.action ?? ''
  }
  return null
}

/**
 * Resolves a `divider` field on an article node to its concrete article name.
 *   divider: "$DS_WACA_FR_ART_07"    → vars["DS_WACA_FR_ART_07"]
 *   may itself be "#DS_WACA_U_ART_01" → descriptor lookup using node.grtx
 *   any other → returned as-is.
 */
export function resolveArticleName (
  node: ZoneNode,
  vars: FlatVars
): string | null {
  const divider = node.divider
  if (!divider) return null
  let value: string = divider
  if (divider.startsWith('$')) {
    const v = vars[divider.slice(1)]
    if (v === undefined) return null
    value = String(v)
  }
  if (value.startsWith('#')) {
    return resolveDescriptorWithGrtx(value.slice(1), node.grtx ?? {}, vars)
  }
  return value
}
