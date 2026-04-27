import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminProductForm from "../../components/AdminProductForm";
import { resolveImage } from "../../utils/imageMap";
import {
  getProducts,
  saveProduct,
  deleteProduct,
} from "../../services/productsServices";

function getStockState(product) {
  const qty = Number(product.stockQty ?? 0);
  const low = Number(product.lowStockThreshold ?? 3);

  if (qty <= 0) return { text: "Agotado", className: "admin-chip-stock-out" };
  if (qty === 1) return { text: "Última unidad", className: "admin-chip-stock-last" };
  if (qty <= low) return { text: `Quedan ${qty}`, className: "admin-chip-stock-low" };

  return { text: `Stock ${qty}`, className: "admin-chip-stock-ok" };
}

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getProducts();
      setItems(data.stock || []);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(product) {
    try {
      setSaving(true);
      await saveProduct(product);
      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, title) {
    const ok = window.confirm(`¿Querés borrar "${title}"?`);
    if (!ok) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo borrar el producto.");
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2 className="page-title">Admin · Productos</h2>
              <p className="page-lead">Crear, editar y borrar productos del catálogo.</p>
            </div>

            <div className="admin-topbar-actions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                Nuevo producto
              </button>

              <Link to="/admin" className="btn btn-outline">
                Volver al panel
              </Link>
            </div>
          </div>

          {showForm ? (
            <div style={{ marginBottom: 16 }}>
              <AdminProductForm
                mode="product"
                initialData={editing}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                saving={saving}
              />
            </div>
          ) : null}

          {loading ? <p>Cargando productos…</p> : null}

          <section className="admin-list">
            {items.map((product) => {
              const stockState = getStockState(product);
              const preview = resolveImage(product.imageKey);

              return (
                <article key={product.id} className="admin-list-item">
                  {preview ? (
                    <img
                      src={preview}
                      alt={product.title}
                      className="admin-list-image"
                    />
                  ) : (
                    <div className="admin-list-image admin-list-image-empty">
                      Sin foto
                    </div>
                  )}

                  <div className="admin-list-main">
                    <h3>{product.title}</h3>
                    <p>{product.desc}</p>

                    <div className="admin-meta">
                      <span className="admin-chip">{product.type || "producto"}</span>

                      <span className="admin-chip admin-chip-soft">
                        ${Number(product.price || 0).toLocaleString("es-AR")}
                      </span>

                      <span className={`admin-chip admin-chip-soft ${stockState.className}`}>
                        {stockState.text}
                      </span>

                      <span className="admin-chip admin-chip-soft">
                        {product.active ? "Activo" : "Oculto"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list-side">
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => {
                        setEditing(product);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-outline btn-small"
                      type="button"
                      onClick={() => handleDelete(product.id, product.title)}
                    >
                      Borrar
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}