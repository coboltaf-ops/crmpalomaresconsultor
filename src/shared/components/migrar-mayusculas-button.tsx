'use client'
import { useState } from 'react'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useProspectosStore } from '@/features/prospectos/store/prospectos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { usePQRSStore } from '@/features/pqrs/store/pqrs-store'
import { useTareasStore } from '@/features/tareas/store/tareas-store'
import { usePersonalStore } from '@/features/personal/store/personal-store'
import { useReferenceStore } from '@/features/referencias/store/reference-store'
import type { ReferenceTableId } from '@/features/referencias/types'

const up = (s?: string) => (s || '').toUpperCase()

interface Resultado {
  modulo: string
  registros: number
}

/**
 * Botón que itera todos los stores y convierte campos textuales a MAYÚSCULAS.
 * No depende del sistema de versiones de Zustand — opera directo sobre los
 * datos cargados en memoria. Idempotente: ejecutarlo varias veces no causa
 * ningún daño porque toUpperCase() de algo en mayúsculas devuelve lo mismo.
 */
export default function MigrarMayusculasButton() {
  const [running, setRunning] = useState(false)
  const [resultados, setResultados] = useState<Resultado[] | null>(null)

  const ejecutar = async () => {
    if (running) return
    if (!confirm('Esta acción convertirá los textos de todos los registros existentes a MAYÚSCULAS (Razón Social, Nombres, Apellidos, Empresa, Detalles, etc.). Es seguro y reversible solo editando manualmente. ¿Continuar?')) return

    setRunning(true)
    const resultados: Resultado[] = []

    try {
      // CLIENTES
      const clientesStore = useClientesStore.getState()
      let n = 0
      for (const c of clientesStore.clientes) {
        clientesStore.updateCliente(c.id, {
          razon_social: up(c.razon_social),
          nombre_comercial: up(c.nombre_comercial),
          representante_legal: up(c.representante_legal),
          actividad: up(c.actividad),
        })
        n++
      }
      resultados.push({ modulo: 'Empresas (Clientes)', registros: n })

      // CONTACTOS
      const contactosStore = useContactosStore.getState()
      n = 0
      for (const c of contactosStore.contactos) {
        contactosStore.updateContacto(c.id, {
          nombre: up(c.nombre),
          apellido: up(c.apellido),
          cliente_nombre: up(c.cliente_nombre),
          cargo: up(c.cargo),
          departamento: up(c.departamento),
        })
        n++
      }
      resultados.push({ modulo: 'Contactos', registros: n })

      // PROSPECTOS
      const prospectosStore = useProspectosStore.getState()
      n = 0
      for (const p of prospectosStore.prospectos) {
        prospectosStore.updateProspecto(p.id, {
          nombre: up(p.nombre),
          apellido: up(p.apellido),
          empresa: up(p.empresa),
          detalle_requerimiento: up(p.detalle_requerimiento),
          actividad: up(p.actividad),
        })
        n++
      }
      resultados.push({ modulo: 'Prospectos', registros: n })

      // OPORTUNIDADES
      const oportunidadesStore = useOportunidadesStore.getState()
      n = 0
      for (const o of oportunidadesStore.oportunidades) {
        oportunidadesStore.updateOportunidad(o.id, {
          nombre: up(o.nombre),
          cliente_nombre: up(o.cliente_nombre),
          contacto_nombre: up(o.contacto_nombre),
        })
        n++
      }
      resultados.push({ modulo: 'Oportunidades', registros: n })

      // COTIZACIONES
      const cotizacionesStore = useCotizacionesStore.getState()
      n = 0
      for (const c of cotizacionesStore.cotizaciones) {
        cotizacionesStore.updateCotizacion(c.id, {
          cliente_nombre: up(c.cliente_nombre),
          contacto_nombre: up(c.contacto_nombre),
          vendedor: up(c.vendedor),
        })
        n++
      }
      resultados.push({ modulo: 'Cotizaciones', registros: n })

      // PQRS
      const pqrsStore = usePQRSStore.getState()
      n = 0
      for (const p of pqrsStore.pqrs) {
        pqrsStore.updatePQRS(p.id, {
          cliente_nombre: up(p.cliente_nombre),
          contacto_nombre: up(p.contacto_nombre),
          persona_avisa: up(p.persona_avisa),
          persona_caso: up(p.persona_caso),
          detalle_incidencia: up(p.detalle_incidencia),
          asunto: up(p.asunto),
          descripcion: up(p.descripcion),
          responsable: up(p.responsable),
        })
        n++
      }
      resultados.push({ modulo: 'PQRS', registros: n })

      // TAREAS
      const tareasStore = useTareasStore.getState()
      n = 0
      for (const t of tareasStore.tareas) {
        tareasStore.updateTarea(t.id, {
          persona_asigna: up(t.persona_asigna),
          persona_ejecuta: up(t.persona_ejecuta),
          descripcion: up(t.descripcion),
        })
        n++
      }
      resultados.push({ modulo: 'Tareas', registros: n })

      // PERSONAL
      const personalStore = usePersonalStore.getState()
      n = 0
      for (const p of personalStore.personal) {
        personalStore.updatePersonal(p.id, {
          nombre: up(p.nombre),
          apellido: up(p.apellido),
          cargo: up(p.cargo),
          departamento: up(p.departamento),
        })
        n++
      }
      resultados.push({ modulo: 'Personal', registros: n })

      // REFERENCIAS — todas las tablas + vendedores
      const refStore = useReferenceStore.getState()
      let totalRefItems = 0
      for (const tableKey of Object.keys(refStore.data) as ReferenceTableId[]) {
        const items = refStore.data[tableKey] || []
        for (const item of items) {
          refStore.updateItem(tableKey, item.id, { descripcion: up(item.descripcion) })
          totalRefItems++
        }
      }
      resultados.push({ modulo: 'Referencias (todas las tablas)', registros: totalRefItems })

      let nVend = 0
      for (const v of refStore.vendedores) {
        refStore.updateVendedor(v.id, { nombre: up(v.nombre), apellido: up(v.apellido) })
        nVend++
      }
      resultados.push({ modulo: 'Vendedores', registros: nVend })

      setResultados(resultados)
    } catch (err) {
      console.error('[migrar-mayusculas] Error:', err)
      alert('Error al ejecutar la migración. Revisa la consola del navegador.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{ marginTop: 20, padding: 20, background: 'rgba(245,158,11,0.1)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)' }}>
      <h3 style={{ color: '#fcd34d', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>🔠 Convertir datos existentes a MAYÚSCULAS</h3>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
        Recorre todos los módulos y pasa a mayúsculas los campos textuales (Nombre, Apellido,
        Empresa, Razón Social, Detalle Requerimiento, Detalle Incidencia, Cargo, Departamento,
        Persona Asigna, Persona Ejecuta, Vendedores, Tablas de Referencia, etc.).
        <br /><br />
        <strong>Es seguro</strong>: solo aplica <code>toUpperCase()</code>. No borra ningún dato.
        Si ya están en mayúsculas, no causa ningún cambio.
      </p>
      <button
        type="button"
        onClick={ejecutar}
        disabled={running}
        style={{
          padding: '10px 20px', borderRadius: 10,
          background: running ? 'rgba(245,158,11,0.3)' : '#f59e0b',
          color: '#000', border: '1px solid #fbbf24',
          fontSize: 14, fontWeight: 800, cursor: running ? 'not-allowed' : 'pointer',
        }}
      >
        {running ? 'Procesando…' : 'Ejecutar conversión a MAYÚSCULAS'}
      </button>

      {resultados && (
        <div style={{ marginTop: 16, padding: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10 }}>
          <p style={{ color: '#86efac', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>✅ Conversión completada</p>
          <ul style={{ color: '#fff', fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
            {resultados.map(r => (
              <li key={r.modulo} style={{ padding: '4px 0' }}>
                <strong>{r.modulo}:</strong> {r.registros} registro{r.registros === 1 ? '' : 's'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
