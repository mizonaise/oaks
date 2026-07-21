'use client'

import { memo, useMemo } from 'react'
import { type Box as ShapeBox } from './shapeTree'
import {
  ArticleGroupDesigner,
  type GetDataFn
} from '@processandtools/rp-article-designer'
import { useGetArticleQuery, tecniboApi } from '@/lib/store/api/tecniboApi'
import { useAppStore } from '@/lib/store/hooks'

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
  doorOpen,
  showDims = false,
  contrasted = false,
  hidden = false
}: {
  box: ShapeBox
  articleName: string
  doorOpen: boolean
  /** Toggles the article designer's dimension labels. */
  showDims?: boolean
  /** Toggles the article designer's contrast rendering. */
  contrasted?: boolean
  /** Dev-only: when true, skip rendering the article designer entirely. */
  hidden?: boolean
}) {
  const { data: res, isError, error } = useGetArticleQuery(articleName)
  const store = useAppStore()

  if (isError) {
    console.error('Failed to fetch article data:', error)
  }

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
    <group rotation={[0, yaw, 0]}>
      <group
        scale={[MM / SCALE, MM / SCALE, MM / SCALE]}
        position={[0, (-box.h / 2) * MM, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {res && !hidden && (
          <ArticleGroupDesigner
            data={res}
            articleList={[
              {
                name: articleName,
                visibility: true,
                isShadowed: true,
                isContrasted: contrasted,
                isDimensioned: showDims,
                isDoorOpen: doorOpen,
                dimensions: { width, height: box.h, depth },
                variables: box.vars as Record<string, string>
              }
            ]}
            getData={fetchData}
          />
        )}
      </group>
    </group>
  )
})
