import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminLogoutButton from "../../components/AdminLogoutButton";
import {
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  toggleTestimonial,
} from "../../services/testimonialsService";

const EMPTY_FORM = { author: "", text: "" };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setItems(data);
    } catch {
      setError("No se pudieron cargar los testimonios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ author: item.author, text: item.text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) {
      setError("Completá el nombre y el texto.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveTestimonial({ id: editingId || undefined, ...form });
      cancelEdit();
      await load();
    } catch {
      setError("No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTestimonial(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setError("No se pudo eliminar.");
      setConfirmDeleteId(null);
    }
  }

  async function handleToggle(item) {
    try {
      await toggleTestimonial(item.id, !item.active);
      setItems((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, active: !t.active } : t))
      );
    } catch {
      setError("No se pudo actualizar.");
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
              <h1>Testimonios</h1>
              <p className="page-lead">
                Administrá las reseñas que aparecen en la página principal.
              </p>
            </div>
            <AdminLogoutButton />
          </div>

          <div className="admin-form-panel">
            <h2 className="admin-section-title">
              {editingId ? "Editar testimonio" : "Nuevo testimonio"}
            </h2>

            <form onSubmit={handleSubmit} className="admin-testimonial-form">
              <div className="admin-field">
                <label>Nombre de la clienta</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="Ej: Valentina G."
                  maxLength={80}
                />
              </div>

              <div className="admin-field">
                <label>Texto del testimonio</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Ej: Me encantó el tónico, mi piel quedó increíble…"
                  rows={4}
                  maxLength={400}
                />
              </div>

              {error ? <p className="admin-error">{error}</p> : null}

              <div className="admin-form-actions">
                <button className="admin-action-btn" type="submit" disabled={saving}>
                  {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Agregar testimonio"}
                </button>
                {editingId ? (
                  <button
                    className="admin-action-btn admin-action-btn-secondary"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          {loading ? (
            <p style={{ opacity: 0.7 }}>Cargando testimonios…</p>
          ) : items.length === 0 ? (
            <div className="admin-empty">
              <p>Todavía no hay testimonios. Agregá el primero.</p>
            </div>
          ) : (
            <div className="admin-testimonials-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`admin-testimonial-row ${!item.active ? "admin-testimonial-inactive" : ""}`}
                >
                  <div className="admin-testimonial-content">
                    <strong className="admin-testimonial-author">{item.author}</strong>
                    <p className="admin-testimonial-text">"{item.text}"</p>
                  </div>

                  <div className="admin-testimonial-actions">
                    <button
                      className={`admin-chip ${item.active ? "admin-chip-active" : "admin-chip-inactive"}`}
                      type="button"
                      onClick={() => handleToggle(item)}
                      title={item.active ? "Ocultar" : "Mostrar"}
                    >
                      {item.active ? "Visible" : "Oculto"}
                    </button>

                    <button
                      className="admin-action-btn admin-action-btn-secondary"
                      type="button"
                      onClick={() => startEdit(item)}
                    >
                      Editar
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="admin-confirm-delete">
                        <span>¿Eliminar?</span>
                        <button className="admin-action-btn admin-action-btn-danger" type="button" onClick={() => handleDelete(item.id)}>Sí</button>
                        <button className="admin-ghost-btn" type="button" onClick={() => setConfirmDeleteId(null)}>No</button>
                      </div>
                    ) : (
                      <button
                        className="admin-action-btn admin-action-btn-danger"
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
