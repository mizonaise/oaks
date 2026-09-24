'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShapeViewer } from '@/components/scene/ShapeViewer'
import { TexturesEchelle } from '@/components/scene/TexturesEchelle'
import { resolveVariables } from '@/lib/form/variables'
import { evalExpr } from '@/lib/form/expr'
import type { FlatVars } from '@/lib/form/expr'
import { setShapeData } from '@/lib/shape/registry'
import { isCaptureMode, setFiche } from '@/lib/pipeline/bridge'
import { buildShapeXml, downloadXml, downloadJson, downloadTsv } from '@/lib/shape/xmlExport'
import { lignesPieces, piecesParFoxCad, positionsFoxCad, resumeLot, tsvPieces } from '@/lib/foxcad/lot'
import { useCalculFoxCad } from '@/lib/foxcad/useCalculFoxCad'
import { usePortesPleines } from '@/lib/foxcad/portes-pleines'
import { usePoignees } from '@/lib/foxcad/poignees'
import { direPto } from '@/lib/foxcad/pto'
import { estVide } from '@/lib/foxcad/geometrie'
import { indicesMultipart, multipartDePosition } from '@/lib/foxcad/multipart'
import { direCheminOtman, direFacade, direZoneOtman, estHorsPanneau, genrePieceFoxCad, useCheminOtman } from '@/lib/foxcad/chemin-otman'
import { estErreur } from '@/lib/foxcad/types'
import { CHEMIN_API_FOXCAD } from '@/lib/foxcad/api'
import { versRelais } from '@/lib/media/relais'
import { commitDuFront, empreintesServies, prixDeLaCharge, type VersionsDeLaCharge } from '@/lib/panier/charge'
import { lireTaxe } from '@/lib/prix/taxe'
import type { ShapeData } from '@/lib/shape/schema'
import type { ShapeResponse } from '@/lib/store/api/tecniboApi'
import type { ArticleData } from '@processandtools/rp-article-designer'

import { ConfiguratorPreviewDialog } from '@oak-some/configurator-previewer'
import {
  PriceBreakdown,
  PriceDetails,
  PriceDisplay,
  DEFAULT_COUNTRY,
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
/**
 * Variables du formulaire dont la valeur est une FORMULE sur d'autres variables (`path` = "($ZM_W - … - 50)").
 *
 * Défaut mesuré le 2026-09-20 sur OS_SHAPE_L : le formulaire publié évalue ces formules lui-même, sans connaître les
 * variables `$…` de la forme — il émet `ZMA_W = -50` (soit 0 − 0 − 0 − 50) au lieu de 2925. `ZM_STEP` vaut alors
 * −10 et la grande aile du L ne se découpe plus en colonnes : une seule façade sans joint. L'aile en retour n'a pas le
 * défaut parce que le formulaire ne surcharge pas `ZLA_W`.
 *
 * Remède : quand le formulaire émet une telle variable, on garde la FORMULE ; `resolveVariables` l'évalue ensuite avec
 * toutes les variables. Si un même nom a plusieurs formules (selon l'option choisie), on retient celle dont l'évaluation
 * « à vide » redonne la valeur émise ; à défaut, on laisse la valeur émise.
 */
function formulesDuFormulaire (form: unknown): Map<string, string[]> {
  const out = new Map<string, string[]>()
  const voir = (o: unknown) => {
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o)) { o.forEach(voir); return }
    const r = o as Record<string, unknown>
    if (typeof r.name === 'string' && typeof r.path === 'string' && !r.path.startsWith('.') && r.path.includes('$')) {
      const liste = out.get(r.name) ?? []
      if (!liste.includes(r.path)) liste.push(r.path)
      out.set(r.name, liste)
    }
    for (const v of Object.values(r)) voir(v)
  }
  voir(form)
  return out
}

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

/** Stable empty default for `initialValues`: an inline `= {}` would mint a new
 *  object each render, needlessly rerunning the form's seeding memos. */
const NO_INITIAL_VALUES: Record<string, string> = {}

export function ShapeConfigurator ({
  dev = false,
  shapeName,
  shape: remoteShape,
  articleData,
  initialValues = NO_INITIAL_VALUES,
  country
}: {
  dev?: boolean
  shapeName: string
  /** The shape payload, fetched server-side by the page (see `fetchShape`) so
   *  the shape endpoint never shows up as a browser request. */
  shape: ShapeResponse
  /** The shape's article bundle, likewise fetched server-side. `null` when the
   *  rp-engine had nothing (or the request failed): the scene then draws no
   *  articles rather than failing. */
  articleData?: ArticleData | null
  /** `?country=` from the shape URL, selecting the price list. Defaults to
   *  `DEFAULT_COUNTRY` (BE) when absent. */
  country?: string | null
  /** Form seeds, resolved server-side by the page so they are present on the
   *  very first render: the form seeds itself once from this and ignores later
   *  changes. In production these are the `?id=` template's saved `data.form`
   *  values (see `fetchProductsConfig`); on the dev route, the `?FIELD=value`
   *  pairs of the URL. Empty when there is nothing to seed, and the form then
   *  starts from the shape's own defaults. */
  initialValues?: Record<string, string>
}) {
  // The shape arrives already resolved from the server (`fetchShape` in the
  // page), so there is no loading or error state to handle here: a missing
  // shape became a `notFound()` and a failed request an error boundary, both
  // upstream of this component.

  // Stable reference: the `?? {}` fallback would otherwise mint a fresh object
  // each render, retriggering every useMemo below it.
  const shape = useMemo(
    () =>
      remoteShape.shape as ShapeData & {
        variables?: Record<string, unknown>
      },
    [remoteShape]
  )
  const formExpo = remoteShape.form
  const formules = useMemo(() => formulesDuFormulaire(formExpo), [formExpo])

  // Pricing router name from the shape (e.g. `#DS_PRICING_ROUNTER`); strip the
  // leading `#` before using it as the pricing endpoint segment.
  const pricingName = (remoteShape.pricing ?? '').replace(/^#/, '')

  // Register the remote shape's descriptors/cps BEFORE any child runs walkZone
  // / cp resolution. Calling synchronously in the render body (not inside a
  // useMemo) avoids any chance of useMemo cache + Strict-Mode replay leaving
  // the registry pointed at the previous shape.
  setShapeData(shape)

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

  // Which screen the form panel shows, mirroring the kit's `etat.ecran`
  // (`options` | `prix`): the price bar's Question Box toggles between them.
  const [showPriceDetails, setShowPriceDetails] = useState(false)
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
  const pricing = usePricing(resolvedScopes, shape, pricingName, country)

  // 24/09 (la charge du panier, `lib/panier/charge.ts`) : les empreintes du
  // formulaire et de la forme que l'API a servis, une fois par réponse — elles
  // vont dans `versions` du message `addToCart`.
  const [empreintes, setEmpreintes] = useState<Pick<VersionsDeLaCharge, 'arbre' | 'forme'>>({ arbre: null, forme: null })
  useEffect(() => {
    let actif = true
    void empreintesServies(remoteShape.form ?? null, remoteShape.shape ?? null).then(e => {
      if (actif) setEmpreintes(e)
    })
    return () => {
      actif = false
    }
  }, [remoteShape])

  // The main Set's model name (`Pname` / `___MODEL_NAME`) comes from the shape's
  // own declared `name` (e.g. OAKSOME_SHAPE_FR), not the `shapeName` lookup key
  // the configurator was mounted with — those can differ. Falls back to the key.
  const modelName = shape.name || shapeName || 'SHAPE'

  // B3 (22/09, décision de Dorian) : pour HEX et HEX 2 SEULEMENT, les pièces de la scène viennent de fox-cad — les mêmes Sets que le XML
  // (`collectSets`), en UNE requête `POST /calcul/lot` (`/api/foxcad`), recalculée 250 ms après le dernier changement du formulaire ; les cinq
  // formes de production gardent le designer d'Otman. On attend la première émission du formulaire (sinon le lot ne porterait que les cotes).
  const parFoxCad = piecesParFoxCad([shapeName, shape.name])
  const formulaireAEmis = formExpo === null || Object.keys(nestedUpdates).length > 0
  const positionsLot = useMemo(
    () => (parFoxCad && remoteShape && formulaireAEmis ? positionsFoxCad(nestedUpdates, modelName, shape, resolvedScopes) : []),
    [parFoxCad, remoteShape, formulaireAEmis, nestedUpdates, modelName, shape, resolvedScopes]
  )
  const calcul = useCalculFoxCad(parFoxCad && positionsLot.length > 0, positionsLot)
  // 23/09 (les portes en pente) : pour les positions dont la façade spéciale est un manque (KMS multi-pièces), la porte PLEINE que fox-cad
  // rend pour la même position — son contour découpe la façade du designer d'Otman dans la scène (rendu, pas calculé)
  const portesPleines = usePortesPleines(calcul.positions, calcul.reponse)
  const foxcadScene = useMemo(
    () => (parFoxCad ? { positions: calcul.positions, reponse: calcul.reponse, portesPleines } : null),
    [parFoxCad, calcul.positions, calcul.reponse, portesPleines]
  )
  const lignesFoxCad = useMemo(() => lignesPieces(calcul.positions, calcul.reponse), [calcul.positions, calcul.reponse])
  // 23/09 : le lot de chaque position accompagne la réponse (la toile d'une façade multipart s'y lit)
  const resumeFoxCad = useMemo(() => resumeLot(calcul.reponse, calcul.positions.map(p => p.lot)), [calcul.reponse, calcul.positions])
  const handleDownloadTsv = useCallback(() => {
    downloadTsv(`${modelName}_pieces-fox-cad_${Date.now()}.tsv`, tsvPieces(lignesFoxCad))
  }, [modelName, lignesFoxCad])

  // Export the live changes (nestedUpdates) as an OAKSOME ListBuilder XML,
  // with one Set per article zone resolved from the shape tree.
  const handleDownloadXml = useCallback(() => {
    // One timestamp for the whole export, so the filename and the XML's own
    // order number / display date all refer to the same instant.
    const now = Date.now()
    const xml = buildShapeXml(
      nestedUpdates,
      modelName,
      shape,
      resolvedScopes,
      now
    )
    downloadXml(`${modelName}_${now}.xml`, xml)
  }, [nestedUpdates, modelName, shape, resolvedScopes])

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

  // Pipeline de rendu (2026-09-14): under `?capture=1` the page publishes the
  // configuration it is showing, so an image is never separated from what it
  // depicts. Raw values and the configurator's own labels only — the fiche
  // states what the configurator knows and invents nothing: the marketing
  // names of collections and finishes are not in this app yet (they are the
  // material-base gap of the pipeline note), and a plausible guess here would
  // travel all the way into a product image.
  useEffect(() => {
    if (!isCaptureMode()) return
    setFiche(() => ({
      config: {
        shape: shapeName,
        modele: modelName,
        pricing: pricingName || null,
        capture_le: new Date().toISOString()
      },
      valeurs: formValues,
      libelles: labels
    }))
    return () => setFiche(null)
  }, [shapeName, modelName, pricingName, formValues, labels])

  // Build the full payload posted to the parent window: the XML export, the
  // raw form values, the resolved shape scopes, the exact pricing-endpoint
  // request body, and a PNG snapshot of the canvas. 24/09 (ligne du lead 11:0x,
  // « tout donner à Rachid ») : puis notre prix HT et son détail, la taxe du
  // bandeau, les versions — `lib/panier/charge.ts`, relevé
  // `docs/releves/2026-09-24_charge-panier.md` (le site garde tout dans Odoo).
  const buildMessagePayload = useCallback(
    (action: 'addToCart' | 'fav') => {
      const name = shapeName || 'SHAPE'
      // One timestamp for the whole export, so the filename and the XML's own
      // order number / display date all refer to the same instant.
      const now = Date.now()
      const xmlContent = buildShapeXml(
        nestedUpdates,
        modelName,
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
        shape: toPricingRequest(
          resolvedScopes,
          shape,
          country ?? DEFAULT_COUNTRY
        ),
        xmlFile: {
          // Named for the model inside it, matching the standalone XML download.
          filename: `${modelName}_${now}.xml`,
          content: xmlContent
        },
        // PNG snapshot of the current 3D view, as a data URL.
        image: captureCanvasRef.current?.() ?? null,
        // Le HT de notre moteur et son détail par groupe — `null` si le prix de
        // CETTE configuration n'est pas encore rendu (un recalcul en cours) —,
        // puis `tva` et `pays` : ceux du bandeau (l'adresse, sinon BE / 21).
        ...prixDeLaCharge(
          pricing.data,
          !pricing.isLoading && !pricing.isError && pricing.data !== undefined,
          lireTaxe(window.location.search)
        ),
        // L'arbre et la forme servis (leurs empreintes), le commit du front.
        versions: { ...empreintes, front: commitDuFront() }
      }
      return res
    },
    // `formValues` et `labels` ajoutés le 24/09 : la charge les envoie (`form`, `description`), ils manquaient à la liste
    [nestedUpdates, shapeName, modelName, shape, resolvedScopes, pricingName, country, formValues, labels, pricing.data, pricing.isLoading, pricing.isError, empreintes]
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

  return (
    <div
      className={`flex flex-col flex-1 font-sans min-h-screen${
        dev ? ' bg-zinc-50 dark:bg-black' : ''
      }`}
    >
      {/* Dev keeps breathing room around the debug toolbar and panels; production
          renders the configurator flush to the viewport edges. */}
      <main
        className={`flex flex-1 w-full flex-col${
          dev ? ' gap-6 p-6 bg-white dark:bg-black' : ''
        }`}
      >
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
            {parFoxCad && (
              <button
                type='button'
                onClick={handleDownloadTsv}
                title='les pièces que fox-cad a rendues pour cette configuration, une ligne par pièce (Set, article, nom, définition, cotes, position, orientation, contour)'
                className='inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'
              >
                Download pieces TSV
              </button>
            )}
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
        {/* `minmax(0,…)` on both tracks, not a bare `2fr_1fr`: an `fr` track's
            default minimum is `auto`, so a track grows to fit its widest
            content instead of holding its share. The form column holds the
            previewer, whose option rows and tab bar are wide, which stretched
            the track past the viewport and gave the page a horizontal
            scrollbar — `minmax(0,2fr)`/`minmax(0,1fr)` lets the tracks shrink
            and the content wrap or scroll inside them instead. */}
        <div className='grid grid-cols-1 gap-x-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] min-w-0'>
          {/* 1: canvas */}
          <div className='relative min-w-0'>
            {/* Price, mobile only: floats over the top of the canvas. Hidden
                from `lg` up, where the copy in the form column takes over.
                The wrapper is `pointer-events-none` so the empty space beside
                the price doesn't swallow canvas drags; `[&>section]:` turns
                events back on for the price card itself, keeping its details
                button tappable. */}
            <div className='pointer-events-none absolute inset-x-0 top-0 z-10 lg:hidden [&>header]:pointer-events-auto'>
              <PriceDisplay
                pricing={pricing}
                detailsOpen={showPriceDetails}
                onToggleDetails={() => setShowPriceDetails(open => !open)}
              />
            </div>
            {parFoxCad && (
              <FoxCadBadge etat={calcul.etat} message={calcul.message} dureeMs={calcul.dureeMs} resume={resumeFoxCad} />
            )}
            <ShapeViewer
              dev={dev}
              shape={shape}
              articleData={articleData}
              scopes={resolvedScopes}
              valeurs={formValues}
              selectedName={selectedZone}
              showHierarchy={showHierarchy}
              onCaptureReady={fn => {
                captureCanvasRef.current = fn
              }}
              foxcad={foxcadScene}
            />
            {/* nuit du 22 au 23/09 : les échelles de texture en service (mm par répétition, source), pour toutes les formes — dev / banc / capture */}
            <TexturesEchelle dev={dev} />
            {parFoxCad && (
              <>
                <FoxCadDetail calcul={calcul} />
                {/* la liste des pièces telle que la page l'a reçue, pour l'outil de preuve (scripts/preuve-fox-cad.mjs) — jamais rien sur window */}
                <script
                  id='foxcad-pieces'
                  type='application/json'
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(lignesFoxCad).replace(/</g, '\\u003c') }}
                />
              </>
            )}
          </div>

          {/*
            2: form. A fixed-height flex column so the price bar pins to the
            top and the buy row to the bottom, with only the form scrolling
            between them — the kit's panel (`.cfg-panneau`: `.cfg-prix` as a
            `flex: 0 0 auto` header, `.cfg-scroll` in fill, `.cfg-achat`
            pinned at the foot).

            Height: the full window minus the dev gutters, but never below
            `min-h` — on a short window it stops shrinking and the page
            scrolls instead, so the buy row can't crush the form. `dvh` (not
            `vh`) so collapsing mobile browser chrome doesn't clip the row.
            `min-h-0` on the scroller is what actually lets it shrink below
            its content — without it a flex child refuses to overflow.
            `self-start` opts out of the grid's default `stretch`, so the
            explicit height is honoured instead of being grown to the row.

            White on the whole column, as in the kit (`.cfg-panneau`), so the
            price bar, the scrolling form and the buy row read as one panel
            against the beige canvas beside it.
          */}
          <div
            className={`flex min-w-0 flex-col bg-white${
              // Dev lets the column flow with the page instead of pinning to a
              // viewport-height panel, so the debug sections below it stay
              // reachable and the form isn't trapped in its own scroller.
              dev
                ? ''
                : ' lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:min-h-[32rem] lg:self-start'
            }`}
          >
            {/* Desktop copy — the mobile one above the grid covers small screens. */}
            <div className='hidden shrink-0 lg:block'>
              <PriceDisplay
                pricing={pricing}
                detailsOpen={showPriceDetails}
                onToggleDetails={() => setShowPriceDetails(open => !open)}
              />
            </div>

            {/* The scroller: takes the leftover height, scrolls its own
                overflow. It holds whichever screen is showing — the kit swaps
                the panel body the same way (`.cfg-ecran`, configurateur.css:53).
                The form is kept mounted and hidden rather than unmounted, so
                switching screens doesn't reset its state. */}
            <div
              className={`k-scroll--flash flex flex-1 flex-col overflow-x-hidden${
                // Without the column's fixed height (dev), an inner scroller
                // has nothing to scroll against — let it grow with the page.
                dev ? '' : ' min-h-0 overflow-y-auto'
              }`}
            >
              <div className={showPriceDetails ? 'hidden' : 'contents'}>
                {formExpo ? (
                  <ConfiguratorPreviewDialog
                    initialValues={initialValues}
                    onVariableSetChange={vars => {
                      for (const [name, value] of Object.entries(vars)) {
                        const candidates = formules.get(name)
                        const formule =
                          candidates === undefined
                            ? undefined
                            : candidates.length === 1
                            ? candidates[0]
                            : candidates.find(p => evalExpr(p, {}, {}, {}) === Number(value))
                        handleChangeVariables(name, formule ?? value)
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
                      setLabels(
                        flattenLabels(labelSet as Record<string, unknown>)
                      )
                    }}
                    // Auto-switch to the mobile (nested tab-strip) layout below 768px,
                    // desktop above. `layout` is omitted so it doesn't force one mode.
                    responsive
                    // imageSuffix='/public'
                    // les vignettes par l'hôte de la page (lib/media/relais.ts, 23/09 16:5x) : sur le réseau Tecnibo le CDN est refusé au public
                    imagePrefix={versRelais('https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/')}
                    configuratorJson={formExpo}
                  />
                ) : (
                  <p className='rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
                    No configurator form is available for this shape.
                  </p>
                )}
              </div>

              {/* The kit's price-detail screen (4346:24887): it replaces the
                  panel body while open, with the back arrow returning here. */}
              {showPriceDetails && (
                <PriceDetails
                  pricing={pricing}
                  onBack={() => setShowPriceDetails(false)}
                />
              )}
            </div>

            {/* The kit's buy row (`.cfg-achat-row`, 4346:20937/20938): the Buy
                CTA in fill beside the 62px round favourite, gap 8. `shrink-0`
                pins it at full height to the foot of the column. */}
            <div className='k-achat-row mt-6 px-8 shrink-0'>
              <button
                type='button'
                onClick={handleAddToCart}
                className='k-cta-achat'
              >
                <CartIcon />
                Add to cart
              </button>
              <button
                type='button'
                onClick={handleFavorite}
                aria-label='Add to favorites'
                className='k-rond-62'
              >
                <HeartIcon />
              </button>
            </div>
          </div>

          {/* 3: description */}
          <div className='min-w-0  overflow-auto'>
            {dev && Object.keys(labels).length > 0 && (
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

/**
 * LE BADGE DES PIÈCES DE FOX-CAD, sur la scène (B3) : ce que le calcul a rendu — positions, pièces, manques, positions en erreur, durée —
 * ou ce qui l'empêche (l'API ne répond pas, une réponse hors contrat). Jamais caché : un manque du moteur se lit ici, pas dans une console.
 * Les attributs `data-foxcad-*` sont ce que l'outil de preuve lit.
 */
function FoxCadBadge ({
  etat,
  message,
  dureeMs,
  resume
}: {
  etat: 'inactif' | 'en-cours' | 'ok' | 'erreur'
  message: string | null
  dureeMs: number | null
  resume: ReturnType<typeof resumeLot>
}) {
  const aDesPieces = resume.positions > 0
  // B4 ④ : les poignées que la scène dessine sur les portes de fox-cad — GLB d'Otman, ou pastille quand le GLB manque
  const poignees = usePoignees()
  // 23/09 : d'où vient la hauteur de chaque poignée — le MANINFO de l'élément de porte (la règle d'Otman), ou le repli 1 050 − socle quand il manque
  // 24/09 : et celles qu'arrête la GARDE HAUTE d'imos sur une porte coupée (500 sous le haut de la porte à leur aplomb, sous la ligne)
  const texteButee = poignees.butee > 0 ? ` ; ${poignees.butee} à la butée d'imos, 500 sous le haut de la porte` : ''
  const texteHauteur =
    poignees.repli > 0
      ? ` (hauteur : ${poignees.maninfo} par MANINFO, ${poignees.repli} par repli 1 050 − socle, MANINFO absent${texteButee})`
      : poignees.maninfo > 0
        ? ` (hauteur par MANINFO${texteButee})`
        : ''
  // 23/09 19:5x, la règle PTO de Dorian : les portes SANS poignée posée — « PTO : choix » (Push and Open choisi), « PTO : repli » (la zone
  // l'impose), la porte technique d'Otman, « None », la poignée intégrée — dites, jamais une pastille
  const textePto = direPto(poignees)
  const textePoignees =
    (poignees.glb + poignees.pastille === 0
      ? ''
      : ` · poignées : ${poignees.glb > 0 ? `${poignees.glb} GLB` : ''}${poignees.glb > 0 && poignees.pastille > 0 ? ' + ' : ''}${poignees.pastille > 0 ? `${poignees.pastille} pastille${poignees.pastille > 1 ? 's' : ''} (GLB absent)` : ''}${texteHauteur}`) +
    (textePto ? ` · ${textePto}` : '')
  // 23/09 : ce que le chemin d'Otman dessine par-dessus les pièces (façades spéciales, tringles) et ce qu'il masque (ses panneaux)
  const otman = useCheminOtman()
  const texteOtman = direCheminOtman(otman)
  // 23/09 : les pièces d'une façade multipart sont comptées par fox-cad ; dessinées par fox-cad (b) quand chaque sous-pièce a un décor servi, par
  // Otman sinon (a, la règle d'attente) — dit dans le compte
  const dessinePar =
    resume.facadesMultipartFoxCad === resume.facadesMultipart
      ? 'fox-cad'
      : resume.facadesMultipartFoxCad === 0
        ? 'Otman'
        : `fox-cad (${resume.facadesMultipartFoxCad}) et Otman (${resume.facadesMultipart - resume.facadesMultipartFoxCad})`
  // nuit du 23 au 24/09 : la façade COUPÉE que le moteur servira après MD2 (parent à contour) se compte à part — « dont 2 coupées par le moteur »
  const texteCoupees =
    resume.facadesMultipartCoupees > 0 ? `, dont ${resume.facadesMultipartCoupees} coupée${resume.facadesMultipartCoupees > 1 ? 's' : ''} par le moteur` : ''
  const texteMultipart =
    resume.piecesMultipart > 0
      ? ` (dont ${resume.piecesMultipart} de ${resume.facadesMultipart} façade${resume.facadesMultipart > 1 ? 's' : ''} multipart, dessinée${resume.facadesMultipart > 1 ? 's' : ''} par ${dessinePar}${texteCoupees})`
      : ''
  const compte = aDesPieces
    ? `${resume.positions} position${resume.positions > 1 ? 's' : ''} · ${resume.pieces} pièce${resume.pieces > 1 ? 's' : ''}${texteMultipart} · ${resume.manques} manque${resume.manques > 1 ? 's' : ''}` +
      (resume.erreurs > 0 ? ` · ${resume.erreurs} position${resume.erreurs > 1 ? 's' : ''} en erreur` : '') +
      (resume.portesHorsXml > 0 ? ` · ${resume.portesHorsXml} lot${resume.portesHorsXml > 1 ? 's' : ''} hors porte xml` : '') +
      (dureeMs !== null ? ` · ${dureeMs} ms` : '') +
      textePoignees +
      (texteOtman ? ` · ${texteOtman}` : '')
    : ''
  const texte =
    etat === 'erreur'
      ? `erreur — ${message ?? 'sans message'}${aDesPieces ? ` (la scène garde les ${resume.pieces} pièces du dernier calcul réussi)` : ' — aucune pièce dessinée'}`
      : etat === 'en-cours'
        ? `calcul en cours…${aDesPieces ? ` (${compte})` : ''}`
        : etat === 'ok'
          ? compte
          : 'en attente du formulaire'
  const alerte = etat === 'erreur' || resume.manques > 0 || resume.erreurs > 0 || resume.portesHorsXml > 0 || otman.erreurs.length > 0
  return (
    <div
      className='pointer-events-none absolute left-3 top-3 z-10 max-w-[70%]'
      data-foxcad-etat={etat}
      data-foxcad-positions={resume.positions}
      data-foxcad-pieces={resume.pieces}
      data-foxcad-manques={resume.manques}
      data-foxcad-erreurs={resume.erreurs}
      data-foxcad-portes-hors-xml={resume.portesHorsXml}
      data-foxcad-facades-multipart={resume.facadesMultipart}
      data-foxcad-pieces-multipart={resume.piecesMultipart}
      data-foxcad-facades-multipart-foxcad={resume.facadesMultipartFoxCad}
      data-foxcad-facades-multipart-coupees={resume.facadesMultipartCoupees}
      data-foxcad-duree={dureeMs ?? ''}
      data-foxcad-poignees-glb={poignees.glb}
      data-foxcad-poignees-pastille={poignees.pastille}
      data-foxcad-poignees-maninfo={poignees.maninfo}
      data-foxcad-poignees-repli={poignees.repli}
      data-foxcad-poignees-butee={poignees.butee}
      data-foxcad-pto-choix={poignees.ptoChoix}
      data-foxcad-pto-repli={poignees.ptoRepli}
      data-foxcad-pto-technique={poignees.ptoTechnique}
      data-foxcad-poignees-sans={poignees.sans}
      data-foxcad-poignees-integree={poignees.integree}
      data-foxcad-otman-zones={otman.zones.length}
      data-foxcad-otman-facades={otman.facades}
      data-foxcad-otman-modeles={otman.modeles.join(',')}
      data-foxcad-otman-tringles={otman.tringles}
      data-foxcad-otman-autres={otman.autres}
      data-foxcad-otman-panneaux-masques={otman.panneauxMasques}
      data-foxcad-otman-portes-masquees={otman.portesMasquees}
      data-foxcad-otman-maillages-gardes={otman.maillagesGardes}
      data-foxcad-otman-facades-coupees={otman.facadesCoupees}
      data-foxcad-otman-coupees-kms={otman.kmsCoupees.join(',')}
      data-foxcad-otman-coupees-provisoire={otman.facadesCoupees > 0 ? 1 : 0}
      data-foxcad-traverses-en-pente={otman.multipartTraverses.map((t) => t.largeurMm).join(',')}
      data-foxcad-otman-facades-attente={otman.facadesEnAttente}
      data-foxcad-otman-erreurs={otman.erreurs.length}
      data-foxcad-otman-facades-multipart={otman.facadesMultipart}
      data-foxcad-otman-pieces-multipart={otman.piecesMultipart}
      data-foxcad-otman-multipart-foxcad={otman.multipartParFoxCad}
      data-foxcad-otman-multipart-toiles={otman.multipartToiles.join(',')}
      data-foxcad-otman-multipart-cadres={otman.multipartCadres.join(',')}
    >
      <div className={`rounded px-3 py-2 text-xs shadow ${alerte ? 'bg-red-50/95 text-red-800' : 'bg-white/90 text-zinc-700'}`}>
        <span className='font-semibold'>pièces par fox-cad</span>
        <span className='text-zinc-400'> ({CHEMIN_API_FOXCAD}) · </span>
        {texte}
      </div>
    </div>
  )
}

/** le détail du lot, position par position : article, pièces, la porte du lot (xml / taille-seule, avec sa raison), les manques, l'erreur */
function FoxCadDetail ({ calcul }: { calcul: ReturnType<typeof useCalculFoxCad> }) {
  const r = calcul.reponse
  const otman = useCheminOtman()
  const ouvert = calcul.etat === 'erreur' || (r !== null && r.positions.some(p => estErreur(p) || p.manques.length > 0 || (p.lot !== undefined && p.lot.porte !== 'xml')))
  return (
    <details open={ouvert} className='mt-2 rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700'>
      <summary className='cursor-pointer select-none font-semibold'>
        Pièces par fox-cad — le détail du lot{r ? ` (${r.positions.length} positions, ${r.calculees} calculées, ${r.reprises} reprises, ${r.dureeMs} ms côté API)` : ''}
      </summary>
      {calcul.message && <p className='mt-2 text-red-700'>{calcul.message}</p>}
      {!r && !calcul.message && <p className='mt-2 text-zinc-500'>aucune réponse encore.</p>}
      {r && (
        <ol className='mt-2 space-y-1'>
          {r.positions.map((p, i) => {
            const pos = calcul.positions[i]
            const titre = `Set ${pos?.ligne ?? i + 1} · ${pos?.article ?? (estErreur(p) ? p.article : p.article)}${pos?.zone ? ` · ${pos.zone}` : ''}`
            if (estErreur(p)) {
              return (
                <li key={i} className='text-red-700'>
                  {titre} — <strong>{p.erreur}</strong> : {p.message}
                </li>
              )
            }
            const porte = p.lot ? (p.lot.porte === 'xml' ? `porte xml${p.lot.dossierXml ? ` (${p.lot.dossierXml})` : ''}` : `porte ${p.lot.porte}${p.lot.raison ? ` — ${p.lot.raison}` : ''}`) : 'lot non dit'
            // B4 (22/09) : les pièces vides d'imos (PD_EMPTY, épaisseur 0) sont comptées, nommées, jamais dessinées
            // 23/09 : une pièce HORS PANNEAU (la tringle MP_SPP_HC_ELITE_*, 0 mm d'épaisseur chez fox-cad) n'est pas « vide » : fox-cad ne la
            // dessine pas, le chemin d'Otman la dessine (BarHanger) — dit ici, et le bilan de la zone (masque, façades, tringles) avec
            const horsPanneaux = p.pieces.filter(estHorsPanneau)
            // 23/09, la règle d'attente : les pièces d'une façade multipart (la surface d'épaisseur 0 comprise) sont dites à part, pas « vides »
            const idxMultipart = indicesMultipart(p.pieces)
            const multipart = multipartDePosition(p, pos?.lot)
            const vides = p.pieces.filter((v, k) => estVide(v) && !estHorsPanneau(v) && !idxMultipart.has(k)).length
            const zoneOtman = pos ? otman.zones.find(z => z.index === pos.index) : undefined
            return (
              <li key={i}>
                {titre} — {p.pieces.length} pièce{p.pieces.length > 1 ? 's' : ''}
                {vides > 0 && <span className='text-zinc-500' data-foxcad-vides={vides}> (dont {vides} vide{vides > 1 ? 's' : ''}, non dessinée{vides > 1 ? 's' : ''} — PD_EMPTY, épaisseur 0)</span>}
                {multipart && (
                  <span className='text-zinc-500' data-foxcad-multipart={multipart.pieces} data-foxcad-multipart-kms={multipart.kms} data-foxcad-multipart-foxcad={multipart.parFoxCad} data-foxcad-multipart-toile={multipart.toile ?? ''}>
                    {' '}(dont {multipart.pieces} d&apos;une façade multipart {multipart.kms} —{' '}
                    {multipart.parFoxCad === multipart.facades
                      ? `dessinée par fox-cad : cadre ${multipart.cadre ?? '?'}, toile ${multipart.toile ?? 'absente'}${multipart.toileSource === 'lot' ? ` (${'SRF_FR_2_TOP'} du Set)` : ''}`
                      : `comptées, non dessinées par fox-cad : dessin d'Otman${multipart.raisons.length ? ` (${multipart.raisons[0]})` : ''}`}
                    )
                  </span>
                )}
                {horsPanneaux.length > 0 && (
                  <span className='text-zinc-500' data-foxcad-hors-panneau={horsPanneaux.length}>
                    {' '}(dont {horsPanneaux.length} hors panneau : {horsPanneaux.map(h => `${genrePieceFoxCad(h)} ${h.definition ?? ''}`).join(', ')} — pas dessinée par fox-cad, dessinée par le chemin d&apos;Otman)
                  </span>
                )}
                {' · '}<span className={p.lot && p.lot.porte !== 'xml' ? 'text-red-700' : 'text-zinc-500'}>{porte}</span>
                {zoneOtman && (
                  <span
                    className='text-zinc-500'
                    data-foxcad-otman-zone={zoneOtman.index}
                    data-foxcad-otman-porte-foxcad={String(zoneOtman.porteParFoxCad)}
                    data-foxcad-otman-facades={zoneOtman.facades.map(direFacade).join(' ')}
                    data-foxcad-otman-speciaux={zoneOtman.speciaux.map(s => `${s.genre}:${s.cpName}`).join(' ')}
                    data-foxcad-otman-gardes={zoneOtman.maillagesGardes}
                    data-foxcad-otman-decoupe={zoneOtman.decoupe?.etat ?? ''}
                    data-foxcad-otman-decoupe-plans={zoneOtman.decoupe?.coupes ?? ''}
                    data-foxcad-otman-erreur={zoneOtman.erreur ?? ''}
                  >
                    {' · '}{direZoneOtman(zoneOtman)}
                  </span>
                )}
                {p.manques.length > 0 && (
                  <ul className='ml-4 list-disc text-red-700'>
                    {p.manques.map((m, k) => (
                      <li key={k}>{m}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </details>
  )
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
/** Bag (kit `#i-sac`, Tracé_17 16 × 19) — the Buy CTA's icon. */
function CartIcon () {
  return (
    <svg
      className='k-ico-sac'
      viewBox='0 0 16 19'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.3'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M1.6 5.6h12.8l-1 12.4H2.6zM5 5.6V4.2a3 3 0 0 1 6 0v1.4' />
    </svg>
  )
}

/** Heart-plus (kit `#i-coeur-plus`, heart_plus 19,7 × 15,9) — favourite. */
function HeartIcon () {
  return (
    <svg
      className='k-ico-coeur'
      viewBox='0 0 22 18'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M11 16.4S2 11.3 2 5.9C2 3.2 4.1 1.4 6.4 1.4c1.8 0 3.4 1 4.6 2.6 1.2-1.6 2.8-2.6 4.6-2.6 2.3 0 4.4 1.8 4.4 4.5 0 1.1-.3 2.1-.8 3.1M17.8 11.2v5.6M15 14h5.6' />
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
