import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Seguimiento } from '@/shared/types/seguimiento'

export type { Seguimiento }

export interface PQRS {
  id: string
  codigo: string
  nro: number
  tipo: string
  incidencia: string
  prioridad: string
  cliente_id: string
  cliente_nombre: string
  contacto_id: string
  contacto_nombre: string
  asunto: string
  descripcion: string
  fecha_aviso: string
  hora_aviso: string
  persona_avisa: string
  movil_avisa: string
  persona_caso: string
  movil_caso: string
  detalle_incidencia: string
  responsable: string
  fecha_registro: string
  fecha_cierre: string
  seguimientos: Seguimiento[]
  situacion: string
}

interface PQRSState {
  pqrs: PQRS[]
  addPQRS: (p: PQRS) => void
  updatePQRS: (id: string, p: Partial<PQRS>) => void
  deletePQRS: (id: string) => void
}

export const usePQRSStore = create<PQRSState>()(
  persist(
    (set) => ({
      pqrs: [],
      addPQRS: (p) => set((s) => ({ pqrs: [...s.pqrs, p] })),
      updatePQRS: (id, p) => set((s) => ({ pqrs: s.pqrs.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deletePQRS: (id) => set((s) => ({ pqrs: s.pqrs.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-pqrs-storage',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { pqrs?: PQRS[] }
        if (version < 1 && Array.isArray(state.pqrs)) {
          state.pqrs = state.pqrs.map(r => ({
            ...r,
            cliente_nombre: (r.cliente_nombre || '').toUpperCase(),
            contacto_nombre: (r.contacto_nombre || '').toUpperCase(),
            persona_avisa: (r.persona_avisa || '').toUpperCase(),
            persona_caso: (r.persona_caso || '').toUpperCase(),
            detalle_incidencia: (r.detalle_incidencia || '').toUpperCase(),
            asunto: (r.asunto || '').toUpperCase(),
            descripcion: (r.descripcion || '').toUpperCase(),
            responsable: (r.responsable || '').toUpperCase(),
          }))
        }
        return state as PQRSState
      },
    }
  )
)
