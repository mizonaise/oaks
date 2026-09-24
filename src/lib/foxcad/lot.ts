/**
 * LA COUTURE entre le configurateur d'Otman et le moteur de fox-cad, côté front (B3 du plan du 22/09, décision de Dorian : « les pièces des
 * panneaux HEX / HEX 2 viennent de fox-cad ») — la partie pure.
 *
 * Le principe : la commande que ce front émet déjà pour imos (le ListBuilder de `xmlExport.ts` — un Set par article, `SIZEX/Y/Z`,
 * `PInsertion`, `POrntation`, le `PVarString`) est EXACTEMENT ce que `POST /calcul/lot` de fox-cad prend : une position par Set, son
 * `lot` = les variables du `PVarString` (le XML de l'article dit ce qui entre, comme chez imos). Chaque position rend ses pièces dans le
 * repère de SON Set (x à droite, y vers l'arrière, z en haut, origine au coin avant-gauche-bas) ; la scène les pose dans la boîte de la zone
 * que `walkZone` a calculée — la même boîte qui fait le Set du XML. Rien n'est deviné : ce qui manque au moteur est dans `manques`, dit.
 *
 * Seuls les panneaux nommés dans `NEXT_PUBLIC_FOXCAD_SHAPES` (défaut : HEX et HEX 2, par leur nom de route ET par leur nom d'article) passent
 * par ici ; les cinq formes de production gardent le designer d'Otman.
 */
import type { FlatVars } from '@/lib/form/expr'
import type { ShapeData } from '@/lib/shape/schema'
import { collectSets } from '@/lib/shape/xmlExport'
import { estErreur, type DemandeCalculLot, type Piece, type ReponseCalculLot } from './types'
import { multipartDePosition } from './multipart.ts'

export const PANNEAUX_FOX_CAD_DEFAUT = 'OS_SHAPE_HEX,OS_SHAPE_HEX2,OAKSOME_SHAPE_HEX,OAKSOME_SHAPE_HEX2'

/** les panneaux dont les pièces viennent de fox-cad : la liste de l'environnement (`,` ou `;`), sinon HEX et HEX 2 ; la casse compte */
export function panneauxFoxCad(liste: string | undefined = process.env.NEXT_PUBLIC_FOXCAD_SHAPES): Set<string> {
  const brut = liste === undefined || liste.trim() === '' ? PANNEAUX_FOX_CAD_DEFAUT : liste
  return new Set(
    brut
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s !== ''),
  )
}

/** vrai quand l'un des noms donnés (la route `OS_SHAPE_HEX`, le nom déclaré `OAKSOME_SHAPE_HEX`) est un panneau à pièces fox-cad */
export function piecesParFoxCad(noms: (string | undefined | null)[], liste?: string): boolean {
  const p = panneauxFoxCad(liste)
  return noms.some((n) => typeof n === 'string' && p.has(n))
}

export interface BoiteOtman {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
}

/** une position du lot : un Set du ListBuilder avec la boîte de sa zone dans la scène d'Otman, pour y poser les pièces */
export interface PositionFoxCad {
  /** `LineNo` du Set (1 = le squelette) */
  ligne: number
  article: string
  /** le `PVarString` du Set, nom → valeur en texte (`SIZEX/Y/Z`, les variables, `___MODEL_NAME`, `___REFID`) */
  lot: Record<string, string>
  /** la boîte de la zone (mm, repère d'Otman : x à droite, y en haut, z vers le spectateur — la façade à z + d) */
  box: BoiteOtman
  /** la face avant héritée du nœud `clickable` (FRONT par défaut) ; LEFT / RIGHT échangent largeur et profondeur */
  facing?: string
  /** l'index de la boîte dans l'arbre des zones (le `key` de `BoxItem`) : ce que la caméra cache et ce que la sélection ouvre */
  index: string
  /** la zone du formulaire (`ART_ZONE_FR_01`) ; absente pour le squelette */
  zone?: string
}

/** les positions du lot depuis l'état vivant du configurateur — les mêmes Sets, dans le même ordre, que le XML téléchargeable */
export function positionsFoxCad(nested: Record<string, unknown>, modelName: string, shape: ShapeData, scopes: { globalVars: FlatVars; namespaces: Record<string, FlatVars> }): PositionFoxCad[] {
  return collectSets(nested, modelName, shape, scopes).map((s, i) => {
    const lot: Record<string, string> = {}
    for (const [k, v] of Object.entries(s.vars)) {
      if (v === undefined || v === null) continue
      lot[k] = String(v)
    }
    lot['___REFID'] = String(i + 1)
    return { ligne: i + 1, article: s.pname, lot, box: s.box, facing: s.facing, index: s.index, zone: s.zone }
  })
}

/** la demande : une position par Set, `tolererManques` (un manque se voit, il n'arrête pas le calcul), `pieces` (une commande se redessine) */
export const demandeLot = (positions: PositionFoxCad[]): DemandeCalculLot => ({
  positions: positions.map((p) => ({ article: p.article, lot: p.lot, options: { tolererManques: true } })),
  detail: 'pieces',
})

/** une pièce à plat, pour la liste et le TSV de preuve : les nombres sont ceux de l'API */
export interface LignePiece {
  set: number
  article: string
  index: number
  nom: string
  hierarchie: string
  definition: string
  achat: '' | 'oui' | 'non'
  largeur: number
  profondeur: number
  hauteur: number
  x: number
  y: number
  z: number
  orx: number
  ory: number
  orz: number
  sousArticle: string
  contour: number
  charnieres: string
}

export function lignePiece(set: number, article: string, index: number, p: Piece): LignePiece {
  return {
    set,
    article,
    index,
    nom: p.nom,
    hierarchie: p.hierarchie ?? '',
    definition: p.definition ?? '',
    achat: p.achat === undefined ? '' : p.achat ? 'oui' : 'non',
    largeur: p.cotes.largeur,
    profondeur: p.cotes.profondeur,
    hauteur: p.cotes.hauteur,
    x: p.position.x,
    y: p.position.y,
    z: p.position.z,
    orx: p.orientation.x,
    ory: p.orientation.y,
    orz: p.orientation.z,
    sousArticle: p.sousArticle?.nom ?? '',
    contour: p.contour?.length ?? 0,
    charnieres: p.charnieres ?? '',
  }
}

/** toutes les pièces d'une réponse de lot, position par position (les positions en erreur n'ont pas de ligne : elles sont dites à part) */
export function lignesPieces(positions: PositionFoxCad[], reponse: ReponseCalculLot | null): LignePiece[] {
  if (!reponse) return []
  const out: LignePiece[] = []
  reponse.positions.forEach((r, i) => {
    if (estErreur(r)) return
    const set = positions[i]?.ligne ?? i + 1
    r.pieces.forEach((p, j) => out.push(lignePiece(set, r.article, j + 1, p)))
  })
  return out
}

/** le TSV des lignes : un onglet entre les colonnes, une pièce par ligne, les nombres tels quels (point décimal) */
export function tsvPieces(lignes: LignePiece[]): string {
  const colonnes: (keyof LignePiece)[] = ['set', 'article', 'index', 'nom', 'hierarchie', 'definition', 'achat', 'largeur', 'profondeur', 'hauteur', 'x', 'y', 'z', 'orx', 'ory', 'orz', 'sousArticle', 'contour', 'charnieres']
  return [colonnes.join('\t'), ...lignes.map((l) => colonnes.map((c) => String(l[c])).join('\t'))].join('\n') + '\n'
}

export interface ResumeLot {
  positions: number
  pieces: number
  manques: number
  erreurs: number
  portesHorsXml: number
  /** 23/09 : les façades multipart de fox-cad (une par porte) et leurs pièces — comptées ici ; dessinées par fox-cad (b) quand chaque sous-pièce a un décor, par Otman sinon (a) */
  facadesMultipart: number
  piecesMultipart: number
  facadesMultipartFoxCad: number
  /** parmi celles que fox-cad dessine, les façades COUPÉES servies par le moteur (parent à contour, cadre complet — après MD2) */
  facadesMultipartCoupees: number
}

/**
 * le résumé d'une réponse : combien de positions, de pièces, de manques, d'erreurs, de façades multipart (et combien fox-cad en dessine) —
 * ce que le badge de la scène dit ; `lots` = le lot de chaque position, dans l'ordre (la toile de la façade s'y lit)
 */
export function resumeLot(reponse: ReponseCalculLot | null, lots?: ReadonlyArray<Record<string, string> | undefined>): ResumeLot {
  if (!reponse) return { positions: 0, pieces: 0, manques: 0, erreurs: 0, portesHorsXml: 0, facadesMultipart: 0, piecesMultipart: 0, facadesMultipartFoxCad: 0, facadesMultipartCoupees: 0 }
  let pieces = 0
  let manques = 0
  let erreurs = 0
  let portesHorsXml = 0
  let facadesMultipart = 0
  let piecesMultipart = 0
  let facadesMultipartFoxCad = 0
  let facadesMultipartCoupees = 0
  reponse.positions.forEach((p, i) => {
    if (estErreur(p)) {
      erreurs++
      return
    }
    pieces += p.pieces.length
    manques += p.manques.length
    if (p.lot && p.lot.porte !== 'xml') portesHorsXml++
    const m = multipartDePosition(p, lots?.[i])
    if (m) {
      facadesMultipart += m.facades
      piecesMultipart += m.pieces
      facadesMultipartFoxCad += m.parFoxCad
      facadesMultipartCoupees += m.coupees ?? 0
    }
  })
  return { positions: reponse.positions.length, pieces, manques, erreurs, portesHorsXml, facadesMultipart, piecesMultipart, facadesMultipartFoxCad, facadesMultipartCoupees }
}
