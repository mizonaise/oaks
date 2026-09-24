'use client'

import { memo, useCallback, useMemo, useRef } from 'react'
import type * as THREE from 'three'
import { type Box as ShapeBox } from './shapeTree'
import {
  ArticleGroupDesigner,
  type ArticleData,
  type ArticleStats,
  type GetDataFn
} from '@processandtools/rp-article-designer'
import { WireframeSubtree } from './WireframeSubtree'
import { ArticleMaterials } from './ArticleMaterials'
import { MasqueOtman } from './MasqueOtman'
import { DecoupeOtman, type DecoupeDemandee } from './DecoupeOtman'
import { tecniboApi } from '@/lib/store/api/tecniboApi'
import { useAppStore } from '@/lib/store/hooks'
import { elementsSpeciaux, facadesDuDesigner, type CotesFacade, type ElementOtman } from '@/lib/foxcad/chemin-otman'

const MM = 1
const SCALE = 0.001

// Yaw (rotation around the vertical Y axis) so the article faces the
// direction declared by its nearest `clickable` ancestor. FRONT is the
// default orientation (no extra yaw).
const FACING_YAW: Record<string, number> = {
  FRONT: 0,
  RIGHT: Math.PI / 2,
  BACK: Math.PI,
  LEFT: -Math.PI / 2
}

export const ArticleInBox = memo(function ArticleInBox ({
  box,
  articleName,
  articleData,
  hasDoor = true,
  doorOpen,
  doorsRemoved = false,
  showDims = false,
  contrasted = false,
  hidden = false,
  wireframe = false,
  horsPanneaux
}: {
  box: ShapeBox
  articleName: string
  /** The shape-wide article bundle, fetched server-side by the page. Null/
   *  undefined when there is none, in which case no designer is mounted. */
  articleData?: ArticleData | null
  /** Whether the designer builds the article with a door at all. */
  hasDoor?: boolean
  doorOpen: boolean
  /** Banc de rendu: render the article without its doors (interior visible). */
  doorsRemoved?: boolean
  /** Toggles the article designer's dimension labels. */
  showDims?: boolean
  /** Toggles the article designer's contrast rendering. */
  contrasted?: boolean
  /** Dev-only: when true, skip rendering the article designer entirely. */
  hidden?: boolean
  /** Dev-only: draw the designer's meshes as wireframes. The designer has no
   *  wireframe option of its own, so the flag is applied to the materials it
   *  builds — see `WireframeSubtree`. */
  wireframe?: boolean
  /**
   * Le chemin d'Otman sur une forme fox-cad (23/09) : le designer est monté, mais ses PANNEAUX sont masqués à chaque image (`MasqueOtman`) —
   * ils viennent de fox-cad — et seuls ses rendus spéciaux restent (tringle, façade spéciale quand fox-cad n'a pas la porte, poignée GLB).
   * `index` = la boîte de la zone (le bilan va au magasin sous ce nom), `porteParFoxCad` = fox-cad a produit la porte de cette zone.
   * `decoupe` (23/09, les portes en pente) : la façade spéciale du designer est à découper par le contour de la porte pleine de fox-cad
   * (`DecoupeOtman`) — présent quand le moteur a refusé la façade (le KMS multi-pièces), absent sinon.
   */
  horsPanneaux?: { index: string; porteParFoxCad: boolean; decoupe?: DecoupeDemandee }
}) {
  const store = useAppStore()
  const groupRef = useRef<THREE.Group | null>(null)
  // les éléments spéciaux que le designer annonce (ses statistiques de panneaux, débouncées) — lus par le masque à chaque image
  const speciaux = useRef<ElementOtman[]>([])
  const facades = useRef<CotesFacade[]>([])
  const onStats = useCallback((s: ArticleStats) => {
    speciaux.current = elementsSpeciaux(s.panels)
    facades.current = facadesDuDesigner(s.panels)
  }, [])

  // Data loader for the article designer, backed by RTK Query instead of a
  // hand-rolled fetch + cache: dispatching `initiate` reuses the store's cache
  // and in-flight dedup, so repeated (endpoint, id) requests share one request.
  const fetchData = useMemo<GetDataFn>(
    () =>
      ((endpoint, id) => {
        const result =
          endpoint === 'material-data'
            ? store.dispatch(tecniboApi.endpoints.getMaterialData.initiate(id))
            : store.dispatch(tecniboApi.endpoints.getSurfaceData.initiate(id))
        return result.unwrap().catch(() => undefined)
      }) as GetDataFn,
    [store]
  )

  // console.log('render ArticleInBox', { articleName, vars: box.vars })

  const yaw = box.clickable ? FACING_YAW[box.clickable] ?? 0 : 0

  // A 90° yaw (LEFT/RIGHT) swaps the article's local width and depth axes
  // relative to the box, so feed the designer the swapped dimensions.
  const sideways = box.clickable === 'LEFT' || box.clickable === 'RIGHT'
  const width = sideways ? box.d : box.w
  const depth = sideways ? box.w : box.d

  // console.log('ArticleInBox', {
  //   articleName,
  //   vars: JSON.stringify(box.vars)
  // })

  // console.log('contrasted data', { contrasted })

  return (
    <group rotation={[0, yaw, 0]} ref={groupRef}>
      {/* Material overlay: corrects the article renderer's materials in place
          (roughness, sRGB textures, anisotropy) — see ArticleMaterials.tsx. */}
      <ArticleMaterials target={groupRef} contrasted={contrasted} />
      {horsPanneaux && <MasqueOtman target={groupRef} index={horsPanneaux.index} porteParFoxCad={horsPanneaux.porteParFoxCad} speciaux={speciaux} facades={facades} />}
      {horsPanneaux?.decoupe && <DecoupeOtman target={groupRef} index={horsPanneaux.index} demande={horsPanneaux.decoupe} facades={facades} />}
      <group
        scale={[MM / SCALE, MM / SCALE, MM / SCALE]}
        position={[0, (-box.h / 2) * MM, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {articleData && !hidden && (
          <WireframeSubtree enabled={wireframe}>
            <ArticleGroupDesigner
              data={articleData}
              articleList={[
                {
                  name: articleName,
                  visibility: true,
                  // A wireframe casting a solid shadow reads wrong, and the
                  // designer's own shadows are baked from its solid meshes.
                  isShadowed: !wireframe,
                  hasDoor: hasDoor && !doorsRemoved,
                  isContrasted: contrasted,
                  isDimensioned: showDims && !horsPanneaux,
                  isDoorOpen: doorOpen,
                  dimensions: { width, height: box.h, depth },
                  variables: box.vars as Record<string, string>
                }
              ]}
              getData={fetchData}
              onStatsReady={horsPanneaux ? onStats : undefined}
            />
          </WireframeSubtree>
        )}
      </group>
    </group>
  )
})
