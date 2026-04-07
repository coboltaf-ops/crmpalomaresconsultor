'use client'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { usePQRSStore } from '@/features/pqrs/store/pqrs-store'
import { fmtMoney } from '@/shared/lib/format-number'

export default function DashboardPage() {
  const clientes = useClientesStore(s => s.clientes)
  const contactos = useContactosStore(s => s.contactos)
  const productos = useProductosStore(s => s.productos)
  const oportunidades = useOportunidadesStore(s => s.oportunidades)
  const cotizaciones = useCotizacionesStore(s => s.cotizaciones)
  const pqrs = usePQRSStore(s => s.pqrs)

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
  const etapas = ['Prospección', 'Calificación', 'Propuesta', 'Negociación', 'Cierre']
  const opoPorEtapa = etapas.map(e => ({
    etapa: e,
    count: oportunidades.filter(o => o.etapa === e && (o.situacion === 'Abierta' || o.situacion === 'En Negociación')).length,
    valor: oportunidades.filter(o => o.etapa === e && (o.situacion === 'Abierta' || o.situacion === 'En Negociación')).reduce((s, o) => s + o.valor_estimado, 0),
  }))

  return (
    <div>
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
              <p style={{ color: '#4ade80', fontSize: 28, fontWeight: 800 }}>${fmtMoney(totalPipeline)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opoPorEtapa.map(e => (
              <div key={e.etapa} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, width: 100 }}>{e.etapa}</span>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${opoAbiertas.length ? (e.count / opoAbiertas.length) * 100 : 0}%`, background: '#4ade80', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 600, width: 24, textAlign: 'right' }}>{e.count}</span>
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
