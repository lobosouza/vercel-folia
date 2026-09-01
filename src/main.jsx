import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const courses = [
  {
    id: "ia-productividad",
    title: "IA para productividad",
    category: "Tecnología",
    duration: "4 encuentros · 8 horas",
    price: 45000,
    description: "Aprendé a usar herramientas de IA para investigar, escribir, organizar tareas y automatizar procesos cotidianos.",
    bullets: ["Casos prácticos", "Material descargable", "Modalidad 100% virtual"],
  },
  {
    id: "herramientas-digitales",
    title: "Herramientas digitales para el trabajo",
    category: "Trabajo",
    duration: "3 encuentros · 6 horas",
    price: 36000,
    description: "Un recorrido práctico para mejorar tu organización digital, colaboración y gestión de información.",
    bullets: ["Ejercicios guiados", "Plantillas reutilizables", "Certificado de participación"],
  },
  {
    id: "comunicacion",
    title: "Comunicación efectiva",
    category: "Habilidades",
    duration: "3 encuentros · 6 horas",
    price: 32000,
    description: "Técnicas concretas para comunicar ideas con claridad en reuniones, presentaciones y canales digitales.",
    bullets: ["Práctica aplicada", "Feedback", "Material de apoyo"],
  },
];

const faqs = [
  ["¿Cómo me inscribo?", "Elegí un taller, completá el formulario y hacé clic en el botón de pago. El checkout se realiza con Mercado Pago."],
  ["¿Cuándo queda confirmada mi inscripción?", "Cuando Mercado Pago informa que el pago fue aprobado, el sistema actualiza automáticamente el estado de la inscripción y envía la confirmación."],
  ["¿Qué pasa si el pago queda pendiente?", "La inscripción queda en estado pendiente. No hace falta enviar un comprobante manual: el sistema espera la actualización de Mercado Pago."],
  ["¿Recibo confirmación por WhatsApp?", "Sí. Una vez validado el pago, se puede enviar automáticamente un mensaje de confirmación mediante Twilio WhatsApp."],
  ["¿Qué medios de pago puedo usar?", "Los medios disponibles son los que Mercado Pago habilite para tu cuenta y configuración de Checkout Pro."],
];

function money(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const course = useMemo(() => courses.find((c) => c.id === selected), [selected]);

  function chooseCourse(id) {
    setSelected(id);
    setError("");
    setTimeout(() => document.getElementById("inscripcion")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function submitRegistration(e) {
    e.preventDefault();
    if (!course) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago.");
      if (!data.init_point) throw new Error("Mercado Pago no devolvió la URL de pago.");
      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="nav">
        <a className="brand" href="#">Talleres<span>Online</span></a>
        <nav>
          <a href="#talleres">Talleres</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="nav-cta" href="#talleres">Ver talleres</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">FORMACIÓN PRÁCTICA · 100% ONLINE</div>
            <h1>Aprendé algo útil.<br /><em>Aplicalo de verdad.</em></h1>
            <p>Elegí tu próximo taller, completá tus datos y pagá online. Sin comprobantes manuales ni pasos innecesarios.</p>
            <div className="hero-actions">
              <a className="button primary" href="#talleres">Explorar talleres</a>
              <a className="text-link" href="#como-funciona">Cómo funciona →</a>
            </div>
          </div>
          <div className="hero-card">
            <div className="floating-tag">INSCRIPCIÓN SIMPLE</div>
            <div className="card-number">01</div>
            <h3>Elegí tu taller</h3>
            <p>Encontrá el contenido que mejor se adapta a lo que querés aprender.</p>
            <div className="mini-line"></div>
            <div className="card-number">02</div>
            <h3>Completá tus datos</h3>
            <p>Nombre, email y WhatsApp para poder confirmar tu inscripción.</p>
            <div className="mini-line"></div>
            <div className="card-number">03</div>
            <h3>Pagá con Mercado Pago</h3>
            <p>El estado se actualiza automáticamente cuando el pago es validado.</p>
          </div>
        </section>

        <section id="talleres" className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">PROGRAMACIÓN</div>
              <h2>Elegí tu próximo taller</h2>
            </div>
            <p>Contenido directo, ejercicios prácticos y modalidad virtual.</p>
          </div>
          <div className="course-grid">
            {courses.map((c) => (
              <article className="course-card" key={c.id}>
                <div className="course-top"><span>{c.category}</span><strong>{money(c.price)}</strong></div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <div className="duration">{c.duration}</div>
                <ul>{c.bullets.map((b) => <li key={b}>✓ {b}</li>)}</ul>
                <button className="button dark" onClick={() => chooseCourse(c.id)}>Inscribirme</button>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="process">
          <div className="eyebrow">DEL INTERÉS A LA CONFIRMACIÓN</div>
          <h2>Un flujo pensado para no hacerte perder tiempo.</h2>
          <div className="steps">
            {[
              ["01", "Descubrís", "Llegás desde WhatsApp, redes o un enlace directo."],
              ["02", "Te inscribís", "Elegís el taller y completás el formulario."],
              ["03", "Pagás", "Mercado Pago procesa el pago en Checkout Pro."],
              ["04", "Se confirma", "Webhook → automatización → Sheet + email + WhatsApp."],
            ].map(([n,t,d]) => <div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </section>

        <section id="inscripcion" className="registration">
          <div>
            <div className="eyebrow">INSCRIPCIÓN</div>
            <h2>{course ? `Inscripción a ${course.title}` : "Elegí un taller para comenzar"}</h2>
            <p>Completá tus datos. Después te llevaremos al checkout seguro de Mercado Pago.</p>
            {course && <div className="selected-course"><span>{course.title}</span><strong>{money(course.price)}</strong></div>}
          </div>
          <form onSubmit={submitRegistration} className="form-card">
            <label>Nombre y apellido<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Ej. Ana Pérez" /></label>
            <label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="ana@email.com" /></label>
            <label>WhatsApp<input required value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+54 9 351 ..." /></label>
            {error && <div className="error">{error}</div>}
            <button className="button primary full" disabled={!course || loading}>{loading ? "Preparando pago..." : "Continuar al pago →"}</button>
            <small>Al continuar aceptás que tus datos sean utilizados para gestionar la inscripción y enviarte comunicaciones relacionadas con el taller.</small>
          </form>
        </section>

        <section id="faq" className="section faq">
          <div className="section-head"><div><div className="eyebrow">PREGUNTAS FRECUENTES</div><h2>FAQ</h2></div></div>
          <div className="faq-list">
            {faqs.map(([q,a], i) => <div className="faq-item" key={q}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{q}</span><b>{openFaq === i ? "−" : "+"}</b></button>
              {openFaq === i && <p>{a}</p>}
            </div>)}
          </div>
        </section>
      </main>

      <footer><span>TalleresOnline</span><span>Inscripciones y pagos automatizados</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);