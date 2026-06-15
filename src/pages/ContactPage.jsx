import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageTitle } from "../hooks/usePageTitle";

const WHATSAPP_NUMBER = "542262357366"; // wa.me necesita prefijo país sin +, sin espacios
const DISPLAY_PHONE = "(2262) 357366";
const EMAIL = "sofizapata2004@gmail.com";

export default function ContactPage() {
  usePageTitle("Contacto");
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola! Quiero hacer una consulta / reservar."
  )}`;

  function copy(text) {
    navigator.clipboard?.writeText(text);
  }

  return (
    <>
      <Header />

      <main id="main-content" className="container">
        <section className="page-hero" style={{ alignItems: "stretch" }}>
          <div>
            <h1 className="page-title">Contacto</h1>
            <p className="page-lead">
              Reservas por mensaje directo. <strong>Entrega inmediata.</strong>
            </p>

            <div className="contact-actions">
              <a className="btn contact-btn" href={waHref} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>

              <a className="btn btn-outline contact-btn" href={`mailto:${EMAIL}`}>
                Enviar email
              </a>
            </div>

            <div className="page-note" style={{ marginTop: 12 }}>
              Si querés, armá tu lista y tocá <strong>“Comprar por WhatsApp”</strong> desde
              “Mi Lista”. El mensaje sale listo.
            </div>
          </div>

          <div className="page-heroCard">
            <div className="contact-block">
              <div className="contact-row">
                <div className="contact-label">WhatsApp</div>
                <div className="contact-value">{DISPLAY_PHONE}</div>
              </div>

              <div className="contact-rowActions">
                <button
                  className="btn btn-outline btn-small"
                  type="button"
                  onClick={() => copy(DISPLAY_PHONE)}
                >
                  Copiar número
                </button>

                <a className="btn btn-small" href={waHref} target="_blank" rel="noreferrer">
                  Escribir
                </a>
              </div>
            </div>

            <div className="contact-divider" />

            <div className="contact-block">
              <div className="contact-row">
                <div className="contact-label">Email</div>
                <div className="contact-value contact-value--email">{EMAIL}</div>
              </div>

              <div className="contact-rowActions">
                <button
                  className="btn btn-outline btn-small"
                  type="button"
                  onClick={() => copy(EMAIL)}
                >
                  Copiar email
                </button>

                <a className="btn btn-small" href={`mailto:${EMAIL}`}>
                  Enviar
                </a>
              </div>
            </div>

            <div className="contact-miniNote">
              Horario de respuesta: lo antes posible 🙂
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}