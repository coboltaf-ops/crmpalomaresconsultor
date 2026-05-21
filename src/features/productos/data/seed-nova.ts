import { Producto } from '@/features/productos/store/productos-store'

type SeedItem = {
  codigo: string
  descripcion: string
  tipo: 'Servicio' | 'Producto'
  lineaId: string
  lineaCodigo: string
  modalidad: 'Único' | 'Mensual' | 'Anual'
  categoria: string
  unidad: string
  precio: number
  obs: string
  fecha: string
}

const seedItems: SeedItem[] = [
  // ── VIGILANCIA FÍSICA (VIG) ──
  { codigo: 'VIG-001', descripcion: 'Puesto Vigilante 24h Armado', tipo: 'Servicio', lineaId: '1', lineaCodigo: 'VIG', modalidad: 'Mensual', categoria: 'Vigilancia', unidad: 'Puesto/Mes', precio: 9800000, obs: 'Vigilante con arma, 3 turnos rotativos. Incluye dotación, uniforme, ARL y supervisión.', fecha: '2026-01-10' },
  { codigo: 'VIG-002', descripcion: 'Puesto Vigilante 24h Desarmado', tipo: 'Servicio', lineaId: '1', lineaCodigo: 'VIG', modalidad: 'Mensual', categoria: 'Vigilancia', unidad: 'Puesto/Mes', precio: 8500000, obs: 'Vigilante sin arma, 3 turnos. Apto para conjuntos residenciales y comercios.', fecha: '2026-01-10' },
  { codigo: 'VIG-003', descripcion: 'Puesto Vigilante 12h Diurno', tipo: 'Servicio', lineaId: '1', lineaCodigo: 'VIG', modalidad: 'Mensual', categoria: 'Vigilancia', unidad: 'Puesto/Mes', precio: 4900000, obs: 'Servicio diurno 12 horas. Ideal para portería de oficinas y bodegas.', fecha: '2026-01-10' },
  { codigo: 'VIG-004', descripcion: 'Puesto Vigilante 12h Nocturno', tipo: 'Servicio', lineaId: '1', lineaCodigo: 'VIG', modalidad: 'Mensual', categoria: 'Vigilancia', unidad: 'Puesto/Mes', precio: 5400000, obs: 'Servicio nocturno 12 horas con recargo legal.', fecha: '2026-01-10' },
  { codigo: 'VIG-005', descripcion: 'Supervisor Móvil de Ronda', tipo: 'Servicio', lineaId: '1', lineaCodigo: 'VIG', modalidad: 'Mensual', categoria: 'Supervisión', unidad: 'Servicio/Mes', precio: 3200000, obs: 'Visitas de supervisión por ruta, mínimo 4 visitas semanales.', fecha: '2026-01-15' },

  // ── ESCOLTAS (ESC) ──
  { codigo: 'ESC-001', descripcion: 'Escolta Personal 24h Armado', tipo: 'Servicio', lineaId: '2', lineaCodigo: 'ESC', modalidad: 'Mensual', categoria: 'Escolta', unidad: 'Servicio/Mes', precio: 12500000, obs: 'Escolta con experiencia, arma de fuego y vehículo. 3 turnos.', fecha: '2026-01-15' },
  { codigo: 'ESC-002', descripcion: 'Escolta Personal Diurno (12h)', tipo: 'Servicio', lineaId: '2', lineaCodigo: 'ESC', modalidad: 'Mensual', categoria: 'Escolta', unidad: 'Servicio/Mes', precio: 7200000, obs: 'Escolta armado, jornada de 12 horas. Sin vehículo incluido.', fecha: '2026-01-15' },
  { codigo: 'ESC-003', descripcion: 'Escolta de Mercancía por Ruta', tipo: 'Servicio', lineaId: '2', lineaCodigo: 'ESC', modalidad: 'Único', categoria: 'Custodia', unidad: 'Servicio', precio: 850000, obs: 'Acompañamiento de carga valiosa entre ciudades. Tarifa por ruta.', fecha: '2026-01-15' },

  // ── CCTV (CCT) ──
  { codigo: 'CCT-001', descripcion: 'Cámara IP Bullet 4MP Exterior', tipo: 'Producto', lineaId: '3', lineaCodigo: 'CCT', modalidad: 'Único', categoria: 'Cámaras', unidad: 'Unidad', precio: 320000, obs: 'Cámara IP día/noche con visión nocturna 30m. IP67. PoE.', fecha: '2026-02-01' },
  { codigo: 'CCT-002', descripcion: 'Cámara IP Domo 4MP Interior', tipo: 'Producto', lineaId: '3', lineaCodigo: 'CCT', modalidad: 'Único', categoria: 'Cámaras', unidad: 'Unidad', precio: 290000, obs: 'Domo vandálico para interiores y exteriores cubiertos.', fecha: '2026-02-01' },
  { codigo: 'CCT-003', descripcion: 'NVR 16 Canales 4K + 2TB', tipo: 'Producto', lineaId: '3', lineaCodigo: 'CCT', modalidad: 'Único', categoria: 'Grabación', unidad: 'Unidad', precio: 1850000, obs: 'Grabador IP 16 canales con disco duro de 2TB y soporte 4K.', fecha: '2026-02-01' },
  { codigo: 'CCT-004', descripcion: 'Instalación CCTV - Punto', tipo: 'Servicio', lineaId: '3', lineaCodigo: 'CCT', modalidad: 'Único', categoria: 'Instalación', unidad: 'Punto', precio: 220000, obs: 'Instalación, cableado y configuración por punto de cámara. Hasta 30m de cable.', fecha: '2026-02-05' },
  { codigo: 'CCT-005', descripcion: 'Monitoreo CCTV 24/7', tipo: 'Servicio', lineaId: '3', lineaCodigo: 'CCT', modalidad: 'Mensual', categoria: 'Monitoreo', unidad: 'Mes', precio: 950000, obs: 'Monitoreo remoto con operador desde central, hasta 16 cámaras.', fecha: '2026-02-10' },

  // ── GPS ──
  { codigo: 'GPS-001', descripcion: 'Equipo GPS Vehicular', tipo: 'Producto', lineaId: '4', lineaCodigo: 'GPS', modalidad: 'Único', categoria: 'Hardware GPS', unidad: 'Unidad', precio: 380000, obs: 'GPS 4G con botón de pánico, corte de motor remoto, antena oculta.', fecha: '2026-02-15' },
  { codigo: 'GPS-002', descripcion: 'Plan Rastreo Satelital Mensual', tipo: 'Servicio', lineaId: '4', lineaCodigo: 'GPS', modalidad: 'Mensual', categoria: 'Plataforma', unidad: 'Vehículo/Mes', precio: 65000, obs: 'Plataforma web + app móvil, históricos 6 meses, alertas en tiempo real.', fecha: '2026-02-15' },
  { codigo: 'GPS-003', descripcion: 'Instalación GPS Vehicular', tipo: 'Servicio', lineaId: '4', lineaCodigo: 'GPS', modalidad: 'Único', categoria: 'Instalación', unidad: 'Servicio', precio: 120000, obs: 'Instalación oculta del equipo GPS por técnico certificado.', fecha: '2026-02-20' },

  // ── MEDIOS TECNOLÓGICOS (MED) ──
  { codigo: 'MED-001', descripcion: 'Kit Alarma Residencial Inalámbrica', tipo: 'Producto', lineaId: '5', lineaCodigo: 'MED', modalidad: 'Único', categoria: 'Alarmas', unidad: 'Kit', precio: 1450000, obs: 'Panel + 4 sensores PIR + 2 contactos magnéticos + sirena + comunicador GSM.', fecha: '2026-03-01' },
  { codigo: 'MED-002', descripcion: 'Monitoreo de Alarmas 24/7', tipo: 'Servicio', lineaId: '5', lineaCodigo: 'MED', modalidad: 'Mensual', categoria: 'Monitoreo', unidad: 'Mes', precio: 95000, obs: 'Monitoreo desde central, atención de eventos, reporte mensual.', fecha: '2026-03-01' },
  { codigo: 'MED-003', descripcion: 'Control de Acceso por Tarjeta', tipo: 'Producto', lineaId: '5', lineaCodigo: 'MED', modalidad: 'Único', categoria: 'Acceso', unidad: 'Punto', precio: 850000, obs: 'Lector RFID + cerradura electromagnética + 50 tarjetas + software de gestión.', fecha: '2026-03-05' },

  // ── CANINOS (CAN) ──
  { codigo: 'CAN-001', descripcion: 'Servicio Canino Guía + Manejador', tipo: 'Servicio', lineaId: '6', lineaCodigo: 'CAN', modalidad: 'Mensual', categoria: 'Caninos', unidad: 'Turno/Mes', precio: 6800000, obs: 'Binomio canino entrenado en detección y disuasión. Incluye veterinaria y alimentación.', fecha: '2026-03-10' },
  { codigo: 'CAN-002', descripcion: 'Inspección Antiexplosivos por Evento', tipo: 'Servicio', lineaId: '6', lineaCodigo: 'CAN', modalidad: 'Único', categoria: 'Detección', unidad: 'Servicio', precio: 1200000, obs: 'Binomio canino entrenado en detección de explosivos para eventos masivos.', fecha: '2026-03-12' },
]

export const buildNovaProductosSeed = (): Producto[] =>
  seedItems.map(s => ({
    id: crypto.randomUUID(),
    codigo: s.codigo,
    descripcion: s.descripcion,
    tipo: s.tipo,
    linea_servicio_id: s.lineaId,
    linea_servicio_codigo: s.lineaCodigo,
    modalidad: s.modalidad,
    categoria: s.categoria,
    unidad_medida: s.unidad,
    precio_unitario: s.precio,
    tipo_moneda: 'Pesos Colombianos',
    observaciones: s.obs,
    situacion: 'Activo',
    fecha_registro: s.fecha,
    seguimientos: [],
  }))
