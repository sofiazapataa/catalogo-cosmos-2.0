import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getOrders } from "../../services/ordersService";
import { getProducts } from "../../services/productsServices";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      setOrders(ordersData || []);
      setProducts(productsData.stock || []);
      setCombos(productsData.combos || []);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const allProducts = [...products, ...combos];

    const totalRevenue = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((acc, order) => acc + Number(order.total || 0), 0);

    const totalOrders = orders.length;

    const averageTicket =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;

    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    const outOfStock = allProducts.filter(
      (item) => Number(item.stockQty || 0) <= 0
    ).length;

    const lowStock = allProducts.filter((item) => {
      const qty = Number(item.stockQty || 0);
      const threshold = Number(item.lowStockThreshold || 3);

      return qty > 0 && qty <= threshold;
    }).length;

    const featured = allProducts.filter(
      (item) => item.featured === true
    ).length;

    const activeProducts = allProducts.filter(
      (item) => item.active !== false
    ).length;

    return {
      totalRevenue,
      totalOrders,
      averageTicket,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      outOfStock,
      lowStock,
      featured,
      activeProducts,
    };
  }, [orders, products, combos]);

  const topProducts = useMemo(() => {
    const map = {};

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!map[item.id]) {
          map[item.id] = {
            id: item.id,
            title: item.title,
            qty: 0,
          };
        }

        map[item.id].qty += Number(item.qty || 1);
      });
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h1>Dashboard</h1>

              <p className="page-lead">
                Administrá productos, pedidos y métricas de
                MultiSkinn desde un solo lugar.
              </p>
            </div>

            <div className="admin-topbar-actions">
              <button
                className="admin-action-btn admin-action-btn-secondary"
                type="button"
                onClick={loadDashboard}
              >
                Actualizar dashboard
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ opacity: 0.7 }}>
              Cargando métricas…
            </p>
          ) : (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <span>Ventas estimadas</span>
                  <strong>
                    ${formatARS(stats.totalRevenue)}
                  </strong>
                </div>

                <div className="admin-stat-card">
                  <span>Pedidos</span>
                  <strong>{stats.totalOrders}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Ticket promedio</span>
                  <strong>
                    ${formatARS(stats.averageTicket)}
                  </strong>
                </div>

                <div className="admin-stat-card">
                  <span>Pendientes</span>
                  <strong>{stats.pendingOrders}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Confirmados</span>
                  <strong>{stats.confirmedOrders}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Entregados</span>
                  <strong>{stats.deliveredOrders}</strong>
                </div>

                <div className="admin-stat-card">
                  <span>Productos activos</span>
                  <strong>{stats.activeProducts}</strong>
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
                  <span>Sin stock</span>
                  <strong>{stats.outOfStock}</strong>
                </div>
              </div>

              <div className="admin-dashboard-grid">
                <div className="admin-dashboard-panel">
                  <div className="admin-dashboard-head">
                    <h3>Accesos rápidos</h3>
                  </div>

                  <div className="admin-grid">
                    <Link
                      to="/admin/productos"
                      className="admin-card"
                    >
                      <h3>Productos</h3>

                      <p>
                        Administrar stock, precios e imágenes.
                      </p>
                    </Link>

                    <Link
                      to="/admin/combos"
                      className="admin-card"
                    >
                      <h3>Combos</h3>

                      <p>
                        Crear combos y promociones.
                      </p>
                    </Link>

                    <Link
                      to="/admin/orders"
                      className="admin-card"
                    >
                      <h3>Pedidos</h3>

                      <p>
                        Revisar pedidos y actualizar estados.
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="admin-dashboard-panel">
                  <div className="admin-dashboard-head">
                    <h3>Productos más pedidos</h3>
                  </div>

                  {topProducts.length === 0 ? (
                    <div className="admin-empty">
                      <p>
                        Todavía no hay pedidos suficientes.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-top-products">
                      {topProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="admin-top-product"
                        >
                          <div className="admin-top-rank">
                            #{index + 1}
                          </div>

                          <div className="admin-top-main">
                            <strong>{product.title}</strong>

                            <span>
                              {product.qty} unidades vendidas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}