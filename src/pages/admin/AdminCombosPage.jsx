import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminProductForm from "../../components/AdminProductForm";
import { resolveImage } from "../../utils/imageMap";
import {
  getProducts,
  saveCombo,
  deleteCombo,
} from "../../services/productsServices";

export default function AdminCombosPage() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getProducts();
      setItems(data.combos || []);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los combos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(combo) {
    try {
      setSaving(true);
      await saveCombo(combo);
      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el combo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, title) {
    const ok = window.confirm(`¿Querés borrar "${title}"?`);
    if (!ok) return;

    try {
      await deleteCombo(id);
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
              <h2 className="page-title">Admin · Combos</h2>
              <p className="page-lead">Crear, editar y borrar combos del catálogo.</p>
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
                Nuevo combo
              </button>

              <Link to="/admin" className="btn btn-outline">
                Volver al panel
              </Link>
            </div>
          </div>

          {showForm ? (
            <div style={{ marginBottom: 16 }}>
              <AdminProductForm
                mode="combo"
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

          {loading ? <p>Cargando combos…</p> : null}

          <section className="admin-list">
            {items.map((combo) => {
              const preview = resolveImage(combo.imageKey);

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
                        {combo.active ? "Activo" : "Oculto"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-list-side">
                    <button
                      className="btn btn-small"
                      type="button"
                      onClick={() => {
                        setEditing(combo);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-outline btn-small"
                      type="button"
                      onClick={() => handleDelete(combo.id, combo.title)}
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