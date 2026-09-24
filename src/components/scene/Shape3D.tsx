'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'
import {
  OrbitControls,
  OrthographicCamera,
  // OrthographicCamera,
  PerspectiveCamera
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { type Box as ShapeBox, type DimCpConfig } from './shapeTree'
import type { FlatVars } from '@/lib/form/expr'
import { SceneLights } from './SceneLights'
import { GroundShadow } from './GroundShadow'
import { RoomWalls, findCpWalls } from './RoomWalls'
import { BoxItem } from './BoxItem'
import type { ArticleData } from '@processandtools/rp-article-designer'
import { FoxCadPieces } from './FoxCadPieces'
import { SuperpositionOtman } from './SuperpositionOtman'
import type { PositionFoxCad } from '@/lib/foxcad/lot'
import type { ReponseCalculLot } from '@/lib/foxcad/types'
import type { PortesPleines } from '@/lib/foxcad/portes-pleines'
import { PerformanceMonitor, Stats } from '@react-three/drei'
import {
  BANC_DEFAULTS,
  BancContext,
  bancFlags,
  decodeSettings,
  withPerf,
  type BancSettings
} from './banc/BancContext'
import { BancPanel } from './banc/BancPanel'
import { CameraPreset } from './banc/CameraPreset'
import { HumanShadow } from './banc/HumanShadow'
import { Dimensions } from './banc/Dimensions'
import { InteriorDims } from './banc/InteriorDims'
import { ViewerControls } from './ViewerControls'
import { CaptureBridge } from './capture/CaptureBridge'
import { CaptureRig } from './capture/CaptureRig'
import {
  installBridge,
  isCaptureMode,
  priseDemandee,
  valeursCourantes,
  setCapture as registerCapture,
  setVue as registerVue
} from '@/lib/pipeline/bridge'
import { modeleScene } from '@/lib/pipeline/scene'
import {
  colonneAOuvrir,
  lumierePour,
  prise as prisePar,
  type ModeImage,
  type PriseSpec
} from '@/lib/pipeline/stations'
import { WalkMode, type WalkLimits } from './WalkMode'
import { clampedAzimuth, eyeHeight, frameUnit, polarLimits } from './framing'
import { perfProfile, type PerfProfile } from './perf'
import { installerRelaisMedia } from '@/lib/media/relais'

// le média de Tecnibo par l'hôte de la page, pour tous les chargeurs de three (les nôtres, le designer d'Otman, special-kms) — avant le
// premier chargement de la scène ; voir `lib/media/relais.ts` (d5, 23/09 16:5x : le réseau Tecnibo bloquait le CDN depuis le public)
installerRelaisMedia()

type Props = {
  dev?: boolean
  /** The shape's article bundle, fetched server-side by the page. */
  articleData?: ArticleData | null
  /** False while the shape's dimensions are still `$VAR` expressions awaiting
   *  the form's variables — the geometry falls back to default sizes until
   *  then, so the opening camera fit waits rather than framing the wrong box. */
  dimsResolved?: boolean
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
  /** Per-CP dimension config: panels whose `cpName` is a key here get an
   *  in-scene label, with the `w`/`h`/`d` flags selecting which of the box's
   *  dimensions to include. */
  dimCpConfig?: DimCpConfig
  /** The zone name the form is currently requesting (`goToZone`). While one is
   *  active the free-look toggle is disabled, since that zone owns the camera. */
  selectedZone?: string | null
  /** Receives a `() => string | null` that snapshots the WebGL canvas as a PNG
   *  data URL (null if the canvas isn't ready). Called on mount so a parent can
   *  capture the current view on demand (e.g. for add-to-cart). */
  onCaptureReady?: (capture: () => string | null) => void
  /** The configuration panel's values, for the parametric scene model. Passed
   *  as a prop (not read from the bridge) so the model updates with the form:
   *  the bridge's fiche is registered in an effect, i.e. after the first render,
   *  and a model built from an empty map has columns without type or door
   *  (measured 15/09: D09 « aucune colonne à porte » on a five-door unit). */
  valeurs?: Record<string, string>
  /** B3 (22/09) : pour HEX / HEX 2, les pièces de la scène viennent de fox-cad — les positions du lot et la dernière réponse ; `null` = le designer d'Otman */
  foxcad?: { positions: PositionFoxCad[]; reponse: ReponseCalculLot | null; portesPleines?: PortesPleines | null } | null
}

const MM = 1
const SCALE = 0.001

/**
 * The index of the `camera`-declaring zone that governs a box index, found by
 * walking up its ancestors (the box itself, then each shorter dotted-index
 * prefix). `camera` lives only on the declaring node, so a selected descendant
 * resolves to its enclosing camera zone via this lookup.
 *
 * Returns the *zone's* index rather than its `camera` side so callers can frame
 * and cull against the zone itself — the camera stays on the camera zone even
 * when the selection moves to a box inside it.
 * Returns null when no ancestor declares `camera` — i.e. not a camera zone.
 */
function cameraZoneFor (boxes: ShapeBox[], index: string | null): string | null {
  if (!index) return null
  const byIndex = new Map(boxes.map(b => [b.index, b]))
  for (
    let key: string | undefined = index;
    key;
    key = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : undefined
  ) {
    if (byIndex.get(key)?.camera) return key
  }
  return null
}

/**
 * Indexes of boxes to hide so the selected camera zone is seen in isolation:
 * everything outside that zone's subtree. Empty unless the selection resolves
 * to a camera zone.
 *
 * The zone's own subtree stays visible — its ancestors and descendants share
 * its volume, so hiding them would hide the zone itself.
 */
function hiddenForCameraZone (
  boxes: ShapeBox[],
  selectedIndex: string | null
): Set<string> {
  const empty = new Set<string>()
  if (!selectedIndex) return empty
  // Anchor on the governing camera zone, not on the selection. Selecting a zone
  // *inside* a camera zone must not narrow the cull to that inner zone: the
  // camera still frames the whole camera zone, so the zone's other contents stay
  // visible.
  const camZone = cameraZoneFor(boxes, selectedIndex)
  const sel = camZone ? boxes.find(b => b.index === camZone) : undefined
  const camSide = sel?.camera
  if (!sel || !camSide) return empty

  // Is `b` part of the selected zone's own subtree (itself, an ancestor, or a
  // descendant)? Those share the zone's volume and must stay visible.
  const inSubtree = (b: ShapeBox) =>
    b.index === sel.index ||
    b.index.startsWith(`${sel.index}.`) ||
    sel.index.startsWith(`${b.index}.`)

  // Framing a camera zone isolates it: everything outside its subtree is hidden,
  // so the zone is seen alone regardless of where the camera looks from.
  return new Set(boxes.filter(b => !inSubtree(b)).map(b => b.index))
}

const DEFAULT_DIM_CP_CONFIG: DimCpConfig = {
  'CP_1_FI_*': { w: false, h: true, d: false },
  'CP_1_BA_*': { w: false, h: true, d: false },
  'CP_1_CM_*': { w: false, h: true, d: false }
}

export function Shape3D ({
  dev = false,
  articleData,
  dimsResolved = true,
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect,
  dimCpConfig = DEFAULT_DIM_CP_CONFIG,
  selectedZone,
  onCaptureReady,
  valeurs,
  foxcad = null
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  // The underlying <canvas> element, so a parent can snapshot the current view.
  // `preserveDrawingBuffer` (below) keeps the framebuffer readable after the
  // frame, which `toDataURL` needs.
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!onCaptureReady) return
    onCaptureReady(() => {
      const canvas = canvasRef.current
      if (!canvas) return null
      try {
        return canvas.toDataURL('image/png')
      } catch {
        return null
      }
    })
  }, [onCaptureReady])

  // Banc de rendu (2026-09-10): the `banc=1` query mounts the tuning panel and
  // `rendu=` carries a shared setting set. Read once on mount (client only).
  const [banc, setBanc] = useState(false)
  // B4 (22/09) : `?banc=1&panneau=0` — le banc sans son panneau (leva) : les réglages `rendu=` et les champs semés par l'adresse, sans
  // l'interface. Mesuré le 22/09 : hors capture, le panneau fait planter la page (« reading 'path' ») ; le pipeline l'évite par `capture=1`,
  // l'outil de preuve des pages entières (`scripts/preuve-fox-cad.mjs --sans-banc`) passe par ici.
  const [panneau, setPanneau] = useState(true)
  const [chosen, setChosen] = useState<BancSettings>(BANC_DEFAULTS)
  // Pipeline de rendu (2026-09-14): `capture=1` is the headless mode the
  // capture script drives — canvas alone, fixed pixel density, and the
  // `window.__oaks` bridge. It reuses `rendu=` for the settings, so a view is
  // described exactly the same way whether a human or a script opens it.
  const [capture, setCapture] = useState(false)
  // Plan de prises de vue (2026-09-15): `?prise=<id>` names one shot of
  // `lib/pipeline/prises-de-vue.json`. The shot then decides doors, dimension
  // lines and light; the camera is placed by `CaptureRig` from the parametric
  // scene model — the orbit, presets and initial framing stand down.
  const [priseSpec, setPriseSpec] = useState<PriseSpec | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setBanc(params.get('banc') === '1')
    setPanneau(params.get('panneau') !== '0')
    setCapture(isCaptureMode())
    const shared = decodeSettings(params.get('rendu'))
    if (Object.keys(shared).length) setChosen({ ...BANC_DEFAULTS, ...shared })
    const id = priseDemandee()
    setPriseSpec(id && isCaptureMode() ? prisePar(id) : null)
  }, [])

  // The parametric scene model: room, walls, window and light DERIVED from the
  // shape's CPs and the configuration panel (`lib/pipeline/scene.ts`). Read
  // once per geometry; the drawn room (`RoomWalls`) computes the same thing.
  const modele = useMemo(
    () => modeleScene(boxes, { w, h, d }, valeurs ?? valeursCourantes(), SCALE, chosen.ceilingGap),
    [boxes, w, h, d, chosen.ceilingGap, valeurs]
  )

  // The bridge exists only in capture mode (see `lib/pipeline/bridge.ts`): no
  // ordinary page of the configurator ever puts anything on `window`.
  useEffect(() => {
    if (!capture) return
    installBridge()
    return () => {
      registerCapture(null)
      registerVue(null)
      delete window.__oaks
    }
  }, [capture])

  // Hand the canvas snapshot to the bridge. Same `toDataURL` the cart payload
  // already uses — the framebuffer, not a screenshot of the page.
  useEffect(() => {
    if (!capture) return
    registerCapture(() => {
      const canvas = canvasRef.current
      if (!canvas) return null
      try {
        return canvas.toDataURL('image/png')
      } catch {
        return null
      }
    })
  }, [capture])

  // What the browser can afford. Measured on mount, not during render: the
  // static export is prerendered on a machine that is not the user's, and a
  // value read during the first render would be the server's answer.
  const [perf, setPerf] = useState<PerfProfile | null>(null)
  useEffect(() => setPerf(perfProfile()), [])
  // Live correction: `PerformanceMonitor` watches the real frame rate and hands
  // back a 0..1 factor. It only runs when the pixel density is on `auto` and
  // the bench panel is closed — the design team judges a fixed image.
  const [perfFactor, setPerfFactor] = useState(1)
  // In capture mode the density is fixed and the live perf correction is off:
  // the image must depend on the URL alone, never on how fast this machine
  // happened to render. Otherwise two runs of the same view differ in size.
  const autoPerf = chosen.dpr === 'auto' && !banc && !capture

  const settingsBase = useMemo(() => {
    const base = withPerf(chosen, perf ?? perfProfile(), banc || capture)
    if (capture) return { ...base, dpr: 1 as const, stats: false }
    if (!autoPerf || perfFactor >= 1) return base
    // One notch down per decline, never below 1 — under that the canvas is
    // blurrier than the page it sits in.
    // `withPerf` has already resolved `auto`; the guard is for the type only.
    const current = typeof base.dpr === 'number' ? base.dpr : 1
    const dpr = Math.max(1, Math.round(current * perfFactor * 2) / 2) as
      | 1
      | 1.5
      | 2
    return dpr === current ? base : { ...base, dpr }
  }, [chosen, perf, banc, capture, autoPerf, perfFactor])

  // Two layers on top of the bench settings:
  // 1. the scene model's light — the key comes from the window side the model
  //   chose (rule A8), unless the bench moved it explicitly;
  // 2. the shot, when one is named — its doors, its dimension lines, its light.
  //   The image mode (client / schema) still comes from the URL, so a shot's
  //   two twins are the same camera with a different rendering.
  const settings = useMemo<BancSettings>(() => {
    let s = settingsBase
    if (s.keyAz === BANC_DEFAULTS.keyAz && s.keyEl === BANC_DEFAULTS.keyEl) {
      s = { ...s, keyAz: modele.lumiere.keyAz, keyEl: modele.lumiere.keyEl }
    }
    if (!priseSpec) return s
    const mode: ModeImage = s.mode === 'schema' ? 'schema' : 'client'
    const lum = lumierePour(priseSpec.lumiere)
    const portes =
      priseSpec.portes === 'une-ouverte' || priseSpec.portes === 'une-entrouverte'
        ? 'fermees'
        : priseSpec.portes
    const ouverte = colonneAOuvrir(priseSpec, modele.colonnes)
    // Stations du pipeline (couche 3) : tone mapping « neutral » — il garde la teinte des finitions là où ACES
    // les délave (mesuré le 19/09 : ΔE 25-29 entre le rendu et la teinte de la fiche) — et exposition à 1.
    // Ombres PCF et non VSM : mesuré le 20/09, les ombres VSM étouffent la tache de soleil qui passe par la fenêtre
    // (et un mur vu de dos n y projette rien) ; en PCF elle est nette et le rendu quatre fois plus rapide.
    // Ambiance basse : c est la fenêtre qui éclaire, sinon la tache de soleil ne se lit pas.
    const neutre = priseSpec.cadrage === 'station' ? { toneMapping: 'neutral' as const, exposure: 1, shadowType: 'pcf' as const, envIntensity: 0.35, ambient: 0.1, hemi: 0.15, fill: 0.2 } : {}
    return {
      ...s,
      ...neutre,
      camera: 'face',
      doors: portes,
      dims: priseSpec.cotes[mode],
      keyAz: lum.keyAz,
      keyEl: lum.keyEl,
      keyIntensity: lum.keyIntensity,
      doorsOpenOn: ouverte ? String(ouverte.rang) : ''
    }
  }, [settingsBase, modele, priseSpec])

  // Couche 3 : pour une station du pipeline, la lumière vient de la fenêtre du modèle de pièce (coordonnées monde :
  // le groupe du meuble est décalé de (-w/2, 0, -d/2)).
  const fenetreMonde = useMemo(() => {
    if (priseSpec?.cadrage !== 'station' && priseSpec?.cadrage !== 'plan') return null
    const mur = modele.plan.murs.find(m => m.fenetre?.type === 'fenetre' && m.axe === 'x')
    if (!mur?.fenetre) return null
    const f = mur.fenetre
    // Ce qui fait face à la fenêtre : la face intérieure de l'aile d'un L, sinon l'autre bord de la pièce.
    const aile = mur.normale === 1 ? modele.emprise.aile_droite : modele.emprise.aile_gauche
    const enFace = aile
      ? (mur.normale === 1 ? w - aile.largeur_m : aile.largeur_m)
      : (mur.normale === 1 ? modele.piece.x_droite_m : modele.piece.x_gauche_m)
    return {
      portee: Math.abs(enFace - mur.at),
      faceAuMeuble: !!aile,
      margeMeuble: f.centre_m - f.largeur_m / 2 - modele.emprise.p_corps_m,
      centre: [mur.at - w / 2, f.allege_m + f.hauteur_m / 2, f.centre_m - d / 2] as [number, number, number],
      normale: [mur.normale, 0] as [number, number],
      largeur: f.largeur_m,
      hauteur: f.hauteur_m
    }
  }, [priseSpec, modele, w, d])

  // Columns (1-based ranks from the left) whose doors open on top of `doors`.
  const openIndexes = useMemo(() => {
    const rangs = new Set(
      String(settings.doorsOpenOn ?? '')
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n) && n > 0)
    )
    return modele.colonnes.filter(k => rangs.has(k.rang)).map(k => k.index)
  }, [settings.doorsOpenOn, modele.colonnes])
  const boxDoorOpen = useCallback(
    (index: string) => openIndexes.some(i => index === i || index.startsWith(`${i}.`)),
    [openIndexes]
  )

  const flags = bancFlags(settings)
  const schema = flags.schema
  // Dev-only wireframe toggle: the branch's `mode: 'filaire'` bench setting is
  // a clean equivalent of webapp's old manual `frameOnly` state (same effect —
  // draw the whole box, its CP panels and the article contents as a
  // wireframe), so it drives `BoxItem`'s existing `frameOnly` prop directly
  // rather than keeping a second, independent toggle.
  const frameOnly = flags.wireframe

  // One writer for the mode settings, shared by the viewer toolbar, the bench
  // panel and a `?rendu=` link — so a value can never be true in one and stale
  // in the other.
  const patchSettings = useCallback(
    (patch: Partial<BancSettings>) => setChosen(s => ({ ...s, ...patch })),
    []
  )

  const doorsOpenEff = settings.doors === 'ouvertes'
  const doorsRemovedEff = settings.doors === 'retirees'
  const dimsVisible = settings.dims !== 'aucune'
  const dimLevel = settings.dims === 'aucune' ? 'globales' : settings.dims
  const designerDims = dimsVisible && dimLevel === 'designer'
  // Dev-only: hide the article designer so only the box shell/panels show.
  const [hideArticle, setHideArticle] = useState(false)
  // Dev-only: whether articles are built with doors at all (distinct from
  // `doorsOpenEff`, which only swings the doors that were built). Webapp-only
  // feature — the branch's `BancSettings.doors` ('fermees'/'ouvertes'/
  // 'retirees') only swings/removes doors, it never controls whether the
  // article designer builds them in the first place.
  const [hasDoor, setHasDoor] = useState(true)
  // Dev-only walls toggle. `RoomWalls` no longer takes a `dev` prop (the room
  // is now always the parametric model), so outside dev the walls are always
  // mounted; in dev this simply gates whether `<RoomWalls>` mounts at all.
  const [wallsShown, setWallsShown] = useState(false)

  // Constrain the horizontal orbit so the camera can't swing past a built-in
  // wall and see the unit from outside. A built-in side limits the camera to
  // the corridor between the walls; open sides allow free rotation.
  const controlsRef = useRef<OrbitControlsImpl>(null)
  // The offset group holding the unit (unit-local metres) — measured by the
  // interior dimension chains.
  const unitGroupRef = useRef<THREE.Group | null>(null)

  // The form emits a `goToZone` as soon as it mounts, for whatever zone it
  // opens on. Framing that would drop the user into a close-up of a single
  // (often article-sized) zone instead of the whole unit, so it is ignored;
  // every later request is a real navigation and frames normally.
  //
  // Owned here rather than inside `CameraHandler`, which unmounts whenever
  // free-look is toggled — a ref there would reset and make the next zone
  // request look like the mount-time one again.
  const formRequestSeen = useRef(false)
  // True for the form's very first zone request only.
  const isInitialZoneRequest = useCallback(() => {
    if (formRequestSeen.current) return false
    formRequestSeen.current = true
    return true
  }, [])

  // Set once a zone has actually taken the camera. The branch has no
  // `FitToShape` to hold off (see below), so this is now only informational /
  // for API parity with `CameraHandler`'s webapp-derived signature.
  const claimCameraForZone = useCallback(() => {}, [])

  // The branch's initial framing (`InitialFrame`, driven by `frameUnit`) runs
  // synchronously as soon as the perspective camera mounts, unlike webapp's
  // old async `FitToShape` — so the opening fit is considered done immediately
  // rather than waiting on a callback. `CameraHandler` still takes the ref for
  // API parity / safety.
  const openingFitDone = useRef(true)

  // Free-look: when on, the user drives the camera (clamped by the walls) and
  // zone-camera framing is ignored. Off by default so the configurator keeps
  // its current behaviour of framing whatever zone the form points at.
  const [freeLook, setFreeLook] = useState(false)

  // Walk-through (FPS). Like free-look it takes the camera, and more of it:
  // the orbit itself stands down until the user comes back.
  const [walk, setWalk] = useState(false)
  const leaveWalk = useCallback(() => setWalk(false), [])

  // A zone is actively requested while `selectedZone` is a non-empty name other
  // than "0" (the form's "nothing selected" sentinel). That zone owns the
  // camera, so free-look can't be toggled until it's cleared.
  const zoneActive =
    selectedZone != null &&
    selectedZone !== '' &&
    selectedZone.includes('OV') === false

  // Holding the toggle off while a zone is active would strand the camera in
  // free-look; turn it off as soon as a zone takes over. Same for the walk:
  // the form asking for a zone means the customer is configuring, not visiting.
  useEffect(() => {
    if (zoneActive) {
      setFreeLook(false)
      setWalk(false)
    }
  }, [zoneActive])

  // How far the camera may swing off the shape's centerline before a room wall
  // cuts in front of the unit — one distance per side, null when that side is
  // open. `findCpWalls` reports `at` in the scaled group's local space (0..w)
  // while the orbit target sits at the world origin, so shift by `ox` first.
  // A wall's `sign` is the face it looks along, so it picks the side; the
  // *nearest* wall on each side binds, since that's what blocks the view first.
  const { wallLeft, wallRight } = useMemo(() => {
    const xWalls = findCpWalls(boxes, SCALE).filter(k => k.axis === 'x')
    let wallLeft: number | null = null
    let wallRight: number | null = null
    for (const k of xWalls) {
      const dist = Math.abs(k.at + ox)
      if (k.sign === -1) {
        wallLeft = wallLeft === null ? dist : Math.min(wallLeft, dist)
      } else {
        wallRight = wallRight === null ? dist : Math.min(wallRight, dist)
      }
    }
    return { wallLeft, wallRight }
  }, [boxes, ox])

  // When a zone with a `camera` side is selected, hide every box outside that
  // zone so it is shown on its own.
  const hiddenIndexes = useMemo(
    () => hiddenForCameraZone(boxes, selectedIndex),
    [boxes, selectedIndex]
  )

  // True only when the selected box is itself a `camera`-declaring node. That
  // node is framed, not opened (doors stay shut); selecting a zone *inside* a
  // camera zone is a normal selection and opens its doors.
  const selectedIsCameraNode = useMemo(
    () =>
      selectedIndex != null &&
      Boolean(boxes.find(b => b.index === selectedIndex)?.camera),
    [boxes, selectedIndex]
  )

  // Une porte de fox-cad s'ouvre comme celles du designer (`BoxItem` : `doorOpen || inSelectedSubtree`, sauf sur une zone caméra, cadrée et non ouverte)
  const doorOpenFor = useCallback(
    (index: string) =>
      settings.doors === 'ouvertes' ||
      boxDoorOpen(index) ||
      (selectedIndex != null && !selectedIsCameraNode && (index === selectedIndex || index.startsWith(`${selectedIndex}.`))),
    [settings.doors, boxDoorOpen, selectedIndex, selectedIsCameraNode]
  )

  // Eye height actually used: the setting, capped by the ceiling of a built-in
  // room (a flush ceiling on a low unit is lower than a standing person).
  const eye = eyeHeight(
    settings.camHeight,
    h,
    settings.roomEnabled,
    settings.ceilingGap
  )

  // Pipeline (2026-09-14): publish the view ACTUALLY rendered, not the one
  // asked for — the eye height is capped by the ceiling, and the pixel size is
  // the window's. An image whose framing isn't recorded can't be reproduced,
  // and Flora has to be told the framing it is extending.
  useEffect(() => {
    if (!capture) return
    registerVue(() => {
      const canvas = canvasRef.current
      return {
        prise_id: priseSpec?.id ?? null,
        preset: settings.camera,
        mode: settings.mode,
        portes: settings.doors,
        portes_ouvertes_colonnes: settings.doorsOpenOn || null,
        cotes: settings.dims,
        fov_v_deg: settings.fov,
        oeil_m: eye,
        oeil_demande_m: settings.camHeight,
        densite: settings.dpr,
        lumiere: { cle_azimut_deg: settings.keyAz, cle_elevation_deg: settings.keyEl, cle_intensite: settings.keyIntensity },
        piece: {
          activee: settings.roomEnabled,
          jeu_plafond_m: settings.ceilingGap
        },
        murs_m: { gauche: wallLeft, droite: wallRight },
        encombrement_mm: { l: bounds.w, h: bounds.h, p: bounds.d },
        pixels: canvas ? { l: canvas.width, h: canvas.height } : null,
        // The parametric scene model — the same numbers the room is drawn from
        // and the camera stations are tested against.
        scene: {
          installation: modele.installation,
          murs: modele.murs,
          piece: modele.piece,
          fenetre: modele.fenetre,
          cote_ouvert: modele.cote_ouvert,
          lumiere: modele.lumiere,
          fileurs_mm: modele.fileurs_mm,
          colonnes: modele.colonnes,
          cp: modele.cp,
          // Couche 1 (20/09) : la fiche publie ce qui est dessine - murs trouves et emprise des boites.
          emprise: modele.emprise,
          plan: modele.plan,
          cpWalls: modele.cpWalls,
          // B4 (22/09) : les rampants de la pièce (HEX / HEX 2), lus sur les champs du formulaire, et ce que le formulaire dit d'impossible.
          rampants: modele.rampants,
          rampants_remarques: modele.rampants_remarques,
          boites: boxes.map(b => ({ i: b.index, nom: b.name, n: b.depth, x: b.x, z: b.z, w: b.w, d: b.d, h: b.h, art: !!b.isArticle, diag: b.vars ? Object.fromEntries(['ZM_W','ZMA_W','ZM_STEP','ZM_CNT','ZM_CNT_01','IS_ML_N','IS_ML_P','ZL_W','ZLA_W','ZL_STEP','ZL_CNT','ZFR_W','ZFL_W','IS_BI_R','IS_BI_L','FI_1_THK','ZM_D','ZL_D'].map(k => [k, (b.vars as Record<string, unknown>)[k]])) : undefined, cp: b.sides ? Object.fromEntries(Object.entries(b.sides).filter(([, s]) => s?.cp).map(([k, s]) => [k, s!.cp])) : null }))
        }
      }
    })
  }, [capture, settings, eye, wallLeft, wallRight, bounds, modele, priseSpec])

  // Initial framing (banc de rendu 2026-09-10): the whole unit fits the view
  // at fov 35 with a 1.15 margin, seen from a three-quarter left angle at the
  // customer's eye height. The aspect is assumed 16:10 at mount and refined by
  // `InitialFrame` once the canvas knows its real one.
  const initialCamera = useMemo(() => {
    const f = frameUnit({
      bounds: { w, h, d },
      fov: settings.fov,
      eye,
      margin: 1.15
    })
    return {
      distance: f.distance,
      polar: f.polar,
      target: f.target.toArray() as [number, number, number],
      position: f.position.toArray() as [number, number, number]
    }
  }, [w, h, d, settings.fov, eye])

  // Where the walker may go: inside the room, out of the furniture. The room
  // is built by `RoomWalls` from the same numbers, so these bounds are its
  // bounds — floor from the back wall forward, side walls where the shape
  // declares them, a default margin where it does not.
  const walkLimits = useMemo<WalkLimits>(() => {
    const margin = Math.max(0.6, 0.25 * w)
    const roomD = d + Math.max(4, 2.6 * w)
    const clear = 0.3
    return {
      xMin: (wallLeft !== null ? -wallLeft : -(w / 2 + margin)) + clear,
      xMax: (wallRight !== null ? wallRight : w / 2 + margin) - clear,
      zMin: -d / 2 + clear,
      zMax: -d / 2 + roomD - clear,
      unitHalfW: w / 2 + 0.25,
      unitFrontZ: d / 2 + 0.35
    }
  }, [w, d, wallLeft, wallRight])

  return (
    <div
      /*
        Below `lg` the canvas is portrait-capped: `aspect-[1/1.4]` makes the
        height track the width at 1.4×, and `max-h-[calc(100dvh-3rem)]` stops
        a wide phone from pushing it past the window. From `lg` up it takes
        the full window height (minus the dev gutters), matching the form
        column beside it, so `aspect` is released.
      */
      className={
        capture
          ? // Capture mode: the canvas takes the whole window and nothing else
            // is drawn. The script sizes the window (2048×2048), so the canvas
            // is square by construction rather than by cropping afterwards.
            'fixed inset-0 z-[9999] h-screen w-screen overflow-hidden bg-white'
          : `relative aspect-[1/1.1] max-h-[calc(100dvh-3rem)] w-full overflow-hidden rounded lg:aspect-auto lg:h-[calc(100dvh-3rem)] lg:max-h-none${
              dev ? ' border border-zinc-200 dark:border-zinc-800' : ''
            }`
      }
    >
      {!dev && !capture && (
        <ViewerControls
          settings={settings}
          onChange={patchSettings}
          walk={walk}
          onWalk={setWalk}
          walkDisabled={zoneActive}
          freeLook={freeLook}
          onFreeLook={setFreeLook}
          maxEye={eye}
        />
      )}
      {dev && (
        <button
          type='button'
          onClick={() => setHideArticle(open => !open)}
          title={hideArticle ? 'Show article' : 'Hide article'}
          aria-pressed={hideArticle}
          className='absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <EyeIcon off={hideArticle} />
        </button>
      )}
      {dev && (
        <button
          type='button'
          onClick={() => setWallsShown(open => !open)}
          title={wallsShown ? 'Hide walls' : 'Show walls'}
          aria-pressed={wallsShown}
          className='absolute right-3 top-15 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <WallIcon off={!wallsShown} />
        </button>
      )}
      {dev && (
        <button
          type='button'
          onClick={() => setHasDoor(open => !open)}
          title={hasDoor ? 'Remove doors' : 'Add doors'}
          aria-pressed={hasDoor}
          className='absolute right-3 top-27 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800'
        >
          <DoorPanelIcon off={!hasDoor} />
        </button>
      )}
      {banc && panneau && !capture && (
        <BancPanel initial={chosen} external={chosen} onChange={setChosen} />
      )}
      <Canvas
        ref={canvasRef}
        // VSM shadow maps: blurred, wide shadows (charte « soft shadows »)
        // without the PCSS shader patch, which breaks on three r184. Schema
        // mode keeps the crisp PCF shadows the AI pipeline was tuned on.
        shadows={
          !flags.shadows
            ? false
            : schema || settings.shadowType === 'pcf'
            ? 'soft'
            : { type: THREE.VSMShadowMap }
        }
        dpr={flags.dpr}
        // Banc de rendu 2026-09-10: ACES Filmic tone mapping (was NoToneMapping —
        // without it any light > 1 clips and the bright faces block up; the
        // page's beige is matched by the background colour below, not by
        // disabling tone mapping). In schema mode keep the flat, untouched
        // colours the AI pipeline expects.
        // `preserveDrawingBuffer` keeps the framebuffer readable after each
        // frame so `canvas.toDataURL()` can snapshot the current view.
        gl={{
          toneMapping: schema
            ? THREE.NoToneMapping
            : THREE.ACESFilmicToneMapping,
          toneMappingExposure: settings.exposure,
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* The canvas is transparent by default, so the page shows through.
            Paint it with the kit's BACKGROUND token (Light Beige `--fond`,
            #F6F5F0) so the viewer reads as its own surface. `attach` sets
            `scene.background`, which also lands in `toDataURL()` snapshots —
            a CSS background would be missing from those. */}
        <BancContext.Provider value={settings}>
        <color
          attach='background'
          args={[schema ? '#f6f5f0' : settings.background]}
        />
        <ToneMappingSync schema={schema} settings={settings} />
        {autoPerf && (
          // Frame-rate feedback: two declines take the density from 2 to 1.
          // `flipflops` stops it oscillating once it has settled.
          <PerformanceMonitor
            flipflops={3}
            onChange={api => setPerfFactor(api.factor)}
            onFallback={() => setPerfFactor(0.5)}
          />
        )}
        {!dev && !priseSpec && (
          <InitialFrame
            bounds={{ w, h, d }}
            fov={settings.fov}
            eye={eye}
            controlsRef={controlsRef}
            wallLeft={wallLeft}
            wallRight={wallRight}
            margin={dimsVisible ? 1.4 : 1.15}
          />
        )}
        {settings.stats && <Stats />}
        {/* Answers `window.__oaks.ready()`: no loading, camera at rest, and it
            has lasted. Draws nothing. */}
        {capture && <CaptureBridge />}
        {/* The shot plan's camera: measures the rendered geometry, resolves the
            named shot against the scene model, places the camera — no orbit,
            no lerp — and publishes the EFFECTIVE camera for the fiche. */}
        {capture && priseSpec && (
          <CaptureRig
            spec={priseSpec}
            bounds={{ w, h, d }}
            walls={{ left: wallLeft, right: wallRight }}
            room={{ depth: modele.piece.profondeur_m - modele.emprise.p_m, height: modele.piece.hauteur_m }}
            eye={eye}
            unitGroupRef={unitGroupRef}
            colonnes={modele.colonnes}
            scene={modele}
            cotesVisibles={dimsVisible && dimLevel !== 'designer'}
          />
        )}
        <SceneLights radius={Math.hypot(w, h, d) / 2} contrasted={schema} fenetre={fenetreMonde} />
        {/* <OrthographicCamera makeDefault zoom={100} position={[0, h / 2, 100]} /> */}
        {dev ? (
          <OrthographicCamera
            makeDefault
            zoom={100}
            position={[0, h / 2, 100]}
          />
        ) : (
          // Eye-level three-quarter view (charte: no overhead, no low angle):
          // fov 35 instead of 65 (wide-angle distortion), camera at eye height
          // and at the distance that fits the whole unit — see `initialCamera`.
          <PerspectiveCamera
            makeDefault
            position={initialCamera.position}
            fov={settings.fov}
          />
        )}
        {/* <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} /> */}
        <group position={[ox, 0, oz]} ref={unitGroupRef}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map(b => {
              if (b.depth === 0 && !b.isArticle) return null
              // les pièces viennent de fox-cad : les boîtes d'Otman ne dessinent rien (en mode dev, leurs arêtes et la sélection restent)
              if (foxcad && !dev) return null
              return (
                <BoxItem
                  key={b.index}
                  box={b}
                  dev={dev}
                  articleData={articleData}
                  isSelected={b.index === selectedIndex}
                  inSelectedSubtree={
                    selectedIndex != null &&
                    (b.index === selectedIndex ||
                      b.index.startsWith(`${selectedIndex}.`))
                  }
                  isCameraZone={selectedIsCameraNode}
                  onSelect={onSelect}
                  globalVars={globalVars}
                  hidden={hiddenIndexes.has(b.index)}
                  hasDoor={hasDoor}
                  doorOpen={doorsOpenEff || boxDoorOpen(b.index)}
                  doorsRemoved={doorsRemovedEff}
                  dimCpConfig={designerDims ? dimCpConfig : null}
                  showDims={designerDims}
                  contrasted={schema}
                  hideArticle={hideArticle}
                  frameOnly={frameOnly}
                  sansContenu={foxcad !== null}
                />
              )
            })}
            {foxcad && foxcad.reponse && (
              <FoxCadPieces
                positions={foxcad.positions}
                reponse={foxcad.reponse}
                globalVars={globalVars}
                hiddenIndexes={hiddenIndexes}
                doorOpenFor={doorOpenFor}
                doorsRemoved={doorsRemovedEff}
                contrasted={schema}
              />
            )}
            {/* 23/09 : le chemin d'Otman superposé aux pièces de fox-cad — ses panneaux masqués, ses rendus spéciaux gardés (tringle,
                façade spéciale d'une zone sans porte fox-cad, poignée GLB) ; monté dès qu'un calcul a répondu, comme les pièces */}
            {foxcad && foxcad.reponse && (
              <SuperpositionOtman
                boxes={boxes}
                positions={foxcad.positions}
                reponse={foxcad.reponse}
                portesPleines={foxcad.portesPleines ?? null}
                globalVars={globalVars}
                hiddenIndexes={hiddenIndexes}
                doorOpenFor={doorOpenFor}
                doorsRemoved={doorsRemovedEff}
                contrasted={schema}
              />
            )}
          </group>

          {(!dev || wallsShown) && !frameOnly && (
            <Suspense fallback={null}>
              <RoomWalls
                w={w}
                h={h}
                d={d}
                boxes={boxes}
                scale={SCALE}
                contrasted={schema}
                mursOmbre={!!fenetreMonde}
                rampants={modele.rampants}
              />
            </Suspense>
          )}
          {/* Client mode: the room floor (standard material) receives the
              shadow itself; the shadow catcher is only needed in schema mode,
              where the floor is a flat basic material. */}
          {(dev || schema) && <GroundShadow w={w} d={d} />}
          {!dev && !schema && settings.humanShadow && flags.shadows && (
            <HumanShadow w={w} d={d} keyDir={[-0.8, 1.4, 1.2]} />
          )}
          {dimsVisible && dimLevel !== 'designer' && (
            <Dimensions
              w={w}
              h={h}
              d={d}
              boxes={boxes}
              scale={SCALE}
              level={dimLevel}
              walls={{ left: wallLeft !== null, right: wallRight !== null }}
              ceilingFlush={settings.roomEnabled && settings.ceilingGap < 0.3}
            />
          )}
          {/* Interior chains (clear heights between shelves, widths between
              dividers), measured on the rendered geometry — only when the
              interior can be seen. */}
          <InteriorDims
            target={unitGroupRef}
            bounds={{ w, h, d }}
            visible={
              dimsVisible &&
              dimLevel === 'detaillees' &&
              (doorsOpenEff || doorsRemovedEff)
            }
          />
        </group>
        {/* Under a named shot the rig owns the camera outright: no orbit, no
            eye-height sync, no fit margin, no walk, no preset — anything that
            calls `controls.update()` would drag the camera off its station. */}
        {!priseSpec && (
        <OrbitControls
          ref={controlsRef}
          target={initialCamera.target}
          // Banc de rendu 2026-09-10: zoom and rotation are always open (were
          // dev-only / behind the free-look toggle), bounded so the customer
          // can zoom onto a handle but never see the unit from above or below.
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
          enableZoom
          zoomToCursor
          minDistance={dev ? 1 : initialCamera.distance * 0.45}
          maxDistance={dev ? 500 : initialCamera.distance * 2.2}
          // The polar range must contain the framing, or the first `update()`
          // drags the camera off the eye height it was just placed at.
          minPolarAngle={dev ? 0 : polarLimits(initialCamera.polar).min}
          maxPolarAngle={dev ? Math.PI : polarLimits(initialCamera.polar).max}
          enablePan={dev}
          enableRotate
        />
        )}
        {!dev && !walk && !priseSpec && settings.camera === 'auto' && (
          <EyeHeightSync eye={eye} controlsRef={controlsRef} />
        )}
        {!dev && !walk && !priseSpec && (
          <FitMargin
            margin={dimsVisible ? 1.4 : 1.15}
            controlsRef={controlsRef}
          />
        )}
        {!dev && !priseSpec && (
          <WalkMode
            active={walk}
            controlsRef={controlsRef}
            eye={eye}
            limits={walkLimits}
            onExit={leaveWalk}
          />
        )}
        {/* Free-look hands the camera to the user, so the zone framing stands
            down entirely — unmounting it also drops its per-frame lerp. */}
        {!dev && !walk && !priseSpec && settings.camera !== 'auto' && (
          <CameraPreset
            preset={settings.camera}
            bounds={{ w, h, d }}
            walls={{ left: wallLeft !== null, right: wallRight !== null }}
            wallsM={{ left: wallLeft, right: wallRight }}
            controlsRef={controlsRef}
            fov={settings.fov}
            eye={eye}
            margin={dimsVisible ? 1.4 : 1.15}
          />
        )}
        {!dev && !freeLook && !walk && !priseSpec && settings.camera === 'auto' && (
          <CameraHandler
            controlsRef={controlsRef}
            isInitialZoneRequest={isInitialZoneRequest}
            claimCameraForZone={claimCameraForZone}
            openingFitDone={openingFitDone}
            boxes={boxes}
            selectedIndex={selectedIndex}
            ox={ox}
            oz={oz}
            scale={SCALE}
            wallLeft={wallLeft}
            wallRight={wallRight}
          />
        )}
        {!dev && freeLook && !walk && !priseSpec && (
          <WallClamp
            controlsRef={controlsRef}
            wallLeft={wallLeft}
            wallRight={wallRight}
            halfHeight={h / 2.4}
          />
        )}
        </BancContext.Provider>
      </Canvas>
    </div>
  )
}

/**
 * Pulls back when the dimension lines appear, and comes back in when they go.
 *
 * The lines are drawn *outside* the unit, so at the framing that fits the unit
 * alone they fall off the edge of the canvas: measured on the 8 000 mm CMB,
 * turning the cotes on changed nothing on screen but a digit clipped at the
 * left border. The initial framing already knows the answer (margin 1.4 with
 * cotes, 1.15 without) but it runs once, at mount.
 *
 * Scaling the orbit radius rather than re-framing is deliberate: the customer
 * keeps the angle they had chosen, the view just breathes out.
 */
function FitMargin ({
  margin,
  controlsRef
}: {
  margin: number
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
  const camera = useThree(s => s.camera)
  const last = useRef(margin)
  useEffect(() => {
    if (margin === last.current) return
    const ratio = margin / last.current
    last.current = margin
    const controls = controlsRef.current
    if (!controls) return
    const offset = camera.position.clone().sub(controls.target)
    if (offset.lengthSq() < 1e-6) return
    controls.maxDistance = Math.max(
      controls.maxDistance,
      offset.length() * ratio
    )
    camera.position.copy(controls.target).addScaledVector(offset, ratio)
    controls.update()
  }, [margin, camera, controlsRef])
  return null
}

/**
 * Keeps the camera at the eye height while the customer drags the slider,
 * without re-framing: the orbit radius and azimuth are the user's, only the
 * polar angle moves so the eye lands at the asked-for height. Re-running the
 * initial framing instead would throw away whatever rotation they had made.
 */
function EyeHeightSync ({
  eye,
  controlsRef
}: {
  eye: number
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
  const camera = useThree(s => s.camera)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const controls = controlsRef.current
    if (!controls) return
    const offset = camera.position.clone().sub(controls.target)
    const radius = offset.length()
    if (radius < 1e-3) return
    const az = Math.atan2(offset.x, offset.z)
    const polar = Math.acos(
      THREE.MathUtils.clamp((eye - controls.target.y) / radius, -0.9, 0.9)
    )
    camera.position
      .set(
        radius * Math.sin(polar) * Math.sin(az),
        radius * Math.cos(polar),
        radius * Math.sin(polar) * Math.cos(az)
      )
      .add(controls.target)
    const limits = polarLimits(polar)
    controls.minPolarAngle = limits.min
    controls.maxPolarAngle = limits.max
    controls.update()
  }, [eye, camera, controlsRef])
  return null
}

function InitialFrame ({
  bounds,
  fov,
  eye,
  controlsRef,
  wallLeft,
  wallRight,
  margin = 1.15
}: {
  bounds: { w: number; h: number; d: number }
  fov: number
  /** Eye height above the floor (m). */
  eye: number
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  wallLeft: number | null
  wallRight: number | null
  /** Fit margin: 1.15 for the unit alone, wider when dimension lines sit around it. */
  margin?: number
}) {
  const camera = useThree(s => s.camera)
  const aspect = useThree(s => s.viewport.aspect)
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    const persp = camera as THREE.PerspectiveCamera
    if (!persp.isPerspectiveCamera) return
    const f = frameUnit({
      bounds,
      fov,
      aspect,
      margin,
      eye,
      wallLeft,
      wallRight
    })
    camera.position.copy(f.position)
    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(f.target)
      controls.minDistance = f.distance * 0.45
      controls.maxDistance = f.distance * 2.2
      const limits = polarLimits(f.polar)
      controls.minPolarAngle = limits.min
      controls.maxPolarAngle = limits.max
      controls.update()
    } else {
      camera.lookAt(f.target)
    }
    done.current = true
  }, [camera, aspect, bounds, fov, eye, controlsRef, wallLeft, wallRight, margin])
  return null
}

/**
 * Keeps the renderer's tone mapping in step with the mode after mount: the
 * `gl` prop only applies at creation, so toggling schema mode would otherwise
 * leave ACES on. Schema mode wants the flat, untouched colours.
 */
function ToneMappingSync ({
  schema,
  settings
}: {
  schema: boolean
  settings: BancSettings
}) {
  const gl = useThree(s => s.gl)
  useEffect(() => {
    const map: Record<string, THREE.ToneMapping> = {
      aces: THREE.ACESFilmicToneMapping,
      agx: THREE.AgXToneMapping,
      neutral: THREE.NeutralToneMapping,
      none: THREE.NoToneMapping
    }
    gl.toneMapping = schema ? THREE.NoToneMapping : map[settings.toneMapping]
    gl.toneMappingExposure = settings.exposure
  }, [gl, schema, settings.toneMapping, settings.exposure])
  return null
}

/**
 * Per-frame orbit clamp that keeps the camera inside the room so it can't swing
 * past a wall, the floor, or the ceiling and see the unit from outside.
 *
 * The camera's offset from the target along an axis is `radius · trig(angle)`.
 * To stay within a half-extent `e` of the (centered) unit we need the offset
 * `≤ e`, giving the angle bound `asin(e / radius)`. We recompute each frame
 * because `radius` changes with zoom.
 *
 * - Azimuth: offset is `distXZ · sin(azimuth)`, bound per side by that side's
 *   wall distance (`wallLeft` bounds negative azimuth, `wallRight` positive).
 *   A side with no wall gets the full quarter turn, past which the camera would
 *   be looking at the unit edge-on.
 * - Polar: offset from the equator is `radius · cos(polar)`, bound by the
 *   floor and ceiling. These are always drawn, so the polar clamp always
 *   applies. `polar = π/2 ± asin(halfHeight / radius)`.
 */
function WallClamp ({
  controlsRef,
  wallLeft,
  wallRight,
  halfHeight
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** Centerline→left-wall distance, or null when that side is open. */
  wallLeft: number | null
  /** Centerline→right-wall distance, or null when open. */
  wallRight: number | null
  halfHeight: number
}) {
  // Writes the current angle limits onto the controls. Returns false when there
  // is nothing to clamp against yet.
  const applyLimits = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return false

    // Derive the limits from the orbit *radius*, not from the camera's current
    // x/z offsets. Rotation preserves the radius, so the bounds hold still while
    // dragging. Measuring the in-plane distance instead feeds back on itself —
    // OrbitControls pushes the camera to satisfy the limit, which changes the
    // distance, which moves the limit — and the view judders at the stops. Only
    // zoom changes the radius, and there a re-derived limit is what we want.
    const radius = controls.object.position.distanceTo(controls.target)
    if (radius <= 0) return false

    // A wall `e` from the centerline is cleared once the camera's x-offset
    // reaches `e`; that offset is `radius · sin(azimuth)`, so the bound is
    // `asin(e / radius)`. Quarter turn on an open side, past which the unit is
    // edge-on. Close in the wall subtends a wider angle, so the range opens up.
    const limit = (wall: number | null) =>
      wall === null
        ? Math.PI / 2
        : Math.min(Math.PI / 2, Math.asin(Math.min(1, wall / radius)))
    controls.minAzimuthAngle = -limit(wallLeft)
    controls.maxAzimuthAngle = limit(wallRight)

    // Polar bound off the same radius, centered on the horizontal equator
    // (π/2), keeping the camera between the floor and ceiling at every zoom.
    const polarHalf = Math.asin(Math.min(1, halfHeight / radius))
    controls.minPolarAngle = Math.PI / 2 - polarHalf
    controls.maxPolarAngle = Math.PI / 2 + polarHalf
    return true
  }, [controlsRef, wallLeft, wallRight, halfHeight])

  // Free-look was just switched on, so the camera sits wherever the last zone
  // framing left it — possibly outside the walls. Set the limits and apply them
  // once, since OrbitControls only enforces them inside `update()`. The frame
  // loop below deliberately does *not* call `update()`, so this is the only
  // place the camera is moved to satisfy the clamp.
  useEffect(() => {
    if (applyLimits()) controlsRef.current?.update()
  }, [applyLimits, controlsRef])

  useFrame(() => {
    applyLimits()
  })

  return null
}

/**
 * Frames the camera onto the selected box. When the selection changes, it
 * looks up the box's `camera` side (inherited from the nearest `camera`
 * ancestor in the zone tree) and animates the camera to face the box's center
 * from that side, lerping both the camera position and the orbit target.
 *
 * Box coords are in mm and the scene group is offset by `[ox, 0, oz]` then
 * scaled by `scale`, so a box point `(x, y, z)` lands at world
 * `(ox + x·scale, y·scale, oz + z·scale)`.
 *
 * Webapp-only zone-camera claiming (kept from before this merge, not present
 * on the branch): the form emits a `goToZone` as soon as it mounts, for
 * whatever zone it opens on. Framing that would drop the user into a
 * close-up of a single (often article-sized) zone instead of the whole unit,
 * so it is ignored (`isInitialZoneRequest`); every later request is a real
 * navigation and frames normally. Likewise a zone claim must wait for the
 * opening fit (`openingFitDone`) — the branch's initial framing is handled
 * synchronously by `InitialFrame`/`frameUnit` rather than an async
 * `FitToShape`, but the ref plumbing is still useful protection against a
 * `goToZone` racing the very first render before dims resolve.
 */
function CameraHandler ({
  controlsRef,
  isInitialZoneRequest,
  claimCameraForZone,
  openingFitDone,
  boxes,
  selectedIndex,
  ox,
  oz,
  scale,
  wallLeft = null,
  wallRight = null
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** True for the form's mount-time `goToZone` only, which is ignored so the
   *  page opens on the whole unit rather than a close-up of one zone. Later
   *  requests are real navigations and frame normally. State lives in the
   *  parent so free-look unmounting this doesn't reset it. */
  isInitialZoneRequest: () => boolean
  /** Called when a zone actually takes the camera. */
  claimCameraForZone: () => void
  /** Whether the opening fit has landed. A zone request arriving before it
   *  must not claim the camera, or the view stays stuck on the fallback
   *  framing. */
  openingFitDone: React.RefObject<boolean>
  boxes: ShapeBox[]
  selectedIndex: string | null
  ox: number
  oz: number
  scale: number
  wallLeft?: number | null
  wallRight?: number | null
}) {
  const { camera } = useThree()

  const isAnimating = useRef(false)
  const targetLookAt = useRef(new THREE.Vector3())
  const targetCameraPos = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!selectedIndex) return
    const box = boxes.find(b => b.index === selectedIndex)
    // `camera` is set only on zones that explicitly define it, so this fires
    // exactly for those zones (not inherited descendants).
    if (!box || !box.camera) return

    // The form's mount-time request: ignore it so the opening fit survives.
    if (isInitialZoneRequest()) return

    // Wait for the opening fit: claiming the camera before the shape has been
    // framed at its real size would strand the view on the fallback framing.
    if (!openingFitDone.current) return

    // From here the camera belongs to this zone.
    claimCameraForZone()

    // Box center in world units. The scene group applies the offset
    // `[ox, 0, oz]` in world units first, then an inner group scales box
    // coords by `scale` — so only the box coords are scaled, not the offset.
    const center = new THREE.Vector3(
      ox + (box.x + box.w / 2) * scale,
      (box.y + box.h / 2) * scale,
      oz + (box.z + box.d / 2) * scale
    )
    targetLookAt.current.copy(center)

    // Box dimensions in world units.
    const bw = box.w * scale
    const bh = box.h * scale
    const bd = box.d * scale

    // Distance needed so the whole zone fits in view, derived from the camera
    // FOV. We fit the two dimensions perpendicular to the viewing axis: the
    // vertical one against the vertical FOV, the horizontal one against the
    // horizontal FOV (vFOV adjusted by aspect). Take the larger so neither is
    // clipped, with a small margin so the zone isn't flush to the edges.
    const side = box.camera.toUpperCase()
    const persp = camera as THREE.PerspectiveCamera
    const aspect = persp.aspect || 1
    // The camera has a `zoom` factor that magnifies the view; fold it into the
    // effective FOV so the fit distance accounts for it (otherwise the zone
    // looks `zoom`× too large and stays zoomed in).
    const zoom = persp.zoom || 1
    const rawVFov = THREE.MathUtils.degToRad(persp.fov ?? 50)
    const tanV = Math.tan(rawVFov / 2) / zoom
    const tanH = tanV * aspect

    // Pick the on-screen width/height of the box for each viewing axis.
    let fitW = bw
    let fitH = bh
    if (side === 'LEFT' || side === 'RIGHT') {
      fitW = bd
      fitH = bh
    } else if (side === 'TOP' || side === 'BOTTOM') {
      fitW = bw
      fitH = bd
    }

    const margin = 1.15
    const distH = fitH / 2 / tanV
    const distW = fitW / 2 / tanH
    const dist = Math.max(distH, distW, 1) * margin

    const offset = new THREE.Vector3()
    switch (side) {
      case 'FRONT': {
        // Banc de rendu 2026-09-10: the front view is a three-quarter view at
        // eye height (charte: no flat elevation, no overhead), not a straight
        // elevation. Same azimuth / polar as the initial framing, kept inside
        // the room walls.
        const az = clampedAzimuth(
          THREE.MathUtils.degToRad(-35),
          dist,
          wallLeft,
          wallRight
        )
        const polar = THREE.MathUtils.degToRad(82)
        offset.set(
          dist * Math.sin(polar) * Math.sin(az),
          dist * Math.cos(polar),
          dist * Math.sin(polar) * Math.cos(az)
        )
        break
      }
      case 'BACK':
        offset.set(0, 0, -dist)
        break
      case 'LEFT':
        offset.set(-dist, 0, 0)
        break
      case 'RIGHT':
        offset.set(dist, 0, 0)
        break
      case 'TOP':
        offset.set(0, dist, 0)
        break
      case 'BOTTOM':
        offset.set(0, -dist, 0)
        break
      default:
        offset.set(0, 0, dist)
    }

    targetCameraPos.current.copy(center).add(offset)

    // Let the orbit controls reach this distance — otherwise `update()` in the
    // lerp loop would clamp the camera back to `maxDistance` and re-zoom in.
    const controls = controlsRef.current
    if (controls && dist > controls.maxDistance) controls.maxDistance = dist

    isAnimating.current = true
  }, [
    selectedIndex,
    boxes,
    ox,
    oz,
    scale,
    controlsRef,
    isInitialZoneRequest,
    claimCameraForZone,
    openingFitDone,
    wallLeft,
    wallRight
  ])

  useFrame(() => {
    if (!isAnimating.current) return
    const controls = controlsRef.current

    const step = 0.08 // lerp factor (higher = faster)
    camera.position.lerp(targetCameraPos.current, step)

    if (controls) {
      controls.target.lerp(targetLookAt.current, step)
      controls.update()
    }

    // Stop once we're close enough, to free the orbit controls again.
    if (camera.position.distanceTo(targetCameraPos.current) < 0.01) {
      isAnimating.current = false
    }
  })

  return null
}

// The customer-facing glyphs moved to `ViewerControls` with their buttons.
// Eye glyph; a slash crosses it out when `off` (article hidden).
function EyeIcon ({ off }: { off: boolean }) {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' />
      <circle cx='12' cy='12' r='3' />
      {off && <path d='M3 3l18 18' />}
    </svg>
  )
}

// Brick-wall glyph; a slash crosses it out when `off` (walls hidden).
function WallIcon ({ off }: { off: boolean }) {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3' y='5' width='18' height='14' rx='1' />
      <path d='M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19' />
      {off && <path d='M3 3l18 18' />}
    </svg>
  )
}

// Door-panel glyph; a slash crosses it out when `off` (article has no door).
function DoorPanelIcon ({ off }: { off: boolean }) {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='5' y='3' width='14' height='18' rx='1' />
      <circle cx='15.5' cy='12' r='1' />
      {off && <path d='M3 3l18 18' />}
    </svg>
  )
}
