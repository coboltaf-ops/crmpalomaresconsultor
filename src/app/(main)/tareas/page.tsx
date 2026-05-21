'use client'
import { logAudit, computarDiff } from '@/shared/lib/audit'
import { useState } from 'react'
import { useTareasStore, Tarea } from '@/features/tareas/store/tareas-store'
import { useCurrentUserStore } from '@/features/usuarios-gestion/store/current-user-store'
import { usePersonalStore } from '@/features/personal/store/personal-store'
import { nextConsecutivo } from '@/shared/lib/consecutivo'
import { usePermisos } from '@/shared/hooks/use-permisos'
import SeguimientoPanel from '@/shared/components/seguimiento-panel'
import DocumentosPanel from '@/shared/components/documentos-panel'
import ReportPanel from '@/shared/components/report-panel'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'

function todayCO() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) }
function fDate(d: string) { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}` }

const emptyTarea = (codigo: string): Tarea => ({
  id: '', codigo, fecha_asignacion: todayCO(), hora_asignacion: '',
  persona_asigna: '', persona_ejecuta: '', fecha_requerida_fin: '', fecha_real_fin: '',
  descripcion: '', situacion: 'Pendiente', fecha_registro: todayCO(), seguimientos: [],
})

const colorMap: Record<string, { bg: string; bgIntense: string; color: string; colorIntense: string; border: string; cardBg: string; cardBorder: string }> = {
  yellow: { bg: 'rgba(234,179,8,0.15)', bgIntense: 'rgba(234,179,8,0.35)', color: '#eab308', colorIntense: '#fde047', border: 'rgba(234,179,8,0.5)', cardBg: 'rgba(234,179,8,0.18)', cardBorder: 'rgba(234,179,8,0.45)' },
  blue:   { bg: 'rgba(59,130,246,0.15)', bgIntense: 'rgba(59,130,246,0.35)', color: '#60a5fa', colorIntense: '#93c5fd', border: 'rgba(59,130,246,0.5)', cardBg: 'rgba(59,130,246,0.18)', cardBorder: 'rgba(59,130,246,0.45)' },
  green:  { bg: 'rgba(34,197,94,0.15)', bgIntense: 'rgba(34,197,94,0.35)', color: '#22c55e', colorIntense: '#86efac', border: 'rgba(34,197,94,0.5)', cardBg: 'rgba(34,197,94,0.18)', cardBorder: 'rgba(34,197,94,0.45)' },
  gray:   { bg: 'rgba(156,163,175,0.15)', bgIntense: 'rgba(156,163,175,0.35)', color: '#9ca3af', colorIntense: '#d1d5db', border: 'rgba(156,163,175,0.5)', cardBg: 'rgba(156,163,175,0.18)', cardBorder: 'rgba(156,163,175,0.45)' },
  red:    { bg: 'rgba(239,68,68,0.15)', bgIntense: 'rgba(239,68,68,0.35)', color: '#ef4444', colorIntense: '#fca5a5', border: 'rgba(239,68,68,0.5)', cardBg: 'rgba(239,68,68,0.18)', cardBorder: 'rgba(239,68,68,0.45)' },
}

type Vista = 'lista' | 'form' | 'detalle'
type VistaLista = 'tabla' | 'kanban'

export default function TareasPage() {
  const user = useCurrentUserStore(s => s.user)
  const permisos = usePermisos('tareas')
  const { tareas, situaciones, addTarea, updateTarea, deleteTarea } = useTareasStore()
  const personalEmpresa = usePersonalStore(s => s.personal).filter(p => p.situacion === 'Activo')

  const [vista, setVista] = useState<Vista>('lista')
  const [vistaLista, setVistaLista] = useState<VistaLista>('tabla')
  const [selected, setSelected] = useState<Tarea | null>(null)
  const [viewDetail, setViewDetail] = useState<Tarea | null>(null)
  const [search, setSearch] = useState('')
  const [filtroSituacion, setFiltroSituacion] = useState('')

  // Kanban drag
  const [dragId, setDragId] = useState<string | null>(null)

  if (!user) return null

  const personas = personalEmpresa.map(p => `${p.nombre} ${p.apellido}`)

  // Styles
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }
  const inputStyle: React.CSSProperties = { padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44, width: '100%' }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 14, fontWeight: 800, marginBottom: 6, display: 'block' }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }

  const situacionBadge = (sit: string): React.CSSProperties => {
    const s = situaciones.find(s => s.nombre === sit)
    const c = colorMap[s?.color || 'gray'] || colorMap.gray
    return { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, display: 'inline-block' }
  }

  const filtered = tareas.filter(t => {
    if (filtroSituacion && t.situacion !== filtroSituacion) return false
    if (search) {
      const s = search.toLowerCase()
      return t.codigo.toLowerCase().includes(s) || t.descripcion.toLowerCase().includes(s) || t.persona_ejecuta.toLowerCase().includes(s) || t.persona_asigna.toLowerCase().includes(s)
    }
    return true
  }).sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro))

  const auditParams = () => ({
    usuario: user?.usuario || 'desconocido',
    usuario_nombre: `${user?.nombre || ''} ${user?.apellido || ''}`.trim(),
    rol: user?.rol || '',
    modulo: 'tareas',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (!selected.persona_asigna || !selected.persona_ejecuta || !selected.fecha_requerida_fin || !selected.descripcion) {
      alert('Complete los campos obligatorios'); return
    }
    const esNueva = !selected.id
    const tareaFinal = esNueva ? { ...selected, id: crypto.randomUUID() } : selected

    if (esNueva) {
      addTarea(tareaFinal); logAudit({ ...auditParams(), accion: "CREAR", registro_codigo: selected.codigo, registro_nombre: selected.descripcion })
      // Enviar correo al ejecutor
      const ejecutor = personalEmpresa.find(p => `${p.nombre} ${p.apellido}` === selected.persona_ejecuta && p.correo)
      if (ejecutor?.correo) {
        try {
          await fetch('/api/send-tarea-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: ejecutor.correo,
              nombre_ejecuta: selected.persona_ejecuta,
              codigo: selected.codigo,
              descripcion: selected.descripcion,
              fecha_requerida: selected.fecha_requerida_fin,
              persona_asigna: selected.persona_asigna,
            }),
          })
        } catch { /* no bloquear si falla el email */ }
      }
    } else {
      const _anterior = tareas.find(x => x.id === selected.id); updateTarea(selected.id, selected); logAudit({ ...auditParams(), accion: "MODIFICAR", registro_codigo: selected.codigo, registro_nombre: selected.descripcion, detalle: computarDiff(_anterior as unknown as Record<string, unknown>, selected as unknown as Record<string, unknown>) })
    }
    setSelected(null)
    setVista('lista')
  }

  const handleDrop = (situacionNombre: string) => {
    if (!dragId) return
    updateTarea(dragId, { situacion: situacionNombre })
    setDragId(null)
  }

  // ═══════════ DETALLE ═══════════
  if (vista === 'detalle' && viewDetail) {
    const fields = [
      { label: 'Código', value: viewDetail.codigo },
      { label: 'Fecha Asignación', value: fDate(viewDetail.fecha_asignacion) },
      { label: 'Hora', value: viewDetail.hora_asignacion || '—' },
      { label: 'Persona Asigna', value: viewDetail.persona_asigna },
      { label: 'Persona Ejecuta', value: viewDetail.persona_ejecuta },
      { label: 'Fecha Requerida Fin', value: fDate(viewDetail.fecha_requerida_fin) },
      { label: 'Fecha Real Fin', value: fDate(viewDetail.fecha_real_fin) },
      { label: 'Situación', value: viewDetail.situacion },
      { label: 'Fecha Registro', value: fDate(viewDetail.fecha_registro) },
    ]
    return (
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setViewDetail(null); setVista('lista') }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333' }}>← Volver</button>
          {permisos.editar && viewDetail.situacion !== 'Completada' && viewDetail.situacion !== 'Cancelada' && (
            <button onClick={() => { setSelected(viewDetail); setVista('form') }} style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>Editar</button>
          )}
          {permisos.eliminar && (
            <button onClick={() => { if (confirm('¿Eliminar tarea?')) { deleteTarea(viewDetail.id); setViewDetail(null); setVista('lista') } }}
              style={{ ...btnStyle, background: '#dc2626', color: '#fff', border: '1px solid #ef4444' }}>Eliminar</button>
          )}
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>{viewDetail.codigo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>{viewDetail.descripcion.slice(0, 80)}{viewDetail.descripcion.length > 80 ? '...' : ''}</p>
            </div>
            <span style={situacionBadge(viewDetail.situacion)}>{viewDetail.situacion}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            {fields.map(f => (
              <div key={f.label}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>{f.label}</p>
                <p style={{ color: '#fff', fontSize: 14 }}>{f.value}</p>
              </div>
            ))}
          </div>
          {viewDetail.descripcion && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>Descripción</p>
              <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{viewDetail.descripcion}</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <SeguimientoPanel
            seguimientos={viewDetail.seguimientos}
            usuario={`${user.nombre} ${user.apellido}`}
            situacionActual={viewDetail.situacion}
            situacionOpciones={situaciones.filter(s => s.nombre !== viewDetail.situacion).map(s => s.nombre)}
            onAdd={(updated) => {
              updateTarea(viewDetail.id, updated)
              setViewDetail({ ...viewDetail, ...updated })
            }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <DocumentosPanel modulo="tareas" registroId={viewDetail.id} />
        </div>
      </div>
    )
  }

  // ═══════════ FORMULARIO ═══════════
  if (vista === 'form' && selected) {
    return (
      <div>
        <button onClick={() => { setSelected(null); setVista('lista') }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Cancelar</button>
        <form onSubmit={handleSave} style={cardStyle}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? 'Editar' : 'Nueva'} Tarea</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={selected.codigo} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Asignación *</label>
              <input type="date" value={selected.fecha_asignacion} onChange={e => setSelected({ ...selected, fecha_asignacion: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hora Asignación</label>
              <input type="time" value={selected.hora_asignacion} onChange={e => setSelected({ ...selected, hora_asignacion: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Persona que Asigna *</label>
              <select value={selected.persona_asigna} onChange={e => setSelected({ ...selected, persona_asigna: e.target.value })} required style={inputStyle}>
                <option value="">Seleccionar...</option>
                {personas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Persona que Ejecuta *</label>
              <select value={selected.persona_ejecuta} onChange={e => setSelected({ ...selected, persona_ejecuta: e.target.value })} required style={inputStyle}>
                <option value="">Seleccionar...</option>
                {personas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha Requerida Fin *</label>
              <input type="date" value={selected.fecha_requerida_fin} onChange={e => setSelected({ ...selected, fecha_requerida_fin: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Real Fin</label>
              <input type="date" value={selected.fecha_real_fin} onChange={e => setSelected({ ...selected, fecha_real_fin: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Situación *</label>
              <select value={selected.situacion} onChange={e => setSelected({ ...selected, situacion: e.target.value })} required style={inputStyle}>
                {situaciones.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
              </select>
            </div>
            <div />
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Descripción *</label>
              <textarea value={selected.descripcion} onChange={e => setSelected({ ...selected, descripcion: e.target.value.toUpperCase() })} required rows={4}
                placeholder="Describa la tarea con detalle..."
                style={{ ...inputUpper, resize: 'vertical', minHeight: 100 }} />
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="submit" style={{ ...btnStyle, background: '#22c55e', color: '#fff', border: '1px solid #16a34a' }}>
              {selected.id ? 'Actualizar' : 'Guardar'} Tarea
            </button>
            <button type="button" onClick={() => { setSelected(null); setVista('lista') }} style={{ ...btnStyle, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ═══════════ KANBAN ═══════════
  const KanbanView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${situaciones.length}, 1fr)`, gap: 12, minHeight: 400 }}>
      {situaciones.map(sit => {
        const tareasCol = tareas.filter(t => t.situacion === sit.nombre).sort((a, b) => b.fecha_registro.localeCompare(a.fecha_registro))
        const c = colorMap[sit.color] || colorMap.gray
        return (
          <div key={sit.id}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(sit.nombre)}
            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10, border: `1px solid ${c.border}`, minHeight: 300 }}>
            {/* Column header — color intenso de la situación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '10px 12px', background: c.bgIntense, borderRadius: 8, border: `1px solid ${c.border}` }}>
              <span style={{ color: c.colorIntense, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{sit.nombre}</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, background: c.color, padding: '3px 10px', borderRadius: 12 }}>{tareasCol.length}</span>
            </div>
            {/* Cards — fondo según situación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tareasCol.map(t => {
                const labelKanban: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 }
                const valueKanban: React.CSSProperties = { color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.3 }
                return (
                <div key={t.id} draggable
                  onDragStart={() => setDragId(t.id)}
                  onClick={() => { setViewDetail(t); setVista('detalle') }}
                  style={{ background: c.cardBg, borderRadius: 10, padding: 12, border: `1px solid ${c.cardBorder}`, cursor: 'grab', transition: 'transform 0.15s' }}>
                  {/* Header: código */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${c.cardBorder}` }}>
                    <span style={{ color: c.colorIntense, fontSize: 13, fontWeight: 900 }}>{t.codigo}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>⋮⋮</span>
                  </div>

                  {/* Detalle */}
                  <div style={{ marginBottom: 8 }}>
                    <p style={labelKanban}>📝 Detalle de la tarea</p>
                    <p style={{ ...valueKanban, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{t.descripcion || '—'}</p>
                  </div>

                  {/* Fechas — grid 2 cols */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={labelKanban}>📅 Fecha Solicitud</p>
                      <p style={valueKanban}>{t.fecha_registro ? fDate(t.fecha_registro) : '—'}</p>
                    </div>
                    <div>
                      <p style={labelKanban}>⏳ Fecha a Terminar</p>
                      <p style={{ ...valueKanban, color: c.colorIntense }}>{t.fecha_requerida_fin ? fDate(t.fecha_requerida_fin) : '—'}</p>
                    </div>
                  </div>

                  {/* Personas — grid 2 cols */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <p style={labelKanban}>👔 Persona que Asigna</p>
                      <p style={valueKanban}>{t.persona_asigna || '—'}</p>
                    </div>
                    <div>
                      <p style={labelKanban}>👤 Persona que Ejecuta</p>
                      <p style={valueKanban}>{t.persona_ejecuta || '—'}</p>
                    </div>
                  </div>
                </div>
                )
              })}
              {tareasCol.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', padding: 20 }}>Sin tareas</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Stats
  const stats = [
    { label: 'Total', value: tareas.length, color: '#3b82f6' },
    { label: 'Pendientes', value: tareas.filter(t => t.situacion === 'Pendiente').length, color: '#eab308' },
    { label: 'En Proceso', value: tareas.filter(t => t.situacion === 'En Proceso').length, color: '#60a5fa' },
    { label: 'Completadas', value: tareas.filter(t => t.situacion === 'Completada').length, color: '#22c55e' },
  ]

  // Report columns
  const reportColumns = [
    { header: 'Código', key: 'codigo', width: 12 },
    { header: 'Asigna', key: 'persona_asigna', width: 18 },
    { header: 'Ejecuta', key: 'persona_ejecuta', width: 18 },
    { header: 'F. Requerida', key: 'fecha_requerida', width: 12 },
    { header: 'Descripción', key: 'descripcion', width: 28 },
    { header: 'Situación', key: 'situacion', width: 12 },
  ]
  const reportRows = filtered.map(t => ({
    codigo: t.codigo, persona_asigna: t.persona_asigna, persona_ejecuta: t.persona_ejecuta,
    fecha_requerida: fDate(t.fecha_requerida_fin), descripcion: t.descripcion.slice(0, 60), situacion: t.situacion,
  }))
  const reportFilters = [
    { label: 'Situación', key: 'situacion', options: situaciones.map(s => s.nombre) },
    { label: 'Ejecuta', key: 'persona_ejecuta', options: [...new Set(tareas.map(t => t.persona_ejecuta).filter(Boolean))] },
  ]

  // ═══════════ LISTA PRINCIPAL ═══════════
  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="tareas"
          label="Tareas"
          registros={tareas}
          onClear={() => useTareasStore.setState({ tareas: [] })}
          onRestore={(rs) => useTareasStore.setState({ tareas: rs })}
        />
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Tareas</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Gestión de tareas y asignaciones</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Toggle vista */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <button onClick={() => setVistaLista('tabla')}
              style={{ ...btnStyle, borderRadius: 0, background: vistaLista === 'tabla' ? 'rgba(59,130,246,0.3)' : 'transparent', color: vistaLista === 'tabla' ? '#60a5fa' : 'rgba(255,255,255,0.5)', border: 'none', padding: '8px 14px', fontSize: 12 }}>
              Tabla
            </button>
            <button onClick={() => setVistaLista('kanban')}
              style={{ ...btnStyle, borderRadius: 0, background: vistaLista === 'kanban' ? 'rgba(59,130,246,0.3)' : 'transparent', color: vistaLista === 'kanban' ? '#60a5fa' : 'rgba(255,255,255,0.5)', border: 'none', padding: '8px 14px', fontSize: 12 }}>
              Kanban
            </button>
          </div>
          {permisos.editar && (
            <>
              <button onClick={() => {
                if (!confirm('Esto agregará 6 tareas de ejemplo (2 en proceso, 2 completadas, 2 vencidas). ¿Continuar?')) return
                const hoy = new Date()
                const offset = (dias: number) => {
                  const d = new Date(hoy)
                  d.setDate(d.getDate() + dias)
                  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
                }
                const resolvePersona = (idx: number) => personas[idx % personas.length] || 'Luis Rodríguez'
                const asigna = resolvePersona(0)
                const responsable = resolvePersona(1)
                const ejemplos: Tarea[] = [
                  // EN PROCESO
                  {
                    id: crypto.randomUUID(), codigo: nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo,
                    fecha_asignacion: offset(-3), hora_asignacion: '09:00',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(7), fecha_real_fin: '',
                    descripcion: 'Instalación de 4 cámaras IP CCTV en sede norte del cliente. Incluye cableado, configuración de NVR y pruebas de monitoreo remoto.',
                    situacion: 'En Proceso', fecha_registro: offset(-3), seguimientos: [],
                  },
                  {
                    id: crypto.randomUUID(), codigo: `TAR-${String(parseInt(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo.replace(/\D/g,''))+1).padStart(5,'0')}`,
                    fecha_asignacion: offset(-1), hora_asignacion: '10:30',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(5), fecha_real_fin: '',
                    descripcion: 'Capacitación técnica al equipo de supervisores sobre uso de plataforma de rastreo GPS y protocolos de respuesta ante alertas.',
                    situacion: 'En Proceso', fecha_registro: offset(-1), seguimientos: [],
                  },
                  // COMPLETADAS
                  {
                    id: crypto.randomUUID(), codigo: `TAR-${String(parseInt(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo.replace(/\D/g,''))+2).padStart(5,'0')}`,
                    fecha_asignacion: offset(-20), hora_asignacion: '08:00',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(-10), fecha_real_fin: offset(-8),
                    descripcion: 'Revisión mensual de pólizas de Responsabilidad Civil (RSE) de clientes activos con contratos vigentes superiores a $50M.',
                    situacion: 'Completada', fecha_registro: offset(-20), seguimientos: [],
                  },
                  {
                    id: crypto.randomUUID(), codigo: `TAR-${String(parseInt(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo.replace(/\D/g,''))+3).padStart(5,'0')}`,
                    fecha_asignacion: offset(-15), hora_asignacion: '14:15',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(-7), fecha_real_fin: offset(-5),
                    descripcion: 'Preparación y envío de cotización formal para prospecto ABC Industrial (vigilancia armada 24/7 + CCTV).',
                    situacion: 'Completada', fecha_registro: offset(-15), seguimientos: [],
                  },
                  // VENCIDAS (fecha requerida pasada, sin fecha real, aún en proceso/pendiente)
                  {
                    id: crypto.randomUUID(), codigo: `TAR-${String(parseInt(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo.replace(/\D/g,''))+4).padStart(5,'0')}`,
                    fecha_asignacion: offset(-20), hora_asignacion: '11:00',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(-5), fecha_real_fin: '',
                    descripcion: 'Visita técnica de mantenimiento preventivo a sistema de alarmas del cliente PQR Logistics sede Medellín.',
                    situacion: 'Pendiente', fecha_registro: offset(-20), seguimientos: [],
                  },
                  {
                    id: crypto.randomUUID(), codigo: `TAR-${String(parseInt(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo.replace(/\D/g,''))+5).padStart(5,'0')}`,
                    fecha_asignacion: offset(-12), hora_asignacion: '07:30',
                    persona_asigna: asigna, persona_ejecuta: responsable,
                    fecha_requerida_fin: offset(-3), fecha_real_fin: '',
                    descripcion: 'Auditoría operativa al personal de vigilancia de la zona sur: verificación de turnos, dotación y cumplimiento de protocolos.',
                    situacion: 'En Proceso', fecha_registro: offset(-12), seguimientos: [],
                  },
                ]
                ejemplos.forEach(t => addTarea(t))
                alert(`✅ ${ejemplos.length} tareas de ejemplo agregadas.`)
              }} style={{ ...btnStyle, background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)' }}>
                ✨ Cargar ejemplos
              </button>
              <button onClick={() => { setSelected(emptyTarea(nextConsecutivo('TAR-', tareas.map(t => t.codigo)).codigo)); setVista('form') }}
                style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>+ Nueva Tarea</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {vistaLista === 'kanban' ? (
        <KanbanView />
      ) : (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código, descripción o persona..." style={{ ...inputStyle, flex: 1, minWidth: 250, width: 'auto' }} />
            <select value={filtroSituacion} onChange={e => setFiltroSituacion(e.target.value)} style={{ ...inputStyle, width: 'auto', maxWidth: 200 }}>
              <option value="">Todas las situaciones</option>
              {situaciones.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Tabla */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
              <p style={{ fontSize: 15 }}>No hay tareas registradas</p>
              <p style={{ fontSize: 12, marginTop: 8 }}>Cree una tarea para empezar a gestionar asignaciones</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
                    {['Código', 'Persona que Asigna', 'Fecha de Asignación', 'Detalle del Requerimiento', 'Persona que Ejecuta', 'Fecha a ser Finalizada', 'Fecha Real de Finalización', 'Situación', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 14px', color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>{t.codigo}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>{t.persona_asigna}</td>
                      <td style={{ padding: '10px 14px', color: '#fff', fontSize: 13 }}>{fDate(t.fecha_asignacion)}</td>
                      <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 12, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.descripcion}>{t.descripcion}</td>
                      <td style={{ padding: '10px 14px', color: '#fff', fontSize: 13 }}>{t.persona_ejecuta}</td>
                      <td style={{ padding: '10px 14px', color: '#eab308', fontSize: 13 }}>{fDate(t.fecha_requerida_fin)}</td>
                      <td style={{ padding: '10px 14px', color: t.fecha_real_fin ? '#22c55e' : 'rgba(255,255,255,0.3)', fontSize: 13 }}>{fDate(t.fecha_real_fin)}</td>
                      <td style={{ padding: '10px 14px' }}><span style={situacionBadge(t.situacion)}>{t.situacion}</span></td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setViewDetail(t); setVista('detalle') }}
                            style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '4px 12px', fontSize: 11 }}>Ver</button>
                          {permisos.editar && (
                            <button onClick={() => { setSelected(t); setVista('form') }}
                              style={{ ...btnStyle, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 12px', fontSize: 11 }}>Editar</button>
                          )}
                          {permisos.eliminar && (
                            <button onClick={() => { if (confirm(`¿Eliminar tarea "${t.codigo}"?`)) deleteTarea(t.id) }}
                              style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', fontSize: 11 }}>Eliminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 16 }}>
            Mostrando {filtered.length} de {tareas.length} tareas
          </p>

          {/* Reportes */}
          <ReportPanel title="Reporte de Tareas" columns={reportColumns} rows={reportRows} filters={reportFilters} />
        </>
      )}
</div>
  )
}
