import type {
  CompositePanel,
  DescriptorBranch,
  ShapeData
} from './schema'

let descriptors: Record<string, DescriptorBranch[]> = {}
let cps: Record<string, CompositePanel> = {}

export function setShapeData (shape: ShapeData | unknown): void {
  const s = (shape ?? {}) as ShapeData
  descriptors = s.descriptors ?? {}
  cps = s.cps ?? {}
}

export function getDescriptors (): Record<string, DescriptorBranch[]> {
  return descriptors
}

export function getCps (): Record<string, CompositePanel> {
  return cps
}
