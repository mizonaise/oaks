import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ArticleData,
  DataEndpointMap,
} from "@processandtools/rp-article-designer";
import type { ExportedConfigurator } from "@oak-some/configurator-previewer";
import type { ShapeData } from "@/lib/shape/schema";
import type {
  CountryPricingData,
  CountryPricingResponse,
} from "@/lib/pricing/countryPricing";

/**
 * Response envelope of the shape endpoint, fetched server-side by
 * `fetchShape` (`GET <SHAPE_API>/product/<SHAPE_NAME>` → `{ form, pricing, shape }`)
 * and passed to `ShapeConfigurator` as a prop, so it never becomes a browser
 * request.
 * `form` is the exported configurator (`{ configurator, sources }`) or `null`
 * when the article has no attached form.
 */
/**
 * Item of the product listing: `GET /api/shape/product` →
 * `[{ id, articleId, configuratorId, pricing }]`. `id` is the product/shape
 * name used by `fetchShape` (`<SHAPE_API>/product/<id>`); `pricing` is the pricing
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
  /**
   * The shape's article bundle, served inline with the shape. Present for some
   * products and an all-empty skeleton for others, so callers must check that
   * it actually holds entries before relying on it.
   */
  articles?: ArticleData | null;
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
export interface PricingNamespace {
  /** Article name (the zone's `GECA_ART_MAIN`), not the zone name. */
  name: string;
  vars: Record<string, string>;
}

export interface PricingRequest {
  /** ISO country code (lowercase, e.g. `be`) selecting the price list. */
  country: string;
  globalVars: Record<string, string>;
  namespaces: PricingNamespace[];
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

/** VAT rates (percent) applying to the priced configuration. */
export interface PricingTva {
  default_rate: number;
  reduced_rate: number;
}

/**
 * Active promotion. The top-level `promotion` carries the merged discount; the
 * one nested under `country` additionally lists the promotion `id`s that were
 * combined into it. Absent (or `null`) when no promotion applies.
 */
export interface PricingPromotion {
  /** Promotion ids merged into this discount (country-level only). */
  id?: number[];
  name: string;
  discount_pct: number;
  /** ISO dates (`YYYY-MM-DD`) bounding the promotion. */
  date_from: string;
  date_to: string;
}

/** The three headline figures: excl. VAT, and incl. VAT at either rate. */
export interface PricingPrices {
  price_ht: number;
  price_ttc_default: number;
  price_ttc_reduced: number;
}

/** Country-level pricing: the promotion/promo code applied and the resulting prices. */
export interface PricingCountry {
  promotion: PricingPromotion | null;
  code_promo: string | null;
  prices: PricingPrices;
}

export interface PricingResponse {
  /** The engine's own total. Superseded by the country endpoint's computed TTC
   *  (see `computeCountryPrice`), and kept as the fallback shown while that
   *  request is in flight. */
  totalPrice: number;
  /**
   * VAT/promotion/country blocks the engine used to return. It no longer sends
   * them — VAT rates and promotions now come from the oaksome country pricing
   * endpoint — so they are optional and every read must guard. Kept on the type
   * rather than deleted so an older deployment still type-checks.
   *
   * @deprecated Use the country endpoint via `usePricing().countryPrice`.
   */
  tva?: PricingTva;
  /** @deprecated See `tva`. */
  promotion?: PricingPromotion | null;
  prices?: PricingPrices;
  /** @deprecated See `tva`. */
  country?: PricingCountry;
  /**
   * Totals per human-readable category (e.g. `Carcase & Fittings`, `Handle`,
   * `Door`, `Pose`) — the price-details lines. Replaces the former
   * `descriptorTotals` map.
   */
  details: Record<string, number>;
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
  // Nuit du 22 au 23/09 (d5) : le rp-engine ne les renvoie PAS aujourd'hui (sa requête SQL ne
  // sélectionne pas la table RENDER au-delà de RENDER_MAT) — déclarés ici pour le jour où il
  // les exposera : SCALEFAKT = mm réels par répétition de la texture, ROTATION = son angle.
  SCALEFAKT?: number | null;
  ROTATION?: number | null;
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
  /** l'échelle vivante de la texture (mm par répétition), quand le rp-engine l'expose ; `null` sinon (aujourd'hui : toujours) */
  scalefakt: number | null;
}

const toMatSurf = (r: RpEngineMatSurf | null): MatSurfData => ({
  name: r?.NAME ?? null,
  render: r?.RENDER ?? null,
  // Guard against a non-numeric/absent THK so the sum in `resolveCp` can't
  // become NaN and poison the panel geometry.
  thickness: typeof r?.THK === "number" && Number.isFinite(r.THK) ? r.THK : 0,
  scalefakt:
    typeof r?.SCALEFAKT === "number" && Number.isFinite(r.SCALEFAKT) && r.SCALEFAKT > 0
      ? r.SCALEFAKT
      : null,
});

/**
 * RTK Query API for the Tecnibo backends. Resources:
 *  - article / material / surface: rp-engine data (per name)
 *  - form:    configurator tree (by form id, e.g. 107)
 *
 * The shape is NOT fetched here: it is loaded server-side by
 * `@/lib/shape/fetchShape` — which also carries the article bundle inline — so
 * its endpoint stays invisible to the browser.
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
    // Single article by name. The scene no longer uses this: its article bundle
    // arrives inline with the shape (`ShapeResponse.articles`).
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

    // → www.tecnibo.com/api/oaksome/pricing?country_code=<CC>&price_ht=<HT>
    // The country's VAT rates and active promotions. It returns no total: the
    // caller applies the promotions and VAT itself (see `computeCountryPrice`).
    // `price_ht` is part of the key because the promotion set can depend on the
    // amount, so it refetches when the configured price changes.
    getCountryPricing: builder.query<
      CountryPricingData | null,
      { countryCode: string; priceHt: number }
    >({
      query: ({ countryCode, priceHt }) =>
        `/api/oaksome/pricing?country_code=${encodeURIComponent(
          countryCode,
        )}&price_ht=${encodeURIComponent(priceHt.toFixed(2))}`,
      transformResponse: (r: CountryPricingResponse) => {
        if (!r?.success || !r.data) return null;
        // The endpoint omits `promotions` when there are none; normalize so
        // callers can iterate unconditionally.
        return { ...r.data, promotions: r.data.promotions ?? [] };
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
  useGetMaterialQuery,
  useGetSurfaceQuery,
  useGetMaterialDataQuery,
  useGetSurfaceDataQuery,
  useGetPricingMutation,
  useGetCountryPricingQuery,
} = tecniboApi;
