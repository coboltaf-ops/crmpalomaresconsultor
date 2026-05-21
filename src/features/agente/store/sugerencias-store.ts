import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const SUGERENCIAS_DEFAULT: string[] = [
  '¿Qué contratos están por vencer en los próximos 60 días?',
  '¿Cuál es el valor total del pipeline de oportunidades abiertas?',
  '¿Cuántas tareas vencidas hay y quién es responsable?',
  '¿Qué PQRS urgentes tengo abiertas?',
  'Dame un resumen ejecutivo del estado actual del CRM',
  '¿Cuáles son los 5 prospectos más recientes sin contactar?',
]

interface SugerenciasState {
  sugerencias: string[]
  agregar: (texto: string) => void
  eliminar: (index: number) => void
  editar: (index: number, texto: string) => void
  mover: (from: number, to: number) => void
  restaurarDefaults: () => void
}

export const useSugerenciasStore = create<SugerenciasState>()(
  persist(
    (set) => ({
      sugerencias: SUGERENCIAS_DEFAULT,
      agregar: (texto) =>
        set((s) => {
          const limpio = texto.trim()
          if (!limpio || s.sugerencias.includes(limpio)) return s
          return { sugerencias: [...s.sugerencias, limpio] }
        }),
      eliminar: (index) =>
        set((s) => ({ sugerencias: s.sugerencias.filter((_, i) => i !== index) })),
      editar: (index, texto) =>
        set((s) => {
          const limpio = texto.trim()
          if (!limpio) return s
          return {
            sugerencias: s.sugerencias.map((t, i) => (i === index ? limpio : t)),
          }
        }),
      mover: (from, to) =>
        set((s) => {
          if (from === to || from < 0 || to < 0 || from >= s.sugerencias.length || to >= s.sugerencias.length) return s
          const arr = [...s.sugerencias]
          const [item] = arr.splice(from, 1)
          arr.splice(to, 0, item)
          return { sugerencias: arr }
        }),
      restaurarDefaults: () => set({ sugerencias: SUGERENCIAS_DEFAULT }),
    }),
    {
      name: 'crm-agente-sugerencias-storage',
      version: 1,
    }
  )
)
