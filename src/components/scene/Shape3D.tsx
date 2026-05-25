'use client'

import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ArticleGroupDesigner } from '@processandtools/rp-article-designer'
import * as THREE from 'three'
import { useEffect, useState } from 'react'

const FALLBACK_TEXTURE_URL = '/textures/fallback-texture.jpg'
import { resolveArticleName } from './resolveArticle'
import {
  type Box as ShapeBox,
  type BoxSides as ShapeBoxSides
} from './shapeTree'
import { resolveCp, type ResolvedCp } from './resolveCp'
import type { FlatVars } from '@/lib/form/expr'

type Props = {
  boxes: ShapeBox[]
  bounds: { w: number; h: number; d: number }
  globalVars: FlatVars
  selectedIndex: string | null
  onSelect: (index: string) => void
}

const MM = 1
const SCALE = 0.001

function colorForBox (b: ShapeBox): string {
  if (b.isArticle) return `hsl(${(b.depth * 37) % 360}, 65%, 55%)`
  const hue = (b.depth * 47) % 360
  const sat = 25 + (b.depth % 4) * 10
  const light = 75 - (b.depth % 6) * 6
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

function SceneLights () {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={['#ffffff', '#444444', 0.4]} />
    </>
  )
}

function GroundShadow ({ w, d }: { w: number; d: number }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[w / 2, 0, d / 2]}
      receiveShadow
    >
      <planeGeometry args={[w * 4, d * 8]} />
      <shadowMaterial opacity={0.2} />
    </mesh>
  )
}

function BoxEdges ({
  sx,
  sy,
  sz,
  color,
  selected
}: {
  sx: number
  sy: number
  sz: number
  color: string
  selected: boolean
}) {
  return (
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(sx, sy, sz)]} />
      <lineBasicMaterial color={color} linewidth={selected ? 2 : 1} />
    </lineSegments>
  )
}

function BoxPickMesh ({
  sx,
  sy,
  sz,
  selected,
  onSelect
}: {
  sx: number
  sy: number
  sz: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <mesh
      onClick={e => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <boxGeometry args={[sx, sy, sz]} />
      <meshStandardMaterial
        color='#facc15'
        transparent
        opacity={selected ? 0.25 : 0}
        depthWrite={false}
      />
    </mesh>
  )
}

function ArticleInBox ({
  box,
  articleName,
  isSelected
}: {
  box: ShapeBox
  articleName: string
  isSelected: boolean
}) {
  return (
    <group
      scale={[MM / SCALE, MM / SCALE, MM / SCALE]}
      position={[0, (-box.h / 2) * MM, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ArticleGroupDesigner
        articleList={[
          {
            name: articleName,
            visibility: true,
            isDoorOpen: isSelected,
            dimensions: { width: box.w, height: box.h, depth: box.d },
            variables: box.vars as Record<string, string>
          }
        ]}
      />
    </group>
  )
}

type FaceAxis = 'x' | 'y' | 'z'

// Load `url`; on error (or no url), load `fallbackUrl`. Returns null until
// either resolves so we can keep the mesh mounted with a neutral material.
function useTextureWithFallback (
  url: string | null,
  fallbackUrl: string = FALLBACK_TEXTURE_URL
): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    const apply = (t: THREE.Texture) => {
      if (cancelled) {
        t.dispose()
        return
      }
      t.colorSpace = THREE.SRGBColorSpace
      setTex(t)
    }
    const loadFallback = () =>
      loader.load(fallbackUrl, apply, undefined, () => {
        if (!cancelled) setTex(null)
      })
    if (!url) {
      loadFallback()
    } else {
      loader.load(url, apply, undefined, loadFallback)
    }
    return () => {
      cancelled = true
    }
  }, [url, fallbackUrl])

  useEffect(() => () => tex?.dispose(), [tex])

  return tex
}

function CpPanel ({
  cp,
  axis,
  sign,
  sx,
  sy,
  sz
}: {
  cp: ResolvedCp
  axis: FaceAxis
  sign: 1 | -1
  sx: number
  sy: number
  sz: number
}) {
  const tex = useTextureWithFallback(cp.textureUrl)
  // Thickness in scene units; fall back to 2mm so a 0-thickness cp still shows.
  const t = Math.max(cp.thickness, 2) * MM
  const args: [number, number, number] =
    axis === 'x' ? [t, sy, sz] : axis === 'y' ? [sx, t, sz] : [sx, sy, t]
  const pos: [number, number, number] = [
    axis === 'x' ? sign * (sx / 2 - t / 2) : 0,
    axis === 'y' ? sign * (sy / 2 - t / 2) : 0,
    axis === 'z' ? sign * (sz / 2 - t / 2) : 0
  ]
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={args} />
      {tex ? (
        <meshStandardMaterial map={tex} />
      ) : (
        <meshStandardMaterial color='#888' />
      )}
    </mesh>
  )
}

function BoxSidePanels ({
  sx,
  sy,
  sz,
  sides,
  vars
}: {
  sx: number
  sy: number
  sz: number
  sides: ShapeBoxSides
  vars: FlatVars
}) {
  const faces: Array<{
    cpRef: string | null | undefined
    axis: FaceAxis
    sign: 1 | -1
  }> = [
    { cpRef: sides.top, axis: 'y', sign: 1 },
    { cpRef: sides.bottom, axis: 'y', sign: -1 },
    { cpRef: sides.front, axis: 'z', sign: 1 },
    { cpRef: sides.back, axis: 'z', sign: -1 },
    { cpRef: sides.right, axis: 'x', sign: 1 },
    { cpRef: sides.left, axis: 'x', sign: -1 }
  ]
  return (
    <>
      {faces.map((f, i) => {
        if (!f.cpRef) return null
        const cp = resolveCp(f.cpRef, vars)
        if (!cp) return null
        return (
          <CpPanel
            key={i}
            cp={cp}
            axis={f.axis}
            sign={f.sign}
            sx={sx}
            sy={sy}
            sz={sz}
          />
        )
      })}
    </>
  )
}

function BoxItem ({
  box,
  isSelected,
  onSelect,
  globalVars
}: {
  box: ShapeBox
  isSelected: boolean
  onSelect: (index: string) => void
  globalVars: FlatVars
}) {
  const inset = box.isArticle ? 2 : 0
  const sx = Math.max((box.w - inset) * MM, 0.0001)
  const sy = Math.max((box.h - inset) * MM, 0.0001)
  const sz = Math.max((box.d - inset) * MM, 0.0001)
  const cx = (box.x + box.w / 2) * MM
  const cy = (box.y + box.h / 2) * MM
  const cz = (box.z + box.d / 2) * MM
  const articleName =
    box.isArticle && box.node && box.vars
      ? resolveArticleName(box.node, box.vars)
      : null

  return (
    <group position={[cx, cy, cz]}>
      <BoxEdges
        sx={sx}
        sy={sy}
        sz={sz}
        color={isSelected ? '#facc15' : colorForBox(box)}
        selected={isSelected}
      />
      <BoxPickMesh
        sx={sx}
        sy={sy}
        sz={sz}
        selected={isSelected}
        onSelect={() => onSelect(box.index)}
      />
      {box.sides && (
        <BoxSidePanels
          sx={sx}
          sy={sy}
          sz={sz}
          sides={box.sides}
          vars={box.vars ?? globalVars}
        />
      )}
      {box.isArticle && articleName && box.vars && (
        <ArticleInBox
          box={box}
          articleName={articleName}
          isSelected={isSelected}
        />
      )}
    </group>
  )
}

export function Shape3D ({
  boxes,
  bounds,
  globalVars,
  selectedIndex,
  onSelect
}: Props) {
  const w = bounds.w * MM * SCALE
  const d = bounds.d * MM * SCALE
  const h = bounds.h * MM * SCALE
  const ox = -w / 2
  const oz = -d / 2

  return (
    <div className='h-125 w-full overflow-hidden rounded border border-zinc-200 dark:border-zinc-800'>
      {/* <Canvas camera={{ position: [w * 1.2, h * 0.9, d * 4], fov: 45 }} shadows> */}
      <Canvas shadows>
        <SceneLights />
        <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} />
        <group position={[ox, 0, oz]}>
          <group scale={[SCALE, SCALE, SCALE]}>
            {boxes.map((b, i) => {
              if (b.depth === 0 && !b.isArticle) return null
              return (
                <BoxItem
                  key={`${b.index}-${i}`}
                  box={b}
                  isSelected={selectedIndex === b.index}
                  onSelect={onSelect}
                  globalVars={globalVars}
                />
              )
            })}
          </group>

          <GroundShadow w={w} d={d} />
        </group>
        <OrbitControls
          target={[0, h / 2, 0]}
          enableDamping
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  )
}
