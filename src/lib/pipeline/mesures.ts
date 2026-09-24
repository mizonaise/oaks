import * as THREE from 'three'

/**
 * Mesures relevées sur la géométrie RENDUE (Dorian, 2026-09-15).
 *
 * Ce que le photographe note sur son carnet — épaisseur de porte, jeu entre
 * façades, retrait de plinthe, saillie de la poignée, hauteurs libres — se lit
 * ici sur les boîtes englobantes des meshes que le renderer d'article dessine,
 * pas dans une base à compléter. C'est juste quelle que soit la source (article
 * IMOS, panneaux du client) et ça ne dépend d'aucun nom de mesh : le paquet
 * `rp-article-designer` est obfusqué, ses noms ne sont pas un contrat.
 *
 * Heuristiques (mêmes seuils que `banc/InteriorDims.tsx`) : une dalle mince en z
 * au nu de la façade est une PORTE ; mince en y, une TABLETTE ; mince en x, une
 * JOUE ou une SÉPARATION ; un petit volume posé devant le nu des façades est une
 * POIGNÉE ; un cylindre long et fin, une TRINGLE. Tout en mètres, boîtes en
 * coordonnées MONDE (meuble centré en x et z, sol en y = 0).
 */

export type Boite = { min: [number, number, number]; max: [number, number, number] }

export type Mesures = {
  /** Empreinte du relevé : change dès que la géométrie change (le renderer monte ses meshes après coup). */
  signature: string
  mailles: number
  /** Façades (portes ou faces de tiroir) au nu avant, de gauche à droite. */
  facades: Boite[]
  porte: { epaisseur_mm: number; jeu_mm: number | null; nu_avant_m: number } | null
  poignees: Boite[]
  poignee: {
    nb: number
    l_mm: number
    h_mm: number
    saillie_mm: number
    forme: 'bouton' | 'barre horizontale' | 'barre verticale' | 'prise encastrée' | 'inconnue'
    hauteur_sol_mm: number
    meme_hauteur: boolean
    /** Distance du centre de la poignée au bord le plus proche de sa façade, et ce bord. */
    bord_mm: number | null
    cote: 'gauche' | 'droite' | 'centre' | null
  } | null
  plinthe: { hauteur_mm: number; retrait_mm: number } | null
  bandeau: { hauteur_mm: number; retrait_mm: number } | null
  fileurs: { gauche_mm: number | null; droite_mm: number | null }
  tablettes: { epaisseur_mm: number | null; colonnes: Array<{ x0_mm: number; x1_mm: number; vides_mm: number[] }> }
  tringles: Boite[]
  /** Couleur moyenne de la texture la plus fréquente sur les façades, si lisible. */
  finition: { hex_moyen: string | null; texture: string | null }
}

const THIN = 0.045
const MIN_SPAN = 0.15
const PETIT = 0.35

type B3 = { min: THREE.Vector3; max: THREE.Vector3; taille: THREE.Vector3; mesh: THREE.Mesh }

const arr = (v: THREE.Vector3): [number, number, number] => [r3(v.x), r3(v.y), r3(v.z)]
const r3 = (x: number) => Math.round(x * 1000) / 1000
const mm = (m: number) => Math.round(m * 1000)
const boite = (b: B3): Boite => ({ min: arr(b.min), max: arr(b.max) })

function overlap (a0: number, a1: number, b0: number, b1: number): number {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
}

/** Relève toutes les boîtes des meshes visibles du meuble, en coordonnées monde. */
function boites (root: THREE.Object3D, bounds: { w: number; h: number; d: number }): B3[] {
  const out: B3[] = []
  const box = new THREE.Box3()
  const slack = 0.08
  root.updateWorldMatrix(true, true)
  root.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return
    const mat = mesh.material as THREE.Material
    if (!mat || !mat.visible) return
    if ((mat as THREE.MeshStandardMaterial).wireframe) return
    if (mat.transparent && mat.opacity < 0.2) return
    box.setFromObject(mesh)
    if (box.isEmpty()) return
    // Dans l'enveloppe du meuble (avec un peu de jeu devant pour les poignées), sinon c'est la pièce.
    if (box.min.x < -bounds.w / 2 - slack || box.max.x > bounds.w / 2 + slack) return
    if (box.min.y < -slack || box.max.y > bounds.h + slack) return
    if (box.min.z < -bounds.d / 2 - slack || box.max.z > bounds.d / 2 + 0.15) return
    const taille = new THREE.Vector3()
    box.getSize(taille)
    out.push({ min: box.min.clone(), max: box.max.clone(), taille, mesh })
  })
  return out
}

/** Regroupe des petites boîtes proches (une poignée est souvent plusieurs meshes). */
function fusionner (items: B3[], seuil: number): Array<{ min: THREE.Vector3; max: THREE.Vector3 }> {
  const groupes: Array<{ min: THREE.Vector3; max: THREE.Vector3 }> = []
  for (const it of items) {
    const g = groupes.find(
      g =>
        it.min.x <= g.max.x + seuil && it.max.x >= g.min.x - seuil &&
        it.min.y <= g.max.y + seuil && it.max.y >= g.min.y - seuil &&
        it.min.z <= g.max.z + seuil && it.max.z >= g.min.z - seuil
    )
    if (g) {
      g.min.min(it.min)
      g.max.max(it.max)
    } else groupes.push({ min: it.min.clone(), max: it.max.clone() })
  }
  return groupes
}

function couleurMoyenne (mat: THREE.MeshStandardMaterial): string | null {
  const img = mat.map?.image as HTMLImageElement | ImageBitmap | undefined
  if (!img || typeof document === 'undefined') return null
  try {
    const c = document.createElement('canvas')
    c.width = 16
    c.height = 16
    const ctx = c.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img as CanvasImageSource, 0, 0, 16, 16)
    const { data } = ctx.getImageData(0, 0, 16, 16)
    let r = 0, g = 0, b = 0
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }
    const n = data.length / 4
    const hex = (x: number) => Math.round(x / n).toString(16).padStart(2, '0')
    return `#${hex(r)}${hex(g)}${hex(b)}`
  } catch {
    // Texture d'une autre origine sans CORS : le canvas est « souillé », on ne devine pas.
    return null
  }
}

export function mesurer (root: THREE.Object3D, bounds: { w: number; h: number; d: number }): Mesures {
  const all = boites(root, bounds)
  const { w, h, d } = bounds
  // Le nu avant se LIT dans les dalles, il ne se déduit pas de l'enveloppe : un ensemble mural a une enveloppe de 1 m pour un
  // corps de 0,5 m, et `d / 2` y tombe dans le vide (mesure vide sur 8 produits sur 12, relevé du 20/09).
  const dallesZ = all.filter(b => b.taille.z <= THIN && b.taille.x >= MIN_SPAN && b.taille.y >= 0.25)
  const front = dallesZ.length ? Math.max(...dallesZ.map(b => b.max.z)) : d / 2

  // Façades : dalles minces en z, larges et hautes, au nu avant (à ≤ 80 mm du devant).
  // Une façade peut être EN RETRAIT du nu avant (caissons hauts moins profonds d'un ensemble mural) : on accepte jusqu'à 30 cm de
  // retrait, à condition qu'aucune autre dalle ne la couvre par-devant — ce qui écarte les fonds et les séparations.
  const couverte = (b: B3) =>
    dallesZ.some(
      o => o !== b && o.max.z > b.max.z + 0.02 &&
        overlap(b.min.x, b.max.x, o.min.x, o.max.x) > 0.5 * b.taille.x &&
        overlap(b.min.y, b.max.y, o.min.y, o.max.y) > 0.5 * b.taille.y
    )
  const facades = dallesZ
    // Nu avant LOCAL : sur un L, la joue de bout de l'aile en retour est une dalle très en avant ; prise comme nu avant global,
    // elle rejetait toute la grande aile (1 façade mesurée sur les trois L, relevé du 20/09). On compare donc chaque dalle aux
    // seules dalles qui partagent sa tranche de largeur.
    .filter(b => {
      const local = Math.max(...dallesZ.filter(o => overlap(b.min.x, b.max.x, o.min.x, o.max.x) > 0.5 * Math.min(b.taille.x, o.taille.x)).map(o => o.max.z))
      return b.max.z >= local - 0.08 || (b.max.z >= local - 0.3 && !couverte(b))
    })
    // …et la joue de bout elle-même n'est pas une façade : elle dépasse de plus de 30 cm le nu médian des autres.
    .filter((b, _i, tous) => {
      const zs = tous.map(o => o.max.z).sort((p, q) => p - q)
      // …ni le FOND d'une niche ouverte, qu'aucune porte ne couvre : il est à plus de 30 cm DERRIÈRE le nu médian.
      const med = zs[Math.floor(zs.length / 2)]
      return b.max.z <= med + 0.3 && b.max.z >= med - 0.3
    })
    .sort((a, b) => a.min.x - b.min.x)
  // Dédoublonner : une porte et son chant / sa face intérieure occupent la même place.
  const facadesU: B3[] = []
  for (const f of facades) {
    const dernier = facadesU[facadesU.length - 1]
    if (dernier && overlap(f.min.x, f.max.x, dernier.min.x, dernier.max.x) > 0.5 * Math.min(f.taille.x, dernier.taille.x) && overlap(f.min.y, f.max.y, dernier.min.y, dernier.max.y) > 0.5 * Math.min(f.taille.y, dernier.taille.y)) {
      dernier.min.min(f.min)
      dernier.max.max(f.max)
      dernier.taille.subVectors(dernier.max, dernier.min)
      continue
    }
    facadesU.push({ min: f.min.clone(), max: f.max.clone(), taille: f.taille.clone(), mesh: f.mesh })
  }
  const nuAvant = facadesU.length ? Math.max(...facadesU.map(f => f.max.z)) : front
  const epaisseurs = facadesU.map(f => f.taille.z).sort((a, b) => a - b)
  const jeux: number[] = []
  for (let i = 0; i < facadesU.length - 1; i++) jeux.push(facadesU[i + 1].min.x - facadesU[i].max.x)
  const mediane = (xs: number[]) => (xs.length ? xs[Math.floor(xs.length / 2)] : null)
  const porte = facadesU.length
    ? { epaisseur_mm: mm(mediane(epaisseurs) ?? 0), jeu_mm: jeux.length ? mm(mediane([...jeux].sort((a, b) => a - b)) ?? 0) : null, nu_avant_m: r3(nuAvant) }
    : null

  // Poignées : petits volumes posés devant le nu des façades (ou juste dedans pour une prise fraisée).
  // Une poignée se juge devant SA façade, pas devant le nu avant global : les portes en retrait ont leurs poignées en retrait.
  const devantSaFacade = (b: B3) => {
    const cx = (b.min.x + b.max.x) / 2
    const cy = (b.min.y + b.max.y) / 2
    const fa = facadesU.find(f => cx >= f.min.x - 0.03 && cx <= f.max.x + 0.03 && cy >= f.min.y - 0.05 && cy <= f.max.y + 0.05)
    return fa ? b.max.z >= fa.max.z - 0.03 && b.min.z <= fa.max.z + 0.15 : b.max.z >= nuAvant - 0.03
  }
  const petits = all.filter(
    b => b.taille.x <= PETIT && b.taille.y <= PETIT && b.taille.z <= 0.12 && devantSaFacade(b) && b.min.y > 0.15 && b.max.y < h - 0.05
  )
  const poignees = fusionner(petits, 0.03).filter(g => g.max.x - g.min.x <= PETIT && g.max.y - g.min.y <= PETIT)
  let poignee: Mesures['poignee'] = null
  if (poignees.length) {
    const l = poignees.map(p => p.max.x - p.min.x)
    const hh = poignees.map(p => p.max.y - p.min.y)
    const saillie = poignees.map(p => p.max.z - nuAvant)
    const hauteurs = poignees.map(p => (p.min.y + p.max.y) / 2)
    const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
    const L = med(l), H = med(hh), S = med(saillie)
    const forme: NonNullable<Mesures['poignee']>['forme'] =
      S < 0.004 ? 'prise encastrée' : Math.abs(L - H) < 0.012 ? 'bouton' : L > H * 1.8 ? 'barre horizontale' : H > L * 1.8 ? 'barre verticale' : 'inconnue'
    const memeHauteur = Math.max(...hauteurs) - Math.min(...hauteurs) < 0.01
    // Position sur sa façade : distance du centre au bord le plus proche.
    const p0 = poignees[0]
    const cx = (p0.min.x + p0.max.x) / 2
    const f0 = facadesU.find(f => cx >= f.min.x - 0.01 && cx <= f.max.x + 0.01)
    let bord: number | null = null
    let cote: 'gauche' | 'droite' | 'centre' | null = null
    if (f0) {
      const dg = cx - f0.min.x
      const dd = f0.max.x - cx
      bord = mm(Math.min(dg, dd))
      cote = Math.abs(dg - dd) < 0.03 ? 'centre' : dg < dd ? 'gauche' : 'droite'
    }
    poignee = {
      nb: poignees.length,
      l_mm: mm(L),
      h_mm: mm(H),
      saillie_mm: mm(Math.max(0, S)),
      forme,
      hauteur_sol_mm: mm(med(hauteurs)),
      meme_hauteur: memeHauteur,
      bord_mm: bord,
      cote
    }
  }

  // Plinthe : dalle horizontale mince, au sol, large ; retrait = nu des façades − son devant.
  const bas = all.filter(b => b.min.y < 0.03 && b.taille.y <= 0.25 && b.taille.x >= 0.5 && b.taille.z <= 0.12 && b.max.z >= front - 0.2)
  const plinthe = bas.length
    ? (() => {
        const p = bas.sort((a, b) => b.taille.y - a.taille.y)[0]
        return { hauteur_mm: mm(p.taille.y), retrait_mm: mm(Math.max(0, nuAvant - p.max.z)) }
      })()
    : null
  const haut = all.filter(b => b.max.y > h - 0.03 && b.taille.y <= 0.25 && b.taille.x >= 0.5 && b.taille.z <= 0.12 && b.max.z >= front - 0.2)
  const bandeau = haut.length
    ? (() => {
        const p = haut.sort((a, b) => b.taille.y - a.taille.y)[0]
        return { hauteur_mm: mm(p.taille.y), retrait_mm: mm(Math.max(0, nuAvant - p.max.z)) }
      })()
    : null

  // Fileurs : ce qui reste entre le bord du meuble et la première / dernière façade.
  const fileurs = {
    gauche_mm: facadesU.length ? mm(Math.max(0, facadesU[0].min.x + w / 2)) : null,
    droite_mm: facadesU.length ? mm(Math.max(0, w / 2 - facadesU[facadesU.length - 1].max.x)) : null
  }

  // Tablettes : dalles minces en y, à l'intérieur ; regroupées en colonnes par recouvrement en x.
  const tablettes = all.filter(b => b.taille.y <= THIN && b.taille.x >= MIN_SPAN && b.taille.z >= 0.1 && b.min.y > 0.03 && b.max.y < h - 0.03)
  const colonnes: Array<{ x0: number; x1: number; ys: number[]; ep: number[] }> = []
  for (const t of tablettes) {
    const k = colonnes.find(c => overlap(t.min.x, t.max.x, c.x0, c.x1) >= 0.6 * Math.min(t.taille.x, c.x1 - c.x0))
    if (k) {
      k.ys.push(t.min.y, t.max.y)
      k.ep.push(t.taille.y)
    } else colonnes.push({ x0: t.min.x, x1: t.max.x, ys: [t.min.y, t.max.y], ep: [t.taille.y] })
  }
  const colonnesOut = colonnes
    .sort((a, b) => a.x0 - b.x0)
    .map(c => {
      const ys = [...new Set(c.ys.map(y => Math.round(y * 200) / 200))].sort((a, b) => a - b)
      const vides: number[] = []
      for (let i = 1; i < ys.length - 1; i += 2) vides.push(mm(ys[i + 1] - ys[i]))
      return { x0_mm: mm(c.x0 + w / 2), x1_mm: mm(c.x1 + w / 2), vides_mm: vides.filter(v => v >= 30) }
    })
  const epTab = tablettes.length ? mm([...tablettes.map(t => t.taille.y)].sort((a, b) => a - b)[Math.floor(tablettes.length / 2)]) : null

  // Tringles : long et fin dans les deux autres axes, en hauteur.
  const tringles = all.filter(b => b.taille.x >= 0.3 && b.taille.y <= 0.04 && b.taille.z <= 0.04 && b.min.y > 0.8).map(boite)

  // Finition : la texture la plus fréquente sur les façades.
  let finition: Mesures['finition'] = { hex_moyen: null, texture: null }
  const compte = new Map<string, { n: number; mat: THREE.MeshStandardMaterial }>()
  for (const f of facadesU) {
    const mats = Array.isArray(f.mesh.material) ? f.mesh.material : [f.mesh.material]
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial
      const src = (std.map?.image as HTMLImageElement | undefined)?.src ?? std.map?.name ?? null
      if (!src) continue
      const e = compte.get(src) ?? { n: 0, mat: std }
      e.n++
      compte.set(src, e)
    }
  }
  if (compte.size) {
    const [src, e] = [...compte.entries()].sort((a, b) => b[1].n - a[1].n)[0]
    finition = { hex_moyen: couleurMoyenne(e.mat), texture: src }
  }

  const signature = [
    all.length,
    facadesU.length,
    poignees.length,
    plinthe?.hauteur_mm ?? 0,
    bandeau?.hauteur_mm ?? 0,
    tablettes.length,
    tringles.length,
    finition.texture ? 1 : 0
  ].join('/')

  return {
    signature,
    mailles: all.length,
    facades: facadesU.map(boite),
    porte,
    poignees: poignees.map(g => ({ min: arr(g.min), max: arr(g.max) })),
    poignee,
    plinthe,
    bandeau,
    fileurs,
    tablettes: { epaisseur_mm: epTab, colonnes: colonnesOut },
    tringles,
    finition
  }
}
