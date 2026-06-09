const AM_STEPS = [
  { emoji: "🧴", title: "Limpieza suave", desc: "Gel o espuma para eliminar impurezas de la noche sin resecar." },
  { emoji: "🌿", title: "Tónico", desc: "Equilibrá el pH y preparé la piel para absorber lo que sigue." },
  { emoji: "✨", title: "Sérum", desc: "Activos concentrados para tu objetivo: hidratación, luminosidad o control de sebo." },
  { emoji: "☀️", title: "Hidratante + SPF", desc: "Sellá la humedad y protegé la piel del daño solar diario." },
];

const PM_STEPS = [
  { emoji: "🫧", title: "Doble limpieza", desc: "Aceite para disolver protector y maquillaje, gel para terminar de limpiar." },
  { emoji: "🌿", title: "Tónico", desc: "Recuperá el equilibrio después del día y preparate para el tratamiento." },
  { emoji: "🌙", title: "Sérum de noche", desc: "La noche es el momento ideal para activos más potentes como retinol o AHA." },
  { emoji: "💧", title: "Crema nutritiva", desc: "Sellar y nutrir mientras dormís para que la piel se repare sola." },
];

export default function RoutineSection() {
  return (
    <section className="routine-section">
      <div className="routine-header">
        <span className="catalog-kicker">Guía de rutina</span>
        <h2 className="catalog-title">¿Cómo armar tu ritual?</h2>
        <p className="routine-intro">
          Una rutina no tiene que ser complicada. Con 2 o 4 pasos bien elegidos
          ya vas a ver resultados reales.
        </p>
      </div>

      <div className="routine-cols">
        <div className="routine-col">
          <div className="routine-col-title">🌅 Mañana (AM)</div>
          <ol className="routine-steps">
            {AM_STEPS.map((s, i) => (
              <li key={i} className="routine-step">
                <div className="routine-step-num">{i + 1}</div>
                <div className="routine-step-body">
                  <strong>{s.emoji} {s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="routine-col">
          <div className="routine-col-title">🌙 Noche (PM)</div>
          <ol className="routine-steps">
            {PM_STEPS.map((s, i) => (
              <li key={i} className="routine-step">
                <div className="routine-step-num">{i + 1}</div>
                <div className="routine-step-body">
                  <strong>{s.emoji} {s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="routine-cta">
        <a href="#catalogo" className="btn">Explorar productos</a>
      </div>
    </section>
  );
}
