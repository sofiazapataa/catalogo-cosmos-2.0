import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useList } from "../context/ListContext";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function getPaymentConfig(item) {
  const defaults = {
    transfer: {
      enabled: true,
      discountPct: 0,
      label: "Transferencia",
      applyDiscount: true,
    },
    cash: {
      enabled: true,
      discountPct: 0,
      label: "Efectivo",
      applyDiscount: true,
    },
    other: {
      enabled: true,
      discountPct: 0,
      label: "Otro medio",
      applyDiscount: true,
    },
  };

  return {
    ...defaults,
    ...(item.paymentOptions || {}),
    transfer: { ...defaults.transfer, ...(item.paymentOptions?.transfer || {}) },
    cash: { ...defaults.cash, ...(item.paymentOptions?.cash || {}) },
    other: { ...defaults.other, ...(item.paymentOptions?.other || {}) },
  };
}

function getDeliveryConfig(item) {
  const defaults = {
    necochea: { enabled: true, label: "En Necochea" },
    shipping: { enabled: true, label: "Envío" },
    moto: { enabled: true, label: "Motoenvío", price: 2100 },
  };

  return {
    ...defaults,
    ...(item.deliveryOptions || {}),
    necochea: { ...defaults.necochea, ...(item.deliveryOptions?.necochea || {}) },
    shipping: { ...defaults.shipping, ...(item.deliveryOptions?.shipping || {}) },
    moto: { ...defaults.moto, ...(item.deliveryOptions?.moto || {}) },
  };
}

function getProductDiscountPrice(item) {
  const price = Number(item.price || 0);
  const discount = Number(item.discount || 0);

  if (discount <= 0) return price;
  return Math.round(price * (1 - discount / 100));
}

function getUnitPriceByPayment(item, paymentMethod) {
  const productPrice = getProductDiscountPrice(item);
  const payment = getPaymentConfig(item)[paymentMethod];
  const discount = Number(payment?.discountPct || 0);

  if (!payment?.enabled || !payment.applyDiscount || discount <= 0) {
    return productPrice;
  }

  return Math.round(productPrice * (1 - discount / 100));
}

function getPaymentLabel(method) {
  if (method === "transfer") return "Transferencia";
  if (method === "cash") return "Efectivo";
  return "Otro medio";
}

function buildReserveText({
  items,
  baseTotal,
  discountAmount,
  finalTotal,
  paymentMethod,
  deliveryMethod,
  motoSelected,
  motoPrice,
  postalCode,
  customerName,
  note,
}) {
  const paymentLabel = getPaymentLabel(paymentMethod);

  const lines = items.map((item) => {
    const unit = getUnitPriceByPayment(item, paymentMethod);
    const qty = Number(item.qty || 0);
    const lineTotal = unit * qty;

    return `• ${item.title} x${qty}
  $${unit.toLocaleString("es-AR")} c/u = $${lineTotal.toLocaleString("es-AR")}`;
  });

  const deliveryText =
    deliveryMethod === "necochea"
      ? motoSelected
        ? `Motoenvío en Necochea (+$${motoPrice.toLocaleString("es-AR")})`
        : "En Necochea"
      : `Envío${postalCode ? ` · CP ${postalCode}` : ""}`;

  return `Hola! Quiero hacer un pedido:

${customerName ? `👤 Nombre: ${customerName}\n` : ""}🛍️ Pedido:
${lines.join("\n\n")}

💳 Pago: ${paymentLabel}
🚚 Entrega: ${deliveryText}

💰 Subtotal: $${baseTotal.toLocaleString("es-AR")}
${discountAmount > 0 ? `💸 Descuentos: -$${discountAmount.toLocaleString("es-AR")}\n` : ""}${
    deliveryMethod === "necochea" && motoSelected
      ? `🏍️ Motoenvío: $${motoPrice.toLocaleString("es-AR")}\n`
      : ""
  }🧾 Total final: $${finalTotal.toLocaleString("es-AR")}

${note ? `📝 Nota: ${note}` : ""}`;
}

export default function MyListPage() {
  const { items, clearList, total, addToList, removeOne, deleteItem } = useList();

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [deliveryMethod, setDeliveryMethod] = useState("necochea");
  const [motoSelected, setMotoSelected] = useState(false);
  const [postalCode, setPostalCode] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");

  const baseTotal = Number(total || 0);

  const paymentAvailability = useMemo(() => {
    const enabled = { transfer: false, cash: false, other: false };

    items.forEach((item) => {
      const cfg = getPaymentConfig(item);
      if (cfg.transfer.enabled) enabled.transfer = true;
      if (cfg.cash.enabled) enabled.cash = true;
      if (cfg.other.enabled) enabled.other = true;
    });

    return enabled;
  }, [items]);

  const deliveryAvailability = useMemo(() => {
    const enabled = { necochea: false, shipping: false, moto: false };

    items.forEach((item) => {
      const cfg = getDeliveryConfig(item);
      if (cfg.necochea.enabled) enabled.necochea = true;
      if (cfg.shipping.enabled) enabled.shipping = true;
      if (cfg.moto.enabled) enabled.moto = true;
    });

    return enabled;
  }, [items]);

  const motoPrice = useMemo(() => {
    const itemWithMoto = items.find((item) => getDeliveryConfig(item).moto.enabled);
    if (!itemWithMoto) return 2100;
    return Number(getDeliveryConfig(itemWithMoto).moto.price ?? 2100);
  }, [items]);

  useEffect(() => {
    if (paymentMethod === "transfer" && !paymentAvailability.transfer) {
      setPaymentMethod(paymentAvailability.cash ? "cash" : "other");
    }

    if (paymentMethod === "cash" && !paymentAvailability.cash) {
      setPaymentMethod(paymentAvailability.transfer ? "transfer" : "other");
    }

    if (paymentMethod === "other" && !paymentAvailability.other) {
      setPaymentMethod(paymentAvailability.transfer ? "transfer" : "cash");
    }
  }, [paymentAvailability, paymentMethod]);

  const productsTotalByPayment = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + getUnitPriceByPayment(item, paymentMethod) * Number(item.qty || 0);
    }, 0);
  }, [items, paymentMethod]);

  const discountAmount = Math.max(0, baseTotal - productsTotalByPayment);

  const deliveryCost =
    deliveryMethod === "necochea" && motoSelected ? Number(motoPrice || 0) : 0;

  const finalTotal = productsTotalByPayment + deliveryCost;

  const reserveText = useMemo(() => {
    return buildReserveText({
      items,
      baseTotal,
      discountAmount,
      finalTotal,
      paymentMethod,
      deliveryMethod,
      motoSelected,
      motoPrice,
      postalCode,
      customerName,
      note,
    });
  }, [
    items,
    baseTotal,
    discountAmount,
    finalTotal,
    paymentMethod,
    deliveryMethod,
    motoSelected,
    motoPrice,
    postalCode,
    customerName,
    note,
  ]);

  const whatsappHref =
    "https://wa.me/542262357366?text=" + encodeURIComponent(reserveText);

  return (
    <>
      <Header />

      <main className="container">
        <div className="panel checkout-panel">
          <div className="panel-head checkout-head">
            <div>
              <h2>Mi Lista</h2>
              <p>Revisá tu pedido antes de enviarlo por WhatsApp.</p>
            </div>

            <button className="linklike" type="button" onClick={clearList}>
              Borrar lista
            </button>
          </div>

          <div className="panel-body">
            {items.length === 0 ? (
              <p style={{ opacity: 0.7 }}>Tu lista está vacía.</p>
            ) : (
              <>
                <div className="list-table">
                  {items.map((item) => {
                    const baseUnit = Number(item.price || 0);
                    const unitFinal = getUnitPriceByPayment(item, paymentMethod);
                    const lineFinal = unitFinal * Number(item.qty || 0);
                    const hasDiscount = unitFinal < baseUnit;

                    return (
                      <div className="list-row" key={item.id}>
                        {item.image ? (
                          <img className="list-img" src={item.image} alt={item.title} />
                        ) : (
                          <div className="list-img list-img-empty">Sin foto</div>
                        )}

                        <div className="name">
                          <div className="name-title">{item.title}</div>

                          <div className="name-sub">
                            ${formatARS(unitFinal)} c/u
                            {hasDiscount ? (
                              <span className="name-old-price">
                                {" "}
                                ${formatARS(baseUnit)}
                              </span>
                            ) : null}
                          </div>

                          {hasDiscount ? (
                            <div className="name-save">
                              Ahorro aplicado según promoción / pago
                            </div>
                          ) : null}

                          <div className="qtyctrl">
                            <button
                              className="iconbtn"
                              type="button"
                              onClick={() => removeOne(item.id)}
                            >
                              −
                            </button>

                            <div className="qtypill">{item.qty}</div>

                            <button
                              className="iconbtn"
                              type="button"
                              onClick={() => addToList(item)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="rightcol">
                          <div className="price">${formatARS(lineFinal)}</div>

                          <button
                            className="trash"
                            type="button"
                            onClick={() => deleteItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-config">
                  <div className="checkout-box">
                    <h3>Datos del pedido</h3>

                    <label className="admin-field">
                      <span>Nombre</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Tu nombre"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Nota opcional</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Ej: lo retiro mañana"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="checkout-box">
                    <h3>Forma de pago</h3>

                    <div className="pay-methods">
                      {paymentAvailability.transfer ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="pay"
                            checked={paymentMethod === "transfer"}
                            onChange={() => setPaymentMethod("transfer")}
                          />
                          <span>Transferencia</span>
                        </label>
                      ) : null}

                      {paymentAvailability.cash ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="pay"
                            checked={paymentMethod === "cash"}
                            onChange={() => setPaymentMethod("cash")}
                          />
                          <span>Efectivo</span>
                        </label>
                      ) : null}

                      {paymentAvailability.other ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="pay"
                            checked={paymentMethod === "other"}
                            onChange={() => setPaymentMethod("other")}
                          />
                          <span>Otro medio</span>
                        </label>
                      ) : null}
                    </div>
                  </div>

                  <div className="checkout-box">
                    <h3>Entrega</h3>

                    <div className="pay-methods">
                      {deliveryAvailability.necochea ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "necochea"}
                            onChange={() => {
                              setDeliveryMethod("necochea");
                              setPostalCode("");
                            }}
                          />
                          <span>En Necochea</span>
                        </label>
                      ) : null}

                      {deliveryAvailability.shipping ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryMethod === "shipping"}
                            onChange={() => setDeliveryMethod("shipping")}
                          />
                          <span>Envío</span>
                        </label>
                      ) : null}
                    </div>

                    {deliveryMethod === "necochea" && deliveryAvailability.moto ? (
                      <div className="shipping-box">
                        <label className="pay-option">
                          <input
                            type="checkbox"
                            checked={motoSelected}
                            onChange={(e) => setMotoSelected(e.target.checked)}
                          />
                          <span>Motoenvío (+${formatARS(motoPrice)})</span>
                        </label>
                      </div>
                    ) : null}

                    {deliveryMethod === "shipping" ? (
                      <div className="shipping-box">
                        <label className="admin-field">
                          <span>CP</span>
                          <input
                            className="input"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 7600"
                            value={postalCode}
                            onChange={(e) =>
                              setPostalCode(e.target.value.replace(/\D/g, ""))
                            }
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                </div>

                <a
                  className="btn btn-whatsapp btn-checkout"
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Finalizar pedido por WhatsApp
                </a>
              </>
            )}
          </div>

          {items.length > 0 ? (
            <div className="panel-foot totals">
              <div className="totals-left">
                <strong>Resumen</strong>

                <span className="totals-sub">
                  Subtotal: <strong>${formatARS(baseTotal)}</strong>
                </span>

                {discountAmount > 0 ? (
                  <span className="total-save">
                    Ahorro: -${formatARS(discountAmount)}
                  </span>
                ) : null}

                {deliveryCost > 0 ? (
                  <span className="totals-sub">
                    Envío: <strong>${formatARS(deliveryCost)}</strong>
                  </span>
                ) : null}

                <span className="totals-sub">
                  Pago: <strong>{getPaymentLabel(paymentMethod)}</strong>
                </span>
              </div>

              <div className="totals-right">
                {discountAmount > 0 ? (
                  <span className="total-old">${formatARS(baseTotal)}</span>
                ) : null}

                <strong className="total-main">${formatARS(finalTotal)}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}