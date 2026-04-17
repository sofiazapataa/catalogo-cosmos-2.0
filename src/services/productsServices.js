import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
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
    image: imageKey ? resolveImage(imageKey) : null,
    images: resolveImages(imagesKeys),
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
  };
}

function buildSavePayload(item) {
  const imageKey = cleanImageKey(item.imageKey);
  const imagesKeys = cleanImagesKeys(item.imagesKeys);
  const discount = toNumber(item.discount, 0);

  return {
    ...item,
    price: toNumber(item.price, 0),
    discount,
    stockQty: toNumber(item.stockQty, 0),
    lowStockThreshold: toNumber(item.lowStockThreshold, 3),
    imageKey,
    imagesKeys,
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
  };
}

export async function getProducts() {
  const productsRef = collection(db, "products");
  const combosRef = collection(db, "combos");

  const [productsSnapshot, combosSnapshot] = await Promise.all([
    getDocs(productsRef),
    getDocs(combosRef),
  ]);

  const stock = productsSnapshot.docs.map((docItem) =>
    normalizeProductData(docItem.id, docItem.data())
  );

  const combos = combosSnapshot.docs.map((docItem) =>
    normalizeProductData(docItem.id, docItem.data())
  );

  return {
    combos,
    stock,
  };
}

export async function saveProduct(product) {
  const payload = buildSavePayload(product);
  await setDoc(doc(db, "products", payload.id), payload);
}

export async function saveCombo(combo) {
  const payload = buildSavePayload(combo);
  await setDoc(doc(db, "combos", payload.id), payload);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function deleteCombo(id) {
  await deleteDoc(doc(db, "combos", id));
}