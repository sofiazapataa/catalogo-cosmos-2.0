import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="footer-logo">Kosmos</div>
          <p className="footer-tagline">
            Skincare coreano vegano · Rutinas simples · Necochea
          </p>
          <p className="footer-made">Hecho con ♥ en Necochea, Argentina</p>
        </div>

        <nav className="footer-col" aria-label="Navegación del footer">
          <div className="footer-col-title">Explorar</div>
          <Link to="/" className="footer-link">Catálogo</Link>
          <Link to="/sobre-la-marca" className="footer-link">Sobre la marca</Link>
          <Link to="/mi-lista" className="footer-link">Mi lista</Link>
          <Link to="/contacto" className="footer-link">Contacto</Link>
        </nav>

        <div className="footer-col">
          <div className="footer-col-title">Contacto</div>
          <a
            href="https://wa.me/542262357366"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp (2262) 357366
          </a>
          <a href="mailto:sofizapata2004@gmail.com" className="footer-link">
            sofizapata2004@gmail.com
          </a>
          <p className="footer-sub footer-hours">
            Respuesta por WhatsApp · Lun–Sáb
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Kosmos · Todos los derechos reservados</span>
      </div>
    </footer>
  );
}
