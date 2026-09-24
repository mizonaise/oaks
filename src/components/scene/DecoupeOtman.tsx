'use client'

import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { decouperGeometrie, decouperSegments, planCoupeBoite, planThree, racinesFacadeSpeciale, type PlanDecoupe } from '@/lib/foxcad/decoupe'
import { signalerDecoupeOtman, type CotesFacade, type DecoupeZone } from '@/lib/foxcad/chemin-otman'

/**
 * LA DÉCOUPE DE LA FAÇADE SPÉCIALE DU DESIGNER D'OTMAN PAR LE CONTOUR DE LA PORTE DE FOX-CAD (d5, 23/09 — mot de Dorian 09:5x, ligne du
 * lead). Dans la zone d'un module coupé (`_Q4L`, `_H5L`, `_Q4R`, `_H5R`, `_SS`), le designer est monté sur le module PLEIN et dessine la
 * façade spéciale entière (`@oak-some/special-kms`, CSG : un maillage à groupes de matériaux, un panneau intérieur, des arêtes) ; ce
 * composant, à chaque image comme le masque, retrouve cette façade — le maillage aux cotes d'une façade des statistiques du designer, sous
 * une porte gardée — et REMPLACE la géométrie de chacun de ses morceaux par la même géométrie découpée par les plans du contour
 * (`lib/foxcad/decoupe.ts` : demi-espaces, chant refermé, arêtes coupées et section tracée). Les géométries du designer ne sont jamais
 * modifiées : elles sont gardées et remises en place quand la découpe cesse (front plein, zone démontée).
 *
 * Le repère : mesuré le 23/09 (`_tmp/2026-09-23/portes-pente/hex-fr08-3025-rel.scene.json`), le groupe de la porte `special-kms` a les axes de
 * la zone (X à droite, Y en haut, Z vers l'avant, mm) et son origine au centre de la porte, elle-même centrée dans la boîte — les plans du
 * contour, écrits dans le repère centré de la zone, s'y appliquent directement. Le décalage réel du groupe est relu à chaque image où la
 * porte est FERMÉE (rotation identité) et gardé pendant qu'elle s'ouvre : la découpe suit la porte.
 *
 * Tant que le contour n'est pas là (`attente`), la façade est cachée : jamais une façade entière qui traverse le rampant, même une image.
 */
export interface DecoupeDemandee {
  cle: string
  plans: PlanDecoupe[]
  /** le module coupé de fox-cad, et le module plein monté dans le designer */
  module: string
  plein: string
  /** le KMS multi-pièces que le moteur a refusé — ou qu'il sert sans que l'écran le dessine (`source` : `facade-servie`) */
  kms: string | null
  /** les sommets du contour de la porte pleine (ou du parent servi) */
  sommets: number
  etat: 'plans' | 'attente' | 'indisponible'
  /**
   * d'où vient le contour qui découpe : `porte-pleine` = la porte du second calcul (la façade est un manque chez le moteur) ;
   * `facade-servie` = le parent de la façade coupée que le moteur sert, non dessinée par l'écran (24/09, la garde du pourtour)
   */
  source: 'porte-pleine' | 'facade-servie'
  /** pourquoi l'écran ne dessine pas la façade servie (`facade-servie`) ; `null` sinon */
  raison: string | null
}

interface Coupe {
  source: THREE.BufferGeometry
  resultat: THREE.BufferGeometry
  cle: string
}

type LigneEpaisse = THREE.Object3D & { isLineSegments2?: boolean; geometry: THREE.BufferGeometry; computeLineDistances?: () => void }

const cleDecoupe = (d: DecoupeDemandee, ox: number, oy: number): string => `${d.cle}|${Math.round(ox * 10)}|${Math.round(oy * 10)}`

export function DecoupeOtman({
  target,
  index,
  demande,
  facades,
}: {
  target: RefObject<THREE.Group | null>
  index: string
  demande: DecoupeDemandee
  /** les cotes des façades que le designer a rendues (ses statistiques) : c'est ainsi qu'on reconnaît sa façade spéciale */
  facades: RefObject<CotesFacade[]>
}) {
  const invalidate = useThree((s) => s.invalidate)
  const coupes = useRef(new Map<THREE.Object3D, Coupe>())
  const caches = useRef(new Set<THREE.Object3D>())
  const decalages = useRef(new WeakMap<THREE.Object3D, [number, number]>())
  const dernier = useRef('')
  const demandeRef = useRef(demande)
  demandeRef.current = demande

  const restaurer = (o: THREE.Object3D) => {
    const c = coupes.current.get(o)
    if (!c) return
    const m = o as THREE.Mesh
    if (m.geometry === c.resultat) m.geometry = c.source
    c.resultat.dispose()
    coupes.current.delete(o)
  }
  const montrer = (o: THREE.Object3D) => {
    if (caches.current.delete(o)) o.visible = true
  }

  useFrame(() => {
    const g = target.current
    if (!g) return
    const d = demandeRef.current
    const cotes = facades.current ?? []
    // les racines de porte du designer : le maillage CSG de `special-kms` (matériaux en tableau, groupes) aux cotes d'une façade des
    // statistiques — sa géométrie d'ORIGINE quand nous l'avons déjà coupé — sous une porte gardée (visible), celles que NOUS avons cachées
    // pendant l'attente comprises (sinon elles ne sont plus retrouvées quand le contour arrive : mesuré le 23/09 19:2x)
    const racines = racinesFacadeSpeciale(g, cotes, (m) => coupes.current.get(m)?.source ?? m.geometry, caches.current)

    let planCount = 0
    let coupesCount = 0
    let chantApproche = false
    let racinesCoupees = 0

    for (const racine of racines) {
      if (d.etat === 'attente') {
        // le contour n'est pas là : la façade entière ne se montre pas
        if (racine.visible) {
          racine.visible = false
          caches.current.add(racine)
        }
        continue
      }
      montrer(racine)
      const enfants = racine.children
      const maillages = enfants.filter((e) => (e as THREE.Mesh).isMesh) as THREE.Mesh[]
      const lignes = enfants.filter((e) => (e as LigneEpaisse).isLineSegments2) as LigneEpaisse[]
      if (d.etat === 'indisponible' || d.plans.length === 0) {
        for (const e of [...maillages, ...lignes]) restaurer(e)
        continue
      }
      // le décalage du groupe de la porte dans le repère de la zone, relu quand la porte est fermée (rotation identité), gardé sinon
      const rel = new THREE.Matrix4().copy(g.matrixWorld).invert().multiply(racine.matrixWorld)
      const e = rel.elements
      const identite = Math.abs(e[0] - 1) < 1e-3 && Math.abs(e[5] - 1) < 1e-3 && Math.abs(e[10] - 1) < 1e-3 && Math.abs(e[1]) < 1e-3 && Math.abs(e[2]) < 1e-3 && Math.abs(e[4]) < 1e-3 && Math.abs(e[6]) < 1e-3
      let decalage = decalages.current.get(racine) ?? [0, 0]
      if (identite) {
        decalage = [e[12], e[13]]
        decalages.current.set(racine, decalage)
      }
      const cle = cleDecoupe(d, decalage[0], decalage[1])
      // les plans dans le repère du groupe de la porte : n·(P + t) + c = n·P + (c + n·t)
      const plansRacine: PlanDecoupe[] = d.plans.map((p) => ({ ...p, constant: p.constant + p.normal[0] * decalage[0] + p.normal[1] * decalage[1] }))
      planCount = plansRacine.length
      const boucles: THREE.Vector3[][] = []
      let coupesRacine = 0
      let premiere = true
      for (const m of maillages) {
        const existante = coupes.current.get(m)
        const source = existante && m.geometry === existante.resultat ? existante.source : m.geometry
        if (existante && existante.cle === cle && m.geometry === existante.resultat) {
          // déjà coupé à l'identique : ses boucles ne sont plus connues, mais ses arêtes non plus ne changent pas
          if (premiere) coupesRacine = Number(m.userData.decoupeCoupes ?? 0)
          premiere = false
          continue
        }
        // la boîte de la source est TOUJOURS recalculée : la géométrie CSG du designer garde une boîte périmée (mesuré le 23/09)
        source.computeBoundingBox()
        const bb = source.boundingBox as THREE.Box3
        const locaux = plansRacine.map((p) => planThree(p, m.matrix))
        const boite = { min: [bb.min.x, bb.min.y, bb.min.z] as [number, number, number], max: [bb.max.x, bb.max.y, bb.max.z] as [number, number, number] }
        const quiCoupent = locaux.filter((p, i) => planCoupeBoite({ normal: [p.normal.x, p.normal.y, p.normal.z], constant: p.constant, arete: plansRacine[i].arete }, boite))
        if (existante && m.geometry === existante.resultat) {
          m.geometry = existante.source
          existante.resultat.dispose()
          coupes.current.delete(m)
        }
        if (quiCoupent.length === 0) {
          if (premiere) coupesRacine = 0
          premiere = false
          continue
        }
        const r = decouperGeometrie(source, quiCoupent)
        if (!r.coupee) {
          if (r.geometrie !== source) r.geometrie.dispose()
          premiere = false
          continue
        }
        m.geometry = r.geometrie
        m.userData.decoupeCoupes = r.coupes
        // pour l'outil de preuve : la boîte de la source et les plans retenus par la boîte
        m.userData.decoupeBoite = [bb.min.x, bb.max.x, bb.min.y, bb.max.y].map((v) => Math.round(v * 100) / 100)
        m.userData.decoupePlansBoite = quiCoupent.length
        coupes.current.set(m, { source, resultat: r.geometrie, cle })
        chantApproche = chantApproche || r.chantApproche
        // les boucles de section, dans le repère du groupe de la porte
        for (const b of r.boucles) boucles.push(b.map((p) => p.clone().applyMatrix4(m.matrix)))
        if (premiere) coupesRacine = r.coupes
        premiere = false
      }
      for (const l of lignes) {
        const existante = coupes.current.get(l)
        if (existante && existante.cle === cle && l.geometry === existante.resultat) continue
        const source = existante && l.geometry === existante.resultat ? existante.source : l.geometry
        const debut = source.getAttribute('instanceStart')
        const fin = source.getAttribute('instanceEnd')
        if (!debut || !fin) continue
        if (boucles.length === 0 && coupesRacine === 0) {
          restaurer(l)
          continue
        }
        const plat: number[] = []
        for (let i = 0; i < debut.count; i++) plat.push(debut.getX(i), debut.getY(i), debut.getZ(i), fin.getX(i), fin.getY(i), fin.getZ(i))
        const inverse = l.matrix.clone().invert()
        const locaux = plansRacine.map((p) => planThree(p, l.matrix))
        const r = decouperSegments(plat, locaux, boucles.map((b) => b.map((p) => p.clone().applyMatrix4(inverse))))
        if (existante && l.geometry === existante.resultat) {
          l.geometry = existante.source
          existante.resultat.dispose()
          coupes.current.delete(l)
        }
        if (!r.coupee) continue
        const geo = new LineSegmentsGeometry()
        geo.setPositions(new Float32Array(r.positions))
        l.geometry = geo
        l.computeLineDistances?.()
        coupes.current.set(l, { source, resultat: geo, cle })
      }
      coupesCount += coupesRacine
      if (coupesRacine > 0) racinesCoupees++
    }

    const etat: DecoupeZone['etat'] = d.etat === 'attente' ? 'attente' : d.etat === 'indisponible' ? 'indisponible' : racines.length === 0 ? 'attente' : racinesCoupees > 0 ? 'coupee' : 'entiere'
    const bilan: DecoupeZone = { etat, module: d.module, plein: d.plein, kms: d.kms, plans: planCount || d.plans.length, coupes: coupesCount, sommets: d.sommets, chant: racinesCoupees > 0 ? (chantApproche ? 'approche' : 'exact') : null, source: d.source, raison: d.raison }
    const cle = JSON.stringify(bilan)
    if (cle === dernier.current) return
    dernier.current = cle
    signalerDecoupeOtman(index, bilan)
    invalidate()
  })

  useEffect(
    () => () => {
      for (const o of [...coupes.current.keys()]) restaurer(o)
      for (const o of [...caches.current]) montrer(o)
      signalerDecoupeOtman(index, null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  )
  return null
}
