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
import comboLimpiezaBasica from "../assets/images/combo-LimipiezaBasica.jpg";
import combolimpieza from "../assets/images/combo-limpieza.jpg";
import aquaFotos from "../assets/images/aqua-fotos.jpg";
import aquaFotos2 from "../assets/images/aqua-fotos2.jpg";
import brighteningFotos from "../assets/images/brightening-drops-fotos.jpg";
import cleaninsingFotos from "../assets/images/cleaninsing-bubbles-fotos.jpg";

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
  "combo-LimpiezaBasica.jpg": comboLimpiezaBasica,
  "combo-limpieza.jpg": combolimpieza,
  "aqua-fotos.jpg": aquaFotos,
  "aqua-fotos2.jpg": aquaFotos2,
  "brightening-drops-fotos.jpg": brighteningFotos,
  "cleaninsing-bubbles-fotos.jpg": cleaninsingFotos,
};

export function resolveImage(imageKey) {
  return imageMap[imageKey] || null;
}

export function resolveImages(imagesKeys = []) {
  return imagesKeys.map((key) => imageMap[key]).filter(Boolean);
}