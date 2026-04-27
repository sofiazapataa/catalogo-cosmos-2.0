import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";

export default function Header() {
  const { count } = useList();

  return (
    <header className="topbar">
      {/* Parte superior */}
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-small">Catálogo</div>
          <div className="brand-big">Kosmos</div>
          <div className="brand-sub">Stock limitado - 2026</div>
        </div>

        <div className="topbar-right">
          <div className="contact">
            <div className="contact-title">Reservas por mensaje directo</div>
            <div className="contact-sub">Entrega inmediata</div>
            <div className="contact-sub">(2262) 357366</div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="topbar-nav" aria-label="Navegación principal">
        <div className="nav-inner">
          <div className="nav-left">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "navlink navlink-on" : "navlink")}
            >
              Productos
            </NavLink>

            <NavLink
              to="/sobre-la-marca"
              className={({ isActive }) => (isActive ? "navlink navlink-on" : "navlink")}
            >
              Sobre la marca
            </NavLink>

            <NavLink
              to="/contacto"
              className={({ isActive }) => (isActive ? "navlink navlink-on" : "navlink")}
            >
              Contacto
            </NavLink>

            <NavLink
              to="/mi-lista"
              className={({ isActive }) =>
                isActive ? "navlink navlink-on navlink-cart" : "navlink navlink-cart"
              }
            >
              Mi Lista
              {count > 0 ? <span className="nav-badge">{count}</span> : null}
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}