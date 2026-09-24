'use client'

import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { CoteCharnieres } from '@/lib/foxcad/geometrie'
import type { Portee } from '@/lib/foxcad/materiaux'
import type { Piece } from '@/lib/foxcad/types'
import { signalerPoignee, type ModePoignee } from '@/lib/foxcad/poignees'
import { posePoignee, type PosePoignee, type TablesPoignee } from '@/lib/foxcad/pose-poignee'
import { naturePoigneePortees, type NaturePoignee, type NaturePto } from '@/lib/foxcad/pto'

/**
 * B4 ④ (22/09), règle d'Otman 1.0.102 (23/09) : LA POIGNÉE D'OTMAN SUR UNE PORTE DE FOX-CAD — le GLB de la poignée choisie (`OV_PULL`,
 * `PULL_GLB`) posé à la position de son designer, sinon une pastille à cette position. La règle vit dans `lib/foxcad/pose-poignee.ts`
 * (testée) : le centre à `PULL_X` du bord libre, `PULL_Z` devant la face, la hauteur par le `MANINFO` de l'élément de porte du graphe
 * `article-data` (`#DS_LD_PULL_OS_D1` → 1 050 mm du sol fini) — sinon le repli 1 050 − socle, DIT : la pose est dans le `userData` de la
 * poignée (source de la hauteur, descripteur, division résolue, raison) et le magasin `poignees.ts` la compte pour le badge. Sur une porte
 * coupée par le rampant la poignée descend jusqu'à être DANS le contour (notre règle, pas celle d'Otman). L'orientation est celle du
 * designer (repère du panneau X haut / Y gauche / Z avant, rotation π/2 (+ π à droite) + `PULL_ROT`) ; le GLB est en mètres.
 */

/** la base des GLB de poignées d'Otman — `MEDIA_BASE_URL` du designer (`R2_ASSET_URL`) */
export const MEDIA_POIGNEES = 'https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA'
/** le designer place en mètres (mm / DIM_NORM) ; nos pièces sont en mm */
const DIM_NORM = 1000

/** ce que la scène dit de la pose (l'outil de preuve le lit dans `userData`) */
const userDataPose = (pose: PosePoignee, mode: ModePoignee) => ({
  foxcad: true,
  poignee: mode,
  hauteurSource: pose.hauteur.source,
  hauteurPorte: pose.hauteurPorte,
  descendue: pose.descendue,
  butee: pose.butee ?? null,
  descripteur: pose.hauteur.descripteur,
  lindiv: pose.hauteur.lindiv,
  resolu: pose.hauteur.resolu,
  raison: pose.hauteur.raison,
  pullX: pose.pullX,
  pullZ: pose.pullZ,
})

/** la pastille : un disque de 20 mm posé sur la face avant, sombre et mat — ce que le designer dessine quand son GLB manque */
function Pastille ({ pose, id, contrasted }: { pose: PosePoignee; id: string; contrasted: boolean }) {
  const source = pose.hauteur.source
  const butee = Boolean(pose.butee)
  useEffect(() => {
    signalerPoignee(id, 'pastille', source, butee)
    return () => signalerPoignee(id, null)
  }, [id, source, butee])
  const [x, y, z] = pose.position
  return (
    <mesh position={[x, y - 6, z]} name='poignee pastille' castShadow userData={userDataPose(pose, 'pastille')}>
      <cylinderGeometry args={[10, 10, 12, 24]} />
      <meshStandardMaterial color={contrasted ? '#1A1A1A' : '#2E2E2E'} roughness={0.5} metalness={0.3} />
    </mesh>
  )
}

function ModeleGlb ({ url, pose, id }: { url: string; pose: PosePoignee; id: string }) {
  const { scene } = useGLTF(url)
  const objet = useMemo(() => {
    const o = scene.clone(true)
    o.traverse(n => {
      const mesh = n as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.userData = { ...mesh.userData, foxcad: true, poignee: 'glb' }
      }
    })
    return o
  }, [scene])
  const source = pose.hauteur.source
  const butee = Boolean(pose.butee)
  useEffect(() => {
    signalerPoignee(id, 'glb', source, butee)
    return () => signalerPoignee(id, null)
  }, [id, source, butee])
  return (
    <group position={pose.position} quaternion={pose.quaternion} scale={[DIM_NORM, DIM_NORM, DIM_NORM]} name='poignee glb' userData={userDataPose(pose, 'glb')}>
      <primitive object={objet} />
    </group>
  )
}

const MODE_PTO: Record<NaturePto, ModePoignee> = { choix: 'pto-choix', repli: 'pto-repli', technique: 'pto-technique' }

/**
 * une porte SANS poignée posée (`pto.ts` : push to open choisi ou imposé, porte technique, « None », poignée intégrée) : rien à l'écran — ni
 * GLB ni pastille ni perçage —, un groupe VIDE qui porte la nature dans son `userData` (les outils de preuve le lisent), et le compte du badge
 */
function SansPoignee ({ nature, id }: { nature: Exclude<NaturePoignee, { genre: 'poignee' }>; id: string }) {
  const mode: ModePoignee = nature.genre === 'pto' ? MODE_PTO[nature.nature] : nature.genre
  useEffect(() => {
    signalerPoignee(id, mode, null)
    return () => signalerPoignee(id, null)
  }, [id, mode])
  return <group name={`poignee ${mode}`} userData={{ foxcad: true, poignee: mode, pto: nature.genre === 'pto' ? nature.nature : null, raison: nature.raison }} />
}

/** un GLB qui ne charge pas (404, CORS, fichier corrompu) : la pastille, pas une page blanche */
class GardePoignee extends Component<{ repli: ReactNode; children: ReactNode }, { echec: boolean }> {
  state = { echec: false }
  static getDerivedStateFromError () {
    return { echec: true }
  }
  render () {
    return this.state.echec ? this.props.repli : this.props.children
  }
}

export function PoigneeFoxCad ({
  p,
  cote,
  portees,
  tables,
  article,
  id,
  contrasted = false,
}: {
  p: Piece
  cote: CoteCharnieres
  portees: Portee[]
  /** le graphe `article-data` de l'article de la position (éléments et descripteurs : la hauteur par le MANINFO) */
  tables?: TablesPoignee
  article?: string
  id: string
  contrasted?: boolean
}) {
  const nature = useMemo(() => naturePoigneePortees(portees), [portees])
  const pose = useMemo(() => posePoignee(p, cote, portees, tables, article), [p, cote, portees, tables, article])
  // la règle PTO de Dorian (23/09 19:5x) : une porte en push to open, « None » ou à poignée intégrée ne porte NI poignée NI pastille
  if (nature.genre !== 'poignee') return <SansPoignee nature={nature} id={id} />
  const pastille = <Pastille pose={pose} id={id} contrasted={contrasted} />
  if (!pose.glb) return pastille
  const url = /^https?:\/\//.test(pose.glb) ? pose.glb : `${MEDIA_POIGNEES}/${pose.glb.replace(/^\/+/, '')}`
  return (
    <GardePoignee repli={pastille}>
      <Suspense fallback={null}>
        <ModeleGlb url={url} pose={pose} id={id} />
      </Suspense>
    </GardePoignee>
  )
}
