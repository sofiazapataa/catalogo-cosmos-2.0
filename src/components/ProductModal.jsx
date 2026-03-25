import { useEffect, useMemo, useState } from "react";
import { useList } from "../context/ListContext";

function formatARS(n) {
  return Number(n || 0).toLocaleString("es-AR");
}

export default function ProductModal({ product, onClose }) {
  const { addToList, removeOne, getQty } = useList();

  if (!product) return null;

  const qty = getQty(product.id);
  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;

  const transferEnabled = product.transferEnabled !== false;
  const transferDiscountPct = Number(product.transferDiscountPct ?? 5);
  const hasTransferDiscount = transferEnabled && transferDiscountPct > 0;

  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return [];
  }, [product]);

  const [idx, setIdx] = useState(0);

  const transferPrice = useMemo(() => {
    const p = Number(product.price || 0);
    if (!hasTransferDiscount) return p;
    return Math.round(p * (1 - transferDiscountPct / 100));
  }, [product.price, hasTransferDiscount, transferDiscountPct]);

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
                  >
                    ‹
                  </button>

                  <button
                    className="modal-nav modal-nav-right"
                    type="button"
                    onClick={next}
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
            <div className="modal-price-main">${formatARS(product.price)}</div>

            {hasTransferDiscount ? (
              <div className="modal-price-transfer">
                Transferencia: <strong>${formatARS(transferPrice)}</strong>{" "}
                ({transferDiscountPct}% OFF)
              </div>
            ) : null}
          </div>

          {product.skinType ? (
            <div className="modal-chip">
              <strong>Tipo de piel:</strong> {product.skinType}
            </div>
          ) : null}

          {product.benefits?.length ? (
            <div className="modal-block">
              <h4>Beneficios</h4>
              <ul>
                {product.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.howToUse ? (
            <div className="modal-block">
              <h4>Cómo usar</h4>
              <p>{product.howToUse}</p>
            </div>
          ) : null}

          {product.details ? (
            <div className="modal-block">
              <h4>Info</h4>
              <p>{product.details}</p>
            </div>
          ) : null}

          <div className="modal-actions">
            {isOutOfStock ? (
              <button className="btn btn-disabled" type="button" disabled>
                Sin stock
              </button>
            ) : qty > 0 ? (
              <div className="qtybar">
                <button
                  className="iconbtn"
                  type="button"
                  onClick={() => removeOne(product.id)}
                >
                  −
                </button>

                <span className="qtypill">x{qty}</span>

                <button
                  className="iconbtn"
                  type="button"
                  onClick={() => addToList(product)}
                >
                  +
                </button>
              </div>
            ) : (
              <button className="btn" type="button" onClick={() => addToList(product)}>
                Agregar a la lista
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}