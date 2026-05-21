export interface PermisoModulo {
  modulo: string
  leer: boolean
  editar: boolean
  eliminar: boolean
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  usuario: string
  clave: string
  correo: string
  rol: string
  situacion: string
  permisos: PermisoModulo[]
}

export const MODULOS_CRM = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agente', label: 'Agente Virtual' },
  { id: 'clientes', label: 'Empresas' },
  { id: 'contactos', label: 'Contactos' },
  { id: 'oportunidades', label: 'Oportunidades' },
  { id: 'productos', label: 'Productos y Servicios' },
  { id: 'cotizaciones', label: 'Cotizaciones' },
  { id: 'contratos', label: 'Contratos de Servicio' },
  { id: 'prospectos', label: 'Prospectos' },
  { id: 'pqrs', label: 'PQRS' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'personal', label: 'Personal Empresa' },
  { id: 'centros-costo', label: 'Centros de Costo' },
  { id: 'referencias', label: 'Tablas de Referencias' },
  { id: 'lineas-servicio', label: 'Líneas de Servicio' },
]

export const ROLES = ['Admin', 'Ventas', 'Soporte', 'Gerencia']

export const PERMISOS_DEFAULT: Record<string, PermisoModulo[]> = {
  Admin: MODULOS_CRM.map(m => ({ modulo: m.id, leer: true, editar: true, eliminar: true })),
  Ventas: MODULOS_CRM.map(m => ({ modulo: m.id, leer: true, editar: ['clientes', 'contactos', 'oportunidades', 'cotizaciones', 'prospectos'].includes(m.id), eliminar: false })),
  Soporte: MODULOS_CRM.map(m => ({ modulo: m.id, leer: true, editar: m.id === 'pqrs', eliminar: false })),
  Gerencia: MODULOS_CRM.map(m => ({ modulo: m.id, leer: true, editar: false, eliminar: false })),
}

export const ESTADOS_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  Activo: { bg: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' },
  Inactivo: { bg: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' },
  Bloqueado: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
}
