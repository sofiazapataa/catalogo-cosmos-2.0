import { useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CatalogControls from "../components/CatalogControls";
import SectionHeader from "../components/SectionHeader";
import ProductModal from "../components/ProductModal";

import { filterProducts, sortProducts } from "../utils/catalog";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function getFinalPrice(product) {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);

  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

export default function HomePage() {
  const { combos, stock, loading, error } = useProducts();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);

  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [showAllStock, setShowAllStock] = useState(false);
  const [selected, setSelected] = useState(null);

  const allProducts = useMemo(() => {
    return [...combos, ...stock];
  }, [combos, stock]);

  const availableProductsCount = useMemo(() => {
    return allProducts.filter((p) => Number(p.stockQty ?? 1) > 0).length;
  }, [allProducts]);

  const heroProduct = useMemo(() => {
    const available = allProducts.filter((p) => Number(p.stockQty ?? 1) > 0);

    return (
      available.find((p) => p.featured === true) ||
      available.find((p) => Number(p.discount || 0) > 0) ||
      available[0] ||
      null
    );
  }, [allProducts]);

  function scrollToCatalog() {
    setTimeout(() => {
      document.getElementById("catalogo")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function applyExtraFilters(list) {
    let filtered = [...list];

    if (onlyDiscount) {
      filtered = filtered.filter((p) => Number(p.discount || 0) > 0);
    }

    if (onlyStock) {
      filtered = filtered.filter((p) => Number(p.stockQty || 0) > 0);
    }

    return sortProducts(filtered, sort);
  }

  const featuredProcessed = useMemo(() => {
    if (category !== "all") return [];

    const featured = allProducts.filter((product) => product.featured === true);
    return applyExtraFilters(filterProducts(featured, query));
  }, [allProducts, query, category, sort, onlyDiscount, onlyStock]);

  const combosProcessed = useMemo(() => {
    if (category !== "all" && category !== "combos") return [];

    const filtered = filterProducts(combos, query);
    return applyExtraFilters(filtered);
  }, [combos, query, category, sort, onlyDiscount, onlyStock]);

  const stockProcessed = useMemo(() => {
    if (category === "combos") return [];

    let filtered = filterProducts(stock, query);

    if (category !== "all") {
      filtered = filtered.filter((p) => p.type === category);
    }

    return applyExtraFilters(filtered);
  }, [stock, query, category, sort, onlyDiscount, onlyStock]);

  const featuredToShow = showAllFeatured
    ? featuredProcessed
    : featuredProcessed.slice(0, 4);

  const combosToShow = showAllCombos
    ? combosProcessed
    : combosProcessed.slice(0, 4);

  const stockToShow = showAllStock
    ? stockProcessed
    : stockProcessed.slice(0, 10);

  const nothingFound =
    !loading &&
    !error &&
    featuredProcessed.length + combosProcessed.length + stockProcessed.length ===
      0;

  return (
    <>
      <Header />

      <main className="container" id="productos">
        <section className="hero-kosmos">
          <div className="hero-kosmos-content">
            <div className="hero-kosmos-kicker">
              Skincare coreano • Ritual consciente
            </div>

            <h1 className="hero-kosmos-title">
              Cuidá tu piel con productos elegidos para resultados reales.
            </h1>

            <p className="hero-kosmos-text">
              Descubrí productos coreanos originales, rutinas simples y fórmulas
              pensadas para hidratar, equilibrar y mejorar tu piel.
            </p>

            <div className="hero-kosmos-actions">
              <a href="#catalogo" className="btn">
                Ver catálogo
              </a>

              <a href="/mi-lista" className="btn btn-outline">
                Mi lista
              </a>
            </div>

            <div className="hero-kosmos-badges">
              <span>Originales</span>
              <span>Rutinas simples</span>
              <span>Asesoramiento</span>
              <span>Envíos</span>
            </div>
          </div>

          <div className="hero-kosmos-card">
            {heroProduct ? (
              <button
                className="hero-featured-card"
                type="button"
                onClick={() => setSelected(heroProduct)}
              >
                <div className="hero-featured-top">
                  <span>Producto estrella</span>

                  {Number(heroProduct.discount || 0) > 0 ? (
                    <strong>-{heroProduct.discount}%</strong>
                  ) : null}
                </div>

                <div className="hero-featured-image">
                  {heroProduct.image ? (
                    <img src={heroProduct.image} alt={heroProduct.title} />
                  ) : null}
                </div>

                <div className="hero-featured-info">
                  <h3>{heroProduct.title}</h3>
                  <p>{heroProduct.desc}</p>

                  {heroProduct.skinType ? (
                    <span className="hero-featured-chip">
                      Ideal para: {heroProduct.skinType}
                    </span>
                  ) : null}

                  <div className="hero-featured-price">
                    ${formatARS(getFinalPrice(heroProduct))}
                  </div>

                  <div className="hero-featured-cta">Ver producto</div>
                </div>
              </button>
            ) : null}
          </div>
        </section>

        <section className="promo-banner">
          <div>
            <span className="promo-eyebrow">Promo activa</span>

            <h2>Combos y descuentos especiales por transferencia</h2>

            <p>
              Armá tu rutina, agregá productos a tu lista y consultá
              disponibilidad por WhatsApp.
            </p>
          </div>

          <div className="promo-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCategory("combos");
                scrollToCatalog();
              }}
            >
              Ver combos
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setOnlyDiscount(true);
                setCategory("all");
                scrollToCatalog();
              }}
            >
              Ver ofertas
            </button>
          </div>
        </section>

        <section className="catalog-shell" id="catalogo">
          <div className="catalog-top">
            <div>
              <span className="catalog-kicker">Catálogo Kosmos</span>

              <h2 className="catalog-title">Explorá nuestros productos</h2>

              <p className="catalog-text">
                Productos seleccionados para rutinas minimalistas, hidratación
                profunda y cuidado consciente de la piel.
              </p>
            </div>

            <div className="catalog-counter">
              <strong>{availableProductsCount}</strong>
              <span>productos disponibles</span>
            </div>
          </div>

          <CatalogControls
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            sort={sort}
            onSortChange={setSort}
            onlyDiscount={onlyDiscount}
            setOnlyDiscount={setOnlyDiscount}
            onlyStock={onlyStock}
            setOnlyStock={setOnlyStock}
          />
        </section>

        {loading ? <p style={{ opacity: 0.7 }}>Cargando productos…</p> : null}
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        {featuredProcessed.length > 0 && (
          <>
            <SectionHeader
              title="Destacados"
              count={featuredProcessed.length}
              shown={showAllFeatured}
              onToggle={() => setShowAllFeatured((v) => !v)}
              canToggle={featuredProcessed.length > 4}
            />

            <div className="grid">
              {featuredToShow.map((p) => (
                <ProductCard
                  key={`featured-${p.id}`}
                  product={p}
                  onOpen={() => setSelected(p)}
                />
              ))}
            </div>
          </>
        )}

        {combosProcessed.length > 0 && (
          <>
            <SectionHeader
              title="Nuestros Combos"
              count={combosProcessed.length}
              shown={showAllCombos}
              onToggle={() => setShowAllCombos((v) => !v)}
              canToggle={combosProcessed.length > 4}
            />

            <div className="grid">
              {combosToShow.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpen={() => setSelected(p)}
                />
              ))}
            </div>
          </>
        )}

        {stockProcessed.length > 0 && (
          <>
            <SectionHeader
              title="Productos en stock"
              count={stockProcessed.length}
              shown={showAllStock}
              onToggle={() => setShowAllStock((v) => !v)}
              canToggle={stockProcessed.length > 6}
            />

            <div className="grid">
              {stockToShow.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpen={() => setSelected(p)}
                />
              ))}
            </div>
          </>
        )}

        {nothingFound && (
          <p style={{ opacity: 0.7, marginTop: 16 }}>
            No encontramos resultados para “{query}”.
          </p>
        )}
      </main>

      <Footer />

      {selected ? (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}