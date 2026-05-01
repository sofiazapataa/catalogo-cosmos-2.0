import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useList } from "../context/ListContext";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function getPaymentConfig(product) {
  const defaults = {
    transfer: {
      enabled: true,
      discountPct: 0,
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
    transfer: { ...defaults.transfer, ...(product.paymentOptions?.transfer || {}) },
    cash: { ...defaults.cash, ...(product.paymentOptions?.cash || {}) },
    other: { ...defaults.other, ...(product.paymentOptions?.other || {}) },
  };
}

function getProductDiscountPrice(product) {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

function getPaymentPrice(product, method) {
  const productPrice = getProductDiscountPrice(product);
  const payment = getPaymentConfig(product)[method];
  const discount = Number(payment.discountPct || 0);

  if (!payment.enabled || !payment.applyDiscount || discount <= 0) {
    return productPrice;
  }

  return Math.round(productPrice * (1 - discount / 100));
}

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addToList, removeOne, getQty } = useList();
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(Array.isArray(product.images) ? product.images : [])]
      .filter(Boolean);
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight" && images.length > 1) {
        setActiveImage((prev) => (prev + 1) % images.length);
      }

      if (e.key === "ArrowLeft" && images.length > 1) {
        setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  if (!product) return null;

  const qty = getQty(product.id);
  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;

  const basePrice = Number(product.price || 0);
  const discountPct = Number(product.discount || 0);
  const finalPrice = getProductDiscountPrice(product);
  const hasDiscount = discountPct > 0 && finalPrice < basePrice;

  const paymentConfig = getPaymentConfig(product);

  const paymentRows = [
    ["transfer", paymentConfig.transfer],
    ["cash", paymentConfig.cash],
    ["other", paymentConfig.other],
  ]
    .filter(([, config]) => config.enabled)
    .map(([method, config]) => {
      const price = getPaymentPrice(product, method);
      const methodDiscount = Number(config.discountPct || 0);
      const hasMethodDiscount =
        config.applyDiscount && methodDiscount > 0 && price < finalPrice;

      return {
        method,
        label: config.label,
        price,
        discountPct: methodDiscount,
        hasMethodDiscount,
        showDiscountLabel: config.showDiscountLabel,
      };
    })
    .filter((row) => row.hasMethodDiscount);

  function nextImage() {
    setActiveImage((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goToList() {
    onClose();
    navigate("/mi-lista");
  }

  function buyByWhatsapp() {
    addToList(product);
    onClose();
    navigate("/mi-lista");
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <article
        className="modal modal-product"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <section className="modal-media">
          {hasDiscount ? <div className="modal-badge">-{discountPct}%</div> : null}

          {isOutOfStock ? (
            <div className="modal-stock modal-stock-out">Sin stock</div>
          ) : null}

          {images.length > 0 ? (
            <>
              <div className="modal-image-frame">
                <img
                  className="modal-img"
                  src={images[activeImage]}
                  alt={product.title}
                />
              </div>

              {images.length > 1 ? (
                <>
                  <button
                    className="modal-nav modal-nav-left"
                    type="button"
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>

                  <button
                    className="modal-nav modal-nav-right"
                    type="button"
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>

                  <div className="modal-thumbs">
                    {images.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        className={`modal-thumb ${
                          activeImage === index ? "modal-thumb-active" : ""
                        }`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`Ver imagen ${index + 1}`}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="modal-img-empty">Sin imagen</div>
          )}
        </section>

        <section className="modal-info">
          <div className="modal-kicker">Kosmos Skin</div>

          <h2 className="modal-title">{product.title}</h2>

          <p className="modal-desc">{product.desc}</p>

          {product.skinType ? (
            <div className="modal-chip modal-chip-main">
              Ideal para: {product.skinType}
            </div>
          ) : null}

          <div className="modal-pricebox">
            <span className="modal-price-label">Precio</span>

            <div className="modal-price-main">${formatARS(finalPrice)}</div>

            {hasDiscount ? (
              <div className="modal-price-transfer">
                <span className="modal-old-price">${formatARS(basePrice)}</span>{" "}
                <strong>{discountPct}% OFF producto</strong>
              </div>
            ) : (
              <div className="modal-price-transfer">Precio lista</div>
            )}

            {paymentRows.length > 0 ? (
              <div className="modal-payment-list">
                {paymentRows.map((row) => (
                  <div className="modal-payment-row" key={row.method}>
                    <span>{row.label}</span>
                    <strong>${formatARS(row.price)}</strong>
                    {row.showDiscountLabel ? <em>{row.discountPct}% OFF</em> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

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
              <button className="btn btn-disabled" type="button" disabled>
                Sin stock
              </button>
            ) : qty > 0 ? (
              <>
                <div className="qtybar modal-qtybar">
                  <button
                    className="iconbtn"
                    type="button"
                    onClick={() => removeOne(product.id)}
                    aria-label="Restar uno"
                  >
                    −
                  </button>

                  <span className="qtypill">x{qty}</span>

                  <button
                    className="iconbtn"
                    type="button"
                    onClick={() => addToList(product)}
                    aria-label="Sumar uno"
                  >
                    +
                  </button>
                </div>

                <button className="btn btn-outline" type="button" onClick={goToList}>
                  Ver lista
                </button>
              </>
            ) : (
              <button className="btn" type="button" onClick={() => addToList(product)}>
                Agregar a la lista
              </button>
            )}

            {!isOutOfStock ? (
              <button className="btn modal-whatsapp" type="button" onClick={buyByWhatsapp}>
                Comprar por WhatsApp
              </button>
            ) : null}
          </div>
        </section>
      </article>
    </div>
  );
}