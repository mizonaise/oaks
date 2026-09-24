/**
 * Ce que le front lit de l'API fox-cad (`POST /calcul/lot`, contrat `@fox-cad/contract` v0.2.29 et suivants) — la PART du contrat que
 * la scène consomme, recopiée ici parce que ce dépôt n'installe pas le paquet vendoré du viewer (ses `node_modules` sont ceux du clone
 * d'Hamza, paquets privés `@oak-some/*`). Les noms et les formes sont ceux du contrat (`Piece`, `Vecteur3`, `Cotes`, `ReponseCalcul`,
 * `ErreurCalcul`, `ReponseCalculLot`) ; rien n'y est ajouté. Repère du moteur : x à droite, y vers l'arrière depuis la façade, z en haut,
 * millimètres et degrés. Une réponse qui ne suit pas cette forme est une erreur nommée (`lireReponseLot`), jamais une valeur lue de travers.
 */

export interface Vecteur3 {
  x: number
  y: number
  z: number
}

/** les trois cotes d'une pièce, telles que le `pxm` d'imos les écrit (w / d / h) */
export interface Cotes {
  largeur: number
  profondeur: number
  hauteur: number
}

export interface Piece {
  nom: string
  hierarchie?: string
  /** la définition de pièce (`KMS`) qui l'a produite — c'est par elle qu'Otman connaît le matériau (`kms.MATERIAL`) */
  definition?: string
  /** pièce achetée (quincaillerie), pas fabriquée */
  achat?: boolean
  cotes: Cotes
  /** le point d'insertion, dans le repère de l'article — ou du sous-article quand `sousArticle` est là */
  position: Vecteur3
  /** orx, ory, orz en degrés : Rx puis Ry puis Rz (axes fixes), puis la translation */
  orientation: Vecteur3
  sousArticle?: { nom: string; origine: Vecteur3 }
  /** le côté des charnières d'une porte, résolu par le moteur (v0.2.18) ; absent pour ce qui n'est pas une porte à charnières */
  charnieres?: 'gauche' | 'droite' | 'haut' | 'bas'
  /** les sommets du contour dans le plan local x-y si la pièce n'est pas rectangulaire (pente, hexagone) ; l'épaisseur = `cotes.hauteur` */
  contour?: Vecteur3[]
  contourBrut?: string
  /** la matière, le fil et les chants (contrat v0.2.42, servis par l'API depuis fox-cad `da2a28e` ; absents sur une API d'avant) */
  matiere?: Matiere
  fil?: Fil
  chants?: Chant[]
}

/**
 * LA MATIÈRE d'une pièce (contrat v0.2.42) : le noyau (`KMS.MATERIAL` résolu → `MAT.NAME`) et ses surfaces dessus (`SURF1`) / dessous
 * (`SURF0`) ; `NO_SURF` = absente ; `{}` = pièce sans noyau (`PD_EMPTY`, le parent d'une pièce multiple, une surface sans matière servie)
 */
export interface Matiere {
  noyau?: string
  dessus?: string
  dessous?: string
}

/**
 * LE FIL d'une pièce (contrat v0.2.42) : `present` = la matière du NOYAU a un fil (`MAT.GRAIN`) ; `angle` = 0 ou 90 dans le plan de la pièce
 * depuis son axe local x (`cotes.largeur`) ; imos ne porte aucun sens ; absent = pièce sans noyau
 */
export interface Fil {
  present: boolean
  angle: number
}

/**
 * UN CHANT d'une pièce (contrat v0.2.42), un par côté `cote` 1 à 4 : le côté 1 est le bord y = 0 de la face locale de la pièce dans la pose
 * appliquée, puis 2, 3, 4 dans le sens direct ; `pose` = un chant est collé ; `profil` = le nom du chant (`UN_ABS_0H251_W06_1`), absent pour
 * `PRF_00` ; `epaisseur` / `hauteur` de la bande ; `debut` / `fin` = la coupe aux bouts
 */
export interface Chant {
  cote: 1 | 2 | 3 | 4
  pose: boolean
  profil?: string
  epaisseur?: number
  hauteur?: number
  debut?: 'long' | 'short' | 'none' | 'mitre'
  fin?: 'long' | 'short' | 'none' | 'mitre'
}

export interface SourceAxe {
  valeur: number
  origine: 'calculateur' | 'lot' | 'bibliotheque' | string
  formule?: string
  variable?: string
}

/** ce que `POST /calcul` dit du `lot` reçu : par où le `PVarString` est entré (v0.2.25) */
export interface LotCalcul {
  porte: 'xml' | 'taille-seule' | 'entiere'
  parametresIgnores: string[]
  raison?: string
  dossierXml?: string
}

/** la réponse d'une position, en `detail: 'pieces'` : pièces, taille, manques, lot — sans les variables (rendues vides) */
export interface ReponseCalcul {
  article: string
  pieces: Piece[]
  manques: string[]
  sourcesTaille?: { x: SourceAxe; y: SourceAxe; z: SourceAxe }
  lot?: LotCalcul
  dureeMs?: number
  versionBibliotheque?: string | null
}

export interface ErreurCalcul {
  article: string
  erreur: 'PasEncoreCompris' | 'ArticleInconnu' | 'EntreeInvalide' | 'Interne' | string
  message: string
}

/** une position d'un lot : SA réponse ou SON erreur — une cellule que le moteur ne sait pas poser ne fait pas tomber les autres */
export type PositionCalculee = ReponseCalcul | ErreurCalcul

export interface ReponseCalculLot {
  positions: PositionCalculee[]
  calculees: number
  reprises: number
  dureeMs: number
}

export interface DemandeCalcul {
  article: string
  /** le `PVarString` d'un Set du ListBuilder, nom → valeur en texte, passé par la porte du XML de l'article */
  lot?: Record<string, string>
  variables?: Record<string, string>
  options?: Record<string, unknown>
  detail?: 'complet' | 'pieces'
}

export interface DemandeCalculLot {
  positions: DemandeCalcul[]
  detail?: 'complet' | 'pieces'
}

export const estErreur = (p: PositionCalculee): p is ErreurCalcul => typeof (p as ErreurCalcul).erreur === 'string'

const estNombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const estVecteur = (v: unknown): v is Vecteur3 => typeof v === 'object' && v !== null && estNombre((v as Vecteur3).x) && estNombre((v as Vecteur3).y) && estNombre((v as Vecteur3).z)

function lirePiece(p: unknown, ou: string): string | null {
  if (typeof p !== 'object' || p === null) return `${ou} : une pièce doit être un objet`
  const x = p as Partial<Piece>
  if (typeof x.nom !== 'string') return `${ou} : nom manquant`
  const c = x.cotes as Partial<Cotes> | undefined
  if (!c || !estNombre(c.largeur) || !estNombre(c.profondeur) || !estNombre(c.hauteur)) return `${ou} (${x.nom}) : cotes illisibles`
  if (!estVecteur(x.position)) return `${ou} (${x.nom}) : position illisible`
  if (!estVecteur(x.orientation)) return `${ou} (${x.nom}) : orientation illisible`
  if (x.sousArticle !== undefined && (typeof x.sousArticle !== 'object' || x.sousArticle === null || typeof x.sousArticle.nom !== 'string' || !estVecteur(x.sousArticle.origine))) return `${ou} (${x.nom}) : sous-article illisible`
  if (x.contour !== undefined && (!Array.isArray(x.contour) || !x.contour.every(estVecteur))) return `${ou} (${x.nom}) : contour illisible`
  return null
}

/**
 * La réponse de `POST /calcul/lot` vérifiée champ à champ (pas de zod ici : le contrat n'est pas installé dans ce dépôt) — rend la réponse
 * typée, ou le texte de ce qui ne suit pas le contrat. Une position en erreur (`erreur`, `message`) est admise : c'est le moteur qui parle.
 */
export function lireReponseLot(corps: unknown): { ok: true; valeur: ReponseCalculLot } | { ok: false; raison: string } {
  if (typeof corps !== 'object' || corps === null) return { ok: false, raison: 'la réponse n’est pas un objet' }
  const r = corps as Partial<ReponseCalculLot>
  if (!Array.isArray(r.positions)) return { ok: false, raison: '« positions » manque ou n’est pas une liste' }
  for (let i = 0; i < r.positions.length; i++) {
    const p = r.positions[i] as Partial<ReponseCalcul & ErreurCalcul> | null
    const ou = `position ${i + 1}`
    if (typeof p !== 'object' || p === null) return { ok: false, raison: `${ou} : pas un objet` }
    if (typeof p.erreur === 'string') {
      if (typeof p.message !== 'string') return { ok: false, raison: `${ou} : erreur sans message` }
      continue
    }
    if (typeof p.article !== 'string') return { ok: false, raison: `${ou} : article manquant` }
    if (!Array.isArray(p.pieces)) return { ok: false, raison: `${ou} (${p.article}) : « pieces » manque` }
    for (let j = 0; j < p.pieces.length; j++) {
      const d = lirePiece(p.pieces[j], `${ou} (${p.article}), pièce ${j + 1}`)
      if (d) return { ok: false, raison: d }
    }
    if (p.manques !== undefined && !Array.isArray(p.manques)) return { ok: false, raison: `${ou} (${p.article}) : « manques » n’est pas une liste` }
  }
  return {
    ok: true,
    valeur: {
      positions: r.positions.map((p) => (typeof (p as ErreurCalcul).erreur === 'string' ? (p as ErreurCalcul) : { ...(p as ReponseCalcul), manques: (p as ReponseCalcul).manques ?? [] })),
      calculees: estNombre(r.calculees) ? r.calculees : r.positions.length,
      reprises: estNombre(r.reprises) ? r.reprises : 0,
      dureeMs: estNombre(r.dureeMs) ? r.dureeMs : 0,
    },
  }
}
