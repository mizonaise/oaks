'use client'

import { useSyncExternalStore } from 'react'
import type { EchelleTexture, SourceEchelle } from './echelle'

/**
 * CE QUE LA SCÈNE DIT DES ÉCHELLES DE TEXTURE (d5, nuit du 22 au 23/09) : chaque maillage texturé — pièce de fox-cad, panneau CP, maillage
 * du designer d'Otman — signale la texture qu'il porte, l'échelle appliquée (mm par répétition) et sa source. La page le recopie sous la
 * scène (`data-textures-echelle`) : l'écran dit ce qu'il dessine, l'outil de preuve le lit. Même forme que le magasin des poignées.
 */
export interface ResumeEchelle {
  texture: string
  mm: number
  source: SourceEchelle
  /** le nombre de maillages qui la portent */
  maillages: number
}

const parMaillage = new Map<string, EchelleTexture>()
const abonnes = new Set<() => void>()
let resume: ResumeEchelle[] = []
let programme = false

const recompter = () => {
  const groupes = new Map<string, ResumeEchelle>()
  for (const e of parMaillage.values()) {
    const cle = `${e.texture ?? 'sans texture'}|${e.mm}|${e.source}`
    const g = groupes.get(cle)
    if (g) g.maillages++
    else groupes.set(cle, { texture: e.texture ?? 'sans texture', mm: e.mm, source: e.source, maillages: 1 })
  }
  resume = [...groupes.values()].sort((a, b) => b.maillages - a.maillages || a.texture.localeCompare(b.texture))
  for (const f of abonnes) f()
}

/** le recompte est différé d'un tour (les maillages du designer arrivent par dizaines dans une même image) */
const planifier = () => {
  if (programme) return
  programme = true
  setTimeout(() => {
    programme = false
    recompter()
  }, 0)
}

/** un maillage signale son échelle, ou son départ (`null`) */
export function signalerEchelle(id: string, echelle: EchelleTexture | null): void {
  if (echelle === null) {
    if (!parMaillage.delete(id)) return
  } else {
    const avant = parMaillage.get(id)
    if (avant && avant.mm === echelle.mm && avant.source === echelle.source && avant.texture === echelle.texture) return
    parMaillage.set(id, echelle)
  }
  planifier()
}

const abonner = (f: () => void) => {
  abonnes.add(f)
  return () => {
    abonnes.delete(f)
  }
}
const lire = () => resume
const VIDE: ResumeEchelle[] = []
const lireServeur = () => VIDE

/** les échelles de texture en scène, groupées par (texture, mm, source), les plus portées d'abord */
export function useEchellesTextures(): ResumeEchelle[] {
  return useSyncExternalStore(abonner, lire, lireServeur)
}
