import { NavLink } from "react-router-dom";
import { useList } from "../context/ListContext";

export default function Header() {
  const { count } = useList();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand" aria-label="Ir al inicio">
          <span className="brand-small">Catálogo skincare</span>
          <span className="brand-big">Kosmos</span>
          <span className="brand-sub">Stock limitado · 2026</span>
        </NavLink>

        <div className="topbar-right">
          <div className="contact">
            <span className="contact-title">Reservas por WhatsApp</span>
            <span className="contact-sub">Entrega inmediata · Necochea</span>
          </div>

          <NavLink
            to="/mi-lista"
            className={({ isActive }) =>
              isActive
                ? "header-cart header-cart-on"
                : "header-cart"
            }
          >
            Mi lista
            {count > 0 ? <span className="nav-badge">{count}</span> : null}
          </NavLink>
        </div>
      </div>

      <nav className="topbar-nav" aria-label="Navegación principal">
        <div className="nav-inner">
          <div className="nav-left">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "navlink navlink-on" : "navlink"
              }
            >
              Productos
            </NavLink>

            <NavLink
              to="/sobre-la-marca"
              className={({ isActive }) =>
                isActive ? "navlink navlink-on" : "navlink"
              }
            >
              Sobre la marca
            </NavLink>

            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                isActive ? "navlink navlink-on" : "navlink"
              }
            >
              Contacto
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}