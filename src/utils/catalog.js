export function normalize(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterProducts(list, query) {
  const q = normalize(query).trim();
  if (!q) return list;

  return list.filter((p) => {
    const hay = `${p.title} ${p.desc}`.toLowerCase();
    return normalize(hay).includes(q);
  });
}

export function sortProducts(list, sort) {
  const copy = [...list];

  switch (sort) {
    case "az":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "za":
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case "price_asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price_desc":
      return copy.sort((a, b) => b.price - a.price);
    case "discount_desc":
      return copy.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case "featured":
    default:
      // Recomendados: primero los que tienen descuento
      return copy.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }
}





