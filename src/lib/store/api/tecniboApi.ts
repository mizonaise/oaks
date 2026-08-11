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
/**
 * Item of the product listing: `GET /api/shape/product` →
 * `[{ id, articleId, configuratorId, pricing }]`. `id` is the product/shape
 * name used by `getShape` (`/api/shape/product/<id>`); `pricing` is the pricing
 * router name (with a leading `#`) or `null` when the product has none.
 */
export interface ProductListItem {
  id: string;
  articleId: string;
  configuratorId: string;
  pricing: string | null;
}

export interface ShapeResponse {
  form: ExportedConfigurator | null;
  pricing: string;
  shape: ShapeData;
}

/**
 * Response envelope of the products-config endpoint:
 * `GET /api/oaksome/products-config?template_id=<id>` →
 * `{ success, data: { id, form } }`. `data.form` holds the saved field values
 * for that template (e.g. `{ ZF_WIDTH: "3000", ZF_CNT: "5" }`), used to seed
 * the configurator's initial values.
 */
export interface ProductsConfigResponse {
  success: boolean;
  data: {
    id: number;
    form: Record<string, string | number>;
  } | null;
}

/**
 * Request/response for the pricing endpoint:
 * `POST /api/shape/pricing/<PRICING_NAME>` → `api.tecnibo.com/pricing/<PRICING_NAME>`.
 * The body mirrors the resolved variable scopes ({ globalVars, namespaces }),
 * with all values sent as strings (the pricing engine expects strings).
 */
export interface PricingRequest {
  globalVars: Record<string, string>;
  namespaces: Record<string, Record<string, string>>;
}

/**
 * Arguments for the pricing mutation: the resolved scopes (`body`) plus the
 * pricing router name to target (from the shape's `pricing` field, e.g.
 * `DS_PRICING_ROUNTER`, with any leading `#` already stripped).
 */
export interface PricingArgs {
  pricingName: string;
  body: PricingRequest;
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
 *
 * The endpoint answers an unknown name with a `200` carrying `null` rather than
 * a 404, and individual fields may be absent, so treat everything as optional
 * and normalize in `toMatSurf`.
 */
interface RpEngineMatSurf {
  NAME?: string | null;
  TEXT?: string | null;
  THK?: number | null;
  GRAIN?: number | null;
  RENDER?: string | null;
  MATCAT?: string;
  SURFCAT?: string;
}

/**
 * Normalized material/surface shape consumed by `resolveCp`. Every field is
 * nullable: the rp-engine returns `null` (not a 404) for a name it doesn't know,
 * and known records can still omit `RENDER` (no texture) or `THK`. `resolveCp`
 * already falls back per field, so a partial record degrades to "no texture" /
 * "zero thickness" rather than failing the whole render.
 */
export interface MatSurfData {
  name: string | null;
  render: string | null;
  thickness: number;
}

const toMatSurf = (r: RpEngineMatSurf | null): MatSurfData => ({
  name: r?.NAME ?? null,
  render: r?.RENDER ?? null,
  // Guard against a non-numeric/absent THK so the sum in `resolveCp` can't
  // become NaN and poison the panel geometry.
  thickness: typeof r?.THK === "number" && Number.isFinite(r.THK) ? r.THK : 0,
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

    // → api.tecnibo.com/product
    // Lists every available product/shape (id, article, configurator, pricing).
    getProducts: builder.query<ProductListItem[], void>({
      query: () => `/api/shape/product`,
    }),

    // → api.tecnibo.com/shape/<SHAPE_NAME>
    // Single endpoint returning the shape, its exported configurator form
    // (`{ configurator, sources }` or `null`) and pricing in one payload.
    getShape: builder.query<ShapeResponse, string>({
      query: (shapeName) => `/api/shape/product/${shapeName}`,
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

    // → www.tecnibo.com/api/oaksome/products-config?template_id=<id>
    // Saved form values for a template, used to seed the configurator's initial
    // values. Returns them flattened to strings (the endpoint mixes strings and
    // numbers, e.g. `ZF_MODULE: 1`, while the form seed expects strings) and
    // `{}` when the template has no saved config.
    getProductsConfig: builder.query<Record<string, string>, string>({
      query: (templateId) =>
        `/api/oaksome/products-config?template_id=${templateId}`,
      transformResponse: (r: ProductsConfigResponse) => {
        const form = r?.data?.form;
        if (!form) return {};
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(form)) {
          if (v === null || v === undefined) continue;
          out[k] = String(v);
        }
        return out;
      },
    }),

    // → api.tecnibo.com/pricing/<PRICING_NAME>
    // Computes the total price from the resolved variable scopes. The pricing
    // router name comes from the shape's `pricing` field (leading `#` stripped).
    getPricing: builder.mutation<PricingResponse, PricingArgs>({
      query: ({ pricingName, body }) => ({
        url: `/api/shape/pricing/${pricingName}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
  }),
});

export const {
  useGetArticleQuery,
  useGetProductsQuery,
  useGetProductsConfigQuery,
  useGetShapeQuery,
  useGetMaterialQuery,
  useGetSurfaceQuery,
  useGetMaterialDataQuery,
  useGetSurfaceDataQuery,
  useGetPricingMutation,
} = tecniboApi;
