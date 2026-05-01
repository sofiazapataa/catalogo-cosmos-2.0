export default function CatalogControls({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  onlyDiscount,
  setOnlyDiscount,
  onlyStock,
  setOnlyStock,
}) {
  return (
    <div className="controls">
      <input
        className="input"
        type="search"
        placeholder="Buscar productos…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <select
        className="select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="all">Todos</option>
        <option value="combos">Combos</option>
        <option value="cremas">Cremas</option>
        <option value="serums">Serums</option>
        <option value="limpieza">Limpieza</option>
        <option value="tonicos">Tónicos</option>
      </select>

      <select
        className="select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="featured">Recomendados</option>
        <option value="price_asc">Menor precio</option>
        <option value="price_desc">Mayor precio</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
        <option value="discount_desc">Más descuento</option>
      </select>

      <label className="filter-check">
        <input
          type="checkbox"
          checked={onlyDiscount}
          onChange={(e) => setOnlyDiscount(e.target.checked)}
        />
        <span>Ofertas</span>
      </label>

      <label className="filter-check">
        <input
          type="checkbox"
          checked={onlyStock}
          onChange={(e) => setOnlyStock(e.target.checked)}
        />
        <span>En stock</span>
      </label>
    </div>
  );
}