#!/bin/bash

BASE_URL="https://crmpalomaresconsultor.vercel.app"

echo "════════════════════════════════════════════════════"
echo "  VALIDACIÓN FINAL - CRM PALOMARES CONSULTOR"
echo "════════════════════════════════════════════════════"
echo ""

# Test 1: Status general
echo "1️⃣  VERIFICANDO APP..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ App respondiendo correctamente (HTTP 200)"
else
  echo "   ❌ Error: HTTP $STATUS"
fi

# Test 2: Enviar prospecto
echo ""
echo "2️⃣  ENVIANDO PROSPECTO DE PRUEBA..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/prospectos-externo \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "Final",
    "empresa": "Test Corp",
    "correo": "test@test.com",
    "nro_movil": "3001234567",
    "ciudad": "Bogotá",
    "linea_interes": "Testing",
    "descripcion_requerimiento": "Prueba final",
    "acepta_datos": true
  }')

ID=$(echo $RESPONSE | jq -r '.id' 2>/dev/null)
if [ ! -z "$ID" ] && [ "$ID" != "null" ]; then
  echo "   ✅ Prospecto creado: $ID"
else
  echo "   ❌ Error al crear prospecto"
  echo "   Respuesta: $RESPONSE"
fi

# Test 3: Verificar persistencia
echo ""
echo "3️⃣  VERIFICANDO PERSISTENCIA..."
COUNT=$(curl -s $BASE_URL/api/prospectos-externo | jq '.total' 2>/dev/null)
echo "   📊 Prospectos guardados: $COUNT"

# Test 4: PQRS
echo ""
echo "4️⃣  VALIDANDO FORMULARIO PQRS..."
PQRS=$(curl -s "$BASE_URL/api/clientes-acceso?code=INVALID")
ERROR=$(echo $PQRS | jq -r '.error' 2>/dev/null)
if [ "$ERROR" = "Código de acceso no válido" ]; then
  echo "   ✅ API PQRS funcionando correctamente"
else
  echo "   ❌ Error en validación PQRS"
fi

# Test 5: URLs públicas
echo ""
echo "5️⃣  VERIFICANDO URLS PÚBLICAS..."
PROSPECTOS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/prospectos-publico)
PQRS_URL=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/pqrs-publico)
[ "$PROSPECTOS" = "200" ] && echo "   ✅ /prospectos-publico accesible" || echo "   ❌ /prospectos-publico error"
[ "$PQRS_URL" = "200" ] && echo "   ✅ /pqrs-publico accesible" || echo "   ❌ /pqrs-publico error"

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ VALIDACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════"
