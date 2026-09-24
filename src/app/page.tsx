'use client'

import Link from 'next/link'
import { useGetProductsQuery } from '@/lib/store/api/tecniboApi'

/**
 * La racine du front : le menu de TOUTES les formes (B4 ②, mot de Dorian du 22/09 18:1x) — les formes de production que la pile sert
 * (`GET /api/shape/product` : F, L, U, CMB 1111, CMB 11S1) et les deux placards sous pente, `OS_SHAPE_HEX` et `OS_SHAPE_HEX2`, servis par leur
 * nom mais inactifs dans la liste (`ART_CONFIG.ACTIVE = false`) : nommés en dur ici, comme le lead l'a demandé. Une page sobre dans la charte
 * du client (Yet Grotesk, fond beige, vert flash) : le nom, une silhouette (aucune vignette n'existe dans la pile : les silhouettes sont à nous),
 * le lien `/shape/<panneau>`. Rien d'autre.
 */

type Forme = { id: string; titre: string; sousTitre: string; silhouette: Silhouette; origine: 'pile' | 'nommée en dur' }
type Silhouette = 'F' | 'L' | 'U' | 'CMB' | 'CMB_S' | 'HEX' | 'HEX2'

/** ce qu'on sait dire de chaque forme de production, par son id ; une forme inconnue de cette table garde son id nu */
const CONNUES: Record<string, { titre: string; sousTitre: string; silhouette: Silhouette }> = {
  OS_SHAPE_F: { titre: 'Placard droit', sousTitre: 'de face, encastré ou posé libre', silhouette: 'F' },
  OS_SHAPE_L: { titre: 'Placard en L', sousTitre: 'une aile en retour', silhouette: 'L' },
  OS_SHAPE_U: { titre: 'Placard en U', sousTitre: 'deux ailes en retour', silhouette: 'U' },
  OS_SHAPE_CMB_1111: { titre: 'Ensemble mural', sousTitre: 'quatre modules', silhouette: 'CMB' },
  OS_SHAPE_CMB_11S1: { titre: 'Ensemble mural avec niche', sousTitre: 'quatre modules, une niche', silhouette: 'CMB_S' }
}

/** les placards sous pente : servis par leur nom (`/api/shape/product/<nom>`), absents de la liste — nommés en dur */
const SOUS_PENTE: Forme[] = [
  { id: 'OS_SHAPE_HEX', titre: 'Placard sous pente', sousTitre: 'rampant à gauche, à droite ou des deux côtés', silhouette: 'HEX', origine: 'nommée en dur' },
  { id: 'OS_SHAPE_HEX2', titre: 'Placard sous pente arrière', sousTitre: 'le rampant descend vers le mur du fond', silhouette: 'HEX2', origine: 'nommée en dur' }
]

/** une silhouette de face (HEX 2 : de côté), tracée par nous — 96 × 64, trait de la charte */
function SilhouetteForme ({ forme }: { forme: Silhouette }) {
  const trait = { fill: 'var(--beige, #eeede7)', stroke: 'var(--noir, #000)', strokeWidth: 2, strokeLinejoin: 'round' as const }
  const contenu = (() => {
    switch (forme) {
      case 'F':
        return <rect x='12' y='10' width='72' height='46' {...trait} />
      case 'L':
        return <path d='M12 10 H84 V56 H60 V30 H12 Z' {...trait} />
      case 'U':
        return <path d='M12 10 H84 V56 H64 V30 H32 V56 H12 Z' {...trait} />
      case 'CMB':
        return (
          <g {...trait}>
            <rect x='10' y='12' width='34' height='18' />
            <rect x='52' y='12' width='34' height='18' />
            <rect x='10' y='38' width='34' height='18' />
            <rect x='52' y='38' width='34' height='18' />
          </g>
        )
      case 'CMB_S':
        return (
          <g {...trait}>
            <rect x='10' y='12' width='22' height='44' />
            <rect x='38' y='12' width='44' height='12' />
            <rect x='38' y='44' width='44' height='12' />
            <rect x='38' y='28' width='44' height='12' fill='none' strokeDasharray='3 3' />
          </g>
        )
      case 'HEX':
        // de face : le dessus en pente à gauche, comme le rampant
        return <path d='M12 30 L40 10 H84 V56 H12 Z' {...trait} />
      case 'HEX2':
        // de côté : haut à la façade (à droite), bas au mur du fond (à gauche)
        return <path d='M14 24 L56 10 H82 V56 H14 Z' {...trait} />
    }
  })()
  return (
    <svg viewBox='0 0 96 64' width='96' height='64' aria-hidden className='shrink-0'>
      {contenu}
    </svg>
  )
}

export default function Accueil () {
  const { data: produits, isLoading, error } = useGetProductsQuery()

  const production: Forme[] = (produits ?? []).map(p => {
    const c = CONNUES[p.id]
    return c
      ? { id: p.id, titre: c.titre, sousTitre: c.sousTitre, silhouette: c.silhouette, origine: 'pile' as const }
      : { id: p.id, titre: p.id, sousTitre: p.articleId, silhouette: 'F' as const, origine: 'pile' as const }
  })
  // l'ordre de lecture : le droit, le L, le U, les ensembles muraux, puis les sous-pente ; une forme de la pile qui n'est pas dans la table passe après
  const ordre = ['OS_SHAPE_F', 'OS_SHAPE_L', 'OS_SHAPE_U', 'OS_SHAPE_CMB_1111', 'OS_SHAPE_CMB_11S1']
  production.sort((a, b) => (ordre.indexOf(a.id) === -1 ? 99 : ordre.indexOf(a.id)) - (ordre.indexOf(b.id) === -1 ? 99 : ordre.indexOf(b.id)))
  const formes: Forme[] = [...production, ...SOUS_PENTE.filter(s => !production.some(p => p.id === s.id))]

  return (
    <main
      className='flex-1 px-6 py-12 sm:px-10'
      style={{ background: 'var(--fond, #f6f5f0)', color: 'var(--noir, #000)', fontFamily: 'var(--font-titre, "Yet Grotesk", "Helvetica Neue", Arial, sans-serif)' }}
    >
      <div className='mx-auto w-full max-w-5xl'>
        <header className='mb-8'>
          <p className='text-xs uppercase tracking-[0.18em]' style={{ color: 'var(--beige-fonce, #696761)', fontFamily: 'var(--font-mono, "PP Air Mono", monospace)' }}>
            Oaksome · configurateur
          </p>
          <h1 className='mt-2 text-3xl font-bold tracking-tight'>Choisissez votre forme</h1>
          <p className='mt-2 text-sm' style={{ color: 'var(--beige-fonce, #696761)' }}>
            Chaque forme s&apos;ouvre dans son configurateur : dimensions, colonnes, finitions, prix. Les placards sous pente suivent le rampant de votre pièce.
          </p>
        </header>

        {isLoading && <p className='text-sm' style={{ color: 'var(--beige-fonce, #696761)' }}>Chargement des formes…</p>}
        {error && (
          <p className='text-sm text-red-700' data-formes-erreur>
            La liste des formes de production ne répond pas ({'status' in (error as object) ? String((error as { status?: unknown }).status) : 'erreur'}) — seuls les placards sous pente sont proposés.
          </p>
        )}

        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3' data-formes={formes.length}>
          {formes.map(f => (
            <li key={f.id}>
              <Link
                href={`/shape/${f.id}`}
                className='group flex h-full items-center gap-4 rounded-lg border bg-white px-5 py-4 transition-colors hover:border-black'
                style={{ borderColor: 'var(--noir-15, rgba(0,0,0,0.15))' }}
                data-forme={f.id}
                data-origine={f.origine}
              >
                <SilhouetteForme forme={f.silhouette} />
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='text-base font-bold'>{f.titre}</span>
                  <span className='text-sm' style={{ color: 'var(--beige-fonce, #696761)' }}>{f.sousTitre}</span>
                  <span className='mt-1 truncate text-[11px]' style={{ color: 'var(--beige-fonce, #696761)', fontFamily: 'var(--font-mono, "PP Air Mono", monospace)' }}>
                    {f.id}
                  </span>
                </span>
                <span
                  aria-hidden
                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors group-hover:bg-black group-hover:text-white'
                  style={{ background: 'var(--vert-flash, #c1fd48)' }}
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
