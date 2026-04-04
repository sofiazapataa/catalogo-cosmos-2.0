import { useEffect, useMemo, useState } from "react";
import { AVAILABLE_IMAGES, resolveImage } from "../utils/imageMap";

function benefitsToText(benefits) {
  return Array.isArray(benefits) ? benefits.join("\n") : "";
}

function textToBenefits(text) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const EMPTY_FORM = {
  id: "",
  title: "",
  desc: "",
  price: 0,
  discount: 0,
  category: "stock",
  type: "",
  imageKey: "",
  imagesKeys: [],
  skinType: "",
  benefits: [],
  howToUse: "",
  details: "",
  stockQty: 0,
  lowStockThreshold: 3,
  active: true,

  paymentOptions: {
    transfer: { enabled: true, discountPct: 5, label: "Transferencia" },
    cash: { enabled: true, discountPct: 0, label: "Efectivo" },
    other: { enabled: true, discountPct: 0, label: "Otro medio" },
  },

  deliveryOptions: {
    necochea: { enabled: true, label: "En Necochea" },
    shipping: { enabled: true, label: "Envío" },
    moto: { enabled: true, label: "Motoenvío", price: 2100 },
  },
};

export default function AdminProductForm({
  initialData = null,
  mode = "product",
  onSave,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [benefitsText, setBenefitsText] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        imageKey: initialData.imageKey || "",
        imagesKeys: Array.isArray(initialData.imagesKeys)
          ? initialData.imagesKeys
          : [],
        stockQty: Number(initialData.stockQty ?? 0),
        lowStockThreshold: Number(initialData.lowStockThreshold ?? 3),

        paymentOptions: {
          ...EMPTY_FORM.paymentOptions,
          ...(initialData.paymentOptions || {}),
          transfer: {
            ...EMPTY_FORM.paymentOptions.transfer,
            ...(initialData.paymentOptions?.transfer || {}),
          },
          cash: {
            ...EMPTY_FORM.paymentOptions.cash,
            ...(initialData.paymentOptions?.cash || {}),
          },
          other: {
            ...EMPTY_FORM.paymentOptions.other,
            ...(initialData.paymentOptions?.other || {}),
          },
        },

        deliveryOptions: {
          ...EMPTY_FORM.deliveryOptions,
          ...(initialData.deliveryOptions || {}),
          necochea: {
            ...EMPTY_FORM.deliveryOptions.necochea,
            ...(initialData.deliveryOptions?.necochea || {}),
          },
          shipping: {
            ...EMPTY_FORM.deliveryOptions.shipping,
            ...(initialData.deliveryOptions?.shipping || {}),
          },
          moto: {
            ...EMPTY_FORM.deliveryOptions.moto,
            ...(initialData.deliveryOptions?.moto || {}),
            price: Number(initialData.deliveryOptions?.moto?.price ?? 2100),
          },
        },
      });

      setBenefitsText(benefitsToText(initialData.benefits));
    } else {
      setForm({
        ...EMPTY_FORM,
        category: mode === "combo" ? "combo" : "stock",
        type: mode === "combo" ? "combos" : "",
      });
      setBenefitsText("");
    }
  }, [initialData, mode]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const numericFields = ["price", "discount", "stockQty", "lowStockThreshold"];

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : numericFields.includes(name)
          ? Number(value)
          : value,
    }));
  }

  function handlePaymentChange(method, field, value) {
    setForm((prev) => ({
      ...prev,
      paymentOptions: {
        ...prev.paymentOptions,
        [method]: {
          ...prev.paymentOptions[method],
          [field]:
            field === "enabled"
              ? value
              : field === "discountPct"
              ? Number(value)
              : value,
        },
      },
    }));
  }

  function handleDeliveryChange(method, field, value) {
    setForm((prev) => ({
      ...prev,
      deliveryOptions: {
        ...prev.deliveryOptions,
        [method]: {
          ...prev.deliveryOptions[method],
          [field]:
            field === "enabled"
              ? value
              : field === "price"
              ? Number(value)
              : value,
        },
      },
    }));
  }

  function handleMainImageChange(e) {
    const value = e.target.value;

    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys) ? prev.imagesKeys : [];

      const nextImages =
        value && !currentImages.includes(value)
          ? [value, ...currentImages]
          : currentImages;

      return {
        ...prev,
        imageKey: value,
        imagesKeys: nextImages,
      };
    });
  }

  function handleToggleGalleryImage(imageName) {
    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys) ? prev.imagesKeys : [];
      const exists = currentImages.includes(imageName);

      const nextImages = exists
        ? currentImages.filter((item) => item !== imageName)
        : [...currentImages, imageName];

      let nextImageKey = prev.imageKey;

      if (prev.imageKey === imageName && !nextImages.includes(imageName)) {
        nextImageKey = nextImages[0] || "";
      }

      return {
        ...prev,
        imageKey: nextImageKey,
        imagesKeys: nextImages,
      };
    });
  }

  const mainImagePreview = useMemo(() => {
    return resolveImage(form.imageKey);
  }, [form.imageKey]);

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanedImages = Array.from(
      new Set((form.imagesKeys || []).map((item) => item.trim()).filter(Boolean))
    );

    const payload = {
      ...form,
      benefits: textToBenefits(benefitsText),
      imagesKeys: cleanedImages,
      imageKey: form.imageKey?.trim() || cleanedImages[0] || "",
      stockQty: Number(form.stockQty || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 0),
    };

    await onSave(payload);
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>ID</span>
          <input
            className="input"
            name="id"
            value={form.id}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-field">
          <span>Título</span>
          <input
            className="input"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Descripción</span>
          <input
            className="input"
            name="desc"
            value={form.desc}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-field">
          <span>Precio final</span>
          <input
            className="input"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <small className="admin-help">Precio que se muestra en la web.</small>
        </label>

        <label className="admin-field">
          <span>Descuento visual (%)</span>
          <input
            className="input"
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
          <small className="admin-help">
            Solo para la etiqueta visual del producto.
          </small>
        </label>

        <div className="admin-field admin-field-full">
          <span>Métodos de pago</span>

          <div className="admin-payment-grid">
            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.transfer.enabled}
                  onChange={(e) =>
                    handlePaymentChange("transfer", "enabled", e.target.checked)
                  }
                />
                <span>Transferencia</span>
              </label>

              <input
                className="input"
                type="number"
                value={form.paymentOptions.transfer.discountPct}
                onChange={(e) =>
                  handlePaymentChange("transfer", "discountPct", e.target.value)
                }
                placeholder="5"
              />
            </div>

            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.cash.enabled}
                  onChange={(e) =>
                    handlePaymentChange("cash", "enabled", e.target.checked)
                  }
                />
                <span>Efectivo</span>
              </label>

              <input
                className="input"
                type="number"
                value={form.paymentOptions.cash.discountPct}
                onChange={(e) =>
                  handlePaymentChange("cash", "discountPct", e.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.other.enabled}
                  onChange={(e) =>
                    handlePaymentChange("other", "enabled", e.target.checked)
                  }
                />
                <span>Otro medio</span>
              </label>

              <input
                className="input"
                type="number"
                value={form.paymentOptions.other.discountPct}
                onChange={(e) =>
                  handlePaymentChange("other", "discountPct", e.target.value)
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="admin-field admin-field-full">
          <span>Opciones de entrega</span>

          <div className="admin-payment-grid">
            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.deliveryOptions.necochea.enabled}
                  onChange={(e) =>
                    handleDeliveryChange("necochea", "enabled", e.target.checked)
                  }
                />
                <span>En Necochea</span>
              </label>
            </div>

            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.deliveryOptions.shipping.enabled}
                  onChange={(e) =>
                    handleDeliveryChange("shipping", "enabled", e.target.checked)
                  }
                />
                <span>Envío</span>
              </label>
            </div>

            <div className="admin-method-card">
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.deliveryOptions.moto.enabled}
                  onChange={(e) =>
                    handleDeliveryChange("moto", "enabled", e.target.checked)
                  }
                />
                <span>Motoenvío</span>
              </label>

              <input
                className="input"
                type="number"
                value={form.deliveryOptions.moto.price}
                onChange={(e) =>
                  handleDeliveryChange("moto", "price", e.target.value)
                }
                placeholder="2100"
              />
            </div>
          </div>
        </div>

        <label className="admin-field">
          <span>Categoría</span>
          <input
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field">
          <span>Tipo</span>
          <input
            className="input"
            name="type"
            value={form.type}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field">
          <span>Imagen principal</span>
          <select
            className="input"
            name="imageKey"
            value={form.imageKey}
            onChange={handleMainImageChange}
          >
            <option value="">Seleccionar imagen</option>
            {AVAILABLE_IMAGES.map((img) => (
              <option key={img} value={img}>
                {img}
              </option>
            ))}
          </select>
          <small className="admin-help">
            Elegí una imagen del catálogo ya cargado en assets.
          </small>
        </label>

        <label className="admin-field">
          <span>Tipo de piel</span>
          <input
            className="input"
            name="skinType"
            value={form.skinType}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field">
          <span>Stock</span>
          <input
            className="input"
            type="number"
            name="stockQty"
            value={form.stockQty}
            onChange={handleChange}
          />
          <small className="admin-help">
            Si llega a 0, se muestra como “Sin stock”.
          </small>
        </label>

        <label className="admin-field">
          <span>Alerta stock bajo</span>
          <input
            className="input"
            type="number"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={handleChange}
          />
          <small className="admin-help">
            Ej: si ponés 2, cuando queden 2 o menos te lo marca como bajo.
          </small>
        </label>

        <div className="admin-field admin-field-full">
          <span>Galería de imágenes</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              marginTop: 8,
            }}
          >
            {AVAILABLE_IMAGES.map((img) => (
              <label
                key={img}
                className="admin-check"
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.imagesKeys.includes(img)}
                  onChange={() => handleToggleGalleryImage(img)}
                />
                <span style={{ fontSize: 13 }}>{img}</span>
              </label>
            ))}
          </div>
          <small className="admin-help">
            Marcá una o varias imágenes para la galería del producto.
          </small>
        </div>

        {mainImagePreview ? (
          <div className="admin-field admin-field-full">
            <span>Vista previa imagen principal</span>
            <div
              style={{
                marginTop: 8,
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                padding: 12,
                maxWidth: 260,
                background: "#fff",
              }}
            >
              <img
                src={mainImagePreview}
                alt={form.title || form.imageKey}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
            </div>
          </div>
        ) : null}

        <label className="admin-field admin-field-full">
          <span>Beneficios · uno por línea</span>
          <textarea
            className="input admin-textarea"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Cómo usar</span>
          <textarea
            className="input admin-textarea"
            name="howToUse"
            value={form.howToUse}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Detalles</span>
          <textarea
            className="input admin-textarea"
            name="details"
            value={form.details}
            onChange={handleChange}
          />
        </label>

        <label className="admin-check">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          <span>Activo</span>
        </label>
      </div>

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button className="btn btn-outline" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}