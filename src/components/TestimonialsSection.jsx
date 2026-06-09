import { useEffect, useState } from "react";
import { getTestimonials } from "../services/testimonialsService";

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getTestimonials({ onlyActive: true })
      .then(setItems)
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="testimonials-section" aria-label="Opiniones de clientes">
      <div className="testimonials-header">
        <span className="catalog-kicker">Lo que dicen nuestras clientas</span>
        <h2 className="catalog-title">Resultados reales</h2>
      </div>

      <div className="testimonials-grid">
        {items.map((t) => (
          <blockquote key={t.id} className="testimonial-card">
            <p className="testimonial-text">"{t.text}"</p>
            <footer className="testimonial-author">— {t.author}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
