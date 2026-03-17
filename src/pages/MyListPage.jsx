import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useList } from "../context/ListContext";

const TRANSFER_OFF = 0.05;

function buildReserveText(items, finalTotal, paymentMethod, deliveryMethod, postalCode) {
  const lines = items.map((it) => `- ${it.title} x${it.qty}`);

  let paymentLine = "A coordinar";
  if (paymentMethod === "transfer") paymentLine = "Transferencia (5% OFF)";
  if (paymentMethod === "cash") paymentLine = "Efectivo";

  let deliveryLine = "En Necochea";
  if (deliveryMethod === "shipping") deliveryLine = "Envío";

  return `Hola! Quiero reservar:\n\n${lines.join(
    "\n"
  )}\n\nTotal: $${finalTotal.toLocaleString(
    "es-AR"
  )}\nPago: ${paymentLine}\nEntrega: ${deliveryLine}${
    deliveryMethod === "shipping" && postalCode ? `\nCP: ${postalCode}` : ""
  }`;
}

export default function MyListPage() {
  const { items, clearList, total, addToList, removeOne, deleteItem } = useList();

  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [deliveryMethod, setDeliveryMethod] = useState("necochea");
  const [postalCode, setPostalCode] = useState("");

  const totalTransfer = useMemo(() => {
    return Math.round(Number(total || 0) * (1 - TRANSFER_OFF));
  }, [total]);

  const finalTotal = useMemo(() => {
    return paymentMethod === "transfer" ? totalTransfer : total;
  }, [paymentMethod, total, totalTransfer]);

  const reserveText = useMemo(() => {
    return buildReserveText(
      items,
      finalTotal,
      paymentMethod,
      deliveryMethod,
      postalCode
    );
  }, [items, finalTotal, paymentMethod, deliveryMethod, postalCode]);

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
                        <button
                          className="iconbtn"
                          type="button"
                          onClick={() => removeOne(it.id)}
                          aria-label="Restar uno"
                          title="Restar uno"
                        >
                          −
                        </button>

                        <div className="qtypill">{it.qty}</div>

                        <button
                          className="iconbtn"
                          type="button"
                          onClick={() => addToList(it)}
                          aria-label="Sumar uno"
                          title="Sumar uno"
                        >
                          +
                        </button>
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

                        <button
                          className="trash"
                          type="button"
                          onClick={() => deleteItem(it.id)}
                          aria-label="Eliminar producto"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="reserve-actions">
                  <div className="list-configs">
                    <div className="pay-methods" role="group" aria-label="Método de pago">
                      <label className="pay-option">
                        <input
                          type="radio"
                          name="pay"
                          value="transfer"
                          checked={paymentMethod === "transfer"}
                          onChange={() => setPaymentMethod("transfer")}
                        />
                        <span>Transferencia (5% OFF)</span>
                      </label>

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

                      <label className="pay-option">
                        <input
                          type="radio"
                          name="pay"
                          value="other"
                          checked={paymentMethod === "other"}
                          onChange={() => setPaymentMethod("other")}
                        />
                        <span>A coordinar</span>
                      </label>
                    </div>

                    <div
                      className="pay-methods"
                      role="group"
                      aria-label="Método de entrega"
                    >
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
                    </div>

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
              <strong>
                {paymentMethod === "transfer" ? "Total con transferencia" : "Total"}
              </strong>

              <span className="totals-sub">
                Entrega:{" "}
                <strong>
                  {deliveryMethod === "necochea"
                    ? "En Necochea"
                    : `Envío${postalCode ? ` · CP ${postalCode}` : ""}`}
                </strong>
              </span>
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