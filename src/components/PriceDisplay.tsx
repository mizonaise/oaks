'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import type { ShapeData } from '@/lib/shape/schema'
import { computeZoneSizes } from '@/lib/shape/xmlExport'
import {
  useGetPricingMutation,
  type PricingRequest,
  type PricingResponse
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
    if (!size || !size.ART_SIZEX || !size.ART_SIZEY || !size.ART_SIZEZ) {
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
 * Result of {@link usePricing}: the latest pricing response plus request
 * status. `data` is `undefined` until the first successful fetch. `request` is
 * the body that was (or is about to be) sent — it holds the resolved
 * per-namespace vars (namespace vars + injected `ART_SIZEX/Y/Z`) and
 * `globalVars`, used by {@link PriceBreakdown} to resolve expression variables.
 */
export interface UsePricingResult {
  data: PricingResponse | undefined
  request: PricingRequest
  isLoading: boolean
  isError: boolean
}

/**
 * Fetch the pricing response for the current scopes/shape, debounced so the
 * form's bursty variable edits collapse into a single request. Shared by the
 * top price banner ({@link PriceDisplay}) and the bottom breakdown
 * ({@link PriceBreakdown}) so the page only fetches once.
 */
export function usePricing (
  scopes: Scopes,
  shape: ShapeData,
  pricingName: string
): UsePricingResult {
  const [getPricing, { data, isLoading, isError }] = useGetPricingMutation()

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
        .catch(() => {
          /* handled via isError below */
        })
    }, 400)
    return () => clearTimeout(t)
  }, [requestKey, getPricing, pricingName])

  return { data, request, isLoading, isError }
}

/**
 * Price banner shown at the top of the form. Consumes a {@link usePricing}
 * result so the displayed total tracks the user's edits.
 */
export function PriceDisplay ({ pricing }: { pricing: UsePricingResult }) {
  const { data, isLoading, isError } = pricing

  // Keep the last successfully computed total so the price doesn't flash to a
  // spinner on every recompute.
  const [lastTotal, setLastTotal] = useState<number | null>(null)
  useEffect(() => {
    if (data) setLastTotal(data.totalPrice)
  }, [data])

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

  // Mobile: no card chrome — it sits over the canvas, so border/background
  // would box it in. From `lg` up it's a normal card in the form column.
  return (
    <section className='mb-4 rounded-lg p-4 lg:border lg:border-zinc-200 lg:bg-white lg:dark:border-zinc-800 lg:dark:bg-zinc-950'>
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

/** A variable referenced by a pricing expression, resolved to its value. */
interface ResolvedVar {
  name: string
  value: string | undefined
  /** Where the value came from: the item's namespace, global vars, or neither. */
  source: 'namespace' | 'global' | 'missing'
}

/** Extract the distinct `$VAR` names referenced by a pricing expression. */
function extractVarRefs (expr: string): string[] {
  const seen = new Set<string>()
  for (const m of expr.matchAll(/\$([A-Za-z0-9_.]+)/g)) seen.add(m[1])
  return [...seen]
}

/**
 * Resolve each variable referenced by `expr`: prefer the namespace's own vars
 * (which already include the injected `ART_SIZEX/Y/Z`), then fall back to the
 * global vars. Order follows first appearance in the expression.
 */
function resolveExprVars (
  expr: string,
  nsVars: Record<string, string> | undefined,
  globalVars: Record<string, string>
): ResolvedVar[] {
  return extractVarRefs(expr).map(name => {
    if (nsVars && name in nsVars) {
      return { name, value: nsVars[name], source: 'namespace' as const }
    }
    if (name in globalVars) {
      return { name, value: globalVars[name], source: 'global' as const }
    }
    return { name, value: undefined, source: 'missing' as const }
  })
}

/**
 * Detailed price breakdown shown at the bottom of the form (dev only). Groups
 * the pricing response's `breakdown` line items by `namespaceName` (zone) and
 * lists each item's raw `pricingKey`, `amount`, `expression`, and the variables
 * the expression references — resolved from the namespace's vars (incl.
 * `ART_SIZE*`) or, failing that, the global vars.
 */
export function PriceBreakdown ({ pricing }: { pricing: UsePricingResult }) {
  const { data, request } = pricing

  const zones = useMemo(() => {
    const items = data?.breakdown
    if (!items || items.length === 0) return []
    const globalVars = request.globalVars

    // namespace -> items, preserving first-seen order.
    const byZone = new Map<string, typeof items>()
    for (const it of items) {
      const lines = byZone.get(it.namespaceName)
      if (lines) lines.push(it)
      else byZone.set(it.namespaceName, [it])
    }

    return [...byZone].map(([namespace, lines]) => {
      const nsVars = request.namespaces[namespace]
      return {
        namespace,
        total: lines.reduce((s, it) => s + (it.amount ?? 0), 0),
        // All variables in this namespace (incl. injected ART_SIZE*), sorted.
        allVars: nsVars
          ? Object.keys(nsVars)
              .sort()
              .map(name => ({ name, value: nsVars[name] }))
          : [],
        lines: lines.map(it => ({
          item: it,
          vars: resolveExprVars(it.expression, nsVars, globalVars)
        }))
      }
    })
  }, [data, request])

  if (zones.length === 0) return null

  return (
    <div className='space-y-4'>
      {zones.map(zone => (
        <div key={zone.namespace}>
          <div className='mb-1 flex items-baseline justify-between gap-4 border-b border-zinc-100 pb-1 dark:border-zinc-800'>
            <h4 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
              {zone.namespace}
            </h4>
            <span className='tabular-nums text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
              {euro.format(zone.total)}
            </span>
          </div>
          {zone.allVars.length > 0 && (
            <details className='mb-2'>
              <summary className='cursor-pointer text-[11px] font-medium uppercase tracking-wide text-zinc-400 select-none'>
                Namespace variables ({zone.allVars.length})
              </summary>
              <dl className='mt-1 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800'>
                {zone.allVars.map(v => (
                  <div
                    key={v.name}
                    className='flex gap-2 font-mono text-[11px]'
                  >
                    <dt className='text-zinc-500 dark:text-zinc-400'>
                      {v.name}
                    </dt>
                    <dd className='ml-auto text-zinc-900 dark:text-zinc-100'>
                      {v.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
          <div className='space-y-2'>
            {zone.lines.map(({ item, vars }, i) => (
              <div
                key={`${item.pricingKey}-${i}`}
                className='text-xs text-zinc-600 dark:text-zinc-400'
              >
                <div className='font-medium text-zinc-900 dark:text-zinc-100'>
                  {item.pricingKey}
                </div>
                <div className='tabular-nums'>Amount: {item.amount}</div>
                {vars.length > 0 && (
                  <dl className='mt-1 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800'>
                    {vars.map(v => (
                      <div
                        key={v.name}
                        className='flex gap-2 font-mono text-[11px]'
                      >
                        <dt className='text-zinc-500 dark:text-zinc-400'>
                          {v.name}
                        </dt>
                        <dd
                          className={
                            v.source === 'missing'
                              ? 'text-red-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }
                        >
                          {v.source === 'missing' ? '—' : v.value}
                        </dd>
                        <dd className='ml-auto text-[10px] uppercase text-zinc-400'>
                          {v.source}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className='break-all font-mono text-[11px]'>
                  Expression: {item.expression}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
