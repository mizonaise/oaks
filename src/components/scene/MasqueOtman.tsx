'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { masquerPanneauxOtman, signalerZoneOtman, type CotesFacade, type ElementOtman, type Masques, type ObjetScene } from '@/lib/foxcad/chemin-otman'

/**
 * LE MASQUE DU CHEMIN D'OTMAN (d5, 23/09) : sur une forme fox-cad, le designer d'Otman est monté dans chaque zone comme avant B3, mais ses
 * PANNEAUX sont rendus invisibles à chaque image (`masquerPanneauxOtman`) — ils viennent de fox-cad — et ne restent que ses rendus spéciaux :
 * la tringle, la façade spéciale (quand fox-cad n'a pas la porte), la poignée GLB, la machine à laver. Le balayage tourne à chaque image comme
 * `ArticleMaterials` (le designer monte ses maillages après coup) ; le bilan de la zone va au magasin (badge, outil de preuve) quand il change.
 * `masques` retient ce que nous avons caché ET pourquoi : quand `porteParFoxCad` change (le front choisi dans le formulaire fait de la façade
 * un manque chez fox-cad, ou l'inverse), le passage suivant rend les portes d'Otman cachées pour cette raison-là — le geste de Dorian du 23/09.
 */
export function MasqueOtman({
  target,
  index,
  porteParFoxCad,
  speciaux,
  facades,
}: {
  target: RefObject<THREE.Group | null>
  index: string
  porteParFoxCad: boolean
  /** les éléments spéciaux annoncés par le designer (`onStatsReady`), tenus à jour par le parent */
  speciaux: RefObject<ElementOtman[]>
  /** les cotes des façades que le designer a rendues (ses statistiques, `elemType` D) : à masquer aussi hors d'un animateur de porte */
  facades: RefObject<CotesFacade[]>
}) {
  const invalidate = useThree((s) => s.invalidate)
  const masques = useRef<Masques>(new WeakMap())
  const dernier = useRef('')
  useFrame(() => {
    const g = target.current
    if (!g) return
    const cotes = facades.current ?? []
    const bilan = masquerPanneauxOtman(g as unknown as ObjetScene, porteParFoxCad, masques.current, cotes)
    const liste = speciaux.current ?? []
    const cle = `${porteParFoxCad}|${bilan.panneauxMasques}|${bilan.portesMasquees}|${bilan.facadesMasquees}|${bilan.portesGardees}|${bilan.maillagesGardes}|${liste.map((s) => `${s.genre}:${s.cpName}:${s.kmsName ?? ''}`).join(',')}|${cotes.map((f) => `${f.length}x${f.width}x${f.thk}`).join(',')}`
    if (cle === dernier.current) return
    dernier.current = cle
    signalerZoneOtman(index, { ...bilan, porteParFoxCad, speciaux: liste, facades: cotes })
    invalidate()
  })
  useEffect(() => () => signalerZoneOtman(index, null), [index])
  return null
}
