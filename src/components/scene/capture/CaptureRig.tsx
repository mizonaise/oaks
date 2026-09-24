'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { mesurer, type Mesures } from '@/lib/pipeline/mesures'
import { resoudrePrise, type Colonne, type PriseSpec, type Resolution } from '@/lib/pipeline/stations'
import { setPrise } from '@/lib/pipeline/bridge'
import type { ModeleScene } from '@/lib/pipeline/scene'

/**
 * Le rig de prise de vue (Dorian, 2026-09-15) — monté DANS le Canvas, en mode
 * capture, quand l'URL porte `?prise=<id>`.
 *
 * 1. Il relève la géométrie rendue (`mesurer`) toutes les 15 images jusqu'à ce
 *    que l'empreinte ne bouge plus deux fois de suite : le renderer d'article
 *    monte ses meshes après coup (requêtes de matériaux, GLB de poignée), et une
 *    poignée qui arrive après la photo est une poignée absente de l'image.
 * 2. Il résout la prise en caméra effective (`resoudrePrise`), la pose — sans
 *    lerp, sans OrbitControls : la caméra ne « vole » pas, elle est mise — y
 *    compris le décentrement (`setViewOffset`, l'objectif à bascule) et le
 *    vecteur haut du plan.
 * 3. Il publie la caméra effective et les mesures dans le pont (`setPrise`),
 *    pour la fiche. Une prise impossible est publiée aussi, avec sa raison.
 *
 * Il n'anime rien : le détecteur de vue stable (`CaptureBridge`) voit une
 * caméra immobile dès l'image suivante.
 */

const PAS = 15
const IMAGES_MAX = 40 * PAS // ~10 s à 60 Hz avant de photographier avec ce qu'on a

export function CaptureRig ({
  spec,
  bounds,
  walls,
  room,
  eye,
  unitGroupRef,
  colonnes,
  cotesVisibles = false,
  scene
}: {
  spec: PriseSpec
  bounds: { w: number; h: number; d: number }
  walls: { left: number | null; right: number | null }
  room: { depth: number; height: number }
  eye: number
  unitGroupRef: React.RefObject<THREE.Group | null>
  colonnes: Colonne[]
  cotesVisibles?: boolean
  /** Le modèle de scène : les stations se calent sur l'emprise réelle et le plan de pièce. */
  scene?: ModeleScene
}) {
  const camera = useThree(s => s.camera)
  const aspect = useThree(s => s.viewport.aspect)
  const size = useThree(s => s.size)
  // The frame the view offset is expressed in: the canvas itself (the capture
  // window is square, 2048 × 2048 at density 1).
  const pixels = Math.max(1, Math.round(size.width))
  const pixelsH = Math.max(1, Math.round(size.height))
  const invalidate = useThree(s => s.invalidate)
  const frame = useRef(0)
  const derniere = useRef<string>('')
  const stables = useRef(0)
  const posee = useRef(false)
  const mesures = useRef<Mesures | null>(null)
  const resolution = useRef<Resolution | null>(null)

  // Nouvelle prise ou nouvelle géométrie : tout repart.
  useEffect(() => {
    posee.current = false
    stables.current = 0
    derniere.current = ''
    frame.current = 0
    resolution.current = null
    setPrise(() => ({ id: spec.id, etat: 'en attente de la géométrie', mesures: null, camera: null }))
    return () => {
      setPrise(null)
      const persp = camera as THREE.PerspectiveCamera
      if (persp.isPerspectiveCamera) {
        persp.clearViewOffset()
        persp.up.set(0, 1, 0)
        persp.updateProjectionMatrix()
      }
    }
  }, [spec, camera])

  useFrame(() => {
    frame.current++
    if (posee.current) return
    if (frame.current % PAS !== PAS - 1) return
    const root = unitGroupRef.current
    if (!root) return

    const m = mesurer(root, bounds)
    if (m.signature === derniere.current) stables.current++
    else {
      stables.current = 0
      derniere.current = m.signature
      setPrise(() => ({ id: spec.id, etat: `géométrie en mouvement (${m.mailles} mailles)`, mesures: null, camera: null }))
    }
    mesures.current = m
    // Deux relevés identiques d'affilée, ou le délai de garde : on photographie.
    // Une station se cale sur le modèle de scène : elle n'a pas besoin que des façades soient reconnues
    // (sur un L, un U ou un ensemble mural le relevé n'en trouve pas toujours).
    const pret = stables.current >= 2 && (m.facades.length > 0 || spec.cadrage === 'station' || spec.cadrage === 'plan')
    if (!pret && frame.current < IMAGES_MAX) return

    const res = resoudrePrise(spec, { bounds, walls, room, eye, aspect: aspect || 1, mesures: m, colonnes, cotesVisibles, scene })
    resolution.current = res
    const persp = camera as THREE.PerspectiveCamera
    if (res.faisable && persp.isPerspectiveCamera) {
      persp.position.set(res.position[0], res.position[1], res.position[2])
      persp.up.set(res.up[0], res.up[1], res.up[2])
      persp.lookAt(res.cible[0], res.cible[1], res.cible[2])
      persp.fov = res.fov_v_deg
      persp.near = 0.02
      persp.far = 500
      // Décentrement : cadre décalé, caméra de niveau. `setViewOffset` prend un
      // décalage en pixels dans le cadre complet ; une fraction positive
      // (cible au-dessus de l'axe) déplace la fenêtre vers le haut.
      const [dx, dy] = res.decentrement
      if (dx !== 0 || dy !== 0) {
        persp.setViewOffset(pixels, pixelsH, Math.round(-dx * pixels), Math.round(-dy * pixelsH), pixels, pixelsH)
      } else {
        persp.clearViewOffset()
      }
      persp.updateProjectionMatrix()
      persp.updateMatrixWorld()
    }
    posee.current = true
    setPrise(() => ({
      id: spec.id,
      etat: res.faisable ? 'posée' : `impossible — ${res.raison}`,
      mesures: mesures.current,
      camera: res
    }))
    invalidate()
  })

  return null
}
