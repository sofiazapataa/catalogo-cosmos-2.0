import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../context/ListContext";

function formatARS(n) {
  return Number(n || 0).toLocaleString("es-AR");
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

  return {
    ...defaults,
    ...(product.paymentOptions || {}),
    transfer: {
      ...defaults.transfer,
      ...(product.paymentOptions?.transfer || {}),
      enabled:
        product.paymentOptions?.transfer?.enabled ??
        (product.transferEnabled !== undefined
          ? product.transferEnabled
          : defaults.transfer.enabled),
      discountPct:
        product.paymentOptions?.transfer?.discountPct ??
        (product.transferDiscountPct !== undefined
          ? Number(product.transferDiscountPct)
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

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToList, removeOne, getQty } = useList();

  if (!product) return null;

  const qty = getQty(product.id);
  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;

  const paymentConfig = getPaymentConfig(product);
  const transferEnabled = Boolean(paymentConfig.transfer.enabled);
  const transferDiscountPct = Number(paymentConfig.transfer.discountPct || 0);
  const applyTransferDiscount = Boolean(paymentConfig.transfer.applyDiscount);
  const showTransferDiscountLabel = Boolean(
    paymentConfig.transfer.showDiscountLabel
  );

  const basePrice = Number(product.price || 0);

  const images = useMemo(() => {
    const merged = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    return [...new Set(merged)];
  }, [product]);

  const [idx, setIdx] = useState(0);

  const transferPrice = useMemo(() => {
    if (!transferEnabled || !applyTransferDiscount || transferDiscountPct <= 0) {
      return basePrice;
    }
    return Math.round(basePrice * (1 - transferDiscountPct / 100));
  }, [basePrice, transferEnabled, applyTransferDiscount, transferDiscountPct]);

  const shouldShowTransferLine =
    transferEnabled &&
    (transferPrice < basePrice ||
      (showTransferDiscountLabel && transferDiscountPct > 0));

  function prev() {
    setIdx((v) => (v - 1 + images.length) % images.length);
  }

  function next() {
    setIdx((v) => (v + 1) % images.length);
  }

  useEffect(() => {
    setIdx(0);
  }, [product.id]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (images.length > 1 && e.key === "ArrowLeft") prev();
      if (images.length > 1 && e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function goToList() {
    onClose();
    navigate("/mi-lista");
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="modal-media">
          {images.length > 0 ? (
            <>
              <img className="modal-img" src={images[idx]} alt={product.title} />

              {isOutOfStock ? (
                <div className="stock-badge stock-badge-out">Sin stock</div>
              ) : null}

              {images.length > 1 ? (
                <>
                  <button
                    className="modal-nav modal-nav-left"
                    type="button"
                    onClick={prev}
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>

                  <button
                    className="modal-nav modal-nav-right"
                    type="button"
                    onClick={next}
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>

                  <div className="modal-dots">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`dot ${i === idx ? "dot-on" : ""}`}
                        onClick={() => setIdx(i)}
                        aria-label={`Ver foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="modal-img-empty">
              {isOutOfStock ? (
                <div className="stock-badge stock-badge-out">Sin stock</div>
              ) : null}
              Sin imagen
            </div>
          )}
        </div>

        <div className="modal-info">
          <h3 className="modal-title">{product.title}</h3>
          <p className="modal-desc">{product.desc}</p>

          <div className="modal-pricebox">
            <div className="modal-price-main">${formatARS(basePrice)}</div>

            {shouldShowTransferLine ? (
              <div className="modal-price-transfer">
                Transferencia: <strong>${formatARS(transferPrice)}</strong>{" "}
                {showTransferDiscountLabel && transferDiscountPct > 0 ? (
                  <span>({transferDiscountPct}% OFF)</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {product.skinType ? (
            <div className="modal-chip">Ideal para: {product.skinType}</div>
          ) : null}

          {Array.isArray(product.benefits) && product.benefits.length > 0 ? (
            <div className="modal-section">
              <h4>Beneficios</h4>
              <ul className="modal-list">
                {product.benefits.map((benefit, index) => (
                  <li key={`${product.id}-benefit-${index}`}>{benefit}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.howToUse ? (
            <div className="modal-section">
              <h4>Cómo usar</h4>
              <p>{product.howToUse}</p>
            </div>
          ) : null}

          {product.details ? (
            <div className="modal-section">
              <h4>Detalles</h4>
              <p>{product.details}</p>
            </div>
          ) : null}

          <div className="modal-actions">
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
                  onClick={goToList}
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
      </div>
    </div>
  );
}