export default function SectionHeader({
  title,
  count,
  shown,
  onToggle,
  canToggle,
}) {
  return (
    <div className="section-head section-head-pro">
      <div>
        <span className="section-kicker">Selección Kosmos</span>
        <h2 className="section-title">{title}</h2>
      </div>

      <div className="section-meta">
        <span className="pill section-pill">{count} productos</span>

        {canToggle ? (
          <button className="section-toggle" type="button" onClick={onToggle}>
            {shown ? "Ver menos" : "Ver más"}
          </button>
        ) : null}
      </div>
    </div>
  );
}