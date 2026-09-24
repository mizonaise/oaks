'use client'

import { useEffect, useState } from 'react'
import { useEchellesTextures } from '@/lib/textures/magasin'
import { direEchelle, ECHELLE_BOIS_MM, ECHELLE_DEFAUT_MM } from '@/lib/textures/echelle'

/**
 * LA LIGNE SOUS LA SCÈNE (nuit du 22 au 23/09) : les échelles de texture en service — par texture, les mm couverts par une répétition de
 * l'image, la source (rp-engine, la table imos, ou le défaut de d5), le nombre de maillages qui la portent. L'écran dit ce qu'il dessine ;
 * l'outil de preuve (`scripts/mesure-textures.mjs`, mode capture) lit `data-textures-echelle`.
 *
 * Montrée en mode dev (`/shape/dev/…`), sous `?banc=1` et sous `?capture=1` seulement : sur la page de vente, un client n'a pas à lire une
 * règle de rendu, et la ligne déplace la mise en page (mesuré le 22/09 : le témoin F uni différait sur 27 % de l'écran par ce seul décalage).
 * Rien tant qu'aucun maillage texturé n'est en scène.
 */
export function TexturesEchelle ({ dev = false }: { dev?: boolean }) {
  const echelles = useEchellesTextures()
  const [modeMesure, setModeMesure] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setModeMesure(params.get('banc') === '1' || params.get('capture') === '1')
  }, [])
  if (!(dev || modeMesure) || echelles.length === 0) return null
  const total = echelles.reduce((n, e) => n + e.maillages, 0)
  return (
    <p
      className='mt-2 text-xs text-zinc-500'
      data-textures-echelle={echelles.map(e => `${e.texture}:${e.mm}:${e.source}:${e.maillages}`).join(' ')}
      data-textures-maillages={total}
    >
      <span className='font-semibold text-zinc-600'>Textures à l&apos;échelle réelle</span>
      <span> — mm par répétition de l&apos;image (imos <code>SCALEFAKT</code> ; imos étire quand il vaut 0 : ici la taille réelle du décor lue chez le fabricant et mesurée contre l&apos;image (Unilin : découpe du panneau entier ; Egger : période du tissage), sinon la famille du décor — textile 120 mesuré, uni 300, bois {ECHELLE_BOIS_MM} médiane des bois Unilin mesurés, à confirmer — sinon le défaut de {ECHELLE_DEFAUT_MM.toLocaleString('fr-BE')} mm) : </span>
      {echelles.map((e, i) => (
        <span key={`${e.texture}|${e.mm}|${e.source}`}>
          {i > 0 ? ' · ' : ''}
          {direEchelle(e)} × {e.maillages}
        </span>
      ))}
    </p>
  )
}
