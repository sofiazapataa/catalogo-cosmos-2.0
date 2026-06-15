import { Component } from "react";

/**
 * ErrorBoundary — captura errores de render en el árbol de componentes
 * e impide que la app entera se rompa.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <ComponenteQuePuedeFallar />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción conectar a un servicio de error tracking (Sentry, etc.)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-inner">
            <span className="error-boundary-icon">⚠️</span>
            <h2>Algo salió mal</h2>
            <p>
              Ocurrió un error inesperado. Podés intentar recargar la página o
              volver al catálogo.
            </p>
            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleReset}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
