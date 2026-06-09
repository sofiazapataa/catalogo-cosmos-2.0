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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  async function loadData() {
    try {
      const data = await getProducts();
      setItems(data.stock || []);
    } catch {
      setPageError("No se pudieron cargar los productos.");
    }
  }

  useEffect(() => { loadData(); }, []);

  const filteredItems = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => `${p.title} ${p.desc} ${p.type}`.toLowerCase().includes(q));
    if (filter === "active") list = list.filter((p) => p.active !== false);
    if (filter === "hidden") list = list.filter((p) => p.active === false);
    if (filter === "low") list = list.filter((p) => getStockState(p) === "low");
    if (filter === "out") list = list.filter((p) => getStockState(p) === "out");
    if (filter === "featured") list = list.filter((p) => p.featured === true);
    if (sort === "price") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "stock") list.sort((a, b) => Number(a.stockQty || 0) - Number(b.stockQty || 0));
    if (sort === "name") list.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    return list;
  }, [items, search, filter, sort]);

  async function handleQuickUpdate(productId, partialData) {
    try {
      setSavingQuickId(productId);
      setPageError("");
      await updateProductPartial(productId, partialData);
      await loadData();
    } catch {
      setPageError("No se pudo actualizar el producto. Intentá de nuevo.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleStockChange(product, amount) {
    const next = Math.max(0, Number(product.stockQty || 0) + amount);
    await handleQuickUpdate(product.id, { stockQty: next });
  }

  async function handleToggleActive(product) {
    await handleQuickUpdate(product.id, { active: product.active === false });
  }

  async function handleToggleFeatured(product) {
    await handleQuickUpdate(product.id, { featured: product.featured !== true });
  }

  async function handleDuplicate(product) {
    try {
      setSavingQuickId(product.id);
      setPageError("");
      await duplicateProduct(product);
      await loadData();
    } catch {
      setPageError("No se pudo duplicar el producto.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleDelete(product) {
    try {
      setPageError("");
      await deleteProduct(product.id);
      setConfirmDeleteId(null);
      await loadData();
    } catch {
      setPageError("No se pudo borrar el producto.");
      setConfirmDeleteId(null);
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <Link to="/admin" className="admin-back-link">← Dashboard</Link>
              <h2>Productos</h2>
              <p>Gestioná stock, visibilidad, destacados e información de tus productos.</p>
            </div>

            <input placeholder="Buscar producto…" value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="admin-filters">
              {[
                { id: "all", label: "Todos" },
                { id: "active", label: "Activos" },
                { id: "hidden", label: "Ocultos" },
                { id: "featured", label: "Destacados" },
                { id: "low", label: "Stock bajo" },
                { id: "out", label: "Agotados" },
              ].map((f) => (
                <button key={f.id} type="button" className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="stock">Ordenar por stock</option>
            </select>

            <div className="admin-topbar-actions">
              <button
                type="button"
                className="admin-action-btn admin-action-btn-primary"
                onClick={() => { setEditing(null); setShowForm(true); window.scrollTo(0, 0); }}
              >
                + Nuevo producto
              </button>
            </div>
          </div>

          {pageError ? <p className="admin-error" style={{ marginBottom: 16 }}>{pageError}</p> : null}

          {showForm ? (
            <AdminProductForm
              initialData={editing}
              onSave={async (product) => {
                await saveProduct(product);
                setShowForm(false);
                setEditing(null);
                await loadData();
              }}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          ) : null}

          <div className="admin-list">
            {filteredItems.map((product) => {
              const preview = resolveImage(product.imageKey) || product.imageUrl;
              const stockChip = getStockChip(product);
              const isSaving = savingQuickId === product.id;
              const isConfirmingDelete = confirmDeleteId === product.id;

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
                      <span className="admin-chip admin-chip-soft">${Number(product.price || 0).toLocaleString("es-AR")}</span>
                      <span className={`admin-chip admin-chip-soft ${stockChip.className}`}>{stockChip.label}</span>
                      <span className="admin-chip admin-chip-soft">{product.active === false ? "Oculto" : "Activo"}</span>
                      {product.featured ? <span className="admin-chip admin-chip-soft">⭐ Destacado</span> : null}
                    </div>

                    <div className="admin-quick-actions">
                      <div className="admin-stock-control">
                        <button type="button" disabled={isSaving} onClick={() => handleStockChange(product, -1)}>−</button>
                        <strong>{Number(product.stockQty || 0)}</strong>
                        <button type="button" disabled={isSaving} onClick={() => handleStockChange(product, 1)}>+</button>
                      </div>

                      <button type="button" className={`admin-toggle-btn ${product.active === false ? "is-off" : "is-on"}`} disabled={isSaving} onClick={() => handleToggleActive(product)}>
                        {product.active === false ? "Oculto" : "Activo"}
                      </button>

                      <button type="button" className={`admin-toggle-btn ${product.featured ? "is-on" : "is-off"}`} disabled={isSaving} onClick={() => handleToggleFeatured(product)}>
                        {product.featured ? "⭐ Destacado" : "☆ Destacar"}
                      </button>

                      <button type="button" className="admin-ghost-btn" disabled={isSaving} onClick={() => handleDuplicate(product)}>
                        Duplicar
                      </button>
                    </div>
                  </div>

                  <div className="admin-list-side">
                    <button
                      type="button"
                      className="admin-btn edit"
                      disabled={isSaving}
                      onClick={() => { setEditing(product); setShowForm(true); window.scrollTo(0, 0); }}
                    >
                      Editar
                    </button>

                    {isConfirmingDelete ? (
                      <div className="admin-confirm-delete">
                        <span>¿Borrar?</span>
                        <button type="button" className="admin-btn delete" onClick={() => handleDelete(product)}>Sí</button>
                        <button type="button" className="admin-ghost-btn" onClick={() => setConfirmDeleteId(null)}>No</button>
                      </div>
                    ) : (
                      <button type="button" className="admin-btn delete" disabled={isSaving} onClick={() => setConfirmDeleteId(product.id)}>
                        Borrar
                      </button>
                    )}
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
