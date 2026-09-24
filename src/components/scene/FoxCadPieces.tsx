'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGetArticleQuery } from '@/lib/store/api/tecniboApi'
import { coteCharnieres, estContour, estPorte, estVide, filLeLongDeY, geometriePiece, geometriePrisme, geometrieToile, pivotPorte, posePiece } from '@/lib/foxcad/geometrie'
import { clesMateriauPiece, porteeDesVariables, useTextureMateriau, type ClesMateriau, type LigneKms, type Portee, type TablesArticle } from '@/lib/foxcad/materiaux'
import { decorPieceFacade, enRougeSchema, estFacadeCoupee, estSurface, facadesMultipart, facesPieceFacade, facesPieceOrdinaire, indicesMultipart, renduFacadeMultipart, ROUGE_SCHEMA_FACADE, VARIABLE_TOILE_LOT, type DecorPiece, type FacadeMultipart, type FacesPieceFacade } from '@/lib/foxcad/multipart'
import type { PositionFoxCad } from '@/lib/foxcad/lot'
import { estErreur, type Piece, type ReponseCalculLot } from '@/lib/foxcad/types'
import { prepareAlbedo, useTextureWithFallback } from './useTextureWithFallback'
import { bancFlags, useBanc } from './banc/BancContext'
import { PoigneeFoxCad } from './PoigneeFoxCad'
import { echelleTexture } from '@/lib/textures/echelle'
import { signalerEchelle } from '@/lib/textures/magasin'

const MM = 1

/** la rotation autour de Y qui fait regarder une cellule vers sa face avant (`clickable`) — celle d'`ArticleInBox` */
const FACING_YAW: Record<string, number> = { FRONT: 0, RIGHT: Math.PI / 2, BACK: Math.PI, LEFT: -Math.PI / 2 }

/** la teinte des panneaux d'Otman sans texture (`CpPanel`) */
const TEINTE_SANS_TEXTURE = '#B8B2A7'
/** la teinte d'un bord nu sans texture de noyau servie (un MDF brut) */
const TEINTE_NOYAU = '#C9B79C'

type Props = {
  positions: PositionFoxCad[]
  reponse: ReponseCalculLot
  /** la portée globale du formulaire (les variables résolues), dernière portée où résoudre un `$MAT_…` */
  globalVars: Portee
  /** les boîtes que la caméra cache (une zone cadrée seule) */
  hiddenIndexes: ReadonlySet<string>
  /** les portes de cette boîte sont ouvertes (le bouton, la colonne choisie, la sélection) */
  doorOpenFor: (index: string) => boolean
  /** banc de rendu : les portes retirées */
  doorsRemoved?: boolean
  /** mode schéma : les arêtes noires */
  contrasted?: boolean
}

/**
 * LES PIÈCES DE FOX-CAD DANS LA SCÈNE D'OTMAN (B3 ①) : pour chaque position du lot, un groupe posé dans la boîte de sa zone — exactement comme
 * `ArticleInBox` pose le designer d'Otman : le centre de la boîte, la rotation de la face avant, puis le repère d'imos (x à droite, y vers
 * l'arrière, z en haut ; origine au coin avant-gauche-bas) par une rotation de −90° autour de X. Les pièces gardent les matériaux et textures
 * d'Otman (`materiaux.ts` : la matière servie par le moteur d'abord, `Piece.matiere`, sinon la chaîne par la définition). Les positions en
 * erreur ne dessinent rien : l'écran les nomme. Une FAÇADE MULTIPART (23/09, `multipart.ts`) — le parent `MP_1_FR_SHELL_…` et ses
 * sous-pièces — sort de la boucle des pièces : (b) quand chaque sous-pièce a un décor servi, `FacadeMultipartMesh` la dessine — le pourtour
 * du parent avec ses quatre chants (toute l'épaisseur de la pile), le cadre et le panneau texturés face par face (le décor de la surface
 * dessus / dessous, le chant collé avec ce décor — l'ABS assorti n'a pas de RENDER servi —, le bord nu avec le noyau), la surface
 * d'épaisseur 0 en plan visible avec la toile, une charnière et une poignée sur le parent ; (a) sinon rien n'est dessiné (ni la poignée) :
 * la porte du designer d'Otman reste, le compte reste à fox-cad, le badge dit pourquoi.
 */
export const FoxCadPieces = memo(function FoxCadPieces({ positions, reponse, globalVars, hiddenIndexes, doorOpenFor, doorsRemoved = false, contrasted = false }: Props) {
  // les tables du squelette (position 1) servent de repli aux cellules : leur `kms` est le plus complet
  const squelette = positions[0]?.article ?? ''
  const { data: donneesSquelette } = useGetArticleQuery(squelette, { skip: squelette === '' })
  const tablesSquelette = useMemo(() => tablesDe(donneesSquelette), [donneesSquelette])
  return (
    <>
      {positions.map((pos, i) => {
        const r = reponse.positions[i]
        if (!r || estErreur(r)) return null
        if (hiddenIndexes.has(pos.index)) return null
        return (
          <PositionMesh
            key={`${pos.ligne}-${pos.index}`}
            position={pos}
            pieces={r.pieces}
            tablesSquelette={tablesSquelette}
            globalVars={globalVars}
            ouverte={doorOpenFor(pos.index)}
            doorsRemoved={doorsRemoved}
            contrasted={contrasted}
          />
        )
      })}
    </>
  )
})

const tablesDe = (donnees: unknown): TablesArticle => {
  const d = (donnees ?? {}) as TablesArticle
  // 23/09 : les éléments (`anglelem`, le MANINFO de la porte) et les descripteurs servent à la hauteur de la poignée (`pose-poignee.ts`)
  return { kms: Array.isArray(d.kms) ? d.kms : [], variables: Array.isArray(d.variables) ? d.variables : [], anglelem: Array.isArray(d.anglelem) ? d.anglelem : [], descriptors: Array.isArray(d.descriptors) ? d.descriptors : [] }
}

const PositionMesh = memo(function PositionMesh({
  position,
  pieces,
  tablesSquelette,
  globalVars,
  ouverte,
  doorsRemoved,
  contrasted,
}: {
  position: PositionFoxCad
  pieces: Piece[]
  tablesSquelette: TablesArticle
  globalVars: Portee
  ouverte: boolean
  doorsRemoved: boolean
  contrasted: boolean
}) {
  const { data: donnees } = useGetArticleQuery(position.article)
  const tables = useMemo(() => tablesDe(donnees), [donnees])
  // les portées où résoudre `$MAT_…` : le PVarString du Set, les variables de l'article, celles du squelette, la portée globale du formulaire
  const portees = useMemo<Portee[]>(() => [position.lot, porteeDesVariables(tables.variables), porteeDesVariables(tablesSquelette.variables), globalVars], [position.lot, tables, tablesSquelette, globalVars])
  const kms = useMemo<LigneKms[][]>(() => [tables.kms ?? [], tablesSquelette.kms ?? []], [tables, tablesSquelette])

  const b = position.box
  const facing = position.facing ?? 'FRONT'
  const yaw = FACING_YAW[facing] ?? 0
  const sideways = facing === 'LEFT' || facing === 'RIGHT'
  const largeur = sideways ? b.d : b.w
  const profondeur = sideways ? b.w : b.d
  // 23/09 : les pièces d'une façade multipart (parent et sous-pièces) sortent de la boucle — dessinées par `FacadeMultipartMesh` quand fox-cad
  // le peut (b), laissées au designer d'Otman sinon (a, la règle d'attente) ; toujours dans le compte
  const multipart = useMemo(() => indicesMultipart(pieces), [pieces])
  const facades = useMemo(() => facadesMultipart(pieces), [pieces])
  return (
    <group position={[(b.x + b.w / 2) * MM, (b.y + b.h / 2) * MM, (b.z + b.d / 2) * MM]} rotation={[0, yaw, 0]} name={`fox-cad ${position.ligne} ${position.article}`}>
      <group position={[(-largeur / 2) * MM, (-b.h / 2) * MM, (profondeur / 2) * MM]} rotation={[-Math.PI / 2, 0, 0]}>
        {pieces.map((p, i) => {
          // B4 (22/09) : la pièce vide d'imos (PD_EMPTY, épaisseur 0) n'est pas dessinée — un plan de 0,01 mm faisait un voile sur les modules ; elle reste dans le compte
          if (estVide(p)) return null
          if (multipart.has(i)) return null
          const porte = estPorte(p)
          if (porte && doorsRemoved) return null
          return <PieceMesh key={i} id={`${position.ligne}:${i}`} p={p} kms={kms} portees={portees} tables={tables} article={position.article} ouverte={porte && ouverte} contrasted={contrasted} />
        })}
        {facades.map((f) => {
          if (doorsRemoved) return null
          if (!renduFacadeMultipart(f, pieces, position.lot).parFoxCad) return null
          return <FacadeMultipartMesh key={`mp-${f.index}`} id={`${position.ligne}:mp${f.index}`} facade={f} pieces={pieces} lot={position.lot} kms={kms} portees={portees} tables={tables} article={position.article} ouverte={ouverte} contrasted={contrasted} />
        })}
      </group>
    </group>
  )
})

/** une texture chargée seulement quand il y a une adresse (rien sinon : pas de repli), préparée comme toute texture de la scène */
function useTextureOptionnelle(url: string | null): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    if (!url) {
      setTex(null)
      return
    }
    let annule = false
    const maxAniso = gl.capabilities.getMaxAnisotropy()
    new THREE.TextureLoader().load(
      url,
      (t) => {
        if (annule) {
          t.dispose()
          return
        }
        setTex(prepareAlbedo(t, maxAniso))
      },
      undefined,
      () => {
        if (!annule) setTex(null)
      },
    )
    return () => {
      annule = true
    }
  }, [url, gl])
  useEffect(() => () => tex?.dispose(), [tex])
  return tex
}

/**
 * LA FAÇADE MULTIPART DESSINÉE PAR FOX-CAD (b, 23/09) : dans le groupe des charnières du PARENT (son pivot, sa poignée — la règle des portes),
 * le pourtour du parent (ses quatre chants sur toute l'épaisseur de la pile ; ses faces avant / arrière ne se dessinent pas, les sous-pièces
 * sont dedans), puis chaque sous-pièce à sa pose : le cadre et le panneau en boîtes texturées face par face, la surface d'épaisseur 0 en
 * plan visible avec la toile. Les faces confondues (le montant et la traverse au coin, le pourtour et le bord d'un montant) se départagent
 * par un décalage de polygone croissant avec le rang : le pourtour gagne, puis les montants, puis les traverses, puis le panneau.
 * LA FAÇADE COUPÉE (préparée la nuit du 23 au 24/09, ligne du lead 21:3x ② ; le moteur la servira après MD2) : le parent porte le contour de
 * la colonne sous rampant, ses sous-pièces les leurs — la traverse en pente à six coins, les montants en trapèze, le panneau et la toile
 * polygonaux. Même chemin, même matière que la façade plate : le pourtour devient les côtés du prisme du parent (sans ses faces), chaque
 * pièce de cadre un prisme dont chaque côté porte SON chant (le k-ième segment, la règle d'imos), la toile le polygone de son contour.
 */
const FacadeMultipartMesh = memo(function FacadeMultipartMesh({
  id,
  facade,
  pieces,
  lot,
  kms,
  portees,
  tables,
  article,
  ouverte,
  contrasted,
}: {
  id: string
  facade: FacadeMultipart
  pieces: Piece[]
  lot: Record<string, string>
  kms: LigneKms[][]
  portees: Portee[]
  tables: TablesArticle
  article: string
  ouverte: boolean
  contrasted: boolean
}) {
  const parent = facade.parent
  const rendu = useMemo(() => renduFacadeMultipart(facade, pieces, lot), [facade, pieces, lot])
  const cote = useMemo(() => coteCharnieres(parent), [parent])
  const charniere = useMemo(() => (cote ? pivotPorte(parent, cote) : null), [parent, cote])
  const corps = (
    <group name={`façade multipart ${facade.kms}`} userData={{ foxcad: true, multipart: facade.kms, cadre: rendu.cadre, toile: rendu.toile?.decor ?? null, toileSource: rendu.toile?.source ?? null, sousPieces: facade.sousPieces.length, coupee: estFacadeCoupee(facade) }}>
      <PieceMesh id={`${id}:pourtour`} p={parent} kms={kms} portees={portees} tables={tables} article={article} ouverte={false} contrasted={contrasted} dansFacade rang={0} decorImpose={rendu.cadre} sansFaces />
      {facade.sousPieces.map((j, k) => {
        const p = pieces[j]
        if (!p) return null
        if (estSurface(p)) return <ToileMesh key={j} id={`${id}:${j}`} p={p} decor={decorPieceFacade(p, lot)} contrasted={contrasted} />
        return <PieceMesh key={j} id={`${id}:${j}`} p={p} kms={kms} portees={portees} tables={tables} article={article} ouverte={false} contrasted={contrasted} dansFacade rang={1 + k} />
      })}
    </group>
  )
  if (!charniere || !cote) return corps
  return (
    <Charniere pivot={charniere.pivot} angle={ouverte ? charniere.angle : 0}>
      {corps}
      <PoigneeFoxCad p={parent} cote={cote} portees={portees} tables={tables} article={article} id={`${id}:poignee`} contrasted={contrasted} />
    </Charniere>
  )
})

/**
 * LA TOILE (b) : la surface d'épaisseur 0 de la façade (`SRF_FR_3_TOP_EEEE`, 2 294 × 541 × 0) dessinée en PLAN à sa pose, face avant vers
 * l'avant, avec le décor servi (`matiere.dessus`) ou, à défaut, la toile du lot (`SRF_FR_2_TOP`, le code de finition du Set) — la source est
 * dans le `userData`. Une surface sans décor ne se dessine pas ici : la façade entière reste alors à Otman (`renduFacadeMultipart`).
 */
function ToileMesh({ id, p, decor, contrasted }: { id: string; p: Piece; decor: DecorPiece; contrasted: boolean }) {
  const pose = useMemo(() => posePiece(p), [p])
  const cles = useMemo<ClesMateriau>(() => ({ matKey: null, surfKey: decor.decor, kmsTrouve: true, raison: decor.raison }), [decor])
  const texture = useTextureMateriau(cles)
  const tex = useTextureWithFallback(texture.textureUrl)
  const echelle = useMemo(() => echelleTexture(texture.render, texture.scalefakt), [texture.render, texture.scalefakt])
  // la façade coupée (après MD2) : la toile suit son contour — le pentagone sous le rampant ; sinon le rectangle
  const geometrie = useMemo(() => geometrieToile(p, echelle.mm), [p, echelle.mm])
  useEffect(() => () => geometrie.dispose(), [geometrie])
  useEffect(() => {
    if (!tex) return
    signalerEchelle(`piece:${id}`, echelle)
    return () => signalerEchelle(`piece:${id}`, null)
  }, [id, tex, echelle])
  const banc = useBanc()
  const flags = bancFlags(banc)
  // le schéma : la toile est un morceau de la façade, rouge plat comme les portes du designer (ROUGE_SCHEMA_FACADE)
  const rouge = contrasted || flags.schema
  return (
    <group position={pose.position} quaternion={pose.quaternion}>
      <mesh geometry={geometrie} name={p.nom} receiveShadow userData={{ foxcad: true, multipart: true, toile: true, contour: estContour(p) ? p.contour.length : 0, definition: p.definition ?? null, decor: decor.decor, decorSource: decor.source, variableLot: decor.source === 'lot' ? VARIABLE_TOILE_LOT : null, surface: texture.surfName, texture: echelle.texture, echelleMm: echelle.mm, echelleSource: echelle.source }}>
        {/* deux clés, comme PieceMesh : un matériau NEUF quand la texture arrive — mesuré le 23/09 15:0x, la même instance réutilisée gardait une couleur
            noire une fois `color` retirée (R3F remet une prop retirée à zéro, pas à sa valeur d'origine) : les trois toiles sortaient noires */}
        {rouge ? (
          <meshStandardMaterial key="rouge" color={ROUGE_SCHEMA_FACADE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        ) : tex ? (
          <meshStandardMaterial key="mapped" map={tex} color="#ffffff" roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        ) : (
          <meshStandardMaterial key="plain" color={contrasted ? '#D8D2C6' : TEINTE_SANS_TEXTURE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        )}
      </mesh>
    </group>
  )
}

const PieceMesh = memo(function PieceMesh({
  id,
  p,
  kms,
  portees,
  tables,
  article,
  ouverte,
  contrasted,
  dansFacade = false,
  rang = 0,
  decorImpose = null,
  sansFaces = false,
}: {
  id: string
  p: Piece
  kms: LigneKms[][]
  portees: Portee[]
  tables: TablesArticle
  article: string
  ouverte: boolean
  contrasted: boolean
  /** (b) une sous-pièce d'une façade multipart : ni charnière ni poignée à elle, ses six faces selon ses chants, un décalage de polygone par rang */
  dansFacade?: boolean
  rang?: number
  /** (b) le décor imposé (le pourtour du parent prend celui du cadre : l'ABS assorti n'a pas de RENDER servi) */
  decorImpose?: string | null
  /** (b) le pourtour : ses faces dessus / dessous ne se dessinent pas (les sous-pièces sont dedans) */
  sansFaces?: boolean
}) {
  const pose = useMemo(() => posePiece(p), [p])
  const cles = useMemo<ClesMateriau>(() => (decorImpose ? { matKey: null, surfKey: decorImpose, kmsTrouve: true, raison: null } : clesMateriauPiece(p, kms, portees)), [p, kms, portees, decorImpose])
  const texture = useTextureMateriau(cles)
  const tex = useTextureWithFallback(texture.textureUrl)
  // 24/09 (ligne du lead 23/09 06:3x ④) : une pièce ORDINAIRE dont le moteur sert les chants par côté — un bord nu montre son noyau, un chant
  // collé le décor de la face (le décor du chant n'est servi par aucune API de la page : `facesPieceOrdinaire`) ; sans chants servis, rien ne change
  const facesOrdinaires = useMemo<FacesPieceFacade | null>(() => (dansFacade ? null : facesPieceOrdinaire(p)), [dansFacade, p])
  // (b) le bord nu d'une sous-pièce de façade — et, depuis le 24/09, d'une pièce ordinaire chantée — montre son noyau
  const texNoyau = useTextureOptionnelle(dansFacade || facesOrdinaires ? texture.textureNoyauUrl : null)
  // (b) les faces d'une pièce de façade (`facesPieceFacade`, la règle de d1 du 23/09 16:3x) : une pièce À CONTOUR en prisme, chaque chant sur
  // son segment ; le pourtour d'un parent rectangle par les côtés de sa boîte ; une sous-pièce sans contour sans ses chants (côtés au noyau)
  const faces = useMemo<FacesPieceFacade | null>(() => (dansFacade ? facesPieceFacade(p, sansFaces) : facesOrdinaires), [dansFacade, p, sansFaces, facesOrdinaires])
  // nuit du 22 au 23/09 : la texture à l'ÉCHELLE RÉELLE — les UV de la pièce sont en mm / échelle (le `SCALEFAKT` du principe de couleur
  // d'imos par la table extraite ou par le rp-engine, sinon le défaut) ; la géométrie suit l'échelle, et la scène dit laquelle
  const echelle = useMemo(() => echelleTexture(texture.render, texture.scalefakt), [texture.render, texture.scalefakt])
  const geometrie = useMemo(
    // 24/09 : le fil que la pièce porte (`fil.angle` 90 → le long de son axe y), sur la boîte (`geometriePiece`) comme sur le prisme
    () => (faces?.geometrie === 'prisme' && estContour(p) ? geometriePrisme(p.contour, p.cotes.hauteur, echelle.mm, filLeLongDeY(p)) : geometriePiece(p, echelle.mm)),
    [p, echelle.mm, faces?.geometrie],
  )
  const aretes = useMemo(() => new THREE.EdgesGeometry(geometrie), [geometrie])
  useEffect(
    () => () => {
      geometrie.dispose()
      aretes.dispose()
    },
    [geometrie, aretes],
  )
  useEffect(() => {
    if (!tex) return
    signalerEchelle(`piece:${id}`, echelle)
    return () => signalerEchelle(`piece:${id}`, null)
  }, [id, tex, echelle])
  const banc = useBanc()
  const flags = bancFlags(banc)
  const schema = contrasted || flags.schema
  const showEdges = schema || banc.edges
  // le schéma : une porte, ou un morceau d'une façade multipart, en rouge plat comme les portes du designer (demande de d10, 23/09 19:2x)
  const rouge = schema && enRougeSchema(p, dansFacade)
  const cote = useMemo(() => (estPorte(p) ? coteCharnieres(p) : undefined), [p])
  const charniere = useMemo(() => (cote ? pivotPorte(p, cote) : null), [p, cote])

  const corps = (
    <group position={pose.position} quaternion={pose.quaternion}>
      <mesh
        // un maillage neuf quand le nombre de groupes change (boîte à 6, prisme à 2 + n côtés) : pas de matériau d'un autre groupe gardé
        key={faces ? `${faces.geometrie}-${faces.matieres.length}` : 'simple'}
        geometry={geometrie}
        name={p.nom}
        castShadow={!sansFaces}
        receiveShadow
        userData={{ foxcad: true, definition: p.definition ?? null, hierarchie: p.hierarchie ?? null, fil: p.fil ?? null, filY: filLeLongDeY(p), materiau: texture.matName, surface: texture.surfName, texture: echelle.texture, echelleMm: echelle.mm, echelleSource: echelle.source, ...(dansFacade && faces ? { multipart: true, rang, pourtour: sansFaces, geometrie: faces.geometrie, faces: faces.matieres, chantsDessines: faces.chants, contour: estContour(p) ? p.contour.length : 0, chants: p.chants ?? null, noyau: texture.renderNoyau } : {}), ...(!dansFacade && faces ? { geometrie: faces.geometrie, faces: faces.matieres, chantsDessines: faces.chants, chants: p.chants ?? null, noyau: texture.renderNoyau, decorChant: 'la face (le décor du chant n’est pas servi)' } : {}) }}
      >
        {faces ? (
          // (b) les faces de la boîte (+x, −x, +y, −y, +z, −z) ou du prisme (dessus, dessous, puis un groupe par côté) : le décor de la surface dessus /
          // dessous et sur un chant collé, le noyau sur un bord nu. Une clé PAR ÉTAT (texture arrivée ou non), comme `mapped` / `plain` plus bas :
          // réutiliser la même instance en retirant `color` la laisse NOIRE (R3F remet une prop retirée « à zéro » ; mesuré le 23/09 15:0x)
          faces.matieres.map((m, i) =>
            sansFaces && faces.faces.includes(i) ? (
              <meshStandardMaterial key={`${i}-x`} attach={`material-${i}`} visible={false} />
            ) : rouge ? (
              <meshStandardMaterial key={`${i}-r`} attach={`material-${i}`} color={ROUGE_SCHEMA_FACADE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} polygonOffset polygonOffsetFactor={rang} polygonOffsetUnits={rang} />
            ) : m === 'noyau' && !decorImpose ? (
              texNoyau ? (
                <meshStandardMaterial key={`${i}-n`} attach={`material-${i}`} map={texNoyau} color="#ffffff" roughness={0.9} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} polygonOffset polygonOffsetFactor={rang} polygonOffsetUnits={rang} />
              ) : (
                <meshStandardMaterial key={`${i}-np`} attach={`material-${i}`} color={TEINTE_NOYAU} roughness={0.9} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} polygonOffset polygonOffsetFactor={rang} polygonOffsetUnits={rang} />
              )
            ) : tex ? (
              <meshStandardMaterial key={`${i}-m`} attach={`material-${i}`} map={tex} color="#ffffff" roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} polygonOffset polygonOffsetFactor={rang} polygonOffsetUnits={rang} />
            ) : (
              <meshStandardMaterial key={`${i}-p`} attach={`material-${i}`} color={TEINTE_SANS_TEXTURE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} polygonOffset polygonOffsetFactor={rang} polygonOffsetUnits={rang} />
            ),
          )
        ) : rouge ? (
          <meshStandardMaterial key="rouge" color={ROUGE_SCHEMA_FACADE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        ) : tex ? (
          <meshStandardMaterial key="mapped" map={tex} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        ) : (
          <meshStandardMaterial key="plain" color={TEINTE_SANS_TEXTURE} roughness={banc.roughness} metalness={0} envMapIntensity={banc.envMapIntensity} wireframe={flags.wireframe} />
        )}
      </mesh>
      {showEdges && (
        <lineSegments geometry={aretes} raycast={() => null}>
          <lineBasicMaterial color="#000000" opacity={0.2} transparent />
        </lineSegments>
      )}
    </group>
  )
  // (b) une sous-pièce de façade : ni charnière ni poignée à elle — la façade entière tourne sur le pivot du parent
  if (dansFacade || !charniere || !cote) return corps
  // B4 ④ : la poignée d'Otman sur la porte, dans le groupe des charnières — elle s'ouvre avec la porte
  return (
    <Charniere pivot={charniere.pivot} angle={ouverte ? charniere.angle : 0}>
      {corps}
      <PoigneeFoxCad p={p} cote={cote} portees={portees} tables={tables} article={article} id={id} contrasted={contrasted} />
    </Charniere>
  )
})

/** la rotation d'une porte autour de l'arête de ses charnières (z du repère d'imos = la verticale), animée */
function Charniere({ pivot, angle, children }: { pivot: [number, number, number]; angle: number; children: React.ReactNode }) {
  const groupe = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [angle, invalidate])
  useFrame((_, delta) => {
    const g = groupe.current
    if (!g) return
    const ecart = angle - g.rotation.z
    if (Math.abs(ecart) < 0.002) {
      if (g.rotation.z !== angle) g.rotation.z = angle
      return
    }
    g.rotation.z += ecart * Math.min(1, delta * 8)
    invalidate()
  })
  return (
    <group position={pivot}>
      <group ref={groupe}>
        <group position={[-pivot[0], -pivot[1], -pivot[2]]}>{children}</group>
      </group>
    </group>
  )
}
