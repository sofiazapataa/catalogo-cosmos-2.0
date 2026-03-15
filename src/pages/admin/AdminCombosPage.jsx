import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


export default function AdminCombosPage() {
  return (
    <>
      <Header />

      <main className="container">
        <div className="admin-topbar">
          <div>
            <h2 className="page-title">Admin · Combos</h2>
            <p className="page-lead">
              Acá vas a ver y organizar los combos del catálogo.
            </p>
          </div>

          <Link to="/admin" className="btn btn-outline">
            Volver al panel
          </Link>
        </div>

        <section className="admin-list">
          {combos.map((combo) => (
            <article key={combo.id} className="admin-list-item">
              <div className="admin-list-main">
                <h3>{combo.title}</h3>
                <p>{combo.desc}</p>
                <div className="admin-meta">
                  <span className="admin-chip">combo</span>
                  {combo.discount > 0 ? (
                    <span className="admin-chip admin-chip-soft">-{combo.discount}%</span>
                  ) : null}
                </div>
              </div>

              <div className="admin-list-side">
                <strong>${Number(combo.price || 0).toLocaleString("es-AR")}</strong>
                <button className="btn btn-small" type="button">
                  Editar
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}