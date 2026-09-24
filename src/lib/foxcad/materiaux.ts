/**
 * LE MATÉRIAU D'UNE PIÈCE DE FOX-CAD, PAR LA CHAÎNE D'OTMAN : la pièce porte sa définition (`Piece.definition` = le `KMS` d'imos, `PD_1_BS_1000`) ;
 * la table `kms` de l'article que le rp-engine sert déjà à ce front (`article-data/<article>`, celle que le designer d'Otman lit) donne pour
 * ce KMS le matériau (`MATERIAL: "$MAT_BS_1"`) et les surfaces (`SURF1` dessus, `SURF0` dessous) ; la variable se résout dans les portées du
 * Set — son `PVarString`, les variables de l'article (`variables[].WERT`), celles du squelette, la portée globale du formulaire — et le nom
 * obtenu (`EG_ED_W980_ST2_18mm`) est celui que `material-data` / `surface-data` du rp-engine traduisent en rendu (`RENDER: "EG_W980"`),
 * puis en texture sur le CDN de Tecnibo — exactement `resolveCp`. Ce fichier ne choisit rien : quand la chaîne casse (KMS inconnu, variable
 * non résolue, `NO_MAT`), la pièce prend la teinte neutre des panneaux sans texture d'Otman, et l'écran peut le dire (`raison`).
 */
import { useGetMaterialQuery, useGetSurfaceQuery } from '@/lib/store/api/tecniboApi'
import { skipToken } from '@reduxjs/toolkit/query/react'
import type { DescripteurArticle, ElementArticle } from './pose-poignee'
import type { Piece } from './types'

const TEXTURE_BASE = 'https://media.tecnibo.com/aYYmWUcv7lRhpLdU4ojPsA/IVIS%2F'

/** une ligne de la table `kms` du rp-engine ; tout est optionnel, le rp-engine ne promet rien */
export interface LigneKms {
  NAME?: string | null
  MATERIAL?: string | null
  SURF0?: string | null
  SURF1?: string | null
  THK?: string | number | null
}

/** une ligne de la table `variables` du rp-engine (`NAME`, `WERT` = la valeur ou la formule) */
export interface LigneVariable {
  NAME?: string | null
  WERT?: string | number | null
}

/** ce que `article-data` porte et qui sert ici — le reste du document n'est pas lu */
export interface TablesArticle {
  kms?: LigneKms[]
  variables?: LigneVariable[]
  /** les éléments d'article (`MANINFO` de la porte : la hauteur de la poignée, 23/09) et les descripteurs qu'ils citent */
  anglelem?: ElementArticle[]
  descriptors?: DescripteurArticle[]
}

export type Portee = Record<string, unknown>

export const porteeDesVariables = (lignes: LigneVariable[] | undefined): Portee => {
  const out: Portee = {}
  for (const l of lignes ?? []) if (typeof l.NAME === 'string' && l.NAME !== '' && l.WERT !== undefined && l.WERT !== null) out[l.NAME] = l.WERT
  return out
}

const vide = (v: unknown): boolean => v === undefined || v === null || String(v).trim() === ''

/**
 * une référence `$NOM` suivie de portée en portée (la première qui la définit non vide gagne), huit sauts au plus ; un littéral est rendu tel
 * quel ; `null` quand la chaîne ne mène à rien
 */
export function resoudreReference(ref: string | null | undefined, portees: Portee[]): string | null {
  let v: string | null = ref === undefined || ref === null ? null : String(ref).trim()
  for (let i = 0; i < 8 && v !== null && v.startsWith('$'); i++) {
    const nom = v.slice(1)
    let trouve: unknown = undefined
    for (const p of portees) {
      if (!vide(p[nom])) {
        trouve = p[nom]
        break
      }
    }
    v = trouve === undefined ? null : String(trouve).trim()
  }
  return v === null || v === '' || v.startsWith('$') ? null : v
}

export interface ClesMateriau {
  matKey: string | null
  surfKey: string | null
  /** le KMS a été trouvé dans une table `kms` */
  kmsTrouve: boolean
  /** pourquoi il n'y a pas de matériau, quand il n'y en a pas — pour l'écran */
  raison: string | null
}

/**
 * les clés de matériau et de surface d'une pièce : son KMS dans les tables (celle de son article d'abord, puis celle du squelette), la variable
 * résolue dans les portées ; `NO_MAT` / `NO_SURF` valent « aucun »
 */
export function clesMateriau(definition: string | undefined, tables: LigneKms[][], portees: Portee[]): ClesMateriau {
  if (!definition) return { matKey: null, surfKey: null, kmsTrouve: false, raison: 'pièce sans définition (KMS)' }
  let ligne: LigneKms | undefined
  for (const t of tables) {
    ligne = t.find((k) => k.NAME === definition)
    if (ligne) break
  }
  if (!ligne) return { matKey: null, surfKey: null, kmsTrouve: false, raison: `KMS ${definition} absent des tables kms du rp-engine` }
  const mat = resoudreReference(ligne.MATERIAL, portees)
  const surf = resoudreReference(ligne.SURF1, portees) ?? resoudreReference(ligne.SURF0, portees)
  const matKey = mat && mat !== 'NO_MAT' ? mat : null
  const surfKey = surf && surf !== 'NO_SURF' ? surf : null
  const raison = matKey === null && surfKey === null ? (vide(ligne.MATERIAL) ? `KMS ${definition} sans matériau` : `${ligne.MATERIAL} non résolu dans les portées du Set`) : null
  return { matKey, surfKey, kmsTrouve: true, raison }
}

/** un nom de matière / surface servi : ni vide, ni `NO_MAT` / `NO_SURF` */
const servi = (v: string | undefined | null): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return s !== '' && !/^NO_(SURF|MAT)$/i.test(s) ? s : null
}

/**
 * les clés de matériau d'une PIÈCE : sa matière servie par le moteur d'abord (`Piece.matiere`, contrat v0.2.42 — le noyau et ses surfaces
 * résolus par fox-cad, la même chaîne `material-data` / `surface-data` ensuite), sinon la chaîne d'Otman par la définition (`clesMateriau`) —
 * une API d'avant v0.2.42, ou une pièce sans matière servie (`{}` : le parent d'une pièce multiple)
 */
export function clesMateriauPiece(p: Pick<Piece, 'definition' | 'matiere'>, tables: LigneKms[][], portees: Portee[]): ClesMateriau {
  const m = p.matiere
  const matKey = servi(m?.noyau)
  const surfKey = servi(m?.dessus) ?? servi(m?.dessous)
  if (matKey !== null || surfKey !== null) return { matKey, surfKey, kmsTrouve: true, raison: null }
  return clesMateriau(p.definition, tables, portees)
}

export interface TextureMateriau {
  matName: string | null
  surfName: string | null
  textureUrl: string | null
  /** le RENDER du NOYAU seul et sa texture (le bord nu d'une pièce de façade, sans chant collé : le MDF brut) — `null` sans noyau servi */
  renderNoyau: string | null
  textureNoyauUrl: string | null
  /** le nom de la texture (`RENDER` du rp-engine = `RENDER_MAT` d'imos), la surface d'abord — la clé de l'échelle (`lib/textures/echelle.ts`) */
  render: string | null
  /** l'échelle vivante du rp-engine (mm par répétition), `null` tant qu'il ne l'expose pas */
  scalefakt: number | null
}

/** la texture d'Otman pour des clés de matériau / surface : `material-data` puis `surface-data` du rp-engine, la surface d'abord — comme `resolveCp` */
export function useTextureMateriau(cles: ClesMateriau): TextureMateriau {
  const { data: matData, originalArgs: matArgs } = useGetMaterialQuery(cles.matKey ?? skipToken)
  const { data: surfData, originalArgs: surfArgs } = useGetSurfaceQuery(cles.surfKey ?? skipToken)
  const mat = cles.matKey && matArgs === cles.matKey ? matData : undefined
  const surf = cles.surfKey && surfArgs === cles.surfKey ? surfData : undefined
  const textureName = surf?.render ?? mat?.render ?? null
  const scalefakt = (surf?.render ? surf.scalefakt : mat?.scalefakt) ?? null
  const renderNoyau = mat?.render ?? null
  return {
    matName: mat?.name ?? null,
    surfName: surf?.name ?? null,
    textureUrl: textureName ? `${TEXTURE_BASE}${textureName}.jpg/public` : null,
    renderNoyau,
    textureNoyauUrl: renderNoyau ? `${TEXTURE_BASE}${renderNoyau}.jpg/public` : null,
    render: textureName,
    scalefakt,
  }
}
