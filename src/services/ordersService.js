import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

export async function getOrders() {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(orderId) {
  const orderRef = doc(db, "orders", orderId);
  await deleteDoc(orderRef);
}