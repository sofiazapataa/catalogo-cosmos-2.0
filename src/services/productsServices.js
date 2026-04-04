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

function normalizeProductData(id, data) {
  const imageKey = cleanImageKey(data.imageKey);
  const imagesKeys = cleanImagesKeys(data.imagesKeys);

  return {
    firebaseId: id,
    ...data,
    imageKey,
    imagesKeys,
    image: imageKey ? resolveImage(imageKey) : null,
    images: resolveImages(imagesKeys),
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
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
  const payload = {
    ...product,
    imageKey: cleanImageKey(product.imageKey),
    imagesKeys: cleanImagesKeys(product.imagesKeys),
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
  };

  await setDoc(doc(db, "products", product.id), payload);
}

export async function saveCombo(combo) {
  const payload = {
    ...combo,
    imageKey: cleanImageKey(combo.imageKey),
    imagesKeys: cleanImagesKeys(combo.imagesKeys),
    benefits: Array.isArray(combo.benefits) ? combo.benefits : [],
  };

  await setDoc(doc(db, "combos", combo.id), payload);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function deleteCombo(id) {
  await deleteDoc(doc(db, "combos", id));
}