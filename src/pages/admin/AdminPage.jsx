import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getProducts } from "../../services/productsServices";

function getStockState(product) {
  const qty = Number(product.stockQty ?? 0);
  const low = Number(product.lowStockThreshold ?? 3);

  if (qty <= 0) return "out";
  if (qty <= low) return "low";
  return "ok";
}

export default function AdminPage() {
  const [data, setData] = useState({ stock: [], combos: [] });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getProducts();
      setData(res);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const products = data.stock || [];
    const combos = data.combos || [];
    const all = [...products, ...combos];

    return {
      totalProducts: products.length,
      totalCombos: combos.length,
      active: all.filter((item) => item.active !== false).length,
      hidden: all.filter((item) => item.active === false).length,
      featured: all.filter((item) => item.featured === true).length,
      lowStock: products.filter((item) => getStockState(item) === "low").length,
      outStock: products.filter((item) => getStockState(item) === "out").length,
    };
  }, [data]);

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2>Panel Admin</h2>
              <p>Gestioná productos, combos, stock y destacados del catálogo.</p>
            </div>
          </div>

          {loading ? (
            <p style={{ opacity: 0.7 }}>Cargando datos…</p>
          ) : (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <span>Productos</span>
                  <strong>{stats.totalProducts}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Combos</span>
                  <strong>{stats.totalCombos}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Activos</span>
                  <strong>{stats.active}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Ocultos</span>
                  <strong>{stats.hidden}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Destacados</span>
                  <strong>{stats.featured}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Stock bajo</span>
                  <strong>{stats.lowStock}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Agotados</span>
                  <strong>{stats.outStock}</strong>
                </div>
              </div>

              <div className="admin-grid">
                <Link to="/admin/productos" className="admin-card">
                  <h3>Productos</h3>
                  <p>Administrar productos, stock, destacados y visibilidad.</p>
                </Link>

                <Link to="/admin/combos" className="admin-card">
                  <h3>Combos</h3>
                  <p>Administrar combos, promociones y visibilidad.</p>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}