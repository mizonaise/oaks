'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { setStable } from '@/lib/pipeline/bridge'

/**
 * Détecteur de « vue stable » pour le mode capture (Dorian, 2026-09-14).
 *
 * Monté DANS le `<Canvas>`, il ne dessine rien : il répond à la seule question
 * que le script de capture doit poser avant de photographier — *est-ce que
 * l'image a fini de bouger ?*
 *
 * Trois conditions, toutes nécessaires, mesurées et non supposées :
 *
 *  1. **plus rien ne charge** — `useProgress().active` de drei couvre le
 *     chargeur de three (HDRI, textures, GLB du designer d'articles). Une
 *     texture qui arrive après la photo donne un meuble en placage gris ;
 *  2. **la caméra ne bouge plus** — les presets arrivent par un `lerp` de ~8 %
 *     par image (`banc/CameraPreset.tsx`), qui approche sa cible sans jamais
 *     l'atteindre exactement. On compare donc position ET orientation d'une
 *     image à l'autre sous un seuil, plutôt que d'attendre un événement de fin
 *     qui n'existe pas ;
 *  3. **ça dure** — `IMAGES_CALMES` images consécutives sous le seuil. Une
 *     seule image calme se produit aussi au sommet d'un mouvement, quand la
 *     caméra s'inverse : ce serait une photo prise pile au mauvais moment.
 *
 * Le compteur repart à zéro dès qu'une des trois conditions retombe, donc un
 * `ready()` déjà obtenu redevient faux si la scène se remet à charger.
 */

/** Images consécutives calmes avant de déclarer la vue stable (~0,13 s à 60 Hz). */
const IMAGES_CALMES = 8
/** Seuil de déplacement (m) et d'orientation (rad) sous lequel une image est calme. */
const SEUIL_POSITION = 0.0008
const SEUIL_ROTATION = 0.0004

export function CaptureBridge (): null {
  const { camera } = useThree()
  const { active } = useProgress()

  const dernierePosition = useRef(new THREE.Vector3())
  const derniereRotation = useRef(new THREE.Quaternion())
  const calmes = useRef(0)
  const annonce = useRef(false)
  const premiere = useRef(true)

  // Un chargement qui repart invalide la stabilité tout de suite, sans attendre
  // la prochaine image : le script pourrait photographier entre deux frames.
  useEffect(() => {
    if (!active) return
    calmes.current = 0
    if (annonce.current) {
      annonce.current = false
      setStable(false)
    }
  }, [active])

  // Au démontage, la page n'a plus de vue stable à offrir. Sans ça, un
  // `ready()` posé après une navigation répondrait « oui » sur une scène morte.
  useEffect(
    () => () => {
      setStable(false)
    },
    []
  )

  useFrame(() => {
    const dPosition = camera.position.distanceTo(dernierePosition.current)
    // `angleTo` sur les quaternions : une rotation pure ne déplace pas la
    // caméra d'un millimètre et changerait pourtant toute l'image.
    const dRotation = camera.quaternion.angleTo(derniereRotation.current)
    dernierePosition.current.copy(camera.position)
    derniereRotation.current.copy(camera.quaternion)

    // La toute première image n'a pas de référence : la comparer à un vecteur
    // nul ferait un faux « ça bouge » (ou pire, un faux calme à l'origine).
    if (premiere.current) {
      premiere.current = false
      return
    }

    const calme =
      !active && dPosition < SEUIL_POSITION && dRotation < SEUIL_ROTATION

    if (!calme) {
      calmes.current = 0
      if (annonce.current) {
        annonce.current = false
        setStable(false)
      }
      return
    }

    if (calmes.current < IMAGES_CALMES) calmes.current += 1
    if (calmes.current >= IMAGES_CALMES && !annonce.current) {
      annonce.current = true
      setStable(true)
    }
  })

  return null
}
