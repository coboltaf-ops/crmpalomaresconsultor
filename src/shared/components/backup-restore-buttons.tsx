'use client'
import { useEffect, useState } from 'react'

interface BackupMeta {
  id: string
  fecha: string
  hora: string
  total: number
}

interface BackupRestoreButtonsProps<T> {
  /** Identificador del módulo (ej: 'clientes', 'contactos'). Se usa como clave en el almacén. */
  modulo: string
  /** Etiqueta legible para el usuario (ej: 'Empresas', 'Contactos'). */
  label: string
  /** Registros actuales del módulo. */
  registros: T[]
  /** Acción para borrar todo del store local. */
  onClear: () => void
  /** Acción para restaurar registros al store local (reemplaza el array completo). */
  onRestore: (registros: T[]) => void
}

const btnStyle: React.CSSProperties = {
  padding: '10px 16px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
  fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
}

export default function BackupRestoreButtons<T>({ modulo, label, registros, onClear, onRestore }: BackupRestoreButtonsProps<T>) {
  const [loading, setLoading] = useState(false)
  const [showList, setShowList] = useState(false)
  const [backups, setBackups] = useState<BackupMeta[]>([])
  const [loadingBackups, setLoadingBackups] = useState(false)

  // ── Eliminar datos y guardar copia ──
  const eliminarYGuardar = async () => {
    if (!registros.length) {
      alert(`No hay datos en ${label} para guardar.`)
      return
    }
    const ok = confirm(
      `¿Estás seguro?\n\nVamos a:\n` +
      `1) Guardar una copia de los ${registros.length} registros de ${label} en el respaldo del CRM\n` +
      `2) Borrar todos los registros de ${label} de este dispositivo\n\n` +
      `Después podrás recuperarlos con el botón "Recargar datos".`
    )
    if (!ok) return

    setLoading(true)
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo, registros }),
      })
      if (!res.ok) throw new Error('Error al guardar backup')
      const data = await res.json()
      onClear()
      // Bloquea el auto-seed para que no vuelva a meter datos demo
      if (typeof window !== 'undefined') {
        localStorage.setItem('crm-no-autoseed', '1')
      }
      alert(`✅ Listo.\n\n• Copia guardada: ${data.fecha} ${data.hora}\n• ${data.total} registros respaldados\n• ${label} ahora está vacío en este dispositivo`)
    } catch (err) {
      console.error('[backup] error:', err)
      alert(`❌ Error al guardar backup: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const cargarLista = async () => {
    setLoadingBackups(true)
    try {
      const res = await fetch(`/api/backups?modulo=${encodeURIComponent(modulo)}`)
      const data = await res.json()
      setBackups(data.backups || [])
    } catch (err) {
      console.error('[backup] error listando:', err)
      setBackups([])
    } finally {
      setLoadingBackups(false)
    }
  }

  useEffect(() => {
    if (showList) cargarLista()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showList])

  // ── Restaurar un backup específico ──
  const restaurar = async (id: string) => {
    if (!confirm(
      `Esto reemplazará los ${registros.length} registros actuales de ${label} con los del backup seleccionado. ¿Continuar?`
    )) return
    setLoading(true)
    try {
      const res = await fetch(`/api/backups/${encodeURIComponent(id)}?modulo=${encodeURIComponent(modulo)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar backup')
      onRestore(data.registros as T[])
      setShowList(false)
      alert(`✅ Restaurados ${data.total} registros de ${label} (backup del ${data.fecha} ${data.hora})`)
    } catch (err) {
      console.error('[backup] error restaurando:', err)
      alert(`❌ Error al restaurar: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const eliminarBackup = async (id: string) => {
    if (!confirm('¿Eliminar definitivamente este backup del CRM?')) return
    try {
      await fetch(`/api/backups/${encodeURIComponent(id)}?modulo=${encodeURIComponent(modulo)}`, { method: 'DELETE' })
      cargarLista()
    } catch (err) {
      console.error('[backup] error eliminando:', err)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={eliminarYGuardar} disabled={loading}
          title="Guarda una copia en el CRM y borra los datos de este dispositivo"
          style={{ ...btnStyle, background: '#dc2626', color: '#fff', borderColor: '#ef4444', fontWeight: 800, boxShadow: '0 2px 8px rgba(220,38,38,0.4)', opacity: loading ? 0.6 : 1 }}>
          🗑 Eliminar datos y guardar
        </button>
        <button type="button" onClick={() => setShowList(true)} disabled={loading}
          title="Ver respaldos guardados y restaurar"
          style={{ ...btnStyle, background: '#2563eb', color: '#fff', borderColor: '#3b82f6', fontWeight: 800, boxShadow: '0 2px 8px rgba(37,99,235,0.4)', opacity: loading ? 0.6 : 1 }}>
          📂 Recargar datos
        </button>
      </div>

      {showList && (
        <div onClick={() => setShowList(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#0f1b3d', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 16, padding: 24, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>📂 Respaldos de {label}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Selecciona uno para restaurar los datos de este dispositivo</p>
              </div>
              <button onClick={() => setShowList(false)}
                style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', padding: '6px 12px', fontSize: 12 }}>
                ✕ Cerrar
              </button>
            </div>

            {loadingBackups ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: 40 }}>Cargando…</p>
            ) : backups.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 40, fontSize: 14 }}>
                No hay respaldos guardados de {label}.<br /><br />
                Usa el botón &quot;🗑 Eliminar datos y guardar&quot; para crear el primero.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {backups.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>📅 {b.fecha} · 🕐 {b.hora}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{b.total} registro{b.total === 1 ? '' : 's'}</p>
                    </div>
                    <button onClick={() => restaurar(b.id)} disabled={loading}
                      style={{ ...btnStyle, background: 'rgba(34,197,94,0.2)', color: '#86efac', borderColor: 'rgba(34,197,94,0.4)', padding: '6px 12px', fontSize: 12 }}>
                      ↻ Restaurar
                    </button>
                    <button onClick={() => eliminarBackup(b.id)}
                      title="Borrar este backup del CRM"
                      style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.4)', padding: '6px 10px', fontSize: 12 }}>
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 16, textAlign: 'center' }}>
              Se guardan hasta los 20 respaldos más recientes por módulo.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
