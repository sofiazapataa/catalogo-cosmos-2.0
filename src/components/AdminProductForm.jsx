import { useEffect, useMemo, useState } from "react";
import { AVAILABLE_IMAGES, resolveImage } from "../utils/imageMap";
import { uploadImage } from "../utils/uploadImage";
import ProductCard from "./ProductCard";

// ─── helpers ────────────────────────────────────────────────
function benefitsToText(b) {
  return Array.isArray(b) ? b.join("\n") : "";
}
function textToBenefits(t) {
  return t.split("\n").map((s) => s.trim()).filter(Boolean);
}
function formatARS(v) {
  return Number(v || 0).toLocaleString("es-AR");
}
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── constantes ─────────────────────────────────────────────
const TIPO_OPTIONS = [
  { value: "", label: "Sin categoría" },
  { value: "cremas", label: "Cremas" },
  { value: "serums", label: "Serums" },
  { value: "limpieza", label: "Limpieza" },
  { value: "tonicos", label: "Tónicos" },
  { value: "combos", label: "Combos" },
  { value: "otros", label: "Otros" },
];

const SKIN_TYPE_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "todo tipo de piel", label: "Todo tipo de piel" },
  { value: "grasa", label: "Piel grasa" },
  { value: "mixta", label: "Piel mixta" },
  { value: "grasa y mixta", label: "Piel grasa y mixta" },
  { value: "seca", label: "Piel seca" },
  { value: "normal", label: "Piel normal" },
  { value: "seca y normal", label: "Piel seca y normal" },
  { value: "sensible", label: "Piel sensible" },
];

const IMAGE_FILTERS = [
  { id: "all", label: "Todas" },
  { id: "combo", label: "Combos" },
  { id: "serum", label: "Serums" },
  { id: "limpieza", label: "Limpieza" },
  { id: "tonico", label: "Tónicos" },
];

const TABS = [
  { id: "esencial", label: "Lo esencial" },
  { id: "precios", label: "Precios" },
  { id: "descripcion", label: "Descripción" },
  { id: "config", label: "Configuración" },
];

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
    transfer: { enabled: true, discountPct: 0, label: "Transferencia", applyDiscount: true, showDiscountLabel: true },
    cash: { enabled: true, discountPct: 0, label: "Efectivo", applyDiscount: true, showDiscountLabel: true },
    other: { enabled: true, discountPct: 0, label: "Otro medio", applyDiscount: true, showDiscountLabel: true },
  },
  deliveryOptions: {
    necochea: { enabled: true, label: "En Necochea" },
    shipping: { enabled: true, label: "Envío" },
    moto: { enabled: true, label: "Motoenvío", price: 2100 },
  },
};

// ─── componente ─────────────────────────────────────────────
export default function AdminProductForm({ initialData = null, mode = "product", onSave, onCancel, saving = false }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [benefitsText, setBenefitsText] = useState("");
  const [imageSearch, setImageSearch] = useState("");
  const [imageFilter, setImageFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("esencial");
  const [formError, setFormError] = useState("");
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const isNew = !initialData;

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
        imagesKeys: Array.isArray(initialData.imagesKeys) ? initialData.imagesKeys : [],
        stockQty: toNumber(initialData.stockQty, 0),
        lowStockThreshold: toNumber(initialData.lowStockThreshold, 3),
        featured: initialData.featured === true,
        paymentOptions: {
          ...EMPTY_FORM.paymentOptions,
          ...(initialData.paymentOptions || {}),
          transfer: { ...EMPTY_FORM.paymentOptions.transfer, ...(initialData.paymentOptions?.transfer || {}), discountPct: toNumber(initialData.paymentOptions?.transfer?.discountPct, 0) },
          cash: { ...EMPTY_FORM.paymentOptions.cash, ...(initialData.paymentOptions?.cash || {}), discountPct: toNumber(initialData.paymentOptions?.cash?.discountPct, 0) },
          other: { ...EMPTY_FORM.paymentOptions.other, ...(initialData.paymentOptions?.other || {}), discountPct: toNumber(initialData.paymentOptions?.other?.discountPct, 0) },
        },
        deliveryOptions: {
          ...EMPTY_FORM.deliveryOptions,
          ...(initialData.deliveryOptions || {}),
          necochea: { ...EMPTY_FORM.deliveryOptions.necochea, ...(initialData.deliveryOptions?.necochea || {}) },
          shipping: { ...EMPTY_FORM.deliveryOptions.shipping, ...(initialData.deliveryOptions?.shipping || {}) },
          moto: { ...EMPTY_FORM.deliveryOptions.moto, ...(initialData.deliveryOptions?.moto || {}), price: toNumber(initialData.deliveryOptions?.moto?.price, 2100) },
        },
      });
      setBenefitsText(benefitsToText(initialData.benefits));
    } else {
      setForm({ ...EMPTY_FORM, category: mode === "combo" ? "combo" : "stock", type: mode === "combo" ? "combos" : "" });
      setBenefitsText("");
    }
    setActiveTab("esencial");
    setFormError("");
    setImagePanelOpen(false);
  }, [initialData, mode]);

  // Auto-generar ID desde el título solo si es nuevo producto
  function handleTitleChange(e) {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      id: isNew ? slugify(title) : prev.id,
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const numericFields = ["price", "discount", "stockQty", "lowStockThreshold"];
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : numericFields.includes(name) ? Number(value) : value,
    }));
  }

  function handlePaymentChange(method, field, value) {
    setForm((prev) => ({
      ...prev,
      paymentOptions: {
        ...prev.paymentOptions,
        [method]: {
          ...prev.paymentOptions[method],
          [field]: field === "enabled" || field === "applyDiscount" || field === "showDiscountLabel" ? value : field === "discountPct" ? Number(value) : value,
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
          [field]: field === "enabled" ? value : field === "price" ? Number(value) : value,
        },
      },
    }));
  }

  function handleUploadFile(file) {
    if (!file) return;
    setForm((prev) => ({ ...prev, imageFile: file, imageUrl: URL.createObjectURL(file), imageKey: "" }));
  }

  async function uploadSelectedImageNow() {
    if (!form.imageFile) return;
    try {
      setUploadingImage(true);
      const url = await uploadImage(form.imageFile);
      setForm((prev) => ({ ...prev, imageUrl: url, imageFile: null, imageKey: "" }));
    } catch {
      setFormError("No se pudo subir la imagen. Intentá de nuevo.");
    } finally {
      setUploadingImage(false);
    }
  }

  function selectMainImage(imageName) {
    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys) ? prev.imagesKeys : [];
      const nextImages = imageName && !currentImages.includes(imageName) ? [imageName, ...currentImages] : currentImages;
      return { ...prev, imageKey: imageName, imageUrl: "", imageFile: null, imagesKeys: nextImages };
    });
    setImagePanelOpen(false); // cerrar el panel al seleccionar
  }

  function handleToggleGalleryImage(imageName) {
    setForm((prev) => {
      const currentImages = Array.isArray(prev.imagesKeys) ? prev.imagesKeys : [];
      const exists = currentImages.includes(imageName);
      const nextImages = exists ? currentImages.filter((i) => i !== imageName) : [...currentImages, imageName];
      let nextImageKey = prev.imageKey;
      if (prev.imageKey === imageName && !nextImages.includes(imageName)) nextImageKey = nextImages[0] || "";
      return { ...prev, imageKey: nextImageKey, imagesKeys: nextImages };
    });
  }

  function clearImages() {
    setForm((prev) => ({ ...prev, imageKey: "", imageUrl: "", imageFile: null, imagesKeys: [] }));
  }

  const filteredImages = useMemo(() => {
    const search = imageSearch.trim().toLowerCase();
    return AVAILABLE_IMAGES.filter((name) => {
      const lower = name.toLowerCase();
      const matchesSearch = !search || lower.includes(search);
      const matchesFilter = imageFilter === "all" || (imageFilter === "combo" && lower.includes("combo")) || (imageFilter === "serum" && lower.includes("serum")) || (imageFilter === "limpieza" && lower.includes("limpieza")) || (imageFilter === "tonico" && lower.includes("tonico"));
      return matchesSearch && matchesFilter;
    });
  }, [imageSearch, imageFilter]);

  const localMainImagePreview = useMemo(() => resolveImage(form.imageKey), [form.imageKey]);
  const mainImagePreview = form.imageUrl || localMainImagePreview;
  const previewImages = useMemo(() => {
    const mapped = (form.imagesKeys || []).map((k) => resolveImage(k)).filter(Boolean);
    return form.imageUrl ? [form.imageUrl, ...mapped] : mapped;
  }, [form.imagesKeys, form.imageUrl]);

  const basePrice = Number(form.price || 0);
  const discountPct = Number(form.discount || 0);
  const previewFinalPrice = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;

  const previewProduct = useMemo(() => ({
    ...form,
    id: form.id || "preview",
    title: form.title || "Nombre del producto",
    desc: form.desc || "Descripción del producto",
    price: basePrice,
    discount: discountPct,
    image: mainImagePreview,
    images: previewImages,
    benefits: textToBenefits(benefitsText),
    stockQty: Number(form.stockQty || 0),
    lowStockThreshold: Number(form.lowStockThreshold || 3),
  }), [form, basePrice, discountPct, mainImagePreview, previewImages, benefitsText]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError("El nombre del producto es obligatorio."); setActiveTab("esencial"); return; }
    if (!form.price || Number(form.price) <= 0) { setFormError("El precio debe ser mayor a 0."); setActiveTab("esencial"); return; }
    if (!form.id.trim()) { setFormError("El ID del producto es obligatorio."); setActiveTab("config"); return; }

    try {
      setUploadingImage(true);
      let finalImageUrl = form.imageUrl || "";
      if (form.imageFile) finalImageUrl = await uploadImage(form.imageFile);
      const cleanedImages = Array.from(new Set((form.imagesKeys || []).map((i) => i.trim()).filter(Boolean)));
      const { imageFile, ...cleanForm } = form;
      await onSave({
        ...cleanForm,
        imageUrl: finalImageUrl,
        price: Number(form.price || 0),
        discount: Number(form.discount || 0),
        benefits: textToBenefits(benefitsText),
        imagesKeys: cleanedImages,
        imageKey: finalImageUrl ? "" : form.imageKey?.trim() || cleanedImages[0] || "",
        stockQty: Number(form.stockQty || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        featured: form.featured === true,
      });
    } catch {
      setFormError("No se pudo guardar el producto. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="admin-editor-layout">
      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Tab navigation */}
        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab ${activeTab === tab.id ? "admin-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Lo esencial ── */}
        {activeTab === "esencial" && (
          <div className="admin-tab-content">
            <div className="admin-form-grid">
              <label className="admin-field admin-field-full">
                <span>Nombre del producto <em className="admin-required">*</em></span>
                <input className="input" name="title" value={form.title} onChange={handleTitleChange} required placeholder="Ej: Cleansing Bubbles 200ml" />
              </label>

              <label className="admin-field admin-field-full">
                <span>Descripción corta <em className="admin-required">*</em></span>
                <input className="input" name="desc" value={form.desc} onChange={handleChange} required placeholder="Ej: Gel de limpieza con niacinamida..." />
              </label>

              <label className="admin-field">
                <span>Precio ($) <em className="admin-required">*</em></span>
                <input className="input" type="number" name="price" value={form.price} onChange={handleChange} min="0" required />
                <small className="admin-help">Precio antes de descuentos.</small>
              </label>

              <label className="admin-field">
                <span>Stock disponible</span>
                <input className="input" type="number" name="stockQty" value={form.stockQty} onChange={handleChange} min="0" />
                <small className="admin-help">Cantidad de unidades en stock.</small>
              </label>

              <label className="admin-field">
                <span>Avisar stock bajo cuando queden</span>
                <input className="input" type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" />
                <small className="admin-help">Se muestra "Últimas unidades" por debajo de este número.</small>
              </label>
            </div>

            {/* Imágenes — panel colapsable */}
            <div className="admin-field admin-field-full" style={{ marginTop: 24 }}>
              <span className="admin-field-label">Imagen del producto</span>

              {/* Vista compacta: imagen actual + botones de acción */}
              <div className="admin-image-compact">
                {mainImagePreview ? (
                  <img className="admin-image-compact-thumb" src={mainImagePreview} alt="Imagen actual" />
                ) : (
                  <div className="admin-image-compact-empty">Sin imagen</div>
                )}

                <div className="admin-image-compact-actions">
                  {mainImagePreview && (
                    <span className="admin-image-compact-name">
                      {form.imageUrl ? "Foto subida" : form.imageKey || "Imagen seleccionada"}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="admin-action-btn admin-action-btn-secondary"
                      onClick={() => setImagePanelOpen((v) => !v)}
                    >
                      {imagePanelOpen ? "Cerrar selector" : mainImagePreview ? "Cambiar imagen" : "Elegir imagen"}
                    </button>

                    {/* Subir desde dispositivo */}
                    <label className="admin-upload-button">
                      📷 Subir foto
                      <input type="file" accept="image/*" onChange={(e) => { handleUploadFile(e.target.files?.[0]); setImagePanelOpen(false); }} />
                    </label>

                    {mainImagePreview && (
                      <button type="button" className="admin-ghost-btn" onClick={clearImages}>
                        Quitar
                      </button>
                    )}
                  </div>

                  {form.imageFile && (
                    <button type="button" className="admin-action-btn admin-action-btn-primary" disabled={uploadingImage} onClick={uploadSelectedImageNow}>
                      {uploadingImage ? "Subiendo…" : `Subir "${form.imageFile.name}"`}
                    </button>
                  )}
                </div>
              </div>

              {/* Panel expandible: selector de catálogo */}
              {imagePanelOpen && (
                <div className="admin-image-panel">
                  <div className="admin-image-toolbar">
                    <input
                      type="text"
                      placeholder="Buscar imagen…"
                      value={imageSearch}
                      onChange={(e) => setImageSearch(e.target.value)}
                      autoFocus
                    />
                    <div className="admin-image-filters">
                      {IMAGE_FILTERS.map((f) => (
                        <button key={f.id} type="button" className={`admin-filter-btn ${imageFilter === f.id ? "active" : ""}`} onClick={() => setImageFilter(f.id)}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-image-grid">
                    {filteredImages.map((imageName) => {
                      const src = resolveImage(imageName);
                      const isMain = form.imageKey === imageName && !form.imageUrl;
                      const isGallery = form.imagesKeys.includes(imageName);
                      return (
                        <article key={imageName} className={`admin-image-card ${isMain ? "is-main" : ""} ${isGallery ? "is-selected" : ""}`}>
                          <button type="button" className="admin-image-thumb" onClick={() => selectMainImage(imageName)}>
                            <img src={src} alt={imageName} />
                            {isMain ? <span className="admin-image-badge">✓ Principal</span> : null}
                          </button>
                          <div className="admin-image-actions">
                            <button type="button" onClick={() => selectMainImage(imageName)}>Principal</button>
                            <button type="button" onClick={() => handleToggleGalleryImage(imageName)}>
                              {isGallery ? "Quitar galería" : "Galería"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {filteredImages.length === 0 && <p className="admin-help">No hay imágenes con ese filtro.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: Precios y descuentos ── */}
        {activeTab === "precios" && (
          <div className="admin-tab-content">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Descuento general (%)</span>
                <input className="input" type="number" name="discount" value={form.discount} onChange={handleChange} min="0" max="100" />
                <small className="admin-help">Dejá en 0 si no tiene descuento.</small>
              </label>

              <div className="admin-field">
                <span>Vista previa del precio</span>
                <div className="admin-price-preview">
                  <div>Precio original: <strong>${formatARS(basePrice)}</strong></div>
                  {discountPct > 0 ? <div>Con {discountPct}% OFF: <strong className="admin-price-final">${formatARS(previewFinalPrice)}</strong></div> : null}
                </div>
              </div>
            </div>

            <div className="admin-section-title" style={{ marginTop: 24 }}>Descuento por método de pago</div>
            <p className="admin-help" style={{ marginBottom: 16 }}>Podés darle un descuento extra a quien paga por transferencia, por ejemplo.</p>

            <div className="admin-payment-grid">
              {["transfer", "cash", "other"].map((method) => {
                const label = method === "transfer" ? "Transferencia" : method === "cash" ? "Efectivo" : "Otro medio";
                return (
                  <div className="admin-method-card" key={method}>
                    <label className="admin-check">
                      <input type="checkbox" checked={form.paymentOptions[method].enabled} onChange={(e) => handlePaymentChange(method, "enabled", e.target.checked)} />
                      <span><strong>{label}</strong></span>
                    </label>

                    {form.paymentOptions[method].enabled && (
                      <>
                        <label className="admin-field" style={{ marginTop: 8 }}>
                          <span>Descuento extra (%)</span>
                          <input className="input" type="number" value={form.paymentOptions[method].discountPct} onChange={(e) => handlePaymentChange(method, "discountPct", e.target.value)} min="0" max="100" placeholder="0" />
                        </label>
                        <label className="admin-check" style={{ marginTop: 6 }}>
                          <input type="checkbox" checked={form.paymentOptions[method].showDiscountLabel} onChange={(e) => handlePaymentChange(method, "showDiscountLabel", e.target.checked)} />
                          <span>Mostrar "% OFF" en la tarjeta</span>
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: Descripción detallada ── */}
        {activeTab === "descripcion" && (
          <div className="admin-tab-content">
            <div className="admin-form-grid">
              <label className="admin-field admin-field-full">
                <span>Tipo de piel</span>
                <select className="input" name="skinType" value={form.skinType} onChange={handleChange}>
                  {SKIN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <small className="admin-help">Aparece como "Ideal para:" en la tarjeta y habilita el filtro de tipo de piel.</small>
              </label>

              <label className="admin-field admin-field-full">
                <span>Beneficios <small>(uno por línea)</small></span>
                <textarea className="input admin-textarea" value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder={"Hidrata profundamente\nReduce el exceso de sebo\nApto para uso diario"} rows={5} />
                <small className="admin-help">Cada línea es un punto de la lista de beneficios en el modal.</small>
              </label>

              <label className="admin-field admin-field-full">
                <span>Cómo usar</span>
                <textarea className="input admin-textarea" name="howToUse" value={form.howToUse} onChange={handleChange} placeholder="Ej: Aplicar 2-3 gotas sobre la piel limpia. Masajear suavemente hasta absorber. Usar mañana y noche." rows={3} />
              </label>

              <label className="admin-field admin-field-full">
                <span>Ingredientes / Detalles</span>
                <textarea className="input admin-textarea" name="details" value={form.details} onChange={handleChange} placeholder="Ej: Niacinamida 10%, Zinc 1%, Aqua..." rows={3} />
              </label>
            </div>
          </div>
        )}

        {/* ── TAB 4: Configuración ── */}
        {activeTab === "config" && (
          <div className="admin-tab-content">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Categoría</span>
                <select className="input" name="type" value={form.type} onChange={handleChange}>
                  {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <small className="admin-help">Determina en qué sección del catálogo aparece.</small>
              </label>

              <label className="admin-field">
                <span>ID del producto</span>
                <input className="input" name="id" value={form.id} onChange={handleChange} required placeholder="se-genera-del-nombre" />
                <small className="admin-help">Se genera automáticamente del nombre. Solo tocá si sabés lo que hacés.</small>
              </label>

              <div className="admin-field admin-field-full">
                <span className="admin-field-label">Visibilidad</span>
                <div className="admin-toggle-group">
                  <label className="admin-toggle-option">
                    <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                    <div>
                      <strong>Producto activo</strong>
                      <p>Si está desactivado, no aparece en el catálogo.</p>
                    </div>
                  </label>
                  <label className="admin-toggle-option">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                    <div>
                      <strong>⭐ Producto destacado</strong>
                      <p>Aparece en la sección "Destacados" de la home.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="admin-field admin-field-full">
                <span className="admin-field-label">Opciones de entrega</span>
                <div className="admin-payment-grid">
                  <label className="admin-check admin-method-card">
                    <input type="checkbox" checked={form.deliveryOptions.necochea.enabled} onChange={(e) => handleDeliveryChange("necochea", "enabled", e.target.checked)} />
                    <span>📍 En Necochea</span>
                  </label>
                  <label className="admin-check admin-method-card">
                    <input type="checkbox" checked={form.deliveryOptions.shipping.enabled} onChange={(e) => handleDeliveryChange("shipping", "enabled", e.target.checked)} />
                    <span>📦 Envío</span>
                  </label>
                  <div className="admin-method-card">
                    <label className="admin-check">
                      <input type="checkbox" checked={form.deliveryOptions.moto.enabled} onChange={(e) => handleDeliveryChange("moto", "enabled", e.target.checked)} />
                      <span>🛵 Motoenvío</span>
                    </label>
                    {form.deliveryOptions.moto.enabled && (
                      <label className="admin-field" style={{ marginTop: 8 }}>
                        <span>Costo del motoenvío ($)</span>
                        <input className="input" type="number" value={form.deliveryOptions.moto.price} onChange={(e) => handleDeliveryChange("moto", "price", e.target.value)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error global */}
        {formError ? <p className="admin-error" style={{ marginTop: 12 }}>{formError}</p> : null}

        <div className="admin-form-actions">
          <button className="btn" type="submit" disabled={saving || uploadingImage}>
            {saving || uploadingImage ? "Guardando…" : "Guardar producto"}
          </button>
          <button className="btn btn-outline" type="button" onClick={onCancel} disabled={saving || uploadingImage}>
            Cancelar
          </button>
        </div>
      </form>

      <aside className="admin-preview-panel">
        <div className="admin-preview-sticky">
          <h3>Vista previa</h3>
          <p className="admin-help">Así se ve en la tienda.</p>
          <div className="admin-preview-card">
            <ProductCard product={previewProduct} />
          </div>
        </div>
      </aside>
    </div>
  );
}
