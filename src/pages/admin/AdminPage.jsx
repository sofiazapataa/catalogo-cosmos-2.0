import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminLogoutButton from "../../components/AdminLogoutButton";

export default function AdminPage() {
  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2 className="page-title">Panel Admin</h2>
              <p className="page-lead">
                Gestioná productos, combos y stock del catálogo.
              </p>
            </div>

            <div className="admin-topbar-actions">
              <AdminLogoutButton />
            </div>
          </div>

          <section className="admin-grid">
            <Link to="/admin/productos" className="admin-card">
              <h3>Productos</h3>
              <p>Administrar productos del catálogo.</p>
            </Link>

            <Link to="/admin/combos" className="admin-card">
              <h3>Combos</h3>
              <p>Administrar combos y promociones.</p>
            </Link>
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}