'use client'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useCentrosCostoStore, CentroCosto, parsearCodigo } from '@/features/centros-costo/store/centros-costo-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'
import ReportPanel from '@/shared/components/report-panel'


const empty = (): CentroCosto => ({
  id: '', codigo: '', nombre: '',
  unidad_negocio: '', cliente_cc: '', departamento_cod: '', municipio_cod: '', cuenta_control: '', paquete_trabajo: '',
  situacion: 'Activo', fecha_registro: todayColombia(),
})

export default function CentrosCostoPage() {
  const permisos = usePermisos('centros-costo')
  const { centros, addCentro, updateCentro, deleteCentro } = useCentrosCostoStore()
  const [selected, setSelected] = useState<CentroCosto | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      if (rows.length === 0) { alert('El archivo está vacío.'); return }

      // Normalizar claves (case-insensitive, sin tildes/espacios)
      const normKey = (k: string) => k.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
      const pick = (row: Record<string, unknown>, ...candidates: string[]): string => {
        for (const key of Object.keys(row)) {
          if (candidates.includes(normKey(key))) return String(row[key] ?? '').trim()
        }
        return ''
      }

      let creados = 0, duplicadosStore = 0, duplicadosArchivo = 0, omitidos = 0
      const errores: string[] = []
      const codigosVistos = new Set<string>()

      rows.forEach((row, idx) => {
        const codigoRaw = pick(row, 'codigo', 'cod', 'code', 'codigocentrocosto')
        const nombre = pick(row, 'nombre', 'descripcion', 'description', 'name')
        const sitRaw = pick(row, 'situacion', 'estado', 'status')

        // Solo dígitos, máx 15
        const codigo = codigoRaw.replace(/\D/g, '').slice(0, 15)
        if (!codigo || !nombre) {
          omitidos++
          errores.push(`Fila ${idx + 2}: código o nombre vacío`)
          return
        }
        const codigoLimpioOriginal = codigoRaw.replace(/\D/g, '')
        if (codigoLimpioOriginal.length > 15) {
          errores.push(`Fila ${idx + 2}: código "${codigoRaw}" truncado a 15 dígitos`)
        }

        // Parsear por posición para llenar los niveles automáticamente
        const nivelesObj = parsearCodigo(codigo)

        const situacion: 'Activo' | 'Inactivo' = /inact/i.test(sitRaw) ? 'Inactivo' : 'Activo'

        const codigoKey = codigo.toLowerCase()
        // Duplicado dentro del mismo archivo
        if (codigosVistos.has(codigoKey)) {
          duplicadosArchivo++
          errores.push(`Fila ${idx + 2}: código "${codigo}" duplicado dentro del archivo`)
          return
        }
        codigosVistos.add(codigoKey)

        // Duplicado con un registro ya existente en el sistema
        const existente = centros.find(c => c.codigo.toLowerCase() === codigoKey)
        if (existente) {
          duplicadosStore++
          errores.push(`Fila ${idx + 2}: código "${codigo}" ya existe en el sistema`)
          return
        }

        addCentro({
          id: crypto.randomUUID(), codigo, nombre, situacion,
          ...nivelesObj,
          fecha_registro: todayColombia(),
        })
        creados++
      })

      const resumen = [
        `✅ Importación finalizada`,
        `• Nuevos: ${creados}`,
        `• Duplicados en el sistema (rechazados): ${duplicadosStore}`,
        `• Duplicados dentro del archivo (rechazados): ${duplicadosArchivo}`,
        `• Omitidos por datos incompletos: ${omitidos}`,
      ].join('\n')
      alert(errores.length > 0 ? `${resumen}\n\nDetalle:\n${errores.slice(0, 15).join('\n')}${errores.length > 15 ? `\n(+${errores.length - 15} más)` : ''}` : resumen)
    } catch (err) {
      console.error('[centros-costo] Error importando:', err)
      alert('Error al procesar el archivo. Verifique que sea un Excel válido.')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const descargarPlantilla = () => {
    const wb = XLSX.utils.book_new()
    const ejemplo = [
      { Codigo: '200105001001001', Nombre: 'Vigilancia Sede Principal Medellín', Situacion: 'Activo' },
      { Codigo: '300211001002001', Nombre: 'Proyecto Tecnología Bogotá', Situacion: 'Activo' },
    ]
    const headers = ['Codigo', 'Nombre', 'Situacion']
    const ws = XLSX.utils.json_to_sheet(ejemplo, { header: headers })
    ws['!cols'] = [{ wch: 20 }, { wch: 42 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Centros_Costo')

    // Hoja de instrucciones
    const instrucciones = [
      { Campo: 'Codigo', Instruccion: 'Solo dígitos (máx 15). El sistema interpreta automáticamente cada posición:' },
      { Campo: '', Instruccion: '  • Posición 1 (1 dígito) → Unidad de Negocio' },
      { Campo: '', Instruccion: '  • Posiciones 2-4 (3 dígitos) → Código del Cliente' },
      { Campo: '', Instruccion: '  • Posiciones 5-6 (2 dígitos) → Departamento DANE' },
      { Campo: '', Instruccion: '  • Posiciones 7-9 (3 dígitos) → Municipio DANE' },
      { Campo: '', Instruccion: '  • Posiciones 10-13 (4 dígitos) → Cuenta de Control' },
      { Campo: '', Instruccion: '  • Posiciones 14-15 (2 dígitos, opcional) → Paquete de Trabajo' },
      { Campo: 'Nombre', Instruccion: 'Descripción legible del centro de costo (obligatorio).' },
      { Campo: 'Situacion', Instruccion: 'Activo o Inactivo (por defecto Activo).' },
      { Campo: '', Instruccion: '' },
      { Campo: 'Ejemplo', Instruccion: '200105001001001 → UN=2, Cliente=001, Depto=05, Muni=001, Cuenta=0010, Paquete=01' },
    ]
    const wsInst = XLSX.utils.json_to_sheet(instrucciones)
    wsInst['!cols'] = [{ wch: 14 }, { wch: 95 }]
    XLSX.utils.book_append_sheet(wb, wsInst, 'INSTRUCCIONES')

    XLSX.writeFile(wb, 'Plantilla_Centros_Costo.xlsx')
  }

  const filtered = centros.filter(c =>
    !search ||
    c.codigo.toLowerCase().includes(search.toLowerCase()) ||
    c.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const codigo = selected.codigo.trim()
    if (!codigo) { alert('El código es obligatorio'); return }
    if (codigo.length > 15) { alert('El código no puede exceder 15 caracteres'); return }
    if (!selected.nombre.trim()) { alert('El nombre es obligatorio'); return }
    // Validar que el código no se repita
    const repetido = centros.find(c => c.codigo.toLowerCase() === codigo.toLowerCase() && c.id !== selected.id)
    if (repetido) { alert(`El código "${codigo}" ya existe en otro centro de costo`); return }

    const toSave = { ...selected, codigo }
    if (toSave.id) updateCentro(toSave.id, toSave)
    else addCentro({ ...toSave, id: crypto.randomUUID() })
    setIsForm(false); setSelected(null)
  }

  if (isForm && selected) {
    const niveles = parsearCodigo(selected.codigo || '')
    const pieceStyle = (ok: boolean): React.CSSProperties => ({
      padding: '8px 10px', borderRadius: 8, background: ok ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${ok ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.12)'}`, textAlign: 'center',
    })
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)', maxWidth: 900 }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{selected.id ? 'Editar' : 'Nuevo'} Centro de Costo</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 }}>Escriba el código completo (hasta 15 dígitos). El sistema lo descompone automáticamente por posición.</p>

          {/* Código único */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Código *</label>
            <input
              value={selected.codigo || ''}
              onChange={e => {
                const d = e.target.value.replace(/\D/g, '').slice(0, 15)
                setSelected({ ...selected, codigo: d, ...parsearCodigo(d) })
              }}
              maxLength={15}
              required
              inputMode="numeric"
              placeholder="Ej: 200105001001001"
              style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 700, fontSize: 20, letterSpacing: 4, textAlign: 'center', height: 52 }}
            />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, textAlign: 'center' }}>{(selected.codigo || '').length} / 15 dígitos</p>
          </div>

          {/* Breakdown por posición — solo visual */}
          <p style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>DESCOMPOSICIÓN POR POSICIÓN</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'UN',        sub: 'Unidad Negocio', len: 1, v: niveles.unidad_negocio },
              { label: 'Cliente',   sub: 'Cód. Cliente',   len: 3, v: niveles.cliente_cc },
              { label: 'Depto',     sub: 'DANE',           len: 2, v: niveles.departamento_cod },
              { label: 'Municipio', sub: 'DANE',           len: 3, v: niveles.municipio_cod },
              { label: 'Cuenta',    sub: 'Control',        len: 4, v: niveles.cuenta_control },
              { label: 'Paquete',   sub: 'Opcional',       len: 2, v: niveles.paquete_trabajo },
            ].map(n => (
              <div key={n.label} style={pieceStyle(Boolean(n.v))}>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{n.label}</p>
                <p style={{ color: n.v ? '#facc15' : 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: 900, fontFamily: 'monospace', margin: '3px 0', textShadow: n.v ? '0 0 10px rgba(250,204,21,0.6)' : 'none' }}>{n.v || '_'.repeat(n.len)}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{n.sub} ({n.len})</p>
              </div>
            ))}
          </div>

          {/* Nombre, Situación y Fecha de Registro */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                value={selected.nombre || ''}
                onChange={e => setSelected({ ...selected, nombre: e.target.value.toUpperCase() })}
                required
                placeholder="Ej: Vigilancia Sede Norte - Andrés"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Situación</label>
              <select
                value={selected.situacion}
                onChange={e => setSelected({ ...selected, situacion: e.target.value as 'Activo' | 'Inactivo' })}
                style={inputStyle}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fecha de Registro</label>
              <input value={fDate(selected.fecha_registro)} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>Guardar</button>
            <button type="button" onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#64748b', color: '#fff' }}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="centros-costo"
          label="Centros de Costo"
          registros={centros}
          onClear={() => useCentrosCostoStore.setState({ centros: [] })}
          onRestore={(rs) => useCentrosCostoStore.setState({ centros: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Centros de Costo</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Administración de centros de costo (código hasta 15 caracteres)</p>
        </div>
        {permisos.editar && (
          <div style={{ display: 'flex', gap: 8 }}>
            {permisos.eliminar && centros.length > 0 && (
              <button onClick={() => {
                if (!confirm(`Esto eliminará los ${centros.length} centros de costo registrados. ¿Continuar?`)) return
                if (!confirm('Confirmación final: esta acción NO se puede deshacer. ¿Está seguro?')) return
                centros.forEach(c => deleteCentro(c.id))
                alert(`✅ ${centros.length} centros de costo eliminados.`)
              }}
                style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)' }}>
                🗑️ Borrar todos
              </button>
            )}
            <button onClick={descargarPlantilla}
              style={{ ...btnStyle, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
              📄 Plantilla Excel
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }}
            />
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              style={{ ...btnStyle, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)', opacity: importing ? 0.6 : 1 }}>
              {importing ? '⏳ Importando...' : '📤 Importar Excel'}
            </button>
            <button onClick={() => { setSelected(empty()); setIsForm(true) }}
              style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>+ Nuevo Centro de Costo</button>
          </div>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o nombre..."
        style={{ ...inputStyle, maxWidth: 460, marginBottom: 16 }} />

      <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Código', 'UN', 'Cliente', 'Depto', 'Muni', 'Cuenta', 'Paq', 'Nombre', 'Situación', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{c.codigo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace', textAlign: 'center' }}>{c.unidad_negocio || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.cliente_cc || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.departamento_cod || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.municipio_cod || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.cuenta_control || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'monospace' }}>{c.paquete_trabajo || '—'}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{c.nombre}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.situacion === 'Activo' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: c.situacion === 'Activo' ? '#86efac' : '#d1d5db', border: '1px solid rgba(255,255,255,0.15)' }}>{c.situacion}</span>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {permisos.editar && <button onClick={() => { setSelected(c); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#fff', border: '1px solid #16a34a' }}>Editar</button>}
                    {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar centro de costo "${c.codigo} - ${c.nombre}"?`)) deleteCentro(c.id) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#b91c1c', color: '#fff', border: '1px solid #dc2626' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay centros de costo registrados</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Reportes PDF/Excel */}
      <div style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#fbbf24', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>📊 Generar Reporte de Centros de Costo</h3>
        <ReportPanel
          title="Reporte de Centros de Costo"
          columns={[
            { header: 'Código', key: 'codigo', width: 16 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Unidad Negocio', key: 'unidad_negocio', width: 8 },
            { header: 'Cliente', key: 'cliente_cc', width: 8 },
            { header: 'Depto', key: 'departamento_cod', width: 8 },
            { header: 'Muni', key: 'municipio_cod', width: 8 },
            { header: 'Cuenta', key: 'cuenta_control', width: 10 },
            { header: 'Paquete', key: 'paquete_trabajo', width: 8 },
            { header: 'Situación', key: 'situacion', width: 10 },
          ]}
          rows={filtered.map(c => ({
            codigo: c.codigo, nombre: c.nombre,
            unidad_negocio: c.unidad_negocio, cliente_cc: c.cliente_cc,
            departamento_cod: c.departamento_cod, municipio_cod: c.municipio_cod,
            cuenta_control: c.cuenta_control, paquete_trabajo: c.paquete_trabajo,
            situacion: c.situacion,
          }))}
        />
      </div>
    </div>
  )
}
