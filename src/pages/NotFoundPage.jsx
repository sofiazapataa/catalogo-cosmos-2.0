import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageTitle } from "../hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Página no encontrada");
  return (
    <>
      <Header />
      <main id="main-content" className="container not-found-page">
        <div className="not-found-content">
          <div className="not-found-kicker">Error 404</div>
          <h1 className="not-found-title">Esta página no existe</h1>
          <p className="not-found-desc">
            El link que seguiste puede estar roto o la página fue eliminada.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn">Ver catálogo</Link>
            <Link to="/contacto" className="btn btn-outline">Contacto</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
