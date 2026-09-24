'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { calculerLot } from './api'
import { demandeLot, type PositionFoxCad } from './lot'
import type { ReponseCalculLot } from './types'

export type EtatCalcul = 'inactif' | 'en-cours' | 'ok' | 'erreur'

export interface CalculFoxCad {
  etat: EtatCalcul
  /** les positions que `reponse` répond, dans le même ordre (celles du DERNIER calcul réussi tant que le nouveau n'a pas répondu) */
  positions: PositionFoxCad[]
  reponse: ReponseCalculLot | null
  /** le message quand `etat` vaut `erreur` — la scène garde les pièces du dernier calcul réussi, et l'écran le dit */
  message: string | null
  /** la durée du dernier aller-retour réussi, mesurée du navigateur */
  dureeMs: number | null
  /** le compteur des calculs demandés, pour l'écran et les tests */
  numero: number
}

/**
 * LE RECALCUL DU MEUBLE PAR FOX-CAD : 250 ms après le dernier changement des positions (le formulaire émet par rafales), UNE requête
 * `POST /calcul/lot` ; une réponse dépassée par une demande plus récente est ignorée ; la scène garde les pièces du dernier calcul réussi pendant
 * le recalcul (jamais effacées avant que la suivante arrive). `actif` faux : rien n'est demandé, rien n'est gardé.
 */
export function useCalculFoxCad(actif: boolean, positions: PositionFoxCad[]): CalculFoxCad {
  const cle = useMemo(() => (actif ? JSON.stringify(demandeLot(positions)) : ''), [actif, positions])
  const [etat, setEtat] = useState<CalculFoxCad>({ etat: actif ? 'en-cours' : 'inactif', positions: [], reponse: null, message: null, dureeMs: null, numero: 0 })
  const sequence = useRef(0)
  const dernieresPositions = useRef(positions)
  dernieresPositions.current = positions

  useEffect(() => {
    if (!actif) {
      setEtat({ etat: 'inactif', positions: [], reponse: null, message: null, dureeMs: null, numero: 0 })
      return
    }
    if (positions.length === 0) return
    const n = ++sequence.current
    setEtat((e) => ({ ...e, etat: 'en-cours', numero: n }))
    const controleur = new AbortController()
    const minuterie = setTimeout(() => {
      const demandees = dernieresPositions.current
      void calculerLot(demandeLot(demandees), controleur.signal).then((r) => {
        if (n !== sequence.current) return
        if (r.ok) {
          if (r.valeur.positions.length !== demandees.length) {
            setEtat((e) => ({ ...e, etat: 'erreur', message: `fox-cad a rendu ${r.valeur.positions.length} position(s) pour ${demandees.length} demandée(s)`, numero: n }))
            return
          }
          setEtat({ etat: 'ok', positions: demandees, reponse: r.valeur, message: null, dureeMs: r.dureeMs, numero: n })
        } else if (!controleur.signal.aborted) setEtat((e) => ({ ...e, etat: 'erreur', message: r.message, numero: n }))
      })
    }, 250)
    return () => {
      clearTimeout(minuterie)
      controleur.abort()
    }
    // volontairement sur la clé (la demande sérialisée) : un objet `positions` neuf aux mêmes valeurs ne relance rien
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif, cle])

  return etat
}
