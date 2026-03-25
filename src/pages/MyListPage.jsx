import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useList } from "../context/ListContext";

function getPaymentConfig(item) {
  const defaults = {
    transfer: { enabled: true, discountPct: 5, label: "Transferencia" },
    cash: { enabled: true, discountPct: 0, label: "Efectivo" },
    other: { enabled: true, discountPct: 0, label: "Otro medio" },
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

function buildReserveText(
  items,
  baseTotal,
  discountAmount,
  finalTotal,
  paymentMethod,
  deliveryMethod,
  motoSelected,
  motoPrice,
  postalCode
) {
  const lines = items.map((it) => `- ${it.title} x${it.qty}`);

  const paymentLabel =
    paymentMethod === "transfer"
      ? "Transferencia"
      : paymentMethod === "cash"
      ? "Efectivo"
      : "Otro medio";

  let deliveryLine = "Envío";
  if (deliveryMethod === "necochea") {
    deliveryLine = motoSelected
      ? `Motoenvío en Necochea (+$${motoPrice.toLocaleString("es-AR")})`
      : "En Necochea";
  }

  const details = [`Subtotal productos: $${baseTotal.toLocaleString("es-AR")}`];

  if (discountAmount > 0) {
    details.push(`Descuento: -$${discountAmount.toLocaleString("es-AR")}`);
  }

  if (deliveryMethod === "necochea" && motoSelected) {
    details.push(`Motoenvío: $${motoPrice.toLocaleString("es-AR")}`);
  }

  return `Hola! Quiero reservar:\n\n${lines.join("\n")}\n\n${details.join(
    "\n"
  )}\nTotal final: $${finalTotal.toLocaleString(
    "es-AR"
  )}\nPago: ${paymentLabel}\nEntrega: ${deliveryLine}${
    deliveryMethod === "shipping" && postalCode ? `\nCP: ${postalCode}` : ""
  }`;
}

export default function MyListPage() {
  const { items, clearList, total, addToList, removeOne, deleteItem } = useList();

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [deliveryMethod, setDeliveryMethod] = useState("necochea");
  const [motoSelected, setMotoSelected] = useState(false);
  const [postalCode, setPostalCode] = useState("");

  const baseTotal = useMemo(() => Number(total || 0), [total]);

  const paymentAvailability = useMemo(() => {
    const enabled = {
      transfer: false,
      cash: false,
      other: false,
    };

    items.forEach((item) => {
      const cfg = getPaymentConfig(item);
      if (cfg.transfer.enabled) enabled.transfer = true;
      if (cfg.cash.enabled) enabled.cash = true;
      if (cfg.other.enabled) enabled.other = true;
    });

    return enabled;
  }, [items]);

  const deliveryAvailability = useMemo(() => {
    const enabled = {
      necochea: false,
      shipping: false,
      moto: false,
    };

    items.forEach((item) => {
      const cfg = getDeliveryConfig(item);
      if (cfg.necochea.enabled) enabled.necochea = true;
      if (cfg.shipping.enabled) enabled.shipping = true;
      if (cfg.moto.enabled) enabled.moto = true;
    });

    return enabled;
  }, [items]);

  const motoPrice = useMemo(() => {
    const firstWithMoto = items.find((item) => getDeliveryConfig(item).moto.enabled);
    if (!firstWithMoto) return 2100;
    return Number(getDeliveryConfig(firstWithMoto).moto.price ?? 2100);
  }, [items]);

  useEffect(() => {
    if (paymentMethod === "transfer" && !paymentAvailability.transfer) {
      if (paymentAvailability.cash) setPaymentMethod("cash");
      else setPaymentMethod("other");
    }

    if (paymentMethod === "cash" && !paymentAvailability.cash) {
      if (paymentAvailability.transfer) setPaymentMethod("transfer");
      else setPaymentMethod("other");
    }

    if (paymentMethod === "other" && !paymentAvailability.other) {
      if (paymentAvailability.transfer) setPaymentMethod("transfer");
      else setPaymentMethod("cash");
    }
  }, [paymentAvailability, paymentMethod]);

  useEffect(() => {
    if (deliveryMethod === "necochea" && !deliveryAvailability.necochea) {
      setDeliveryMethod("shipping");
    }

    if (deliveryMethod === "shipping" && !deliveryAvailability.shipping) {
      setDeliveryMethod("necochea");
    }

    if (!deliveryAvailability.moto) {
      setMotoSelected(false);
    }
  }, [deliveryAvailability, deliveryMethod]);

  const discountedProductsTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const lineTotal = Number(item.price || 0) * Number(item.qty || 0);
      const cfg = getPaymentConfig(item);

      let discountPct = 0;
      if (paymentMethod === "transfer" && cfg.transfer.enabled) {
        discountPct = Number(cfg.transfer.discountPct || 0);
      }
      if (paymentMethod === "cash" && cfg.cash.enabled) {
        discountPct = Number(cfg.cash.discountPct || 0);
      }
      if (paymentMethod === "other" && cfg.other.enabled) {
        discountPct = Number(cfg.other.discountPct || 0);
      }

      return acc + Math.round(lineTotal * (1 - discountPct / 100));
    }, 0);
  }, [items, paymentMethod]);

  const discountAmount = useMemo(() => {
    return Math.max(0, baseTotal - discountedProductsTotal);
  }, [baseTotal, discountedProductsTotal]);

  const deliveryCost = useMemo(() => {
    if (deliveryMethod === "necochea" && motoSelected) {
      return motoPrice;
    }
    return 0;
  }, [deliveryMethod, motoSelected, motoPrice]);

  const finalTotal = useMemo(() => {
    return discountedProductsTotal + deliveryCost;
  }, [discountedProductsTotal, deliveryCost]);

  const reserveText = useMemo(() => {
    return buildReserveText(
      items,
      baseTotal,
      discountAmount,
      finalTotal,
      paymentMethod,
      deliveryMethod,
      motoSelected,
      motoPrice,
      postalCode
    );
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
  ]);

  const whatsappHref =
    "https://wa.me/542262357366?text=" + encodeURIComponent(reserveText);

  return (
    <>
      <Header />

      <main className="container">
        <div className="panel">
          <div className="panel-head">
            <h2>Mi Lista</h2>
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
                  {items.map((it) => (
                    <div className="list-row" key={it.id}>
                      <div className="qtyctrl">
                        <button className="iconbtn" type="button" onClick={() => removeOne(it.id)}>−</button>
                        <div className="qtypill">{it.qty}</div>
                        <button className="iconbtn" type="button" onClick={() => addToList(it)}>+</button>
                      </div>

                      <div className="name">
                        <div className="name-title">{it.title}</div>
                        <div className="name-sub">
                          Unit: ${it.price.toLocaleString("es-AR")}
                        </div>
                      </div>

                      <div className="rightcol">
                        <div className="price">
                          ${(it.price * it.qty).toLocaleString("es-AR")}
                        </div>

                        <button className="trash" type="button" onClick={() => deleteItem(it.id)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="reserve-actions">
                  <div className="list-configs">
                    <div className="pay-methods">
                      {paymentAvailability.transfer ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="pay"
                            value="transfer"
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
                            value="cash"
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
                            value="other"
                            checked={paymentMethod === "other"}
                            onChange={() => setPaymentMethod("other")}
                          />
                          <span>Otro medio</span>
                        </label>
                      ) : null}
                    </div>

                    <div className="pay-methods">
                      {deliveryAvailability.necochea ? (
                        <label className="pay-option">
                          <input
                            type="radio"
                            name="delivery"
                            value="necochea"
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
                            value="shipping"
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
                          <span>Motoenvío (+${motoPrice.toLocaleString("es-AR")})</span>
                        </label>
                      </div>
                    ) : null}

                    {deliveryMethod === "shipping" ? (
                      <div className="shipping-box">
                        <label className="admin-field" style={{ gap: 6 }}>
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

                  <a className="btn" href={whatsappHref} target="_blank" rel="noreferrer">
                    Comprar por WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>

          <div className="panel-foot totals">
            <div className="totals-left">
              <strong>Total</strong>

              {discountAmount > 0 ? (
                <span className="totals-sub">
                  Descuento aplicado:{" "}
                  <strong>- ${discountAmount.toLocaleString("es-AR")}</strong>
                </span>
              ) : null}

              {deliveryMethod === "necochea" ? (
                <span className="totals-sub">
                  Entrega:{" "}
                  <strong>
                    {motoSelected
                      ? `Motoenvío (+$${motoPrice.toLocaleString("es-AR")})`
                      : "En Necochea"}
                  </strong>
                </span>
              ) : (
                <span className="totals-sub">
                  Entrega: <strong>Envío{postalCode ? ` · CP ${postalCode}` : ""}</strong>
                </span>
              )}
            </div>

            <div className="totals-right">
              <strong>${finalTotal.toLocaleString("es-AR")}</strong>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}