import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


export default function AdminProductsPage() {
  return (
    <>
      <Header />

      <main className="container">
        <div className="admin-topbar">
          <div>
            <h2 className="page-title">Admin · Productos</h2>
            <p className="page-lead">
              Acá vas a ver todos los productos cargados en tu catálogo.
            </p>
          </div>

          <Link to="/admin" className="btn btn-outline">
            Volver al panel
          </Link>
        </div>

        <section className="admin-list">
          {stock.map((product) => (
            <article key={product.id} className="admin-list-item">
              <div className="admin-list-main">
                <h3>{product.title}</h3>
                <p>{product.desc}</p>
                <div className="admin-meta">
                  <span className="admin-chip">{product.type}</span>
                  <span className="admin-chip admin-chip-soft">{product.category}</span>
                </div>
              </div>

              <div className="admin-list-side">
                <strong>${Number(product.price || 0).toLocaleString("es-AR")}</strong>
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