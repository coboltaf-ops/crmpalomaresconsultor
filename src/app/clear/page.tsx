'use client'
import { useEffect } from 'react'

export default function ClearPage() {
  useEffect(() => {
    // Borrar TODO
    localStorage.clear()
    sessionStorage.clear()

    // Borrar IndexedDB
    if (window.indexedDB) {
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => { if (db.name) indexedDB.deleteDatabase(db.name) })
      })
    }

    // Redirigir a login
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }, [])

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>🗑️ Limpiando CRM...</h1>
      <p>Borrando TODOS los datos...</p>
      <p style={{ fontSize: '12px', color: '#666' }}>Serás redirigido a login en 1 segundo</p>
    </div>
  )
}
