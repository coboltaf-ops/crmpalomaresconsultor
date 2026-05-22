'use client'
import { useState } from 'react'
import { useContratosStore, Contrato } from '@/features/contratos/store/contratos-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fmtMoney } from '@/shared/lib/format-number'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import { nextConsecutivo } from '@/shared/lib/consecutivo'
import { REGIONES, getDepartamentosByRegion, getMunicipiosByDepartamento } from '@/shared/data/colombia'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'
import NumeroInput from '@/shared/components/numero-input'
import ReportPanel from '@/shared/components/report-panel'
import { getCurrencyCode } from '@/shared/lib/format-money'


const emptyContrato = (codigo: string): Contrato => ({
  id: '', codigo, fecha: todayColombia(),
  cliente_id: '', cliente_nombre: '', contacto_id: '', contacto_nombre: '',
  tipo_servicio: '', centro_costo: '',
  direccion: '', region: '', departamento: '', municipio: '',
  fecha_inicio: '', fecha_finalizacion: '', valor_anual: 0, valor_mensual: 0,
  tipo_moneda: 'Pesos Colombianos',
  nro_poliza_rse: '', nro_poliza_cumplimiento: '', representante_legal: '',
  situacion: 'Vigente', dias_atraso: 0,
  fecha_registro: todayColombia(), observaciones: '',
})

export default function ContratosPage() {
  const permisos = usePermisos('contratos')
  const { contratos, addContrato, updateContrato, deleteContrato } = useContratosStore()
  const allClientes = useClientesStore(s => s.clientes)
  const clientes = allClientes.filter(c => c.situacion === 'Activo')
  const allContactos = useContactosStore(s => s.contactos).filter(c => c.situacion === 'Activo')
  const refData = useReferenceStore(s => s.data)

  const [selected, setSelected] = useState<Contrato | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [viewDetail, setViewDetail] = useState<Contrato | null>(null)
  const [search, setSearch] = useState('')

  const refOptions = (table: string) => (refData[table as keyof typeof refData] || []).filter(r => r.situacion).map(r => r.descripcion)

  const filtered = contratos.filter(c =>
    !search ||
    c.codigo.toLowerCase().includes(search.toLowerCase()) ||
    c.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.tipo_servicio.toLowerCase().includes(search.toLowerCase()) ||
    c.centro_costo.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 8, background: '#1e3a8a', padding: '10px 12px', borderRadius: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }
  const sectionTitle: React.CSSProperties = { color: '#fbbf24', fontSize: 18, fontWeight: 900, marginBottom: 14, letterSpacing: 0.8, textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }
  const sectionBox: React.CSSProperties = { padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', marginTop: 16 }

  const contactosDelCliente = selected ? allContactos.filter(c => c.cliente_id === selected.cliente_id) : []

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selected) { alert('No hay datos para guardar'); return }
      // Validaciones explícitas con mensajes claros
      const faltantes: string[] = []
      if (!selected.fecha) faltantes.push('Fecha del Contrato')
      if (!selected.cliente_id) faltantes.push('Empresa')
      if (!selected.tipo_servicio) faltantes.push('Tipo de Servicio')
      if (!selected.centro_costo) faltantes.push('Centro de Costo')
      if (faltantes.length) {
        alert(`Para guardar, complete:\n\n• ${faltantes.join('\n• ')}`)
        return
      }
      const cli = clientes.find(c => c.id === selected.cliente_id)
      const con = allContactos.find(c => c.id === selected.contacto_id)
      const toSave = {
        ...selected,
        cliente_nombre: cli?.razon_social || selected.cliente_nombre,
        contacto_nombre: con ? `${con.nombre} ${con.apellido}` : selected.contacto_nombre,
      }
      console.log('[contratos] Guardando contrato:', toSave)
      if (toSave.id) updateContrato(toSave.id, toSave)
      else addContrato({ ...toSave, id: crypto.randomUUID() })
      console.log('[contratos] Guardado OK. Cerrando formulario.')
      setIsForm(false); setSelected(null)
    } catch (err) {
      console.error('[contratos] Error al guardar:', err)
      alert(`❌ Error al guardar el contrato:\n\n${err instanceof Error ? err.message : String(err)}\n\nRevisa la consola del navegador (F12) para ver el detalle.`)
    }
  }

  const situacionStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Vigente':    { background: '#15803d', color: '#fff', border: '1px solid #16a34a' },
      'Por Vencer': { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.4)' },
      'Vencido':    { background: '#b91c1c', color: '#fff', border: '1px solid #dc2626' },
      'Suspendido': { background: 'rgba(120,53,15,0.4)', color: '#fcd34d', border: '1px solid rgba(180,83,9,0.5)' },
      'Terminado':  { background: 'rgba(156,163,175,0.2)', color: '#d1d5db', border: '1px solid rgba(156,163,175,0.3)' },
      'Renovado':   { background: '#1e40af', color: '#fff', border: '1px solid #2563eb' },
    }
    return map[s] || {}
  }

  // ─── VIEW DETAIL ───
  if (viewDetail) {
    return (
      <div>
        <button onClick={() => setViewDetail(null)} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Volver</button>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{viewDetail.codigo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{viewDetail.cliente_nombre}</p>
            </div>
            <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, ...situacionStyle(viewDetail.situacion) }}>{viewDetail.situacion}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            {[
              { l: 'Fecha', v: fDate(viewDetail.fecha) },
              { l: 'Empresa', v: viewDetail.cliente_nombre },
              { l: 'Contacto', v: viewDetail.contacto_nombre },
              { l: 'Tipo Servicio', v: viewDetail.tipo_servicio },
              { l: 'Centro de Costo', v: viewDetail.centro_costo },
              { l: 'Dirección', v: viewDetail.direccion },
              { l: 'Región', v: viewDetail.region },
              { l: 'Departamento', v: viewDetail.departamento },
              { l: 'Municipio', v: viewDetail.municipio },
            ].map(f => (
              <div key={f.l}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{f.l}</p><p style={{ color: '#fff', fontSize: 13 }}>{f.v || '—'}</p></div>
            ))}
          </div>

          <div style={sectionBox}>
            <p style={sectionTitle}>Datos del Contrato</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
              {[
                { l: 'Fecha Inicio', v: fDate(viewDetail.fecha_inicio) },
                { l: 'Fecha Finalización', v: fDate(viewDetail.fecha_finalizacion) },
                { l: 'Valor Anual', v: viewDetail.valor_anual ? `$${fmtMoney(viewDetail.valor_anual)}` : '—' },
                { l: 'Valor Mensual', v: viewDetail.valor_mensual ? `$${fmtMoney(viewDetail.valor_mensual)}` : '—' },
                { l: 'Nro Póliza RSE', v: viewDetail.nro_poliza_rse },
                { l: 'Nro Póliza Cumplimiento', v: viewDetail.nro_poliza_cumplimiento },
                { l: 'Representante Legal', v: viewDetail.representante_legal },
              ].map(f => (
                <div key={f.l}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{f.l}</p><p style={{ color: '#fff', fontSize: 13 }}>{f.v || '—'}</p></div>
              ))}
            </div>
          </div>

          <div style={sectionBox}>
            <p style={sectionTitle}>Estado</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Situación</p><p style={{ color: '#fff', fontSize: 13 }}>{viewDetail.situacion}</p></div>
              <div><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Días de Atraso</p><p style={{ color: viewDetail.dias_atraso > 0 ? '#fca5a5' : '#fff', fontSize: 13, fontWeight: viewDetail.dias_atraso > 0 ? 700 : 400 }}>{viewDetail.dias_atraso}</p></div>
            </div>
          </div>

          {permisos.editar && (
            <button onClick={() => { setSelected(viewDetail); setIsForm(true); setViewDetail(null) }} style={{ ...btnStyle, background: '#15803d', color: '#fff', border: '1px solid #16a34a', marginTop: 16 }}>Editar</button>
          )}
        </div>
      </div>
    )
  }

  // ─── FORM ───
  if (isForm && selected) {
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? 'Editar' : 'Nuevo'} Contrato de Servicio Nro {selected.codigo}</h2>

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
              <label style={labelStyle}>Fecha *</label>
              <input type="date" value={selected.fecha || ''} onChange={e => setSelected({ ...selected, fecha: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Empresa *</label>
              <select value={selected.cliente_id || ''} onChange={e => {
                const cli = clientes.find(c => c.id === e.target.value) || allClientes.find(c => c.id === e.target.value)
                setSelected({ ...selected, cliente_id: e.target.value, cliente_nombre: cli?.razon_social || '', contacto_id: '', contacto_nombre: '' })
              }} style={inputStyle}>
                <option value="">Seleccionar empresa...</option>
                {/* Si la empresa guardada está inactiva o filtrada, igual la mostramos */}
                {selected.cliente_id && !clientes.find(c => c.id === selected.cliente_id) && (() => {
                  const cli = allClientes.find(c => c.id === selected.cliente_id)
                  return cli ? <option value={cli.id}>{cli.razon_social} (Inactivo)</option> : <option value={selected.cliente_id}>{selected.cliente_nombre || '(empresa antigua)'}</option>
                })()}
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Contacto</label>
              <select value={selected.contacto_id || ''} onChange={e => {
                const con = contactosDelCliente.find(c => c.id === e.target.value)
                setSelected({ ...selected, contacto_id: e.target.value, contacto_nombre: con ? `${con.nombre} ${con.apellido}` : '' })
              }} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {contactosDelCliente.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de Servicio *</label>
              <select value={selected.tipo_servicio || ''} onChange={e => setSelected({ ...selected, tipo_servicio: e.target.value.toUpperCase() })} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {/* Si el valor guardado no coincide con ninguna opción actual, se muestra como opción "fantasma" para no ocultarlo */}
                {selected.tipo_servicio && !refOptions('tipo_servicio_contrato').includes(selected.tipo_servicio) && (
                  <option value={selected.tipo_servicio}>{selected.tipo_servicio} (legado)</option>
                )}
                {refOptions('tipo_servicio_contrato').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Centro de Costo *</label>
              <select value={selected.centro_costo || ''} onChange={e => setSelected({ ...selected, centro_costo: e.target.value })} style={inputStyle}>
                <option value="">Seleccionar centro de costo (6 dígitos)...</option>
                {selected.centro_costo && !refOptions('centro_costo').includes(selected.centro_costo) && (
                  <option value={selected.centro_costo}>{selected.centro_costo} (legado)</option>
                )}
                {refOptions('centro_costo').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Región</label>
              <select value={selected.region || ''} onChange={e => setSelected({ ...selected, region: e.target.value, departamento: '', municipio: '' })} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Departamento</label>
              <select value={selected.departamento || ''} disabled={!selected.region} onChange={e => setSelected({ ...selected, departamento: e.target.value, municipio: '' })} style={inputStyle}>
                <option value="">{selected.region ? 'Seleccionar...' : 'Elija región'}</option>
                {selected.region && getDepartamentosByRegion(selected.region as never).map(d => <option key={d.nombre} value={d.nombre}>{d.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Municipio / Ciudad</label>
              <select value={selected.municipio || ''} disabled={!selected.departamento} onChange={e => setSelected({ ...selected, municipio: e.target.value })} style={inputStyle}>
                <option value="">{selected.departamento ? 'Seleccionar...' : 'Elija departamento'}</option>
                {selected.departamento && getMunicipiosByDepartamento(selected.departamento).map(m => <option key={m.nombre} value={m.nombre}>{m.nombre}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Dirección</label>
              <input value={selected.direccion || ''} onChange={e => setSelected({ ...selected, direccion: e.target.value })} style={inputStyle} />
            </div>
          </div>

          {/* Datos del Contrato */}
          <div style={sectionBox}>
            <p style={sectionTitle}>Datos del Contrato</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Fecha de Inicio</label>
                <input type="date" value={selected.fecha_inicio || ''} onChange={e => setSelected({ ...selected, fecha_inicio: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha de Finalización</label>
                <input type="date" value={selected.fecha_finalizacion || ''} onChange={e => setSelected({ ...selected, fecha_finalizacion: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Moneda</label>
                <select value={selected.tipo_moneda || 'Pesos Colombianos'} onChange={e => setSelected({ ...selected, tipo_moneda: e.target.value })} style={inputStyle}>
                  {(refOptions('tipo_moneda').length ? refOptions('tipo_moneda') : ['Pesos Colombianos', 'Dólares Estadounidenses', 'Euros']).map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Valor Contrato Anual</label>
                <NumeroInput value={selected.valor_anual} onChange={v => setSelected({ ...selected, valor_anual: v, valor_mensual: selected.valor_mensual || +(v / 12).toFixed(2) })} decimales={2} prefijo={getCurrencyCode(selected.tipo_moneda)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Valor Contrato Mensual</label>
                <NumeroInput value={selected.valor_mensual} onChange={n => setSelected({ ...selected, valor_mensual: n })} decimales={2} prefijo={getCurrencyCode(selected.tipo_moneda)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nro Póliza RSE</label>
                <input value={selected.nro_poliza_rse || ''} onChange={e => setSelected({ ...selected, nro_poliza_rse: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nro Póliza Cumplimiento</label>
                <input value={selected.nro_poliza_cumplimiento || ''} onChange={e => setSelected({ ...selected, nro_poliza_cumplimiento: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Representante Legal</label>
                <input value={selected.representante_legal || ''} onChange={e => setSelected({ ...selected, representante_legal: e.target.value.toUpperCase() })} style={inputUpper} />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div style={sectionBox}>
            <p style={sectionTitle}>Estado</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Situación</label>
                <select value={selected.situacion || 'Vigente'} onChange={e => setSelected({ ...selected, situacion: e.target.value })} style={inputStyle}>
                  {refOptions('situacion_contrato').map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Días de Atraso</label>
                <NumeroInput value={selected.dias_atraso} onChange={n => setSelected({ ...selected, dias_atraso: Math.max(0, Math.round(n)) })} decimales={0} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>Guardar</button>
            <button type="button" onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#64748b', color: '#fff' }}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  // ─── LISTADO ───
  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="contratos"
          label="Contratos"
          registros={contratos}
          onClear={() => useContratosStore.setState({ contratos: [] })}
          onRestore={(rs) => useContratosStore.setState({ contratos: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Contratos de Servicio</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Gestión de contratos vigentes con clientes</p>
        </div>
        {permisos.editar && (
          <button onClick={() => { const nc = nextConsecutivo('CTR-', contratos.map(c => c.codigo)); setSelected(emptyContrato(nc.codigo)); setIsForm(true) }}
            style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>+ Nuevo Contrato</button>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código, empresa, tipo de servicio o centro de costo..."
        style={{ ...inputStyle, maxWidth: 500, marginBottom: 16 }} />

      <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Código', 'Fecha', 'Empresa', 'Tipo Servicio', 'Centro Costo', 'Inicio', 'Fin', 'Valor Anual', 'Valor Mensual', 'Días Atraso', 'Situación', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>{c.codigo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{fDate(c.fecha)}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{c.cliente_nombre}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{c.tipo_servicio}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.centro_costo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{fDate(c.fecha_inicio)}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{fDate(c.fecha_finalizacion)}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{c.valor_anual ? `$${fmtMoney(c.valor_anual)}` : ''}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 12, textAlign: 'right' }}>{c.valor_mensual ? `$${fmtMoney(c.valor_mensual)}` : ''}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: c.dias_atraso > 0 ? '#fca5a5' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: c.dias_atraso > 0 ? 700 : 400, textAlign: 'center' }}>{c.dias_atraso}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...situacionStyle(c.situacion) }}>{c.situacion}</span>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setViewDetail(c)} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#ea580c', color: '#fff', border: '1px solid #f97316' }}>Ver</button>
                    {permisos.editar && <button onClick={() => { setSelected(c); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#fff', border: '1px solid #16a34a' }}>Editar</button>}
                    {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar contrato ${c.codigo}?`)) deleteContrato(c.id) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#b91c1c', color: '#fff', border: '1px solid #dc2626' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={12} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay contratos registrados</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Reportes PDF/Excel */}
      <div style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#fbbf24', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>📊 Generar Reporte de Contratos</h3>
        <ReportPanel
          title="Reporte de Contratos"
          columns={[
            { header: 'Código', key: 'codigo', width: 12 },
            { header: 'Cliente', key: 'cliente_nombre', width: 24 },
            { header: 'Tipo Servicio', key: 'tipo_servicio', width: 14 },
            { header: 'Centro de Costo', key: 'centro_costo', width: 14 },
            { header: 'Fecha Inicio', key: 'fecha_inicio', width: 10 },
            { header: 'Fecha Fin', key: 'fecha_finalizacion', width: 10 },
            { header: 'Valor Anual', key: 'valor_anual', width: 14 },
            { header: 'Valor Mensual', key: 'valor_mensual', width: 14 },
            { header: 'Situación', key: 'situacion', width: 10 },
          ]}
          rows={filtered.map(c => ({
            codigo: c.codigo, cliente_nombre: c.cliente_nombre,
            tipo_servicio: c.tipo_servicio, centro_costo: c.centro_costo,
            fecha_inicio: fDate(c.fecha_inicio), fecha_finalizacion: fDate(c.fecha_finalizacion),
            valor_anual: c.valor_anual || 0, valor_mensual: c.valor_mensual || 0,
            situacion: c.situacion,
          }))}
          summableKeys={['valor_anual', 'valor_mensual']}
        />
      </div>
    </div>
  )
}
