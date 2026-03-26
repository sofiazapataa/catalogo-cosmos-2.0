import aceiteLimpieza from "../assets/images/aceite-limpieza.jpg";
import cremaReparadora from "../assets/images/crema-reparadora.jpg";
import refilLimpieza from "../assets/images/refil-limpieza.jpg";
import serumHidratante from "../assets/images/serum-hidratante.jpg";
import serumNiacinamida from "../assets/images/serum-niacinamida.jpg";
import jabonLimpieza from "../assets/images/jabon-limpieza.jpg";
import comboLimpieza from "../assets/images/combo-limpieza.jpg";
import comboRefresh from "../assets/images/combo-refresh.jpg";
import refreshPotion from "../assets/images/refreshPotion.jpg";
import comboRutinaPielGrasa from "../assets/images/combo-rutinaPielGrasa.jpg";
import comboRutinaBasica from "../assets/images/combo-rutinaBasica.jpg"
import tonicoPuryfing from "../assets/images/tonico-puryfing.jpg"

export const imageMap = {
  "aceite-limpieza.jpg": aceiteLimpieza,
  "crema-reparadora.jpg": cremaReparadora,
  "refil-limpieza.jpg": refilLimpieza,
  "serum-hidratante.jpg": serumHidratante,
  "serum-niacinamida.jpg": serumNiacinamida,
  "jabon-limpieza.jpg": jabonLimpieza,
  "combo-limpieza.jpg": comboLimpieza,
  "combo-refresh.jpg": comboRefresh,
  "refreshPotion.jpg": refreshPotion,
  "combo-rutinaPielGrasa.jpg": comboRutinaPielGrasa,
  "combo-rutinaBasica.jpg": comboRutinaBasica,
  "tonico-puryfing.jpg": tonicoPuryfing,
};

export function resolveImage(imageKey) {
  return imageMap[imageKey] || null;
}

export function resolveImages(imagesKeys = []) {
  return imagesKeys.map((key) => imageMap[key]).filter(Boolean);
}