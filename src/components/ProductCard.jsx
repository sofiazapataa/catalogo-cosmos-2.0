import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../context/ListContext";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

export default function ProductCard({ product, onOpen }) {
  const navigate = useNavigate();
  const { addToList, removeOne, getQty } = useList();

  if (!product) return null;

  const qty = getQty(product.id);
  const canOpen = typeof onOpen === "function";

  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;
  const isLowStock =
    !isOutOfStock &&
    Number(product.stockQty ?? 0) <= Number(product.lowStockThreshold ?? 0);

  const transferEnabled = product.transferEnabled !== false;
  const transferDiscountPct = Number(product.transferDiscountPct ?? 5);
  const hasTransferDiscount = transferEnabled && transferDiscountPct > 0;

  const transferPrice = useMemo(() => {
    const p = Number(product.price || 0);
    if (!hasTransferDiscount) return p;
    return Math.round(p * (1 - transferDiscountPct / 100));
  }, [product.price, hasTransferDiscount, transferDiscountPct]);

  function handleKeyOpen(e) {
    if (!canOpen) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }

  return (
    <article className={`card ${isOutOfStock ? "card-out" : ""}`}>
      <div
        className={`card-image ${!product.image ? "card-image--empty" : ""}`}
        onClick={canOpen ? onOpen : undefined}
        onKeyDown={handleKeyOpen}
        role={canOpen ? "button" : undefined}
        tabIndex={canOpen ? 0 : undefined}
        aria-label={canOpen ? `Ver ${product.title}` : undefined}
      >
        {isOutOfStock ? (
          <div className="stock-badge stock-badge-out">Sin stock</div>
        ) : product.discount > 0 ? (
          <div className="badge">-{product.discount}%</div>
        ) : null}

        {isLowStock ? (
          <div className="stock-badge stock-badge-low">Últimas unidades</div>
        ) : null}

        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : null}
      </div>

      <h3
        className="card-title"
        onClick={canOpen ? onOpen : undefined}
        onKeyDown={handleKeyOpen}
        role={canOpen ? "button" : undefined}
        tabIndex={canOpen ? 0 : undefined}
        aria-label={canOpen ? `Ver ${product.title}` : undefined}
        style={canOpen ? { cursor: "pointer" } : undefined}
      >
        {product.title}
      </h3>

      <div className="card-body">
        <p className="card-desc">{product.desc}</p>
      </div>

      <div className="card-foot">
        <div className="priceblock">
          <div className="card-price">${formatARS(product.price)}</div>

          {hasTransferDiscount ? (
            <div className="card-price-off">
              Transferencia: <strong>${formatARS(transferPrice)}</strong>{" "}
              <span className="off-tag">({transferDiscountPct}% OFF)</span>
            </div>
          ) : null}
        </div>

        <div className="card-actions">
          {isOutOfStock ? (
            <button className="btn btn-small btn-disabled" type="button" disabled>
              Sin stock
            </button>
          ) : qty > 0 ? (
            <>
              <div className="qtybar">
                <button
                  className="iconbtn"
                  type="button"
                  onClick={() => removeOne(product.id)}
                  aria-label="Restar uno"
                  title="Restar uno"
                >
                  −
                </button>

                <span className="qtypill">x{qty}</span>

                <button
                  className="iconbtn"
                  type="button"
                  onClick={() => addToList(product)}
                  aria-label="Sumar uno"
                  title="Sumar uno"
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-outline btn-small"
                type="button"
                onClick={() => navigate("/mi-lista")}
                title="Ver mi lista"
              >
                Ver lista
              </button>
            </>
          ) : (
            <button
              className="btn btn-small"
              type="button"
              onClick={() => addToList(product)}
            >
              Agregar a la lista
            </button>
          )}
        </div>
      </div>
    </article>
  );
}