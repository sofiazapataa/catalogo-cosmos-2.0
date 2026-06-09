import { useState } from "react";

const STEPS = [
  {
    id: "skinType",
    question: "¿Cuál es tu tipo de piel?",
    options: [
      { value: "grasa", label: "Grasa", desc: "Brilla con facilidad, poros visibles" },
      { value: "mixta", label: "Mixta", desc: "Zona T grasa, mejillas normales" },
      { value: "seca", label: "Seca", desc: "Se siente tirante, puede descamar" },
      { value: "sensible", label: "Sensible", desc: "Se irrita o enrojece con facilidad" },
      { value: "normal", label: "Normal", desc: "Equilibrada, sin problemas específicos" },
    ],
  },
  {
    id: "goal",
    question: "¿Qué querés lograr?",
    options: [
      { value: "hydration", label: "Hidratación", desc: "Piel más suave y nutrida" },
      { value: "oil", label: "Control de brillo", desc: "Menos sebo y poros más finos" },
      { value: "glow", label: "Luminosidad", desc: "Tono más uniforme y radiante" },
      { value: "texture", label: "Textura", desc: "Piel más lisa y pareja" },
    ],
  },
  {
    id: "budget",
    question: "¿Cuántos pasos querés en tu rutina?",
    options: [
      { value: "essential", label: "Lo esencial", desc: "1-2 productos, minimalista" },
      { value: "simple", label: "Rutina simple", desc: "3 pasos, equilibrado" },
      { value: "complete", label: "Rutina completa", desc: "4-5 pasos, máximo cuidado" },
    ],
  },
];

const SERUM_BY_GOAL = {
  hydration: "Sérum con ácido hialurónico",
  oil: "Sérum con niacinamida",
  glow: "Sérum vitamina C (Brightening Drops)",
  texture: "Sérum exfoliante (AHA/BHA)",
};

const TONIC_BY_SKIN = {
  grasa: "Tónico equilibrante o purificante",
  mixta: "Tónico equilibrante",
  seca: "Tónico hidratante y calmante",
  sensible: "Tónico sin alcohol, calmante",
  normal: "Tónico hidratante",
};

function buildRoutine({ skinType, goal, budget }) {
  const serum = SERUM_BY_GOAL[goal] || "Sérum hidratante";
  const tonic = TONIC_BY_SKIN[skinType] || "Tónico equilibrante";

  const routines = {
    essential: [
      { emoji: "🧴", step: "Limpieza", detail: "Gel suave o espuma limpiadora" },
      { emoji: "💧", step: "Hidratación", detail: "Crema hidratante para tu tipo de piel" },
    ],
    simple: [
      { emoji: "🧴", step: "Limpieza", detail: "Gel suave o espuma limpiadora" },
      { emoji: "🌿", step: "Tónico", detail: tonic },
      { emoji: "✨", step: "Sérum", detail: serum },
    ],
    complete: [
      { emoji: "🧴", step: "Limpieza", detail: "Aceite + gel (doble limpieza en PM)" },
      { emoji: "🌿", step: "Tónico", detail: tonic },
      { emoji: "✨", step: "Sérum", detail: serum },
      { emoji: "💧", step: "Crema", detail: "Hidratante para tu tipo de piel" },
      { emoji: "☀️", step: "SPF (AM)", detail: "Protector solar SPF 50" },
    ],
  };

  return routines[budget] || routines.simple;
}

export default function QuizModal({ onClose, onApplyFilter }) {
  const totalSteps = STEPS.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const done = step === totalSteps;

  function handleAnswer(value) {
    const newAnswers = { ...answers, [STEPS[step].id]: value };
    setAnswers(newAnswers);
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setStep(totalSteps);
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const routine = done ? buildRoutine(answers) : null;

  return (
    <div className="modal-overlay quiz-overlay" onMouseDown={handleOverlayClick}>
      <div className="quiz-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        {!done ? (
          <>
            <div className="quiz-progress" aria-hidden="true">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`quiz-progress-dot ${i <= step ? "quiz-progress-dot-active" : ""}`}
                />
              ))}
            </div>

            <p className="quiz-step-label">Paso {step + 1} de {totalSteps}</p>
            <h2 className="quiz-question">{STEPS[step].question}</h2>

            <div className="quiz-options">
              {STEPS[step].options.map((opt) => (
                <button
                  key={opt.value}
                  className="quiz-option"
                  type="button"
                  onClick={() => handleAnswer(opt.value)}
                >
                  <strong>{opt.label}</strong>
                  <span>{opt.desc}</span>
                </button>
              ))}
            </div>

            {step > 0 ? (
              <button
                className="quiz-back"
                type="button"
                onClick={() => setStep((s) => s - 1)}
              >
                ← Volver
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="quiz-result-kicker">Tu rutina personalizada</div>
            <h2 className="quiz-question">
              Rutina para piel {answers.skinType}
            </h2>
            <p className="quiz-result-sub">
              Basada en tus respuestas, estos son los pasos que te recomendamos:
            </p>

            <ol className="quiz-routine-list">
              {routine.map((item, i) => (
                <li key={i} className="quiz-routine-step">
                  <span className="quiz-step-emoji" aria-hidden="true">{item.emoji}</span>
                  <div>
                    <strong>{item.step}</strong>
                    <span>{item.detail}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="quiz-result-actions">
              <button
                className="btn"
                type="button"
                onClick={() => onApplyFilter(answers.skinType)}
              >
                Ver productos para piel {answers.skinType}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => { setStep(0); setAnswers({}); }}
              >
                Volver a empezar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
