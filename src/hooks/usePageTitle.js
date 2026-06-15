import { useEffect } from "react";

const BRAND = "Kosmos";

/**
 * Establece el document.title de forma semántica y accesible.
 * Formato: "<título> | Kosmos"
 * Si no se pasa título usa solo el nombre de la marca.
 *
 * @param {string} [title] - Título de la página (sin el nombre de marca)
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : BRAND;

    // Cleanup: restaura el título base al desmontar
    return () => {
      document.title = BRAND;
    };
  }, [title]);
}
