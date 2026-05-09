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
    transfer: {
      enabled: true,
      discountPct: 0,
      applyDiscount: true,
    },

    cash: {
      enabled: true,
      discountPct: 0,
      applyDiscount: true,
    },

    other: {
      enabled: true,
      discountPct: 0,
      applyDiscount: true,
    },
  };

  return {
    ...defaults,
    ...(item.paymentOptions || {}),
  };
}

function getItemPriceByMethod(item, paymentMethod) {
  const baseFinal = getProductDiscountPrice(item);

  const payment = getPaymentConfig(item)[paymentMethod];

  if (
    !payment?.enabled ||
    !payment.applyDiscount ||
    Number(payment.discountPct || 0) <= 0
  ) {
    return baseFinal;
  }

  return Math.round(
    baseFinal * (1 - Number(payment.discountPct || 0) / 100)
  );
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

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [deliveryType, setDeliveryType] = useState("pickup");

  const [customerAddress, setCustomerAddress] = useState("");

  const [customerNote, setCustomerNote] = useState("");

  function handleDelete(id) {
    if (typeof deleteItem === "function") {
      deleteItem(id);
    } else if (typeof removeFromList === "function") {
      removeFromList(id);
    }
  }

  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc +
        getItemPriceByMethod(item, paymentMethod) *
          Number(item.qty || 1)
      );
    }, 0);
  }, [items, paymentMethod]);

  function buildWhatsappText(orderId) {
    const lines = items.map((item) => {
      const itemPrice = getItemPriceByMethod(
        item,
        paymentMethod
      );

      return `• ${item.title} x${item.qty} — $${formatARS(
        itemPrice * item.qty
      )}`;
    });

    return `Hola ✨

Quiero consultar disponibilidad de este pedido de MultiSkinn.

Pedido #${orderId}

👤 Cliente:
${customerName}

📱 Teléfono:
${customerPhone}

🚚 Entrega:
${
  deliveryType === "delivery"
    ? `Envío (${customerAddress})`
    : "Retiro"
}

🧴 Productos:
${lines.join("\n")}

💳 Pago:
${getPaymentLabel(paymentMethod)}

📝 Nota:
${customerNote || "Sin nota"}

💰 Total aproximado:
$${formatARS(total)}`;
  }

  async function handleFinishOrder() {
    if (!items.length || savingOrder) return;

    if (!customerName.trim()) {
      alert("Ingresá tu nombre.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Ingresá tu teléfono.");
      return;
    }

    try {
      setSavingOrder(true);

      setOrderError("");

      const order = await createOrder({
        items,
        paymentMethod,
        total,

        customer: {
          name: customerName,
          phone: customerPhone,
          deliveryType,
          address: customerAddress,
          note: customerNote,
        },
      });

      const text = encodeURIComponent(
        buildWhatsappText(order.id)
      );

      window.open(
        `https://wa.me/542262357366?text=${text}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(error);

      setOrderError(
        "No se pudo guardar el pedido."
      );
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
                  <span className="checkout-kicker">
                    Tu selección
                  </span>

                  <h2>Mi lista</h2>

                  <p>
                    Revisá tus productos y completá tus
                    datos para enviar el pedido.
                  </p>
                </div>

                {items.length > 0 ? (
                  <button
                    className="linklike"
                    type="button"
                    onClick={clearList}
                  >
                    Vaciar lista
                  </button>
                ) : null}
              </div>

              <div className="panel-body">
                {!items.length ? (
                  <div className="empty-state">
                    <h3>Tu lista está vacía</h3>

                    <p>
                      Explorá productos y agregalos para
                      armar tu rutina.
                    </p>

                    <Link to="/" className="btn">
                      Ver catálogo
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="checkout-customer-box">
                      <h3>Datos del cliente</h3>

                      <div className="checkout-form-grid">
                        <div className="checkout-field">
                          <label>Nombre</label>

                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) =>
                              setCustomerName(
                                e.target.value
                              )
                            }
                            placeholder="Tu nombre"
                          />
                        </div>

                        <div className="checkout-field">
                          <label>Teléfono</label>

                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) =>
                              setCustomerPhone(
                                e.target.value
                              )
                            }
                            placeholder="Tu teléfono"
                          />
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label>Entrega</label>

                        <select
                          value={deliveryType}
                          onChange={(e) =>
                            setDeliveryType(
                              e.target.value
                            )
                          }
                        >
                          <option value="pickup">
                            Retiro
                          </option>

                          <option value="delivery">
                            Envío
                          </option>
                        </select>
                      </div>

                      {deliveryType === "delivery" ? (
                        <div className="checkout-field">
                          <label>
                            Dirección / zona
                          </label>

                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) =>
                              setCustomerAddress(
                                e.target.value
                              )
                            }
                            placeholder="Dirección"
                          />
                        </div>
                      ) : null}

                      <div className="checkout-field">
                        <label>Nota</label>

                        <textarea
                          value={customerNote}
                          onChange={(e) =>
                            setCustomerNote(
                              e.target.value
                            )
                          }
                          placeholder="Alguna aclaración..."
                        />
                      </div>
                    </div>

                    <div className="list-table">
                      {items.map((item) => {
                        const finalPrice =
                          getItemPriceByMethod(
                            item,
                            paymentMethod
                          );

                        return (
                          <div
                            key={item.id}
                            className="list-row"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="list-img"
                              />
                            ) : (
                              <div className="list-img list-img-empty">
                                Sin imagen
                              </div>
                            )}

                            <div className="name">
                              <div className="name-title">
                                {item.title}
                              </div>

                              <div className="qtyctrl">
                                <button
                                  className="iconbtn"
                                  type="button"
                                  onClick={() =>
                                    removeOne(item.id)
                                  }
                                >
                                  −
                                </button>

                                <span className="qtypill">
                                  x{item.qty}
                                </span>

                                <button
                                  className="iconbtn"
                                  type="button"
                                  onClick={() =>
                                    addToList(item)
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="rightcol">
                              <div className="price">
                                $
                                {formatARS(
                                  finalPrice *
                                    item.qty
                                )}
                              </div>

                              <button
                                className="trash"
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {items.length > 0 ? (
            <aside className="checkout-sidebar">
              <div className="checkout-sticky">
                <div className="checkout-summary">
                  <div className="summary-top">
                    <span className="summary-kicker">
                      Resumen
                    </span>

                    <h3>Total estimado</h3>
                  </div>

                  <div className="summary-price">
                    ${formatARS(total)}
                  </div>

                  <div className="checkout-box">
                    <h3>Método de pago</h3>

                    <div className="pay-methods">
                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={
                            paymentMethod ===
                            "transfer"
                          }
                          onChange={() =>
                            setPaymentMethod(
                              "transfer"
                            )
                          }
                        />

                        <span>
                          Transferencia
                        </span>
                      </label>

                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={
                            paymentMethod ===
                            "cash"
                          }
                          onChange={() =>
                            setPaymentMethod(
                              "cash"
                            )
                          }
                        />

                        <span>Efectivo</span>
                      </label>

                      <label className="pay-option">
                        <input
                          type="radio"
                          checked={
                            paymentMethod ===
                            "other"
                          }
                          onChange={() =>
                            setPaymentMethod(
                              "other"
                            )
                          }
                        />

                        <span>Otro medio</span>
                      </label>
                    </div>
                  </div>

                  {orderError ? (
                    <p
                      style={{
                        color: "crimson",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {orderError}
                    </p>
                  ) : null}

                  <button
                    className="btn btn-whatsapp"
                    type="button"
                    onClick={handleFinishOrder}
                    disabled={savingOrder}
                  >
                    {savingOrder
                      ? "Guardando pedido..."
                      : "Finalizar por WhatsApp"}
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