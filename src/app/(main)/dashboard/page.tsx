'use client'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { usePQRSStore } from '@/features/pqrs/store/pqrs-store'
import { useProspectosStore } from '@/features/prospectos/store/prospectos-store'
import { fmtMoney } from '@/shared/lib/format-number'

export default function DashboardPage() {
  const clientes = useClientesStore(s => s.clientes)
  const contactos = useContactosStore(s => s.contactos)
  const productos = useProductosStore(s => s.productos)
  const oportunidades = useOportunidadesStore(s => s.oportunidades)
  const cotizaciones = useCotizacionesStore(s => s.cotizaciones)
  const pqrs = usePQRSStore(s => s.pqrs)
  const prospectos = useProspectosStore(s => s.prospectos)

  const opoAbiertas = oportunidades.filter(o => o.situacion === 'Abierta' || o.situacion === 'En Negociación')
  const totalPipeline = opoAbiertas.reduce((s, o) => s + o.valor_estimado, 0)
  const pqrsAbiertas = pqrs.filter(p => p.situacion !== 'Cerrada')
  const cotPendientes = cotizaciones.filter(c => c.situacion === 'Borrador' || c.situacion === 'Enviada')

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: 24,
  }

  const cards = [
    { label: 'Empresas', value: clientes.length, icon: '🏢', color: '#4ade80' },
    { label: 'Contactos', value: contactos.length, icon: '👤', color: '#a78bfa' },
    { label: 'Oportunidades', value: opoAbiertas.length, icon: '🎯', color: '#34d399' },
    { label: 'Cotizaciones', value: cotizaciones.length, icon: '📋', color: '#fbbf24' },
    { label: 'PQRS Abiertas', value: pqrsAbiertas.length, icon: '📩', color: '#f87171' },
    { label: 'Productos', value: productos.length, icon: '📦', color: '#4ade80' },
  ]

  // PQRS por tipo
  const pqrsPorTipo = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'].map(t => ({
    tipo: t, count: pqrs.filter(p => p.tipo === t).length,
    abiertas: pqrs.filter(p => p.tipo === t && p.situacion !== 'Cerrada').length,
  }))
  const tipoIcons: Record<string, string> = { 'Petición': '📝', 'Queja': '😤', 'Reclamo': '⚠️', 'Sugerencia': '💡' }

  // Oportunidades por etapa
  const etapasConfig: { nombre: string; color: string }[] = [
    { nombre: 'Prospección', color: '#60a5fa' },   // azul
    { nombre: 'Calificación', color: '#a78bfa' },  // morado
    { nombre: 'Propuesta', color: '#fbbf24' },     // ámbar
    { nombre: 'Negociación', color: '#fb923c' },   // naranja
    { nombre: 'Cierre', color: '#34d399' },        // verde
  ]
  const opoPorEtapa = etapasConfig.map(e => ({
    etapa: e.nombre,
    color: e.color,
    count: oportunidades.filter(o => o.etapa === e.nombre && (o.situacion === 'Abierta' || o.situacion === 'En Negociación')).length,
    valor: oportunidades.filter(o => o.etapa === e.nombre && (o.situacion === 'Abierta' || o.situacion === 'En Negociación')).reduce((s, o) => s + o.valor_estimado, 0),
  }))

  // Oportunidades — Montos estimados por situación
  const situacionesOpo: { sit: string; color: string }[] = [
    { sit: 'Abierta', color: '#60a5fa' },
    { sit: 'En Negociación', color: '#fbbf24' },
    { sit: 'Ganada', color: '#34d399' },
    { sit: 'Perdida', color: '#f87171' },
  ]
  const montoPorSituacion = situacionesOpo.map(s => ({
    ...s,
    count: oportunidades.filter(o => o.situacion === s.sit).length,
    monto: oportunidades.filter(o => o.situacion === s.sit).reduce((sum, o) => sum + o.valor_estimado, 0),
  }))
  const maxMonto = Math.max(1, ...montoPorSituacion.map(m => m.monto))
  const montoTotal = montoPorSituacion.reduce((s, m) => s + m.monto, 0)

  // Prospectos por situación (gráfico circular)
  const prospectosSituaciones: { sit: string; color: string }[] = [
    { sit: 'Sin Contactar', color: '#9ca3af' },
    { sit: 'Nuevo',         color: '#60a5fa' },
    { sit: 'Contactado',    color: '#a78bfa' },
    { sit: 'Calificado',    color: '#fbbf24' },
    { sit: 'En Negociación', color: '#fb923c' },
    { sit: 'Convertido',    color: '#34d399' },
    { sit: 'Descartado',    color: '#f87171' },
  ]
  const prospectosPorSituacion = prospectosSituaciones
    .map(s => ({ ...s, count: prospectos.filter(p => p.situacion === s.sit).length }))
    .filter(s => s.count > 0)
  const totalProspectos = prospectosPorSituacion.reduce((s, p) => s + p.count, 0)
  // Construir slices del pie chart con coordenadas SVG
  const pieRadius = 90
  const pieCx = 110
  const pieCy = 110
  let pieAcumulado = 0
  const pieSlices = prospectosPorSituacion.map(p => {
    const fraccion = totalProspectos ? p.count / totalProspectos : 0
    const startAngle = pieAcumulado * Math.PI * 2 - Math.PI / 2
    pieAcumulado += fraccion
    const endAngle = pieAcumulado * Math.PI * 2 - Math.PI / 2
    const x1 = pieCx + pieRadius * Math.cos(startAngle)
    const y1 = pieCy + pieRadius * Math.sin(startAngle)
    const x2 = pieCx + pieRadius * Math.cos(endAngle)
    const y2 = pieCy + pieRadius * Math.sin(endAngle)
    const largeArc = fraccion > 0.5 ? 1 : 0
    // Caso especial: una sola situación con 100% → dibujar círculo completo
    const path = fraccion >= 1
      ? `M ${pieCx - pieRadius} ${pieCy} a ${pieRadius} ${pieRadius} 0 1 0 ${pieRadius * 2} 0 a ${pieRadius} ${pieRadius} 0 1 0 ${-pieRadius * 2} 0`
      : `M ${pieCx} ${pieCy} L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    // Posición del label (centroide del slice, a 70% del radio)
    const midAngle = (startAngle + endAngle) / 2
    const labelR = pieRadius * 0.68
    const labelX = pieCx + labelR * Math.cos(midAngle)
    const labelY = pieCy + labelR * Math.sin(midAngle)
    return { ...p, path, fraccion, labelX, labelY }
  })

  return (
    <div style={{ background: '#0a0f1c', margin: -24, padding: 24, minHeight: 'calc(100vh - 64px)' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 24 }}>Dashboard</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: c.color }}>{c.value}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Pipeline */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Pipeline de Ventas</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Oportunidades</p>
              <p style={{ color: '#34d399', fontSize: 28, fontWeight: 800 }}>{opoAbiertas.length}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Valor Total</p>
              <p style={{ color: '#ffffff', fontSize: 28, fontWeight: 900, textShadow: '0 0 12px rgba(255,255,255,0.4)' }}>COP {fmtMoney(totalPipeline)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opoPorEtapa.map(e => (
              <div key={e.etapa} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: e.color, fontSize: 12, width: 100, fontWeight: 600 }}>{e.etapa}</span>
                <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${opoAbiertas.length ? (e.count / opoAbiertas.length) * 100 : 0}%`, background: e.color, borderRadius: 5, transition: 'width 0.3s', boxShadow: `0 0 8px ${e.color}66` }} />
                </div>
                <span style={{ color: e.color, fontSize: 12, fontWeight: 700, width: 110, textAlign: 'right' }}>COP {fmtMoney(e.valor)}</span>
                <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 600, width: 28, textAlign: 'right' }}>{e.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cotizaciones resumen */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Cotizaciones</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Pendientes</p>
              <p style={{ color: '#fbbf24', fontSize: 28, fontWeight: 800 }}>{cotPendientes.length}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Total</p>
              <p style={{ color: '#ffffff', fontSize: 28, fontWeight: 800 }}>{cotizaciones.length}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Borrador', 'Enviada', 'Aprobada', 'Rechazada', 'Vencida'].map(s => {
              const count = cotizaciones.filter(c => c.situacion === s).length
              const colors: Record<string, string> = { Borrador: '#d1d5db', Enviada: '#86efac', Aprobada: '#86efac', Rechazada: '#fca5a5', Vencida: '#fcd34d' }
              return (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{s}</span>
                  <span style={{ color: colors[s] || '#fff', fontSize: 13, fontWeight: 600 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* PQRS por tipo */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>PQRS por Tipo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {pqrsPorTipo.map(t => (
              <div key={t.tipo} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <span style={{ fontSize: 24 }}>{tipoIcons[t.tipo]}</span>
                <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 800 }}>{t.count}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{t.tipo}</p>
                {t.abiertas > 0 && <p style={{ color: '#fca5a5', fontSize: 10 }}>{t.abiertas} abiertas</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Oportunidades — Montos por situación */}
        <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>Montos Estimados por Situación — Oportunidades</h2>
            <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 700 }}>Total: COP {fmtMoney(montoTotal)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 16, height: 240, padding: '0 8px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {montoPorSituacion.map(m => {
              const pct = maxMonto ? (m.monto / maxMonto) * 100 : 0
              return (
                <div key={m.sit} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                  <span style={{ color: m.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>COP {fmtMoney(m.monto)}</span>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '70%', maxWidth: 80, height: `${Math.max(pct, 2)}%`, background: m.color, borderRadius: '8px 8px 0 0', transition: 'height 0.4s ease', boxShadow: `0 0 16px ${m.color}33` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16, padding: '10px 8px 0 8px' }}>
            {montoPorSituacion.map(m => {
              const pctTotal = montoTotal ? (m.monto / montoTotal) * 100 : 0
              return (
                <div key={m.sit} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600 }}>{m.sit}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{m.count} · {pctTotal.toFixed(0)}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Prospectos por situación — Pie chart */}
        <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Prospectos por Situación</h2>
          {totalProspectos === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', padding: 32 }}>No hay prospectos registrados</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <svg width={220} height={220} viewBox="0 0 220 220">
                {pieSlices.map(s => (
                  <path key={s.sit} d={s.path} fill={s.color} stroke="#000" strokeWidth={2} />
                ))}
                {pieSlices.map(s => s.fraccion >= 0.05 && (
                  <text key={`l-${s.sit}`} x={s.labelX} y={s.labelY + 5} textAnchor="middle" fill="#0f172a" fontSize={15} fontWeight={800} style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.6)', strokeWidth: 3, strokeLinejoin: 'round' }}>{s.count}</text>
                ))}
                <circle cx={pieCx} cy={pieCy} r={45} fill="rgba(0,0,0,0.5)" />
                <text x={pieCx} y={pieCy - 4} textAnchor="middle" fill="#ffffff" fontSize={22} fontWeight={800}>{totalProspectos}</text>
                <text x={pieCx} y={pieCy + 16} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11}>Prospectos</text>
              </svg>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 4 }}>
                  <div style={{ width: 14 }} />
                  <span style={{ width: 130, color: '#ffffff', fontSize: 13, fontWeight: 700 }}>TOTAL</span>
                  <span style={{ width: 36, color: '#ffffff', fontSize: 14, fontWeight: 800, textAlign: 'right' }}>{totalProspectos}</span>
                  <span style={{ width: 40, color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'right' }}>100%</span>
                </div>
                {pieSlices.map(s => (
                  <div key={s.sit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: s.color, boxShadow: `0 0 6px ${s.color}66` }} />
                    <span style={{ width: 130, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{s.sit}</span>
                    <span style={{ width: 36, color: s.color, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{s.count}</span>
                    <span style={{ width: 40, color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'right' }}>{(s.fraccion * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ffffff', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Resumen General</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Empresas Activas</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{clientes.filter(c => c.situacion === 'Activo').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Contactos Principales</span>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{contactos.filter(c => c.es_principal).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Productos Activos</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{productos.filter(p => p.situacion === 'Activo').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Oportunidades Ganadas</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>{oportunidades.filter(o => o.situacion === 'Ganada').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>PQRS Urgentes</span>
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>{pqrs.filter(p => p.prioridad === 'Urgente' && p.situacion !== 'Cerrada').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
