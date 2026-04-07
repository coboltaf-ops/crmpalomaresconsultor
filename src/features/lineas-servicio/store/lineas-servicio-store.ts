import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LineaServicio {
  id: string
  codigo: string          // 3 letras: VIG, ESC, CCT, GPS, MED, CAN
  nombre: string          // Vigilancia Física, Escoltas, etc.
  descripcion: string
  prefijo_cotizacion: string  // Ej: "COT-VIG-"
  iva_default: number     // 19, 5, 0
  aiu_default: number     // % de Administración + Imprevistos + Utilidad
  color: string           // Color hex para badges
  situacion: 'Activo' | 'Inactivo'
}

const seed: LineaServicio[] = [
  { id: '1', codigo: 'VIG', nombre: 'Vigilancia Física', descripcion: 'Servicio de vigilancia con personal armado y desarmado', prefijo_cotizacion: 'COT-VIG-', iva_default: 19, aiu_default: 10, color: '#1e3a8a', situacion: 'Activo' },
  { id: '2', codigo: 'ESC', nombre: 'Escoltas', descripcion: 'Escoltas personales y de mercancías', prefijo_cotizacion: 'COT-ESC-', iva_default: 19, aiu_default: 12, color: '#7c2d12', situacion: 'Activo' },
  { id: '3', codigo: 'CCT', nombre: 'CCTV / Cámaras', descripcion: 'Vigilancia con cámaras y monitoreo', prefijo_cotizacion: 'COT-CCT-', iva_default: 19, aiu_default: 8, color: '#15803d', situacion: 'Activo' },
  { id: '4', codigo: 'GPS', nombre: 'Rastreo Satelital', descripcion: 'Rastreo GPS de vehículos y activos', prefijo_cotizacion: 'COT-GPS-', iva_default: 19, aiu_default: 8, color: '#9333ea', situacion: 'Activo' },
  { id: '5', codigo: 'MED', nombre: 'Medios Tecnológicos', descripcion: 'Alarmas, control de acceso, sistemas electrónicos', prefijo_cotizacion: 'COT-MED-', iva_default: 19, aiu_default: 8, color: '#0891b2', situacion: 'Activo' },
  { id: '6', codigo: 'CAN', nombre: 'Caninos', descripcion: 'Servicio de vigilancia canina', prefijo_cotizacion: 'COT-CAN-', iva_default: 19, aiu_default: 10, color: '#a16207', situacion: 'Activo' },
]

interface LineasState {
  lineas: LineaServicio[]
  addLinea: (l: LineaServicio) => void
  updateLinea: (id: string, l: Partial<LineaServicio>) => void
  deleteLinea: (id: string) => void
  resetSeed: () => void
}

export const useLineasServicioStore = create<LineasState>()(
  persist(
    (set) => ({
      lineas: seed,
      addLinea: (l) => set((s) => ({ lineas: [...s.lineas, l] })),
      updateLinea: (id, l) => set((s) => ({ lineas: s.lineas.map((r) => r.id === id ? { ...r, ...l } : r) })),
      deleteLinea: (id) => set((s) => ({ lineas: s.lineas.filter((r) => r.id !== id) })),
      resetSeed: () => set({ lineas: seed }),
    }),
    { name: 'crm-lineas-servicio-storage' }
  )
)
