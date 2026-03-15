import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { stock, combos } from "../data/products";

function mapItem(item, defaultCategory, defaultType) {
  return {
    id: item.id,
    title: item.title,
    desc: item.desc,
    price: item.price,
    discount: item.discount || 0,
    category: item.category || defaultCategory,
    type: item.type || defaultType,
    imageKey: item.imageKey || null,
    imagesKeys: Array.isArray(item.imagesKeys) ? item.imagesKeys : [],
    skinType: item.skinType || "",
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
    howToUse: item.howToUse || "",
    details: item.details || "",
    active: true,
    createdAt: Date.now(),
  };
}

export async function seedFirestore() {
  for (const product of stock) {
    const mapped = mapItem(product, "stock", "");
    await setDoc(doc(db, "products", mapped.id), mapped);
  }

  for (const combo of combos) {
    const mapped = mapItem(combo, "combo", "combos");
    await setDoc(doc(db, "combos", mapped.id), mapped);
  }

  console.log("✅ Firestore cargado con productos y combos");
}