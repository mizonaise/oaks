/**
 * Type definitions for the shape (3D) schema.
 * Mirrors the shape of `shape` exported from `src/data/shapeF.ts`.
 */

export type ZoneNode = {
  index?: string
  name?: string
  divDir?: 'H' | 'V' | 'I' | 'A' | string
  horDefType?: 'W' | 'D' | 'P' | string
  divElem?: number
  linDiv?: string
  divider?: string | null
  grtx?: Record<string, string>
  // Set on a container node; articles below it face this direction.
  clickable?: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | string
  children?: ZoneNode[]
  top?: string | null
  bottom?: string | null
  sides?: Record<string, SidePart | null>
}

export type SidePart = {
  inSet?: number
  inSetFor?: string
  partType?: string
  cpName?: string | null
}

export type CompositePanel = {
  mat?: string
  surf?: string
}

export type DescriptorRule = {
  leftValue?: string
  rightValue?: string
  comparison?: string
  comparaison?: string
}

export type DescriptorRuleGroup = {
  operator?: 'AND' | 'OR'
  roles?: DescriptorRule[]
}

export type DescriptorBranch = {
  action?: string
  nodenum?: number
  roles?: DescriptorRuleGroup[]
}

export type ShapeData = {
  width?: unknown
  depth?: unknown
  height?: unknown
  zone?: unknown
  descriptors?: Record<string, DescriptorBranch[]>
  cps?: Record<string, CompositePanel>
}
