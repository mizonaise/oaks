/**
 * L'ÉCHELLE D'UNE TEXTURE, EN MILLIMÈTRES (d5, nuit du 22 au 23/09/2026 — mot de Dorian 22:1x : « il faut que tu gères le scaling factor
 * dans notre version du front d'Hamza » ; ligne du lead 22:2x ; puis 23/09 06:4x : « regarde le scaling de l'intérieur, il faut regarder les
 * références Unilin et Egger »).
 *
 * Chez imos, un principe de couleur (`RENDER`) porte `SCALEFAKT` — *Scale* de l'écran Color Principles : « Part dimensions : Scale = Number
 * of tiles » (doc imos, lue par d2 le 22/09 23:1x — une pièce de 1 500 × 1 000 à Scale 500 = 3 × 2 répétitions) : la taille réelle, en mm,
 * que couvre UNE répétition de l'image de sa texture (`RENDER_MAT` → `RENDERMATERIAL.TEXTURE`), la même valeur sur les deux axes. Et
 * **Scale 0, le défaut d'imos, = la texture ÉTIRÉE sur la pièce entière** (« automatically stretched to exactly match the dimensions of the
 * respective part ») — exactement ce que le front d'Otman fait, avec les UV [0, 1] de chaque face. Mesuré sur la photo `otman_imos` :
 * 300 mm sur tous les unis (RAL, W980…), 1 000 sur les bois (chêne, noyer), 1 500 (hêtre), 2 700 (décors Egger D0017 / D0018), 4 000
 * (briques) — et 0 sur 2 342 principes sur 3 837, dont **les 51 finitions intérieures d'Oaksome** (`OV_FINISH_INT`, sept nuanciers : Unilin
 * Evola `UN_0H…` bois, `UN_0U…` unis, Egger `EG_F416 / F417 / F422 / F433` textiles — toutes à 0 dans l'API publique du 23/09).
 *
 * Depuis le 23/09 06:10, le rp-engine public (`material-data` / `surface-data`, patch d'oaksome-stack) rend `SCALEFAKT` et `ROTATION` :
 * la table extraite de la photo imos le 22/09 (`src/data/echelle-textures.ts`, 931 textures) n'apportait plus rien — retirée (ligne du lead
 * 06:4x). En développement contre un rp-engine sans le patch (3018 local), la valeur vivante est absente : la famille, puis le défaut.
 *
 * La règle, dans l'ordre, et la source est DITE avec la valeur :
 *   1. `rp-engine` — le `SCALEFAKT` vivant du rp-engine (> 0) ;
 *   2. `famille`   — quand imos dit 0 (il étirerait) : la taille physique que couvre l'image IVIS (512 × 512), par famille de décor —
 *                    **mesurée** pour les textiles Egger F4xx (relevé `docs/releves/2026-09-23_echelle-interieur/`) : la période du tissage
 *                    de F416 est de 5 à 6 px dans l'image IVIS et de 11 px = 0,93 mm dans le scan Egger à 300 dpi → l'image couvre ≈ 80 à
 *                    95 mm, posé **90 mm** ; les unis : 300 mm comme les unis d'imos (rien à voir à l'œil) ; les bois : **1 000 mm,
 *                    [À CONFIRMER]** (quatre bandes de fil dans l'image de `UN_0H251_W06` → ≈ 250 mm par bande, cohérent avec un placage
 *                    noyer, mais aucune référence Unilin à taille connue n'a pu être lue le 23/09) ;
 *   3. `defaut`    — `ECHELLE_DEFAUT_MM` quand la texture n'est d'aucune famille connue. La décision de Dorian (22/09 22:1x) : le facteur
 *                    d'échelle se gère chez nous ; les valeurs sont celles de d5, une ligne suffit pour les changer, et l'écran dit la source.
 *
 * Hors de ce module, dit : `ROTATION` (0 sur les 3 837 principes) n'est pas appliquée — le fil du bois est la ligne suivante du lead (06:3x) ;
 * le bloc PBR d'imos (`iX NET Material Extension`, tailles X / Y en mètres) n'est pas notre chemin. Ce module ne dessine rien : il rend un nombre
 * et sa provenance. C'est `uv.ts` qui écrit les UV, et l'écran dit la source.
 */

// relatif, avec l'extension : node --test (sans outil) lit ce module comme geometrie.ts le lit
import { decorFabricant, type FabricantDecor } from '../../data/echelle-decors'

/** le défaut quand la texture n'est d'aucune famille : une répétition de l'image par mètre — un choix de d5, dit à l'écran */
export const ECHELLE_DEFAUT_MM = 1000

/**
 * la famille « bois » sans mesure propre : la MÉDIANE des décors bois Unilin mesurés le 23/09 (l'image IVIS = une découpe de l'image du
 * panneau entier publiée par Unilin ; `src/data/echelle-decors.ts`) — avant : 1 000 mm posé sans référence
 */
export const ECHELLE_BOIS_MM = 540

/**
 * la source d'une échelle, dans l'ordre d'essai : `rp-engine` (le `SCALEFAKT` vivant, > 0), `fabricant` (la taille réelle du décor lue chez
 * Unilin / Egger et MESURÉE contre l'image IVIS — `src/data/echelle-decors.ts`, mot de Dorian 23/09 08:1x), `famille` (imos étire : la
 * famille du décor), `defaut`
 */
export type SourceEchelle = 'rp-engine' | 'fabricant' | 'famille' | 'defaut'

export type FamilleTexture = 'textile' | 'uni' | 'bois'

export interface RegleFamille {
  famille: FamilleTexture
  /** les noms de texture (`RENDER`) de la famille */
  motif: RegExp
  /** mm réels couverts par l'image IVIS de 512 px */
  mm: number
  /** d'où vient la valeur — dite à l'écran */
  provenance: string
}

/**
 * Les familles, dans l'ordre d'essai. Les noms sont ceux de `RENDER` (l'image `IVIS/<nom>.jpg`) tels que les nuanciers d'Oaksome les
 * portent (`OV_FINISH_INT` / `OV_FINISH_EXT`, 23/09) : `EG_F416` (Egger textile / pierre), `UN_0U640_BST` (Unilin uni), `UN_00113_CST`,
 * `EG_W980` (Egger uni), `UN_0H251_W06` (Unilin bois), `EG_H…` (Egger bois).
 */
export const FAMILLES_TEXTURES: ReadonlyArray<RegleFamille> = [
  { famille: 'textile', motif: /^EG_F\d{3}/i, mm: 120, provenance: 'textile Egger ST10 : 120 mm — période du tissage mesurée sur F416 / F417 / F433 contre l’échantillon A3 d’Egger (12 px/mm), 23/09' },
  { famille: 'uni', motif: /^(UN_0U\w*|UN_0UD\w*|UN_0WE\w*|UN_00\d{3}\w*|EG_W\d{3}\w*|EG_U\d{3}\w*|RAL\w*|W_MDF\w*|SAC_\w*|NA_\w*)$/i, mm: 300, provenance: 'uni : 300 mm comme les unis d’imos, sans effet à l’œil' },
  { famille: 'bois', motif: /^(UN_0H\w*|EG_H\d{3}\w*|EG_D\d{4}\w*|DE_S4_\w*)$/i, mm: ECHELLE_BOIS_MM, provenance: 'bois sans mesure propre : la médiane des décors bois Unilin mesurés (découpe de l’image du panneau entier, 23/09) — à confirmer pour ce décor' },
]

export interface EchelleTexture {
  /** mm réels couverts par une répétition de l'image, sur les deux axes */
  mm: number
  source: SourceEchelle
  /** la famille quand la source est `famille` */
  famille?: FamilleTexture
  /** le fabricant quand la source est `fabricant` */
  fabricant?: FabricantDecor
  /** le nom de la texture (`RENDER_MAT` d'imos, `RENDER` du rp-engine), `null` quand il n'est pas connu */
  texture: string | null
}

const positif = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0

/** la famille d'une texture par son nom, ou `null` */
export function familleTexture(nom: string | null | undefined): RegleFamille | null {
  if (!nom) return null
  return FAMILLES_TEXTURES.find((r) => r.motif.test(nom)) ?? null
}

/**
 * l'échelle d'une texture : la valeur vivante du rp-engine d'abord, puis la famille de la texture (imos étire : 0), sinon le défaut — jamais
 * silencieuse (`source` le dit)
 */
export function echelleTexture(texture: string | null | undefined, scalefaktVivant?: number | null): EchelleTexture {
  const nom = texture === undefined || texture === null || texture.trim() === '' ? null : texture.trim()
  if (positif(scalefaktVivant)) return { mm: scalefaktVivant, source: 'rp-engine', texture: nom }
  // la taille réelle lue chez le fabricant et mesurée contre l'image IVIS (Unilin, Egger — 23/09) : seulement quand elle est MESURÉE ;
  // « à confirmer » = la famille, et l'écran le dit
  const d = decorFabricant(nom)
  if (d && d.statut === 'mesuré' && positif(d.mm)) return { mm: d.mm, source: 'fabricant', fabricant: d.fabricant, texture: nom }
  const f = familleTexture(nom)
  if (f) return { mm: f.mm, source: 'famille', famille: f.famille, texture: nom }
  return { mm: ECHELLE_DEFAUT_MM, source: 'defaut', texture: nom }
}

/**
 * le nom de la texture depuis l'adresse d'une image du CDN de Tecnibo (`…/IVIS%2F<nom>.jpg/public`, `…/IVIS/<nom>.jpg/public`) — le seul
 * indice que laissent les maillages du designer d'Otman (code fermé) ; `null` si l'adresse n'a pas cette forme
 */
export function nomTextureDepuisAdresse(adresse: string | null | undefined): string | null {
  if (!adresse) return null
  const m = String(adresse).match(/IVIS(?:%2F|\/)([^/?#]+?)\.(?:jpe?g|png|webp)(?:\/|$|\?)/i)
  return m ? decodeURIComponent(m[1]) : null
}

/**
 * « UN_0H251_W06 à 540 mm (fabricant Unilin, mesuré ; imos 0, étirée) », « EG_F422 à 120 mm (famille textile, à confirmer ; imos 0,
 * étirée) » — la phrase que l'écran et le relevé montrent
 */
export function direEchelle(e: { mm: number; source: SourceEchelle; famille?: FamilleTexture; fabricant?: FabricantDecor; texture: string | null }): string {
  const mm = e.mm.toLocaleString('fr-BE', { maximumFractionDigits: 0 })
  // le magasin de la scène groupe par (texture, mm, source) sans la famille ni le fabricant : on les retrouve par le nom
  const famille = e.famille ?? familleTexture(e.texture)?.famille
  const fabricant = e.fabricant ?? decorFabricant(e.texture)?.fabricant
  const source =
    e.source === 'rp-engine'
      ? 'rp-engine'
      : e.source === 'fabricant'
        ? `fabricant ${fabricant ?? '?'}, mesuré ; imos 0, étirée`
        : e.source === 'famille'
          ? `famille ${famille ?? '?'}${decorFabricant(e.texture)?.statut === 'à confirmer' || famille === 'bois' ? ', à confirmer' : famille === 'textile' ? ', mesuré' : ''} ; imos 0, étirée`
          : 'défaut d5 : imos 0 ou inconnue'
  return `${e.texture ?? 'sans texture'} à ${mm} mm (${source})`
}
