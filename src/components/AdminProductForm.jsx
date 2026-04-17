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

function formatARS(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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
        price: toNumber(initialData.price, 0),
        discount: toNumber(initialData.discount, 0),
        imageKey: initialData.imageKey || "",
        imagesKeys: Array.isArray(initialData.imagesKeys)
          ? initialData.imagesKeys
          : [],
        stockQty: toNumber(initialData.stockQty, 0),
        lowStockThreshold: toNumber(initialData.lowStockThreshold, 3),

        paymentOptions: {
          ...EMPTY_FORM.paymentOptions,
          ...(initialData.paymentOptions || {}),
          transfer: {
            ...EMPTY_FORM.paymentOptions.transfer,
            ...(initialData.paymentOptions?.transfer || {}),
            discountPct: toNumber(
              initialData.paymentOptions?.transfer?.discountPct,
              0
            ),
          },
          cash: {
            ...EMPTY_FORM.paymentOptions.cash,
            ...(initialData.paymentOptions?.cash || {}),
            discountPct: toNumber(
              initialData.paymentOptions?.cash?.discountPct,
              0
            ),
          },
          other: {
            ...EMPTY_FORM.paymentOptions.other,
            ...(initialData.paymentOptions?.other || {}),
            discountPct: toNumber(
              initialData.paymentOptions?.other?.discountPct,
              0
            ),
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
            price: toNumber(initialData.deliveryOptions?.moto?.price, 2100),
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
            field === "enabled" ||
            field === "applyDiscount" ||
            field === "showDiscountLabel"
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

  const basePrice = Number(form.price || 0);
  const discountPct = Number(form.discount || 0);

  const previewFinalPrice =
    discountPct > 0
      ? Math.round(basePrice * (1 - discountPct / 100))
      : basePrice;

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanedImages = Array.from(
      new Set((form.imagesKeys || []).map((item) => item.trim()).filter(Boolean))
    );

    const payload = {
      ...form,
      price: Number(form.price || 0),
      discount: Number(form.discount || 0),
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
          <span>Precio original</span>
          <input
            className="input"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <small className="admin-help">
            Este es el precio antes del descuento.
          </small>
        </label>

        <label className="admin-field">
          <span>Descuento (%)</span>
          <input
            className="input"
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
          <small className="admin-help">
            Descuento general del producto.
          </small>
        </label>

        <div className="admin-field admin-field-full">
          <span>Vista previa de precios</span>
          <div className="admin-method-card">
            <div className="admin-help">
              <strong>Precio original:</strong> ${formatARS(basePrice)}
            </div>
            <div className="admin-help">
              <strong>Precio final con descuento:</strong> ${formatARS(previewFinalPrice)}
            </div>
          </div>
        </div>

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
                placeholder="0"
              />

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.transfer.applyDiscount}
                  onChange={(e) =>
                    handlePaymentChange("transfer", "applyDiscount", e.target.checked)
                  }
                />
                <span>Aplicar descuento</span>
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.transfer.showDiscountLabel}
                  onChange={(e) =>
                    handlePaymentChange(
                      "transfer",
                      "showDiscountLabel",
                      e.target.checked
                    )
                  }
                />
                <span>Mostrar “% OFF”</span>
              </label>
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

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.cash.applyDiscount}
                  onChange={(e) =>
                    handlePaymentChange("cash", "applyDiscount", e.target.checked)
                  }
                />
                <span>Aplicar descuento</span>
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.cash.showDiscountLabel}
                  onChange={(e) =>
                    handlePaymentChange("cash", "showDiscountLabel", e.target.checked)
                  }
                />
                <span>Mostrar “% OFF”</span>
              </label>
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

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.other.applyDiscount}
                  onChange={(e) =>
                    handlePaymentChange("other", "applyDiscount", e.target.checked)
                  }
                />
                <span>Aplicar descuento</span>
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.paymentOptions.other.showDiscountLabel}
                  onChange={(e) =>
                    handlePaymentChange("other", "showDiscountLabel", e.target.checked)
                  }
                />
                <span>Mostrar “% OFF”</span>
              </label>
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
        </label>

        <div className="admin-field admin-field-full">
          <span>Galería de imágenes</span>
          <div className="admin-payment-grid">
            {AVAILABLE_IMAGES.map((img) => {
              const selected = form.imagesKeys.includes(img);
              const preview = resolveImage(img);

              return (
                <label key={img} className="admin-method-card">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleToggleGalleryImage(img)}
                    />
                    <span>{img}</span>
                  </label>

                  {preview ? (
                    <img
                      src={preview}
                      alt={img}
                      style={{
                        width: "100%",
                        maxWidth: 180,
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>

        {mainImagePreview ? (
          <div className="admin-field admin-field-full">
            <span>Vista previa imagen principal</span>
            <img
              src={mainImagePreview}
              alt="Vista previa"
              style={{
                width: "100%",
                maxWidth: 240,
                borderRadius: 16,
                border: "1px solid #e5e7eb",
              }}
            />
          </div>
        ) : null}

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
        </label>

        <label className="admin-field">
          <span>Umbral stock bajo</span>
          <input
            className="input"
            type="number"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Beneficios (uno por línea)</span>
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

        <label className="admin-check admin-field-full">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          <span>Producto activo</span>
        </label>
      </div>

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>

        <button
          className="btn btn-outline"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}