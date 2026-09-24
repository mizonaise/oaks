'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { calculerLot } from './api'
import { facadeSansPorte, lotPortePleine } from './decoupe'
import { estPorte } from './geometrie'
import type { PositionFoxCad } from './lot'
import { estErreur, type Piece, type ReponseCalculLot } from './types'

/**
 * LE CONTOUR DE LA PORTE PLEINE (d5, 23/09 — les portes en pente avec le spécial KMS d'Otman) : pour chaque position dont la porte est une
 * façade spéciale que fox-cad refuse (« KMS MP_1_FR_SHELL_… : pièce multiple à 6 sous-pièces »), UNE seconde demande `POST /calcul/lot`
 * avec le même lot et la porte pleine (`Door_Name = FR_01_LAM`) — fox-cad rend alors la porte `PD_1_FR_1111` de cette position, avec son
 * contour coupé par le rampant (4 ou 5 sommets), sa pose et ses charnières. C'est ce contour qui découpe la façade spéciale du designer
 * d'Otman (`DecoupeOtman`). Rien n'est calculé ici, rien n'est deviné : le contour est celui de l'API ; l'écran dit que la façade est
 * « rendue, pas calculée ». Une demande par changement de lot (clé = les lots substitués), une réponse dépassée est ignorée.
 */
export interface PortePleine {
  index: string
  article: string
  /** le KMS multi-pièces de la façade spéciale que le moteur a refusé sur cette position */
  kms: string
  /** la porte pleine que fox-cad rend pour la même position */
  porte: Piece
}

export interface PortesPleines {
  etat: 'inactif' | 'en-cours' | 'ok' | 'erreur'
  /** par index de zone : la porte pleine (celles du DERNIER calcul réussi tant que le nouveau n'a pas répondu) */
  parIndex: ReadonlyMap<string, PortePleine>
  /** les zones dont la porte pleine est attendue (demandée, pas encore reçue) */
  enAttente: ReadonlySet<string>
  /** les zones sans porte que le moteur n'a pas su rendre pleine non plus (pas de porte dans la réponse) */
  sansContour: ReadonlySet<string>
  message: string | null
  demandees: number
}

const VIDE: PortesPleines = { etat: 'inactif', parIndex: new Map(), enAttente: new Set(), sansContour: new Set(), message: null, demandees: 0 }

interface ADemander {
  index: string
  article: string
  kms: string
  lot: Record<string, string>
}

/** les positions à redemander avec la porte pleine : façade spéciale refusée ET un lot qui nomme sa porte */
export function positionsARedemander(positions: PositionFoxCad[], reponse: ReponseCalculLot | null): ADemander[] {
  if (!reponse) return []
  const out: ADemander[] = []
  positions.forEach((pos, i) => {
    const sans = facadeSansPorte(reponse.positions[i])
    if (!sans) return
    const lot = lotPortePleine(pos.lot)
    if (!lot) return
    out.push({ index: pos.index, article: pos.article, kms: sans.kms, lot })
  })
  return out
}

export function usePortesPleines(positions: PositionFoxCad[], reponse: ReponseCalculLot | null): PortesPleines {
  const aDemander = useMemo(() => positionsARedemander(positions, reponse), [positions, reponse])
  const cle = useMemo(() => JSON.stringify(aDemander.map((d) => [d.index, d.article, d.lot])), [aDemander])
  const [etat, setEtat] = useState<PortesPleines>(VIDE)
  const sequence = useRef(0)
  const derniere = useRef<{ cle: string; parIndex: Map<string, PortePleine>; sansContour: Set<string> } | null>(null)

  useEffect(() => {
    if (aDemander.length === 0) {
      derniere.current = null
      setEtat(VIDE)
      return
    }
    if (derniere.current && derniere.current.cle === cle) return
    const n = ++sequence.current
    setEtat((e) => ({ ...e, etat: 'en-cours', enAttente: new Set(aDemander.map((d) => d.index)), demandees: aDemander.length }))
    const controleur = new AbortController()
    void calculerLot({ positions: aDemander.map((d) => ({ article: d.article, lot: d.lot, options: { tolererManques: true } })), detail: 'pieces' }, controleur.signal).then((r) => {
      if (n !== sequence.current) return
      if (!r.ok) {
        if (!controleur.signal.aborted) setEtat((e) => ({ ...e, etat: 'erreur', enAttente: new Set(), message: `porte pleine : ${r.message}` }))
        return
      }
      const parIndex = new Map<string, PortePleine>()
      const sansContour = new Set<string>()
      aDemander.forEach((d, i) => {
        const p = r.valeur.positions[i]
        const porte = p && !estErreur(p) ? p.pieces.find(estPorte) : undefined
        if (porte) parIndex.set(d.index, { index: d.index, article: d.article, kms: d.kms, porte })
        else sansContour.add(d.index)
      })
      derniere.current = { cle, parIndex, sansContour }
      setEtat({ etat: 'ok', parIndex, enAttente: new Set(), sansContour, message: null, demandees: aDemander.length })
    })
    return () => {
      controleur.abort()
    }
    // volontairement sur la clé : un objet neuf aux mêmes lots ne relance rien
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle])

  return etat
}
