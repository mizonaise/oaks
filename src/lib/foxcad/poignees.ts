'use client'

import { useSyncExternalStore } from 'react'
import type { SourceHauteur } from './pose-poignee'

/**
 * B4 ④ (22/09) : ce que la scène dit des POIGNÉES posées sur les portes de fox-cad — par porte, le GLB de la poignée choisie (`OV_PULL`)
 * ou la pastille (GLB absent, non chargé, ou aucune poignée publiée) ; depuis le 23/09, aussi d'où vient sa HAUTEUR : le `MANINFO` de
 * l'élément de porte (la règle d'Otman) ou le repli 1 050 − socle quand il manque. Le badge fox-cad de la page le recopie
 * (`data-foxcad-poignees-*`) : l'écran dit ce qu'il dessine, l'outil de preuve le lit. Un petit magasin partagé, comme le pont de capture —
 * rien sur `window`.
 */
/**
 * `glb` / `pastille` : une poignée posée. Depuis la règle PTO de Dorian (23/09 19:5x, `pto.ts`), aussi les portes SANS poignée posée —
 * `pto-choix` (« Push and Open » choisi), `pto-repli` (la zone l'impose), `pto-technique` (la porte technique d'Otman), `sans` (« None »),
 * `integree` (la poignée usinée dans la façade, `WC_OS_GR_*`) : ni GLB ni pastille, comptées pour le badge.
 */
export type ModePoignee = 'glb' | 'pastille' | 'pto-choix' | 'pto-repli' | 'pto-technique' | 'sans' | 'integree'

export interface ResumePoignees {
  glb: number
  pastille: number
  /** hauteur par le MANINFO de l'élément de porte (poignées posées seulement) */
  maninfo: number
  /** hauteur par le repli 1 050 − socle (MANINFO absent, graphe non chargé, division non calculable) */
  repli: number
  /** 24/09 : poignées de portes coupées arrêtées à la GARDE HAUTE d'imos (500 sous le haut de la porte à leur aplomb), sous la ligne */
  butee: number
  /** portes en push to open : choisie par le client, imposée par la zone (repli), porte technique d'Otman */
  ptoChoix: number
  ptoRepli: number
  ptoTechnique: number
  /** « None » : aucune poignée */
  sans: number
  /** poignée intégrée (usinée dans la façade), non dessinée */
  integree: number
}

const poignees = new Map<string, { mode: ModePoignee; hauteur: SourceHauteur | null; butee: boolean }>()
const abonnes = new Set<() => void>()
const VIDE: ResumePoignees = { glb: 0, pastille: 0, maninfo: 0, repli: 0, butee: 0, ptoChoix: 0, ptoRepli: 0, ptoTechnique: 0, sans: 0, integree: 0 }
let resume: ResumePoignees = VIDE

const recompter = () => {
  const r = { ...VIDE }
  for (const p of poignees.values()) {
    if (p.mode === 'glb') r.glb++
    else if (p.mode === 'pastille') r.pastille++
    else if (p.mode === 'pto-choix') r.ptoChoix++
    else if (p.mode === 'pto-repli') r.ptoRepli++
    else if (p.mode === 'pto-technique') r.ptoTechnique++
    else if (p.mode === 'sans') r.sans++
    else r.integree++
    if (p.mode !== 'glb' && p.mode !== 'pastille') continue
    if (p.hauteur === 'maninfo') r.maninfo++
    else if (p.hauteur === 'repli') r.repli++
    if (p.butee) r.butee++
  }
  resume = r
  for (const f of abonnes) f()
}

/** une porte signale sa poignée (mode, d'où vient sa hauteur, et si la garde haute d'imos l'a arrêtée) ou son départ (`null`) */
export function signalerPoignee (id: string, mode: ModePoignee | null, hauteur: SourceHauteur | null = null, butee = false): void {
  if (mode === null) {
    if (!poignees.delete(id)) return
  } else {
    const avant = poignees.get(id)
    if (avant && avant.mode === mode && avant.hauteur === hauteur && avant.butee === butee) return
    poignees.set(id, { mode, hauteur, butee })
  }
  recompter()
}

const abonner = (f: () => void) => {
  abonnes.add(f)
  return () => {
    abonnes.delete(f)
  }
}
const lire = () => resume
const lireServeur = () => VIDE

/** le compte des poignées : GLB, pastilles, les portes sans poignée posée (PTO, « None », intégrée), et la source de la hauteur des posées */
export function usePoignees (): ResumePoignees {
  return useSyncExternalStore(abonner, lire, lireServeur)
}
