import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminProductForm from "../../components/AdminProductForm";
import { resolveImage } from "../../utils/imageMap";
import {
  getProducts,
  saveCombo,
  deleteCombo,
  updateComboPartial,
  duplicateCombo,
} from "../../services/productsServices";

export default function AdminCombosPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [savingQuickId, setSavingQuickId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");

  async function loadData() {
    const data = await getProducts();
    setItems(data.combos || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    let list = [...items];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      list = list.filter((combo) =>
        `${combo.title || ""} ${combo.desc || ""} ${combo.type || ""}`
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }

    if (filter === "active") {
      list = list.filter((combo) => combo.active !== false);
    }

    if (filter === "hidden") {
      list = list.filter((combo) => combo.active === false);
    }

    if (sort === "price") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "name") {
      list.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    }

    return list;
  }, [items, search, filter, sort]);

  async function handleQuickUpdate(comboId, partialData) {
    try {
      setSavingQuickId(comboId);
      await updateComboPartial(comboId, partialData);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el combo.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleToggleActive(combo) {
    await handleQuickUpdate(combo.id, {
      active: combo.active === false,
    });
  }

  async function handleDuplicate(combo) {
    try {
      setSavingQuickId(combo.id);
      await duplicateCombo(combo);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo duplicar el combo.");
    } finally {
      setSavingQuickId(null);
    }
  }

  async function handleDelete(combo) {
    const ok = window.confirm(`¿Querés borrar "${combo.title}"?`);
    if (!ok) return;

    try {
      await deleteCombo(combo.id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo borrar el combo.");
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2>Combos</h2>
              <p>Gestioná promociones, rutinas y combos del catálogo.</p>
            </div>

            <input
              placeholder="Buscar combo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="admin-filters">
              <button
                type="button"
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>

              <button
                type="button"
                className={filter === "active" ? "active" : ""}
                onClick={() => setFilter("active")}
              >
                Activos
              </button>

              <button
                type="button"
                className={filter === "hidden" ? "active" : ""}
                onClick={() => setFilter("hidden")}
              >
                Ocultos
              </button>
            </div>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
            </select>

            <div className="admin-topbar-actions">
              <Link
                to="/admin"
                className="admin-action-btn admin-action-btn-secondary"
              >
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
                + Nuevo combo
              </button>
            </div>
          </div>

          {showForm ? (
            <AdminProductForm
              mode="combo"
              initialData={editing}
              onSave={async (combo) => {
                await saveCombo(combo);
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
            {filteredItems.map((combo) => {
              const preview = resolveImage(combo.imageKey);
              const isSaving = savingQuickId === combo.id;

              return (
                <article key={combo.id} className="admin-list-item">
                  {preview ? (
                    <img
                      src={preview}
                      alt={combo.title}
                      className="admin-list-image"
                    />
                  ) : (
                    <div className="admin-list-image admin-list-image-empty">
                      Sin foto
                    </div>
                  )}

                  <div className="admin-list-main">
                    <h3>{combo.title}</h3>
                    <p>{combo.desc}</p>

                    <div className="admin-meta">
                      <span className="admin-chip">combo</span>

                      <span className="admin-chip admin-chip-soft">
                        ${Number(combo.price || 0).toLocaleString("es-AR")}
                      </span>

                      <span className="admin-chip admin-chip-soft">
                        {combo.active === false ? "Oculto" : "Activo"}
                      </span>
                    </div>

                    <div className="admin-quick-actions">
                      <button
                        type="button"
                        className={`admin-toggle-btn ${
                          combo.active === false ? "is-off" : "is-on"
                        }`}
                        disabled={isSaving}
                        onClick={() => handleToggleActive(combo)}
                      >
                        {combo.active === false ? "Oculto" : "Activo"}
                      </button>

                      <button
                        type="button"
                        className="admin-ghost-btn"
                        disabled={isSaving}
                        onClick={() => handleDuplicate(combo)}
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
                        setEditing(combo);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="admin-btn delete"
                      disabled={isSaving}
                      onClick={() => handleDelete(combo)}
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