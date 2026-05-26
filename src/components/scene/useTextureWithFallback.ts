'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'

export const FALLBACK_TEXTURE_URL = '/textures/fallback-texture.jpg'

// Load `url`; on error (or no url), load `fallbackUrl`. Returns null until
// either resolves so the caller can keep the mesh mounted with a neutral material.
export function useTextureWithFallback (
  url: string | null,
  fallbackUrl: string = FALLBACK_TEXTURE_URL
): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    const apply = (t: THREE.Texture) => {
      if (cancelled) {
        t.dispose()
        return
      }
      t.colorSpace = THREE.SRGBColorSpace
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
  }, [url, fallbackUrl])

  useEffect(() => () => tex?.dispose(), [tex])

  return tex
}
