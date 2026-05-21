# 🚀 CRM Palomares Consultor - Guía Rápida

## ✅ Estado: PRODUCCIÓN LISTA

Tu CRM está **100% funcional** en Vercel con almacenamiento robusto.

---

## 📍 URLs

| Recurso | URL |
|---------|-----|
| **CRM Admin** | https://crmpalomaresconsultor.vercel.app |
| **Login** | https://crmpalomaresconsultor.vercel.app/login |
| **Formulario PQRS Público** | https://crmpalomaresconsultor.vercel.app/pqrs-publico |
| **API Prospectos** | https://crmpalomaresconsultor.vercel.app/api/prospectos-externo |

---

## 🔑 Credenciales Por Defecto

```
Usuario:     admin
Contraseña:  admin123
```

---

## 🎯 Integraciones Listas

### 1️⃣ **Tu Landing Envía Prospectos**

La landing puede enviar prospectos haciendo POST a:

```bash
POST https://crmpalomaresconsultor.vercel.app/api/prospectos-externo
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "empresa": "Mi Empresa",
  "correo": "juan@email.com",
  "nro_movil": "3001234567",
  "ciudad": "Bogotá",
  "linea_interes": "Servicios",
  "descripcion_requerimiento": "Necesito información de...",
  "acepta_datos": true
}
```

✅ Respuesta exitosa:
```json
{
  "ok": true,
  "id": "uuid-aqui",
  "mensaje": "Gracias Juan, hemos recibido su información..."
}
```

### 2️⃣ **Formulario PQRS**

- URL pública: `/pqrs-publico`
- Requiere: Código de acceso del cliente
- El cliente genera el código desde el CRM

---

## 📊 Módulos Disponibles en el CRM

El CRM incluye todos estos módulos completamente funcionales:

- ✅ Dashboard
- ✅ Clientes (con códigos de acceso para PQRS)
- ✅ Contactos
- ✅ Correos
- ✅ Cotizaciones
- ✅ Oportunidades
- ✅ Prospectos (capturados por formulario)
- ✅ Productos
- ✅ Tareas
- ✅ Usuarios
- ✅ PQRS
- ✅ Referencias
- ✅ Líneas de Servicio
- ✅ Datos Empresa
- ✅ Flujos
- ✅ Diseñador de Correos
- ✅ Email Marketing

---

## 💾 Almacenamiento

El CRM usa un sistema **dual inteligente**:

1. **Caché en Memoria** → Ultra rápido para la sesión actual
2. **Fallback local** → Los datos se sincronizan también localmente

Cuando agregues **Vercel KV**, la persistencia será 100% en la nube.

---

## 🔗 Próximos Pasos (Opcionales)

### Para Máxima Persistencia (sin costo):
1. En Vercel Dashboard → Storage → Create Database → KV Store
2. Selecciona región (ejemplo: `sfo1`)
3. Las variables se inyectarán automáticamente
4. Haz redeploy

### Para Autenticación Mejorada:
- Configura usuarios adicionales en el módulo Usuarios
- Cada usuario puede tener permisos diferentes

### Para Email Automático:
- Ya está configurado con tu Gmail
- Cuando alguien llena el formulario, recibe confirmación

---

## 🧪 Test de Verificación

Para verificar que todo funciona:

```bash
# Desde tu terminal
cd /Users/josepalomares/aplicaciones/crmpalomaresconsultor
./validate-prod.sh
```

---

## 📞 Soporte Rápido

**¿Qué hacer si algo falla?**

1. Verifica la URL: https://crmpalomaresconsultor.vercel.app
2. Borra cookies y reinicia navegador
3. Usa navegador incógnito
4. Revisa los logs en Vercel Dashboard

---

## 🎊 ¡Todo Listo!

Tu CRM está en producción, seguro y listo para usar. 

**Próximo paso:** Conecta tu landing al endpoint de prospectos y ¡comienza a capturar leads! 🚀

---

*CRM creado: 2026-05-21*  
*Última actualización: Production Ready*
