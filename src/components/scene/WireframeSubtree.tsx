'use client'

import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Forces every mesh below it to render as a wireframe.
 *
 * Used for the article designer, which builds its own meshes and materials
 * inside our scene and exposes no wireframe option of its own — so the flag is
 * set on the materials it created rather than passed in as a prop.
 *
 * Materials are shared: the designer reuses one instance across many panels (and
 * three.js itself hands out shared defaults), so mutating one in place would
 * turn unrelated meshes wireframe too, including panels outside this subtree.
 * Each affected mesh therefore gets its own clone, and the original is put back
 * on cleanup.
 */
export function WireframeSubtree ({
  enabled,
  color = '#555',
  children
}: {
  enabled: boolean
  /** Line color for the generated wireframe materials. */
  color?: string
  children: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  // Meshes we've converted, holding the material to restore. Keyed by mesh so a
  // mesh is never converted twice (which would clone a clone and lose the
  // original), and weak so a mesh the designer discards can still be collected.
  const patched = useRef(new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>())
  // Strong list of what to restore: the WeakMap can't be iterated.
  const touched = useRef<THREE.Mesh[]>([])

  // Plain functions rather than `useCallback`: these mutate scene objects
  // reached through refs, which the React Compiler's immutability rule rejects
  // inside a hook. Nothing here is reactive — the effect and frame loop below
  // are the only callers.
  const apply = () => {
    const root = group.current
    if (!root) return
    root.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || !mesh.material) return
      if (patched.current.has(mesh)) return
      patched.current.set(mesh, mesh.material)
      touched.current.push(mesh)
      const wire = (src: THREE.Material) => {
        const m = src.clone()
        // `wireframe` lives on most material types but isn't on the base class.
        ;(m as THREE.MeshBasicMaterial).wireframe = true
        ;(m as THREE.MeshBasicMaterial).color = new THREE.Color(color)
        // A wireframe samples no texture; dropping the maps also avoids the
        // alpha-test and transparency the designer's door glass relies on.
        const mm = m as THREE.MeshStandardMaterial
        mm.map = null
        mm.transparent = false
        mm.opacity = 1
        m.needsUpdate = true
        return m
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(wire)
        : wire(mesh.material)
    })
  }

  const restore = () => {
    for (const mesh of touched.current) {
      const original = patched.current.get(mesh)
      if (!original) continue
      const current = mesh.material
      mesh.material = original
      // Dispose only the clones minted here; the originals belong to the
      // designer and must outlive this component.
      if (Array.isArray(current)) current.forEach(m => m.dispose())
      else current?.dispose()
      patched.current.delete(mesh)
    }
    touched.current = []
  }

  useLayoutEffect(() => {
    if (!enabled) return
    apply()
    return restore
    // `apply`/`restore` are re-created every render but close over nothing
    // reactive beyond `color`, which is listed so a change rebuilds the clones.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, color])

  // The designer loads its geometry asynchronously (GLTF, textures), so meshes
  // keep appearing after the effect has run. Re-applying each frame catches
  // them; `patched` makes it a cheap no-op once the subtree has settled.
  useFrame(() => {
    if (enabled) apply()
  })

  return <group ref={group}>{children}</group>
}
