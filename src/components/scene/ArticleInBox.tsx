'use client'

import { memo } from 'react'
import { type Box as ShapeBox } from './shapeTree'
import { ArticleGroupDesigner } from '@processandtools/rp-article-designer'
import { useGetArticleQuery } from '@/lib/store/api/tecniboApi'

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
  doorOpen
}: {
  box: ShapeBox
  articleName: string
  doorOpen: boolean
}) {
  const { data: res, isError, error } = useGetArticleQuery(articleName)

  if (isError) {
    console.error('Failed to fetch article data:', error)
  }

  // console.log('render ArticleInBox', { articleName, vars: box.vars })

  const yaw = box.clickable ? FACING_YAW[box.clickable] ?? 0 : 0

  // A 90° yaw (LEFT/RIGHT) swaps the article's local width and depth axes
  // relative to the box, so feed the designer the swapped dimensions.
  const sideways = box.clickable === 'LEFT' || box.clickable === 'RIGHT'
  const width = sideways ? box.d : box.w
  const depth = sideways ? box.w : box.d

  return (
    <group rotation={[0, yaw, 0]}>
      <group
        scale={[MM / SCALE, MM / SCALE, MM / SCALE]}
        position={[0, (-box.h / 2) * MM, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {res && (
          <ArticleGroupDesigner
            data={res}
            articleList={[
              {
                name: articleName,
                visibility: true,
                isDoorOpen: doorOpen,
                dimensions: { width, height: box.h, depth },
                variables: box.vars as Record<string, string>
              }
            ]}
          />
        )}
      </group>
    </group>
  )
})
