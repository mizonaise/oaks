'use client'

import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { DimLine, fmt } from './Dimensions'

/**
 * Cotes intérieures (banc de rendu, 2026-09-10) — measured on the geometry the
 * article renderer actually draws, not on the shape tree (which stops at the
 * article): the clear heights between shelves in each column, and the clear
 * widths between vertical dividers in each row.
 *
 * Method: every mesh inside the unit's bounds is classified by its world box —
 * a thin horizontal slab is a shelf / top / bottom, a thin vertical slab is a
 * side / divider, a thin front-to-back slab is a back. Shelves are grouped into
 * columns by x-overlap, dividers into rows by y-overlap; consecutive members
 * give the clear gaps.
 *
 * Overlap rules (« attention au chevauchement », Dorian 10/09):
 * - a gap under MIN_LABEL gets its line and ticks but no figure;
 * - a column chain sits 60 mm in front of the unit at the column centre, and
 *   two chains closer than 500 mm in x alternate their offset (±120 mm);
 * - row chains sit on the top of the bottom-most row only (one per column
 *   group), so they never cross the height chains;
 * - only rendered when the interior is visible (doors open or removed) — a
 *   figure floating over a closed door has no referent.
 */

const MM = 0.001
const THIN = 0.045 // ≤ 45 mm = a panel
const MIN_SPAN = 0.15 // ignore slivers (fillers, edge bands)
const MIN_LABEL = 0.12 // gaps under 120 mm keep the line, drop the figure
const FRONT = 0.06

type Slab = { min: THREE.Vector3; max: THREE.Vector3 }
type Chain = { x: number; y0: number; y1: number; z: number; label: string; kind: 'h' | 'w'; x0?: number; x1?: number }

function overlap (a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

/** Build the interior chains from the meshes found under `root`, in `root`'s
 *  local metres (the scene group is offset then scaled; we work in the offset
 *  group's frame, so boxes are converted with `toLocal`). */
function measure (root: THREE.Object3D, toLocal: THREE.Matrix4, bounds: { w: number; h: number; d: number }): Chain[] {
  const shelves: Slab[] = []
  const dividers: Slab[] = []
  const box = new THREE.Box3()
  root.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return
    const mat = mesh.material as THREE.Material
    if (!mat || (mat as THREE.MeshStandardMaterial).wireframe) return
    if (!mat.visible || ((mat as THREE.Material).transparent && (mat as THREE.Material).opacity < 0.2)) return
    box.setFromObject(mesh)
    if (box.isEmpty()) return
    box.applyMatrix4(toLocal)
    const size = new THREE.Vector3()
    box.getSize(size)
    // Inside the unit (with a little slack), else it's room or props.
    if (box.min.x < -0.05 || box.max.x > bounds.w + 0.05) return
    if (box.min.y < -0.05 || box.max.y > bounds.h + 0.05) return
    if (box.min.z < -0.05 || box.max.z > bounds.d + 0.05) return
    if (size.y <= THIN && size.x >= MIN_SPAN && size.z >= 0.1) {
      shelves.push({ min: box.min.clone(), max: box.max.clone() })
    } else if (size.x <= THIN && size.y >= MIN_SPAN && size.z >= 0.1) {
      dividers.push({ min: box.min.clone(), max: box.max.clone() })
    }
  })

  const chains: Chain[] = []

  // Columns: cluster shelves by x-overlap (≥ 60 % of the smaller span).
  const columns: Slab[][] = []
  for (const s of shelves) {
    const span = s.max.x - s.min.x
    let placed = false
    for (const col of columns) {
      const c = col[0]
      const cs = c.max.x - c.min.x
      if (overlap(s.min.x, s.max.x, c.min.x, c.max.x) >= 0.6 * Math.min(span, cs)) {
        col.push(s)
        placed = true
        break
      }
    }
    if (!placed) columns.push([s])
  }
  columns.sort((a, b) => a[0].min.x - b[0].min.x)
  // Overlap rule n° 1: identical columns are dimensioned ONCE — twelve
  // columns with the same shelves would put 80 figures on the front. A
  // column's signature is its list of clear gaps (rounded to 5 mm); only the
  // first column of each signature gets a chain.
  const seen = new Set<string>()
  for (const col of columns) {
    col.sort((a, b) => a.min.y - b.min.y)
    // Drop duplicates (a shelf and its edge band at the same height).
    const uniq: Slab[] = []
    for (const s of col) if (!uniq.length || s.min.y - uniq[uniq.length - 1].min.y > 0.02) uniq.push(s)
    if (uniq.length < 2) continue
    const gaps: Array<[number, number]> = []
    for (let i = 0; i < uniq.length - 1; i++) {
      const y0 = uniq[i].max.y
      const y1 = uniq[i + 1].min.y
      if (y1 - y0 >= 0.03) gaps.push([y0, y1])
    }
    if (!gaps.length) continue
    const signature = gaps.map(([y0, y1]) => `${Math.round(y0 / 0.005)}-${Math.round(y1 / 0.005)}`).join(',')
    if (seen.has(signature)) continue
    seen.add(signature)
    const cx = (Math.max(...uniq.map(s => s.min.x)) + Math.min(...uniq.map(s => s.max.x))) / 2
    for (const [y0, y1] of gaps) {
      const gap = y1 - y0
      chains.push({ kind: 'h', x: cx, y0, y1, z: bounds.d + FRONT, label: gap >= MIN_LABEL ? fmt(gap / MM) : '' })
    }
  }

  // Rows: cluster dividers by y-overlap, keep the bottom-most row per x range.
  const rows: Slab[][] = []
  for (const v of dividers) {
    const span = v.max.y - v.min.y
    let placed = false
    for (const row of rows) {
      const r = row[0]
      const rs = r.max.y - r.min.y
      if (overlap(v.min.y, v.max.y, r.min.y, r.max.y) >= 0.6 * Math.min(span, rs)) {
        row.push(v)
        placed = true
        break
      }
    }
    if (!placed) rows.push([v])
  }
  rows.sort((a, b) => a[0].min.y - b[0].min.y)
  const bottom = rows[0]
  if (bottom && bottom.length >= 2) {
    bottom.sort((a, b) => a.min.x - b.min.x)
    const uniq: Slab[] = []
    for (const v of bottom) if (!uniq.length || v.min.x - uniq[uniq.length - 1].min.x > 0.02) uniq.push(v)
    const y = Math.max(...uniq.map(v => v.max.y)) + 0.08
    // Overlap rule n° 2: a run of equal widths is dimensioned once, with the
    // repeat count in the figure (« 6 × 496 ») instead of six labels.
    let i = 0
    while (i < uniq.length - 1) {
      const x0 = uniq[i].max.x
      const gap0 = uniq[i + 1].min.x - x0
      let j = i
      while (j < uniq.length - 1 && Math.abs(uniq[j + 1].min.x - uniq[j].max.x - gap0) < 0.005) j++
      const x1 = uniq[j].min.x
      const n = j - i
      if (gap0 >= 0.03 && n >= 1) {
        const label = gap0 >= MIN_LABEL ? (n > 1 ? `${n} × ${fmt(gap0 / MM)}` : fmt(gap0 / MM)) : ''
        chains.push({ kind: 'w', x: 0, x0, x1, y0: y, y1: y, z: bounds.d + FRONT, label })
      }
      i = Math.max(j, i + 1)
    }
  }
  return chains
}

export function InteriorDims ({
  target,
  bounds,
  visible
}: {
  /** The offset group that holds the unit (its frame = unit-local metres). */
  target: React.RefObject<THREE.Group | null>
  bounds: { w: number; h: number; d: number }
  visible: boolean
}) {
  const [chains, setChains] = useState<Chain[]>([])
  const sig = useRef('')
  const frame = useRef(0)
  const invalidate = useThree(s => s.invalidate)

  // The article mounts and re-mounts asynchronously: re-measure every 30
  // frames, but only publish when the result changed (signature).
  useFrame(() => {
    frame.current++
    if (!visible) {
      if (chains.length) setChains([])
      return
    }
    if (frame.current % 30 !== 7) return
    const root = target.current
    if (!root) return
    root.updateWorldMatrix(true, true)
    const toLocal = root.matrixWorld.clone().invert()
    const next = measure(root, toLocal, bounds)
    const s = next.map(c => `${c.kind}${c.x.toFixed(2)}${c.y0.toFixed(2)}${c.y1.toFixed(2)}${c.x0?.toFixed(2) ?? ''}${c.x1?.toFixed(2) ?? ''}`).join('|')
    if (s !== sig.current) {
      sig.current = s
      setChains(next)
      invalidate()
    }
  })

  if (!visible) return null
  return (
    <group>
      {chains.map((c, i) =>
        c.kind === 'h' ? (
          <DimLine
            key={`ih${i}`}
            a={[c.x, c.y0, c.z]}
            b={[c.x, c.y1, c.z]}
            fromA={[c.x, c.y0, c.z]}
            fromB={[c.x, c.y1, c.z]}
            tickDir={[1, 0, 0]}
            label={c.label}
            small
          />
        ) : (
          <DimLine
            key={`iw${i}`}
            a={[c.x0!, c.y0, c.z]}
            b={[c.x1!, c.y0, c.z]}
            fromA={[c.x0!, c.y0, c.z]}
            fromB={[c.x1!, c.y0, c.z]}
            tickDir={[0, 1, 0]}
            label={c.label}
            small
          />
        )
      )}
    </group>
  )
}
