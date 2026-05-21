'use client'
import { logAudit, computarDiff } from '@/shared/lib/audit'
import { useState, useEffect, Fragment } from 'react'
import { useCotizacionesStore, Cotizacion, DetalleCotizacion } from '@/features/cotizaciones/store/cotizaciones-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import { useCurrentUserStore } from '@/features/usuarios-gestion/store/current-user-store'
import { useEmpresaStore } from '@/features/empresa/store/empresa-store'
import { useLineasServicioStore } from '@/features/lineas-servicio/store/lineas-servicio-store'
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


const emptyDetalle = (): DetalleCotizacion => ({
  id: crypto.randomUUID(), producto_id: '', codigo_producto: '', descripcion: '', descripcion_extendida: '',
  cantidad: 1, precio_unitario: 0, unidad_medida: 'Unidad', descuento_pct: 0, subtotal: 0,
})

const emptyCotizacion = (codigo: string, nro: number, responsable: string): Cotizacion => ({
  id: '', codigo, nro,
  linea_servicio_id: '', linea_servicio_codigo: '', linea_servicio_nombre: '', pct_aiu: 0,
  tipo_servicio: '',
  nro_cotizacion_interno: '',
  fecha_emision: '',
  fecha_vencimiento: '', cliente_id: '', cliente_nombre: '', contacto_id: '', contacto_nombre: '',
  oportunidad_id: '', oportunidad_nombre: '', tipo_moneda: 'Pesos Colombianos',
  condicion_pago: 'Contado', pct_impuesto: 19, pct_ica: 0,
  observaciones: '', detalles: [emptyDetalle()],
  situacion: 'En Construcción', responsable, vendedor: '', fecha_registro: todayColombia(), seguimientos: [],
})

/**
 * Calcula los totales de la cotización.
 * - Subtotal: suma de subtotales de líneas
 * - IVA: subtotal × pct_impuesto%   (se SUMA)
 * - ICA: subtotal × pct_ica%        (se RESTA porque es retención)
 * - Total General = Subtotal + IVA − ICA
 */
const calcTotals = (detalles: DetalleCotizacion[], pctIva: number, pctIca: number = 0) => {
  const subtotal = detalles.reduce((s, d) => s + d.subtotal, 0)
  const impuesto = subtotal * (pctIva / 100)
  const ica = subtotal * (pctIca / 100)
  const total = subtotal + impuesto - ica
  return { subtotal, impuesto, ica, total }
}

export default function CotizacionesPage() {
  const permisos = usePermisos('cotizaciones')
  const currentUser = useCurrentUserStore(s => s.user)
  const { cotizaciones, addCotizacion, updateCotizacion, deleteCotizacion } = useCotizacionesStore()
  const allClientes = useClientesStore(s => s.clientes)
  const clientes = allClientes.filter(c => c.situacion === 'Activo')
  const allContactos = useContactosStore(s => s.contactos).filter(c => c.situacion === 'Activo')
  const oportunidades = useOportunidadesStore(s => s.oportunidades)
  const productos = useProductosStore(s => s.productos).filter(p => p.situacion === 'Activo')
  const refData = useReferenceStore(s => s.data)
  const vendedores = useReferenceStore(s => s.vendedores).filter(v => v.situacion)
  const empresas = useEmpresaStore(s => s.empresas)
  const empresa = empresas[0]
  const lineasServicio = useLineasServicioStore(s => s.lineas).filter(l => l.situacion === 'Activo')

  const [selected, setSelected] = useState<Cotizacion | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [viewDetail, setViewDetail] = useState<Cotizacion | null>(null)
  const [tab, setTab] = useState<'registros' | 'reportes'>('registros')
  const [search, setSearch] = useState('')
  const [filtroLinea, setFiltroLinea] = useState('')
  const [searchProd, setSearchProd] = useState('')
  const [showProductos, setShowProductos] = useState(false)
  const [tipoAgregar, setTipoAgregar] = useState<'Servicio' | 'Producto' | null>(null)
  const { pendingSearch, pendingAction, clearPending } = useAsistenteStore()
  useEffect(() => {
    if (pendingSearch) setSearch(pendingSearch)
    if (pendingAction === 'nuevo') { setSelected(emptyCotizacion('', 0, `${currentUser?.nombre} ${currentUser?.apellido}`)); setIsForm(true) }
    if (pendingSearch || pendingAction) clearPending()
  }, [])
  const [emailModal, setEmailModal] = useState<Cotizacion | null>(null)
  const [emailTo, setEmailTo] = useState('')
  const [emailAsunto, setEmailAsunto] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [sending, setSending] = useState(false)

  const filtered = cotizaciones.filter(c => {
    if (filtroLinea && c.linea_servicio_codigo !== filtroLinea) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.codigo.toLowerCase().includes(q) || c.cliente_nombre.toLowerCase().includes(q)
  })

  const recalcDetalle = (d: DetalleCotizacion): DetalleCotizacion => {
    const bruto = d.cantidad * d.precio_unitario
    const desc = bruto * (d.descuento_pct / 100)
    return { ...d, subtotal: bruto - desc }
  }

  const updateDetalle = (idx: number, field: string, value: string | number) => {
    if (!selected) return
    const detalles = [...selected.detalles]
    detalles[idx] = recalcDetalle({ ...detalles[idx], [field]: value })
    setSelected({ ...selected, detalles })
  }

  const removeDetalle = (idx: number) => {
    if (!selected) return
    const detalles = selected.detalles.filter((_, i) => i !== idx)
    setSelected({ ...selected, detalles: detalles.length ? detalles : [emptyDetalle()] })
  }

  const auditParams = () => ({
    usuario: currentUser?.usuario || 'desconocido',
    usuario_nombre: `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
    rol: currentUser?.rol || '',
    modulo: 'cotizaciones',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (!selected.linea_servicio_id) { alert('Debe seleccionar una línea de servicio'); return }
    const cli = clientes.find(c => c.id === selected.cliente_id)
    const con = allContactos.find(c => c.id === selected.contacto_id)
    const opo = oportunidades.find(o => o.id === selected.oportunidad_id)
    const toSave = {
      ...selected,
      cliente_nombre: cli?.razon_social || selected.cliente_nombre,
      contacto_nombre: con ? `${con.nombre} ${con.apellido}` : selected.contacto_nombre,
      oportunidad_nombre: opo?.nombre || selected.oportunidad_nombre,
    }
    if (toSave.id) { const _anterior = cotizaciones.find(x => x.id === toSave.id); updateCotizacion(toSave.id, toSave); logAudit({ ...auditParams(), accion: "MODIFICAR", registro_codigo: toSave.codigo, registro_nombre: toSave.cliente_nombre, detalle: computarDiff(_anterior as unknown as Record<string, unknown>, toSave as unknown as Record<string, unknown>) }) }
    else { addCotizacion({ ...toSave, id: crypto.randomUUID() }) }
    setIsForm(false); setSelected(null)
  }

  const handleSendEmail = async () => {
    if (!emailModal || !emailTo) return
    setSending(true)
    try {
      const cli = clientes.find(c => c.id === emailModal.cliente_id)
      const clienteData = cli ? {
        razon_social: cli.razon_social,
        tipo_identificacion: cli.tipo_identificacion,
        nro_documento: cli.nro_documento,
        direccion: cli.direccion,
        ciudad: cli.ciudad,
        pais: cli.pais,
      } : null
      const empresaData = empresa ? {
        nombre: empresa.nombre,
        nro_documento: empresa.nro_documento,
        direccion: empresa.direccion,
        ciudad: empresa.ciudad,
      } : null
      const res = await fetch('/api/send-cotizacion-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, asunto: emailAsunto || `Cotización ${emailModal.codigo}`, mensaje: emailMsg, cotizacion: emailModal, cliente: clienteData, empresa: empresaData }),
      })
      const data = await res.json()
      if (data.success) {
        updateCotizacion(emailModal.id, { situacion: 'Enviada' })
        alert('Cotización enviada correctamente')
        setEmailModal(null)
      } else {
        alert(data.error || 'Error al enviar')
      }
    } catch { alert('Error de conexión') }
    finally { setSending(false) }
  }

  const generatePDF = (cot: Cotizacion) => {
    const { subtotal, ica, impuesto, total } = calcTotals(cot.detalles, cot.pct_impuesto, cot.pct_ica)
    const cli = clientes.find(c => c.id === cot.cliente_id)
    const rows = cot.detalles.map((d, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px">${d.codigo_producto}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${d.descripcion}${d.descripcion_extendida ? `<div style="color:#6b7280;font-size:11px;margin-top:4px;white-space:pre-wrap;line-height:1.4">${d.descripcion_extendida}</div>` : ''}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${d.cantidad}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${d.unidad_medida}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(d.precio_unitario)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${d.descuento_pct}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(d.subtotal)}</td>
      </tr>`).join('')
    const emp = empresa
    const html = `<!DOCTYPE html><html><head><title>Cotización ${cot.codigo}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial;font-size:13px;padding:32px}</style></head><body>
      <div style="display:flex;justify-content:space-between;border-bottom:3px solid #1e1b4b;padding-bottom:20px;margin-bottom:24px">
        <div>
          ${emp ? `<h2 style="font-size:18px;color:#1e1b4b;font-weight:800">${emp.nombre}</h2>
          <p style="color:#6b7280;font-size:12px">${emp.direccion || ''}${emp.ciudad ? ', ' + emp.ciudad : ''}</p>
          <p style="color:#6b7280;font-size:12px">NIT: ${emp.nro_documento || ''}</p>` : ''}
          <h1 style="font-size:22px;color:#8b0000;margin-top:12px;font-weight:900">COTIZACIÓN</h1>
          <p style="font-family:monospace;font-size:18px;font-weight:900;color:#8b0000">${cot.codigo}</p>
          ${cot.linea_servicio_nombre ? `<p style="font-size:12px;color:#1e3a8a;font-weight:700;margin-top:4px">Línea: ${cot.linea_servicio_nombre}</p>` : ''}
        </div>
        <div style="text-align:right"><p style="font-size:16px;font-weight:600;color:#1e3a8a">Fecha: ${fDate(cot.fecha_emision)}</p><p style="font-size:16px;font-weight:600;color:#1e3a8a">Vence: ${fDate(cot.fecha_vencimiento)}</p></div>
      </div>
      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #e5e7eb">
        <p style="color:#1e3a8a;font-size:11px;font-weight:700;margin-bottom:8px;font-weight:700">DATOS DEL CLIENTE</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">EMPRESA</p><p style="font-weight:700">${cot.cliente_nombre}</p></div>
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">TIPO ID / NRO DOCUMENTO</p><p style="font-weight:700">${cli?.tipo_identificacion || '—'} ${cli?.nro_documento || '—'}</p></div>
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">DIRECCIÓN</p><p>${cli?.direccion || '—'}</p></div>
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">CIUDAD</p><p>${cli?.ciudad || '—'}</p></div>
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">PAÍS</p><p>${cli?.pais || '—'}</p></div>
          <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">CONTACTO</p><p>${cot.contacto_nombre || '—'}</p></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">
        <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">CONDICIÓN DE PAGO</p><p>${cot.condicion_pago}</p></div>
        <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">MONEDA</p><p>${cot.tipo_moneda || 'Pesos Colombianos'}</p></div>
        <div><p style="color:#1e3a8a;font-size:11px;font-weight:700">VENDEDOR</p><p>${cot.vendedor || '—'}</p></div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead><tr style="background:#1e1b4b">
          ${['Código','Descripción','Cant.','Unidad','Precio Unit.','Desc.','Subtotal'].map(h => `<th style="padding:10px 12px;color:#fff;font-size:11px;text-align:left">${h}</th>`).join('')}
        </tr></thead><tbody>${rows}</tbody>
      </table>
      <div style="text-align:right;margin-bottom:24px">
        <p>Subtotal: <strong>${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(subtotal)}</strong></p>
        <br/>
        ${cot.pct_ica > 0 ? `<p>ICA (${cot.pct_ica}%): <strong>− ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(ica)}</strong></p><br/>` : ''}
        <p>Impuesto (${cot.pct_impuesto}%): <strong>${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(impuesto)}</strong></p>
        <br/>
        <p style="font-size:18px;color:#1e1b4b;border-top:2px solid #1e1b4b;padding-top:8px;margin-top:4px">TOTAL GENERAL: <strong>${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(total)}</strong></p>
      </div>
      ${cot.observaciones ? `<div style="background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:24px"><p style="color:#1e3a8a;font-size:11px;font-weight:700">OBSERVACIONES</p><p>${cot.observaciones}</p></div>` : ''}
      ${cot.situacion === 'Anulada' ? `<div style="text-align:center;margin:32px 0;padding:24px;border:6px solid #dc2626;border-radius:12px;background:rgba(220,38,38,0.05)"><p style="color:#dc2626;font-size:64px;font-weight:900;letter-spacing:8px;margin:0;text-shadow:2px 2px 0 rgba(220,38,38,0.2)">A N U L A D A</p></div>` : ''}
      <div style="display:flex;justify-content:space-around;margin-top:40px">
        <div style="text-align:center;width:200px"><div style="border-top:1px solid #000;padding-top:4px;font-size:11px">Elaborado por</div><p style="font-weight:700;font-size:11px">${cot.vendedor || cot.responsable}</p></div>
        <div style="text-align:center;width:200px"><div style="border-top:1px solid #000;padding-top:4px;font-size:11px">Aprobado por</div></div>
      </div>
      <script>window.onload=()=>window.print()<\/script></body></html>`
    const win = window.open('', '_blank', 'width=900,height=700')
    if (win) { win.document.write(html); win.document.close() }
  }

  const statusStyle = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'Borrador': { background: 'rgba(156,163,175,0.2)', color: '#d1d5db', border: '1px solid rgba(156,163,175,0.3)' },
      'En Construcción': { background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' },
      'Anulada': { background: 'rgba(120,53,15,0.3)', color: '#fcd34d', border: '1px solid rgba(180,83,9,0.5)', textDecoration: 'line-through' },
      'Enviada': { background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' },
      'Aprobada': { background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' },
      'Rechazada': { background: '#b91c1c', color: '#ffffff', border: '1px solid #dc2626' },
      'Vencida': { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' },
    }
    return map[s] || {}
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({ ...btnStyle, background: active ? '#1e3a8a' : 'rgba(255,255,255,0.15)', color: active ? '#ffffff' : 'rgba(255,255,255,0.7)', border: active ? '1px solid #2563eb' : '1px solid rgba(255,255,255,0.2)' })
  const refOptions = (table: string) => (refData[table as keyof typeof refData] || []).filter(r => r.situacion).map(r => r.descripcion)

  const sendWhatsApp = (cot: Cotizacion) => {
    const contacto = allContactos.find(c => c.id === cot.contacto_id)
    const cliente = clientes.find(c => c.id === cot.cliente_id)
    const celular = contacto?.celular || cliente?.telefono || ''
    if (!celular) { alert('No se encontró número de celular del contacto o empresa'); return }
    const numero = celular.replace(/[^0-9]/g, '')
    const { subtotal, ica, impuesto, total } = calcTotals(cot.detalles, cot.pct_impuesto, cot.pct_ica)
    const items = cot.detalles.map(d => `  - ${d.descripcion}: ${d.cantidad} x ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(d.precio_unitario)} = ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(d.subtotal)}`).join('\n')
    const mensaje = `Hola, le enviamos la cotización *${cot.codigo}*\n\n` +
      `*Empresa:* ${cot.cliente_nombre}\n` +
      (cot.linea_servicio_nombre ? `*Línea:* ${cot.linea_servicio_nombre}\n` : '') +
      `*Fecha:* ${fDate(cot.fecha_emision)}\n` +
      `*Condición de Pago:* ${cot.condicion_pago}\n` +
      `*Moneda:* ${cot.tipo_moneda}\n\n` +
      `*Detalle:*\n${items}\n\n` +
      `*Subtotal:* ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(subtotal)}\n` +
      (cot.pct_ica > 0 ? `*ICA (${cot.pct_ica}%) [retención]:* − ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(ica)}\n` : '') +
      `*Impuesto (${cot.pct_impuesto}%):* ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(impuesto)}\n` +
      `*TOTAL: ${getCurrencyCode(cot.tipo_moneda)} ${fmtMoney(total)}*\n\n` +
      (cot.observaciones ? `_${cot.observaciones}_\n\n` : '') +
      `Vendedor: ${cot.vendedor || cot.responsable}`
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const contactosDelCliente = selected ? allContactos.filter(c => c.cliente_id === selected.cliente_id) : []
  const oposDelCliente = selected ? oportunidades.filter(o => o.cliente_id === selected.cliente_id) : []

  // ── EMAIL MODAL ──
  if (emailModal) {
    const cli = clientes.find(c => c.id === emailModal.cliente_id)
    const con = allContactos.find(c => c.id === emailModal.contacto_id)
    return (
      <div>
        <button onClick={() => setEmailModal(null)} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)', maxWidth: 500 }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Enviar {emailModal.codigo} por Email</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Para *</label>
              <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder={con?.email || cli?.email || 'correo@ejemplo.com'} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Asunto</label>
              <input value={emailAsunto} onChange={e => setEmailAsunto(e.target.value)} placeholder={`Cotización ${emailModal.codigo}`} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mensaje</label>
              <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)} rows={4} placeholder="Mensaje adicional..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button onClick={handleSendEmail} disabled={sending || !emailTo}
              style={{ ...btnStyle, background: sending ? '#16a34a' : '#22c55e', color: '#ffffff', marginTop: 8 }}>
              {sending ? 'Enviando...' : 'Enviar Cotización'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── VIEW DETAIL ──
  if (viewDetail) {
    const { subtotal, ica, impuesto, total } = calcTotals(viewDetail.detalles, viewDetail.pct_impuesto, viewDetail.pct_ica)
    return (
      <div>
        <button onClick={() => setViewDetail(null)} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          {empresa && (
            <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 800 }}>{empresa.nombre}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{empresa.direccion}{empresa.ciudad ? ', ' + empresa.ciudad : ''}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>NIT: {empresa.nro_documento}</p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>{viewDetail.codigo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{viewDetail.cliente_nombre}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {viewDetail.linea_servicio_codigo && (() => {
                const linea = lineasServicio.find(l => l.codigo === viewDetail.linea_servicio_codigo)
                return <span title={viewDetail.linea_servicio_nombre} style={{ background: linea?.color || '#475569', color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{viewDetail.linea_servicio_codigo} — {viewDetail.linea_servicio_nombre}</span>
              })()}
              <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, ...statusStyle(viewDetail.situacion) }}>{viewDetail.situacion}</span>
            </div>
          </div>
          {(() => {
            const cli = clientes.find(c => c.id === viewDetail.cliente_id)
            return (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14, marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>DATOS DEL CLIENTE</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                  {[
                    { l: 'Empresa', v: viewDetail.cliente_nombre },
                    { l: 'Tipo ID', v: cli?.tipo_identificacion },
                    { l: 'Nro Documento', v: cli?.nro_documento },
                    { l: 'Dirección', v: cli?.direccion },
                    { l: 'Ciudad', v: cli?.ciudad },
                    { l: 'País', v: cli?.pais },
                    { l: 'Contacto', v: viewDetail.contacto_nombre },
                  ].map(f => (
                    <div key={f.l}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{f.l}</p><p style={{ color: '#ffffff', fontSize: 13 }}>{f.v || '—'}</p></div>
                  ))}
                </div>
              </div>
            )
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { l: 'Emisión', v: fDate(viewDetail.fecha_emision) }, { l: 'Vencimiento', v: fDate(viewDetail.fecha_vencimiento) },
              { l: 'Condición Pago', v: viewDetail.condicion_pago },
              { l: 'Vendedor', v: viewDetail.vendedor },
              { l: 'Oportunidad', v: viewDetail.oportunidad_nombre },
            ].map(f => (
              <div key={f.l}><p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{f.l}</p><p style={{ color: '#ffffff', fontSize: 13 }}>{f.v || '—'}</p></div>
            ))}
          </div>

          {/* Detalles table */}
          <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Código', 'Descripción', 'Cant.', 'Unidad', 'Precio Unit.', 'Desc.%', 'Subtotal'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', background: '#1e3a5f', color: '#fff', fontSize: 11, textAlign: 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {viewDetail.detalles.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 12, fontFamily: 'monospace' }}>{d.codigo_producto}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 12 }}>
                      <div>{d.descripcion}</div>
                      {d.descripcion_extendida && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{d.descripcion_extendida}</div>}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 12, textAlign: 'center' }}>{d.cantidad}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>{d.unidad_medida}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 12, textAlign: 'right' }}>{getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(d.precio_unitario)}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>{d.descuento_pct}%</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>{getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Subtotal: <span style={{ color: '#ffffff', fontWeight: 600 }}>{getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(subtotal)}</span></p>
            {viewDetail.pct_ica > 0 && <>
              <div style={{ height: 12 }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>ICA ({viewDetail.pct_ica}%) [retención]: <span style={{ color: '#fca5a5', fontWeight: 600 }}>− {getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(ica)}</span></p>
            </>}
            <div style={{ height: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Impuesto ({viewDetail.pct_impuesto}%): <span style={{ color: '#ffffff', fontWeight: 600 }}>{getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(impuesto)}</span></p>
            <div style={{ height: 12 }} />
            <p style={{ color: '#4ade80', fontSize: 18, fontWeight: 800, borderTop: '2px solid rgba(255,255,255,0.2)', paddingTop: 8 }}>TOTAL GENERAL: {getCurrencyCode(viewDetail.tipo_moneda)} {fmtMoney(total)}</p>
          </div>

          {viewDetail.observaciones && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 }}>Observaciones: {viewDetail.observaciones}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => generatePDF(viewDetail)} style={{ ...btnStyle, background: '#b91c1c', color: '#ffffff', border: '1px solid #dc2626' }}>PDF</button>
            <button onClick={() => { setEmailTo(''); setEmailAsunto(''); setEmailMsg(''); setEmailModal(viewDetail) }} style={{ ...btnStyle, background: '#1e3a8a', color: '#ffffff', border: '1px solid #2563eb' }}>Enviar por Email</button>
            <button onClick={() => sendWhatsApp(viewDetail)} style={{ ...btnStyle, background: '#25d366', color: '#ffffff', border: '1px solid #22c55e' }}>WhatsApp</button>
            {permisos.editar && !['Aprobada', 'Rechazada'].includes(viewDetail.situacion) && (
              <button onClick={() => { setSelected(viewDetail); setIsForm(true); setViewDetail(null) }} style={{ ...btnStyle, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' }}>Editar</button>
            )}
          </div>
          <SeguimientoPanel
            seguimientos={viewDetail.seguimientos || []}
            usuario={`${currentUser?.nombre} ${currentUser?.apellido}`}
            situacionActual={viewDetail.situacion}
            situacionOpciones={refData.situacion_cotizacion.filter(r => r.situacion).map(r => r.descripcion)}
            onAdd={(seg: Seguimiento) => {
              const updated = { ...viewDetail, situacion: seg.situacion, seguimientos: [...(viewDetail.seguimientos || []), seg] }
              updateCotizacion(viewDetail.id, updated)
              setViewDetail(updated)
            }}
          />
          <DocumentosPanel modulo="cotizaciones" registroId={viewDetail.id} />
        </div>
      </div>
    )
  }

  // ── FORM ──
  if (isForm && selected) {
    const { subtotal, ica, impuesto, total } = calcTotals(selected.detalles, selected.pct_impuesto, selected.pct_ica)
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000000', color: '#ffffff', border: '1px solid #333333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>{selected.id ? 'Editar' : 'Nueva'} Cotización Nro {selected.codigo}</h2>

          {/* Header fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={selected.codigo} readOnly placeholder="Se genera al elegir línea de servicio" style={{ ...inputStyle, opacity: 0.6, fontFamily: 'monospace', fontWeight: 700 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de Registro</label>
              <input value={fDate(selected.fecha_registro)} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Emisión *</label>
              <input type="date" value={selected.fecha_emision} onChange={e => setSelected({ ...selected, fecha_emision: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fecha Vencimiento</label>
              <input type="date" value={selected.fecha_vencimiento} onChange={e => setSelected({ ...selected, fecha_vencimiento: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Línea de Servicio *</label>
              <select value={selected.linea_servicio_id} onChange={e => {
                const linea = lineasServicio.find(l => l.id === e.target.value)
                if (!linea) {
                  setSelected({ ...selected, linea_servicio_id: '', linea_servicio_codigo: '', linea_servicio_nombre: '', codigo: '', nro: 0 })
                  return
                }
                // Generar consecutivo independiente por línea
                const codigosLinea = cotizaciones.filter(c => c.linea_servicio_codigo === linea.codigo).map(c => c.codigo)
                const nc = nextConsecutivo(linea.prefijo_cotizacion, codigosLinea)
                setSelected({
                  ...selected,
                  linea_servicio_id: linea.id,
                  linea_servicio_codigo: linea.codigo,
                  linea_servicio_nombre: linea.nombre,
                  codigo: nc.codigo,
                  nro: nc.nro,
                  pct_impuesto: linea.iva_default,
                  pct_ica: linea.aiu_default,
                })
              }} required disabled={!!selected.id} style={inputStyle}>
                <option value="">Seleccionar línea de servicio...</option>
                {lineasServicio.map(l => <option key={l.id} value={l.id}>{l.codigo} — {l.nombre}</option>)}
              </select>
              {selected.linea_servicio_codigo && (
                <p style={{ color: '#4ade80', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>Código asignado: {selected.codigo}</p>
              )}
            </div>

            {/* 4) Cliente con datos auto (dirección/ciudad/país) · 5) Contacto */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Cliente *</label>
              <select value={selected.cliente_id} onChange={e => {
                const cli = clientes.find(c => c.id === e.target.value)
                setSelected({ ...selected, cliente_id: e.target.value, cliente_nombre: cli?.razon_social || '', contacto_id: '', contacto_nombre: '', oportunidad_id: '', oportunidad_nombre: '' })
              }} required style={inputStyle}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Contacto</label>
              <select value={selected.contacto_id} onChange={e => {
                const con = contactosDelCliente.find(c => c.id === e.target.value)
                setSelected({ ...selected, contacto_id: e.target.value, contacto_nombre: con ? `${con.nombre} ${con.apellido}` : '' })
              }} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {contactosDelCliente.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>
            {selected.cliente_id && (() => {
              const cli =
                allClientes.find(c => c.id === selected.cliente_id) ||
                allClientes.find(c => c.razon_social === selected.cliente_nombre)
              return (
                <div style={{ gridColumn: 'span 3', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, padding: 12 }}>
                  <p style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>DATOS DEL CLIENTE (auto)</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { l: 'Tipo ID', v: cli?.tipo_identificacion },
                      { l: 'Nro Documento', v: cli?.nro_documento },
                      { l: 'Dirección', v: cli?.direccion },
                      { l: 'Ciudad', v: cli?.ciudad },
                      { l: 'País', v: cli?.pais },
                    ].map(f => (
                      <div key={f.l}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{f.l}</p>
                        <p style={{ color: '#ffffff', fontSize: 12, fontWeight: 600 }}>{f.v || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* 6) Condición de Pago · 7) Vendedor · 8) Tipo Moneda */}
            <div>
              <label style={labelStyle}>Condición de Pago</label>
              <select value={selected.condicion_pago} onChange={e => setSelected({ ...selected, condicion_pago: e.target.value })} style={inputStyle}>
                {refOptions('condiciones_pago').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vendedor</label>
              <select value={selected.vendedor} onChange={e => setSelected({ ...selected, vendedor: e.target.value })} style={inputStyle}>
                <option value="">Seleccionar...</option>
                {vendedores.map(v => <option key={v.id} value={`${v.nombre} ${v.apellido}`}>{v.nombre} {v.apellido}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo Moneda</label>
              <select value={selected.tipo_moneda} onChange={e => setSelected({ ...selected, tipo_moneda: e.target.value })} style={inputStyle}>
                {refOptions('tipo_moneda').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Oportunidad opcional + impuestos */}
            <div>
              <label style={labelStyle}>Oportunidad (opcional)</label>
              <select value={selected.oportunidad_id} onChange={e => {
                const opo = oportunidades.find(o => o.id === e.target.value)
                setSelected({ ...selected, oportunidad_id: e.target.value, oportunidad_nombre: opo?.nombre || '' })
              }} style={inputStyle}>
                <option value="">Ninguna</option>
                {(oposDelCliente.length > 0 ? oposDelCliente : oportunidades).map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>% IVA</label>
              <NumeroInput value={selected.pct_impuesto} onChange={n => setSelected({ ...selected, pct_impuesto: n })} decimales={2} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>% ICA (retención)</label>
              <NumeroInput value={selected.pct_ica} onChange={n => setSelected({ ...selected, pct_ica: n })} decimales={2} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nro Cotización Interno</label>
              <input value={selected.nro_cotizacion_interno || ''} onChange={e => setSelected({ ...selected, nro_cotizacion_interno: e.target.value.toUpperCase() })} placeholder="Ej: 2026-VENTAS-042" style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Situación</label>
              <select value={selected.situacion} onChange={e => setSelected({ ...selected, situacion: e.target.value })} style={inputStyle}>
                {refOptions('situacion_cotizacion').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Buscar y agregar producto/servicio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, margin: 0 }}>Detalle de Productos y Servicios</h3>
            <button type="button" onClick={() => { setShowProductos(!showProductos); setSearchProd(''); setTipoAgregar(null) }}
              style={{ padding: '8px 18px', borderRadius: 8, background: showProductos ? '#dc2626' : '#1e3a8a', color: '#ffffff', border: showProductos ? '1px solid #ef4444' : '1px solid #2563eb', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {showProductos ? '✕ Cerrar' : '+ Agregar Item'}
            </button>
          </div>
          {showProductos && !tipoAgregar && (
            <div style={{ marginBottom: 12, padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>¿Qué deseas agregar?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setTipoAgregar('Servicio'); setSearchProd('') }}
                  style={{ flex: 1, padding: '14px 18px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '2px solid rgba(59,130,246,0.4)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🛡️ Servicio
                </button>
                <button type="button" onClick={() => { setTipoAgregar('Producto'); setSearchProd('') }}
                  style={{ flex: 1, padding: '14px 18px', borderRadius: 10, background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '2px solid rgba(168,85,247,0.4)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  📦 Producto
                </button>
              </div>
            </div>
          )}
          {showProductos && tipoAgregar && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ background: tipoAgregar === 'Servicio' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)', color: tipoAgregar === 'Servicio' ? '#93c5fd' : '#d8b4fe', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  {tipoAgregar === 'Servicio' ? '🛡️ Servicios' : '📦 Productos'}
                </span>
                <button type="button" onClick={() => { setTipoAgregar(null); setSearchProd('') }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                  Cambiar tipo
                </button>
              </div>
              <input value={searchProd} onChange={e => setSearchProd(e.target.value)} placeholder={`Buscar ${tipoAgregar.toLowerCase()} por código o descripción...`} style={{ ...inputStyle, maxWidth: 500, marginBottom: 8 }} autoFocus />
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, maxHeight: 220, overflow: 'auto' }}>
                {productos.filter(p => p.situacion === 'Activo').filter(p => !tipoAgregar || p.tipo === tipoAgregar).filter(p => !selected?.linea_servicio_codigo || !p.linea_servicio_codigo || p.linea_servicio_codigo === selected.linea_servicio_codigo).filter(p => !searchProd || p.descripcion.toLowerCase().includes(searchProd.toLowerCase()) || p.codigo.toLowerCase().includes(searchProd.toLowerCase())).slice(0, 20).map(p => (
                  <div key={p.id} onClick={() => {
                    if (!selected) return
                    const nuevo = recalcDetalle({ id: crypto.randomUUID(), producto_id: p.id, codigo_producto: p.codigo, descripcion: p.descripcion, descripcion_extendida: '', cantidad: 1, precio_unitario: p.precio_unitario, unidad_medida: p.unidad_medida, descuento_pct: 0, subtotal: 0 })
                    const detalles = selected.detalles.filter(d => d.producto_id)
                    setSelected({ ...selected, detalles: [...detalles, nuevo] })
                    setTipoAgregar(null)
                    setSearchProd('')
                  }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 12, color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span><span style={{ color: '#4ade80', fontFamily: 'monospace', marginRight: 8 }}>{p.codigo}</span>{p.descripcion}</span>
                    <span style={{ color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12 }}>{getCurrencyCode(p.tipo_moneda)} {fmtMoney(p.precio_unitario)}</span>
                  </div>
                ))}
                {productos.filter(p => p.situacion === 'Activo').filter(p => !searchProd || p.descripcion.toLowerCase().includes(searchProd.toLowerCase()) || p.codigo.toLowerCase().includes(searchProd.toLowerCase())).length === 0 && (
                  <div style={{ padding: '16px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>No se encontraron productos</div>
                )}
              </div>
            </div>
          )}

          {/* Tabla de items */}
          {selected.detalles.filter(d => d.producto_id).length > 0 && (
            <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['Código', 'Tipo', 'Descripción', 'Cant.', 'Unidad', 'Precio Unit.', 'Desc.%', 'Subtotal', ''].map(h => (
                    <th key={h} style={{ padding: '8px 10px', background: '#1e3a5f', color: '#fff', fontSize: 11, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {selected.detalles.filter(d => d.producto_id).map((d, idx) => {
                    const realIdx = selected.detalles.findIndex(x => x.id === d.id)
                    const prod = productos.find(p => p.id === d.producto_id)
                    const tipo = prod?.tipo
                    const rowBg = idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'
                    return (
                      <Fragment key={d.id}>
                      <tr style={{ background: rowBg }}>
                        <td style={{ padding: '6px 8px', borderBottom: 'none', color: '#4ade80', fontSize: 12, fontFamily: 'monospace', width: 100 }}>{d.codigo_producto}</td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: 80 }}>
                          {tipo && <span style={{ background: tipo === 'Servicio' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)', color: tipo === 'Servicio' ? '#93c5fd' : '#d8b4fe', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{tipo === 'Servicio' ? '🛡️' : '📦'} {tipo}</span>}
                        </td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 12 }}>{d.descripcion}</td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: 80 }}>
                          <NumeroInput value={d.cantidad} onChange={n => updateDetalle(realIdx, 'cantidad', Math.max(1, Math.round(n)))} decimales={0} style={{ ...inputStyle, fontSize: 12, padding: '4px 6px', textAlign: 'center', height: 'auto' }} />
                        </td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, width: 70 }}>{d.unidad_medida}</td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: 110 }}>
                          <NumeroInput value={d.precio_unitario} onChange={n => updateDetalle(realIdx, 'precio_unitario', n)} decimales={2} style={{ ...inputStyle, fontSize: 12, padding: '4px 6px', textAlign: 'right', height: 'auto' }} />
                        </td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: 70 }}>
                          <NumeroInput value={d.descuento_pct} onChange={n => updateDetalle(realIdx, 'descuento_pct', Math.min(100, n))} decimales={2} style={{ ...inputStyle, fontSize: 12, padding: '4px 6px', textAlign: 'center', height: 'auto' }} />
                        </td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 12, fontWeight: 600, textAlign: 'right', width: 110 }}>{getCurrencyCode(selected.tipo_moneda)} {fmtMoney(d.subtotal)}</td>
                        <td style={{ padding: '6px 8px', borderBottom: 'none', width: 40 }}>
                          <button type="button" onClick={() => removeDetalle(realIdx)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </td>
                      </tr>
                      <tr style={{ background: rowBg }}>
                        <td colSpan={9} style={{ padding: '4px 12px 10px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, display: 'block', marginBottom: 3 }}>Descripción extendida (opcional)</label>
                          <textarea
                            value={d.descripcion_extendida || ''}
                            onChange={e => updateDetalle(realIdx, 'descripcion_extendida', e.target.value)}
                            placeholder="Detalle adicional del servicio o producto, condiciones, alcance, etc."
                            rows={Math.max(2, Math.min(10, Math.ceil(((d.descripcion_extendida || '').length + 1) / 90) + (d.descripcion_extendida?.split('\n').length || 1) - 1))}
                            style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', resize: 'vertical', lineHeight: 1.4, minHeight: 40 }}
                          />
                        </td>
                      </tr>
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Subtotal: <span style={{ color: '#ffffff', fontWeight: 600 }}>{getCurrencyCode(selected.tipo_moneda)} {fmtMoney(subtotal)}</span></p>
            {selected.pct_ica > 0 && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>ICA ({selected.pct_ica}%) [retención]: <span style={{ color: '#fca5a5', fontWeight: 600 }}>− {getCurrencyCode(selected.tipo_moneda)} {fmtMoney(ica)}</span></p>}
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Impuesto ({selected.pct_impuesto}%): <span style={{ color: '#ffffff', fontWeight: 600 }}>{getCurrencyCode(selected.tipo_moneda)} {fmtMoney(impuesto)}</span></p>
            <p style={{ color: '#4ade80', fontSize: 18, fontWeight: 800, marginTop: 4 }}>TOTAL: {getCurrencyCode(selected.tipo_moneda)} {fmtMoney(total)}</p>
          </div>

          <div style={{ gridColumn: 'span 3', marginBottom: 16 }}>
            <label style={labelStyle}>Observaciones</label>
            <textarea value={selected.observaciones} onChange={e => setSelected({ ...selected, observaciones: e.target.value.toUpperCase() })} rows={3} style={{ ...inputUpper, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ ...btnStyle, background: '#0f1b3d', color: '#ffffff' }}>Guardar</button>
            <button type="button" onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#64748b', color: '#ffffff' }}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  // ── REPORT DATA ──
  const reportColumns = [
    { header: 'Código', key: 'codigo', width: 12 },
    { header: 'Empresa', key: 'cliente_nombre', width: 22 },
    { header: 'Emisión', key: 'emision', width: 10 },
    { header: 'Vence', key: 'vence', width: 10 },
    { header: 'Items', key: 'items', width: 6 },
    { header: 'Total', key: 'total', width: 14 },
    { header: 'Situación', key: 'situacion', width: 10 },
  ]
  const reportRows = filtered.map(c => {
    const { total } = calcTotals(c.detalles, c.pct_impuesto, c.pct_ica)
    return {
      codigo: c.codigo, cliente_nombre: c.cliente_nombre, emision: fDate(c.fecha_emision),
      vence: fDate(c.fecha_vencimiento), items: c.detalles.length, total,
      situacion: c.situacion,
    }
  })

  // ── MAIN VIEW ──
  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="cotizaciones"
          label="Cotizaciones"
          registros={cotizaciones}
          onClear={() => useCotizacionesStore.setState({ cotizaciones: [] })}
          onRestore={(rs) => useCotizacionesStore.setState({ cotizaciones: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Cotizaciones</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Gestión de cotizaciones comerciales</p>
        </div>
        {permisos.editar && tab === 'registros' && (
          <button onClick={() => { setSelected(emptyCotizacion('', 0, `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`)); setIsForm(true) }} style={{ ...btnStyle, background: '#0f1b3d', color: '#ffffff' }}>+ Nueva Cotización</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('registros')} style={tabBtnStyle(tab === 'registros')}>📋 Registros</button>
        <button onClick={() => setTab('reportes')} style={tabBtnStyle(tab === 'reportes')}>📊 Reportes</button>
      </div>

      {tab === 'registros' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o empresa..."
              style={{ ...inputStyle, maxWidth: 400 }} />
            <select value={filtroLinea} onChange={e => setFiltroLinea(e.target.value)} style={{ ...inputStyle, maxWidth: 260 }}>
              <option value="">Todas las líneas</option>
              {lineasServicio.map(l => <option key={l.id} value={l.codigo}>{l.codigo} — {l.nombre}</option>)}
            </select>
            {filtroLinea && <button onClick={() => setFiltroLinea('')} style={{ ...btnStyle, background: '#475569', color: '#fff' }}>Limpiar</button>}
          </div>
          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Código', 'Línea', 'Empresa', 'Tipo ID', 'Nro Documento', 'Dirección', 'Ciudad', 'País', 'Emisión', 'Vence', 'Items', 'Total', 'Situación', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((c, i) => {
                  const { total } = calcTotals(c.detalles, c.pct_impuesto, c.pct_ica)
                  const cli = clientes.find(cl => cl.id === c.cliente_id)
                  const linea = lineasServicio.find(l => l.codigo === c.linea_servicio_codigo)
                  return (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>{c.codigo}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {c.linea_servicio_codigo ? (
                          <span title={c.linea_servicio_nombre} style={{ background: linea?.color || '#475569', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{c.linea_servicio_codigo}</span>
                        ) : <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 13 }}>{c.cliente_nombre}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cli?.tipo_identificacion || ''}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cli?.nro_documento || ''}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cli?.direccion || ''}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cli?.ciudad || ''}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{cli?.pais || ''}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{fDate(c.fecha_emision)}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{fDate(c.fecha_vencimiento)}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' }}>{c.detalles.length}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: 13, fontWeight: 600 }}>{fmtMoney(total)}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...statusStyle(c.situacion) }}>{c.situacion}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setViewDetail(c)} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#ea580c', color: '#ffffff', border: '1px solid #f97316' }}>Ver</button>
                          <button onClick={() => generatePDF(c)} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#b91c1c', color: '#ffffff', border: '1px solid #dc2626' }}>PDF</button>
                          <button onClick={() => { setEmailTo(''); setEmailAsunto(''); setEmailMsg(''); setEmailModal(c) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#1e3a8a', color: '#ffffff', border: '1px solid #2563eb' }}>Email</button>
                          {permisos.editar && !['Aprobada', 'Rechazada'].includes(c.situacion) && (
                            <button onClick={() => { setSelected(c); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#ffffff', border: '1px solid #16a34a' }}>Editar</button>
                          )}
                          {permisos.eliminar && c.situacion !== 'Anulada' && (
                            <button onClick={() => {
                              const motivo = prompt(`¿Anular cotización ${c.codigo}?\n\nMotivo (opcional):`, '')
                              if (motivo === null) return
                              const nota = motivo.trim() ? `\n\n[ANULADA] Motivo: ${motivo.trim()}` : '\n\n[ANULADA]'
                              updateCotizacion(c.id, { situacion: 'Anulada', observaciones: (c.observaciones || '') + nota })
                            }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#78350f', color: '#ffffff', border: '1px solid #b45309' }}>Anular</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={14} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay cotizaciones registradas</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <ReportPanel title="Reporte de Cotizaciones" columns={reportColumns} rows={reportRows}
          filters={[{ label: 'Situación', key: 'situacion', options: [...new Set(cotizaciones.map(c => c.situacion).filter(Boolean))] }]}
          summableKeys={['total']} />
      )}
</div>
  )
}
