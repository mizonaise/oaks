#!/usr/bin/env node
/**
 * Generateur de prompt Flora depuis la fiche JSON du configurateur
 * (Dorian, 2026-09-15).
 *
 *   node scripts/prompt-flora.mjs --fiche=.sorties-pipeline/fiche.json --piece=chambre
 *
 * Ecrit a la maniere de Raphael, dont le board a ete relu le 15/09 : son prompt
 * n'exprime pas une intention, il ENUMERE et il CHIFFRE — « 7 panneaux
 * verticaux identiques, hauteur 270,1 cm chacun, largeur 59 cm, largeur totale
 * 413 cm, aucun changement d'echelle, de ratio ou de nombre de panneaux ».
 *
 * La difference tient en une ligne : sa chaine fait DECHIFFRER ces cotes a un
 * LLM depuis un schema coté — et sa propre « fiche technique » avoue ce qu'elle
 * n'a pas pu determiner (« largeur totale du meuble : non determinable »). Ici
 * les cotes viennent du configurateur, exactes, sans inference.
 *
 * Deux regles tirees des deux essais rates du 15/09 :
 *  - tout element repete porte SON COMPTE et SA POSITION (les poignees sont
 *    sorties sur 3 facades /5 quand le prompt decrivait l'intention) ;
 *  - le FAIL IF nomme l'artefact qu'on verrait, pas le reglage qu'on voulait.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...r] = a.replace(/^--/, '').split('=')
    return [k, r.length ? r.join('=') : true]
  })
)

const fiche = JSON.parse(
  readFileSync(resolve(String(args.fiche ?? '.sorties-pipeline/fiche.json')), 'utf8')
)

const v = fiche.valeurs ?? {}
const nombre = x => Number(String(x ?? '').replace(',', '.')) || 0
const cm = mm => (mm / 10).toFixed(mm % 10 ? 1 : 0).replace('.', ',')

// --- les cotes, telles que le configurateur les connait -------------------

const L = nombre(v.ZF_WIDTH)
const H = nombre(v.ZF_HEIGHT)
const P = nombre(v.ZF_DEPTH)
const colonnes = nombre(v.ZF_CNT)
const fileurG = nombre(v.FILLER_LEFT)
const fileurD = nombre(v.FILLER_RIGHT)
const fileurHaut = nombre(v.FILLER_TOP)
const fileurBas = nombre(v.FILLER_BOTTOM)

// Ce que Raphael doit deduire d'un dessin, on le calcule : largeur de facade =
// largeur hors tout moins les fileurs, divisee par le nombre de colonnes.
const largeurFacade = (L - fileurG - fileurD) / colonnes
const hauteurFacade = H - fileurHaut - fileurBas

const piece = String(args.piece ?? 'chambre')
// Fiche v1 (plan de prises de vue) : `prises[]` ; fiche v0 : `vues[]`.
const priseRef = fiche.prises?.find(p => p.id === (args.prise ?? 'H02')) ?? null
const vue = fiche.vues?.find(x => x.cle === (args.vue ?? 'client_trois_quarts'))?.vue
const oeil = priseRef?.camera?.hauteur_m ?? vue?.oeil_m ?? 1.75
const focale = priseRef?.camera?.focale_eq_mm ?? 35

// La poignee vient des DONNEES — libelle du configurateur et forme mesuree sur
// la geometrie — jamais d'un texte en dur. Le 15/09, trois essais ont exige
// « une prise de doigt verticale » et interdit « toute poignee ronde » sur une
// configuration dont la poignee etait la « Circle » : le prompt contredisait
// l'image de reference, et le test des poignees en a ete confondu.
const poignee = fiche.mesures?.poignee ?? null
const nomPoignee = fiche.libelles?.['Styler › Pull'] ?? v.OV_PULL ?? 'poignee'
const formePoignee = poignee?.forme ?? 'forme visible sur l image'
const quincaillerie = fiche.libelles?.['Styler › Hardware color'] ?? v.OV_HW_COLOR ?? ''
const lignePoignee = poignee
  ? `- Poignee « ${nomPoignee} » : ${formePoignee}${quincaillerie ? ` ${String(quincaillerie).toLowerCase()}` : ''}, ${poignee.l_mm} x ${poignee.h_mm} mm, saillie ${poignee.saillie_mm} mm, UNE par facade soit ${colonnes} au total, toutes a ${poignee.hauteur_sol_mm} mm du sol${poignee.bord_mm != null ? `, ${poignee.cote === 'centre' ? 'centree sur' : `a ${poignee.bord_mm} mm du bord ${poignee.cote} de`} sa facade` : ''} — exactement comme sur l'image jointe, aucune facade nue, aucune facade avec deux`
  : `- Poignee « ${nomPoignee} » reprise a l'identique de l'image jointe : meme forme, meme taille, meme position, UNE par facade soit ${colonnes} au total`
const failPoignee = poignee
  ? `une facade n'a pas de poignee ; une facade en porte deux ; une poignee n'est pas ${formePoignee} ; les poignees ne sont pas toutes a la meme hauteur`
  : `une facade n'a pas de poignee ; une facade en porte deux ; une poignee differe de celle de l'image jointe`

const prompt = `FIDELITE PRODUIT — reprendre l'image jointe comme verite du meuble. Dimensions a respecter strictement :
- ${colonnes} facades verticales identiques, pleines et lisses, sans cadre, sans moulure, sans vitrage
- Largeur de chaque facade : ${cm(largeurFacade)} cm
- Hauteur de chaque facade : ${cm(hauteurFacade)} cm
- Largeur totale du meuble : ${cm(L)} cm — Hauteur totale : ${cm(H)} cm — Profondeur : ${cm(P)} cm
- Bandeau haut de ${cm(fileurHaut)} cm et plinthe de ${cm(fileurBas)} cm, de la meme teinte que les facades
- Fileurs lateraux de ${cm(fileurG)} cm a gauche et ${cm(fileurD)} cm a droite
- Aucun changement d'echelle, de ratio, ni du nombre de facades : il y en a exactement ${colonnes}, ni ${colonnes - 1}, ni ${colonnes + 1}
${lignePoignee}
- Couleur, finition mate et reflets exactement identiques a l'image jointe

INTEGRATION ARCHITECTURALE —
- Le meuble est encastre : ses cotes gauche et droit affleurent les murs, zero jeu, zero joint creux, zero espace visible
- Il part du sol et monte jusqu'au plafond, comme une menuiserie integree a la construction
- Seuls les ${colonnes - 1} joints verticaux entre facades restent visibles, fins, reguliers et parfaitement alignes

SCENE — ${piece} habitee, jamais minimaliste ni showroom : parquet chene a chevrons legerement use, tapis ancien aux tons rouges et bordeaux devant le meuble, un fauteuil mid-century en noyer et lin ecru sur la droite, quelques objets vecus (livres empiles, ceramique). Lumiere naturelle douce et laterale du matin venant de la gauche, ombres longues et douces. Photographie d'interieur editoriale, colorimetrie chaude et sobre, grain fin, jamais un rendu 3D.

CADRAGE — carre 1:1, camera a hauteur d'oeil ${String(oeil).replace('.', ',')} m, focale equivalente ${focale} mm, meuble entier dans le cadre, aucune plongee ni contre-plongee, verticales d'aplomb.

FAIL IF — on compte un nombre de facades different de ${colonnes} ; ${failPoignee} ; une facade a un cadre, une moulure ou une vitre ; un espace ou une ombre separe le meuble du mur, du sol ou du plafond ; on voit le dessus du meuble ; un texte, une cote, un logo ou un filigrane apparait ; l'image n'est pas carree.`

console.log(prompt)
