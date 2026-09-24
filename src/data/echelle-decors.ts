/**
 * LA TAILLE RÉELLE DES DÉCORS, LUE CHEZ LES FABRICANTS (d5, 23/09/2026 — mot de Dorian 08:1x « regarde sur internet chez Unilin, Egger et
 * Decospan », ligne du lead 08:1x). Par décor de nos nuanciers (`RENDER` = le nom de l'image IVIS 512 × 512 que le front pose) : les mm réels
 * que couvre l'image IVIS, la source chez le fabricant (URL), la méthode, le statut. Rien n'est deviné : une valeur `mesuré` vient d'une
 * comparaison de l'image IVIS avec une image du fabricant à taille connue ; `à confirmer` = le fabricant ne publie ni rapport ni image à
 * taille connue, la valeur reste celle de la famille (`echelle.ts`) et l'écran le dit. Relevé : `docs/releves/2026-09-23_decors-fabricants/`.
 *
 * Les deux méthodes :
 *   - **découpe** (Unilin) : la fiche décor d'Unilin (`unilinpanels.com/en-gb/unilin-evola-designs/<décor>`) publie l'image du panneau entier
 *     (`Web-layout_<décor>.jpg`, 7 087 × 7 087 px, marges blanches, le panneau de 2 070 mm de large sur 5 315 px) ; l'image IVIS en est une
 *     DÉCOUPE (corrélation croisée normalisée à plusieurs tailles et rotations, `_tmp/2026-09-23/decors/chercher-crop.mjs`) : la taille qui
 *     corrèle le mieux dit les mm couverts (0H251 W06 : r = 0,77 à 540 mm, contre 0,68 à 520 et 0,55 à 560 — un pic net).
 *   - **période** (Egger) : la fiche décor d'Egger (`egger.com/en/furniture-interior-design/decors/<décor>`) publie une image d'échantillon
 *     PNG à densité connue (pHYs 12 px/mm : 3 564 × 5 040 px = 297 × 420 mm, un A3) ; la période du tissage s'y mesure (autocorrélation,
 *     `periode-texture.mjs`) et dans l'image IVIS ; le rapport donne les mm couverts (± 15 % : la période IVIS est de 3,5 à 4,5 px sur 512).
 *     L'IVIS n'est PAS une découpe de l'image Egger (corrélation ≤ 0,11).
 *   - Decospan (placages Shinnoki, `DE_S4_*`) : ni rapport (un placage n'en a pas) ni image à taille connue sur le site → `à confirmer`.
 */

export type FabricantDecor = 'Unilin' | 'Egger' | 'Decospan'

export interface DecorFabricant {
  /** le nom `RENDER` (l'image `IVIS/<nom>.jpg`) */
  texture: string
  fabricant: FabricantDecor
  /** le décor tel que le fabricant le nomme */
  decor: string
  /** mm réels couverts par l'image IVIS (les deux axes) ; `null` = à confirmer (la famille s'applique) */
  mm: number | null
  statut: 'mesuré' | 'à confirmer'
  /** la page du fabricant qui a servi */
  source: string
  /** ce qui a été comparé et le résultat, en une ligne */
  mesure: string
}

export const DECORS_FABRICANTS: ReadonlyArray<DecorFabricant> = [
  // ── Egger, textiles ST10 (Interior) — période du tissage : IVIS 3,5 à 4,5 px contre 0,92 à 1,0 mm dans l'échantillon A3 à 12 px/mm ──
  {
    texture: 'EG_F416',
    fabricant: 'Egger',
    decor: 'F416 ST10 Beige Textile',
    mm: 120,
    statut: 'mesuré',
    source: 'https://www.egger.com/en/furniture-interior-design/decors/F416_10',
    mesure: 'échantillon PNG 3 564 × 5 040 px à 12 px/mm (297 × 420 mm) : période 0,92 mm (x) / 0,98 mm (y) ; IVIS : 4,2 px (x) / 3,6 px (y) → 112 à 139 mm, posé 120',
  },
  {
    texture: 'EG_F417',
    fabricant: 'Egger',
    decor: 'F417 ST10 Grey Textile',
    mm: 120,
    statut: 'mesuré',
    source: 'https://www.egger.com/en/furniture-interior-design/decors/F417_10',
    mesure: 'échantillon PNG 3 564 × 5 040 px à 12 px/mm : période 0,92 mm (x) / 1,00 mm (y) ; IVIS : 4,25 px (x) / 3,5 px (y) → 111 à 146 mm, posé 120',
  },
  {
    texture: 'EG_F422',
    fabricant: 'Egger',
    decor: 'F422 ST10 White Linen',
    mm: 120,
    statut: 'à confirmer',
    source: 'https://www.egger.com/en/furniture-interior-design/decors/F422_10',
    mesure: 'échantillon PNG à 12 px/mm : période 1,08 mm (x) / 0,92 mm (y) ; l’image IVIS est presque plate (écart-type 1,5 sur 255), sa période ne se lit pas → la valeur de la série ST10 (120), à confirmer',
  },
  {
    texture: 'EG_F433',
    fabricant: 'Egger',
    decor: 'F433 ST10 Anthracite Linen',
    mm: 120,
    statut: 'mesuré',
    source: 'https://www.egger.com/en/furniture-interior-design/decors/F433_10',
    mesure: 'échantillon PNG 3 507 × 4 991 px à 12 px/mm : période 0,97 mm (x) / 1,00 mm (y) ; IVIS : 4,5 px (x) / 3,8 px (y) → 110 à 135 mm, posé 120',
  },
  // ── Unilin Evola, bois (Finish ext et Interior) — l’IVIS est une découpe de l’image du panneau entier publiée par Unilin (2 070 mm de large) ──
  {
    texture: 'UN_0H251_W06',
    fabricant: 'Unilin',
    decor: '0H251 W06 Lorenzo walnut medium brown',
    mm: 540,
    statut: 'mesuré',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h251w06-lorenzo-walnut-medium-brown',
    mesure: 'découpe trouvée à 540 mm (r = 0,77 ; 520 : 0,68 ; 560 : 0,55), tournée de 270°, à 261 × 973 mm du coin du panneau',
  },
  {
    texture: 'UN_0H720_BST',
    fabricant: 'Unilin',
    decor: '0H720 BST White Birch',
    mm: 540,
    statut: 'mesuré',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h720bst-white-birch',
    mesure: 'découpe trouvée à 540 mm (r = 0,78 ; 520 : 0,65), tournée de 90°, à 598 × 2 119 mm du coin du panneau — la même taille que 0H251',
  },
  // les décors à grain fin : la corrélation n'a pas de pic net (r ≤ 0,6, ou plusieurs tailles à égalité) — la valeur indicative est notée,
  // la famille bois (la médiane des mesurés) s'applique, l'écran dit « à confirmer »
  {
    texture: 'UN_0H362_BST',
    fabricant: 'Unilin',
    decor: '0H362 BST Suomi Ash',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h362bst-suomi-ash',
    mesure: 'corrélation faible : 560 mm r = 0,40 (540 : 0,40), grossier 500 r = 0,54 — un frêne fin sans repère',
  },
  {
    texture: 'UN_0H591_W07',
    fabricant: 'Unilin',
    decor: '0H591 W07 Valley Ash sand',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h591w07-valley-ash-sand',
    mesure: 'plateau de 220 à 280 mm à r ≈ 0,57–0,59 (260 : 0,586), pas de pic',
  },
  {
    texture: 'UN_0H596_W07',
    fabricant: 'Unilin',
    decor: '0H596 W07 Oslo Oak soft beige',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h596w07-oslo-oak-soft-beige',
    mesure: 'plusieurs tailles à égalité : 160 mm r = 0,60, 180 : 0,58, 300 : 0,56, 200 : 0,56 — pas de pic',
  },
  {
    texture: 'UN_0H598_W07',
    fabricant: 'Unilin',
    decor: '0H598 W07 Oslo Oak tanned red',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h598w07-oslo-oak-tanned-red',
    mesure: 'plateau de 460 à 520 mm à r ≈ 0,50–0,52 (grossier 500 r = 0,65 à 512 px, 480 r = 0,52 à 1 024 px), pas de pic net',
  },
  {
    texture: 'UN_0H912_V2A',
    fabricant: 'Unilin',
    decor: '0H912 V2A Master Oak brown',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h912v2a-master-oak-brown',
    mesure: 'plateau : 340 mm r = 0,55, 460 : 0,53 (grossier 400 r = 0,66 à 512 px) — un chêne rift fin, presque uniforme, pas de pic net',
  },
  {
    texture: 'UN_0H915_V2A',
    fabricant: 'Unilin',
    decor: '0H915 V2A Master Oak light natural',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h915v2a-master-oak-light-natural',
    mesure: 'plateau : 340 mm r = 0,51, 280 : 0,51 (grossier 300 r = 0,59) — pas de pic net',
  },
  {
    texture: 'UN_0H922_V2A',
    fabricant: 'Unilin',
    decor: '0H922 V2A Master Oak soft white',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h922v2a-master-oak-soft-white',
    mesure: 'image IVIS presque plate (11 Ko) : la corrélation monte avec la taille du gabarit (1 400 mm r = 0,76, le plafond de la passe ; 1 460 : 0,69, pose au bord) — un artefact, pas une découpe',
  },
  {
    texture: 'UN_0H925_V2A',
    fabricant: 'Unilin',
    decor: '0H925 V2A Master Oak natural hay',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h925v2a-master-oak-natural-hay',
    mesure: 'corrélation très faible : 440 mm r = 0,24 (500 : 0,22), grossier 500 r = 0,32 — pas de repère',
  },
  {
    texture: 'UN_0H926_V2A',
    fabricant: 'Unilin',
    decor: '0H926 V2A Master Oak natural copper',
    mm: null,
    statut: 'à confirmer',
    source: 'https://www.unilinpanels.com/en-gb/unilin-evola-designs/0h926v2a-master-oak-natural-copper',
    mesure: 'corrélation faible : 320 mm r = 0,39 (300 : 0,36), grossier 300 r = 0,42 — un chêne rift fin, presque uniforme',
  },
  // ── Decospan Shinnoki 4.0, placages (Finish ext, Collection 3, `S4-LAM-nn`) — pas de rapport (placage naturel), pas d’image à taille connue
  //    sur le site ; l’API publique (rp-engine, `surface-data/DE_VNR_DLV_S4_nn_1_0`) rend un SCALEFAKT VIVANT de 300 (le principe de couleur
  //    d’imos chez Tecnibo, pas le fabricant) : c’est lui que la règle applique, dit « rp-engine » à l’écran ──
  ...(
    [
      ['02', 'Milk Oak'],
      ['05', 'Ivory Infinite Oak'],
      ['06', 'Natural Oak'],
      ['08', 'Manhattan Oak'],
      ['13', 'Smoked Walnut'],
      ['17', 'Stardust Walnut'],
    ] as const
  ).map(
    ([n, nom]): DecorFabricant => ({
      texture: `DE_S4_${n}`,
      fabricant: 'Decospan',
      decor: `Shinnoki ${nom} (S4-LAM-${n}, placage)`,
      mm: null,
      statut: 'à confirmer',
      source: 'https://www.decospan.com/en-us/shinnoki/collection',
      mesure: 'la collection Shinnoki (18 looks) ne publie ni rapport ni dimensions ni image à taille connue (pages lues le 23/09) ; le rp-engine public rend SCALEFAKT 300 (imos chez Tecnibo) — sinon la famille bois',
    }),
  ),
]

const parTexture = new Map(DECORS_FABRICANTS.map((d) => [d.texture.toUpperCase(), d]))

/** la fiche fabricant d'une texture (par son nom `RENDER`), ou `null` */
export function decorFabricant(texture: string | null | undefined): DecorFabricant | null {
  if (!texture) return null
  return parTexture.get(texture.trim().toUpperCase()) ?? null
}
