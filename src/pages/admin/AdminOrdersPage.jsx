import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  deleteOrder,
  getOrders,
  updateOrderStatus,
} from "../../services/ordersService";

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function formatDate(value) {
  if (!value?.toDate) return "Sin fecha";

  return value.toDate().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentLabel(method) {
  if (method === "transfer") return "Transferencia";
  if (method === "cash") return "Efectivo";
  return "Otro medio";
}

function getStatusLabel(status) {
  if (status === "confirmed") return "Confirmado";
  if (status === "delivered") return "Entregado";
  if (status === "cancelled") return "Cancelado";
  return "Pendiente";
}

function getDeliveryLabel(type) {
  if (type === "delivery") return "Envío";
  return "Retiro";
}

function buildAdminWhatsappText(order) {
  const customer = order.customer || {};

  const products = (order.items || [])
    .map((item) => `• ${item.title} x${item.qty}`)
    .join("\n");

  return `Hola ${customer.name || ""} ✨
Te escribo por tu pedido de MultiSkinn.

Pedido #${order.id}

Productos:
${products}

Total aproximado:
$${formatARS(order.total)}

Estado:
${getStatusLabel(order.status)}

Gracias por tu pedido 🤍`;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      confirmed: orders.filter((order) => order.status === "confirmed").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      totalEstimated: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((acc, order) => acc + Number(order.total || 0), 0),
    };
  }, [orders]);

  async function handleStatusChange(orderId, nextStatus) {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el estado del pedido.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(orderId) {
    const confirmDelete = window.confirm("¿Querés eliminar este pedido?");

    if (!confirmDelete) return;

    try {
      setUpdatingId(orderId);
      await deleteOrder(orderId);
      await loadOrders();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el pedido.");
    } finally {
      setUpdatingId("");
    }
  }

  function getWhatsappHref(order) {
    const phone = order.customer?.phone?.replace(/\D/g, "");

    if (!phone) return null;

    const text = encodeURIComponent(buildAdminWhatsappText(order));

    return `https://wa.me/54${phone}?text=${text}`;
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2>Pedidos</h2>
              <p>
                Revisá los pedidos generados desde WhatsApp, datos del cliente y
                estado de cada compra.
              </p>
            </div>

            <div className="admin-topbar-actions">
              <button
                className="admin-action-btn admin-action-btn-secondary"
                type="button"
                onClick={loadOrders}
              >
                Actualizar
              </button>
            </div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Total pedidos</span>
              <strong>{stats.total}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Pendientes</span>
              <strong>{stats.pending}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Confirmados</span>
              <strong>{stats.confirmed}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Entregados</span>
              <strong>{stats.delivered}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Total estimado</span>
              <strong>${formatARS(stats.totalEstimated)}</strong>
            </div>
          </div>

          <div className="admin-filters admin-orders-filters">
            <button
              type="button"
              className={statusFilter === "all" ? "active" : ""}
              onClick={() => setStatusFilter("all")}
            >
              Todos
            </button>

            {STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                type="button"
                className={statusFilter === status.value ? "active" : ""}
                onClick={() => setStatusFilter(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ opacity: 0.7 }}>Cargando pedidos…</p>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty">
              <h3>No hay pedidos para mostrar</h3>
              <p>Cuando alguien finalice por WhatsApp, el pedido aparecerá acá.</p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {filteredOrders.map((order) => {
                const customer = order.customer || {};
                const whatsappHref = getWhatsappHref(order);

                return (
                  <article key={order.id} className="admin-order-card">
                    <div className="admin-order-head">
                      <div>
                        <span className="admin-order-id">
                          Pedido #{order.id}
                        </span>

                        <h3>${formatARS(order.total)}</h3>

                        <p>
                          {formatDate(order.createdAt)} ·{" "}
                          {getPaymentLabel(order.paymentMethod)}
                        </p>
                      </div>

                      <span
                        className={`admin-order-status is-${
                          order.status || "pending"
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="admin-order-customer">
                      <div>
                        <span>Cliente</span>
                        <strong>{customer.name || "Sin nombre"}</strong>
                      </div>

                      <div>
                        <span>Teléfono</span>
                        <strong>{customer.phone || "Sin teléfono"}</strong>
                      </div>

                      <div>
                        <span>Entrega</span>
                        <strong>{getDeliveryLabel(customer.deliveryType)}</strong>
                      </div>

                      {customer.address ? (
                        <div>
                          <span>Dirección / zona</span>
                          <strong>{customer.address}</strong>
                        </div>
                      ) : null}

                      {customer.note ? (
                        <div className="admin-order-note">
                          <span>Nota</span>
                          <strong>{customer.note}</strong>
                        </div>
                      ) : null}
                    </div>

                    <div className="admin-order-products">
                      {(order.items || []).map((item) => (
                        <div
                          key={`${order.id}-${item.id}`}
                          className="admin-order-product"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.title} />
                          ) : (
                            <div className="admin-order-product-empty">
                              Sin foto
                            </div>
                          )}

                          <div>
                            <strong>{item.title}</strong>
                            <span>
                              x{item.qty} · ${formatARS(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-actions">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          className={
                            order.status === status.value
                              ? "admin-order-action is-active"
                              : "admin-order-action"
                          }
                          disabled={updatingId === order.id}
                          onClick={() =>
                            handleStatusChange(order.id, status.value)
                          }
                        >
                          {status.label}
                        </button>
                      ))}

                      {whatsappHref ? (
                        <a
                          className="admin-order-whatsapp"
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      ) : null}

                      <button
                        type="button"
                        className="admin-order-delete"
                        disabled={updatingId === order.id}
                        onClick={() => handleDelete(order.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}