import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Seguimiento } from '@/shared/types/seguimiento'

export type { Seguimiento }

export interface Contacto {
  id: string
  codigo: string
  cliente_id: string
  cliente_nombre: string
  nombre: string
  apellido: string
  cargo: string
  departamento: string
  telefono: string
  celular: string
  email: string
  fecha_nacimiento: string
  nivel_influencia: string
  es_principal: boolean
  observaciones: string
  situacion: string
  fecha_registro: string
  seguimientos: Seguimiento[]
}

interface ContactosState {
  contactos: Contacto[]
  addContacto: (c: Contacto) => void
  updateContacto: (id: string, c: Partial<Contacto>) => void
  deleteContacto: (id: string) => void
}

export const useContactosStore = create<ContactosState>()(
  persist(
    (set) => ({
      contactos: [],
      addContacto: (c) => set((s) => ({ contactos: [...s.contactos, c] })),
      updateContacto: (id, c) => set((s) => ({ contactos: s.contactos.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteContacto: (id) => set((s) => ({ contactos: s.contactos.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-contactos-storage',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { contactos?: Contacto[] }
        if (version < 1 && Array.isArray(state.contactos)) {
          state.contactos = state.contactos.map(r => ({
            ...r,
            nombre: (r.nombre || '').toUpperCase(),
            apellido: (r.apellido || '').toUpperCase(),
            cliente_nombre: (r.cliente_nombre || '').toUpperCase(),
            cargo: (r.cargo || '').toUpperCase(),
            departamento: (r.departamento || '').toUpperCase(),
          }))
        }
        return state as ContactosState
      },
    }
  )
)
