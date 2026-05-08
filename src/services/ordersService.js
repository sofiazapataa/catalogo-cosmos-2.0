import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

function sanitizeItems(items = []) {
  return items.map((item) => ({
    id: item.id,
    title: item.title || "",
    price: Number(item.price || 0),
    discount: Number(item.discount || 0),
    qty: Number(item.qty || 1),
    image: item.image || "",
    type: item.type || "",
  }));
}

export async function createOrder({
  items = [],
  paymentMethod = "transfer",
  total = 0,
}) {
  const ordersRef = collection(db, "orders");

  const payload = {
    items: sanitizeItems(items),
    paymentMethod,
    total: Number(total || 0),

    status: "pending",

    source: "whatsapp",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersRef, payload);

  return {
    id: docRef.id,
  };
}