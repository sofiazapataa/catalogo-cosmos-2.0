import { describe, it, expect } from "vitest";
import { filterProducts, sortProducts, normalize } from "./catalog";

const PRODUCTS = [
  { id: "1", title: "Tónico Hidratante", desc: "Con ácido hialurónico", type: "tónico", price: 1500, discount: 0, featured: false },
  { id: "2", title: "Sérum Vitamina C", desc: "Ilumina y unifica el tono", type: "sérum", price: 2500, discount: 20, featured: true },
  { id: "3", title: "Crema Limpiadora", desc: "Para piel sensible", type: "limpiador", price: 1200, discount: 10, featured: false },
  { id: "4", title: "Protector Solar", desc: "SPF 50 liviano", type: "solar", price: 3000, discount: 0, featured: true },
];

// ─── normalize ────────────────────────────────────────────────────────────────
describe("normalize", () => {
  it("lowercases text", () => {
    expect(normalize("HOLA")).toBe("hola");
  });

  it("removes accents", () => {
    expect(normalize("Hidratación")).toBe("hidratacion");
    expect(normalize("Sérum")).toBe("serum");
  });

  it("handles empty/null", () => {
    expect(normalize("")).toBe("");
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
  });
});

// ─── filterProducts ───────────────────────────────────────────────────────────
describe("filterProducts", () => {
  it("returns all products for empty query", () => {
    expect(filterProducts(PRODUCTS, "")).toHaveLength(4);
    expect(filterProducts(PRODUCTS, "   ")).toHaveLength(4);
  });

  it("filters by title (case insensitive)", () => {
    const result = filterProducts(PRODUCTS, "serum");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters with accent-insensitive search", () => {
    // "Tónico" should match query "tonico"
    const result = filterProducts(PRODUCTS, "tonico");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by description text", () => {
    const result = filterProducts(PRODUCTS, "hialuronico");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by type", () => {
    const result = filterProducts(PRODUCTS, "limpiador");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("3");
  });

  it("returns empty for no matches", () => {
    expect(filterProducts(PRODUCTS, "xyz123")).toHaveLength(0);
  });

  it("does not mutate the original array", () => {
    const copy = [...PRODUCTS];
    filterProducts(PRODUCTS, "serum");
    expect(PRODUCTS).toEqual(copy);
  });
});

// ─── sortProducts ─────────────────────────────────────────────────────────────
describe("sortProducts", () => {
  it("sorts A→Z by title", () => {
    const result = sortProducts(PRODUCTS, "az");
    expect(result[0].title).toBe("Crema Limpiadora");
    expect(result[result.length - 1].title).toBe("Tónico Hidratante");
  });

  it("sorts Z→A by title", () => {
    const result = sortProducts(PRODUCTS, "za");
    expect(result[0].title).toBe("Tónico Hidratante");
  });

  it("sorts price ascending", () => {
    const result = sortProducts(PRODUCTS, "price_asc");
    expect(result[0].price).toBe(1200);
    expect(result[result.length - 1].price).toBe(3000);
  });

  it("sorts price descending", () => {
    const result = sortProducts(PRODUCTS, "price_desc");
    expect(result[0].price).toBe(3000);
    expect(result[result.length - 1].price).toBe(1200);
  });

  it("sorts by discount descending", () => {
    const result = sortProducts(PRODUCTS, "discount_desc");
    expect(result[0].discount).toBe(20);
    expect(result[1].discount).toBe(10);
  });

  it("featured sort: featured=true first, then by discount", () => {
    const result = sortProducts(PRODUCTS, "featured");
    // featured products first: ids 2 (discount 20%) and 4 (discount 0%)
    expect(result[0].featured).toBe(true);
    expect(result[1].featured).toBe(true);
    // within featured, higher discount comes first
    expect(result[0].id).toBe("2"); // 20% discount
    expect(result[1].id).toBe("4"); // 0% discount
  });

  it("defaults to featured sort for unknown sort key", () => {
    const result = sortProducts(PRODUCTS, "unknown");
    expect(result[0].featured).toBe(true);
  });

  it("does not mutate the original array", () => {
    const copy = [...PRODUCTS];
    sortProducts(PRODUCTS, "az");
    expect(PRODUCTS).toEqual(copy);
  });
});
