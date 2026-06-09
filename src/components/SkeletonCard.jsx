export default function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="sk sk-image" />
      <div className="skeleton-body">
        <div className="sk sk-title" />
        <div className="sk sk-line" />
        <div className="sk sk-line sk-short" />
      </div>
      <div className="skeleton-foot">
        <div className="sk sk-price" />
        <div className="sk sk-btn" />
      </div>
    </div>
  );
}
