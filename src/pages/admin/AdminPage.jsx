import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AdminPage() {
  return (
    <>
      <Header />

      <main className="container">
        <section className="page-hero">
          <div>
            <h2 className="page-title">Panel Admin</h2>
            <p className="page-lead">
              Desde acá vas a poder administrar productos, combos y más, sin tocar el catálogo público.
            </p>

            <div className="page-badges">
              <span className="page-badge">Productos</span>
              <span className="page-badge">Combos</span>
              <span className="page-badge">Stock</span>
            </div>
          </div>

          <div className="page-heroCard">
            <div className="page-heroCardTitle">Fase 1</div>
            <p className="page-heroCardText">
              Vamos a empezar con una estructura visual simple y ordenada.
            </p>
            <div className="page-heroCardTip">
              Después la conectamos con datos reales y edición.
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="admin-grid">
            <Link to="/admin/productos" className="admin-card">
              <h3>Productos</h3>
              <p>Ver y organizar productos del catálogo.</p>
            </Link>

            <Link to="/admin/combos" className="admin-card">
              <h3>Combos</h3>
              <p>Ver y organizar combos y promociones.</p>
            </Link>

            <div className="admin-card admin-card-disabled">
              <h3>Pedidos</h3>
              <p>Lo vamos a sumar en una siguiente fase.</p>
            </div>

            <div className="admin-card admin-card-disabled">
              <h3>Configuración</h3>
              <p>Más adelante: textos, contacto y banners.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}