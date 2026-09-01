const courses = {
  "ia-productividad": { title: "IA para productividad", price: 45000 },
  "herramientas-digitales": { title: "Herramientas digitales para el trabajo", price: 36000 },
  "comunicacion": { title: "Comunicación efectiva", price: 32000 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { courseId, name, email, phone } = req.body || {};
    const course = courses[courseId];

    if (!course || !name || !email || !phone) {
      return res.status(400).json({ error: "Faltan datos de inscripción." });
    }
    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN en Vercel." });
    }

    const baseUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const externalReference = `${courseId}:${Date.now()}`;

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [{
          id: courseId,
          title: course.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: course.price
        }],
        payer: { name, email, phone: { number: phone } },
        external_reference: externalReference,
        back_urls: {
          success: `${baseUrl}/?payment=success`,
          pending: `${baseUrl}/?payment=pending`,
          failure: `${baseUrl}/?payment=failure`
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/mercadopago-webhook`
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "Error creando preferencia." });

    // En producción conviene persistir esta inscripción en una DB/Sheet
    // antes de redirigir, asociada a externalReference.
    return res.status(200).json({
      init_point: data.init_point,
      preference_id: data.id,
      external_reference: externalReference
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno iniciando el pago." });
  }
}