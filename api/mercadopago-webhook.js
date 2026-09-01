export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const body = req.body || {};
    const paymentId = body?.data?.id || body?.id;

    // Mercado Pago recomienda validar el origen del webhook con x-signature
    // antes de procesar el evento en producción.
    if (!paymentId) return res.status(200).json({ received: true });

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const payment = await paymentResponse.json();

    const map = {
      approved: "APROBADO",
      pending: "PENDIENTE",
      rejected: "RECHAZADO"
    };
    const status = map[payment.status] || "PENDIENTE";

    const payload = {
      payment_id: String(payment.id),
      external_reference: payment.external_reference || "",
      status,
      status_raw: payment.status || "",
      amount: payment.transaction_amount || "",
      email: payment.payer?.email || "",
      name: payment.payer?.first_name ? `${payment.payer.first_name} ${payment.payer.last_name || ""}`.trim() : "",
      phone: payment.payer?.phone?.number || "",
      paid_at: payment.date_approved || "",
      received_at: new Date().toISOString()
    };

    // Make / Apps Script: recibe el estado y actualiza Google Sheets.
    if (process.env.AUTOMATION_WEBHOOK_URL) {
      await fetch(process.env.AUTOMATION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    // Notificación directa opcional. Si preferís que Make gestione email/WhatsApp,
    // dejá estas variables sin configurar y hacé el envío en el escenario de Make.
    if (status === "APROBADO" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && payload.phone) {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${payload.phone}`,
        body: `¡Hola ${payload.name || ""}! Tu pago fue aprobado y tu inscripción quedó confirmada. Te enviaremos los detalles del taller por email.`
      });
    }

    return res.status(200).json({ received: true, status });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ received: true });
  }
}