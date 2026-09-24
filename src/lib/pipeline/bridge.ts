'use client'

/**
 * Pont de capture — pipeline de rendu configurateur → Flora (Dorian, 2026-09-14,
 * étendu le 15/09 pour le plan de prises de vue).
 *
 * Le script de capture (`scripts/capture-pipeline.mjs`) pilote le viewer par
 * l'URL, puis parle à la page par `window.__oaks` :
 *
 *   await window.__oaks.ready()   // la vue est stable : plus rien ne charge et
 *                                 // la caméra a fini son déplacement
 *   window.__oaks.capture()       // PNG (data URL) DU CANVAS, pas de la page
 *   window.__oaks.fiche()         // la fiche JSON de la configuration rendue,
 *                                 // la vue, et — sous `?prise=` — la caméra
 *                                 // EFFECTIVE et les mesures de la géométrie
 *
 * Deux partis pris, tous les deux pour éviter une image fausse :
 *
 * 1. `capture()` lit le framebuffer (`toDataURL`), pas une copie d'écran. Ce qui
 *    entoure le canvas n'a donc aucune importance — seule sa TAILLE compte, et
 *    c'est la fenêtre du navigateur qui la fixe (2048×2048, densité 1).
 * 2. `ready()` est une question posée à la page, pas une attente de N secondes.
 *    Une attente fixe est soit trop courte — image floue, texture manquante,
 *    caméra encore en vol — soit gaspillée, et dans les deux cas elle ment en
 *    silence. Ici la page dit elle-même quand elle a fini.
 *
 * Le pont n'existe QUE sous `?capture=1` : hors de ce mode, aucune page du
 * configurateur n'expose quoi que ce soit sur `window`.
 */

export type Fiche = Record<string, unknown>

export type PriseEtat = {
  id: string
  /** « en attente de la géométrie », « posée », « impossible — raison ». */
  etat: string
  mesures: unknown
  camera: unknown
}

export type OaksBridge = {
  /** Version du contrat, pour que le script refuse une page trop ancienne. */
  version: number
  /** Résout `true` dès que la vue est stable, `false` au bout de `timeoutMs`. */
  ready: (timeoutMs?: number) => Promise<boolean>
  /** PNG du canvas en data URL, `null` si le canvas n'est pas (encore) là. */
  capture: () => string | null
  /** La fiche JSON de la configuration, `null` si elle n'est pas prête. */
  fiche: () => Fiche | null
  /** De quoi diagnostiquer un `ready()` qui n'arrive pas. */
  etat: () => {
    stable: boolean
    canvas: boolean
    fiche: boolean
    /** État de la prise de vue demandée par `?prise=`, ou null. */
    prise: string | null
    /** Ce qu'on attend encore, en clair. */
    attente: string
  }
}

declare global {
  interface Window {
    __oaks?: OaksBridge
  }
}

const VERSION = 2

let stable = false
let captureFn: (() => string | null) | null = null
let ficheFn: (() => Fiche) | null = null
let vueFn: (() => Fiche) | null = null
let priseFn: (() => PriseEtat) | null = null

/** `?capture=1` — lu à la demande, jamais pendant le rendu serveur. */
export function isCaptureMode (): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('capture') === '1'
}

/** `?prise=<id>` — la prise du plan demandée, ou null. */
export function priseDemandee (): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('prise')
}

/** Appelé par la scène 3D à chaque changement d'état de stabilité. */
export function setStable (value: boolean): void {
  stable = value
}

/** Le canvas s'enregistre ici une fois monté. */
export function setCapture (fn: (() => string | null) | null): void {
  captureFn = fn
}

/** Le configurateur enregistre ici la configuration (valeurs, libellés, prix). */
export function setFiche (fn: (() => Fiche) | null): void {
  ficheFn = fn
}

/** Les valeurs du formulaire, pour ce qui doit les lire dans la scène (colonnes, fonctions). */
export function valeursCourantes (): Record<string, string> {
  const f = ficheFn?.()
  const v = f?.valeurs
  return v && typeof v === 'object' ? (v as Record<string, string>) : {}
}

/**
 * Le viewer enregistre ici la vue réellement rendue : preset, mode, portes,
 * cotes, focale, hauteur d'œil, encombrement. C'est la moitié que le
 * configurateur ne connaît pas — et c'est elle que Flora doit recevoir, parce
 * qu'une image sans son cadrage n'est pas reproductible.
 */
export function setVue (fn: (() => Fiche) | null): void {
  vueFn = fn
}

/** Le rig de prise de vue publie ici la caméra effective et les mesures. */
export function setPrise (fn: (() => PriseEtat) | null): void {
  priseFn = fn
}

function attente (): string {
  if (!captureFn) return 'le canvas 3D n est pas monté'
  const p = priseFn?.()
  if (p && p.etat !== 'posée' && !p.etat.startsWith('impossible')) return `prise ${p.id} : ${p.etat}`
  if (!stable) return 'la vue bouge encore (chargement ou caméra en vol)'
  if (!ficheFn) return 'la fiche JSON n est pas renseignée'
  return ''
}

/**
 * Installe `window.__oaks`. Idempotent : un remontage React ne crée pas un
 * second pont, sans quoi le script pourrait tenir une référence morte.
 */
export function installBridge (): void {
  if (typeof window === 'undefined') return

  window.__oaks = {
    version: VERSION,
    capture: () => captureFn?.() ?? null,
    // Les moitiés sont assemblées à la lecture, jamais stockées fusionnées :
    // la vue et la prise changent à chaque photo, la configuration non.
    fiche: () => {
      const config = ficheFn?.()
      const vue = vueFn?.()
      const prise = priseFn?.()
      if (!config && !vue) return null
      return { ...(config ?? {}), vue: vue ?? null, prise: prise ?? null }
    },
    etat: () => {
      const p = priseFn?.()
      return {
        stable,
        canvas: Boolean(captureFn),
        fiche: Boolean(ficheFn),
        prise: p ? p.etat : null,
        attente: attente()
      }
    },
    ready: (timeoutMs = 45_000) =>
      new Promise<boolean>(resolve => {
        const debut = Date.now()
        const voir = () => {
          // La fiche ne conditionne pas `ready` : une vue peut être prête à
          // photographier avant que le formulaire ait fini de publier ses
          // libellés, et le script relit la fiche après coup. Une prise, elle,
          // doit être posée (ou déclarée impossible) avant la photo.
          const p = priseFn?.()
          const priseOk = !p || p.etat === 'posée' || p.etat.startsWith('impossible')
          if (stable && captureFn && priseOk) return resolve(true)
          if (Date.now() - debut > timeoutMs) return resolve(false)
          setTimeout(voir, 100)
        }
        voir()
      })
  }
}
