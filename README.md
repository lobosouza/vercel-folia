# Talleres Online — React + Vercel + Mercado Pago + Twilio

Landing estática en React/Vite con:

- FAQ.
- Catálogo de talleres.
- Flujo: taller → formulario → Mercado Pago Checkout Pro.
- Webhook de Mercado Pago → automatización (Make o Google Apps Script).
- Mapeo de estados: APROBADO / PENDIENTE / RECHAZADO.
- WhatsApp automático opcional con Twilio.
- Deploy preparado para Vercel.

## Importante: "estática" + pagos

La interfaz es estática, pero el proyecto incluye dos Vercel Functions (`/api`) porque el Access Token de Mercado Pago y las credenciales de Twilio **no deben exponerse en el navegador**.

Checkout Pro redirige al usuario al entorno de Mercado Pago para completar el pago. El webhook es la fuente para validar el estado real del pago.

## 1. Instalar y probar

```bash
npm install
npm run dev
```

## 2. Variables de entorno en Vercel

Configurar:

```env
MP_ACCESS_TOKEN=APP_USR-...
PUBLIC_SITE_URL=https://tu-dominio.vercel.app

# Make o Apps Script
AUTOMATION_WEBHOOK_URL=https://hook.us1.make.com/...

# Twilio WhatsApp (opcional si Make enviará el mensaje)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=+14155238886
```

No subir `.env` al repositorio.

## 3. Make / Google Apps Script

La Function `api/mercadopago-webhook.js` envía un JSON a `AUTOMATION_WEBHOOK_URL`.

Payload de ejemplo:

```json
{
  "payment_id": "123456789",
  "external_reference": "ia-productividad:1720000000000",
  "status": "APROBADO",
  "status_raw": "approved",
  "amount": 45000,
  "email": "persona@email.com",
  "name": "Ana Pérez",
  "phone": "+549351...",
  "paid_at": "2026-09-01T18:00:00Z",
  "received_at": "2026-09-01T18:00:03Z"
}
```

En Make:
1. Webhook custom.
2. Buscar/actualizar fila en Google Sheets por `external_reference` o `payment_id`.
3. Si `status = APROBADO`, enviar email y WhatsApp.
4. Si `PENDIENTE` o `RECHAZADO`, actualizar solamente el estado.

## 4. Seguridad antes de producción

- Validar `x-signature` de Mercado Pago en el webhook.
- Persistir la inscripción antes de redirigir al checkout.
- No confiar en `back_urls` para confirmar un pago: usar el webhook + consulta del pago.
- Agregar protección contra duplicados/idempotencia por `payment_id`.
- Verificar que el teléfono esté en formato E.164.
- Para WhatsApp en producción, configurar el sender aprobado y templates cuando corresponda.
- Configurar URLs de retorno y webhook con HTTPS.

## 5. Cambiar talleres

Los cursos están en `src/main.jsx` y sus precios se replican en `api/create-preference.js`. Para producción, conviene llevar catálogo/precios a una única fuente (DB, Sheet o archivo de configuración compartido) para evitar desincronización.

## Arquitectura

```text
WhatsApp / Redes
      ↓
Landing React (Vercel)
      ↓
Formulario de inscripción
      ↓
Vercel Function /api/create-preference
      ↓
Mercado Pago Checkout Pro
      ↓
Webhook /api/mercadopago-webhook
      ↓
Make / Apps Script
      ↓
Google Sheets ← estado
      ↓
Email + WhatsApp (Twilio)
```
