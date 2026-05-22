'use client'
import { logAudit, computarDiff } from '@/shared/lib/audit'
import { useState, useEffect } from 'react'
import { useClientesStore, Cliente, generarCodigoAcceso } from '@/features/clientes/store/clientes-store'
import { REGIONES, getDepartamentosByRegion, getMunicipiosByDepartamento, getDepartamento } from '@/shared/data/colombia'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { useCurrentUserStore } from '@/features/usuarios-gestion/store/current-user-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import { nextConsecutivo } from '@/shared/lib/consecutivo'
import ReportPanel from '@/shared/components/report-panel'
import SeguimientoPanel from '@/shared/components/seguimiento-panel'
import DocumentosPanel from '@/shared/components/documentos-panel'
import { useAsistenteStore } from '@/shared/stores/asistente-store'
import { Seguimiento } from '@/shared/types/seguimiento'
import WhatsAppButton from '@/shared/components/whatsapp-button'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'


const emptyCliente = (codigo: string): Cliente => ({
  id: '', codigo, tipo_identificacion: 'NIT',
  nro_documento: '', razon_social: '', nombre_comercial: '', representante_legal: '', fecha_inicio_cliente: '', centro_costo: '', actividad: '',
  direccion: '', region: '', departamento: '', municipio: '', ciudad_pueblo: '',
  ciudad: '', pais: 'Colombia', codigo_postal: '', telefono: '', email: '', sitio_web: '',
  condicion_pago: 'Contado', tipo_moneda: 'Pesos Colombianos', observaciones: '',
  situacion: 'Activo', fecha_registro: todayColombia(), seguimientos: [], codigo_acceso: generarCodigoAcceso(),
})

export default function ClientesPage() {
  const permisos = usePermisos('clientes')
  const currentUser = useCurrentUserStore(s => s.user)
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientesStore()
  const refData = useReferenceStore(s => s.data)

  const [selected, setSelected] = useState<Cliente | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [viewDetail, setViewDetail] = useState<Cliente | null>(null)
  const [tab, setTab] = useState<'registros' | 'reportes'>('registros')
  const [search, setSearch] = useState('')
  const { pendingSearch, pendingAction, clearPending } = useAsistenteStore()
  useEffect(() => {
    if (pendingSearch) setSearch(pendingSearch)
    if (pendingAction === 'nuevo') { setSelected(emptyCliente(nextConsecutivo('CLI-', clientes.map(c => c.codigo)).codigo)); setIsForm(true) }
    if (pendingSearch || pendingAction) clearPending()
  }, [])

  const filtered = clientes.filter(c =>
    !search || c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
    c.codigo.toLowerCase().includes(search.toLowerCase()) ||
    c.nro_documento.includes(search)
  )

  const auditParams = () => ({
    usuario: currentUser?.usuario || 'desconocido',
    usuario_nombre: `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
    rol: currentUser?.rol || '',
    modulo: 'clientes',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (selected.id) {
      const _anterior = clientes.find(x => x.id === selected.id); updateCliente(selected.id, selected); logAudit({ ...auditParams(), accion: "MODIFICAR", registro_codigo: selected.codigo, registro_nombre: selected.razon_social, detalle: computarDiff(_anterior as unknown as Record<string, unknown>, selected as unknown as Record<string, unknown>) })
    } else {
      addCliente({ ...selected, id: crypto.randomUUID() })
    }
    setIsForm(false); setSelected(null)
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Activo': { background: '#1e3a8a', color: '#ffffff', border: '1px solid #2563eb' },
      'Inactivo': { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' },
      'Prospecto': { background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' },
    }
    return map[s] || {}
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 8, background: '#1e3a8a', padding: '10px 12px', borderRadius: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({ ...btnStyle, background: active ? '#1e3a8a' : 'rgba(255,255,255,0.15)', color: active ? '#ffffff' : 'rgba(255,255,255,0.7)', border: active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.2)' })

  // View detail
  if (viewDetail) {
    const fields = [
      { label: 'Código', value: viewDetail.codigo },
      { label: 'Tipo ID', value: viewDetail.tipo_identificacion },
      { label: 'Nro. Documento', value: viewDetail.nro_documento },
      { label: 'Razón Social', value: viewDetail.razon_social },
      { label: 'Nombre Comercial', value: viewDetail.nombre_comercial },
      { label: 'Representante Legal', value: viewDetail.representante_legal },
      { label: 'Fecha Inicio Cliente', value: viewDetail.fecha_inicio_cliente ? fDate(viewDetail.fecha_inicio_cliente) : '' },
      { label: 'Centro de Costo', value: viewDetail.centro_costo },
      { label: 'Actividad', value: viewDetail.actividad },
      { label: 'Teléfono', value: viewDetail.telefono },
      { label: 'Email', value: viewDetail.email },
      { label: 'Sitio Web', value: viewDetail.sitio_web },
      { label: 'Condición de Pago', value: viewDetail.condicion_pago },
      { label: 'Moneda', value: viewDetail.tipo_moneda },
      { label: 'Situación', value: viewDetail.situacion },
      { label: 'Fecha Registro', value: fDate(viewDetail.fecha_registro) },
      { label: 'Observaciones', value: viewDetail.observaciones },
    ]
    return (
      <div>
        <button onClick={() => setViewDetail(null)} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{viewDetail.razon_social}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {fields.map(f => (
              <div key={f.label}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>{f.label}</p>
                <p style={{ color: '#ffffff', fontSize: 14 }}>{f.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Ubicación */}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
            <h3 style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Ubicación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Dirección', value: viewDetail.direccion },
                { label: 'Región', value: viewDetail.region },
                { label: 'Departamento', value: viewDetail.departamento },
                { label: 'Municipio', value: viewDetail.municipio || viewDetail.ciudad },
                { label: 'Ciudad/Pueblo', value: viewDetail.ciudad_pueblo },
                { label: 'País', value: viewDetail.pais },
                { label: 'Código Postal', value: viewDetail.codigo_postal },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>{f.label}</p>
                  <p style={{ color: '#ffffff', fontSize: 14 }}>{f.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Código de acceso PQRS */}
          {viewDetail.codigo_acceso && (
            <div style={{ marginTop: 16, padding: 16, background: 'rgba(234,88,12,0.1)', borderRadius: 12, border: '1px solid rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#f97316', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>Código de Acceso para PQRS Público</p>
                <p style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2 }}>{viewDetail.codigo_acceso}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(viewDetail.codigo_acceso); alert('Código copiado al portapapeles') }}
                style={{ ...btnStyle, background: '#ea580c', color: '#ffffff', border: '1px solid #f97316', fontSize: 12 }}>Copiar</button>
            </div>
          )}

          {permisos.editar && (
            <button onClick={() => { setSelected(viewDetail); setIsForm(true); setViewDetail(null) }} style={{ ...btnStyle, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a', marginTop: 16 }}>Editar</button>
          )}
          <SeguimientoPanel
            seguimientos={viewDetail.seguimientos || []}
            usuario={`${currentUser?.nombre} ${currentUser?.apellido}`}
            situacionActual={viewDetail.situacion}
            situacionOpciones={refData.situacion_cliente.filter(r => r.situacion).map(r => r.descripcion)}
            onAdd={(seg: Seguimiento) => {
              const updated = { ...viewDetail, situacion: seg.situacion, seguimientos: [...(viewDetail.seguimientos || []), seg] }
              updateCliente(viewDetail.id, updated)
              setViewDetail(updated)
            }}
          />
          <DocumentosPanel modulo="clientes" registroId={viewDetail.id} />
        </div>
      </div>
    )
  }

  // Form
  if (isForm && selected) {
    const refOptions = (table: string) => (refData[table as keyof typeof refData] || []).filter(r => r.situacion).map(r => r.descripcion)
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? 'Editar' : 'Nueva'} Empresa</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={selected.codigo} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de Registro</label>
              <input value={fDate(selected.fecha_registro)} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Tipo Identificación</label>
              <select value={selected.tipo_identificacion || ''} onChange={e => setSelected({ ...selected, tipo_identificacion: e.target.value })} style={inputStyle}>
                {refOptions('tipo_identificacion').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nro. Documento *</label>
              <input value={selected.nro_documento || ''} onChange={e => setSelected({ ...selected, nro_documento: e.target.value })} required style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Razón Social *</label>
              <input value={selected.razon_social || ''} onChange={e => setSelected({ ...selected, razon_social: e.target.value.toUpperCase() })} required style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Nombre Comercial</label>
              <input value={selected.nombre_comercial || ''} onChange={e => setSelected({ ...selected, nombre_comercial: e.target.value.toUpperCase() })} style={inputUpper} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Representante Legal</label>
              <input value={selected.representante_legal || ''} onChange={e => setSelected({ ...selected, representante_legal: e.target.value.toUpperCase() })} style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Inicio como Cliente</label>
              <input type="date" value={selected.fecha_inicio_cliente || ''} onChange={e => setSelected({ ...selected, fecha_inicio_cliente: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Centro de Costo</label>
              <select value={selected.centro_costo || ''} onChange={e => setSelected({ ...selected, centro_costo: e.target.value })} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {refOptions('centro_costo').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Actividad</label>
              <select value={selected.actividad || ''} onChange={e => setSelected({ ...selected, actividad: e.target.value.toUpperCase() })} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {refOptions('actividad_cliente').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={selected.telefono || ''} onChange={e => setSelected({ ...selected, telefono: e.target.value })} style={inputStyle} />
                <WhatsAppButton telefono={selected.telefono} nombre={selected.razon_social} compacto />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={selected.email || ''} onChange={e => setSelected({ ...selected, email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sitio Web</label>
              <input value={selected.sitio_web || ''} onChange={e => setSelected({ ...selected, sitio_web: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Condición de Pago</label>
              <select value={selected.condicion_pago || ''} onChange={e => setSelected({ ...selected, condicion_pago: e.target.value })} style={inputStyle}>
                {refOptions('condiciones_pago').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Moneda</label>
              <select value={selected.tipo_moneda || ''} onChange={e => setSelected({ ...selected, tipo_moneda: e.target.value })} style={inputStyle}>
                {refOptions('tipo_moneda').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Situación</label>
              <select value={selected.situacion || ''} onChange={e => setSelected({ ...selected, situacion: e.target.value })} style={inputStyle}>
                {refOptions('situacion_cliente').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Ubicación */}
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
            <h3 style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Ubicación (Colombia)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Dirección</label>
                <input value={selected.direccion || ''} onChange={e => setSelected({ ...selected, direccion: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Región</label>
                <select value={selected.region || ''} onChange={e => setSelected({ ...selected, region: e.target.value, departamento: '', municipio: '', ciudad_pueblo: '' })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Departamento</label>
                <select value={selected.departamento || ''} disabled={!selected.region} onChange={e => {
                  const dep = getDepartamento(e.target.value)
                  setSelected({ ...selected, departamento: e.target.value, municipio: dep?.capital || '', ciudad_pueblo: '' })
                }} style={inputStyle}>
                  <option value="">{selected.region ? 'Seleccionar...' : 'Elija región primero'}</option>
                  {selected.region && getDepartamentosByRegion(selected.region as never).map(d => <option key={d.nombre} value={d.nombre}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Municipio</label>
                <select value={selected.municipio || ''} disabled={!selected.departamento} onChange={e => {
                  setSelected({ ...selected, municipio: e.target.value, ciudad: e.target.value })
                }} style={inputStyle}>
                  <option value="">{selected.departamento ? 'Seleccionar...' : 'Elija departamento'}</option>
                  {selected.departamento && getMunicipiosByDepartamento(selected.departamento).map(m => <option key={m.nombre} value={m.nombre}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ciudad / Pueblo</label>
                <input value={selected.ciudad_pueblo || ''} onChange={e => setSelected({ ...selected, ciudad_pueblo: e.target.value })} placeholder="Corregimiento, vereda o centro poblado" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>País</label>
                <select value={selected.pais || ''} onChange={e => setSelected({ ...selected, pais: e.target.value })} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {refOptions('pais').map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Código Postal</label>
                <input value={selected.codigo_postal || ''} onChange={e => setSelected({ ...selected, codigo_postal: e.target.value })} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Código de acceso PQRS */}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(234,88,12,0.08)', borderRadius: 12, border: '1px solid rgba(234,88,12,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#f97316', fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6 }}>Código de Acceso PQRS Público</label>
                <input value={selected.codigo_acceso || ''} readOnly style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 2, opacity: 0.8 }} />
              </div>
              <button type="button" onClick={() => setSelected({ ...selected, codigo_acceso: generarCodigoAcceso() })}
                style={{ ...btnStyle, background: '#ea580c', color: '#ffffff', border: '1px solid #f97316', fontSize: 12, marginTop: 18 }}>Regenerar</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6 }}>Este código permite a la empresa radicar PQRS desde el formulario público</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea value={selected.observaciones || ''} onChange={e => setSelected({ ...selected, observaciones: e.target.value.toUpperCase() })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={{ ...btnStyle, background: '#0f1b3d', color: '#ffffff' }}>Guardar</button>
            <button type="button" onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#64748b', color: '#ffffff' }}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  // Report data
  const reportColumns = [
    { header: 'Código', key: 'codigo', width: 12 },
    { header: 'Razón Social', key: 'razon_social', width: 25 },
    { header: 'NIT/Doc', key: 'nro_documento', width: 14 },
    { header: 'Región', key: 'region', width: 10 },
    { header: 'Departamento', key: 'departamento', width: 14 },
    { header: 'Municipio', key: 'municipio', width: 14 },
    { header: 'Ciudad/Pueblo', key: 'ciudad_pueblo', width: 14 },
    { header: 'Teléfono', key: 'telefono', width: 12 },
    { header: 'Actividad', key: 'actividad', width: 14 },
    { header: 'Situación', key: 'situacion', width: 10 },
  ]
  const reportRows = filtered.map(c => ({
    codigo: c.codigo, razon_social: c.razon_social, nro_documento: c.nro_documento,
    region: c.region, departamento: c.departamento, municipio: c.municipio || c.ciudad,
    ciudad_pueblo: c.ciudad_pueblo || '',
    telefono: c.telefono, actividad: c.actividad, situacion: c.situacion,
  }))
  const reportFilters = [
    { label: 'Situación', key: 'situacion', options: [...new Set(clientes.map(c => c.situacion).filter(Boolean))] },
    { label: 'Región', key: 'region', options: [...new Set(clientes.map(c => c.region).filter(Boolean))] },
    { label: 'Departamento', key: 'departamento', options: [...new Set(clientes.map(c => c.departamento).filter(Boolean))] },
    { label: 'Municipio', key: 'municipio', options: [...new Set(clientes.map(c => c.municipio || c.ciudad).filter(Boolean))] },
    { label: 'Actividad', key: 'actividad', options: [...new Set(clientes.map(c => c.actividad).filter(Boolean))] },
  ]

  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="clientes"
          label="Empresas"
          registros={clientes}
          onClear={() => useClientesStore.setState({ clientes: [] })}
          onRestore={(rs) => useClientesStore.setState({ clientes: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Empresas</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Gestión de empresas comerciales</p>
        </div>
        {permisos.editar && tab === 'registros' && (
          <button onClick={() => { setSelected(emptyCliente(nextConsecutivo('CLI-', clientes.map(c => c.codigo)).codigo)); setIsForm(true) }} style={{ ...btnStyle, background: '#0f1b3d', color: '#ffffff' }}>+ Nueva Empresa</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('registros')} style={tabBtnStyle(tab === 'registros')}>📋 Registros</button>
        <button onClick={() => setTab('reportes')} style={tabBtnStyle(tab === 'reportes')}>📊 Reportes</button>
      </div>

      {tab === 'registros' && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, código o documento..."
            style={{ ...inputStyle, maxWidth: 400, marginBottom: 16 }} />

          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Código', 'Razón Social', 'Tipo ID', 'Nro Documento', 'Dirección', 'Departamento', 'Municipio', 'Ciudad/Pueblo', 'Teléfono', 'Situación', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>{c.codigo}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 13 }}>{c.razon_social}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.tipo_identificacion}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.nro_documento}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.direccion}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.departamento}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.municipio || c.ciudad}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.ciudad_pueblo || ''}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.telefono}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...statusStyle(c.situacion) }}>{c.situacion}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setViewDetail(c)} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#ea580c', color: '#ffffff', border: '1px solid #f97316' }}>Ver</button>
                        {permisos.editar && <button onClick={() => { setSelected(c); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' }}>Editar</button>}
                        {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar empresa "${c.razon_social}"?`)) deleteCliente(c.id); logAudit({ ...auditParams(), accion: "ELIMINAR", registro_codigo: c.codigo, registro_nombre: c.razon_social }) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#dc2626', color: '#ffffff', border: '1px solid #ef4444' }}>Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={11} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay empresas registradas</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <ReportPanel title="Reporte de Empresas" columns={reportColumns} rows={reportRows} filters={reportFilters} />
      )}
</div>
  )
}
