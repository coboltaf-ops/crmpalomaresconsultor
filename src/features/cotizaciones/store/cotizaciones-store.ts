import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Seguimiento } from '@/shared/types/seguimiento'

export type { Seguimiento }

export interface DetalleCotizacion {
  id: string
  producto_id: string
  codigo_producto: string
  descripcion: string
  descripcion_extendida: string
  cantidad: number
  precio_unitario: number
  unidad_medida: string
  descuento_pct: number
  subtotal: number
}

export interface Cotizacion {
  id: string
  codigo: string
  nro: number
  linea_servicio_id: string
  linea_servicio_codigo: string
  linea_servicio_nombre: string
  pct_aiu: number
  /** Tipo de servicio resumido para la cotización (un solo valor general). */
  tipo_servicio: string
  /** Número de cotización interno de la empresa (manual, distinto al consecutivo auto). */
  nro_cotizacion_interno: string
  fecha_emision: string
  fecha_vencimiento: string
  cliente_id: string
  cliente_nombre: string
  contacto_id: string
  contacto_nombre: string
  oportunidad_id: string
  oportunidad_nombre: string
  tipo_moneda: string
  condicion_pago: string
  pct_impuesto: number
  /** Impuesto de Industria y Comercio (retención). Se resta del total. */
  pct_ica: number
  observaciones: string
  detalles: DetalleCotizacion[]
  situacion: string
  responsable: string
  vendedor: string
  fecha_registro: string
  seguimientos: Seguimiento[]
}

interface CotizacionesState {
  cotizaciones: Cotizacion[]
  addCotizacion: (c: Cotizacion) => void
  updateCotizacion: (id: string, c: Partial<Cotizacion>) => void
  deleteCotizacion: (id: string) => void
}

export const useCotizacionesStore = create<CotizacionesState>()(
  persist(
    (set) => ({
      cotizaciones: [],
      addCotizacion: (c) => set((s) => ({ cotizaciones: [...s.cotizaciones, c] })),
      updateCotizacion: (id, c) => set((s) => ({ cotizaciones: s.cotizaciones.map((r) => r.id === id ? { ...r, ...c } : r) })),
      deleteCotizacion: (id) => set((s) => ({ cotizaciones: s.cotizaciones.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-cotizaciones-storage',
      version: 6,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { cotizaciones?: Partial<Cotizacion>[] }
        if (version < 2 && Array.isArray(state.cotizaciones)) {
          state.cotizaciones = state.cotizaciones.map((c) => ({
            linea_servicio_id: '',
            linea_servicio_codigo: '',
            linea_servicio_nombre: '',
            pct_aiu: 0,
            ...c,
          })) as Cotizacion[]
        }
        if (version < 3 && Array.isArray(state.cotizaciones)) {
          state.cotizaciones = state.cotizaciones.map((c) => ({
            ...c,
            detalles: (c.detalles || []).map((d) => ({ ...d, descripcion_extendida: d.descripcion_extendida ?? '' })),
          })) as Cotizacion[]
        }
        if (version < 4 && Array.isArray(state.cotizaciones)) {
          state.cotizaciones = state.cotizaciones.map((c) => ({
            ...c,
            cliente_nombre: (c.cliente_nombre || '').toUpperCase(),
            contacto_nombre: (c.contacto_nombre || '').toUpperCase(),
            vendedor: (c.vendedor || '').toUpperCase(),
          })) as Cotizacion[]
        }
        if (version < 5 && Array.isArray(state.cotizaciones)) {
          state.cotizaciones = state.cotizaciones.map((c) => ({
            tipo_servicio: '',
            pct_ica: 0,
            ...c,
          })) as Cotizacion[]
        }
        if (version < 6 && Array.isArray(state.cotizaciones)) {
          state.cotizaciones = state.cotizaciones.map((c) => ({
            nro_cotizacion_interno: '',
            ...c,
          })) as Cotizacion[]
        }
        return state as CotizacionesState
      },
    }
  )
)
