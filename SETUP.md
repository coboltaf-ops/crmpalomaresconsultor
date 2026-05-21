# CRM Palomares Consultor - Setup

## URLs
- **Producción:** https://crmpalomaresconsultor.vercel.app
- **Login:** https://crmpalomaresconsultor.vercel.app/login
- **Formulario PQRS:** https://crmpalomaresconsultor.vercel.app/pqrs-publico

## Credenciales por Defecto
- **Usuario:** admin
- **Contraseña:** admin123

## Almacenamiento
- **Tipo:** Vercel KV (Redis)
- **Datos guardados:**
  - Prospectos externos (formulario landing)
  - PQRS (seguimiento de clientes)
  - Configuración SMTP
  - Datos de módulos del CRM

## APIs Disponibles
- `POST /api/prospectos-externo` - Crear prospecto desde formulario
- `GET /api/prospectos-externo` - Listar prospectos
- `GET /api/clientes-acceso?code=CODE` - Validar código de acceso PQRS

## Integraciones
- **Landing:** Envía prospectos a `/api/prospectos-externo`
- **PQRS:** Acceso con código generado en el CRM
- **Email:** Confirmación automática al prospecto (si SMTP está configurado)

## Variables de Entorno Requeridas
Configuradas en Vercel:
- `KV_REST_API_URL` - Auto (Vercel KV)
- `KV_REST_API_TOKEN` - Auto (Vercel KV)
- `SMTP_HOST` ✓
- `SMTP_PORT` ✓
- `SMTP_USER` ✓
- `SMTP_PASS` ✓
- `GEMINI_API_KEY` ✓

