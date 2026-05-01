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
    const hay = `${p.title || ""} ${p.desc || ""} ${p.type || ""}`;
    return normalize(hay).includes(q);
  });
}

export function sortProducts(list, sort) {
  const copy = [...list];

  switch (sort) {
    case "az":
      return copy.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );

    case "za":
      return copy.sort((a, b) =>
        String(b.title || "").localeCompare(String(a.title || ""))
      );

    case "price_asc":
      return copy.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    case "price_desc":
      return copy.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));

    case "discount_desc":
      return copy.sort(
        (a, b) => Number(b.discount || 0) - Number(a.discount || 0)
      );

    case "featured":
    default:
      return copy.sort((a, b) => {
        const featuredDiff = Number(b.featured === true) - Number(a.featured === true);
        if (featuredDiff !== 0) return featuredDiff;

        return Number(b.discount || 0) - Number(a.discount || 0);
      });
  }
}