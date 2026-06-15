import { useCallback, useEffect, useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CatalogControls from "../components/CatalogControls";
import SectionHeader from "../components/SectionHeader";
import ProductModal from "../components/ProductModal";
import SkeletonCard from "../components/SkeletonCard";

import { filterProducts, sortProducts } from "../utils/catalog";
import { getRecentOrders } from "../services/ordersService";
import { formatARS, getProductDiscountPrice } from "../utils/pricing";
import ErrorState from "../components/ErrorState";
import TestimonialsSection from "../components/TestimonialsSection";
import QuizModal from "../components/QuizModal";
import RoutineSection from "../components/RoutineSection";
import { usePageTitle } from "../hooks/usePageTitle";

function buildSalesMap(orders = []) {
  const map = {};

  orders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!item.id) return;

        if (!map[item.id]) {
          map[item.id] = {
            id: item.id,
            title: item.title || "",
            qty: 0,
          };
        }

        map[item.id].qty += Number(item.qty || 1);
      });
    });

  return map;
}

export default function HomePage() {
  usePageTitle("Catálogo");

  const { combos, stock, loading, error, reload } = useProducts();

  const [orders, setOrders] = useState([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [skinType, setSkinType] = useState("all");

  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllBestSellers, setShowAllBestSellers] = useState(false);
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [showAllStock, setShowAllStock] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getRecentOrders(100);
        setOrders(data || []);
      } catch (error) {
        console.error("No se pudieron cargar los pedidos para bestseller", error);
      }
    }

    loadOrders();
  }, []);

  const salesMap = useMemo(() => buildSalesMap(orders), [orders]);

  const allProducts = useMemo(() => {
    return [...combos, ...stock].map((product) => {
      const soldQty = salesMap[product.id]?.qty || 0;
      return { ...product, soldQty, bestseller: soldQty > 0 };
    });
  }, [combos, stock, salesMap]);

  const comboIds = useMemo(() => new Set(combos.map((c) => c.id)), [combos]);

  const combosWithSales = useMemo(
    () => allProducts.filter((p) => comboIds.has(p.id)),
    [allProducts, comboIds]
  );

  const stockWithSales = useMemo(
    () => allProducts.filter((p) => !comboIds.has(p.id)),
    [allProducts, comboIds]
  );

  const availableProductsCount = useMemo(() => {
    return allProducts.filter((p) => Number(p.stockQty ?? 1) > 0).length;
  }, [allProducts]);

  const bestSellers = useMemo(() => {
    return [...allProducts]
      .filter((p) => Number(p.soldQty || 0) > 0)
      .sort((a, b) => Number(b.soldQty || 0) - Number(a.soldQty || 0));
  }, [allProducts]);

  const heroProduct = useMemo(() => {
    const available = allProducts.filter((p) => Number(p.stockQty ?? 1) > 0);

    return (
      available.find((p) => Number(p.soldQty || 0) > 0) ||
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

  const applyExtraFilters = useCallback(
    (list) => {
      let filtered = [...list];

      if (skinType !== "all") {
        filtered = filtered.filter((p) =>
          p.skinType?.toLowerCase().includes(skinType.toLowerCase())
        );
      }

      if (onlyDiscount) {
        filtered = filtered.filter((p) => Number(p.discount || 0) > 0);
      }

      if (onlyStock) {
        filtered = filtered.filter((p) => Number(p.stockQty || 0) > 0);
      }

      return sortProducts(filtered, sort);
    },
    [skinType, onlyDiscount, onlyStock, sort]
  );

  const featuredProcessed = useMemo(() => {
    if (category !== "all") return [];
    const featured = allProducts.filter((product) => product.featured === true);
    return applyExtraFilters(filterProducts(featured, query));
  }, [allProducts, query, category, applyExtraFilters]);

  const bestSellersProcessed = useMemo(() => {
    if (category !== "all") return [];
    return applyExtraFilters(filterProducts(bestSellers, query));
  }, [bestSellers, query, category, applyExtraFilters]);

  const combosProcessed = useMemo(() => {
    if (category !== "all" && category !== "combos") return [];
    return applyExtraFilters(filterProducts(combosWithSales, query));
  }, [combosWithSales, query, category, applyExtraFilters]);

  const stockProcessed = useMemo(() => {
    if (category === "combos") return [];
    let filtered = filterProducts(stockWithSales, query);
    if (category !== "all") {
      filtered = filtered.filter((p) => p.type === category);
    }
    return applyExtraFilters(filtered);
  }, [stockWithSales, query, category, applyExtraFilters]);

  const featuredToShow = showAllFeatured
    ? featuredProcessed
    : featuredProcessed.slice(0, 4);

  const bestSellersToShow = showAllBestSellers
    ? bestSellersProcessed
    : bestSellersProcessed.slice(0, 4);

  const combosToShow = showAllCombos
    ? combosProcessed
    : combosProcessed.slice(0, 4);

  const stockToShow = showAllStock
    ? stockProcessed
    : stockProcessed.slice(0, 10);

  const nothingFound =
    !loading &&
    !error &&
    featuredProcessed.length +
      bestSellersProcessed.length +
      combosProcessed.length +
      stockProcessed.length ===
      0;

  return (
    <>
      <Header />

      <main id="main-content" className="container">
        <section className="hero-kosmos">
          <div className="hero-kosmos-content">
            <div className="hero-kosmos-kicker">
              Skincare Vegano • Ritual consciente
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

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowQuiz(true)}
              >
                ¿Cuál es mi rutina?
              </button>
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
                  <span>
                    {heroProduct.bestseller ? "Bestseller" : "Producto estrella"}
                  </span>

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
                    ${formatARS(getProductDiscountPrice(heroProduct))}
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

        <RoutineSection />

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
            skinType={skinType}
            setSkinType={setSkinType}
          />
        </section>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : null}
        {error ? <ErrorState onRetry={reload} /> : null}

        {bestSellersProcessed.length > 0 && (
          <>
            <SectionHeader
              title="Más vendidos"
              count={bestSellersProcessed.length}
              shown={showAllBestSellers}
              onToggle={() => setShowAllBestSellers((v) => !v)}
              canToggle={bestSellersProcessed.length > 4}
            />

            <div className="grid">
              {bestSellersToShow.map((p) => (
                <ProductCard
                  key={`bestseller-${p.id}`}
                  product={p}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </>
        )}

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
                  onOpen={setSelected}
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
                  onOpen={setSelected}
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
                  onOpen={setSelected}
                />
              ))}
            </div>
          </>
        )}

        {nothingFound && (
          <p className="catalog-empty">
            No encontramos resultados para &ldquo;{query}&rdquo;.
          </p>
        )}

        <TestimonialsSection />
      </main>

      <Footer />

      {selected ? (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      ) : null}

      {showQuiz ? (
        <QuizModal
          onClose={() => setShowQuiz(false)}
          onApplyFilter={(skinType) => {
            setSkinType(skinType);
            setShowQuiz(false);
            scrollToCatalog();
          }}
        />
      ) : null}
    </>
  );
}