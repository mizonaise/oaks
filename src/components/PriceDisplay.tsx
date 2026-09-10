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

/** Country used when the URL carries no `?country=`. */
export const DEFAULT_COUNTRY = 'BE'

export function toPricingRequest (
  scopes: Scopes,
  shape: ShapeData,
  country: string = DEFAULT_COUNTRY
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
  return { country, globalVars, namespaces }
}

const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
})

/** A price-details line: a category from the response's `details` map. */
interface DetailLine {
  comment: string
  price: number
}

/**
 * The promotion in force, preferring the top-level one and falling back to the
 * country's. `null` when the configuration carries no promotion.
 */
function activePromo (data: PricingResponse | undefined) {
  return data?.promotion ?? data?.country?.promotion ?? null
}

/**
 * The pre-promotion price shown struck through beside the promo tag
 * (`.k-tag-xxs--barre`). `totalPrice` already has the discount applied, so the
 * original is recovered from the discount percentage. `null` when there is no
 * promotion, or when the percentage can't yield a sane figure.
 */
function strikePrice (data: PricingResponse | undefined): number | null {
  const promo = activePromo(data)
  if (!promo || data == null) return null
  const pct = promo.discount_pct
  if (!(pct > 0) || pct >= 100) return null
  return data.totalPrice / (1 - pct / 100)
}

/**
 * The response's `details` map (`{ 'Carcase & Fittings': 2444.97, … }`) as
 * display lines, dropping null/zero categories. Insertion order is the
 * engine's, which groups carcase/fittings before options and installation.
 */
function detailLines (data: PricingResponse | undefined): DetailLine[] {
  const details = data?.details
  if (!details) return []
  const out: DetailLine[] = []
  for (const comment in details) {
    const price = details[comment]
    if (price == null || price === 0) continue
    out.push({ comment, price })
  }
  return out
}

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
  pricingName: string,
  /** Country from the URL's `?country=`. Null/omitted uses the default. */
  country?: string | null
): UsePricingResult {
  const [getPricing, { data, isLoading, isError }] = useGetPricingMutation()

  const request = useMemo(
    () => toPricingRequest(scopes, shape, country ?? DEFAULT_COUNTRY),
    [scopes, shape, country]
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
export function PriceDisplay ({
  pricing,
  detailsOpen = false,
  onToggleDetails
}: {
  pricing: UsePricingResult
  /** Whether the detail screen is the one currently showing. */
  detailsOpen?: boolean
  /** Toggles the detail screen. Omit to render the bar without its Question Box. */
  onToggleDetails?: () => void
}) {
  const { data, isLoading, isError } = pricing

  // Keep the last successfully computed total so the price doesn't flash to a
  // spinner on every recompute.
  const [lastTotal, setLastTotal] = useState<number | null>(null)
  useEffect(() => {
    if (data) setLastTotal(data.totalPrice)
  }, [data])

  const total = data?.totalPrice ?? lastTotal
  const showSpinner = isLoading && total === null

  // Non-null, non-zero category totals from the response's `details` map —
  // these are the lines the detail screen shows, so the Question Box only
  // appears when there is something to show.
  const details = useMemo(() => detailLines(data), [data])
  const promo = activePromo(data)
  const strike = strikePrice(data)

  // Styling follows the Stoëmp kit's Price bar (`.cfg-prix`, 4346:20901):
  // the amount in Yet Grotesk 700 30/32 Dark Green, a Question Box beside it
  // that toggles the detail screen, and the Tag XXS row underneath.
  // On mobile the bar goes translucent + blurred over the viewer; from `lg`
  // up it's the white, drop-shadowed bar of the desktop panel.
  return (
    <header className='k-prix mb-4'>
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
        {/* Question Box (`data-action="prix"`, configurateur.js:210): a
            toggle — it opens the detail screen, and closes it again when
            that screen is already showing. */}
        {details.length > 0 && onToggleDetails && (
          <button
            type='button'
            className='k-qbox'
            onClick={onToggleDetails}
            aria-expanded={detailsOpen}
            aria-label={detailsOpen ? 'Close price details' : 'Price details'}
          >
            <QBoxIcon />
          </button>
        )}
        {/* Recompute spinner: sits to the right of the amount (after the
            Question Box), so a refresh reads as an annotation on the price
            rather than shifting the bar's layout. `self-center` keeps it on
            the amount's optical centre — `.k-prix-val` is `flex-start`
            aligned so the Question Box hangs at the cap line. */}
        {isLoading && total !== null && (
          <span
            className='h-4 w-4 shrink-0 animate-spin self-center rounded-full border-2'
            style={{
              borderColor: 'var(--beige)',
              borderTopColor: 'var(--vert-fonce)'
            }}
            aria-label='Updating price'
          />
        )}
      </div>
      {/* Tags row (`.cfg-prix-tags`, configurateur.css:36): the
          pre-promotion price struck through, then the promotion itself on
          the Flash Green tag — sat on the amount's row, at its right end.
          Only rendered while a promotion is running. */}
      {promo && total !== null && (
        <div className='k-prix-tags'>
          {strike !== null && (
            <span className='k-tag-xxs k-tag-xxs--barre tabular-nums'>
              {euro.format(strike)}
            </span>
          )}
          <span className='k-tag-xxs k-tag-xxs--flash'>
            −{promo.discount_pct}%
          </span>
        </div>
      )}
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

/** Back arrow (kit `#i-retour`, 18 × 18) — returns from the detail screen. */
function BackIcon () {
  return (
    <svg
      viewBox='0 0 18 18'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M16 9H2.5M8 3.5 2.5 9 8 14.5' />
    </svg>
  )
}

/**
 * The kit's price-detail screen (`.cfg-ecran--prix`, 4346:24887): a "Détail du
 * prix" heading over one `.k-ligne` per priced item — label in Dark Beige,
 * amount in Dark Green — closed by a Total line in the 30/32 title style.
 *
 * The lines come from the response's `details` map — one per priced category
 * (`Carcase & Fittings`, `Handle`, `Door`, `Pose`) — with zero/null categories
 * dropped. An active promotion is named above the Total, and the VAT rate the
 * total carries is noted beneath it.
 */
export function PriceDetails ({
  pricing,
  onBack
}: {
  pricing: UsePricingResult
  /** Returns to the form. Omit to render the screen without its back arrow. */
  onBack?: () => void
}) {
  const { data } = pricing

  const lines = useMemo(() => detailLines(data), [data])
  const promo = activePromo(data)
  const strike = strikePrice(data)

  if (lines.length === 0) return null

  // `totalPrice` is the engine's own figure, not the sum of the lines above:
  // the two can differ (rounding, promotions applied on the total, categories
  // excluded from `details`), and the bar shows the engine's — so the Total
  // line must agree with the bar.
  const total = data?.totalPrice ?? 0

  return (
    <section className='flex min-h-0 flex-1 flex-col px-6 pt-6'>
      {/* Heading + back arrow, as in the kit (`.cfg-ecran--prix .k-titre-m`,
          configurateur.css:56/129): the rule sits above the title, and the
          lines start 48px below it. */}
      <h2 className='k-titre-m'>
        <span>Price details</span>
        {onBack && (
          <button
            type='button'
            className='cfg-retour'
            onClick={onBack}
            aria-label='Back'
          >
            <BackIcon />
          </button>
        )}
      </h2>
      {/* `pb-16` is the kit's bottom padding under the last line
          (`.cfg-lignes-scroll`, configurateur.css:130), so the total doesn't
          collide with the buy row pinned beneath it. */}
      <div className='k-scroll--flash mt-12 min-h-0 flex-1 overflow-y-auto pb-16'>
        <div className='k-lignes k-lignes--detail'>
          {lines.map(l => (
            <div key={l.comment} className='k-ligne'>
              <div className='k-ligne-tete'>
                <span className='k-ligne-nom'>{l.comment}</span>
                <span className='k-ligne-prix tabular-nums'>
                  {euro.format(l.price)}
                </span>
              </div>
            </div>
          ))}
          {/* Active promotion, between the category lines and the total —
              the discount is already baked into `totalPrice`, so this line
              explains the figure rather than adding to it. Named in the line
              label, with the kit's price tags (struck-through original +
              Flash Green discount) standing in for the amount. */}
          {promo && (
            <div className='k-ligne'>
              <div className='k-ligne-tete'>
                <span className='k-ligne-nom'>{promo.name}</span>
                <span className='k-prix-tags'>
                  {strike !== null && (
                    <span className='k-tag-xxs k-tag-xxs--barre tabular-nums'>
                      {euro.format(strike)}
                    </span>
                  )}
                  <span className='k-tag-xxs k-tag-xxs--flash'>
                    −{promo.discount_pct}%
                  </span>
                </span>
              </div>
            </div>
          )}
          <div className='k-ligne k-ligne--total'>
            <div className='k-ligne-tete'>
              <span>Total</span>
              <span className='k-ligne-prix tabular-nums'>
                {euro.format(total)}
              </span>
            </div>
          </div>
          {/* Which VAT rate the total carries, plus the excl.-VAT figure. */}
          {data && (
            <p className='mt-2 text-xs text-zinc-500 dark:text-zinc-400'>
              Incl. {data.tva.reduced_rate}% VAT —{' '}
              {euro.format(data.prices.price_ht)} excl. VAT
            </p>
          )}
        </div>
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
