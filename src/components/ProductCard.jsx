import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../context/ListContext";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function getPaymentConfig(product) {
  const defaults = {
    transfer: {
      enabled: true,
      discountPct: 5,
      label: "Transferencia",
      applyDiscount: true,
      showDiscountLabel: true,
    },
    cash: {
      enabled: true,
      discountPct: 0,
      label: "Efectivo",
      applyDiscount: true,
      showDiscountLabel: true,
    },
    other: {
      enabled: true,
      discountPct: 0,
      label: "Otro medio",
      applyDiscount: true,
      showDiscountLabel: true,
    },
  };

  const legacyTransferEnabled = product.transferEnabled;
  const legacyTransferDiscountPct = product.transferDiscountPct;

  return {
    ...defaults,
    ...(product.paymentOptions || {}),
    transfer: {
      ...defaults.transfer,
      ...(product.paymentOptions?.transfer || {}),
      enabled:
        product.paymentOptions?.transfer?.enabled ??
        (legacyTransferEnabled !== undefined
          ? legacyTransferEnabled
          : defaults.transfer.enabled),
      discountPct:
        product.paymentOptions?.transfer?.discountPct ??
        (legacyTransferDiscountPct !== undefined
          ? Number(legacyTransferDiscountPct)
          : defaults.transfer.discountPct),
    },
    cash: {
      ...defaults.cash,
      ...(product.paymentOptions?.cash || {}),
    },
    other: {
      ...defaults.other,
      ...(product.paymentOptions?.other || {}),
    },
  };
}

function getCardMeta(product) {
  if (product.highlight) return product.highlight;
  if (product.benefit) return product.benefit;
  if (product.mainIngredient)
    return `Activo clave: ${product.mainIngredient}`;
  if (product.skinType) return `Ideal para: ${product.skinType}`;
  return null;
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

  const paymentConfig = getPaymentConfig(product);
  const transferEnabled = Boolean(paymentConfig.transfer.enabled);
  const transferDiscountPct = Number(paymentConfig.transfer.discountPct || 0);
  const applyTransferDiscount = Boolean(paymentConfig.transfer.applyDiscount);
  const showTransferDiscountLabel = Boolean(
    paymentConfig.transfer.showDiscountLabel
  );

  const basePrice = Number(product.price || 0);

  const transferPrice = useMemo(() => {
    if (!transferEnabled || !applyTransferDiscount || transferDiscountPct <= 0) {
      return basePrice;
    }

    return Math.round(basePrice * (1 - transferDiscountPct / 100));
  }, [basePrice, transferEnabled, applyTransferDiscount, transferDiscountPct]);

  const hasTransferDiscount =
    transferEnabled &&
    applyTransferDiscount &&
    transferDiscountPct > 0 &&
    transferPrice < basePrice;

  const finalPrice = hasTransferDiscount ? transferPrice : basePrice;
  const cardMeta = getCardMeta(product);

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
        ) : hasTransferDiscount ? (
          <div className="badge">-{transferDiscountPct}%</div>
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
        {cardMeta ? <p className="card-meta">{cardMeta}</p> : null}
      </div>

      <div className="card-foot">
        <div className="priceblock">
          <div className="card-price">${formatARS(finalPrice)}</div>

          {hasTransferDiscount ? (
            <div className="card-price-off">
              <span style={{ textDecoration: "line-through", opacity: 0.8 }}>
                ${formatARS(basePrice)}
              </span>{" "}
              · Transferencia{" "}
              {showTransferDiscountLabel ? (
                <span className="off-tag">({transferDiscountPct}% OFF)</span>
              ) : null}
            </div>
          ) : (
            <div className="card-price-off">Precio final</div>
          )}
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