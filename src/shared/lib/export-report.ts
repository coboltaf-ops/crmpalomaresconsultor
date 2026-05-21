import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

type ReportColumn = { header: string; key: string; width?: number }
export type EmpresaInfo = { nombre?: string; nro_documento?: string; direccion?: string; ciudad?: string }
type ReportOptions = {
  title: string; subtitle?: string; columns: ReportColumn[]
  rows: Record<string, string | number>[]; filename?: string
  empresa?: EmpresaInfo
  /** Claves de columnas numéricas a sumar al final del reporte. */
  summableKeys?: string[]
}

function fechaHoraEmision(): string {
  const ahora = new Date()
  const fecha = ahora.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = ahora.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' })
  return `Emitido: ${fecha} ${hora}`
}

const fmtMoneyCO = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function calcularTotales(opts: ReportOptions): Record<string, number> {
  const totales: Record<string, number> = {}
  for (const k of opts.summableKeys || []) {
    totales[k] = opts.rows.reduce((s, r) => s + (typeof r[k] === 'number' ? r[k] as number : Number(r[k]) || 0), 0)
  }
  return totales
}

export function exportToPDF(opts: ReportOptions) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const empNombre = opts.empresa?.nombre || ''
  const empSub = [opts.empresa?.nro_documento ? `NIT: ${opts.empresa.nro_documento}` : '', opts.empresa?.direccion, opts.empresa?.ciudad].filter(Boolean).join(' · ')
  const headerH = empNombre ? 42 : 32
  doc.setFillColor(30, 27, 75)
  doc.rect(0, 0, 297, headerH, 'F')
  doc.setTextColor(255, 255, 255)
  if (empNombre) {
    doc.setFontSize(14); doc.text(empNombre, 14, 12)
    if (empSub) { doc.setFontSize(9); doc.text(empSub, 14, 18) }
    doc.setFontSize(13); doc.text(opts.title, 14, 28)
    doc.setFontSize(8); doc.text(fechaHoraEmision(), 14, 34)
    if (opts.subtitle) { doc.setFontSize(8); doc.text(opts.subtitle, 14, 39) }
  } else {
    doc.setFontSize(16); doc.text(opts.title, 14, 14)
    doc.setFontSize(9); doc.text(fechaHoraEmision(), 14, 20)
    if (opts.subtitle) { doc.setFontSize(10); doc.text(opts.subtitle, 14, 26) }
  }
  doc.setTextColor(0, 0, 0)

  const summableKeys = opts.summableKeys || []
  const totales = calcularTotales(opts)
  // Construir fila de totales si hay summableKeys
  let rowFooter: (string | number)[][] = []
  if (summableKeys.length > 0) {
    const fila = opts.columns.map((c, idx) => {
      if (idx === 0) return 'TOTALES'
      if (summableKeys.includes(c.key)) return fmtMoneyCO(totales[c.key])
      return ''
    })
    rowFooter = [fila]
  }

  autoTable(doc, {
    startY: headerH + 6,
    head: [opts.columns.map(c => c.header)],
    body: opts.rows.map(r => opts.columns.map(c => {
      const v = r[c.key]
      if (typeof v === 'number' && summableKeys.includes(c.key)) return fmtMoneyCO(v)
      return String(v ?? '')
    })),
    foot: rowFooter,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 27, 75], textColor: 255 },
    footStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    showFoot: rowFooter.length > 0 ? 'lastPage' : 'never',
  })

  // Pie de página: número de registros
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? headerH + 20
  doc.setFontSize(9); doc.setTextColor(100, 100, 100)
  doc.text(`Total registros: ${opts.rows.length}`, 14, finalY + 8)

  doc.save(`${opts.filename || opts.title}.pdf`)
}

export function exportToExcel(opts: ReportOptions) {
  const headers = opts.columns.map(c => c.header)
  const summableKeys = opts.summableKeys || []
  const totales = calcularTotales(opts)
  const data: (string | number)[][] = opts.rows.map(r => opts.columns.map(c => r[c.key] ?? ''))
  // Fila de totales
  if (summableKeys.length > 0) {
    const fila = opts.columns.map((c, idx) => {
      if (idx === 0) return 'TOTALES'
      if (summableKeys.includes(c.key)) return totales[c.key]
      return ''
    })
    data.push(fila)
  }
  const empHeader: (string | number)[][] = []
  if (opts.empresa?.nombre) {
    empHeader.push([opts.empresa.nombre])
    const sub = [opts.empresa.nro_documento ? `NIT: ${opts.empresa.nro_documento}` : '', opts.empresa.direccion, opts.empresa.ciudad].filter(Boolean).join(' · ')
    if (sub) empHeader.push([sub])
    empHeader.push([opts.title])
    empHeader.push([fechaHoraEmision()])
    if (opts.subtitle) empHeader.push([opts.subtitle])
    empHeader.push([])
  } else {
    empHeader.push([opts.title])
    empHeader.push([fechaHoraEmision()])
    empHeader.push([])
  }
  const ws = XLSX.utils.aoa_to_sheet([...empHeader, headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
  XLSX.writeFile(wb, `${opts.filename || opts.title}.xlsx`)
}

export function printReport(opts: ReportOptions) {
  const summableKeys = opts.summableKeys || []
  const totales = calcularTotales(opts)
  const rows = opts.rows.map((r, i) => `<tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">${opts.columns.map(c => {
    const v = r[c.key]
    const display = typeof v === 'number' && summableKeys.includes(c.key) ? fmtMoneyCO(v) : String(v ?? '')
    return `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px">${display}</td>`
  }).join('')}</tr>`).join('')
  const totalsRow = summableKeys.length > 0
    ? `<tr style="background:#dcfce7;font-weight:700">${opts.columns.map((c, idx) => {
        if (idx === 0) return `<td style="padding:8px 10px;border-top:2px solid #16a34a;font-size:12px;color:#15803d">TOTALES</td>`
        if (summableKeys.includes(c.key)) return `<td style="padding:8px 10px;border-top:2px solid #16a34a;font-size:12px;color:#15803d">${fmtMoneyCO(totales[c.key])}</td>`
        return `<td style="padding:8px 10px;border-top:2px solid #16a34a"></td>`
      }).join('')}</tr>`
    : ''
  const empNombre = opts.empresa?.nombre || ''
  const empSub = [opts.empresa?.nro_documento ? `NIT: ${opts.empresa.nro_documento}` : '', opts.empresa?.direccion, opts.empresa?.ciudad].filter(Boolean).join(' · ')
  const empBlock = empNombre ? `
    <div style="border-bottom:3px solid #1e1b4b;padding-bottom:12px;margin-bottom:16px">
      <h1 style="color:#1e1b4b;font-size:20px;font-weight:800;margin:0">${empNombre}</h1>
      ${empSub ? `<p style="color:#6b7280;font-size:12px;margin:4px 0 0 0">${empSub}</p>` : ''}
    </div>` : ''
  const html = `<!DOCTYPE html><html><head><title>${opts.title}</title></head><body style="font-family:Arial;padding:20px">
    ${empBlock}
    <h2 style="color:#1e1b4b">${opts.title}</h2>
    <p style="color:#6b7280;font-size:12px">${fechaHoraEmision()}</p>
    ${opts.subtitle ? `<p style="color:#6b7280">${opts.subtitle}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead><tr>${opts.columns.map(c => `<th style="padding:8px 10px;background:#1e1b4b;color:#fff;font-size:11px;text-align:left">${c.header}</th>`).join('')}</tr></thead>
      <tbody>${rows}${totalsRow}</tbody>
    </table>
    <p style="margin-top:16px;font-size:11px;color:#9ca3af">Total registros: ${opts.rows.length}</p>
    <script>window.onload=()=>window.print()<\/script></body></html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}
