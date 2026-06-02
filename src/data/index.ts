import type { FormNode } from '@/lib/form/schema'

import * as u from './u'
import * as f from './f'
import * as cmb from './cmb'

/**
 * A configurator dataset: the form schema, the shape definition, and the
 * exported configurator JSON. Each `src/data/<id>` directory exports these
 * under the same names but with structurally different literal shapes, so the
 * registry types them against what consumers actually read rather than any one
 * dataset's literal. `shape` is registered via `setShapeData` (accepts unknown)
 * and `formExpo` is cast to `ExportedConfigurator` at the use site, so both are
 * left loose here.
 */
export interface Dataset {
  form: FormNode
  shape: {
    width?: unknown
    depth?: unknown
    height?: unknown
    zone?: unknown
    variables?: Record<string, unknown>
    [key: string]: unknown
  }
  formExpo: unknown
}

export const datasets = {
  U: { form: u.form, shape: u.shape, formExpo: u.formExpo },
  F: { form: f.form, shape: f.shape, formExpo: f.formExpo },
  CMB: { form: cmb.form, shape: cmb.shape, formExpo: cmb.formExpo }
} satisfies Record<string, Dataset>

export type DatasetId = keyof typeof datasets

export const datasetIds = Object.keys(datasets) as DatasetId[]

export function getDataset (id: string): Dataset | undefined {
  return (datasets as Record<string, Dataset>)[id]
}

/** The shape's declared name, if any, for display in lists. */
export function getDatasetName (id: DatasetId): string | undefined {
  const name = datasets[id].shape.name
  return typeof name === 'string' ? name : undefined
}

/** Summary rows for listing every available shape (e.g. the landing page). */
export const datasetList = datasetIds.map(id => ({
  id,
  name: getDatasetName(id) ?? id
}))
