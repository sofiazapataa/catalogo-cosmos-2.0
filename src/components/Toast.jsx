import { useListRead } from "../context/ListContext";

export default function Toast() {
  const { toast } = useListRead();

  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span className="toast-icon" aria-hidden="true">✓</span>
      {toast.message}
    </div>
  );
}
