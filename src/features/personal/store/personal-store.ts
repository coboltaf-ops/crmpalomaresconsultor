import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Personal {
  id: string
  codigo: string
  nombre: string
  apellido: string
  correo: string
  nro_movil: string
  departamento: string
  cargo: string
  situacion: 'Activo' | 'Inactivo'
  fecha_registro: string
}

interface PersonalState {
  personal: Personal[]
  addPersonal: (p: Personal) => void
  updatePersonal: (id: string, p: Partial<Personal>) => void
  deletePersonal: (id: string) => void
}

export const usePersonalStore = create<PersonalState>()(
  persist(
    (set) => ({
      personal: [],
      addPersonal: (p) => set((s) => ({ personal: [...s.personal, p] })),
      updatePersonal: (id, p) => set((s) => ({ personal: s.personal.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deletePersonal: (id) => set((s) => ({ personal: s.personal.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-personal-storage',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { personal?: Personal[] }
        if (version < 1 && Array.isArray(state.personal)) {
          state.personal = state.personal.map(p => ({
            ...p,
            nombre: (p.nombre || '').toUpperCase(),
            apellido: (p.apellido || '').toUpperCase(),
            cargo: (p.cargo || '').toUpperCase(),
            departamento: (p.departamento || '').toUpperCase(),
          }))
        }
        return state as PersonalState
      },
    }
  )
)
