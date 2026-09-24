/**
 * LA PTO (« push to open ») À L'ÉCRAN — la règle de Dorian (23/09 19:5x, ligne du lead) : « PTO, c'est un choix possible pour l'ensemble des
 * portes, mais aussi une solution de repli pour les portes verticales — pas les petites — grandes, coupées, ou trop hautes, de sorte que les
 * poignées ne sont pas installables. » Le rendu (la part de d5) : NI POIGNÉE NI PERÇAGE sur une porte en PTO, et le badge dit laquelle des
 * deux natures — « PTO : choix » ou « PTO : repli ». Sans DOM ni React (joué par `npm test`).
 *
 * Rien n'est deviné ici : la nature se LIT dans les variables que le formulaire (et demain l'arbre) donnent à la position.
 *  - **La PTO d'une porte** : `Handle_Type = TIPON` (ce que l'option « Push and Open » du formulaire émet aujourd'hui, mesuré le 23/09 20:57
 *    sur 3025 : `Handle_Type=TIPON`, `PULL_GLB=…/TIPON.glb`, `HINGE_OPTION=data.hinge_option` — le littéral, défaut de l'arbre vu par d11)
 *    ou `HINGE_OPTION = Tipon` (la route prouvée par MT-bis, `produits/hex/recettes/PTO-PORTE-COUPEE.md` § 4 d'oaksome-stack :
 *    `Handle_Type := STANDARD` + `HINGE_OPTION := Tipon` — la porte technique d'Otman `TEC_ZONE` l'émet déjà en constantes).
 *  - **Choix ou repli** : le CHOIX du client est dans la portée GLOBALE du formulaire (l'option « Push and Open » : `Handle_Type = TIPON`) ;
 *    le REPLI est ce que l'arbre posera dans la ZONE de la colonne sous le seuil (`HEX_PTO := 1`, les deux variables ci-dessus en surcharge
 *    de zone) alors que le client a choisi une poignée. Le seuil (options A / B / C de d11) se fixe à la session de Dorian du 24/09 : ce
 *    module ne le calcule pas, il lit ce que l'arbre émettra. La porte technique d'Otman (`IS_TEC_DOOR = 1`) est une troisième nature, dite.
 *  - **Sans poignée** : `Handle_Type = STANDARD` sans Tipon (l'option « None » de la collection 3, charnière Blumotion) — rien à dessiner.
 *  - **Poignée intégrée** : `WC_OS_GR_FRnn` (la gorge, le trou, l'encoche usinés dans la façade, planches FA 2a à 2e) — pas de GLB par nature
 *    (inventaire du 23/09, `docs/releves/2026-09-23_inventaire-glb-portes.md`) ; fox-cad ne sert pas l'usinage : rien à poser, dit au badge.
 * Avant ce module, ces trois cas tombaient sur la PASTILLE du GLB manquant (`TIPON.glb`, `STANDARD.glb`, `WC_OS_GR_*.glb` : 404).
 */
import type { Portee } from './pose-poignee'

export type NaturePto = 'choix' | 'repli' | 'technique'

export type NaturePoignee =
  /** une poignée à poser : son GLB, ou la pastille si le GLB ne charge pas */
  | { genre: 'poignee' }
  /** push to open : ni poignée ni perçage */
  | { genre: 'pto'; nature: NaturePto; raison: string }
  /** « None » : aucune poignée, charnière normale */
  | { genre: 'sans'; raison: string }
  /** la poignée est usinée dans la façade (`WC_OS_GR_FRnn`) : rien à poser */
  | { genre: 'integree'; code: string; raison: string }

/** la valeur de l'option « Push and Open » du formulaire (`OV_PULL`, exportée en `Handle_Type`) */
export const CODE_PTO = 'TIPON'
/** « None » : la globale de la bibliothèque qui fait choisir à `Handle_Middle` le composant `w_door_None` (rien d'acheté, aucun trou) */
export const CODE_SANS = 'STANDARD'

const texte = (v: unknown): string => (v === undefined || v === null ? '' : String(v).trim())

/** `Tipon`, quelle que soit la casse (la valeur de `HINGE_OPTION` qui sélectionne les charnières « TO » et le Tip-On Blum) */
export const estTipon = (v: unknown): boolean => /^tipon$/i.test(texte(v))

/** le code de la poignée d'une portée : `Handle_Type`, sinon le nom du GLB (`oaksome/pull_glb/TIPON.glb` → `TIPON`, `STANDARD` → `STANDARD`) */
export function codePoignee (p: Portee): string {
  const handle = texte(p.Handle_Type)
  if (handle !== '') return handle
  const glb = texte(p.PULL_GLB)
  return glb.replace(/^.*\//, '').replace(/\.glb$/i, '')
}

const ptoDans = (p: Portee): boolean => codePoignee(p).toUpperCase() === CODE_PTO || estTipon(p.HINGE_OPTION)

/**
 * La nature de la poignée d'une porte : `position` = le lot de SA position (le `PVarString` du Set : la zone y surcharge la globale),
 * `globale` = la portée globale du formulaire (le choix du client).
 */
export function naturePoignee (position: Portee, globale: Portee = {}): NaturePoignee {
  const code = codePoignee(position)
  if (ptoDans(position)) {
    if (texte(position.IS_TEC_DOOR) === '1') return { genre: 'pto', nature: 'technique', raison: 'porte technique d’Otman (IS_TEC_DOOR = 1 : Handle_Type STANDARD, HINGE_OPTION Tipon en constantes)' }
    if (ptoDans(globale)) return { genre: 'pto', nature: 'choix', raison: `« Push and Open » choisi dans le formulaire (Handle_Type ${texte(globale.Handle_Type) || code})` }
    return {
      genre: 'pto',
      nature: 'repli',
      raison: `la zone impose la PTO (${texte(position.HEX_PTO) === '1' ? 'HEX_PTO = 1, ' : ''}Handle_Type ${code || '—'}, HINGE_OPTION ${texte(position.HINGE_OPTION) || '—'}) alors que le formulaire a la poignée ${codePoignee(globale) || '—'}`,
    }
  }
  if (code.toUpperCase() === CODE_SANS) return { genre: 'sans', raison: '« None » : aucune poignée, charnière normale (HINGE_OPTION ' + (texte(position.HINGE_OPTION) || '—') + ')' }
  if (/^WC_OS_GR_/i.test(code)) return { genre: 'integree', code, raison: `poignée intégrée ${code} : usinée dans la façade, pas de GLB ; fox-cad ne sert pas l’usinage` }
  return { genre: 'poignee' }
}

/**
 * Les portées d'une porte telles que `FoxCadPieces` les range — `[le lot de la position, les variables de l'article, celles du squelette,
 * les variables globales du formulaire]` : la position en tête, la globale en dernier.
 */
export function naturePoigneePortees (portees: Portee[]): NaturePoignee {
  return naturePoignee(portees[0] ?? {}, portees.length > 1 ? portees[portees.length - 1] : {})
}

/** ce que le badge dit des portes sans poignée posée — `« PTO : choix (5 portes) »`, `« PTO : repli (2) »`… ; vide s'il n'y en a pas */
export function direPto (c: { ptoChoix: number; ptoRepli: number; ptoTechnique: number; sans: number; integree: number }): string {
  const portes = (n: number) => `${n} porte${n > 1 ? 's' : ''}`
  const morceaux: string[] = []
  if (c.ptoChoix > 0) morceaux.push(`PTO : choix (${portes(c.ptoChoix)}, ni poignée ni perçage)`)
  if (c.ptoRepli > 0) morceaux.push(`PTO : repli (${portes(c.ptoRepli)}, poignée non installable)`)
  if (c.ptoTechnique > 0) morceaux.push(`PTO : porte technique (${portes(c.ptoTechnique)})`)
  if (c.sans > 0) morceaux.push(`sans poignée (${portes(c.sans)})`)
  if (c.integree > 0) morceaux.push(`poignée intégrée non dessinée (${portes(c.integree)})`)
  return morceaux.join(' · ')
}
