/**
 * Type definitions for the form schema (FormNode tree + supporting types).
 * Mirrors the shape of `form` exported from `src/data/shapeF.ts`.
 */

export type Option = {
  value: string
  label: string
  data?: Record<string, unknown>
}

export type FilterRule = {
  leftValue: string
  rightValue: string
  comparison?: string
  comparaison?: string
}

export type FilterRuleGroup = {
  operator: 'AND' | 'OR'
  roles: FilterRule[]
}

export type FilterGroup = { roles: FilterRuleGroup[] }

export type Dependency = {
  action: 'SHOW' | 'HIDE'
  roles: FilterRuleGroup[]
}

export type Variable = { name: string; path: string }

type SectionBase = {
  render: 'SECTION'
  name: string
  label: string
  defaultValue?: string
  children: FormNode[]
  dependencies?: Dependency[]
}

export type FormNode =
  | (SectionBase & { type: 'TAB' })
  | (SectionBase & { type: 'NONE' })
  | (SectionBase & { type: 'ACCORDION' })
  | {
      type: 'COMBO'
      render: 'FIELD'
      name: string
      label: string
      defaultValue?: string
      autofill?: boolean
      options?: Option[]
      filters?: FilterGroup[]
      dependencies?: Dependency[]
      variables?: Variable[]
    }
  | {
      type: 'INPUT'
      render: 'FIELD'
      name: string
      label: string
      defaultValue?: string
      min?: string
      max?: string
      dependencies?: Dependency[]
      variables?: Variable[]
    }
