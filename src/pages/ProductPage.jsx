import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useListRead, useListWrite } from "../context/ListContext";
import { getProductById } from "../services/productsServices";
import {
  formatARS,
  getPaymentConfig,
  getPaymentPrice,
  getProductDiscountPrice,
} from "../utils/pricing";
import { usePageTitle } from "../hooks/usePageTitle";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQty }               = useListRead();
  const { addToList, removeOne } = useListWrite();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  usePageTitle(product?.title);

  // JSON-LD: inject Product schema when product data is available
  useEffect(() => {
    if (!product) return;
    const finalPrice = getProductDiscountPrice(product);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.desc || "",
      image: product.image || undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "ARS",
        price: finalPrice,
        availability:
          Number(product.stockQty ?? 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "Kosmos Skincare" },
      },
    };
    const el = document.getElementById("jsonld-product");
    if (el) {
      el.textContent = JSON.stringify(schema);
    } else {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "jsonld-product";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    return () => {
      document.getElementById("jsonld-product")?.remove();
    };
  }, [product]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getProductById(id)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setProduct(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean);
  }, [product]);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content" className="container product-page-loading" role="status" aria-label="Cargando producto">
          <div className="sk sk-product-img" />
          <div className="sk sk-product-title" />
          <div className="sk sk-product-line" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Header />
        <main id="main-content" className="container product-page-notfound">
          <h1>Producto no encontrado</h1>
          <p>Este producto no existe o fue dado de baja.</p>
          <Link to="/" className="btn">Ver catálogo</Link>
        </main>
        <Footer />
      </>
    );
  }

  const qty = getQty(product.id);
  const isOutOfStock = Number(product.stockQty ?? 0) <= 0;
  const isLowStock =
    !isOutOfStock &&
    Number(product.stockQty ?? 0) <= Number(product.lowStockThreshold ?? 0);

  const basePrice = Number(product.price || 0);
  const discountPct = Number(product.discount || 0);
  const finalPrice = getProductDiscountPrice(product);
  const hasDiscount = discountPct > 0 && finalPrice < basePrice;

  const paymentConfig = getPaymentConfig(product);
  const paymentRows = (["transfer", "cash", "other"]).map((method) => {
    const config = paymentConfig[method];
    if (!config.enabled) return null;
    const price = getPaymentPrice(product, method);
    const methodDiscount = Number(config.discountPct || 0);
    const hasMethodDiscount = config.applyDiscount && methodDiscount > 0 && price < finalPrice;
    if (!hasMethodDiscount) return null;
    return { method, label: config.label, price, discountPct: methodDiscount, showDiscountLabel: config.showDiscountLabel };
  }).filter(Boolean);

  function buyByWhatsapp() {
    addToList(product);
    navigate("/mi-lista");
  }

  return (
    <>
      <Header />
      <main id="main-content" className="container">
        <nav className="product-page-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Catálogo</Link>
          <span aria-hidden="true"> / </span>
          <span>{product.title}</span>
        </nav>

        <div className="product-page">
          {/* Galería */}
          <div className="product-page-gallery">
            <div className="product-page-main-img">
              {isOutOfStock && <div className="modal-stock modal-stock-out">Sin stock</div>}
              {hasDiscount && <div className="modal-badge">-{discountPct}%</div>}
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={product.title} loading="lazy" />
              ) : (
                <div className="product-page-no-img">Sin imagen</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-page-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img}
                    className={`product-page-thumb ${activeImage === i ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-page-info">
            <div className="product-page-kicker">Kosmos Skin</div>
            <h1 className="product-page-title">{product.title}</h1>

            {isLowStock && (
              <div className="stock-badge stock-badge-low" style={{ display: "inline-flex", marginBottom: 12 }}>
                Últimas unidades
              </div>
            )}

            <p className="product-page-desc">{product.desc}</p>

            {product.skinType && (
              <div className="modal-chip modal-chip-main">
                Ideal para: {product.skinType}
              </div>
            )}

            {/* Precio */}
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
              {paymentRows.length > 0 && (
                <div className="modal-payment-list">
                  {paymentRows.map((row) => (
                    <div className="modal-payment-row" key={row.method}>
                      <span>{row.label}</span>
                      <strong>${formatARS(row.price)}</strong>
                      {row.showDiscountLabel && <em>{row.discountPct}% OFF</em>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Beneficios */}
            {product.benefits?.length > 0 && (
              <div className="modal-section">
                <h2>Beneficios</h2>
                <ul className="modal-list">
                  {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}

            {product.howToUse && (
              <div className="modal-section">
                <h2>Cómo usar</h2>
                <p>{product.howToUse}</p>
              </div>
            )}

            {product.details && (
              <div className="modal-section">
                <h2>Detalles</h2>
                <p>{product.details}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="modal-actions">
              {isOutOfStock ? (
                <button className="btn btn-disabled" type="button" disabled>Sin stock</button>
              ) : qty > 0 ? (
                <>
                  <div className="qtybar modal-qtybar">
                    <button className="iconbtn" type="button" onClick={() => removeOne(product.id)} aria-label="Restar uno">−</button>
                    <span className="qtypill">x{qty}</span>
                    <button className="iconbtn" type="button" onClick={() => addToList(product)} aria-label="Sumar uno">+</button>
                  </div>
                  <Link to="/mi-lista" className="btn btn-outline">Ver lista</Link>
                </>
              ) : (
                <button className="btn" type="button" onClick={() => addToList(product)}>
                  Agregar a la lista
                </button>
              )}

              {!isOutOfStock && (
                <button className="btn modal-whatsapp" type="button" onClick={buyByWhatsapp}>
                  Comprar por WhatsApp
                </button>
              )}
            </div>

            {/* Compartir */}
            <button
              className="product-page-share"
              type="button"
              onClick={handleShare}
              aria-live="polite"
              aria-atomic="true"
            >
              {copied ? "¡Link copiado!" : "Compartir producto"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
