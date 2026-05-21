import * as XLSX from 'xlsx'

const HOJAS: Record<string, { headers: string[]; ejemplo: Record<string, unknown>[] }> = {
  'Empresas': {
    headers: ['Codigo', 'Tipo_Identificacion', 'Nro_Documento', 'Razon_Social', 'Nombre_Comercial', 'Representante_Legal', 'Fecha_Inicio_Cliente', 'Centro_Costo', 'Actividad', 'Telefono', 'Email', 'Sitio_Web', 'Direccion', 'Region', 'Departamento', 'Municipio', 'Ciudad_Pueblo', 'Pais', 'Codigo_Postal', 'Condicion_Pago', 'Tipo_Moneda', 'Situacion', 'Observaciones'],
    ejemplo: [{
      Codigo: 'CLI-00001', Tipo_Identificacion: 'NIT', Nro_Documento: '900123456-7', Razon_Social: 'Empresa Cliente S.A.S.', Nombre_Comercial: 'Empresa Cliente',
      Representante_Legal: 'Juan Pérez García', Fecha_Inicio_Cliente: '2024-03-15', Centro_Costo: '100001 - Sede Principal', Actividad: 'Construcción',
      Telefono: '601 555 1234', Email: 'contacto@empresacliente.com', Sitio_Web: 'www.empresacliente.com',
      Direccion: 'Calle 100 # 15-20 Oficina 301', Region: 'Andina', Departamento: 'Cundinamarca', Municipio: 'Chía', Ciudad_Pueblo: 'Centro',
      Pais: 'Colombia', Codigo_Postal: '111121', Condicion_Pago: '30 días', Tipo_Moneda: 'Pesos Colombianos', Situacion: 'Activo',
      Observaciones: 'Cliente estratégico zona norte',
    }],
  },
  'Contactos': {
    headers: ['Codigo', 'Empresa_Razon_Social', 'Nombre', 'Apellido', 'Cargo', 'Correo', 'Telefono', 'Celular', 'Nivel_Influencia', 'Es_Principal', 'Situacion', 'Observaciones'],
    ejemplo: [{
      Codigo: 'CON-00001', Empresa_Razon_Social: 'Empresa Cliente S.A.S.', Nombre: 'María', Apellido: 'Gómez Rodríguez', Cargo: 'Gerente de Compras',
      Correo: 'maria.gomez@empresacliente.com', Telefono: '601 555 1234', Celular: '300 123 4567',
      Nivel_Influencia: 'Decisor', Es_Principal: 'Sí', Situacion: 'Activo', Observaciones: 'Contacto directo para cotizaciones',
    }],
  },
  'Productos_Servicios': {
    headers: ['Codigo', 'Tipo', 'Linea_Servicio', 'Descripcion', 'Categoria', 'Unidad_Medida', 'Precio_Unitario', 'Tipo_Moneda', 'Modalidad', 'Situacion', 'Observaciones'],
    ejemplo: [
      { Codigo: 'VIG-001', Tipo: 'Servicio', Linea_Servicio: 'VIG', Descripcion: 'Puesto Vigilante 24h Armado', Categoria: 'Vigilancia', Unidad_Medida: 'Puesto/Mes', Precio_Unitario: 9800000, Tipo_Moneda: 'Pesos Colombianos', Modalidad: 'Mensual', Situacion: 'Activo', Observaciones: 'Incluye dotación y ARL' },
      { Codigo: 'CCT-001', Tipo: 'Producto', Linea_Servicio: 'CCT', Descripcion: 'Cámara IP Bullet 4MP Exterior', Categoria: 'Cámaras', Unidad_Medida: 'Unidad', Precio_Unitario: 320000, Tipo_Moneda: 'Pesos Colombianos', Modalidad: 'Único', Situacion: 'Activo', Observaciones: 'IP67, PoE' },
    ],
  },
  'Contratos': {
    headers: ['Codigo', 'Fecha', 'Empresa_Razon_Social', 'Contacto', 'Tipo_Servicio', 'Centro_Costo', 'Direccion', 'Region', 'Departamento', 'Municipio', 'Fecha_Inicio', 'Fecha_Finalizacion', 'Valor_Anual', 'Valor_Mensual', 'Nro_Poliza_RSE', 'Nro_Poliza_Cumplimiento', 'Representante_Legal', 'Situacion', 'Dias_Atraso', 'Observaciones'],
    ejemplo: [{
      Codigo: 'CTR-00001', Fecha: '2024-01-15', Empresa_Razon_Social: 'Empresa Cliente S.A.S.', Contacto: 'María Gómez Rodríguez',
      Tipo_Servicio: 'Vigilancia Física Armada', Centro_Costo: '100001 - Sede Principal',
      Direccion: 'Calle 100 # 15-20 Oficina 301', Region: 'Andina', Departamento: 'Cundinamarca', Municipio: 'Chía',
      Fecha_Inicio: '2024-02-01', Fecha_Finalizacion: '2025-01-31', Valor_Anual: 117600000, Valor_Mensual: 9800000,
      Nro_Poliza_RSE: 'POL-RSE-001234', Nro_Poliza_Cumplimiento: 'POL-CUM-005678', Representante_Legal: 'Juan Pérez García',
      Situacion: 'Vigente', Dias_Atraso: 0, Observaciones: 'Contrato anual renovable',
    }],
  },
  'Personal': {
    headers: ['Codigo', 'Nombre', 'Apellido', 'Correo', 'Nro_Movil', 'Departamento_Area', 'Cargo', 'Rol_CRM', 'Situacion'],
    ejemplo: [
      { Codigo: 'PER-00001', Nombre: 'Luis', Apellido: 'Rodríguez Castro', Correo: 'luis.rodriguez@novaseguridad.com', Nro_Movil: '300 111 2222', Departamento_Area: 'Comercial', Cargo: 'Ejecutivo de Cuenta', Rol_CRM: 'Ventas', Situacion: 'Activo' },
      { Codigo: 'PER-00002', Nombre: 'Ana', Apellido: 'Martínez Silva', Correo: 'ana.martinez@novaseguridad.com', Nro_Movil: '300 333 4444', Departamento_Area: 'Operaciones', Cargo: 'Supervisora de Turno', Rol_CRM: 'Soporte', Situacion: 'Activo' },
    ],
  },
  'Centros_Costo': {
    headers: ['Codigo_6_Digitos', 'Descripcion', 'Situacion'],
    ejemplo: [
      { Codigo_6_Digitos: '100001', Descripcion: 'Sede Principal', Situacion: 'Activo' },
      { Codigo_6_Digitos: '100002', Descripcion: 'Sede Norte', Situacion: 'Activo' },
      { Codigo_6_Digitos: '200001', Descripcion: 'Operaciones', Situacion: 'Activo' },
      { Codigo_6_Digitos: '300001', Descripcion: 'Administrativo', Situacion: 'Activo' },
    ],
  },
  'Lineas_Servicio': {
    headers: ['Codigo', 'Nombre', 'Descripcion', 'Prefijo_Cotizacion', 'IVA_Default', 'AIU_Default', 'Situacion'],
    ejemplo: [
      { Codigo: 'VIG', Nombre: 'Vigilancia Física', Descripcion: 'Servicio de vigilancia con personal armado y desarmado', Prefijo_Cotizacion: 'COT-VIG-', IVA_Default: 19, AIU_Default: 10, Situacion: 'Activo' },
      { Codigo: 'ESC', Nombre: 'Escoltas', Descripcion: 'Escoltas personales y de mercancías', Prefijo_Cotizacion: 'COT-ESC-', IVA_Default: 19, AIU_Default: 12, Situacion: 'Activo' },
      { Codigo: 'CCT', Nombre: 'CCTV / Cámaras', Descripcion: 'Vigilancia con cámaras y monitoreo', Prefijo_Cotizacion: 'COT-CCT-', IVA_Default: 19, AIU_Default: 8, Situacion: 'Activo' },
      { Codigo: 'GPS', Nombre: 'Rastreo Satelital', Descripcion: 'Rastreo GPS de vehículos y activos', Prefijo_Cotizacion: 'COT-GPS-', IVA_Default: 19, AIU_Default: 8, Situacion: 'Activo' },
      { Codigo: 'MED', Nombre: 'Medios Tecnológicos', Descripcion: 'Alarmas, control de acceso, sistemas electrónicos', Prefijo_Cotizacion: 'COT-MED-', IVA_Default: 19, AIU_Default: 8, Situacion: 'Activo' },
      { Codigo: 'CAN', Nombre: 'Caninos', Descripcion: 'Servicio de vigilancia canina', Prefijo_Cotizacion: 'COT-CAN-', IVA_Default: 19, AIU_Default: 10, Situacion: 'Activo' },
    ],
  },
  'Incidencias_PQRS': {
    headers: ['Descripcion_Incidencia', 'Situacion'],
    ejemplo: [
      { Descripcion_Incidencia: 'Falla en servicio de vigilancia', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Inasistencia de personal', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Daño en equipo', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Robo o hurto', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Emergencia médica', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Incumplimiento de protocolo', Situacion: 'Activo' },
      { Descripcion_Incidencia: 'Otro', Situacion: 'Activo' },
    ],
  },
  'Oportunidades': {
    headers: ['Codigo', 'Nombre', 'Empresa', 'Contacto', 'Valor_Estimado', 'Tipo_Moneda', 'Probabilidad', 'Etapa', 'Fecha_Cierre_Estimada', 'Origen', 'Situacion', 'Responsable', 'Observaciones'],
    ejemplo: [{
      Codigo: 'OPO-00001', Nombre: 'Vigilancia Sede Norte 2025', Empresa: 'Empresa Cliente S.A.S.', Contacto: 'María Gómez Rodríguez',
      Valor_Estimado: 117600000, Tipo_Moneda: 'Pesos Colombianos', Probabilidad: 70, Etapa: 'Propuesta',
      Fecha_Cierre_Estimada: '2025-02-28', Origen: 'Referido', Situacion: 'Abierta', Responsable: 'Luis Rodríguez Castro',
      Observaciones: 'Cliente listo para firmar, esperando aprobación interna',
    }],
  },
  'INSTRUCCIONES': {
    headers: ['Campo', 'Instrucción'],
    ejemplo: [
      { Campo: 'Codigo', Instrucción: 'Se puede dejar vacío — el sistema lo genera automáticamente. Si ya tiene códigos previos, respételos.' },
      { Campo: 'Fechas', Instrucción: 'Formato YYYY-MM-DD (ejemplo: 2024-03-15). Excel puede mostrarlas como fecha — está bien.' },
      { Campo: 'Valores numéricos', Instrucción: 'Sin separadores de miles, sin símbolo $. Ejemplo: 9800000 (no $9.800.000).' },
      { Campo: 'Empresa_Razon_Social', Instrucción: 'Debe coincidir EXACTAMENTE con la Razón Social de la hoja Empresas.' },
      { Campo: 'Linea_Servicio', Instrucción: 'Usar código de 3 letras: VIG, ESC, CCT, GPS, MED, CAN.' },
      { Campo: 'Tipo (Productos)', Instrucción: 'Solo dos valores permitidos: "Servicio" o "Producto".' },
      { Campo: 'Modalidad', Instrucción: 'Único (pago una sola vez) / Mensual (recurrente mes a mes) / Anual (pago anual).' },
      { Campo: 'Situacion', Instrucción: 'Activo / Inactivo / Prospecto (según aplique al módulo).' },
      { Campo: 'Region', Instrucción: 'Andina / Caribe / Pacífica / Orinoquía / Amazonía / Insular.' },
      { Campo: 'Nivel_Influencia', Instrucción: 'Decisor / Influenciador / Usuario Final / Evaluador Técnico / Patrocinador.' },
      { Campo: 'Rol_CRM', Instrucción: 'Admin / Ventas / Soporte / Gerencia.' },
    ],
  },
}

export async function GET() {
  const wb = XLSX.utils.book_new()

  // Hoja de instrucciones primero
  const instrucciones = HOJAS['INSTRUCCIONES']
  const wsInst = XLSX.utils.json_to_sheet(instrucciones.ejemplo, { header: instrucciones.headers })
  XLSX.utils.book_append_sheet(wb, wsInst, '📋 INSTRUCCIONES')

  for (const [nombre, hoja] of Object.entries(HOJAS)) {
    if (nombre === 'INSTRUCCIONES') continue
    // Crear hoja con headers y fila de ejemplo
    const ws = XLSX.utils.json_to_sheet(hoja.ejemplo, { header: hoja.headers })
    // Ajustar ancho de columnas
    ws['!cols'] = hoja.headers.map(h => ({ wch: Math.max(h.length + 2, 18) }))
    XLSX.utils.book_append_sheet(wb, ws, nombre.substring(0, 31))
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Plantillas_NovaSeguridad.xlsx"',
    },
  })
}
