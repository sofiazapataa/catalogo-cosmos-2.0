import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { resolveImage, resolveImages } from "../utils/imageMap";

export async function getProducts() {
  const productsRef = collection(db, "products");
  const combosRef = collection(db, "combos");

  const [productsSnapshot, combosSnapshot] = await Promise.all([
    getDocs(productsRef),
    getDocs(combosRef),
  ]);

  const stock = productsSnapshot.docs.map((docItem) => {
    const data = docItem.data();

    return {
      firebaseId: docItem.id,
      ...data,
      image: data.imageKey ? resolveImage(data.imageKey) : null,
      images: Array.isArray(data.imagesKeys)
        ? resolveImages(data.imagesKeys)
        : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
    };
  });

  const combos = combosSnapshot.docs.map((docItem) => {
    const data = docItem.data();

    return {
      firebaseId: docItem.id,
      ...data,
      image: data.imageKey ? resolveImage(data.imageKey) : null,
      images: Array.isArray(data.imagesKeys)
        ? resolveImages(data.imagesKeys)
        : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
    };
  });

  return {
    combos,
    stock,
  };
}

export async function saveProduct(product) {
  await setDoc(doc(db, "products", product.id), product);
}

export async function saveCombo(combo) {
  await setDoc(doc(db, "combos", combo.id), combo);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function deleteCombo(id) {
  await deleteDoc(doc(db, "combos", id));
}