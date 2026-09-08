# Frontend Pricing Flow — start to end

How a price gets on screen, from the user typing in the configurator form to
the euro amount in the banner and the per-zone breakdown.

## Cast

| Piece | File |
| --- | --- |
| Orchestrator (owns state, renders everything) | [ShapeConfigurator.tsx](../src/components/ShapeConfigurator.tsx) |
| Request builder, hook, banner, breakdown | [PriceDisplay.tsx](../src/components/PriceDisplay.tsx) |
| RTK Query endpoints + payload types | [tecniboApi.ts](../src/lib/store/api/tecniboApi.ts) |
| Zone dimension computation | [xmlExport.ts](../src/lib/shape/xmlExport.ts) (`computeZoneSizes`) |
| Same-origin proxy rewrites | [next.config.ts](../next.config.ts) |

## The pipeline

```
user edits form
   → onVariableSetChange  (ConfiguratorPreviewDialog)
   → nestedUpdates        (state, dot-path nested)
   → mergedView           (shape.variables seed + overrides)
   → resolvedScopes       ({ globalVars, namespaces }, $VAR expanded)
   → toPricingRequest()   (+ computeZoneSizes → ART_SIZEX/Y/Z, stringified)
   → 400ms debounce
   → POST /api/shape/pricing/<PRICING_NAME>
   → PricingResponse      ({ totalPrice, descriptorTotals, breakdown })
   → PriceDisplay (banner + tooltip) / PriceBreakdown (dev only)
```

---

## 1. Bootstrapping — where the pricing router name comes from

`ShapeConfigurator` fetches the shape once:

```ts
useGetShapeQuery(shapeName)   // GET /api/shape/product/<SHAPE_NAME>
// → { form, pricing, shape }
```

`pricing` is the pricing **router name**, delivered with a leading `#`
(e.g. `#DS_PRICING_ROUNTER`). It is stripped before use — it becomes the last
path segment of the pricing endpoint:

```ts
const pricingName = (remoteShape?.pricing ?? '').replace(/^#/, '')
```
([ShapeConfigurator.tsx:150](../src/components/ShapeConfigurator.tsx#L150))

Seed values for the form come from two sources, in this precedence:

1. `shape.variables` — the shape's own defaults.
2. `GET /api/oaksome/products-config?template_id=<id>` — the saved `data.form`
   for the `?id=` template, flattened to strings.
3. **Dev only**: every `?FIELD=value` in the URL query string, layered on top
   (the other half of the dev "Copy link" button). Outside dev the query string
   is deliberately *not* a value source, so a link can't silently pin a config.

## 2. User input → `nestedUpdates`

The configurator emits variable changes through `onVariableSetChange`. Each
`(name, value)` pair lands in `handleChangeVariables`, which writes it into the
`nestedUpdates` state by dot path (bare names go under `global`, dotted names
nest).

The guard there matters: the form emits raw values (`5`) while resolution stores
string-normalized ones (`"5"`). Without the `sameVar` comparison every emit
would mint a new `nestedUpdates` → new `flatForForm` → form reconcile → re-emit
→ *Maximum update depth exceeded*.

## 3. `nestedUpdates` → `resolvedScopes`

Two memos, in order:

- **`mergedView`** — `{ global: { ...shape.variables, ...globalOverrides }, ...otherNamespaces }`.
- **`resolvedScopes`** — expands `$VAR` references:
  - `globalVars` = `resolveVariables(flatten(mergedView.global))`
  - each namespace is resolved against `{ ...globalVars, ...own }` (so a zone
    can reference globals), then the global keys are **stripped back out** so a
    namespace only carries what it actually defines.

Only scalar values survive `flatten` — nested objects are skipped, they are
namespaces, not values.

This `{ globalVars, namespaces }` object is the single source shared by the 3D
viewer, the XML export, and pricing.

## 4. `resolvedScopes` → `PricingRequest`

`toPricingRequest(scopes, shape)` ([PriceDisplay.tsx](../src/components/PriceDisplay.tsx#L33)):

1. `computeZoneSizes(shape, scopes)` walks the shape tree the exact same way the
   XML export does — from the shape's `width`/`depth`/`height` bounds down
   through `walkZone` — and returns `{ ART_SIZEX, ART_SIZEY, ART_SIZEZ }` per
   zone. Because an article leaf's own `name` may differ from its pricing
   namespace, it matches the article's name chain (leaf first, then ancestors)
   against the known namespace keys and keys the result by that.
2. For each namespace: **skip it entirely** if there's no computed size or any
   of X/Y/Z is missing or zero — such a zone can't be priced.
3. Otherwise stringify all vars (`undefined`/`null` dropped — the engine expects
   strings) and inject the computed `ART_SIZEX/Y/Z`, **overriding** any stale
   values already in the namespace.

Result:

```ts
{
  globalVars: { ZF_WIDTH: "3000", ... },
  namespaces: {
    ART_ZONE_FR_01: { ...nsVars, ART_SIZEX: "1200", ART_SIZEY: "500", ART_SIZEZ: "2400" },
    ...
  }
}
```

## 5. Fetching — `usePricing`

```ts
const pricing = usePricing(resolvedScopes, shape, pricingName)
```

Called **once** in `ShapeConfigurator` and passed to both the banner and the
breakdown, so the page fetches a single time per change.

- Builds `request` via a memo, then a `requestKey = JSON.stringify(request)` —
  the memo mints a fresh object every render, so the serialized form is what
  actually gates refetching.
- **400 ms debounce** in a `useEffect` keyed on `requestKey`; the form emits
  changes in bursts and this collapses them into one request.
- Sends the *latest* body via a ref, not the one captured when the timer
  started.
- Errors are swallowed at the call site and surfaced through `isError`.

Returns `{ data, request, isLoading, isError }`. `request` is exported
deliberately — `PriceBreakdown` needs it to resolve expression variables.

## 6. The endpoint

```ts
getPricing: builder.mutation<PricingResponse, PricingArgs>({
  query: ({ pricingName, body }) => ({
    url: `/api/shape/pricing/${pricingName}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }),
})
```

`/api/shape/*` is a Next.js rewrite to `NEXT_PUBLIC_SHAPE_API`
(`api.tecnibo.com`), so the upstream host stays server-side and CORS is avoided.
It is a **mutation**, not a query — no cache reuse; every debounced change is a
fresh POST.

Response:

```ts
interface PricingResponse {
  totalPrice: number
  descriptorTotals: Record<string, { comment: string; price: number }>
  breakdown: Array<{
    pricingKey: string
    namespaceName: string
    nodenum: number
    expression: string
    amount: number
  }>
}
```

## 7. Rendering — `PriceDisplay` (the banner)

Sits at the top of the form column.

- Keeps `lastTotal` in state so the price **doesn't flash to a spinner** on
  every recompute; the spinner only shows when there has never been a total.
- While recomputing with a total already present, a small spinner appears to the
  right instead.
- States: `isError && total === null` → "Price unavailable"; no total yet →
  "Calculating…"; otherwise the total formatted as `fr-FR` EUR via `Intl.NumberFormat`.
- The `i` tooltip lists `descriptorTotals`, filtered to non-null/non-zero prices
  and **grouped by `comment`** with prices summed, so each comment appears once.

## 8. Rendering — `PriceBreakdown` (dev only)

Rendered under "Price details", gated on the `dev` prop.

Groups `breakdown` line items by `namespaceName` (first-seen order preserved),
and per zone shows:

- the zone total (`sum of amount`),
- a collapsible list of **all** namespace variables (including the injected
  `ART_SIZE*`), sorted,
- per line item: `pricingKey`, `amount`, the raw `expression`, and every `$VAR`
  the expression references.

Variable resolution for display (`resolveExprVars`) mirrors the engine's own
lookup order: the namespace's vars first, then `globalVars`, otherwise
`missing` — rendered in red with an em dash. That red dash is the fast way to
spot why an expression priced to zero.

## Gotchas

- **A zone silently missing from the price** is almost always step 4's skip:
  `computeZoneSizes` produced no size, or one of X/Y/Z is 0. Check the dev
  breakdown's namespace-variable list.
- **`pricingName` empty** → the POST hits `/api/shape/pricing/` and fails. It
  comes from the shape payload; a product with `pricing: null` has no pricing.
- **Values must be strings.** Anything non-string reaching the body is a bug in
  `stringifyVars`' callers, not in the engine.
- **Injected `ART_SIZE*` always wins** over whatever the namespace carried.
- The debounce is 400 ms — a test asserting on the price immediately after a
  form change will read the previous value.
