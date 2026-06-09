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
      collectionName: "products",
    };
  }

  const comboRef = doc(db, "combos", itemId);
  const comboSnap = await transaction.get(comboRef);

  if (comboSnap.exists()) {
    return {
      ref: comboRef,
      snap: comboSnap,
      collectionName: "combos",
    };
  }

  return null;
}

function buildStockError(items = []) {
  const error = new Error("STOCK_ERROR");
  error.code = "STOCK_ERROR";
  error.items = items;
  return error;
}

export async function validateOrderStock(items = []) {
  const cleanItems = sanitizeItems(items);
  const problems = [];

  for (const item of cleanItems) {
    const productSnap = await getDoc(doc(db, "products", item.id));
    const comboSnap = !productSnap.exists()
      ? await getDoc(doc(db, "combos", item.id))
      : null;

    const snap = productSnap.exists() ? productSnap : comboSnap;

    if (!snap || !snap.exists()) {
      problems.push({
        id: item.id,
        title: item.title,
        requested: Number(item.qty || 1),
        available: 0,
        reason: "not-found",
      });

      continue;
    }

    const data = snap.data();
    const active = data.active !== false;
    const available = Number(data.stockQty || 0);
    const requested = Number(item.qty || 1);

    if (!active) {
      problems.push({
        id: item.id,
        title: item.title,
        requested,
        available: 0,
        reason: "inactive",
      });

      continue;
    }

    if (available <= 0) {
      problems.push({
        id: item.id,
        title: item.title,
        requested,
        available: 0,
        reason: "out",
      });

      continue;
    }

    if (requested > available) {
      problems.push({
        id: item.id,
        title: item.title,
        requested,
        available,
        reason: "low",
      });
    }
  }

  return {
    ok: problems.length === 0,
    problems,
  };
}

export async function createOrder({
  items = [],
  paymentMethod = "transfer",
  total = 0,
  customer = {},
}) {
  const cleanItems = sanitizeItems(items);

  const cleanCustomer = {
    name: customer.name || "",
    phone: customer.phone || "",
    deliveryType: customer.deliveryType || "pickup",
    address: customer.address || "",
    note: customer.note || "",
  };

  const orderId = await runTransaction(db, async (transaction) => {
    const orderRef = doc(collection(db, "orders"));
    const stockProblems = [];

    for (const item of cleanItems) {
      const found = await findProductRef(transaction, item.id);

      if (!found) {
        stockProblems.push({
          id: item.id,
          title: item.title,
          requested: Number(item.qty || 1),
          available: 0,
          reason: "not-found",
        });

        continue;
      }

      const productData = found.snap.data();
      const active = productData.active !== false;
      const currentStock = Number(productData.stockQty || 0);
      const qtyToSubtract = Number(item.qty || 1);

      if (!active) {
        stockProblems.push({
          id: item.id,
          title: item.title,
          requested: qtyToSubtract,
          available: 0,
          reason: "inactive",
        });

        continue;
      }

      if (currentStock <= 0) {
        stockProblems.push({
          id: item.id,
          title: item.title,
          requested: qtyToSubtract,
          available: 0,
          reason: "out",
        });

        continue;
      }

      if (qtyToSubtract > currentStock) {
        stockProblems.push({
          id: item.id,
          title: item.title,
          requested: qtyToSubtract,
          available: currentStock,
          reason: "low",
        });

        continue;
      }

      transaction.update(found.ref, {
        stockQty: currentStock - qtyToSubtract,
        updatedAt: serverTimestamp(),
      });
    }

    if (stockProblems.length > 0) {
      throw buildStockError(stockProblems);
    }

    transaction.set(orderRef, {
      items: cleanItems,
      customer: cleanCustomer,
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

      const currentStock = Number(found.snap.data().stockQty || 0);
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
  const q = query(ordersRef, orderBy("createdAt", "desc"));

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

  if (previousStatus === "cancelled" && status !== "cancelled") {
    await runTransaction(db, async (transaction) => {
      const stockProblems = [];

      for (const item of orderData.items || []) {
        const found = await findProductRef(transaction, item.id);

        if (!found) continue;

        const currentStock = Number(found.snap.data().stockQty || 0);
        const qty = Number(item.qty || 1);

        if (qty > currentStock) {
          stockProblems.push({
            id: item.id,
            title: item.title,
            requested: qty,
            available: currentStock,
            reason: "low",
          });

          continue;
        }

        transaction.update(found.ref, {
          stockQty: currentStock - qty,
          updatedAt: serverTimestamp(),
        });
      }

      if (stockProblems.length > 0) {
        throw buildStockError(stockProblems);
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