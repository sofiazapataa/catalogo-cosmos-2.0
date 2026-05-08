import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useList } from "../context/ListContext";
import { createOrder } from "../services/ordersService";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function getProductDiscountPrice(item) {
  const price = Number(item.price || 0);
  const discount = Number(item.discount || 0);
  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

function getPaymentConfig(item) {
  const defaults = {
    transfer: { enabled: true, discountPct: 0, applyDiscount: true },
    cash: { enabled: true, discountPct: 0, applyDiscount: true },
    other: { enabled: true, discountPct: 0, applyDiscount: true },
  };

  return {
    ...defaults,
    ...(item.paymentOptions || {}),
    transfer: { ...defaults.transfer, ...(item.paymentOptions?.transfer || {}) },
    cash: { ...defaults.cash, ...(item.paymentOptions?.cash || {}) },
    other: { ...defaults.other, ...(item.paymentOptions?.other || {}) },
  };
}

function getItemPriceByMethod(item, paymentMethod) {
  const baseFinal = getProductDiscountPrice(item);
  const payment = getPaymentConfig(item)[paymentMethod];

  if (!payment?.enabled || !payment.applyDiscount || Number(payment.discountPct || 0) <= 0) {
    return baseFinal;
  }

  return Math.round(baseFinal * (1 - Number(payment.discountPct || 0) / 100));
}

function getPaymentLabel(method) {
  if (method === "transfer") return "Transferencia";
  if (method === "cash") return "Efectivo";
  return "Otro medio";
}

export default function MyListPage() {
  const {
    items,
    addToList,
    removeOne,
    deleteItem,
    removeFromList,
    clearList,
  } = useList();

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  function handleDelete(id) {
    if (typeof deleteItem === "function") deleteItem(id);
    else if (typeof removeFromList === "function") removeFromList(id);
  }

  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + getItemPriceByMethod(item, paymentMethod) * Number(item.qty || 1);
    }, 0);
  }, [items, paymentMethod]);

  const totalBeforeDiscount = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + Number(item.price || 0) * Number(item.qty || 1);
    }, 0);
  }, [items]);

  const totalSavings = Math.max(0, totalBeforeDiscount - total);

  function buildWhatsappText(orderId) {
    const lines = items.map((item) => {
      const itemPrice = getItemPriceByMethod(item, paymentMethod);
      const qty = Number(item.qty || 1);

      return `• ${item.title} x${qty} — $${formatARS(itemPrice * qty)}`;
    });

    return `Hola ✨
Quiero consultar disponibilidad de este pedido de MultiSkinn:

Pedido: ${orderId}

${lines.join("\n")}

Método de pago: ${getPaymentLabel(paymentMethod)}
Total aproximado: $${formatARS(total)}`;
  }

  async function handleFinishOrder() {
    if (!items.length || savingOrder) return;

    try {
      setSavingOrder(true);
      setOrderError("");

      const order = await createOrder({
        items,
        paymentMethod,
        total,
      });

      const text = encodeURIComponent(buildWhatsappText(order.id));
      window.open(`https://wa.me/542262357366?text=${text}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      setOrderError("No se pudo guardar el pedido. Probá nuevamente.");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <div className="checkout-page">
          <div className="checkout-main">
            <section className="panel checkout-panel">
              <div className="panel-head checkout-head">
                <div>
                  <span className="checkout-kicker">Tu selección</span>
                  <h2>Mi lista</h2>
                  <p>Guardá productos, compará opciones y enviá tu pedido por WhatsApp.</p>
                </div>

                {items.length > 0 ? (
                  <button className="linklike" type="button" onClick={clearList}>
                    Vaciar lista
                  </button>
                ) : null}
              </div>

              <div className="panel-body">
                {!items.length ? (
                  <div className="empty-state">
                    <h3>Tu lista está vacía</h3>
                    <p>Explorá productos y agregalos para armar tu rutina.</p>
                    <Link to="/" className="btn">Ver catálogo</Link>
                  </div>
                ) : (
                  <div className="list-table">
                    {items.map((item) => {
                      const basePrice = Number(item.price || 0);
                      const finalPrice = getItemPriceByMethod(item, paymentMethod);
                      const qty = Number(item.qty || 1);
                      const hasDiscount = finalPrice < basePrice;

                      return (
                        <div key={item.id} className="list-row">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="list-img" />
                          ) : (
                            <div className="list-img list-img-empty">Sin imagen</div>
                          )}

                          <div className="name">
                            <div className="name-title">{item.title}</div>
                            <div className="name-sub">{item.desc}</div>

                            {hasDiscount ? (
                              <>
                                <div className="name-save">
                                  Ahorrás ${formatARS((basePrice - finalPrice) * qty)}
                                </div>
                                <div className="name-old-price">
                                  Antes ${formatARS(basePrice)}
                                </div>
                              </>
                            ) : null}

                            <div className="qtyctrl">
                              <button className="iconbtn" type="button" onClick={() => removeOne(item.id)}>
                                −
                              </button>

                              <span className="qtypill">x{qty}</span>

                              <button className="iconbtn" type="button" onClick={() => addToList(item)}>
                                +
                              </button>
                            </div>
                          </div>

                          <div className="rightcol">
                            <div className="price">${formatARS(finalPrice * qty)}</div>

                            <button className="trash" type="button" onClick={() => handleDelete(item.id)}>
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {items.length > 0 ? (
            <aside className="checkout-sidebar">
              <div className="checkout-sticky">
                <div className="checkout-summary">
                  <div className="summary-top">
                    <span className="summary-kicker">Resumen</span>
                    <h3>Total estimado</h3>
                  </div>

                  <div className="summary-price">${formatARS(total)}</div>

                  {totalSavings > 0 ? (
                    <div className="summary-save">Ahorrás ${formatARS(totalSavings)}</div>
                  ) : null}

                  <div className="checkout-box">
                    <h3>Método de pago</h3>

                    <div className="pay-methods">
                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={paymentMethod === "transfer"}
                          onChange={() => setPaymentMethod("transfer")}
                        />
                        <span>Transferencia</span>
                      </label>

                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                        />
                        <span>Efectivo</span>
                      </label>

                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={paymentMethod === "other"}
                          onChange={() => setPaymentMethod("other")}
                        />
                        <span>Otro medio</span>
                      </label>
                    </div>
                  </div>

                  <div className="shipping-box">
                    <strong>Entrega y reservas</strong>
                    <p>Consultá disponibilidad y coordiná entrega por WhatsApp.</p>
                  </div>

                  {orderError ? (
                    <p style={{ color: "crimson", fontSize: 13, fontWeight: 800 }}>
                      {orderError}
                    </p>
                  ) : null}

                  <button
                    className="btn btn-whatsapp"
                    type="button"
                    onClick={handleFinishOrder}
                    disabled={savingOrder}
                  >
                    {savingOrder ? "Guardando pedido..." : "Finalizar por WhatsApp"}
                  </button>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}