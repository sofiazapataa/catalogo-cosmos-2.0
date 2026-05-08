import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
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

async function findProductRef(transaction, itemId) {
  const productRef = doc(db, "products", itemId);
  const productSnap = await transaction.get(productRef);

  if (productSnap.exists()) {
    return {
      ref: productRef,
      snap: productSnap,
    };
  }

  const comboRef = doc(db, "combos", itemId);
  const comboSnap = await transaction.get(comboRef);

  if (comboSnap.exists()) {
    return {
      ref: comboRef,
      snap: comboSnap,
    };
  }

  return null;
}

export async function createOrder({
  items = [],
  paymentMethod = "transfer",
  total = 0,
}) {
  const cleanItems = sanitizeItems(items);

  const orderId = await runTransaction(db, async (transaction) => {
    const orderRef = doc(collection(db, "orders"));

    for (const item of cleanItems) {
      const found = await findProductRef(transaction, item.id);

      if (!found) continue;

      const currentStock = Number(found.snap.data().stockQty || 0);

      const qtyToSubtract = Number(item.qty || 1);

      const nextStock = Math.max(
        0,
        currentStock - qtyToSubtract
      );

      transaction.update(found.ref, {
        stockQty: nextStock,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.set(orderRef, {
      items: cleanItems,
      paymentMethod,
      total: Number(total || 0),

      status: "pending",

      stockRestored: false,

      source: "whatsapp",

      createdAt: serverTimestamp(),
    });

    return orderRef.id;
  });

  return {
    id: orderId,
  };
}

async function restoreStock(items = []) {
  await runTransaction(db, async (transaction) => {
    for (const item of items) {
      const found = await findProductRef(transaction, item.id);

      if (!found) continue;

      const currentStock = Number(
        found.snap.data().stockQty || 0
      );

      const qtyToRestore = Number(item.qty || 1);

      transaction.update(found.ref, {
        stockQty: currentStock + qtyToRestore,
        updatedAt: serverTimestamp(),
      });
    }
  });
}

export async function getOrders() {
  const ordersRef = collection(db, "orders");

  const q = query(
    ordersRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function updateOrderStatus(orderId, status) {
  const orderRef = doc(db, "orders", orderId);

  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error("Pedido no encontrado");
  }

  const orderData = orderSnap.data();

  const previousStatus = orderData.status;

  if (
    status === "cancelled" &&
    previousStatus !== "cancelled" &&
    !orderData.stockRestored
  ) {
    await restoreStock(orderData.items || []);

    await updateDoc(orderRef, {
      status,
      stockRestored: true,
      updatedAt: serverTimestamp(),
    });

    return;
  }

  if (
    previousStatus === "cancelled" &&
    status !== "cancelled"
  ) {
    await runTransaction(db, async (transaction) => {
      for (const item of orderData.items || []) {
        const found = await findProductRef(
          transaction,
          item.id
        );

        if (!found) continue;

        const currentStock = Number(
          found.snap.data().stockQty || 0
        );

        const qty = Number(item.qty || 1);

        transaction.update(found.ref, {
          stockQty: Math.max(0, currentStock - qty),
          updatedAt: serverTimestamp(),
        });
      }
    });

    await updateDoc(orderRef, {
      status,
      stockRestored: false,
      updatedAt: serverTimestamp(),
    });

    return;
  }

  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(orderId) {
  const orderRef = doc(db, "orders", orderId);

  await deleteDoc(orderRef);
}