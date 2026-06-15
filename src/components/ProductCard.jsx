import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useListRead, useListWrite } from "../context/ListContext";
import {
  formatARS,
  getPaymentConfig,
  getProductDiscountPrice,
  getPaymentPrice,
} from "../utils/pricing";

function getCardMeta(product) {
  if (product.highlight) return product.highlight;
  if (product.benefit) return product.benefit;
  if (product.mainIngredient) return `Activo clave: ${product.mainIngredient}`;
  if (product.skinType) return `Ideal para: ${product.skinType}`;
  return null;
}

function ProductCard({ product, onOpen }) {
  const navigate = useNavigate();
  const { getQty }               = useListRead();
  const { addToList, removeOne } = useListWrite();

  if (!product) return null;

  const qty = getQty(product.id);
  // onOpen can be a setter (receives product) or a zero-arg callback
  const canOpen = typeof onOpen === "function";

  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;
  const isLowStock =
    !isOutOfStock &&
    Number(product.stockQty ?? 0) <= Number(product.lowStockThreshold ?? 0);

  const basePrice = Number(product.price || 0);
  const discountPct = Number(product.discount || 0);
  const finalPrice = getProductDiscountPrice(product);
  const hasDiscount = discountPct > 0 && finalPrice < basePrice;

  const paymentConfig = getPaymentConfig(product);
  const transferPrice = getPaymentPrice(product, "transfer");
  const transferDiscount = Number(paymentConfig.transfer.discountPct || 0);

  const hasTransferDiscount =
    paymentConfig.transfer.enabled &&
    paymentConfig.transfer.applyDiscount &&
    transferDiscount > 0 &&
    transferPrice < finalPrice;

  const cardMeta = getCardMeta(product);
  const isBestseller = product.bestseller === true || Number(product.soldQty || 0) > 0;

  function handleKeyOpen(e) {
    if (!canOpen) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(product);
    }
  }

  return (
    <article className={`card ${isOutOfStock ? "card-out" : ""}`}>
      <div
        className={`card-image ${!product.image ? "card-image--empty" : ""}`}
        onClick={canOpen ? () => onOpen(product) : undefined}
        onKeyDown={handleKeyOpen}
        role={canOpen ? "button" : undefined}
        tabIndex={canOpen ? 0 : undefined}
        aria-label={canOpen ? `Ver ${product.title}` : undefined}
      >
        {!isOutOfStock && (isBestseller || hasDiscount || hasTransferDiscount) ? (
          <div className="badges">
            {isBestseller ? (
              <span className="badge-main">Bestseller</span>
            ) : null}

            {hasDiscount ? (
              <span className="badge-main">-{discountPct}%</span>
            ) : null}

            {hasTransferDiscount ? (
              <span className="badge-sub">Transferencia -{transferDiscount}%</span>
            ) : null}
          </div>
        ) : null}

        {isOutOfStock ? (
          <div className="stock-badge stock-badge-out">Sin stock</div>
        ) : null}

        {isLowStock ? (
          <div className="stock-badge stock-badge-low">Últimas unidades</div>
        ) : null}

        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : null}

        {canOpen ? (
          <div className="card-quick-view">
            <span>Ver detalle</span>
          </div>
        ) : null}
      </div>

      <div className="card-content">
        <h3
          className="card-title"
          onClick={canOpen ? () => onOpen(product) : undefined}
        >
          {product.title}
        </h3>

        <div className="card-body">
          <p className="card-desc">{product.desc}</p>
          {cardMeta ? <p className="card-meta">{cardMeta}</p> : null}

          {isBestseller ? (
            <p className="card-meta">
              {Number(product.soldQty || 0)} vendidos recientemente
            </p>
          ) : null}
        </div>
      </div>

      <div className="card-foot">
        <div className="priceblock">
          <div className="priceblock-top">
            <div className="card-price">${formatARS(finalPrice)}</div>

            {hasDiscount ? (
              <span className="card-discount-chip">{discountPct}% OFF</span>
            ) : null}
          </div>

          {hasDiscount ? (
            <div className="card-price-off">
              Antes <span className="card-old-price">${formatARS(basePrice)}</span>
            </div>
          ) : (
            <div className="card-price-off">Precio lista</div>
          )}

          {hasTransferDiscount ? (
            <div className="card-transfer-price">
              Transferencia <strong>${formatARS(transferPrice)}</strong>
              {paymentConfig.transfer.showDiscountLabel ? (
                <span>{transferDiscount}% OFF</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="card-actions">
          {isOutOfStock ? (
            <button
              className="btn btn-small btn-disabled card-main-btn"
              type="button"
              disabled
            >
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
                className="btn btn-outline btn-small card-list-btn"
                type="button"
                onClick={() => navigate("/mi-lista")}
                aria-label="Ver mi lista"
                title="Ver mi lista"
              >
                Ver lista
              </button>
            </>
          ) : (
            <button
              className="btn btn-small card-main-btn"
              type="button"
              onClick={() => addToList(product)}
              aria-label={`Agregar ${product.title}`}
            >
              Agregar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
