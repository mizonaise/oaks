import type { ShapeResponse } from '@/lib/store/api/tecniboApi'

/**
 * Server-side base URL of the shape API (api.tecnibo.com). Deliberately NOT a
 * `NEXT_PUBLIC_` var: the shape is fetched during SSR, so the host must never
 * reach the browser — neither as a network request nor inlined in the bundle.
 * Falls back to the public var so an environment that only defines the old
 * name keeps working.
 */
const SHAPE_API = process.env.SHAPE_API ?? process.env.NEXT_PUBLIC_SHAPE_API

/**
 * Fetches a shape by its declared name (e.g. `OS_SHAPE_F`) directly from the
 * shape API, server-side. This is the SSR counterpart of the former
 * `getShape` RTK Query endpoint: the page awaits it and passes the payload to
 * `ShapeConfigurator`, so the browser issues no request for it at all.
 *
 * Returns `null` for a missing shape (404) so the caller can `notFound()`;
 * throws on any other failure so the error boundary shows a real error rather
 * than a misleading "unknown shape".
 *
 * The rewrite in `next.config.ts` is not usable here: rewrites only apply to
 * requests that actually reach the Next.js server from a client, not to
 * `fetch` calls made during a server render.
 *
 * Server-only: imported exclusively from Server Components. `SHAPE_API` has no
 * `NEXT_PUBLIC_` prefix, so it is `undefined` in a client bundle and this would
 * throw rather than quietly leak the host.
 */
export async function fetchShape (shapeName: string): Promise<ShapeResponse | null> {
  if (!SHAPE_API) {
    throw new Error(
      'SHAPE_API is not configured; cannot fetch the shape server-side.'
    )
  }

  const res = await fetch(
    `${SHAPE_API}/product/${encodeURIComponent(shapeName)}`,
    {
      headers: { Accept: 'application/json' },
      // Match the previous client-side behaviour: always hit the upstream, so
      // an edited shape shows up on the next reload.
      cache: 'no-store'
    }
  )

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(
      `Shape request failed for "${shapeName}": ${res.status} ${res.statusText}`
    )
  }

  return (await res.json()) as ShapeResponse
}
