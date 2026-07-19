import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ArticleData,
  DataEndpointMap,
} from "@processandtools/rp-article-designer";
import type { ExportedConfigurator } from "@oak-some/configurator-previewer";
import type { ShapeData } from "@/lib/shape/schema";

/**
 * Response envelope of the shape endpoint:
 * `GET /api/shape/shape/<SHAPE_NAME>` → `{ form, pricing, shape }`.
 * `form` is the exported configurator (`{ configurator, sources }`) or `null`
 * when the article has no attached form.
 */
export interface ShapeResponse {
  form: ExportedConfigurator | null;
  pricing: string;
  shape: ShapeData;
}

/**
 * Request/response for the pricing endpoint:
 * `POST /api/shape/pricing` → `api.tecnibo.com/pricing`.
 * The body mirrors the resolved variable scopes ({ globalVars, namespaces }),
 * with all values sent as strings (the pricing engine expects strings).
 */
export interface PricingRequest {
  globalVars: Record<string, string>;
  namespaces: Record<string, Record<string, string>>;
}

export interface PricingBreakdownItem {
  pricingKey: string;
  namespaceName: string;
  nodenum: number;
  expression: string;
  amount: number;
}

/** Per-descriptor total, keyed by descriptor id (e.g. `DS_PRICING_MAT_CC`). */
export interface DescriptorTotal {
  comment: string;
  price: number;
}

export interface PricingResponse {
  totalPrice: number;
  descriptorTotals: Record<string, DescriptorTotal>;
  breakdown: PricingBreakdownItem[];
}

/**
 * Raw rp-engine material/surface record, e.g.
 * `GET /api/rp-engine/material-data/<NAME>` →
 * `{ NAME, TEXT, THK, MATCAT | SURFCAT, GRAIN, RENDER }`.
 */
interface RpEngineMatSurf {
  NAME: string;
  TEXT: string;
  THK: number;
  GRAIN: number;
  RENDER: string;
  MATCAT?: string;
  SURFCAT?: string;
}

/** Normalized material/surface shape consumed by `resolveCp`. */
export interface MatSurfData {
  name: string;
  render: string;
  thickness: number;
}

const toMatSurf = (r: RpEngineMatSurf): MatSurfData => ({
  name: r.NAME,
  render: r.RENDER,
  thickness: r.THK,
});

/**
 * RTK Query API for the Tecnibo backends. Resources:
 *  - article / material / surface: rp-engine data (per name)
 *  - shape:   shape definition (by remote shape name, e.g. OAKSOME_SHAPE_L)
 *  - form:    configurator tree (by form id, e.g. 107)
 *
 * Requests go through same-origin proxy paths configured as Next.js rewrites
 * (see `next.config.ts`), so the upstream hosts stay server-side and CORS
 * is avoided:
 *  - `/api/shape/*`     → NEXT_PUBLIC_SHAPE_API     (api.tecnibo.com)
 *  - `/api/rp-engine/*` → NEXT_PUBLIC_RPENGINE_API  (backend.tecnibo.com)
 *  - `/api/form-expo/*` → NEXT_PUBLIC_FORMEXPO_API  (backend.tecnibo.com)
 */
export const tecniboApi = createApi({
  reducerPath: "tecniboApi",
  baseQuery: fetchBaseQuery({
    headers: { Accept: "application/json" },
  }),
  endpoints: (builder) => ({
    // → backend.tecnibo.com/api/rp-engine/article-data/<name>?forcerefresh=true
    getArticle: builder.query<ArticleData, string>({
      query: (articleName) => ({
        url: `/api/rp-engine/article-data/${articleName}?forcerefresh=true`,
        // The legacy fetch used cache: 'no-store'; mirror it here.
        cache: "no-store",
      }),
    }),

    // → api.tecnibo.com/shape/<SHAPE_NAME>
    // Single endpoint returning the shape, its exported configurator form
    // (`{ configurator, sources }` or `null`) and pricing in one payload.
    getShape: builder.query<ShapeResponse, string>({
      query: (shapeName) => `/api/shape/shape/${shapeName}`,
    }),

    // → backend.tecnibo.com/api/rp-engine/material-data/<name>
    getMaterial: builder.query<MatSurfData, string>({
      query: (materialName) => `/api/rp-engine/material-data/${materialName}`,
      transformResponse: toMatSurf,
    }),

    // → backend.tecnibo.com/api/rp-engine/surface-data/<name>
    getSurface: builder.query<MatSurfData, string>({
      query: (surfaceName) => `/api/rp-engine/surface-data/${surfaceName}`,
      transformResponse: toMatSurf,
    }),

    // Raw rp-engine records for the article designer's `getData` loader, which
    // expects the untransformed shape (MaterialTypes/SurfaceTypes, uppercase
    // keys) — unlike getMaterial/getSurface above, which normalize for
    // resolveCp. Keyed by endpoint+name so RTK Query dedupes/caches per record.
    getMaterialData: builder.query<DataEndpointMap["material-data"], string>({
      query: (name) => `/api/rp-engine/material-data/${name}`,
    }),
    getSurfaceData: builder.query<DataEndpointMap["surface-data"], string>({
      query: (name) => `/api/rp-engine/surface-data/${name}`,
    }),

    // → api.tecnibo.com/pricing
    // Computes the total price from the resolved variable scopes.
    getPricing: builder.mutation<PricingResponse, PricingRequest>({
      query: (body) => ({
        url: `/api/shape/pricing`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
  }),
});

export const {
  useGetArticleQuery,
  useGetShapeQuery,
  useGetMaterialQuery,
  useGetSurfaceQuery,
  useGetMaterialDataQuery,
  useGetSurfaceDataQuery,
  useGetPricingMutation,
} = tecniboApi;
