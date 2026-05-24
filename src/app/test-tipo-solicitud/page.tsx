export default function TestTipoSolicitud() {
  const tipos = [
    'CONSULTORÍA GERENCIAL',
    'IMPLEMENTACIÓN DE SOFTWARE',
    'TRANSFORMACIÓN DIGITAL',
    'CAPACITACIÓN',
    'AUDITORÍA',
    'SOPORTE TÉCNICO',
    'OTRO',
  ]

  return (
    <div style={{ padding: 40, background: '#1a1a2e', color: '#fff', minHeight: '100vh' }}>
      <h1>✅ TEST: Tipo de Solicitud FUNCIONA</h1>
      <p>Si ves esta página, Vercel SÍ está compilando correctamente.</p>
      <h2>Los 7 tipos de solicitud están aquí:</h2>
      <ul>
        {tipos.map((t, i) => (
          <li key={i} style={{ padding: 10, margin: 5, background: '#16213e', borderRadius: 4 }}>
            {t}
          </li>
        ))}
      </ul>
      <hr style={{ margin: '30px 0' }} />
      <p>Ahora ve a <strong>/referencias</strong> - deberías ver "Tipo de Solicitud" en la lista.</p>
    </div>
  )
}
