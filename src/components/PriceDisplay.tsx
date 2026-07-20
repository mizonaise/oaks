'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import type { ShapeData } from '@/lib/shape/schema'
import { computeZoneSizes } from '@/lib/shape/xmlExport'
import {
  useGetPricingMutation,
  type PricingRequest
} from '@/lib/store/api/tecniboApi'

/** The resolved variable scopes as produced by `ShapeConfigurator`. */
export interface Scopes {
  globalVars: FlatVars
  namespaces: Record<string, FlatVars>
}

/**
 * Stringify every value in a flat var map, dropping `undefined`/`null` (the
 * pricing engine expects string values, matching the sample request body).
 */
function stringifyVars (vars: FlatVars): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k in vars) {
    const v = vars[k]
    if (v === undefined || v === null) continue
    out[k] = String(v)
  }
  return out
}

export function toPricingRequest (
  scopes: Scopes,
  shape: ShapeData
): PricingRequest {
  // Article dimensions per zone, derived from the shape tree the same way the
  // XML export does (width/depth/height, with the facing-based axis swap).
  const zoneSizes = computeZoneSizes(shape, scopes)

  // if (process.env.NODE_ENV !== 'production') {
  //   console.log('[pricing] zoneSizes', zoneSizes)
  // }

  const namespaces: Record<string, Record<string, string>> = {}
  for (const name in scopes.namespaces) {
    const size = zoneSizes[name]
    // Skip zones without valid dimensions: no computed size, or any of
    // width/depth/height missing or zero. Those can't be priced.
    if (
      !size ||
      !size.ART_SIZEX ||
      !size.ART_SIZEY ||
      !size.ART_SIZEZ
    ) {
      continue
    }
    namespaces[name] = {
      ...stringifyVars(scopes.namespaces[name]),
      // Inject the computed ART_SIZEX/Y/Z (overriding any stale values).
      ART_SIZEX: String(size.ART_SIZEX),
      ART_SIZEY: String(size.ART_SIZEY),
      ART_SIZEZ: String(size.ART_SIZEZ)
    }
  }
  return { globalVars: stringifyVars(scopes.globalVars), namespaces }
}

const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
})

/**
 * Price banner shown at the top of the form. Recomputes the total via the
 * pricing endpoint whenever the resolved scopes change (debounced), so the
 * displayed price tracks the user's edits.
 */
export function PriceDisplay ({
  scopes,
  shape,
  pricingName
}: {
  scopes: Scopes
  shape: ShapeData
  /** Pricing router name from the shape (leading `#` already stripped). */
  pricingName: string
}) {
  const [getPricing, { data, isLoading, isError }] = useGetPricingMutation()

  // Keep the last successfully computed total so the price doesn't flash to a
  // spinner on every recompute.
  const [lastTotal, setLastTotal] = useState<number | null>(null)

  const request = useMemo(
    () => toPricingRequest(scopes, shape),
    [scopes, shape]
  )

  // Serialize the body so we only refetch when it actually changes (the memo
  // above mints a fresh object each render).
  const requestKey = useMemo(() => JSON.stringify(request), [request])

  const latestRequest = useRef(request)
  latestRequest.current = request

  useEffect(() => {
    // Debounce: the form emits variable changes in bursts.
    const t = setTimeout(() => {
      void getPricing({ pricingName, body: latestRequest.current })
        .unwrap()
        .then(res => setLastTotal(res.totalPrice))
        .catch(() => {
          /* handled via isError below */
        })
    }, 400)
    return () => clearTimeout(t)
  }, [requestKey, getPricing, pricingName])

  const total = data?.totalPrice ?? lastTotal
  const showSpinner = isLoading && total === null

  // Non-null, non-zero descriptor totals shown in the price-details tooltip,
  // grouped by comment (prices summed) so a comment appears once.
  const details = useMemo(() => {
    const totals = data?.descriptorTotals
    if (!totals) return []
    const byComment = new Map<string, number>()
    for (const d of Object.values(totals)) {
      if (d.price == null || d.price === 0) continue
      byComment.set(d.comment, (byComment.get(d.comment) ?? 0) + d.price)
    }
    return [...byComment].map(([comment, price]) => ({ comment, price }))
  }, [data])

  return (
    <section className='mb-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
      <div className='flex items-baseline justify-between gap-3'>
        <div>
          <div className='flex items-center gap-1'>
            <h3 className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
              Total price
            </h3>
            {details.length > 0 && (
              <span className='group relative inline-flex'>
                <button
                  type='button'
                  aria-label='Price details'
                  className='flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-semibold text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
                >
                  i
                </button>
                <div className='pointer-events-none absolute left-0 top-full z-10 mt-1 w-max min-w-40 rounded-md border border-zinc-200 bg-white p-2 text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-zinc-800 dark:bg-zinc-900'>
                  <dl className='space-y-1'>
                    {details.map(d => (
                      <div
                        key={d.comment}
                        className='flex justify-between gap-4'
                      >
                        <dt className='text-zinc-500 dark:text-zinc-400'>
                          {d.comment}
                        </dt>
                        <dd className='tabular-nums font-medium text-zinc-900 dark:text-zinc-100'>
                          {euro.format(d.price)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </span>
            )}
          </div>
          {isError && total === null ? (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
              Price unavailable
            </p>
          ) : showSpinner ? (
            <p className='mt-1 text-sm text-zinc-400'>Calculating…</p>
          ) : (
            <p className='mt-0.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100'>
              {total === null ? '—' : euro.format(total)}
            </p>
          )}
        </div>
        {isLoading && total !== null && (
          <span
            className='h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent dark:border-zinc-600'
            aria-label='Updating price'
          />
        )}
      </div>
    </section>
  )
}
