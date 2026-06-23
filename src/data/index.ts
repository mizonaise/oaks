import type { FormNode } from "@/lib/form/schema";

import * as u from "./u";
import * as f from "./f";
import * as l from "./l";
import * as cmb from "./cmb";

/**
 * Maps each dataset key to its remote identifiers:
 *  - `name`    → shape name for `GET https://api.tecnibo.com/shape/<name>`
 *  - `form.id` → form id for the configurator `/tree` endpoint
 */
export const shapes = {
  f: {
    name: "OAKSOME_SHAPE_FR",
    form: {
      id: "107",
      name: "Shape_F_V07",
      version: "1.0.0",
    },
  },
  l: {
    name: "OAKSOME_SHAPE_L",
    form: {
      id: "130",
      name: "Shape_L_V02",
      version: "1.0.0",
    },
  },
  u: {
    name: "OAKSOME_SHAPE_U",
    form: {
      id: "114",
      name: "Shape_U_V05",
      version: "1.0.0",
    },
  },
  cmb: {
    name: "OAKSOME_SHAPE_CMB_1111",
    form: {
      id: "121",
      name: "Shape_CMB_V03",
      version: "1.0.0",
    },
  },

  cmbos: {
    name: "OS_SHAPE_CMB_1111",
    form: {
      id: "135",
      name: "OS_SHAPE_CMB_1111",
      version: "1.0.0",
    },
  },
};

export type ShapeKey = keyof typeof shapes;

/** Remote identifiers for a shape: its shape name and form id. */
export interface ShapeRefs {
  /** Shape name for `GET https://api.tecnibo.com/shape/<name>`. */
  shapeName: string;
  /** Form id for the configurator `/tree` endpoint. */
  formId: string;
}

/**
 * Resolve a dataset id (e.g. "F", "L") or shape key (e.g. "f", "l") to its
 * remote shape name and form id. Returns undefined for unknown ids.
 */
export function getShapeRefs(id: string): ShapeRefs | undefined {
  const key = id.toLowerCase() as ShapeKey;
  const entry = shapes[key];
  if (!entry) return undefined;
  return { shapeName: entry.name, formId: entry.form.id };
}

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
  form: FormNode;
  shape: {
    width?: unknown;
    depth?: unknown;
    height?: unknown;
    zone?: unknown;
    variables?: Record<string, unknown>;
    [key: string]: unknown;
  };
  formExpo: unknown;
}

export const datasets = {
  U: { form: u.form, shape: u.shape, formExpo: u.formExpo },
  F: { form: f.form, shape: f.shape, formExpo: f.formExpo },
  L: { form: l.form, shape: l.shape, formExpo: l.formExpo },
  CMB: { form: cmb.form, shape: cmb.shape, formExpo: cmb.formExpo },
  CMBT: { form: cmb.form, shape: cmb.shape, formExpo: cmb.formExpo },
} satisfies Record<string, Dataset>;

export type DatasetId = keyof typeof datasets;

export const datasetIds = Object.keys(datasets) as DatasetId[];

export function getDataset(id: string): Dataset | undefined {
  return (datasets as Record<string, Dataset>)[id];
}

/** The shape's declared name, if any, for display in lists. */
export function getDatasetName(id: DatasetId): string | undefined {
  const name = datasets[id].shape.name;
  return typeof name === "string" ? name : undefined;
}

/** Summary rows for listing every available shape (e.g. the landing page). */
// export const datasetList = datasetIds.map((id) => ({
//   id,
//   name: getDatasetName(id) ?? id,
// }));
