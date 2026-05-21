import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Contrato {
  id: string
  codigo: string
  fecha: string
  cliente_id: string
  cliente_nombre: string
  contacto_id: string
  contacto_nombre: string
  tipo_servicio: string
  centro_costo: string
  // Ubicación
  direccion: string
  region: string
  departamento: string
  municipio: string
  // Datos del Contrato
  fecha_inicio: string
  fecha_finalizacion: string
  valor_anual: number
  valor_mensual: number
  tipo_moneda: string
  nro_poliza_rse: string
  nro_poliza_cumplimiento: string
  representante_legal: string
  // Estado
  situacion: string
  dias_atraso: number
  // Auditoría
  fecha_registro: string
  observaciones: string
}

interface ContratosState {
  contratos: Contrato[]
  addContrato: (c: Contrato) => void
  updateContrato: (id: string, c: Partial<Contrato>) => void
  deleteContrato: (id: string) => void
}

export const useContratosStore = create<ContratosState>()(
  persist(
    (set) => ({
      contratos: [],
      addContrato: (c) => set((s) => ({ contratos: [...s.contratos, c] })),
      updateContrato: (id, c) => set((s) => ({ contratos: s.contratos.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteContrato: (id) => set((s) => ({ contratos: s.contratos.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-contratos-storage',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { contratos?: Partial<Contrato>[] }
        if (version < 1 && Array.isArray(state.contratos)) {
          state.contratos = state.contratos.map(c => ({
            tipo_moneda: 'Pesos Colombianos',
            ...c,
          }))
        }
        return state as ContratosState
      },
    }
  )
)
