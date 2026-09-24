'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { bancFlags, useBanc } from './banc/BancContext'
import { echelleTexture, nomTextureDepuisAdresse } from '@/lib/textures/echelle'
import { MARQUE_ECHELLE, uvEchelleReelle } from '@/lib/textures/uv'
import { signalerEchelle } from '@/lib/textures/magasin'

/**
 * Material overlay for the article designer (banc de rendu 2026-09-10).
 *
 * The article renderer (`@processandtools/rp-article-designer`) builds its
 * panels with `meshStandardMaterial { map, color, opacity }` and leaves
 * roughness at 1.0, metalness at 0, and loads its textures without a colour
 * space. We don't own that package, so after each render we walk the article's
 * subtree and correct the materials in place — without replacing them, so the
 * package keeps driving `map`, `color` and `opacity` (door open/close, contrast).
 *
 * Client mode: melamine-like finish (roughness .62), sRGB textures, anisotropy,
 * environment at full strength. Schema mode: leave everything untouched.
 *
 * Nuit du 22 au 23/09 (d5) : LA TEXTURE À L'ÉCHELLE RÉELLE, ici aussi — le designer étire l'image entière sur chaque face (UV [0, 1],
 * ClampToEdge : mesuré le 22/09 sur 65 maillages de F, 169 de U). Le même balayage réécrit une fois les UV de chaque géométrie en mm /
 * échelle (`lib/textures/uv.ts`, l'échelle par le nom de la texture lu dans l'adresse de l'image : `SCALEFAKT` d'imos ou le défaut) et
 * met la texture en répétition ; la scène dit les échelles en service (`signalerEchelle`). Dans les deux modes (schéma compris : les UV
 * ne changent pas une couleur plate).
 */
export function ArticleMaterials ({
  target,
  contrasted = false,
  roughness = 0.62,
  envMapIntensity = 1
}: {
  target: React.RefObject<THREE.Group | null>
  contrasted?: boolean
  roughness?: number
  envMapIntensity?: number
}) {
  const gl = useThree(s => s.gl)
  const invalidate = useThree(s => s.invalidate)
  const seen = useRef(new WeakSet<THREE.Material>())
  const frame = useRef(0)
  const echelleTmp = useRef(new THREE.Vector3())
  // les maillages du designer vus au dernier passage : ceux qui ont disparu quittent le magasin des échelles
  const designerVus = useRef(new Set<string>())
  const banc = useBanc()
  const flags = bancFlags(banc)
  const wantRough = banc.roughness
  const wantEnv = banc.envMapIntensity
  const wantWire = flags.wireframe
  const schema = contrasted || flags.schema
  void roughness
  void envMapIntensity

  // The article designer mounts its meshes asynchronously (after its data
  // queries), without re-rendering this component — so a plain effect would
  // run too early. Sweep the subtree on every frame instead; the `seen` set and
  // the geometry marks keep each pass cheap once everything is corrected.
  // (Nuit du 22 au 23/09 : le balayage tournait une image sur vingt — en rendu à
  // la demande, mode capture compris, ces images n'arrivaient jamais après le
  // montage du designer : roughness 1 et textures étirées mesurées sur ses
  // maillages. Deux cents objets parcourus par image ne coûtent rien.)
  useFrame(() => {
    frame.current++
    const group = target.current
    if (!group) return
    const maxAniso = Math.min(16, gl.capabilities.getMaxAnisotropy() || 1)
    let touched = 0
    let echelles = 0
    const vusCePassage = new Set<string>()
    group.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      // 23/09 : un maillage sous un objet invisible (les panneaux masqués par le chemin d'Otman, la sonde de porte du designer) ne se dessine
      // pas : rien à corriger, et il n'entre pas au magasin des échelles (la ligne sous la scène ne compte que ce qui se voit)
      let cache = false
      for (let p: THREE.Object3D | null = mesh; p && p !== group; p = p.parent) {
        if (!p.visible) {
          cache = true
          break
        }
      }
      if (cache) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      // la texture à l'échelle réelle (voir l'en-tête) : la géométrie une fois, la carte en répétition, l'échelle dite
      const carte = (mats.find(x => (x as THREE.MeshStandardMaterial | undefined)?.map) as THREE.MeshStandardMaterial | undefined)?.map
      const image = carte ? (carte.image as { src?: string } | undefined) : undefined
      const nomTexture = nomTextureDepuisAdresse(image?.src ?? (carte?.source?.data as { src?: string } | undefined)?.src)
      if (carte && nomTexture) {
        const e = echelleTexture(nomTexture)
        const geo = mesh.geometry
        if (geo && geo.userData[MARQUE_ECHELLE] !== e.mm) {
          // le monde est en mètres : mm par unité locale = échelle du monde × 1000 (1 000 pour le designer, 1 pour une géométrie en mm)
          const s = mesh.getWorldScale(echelleTmp.current)
          uvEchelleReelle(geo, e.mm, s.x * 1000)
          echelles++
        }
        // en MIROIR, comme `prepareAlbedo` : les images IVIS ne sont pas raccordables, la répétition simple trace un trait par tuile (mesuré)
        if (carte.wrapS !== THREE.MirroredRepeatWrapping || carte.wrapT !== THREE.MirroredRepeatWrapping) {
          carte.wrapS = THREE.MirroredRepeatWrapping
          carte.wrapT = THREE.MirroredRepeatWrapping
          carte.needsUpdate = true
          echelles++
        }
        vusCePassage.add(mesh.uuid)
        signalerEchelle(`designer:${mesh.uuid}`, e)
      }
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial
        if (!std || !std.isMeshStandardMaterial) continue
        if (schema) {
          // Schema mode: flat and untouched — restore the package defaults.
          if (seen.current.has(std)) {
            std.roughness = 1
            std.envMapIntensity = 1
            std.wireframe = false
            std.needsUpdate = true
          }
          continue
        }
        // Only touch what differs: `needsUpdate` forces a shader recompile,
        // and doing that every render is what floods the console with
        // "useProgram: program not valid".
        let changed = false
        if (std.roughness !== wantRough) {
          std.roughness = wantRough
          changed = true
        }
        if (std.wireframe !== wantWire) {
          std.wireframe = wantWire
          changed = true
        }
        if (std.metalness !== 0) {
          std.metalness = 0
          changed = true
        }
        if (std.envMapIntensity !== wantEnv) {
          std.envMapIntensity = wantEnv
          changed = true
        }
        if (std.map) {
          const t = std.map
          if (t.colorSpace !== THREE.SRGBColorSpace) {
            t.colorSpace = THREE.SRGBColorSpace
            t.needsUpdate = true
            changed = true
          }
          if (t.anisotropy !== maxAniso) {
            t.anisotropy = maxAniso
            t.needsUpdate = true
            changed = true
          }
        }
        if (!changed) continue
        seen.current.add(std)
        touched++
      }
    })
    for (const uuid of designerVus.current) if (!vusCePassage.has(uuid)) signalerEchelle(`designer:${uuid}`, null)
    designerVus.current = vusCePassage
    if (touched || echelles) {
      // Banc de rendu: one line per pass that changed something.
      if (touched) console.info(`[banc] article materials corrected: ${touched}`)
      if (echelles) console.info(`[banc] textures à l'échelle réelle : ${echelles}`)
      invalidate()
    }
  })

  return null
}
