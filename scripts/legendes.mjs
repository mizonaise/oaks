/**
 * Légendes du plan de prises de vue (Dorian, 2026-09-15).
 *
 * Pour chaque prise capturée, deux formes de la même information :
 *  - un JSON compact (`json`) — ce que le photographe a réglé, ce qui est dans
 *    le champ, ce que l'image prouve — pour l'étage LLM d'une technique Flora ;
 *  - une prose en trois phrases (`prose`) — « ce que le photographe a fait /
 *    ce qu'on voit / ce que ça prouve » — pour un modèle qui lit du texte, ou un
 *    relecteur humain.
 *
 * Règle : tout en millimètres, jamais un adjectif de matière sans son code, et
 * jamais une valeur inventée — ce que la géométrie n'a pas mesuré est absent,
 * pas estimé.
 */

const FONCTIONS = {
  AS: 'étagères réglables',
  DR: 'tiroirs',
  OP_DR: 'niche ouverte avec tiroirs',
  OP: 'niche ouverte',
  HC: 'penderie',
  X: 'vide (panneau)',
  PDT: 'plateau / bureau',
  BC: 'banc',
  BC45: 'banc'
}
const SOUS_ARTICLES = { IDR: 'tiroirs intérieurs', IAS: 'étagères intérieures', IHC: 'penderie intérieure', DR: 'tiroirs', AS: 'étagères', HC: 'penderie' }
const PORTES = { SD: 'porte simple', DD: 'double porte', '': 'sans porte' }
const INSTALLATION = {
  BUILT_IN: 'encastré mur à mur, du sol au plafond',
  BUILT_IN_LEFT: 'encastré contre le mur de gauche, flanc droit visible',
  BUILT_IN_RIGHT: 'encastré contre le mur de droite, flanc gauche visible',
  FREE_STANDING: 'posé libre, adossé au mur du fond',
  inconnu: 'pose non renseignée'
}

const nb = x => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const mm = x => (nb(x) === null ? null : `${Math.round(x)} mm`)
const m = x => (nb(x) === null ? null : `${(Math.round(x * 100) / 100).toString().replace('.', ',')} m`)
const deg = x => (nb(x) === null ? null : `${Math.round(x)}°`)
const propre = s => String(s ?? '').trim()

/** Fonction d'une colonne en clair, depuis `Z1_TYPE` et le sous-article. */
export function fonctionColonne (col) {
  const type = propre(col.type).toUpperCase()
  const sa = propre(col.sousArticle).toUpperCase()
  const base = FONCTIONS[type] ?? (type ? type : null)
  const mSa = sa.match(/^(\d*)([A-Z_]+)$/)
  const sous = mSa ? `${mSa[1] ? `${mSa[1]} ` : ''}${SOUS_ARTICLES[mSa[2]] ?? mSa[2]}` : sa || null
  return [base, sous].filter(Boolean).join(' — ') || 'fonction non renseignée'
}

/** Le meuble en une phrase : cotes, façades, poignée, finition, bandes. */
export function phraseMeuble ({ valeurs = {}, libelles = {}, scene = null, mesures = null }) {
  const L = nb(Number(valeurs.ZF_WIDTH)), H = nb(Number(valeurs.ZF_HEIGHT)), P = nb(Number(valeurs.ZF_DEPTH))
  const colonnes = scene?.colonnes ?? []
  const nFacades = mesures?.facades?.length ?? colonnes.filter(k => propre(k.porte)).length
  const largeurFacade = mesures?.facades?.length
    ? Math.round(mesures.facades.reduce((s, f) => s + (f.max[0] - f.min[0]) * 1000, 0) / mesures.facades.length)
    : null
  const p = mesures?.poignee
  const nomPoignee = libelles['Styler › Pull'] ?? valeurs.OV_PULL ?? null
  const quincaillerie = libelles['Styler › Hardware color'] ?? valeurs.OV_HW_COLOR ?? null
  const finition = libelles['Styler › Finish ext'] ?? valeurs.OV_FINISH_EXT ?? null
  const collection = libelles['Styler › Collection'] ?? valeurs.OV_COLLECTION ?? null
  const parts = []
  parts.push(
    `Meuble ${INSTALLATION[scene?.installation ?? 'inconnu']}${L && H && P ? `, ${L} × ${H} × ${P} mm (largeur × hauteur × profondeur)` : ''}`
  )
  if (nFacades) parts.push(`${nFacades} façades pleines${largeurFacade ? ` de ${largeurFacade} mm` : ''}${mesures?.porte ? `, portes de ${mesures.porte.epaisseur_mm} mm${mesures.porte.jeu_mm != null ? `, jeu de ${mesures.porte.jeu_mm} mm entre façades` : ''}` : ''}`)
  if (p) {
    parts.push(
      `poignée « ${nomPoignee ?? 'code inconnu'} » : ${p.forme}, ${p.l_mm} × ${p.h_mm} mm, saillie ${p.saillie_mm} mm, ${p.nb} au total${p.meme_hauteur ? ', toutes à la même hauteur' : ''}, à ${p.hauteur_sol_mm} mm du sol${p.bord_mm != null ? `, ${p.cote === 'centre' ? 'centrée' : `à ${p.bord_mm} mm du bord ${p.cote}`} de sa façade` : ''}`
    )
  } else if (nomPoignee) {
    parts.push(`poignée « ${nomPoignee} » (forme non mesurée : la géométrie de la poignée n'a pas été trouvée)`)
  }
  // `OV_HW_COLOR` est la couleur de la QUINCAILLERIE (charnières, ferrures), pas
  // celle de la poignée — un « bouton black » sur une poignée vernie serait faux.
  if (quincaillerie) parts.push(`quincaillerie (charnières, ferrures) ${String(quincaillerie).toLowerCase()}`)
  if (finition) parts.push(`finition extérieure ${finition}${collection ? ` (${collection})` : ''}${mesures?.finition?.hex_moyen ? `, teinte moyenne ${mesures.finition.hex_moyen}` : ''}`)
  if (mesures?.plinthe) parts.push(`plinthe de ${mesures.plinthe.hauteur_mm} mm en retrait de ${mesures.plinthe.retrait_mm} mm`)
  if (mesures?.bandeau) parts.push(`bandeau haut de ${mesures.bandeau.hauteur_mm} mm`)
  const fg = scene?.fileurs_mm?.gauche ?? mesures?.fileurs?.gauche_mm
  const fd = scene?.fileurs_mm?.droite ?? mesures?.fileurs?.droite_mm
  if (fg != null || fd != null) parts.push(`fileurs latéraux ${fg ?? '?'} / ${fd ?? '?'} mm`)
  return parts.join(' ; ') + '.'
}

/** La caméra en une phrase de photographe. */
export function phraseCamera (camera, prise) {
  if (!camera || camera.faisable === false) return null
  const cote = camera.azimut_deg < -2 ? 'à gauche du meuble' : camera.azimut_deg > 2 ? 'à droite du meuble' : 'face au meuble'
  const angle = Math.abs(camera.azimut_deg) > 2 ? ` (${deg(Math.abs(camera.azimut_deg))} par rapport à la façade)` : ''
  const incl =
    camera.inclinaison_deg > 1
      ? `, appareil incliné de ${deg(camera.inclinaison_deg)} vers le bas`
      : camera.inclinaison_deg < -1
      ? `, appareil incliné de ${deg(-camera.inclinaison_deg)} vers le haut`
      : ', appareil de niveau'
  const shift = camera.decentrement && Math.abs(camera.decentrement[1]) > 0.001 ? ', cadre décentré pour garder les verticales d\'aplomb' : ''
  const partiel = camera.cadrage === 'partiel' ? ' ; la façade proche peut sortir du cadre' : ''
  if (prise.cadrage === 'plan') return `Plan de la pièce vu de dessus, perspective quasi nulle (focale ${camera.focale_eq_mm} mm, ${m(camera.distance_m)} au-dessus du sol) : un dessin technique, pas une photo.`
  return `Le photographe est ${cote}${angle}, objectif ${camera.focale_eq_mm} mm équivalent 24×36, à ${m(camera.distance_m)} du sujet, hauteur ${m(camera.hauteur_m)}${incl}${shift}${partiel}.`
}

const LUMIERES = {
  cle: 'lumière naturelle douce venant de la fenêtre',
  douce: 'lumière douce et enveloppante',
  'rasante-gauche': 'lumière rasante depuis la gauche, à 20° au-dessus de l\'horizon, qui révèle le relief',
  'rasante-droite': 'lumière rasante depuis la droite, à 20° au-dessus de l\'horizon, qui révèle le relief'
}

/** Ce qu'il y a dans le champ, selon la cible de la prise. */
export function phraseSujet (prise, ctx) {
  const { valeurs = {}, libelles = {}, scene = null, mesures = null, camera = null } = ctx
  const p = mesures?.poignee
  const nomPoignee = libelles['Styler › Pull'] ?? valeurs.OV_PULL ?? 'poignée'
  switch (prise.cible) {
    case 'poignee':
      return p
        ? `Dans le champ : une seule poignée « ${nomPoignee} », ${p.forme}, ${p.l_mm} × ${p.h_mm} mm, saillie ${p.saillie_mm} mm, à ${p.hauteur_sol_mm} mm du sol${p.bord_mm != null ? `, ${p.cote === 'centre' ? 'centrée sur' : `à ${p.bord_mm} mm du bord ${p.cote} de`} sa façade` : ''}${mesures?.porte ? ` ; la porte fait ${mesures.porte.epaisseur_mm} mm d'épaisseur` : ''}. Toutes les façades portent la même poignée${p.meme_hauteur ? ' à la même hauteur' : ''}.`
        : `Dans le champ : la poignée « ${nomPoignee} » (géométrie non mesurée).`
    case 'joint':
      return `Dans le champ : le joint vertical entre deux portes voisines${mesures?.porte?.jeu_mm != null ? `, jeu de ${mesures.porte.jeu_mm} mm` : ''}${mesures?.porte ? `, portes de ${mesures.porte.epaisseur_mm} mm` : ''}, même finition des deux côtés, fil vertical.`
    case 'texture':
      return `Dans le champ : la surface d'une façade, finition ${libelles['Styler › Finish ext'] ?? valeurs.OV_FINISH_EXT ?? 'code inconnu'}${mesures?.finition?.hex_moyen ? ` (teinte moyenne ${mesures.finition.hex_moyen})` : ''}, rien d'autre.`
    case 'plinthe':
      return `Dans le champ : le bas du meuble et le sol${mesures?.plinthe ? ` — plinthe de ${mesures.plinthe.hauteur_mm} mm en retrait de ${mesures.plinthe.retrait_mm} mm sous les façades` : ''}, ombre de contact au sol.`
    case 'bandeau':
      return `Dans le champ : le haut du meuble et le plafond${mesures?.bandeau ? ` — bandeau de ${mesures.bandeau.hauteur_mm} mm` : ''}${scene?.fileurs_mm?.haut != null ? `, fileur haut de ${scene.fileurs_mm.haut} mm` : ''}, affleurement au plafond sans jeu.`
    case 'fileur': {
      const g = scene?.murs?.gauche?.present
      return `Dans le champ : le raccord entre le flanc ${g ? 'gauche' : 'droit'} du meuble et le mur${scene?.fileurs_mm ? ` — fileur de ${g ? scene.fileurs_mm.gauche : scene.fileurs_mm.droite} mm` : ''}, affleurant.`
    }
    case 'porte_ouverte': {
      const k = scene?.colonnes?.find(c => c.rang === camera?.colonne_ouverte)
      return `Dans le champ : la colonne ${camera?.colonne_ouverte ?? '?'} avec sa porte ouverte à 90°${k?.ouverture ? ` (charnières à ${String(k.ouverture).toLowerCase() === 'left' ? 'gauche' : 'droite'})` : ''}${k ? `, intérieur : ${fonctionColonne(k)}` : ''} ; les autres portes restent fermées.`
    }
    case 'piece':
      return `Dans le champ : la pièce autour du meuble — ${INSTALLATION[scene?.installation ?? 'inconnu']}, pièce de ${m(scene?.piece?.largeur_m)} de large, plafond à ${m(scene?.piece?.hauteur_m)}, fenêtre ${scene?.fenetre?.cote === 'face' ? 'en face' : `à ${scene?.fenetre?.cote}`}. ${phraseMeuble(ctx)}`
    case 'plan':
      return `Dans le champ : l'implantation vue de dessus — le meuble contre le mur du fond, murs latéraux ${scene?.murs?.gauche?.present ? 'présent' : 'absent'} à gauche et ${scene?.murs?.droite?.present ? 'présent' : 'absent'} à droite, profondeur de meuble ${valeurs.ZF_DEPTH ?? '?'} mm.`
    case 'meuble': {
      const portes = prise.portes === 'retirees' ? 'Portes retirées : la structure intérieure est visible' : prise.portes === 'ouvertes' ? 'Toutes les portes ouvertes à 90°' : 'Portes fermées'
      const cols = (scene?.colonnes ?? []).map(k => `colonne ${k.rang} : ${PORTES[propre(k.porte)] ?? propre(k.porte)}, ${fonctionColonne(k)}`).join(' · ')
      return `${portes}. ${phraseMeuble(ctx)}${cols && prise.portes !== 'fermees' ? ` Intérieur — ${cols}.` : ''}`
    }
    default: {
      if (prise.cible.startsWith('zone:')) {
        const code = prise.cible.slice(5)
        const k = (scene?.colonnes ?? []).find(c => propre(c.type).toUpperCase() === code || propre(c.sousArticle).toUpperCase().includes(code))
        const largeur = k ? Math.round((k.max[0] - k.min[0]) * 1000) : null
        const vides = mesures?.tablettes?.colonnes?.find(c => k && c.x0_mm >= (k.min[0] + (valeurs.ZF_WIDTH ? Number(valeurs.ZF_WIDTH) / 2000 : 0)) * 1000 - 40)
        return `Dans le champ : la colonne ${k?.rang ?? '?'}${largeur ? ` (${largeur} mm de large)` : ''}, ${k ? fonctionColonne(k) : code}${vides?.vides_mm?.length ? `, hauteurs libres ${vides.vides_mm.join(' / ')} mm` : ''}${mesures?.tablettes?.epaisseur_mm ? `, tablettes de ${mesures.tablettes.epaisseur_mm} mm` : ''}${mesures?.tringles?.length && code === 'HC' ? `, tringle à ${Math.round(((mesures.tringles[0].min[1] + mesures.tringles[0].max[1]) / 2) * 1000)} mm du sol` : ''}.`
      }
      return phraseMeuble(ctx)
    }
  }
}

/** La légende complète d'une prise : JSON + prose. */
export function legende (prise, ctx) {
  const { camera = null, mesures = null, scene = null, valeurs = {}, libelles = {}, fichiers = {} } = ctx
  const faisable = Boolean(camera && camera.faisable !== false)
  const cam = faisable ? phraseCamera(camera, prise) : null
  const lum = LUMIERES[prise.lumiere] ?? prise.lumiere
  const sujet = faisable ? phraseSujet(prise, ctx) : null
  const prouve = prise.prouve?.length ? `Cette image prouve : ${prise.prouve.join(' ; ')}.` : ''
  const prose = faisable
    ? [`${cam} ${lum[0].toUpperCase()}${lum.slice(1)}.`, sujet, prouve].filter(Boolean).join(' ')
    : `Prise ${prise.id} non réalisée : ${camera?.raison ?? 'raison inconnue'}.`
  const json = {
    id: prise.id,
    serie: prise.serie,
    titre: prise.titre,
    statut: faisable ? 'capturee' : 'omise',
    raison: faisable ? undefined : camera?.raison ?? null,
    fichiers,
    camera: faisable
      ? {
          focale_eq_mm: camera.focale_eq_mm,
          fov_v_deg: camera.fov_v_deg,
          format: '1:1',
          position_m: camera.position,
          cible_m: camera.cible,
          distance_m: camera.distance_m,
          hauteur_m: camera.hauteur_m,
          azimut_deg: camera.azimut_deg,
          inclinaison_deg: camera.inclinaison_deg,
          polaire_deg: camera.polaire_deg,
          decentrement: camera.decentrement,
          cadrage: camera.cadrage,
          politique: camera.politique,
          ouverture_eq: prise.cadrage === 'detail' ? 'f/2.8' : 'f/8',
          mise_au_point: camera.sujet,
          notes: camera.notes
        }
      : null,
    lumiere: { intention: prise.lumiere, description: lum },
    portes: prise.portes,
    colonne_ouverte: camera?.colonne_ouverte ?? null,
    sujet: camera?.sujet ?? null,
    mesures: mesuresPour(prise, mesures, scene, valeurs, libelles),
    prouve: prise.prouve,
    legende: prose
  }
  return { json, prose }
}

/** Le sous-ensemble des mesures utile à cette prise. */
function mesuresPour (prise, mesures, scene, valeurs, libelles) {
  if (!mesures) return null
  const commun = {
    meuble_mm: scene?.meuble ?? { l: Number(valeurs.ZF_WIDTH) || null, h: Number(valeurs.ZF_HEIGHT) || null, p: Number(valeurs.ZF_DEPTH) || null },
    installation: scene?.installation ?? null
  }
  switch (prise.cible) {
    case 'poignee':
      return { ...commun, poignee: { ...mesures.poignee, nom: libelles['Styler › Pull'] ?? valeurs.OV_PULL ?? null, code: valeurs.OV_PULL ?? null }, quincaillerie: libelles['Styler › Hardware color'] ?? valeurs.OV_HW_COLOR ?? null, porte: mesures.porte }
    case 'joint':
      return { ...commun, porte: mesures.porte, facades: mesures.facades.length }
    case 'texture':
      return { ...commun, finition: { code: valeurs.OV_FINISH_EXT ?? null, nom: libelles['Styler › Finish ext'] ?? null, collection: libelles['Styler › Collection'] ?? valeurs.OV_COLLECTION ?? null, ...mesures.finition } }
    case 'plinthe':
      return { ...commun, plinthe: mesures.plinthe, fileur_bas_mm: scene?.fileurs_mm?.bas ?? null }
    case 'bandeau':
      return { ...commun, bandeau: mesures.bandeau, fileur_haut_mm: scene?.fileurs_mm?.haut ?? null, jeu_plafond_m: scene?.piece?.jeu_plafond_m ?? null }
    case 'fileur':
      return { ...commun, fileurs_mm: scene?.fileurs_mm ?? mesures.fileurs, murs: scene?.murs ?? null }
    case 'piece':
    case 'plan':
      return { ...commun, piece: scene?.piece ?? null, murs: scene?.murs ?? null, fenetre: scene?.fenetre ?? null }
    default:
      return {
        ...commun,
        facades: mesures.facades.length,
        porte: mesures.porte,
        poignee: mesures.poignee ? { ...mesures.poignee, nom: libelles['Styler › Pull'] ?? valeurs.OV_PULL ?? null } : null,
        plinthe: mesures.plinthe,
        bandeau: mesures.bandeau,
        fileurs_mm: scene?.fileurs_mm ?? mesures.fileurs,
        colonnes: (scene?.colonnes ?? []).map(k => ({ rang: k.rang, largeur_mm: Math.round((k.max[0] - k.min[0]) * 1000), porte: k.porte ?? null, ouverture: k.ouverture ?? null, fonction: fonctionColonne(k) })),
        tablettes: mesures.tablettes,
        tringles_mm: mesures.tringles.map(t => Math.round(((t.min[1] + t.max[1]) / 2) * 1000))
      }
  }
}
