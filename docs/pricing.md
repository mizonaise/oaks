# Pricing Backend — End-to-End Documentation

> Scope note: this documents the `src/pricing` module. There is no entity, field, or
> endpoint named "pricing party" anywhere in this repository — if that term comes from a
> spec or the frontend, it maps to the descriptor-driven pricing engine described here.

---

## 1. Overview

Pricing is **data-driven**: no price is hardcoded in TypeScript. All rules live in the
IMOS/legacy database as *descriptors*. The backend's job is to:

1. Resolve a *router* descriptor (the `:name` in the request) into a set of
   `DS_PRICING_*` keys.
2. Turn its rows into a ruleset of `{ condition → expression }` pairs.
3. Evaluate those rules against a runtime context (global variables + per-zone namespaces).
4. Resolve material / surface / cost-center / connector costs from the DB.
5. Sum the matched expressions into a total, a per-descriptor total, and a line-by-line breakdown.

Adding or changing a price means editing descriptor rows in the database — **not** deploying code.

---

## 2. Files

| Path | Role |
| --- | --- |
| [pricing.module.ts](../src/pricing/pricing.module.ts) | Wires `DescriptorModule`, `MatModule`, `SurfModule`; exports `PricingService` |
| [pricing.controller.ts](../src/pricing/pricing.controller.ts) | Two POST routes |
| [pricing.service.ts](../src/pricing/pricing.service.ts) | Entire engine (542 lines) |
| [descriptor.service.ts](../src/descriptor/descriptor.service.ts) | Rule store — reads `DESCRIPTORVALUES` + conditions |
| [operation.service.ts](../src/operation/operation.service.ts) | Logical operator per condition |
| [comparison.service.ts](../src/comparison/comparison.service.ts) | Individual comparisons per condition |
| [mat.service.ts](../src/mat/mat.service.ts) / [surf.service.ts](../src/surf/surf.service.ts) | Material / surface cost lookup |
| [schema.prisma](../prisma/schema.prisma) | PostgreSQL model (`DATABASE_URL`) |
| [rest.http](../rest.http) | Live sample requests |

Registered in [app.module.ts:34](../src/app.module.ts#L34).

There are **no DTOs and no validation pipe** — request bodies are `Record<string, any>`.
There are **no unit tests** for pricing.

---

## 3. API — `POST /pricing/:name`

This is **the** pricing endpoint. `:name` is a *router* descriptor; only the pricing keys
it references are evaluated (see §6 for the dispatch mechanism).

```
POST /pricing/DS_PRICING_ROUTER
Content-Type: application/json
```

> The service also exposes a bare `POST /pricing` that evaluates every `DS_PRICING_*`
> descriptor. It is **not used** and is not documented here — always go through a router name.

### 3.1 Request schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `globalVars` | `object<string, string \| number>` | no | Variables visible to **every** namespace. Dimensions, material/surface names, flags. |
| `namespaces` | `object<string, object>` | no | One entry per zone / element. The key is the namespace name (echoed as `namespaceName` in the breakdown); the value is that zone's own variables. |

Rules:

- Both fields default to `{}`. A missing or non-object body is tolerated and yields
  `totalPrice: 0` — **no validation error is raised** (there is no DTO or `ValidationPipe`).
- Values are **flat, one level deep**. Nested objects are not traversed.
- Values are normally **strings**, even numeric ones (`"3000"`); they are coerced during
  expression evaluation. Non-numeric values used in arithmetic resolve to `0`.
- Per namespace, the evaluation context is `{ ...globalVars, ...namespaceValues }` —
  **the namespace value wins** on a key collision.
- With `namespaces: {}` nothing is evaluated (the engine loops over namespaces), so the
  total is `0` regardless of `globalVars`.

### 3.2 Request example

```jsonc
POST http://localhost:4848/pricing/DS_PRICING_ROUTER
Content-Type: application/json

{
  "globalVars": {
    // dimensions (mm)
    "ZF_W": "3000",
    "ZF_D": "500",
    "ZONE_H": "2500",
    "BASE_HEIGHT": "100",
    "CROWN_HEIGHT": "50",

    // materials — names resolved to MAT.COST via ___PRICE($VAR, 4)
    "MAT_1": "DE_VN_HGS_MDF_S4_01_19",
    "MAT_FR_1": "MDF18_Prepeint",
    "MAT_FR_1_THK": "18",

    // surfaces — names resolved to SURF.COST via ___PRICE($VAR, 3)
    "SRF_FR_1_TOP": "BO_COAT_WD_TC_31_BOM",
    "SRF_FR_1_BOT": "BO_COAT_WD_TC_31_BOM",
    "SURF_TS_1_EXT": "NO_SURF",

    // flags & counts used by rule conditions
    "IS_BI_L": "1",
    "IS_BI_R": "1",
    "ZF_CNT": "6",
    "HAS_HC": "0",
    "HAS_DR": "0",

    // article references
    "DS_WACA_FR_ART_01": "#DS_WACA_U_ART_01",
    "DS_WACA_FR_ART_TEC": "GEWC_LY"
  },

  "namespaces": {
    "ZONE_1": {
      "HAS_DOOR": "1",
      "Door_Type": "SD",
      "Hinge_Side_nbr": "0",
      "WACA_SUB_ART_01": "IHC"     // matches conditions on "Zusatzfilter 1"
    },
    "ZONE_2": {
      "HAS_DOOR": "0"
    }
  }
}
```

A full, real-world payload lives in [rest.http](../rest.http) under *Calculate Pricing by Name*.

### 3.3 Response schema

| Field | Type | Description |
| --- | --- | --- |
| `totalPrice` | `number` | Sum of every matched rule across all namespaces, 2 decimals. |
| `descriptorTotals` | `object<pricingKey, { comment, price }>` | One entry per pricing key referenced by the router — **including keys that matched nothing** (`price: 0`). |
| `descriptorTotals[key].comment` | `string` | `DESCRIPTOR.COMMENT` — the human label for UI display. `""` if the descriptor row is missing. |
| `descriptorTotals[key].price` | `number` | Subtotal for that key, 2 decimals. |
| `breakdown` | `array` | One line per matched rule. Empty if nothing matched. |
| `breakdown[].pricingKey` | `string` | The `DS_PRICING_*` descriptor that produced the line. |
| `breakdown[].namespaceName` | `string` | Which namespace the rule matched in. |
| `breakdown[].nodenum` | `number` | `DESCRIPTORVALUES.NODENUM` — the rule's row, for tracing back to the DB. |
| `breakdown[].expression` | `string` | The **raw** `LINDIV` before substitution. |
| `breakdown[].amount` | `number` | Evaluated result, 2 decimals. |

> Rules evaluating to `0` are **skipped** and never appear in `breakdown` — a matched
> zero-priced rule is indistinguishable from one that did not match.

### 3.4 Response example

```jsonc
{
  "totalPrice": 1240.55,
  "descriptorTotals": {
    "DS_PRICING_DOOR":  { "comment": "Door pricing",  "price": 320.00 },
    "DS_PRICING_PANEL": { "comment": "Panel pricing", "price": 920.55 },
    "DS_PRICING_POSE":  { "comment": "Installation",  "price": 0 }
  },
  "breakdown": [
    {
      "pricingKey": "DS_PRICING_DOOR",
      "namespaceName": "ZONE_1",
      "nodenum": 12,
      "expression": "___PRICE($MAT_FR_1, 4) * $ZF_W / 1000",
      "amount": 320.00
    },
    {
      "pricingKey": "DS_PRICING_PANEL",
      "namespaceName": "ZONE_1",
      "nodenum": 4,
      "expression": "___PRICE($MAT_1, 4) * $ZF_W * $ZONE_H / 1000000",
      "amount": 620.55
    },
    {
      "pricingKey": "DS_PRICING_PANEL",
      "namespaceName": "ZONE_2",
      "nodenum": 4,
      "expression": "___PRICE($MAT_1, 4) * $ZF_W * $ZONE_H / 1000000",
      "amount": 300.00
    }
  ]
}
```

Reading it: `DS_PRICING_ROUTER` referenced three keys. `DS_PRICING_PANEL` matched in both
zones (two breakdown lines, summed to `920.55`), `DS_PRICING_DOOR` only in `ZONE_1` (which
has `HAS_DOOR: "1"`), and `DS_PRICING_POSE` matched nowhere — reported as `0` with no
breakdown line.

### 3.5 Errors

| Status | Cause |
| --- | --- |
| `400 Bad Request` | An expression uses `___PRICE(x, TYPE)` with a type outside `1, 3, 4, 32, 1001`. |
| `200 OK` with `totalPrice: 0` | Unknown `:name`, empty `namespaces`, or no rule matched. **An unknown router name is not an error** — it resolves to zero pricing keys. |

There is no error for a malformed expression: evaluation failures are swallowed and treated
as `0` (§5.3).

`descriptorTotals` always contains **every** evaluated pricing key, including those that
matched nothing (`price: 0`). `comment` comes from `DESCRIPTOR.COMMENT` and is the
human-readable label for UI display.

---

## 4. Data model

No foreign keys — legacy IMOS tables joined by `NAME` / `CONDITIONID`.

```
DESCRIPTOR         NAME, COMMENT, DESC_TYPE, INORDER
                     └── COMMENT = human label shown in descriptorTotals

DESCRIPTORVALUES   NAME, NODENUM, CONDITIONID, LINDIV, COMMENT
                     ├── one row = one rule
                     ├── LINDIV      = the price expression (or "#DS_PRICING_X" in a router)
                     ├── CONDITIONID = 0 → unconditional/default row
                     └── NODENUM     = rule order

OPERATION          CONDITIONID, OPERATIONTYPE   → AND / OR combinator for the group
COMPARISON         CONDITIONID, LEFTVALUE, COMPARISONTYPE, RIGHTVALUE
```

Cost sources referenced by `___PRICE(x, type)`:

| Type | Table | Column |
| --- | --- | --- |
| `1` | *(none)* | hardcoded constants |
| `3` | `SURF` | `COST` |
| `4` | `MAT` | `COST` |
| `32` | `CONNDESC` | `PRICE` |
| `1001` | `COSTCENTER` | `COST` |

Any other type throws `BadRequestException`.

---

## 5. Evaluation pipeline (`POST /pricing/:name`)

```
calculatePriceByName(name, input)
   │
   ├─ normalizeInput / normalizeContext        → { globalVars, namespaces }
   │
   ├─ resolve router :name → pricingKeys       → see §6
   │
   ├─ buildPricing(pricingKeys)                → Record<pricingKey, PricingRule[]>
   │     └─ for each key: descriptor.getDescriptorConditions()
   │           → { action: LINDIV, nodenum, roles: [{ operator, roles: [...] }] }
   │
   └─ evaluatePricing()
         for each namespace:
            context = { ...globalVars, ...namespaceValues }   // namespace wins
            for each pricingKey → for each rule:
               skip if !rule.action
               skip if !matchesRuleConditions(rule.roles, context)
               amount = await evaluateExpression(rule.action, context)
               skip if amount === 0 or not finite
               totalPrice += amount; push breakdown line
         group breakdown by pricingKey → pricingKeyTotals
         fetch DESCRIPTOR.COMMENT per key → descriptorTotals
```

### 5.1 Condition matching — `matchesRuleConditions` ([:294](../src/pricing/pricing.service.ts#L294))

Every group must pass. Inside a group the operator comes from `OPERATION.OPERATIONTYPE`:

| `OPERATIONTYPE` | Operator | Group passes when |
| --- | --- | --- |
| `0` | `AND` | every condition true |
| `1` | `NOT AND` | not every condition true |
| `2` | `OR` | at least one true |
| `3` | `NOT OR` | none true |
| *other* | `OR` (default) | at least one true |

Left-value resolution order:

1. **Shared-key remap** — filter labels are remapped to real context keys
   ([:25](../src/pricing/pricing.service.ts#L25)):
   `'Zusatzfilter 1' → WACA_SUB_ART_01`, `'Zusatzfilter 2' → GECA_ART_MAIN`.
2. Look up the (remapped) key in `context`.
3. **If absent, the leftValue itself is used as a literal.**

Comparison symbols (`compareValues`, [:362](../src/pricing/pricing.service.ts#L362)):

| Symbol | Meaning |
| --- | --- |
| `=` | equals |
| `!=`, `<>` | not equals |
| `B` / `!B` | starts with / does not start with |
| `C` / `!C` | contains / does not contain |
| *unknown* | **passes** (permissive by design) |

### 5.2 Inline conditions — `evaluateInlineCondition` ([:390](../src/pricing/pricing.service.ts#L390))

When `LEFTVALUE === "0"`, the whole comparison is packed into `RIGHTVALUE` as
`$VAR <op> LITERAL`:

```
/^\s*\$(\w+)\s*(?:(!=|<>|=|-)|\s(!?B|!?C)\s)\s*([\s\S]*)$/
```

- Symbol operators (`= != <> -`) need no spaces; keyword operators (`B C !B !C`) **must**
  be whitespace-delimited, otherwise a `B`/`C` inside a variable name like
  `$WACA_SUB_ART_01` would be misread as an operator.
- Only the **first comma-separated segment** of the expected value is kept
  (`"IHC, FOO=BAR,"` → `IHC`), then surrounding quotes are stripped.
- `-` is the descriptor UI's equality separator; any unrecognized operator also
  falls back to equality.

If the shape doesn't match, the function returns `undefined` and normal
left/comparison/right handling applies.

### 5.3 Expression evaluation — `evaluateExpression` ([:247](../src/pricing/pricing.service.ts#L247))

1. **`normalizeExpression`** — counts parentheses and appends missing closing `)`.
   (Descriptor authors frequently leave them unbalanced.)
2. **`___PRICE(VAR, TYPE)` resolved first.** This ordering is essential: if generic `$VAR`roun
   substitution ran first, the *material name* inside `___PRICE($MAT_1, 4)` would be
   replaced by `0` (names aren't numeric) and the DB cost lookup would never happen.
3. **Remaining `$VAR`** → numeric value from context; non-numeric or missing → `0`.
4. `new Function("return (expr);")` evaluates the result. **Any throw yields `0`.**

> ⚠️ Step 4 evaluates DB-sourced strings as JavaScript. Anyone who can write
> `DESCRIPTORVALUES.LINDIV` can execute arbitrary code in the server process. This is a
> real code-injection surface; treat descriptor write access as equivalent to deploy access.

### 5.4 Price resolution — `resolvePriceValue` ([:469](../src/pricing/pricing.service.ts#L469))

```
___PRICE($MAT_1, 4)          → context["MAT_1"] → MAT.COST      (variable form)
___PRICE(FACTORY_BE_SAW, 1001) → COSTCENTER.NAME = "FACTORY_BE_SAW" → COST (literal form)
```

- Leading `$` ⇒ context lookup; bare name ⇒ used literally as the DB key.
- If the resolved value is already a number (or a numeric string), it is returned as-is —
  no DB hit.
- **Type `1`** is not a table lookup; it returns hardcoded constants:
  `POSE_PRICE → 30`, `FACTORY_PRICE → 20`, anything else → `0`.
- Unresolvable values for DB-backed types return `0`; unsupported types throw
  `BadRequestException`.

---

## 6. Router descriptors

`calculatePriceByName` ([:141](../src/pricing/pricing.service.ts#L141)) implements a dispatch
table stored as data:

1. Read all `DESCRIPTORVALUES` rows for `:name`.
2. Keep only rows whose `LINDIV` contains `#`.
3. Strip `#` and trim → the set of `DS_PRICING_*` keys to apply (de-duplicated).
4. Build and evaluate that subset.

```
DESCRIPTORVALUES where NAME = 'DS_PRICING_ROUTER'
  ┌─────────┬──────────────┬──────────────────────┐
  │ NODENUM │ CONDITIONID  │ LINDIV               │
  ├─────────┼──────────────┼──────────────────────┤
  │    1    │      0       │ #DS_PRICING_DOOR     │ → key: DS_PRICING_DOOR
  │    2    │      0       │ #DS_PRICING_PANEL    │ → key: DS_PRICING_PANEL
  │    3    │      0       │ #DS_PRICING_POSE     │ → key: DS_PRICING_POSE
  └─────────┴──────────────┴──────────────────────┘
                                    │
                                    ▼
              evaluate only those three descriptors
```

Rows without `#` are ignored, so a router may carry comments or unrelated values.
Different product families get different router names, each charging its own subset of the
`DS_PRICING_*` catalogue.

---

## 7. Relations to other modules

- **Descriptor** — the rule store. `GET /descriptor/:id` returns the same rule shape the
  engine builds internally, making it the debugging view for any `DS_PRICING_*` key.
- **Zone / Product / Elem** — no compile-time coupling; `PricingService` is not injected
  anywhere else. The link is by convention: `namespaces` keys are zone/element names and
  the variables (`ZF_W`, `ZONE_H`, `HAS_DOOR`, `DS_WACA_FR_ART_01`) come from the zone /
  product configuration payload produced elsewhere. The caller assembles the body.
- **IMOS** — indirect. Pricing calls `mat.findOne` / `surf.findOne` directly; the
  `ImosService` `$VAR → WERT` indirection is only used on the `findMatrial` / `findSurface`
  paths, not by pricing.

---

## 8. Adding a new price rule

1. Create a `DESCRIPTOR` row: `NAME = DS_PRICING_<THING>`, `COMMENT = <label shown in UI>`.
2. Add `DESCRIPTORVALUES` rows:
   - `CONDITIONID = 0` for an unconditional base price.
   - `CONDITIONID = <id>` plus matching `OPERATION` and `COMPARISON` rows for conditional ones.
   - Put the price expression in `LINDIV`, e.g. `___PRICE($MAT_1, 4) * $ZF_W * $ZF_H / 1000000`.
3. **Register it in the router** — add a row to the router descriptor (e.g.
   `DS_PRICING_ROUTER`) with `LINDIV = #DS_PRICING_<THING>`. Without this step the rule is
   never evaluated, since pricing only runs through `POST /pricing/:name`.
4. Verify with `POST /pricing/DS_PRICING_ROUTER` and inspect `breakdown` — each matched
   rule appears as its own line with the raw `expression` and resolved `amount`.


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
