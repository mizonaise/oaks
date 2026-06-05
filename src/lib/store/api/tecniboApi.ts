import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ArticleData } from "@processandtools/rp-article-designer";
import type { ExportedConfigurator } from "@oak-some/configurator-previewer";
import type { ShapeData } from "@/lib/shape/schema";

/**
 * Response envelope of the shape endpoint:
 * `GET /api/shape/shape/<SHAPE_NAME>` → `{ shape: ShapeData }`.
 */
interface ShapeResponse {
  shape: ShapeData;
}

/**
 * RTK Query API for the Tecnibo backends. Three resources:
 *  - article: rp-engine article data (per article name)
 *  - shape:   shape definition (by remote shape name, e.g. OAKSOME_SHAPE_L)
 *  - form:    configurator tree (by form id, e.g. 107)
 *
 * Requests go through same-origin proxy paths configured as Next.js rewrites
 * (see `next.config.ts`), so the two upstream hosts stay server-side and CORS
 * is avoided:
 *  - `/api/shape/*`   → NEXT_PUBLIC_SHAPE_API   (api.tecnibo.com)
 *  - `/api/backend/*` → NEXT_PUBLIC_BACKEND_API (backend.tecnibo.com)
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
        url: `/api/article/${articleName}?forcerefresh=true`,
        // The legacy fetch used cache: 'no-store'; mirror it here.
        cache: "no-store",
      }),
    }),

    // → api.tecnibo.com/shape/<SHAPE_NAME>
    getShape: builder.query<ShapeData, string>({
      query: (shapeName) => `/api/shape/shape/${shapeName}`,
      transformResponse: (response: ShapeResponse) => response.shape,
    }),

    // → backend.tecnibo.com/digitalfactory/oaksome-api/api/configurator/<formId>/tree
    // Returns the ExportedConfigurator JSON consumed directly by
    // ConfiguratorPreviewDialog (as `formExpo`).
    getFormExpo: builder.query<
      { message: string; data: ExportedConfigurator },
      string
    >({
      query: (formId) => ({
        url: `/api/form-expo/${formId}/export`,
        // headers: {
        //   "X-Service-Token":
        //     "215440b1bc77e95bcd39ca011d50fdec994edd3a5284abab065dd642ad2ae1cd",
        // },
      }),
    }),
  }),
});

export const { useGetArticleQuery, useGetShapeQuery, useGetFormExpoQuery } =
  tecniboApi;
