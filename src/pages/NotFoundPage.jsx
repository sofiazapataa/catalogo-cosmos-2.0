import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="container not-found-page">
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
