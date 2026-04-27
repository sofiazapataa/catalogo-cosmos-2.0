import { useEffect, useMemo, useState } from "react";
import { AVAILABLE_IMAGES, resolveImage } from "../utils/imageMap";
import { uploadImage } from "../utils/uploadImage";
import ProductCard from "./ProductCard";

function benefitsToText(benefits) {
  return Array.isArray(benefits) ? benefits.join("\n") : "";
}

function textToBenefits(text) {
  return text.split("\n").map((item) => item.trim()).filter(Boolean);
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
  imageUrl: "",
  imageFile: null,
  imagesKeys: [],
  skinType: "",
  benefits: [],
  howToUse: "",
  details: "",
  stockQty: 0,
  lowStockThreshold: 3,
  active: true,
  featured: false,

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

const IMAGE_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "combo", label: "Combos" },
  { id: "serum", label: "Serums" },
  { id: "limpieza", label: "Limpieza" },
  { id: "tonico", label: "Tónicos" },
];

export default function AdminProductForm({
  initialData = null,
  mode = "product",
  onSave,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [benefitsText, setBenefitsText] = useState("");
  const [imageSearch, setImageSearch] = useState("");
  const [imageFilter, setImageFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        price: toNumber(initialData.price, 0),
        discount: toNumber(initialData.discount, 0),
        imageKey: initialData.imageKey || "",
        imageUrl: initialData.imageUrl || "",
        imageFile: null,
        imagesKeys: Array.isArray(initialData.imagesKeys)
          ? initialData.imagesKeys
          : [],
        stockQty: toNumber(initialData.stockQty, 0),
        lowStockThreshold: toNumber(initialData.lowStockThreshold, 3),
        featured: initialData.featured === true,

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

  const filteredImages = useMemo(() => {
    const search = imageSearch.trim().toLowerCase();

    return AVAILABLE_IMAGES.filter((name) => {
      const lower = name.toLowerCase();
      const matchesSearch = !search || lower.includes(search);

      const matchesFilter =
        imageFilter === "all" ||
        (imageFilter === "combo" && lower.includes("combo")) ||
        (imageFilter === "serum" && lower.includes("serum")) ||
        (imageFilter === "limpieza" && lower.includes("limpieza")) ||
        (imageFilter === "tonico" && lower.includes("tonico"));

      return matchesSearch && matchesFilter;
    });
  }, [imageSearch, imageFilter]);

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

  function handleUploadFile(file) {
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
      imageKey: "",
    }));
  }

  async function uploadSelectedImageNow() {
    if (!form.imageFile) return;

    try {
      setUploadingImage(true);

      const uploadedUrl = await uploadImage(form.imageFile);

      setForm((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
        imageFile: null,
        imageKey: "",
      }));
    } catch (error) {
      console.error(error);
      alert("No se pudo subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  function selectMainImage(imageName) {
    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys)
        ? prev.imagesKeys
        : [];

      const nextImages =
        imageName && !currentImages.includes(imageName)
          ? [imageName, ...currentImages]
          : currentImages;

      return {
        ...prev,
        imageKey: imageName,
        imageUrl: "",
        imageFile: null,
        imagesKeys: nextImages,
      };
    });
  }

  function handleToggleGalleryImage(imageName) {
    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys)
        ? prev.imagesKeys
        : [];
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

  function clearImages() {
    setForm((prev) => ({
      ...prev,
      imageKey: "",
      imageUrl: "",
      imageFile: null,
      imagesKeys: [],
    }));
  }

  const localMainImagePreview = useMemo(() => {
    return resolveImage(form.imageKey);
  }, [form.imageKey]);

  const mainImagePreview = form.imageUrl || localMainImagePreview;

  const previewImages = useMemo(() => {
    const mappedImages = (form.imagesKeys || [])
      .map((key) => resolveImage(key))
      .filter(Boolean);

    if (form.imageUrl) return [form.imageUrl, ...mappedImages];

    return mappedImages;
  }, [form.imagesKeys, form.imageUrl]);

  const basePrice = Number(form.price || 0);
  const discountPct = Number(form.discount || 0);

  const previewFinalPrice =
    discountPct > 0
      ? Math.round(basePrice * (1 - discountPct / 100))
      : basePrice;

  const previewProduct = useMemo(() => {
    return {
      ...form,
      id: form.id || "preview-product",
      title: form.title || "Nombre del producto",
      desc: form.desc || "Descripción del producto",
      price: basePrice,
      discount: discountPct,
      image: mainImagePreview,
      images: previewImages,
      benefits: textToBenefits(benefitsText),
      stockQty: Number(form.stockQty || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 3),
    };
  }, [
    form,
    basePrice,
    discountPct,
    mainImagePreview,
    previewImages,
    benefitsText,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setUploadingImage(true);

      let finalImageUrl = form.imageUrl || "";

      if (form.imageFile) {
        finalImageUrl = await uploadImage(form.imageFile);
      }

      const cleanedImages = Array.from(
        new Set(
          (form.imagesKeys || []).map((item) => item.trim()).filter(Boolean)
        )
      );

      const { imageFile, ...cleanForm } = form;

      const payload = {
        ...cleanForm,
        imageUrl: finalImageUrl,
        price: Number(form.price || 0),
        discount: Number(form.discount || 0),
        benefits: textToBenefits(benefitsText),
        imagesKeys: cleanedImages,
        imageKey: finalImageUrl
          ? ""
          : form.imageKey?.trim() || cleanedImages[0] || "",
        stockQty: Number(form.stockQty || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        featured: form.featured === true,
      };

      await onSave(payload);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto o subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="admin-editor-layout">
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
            <small className="admin-help">Descuento general del producto.</small>
          </label>

          <div className="admin-field admin-field-full">
            <span>Vista previa de precios</span>
            <div className="admin-method-card">
              <div className="admin-help">
                <strong>Precio original:</strong> ${formatARS(basePrice)}
              </div>
              <div className="admin-help">
                <strong>Precio final con descuento:</strong> $
                {formatARS(previewFinalPrice)}
              </div>
            </div>
          </div>

          <div className="admin-field admin-field-full">
            <span>Imágenes del producto</span>

            <div className="admin-image-manager">
              <div className="admin-image-toolbar">
                <input
                  type="text"
                  placeholder="Buscar imagen por nombre..."
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  onClick={clearImages}
                >
                  Limpiar imágenes
                </button>
              </div>

              <div className="admin-upload-box">
                <div>
                  <span className="admin-upload-title">Subir nueva imagen</span>
                  <p className="admin-upload-help">
                    Elegí una imagen desde tu Mac. Podés subirla ahora o guardarla
                    junto con el producto.
                  </p>
                </div>

                <label className="admin-upload-button">
                  Elegir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadFile(e.target.files?.[0])}
                  />
                </label>

                {form.imageFile ? (
                  <div className="admin-upload-file">
                    <strong>{form.imageFile.name}</strong>
                    <span>Lista para subir</span>
                  </div>
                ) : null}

                {form.imageUrl ? (
                  <div className="admin-upload-status">
                    Imagen seleccionada como principal
                  </div>
                ) : null}

                {form.imageFile ? (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-btn-primary"
                    disabled={uploadingImage}
                    onClick={uploadSelectedImageNow}
                  >
                    {uploadingImage ? "Subiendo..." : "Subir imagen ahora"}
                  </button>
                ) : null}
              </div>

              <div className="admin-image-filters">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`admin-filter-btn ${
                      imageFilter === filter.id ? "active" : ""
                    }`}
                    onClick={() => setImageFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {mainImagePreview ? (
                <div className="admin-main-preview">
                  <img src={mainImagePreview} alt="Imagen principal" />
                  <div>
                    <strong>Imagen principal</strong>
                    <p>{form.imageUrl ? "Imagen subida" : form.imageKey}</p>
                  </div>
                </div>
              ) : (
                <p className="admin-help">Todavía no elegiste imagen principal.</p>
              )}

              <div className="admin-image-grid">
                {filteredImages.map((imageName) => {
                  const src = resolveImage(imageName);
                  const isMain = form.imageKey === imageName && !form.imageUrl;
                  const isGallery = form.imagesKeys.includes(imageName);

                  return (
                    <article
                      key={imageName}
                      className={`admin-image-card ${
                        isMain ? "is-main" : ""
                      } ${isGallery ? "is-selected" : ""}`}
                    >
                      <button
                        type="button"
                        className="admin-image-thumb"
                        onClick={() => selectMainImage(imageName)}
                      >
                        <img src={src} alt={imageName} />
                        {isMain ? (
                          <span className="admin-image-badge">Principal</span>
                        ) : null}
                      </button>

                      <p title={imageName}>{imageName}</p>

                      <div className="admin-image-actions">
                        <button
                          type="button"
                          onClick={() => selectMainImage(imageName)}
                        >
                          Principal
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleGalleryImage(imageName)}
                        >
                          {isGallery ? "Quitar" : "Galería"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredImages.length === 0 ? (
                <p className="admin-help">No hay imágenes con ese filtro.</p>
              ) : null}
            </div>
          </div>

          <div className="admin-field admin-field-full">
            <span>Métodos de pago</span>

            <div className="admin-payment-grid">
              {["transfer", "cash", "other"].map((method) => {
                const label =
                  method === "transfer"
                    ? "Transferencia"
                    : method === "cash"
                    ? "Efectivo"
                    : "Otro medio";

                return (
                  <div className="admin-method-card" key={method}>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={form.paymentOptions[method].enabled}
                        onChange={(e) =>
                          handlePaymentChange(
                            method,
                            "enabled",
                            e.target.checked
                          )
                        }
                      />
                      <span>{label}</span>
                    </label>

                    <input
                      className="input"
                      type="number"
                      value={form.paymentOptions[method].discountPct}
                      onChange={(e) =>
                        handlePaymentChange(
                          method,
                          "discountPct",
                          e.target.value
                        )
                      }
                      placeholder="0"
                    />

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={form.paymentOptions[method].applyDiscount}
                        onChange={(e) =>
                          handlePaymentChange(
                            method,
                            "applyDiscount",
                            e.target.checked
                          )
                        }
                      />
                      <span>Aplicar descuento</span>
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={form.paymentOptions[method].showDiscountLabel}
                        onChange={(e) =>
                          handlePaymentChange(
                            method,
                            "showDiscountLabel",
                            e.target.checked
                          )
                        }
                      />
                      <span>Mostrar “% OFF”</span>
                    </label>
                  </div>
                );
              })}
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
                      handleDeliveryChange(
                        "necochea",
                        "enabled",
                        e.target.checked
                      )
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
                      handleDeliveryChange(
                        "shipping",
                        "enabled",
                        e.target.checked
                      )
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

          <label className="admin-check admin-field-full">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            <span>Producto destacado</span>
          </label>
        </div>

        <div className="admin-form-actions">
          <button className="btn" type="submit" disabled={saving || uploadingImage}>
            {saving || uploadingImage ? "Guardando..." : "Guardar"}
          </button>

          <button
            className="btn btn-outline"
            type="button"
            onClick={onCancel}
            disabled={saving || uploadingImage}
          >
            Cancelar
          </button>
        </div>
      </form>

      <aside className="admin-preview-panel">
        <div className="admin-preview-sticky">
          <h3>Vista previa</h3>
          <p>Así se va a ver en la tienda.</p>

          <div className="admin-preview-card">
            <ProductCard product={previewProduct} />
          </div>
        </div>
      </aside>
    </div>
  );
}