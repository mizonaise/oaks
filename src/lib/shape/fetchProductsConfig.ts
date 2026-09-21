import type { ProductsConfigResponse } from '@/lib/store/api/tecniboApi'

/**
 * Server-side base URL of the oaksome products-config API (www.tecnibo.com).
 * Mirrors `SHAPE_API` in `fetchShape`: a non-public var preferred, falling back
 * to the public one so an environment defining only the old name keeps working.
 */
const OAKSOME_API =
  process.env.OAKSOME_API ?? process.env.NEXT_PUBLIC_OAKSOME_API

/**
 * Fetches a template's saved form values server-side, the SSR counterpart of
 * the `getProductsConfig` RTK Query endpoint. The page awaits it and passes the
 * result to `ShapeConfigurator` as `initialValues`, so the form has its seeds on
 * its very first render — it seeds itself once and ignores the prop afterwards,
 * which a client-side fetch is always too late for.
 *
 * Returns `{}` rather than throwing when the template is missing or the request
 * fails: an unseeded form still works (it falls back to the shape's own
 * defaults), so a bad `?id=` should not take the whole page down.
 *
 * The rewrite in `next.config.ts` is not usable here: rewrites only apply to
 * requests reaching the Next.js server from a client, not to `fetch` calls made
 * during a server render.
 */
export async function fetchProductsConfig (
  templateId: string
): Promise<Record<string, string>> {
  if (!OAKSOME_API) {
    throw new Error(
      'OAKSOME_API is not configured; cannot fetch the template config server-side.'
    )
  }

  const res = await fetch(
    `${OAKSOME_API}/products-config?template_id=${encodeURIComponent(templateId)}`,
    {
      headers: { Accept: 'application/json' },
      // Match the shape fetch: always hit the upstream, so an edited template
      // shows up on the next reload.
      cache: 'no-store'
    }
  )

  if (!res.ok) return {}

  const body = (await res.json()) as ProductsConfigResponse
  const form = body?.data?.form
  if (!form) return {}

  // Same normalization as the RTK Query `transformResponse`: the form takes
  // strings, and nulls mean "not set" rather than the literal "null".
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(form)) {
    if (v === null || v === undefined) continue
    out[k] = String(v)
  }
  return out
}
