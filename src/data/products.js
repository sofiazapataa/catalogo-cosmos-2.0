// src/data/products.js

// Imágenes locales (para el frontend actual)
import aceiteLimpieza from "../assets/images/aceite-limpieza.jpg";
import cremaReparadora from "../assets/images/crema-reparadora.jpg";
import cremaSuave from "../assets/images/crema-suave.jpg";
import refilLimpieza from "../assets/images/refil-limpieza.jpg";
import serumHidratante from "../assets/images/serum-hidratante.jpg";
import serumNiacinamida from "../assets/images/serum-niacinamida.jpg";
import serumOil from "../assets/images/serum-betaOil.jpg";
import tonicoExfoliante from "../assets/images/tonico-exfoliante.jpg";
import jabonLimpieza from "../assets/images/jabon-limpieza.jpg";

import comboLimpieza from "../assets/images/combo-limpieza.jpg";
import comboRefresh from "../assets/images/combo-refresh.jpg";

// ✅ Combos
export const combos = [
  {
    id: "combo-limpieza",
    title: "Combo Limpieza",
    desc: "Cleansing Bubbles 200ML + Cleansing Oil 125ML",
    price: 69800,
    discount: 5,
    category: "combo",
    type: "combos",
    image: comboLimpieza,
    imageKey: "combo-limpieza.jpg",
    imagesKeys: ["combo-limpieza.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Limpieza completa en dos pasos",
      "Ayuda a remover suciedad, protector y maquillaje",
      "Ideal para una rutina de limpieza diaria",
    ],
    howToUse:
      "Primero aplicar Cleansing Oil sobre piel seca. Luego retirar o emulsionar. Continuar con Cleansing Bubbles.",
    details:
      "Combo pensado para una limpieza completa y efectiva, ideal como base de cualquier rutina.",
  },
  {
    id: "combo-rutina-glow",
    title: "Combo Rutina Glow",
    desc: "Boosting Drops + Smooth Potion + Purifying Toner",
    price: 125700,
    discount: 5,
    category: "combo",
    type: "combos",
    image: comboRefresh,
    imageKey: "combo-refresh.jpg",
    imagesKeys: ["combo-refresh.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Rutina simple y completa",
      "Aporta luminosidad",
      "Ahorro frente a compra individual",
    ],
    howToUse:
      "Usar Purifying Toner después de la limpieza, luego Boosting Drops y finalizar con Smooth Potion.",
    details:
      "Combo ideal para una rutina glow, práctica y fácil de sostener.",
  },
  {
    id: "combo-rutina-completa",
    title: "Combo Rutina Completa",
    desc: "Cleansing Bubbles + Boosting Drops + Smooth Potion + Purifying Toner",
    price: 162800,
    discount: 5,
    category: "combo",
    type: "combos",
    image: comboLimpieza,
    imageKey: "combo-limpieza.jpg",
    imagesKeys: ["combo-limpieza.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Rutina completa de limpieza + tratamiento + hidratación",
      "Ideal para empezar con una rutina armada",
      "Ahorro frente a compra individual",
    ],
    howToUse:
      "Usar Cleansing Bubbles, luego Purifying Toner, continuar con Boosting Drops y finalizar con Smooth Potion.",
    details:
      "Combo pensado para quien quiere una rutina completa, simple y efectiva.",
  },
];

// ✅ Productos en stock
export const stock = [
  // LIMPIEZA
  {
    id: "cleansing-bubbles-200",
    title: "Cleansing Bubbles 200ML",
    desc: "Gel de limpieza",
    price: 39100,
    discount: 0,
    category: "stock",
    type: "limpieza",
    image: jabonLimpieza,
    imageKey: "jabon-limpieza.jpg",
    imagesKeys: ["jabon-limpieza.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Limpieza diaria",
      "Ayuda a remover impurezas",
      "Textura cómoda de usar",
    ],
    howToUse:
      "Aplicar sobre piel húmeda, masajear suavemente y enjuagar.",
    details:
      "Gel de limpieza ideal para usar mañana y noche como primer paso de la rutina.",
  },
  {
    id: "rf-cleansing-bubbles-200",
    title: "RF Cleansing Bubbles 200ML",
    desc: "Refill para Cleansing Bubbles",
    price: 27300,
    discount: 0,
    category: "stock",
    type: "limpieza",
    image: refilLimpieza,
    imageKey: "refil-limpieza.jpg",
    imagesKeys: ["refil-limpieza.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Formato refill",
      "Más práctico para reponer",
      "Mantiene tu rutina activa",
    ],
    howToUse:
      "Transferir al envase correspondiente y usar como tu gel de limpieza habitual.",
    details:
      "Opción refill para reponer tu producto de limpieza de forma más práctica.",
  },
  {
    id: "cleansing-oil-125",
    title: "Cleansing Oil 125ML",
    desc: "Aceite de limpieza",
    price: 34400,
    discount: 0,
    category: "stock",
    type: "limpieza",
    image: aceiteLimpieza,
    imageKey: "aceite-limpieza.jpg",
    imagesKeys: ["aceite-limpieza.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Limpieza en seco",
      "Ideal para remover protector solar y maquillaje",
      "Complementa la doble limpieza",
    ],
    howToUse:
      "Aplicar sobre piel seca, masajear y luego retirar o emulsionar.",
    details:
      "Aceite de limpieza ideal como primer paso en una rutina de doble limpieza.",
  },

  // TÓNICOS
  {
    id: "purifying-toner",
    title: "Purifying Toner",
    desc: "Tónico purificante",
    price: 39100,
    discount: 0,
    category: "stock",
    type: "tonicos",
    image: tonicoExfoliante,
    imageKey: "tonico-exfoliante.jpg",
    imagesKeys: ["tonico-exfoliante.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Prepara la piel",
      "Ayuda a refrescar la rutina",
      "Se integra fácil con otros productos",
    ],
    howToUse:
      "Aplicar luego de la limpieza con manos o algodón, antes del serum.",
    details:
      "Tónico pensado para complementar una rutina simple y efectiva.",
  },

  // SERUMS
  {
    id: "boosting-drops",
    title: "Boosting Drops",
    desc: "Serum booster para potenciar tu rutina",
    price: 47900,
    discount: 0,
    category: "stock",
    type: "serums",
    image: serumHidratante,
    imageKey: "serum-hidratante.jpg",
    imagesKeys: ["serum-hidratante.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Potencia la rutina y mejora la absorción",
      "Aporta luminosidad",
      "Hidratación ligera",
    ],
    howToUse:
      "Aplicar 3–4 gotas sobre piel limpia. Luego continuar con tu crema. AM/PM.",
    details:
      "Ideal como primer serum para comenzar una rutina y potenciar otros activos.",
  },
  {
    id: "balancing-drops",
    title: "Balancing Drops",
    desc: "Balance y control",
    price: 43800,
    discount: 0,
    category: "stock",
    type: "serums",
    image: serumNiacinamida,
    imageKey: "serum-niacinamida.jpg",
    imagesKeys: ["serum-niacinamida.jpg"],
    skinType: "Mixta a grasa",
    benefits: [
      "Ayuda a equilibrar",
      "Complementa rutinas de control",
      "Textura liviana",
    ],
    howToUse:
      "Aplicar sobre piel limpia antes de la crema, mañana o noche.",
    details:
      "Serum ideal para rutinas enfocadas en balance y control.",
  },
  {
    id: "beta-glow-oil",
    title: "Beta Glow Oil",
    desc: "Aceite glow",
    price: 39100,
    discount: 0,
    category: "stock",
    type: "serums",
    image: serumOil,
    imageKey: "serum-betaOil.jpg",
    imagesKeys: ["serum-betaOil.jpg"],
    skinType: "Normal a seca",
    benefits: [
      "Aporta glow",
      "Nutrición ligera",
      "Ideal para sumar luminosidad",
    ],
    howToUse:
      "Aplicar pocas gotas al final de la rutina o mezclar con la crema.",
    details:
      "Aceite facial pensado para aportar luminosidad y confort.",
  },

  // CREMAS
  {
    id: "smooth-potion",
    title: "Smooth Potion",
    desc: "Crema hidratante facial",
    price: 45300,
    discount: 0,
    category: "stock",
    type: "cremas",
    image: cremaSuave,
    imageKey: "crema-suave.jpg",
    imagesKeys: ["crema-suave.jpg"],
    skinType: "Apto para todo tipo de piel",
    benefits: [
      "Hidratación diaria",
      "Textura cómoda",
      "Acompaña rutinas AM/PM",
    ],
    howToUse:
      "Aplicar luego del serum sobre rostro y cuello.",
    details:
      "Crema facial pensada para hidratar y sellar la rutina.",
  },
  {
    id: "aqua-potion",
    title: "Aqua Potion",
    desc: "Hidratación ligera",
    price: 46400,
    discount: 0,
    category: "stock",
    type: "cremas",
    image: cremaReparadora,
    imageKey: "crema-reparadora.jpg",
    imagesKeys: ["crema-reparadora.jpg"],
    skinType: "Normal a mixta",
    benefits: [
      "Hidratación liviana",
      "Ideal para uso diario",
      "Se integra bien en rutinas simples",
    ],
    howToUse:
      "Aplicar después del serum como último paso de hidratación.",
    details:
      "Crema de hidratación ligera para una rutina cómoda y simple.",
  },
];