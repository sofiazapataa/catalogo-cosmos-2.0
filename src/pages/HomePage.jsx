import { useEffect, useMemo, useState } from "react";
import { useProducts } from "../hooks/useProducts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import CatalogControls from "../components/CatalogControls";
import SectionHeader from "../components/SectionHeader";
import { filterProducts } from "../utils/catalog";
import ProductModal from "../components/ProductModal";

export default function HomePage() {
  const { combos, stock, loading, error } = useProducts();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showAllCombos, setShowAllCombos] = useState(false);
  const [showAllStock, setShowAllStock] = useState(false);
  const [selected, setSelected] = useState(null);


  const combosProcessed = useMemo(() => {
    const filtered = filterProducts(combos, query);

    if (category === "combos") return filtered;
    if (category !== "all") return [];

    return filtered;
  }, [combos, query, category]);

  const stockProcessed = useMemo(() => {
    let filtered = filterProducts(stock, query);

    if (category !== "all" && category !== "combos") {
      filtered = filtered.filter((p) => p.type === category);
    }

    if (category === "combos") return [];

    return filtered;
  }, [stock, query, category]);

  const combosToShow = showAllCombos
    ? combosProcessed
    : combosProcessed.slice(0, 4);

  const stockToShow = showAllStock
    ? stockProcessed
    : stockProcessed.slice(0, 10);

  const nothingFound =
    !loading && !error && combosProcessed.length + stockProcessed.length === 0;

  return (
    <>
      <Header />

      <main className="container" id="productos">
        <CatalogControls
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading ? <p style={{ opacity: 0.7 }}>Cargando productos…</p> : null}
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

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