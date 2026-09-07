'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import type { ShapeData } from '@/lib/shape/schema'
import { computeShapeBounds, computeZoneSizes } from '@/lib/shape/xmlExport'
import {
  useGetPricingMutation,
  type PricingNamespace,
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

  // The shape itself is priced as an article too: named by the shape's own
  // name, sized from its overall bounds, carrying the global vars.
  const bounds = computeShapeBounds(shape, scopes)
  // One entry per zone, but named by the zone's article (`GECA_ART_MAIN`)
  // rather than the zone name — the pricing engine keys on articles.
  const namespaces: PricingNamespace[] = []
  for (const zone in scopes.namespaces) {
    const size = zoneSizes[zone]
    // Skip zones without valid dimensions: no computed size, or any of
    // width/depth/height missing or zero. Those can't be priced.
    if (!size || !size.ART_SIZEX || !size.ART_SIZEY || !size.ART_SIZEZ) {
      continue
    }
    const vars = stringifyVars(scopes.namespaces[zone])
    const name = vars.GECA_ART_MAIN
    // No article on this zone: nothing to price.
    if (!name) continue
    namespaces.push({
      name,
      vars: {
        ...vars,
        // Inject the computed ART_SIZEX/Y/Z (overriding any stale values).
        ART_SIZEX: String(size.ART_SIZEX),
        ART_SIZEY: String(size.ART_SIZEY),
        ART_SIZEZ: String(size.ART_SIZEZ)
      }
    })
  }
  const globalVars = stringifyVars(scopes.globalVars)
  const shapeName = shape.name
  if (shapeName) {
    namespaces.unshift({
      name: shapeName,
      vars: {
        ...globalVars,
        ART_SIZEX: String(bounds.w),
        ART_SIZEY: String(bounds.h),
        ART_SIZEZ: String(bounds.d)
      }
    })
  }
  return { globalVars, namespaces }
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

  // Styling follows the Stoëmp kit's Price bar (`.cfg-prix`, 4346:20901):
  // the amount in Yet Grotesk 700 30/32 Dark Green, a Question Box beside it
  // for the breakdown, and the struck-through/promo Tag XXS row underneath.
  // On mobile the bar goes translucent + blurred over the viewer; from `lg`
  // up it's the white, drop-shadowed bar of the desktop panel.
  return (
    <header className='k-prix mb-4'>
      <div className='flex flex-col gap-2'>
        <div className='k-prix-val'>
          {isError && total === null ? (
            <span className='k-cap' style={{ color: 'var(--beige-fonce)' }}>
              Price unavailable
            </span>
          ) : showSpinner ? (
            <span className='k-cap' style={{ color: 'var(--beige-fonce)' }}>
              Calculating…
            </span>
          ) : (
            <span className='k-cap tabular-nums'>
              {total === null ? '—' : euro.format(total)}
            </span>
          )}
          {details.length > 0 && (
            <span className='group k-qbox'>
              <QBoxIcon />
              {/* Tooltip: not drawn in the Figma — the kit's own `.k-qbox`
                  proposal (black bubble, Yet Grotesk 500 14/18 white). */}
              <span
                className='pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-20 w-max max-w-[260px] rounded-[5px] px-3 py-2.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100'
                style={{
                  background: 'var(--noir)',
                  color: 'var(--blanc)',
                  font: '500 14px/18px var(--font-titre)'
                }}
              >
                <span className='k-lignes'>
                  {details.map(d => (
                    <span key={d.comment} className='k-ligne-tete'>
                      <span style={{ color: 'var(--blanc)' }}>{d.comment}</span>
                      <span className='tabular-nums' style={{ color: 'var(--vert-flash)' }}>
                        {euro.format(d.price)}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {isLoading && total !== null && (
            <span
              className='h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-t-transparent'
              style={{ borderColor: 'var(--beige)', borderTopColor: 'transparent' }}
              aria-label='Updating price'
            />
          )}
        </div>
      </div>
    </header>
  )
}

/** Question Box (kit `#i-qbox`, 4346:20867) — exported from the Figma file. */
function QBoxIcon () {
  return (
    <svg viewBox='0 0 16 16' aria-hidden='true'>
      <path d='M1.6155 16C1.15517 16 0.770833 15.8458 0.4625 15.5375C0.154167 15.2292 0 14.8448 0 14.3845V11H1V14.3845C1 14.5385 1.06408 14.6796 1.19225 14.8077C1.32042 14.9359 1.4615 15 1.6155 15H5V16H1.6155ZM14.3845 16H11V15H14.3845C14.5385 15 14.6796 14.9359 14.8077 14.8077C14.9359 14.6796 15 14.5385 15 14.3845V11H16V14.3845C16 14.8448 15.8458 15.2292 15.5375 15.5375C15.2292 15.8458 14.8448 16 14.3845 16ZM0 1.6155C0 1.15517 0.154167 0.770833 0.4625 0.4625C0.770833 0.154167 1.15517 0 1.6155 0H5V1H1.6155C1.4615 1 1.32042 1.06408 1.19225 1.19225C1.06408 1.32042 1 1.4615 1 1.6155V5H0V1.6155ZM16 1.6155V5H15V1.6155C15 1.4615 14.9359 1.32042 14.8077 1.19225C14.6796 1.06408 14.5385 1 14.3845 1H11V0H14.3845C14.8448 0 15.2292 0.154167 15.5375 0.4625C15.8458 0.770833 16 1.15517 16 1.6155ZM8.0385 13.2115C8.26033 13.2115 8.44717 13.1356 8.599 12.9837C8.751 12.8317 8.827 12.6448 8.827 12.423C8.827 12.2013 8.751 12.0145 8.599 11.8625C8.44717 11.7105 8.26033 11.6345 8.0385 11.6345C7.81667 11.6345 7.62983 11.7105 7.478 11.8625C7.326 12.0145 7.25 12.2013 7.25 12.423C7.25 12.6448 7.326 12.8317 7.478 12.9837C7.62983 13.1356 7.81667 13.2115 8.0385 13.2115ZM7.523 9.90575H8.48275C8.50842 9.48008 8.59108 9.13008 8.73075 8.85575C8.87058 8.58142 9.13983 8.24492 9.5385 7.84625C10.0448 7.33975 10.3938 6.91375 10.5855 6.56825C10.7772 6.22275 10.873 5.8385 10.873 5.4155C10.873 4.64367 10.6122 4.01283 10.0905 3.523C9.56867 3.03333 8.8975 2.7885 8.077 2.7885C7.42317 2.7885 6.84433 2.95383 6.3405 3.2845C5.8365 3.61533 5.44483 4.091 5.1655 4.7115L6.0845 5.098C6.26533 4.6775 6.52783 4.34258 6.872 4.09325C7.21633 3.84392 7.60517 3.71925 8.0385 3.71925C8.58583 3.71925 9.03425 3.87725 9.38375 4.19325C9.73308 4.50925 9.90775 4.92242 9.90775 5.43275C9.90775 5.74042 9.83175 6.0305 9.67975 6.303C9.52792 6.57533 9.26675 6.87625 8.89625 7.20575C8.39742 7.67625 8.04383 8.11083 7.8355 8.5095C7.62717 8.90833 7.523 9.37375 7.523 9.90575Z' />
    </svg>
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
      const nsVars = request.namespaces.find(ns => ns.name === namespace)?.vars
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
          {/* Kit's price-detail line (`.k-ligne`, 4346:24887): label in Dark
              Beige, amount in Dark Green, separated by the 1px hairline. */}
          <div className='k-ligne-tete mb-1 pb-1'>
            <h4 className='k-ligne-nom'>{zone.namespace}</h4>
            <span className='k-ligne-prix tabular-nums'>
              {euro.format(zone.total)}
            </span>
          </div>
          <hr className='k-filet mb-2' />
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
