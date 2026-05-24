import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BaseReference, ReferenceTableId, Vendedor } from '../types'

type RefData = Record<ReferenceTableId, BaseReference[]>

interface ReferenceState {
  data: RefData
  vendedores: Vendedor[]
  addItem: (table: ReferenceTableId, item: BaseReference) => void
  updateItem: (table: ReferenceTableId, id: string, item: Partial<BaseReference>) => void
  deleteItem: (table: ReferenceTableId, id: string) => void
  addVendedor: (v: Vendedor) => void
  updateVendedor: (id: string, v: Partial<Vendedor>) => void
  deleteVendedor: (id: string) => void
}

const initialData: RefData = {
  pais: [
    { id: '1', descripcion: 'Colombia', situacion: true },
    { id: '2', descripcion: 'Venezuela', situacion: true },
    { id: '3', descripcion: 'Ecuador', situacion: true },
    { id: '4', descripcion: 'Perú', situacion: true },
    { id: '5', descripcion: 'Panamá', situacion: true },
  ],
  ciudad: [
    { id: '1', descripcion: 'Bogotá', situacion: true },
    { id: '2', descripcion: 'Medellín', situacion: true },
    { id: '3', descripcion: 'Cali', situacion: true },
    { id: '4', descripcion: 'Barranquilla', situacion: true },
  ],
  actividad_cliente: [
    { id: '1', descripcion: 'Construcción', situacion: true },
    { id: '2', descripcion: 'Tecnología', situacion: true },
    { id: '3', descripcion: 'Comercio', situacion: true },
    { id: '4', descripcion: 'Servicios', situacion: true },
    { id: '5', descripcion: 'Manufactura', situacion: true },
  ],
  situacion_cliente: [
    { id: '1', descripcion: 'Activo', situacion: true },
    { id: '2', descripcion: 'Inactivo', situacion: true },
    { id: '3', descripcion: 'Prospecto', situacion: true },
  ],
  situacion_contacto: [
    { id: '1', descripcion: 'Activo', situacion: true },
    { id: '2', descripcion: 'Inactivo', situacion: true },
  ],
  situacion_cotizacion: [
    { id: '1', descripcion: 'En Construcción', situacion: true },
    { id: '2', descripcion: 'Enviada', situacion: true },
    { id: '3', descripcion: 'Aprobada', situacion: true },
    { id: '4', descripcion: 'Rechazada', situacion: true },
    { id: '5', descripcion: 'Vencida', situacion: true },
    { id: '6', descripcion: 'Anulada', situacion: true },
  ],
  situacion_lista: [
    { id: '1', descripcion: 'Activo', situacion: true },
    { id: '2', descripcion: 'Inactivo', situacion: true },
    { id: '3', descripcion: 'Descontinuado', situacion: true },
  ],
  situacion_oportunidad: [
    { id: '1', descripcion: 'Abierta', situacion: true },
    { id: '2', descripcion: 'Ganada', situacion: true },
    { id: '3', descripcion: 'Perdida', situacion: true },
    { id: '4', descripcion: 'En Negociación', situacion: true },
  ],
  situacion_pqrs: [
    { id: '1', descripcion: 'Abierta', situacion: true },
    { id: '2', descripcion: 'En Proceso', situacion: true },
    { id: '3', descripcion: 'Cerrada', situacion: true },
    { id: '4', descripcion: 'Escalada', situacion: true },
  ],
  tipo_pqrs: [
    { id: '1', descripcion: 'Petición', situacion: true },
    { id: '2', descripcion: 'Queja', situacion: true },
    { id: '3', descripcion: 'Reclamo', situacion: true },
    { id: '4', descripcion: 'Sugerencia', situacion: true },
  ],
  incidencias: [
    { id: '1', descripcion: 'Falla en servicio de vigilancia', situacion: true },
    { id: '2', descripcion: 'Inasistencia de personal', situacion: true },
    { id: '3', descripcion: 'Daño en equipo', situacion: true },
    { id: '4', descripcion: 'Robo o hurto', situacion: true },
    { id: '5', descripcion: 'Emergencia médica', situacion: true },
    { id: '6', descripcion: 'Incumplimiento de protocolo', situacion: true },
    { id: '7', descripcion: 'Otro', situacion: true },
  ],
  tipo_servicio_contrato: [
    { id: '1', descripcion: 'Vigilancia Física Armada', situacion: true },
    { id: '2', descripcion: 'Vigilancia Física Desarmada', situacion: true },
    { id: '3', descripcion: 'Escolta Personal', situacion: true },
    { id: '4', descripcion: 'CCTV / Monitoreo', situacion: true },
    { id: '5', descripcion: 'Rastreo Satelital GPS', situacion: true },
    { id: '6', descripcion: 'Medios Tecnológicos / Alarmas', situacion: true },
    { id: '7', descripcion: 'Caninos', situacion: true },
  ],
  centro_costo: [
    { id: '1', descripcion: '100001 - Sede Principal', situacion: true },
    { id: '2', descripcion: '100002 - Sede Norte', situacion: true },
    { id: '3', descripcion: '100003 - Sede Sur', situacion: true },
    { id: '4', descripcion: '200001 - Operaciones', situacion: true },
    { id: '5', descripcion: '300001 - Administrativo', situacion: true },
  ],
  situacion_contrato: [
    { id: '1', descripcion: 'Vigente', situacion: true },
    { id: '2', descripcion: 'Por Vencer', situacion: true },
    { id: '3', descripcion: 'Vencido', situacion: true },
    { id: '4', descripcion: 'Suspendido', situacion: true },
    { id: '5', descripcion: 'Terminado', situacion: true },
    { id: '6', descripcion: 'Renovado', situacion: true },
  ],
  tipo_identificacion: [
    { id: '1', descripcion: 'NIT', situacion: true },
    { id: '2', descripcion: 'Cédula', situacion: true },
    { id: '3', descripcion: 'Pasaporte', situacion: true },
    { id: '4', descripcion: 'RUC', situacion: true },
  ],
  tipo_moneda: [
    { id: '1', descripcion: 'Pesos Colombianos', situacion: true },
    { id: '2', descripcion: 'Dólares', situacion: true },
    { id: '3', descripcion: 'Euros', situacion: true },
  ],
  condiciones_pago: [
    { id: '1', descripcion: 'Contado', situacion: true },
    { id: '2', descripcion: '15 días', situacion: true },
    { id: '3', descripcion: '30 días', situacion: true },
    { id: '4', descripcion: '60 días', situacion: true },
    { id: '5', descripcion: '90 días', situacion: true },
  ],
  origen_oportunidad: [
    { id: '1', descripcion: 'Referido', situacion: true },
    { id: '2', descripcion: 'Web', situacion: true },
    { id: '3', descripcion: 'Llamada', situacion: true },
    { id: '4', descripcion: 'Evento', situacion: true },
    { id: '5', descripcion: 'Redes Sociales', situacion: true },
  ],
  etapa_oportunidad: [
    { id: '1', descripcion: 'Prospección', situacion: true },
    { id: '2', descripcion: 'Calificación', situacion: true },
    { id: '3', descripcion: 'Propuesta', situacion: true },
    { id: '4', descripcion: 'Negociación', situacion: true },
    { id: '5', descripcion: 'Cierre', situacion: true },
  ],
  prioridad_pqrs: [
    { id: '1', descripcion: 'Baja', situacion: true },
    { id: '2', descripcion: 'Media', situacion: true },
    { id: '3', descripcion: 'Alta', situacion: true },
    { id: '4', descripcion: 'Urgente', situacion: true },
  ],
  roles: [
    { id: '1', descripcion: 'Admin', situacion: true },
    { id: '2', descripcion: 'Ventas', situacion: true },
    { id: '3', descripcion: 'Soporte', situacion: true },
    { id: '4', descripcion: 'Gerencia', situacion: true },
  ],
  nivel_influencia: [
    { id: '1', descripcion: 'Decisor', situacion: true },
    { id: '2', descripcion: 'Influenciador', situacion: true },
    { id: '3', descripcion: 'Usuario Final', situacion: true },
    { id: '4', descripcion: 'Evaluador Técnico', situacion: true },
    { id: '5', descripcion: 'Patrocinador', situacion: true },
  ],
  porcentaje_impuestos: [
    { id: '1', descripcion: '0%', situacion: true },
    { id: '2', descripcion: '5%', situacion: true },
    { id: '3', descripcion: '8%', situacion: true },
    { id: '4', descripcion: '16%', situacion: true },
    { id: '5', descripcion: '19%', situacion: true },
  ],
  categoria_productos: [],
  unidad_medida: [
    { id: '1', descripcion: 'Unidad', situacion: true },
    { id: '2', descripcion: 'Kilogramo', situacion: true },
    { id: '3', descripcion: 'Litro', situacion: true },
    { id: '4', descripcion: 'Metro', situacion: true },
    { id: '5', descripcion: 'Caja', situacion: true },
    { id: '6', descripcion: 'Paquete', situacion: true },
  ],
  situacion_prospecto: [
    { id: '0', descripcion: 'Sin Contactar', situacion: true },
    { id: '1', descripcion: 'Nuevo', situacion: true },
    { id: '2', descripcion: 'Contactado', situacion: true },
    { id: '3', descripcion: 'Calificado', situacion: true },
    { id: '4', descripcion: 'En Negociación', situacion: true },
    { id: '5', descripcion: 'Convertido', situacion: true },
    { id: '6', descripcion: 'Descartado', situacion: true },
  ],
  origen_prospecto: [
    { id: '1', descripcion: 'Web', situacion: true },
    { id: '2', descripcion: 'Referido', situacion: true },
    { id: '3', descripcion: 'Llamada', situacion: true },
    { id: '4', descripcion: 'Evento', situacion: true },
    { id: '5', descripcion: 'Redes Sociales', situacion: true },
    { id: '6', descripcion: 'Email', situacion: true },
    { id: '7', descripcion: 'Otro', situacion: true },
  ],
  tipo_solicitud: [
    { id: '1', descripcion: 'CONSULTORÍA GERENCIAL', situacion: true },
    { id: '2', descripcion: 'IMPLEMENTACIÓN DE SOFTWARE', situacion: true },
    { id: '3', descripcion: 'TRANSFORMACIÓN DIGITAL', situacion: true },
    { id: '4', descripcion: 'CAPACITACIÓN', situacion: true },
    { id: '5', descripcion: 'AUDITORÍA', situacion: true },
    { id: '6', descripcion: 'SOPORTE TÉCNICO', situacion: true },
    { id: '7', descripcion: 'OTRO', situacion: true },
  ],
  vendedores: [],
}

const sortItems = (items: BaseReference[]) => [...items].sort((a, b) => a.descripcion.localeCompare(b.descripcion))

export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set) => ({
      data: initialData,
      vendedores: [],
      addItem: (table, item) => set((s) => ({
        data: { ...s.data, [table]: sortItems([...(s.data[table] || []), { ...item, descripcion: (item.descripcion || '').toUpperCase() }]) }
      })),
      updateItem: (table, id, item) => set((s) => ({
        data: { ...s.data, [table]: sortItems((s.data[table] || []).map(r => r.id === id ? { ...r, ...item, descripcion: (item.descripcion ?? r.descripcion ?? '').toUpperCase() } : r)) }
      })),
      deleteItem: (table, id) => set((s) => ({
        data: { ...s.data, [table]: (s.data[table] || []).filter(r => r.id !== id) }
      })),
      addVendedor: (v) => set((s) => ({
        vendedores: [...s.vendedores, { ...v, nombre: (v.nombre || '').toUpperCase(), apellido: (v.apellido || '').toUpperCase() }]
          .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es', { sensitivity: 'base' }))
      })),
      updateVendedor: (id, v) => set((s) => ({
        vendedores: s.vendedores
          .map(x => x.id === id ? { ...x, ...v, nombre: (v.nombre ?? x.nombre ?? '').toUpperCase(), apellido: (v.apellido ?? x.apellido ?? '').toUpperCase() } : x)
          .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es', { sensitivity: 'base' }))
      })),
      deleteVendedor: (id) => set((s) => ({
        vendedores: s.vendedores.filter(x => x.id !== id)
      })),
    }),
    {
      name: 'crm-referencias-storage',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Partial<ReferenceState>
        if (version < 3) {
          if (state.data) {
            for (const table of Object.keys(initialData) as ReferenceTableId[]) {
              if (!state.data[table]) {
                state.data[table] = initialData[table]
              }
            }
          }
        }
        if (version < 1) {
          // Pasar a MAYÚSCULAS las descripciones de todas las tablas y los vendedores
          if (state.data) {
            for (const key of Object.keys(state.data) as ReferenceTableId[]) {
              const arr = state.data[key]
              if (Array.isArray(arr)) {
                state.data[key] = arr.map(r => ({ ...r, descripcion: (r.descripcion || '').toUpperCase() }))
              }
            }
          }
          if (Array.isArray(state.vendedores)) {
            state.vendedores = state.vendedores.map(v => ({
              ...v,
              nombre: (v.nombre || '').toUpperCase(),
              apellido: (v.apellido || '').toUpperCase(),
            }))
          }
        }
        return state as ReferenceState
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<ReferenceState> | undefined
        const merged = { ...current }
        if (p?.data) {
          merged.data = { ...current.data }
          // Ordenar alfabéticamente cada tabla de referencia al cargar
          for (const key of Object.keys(current.data) as ReferenceTableId[]) {
            const arr = p.data[key] ?? current.data[key]
            merged.data[key] = [...arr].sort((a, b) => a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' }))
          }
        }
        if (p?.vendedores) {
          merged.vendedores = [...p.vendedores].sort((a, b) =>
            `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es', { sensitivity: 'base' })
          )
        }
        return merged
      },
    }
  )
)
