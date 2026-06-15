import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { resolveImage, resolveImages } from "../utils/imageMap";

function cleanImageKey(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanImagesKeys(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    )
  );
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function removeUndefinedValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function normalizeProductData(id, data) {
  const imageKey = cleanImageKey(data.imageKey);
  const imagesKeys = cleanImagesKeys(data.imagesKeys);
  const discount = toNumber(data.discount, 0);

  return {
    firebaseId: id,
    ...data,
    id: data.id || id,
    price: toNumber(data.price, 0),
    discount,
    stockQty: toNumber(data.stockQty, 0),
    lowStockThreshold: toNumber(data.lowStockThreshold, 3),
    imageKey,
    imagesKeys,
   image: data.imageUrl || (imageKey ? resolveImage(imageKey) : null),
    images: resolveImages(imagesKeys),
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
    active: data.active !== false,
    featured: data.featured === true,
  };
}

function buildSavePayload(item) {
  const imageKey = cleanImageKey(item.imageKey);
  const imagesKeys = cleanImagesKeys(item.imagesKeys);
  const discount = toNumber(item.discount, 0);

  const { firebaseId, image, images, ...cleanItem } = item;

  return removeUndefinedValues({
    ...cleanItem,
    price: toNumber(item.price, 0),
    discount,
    stockQty: toNumber(item.stockQty, 0),
    lowStockThreshold: toNumber(item.lowStockThreshold, 3),
    imageKey,
    imagesKeys,
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
    active: item.active !== false,
    featured: item.featured === true,
  });
}

export async function getProductById(id) {
  const productSnap = await getDoc(doc(db, "products", id));
  if (productSnap.exists()) {
    return normalizeProductData(productSnap.id, productSnap.data());
  }
  const comboSnap = await getDoc(doc(db, "combos", id));
  if (comboSnap.exists()) {
    return normalizeProductData(comboSnap.id, comboSnap.data());
  }
  return null;
}

export async function getProducts() {
  const activeFilter = where("active", "!=", false);
  const productsQuery = query(collection(db, "products"), activeFilter);
  const combosQuery   = query(collection(db, "combos"),   activeFilter);

  const [productsSnapshot, combosSnapshot] = await Promise.all([
    getDocs(productsQuery),
    getDocs(combosQuery),
  ]);

  const stock = productsSnapshot.docs.map((docItem) =>
    normalizeProductData(docItem.id, docItem.data())
  );

  const combos = combosSnapshot.docs.map((docItem) =>
    normalizeProductData(docItem.id, docItem.data())
  );

  return { combos, stock };
}

export async function saveProduct(product) {
  const payload = buildSavePayload(product);
  await setDoc(doc(db, "products", payload.id), payload);
}

export async function saveCombo(combo) {
  const payload = buildSavePayload(combo);
  await setDoc(doc(db, "combos", payload.id), payload);
}

export async function updateProductPartial(id, partialData) {
  const payload = removeUndefinedValues({
    ...partialData,
    id,
  });

  await setDoc(doc(db, "products", id), payload, { merge: true });
}

export async function updateComboPartial(id, partialData) {
  const payload = removeUndefinedValues({
    ...partialData,
    id,
  });

  await setDoc(doc(db, "combos", id), payload, { merge: true });
}

export async function duplicateProduct(product) {
  const newId = `${product.id}-copia-${Date.now()}`;

  const payload = buildSavePayload({
    ...product,
    id: newId,
    title: `${product.title} copia`,
    active: false,
    featured: false,
  });

  await setDoc(doc(db, "products", newId), payload);
}

export async function duplicateCombo(combo) {
  const newId = `${combo.id}-copia-${Date.now()}`;

  const payload = buildSavePayload({
    ...combo,
    id: newId,
    title: `${combo.title} copia`,
    active: false,
    featured: false,
  });

  await setDoc(doc(db, "combos", newId), payload);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function deleteCombo(id) {
  await deleteDoc(doc(db, "combos", id));
}