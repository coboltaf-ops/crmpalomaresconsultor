import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Seguimiento } from '@/shared/types/seguimiento'

export type { Seguimiento }

export interface Cliente {
  id: string
  codigo: string
  tipo_identificacion: string
  nro_documento: string
  razon_social: string
  nombre_comercial: string
  representante_legal: string
  fecha_inicio_cliente: string
  centro_costo: string
  actividad: string
  direccion: string
  region: string
  departamento: string
  municipio: string
  ciudad_pueblo: string
  ciudad: string
  pais: string
  codigo_postal: string
  telefono: string
  email: string
  sitio_web: string
  condicion_pago: string
  tipo_moneda: string
  observaciones: string
  situacion: string
  fecha_registro: string
  seguimientos: Seguimiento[]
  codigo_acceso: string
}

/** Genera código de acceso aleatorio tipo ACC-XXXXXX */
export function generarCodigoAcceso(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `ACC-${code}`
}

interface ClientesState {
  clientes: Cliente[]
  addCliente: (c: Cliente) => void
  updateCliente: (id: string, c: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
}

export const useClientesStore = create<ClientesState>()(
  persist(
    (set) => ({
      clientes: [],
      addCliente: (c) => set((s) => ({ clientes: [...s.clientes, c] })),
      updateCliente: (id, c) => set((s) => ({ clientes: s.clientes.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-clientes-storage',
      version: 6,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { clientes?: Array<Partial<Cliente> & { poblacion?: number }> }
        if (version < 3 && Array.isArray(state.clientes)) {
          state.clientes = state.clientes.map(c => {
            const { poblacion: _drop, ...rest } = c
            void _drop
            return {
              region: '',
              departamento: '',
              municipio: c.ciudad || '',
              ciudad_pueblo: '',
              ...rest,
            }
          })
        }
        if (version < 4 && Array.isArray(state.clientes)) {
          state.clientes = state.clientes.map(c => ({
            representante_legal: '',
            fecha_inicio_cliente: '',
            ...c,
          }))
        }
        if (version < 5 && Array.isArray(state.clientes)) {
          state.clientes = state.clientes.map(c => ({
            centro_costo: '',
            ...c,
          }))
        }
        if (version < 6 && Array.isArray(state.clientes)) {
          state.clientes = state.clientes.map(c => ({
            ...c,
            razon_social: (c.razon_social || '').toUpperCase(),
            nombre_comercial: (c.nombre_comercial || '').toUpperCase(),
            representante_legal: (c.representante_legal || '').toUpperCase(),
            actividad: (c.actividad || '').toUpperCase(),
          }))
        }
        return state as ClientesState
      },
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<ClientesState>) }
        state.clientes = state.clientes.map(c =>
          c.codigo_acceso ? c : { ...c, codigo_acceso: generarCodigoAcceso() }
        )
        return state
      },
    }
  )
)
