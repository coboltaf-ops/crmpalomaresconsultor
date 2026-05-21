'use client'
import { useEffect, useState } from 'react'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from_name: string
  from_email: string
  updated_at?: string
  _has_password?: boolean
}

const EMPTY: SmtpConfig = {
  host: '', port: 465, secure: true, user: '', pass: '',
  from_name: '', from_email: '',
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
const inputReadOnly: React.CSSProperties = { ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }
const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 14, fontWeight: 800, display: 'block', marginBottom: 6 }
const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }

export default function SmtpConfigSection() {
  const [cfg, setCfg] = useState<SmtpConfig>(EMPTY)
  const [original, setOriginal] = useState<SmtpConfig>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const d = await fetch('/api/smtp-config').then(r => r.json())
      const full = { ...EMPTY, ...d } as SmtpConfig
      setCfg(full)
      setOriginal(full)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const iniciarEdicion = () => {
    setEditing(true); setMsg(null)
  }

  const cancelar = () => {
    setCfg(original); setEditing(false); setMsg(null)
  }

  const guardar = async () => {
    if (saving) return
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setMsg({ tipo: 'ok', texto: '✅ Configuración SMTP guardada' })
      await cargar()
      setEditing(false)
    } catch (err) {
      setMsg({ tipo: 'err', texto: `❌ ${String(err)}` })
    } finally {
      setSaving(false)
    }
  }

  const stl = editing ? inputStyle : inputReadOnly

  return (
    <div style={{ marginTop: 24, padding: 24, background: 'rgba(59,130,246,0.08)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ color: '#93c5fd', fontSize: 18, fontWeight: 900, marginBottom: 6 }}>📧 Configuración SMTP</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6 }}>
            Datos del servidor de correo para envío de cotizaciones, PQRS, email marketing y notificaciones.
            Si los dejas vacíos, el sistema usa las variables de entorno como respaldo.
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={iniciarEdicion} disabled={loading}
            style={{ ...btnStyle, background: '#15803d', color: '#fff', border: '1px solid #16a34a', whiteSpace: 'nowrap' }}>
            ✏️ Editar
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: 20 }}>Cargando…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Servidor (Host) {editing && '*'}</label>
              <input value={cfg.host} onChange={e => setCfg({ ...cfg, host: e.target.value })}
                readOnly={!editing} placeholder="smtp.gmail.com" style={stl} />
            </div>
            <div>
              <label style={labelStyle}>Puerto {editing && '*'}</label>
              <input type="number" value={cfg.port} onChange={e => setCfg({ ...cfg, port: parseInt(e.target.value) || 465 })}
                readOnly={!editing} placeholder="465" style={stl} />
            </div>
            <div>
              <label style={labelStyle}>Seguridad</label>
              <select value={cfg.secure ? '1' : '0'} onChange={e => setCfg({ ...cfg, secure: e.target.value === '1' })} disabled={!editing} style={stl}>
                <option value="1">SSL/TLS (465)</option>
                <option value="0">STARTTLS o ninguna (587/25)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Usuario / Email {editing && '*'}</label>
              <input type="email" value={cfg.user} onChange={e => setCfg({ ...cfg, user: e.target.value })}
                readOnly={!editing} placeholder="notificaciones@empresa.com" style={stl} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña / App Password {editing && '*'}</label>
              <input type="password" value={cfg.pass} onChange={e => setCfg({ ...cfg, pass: e.target.value })}
                readOnly={!editing} placeholder={cfg._has_password ? 'Dejar igual para conservar' : 'Contraseña'} style={stl} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Remitente: Nombre</label>
              <input value={cfg.from_name} onChange={e => setCfg({ ...cfg, from_name: e.target.value })}
                readOnly={!editing} placeholder="Nova Seguridad" style={stl} />
            </div>
            <div>
              <label style={labelStyle}>Remitente: Email (opcional)</label>
              <input type="email" value={cfg.from_email} onChange={e => setCfg({ ...cfg, from_email: e.target.value })}
                readOnly={!editing} placeholder="Si está vacío, usa el usuario de arriba" style={stl} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {editing && (
              <>
                <button type="button" onClick={guardar} disabled={saving}
                  style={{ ...btnStyle, background: '#15803d', color: '#fff', border: '1px solid #16a34a', opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Guardando…' : '💾 Guardar configuración'}
                </button>
                <button type="button" onClick={cancelar} disabled={saving}
                  style={{ ...btnStyle, background: '#64748b', color: '#fff', border: '1px solid #94a3b8' }}>
                  Cancelar
                </button>
              </>
            )}
            {msg && (
              <span style={{ color: msg.tipo === 'ok' ? '#86efac' : '#fca5a5', fontSize: 13, fontWeight: 700 }}>
                {msg.texto}
              </span>
            )}
            {cfg.updated_at && !editing && (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 'auto' }}>
                Última actualización: {new Date(cfg.updated_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
              </span>
            )}
          </div>

          {editing && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }}>ℹ️ Ayuda para configurar Gmail / Outlook / SMTP personalizado</summary>
              <div style={{ marginTop: 10, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.6 }}>
                <p><strong>Gmail:</strong> Host <code>smtp.gmail.com</code> · Puerto <code>465</code> · SSL/TLS · Usuario tu email Gmail · Contraseña: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" style={{ color: '#93c5fd' }}>contraseña de aplicación</a> (NO la de Gmail normal).</p>
                <p><strong>Outlook/Office365:</strong> Host <code>smtp.office365.com</code> · Puerto <code>587</code> · STARTTLS.</p>
                <p><strong>SMTP propio:</strong> Pide a tu proveedor host, puerto, usuario y contraseña.</p>
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
