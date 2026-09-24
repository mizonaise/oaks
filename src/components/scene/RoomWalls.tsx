'use client'

import { memo, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { BackSide, CanvasTexture, DoubleSide, FrontSide, NoColorSpace } from 'three'
import type { Box as ShapeBox } from './shapeTree'
import { bancFlags, useBanc } from './banc/BancContext'
import { hauteurPlafond, modeleScene, type FenetrePlan, type MurPlan, type Rampant } from '@/lib/pipeline/scene'
import { valeursCourantes } from '@/lib/pipeline/bridge'

// The wall cp and its finder moved to the parametric scene model
// (`lib/pipeline/scene.ts`, 2026-09-15) so that the drawn room, the camera
// stations and the published fiche derive from ONE computation. Re-exported
// here so existing imports keep working.
export { WALL_CP, findCpWalls, type CpWall } from '@/lib/pipeline/scene'

// A linear fade band: fully opaque at `at` (0..1 along the axis, where the
// unit stands) fading to transparent over `reach` (0..1) on each side.
// `axis` 'u' runs along the first plane arg, 'v' along the second (V up).
type FadeBand = { axis: 'u' | 'v'; at: number; reach: number }

/**
 * Alpha texture for the room fade (banc de rendu 2026-09-10 — Maatkasten's
 * `RoomWallFadeMaterial`): white (opaque) where the unit stands, black
 * (transparent) beyond `reach`, so the room shows around the unit and
 * dissolves into the page beige instead of running to infinity.
 * `alphaMap` reads the green channel, so a grey ramp is enough.
 */
function makeFadeAlpha (band: FadeBand): CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const N = 256
  const horizontal = band.axis === 'u'
  const canvas = document.createElement('canvas')
  canvas.width = horizontal ? N : 1
  canvas.height = horizontal ? 1 : N
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Position along the axis in canvas space. Canvas Y grows downward, texture V
  // grows upward, so flip for the vertical axis.
  const pos = horizontal ? band.at : 1 - band.at
  const grad = horizontal
    ? ctx.createLinearGradient(0, 0, N, 0)
    : ctx.createLinearGradient(0, 0, 0, N)
  // Smooth ramp (ease-out) from opaque at the unit to transparent at `reach`,
  // sampled in a few stops so the dissolve has no visible edge.
  const solid = band.reach * 0.3
  const stops = 8
  const ramp = (from: number, to: number) => {
    for (let i = 0; i <= stops; i++) {
      const t = i / stops
      const p = from + (to - from) * t
      if (p < 0 || p > 1) continue
      // Ease-in: fast start, long tail — no perceptible edge where it ends.
      const a = (1 - t) * (1 - t)
      const v = Math.round(a * 255)
      grad.addColorStop(p, `rgb(${v},${v},${v})`)
    }
  }
  grad.addColorStop(0, pos - band.reach <= 0 ? '#ffffff' : '#000000')
  ramp(Math.max(0, pos - solid), Math.max(0, pos - band.reach))
  grad.addColorStop(pos, '#ffffff')
  ramp(Math.min(1, pos + solid), Math.min(1, pos + band.reach))
  grad.addColorStop(1, pos + band.reach >= 1 ? '#ffffff' : '#000000')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = NoColorSpace
  return tex
}

/** Client-mode palette: warm off-whites from the charte / site theme. */
const CLIENT = {
  wall: '#F1EFE8',
  floor: '#E6E1D6',
  ceiling: '#FFFFFF'
}

/**
 * Schema-mode palette (idée de Clément, 10/09): one grey density per surface,
 * lightest on top and darkest on the floor, so the AI pipeline reads ceiling,
 * walls and floor without any decor.
 */
const SCHEMA = {
  ceiling: '#F2F2F2',
  backWall: '#DCDCDC',
  sideWall: '#C8C8C8',
  floor: '#B4B4B4'
}

/** B4 : les coordonnées (le long d'un axe) où le profil du plafond change de pente — les pieds et les genoux des rampants — dans [de, a]. */
function ruptures (rampants: Rampant[], axe: 'x' | 'z', de: number, a: number): number[] {
  const xs = new Set<number>([de, a])
  for (const r of rampants) {
    if (r.axe !== axe) continue
    for (const c of [r.depuis_m, r.depuis_m + r.sens * r.projection_m]) if (c > de + 1e-6 && c < a - 1e-6) xs.add(c)
  }
  return [...xs].sort((p, q) => p - q)
}

/**
 * B4 : le plafond sous rampant — une nappe par cellule entre les ruptures en x et en z (le plafond y est plan : la pente ne change qu'aux
 * ruptures), les hauteurs par `hauteurPlafond`. UV comme le plan plat : u le long de x, v du mur du fond vers l'avant (le fondu `topAlpha`).
 */
function geometriePlafond (rampants: Rampant[], left: number, right: number, roomD: number, wallH: number): THREE.BufferGeometry {
  const xs = ruptures(rampants, 'x', left, right)
  const zs = ruptures(rampants, 'z', 0, roomD)
  const pos: number[] = []
  const uv: number[] = []
  const y = (x: number, z: number) => hauteurPlafond(rampants, x, z, wallH)
  const push = (x: number, z: number) => {
    pos.push(x, y(x, z), z)
    uv.push((x - left) / (right - left || 1), z / (roomD || 1))
  }
  for (let i = 0; i + 1 < xs.length; i++) {
    for (let j = 0; j + 1 < zs.length; j++) {
      const x0 = xs[i]
      const x1 = xs[i + 1]
      const z0 = zs[j]
      const z1 = zs[j + 1]
      push(x0, z0); push(x1, z1); push(x1, z0)
      push(x0, z0); push(x0, z1); push(x1, z1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

/** le plafond à l'aplomb d'un point d'un mur (u le long du mur) */
const plafondDuMur = (mur: MurPlan, rampants: Rampant[], wallH: number, u: number): number =>
  mur.axe === 'z' ? hauteurPlafond(rampants, u, mur.at, wallH) : hauteurPlafond(rampants, mur.at, u, wallH)

/** B4 : le haut de ce mur est-il plat au plafond plat ? Si oui, il se dessine comme avant (le plan d'aujourd'hui). */
function murPlat (mur: MurPlan, rampants: Rampant[], wallH: number): boolean {
  if (!rampants.length) return true
  const axe = mur.axe === 'z' ? 'x' : 'z'
  return ruptures(rampants, axe, mur.de, mur.a).every(u => Math.abs(plafondDuMur(mur, rampants, wallH, u) - wallH) < 1e-6)
}

/**
 * B4 : un mur dont le haut suit le plafond en pente — un polygone (u le long du mur, y) triangulé (`ShapeUtils`), troué de sa baie ;
 * UV : u ∈ [0, 1] de `de` à `a`, v = y / wallH — le fondu de la pièce s'exprime dans ce repère-là (voir `alphaPolygone`).
 */
function geometrieMur (mur: MurPlan, rampants: Rampant[], wallH: number, trou: { u0: number; u1: number; y0: number; y1: number } | null): THREE.BufferGeometry {
  const axe = mur.axe === 'z' ? 'x' : 'z'
  const us = ruptures(rampants, axe, mur.de, mur.a)
  const contour: THREE.Vector2[] = [new THREE.Vector2(mur.de, 0), new THREE.Vector2(mur.a, 0)]
  for (let i = us.length - 1; i >= 0; i--) contour.push(new THREE.Vector2(us[i], plafondDuMur(mur, rampants, wallH, us[i])))
  const holes: THREE.Vector2[][] = []
  if (trou) holes.push([new THREE.Vector2(trou.u0, trou.y0), new THREE.Vector2(trou.u1, trou.y0), new THREE.Vector2(trou.u1, trou.y1), new THREE.Vector2(trou.u0, trou.y1)])
  const triangles = THREE.ShapeUtils.triangulateShape(contour, holes)
  const points = [...contour, ...holes.flat()]
  const pos: number[] = []
  const uv: number[] = []
  const en3d = (p: THREE.Vector2): [number, number, number] => (mur.axe === 'z' ? [p.x, p.y, mur.at - 0.002 * mur.normale] : [mur.at - 0.0005 * mur.normale, p.y, p.x])
  for (const t of triangles) {
    for (const k of t) {
      const p = points[k]
      pos.push(...en3d(p))
      uv.push((p.x - mur.de) / (mur.a - mur.de || 1), p.y / (wallH || 1))
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

/**
 * Room around the shape. The shape occupies the box x∈[0,w], y∈[0,h], z∈[0,d]
 * (scene units, metres) in the parent group. Floor and ceiling are always
 * drawn; the side walls come from the shape itself — one per box face carrying
 * the `CP_SPO_WALL` cp, standing at that face.
 *
 * Banc de rendu 2026-09-10 — what changed:
 * - the room has real proportions (margins, ceiling height, depth) instead of
 *   `60 × the unit` and a ceiling sitting on the unit;
 * - surfaces are `meshStandardMaterial` so they take light and shadow (a
 *   `meshBasicMaterial` is flat by construction — that was the "painted
 *   gradient" look);
 * - the room fades out beyond ~1.5 × the unit width (alpha mask);
 * - schema mode paints one grey density per surface, no fade.
 *
 * B4 (22/09) — le rampant : quand le modèle porte des rampants (HEX / HEX 2), le plafond est une nappe en pente et les murs dont le haut
 * suit la pente sont des polygones ; tout le reste (sol, murs plats, baies, habillage) se dessine comme avant. Sans rampant, rien ne change.
 */
export const RoomWalls = memo(function RoomWalls ({
  w,
  h,
  d,
  boxes,
  scale,
  contrasted = false,
  mursOmbre = false,
  rampants
}: {
  w: number
  h: number
  d: number
  boxes: ShapeBox[]
  /** mm → scene units, matching the scaled group the boxes render in. */
  scale: number
  contrasted?: boolean
  /** Couche 3 : murs et plafond arrêtent le soleil, seule la fenêtre le laisse entrer (prises du pipeline). */
  mursOmbre?: boolean
  /** B4 : les rampants lus par la scène sur les valeurs du formulaire (hors capture, ce composant ne les a pas sous la main). */
  rampants?: Rampant[]
}) {
  const banc = useBanc()
  const flags = bancFlags(banc)
  const schema = contrasted || flags.schema

  // The room is DERIVED from the unit — the parametric scene model (rules
  // A1-A4 of the cahier): walls where the shape declares `CP_SPO_WALL`, a free
  // margin of max(600 mm, 25 % of the width) elsewhere, the ceiling flush with
  // the unit top (Dorian, 10/09) plus the bench's gap, a depth that lets the
  // camera step back to eye level. One computation, shared with the camera
  // stations and the published fiche.
  const modele = useMemo(
    () => modeleScene(boxes, { w, h, d }, valeursCourantes(), scale, banc.ceilingGap, undefined, rampants),
    [boxes, w, h, d, scale, banc.ceilingGap, rampants]
  )
  // Couche 1 (20/09) : les murs se dessinent depuis le PLAN (emprise du meuble), plus depuis les seuls CP.
  const { plan } = modele
  const dReel = modele.emprise.p_m
  const wallH = modele.piece.hauteur_m
  const roomD = modele.piece.profondeur_m
  const left = modele.piece.x_gauche_m
  const right = modele.piece.x_droite_m
  const roomW = modele.piece.largeur_m
  const cx = modele.piece.x_centre_m
  const lesRampants = modele.rampants
  const avecRampant = lesRampants.length > 0

  // Fade extents: opaque over the unit, dissolving over ~1.5 × its width /
  // depth into the open room.
  const sideAt = roomD > 0 ? dReel / 2 / roomD : 0.1
  const sideReach = roomD > 0 ? Math.min(1, (banc.roomFade * Math.max(w, dReel)) / roomD) : 0.5
  const frontAt = roomW > 0 ? (w / 2 - left) / roomW : 0.5
  const frontReach = roomW > 0 ? Math.min(1, (banc.roomFade * w) / roomW) : 0.5

  const floorAlpha = useMemo(
    () => makeFadeAlpha({ axis: 'v', at: 1 - sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const topAlpha = useMemo(
    () => makeFadeAlpha({ axis: 'v', at: sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const rightSideAlpha = useMemo(
    () => makeFadeAlpha({ axis: 'u', at: sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const leftSideAlpha = useMemo(
    () => makeFadeAlpha({ axis: 'u', at: 1 - sideAt, reach: sideReach }),
    [sideAt, sideReach]
  )
  const zAlphaA = useMemo(
    () => makeFadeAlpha({ axis: 'u', at: frontAt, reach: frontReach }),
    [frontAt, frontReach]
  )
  const zAlphaB = useMemo(
    () => makeFadeAlpha({ axis: 'u', at: 1 - frontAt, reach: frontReach }),
    [frontAt, frontReach]
  )

  // B4 : le plafond en pente (une géométrie), et le fondu des murs polygonaux dans LEUR repère (u de `de` à `a`).
  const plafondRampant = useMemo(
    () => (avecRampant ? geometriePlafond(lesRampants, left, right, roomD, wallH) : null),
    [avecRampant, lesRampants, left, right, roomD, wallH]
  )
  useEffect(() => () => plafondRampant?.dispose(), [plafondRampant])
  const alphaPolygone = useMemo(() => {
    const out = new Map<string, CanvasTexture | null>()
    if (!avecRampant) return out
    for (const mur of plan.murs) {
      if (murPlat(mur, lesRampants, wallH) || mur.nature === 'face') continue
      const longueur = mur.a - mur.de || 1
      const at = mur.axe === 'z' ? (w / 2 - mur.de) / longueur : (dReel / 2 - mur.de) / longueur
      const reach = mur.axe === 'z' ? frontReach : sideReach
      out.set(mur.id, makeFadeAlpha({ axis: 'u', at, reach }))
    }
    return out
  }, [avecRampant, plan.murs, lesRampants, wallH, w, dReel, frontReach, sideReach])

  const Plane = ({
    position,
    rotation,
    args,
    side = DoubleSide,
    alpha = null,
    color,
    roughness = 0.9
  }: {
    position: [number, number, number]
    rotation: [number, number, number]
    args: [number, number]
    side?: typeof DoubleSide | typeof FrontSide
    alpha?: CanvasTexture | null
    color: string
    roughness?: number
  }) => (
    <mesh position={position} rotation={rotation} receiveShadow castShadow={mursOmbre}>
      <planeGeometry args={args} />
      {schema ? (
        <meshBasicMaterial color={color} side={side} />
      ) : (
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={0}
          envMapIntensity={0.6}
          alphaMap={alpha ?? undefined}
          transparent={alpha != null}
          side={side}
          // Ombres VSM : three ne retourne pas la face pour ce type de carte — sans cela un mur vu de dos par le soleil ne projette rien.
          shadowSide={mursOmbre ? DoubleSide : undefined}
        />
      )}
    </mesh>
  )

  /** B4 : une surface de la pièce dont la géométrie est calculée (plafond en pente, mur polygonal) ; mêmes matériaux que `Plane`. */
  const Surface = ({ geometry, alpha = null, color, roughness = 0.9 }: { geometry: THREE.BufferGeometry; alpha?: CanvasTexture | null; color: string; roughness?: number }) => (
    <mesh geometry={geometry} receiveShadow castShadow={mursOmbre}>
      {schema ? (
        <meshBasicMaterial color={color} side={DoubleSide} />
      ) : (
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={0}
          envMapIntensity={0.6}
          alphaMap={alpha ?? undefined}
          transparent={alpha != null}
          side={DoubleSide}
          shadowSide={mursOmbre ? DoubleSide : undefined}
        />
      )}
    </mesh>
  )

  if (!schema && flags.wireframe) return null
  // « Fond seul » : pas de murs ni de plafond, mais le sol reste — c'est lui qui reçoit
  // l'ombre ; sans lui le meuble flotte (mesuré sur la proposition P4-B).
  const onlyFloor = !schema && !banc.roomEnabled

  const wallCol = schema ? SCHEMA.sideWall : banc.wallColor
  const back = schema ? SCHEMA.backWall : banc.wallColor
  const floor = schema ? SCHEMA.floor : banc.floorColor
  const ceiling = schema ? SCHEMA.ceiling : CLIENT.ceiling

  /** la baie d'un mur : le tableau (une boîte ouverte des deux faces, vue de l'intérieur) et le vitrage — communs au mur plat et au mur polygonal */
  const baie = (mur: MurPlan, fen: FenetrePlan, rot: [number, number, number]) => {
    const bas = fen.allege_m
    const haut = fen.allege_m + fen.hauteur_m
    const dehors = mur.at - mur.normale * fen.tableau_m
    const posT = (at: number, le: number, y: number): [number, number, number] => (mur.axe === 'z' ? [le, y, at] : [at, y, le])
    // Une fenêtre est une source de lumière ; un passage ouvre sur une pièce voisine, plus sombre.
    const vitre = fen.type === 'passage' ? (schema ? '#6E6E6E' : '#4A443B') : schema ? '#9EC3E6' : '#FFFFFF'
    return (
      <>
        {/* Reveal (tableau) : a box open on both faces, seen from inside. */}
        <mesh position={posT((mur.at + dehors) / 2, fen.centre_m, (bas + haut) / 2)} receiveShadow>
          <boxGeometry args={mur.axe === 'z' ? [fen.largeur_m, fen.hauteur_m, fen.tableau_m] : [fen.tableau_m, fen.hauteur_m, fen.largeur_m]} />
          {schema ? <meshBasicMaterial color={SCHEMA.ceiling} side={BackSide} /> : <meshStandardMaterial color={banc.wallColor} roughness={0.9} side={BackSide} />}
        </mesh>
        {/* The pane : pure light in client mode, a flat blue in schema mode. */}
        <mesh position={posT(dehors + 0.001 * mur.normale, fen.centre_m, (bas + haut) / 2)} rotation={rot}>
          <planeGeometry args={[fen.largeur_m, fen.hauteur_m]} />
          <meshBasicMaterial color={vitre} toneMapped={false} />
        </mesh>
      </>
    )
  }

  return (
    <group>
      {/* Floor — opaque under the unit, fading into the open room. */}
      <Plane
        position={[cx, 0, roomD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[roomW, roomD]}
        side={FrontSide}
        alpha={floorAlpha}
        color={floor}
        roughness={0.85}
      />

      {onlyFloor ? null : (<>
      {/* Ceiling — rarely in frame at eye level; kept for the schema mode
          and for the reflections of the environment. B4 : en pente sous un rampant. */}
      {plafondRampant ? (
        <Surface geometry={plafondRampant} alpha={topAlpha} color={ceiling} roughness={1} />
      ) : (
        <Plane
          position={[cx, wallH, roomD / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[roomW, roomD]}
          side={FrontSide}
          alpha={topAlpha}
          color={ceiling}
          roughness={1}
        />
      )}

      {/* Walls from the plan. A wall along x (axe 'z') faces ±z ; a wall along z
          (axe 'x') faces ±x. A wall carrying a window is drawn as four opaque
          pieces around the opening, plus the reveal and a bright pane.
          B4 : un mur dont le haut suit un rampant est un polygone troué de sa baie. */}
      {plan.murs.map(mur => {
        const longueur = mur.a - mur.de
        const milieu = (mur.de + mur.a) / 2
        const couleur = mur.axe === 'z' ? back : wallCol
        const rot: [number, number, number] = mur.axe === 'z' ? [0, mur.normale === 1 ? 0 : Math.PI, 0] : [0, (mur.normale * Math.PI) / 2, 0]
        const pos = (le: number, y: number): [number, number, number] => (mur.axe === 'z' ? [le, y, mur.at - 0.002 * mur.normale] : [mur.at - 0.0005 * mur.normale, y, le])
        const alpha = mur.axe === 'z' ? zAlphaA : mur.normale === 1 ? leftSideAlpha : rightSideAlpha
        const fen = mur.fenetre
        if (!murPlat(mur, lesRampants, wallH)) {
          return <MurPolygone key={mur.id} mur={mur} rampants={lesRampants} wallH={wallH} alpha={alphaPolygone.get(mur.id) ?? null} couleur={couleur} Surface={Surface}>{fen ? baie(mur, fen, rot) : null}</MurPolygone>
        }
        if (!fen) {
          return <Plane key={mur.id} position={pos(milieu, wallH / 2)} rotation={rot} args={[longueur, wallH]} side={FrontSide} alpha={mur.nature === 'face' ? null : alpha} color={couleur} />
        }
        const f0 = fen.centre_m - fen.largeur_m / 2
        const f1 = fen.centre_m + fen.largeur_m / 2
        const bas = fen.allege_m
        const haut = fen.allege_m + fen.hauteur_m
        return (
          <group key={mur.id}>
            {f0 - mur.de > 0.001 && <Plane position={pos((mur.de + f0) / 2, wallH / 2)} rotation={rot} args={[f0 - mur.de, wallH]} side={FrontSide} color={couleur} />}
            {mur.a - f1 > 0.001 && <Plane position={pos((f1 + mur.a) / 2, wallH / 2)} rotation={rot} args={[mur.a - f1, wallH]} side={FrontSide} color={couleur} />}
            {bas > 0.001 && <Plane position={pos(fen.centre_m, bas / 2)} rotation={rot} args={[fen.largeur_m, bas]} side={FrontSide} color={couleur} />}
            {wallH - haut > 0.001 && <Plane position={pos(fen.centre_m, (haut + wallH) / 2)} rotation={rot} args={[fen.largeur_m, wallH - haut]} side={FrontSide} color={couleur} />}
            {baie(mur, fen, rot)}
          </group>
        )
      })}

      {/* Habillage minimal (cadre, console, téléviseur) : des volumes simples à la place des vides que Flora comblerait. */}
      {plan.habillage.map(q => {
        const couleur = q.type === 'tele' ? '#17181A' : q.type === 'cadre' ? (schema ? '#7A5C3A' : '#8A6A45') : schema ? '#9C7B55' : '#B08D62'
        return (
          <group key={q.id}>
            <mesh position={[(q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, (q.z0 + q.z1) / 2]} castShadow receiveShadow>
              <boxGeometry args={[q.x1 - q.x0, q.y1 - q.y0, q.z1 - q.z0]} />
              {schema ? <meshBasicMaterial color={couleur} /> : <meshStandardMaterial color={couleur} roughness={q.type === 'tele' ? 0.35 : 0.7} metalness={0} />}
            </mesh>
            {q.type === 'cadre' && (
              <mesh position={[(q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, q.z1 + 0.002]}>
                <planeGeometry args={[(q.x1 - q.x0) * 0.78, (q.y1 - q.y0) * 0.82]} />
                {schema ? <meshBasicMaterial color='#EDE6D8' /> : <meshStandardMaterial color='#EDE6D8' roughness={0.9} />}
              </mesh>
            )}
          </group>
        )
      })}

      {/* Wall returns (jambages) at the tip of a built-in wing : solid blocks. B4 : pas plus hauts que le plafond à leur aplomb. */}
      {plan.retours.map(q => {
        const hR = avecRampant ? Math.min(wallH, ...[[q.x0, q.z0], [q.x1, q.z0], [q.x0, q.z1], [q.x1, q.z1]].map(([x, z]) => hauteurPlafond(lesRampants, x, z, wallH))) : wallH
        return (
          <mesh key={q.id} position={[(q.x0 + q.x1) / 2, hR / 2, (q.z0 + q.z1) / 2]} castShadow receiveShadow>
            <boxGeometry args={[q.x1 - q.x0, hR, q.z1 - q.z0]} />
            {schema ? <meshBasicMaterial color={SCHEMA.sideWall} /> : <meshStandardMaterial color={banc.wallColor} roughness={0.9} metalness={0} />}
          </mesh>
        )
      })}
      </>)}
    </group>
  )
})

/** B4 : un mur polygonal (le haut suit le rampant), sa baie en trou ; la géométrie vit avec le mur et meurt avec lui. */
function MurPolygone ({
  mur,
  rampants,
  wallH,
  alpha,
  couleur,
  Surface,
  children
}: {
  mur: MurPlan
  rampants: Rampant[]
  wallH: number
  alpha: CanvasTexture | null
  couleur: string
  Surface: (p: { geometry: THREE.BufferGeometry; alpha?: CanvasTexture | null; color: string; roughness?: number }) => React.JSX.Element
  children?: React.ReactNode
}) {
  const geometrie = useMemo(() => {
    const fen = mur.fenetre
    const trou = fen ? { u0: fen.centre_m - fen.largeur_m / 2, u1: fen.centre_m + fen.largeur_m / 2, y0: fen.allege_m, y1: fen.allege_m + fen.hauteur_m } : null
    return geometrieMur(mur, rampants, wallH, trou)
  }, [mur, rampants, wallH])
  useEffect(() => () => geometrie.dispose(), [geometrie])
  return (
    <group>
      <Surface geometry={geometrie} alpha={alpha} color={couleur} />
      {children}
    </group>
  )
}
