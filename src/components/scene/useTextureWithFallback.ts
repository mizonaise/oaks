'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export const FALLBACK_TEXTURE_URL = '/textures/fallback-texture.jpg'

/**
 * Colour pipeline for an albedo texture (banc de rendu 2026-09-10):
 * sRGB colour space (a JPEG read as linear renders washed out), anisotropic
 * filtering so wood grain seen at an angle stays sharp, repeat wrapping so the
 * caller can tile at real size, and mipmaps.
 */
export function prepareAlbedo (t: THREE.Texture, maxAnisotropy: number): THREE.Texture {
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = Math.min(16, maxAnisotropy || 1)
  // Nuit du 22 au 23/09 (d5) : la répétition en MIROIR — les images IVIS du CDN (512 × 512) ne sont pas raccordables : en répétition
  // simple, une porte de 2 340 mm à 1 000 mm par tuile montre un trait net tous les mètres (mesuré, `apres-repetition-simple/`) ; en
  // miroir, chaque tuile est le reflet de la précédente et le raccord est continu. Le facteur d'échelle (mm par tuile) ne change pas.
  t.wrapS = THREE.MirroredRepeatWrapping
  t.wrapT = THREE.MirroredRepeatWrapping
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.magFilter = THREE.LinearFilter
  t.needsUpdate = true
  return t
}

// Load `url`; on error (or no url), load `fallbackUrl`. Returns null until
// either resolves so the caller can keep the mesh mounted with a neutral material.
export function useTextureWithFallback (
  url: string | null,
  fallbackUrl: string = FALLBACK_TEXTURE_URL
): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const gl = useThree(s => s.gl)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    const maxAniso = gl.capabilities.getMaxAnisotropy()
    const apply = (t: THREE.Texture) => {
      if (cancelled) {
        t.dispose()
        return
      }
      prepareAlbedo(t, maxAniso)
      setTex(t)
    }
    const loadFallback = () =>
      loader.load(fallbackUrl, apply, undefined, () => {
        if (!cancelled) setTex(null)
      })
    if (!url) {
      loadFallback()
    } else {
      loader.load(url, apply, undefined, loadFallback)
    }
    return () => {
      cancelled = true
    }
  }, [url, fallbackUrl, gl])

  useEffect(() => () => tex?.dispose(), [tex])

  return tex
}
