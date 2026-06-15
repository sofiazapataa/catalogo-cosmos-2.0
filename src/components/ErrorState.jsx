export default function ErrorState({ onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state-msg">
        No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.
      </p>
      {onRetry && (
        <button className="btn btn-outline btn-small" type="button" onClick={onRetry}>
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
