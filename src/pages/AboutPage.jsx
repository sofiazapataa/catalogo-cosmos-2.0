import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AboutPage() {
  usePageTitle("Sobre la marca");
  return (
    <>
      <Header />

      <main id="main-content" className="container">
        {/* HERO */}
        <section className="page-hero">
          <div>
            <h1 className="page-title">Sobre la marca</h1>
            <p className="page-lead">
              Kosmos es dermocosmética con enfoque en rutinas simples y efectivas.
              Fórmulas <strong>veganas</strong> y <strong>cruelty-free</strong>, pensadas para
              combinarse sin complicarte.
            </p>

            <div className="page-badges">
              <span className="page-badge">Vegana</span>
              <span className="page-badge">Cruelty-free</span>
              <span className="page-badge">Rutinas simples</span>
              <span className="page-badge">Dermocosmética</span>
            </div>
          </div>

          <div className="page-heroCard">
            <div className="page-heroCardTitle">¿No sabés por dónde empezar?</div>
            <p className="page-heroCardText">
              Elegí un <strong>combo</strong> y después sumá un producto objetivo (glow,
              hidratación, balance).
            </p>
            <div className="page-heroCardTip">
              Tip: mirá “Nuestros Combos” en Productos.
            </div>
          </div>
        </section>

        {/* BLOQUES */}
        <section className="page-section">
          <h2 className="page-h3">Qué vas a notar</h2>

          <div className="page-grid">
            <div className="page-card">
              <h3 className="page-h3">Rutina más fácil</h3>
              <p className="page-p">
                Productos pensados para combinarse sin que tengas que “adivinar”
                compatibilidades.
              </p>
            </div>

            <div className="page-card">
              <h3 className="page-h3">Texturas livianas</h3>
              <p className="page-p">
                Capas que se absorben bien y ayudan a mantener una sensación cómoda
                durante el día.
              </p>
            </div>

            <div className="page-card">
              <h3 className="page-h3">Objetivos claros</h3>
              <p className="page-p">
                Limpieza, hidratación, glow y balance: elegís por necesidad y listo.
              </p>
            </div>
          </div>
        </section>

        {/* COMO COMPRAR */}
        <section className="page-section">
          <h2 className="page-h3">Cómo comprar en el catálogo</h2>

          <div className="page-steps">
            <div className="page-step">
              <div className="page-stepNum">1</div>
              <div>
                <div className="page-stepTitle">Elegí productos</div>
                <div className="page-stepText">
                  Tocá un producto para ver info, beneficios y cómo usar.
                </div>
              </div>
            </div>

            <div className="page-step">
              <div className="page-stepNum">2</div>
              <div>
                <div className="page-stepTitle">Agregá a “Mi Lista”</div>
                <div className="page-stepText">
                  Armás tu selección y ajustás cantidades.
                </div>
              </div>
            </div>

            <div className="page-step">
              <div className="page-stepNum">3</div>
              <div>
                <div className="page-stepTitle">Elegí forma de pago</div>
                <div className="page-stepText">
                  Transferencia (5% OFF), efectivo o a coordinar.
                </div>
              </div>
            </div>

            <div className="page-step">
              <div className="page-stepNum">4</div>
              <div>
                <div className="page-stepTitle">Comprás por WhatsApp</div>
                <div className="page-stepText">
                  El mensaje se arma solo con tu lista y totales.
                </div>
              </div>
            </div>
          </div>

          <div className="page-note">
            <strong>Importante:</strong> el stock es limitado. Si un producto se termina,
            lo vemos por WhatsApp y lo reemplazamos por una alternativa similar.
          </div>
        </section>

        {/* FAQ MINI */}
        <section className="page-section">
          <h2 className="page-h3">Preguntas rápidas</h2>

          <div className="page-faq">
            <details className="page-faqItem">
              <summary>¿Son aptos para piel sensible?</summary>
              <p className="page-p">
                En general sí, pero depende del producto y tu piel. Si tenés dudas,
                contame tu tipo de piel y tu objetivo y te recomiendo una rutina suave.
              </p>
            </details>

            <details className="page-faqItem">
              <summary>¿Arranco con un combo o con productos sueltos?</summary>
              <p className="page-p">
                Lo más fácil es un combo (ya viene “armado”). Después sumás un producto
                objetivo según necesidad.
              </p>
            </details>

            <details className="page-faqItem">
              <summary>¿Cuándo se usa AM/PM?</summary>
              <p className="page-p">
                En el modal de cada producto te dejo el “cómo usar”. Si querés, te armo
                una rutina AM/PM completa con tu lista.
              </p>
            </details>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}