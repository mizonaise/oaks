'use client'

import { Component, memo, useEffect, useMemo, type ReactNode } from 'react'
import type { FlatVars } from '@/lib/form/expr'
import type { Box as ShapeBox } from './shapeTree'
import { resolveArticleName } from './resolveArticle'
import { ArticleInBox } from './ArticleInBox'
import type { DecoupeDemandee } from './DecoupeOtman'
import type { PositionFoxCad } from '@/lib/foxcad/lot'
import { estErreur, type ReponseCalculLot } from '@/lib/foxcad/types'
import { articlePleinOtman, facadeSansPorte, plansPorte } from '@/lib/foxcad/decoupe'
import { facadeCoupeeNonDessinee, multipartDePosition, porteDessineeParFoxCad, type MultipartZone } from '@/lib/foxcad/multipart'
import type { Piece } from '@/lib/foxcad/types'
import type { PortesPleines } from '@/lib/foxcad/portes-pleines'
import { signalerErreurOtman, signalerMultipartOtman } from '@/lib/foxcad/chemin-otman'

const MM = 1

/**
 * LE CHEMIN D'OTMAN SUPERPOSÉ AUX PIÈCES DE FOX-CAD (d5, 23/09 — retours de Dorian 06:4x / 06:5x) : sur une forme fox-cad, le designer
 * d'Otman est monté dans chaque zone d'article exactement comme `BoxItem` le fait pour les cinq formes de production (le centre de la boîte,
 * la même pose que `FoxCadPieces`), avec `horsPanneaux` : ses panneaux sont masqués (ils viennent de fox-cad), ses rendus spéciaux restent —
 * la tringle de la penderie, la façade spéciale d'une zone dont fox-cad n'a PAS produit la porte (un manque, dit dans le badge), la poignée
 * GLB de cette façade. Une zone dont fox-cad a la porte garde SA porte (celle de fox-cad, avec la poignée de `PoigneeFoxCad`) : celles du
 * designer sont masquées, jamais deux portes. Les zones qu'une caméra de zone cache ne montent rien, comme `BoxItem`.
 *
 * LES PORTES EN PENTE AVEC LE SPÉCIAL KMS D'OTMAN (23/09, mot de Dorian 09:5x) : sur un module COUPÉ (`_Q4L`, `_H5L`, `_Q4R`, `_H5R`, `_SS`),
 * le designer est monté sur le module PLEIN (`articlePleinOtman` : le graphe rp-engine du module coupé ne porte qu'un front FR01 factice, et
 * celui de HEX 2 le fait planter — « HORDEFTYPE = A ») ; quand la façade spéciale est un manque chez fox-cad (le KMS multi-pièces), la
 * façade entière du designer est DÉCOUPÉE par le contour de la porte pleine que fox-cad rend pour la même position (`portesPleines`,
 * `plansPorte`, `DecoupeOtman`) — rendu, pas calculé, et dit. Un designer qui plante dans une zone est contenu (`GardeDesigner`) : la zone est
 * dite en erreur dans le badge, la page vit.
 *
 * LA RÈGLE D'ATTENTE DE LA FAÇADE MULTIPART (23/09, ligne du lead 13:5x — les portes blanches en public) : depuis fox-cad `bbfff6b`, la façade
 * à cadre d'un module PLEIN n'est plus un manque, elle est rendue en pièce multiple (le parent `MP_1_FR_SHELL_FR08_LAM` + six sous-pièces,
 * toutes « porte » au nom). Une zone dont la porte est une façade multipart n'est PAS « porte par fox-cad » (`porteDessineeParFoxCad`) : la
 * porte du designer d'Otman reste visible, fox-cad ne dessine pas ces pièces (`FoxCadPieces`), le badge dit « façade multipart : dessin
 * d'Otman, pièces fox-cad » (`signalerMultipartOtman`). Le compte et le prix restent ceux de fox-cad. (b) Dès que chaque sous-pièce a un
 * décor servi (`renduFacadeMultipart` : `Piece.matiere`, la toile par le lot), fox-cad dessine la façade lui-même et sa porte compte comme
 * « porte par fox-cad » : celle du designer est masquée, comme pour toute porte de fox-cad.
 */
export const SuperpositionOtman = memo(function SuperpositionOtman({
  boxes,
  positions,
  reponse,
  portesPleines = null,
  hiddenIndexes,
  doorOpenFor,
  doorsRemoved = false,
  contrasted = false,
}: {
  boxes: ShapeBox[]
  positions: PositionFoxCad[]
  reponse: ReponseCalculLot | null
  /** les portes pleines que fox-cad rend pour les positions dont la façade spéciale est un manque (le contour qui découpe) */
  portesPleines?: PortesPleines | null
  globalVars: FlatVars
  hiddenIndexes: ReadonlySet<string>
  doorOpenFor: (index: string) => boolean
  doorsRemoved?: boolean
  contrasted?: boolean
}) {
  // par zone (l'index de sa boîte) : fox-cad a-t-il produit la porte ET la dessine-t-il ? — la position répond, sans erreur, avec au moins une
  // pièce porte HORS façade multipart (23/09 : une façade multipart laisse la porte du designer d'Otman visible)
  const portesFoxCad = useMemo(() => {
    const m = new Map<string, boolean>()
    positions.forEach((pos, i) => {
      const r = reponse?.positions[i]
      m.set(pos.index, Boolean(r && !estErreur(r) && porteDessineeParFoxCad(r.pieces, pos.lot)))
    })
    return m
  }, [positions, reponse])

  // par zone : la façade multipart que fox-cad rend (le parent et ses sous-pièces, comptés, non dessinés) — dite au magasin pour le badge
  const multipartParZone = useMemo(() => {
    const m = new Map<string, MultipartZone>()
    positions.forEach((pos, i) => {
      const x = multipartDePosition(reponse?.positions[i], pos.lot)
      if (x) m.set(pos.index, x)
    })
    return m
  }, [positions, reponse])
  useEffect(() => {
    const dites = new Set<string>()
    positions.forEach((pos) => {
      const x = multipartParZone.get(pos.index)
      if (x) {
        dites.add(pos.index)
        signalerMultipartOtman(pos.index, x)
      } else signalerMultipartOtman(pos.index, null)
    })
    return () => {
      for (const i of dites) signalerMultipartOtman(i, null)
    }
  }, [positions, multipartParZone])

  // par zone : la façade spéciale refusée par le moteur (le KMS multi-pièces), quand il y en a une — le contour qui la découpe vient de la
  // porte pleine (second calcul) ; OU (24/09, la garde du pourtour) la façade à cadre COUPÉE que le moteur sert mais que l'écran ne dessine
  // pas (sous-pièces hors du pourtour) — la porte d'Otman reste, découpée par le contour du parent servi, sans second calcul
  const sansPorte = useMemo(() => {
    const m = new Map<string, { kms: string; porte?: Piece; raison?: string }>()
    positions.forEach((pos, i) => {
      const r = reponse?.positions[i]
      const s = facadeSansPorte(r)
      if (s) {
        m.set(pos.index, { kms: s.kms })
        return
      }
      const c = facadeCoupeeNonDessinee(r, pos.lot)
      if (c) m.set(pos.index, { kms: c.kms, porte: c.porte, raison: c.raisons[0] })
    })
    return m
  }, [positions, reponse])

  return (
    <>
      {boxes.map((b) => {
        if (!b.isArticle || !b.node || !b.vars) return null
        if (b.w <= 10 || b.h <= 10 || b.d <= 10) return null
        if (hiddenIndexes.has(b.index)) return null
        const articleName = resolveArticleName(b.node, b.vars)
        if (!articleName) return null
        // un module coupé : le designer dessine le module plein dans la même boîte (voir en tête)
        const plein = articlePleinOtman(articleName)
        const articleOtman = plein ?? articleName
        const sans = sansPorte.get(b.index)
        let decoupe: DecoupeDemandee | undefined
        if (sans) {
          const base = { module: articleName, plein: articleOtman, kms: sans.kms, source: sans.porte ? ('facade-servie' as const) : ('porte-pleine' as const), raison: sans.raison ?? null }
          const porte = sans.porte ?? portesPleines?.parIndex.get(b.index)?.porte
          if (porte) {
            const sideways = b.clickable === 'LEFT' || b.clickable === 'RIGHT'
            const plans = plansPorte(porte, { w: sideways ? b.d : b.w, h: b.h })
            decoupe = { ...base, etat: 'plans', plans, cle: JSON.stringify(plans.map((p) => [p.normal, p.constant])), sommets: porte.contour?.length ?? 4 }
          } else if (portesPleines?.sansContour.has(b.index) || portesPleines?.etat === 'erreur') {
            decoupe = { ...base, etat: 'indisponible', plans: [], cle: 'indisponible', sommets: 0 }
          } else {
            decoupe = { ...base, etat: 'attente', plans: [], cle: 'attente', sommets: 0 }
          }
        }
        return (
          <group key={b.index} position={[(b.x + b.w / 2) * MM, (b.y + b.h / 2) * MM, (b.z + b.d / 2) * MM]} name={`chemin d'Otman ${b.index} ${articleName}${plein ? ` (designer : ${plein})` : ''}`}>
            <GardeDesigner key={`${b.index}|${articleOtman}`} index={b.index} article={articleOtman}>
              <ArticleInBox
                box={b}
                articleName={articleOtman}
                doorOpen={doorOpenFor(b.index)}
                doorsRemoved={doorsRemoved}
                contrasted={contrasted}
                horsPanneaux={{ index: b.index, porteParFoxCad: portesFoxCad.get(b.index) ?? false, decoupe }}
              />
            </GardeDesigner>
          </group>
        )
      })}
    </>
  )
})

/**
 * le garde-fou d'une zone du designer d'Otman : une erreur de rendu (mesuré le 23/09 : « Unhandled case: HORDEFTYPE = A » sur `WACA_LY_D_SS`,
 * qui tuait la page HEX 2 entière, badge compris) ne sort pas de la zone — elle est dite au magasin (le badge la nomme) et la zone reste vide
 */
class GardeDesigner extends Component<{ index: string; article: string; children: ReactNode }, { echec: string | null }> {
  state: { echec: string | null } = { echec: null }
  static getDerivedStateFromError(e: unknown) {
    return { echec: e instanceof Error ? e.message : String(e) }
  }
  componentDidCatch(e: unknown) {
    signalerErreurOtman(this.props.index, `${this.props.article} : ${e instanceof Error ? e.message : String(e)}`)
  }
  componentWillUnmount() {
    if (this.state.echec !== null) signalerErreurOtman(this.props.index, null)
  }
  render() {
    return this.state.echec === null ? this.props.children : null
  }
}
