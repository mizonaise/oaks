/**
 * LES UV À L'ÉCHELLE RÉELLE (d5, nuit du 22 au 23/09/2026) : une texture dont une répétition couvre `echelleMm` millimètres, posée sur une
 * géométrie par PROJECTION PLANE SELON LA NORMALE DOMINANTE de chaque sommet — le « box mapping » des logiciels de rendu : la face avant
 * (normale ±z) reçoit (x, y), le chant du haut (normale ±y) reçoit (x, z), le chant de côté (normale ±x) reçoit (y, z), chaque coordonnée
 * en mm divisée par l'échelle. Le motif a donc la même taille sur une porte de 587 mm et sur une porte de 1 170 mm, et il se continue d'une
 * face à l'autre au coin (mêmes coordonnées, mêmes UV).
 *
 * Avant (mesuré le 22/09, `docs/releves/2026-09-23_textures-echelle/avant/`) : nos boîtes (`CpPanel`, `FoxCadPieces`) et celles du designer
 * d'Otman portaient les UV [0, 1] de `BoxGeometry` sur CHAQUE face — l'image entière étirée sur la face, quelle que soit sa taille (une porte
 * de 2 340 × 586 mm et une tablette de 554 × 462 mm montraient le même unique motif) ; les contours extrudés de fox-cad étaient ramenés dans
 * [0, 1] pour faire pareil (`normaliserUv`, retiré).
 *
 * LE FIL (24/09, ligne du lead 08:5x, mot de Dorian « la plinthe et le resserrage doivent avoir le sens du fil dans la longueur ») : les
 * images des décors bois d'imos (IVIS) ont leurs veines le long de u, l'axe HORIZONTAL de l'image (mesuré sur `UN_0H251_W06` : veines à 0°,
 * gradients 1,8 fois plus forts en v qu'en u) — donc, sans rien de plus, le fil suit l'axe local x de chaque pièce sur ses grandes faces :
 * c'est le fil 0 d'imos (`GRAINOR` / `MATGROR` 0 = le long de x, la longueur de la pièce pour imos). `filY` (le `fil.angle` 90 que la pièce
 * porte, contrat v0.2.42) tourne les grandes faces : u suit alors l'axe local y. Aucune règle de l'écran : c'est la pièce qui dit son fil.
 */
import * as THREE from 'three'

/** la marque posée sur `geometry.userData` : l'échelle déjà écrite (mm) — le balayage du designer ne réécrit pas deux fois */
export const MARQUE_ECHELLE = 'echelleTextureMm'

/**
 * réécrit l'attribut `uv` de la géométrie (en place) : u, v = les deux coordonnées locales orthogonales à la normale dominante, en mm,
 * divisées par `echelleMm`. `mmParUnite` = combien de mm vaut une unité locale (1 pour nos géométries en mm, 1000 pour celles du designer
 * d'Otman, en mètres). Sans attribut `normal`, les normales sont calculées (les sommets d'une boîte ne sont pas partagés entre ses faces :
 * chaque sommet garde la normale de SA face). `filY` : le fil le long de l'axe local y — sur les grandes faces (normale ±z), u = y et v = x ;
 * les chants gardent la leur (sur un chant de normale ±x, u suit déjà y ; celui de normale ±y est le bout du fil). Rend la géométrie, marquée.
 */
export function uvEchelleReelle<G extends THREE.BufferGeometry>(g: G, echelleMm: number, mmParUnite = 1, filY = false): G {
  const echelle = Number.isFinite(echelleMm) && echelleMm > 0 ? echelleMm : 1000
  const position = g.getAttribute('position')
  if (!position) return g
  if (!g.getAttribute('normal')) g.computeVertexNormals()
  const normal = g.getAttribute('normal')
  const n = position.count
  const uv = new Float32Array(n * 2)
  const k = mmParUnite / echelle
  for (let i = 0; i < n; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const nx = Math.abs(normal.getX(i))
    const ny = Math.abs(normal.getY(i))
    const nz = Math.abs(normal.getZ(i))
    let u: number
    let v: number
    if (nz >= nx && nz >= ny) {
      // la face avant / arrière : (x, y) — (y, x) quand le fil de la pièce suit son axe y
      u = filY ? y : x
      v = filY ? x : y
    } else if (ny >= nx) {
      // le dessus / dessous : (x, z)
      u = x
      v = z
    } else {
      // les côtés : (y, z)
      u = y
      v = z
    }
    uv[i * 2] = u * k
    uv[i * 2 + 1] = v * k
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.userData[MARQUE_ECHELLE] = echelle
  return g
}

/** l'étendue des UV d'une géométrie (pour les tests et l'outil de mesure) : [min u, max u], [min v, max v] */
export function etendueUv(g: THREE.BufferGeometry): { u: [number, number]; v: [number, number] } | null {
  const uv = g.getAttribute('uv')
  if (!uv) return null
  let minU = Infinity
  let maxU = -Infinity
  let minV = Infinity
  let maxV = -Infinity
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    if (u < minU) minU = u
    if (u > maxU) maxU = u
    if (v < minV) minV = v
    if (v > maxV) maxV = v
  }
  return { u: [minU, maxU], v: [minV, maxV] }
}
