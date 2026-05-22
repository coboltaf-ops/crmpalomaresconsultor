'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetAllPage() {
  const router = useRouter()

  useEffect(() => {
    const doHardReset = async () => {
      // Limpiar TODOS los stores de Zustand y localStorage
      console.log('🔨 HARD RESET iniciado...')

      // Obtener TODAS las claves del localStorage
      const allKeys = Object.keys(localStorage)
      console.log(`🔑 Encontradas ${allKeys.length} claves en localStorage`)

      allKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`✓ Borrado: ${key}`)
      })

      // Limpiar sessionStorage completamente
      sessionStorage.clear()
      console.log('✓ Session storage limpiado')

      // Establecer el flag de no-autoseed
      localStorage.setItem('crm-no-autoseed', '1')
      console.log('✓ Auto-seed desactivado')

      // Llamar al hard-reset del servidor
      try {
        const res = await fetch('/api/hard-reset', { method: 'POST' })
        const data = await res.json()
        console.log('✓ Server hard-reset completado:', data)
      } catch (err) {
        console.error('⚠️ Error en server hard-reset:', err)
      }

      // Esperar un poco y redirigir
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('✅ LIMPIEZA COMPLETADA - El CRM está completamente vacío y listo para usar.')
      router.push('/login')
    }

    doHardReset()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a8a' }}>
      <div style={{ textAlign: 'center', color: '#ffffff' }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>🔨 HARD RESET en progreso...</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Borrando TODOS los datos del CRM (navegador y servidor)...</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 24 }}>Serás redirigido al login cuando termine...</p>
      </div>
    </div>
  )
}
