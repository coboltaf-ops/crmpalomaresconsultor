'use client'
import { useEffect } from 'react'

/**
 * Auto cache-bust: detecta versión nueva y fuerza reload. También invalida
 * el back-forward cache de Safari (bfcache) que es la causa más común
 * de "no se actualiza aunque despliegue".
 */
const KEY = 'crm-build-version'

export function useCacheBust(buildVersion: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1) Safari bfcache: cuando el usuario navega Atrás/Adelante, Safari
    //    restaura la página desde su caché interna SIN ejecutar JS de nuevo.
    //    Este listener detecta esa restauración y fuerza recarga.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Página servida desde bfcache → forzar reload limpio
        window.location.reload()
      }
    }
    window.addEventListener('pageshow', onPageShow)

    // 2) Solo registrar la versión actual en localStorage. NO hacemos reload
    //    automático porque genera una race condition con la hidratación del
    //    store de usuario (mandaba al usuario de vuelta al login).
    //    Si en el futuro hace falta forzar reload, hacerlo SOLO si user no es
    //    null y después de un delay >300ms para que zustand termine de hidratar.
    try {
      localStorage.setItem(KEY, buildVersion)
    } catch {
      // localStorage bloqueado: ignorar
    }

    return () => window.removeEventListener('pageshow', onPageShow)
  }, [buildVersion])
}

/** Devuelve la versión actual del build (visible en UI para debug). */
export function getBuildVersion(): string {
  return process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev'
}
