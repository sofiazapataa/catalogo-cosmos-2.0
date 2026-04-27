import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminProductForm from "../../components/AdminProductForm";
import { resolveImage } from "../../utils/imageMap";
import {
  getProducts,
  saveProduct,
  deleteProduct,
  updateProductPartial,
  duplicateProduct,
} from "../../services/productsServices";

function getStockState(product) {
  const qty = Number(product.stockQty ?? 0);
  const low = Number(product.lowStockThreshold ?? 3);

  if (qty <= 0) return "out";
  if (qty <= low) return "low";
  return "ok";
}

function getStockChip(product) {
  const qty = Number(product.stockQty ?? 0);
  const low = Number(product.lowStockThreshold ?? 3);

  if (qty <= 0) return { label: "Agotado", className: "admin-chip-stock-out" };
  if (qty === 1) return { label: "Última unidad", className: "admin-chip-stock-last" };
  if (qty <= low) return { label: `Quedan ${qty}`, className: "admin-chip-stock-low" };

  return { label: `Stock ${qty}`, className: "admin-chip-stock-ok" };
}

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [savingQuickId, setSavingQuickId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  async function loadData() {
    const data = await getProducts();
    setItems(data.stock || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    let list = [...items];
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      list = list.filter((product) =>
        `${product.title || ""} ${product.desc || ""} ${product.type || ""}`
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (filter === "active") list = list.filter((product) => product.active !== false);
    if (filter === "hidden") list = list.filter((product) => product.active === false);
    if (filter === "low") list = list.filter((product) => getStockState(product) === "low");
    if (filter === "out") list = list.filter((product) => getStockState(product) === "out");
    if (filter === "featured") list = list.filter((product) => product.featured === true);

    if (sort === "price") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "stock") {
      list.sort((a, b) => Number(a.stockQty || 0) - Number(b.stockQty || 0));
    }

    if (sort === "name") {
      list.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    }

    return list;
  }, [items, search, filter, sort]);

  async function handleQuickUpdate(productId, partialData) {
    try {
      setSavingQuickId(productId);
      await updateProductPartial(productId, partialData);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el producto.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleStockChange(product, amount) {
    const currentStock = Number(product.stockQty || 0);
    const nextStock = Math.max(0, currentStock + amount);

    await handleQuickUpdate(product.id, { stockQty: nextStock });
  }

  async function handleToggleActive(product) {
    await handleQuickUpdate(product.id, {
      active: product.active === false,
    });
  }

  async function handleToggleFeatured(product) {
    await handleQuickUpdate(product.id, {
      featured: product.featured !== true,
    });
  }

  async function handleDuplicate(product) {
    try {
      setSavingQuickId(product.id);
      await duplicateProduct(product);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo duplicar el producto.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleDelete(product) {
    const ok = window.confirm(`¿Querés borrar "${product.title}"?`);
    if (!ok) return;

    try {
      await deleteProduct(product.id);
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
              <h2>Productos</h2>
              <p>Gestioná stock, visibilidad, destacados e información de tus productos.</p>
            </div>

            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="admin-filters">
              <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                Todos
              </button>
              <button type="button" className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>
                Activos
              </button>
              <button type="button" className={filter === "hidden" ? "active" : ""} onClick={() => setFilter("hidden")}>
                Ocultos
              </button>
              <button type="button" className={filter === "featured" ? "active" : ""} onClick={() => setFilter("featured")}>
                Destacados
              </button>
              <button type="button" className={filter === "low" ? "active" : ""} onClick={() => setFilter("low")}>
                Stock bajo
              </button>
              <button type="button" className={filter === "out" ? "active" : ""} onClick={() => setFilter("out")}>
                Agotados
              </button>
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
            </select>

            <div className="admin-topbar-actions">
              <Link to="/admin" className="admin-action-btn admin-action-btn-secondary">
                ← Volver al panel
              </Link>

              <button
                type="button"
                className="admin-action-btn admin-action-btn-primary"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                + Nuevo producto
              </button>
            </div>
          </div>

          {showForm ? (
            <AdminProductForm
              initialData={editing}
              onSave={async (product) => {
                await saveProduct(product);
                setShowForm(false);
                setEditing(null);
                await loadData();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          ) : null}

          <div className="admin-list">
            {filteredItems.map((product) => {
              const preview = resolveImage(product.imageKey);
              const stockChip = getStockChip(product);
              const isSaving = savingQuickId === product.id;

              return (
                <article key={product.id} className="admin-list-item">
                  {preview ? (
                    <img src={preview} alt={product.title} className="admin-list-image" />
                  ) : (
                    <div className="admin-list-image admin-list-image-empty">Sin foto</div>
                  )}

                  <div className="admin-list-main">
                    <h3>{product.title}</h3>
                    <p>{product.desc}</p>

                    <div className="admin-meta">
                      <span className="admin-chip">{product.type || "producto"}</span>

                      <span className="admin-chip admin-chip-soft">
                        ${Number(product.price || 0).toLocaleString("es-AR")}
                      </span>

                      <span className={`admin-chip admin-chip-soft ${stockChip.className}`}>
                        {stockChip.label}
                      </span>

                      <span className="admin-chip admin-chip-soft">
                        {product.active === false ? "Oculto" : "Activo"}
                      </span>

                      {product.featured ? (
                        <span className="admin-chip admin-chip-soft">⭐ Destacado</span>
                      ) : null}
                    </div>

                    <div className="admin-quick-actions">
                      <div className="admin-stock-control">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleStockChange(product, -1)}
                        >
                          −
                        </button>

                        <strong>{Number(product.stockQty || 0)}</strong>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleStockChange(product, 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className={`admin-toggle-btn ${product.active === false ? "is-off" : "is-on"}`}
                        disabled={isSaving}
                        onClick={() => handleToggleActive(product)}
                      >
                        {product.active === false ? "Oculto" : "Activo"}
                      </button>

                      <button
                        type="button"
                        className={`admin-toggle-btn ${product.featured ? "is-on" : "is-off"}`}
                        disabled={isSaving}
                        onClick={() => handleToggleFeatured(product)}
                      >
                        {product.featured ? "⭐ Destacado" : "☆ Destacar"}
                      </button>

                      <button
                        type="button"
                        className="admin-ghost-btn"
                        disabled={isSaving}
                        onClick={() => handleDuplicate(product)}
                      >
                        Duplicar
                      </button>
                    </div>
                  </div>

                  <div className="admin-list-side">
                    <button
                      type="button"
                      className="admin-btn edit"
                      disabled={isSaving}
                      onClick={() => {
                        setEditing(product);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="admin-btn delete"
                      disabled={isSaving}
                      onClick={() => handleDelete(product)}
                    >
                      Borrar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}