'use client'
import { logAudit, computarDiff } from '@/shared/lib/audit'
import { useState, useEffect } from 'react'
import { useProductosStore, Producto } from '@/features/productos/store/productos-store'
import { useLineasServicioStore } from '@/features/lineas-servicio/store/lineas-servicio-store'
import { buildNovaProductosSeed } from '@/features/productos/data/seed-nova'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { useCurrentUserStore } from '@/features/usuarios-gestion/store/current-user-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fmtMoney } from '@/shared/lib/format-number'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import { nextConsecutivo } from '@/shared/lib/consecutivo'
import ReportPanel from '@/shared/components/report-panel'
import SeguimientoPanel from '@/shared/components/seguimiento-panel'
import DocumentosPanel from '@/shared/components/documentos-panel'
import { useAsistenteStore } from '@/shared/stores/asistente-store'
import { Seguimiento } from '@/shared/types/seguimiento'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'
import NumeroInput from '@/shared/components/numero-input'
import { getCurrencyCode } from '@/shared/lib/format-money'


const emptyProducto = (codigo: string): Producto => ({
  id: '', codigo, descripcion: '',
  tipo: 'Servicio', linea_servicio_id: '', linea_servicio_codigo: '', modalidad: 'Mensual',
  categoria: '',
  unidad_medida: 'Unidad', precio_unitario: 0, tipo_moneda: 'Pesos Colombianos',
  observaciones: '', situacion: 'Activo', fecha_registro: todayColombia(), seguimientos: [],
})

export default function ProductosPage() {
  const permisos = usePermisos('productos')
  const currentUser = useCurrentUserStore(s => s.user)
  const { productos, addProducto, updateProducto, deleteProducto } = useProductosStore()
  const refData = useReferenceStore(s => s.data)
  const lineasServicio = useLineasServicioStore(s => s.lineas).filter(l => l.situacion === 'Activo')

  const [selected, setSelected] = useState<Producto | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [viewDetail, setViewDetail] = useState<Producto | null>(null)
  const [tab, setTab] = useState<'registros' | 'reportes'>('registros')
  const [search, setSearch] = useState('')
  const { pendingSearch, pendingAction, clearPending } = useAsistenteStore()
  useEffect(() => {
    if (pendingSearch) setSearch(pendingSearch)
    if (pendingAction === 'nuevo') { setSelected(emptyProducto(nextConsecutivo('PRD-', productos.map(p => p.codigo)).codigo)); setIsForm(true) }
    if (pendingSearch || pendingAction) clearPending()
  }, [])

  const filtered = productos.filter(p =>
    !search || p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  )

  const auditParams = () => ({
    usuario: currentUser?.usuario || 'desconocido',
    usuario_nombre: `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
    rol: currentUser?.rol || '',
    modulo: 'productos',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (selected.id) { const _anterior = productos.find(x => x.id === selected.id); updateProducto(selected.id, selected); logAudit({ ...auditParams(), accion: "MODIFICAR", registro_codigo: selected.codigo, registro_nombre: selected.descripcion, detalle: computarDiff(_anterior as unknown as Record<string, unknown>, selected as unknown as Record<string, unknown>) }) }
    else { addProducto({ ...selected, id: crypto.randomUUID() }) }
    setIsForm(false); setSelected(null)
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Activo': { background: '#1e3a8a', color: '#ffffff', border: '1px solid #2563eb' },
      'Inactivo': { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' },
      'Descontinuado': { background: '#dc2626', color: '#ffffff', border: '1px solid #ef4444' },
    }
    return map[s] || {}
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({ ...btnStyle, background: active ? '#1e3a8a' : 'rgba(255,255,255,0.15)', color: active ? '#ffffff' : 'rgba(255,255,255,0.7)', border: active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.2)' })
  const refOptions = (table: string) => (refData[table as keyof typeof refData] || []).filter(r => r.situacion).map(r => r.descripcion)

  if (viewDetail) {
    return (
      <div>
        <button onClick={() => setViewDetail(null)} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{viewDetail.descripcion}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: 'Código', value: viewDetail.codigo },
              { label: 'Descripción', value: viewDetail.descripcion },
              { label: 'Categoría', value: viewDetail.categoria },
              { label: 'Unidad', value: viewDetail.unidad_medida },
              { label: 'Precio', value: `${getCurrencyCode(viewDetail.tipo_moneda)} ${fmtMoney(viewDetail.precio_unitario)}` },
              { label: 'Moneda', value: viewDetail.tipo_moneda },
              { label: 'Situación', value: viewDetail.situacion },
            ].map(f => (
              <div key={f.label}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 2 }}>{f.label}</p>
                <p style={{ color: '#ffffff', fontSize: 14 }}>{f.value || '—'}</p>
              </div>
            ))}
          </div>
          {permisos.editar && (
            <button onClick={() => { setSelected(viewDetail); setIsForm(true); setViewDetail(null) }} style={{ ...btnStyle, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a', marginTop: 16 }}>Editar</button>
          )}
          <SeguimientoPanel
            seguimientos={viewDetail.seguimientos || []}
            usuario={`${currentUser?.nombre} ${currentUser?.apellido}`}
            situacionActual={viewDetail.situacion}
            situacionOpciones={refData.situacion_lista.filter(r => r.situacion).map(r => r.descripcion)}
            onAdd={(seg: Seguimiento) => {
              const updated = { ...viewDetail, situacion: seg.situacion, seguimientos: [...(viewDetail.seguimientos || []), seg] }
              updateProducto(viewDetail.id, updated)
              setViewDetail(updated)
            }}
          />
          <DocumentosPanel modulo="productos" registroId={viewDetail.id} />
        </div>
      </div>
    )
  }

  if (isForm && selected) {
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? `Editar ${selected.tipo}` : 'Nuevo Producto/Servicio'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Tipo *</label>
              <select value={selected.tipo} onChange={e => setSelected({ ...selected, tipo: e.target.value as 'Servicio' | 'Producto' })} style={inputStyle}>
                <option value="Servicio">Servicio</option>
                <option value="Producto">Producto</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Línea de Servicio *</label>
              <select value={selected.linea_servicio_id} onChange={e => {
                const linea = lineasServicio.find(l => l.id === e.target.value)
                setSelected({ ...selected, linea_servicio_id: linea?.id || '', linea_servicio_codigo: linea?.codigo || '' })
              }} required style={inputStyle}>
                <option value="">Seleccionar...</option>
                {lineasServicio.map(l => <option key={l.id} value={l.id}>{l.codigo} — {l.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Modalidad</label>
              <select value={selected.modalidad} onChange={e => setSelected({ ...selected, modalidad: e.target.value as 'Único' | 'Mensual' | 'Anual' })} style={inputStyle}>
                <option value="Único">Único</option>
                <option value="Mensual">Mensual</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={selected.codigo} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de Registro</label>
              <input value={fDate(selected.fecha_registro)} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Descripción *</label>
              <input value={selected.descripcion} onChange={e => setSelected({ ...selected, descripcion: e.target.value.toUpperCase() })} required style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select value={selected.categoria} onChange={e => setSelected({ ...selected, categoria: e.target.value })} style={inputStyle}>
                <option value="">Seleccione...</option>
                {(refData.categoria_productos || []).filter(c => c.situacion).map(c => (
                  <option key={c.id} value={c.descripcion}>{c.descripcion}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unidad de Medida</label>
              <select value={selected.unidad_medida} onChange={e => setSelected({ ...selected, unidad_medida: e.target.value })} style={inputStyle}>
                <option value="">Seleccione...</option>
                {(refData.unidad_medida || []).filter(u => u.situacion).map(u => (
                  <option key={u.id} value={u.descripcion}>{u.descripcion}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Precio Unitario *</label>
              <NumeroInput value={selected.precio_unitario} onChange={n => setSelected({ ...selected, precio_unitario: n })} decimales={2} prefijo={getCurrencyCode(selected.tipo_moneda)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Moneda</label>
              <select value={selected.tipo_moneda} onChange={e => setSelected({ ...selected, tipo_moneda: e.target.value })} style={inputStyle}>
                {refOptions('tipo_moneda').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Situación</label>
              <select value={selected.situacion} onChange={e => setSelected({ ...selected, situacion: e.target.value })} style={inputStyle}>
                {refOptions('situacion_lista').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea value={selected.observaciones} onChange={e => setSelected({ ...selected, observaciones: e.target.value.toUpperCase() })} rows={3} style={{ ...inputUpper, resize: 'vertical' }} />
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

  const reportColumns = [
    { header: 'Código', key: 'codigo', width: 14 },
    { header: 'Descripción', key: 'descripcion', width: 28 },
    { header: 'Categoría', key: 'categoria', width: 14 },
    { header: 'Unidad', key: 'unidad_medida', width: 10 },
    { header: 'Precio', key: 'precio', width: 14 },
    { header: 'Moneda', key: 'tipo_moneda', width: 14 },
    { header: 'Situación', key: 'situacion', width: 10 },
  ]
  const reportRows = filtered.map(p => ({
    codigo: p.codigo, descripcion: p.descripcion, categoria: p.categoria,
    unidad_medida: p.unidad_medida, precio: `$${fmtMoney(p.precio_unitario)}`,
    tipo_moneda: p.tipo_moneda, situacion: p.situacion,
  }))

  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="productos"
          label="Productos"
          registros={productos}
          onClear={() => useProductosStore.setState({ productos: [] })}
          onRestore={(rs) => useProductosStore.setState({ productos: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Productos y Servicios</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Catálogo de servicios y productos para cotizar</p>
        </div>
        {permisos.editar && tab === 'registros' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => {
              if (!confirm('Esto reemplazará TODO el catálogo actual por el catálogo predeterminado de Nova Seguridad (22 items). ¿Continuar?')) return
              useProductosStore.setState({ productos: buildNovaProductosSeed() })
              alert('Catálogo de Nova Seguridad recargado correctamente.')
            }} style={{ ...btnStyle, background: '#7c2d12', color: '#fff', border: '1px solid #b45309' }}>↻ Recargar catálogo Nova</button>
            <button onClick={() => { setSelected(emptyProducto(nextConsecutivo('PROD-', productos.map(p => p.codigo)).codigo)); setIsForm(true) }} style={{ ...btnStyle, background: '#0f1b3d', color: '#ffffff' }}>+ Nuevo Producto o Servicio</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('registros')} style={tabBtnStyle(tab === 'registros')}>📋 Registros</button>
        <button onClick={() => setTab('reportes')} style={tabBtnStyle(tab === 'reportes')}>📊 Reportes</button>
      </div>

      {tab === 'registros' && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por descripción o código..."
            style={{ ...inputStyle, maxWidth: 400, marginBottom: 16 }} />
          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Código', 'Tipo', 'Línea', 'Modalidad', 'Descripción', 'Categoría', 'Unidad', 'Precio', 'Moneda', 'Situación', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const linea = lineasServicio.find(l => l.codigo === p.linea_servicio_codigo)
                  return (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>{p.codigo}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ background: p.tipo === 'Servicio' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)', color: p.tipo === 'Servicio' ? '#93c5fd' : '#d8b4fe', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{p.tipo}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {p.linea_servicio_codigo ? <span style={{ background: linea?.color || '#475569', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{p.linea_servicio_codigo}</span> : <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.modalidad}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 13 }}>{p.descripcion}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{p.categoria}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{p.unidad_medida}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 13, fontWeight: 600 }}>${fmtMoney(p.precio_unitario)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{p.tipo_moneda}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...statusStyle(p.situacion) }}>{p.situacion}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setViewDetail(p)} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#ea580c', color: '#ffffff', border: '1px solid #f97316' }}>Ver</button>
                        {permisos.editar && <button onClick={() => { setSelected(p); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' }}>Editar</button>}
                        {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar "${p.descripcion}"?`)) deleteProducto(p.id); logAudit({ ...auditParams(), accion: "ELIMINAR", registro_codigo: p.codigo, registro_nombre: p.descripcion }) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#dc2626', color: '#ffffff', border: '1px solid #ef4444' }}>Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={11} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay productos registrados</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <ReportPanel title="Reporte de Productos" columns={reportColumns} rows={reportRows}
          filters={[
            { label: 'Situación', key: 'situacion', options: [...new Set(productos.map(p => p.situacion).filter(Boolean))] },
            { label: 'Categoría', key: 'categoria', options: [...new Set(productos.map(p => p.categoria).filter(Boolean))] },
          ]} />
      )}
</div>
  )
}
