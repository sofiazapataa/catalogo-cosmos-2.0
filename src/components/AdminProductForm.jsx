import { useEffect, useState } from "react";

function benefitsToText(benefits) {
  return Array.isArray(benefits) ? benefits.join("\n") : "";
}

function textToBenefits(text) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function imagesToText(imagesKeys) {
  return Array.isArray(imagesKeys) ? imagesKeys.join("\n") : "";
}

function textToImages(text) {
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
  const [imagesText, setImagesText] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        stockQty: Number(initialData.stockQty ?? 0),
        lowStockThreshold: Number(initialData.lowStockThreshold ?? 3),
      });
      setBenefitsText(benefitsToText(initialData.benefits));
      setImagesText(imagesToText(initialData.imagesKeys));
    } else {
      setForm({
        ...EMPTY_FORM,
        category: mode === "combo" ? "combo" : "stock",
        type: mode === "combo" ? "combos" : "",
      });
      setBenefitsText("");
      setImagesText("");
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

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      benefits: textToBenefits(benefitsText),
      imagesKeys: textToImages(imagesText),
      stockQty: Number(form.stockQty || 0),
      lowStockThreshold: Number(form.lowStockThreshold || 0),
    };

    if (!payload.imageKey && payload.imagesKeys.length > 0) {
      payload.imageKey = payload.imagesKeys[0];
    }

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
            placeholder="boosting-drops"
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
            placeholder="Boosting Drops"
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
            placeholder="Serum booster para potenciar tu rutina"
            required
          />
        </label>

        <label className="admin-field">
          <span>Precio</span>
          <input
            className="input"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-field">
          <span>Descuento</span>
          <input
            className="input"
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
        </label>

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
            placeholder={mode === "combo" ? "combos" : "serums"}
          />
        </label>

        <label className="admin-field">
          <span>Imagen principal (`imageKey`)</span>
          <input
            className="input"
            name="imageKey"
            value={form.imageKey}
            onChange={handleChange}
            placeholder="serum-hidratante.jpg"
          />
        </label>

        <label className="admin-field">
          <span>Tipo de piel</span>
          <input
            className="input"
            name="skinType"
            value={form.skinType}
            onChange={handleChange}
            placeholder="Apto para todo tipo de piel"
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
          <span>Alerta stock bajo</span>
          <input
            className="input"
            type="number"
            name="lowStockThreshold"
            value={form.lowStockThreshold}
            onChange={handleChange}
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Imágenes (`imagesKeys`) · una por línea</span>
          <textarea
            className="input admin-textarea"
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            placeholder={"serum-hidratante.jpg\nserum-hidratante-2.jpg"}
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Beneficios · uno por línea</span>
          <textarea
            className="input admin-textarea"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
            placeholder={
              "Potencia la rutina\nAporta luminosidad\nHidratación ligera"
            }
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