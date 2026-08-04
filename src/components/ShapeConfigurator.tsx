'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShapeViewer } from '@/components/scene/ShapeViewer'
import { resolveVariables } from '@/lib/form/variables'
import type { FlatVars } from '@/lib/form/expr'
import { setShapeData } from '@/lib/shape/registry'
import { buildShapeXml, downloadXml, downloadJson } from '@/lib/shape/xmlExport'
import type { ShapeData } from '@/lib/shape/schema'
import { useGetShapeQuery } from '@/lib/store/api/tecniboApi'

import { ConfiguratorPreviewDialog } from '@oak-some/configurator-previewer'
import {
  PriceBreakdown,
  PriceDisplay,
  toPricingRequest,
  usePricing
} from '@/components/PriceDisplay'

/**
 * Inverse of `setNested`: `{ global: { X: 1 }, A: { B: 2 } }` → `{ X: 1, "A.B": 2 }`.
 * The `global` namespace is dropped (bare names live at the top of the flat map).
 */
function flattenNested (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k in obj) {
    const v = obj[k]
    const isGlobal = prefix === '' && k === 'global'
    const path = isGlobal ? '' : prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenNested(v as Record<string, unknown>, path))
    } else if (path) {
      out[path] = v
    }
  }
  return out
}

/**
 * Equality for variable values across the form↔parent round-trip. The form
 * emits raw values (numbers, `undefined`) but `resolveVariables` stores the
 * string-normalized form, so a strict `Object.is` would treat the same logical
 * value as changed on every cycle. Treat `undefined`/`''` as equal (an
 * unresolved path is no value) and otherwise compare by string.
 */
function sameVar (a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  const empty = (v: unknown) => v === undefined || v === null || v === ''
  if (empty(a) && empty(b)) return true
  if (empty(a) || empty(b)) return false
  return String(a) === String(b)
}

/**
 * Flatten a (possibly nested) LabelSet into flat `"key": "value"` pairs.
 * Nested groups are joined with " › " so the path stays readable.
 */
function flattenLabels (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k in obj) {
    const v = obj[k]
    const key = prefix ? `${prefix} › ${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenLabels(v as Record<string, unknown>, key))
    } else {
      out[key] = String(v)
    }
  }
  return out
}

function readNested (target: Record<string, unknown>, name: string): unknown {
  const parts = name.includes('.') ? name.split('.') : ['global', name]
  let cur: unknown = target
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p]
    } else return undefined
  }
  return cur
}

function setNested (
  target: Record<string, unknown>,
  name: string,
  value: unknown
): Record<string, unknown> {
  const parts = name.includes('.') ? name.split('.') : ['global', name]
  const out: Record<string, unknown> = { ...target }
  let cur: Record<string, unknown> = out
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]
    const existing = cur[k]
    cur[k] =
      existing && typeof existing === 'object'
        ? { ...(existing as Record<string, unknown>) }
        : {}
    cur = cur[k] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
  return out
}

export function ShapeConfigurator ({
  dev = false,
  shapeName
}: {
  dev?: boolean
  shapeName: string
}) {
  // Fetch the shape from the remote shape endpoint by its declared name
  // (e.g. OAKSOME_SHAPE_FR). A single endpoint returns the shape, its exported
  // configurator form (`{ configurator, sources }` or `null`) and pricing.
  const {
    data: remoteShape,
    isLoading: shapeLoading,
    isError: shapeError,
    error: shapeErrorObj
  } = useGetShapeQuery(shapeName, {
    skip: !shapeName
  })

  // Stable reference: the `?? {}` fallback would otherwise mint a fresh object
  // each render (while the shape is still loading), retriggering every useMemo
  // below it.
  const shape = useMemo(
    () =>
      (remoteShape?.shape ?? {}) as ShapeData & {
        variables?: Record<string, unknown>
      },
    [remoteShape]
  )
  const formExpo = remoteShape?.form ?? null

  // Pricing router name from the shape (e.g. `#DS_PRICING_ROUNTER`); strip the
  // leading `#` before using it as the pricing endpoint segment.
  const pricingName = (remoteShape?.pricing ?? '').replace(/^#/, '')

  // Register the remote shape's descriptors/cps BEFORE any child runs walkZone
  // / cp resolution. Calling synchronously in the render body (not inside a
  // useMemo) avoids any chance of useMemo cache + Strict-Mode replay leaving
  // the registry pointed at the previous shape.
  setShapeData(shape)

  // Seed the form from the URL query string: every `?FIELD=value` pair becomes
  // an `initialValues` entry (`{ FIELD: 'value' }`). Read from
  // `window.location.search` (client-only) once on mount — SSR has no URL, so
  // it starts empty and fills in after hydration.
  const [initialValues, setInitialValues] = useState<Record<string, string>>({})
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const values: Record<string, string> = {}
    for (const [key, value] of params.entries()) values[key] = value
    setInitialValues(values)
  }, [])

  // Nested-by-dots updates emitted by the form (bare names → under "global",
  // dotted names → nested objects).
  const [nestedUpdates, setNestedUpdates] = useState<Record<string, unknown>>(
    {}
  )

  // Zone name requested from the form (via a `goToZone` attribute). Drives the
  // viewer to select the matching box by name.
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  // Human-readable description of the current selection, emitted by the form as
  // a (possibly nested) label set. Shown as flat "key: value" rows under the
  // canvas so the user sees what's configured.
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [showHierarchy, setShowHierarchy] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleChangeVariables = useCallback((name: string, value: unknown) => {
    setNestedUpdates(prev => {
      const current = readNested(prev, name)
      // The form emits raw values (numbers, undefined for unresolved paths)
      // while `resolveVariables` stores them string-normalized. Compare by the
      // same normalized form so a `5` ↔ "5" round-trip is a no-op — otherwise
      // every emit produces a new `nestedUpdates`, which re-derives
      // `flatForForm`, which re-runs the form's reconcile, which re-emits …
      // (Maximum update depth exceeded).
      if (sameVar(current, value)) return prev
      return setNested(prev, name, value)
    })
  }, [])

  // Flatten nestedUpdates back to dotted/bare names, merged on top of seed,
  // then resolve `$VAR` expressions.
  const flatForForm = useMemo(
    () =>
      resolveVariables({ ...shape.variables, ...flattenNested(nestedUpdates) }),
    [nestedUpdates, shape]
  )

  // Merged display view: `global` namespace combines seed + form overrides,
  // and any other dotted namespaces from `nestedUpdates` sit alongside.
  const mergedView = useMemo(() => {
    const { global: globalOverrides, ...rest } = nestedUpdates as {
      global?: Record<string, unknown>
    } & Record<string, unknown>
    return {
      global: { ...shape.variables, ...(globalOverrides ?? {}) },
      ...rest
    }
  }, [nestedUpdates, shape])

  // Resolve $-refs once: global on its own, then each zone namespace against
  // `{ ...global, ...own }` so it can reference both. Strip global keys back
  // out so each namespace only carries what it actually defines.
  const resolvedScopes = useMemo(() => {
    const flatten = (raw: unknown): FlatVars => {
      if (!raw || typeof raw !== 'object') return {}
      const out: FlatVars = {}
      for (const k in raw as object) {
        const v = (raw as Record<string, unknown>)[k]
        if (v && typeof v === 'object') continue
        out[k] = v
      }
      return out
    }
    const globalVars = resolveVariables(flatten(mergedView.global))
    const namespaces: Record<string, FlatVars> = {}
    for (const k in mergedView) {
      if (k === 'global') continue
      const own = flatten((mergedView as Record<string, unknown>)[k])
      const merged = resolveVariables({ ...globalVars, ...own })
      const ns: FlatVars = {}
      for (const key in own) ns[key] = merged[key]
      namespaces[k] = ns
    }
    return { globalVars, namespaces }
  }, [mergedView])

  // Fetch pricing once and share it between the top banner and the bottom
  // per-zone breakdown.
  const pricing = usePricing(resolvedScopes, shape, pricingName)

  // Export the live changes (nestedUpdates) as an OAKSOME ListBuilder XML,
  // with one Set per article zone resolved from the shape tree.
  const handleDownloadXml = useCallback(() => {
    const name = shapeName || 'SHAPE'
    // One timestamp for the whole export, so the filename and the XML's own
    // order number / display date all refer to the same instant.
    const now = Date.now()
    const xml = buildShapeXml(nestedUpdates, name, shape, resolvedScopes, now)
    downloadXml(`${name}_${now}.xml`, xml)
  }, [nestedUpdates, shapeName, shape, resolvedScopes])

  // Export the resolved variable scopes (globalVars + namespaces) as JSON.
  const handleDownloadScopes = useCallback(() => {
    const name = shapeName || 'SHAPE'
    downloadJson(`${name}_scopes_${Date.now()}.json`, resolvedScopes)
  }, [shapeName, resolvedScopes])

  // Copy a shareable link to the clipboard: the current URL with the live form
  // values encoded as `?FIELD=value` params (the same params the configurator
  // seeds from on mount).
  const handleCopyLink = useCallback(() => {
    const url = new URL(window.location.href)
    url.search = ''
    for (const [key, value] of Object.entries(formValues)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
    void navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 1500)
      })
      .catch(() => {
        /* clipboard unavailable — no-op */
      })
  }, [formValues])

  // Snapshot function for the 3D canvas, supplied by ShapeViewer once the
  // canvas mounts. Returns a PNG data URL (or null if unavailable).
  const captureCanvasRef = useRef<(() => string | null) | null>(null)

  // Build the full payload posted to the parent window: the XML export, the
  // raw form values, the resolved shape scopes, the exact pricing-endpoint
  // request body, and a PNG snapshot of the canvas.
  const buildMessagePayload = useCallback(
    (action: 'addToCart' | 'fav') => {
      const name = shapeName || 'SHAPE'
      // One timestamp for the whole export, so the filename and the XML's own
      // order number / display date all refer to the same instant.
      const now = Date.now()
      const xmlContent = buildShapeXml(
        nestedUpdates,
        name,
        shape,
        resolvedScopes,
        now
      )
      const res = {
        action,
        name,
        // The shape's pricing router (`#` already stripped) — the
        // `<PRICING_NAME>` path segment the pricing endpoint is called with, so
        // the parent can re-price this payload itself.
        pricing: pricingName,
        // Raw form values as emitted by the configurator (nested by dots).
        form: formValues,
        description: labels,
        // Resolved variable scopes driving the shape.
        // Same body the pricing endpoint receives (globalVars + namespaces).
        shape: toPricingRequest(resolvedScopes, shape),
        xmlFile: {
          filename: `${name}_${now}.xml`,
          content: xmlContent
        },
        // PNG snapshot of the current 3D view, as a data URL.
        image: captureCanvasRef.current?.() ?? null
      }
      return res
    },
    [nestedUpdates, shapeName, shape, resolvedScopes, pricingName]
  )

  const handleAddToCart = useCallback(() => {
    window.parent.postMessage(buildMessagePayload('addToCart'), '*')
  }, [buildMessagePayload])

  const handleFavorite = useCallback(() => {
    window.parent.postMessage(buildMessagePayload('fav'), '*')
  }, [buildMessagePayload])

  // No shape name in the URL: there's nothing to fetch.
  if (!shapeName) {
    return (
      <StatusScreen
        title='Unknown shape'
        message='No shape name was provided.'
      />
    )
  }

  if (shapeLoading) {
    return (
      <StatusScreen
        title='Just a moment…'
        message='Getting your configurator ready.'
      />
    )
  }

  if (shapeError) {
    const detail = errorMessage(shapeErrorObj)
    return (
      <StatusScreen
        title='Failed to load'
        message='Could not load the shape.'
        detail={detail}
        tone='error'
      />
    )
  }

  // Query resolved without error but returned nothing usable.
  if (!remoteShape) {
    return (
      <StatusScreen
        title='Nothing to show'
        message='The shape response was empty.'
        tone='error'
      />
    )
  }

  return (
    <div className='flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black min-h-screen'>
      <main className='flex flex-1 w-full flex-col gap-6 p-6 bg-white dark:bg-black'>
        {dev && (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={handleDownloadXml}
              className='inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
            >
              Download XML
            </button>
            <button
              type='button'
              onClick={handleDownloadScopes}
              className='inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
            >
              Download JSON
            </button>
            <button
              type='button'
              onClick={handleCopyLink}
              className='inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            >
              {linkCopied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              type='button'
              onClick={() => setShowHierarchy(open => !open)}
              aria-pressed={showHierarchy}
              className='inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            >
              {showHierarchy ? 'Hide hierarchy' : 'Show hierarchy'}
            </button>
          </div>
        )}

        {/*
          Row-major grid. On desktop (lg) two columns place the cells as:
            canvas          | form
            description     | pricing details
            shape-res vars  | flated form vars
          On small screens a single column stacks them in source order.
        */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] min-w-0'>
          {/* 1: canvas */}
          <div className='min-w-0'>
            <ShapeViewer
              dev={dev}
              shape={shape}
              scopes={resolvedScopes}
              selectedName={selectedZone}
              showHierarchy={showHierarchy}
              onCaptureReady={fn => {
                captureCanvasRef.current = fn
              }}
            />
          </div>

          {/* 2: form */}
          <div className='min-w-0 overflow-auto'>
            <PriceDisplay pricing={pricing} />
            {formExpo ? (
              <ConfiguratorPreviewDialog
                initialValues={initialValues}
                onVariableSetChange={vars => {
                  for (const [name, value] of Object.entries(vars)) {
                    handleChangeVariables(name, value)
                  }
                }}
                onGoToZone={(zoneId: string) => {
                  // Select the box whose zone name matches in the viewer.
                  setSelectedZone(zoneId)
                }}
                onNameSetChange={names => {
                  setFormValues(names)
                }}
                onLabelSetChange={labelSet => {
                  setLabels(flattenLabels(labelSet as Record<string, unknown>))
                }}
                // Auto-switch to the mobile (nested tab-strip) layout below 768px,
                // desktop above. `layout` is omitted so it doesn't force one mode.
                responsive
                // imageSuffix='/public'
                imagePrefix='https://imagedelivery.net/aYYmWUcv7lRhpLdU4ojPsA/'
                configuratorJson={formExpo}
              />
            ) : (
              <p className='rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
                No configurator form is available for this shape.
              </p>
            )}

            <div className='mt-10 flex items-center gap-3'>
              <button
                type='button'
                onClick={handleAddToCart}
                className='inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
              >
                <CartIcon />
                Add to cart
              </button>
              <button
                type='button'
                onClick={handleFavorite}
                aria-label='Add to favorites'
                className='inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-2.5 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
              >
                <HeartIcon />
              </button>
            </div>
          </div>

          {/* 3: description */}
          <div className='min-w-0'>
            {Object.keys(labels).length > 0 && (
              <CollapsibleSection title='Description'>
                <LabelsSection labels={labels} />
              </CollapsibleSection>
            )}
          </div>

          {/* 4: pricing details (dev only) */}
          <div className='min-w-0 overflow-auto'>
            {dev && (
              <CollapsibleSection title='Price details'>
                <PriceBreakdown pricing={pricing} />
              </CollapsibleSection>
            )}
          </div>

          {/* 5: variables (seed + form overrides) used in shape resolution (dev only) */}
          <div className='min-w-0 overflow-auto'>
            {dev && (
              <CollapsibleSection title='variables (seed + form overrides) used in shape resolution'>
                <Panel data={resolvedScopes} />
              </CollapsibleSection>
            )}
          </div>

          {/* 6: flated variables (seed + form overrides) used in form (dev only) */}
          <div className='min-w-0 overflow-auto'>
            {dev && (
              <CollapsibleSection title='flated variables (seed + form overrides) used in form'>
                <Panel data={flatForForm} />
              </CollapsibleSection>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

/** Best-effort human-readable message from an RTK Query error. */
function errorMessage (err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined
  const e = err as { status?: unknown; error?: unknown; data?: unknown }
  if (typeof e.error === 'string') return e.error
  if (e.status !== undefined) {
    const body =
      typeof e.data === 'string' ? e.data : e.data ? JSON.stringify(e.data) : ''
    return `HTTP ${String(e.status)}${body ? ` — ${body}` : ''}`
  }
  return undefined
}

/** Full-screen loading / error / empty state for the configurator. */
function StatusScreen ({
  title,
  message,
  detail,
  tone = 'info'
}: {
  title: string
  message: string
  detail?: string
  tone?: 'info' | 'error'
}) {
  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-6 text-center'>
      <h2
        className={`text-lg font-semibold ${
          tone === 'error'
            ? 'text-red-600 dark:text-red-400'
            : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {title}
      </h2>
      <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>{message}</p>
      {detail && (
        <pre className='mt-3 max-w-md overflow-auto rounded bg-zinc-100 dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400'>
          {detail}
        </pre>
      )}
    </div>
  )
}

/**
 * Description of the current form/article selection, shown under the canvas as
 * `key: value` rows. Hidden when there's nothing to describe.
 */
function LabelsSection ({ labels }: { labels: Record<string, string> }) {
  const entries = Object.entries(labels)
  if (entries.length === 0) return null
  return (
    <dl className='grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2'>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className='flex items-baseline justify-between gap-3 border-b border-zinc-100 pb-1 dark:border-zinc-800'
        >
          <dt className='text-sm text-zinc-500'>{key}</dt>
          <dd className='text-sm font-medium text-zinc-900 text-right dark:text-zinc-100'>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// Shopping-cart glyph for the add-to-cart button.
function CartIcon () {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='9' cy='20' r='1' />
      <circle cx='18' cy='20' r='1' />
      <path d='M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 7H5' />
    </svg>
  )
}

// Heart glyph for the favorites button.
function HeartIcon () {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 21C12 21 4 13.7 4 8.5A4.5 4.5 0 0 1 12 5.5 4.5 4.5 0 0 1 20 8.5C20 13.7 12 21 12 21z' />
    </svg>
  )
}

function Panel ({ data }: { data: unknown }) {
  return (
    <pre className='rounded bg-zinc-100 dark:bg-zinc-900 p-3 text-xs overflow-auto'>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

/**
 * Generic collapsible section (accordion). Its `title` is the always-visible
 * summary; `children` show when expanded. Open by default.
 */
function CollapsibleSection ({
  title,
  defaultOpen = false,
  children
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className='group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
    >
      <summary className='flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 select-none'>
        {title}
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='shrink-0 transition-transform group-open:rotate-180'
        >
          <path d='m6 9 6 6 6-6' />
        </svg>
      </summary>
      <div className='px-4 pb-4'>{children}</div>
    </details>
  )
}
