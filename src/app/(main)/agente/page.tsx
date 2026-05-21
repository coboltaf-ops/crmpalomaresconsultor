'use client'
import { useEffect, useRef, useState } from 'react'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { useContratosStore } from '@/features/contratos/store/contratos-store'
import { useProspectosStore } from '@/features/prospectos/store/prospectos-store'
import { usePQRSStore } from '@/features/pqrs/store/pqrs-store'
import { useTareasStore } from '@/features/tareas/store/tareas-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { usePersonalStore } from '@/features/personal/store/personal-store'
import { useCentrosCostoStore } from '@/features/centros-costo/store/centros-costo-store'
import { useEmpresaStore } from '@/features/empresa/store/empresa-store'
import { useSugerenciasStore } from '@/features/agente/store/sugerencias-store'

interface Mensaje { role: 'user' | 'assistant'; content: string }

// Configuración de voz — editable vía variables de entorno (Vercel → Environment Variables)
// Todas son opcionales; si no están definidas usa los defaults.
const VOZ_NOMBRE = process.env.NEXT_PUBLIC_AGENTE_VOZ_NOMBRE || '' // ej: "Jorge", "Diego", "Paulina"
const VOZ_IDIOMA = process.env.NEXT_PUBLIC_AGENTE_VOZ_IDIOMA || 'es-CO'
const VOZ_RATE = Number(process.env.NEXT_PUBLIC_AGENTE_VOZ_RATE) || 1.05
const VOZ_PITCH = Number(process.env.NEXT_PUBLIC_AGENTE_VOZ_PITCH) || 0.9

export default function AgentePage() {
  const clientes = useClientesStore(s => s.clientes)
  const contactos = useContactosStore(s => s.contactos)
  const oportunidades = useOportunidadesStore(s => s.oportunidades)
  const cotizaciones = useCotizacionesStore(s => s.cotizaciones)
  const contratos = useContratosStore(s => s.contratos)
  const prospectos = useProspectosStore(s => s.prospectos)
  const pqrs = usePQRSStore(s => s.pqrs)
  const tareas = useTareasStore(s => s.tareas)
  const productos = useProductosStore(s => s.productos)
  const personal = usePersonalStore(s => s.personal)
  const centrosCosto = useCentrosCostoStore(s => s.centros)
  const empresa = useEmpresaStore(s => s.empresas[0])

  const sugerencias = useSugerenciasStore(s => s.sugerencias)
  const agregarSugerencia = useSugerenciasStore(s => s.agregar)
  const editarSugerencia = useSugerenciasStore(s => s.editar)
  const eliminarSugerencia = useSugerenciasStore(s => s.eliminar)
  const moverSugerencia = useSugerenciasStore(s => s.mover)
  const restaurarSugerencias = useSugerenciasStore(s => s.restaurarDefaults)

  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [pregunta, setPregunta] = useState('')
  const [cargando, setCargando] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const [escuchando, setEscuchando] = useState(false)
  const [hablando, setHablando] = useState(false)
  const [editorAbierto, setEditorAbierto] = useState(false)
  const [nuevaSugerencia, setNuevaSugerencia] = useState('')
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null)
  const [editandoTexto, setEditandoTexto] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const vocesRef = useRef<SpeechSynthesisVoice[]>([])
  const vozDesbloqueadaRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  // Precarga de voces (Chrome/Safari las entregan de forma asíncrona)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const cargar = () => { vocesRef.current = window.speechSynthesis.getVoices() }
    cargar()
    window.speechSynthesis.addEventListener('voiceschanged', cargar)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', cargar)
  }, [])

  // Safari exige que speak() se dispare dentro del gesto del usuario.
  // Tras un `await fetch`, ya no lo considera válido. Este "primer" con una
  // emisión vacía dentro del click desbloquea la API para el resto de la sesión.
  const desbloquearVoz = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (vozDesbloqueadaRef.current) return
    const primer = new SpeechSynthesisUtterance('')
    primer.volume = 0
    window.speechSynthesis.speak(primer)
    vozDesbloqueadaRef.current = true
  }

  // Text-to-speech — dice en voz la última respuesta del agente
  const hablar = (texto: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    // Limpiamos markdown simple para que no lea símbolos
    const limpio = texto
      .replace(/[*_`#>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/⚠️|🤖|💬|✅|❌/g, '')
      .trim()
    if (!limpio) return
    const utter = new SpeechSynthesisUtterance(limpio)
    utter.lang = VOZ_IDIOMA
    utter.rate = VOZ_RATE
    utter.pitch = VOZ_PITCH
    // 1º prioridad: el nombre exacto configurado en NEXT_PUBLIC_AGENTE_VOZ_NOMBRE.
    // 2º: voz masculina conocida en español. 3º: cualquier voz en español.
    const esEs = vocesRef.current.filter(v => v.lang.toLowerCase().startsWith('es'))
    const nombresHombre = ['jorge', 'diego', 'juan', 'paul', 'pablo', 'raul', 'raúl', 'carlos', 'enrique', 'miguel']
    const vozElegida =
      (VOZ_NOMBRE && vocesRef.current.find(v => v.name.toLowerCase().includes(VOZ_NOMBRE.toLowerCase()))) ||
      esEs.find(v => nombresHombre.some(n => v.name.toLowerCase().includes(n))) ||
      esEs.find(v => /male|masculin/i.test(v.name)) ||
      esEs[0] ||
      vocesRef.current[0]
    if (vozElegida) utter.voice = vozElegida
    utter.onstart = () => setHablando(true)
    utter.onend = () => setHablando(false)
    utter.onerror = () => setHablando(false)
    // Safari a veces queda en estado "paused" — forzamos resume antes de speak
    try { window.speechSynthesis.resume() } catch {}
    window.speechSynthesis.speak(utter)
  }

  const detenerVoz = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setHablando(false)
    }
  }

  // Speech recognition — escucha el micrófono y pone el texto en la caja
  const iniciarMicrofono = () => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'); return }
    if (escuchando) { recognitionRef.current?.stop(); return }
    const rec = new SR()
    rec.lang = 'es-CO'
    rec.interimResults = false
    rec.maxAlternatives = 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const texto = e.results[0][0].transcript
      setPregunta(texto)
    }
    rec.onend = () => setEscuchando(false)
    rec.onerror = () => setEscuchando(false)
    recognitionRef.current = rec
    setEscuchando(true)
    rec.start()
  }

  const construirContexto = () => {
    // Enviamos un snapshot compacto, limitando listas para no saturar el prompt
    const limitar = <T,>(arr: T[], n = 30) => arr.slice(0, n)
    return {
      empresa: empresa ? { nombre: empresa.nombre, nit: empresa.nro_documento, ciudad: empresa.ciudad } : null,
      resumen: {
        clientes: clientes.length,
        contactos: contactos.length,
        oportunidades: oportunidades.length,
        cotizaciones: cotizaciones.length,
        contratos: contratos.length,
        prospectos: prospectos.length,
        pqrs: pqrs.length,
        tareas: tareas.length,
        productos: productos.length,
        personal: personal.length,
        centros_costo: centrosCosto.length,
      },
      clientes: limitar(clientes).map(c => ({
        codigo: c.codigo, razon_social: c.razon_social, nit: c.nro_documento,
        representante_legal: c.representante_legal, fecha_inicio_cliente: c.fecha_inicio_cliente,
        centro_costo: c.centro_costo, region: c.region, departamento: c.departamento,
        municipio: c.municipio, ciudad_pueblo: c.ciudad_pueblo, telefono: c.telefono, email: c.email,
        situacion: c.situacion, actividad: c.actividad,
      })),
      contactos: limitar(contactos).map(c => ({
        codigo: c.codigo, nombre: `${c.nombre} ${c.apellido}`, cargo: c.cargo,
        cliente: c.cliente_nombre, correo: c.email, celular: c.celular,
        situacion: c.situacion, nivel_influencia: c.nivel_influencia, es_principal: c.es_principal,
      })),
      oportunidades: limitar(oportunidades).map(o => ({
        codigo: o.codigo, nombre: o.nombre, cliente: o.cliente_nombre,
        valor: o.valor_estimado, probabilidad: o.probabilidad, etapa: o.etapa,
        situacion: o.situacion, fecha_cierre: o.fecha_cierre_estimada, origen: o.origen,
      })),
      cotizaciones: limitar(cotizaciones).map(c => ({
        codigo: c.codigo, cliente: c.cliente_nombre, linea: c.linea_servicio_nombre,
        fecha: c.fecha_emision, vencimiento: c.fecha_vencimiento,
        items: c.detalles.length, situacion: c.situacion,
        pct_aiu: c.pct_aiu, pct_impuesto: c.pct_impuesto,
      })),
      contratos: limitar(contratos).map(c => ({
        codigo: c.codigo, cliente: c.cliente_nombre, tipo_servicio: c.tipo_servicio,
        centro_costo: c.centro_costo, fecha_inicio: c.fecha_inicio, fecha_fin: c.fecha_finalizacion,
        valor_anual: c.valor_anual, valor_mensual: c.valor_mensual,
        poliza_rse: c.nro_poliza_rse, poliza_cumplimiento: c.nro_poliza_cumplimiento,
        situacion: c.situacion, dias_atraso: c.dias_atraso,
      })),
      prospectos: limitar(prospectos).map(p => ({
        codigo: p.codigo, nombre: `${p.nombre} ${p.apellido}`, empresa: p.empresa,
        correo: p.correo, celular: p.nro_movil, origen: p.origen_prospecto,
        situacion: p.situacion, ciudad: p.ciudad,
      })),
      pqrs: limitar(pqrs).map(p => ({
        codigo: p.codigo, tipo: p.tipo, incidencia: p.incidencia,
        prioridad: p.prioridad, cliente: p.cliente_nombre, asunto: p.asunto,
        fecha_aviso: p.fecha_aviso, situacion: p.situacion, responsable: p.responsable,
      })),
      tareas: limitar(tareas).map(t => ({
        codigo: t.codigo, persona_asigna: t.persona_asigna, persona_ejecuta: t.persona_ejecuta,
        fecha_asignacion: t.fecha_asignacion, fecha_requerida_fin: t.fecha_requerida_fin,
        fecha_real_fin: t.fecha_real_fin, descripcion: t.descripcion, situacion: t.situacion,
      })),
      productos: limitar(productos).map(p => ({
        codigo: p.codigo, descripcion: p.descripcion, tipo: p.tipo, linea: p.linea_servicio_codigo,
        modalidad: p.modalidad, unidad: p.unidad_medida, precio: p.precio_unitario, situacion: p.situacion,
      })),
      personal: limitar(personal).map(p => ({
        codigo: p.codigo, nombre: `${p.nombre} ${p.apellido}`, correo: p.correo,
        departamento: p.departamento, cargo: p.cargo, situacion: p.situacion,
      })),
      centros_costo: limitar(centrosCosto).map(c => ({
        codigo: c.codigo, nombre: c.nombre, situacion: c.situacion,
      })),
    }
  }

  const enviar = async () => {
    if (!pregunta.trim() || cargando) return
    // Desbloqueamos el TTS DENTRO del gesto del usuario (crítico para Safari).
    if (voiceOn) desbloquearVoz()
    const nuevoMsg: Mensaje = { role: 'user', content: pregunta.trim() }
    const nuevosMensajes = [...mensajes, nuevoMsg]
    setMensajes(nuevosMensajes)
    setPregunta('')
    setCargando(true)

    try {
      const res = await fetch('/api/agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevosMensajes, context: construirContexto() }),
      })
      const data = await res.json()
      if (res.ok) {
        setMensajes([...nuevosMensajes, { role: 'assistant', content: data.respuesta }])
        if (voiceOn) hablar(data.respuesta)
      } else {
        setMensajes([...nuevosMensajes, { role: 'assistant', content: `❌ ${data.error || 'Error al consultar.'}${data.detalle ? `\n${data.detalle}` : ''}` }])
      }
    } catch (err) {
      setMensajes([...nuevosMensajes, { role: 'assistant', content: `❌ Error de conexión: ${String(err)}` }])
    } finally {
      setCargando(false)
    }
  }

  const confirmarNueva = () => {
    if (!nuevaSugerencia.trim()) return
    agregarSugerencia(nuevaSugerencia)
    setNuevaSugerencia('')
  }

  const iniciarEdicion = (idx: number) => {
    setEditandoIdx(idx)
    setEditandoTexto(sugerencias[idx])
  }

  const guardarEdicion = () => {
    if (editandoIdx === null) return
    editarSugerencia(editandoIdx, editandoTexto)
    setEditandoIdx(null)
    setEditandoTexto('')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
  const btnStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>🤖</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Agente Virtual</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Pregunta en lenguaje natural · puedes usar voz 🎤 y escuchar la respuesta 🔊</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hablando && (
            <button onClick={detenerVoz}
              style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)', padding: '8px 14px', fontSize: 12 }}>
              ⏹ Detener voz
            </button>
          )}
          <button onClick={() => { if (voiceOn) detenerVoz(); setVoiceOn(!voiceOn) }}
            title={voiceOn ? 'Desactivar voz' : 'Activar voz'}
            style={{ ...btnStyle, background: voiceOn ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)', color: voiceOn ? '#86efac' : 'rgba(255,255,255,0.5)', border: `1px solid ${voiceOn ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, padding: '8px 14px', fontSize: 12 }}>
            {voiceOn ? '🔊 Voz ON' : '🔇 Voz OFF'}
          </button>
          <button onClick={() => setEditorAbierto(true)}
            title="Editar sugerencias"
            style={{ ...btnStyle, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.4)', padding: '8px 14px', fontSize: 12 }}>
            ⚙️ Sugerencias
          </button>
        </div>
      </div>

      {/* Zona de mensajes */}
      <div style={{ flex: 1, overflow: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
        {mensajes.length === 0 && !cargando && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 10 }}>🤖</div>
            <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>¿En qué te puedo ayudar hoy?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 }}>Tengo acceso a {clientes.length + contactos.length + oportunidades.length + cotizaciones.length + contratos.length + prospectos.length + pqrs.length + tareas.length + productos.length} registros del CRM.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 520, margin: '0 auto' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Sugerencias</p>
              {sugerencias.map(s => (
                <button key={s} onClick={() => setPregunta(s)}
                  style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)', cursor: 'pointer', fontSize: 13 }}>
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: 14,
              background: m.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(139,92,246,0.15)',
              border: `1px solid ${m.role === 'user' ? 'rgba(59,130,246,0.35)' : 'rgba(139,92,246,0.3)'}`,
              color: '#fff', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: m.role === 'user' ? '#93c5fd' : '#c4b5fd', marginBottom: 4, letterSpacing: 0.5 }}>
                {m.role === 'user' ? 'TÚ' : 'AGENTE 🤖'}
              </div>
              {m.content}
            </div>
          </div>
        ))}

        {cargando && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 14 }}>
            <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontStyle: 'italic' }}>
              🤖 Analizando datos...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={pregunta}
          onChange={e => setPregunta(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          placeholder={escuchando ? '🎙️ Escuchando... habla ahora' : 'Escribe o usa el micrófono 🎤'}
          disabled={cargando}
          style={inputStyle}
        />
        <button onClick={iniciarMicrofono} disabled={cargando}
          title={escuchando ? 'Detener grabación' : 'Hablar al agente'}
          style={{ ...btnStyle, background: escuchando ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.2)', color: escuchando ? '#fca5a5' : '#86efac', border: `1px solid ${escuchando ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.4)'}`, minWidth: 54, fontSize: 20, animation: escuchando ? 'pulse 1s infinite' : 'none' }}>
          {escuchando ? '⏹' : '🎤'}
        </button>
        <button onClick={enviar} disabled={cargando || !pregunta.trim()}
          style={{ ...btnStyle, background: cargando || !pregunta.trim() ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', minWidth: 100, cursor: cargando || !pregunta.trim() ? 'not-allowed' : 'pointer' }}>
          {cargando ? '...' : 'Enviar'}
        </button>
        {mensajes.length > 0 && (
          <button onClick={() => { detenerVoz(); setMensajes([]) }}
            style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
            Limpiar
          </button>
        )}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>

      {/* Modal de edición de sugerencias */}
      {editorAbierto && (
        <div onClick={() => { setEditorAbierto(false); setEditandoIdx(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#1a1a2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: 24, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>⚙️ Sugerencias del Agente</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Edita, elimina, añade o reordena las preguntas sugeridas.</p>
              </div>
              <button onClick={() => { setEditorAbierto(false); setEditandoIdx(null) }}
                style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', fontSize: 12 }}>
                ✕ Cerrar
              </button>
            </div>

            {/* Añadir nueva */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={nuevaSugerencia}
                onChange={e => setNuevaSugerencia(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmarNueva() } }}
                placeholder="Nueva pregunta sugerida…"
                style={inputStyle}
              />
              <button onClick={confirmarNueva} disabled={!nuevaSugerencia.trim()}
                style={{ ...btnStyle, background: nuevaSugerencia.trim() ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(139,92,246,0.3)', color: '#fff', minWidth: 100, cursor: nuevaSugerencia.trim() ? 'pointer' : 'not-allowed' }}>
                ➕ Añadir
              </button>
            </div>

            {/* Lista */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {sugerencias.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  No hay sugerencias. Añade una arriba o restaura los valores por defecto.
                </div>
              )}
              {sugerencias.map((s, i) => (
                <div key={`${s}-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10 }}>
                  {editandoIdx === i ? (
                    <>
                      <input
                        value={editandoTexto}
                        onChange={e => setEditandoTexto(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); guardarEdicion() } }}
                        autoFocus
                        style={inputStyle}
                      />
                      <button onClick={guardarEdicion}
                        style={{ ...btnStyle, background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.4)', padding: '8px 12px', fontSize: 12 }}>
                        ✓ Guardar
                      </button>
                      <button onClick={() => { setEditandoIdx(null); setEditandoTexto('') }}
                        style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 12px', fontSize: 12 }}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#c4b5fd', fontSize: 13, flex: 1, lineHeight: 1.5 }}>💬 {s}</span>
                      <button onClick={() => moverSugerencia(i, i - 1)} disabled={i === 0}
                        title="Subir"
                        style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: i === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', fontSize: 11, cursor: i === 0 ? 'not-allowed' : 'pointer' }}>
                        ▲
                      </button>
                      <button onClick={() => moverSugerencia(i, i + 1)} disabled={i === sugerencias.length - 1}
                        title="Bajar"
                        style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: i === sugerencias.length - 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', fontSize: 11, cursor: i === sugerencias.length - 1 ? 'not-allowed' : 'pointer' }}>
                        ▼
                      </button>
                      <button onClick={() => iniciarEdicion(i)}
                        title="Editar"
                        style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.35)', padding: '6px 10px', fontSize: 12 }}>
                        ✎
                      </button>
                      <button onClick={() => { if (confirm(`¿Eliminar esta sugerencia?\n\n"${s}"`)) eliminarSugerencia(i) }}
                        title="Eliminar"
                        style={{ ...btnStyle, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)', padding: '6px 10px', fontSize: 12 }}>
                        🗑
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => { if (confirm('¿Restaurar las 6 sugerencias originales? Se perderán tus cambios.')) restaurarSugerencias() }}
                style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12 }}>
                ↺ Restaurar por defecto
              </button>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, alignSelf: 'center' }}>
                {sugerencias.length} sugerencia{sugerencias.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
