import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../context/ListContext";

function formatARS(n) {
  return Number(n || 0).toLocaleString("es-AR");
}

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToList, removeOne, getQty } = useList();

  if (!product) return null;

  const qty = getQty(product.id);
  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;

  const basePrice = Number(product.price || 0);
  const discountPct = Number(product.discount || 0);

  const finalPrice = useMemo(() => {
    if (discountPct <= 0) return basePrice;
    return Math.round(basePrice * (1 - discountPct / 100));
  }, [basePrice, discountPct]);

  const hasDiscount = discountPct > 0 && finalPrice < basePrice;

  const images = useMemo(() => {
    const merged = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    return [...new Set(merged)];
  }, [product]);

  const [idx, setIdx] = useState(0);

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
            <div className="modal-price-main">${formatARS(finalPrice)}</div>

            {hasDiscount ? (
              <div className="modal-price-transfer">
                <span style={{ textDecoration: "line-through", opacity: 0.8 }}>
                  ${formatARS(basePrice)}
                </span>{" "}
                · <span>({discountPct}% OFF)</span>
              </div>
            ) : (
              <div className="modal-price-transfer">Precio final</div>
            )}
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