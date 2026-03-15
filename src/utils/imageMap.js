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

export const imageMap = {
  "aceite-limpieza.jpg": aceiteLimpieza,
  "crema-reparadora.jpg": cremaReparadora,
  "crema-suave.jpg": cremaSuave,
  "refil-limpieza.jpg": refilLimpieza,
  "serum-hidratante.jpg": serumHidratante,
  "serum-niacinamida.jpg": serumNiacinamida,
  "serum-betaOil.jpg": serumOil,
  "tonico-exfoliante.jpg": tonicoExfoliante,
  "jabon-limpieza.jpg": jabonLimpieza,
  "combo-limpieza.jpg": comboLimpieza,
  "combo-refresh.jpg": comboRefresh,
};

export function resolveImage(imageKey) {
  return imageMap[imageKey] || null;
}

export function resolveImages(imagesKeys = []) {
  return imagesKeys.map((key) => imageMap[key]).filter(Boolean);
}