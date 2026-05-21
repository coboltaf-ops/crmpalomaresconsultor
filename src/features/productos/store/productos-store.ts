import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Seguimiento } from '@/shared/types/seguimiento'

export type { Seguimiento }

export type TipoItem = 'Servicio' | 'Producto'
export type ModalidadItem = 'Único' | 'Mensual' | 'Anual'

export interface Producto {
  id: string
  codigo: string
  descripcion: string
  tipo: TipoItem
  linea_servicio_id: string
  linea_servicio_codigo: string
  modalidad: ModalidadItem
  categoria: string
  unidad_medida: string
  precio_unitario: number
  tipo_moneda: string
  observaciones: string
  situacion: string
  fecha_registro: string
  seguimientos: Seguimiento[]
}

interface ProductosState {
  productos: Producto[]
  addProducto: (p: Producto) => void
  updateProducto: (id: string, p: Partial<Producto>) => void
  deleteProducto: (id: string) => void
}

export const useProductosStore = create<ProductosState>()(
  persist(
    (set) => ({
      productos: [],
      addProducto: (p) => set((s) => ({ productos: [...s.productos, p] })),
      updateProducto: (id, p) => set((s) => ({ productos: s.productos.map((r) => r.id === id ? { ...r, ...p } : r) })),
      deleteProducto: (id) => set((s) => ({ productos: s.productos.filter((r) => r.id !== id) })),
    }),
    {
      name: 'crm-productos-storage',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as { productos?: Partial<Producto>[] }
        if (version < 2 && Array.isArray(state.productos)) {
          state.productos = state.productos.map((p) => ({
            tipo: 'Servicio' as TipoItem,
            linea_servicio_id: '',
            linea_servicio_codigo: '',
            modalidad: 'Único' as ModalidadItem,
            ...p,
          })) as Producto[]
        }
        return state as ProductosState
      },
    }
  )
)
