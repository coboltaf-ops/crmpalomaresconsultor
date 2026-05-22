'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetAllPage() {
  const router = useRouter()

  useEffect(() => {
    // Limpiar todos los stores de Zustand
    const keys = [
      'clientes-store',
      'contactos-store',
      'cotizaciones-store',
      'oportunidades-store',
      'pqrs-store',
      'productos-store',
      'referencias-store',
      'usuarios-store',
      'modulos-store',
      'empresa-store',
      'tareas-store',
      'prospectos-store',
      'lineas-servicio-store',
      'centros-costo-store',
      'contratos-store',
      'personal-store',
    ]

    console.log('🧹 Borrando datos...')
    keys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`✓ Borrado: ${key}`)
    })

    // Desactivar el auto-seed para evitar que se carguen datos automáticamente
    localStorage.setItem('crm-no-autoseed', '1')
    console.log('✓ Auto-seed desactivado')

    // También borrar cache de asistente
    sessionStorage.clear()
    console.log('✓ Session storage limpiado')

    alert('✅ Todos los datos han sido borrados. El CRM está vacío y listo para tu uso.')
    router.push('/login')
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a8a' }}>
      <div style={{ textAlign: 'center', color: '#ffffff' }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>🧹 Limpiando datos...</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Espera un momento, estamos borrando todos los datos de demostración.</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 24 }}>Serás redirigido al login en segundos...</p>
      </div>
    </div>
  )
}
