import aceiteLimpieza from "../assets/images/aceite-limpieza.jpg";
import cremaReparadora from "../assets/images/crema-reparadora.jpg";
import refilLimpieza from "../assets/images/refil-limpieza.jpg";
import serumHidratante from "../assets/images/serum-hidratante.jpg";
import serumNiacinamida from "../assets/images/serum-niacinamida.jpg";
import jabonLimpieza from "../assets/images/jabon-limpieza.jpg";
import refreshPotion from "../assets/images/refreshPotion.jpg";
import comboRutinaPielGrasa from "../assets/images/combo-rutinaPielGrasa.jpg";
import tonicoPuryfing from "../assets/images/tonico-puryfing.jpg";
import comboLimpiezaGlow from "../assets/images/combo-limpiezaGlow.jpg";
import comboLimpiezaGlow2 from "../assets/images/combo-limpiezaGlow2.jpg";
import comboLimpiezaBasica from "../assets/images/combo-LimipiezaBasica.jpg";

import comboLimpieza from "../assets/images/combo-limpieza.jpg";
import aquaFotos from "../assets/images/aqua-fotos.jpg";
import aquaFotos2 from "../assets/images/aqua-fotos2.jpg";
import brighteningFotos from "../assets/images/brightening-drops-fotos.jpg";
import cleaninsingFotos from "../assets/images/cleaninsing-bubbles-fotos.jpg";
import balancingDropsFotos from "../assets/images/balancingDrops.JPG";
import brighteningFotos2 from "../assets/images/brighteningDrops.JPG";
import cleansingBubbles from "../assets/images/cleansingBubbles.JPG";
import comboLimpiezaFoto from "../assets/images/comboLimpieza.JPG";
import comboRutinaBasica2 from "../assets/images/comboRutinaBasica.JPG";
import comboRutinaCompleta from "../assets/images/comboRutinaCompleta.JPG";
import tonicoFoto from "../assets/images/tonico.JPG";

import comboSerumyCrema from "../assets/images/comboSerumyCrema.png";
import comboTonicoSerumCrema from "../assets/images/comboTonicoSerumCrema.png";
import comboTonicoySerum from "../assets/images/comboTonicoySerum.png";

export const imageMap = {
  "aceite-limpieza.jpg": aceiteLimpieza,
  "crema-reparadora.jpg": cremaReparadora,
  "refil-limpieza.jpg": refilLimpieza,
  "serum-hidratante.jpg": serumHidratante,
  "serum-niacinamida.jpg": serumNiacinamida,
  "jabon-limpieza.jpg": jabonLimpieza,
  "refreshPotion.jpg": refreshPotion,
  "combo-rutinaPielGrasa.jpg": comboRutinaPielGrasa,
  "tonico-puryfing.jpg": tonicoPuryfing,
  "combo-limpiezaGlow.jpg": comboLimpiezaGlow,
  "combo-limpiezaGlow2.jpg": comboLimpiezaGlow2,
  "combo-LimpiezaBasica.jpg": comboLimpiezaBasica,

  "combo-limpieza.jpg": comboLimpieza,
  "aqua-fotos.jpg": aquaFotos,
  "aqua-fotos2.jpg": aquaFotos2,
  "brightening-drops-fotos.jpg": brighteningFotos,
  "cleaninsing-bubbles-fotos.jpg": cleaninsingFotos,
  "balancingDrops.JPG": balancingDropsFotos,
  "brighteningDrops.JPG": brighteningFotos2,
  "cleansingBubbles.JPG": cleansingBubbles,
  "comboLimpieza.JPG": comboLimpiezaFoto,
  "comboRutinaBasica.JPG": comboRutinaBasica2,
  "comboRutinaCompleta.JPG": comboRutinaCompleta,
  "tonico.JPG": tonicoFoto,

  "comboSerumyCrema.png": comboSerumyCrema,
  "comboTonicoSerumCrema.png": comboTonicoSerumCrema,
  "comboTonicoySerum.png": comboTonicoySerum,
};

export const AVAILABLE_IMAGES = Object.keys(imageMap);

const normalizedImageMap = Object.fromEntries(
  Object.entries(imageMap).map(([key, value]) => [
    key.trim().toLowerCase(),
    value,
  ])
);

export function resolveImage(imageKey) {
  if (!imageKey || typeof imageKey !== "string") return null;
  return normalizedImageMap[imageKey.trim().toLowerCase()] || null;
}

export function resolveImages(imagesKeys = []) {
  if (!Array.isArray(imagesKeys)) return [];
  return imagesKeys.map((key) => resolveImage(key)).filter(Boolean);
}