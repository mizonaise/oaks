'use client'

import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { Environment } from '@react-three/drei'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { bancFlags, keyColor, keyPosition, useBanc } from './banc/BancContext'

/**
 * Lighting recipe (banc de rendu, 2026-09-10).
 *
 * Client mode — what the charte photo asks for: an image-based environment
 * that gives every panel a face, an edge and a soft reflection; a warm key
 * light coming from the left like a side window; a low ambient so the
 * environment does the filling; a cool, shadowless fill on the opposite side.
 *
 * Schema mode (`contrasted`) — the Flora deliverable of 2026-09-09: no
 * environment, flat strong lights (×2.35), so the AI reads volumes, not
 * materials.
 */
/**
 * La fenêtre de la pièce, en coordonnées MONDE (couche 3, 2026-09-20). Arbitrage de Dorian : le soleil est dans
 * l'image — au sol, sur un mur, effleurant un bord — mais jamais au milieu des façades. Deux sources :
 * 1. un SOLEIL directionnel qui passe par l'ouverture ; les murs et le plafond projettent leur ombre, donc seule
 *    la tache de la fenêtre arrive dans la pièce. Sa direction est déviée de 18° vers la caméra : la tache
 *    traverse le sol DEVANT le meuble, elle ne remonte pas sur les façades ;
 * 2. une LUMIÈRE DE FENÊTRE large et douce (RectAreaLight, sans ombre) : c'est elle qui modèle les façades,
 *    latérale et rasante, comme sur toutes les photos de mobilier relevées.
 */
export type FenetreMonde = {
  centre: [number, number, number]
  /** Normale horizontale du mur, vers l'intérieur de la pièce. */
  normale: [number, number]
  largeur: number
  hauteur: number
  /** Distance horizontale (m) entre le mur de la fenêtre et ce qui lui fait face, et si c'est le meuble (aile d'un L). */
  portee: number
  faceAuMeuble: boolean
  /** Distance (m) entre le nu des façades et le bord de la fenêtre le plus proche du meuble. */
  margeMeuble: number
}

/**
 * Où tombe le soleil (mesuré sur rendus le 20/09). Dans un cadrage de face, ce qu'on voit de la pièce est mince :
 * une bande de sol de ~40 cm au pied du meuble et deux bandes de murs. Un soleil bas qui traverse la pièce tombe
 * hors champ. Donc : soleil à 45° au moins, et DÉVIÉ vers le meuble juste assez pour que la tache commence au sol
 * 10 cm devant les façades — elle borde le pied du meuble sans jamais monter dessus (arbitrage : « à côté »).
 * Face à l'aile d'un L, le soleil monte encore si nécessaire pour finir au sol 30 cm avant l'aile.
 */
const soleilPour = (f: FenetreMonde): { el: number; dev: number } => {
  const haut = f.centre[1] + f.hauteur / 2
  let el = 45
  if (f.faceAuMeuble) el = Math.max(el, (Math.atan2(haut, Math.max(0.5, f.portee - 0.3)) * 180) / Math.PI)
  el = Math.min(62, el)
  const sinDev = Math.min(0.34, Math.max(0, ((f.margeMeuble - 0.1) * Math.tan((el * Math.PI) / 180)) / haut))
  return { el, dev: (Math.asin(sinDev) * 180) / Math.PI }
}
let rectInit = false
/** Intensités réglables par l URL le temps du calage (lum_soleil, lum_fenetre). */
const reglage = (cle: string, defaut: number): number => {
  if (typeof window === 'undefined') return defaut
  const v = Number(new URLSearchParams(window.location.search).get(cle))
  return Number.isFinite(v) && v > 0 ? v : defaut
}

export const SceneLights = memo(function SceneLights ({
  radius = 8,
  contrasted = false,
  fenetre = null,
  environmentIntensity = 0.8,
  keyIntensity = 1.8,
  ambientIntensity = 0.25,
  fillIntensity = 0.5,
  hemisphereIntensity = 0.35,
  softShadowSize = 25,
  softShadowSamples = 12,
  shadowMapSize = 2048
}: {
  /** Half-extent (scene units) the shadow camera must cover; size to the unit. */
  radius?: number
  contrasted?: boolean
  fenetre?: FenetreMonde | null
  environmentIntensity?: number
  keyIntensity?: number
  ambientIntensity?: number
  fillIntensity?: number
  hemisphereIntensity?: number
  softShadowSize?: number
  softShadowSamples?: number
  shadowMapSize?: number
}) {
  // Fit the directional light's orthographic shadow camera tightly to the
  // scene. The default frustum is a small ±5 box, so over a wide unit each
  // shadow-map texel stretches across many world units and the shadow edge
  // looks pixelized/jagged. A snug frustum + a larger map keeps texels dense.
  const ortho = radius * 1.4
  const far = radius * 6
  const banc = useBanc()
  const flags = bancFlags(banc)
  const castShadows = flags.shadows

  // Soleil par la fenêtre : direction = normale du mur, déviée vers +z (la caméra), plongeant de 34°.
  const soleil = useMemo(() => {
    if (!fenetre) return null
    if (!rectInit) { RectAreaLightUniformsLib.init(); rectInit = true }
    const reglageSoleil = soleilPour(fenetre)
    const el = (reglageSoleil.el * Math.PI) / 180
    const dv = (reglageSoleil.dev * Math.PI) / 180
    const n = new THREE.Vector3(fenetre.normale[0], 0, fenetre.normale[1]).normalize()
    const horiz = n.clone().multiplyScalar(Math.cos(dv)).add(new THREE.Vector3(0, 0, -1).multiplyScalar(Math.sin(dv))).normalize()
    const dir = horiz.multiplyScalar(Math.cos(el)).add(new THREE.Vector3(0, -Math.sin(el), 0)).normalize()
    const c = new THREE.Vector3(...fenetre.centre)
    const cible = new THREE.Object3D()
    cible.position.copy(c.clone().add(dir.clone().multiplyScalar(3)))
    const regard = new THREE.Object3D()
    regard.position.copy(c.clone().add(n.clone().multiplyScalar(2)))
    return { position: c.clone().sub(dir.clone().multiplyScalar(6)), cible, regard, centre: c.clone().add(n.clone().multiplyScalar(0.05)) }
  }, [fenetre])

  if (contrasted || flags.schema) {
    const f = 2.35
    return (
      <>
        <ambientLight intensity={1.5 * f} />
        <directionalLight
          position={[radius, radius * 1.6, radius]}
          intensity={1.5 * f}
          castShadow
          shadow-mapSize={[shadowMapSize, shadowMapSize]}
          shadow-camera-near={0.1}
          shadow-camera-far={far}
          shadow-camera-left={-ortho}
          shadow-camera-right={ortho}
          shadow-camera-top={ortho}
          shadow-camera-bottom={-ortho}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <hemisphereLight args={['#ffffff', '#444444', 0.4 * f]} />
      </>
    )
  }

  return (
    <>
      {/* Soft shadows: drei's PCSS (`SoftShadows`) does not compile against
          three r184 (`unpackRGBAToDepth` overload), so the softness comes from
          the VSM shadow map set on the Canvas (`shadows={{ type: VSMShadowMap }}`)
          with the key light's `shadow-radius` / `shadow-blurSamples` below. */}
      {/* Warm indoor environment (Poly Haven « lebombo » via the drei preset)
          — replace by /env/oaksome-studio-warm-1k.hdr once the asset is
          chosen. `background={false}`: it lights, it is not shown. */}
      {flags.environment && (
        <Environment
          preset={banc.envPreset === 'none' ? 'apartment' : banc.envPreset}
          background={false}
          environmentIntensity={banc.envIntensity}
        />
      )}
      {/* Without an environment (low-def, or « aucun »), the ambient and the
          ground bounce take over so the unit is not left in the dark. */}
      <ambientLight intensity={flags.environment ? banc.ambient : banc.ambient + 1.2} />
      {/* Key light: from the left, above, slightly in front — a side window.
          Direction from the bench settings (`keyAz` / `keyEl`, defaults =
          the lot A position); the shot plan moves it per shot. */}
      {soleil && fenetre && (
        <>
          <primitive object={soleil.cible} />
          <directionalLight
            position={soleil.position}
            target={soleil.cible}
            intensity={reglage('lum_soleil', 5)}
            color='#FFD8A6'
            castShadow={castShadows}
            shadow-mapSize={[4096, 4096]}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
            shadow-camera-left={-7}
            shadow-camera-right={7}
            shadow-camera-top={7}
            shadow-camera-bottom={-7}
            shadow-bias={-0.0002}
            shadow-normalBias={0.03}
            shadow-radius={3}
            shadow-blurSamples={12}
          />
          <rectAreaLight
            position={soleil.centre}
            width={fenetre.largeur * 1.3}
            height={fenetre.hauteur * 1.2}
            intensity={reglage('lum_fenetre', 6)}
            color='#FFF0DC'
            onUpdate={self => self.lookAt(soleil.regard.position)}
          />
        </>
      )}
      <directionalLight
        position={keyPosition(banc.keyAz, banc.keyEl, radius)}
        visible={!soleil}
        intensity={banc.keyIntensity}
        color={keyColor(banc.keyWarmth)}
        castShadow={castShadows && !soleil}
        shadow-mapSize={[banc.shadowMapSize, banc.shadowMapSize]}
        shadow-camera-near={0.1}
        shadow-camera-far={far}
        shadow-camera-left={-ortho}
        shadow-camera-right={ortho}
        shadow-camera-top={ortho}
        shadow-camera-bottom={-ortho}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={banc.shadowRadius}
        shadow-blurSamples={banc.shadowSamples}
      />
      {/* Fill: opposite side, cool-neutral, no shadow (Kewlox « BackLight »). */}
      <directionalLight
        position={[1.2 * radius, radius, -0.8 * radius]}
        intensity={banc.fill}
        color='#EEF2FF'
      />
      {/* Sky / warm ground bounce. */}
      <hemisphereLight args={['#FFFFFF', '#D9D2C5', banc.hemi]} />
    </>
  )
})
