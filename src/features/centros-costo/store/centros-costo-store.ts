import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CentroCosto {
  id: string
  codigo: string              // Compuesto: UN (1) + Cliente (3) + Depto (2) + Muni (3) + Cuenta (4) + Paquete (2 opc)
  nombre: string
  unidad_negocio: string      // 1 dígito — ej. 1=Administrativa, 2=Vigilancia, 3=Tecnología
  cliente_cc: string          // 3 dígitos — código único del cliente
  departamento_cod: string    // 2 dígitos — código DANE del departamento
  municipio_cod: string       // 3 dígitos — código DANE del municipio
  cuenta_control: string      // 4 dígitos — área, proyecto o puesto
  paquete_trabajo: string     // 2 dígitos opcional — proyectos tecnológicos/admin
  situacion: 'Activo' | 'Inactivo'
  fecha_registro: string
}

/** Compone el código completo del centro de costo a partir de sus niveles. */
export function componerCodigo(c: Pick<CentroCosto, 'unidad_negocio' | 'cliente_cc' | 'departamento_cod' | 'municipio_cod' | 'cuenta_control' | 'paquete_trabajo'>): string {
  const pad = (v: string, n: number) => (v || '').replace(/\D/g, '').padStart(n, '0').slice(0, n)
  const un = pad(c.unidad_negocio, 1)
  const cli = pad(c.cliente_cc, 3)
  const dep = pad(c.departamento_cod, 2)
  const mun = pad(c.municipio_cod, 3)
  const cta = pad(c.cuenta_control, 4)
  const paq = c.paquete_trabajo ? pad(c.paquete_trabajo, 2) : ''
  const base = `${un}${cli}${dep}${mun}${cta}`
  return paq ? `${base}${paq}` : base
}

/**
 * Parsea un código completo (solo dígitos) y extrae los 6 niveles jerárquicos por posición:
 *   - Posiciones 0       → UN (1 dígito)
 *   - Posiciones 1-3     → Cliente (3 dígitos)
 *   - Posiciones 4-5     → Departamento (2 dígitos)
 *   - Posiciones 6-8     → Municipio (3 dígitos)
 *   - Posiciones 9-12    → Cuenta de Control (4 dígitos)
 *   - Posiciones 13-14   → Paquete de Trabajo (2 dígitos, opcional)
 */
export function parsearCodigo(codigo: string): Pick<CentroCosto, 'unidad_negocio' | 'cliente_cc' | 'departamento_cod' | 'municipio_cod' | 'cuenta_control' | 'paquete_trabajo'> {
  const d = (codigo || '').replace(/\D/g, '').slice(0, 15)
  return {
    unidad_negocio:   d.slice(0, 1),
    cliente_cc:       d.slice(1, 4),
    departamento_cod: d.slice(4, 6),
    municipio_cod:    d.slice(6, 9),
    cuenta_control:   d.slice(9, 13),
    paquete_trabajo:  d.slice(13, 15),
  }
}

interface CentrosCostoState {
  centros: CentroCosto[]
  addCentro: (c: CentroCosto) => void
  updateCentro: (id: string, c: Partial<CentroCosto>) => void
  deleteCentro: (id: string) => void
}

export const useCentrosCostoStore = create<CentrosCostoState>()(
  persist(
    (set) => ({
      centros: [],
      addCentro: (c) => set((s) => ({ centros: [...s.centros, c] })),
      updateCentro: (id, c) => set((s) => ({ centros: s.centros.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteCentro: (id) => set((s) => ({ centros: s.centros.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-centros-costo-storage',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { centros?: Partial<CentroCosto>[] }
        if (version < 2 && Array.isArray(state.centros)) {
          state.centros = state.centros.map(c => ({
            unidad_negocio: '',
            cliente_cc: '',
            departamento_cod: '',
            municipio_cod: '',
            cuenta_control: '',
            paquete_trabajo: '',
            ...c,
          }))
        }
        return state as unknown as CentrosCostoState
      },
    }
  )
)
