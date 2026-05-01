import { useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CatalogControls from "../components/CatalogControls";
import SectionHeader from "../components/SectionHeader";
import { filterProducts, sortProducts } from "../utils/catalog";
import ProductModal from "../components/ProductModal";

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

  const allProducts = useMemo(() => {
    return [...combos, ...stock];
  }, [combos, stock]);

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
    featuredProcessed.length + combosProcessed.length + stockProcessed.length === 0;

  return (
    <>
      <Header />

      <main className="container" id="productos">
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