import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const ListContext = createContext(null);

const STORAGE_KEY = "kosmos_my_list_v1";

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ListProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? safeParse(saved) : [];
  });

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function showToast(message) {
    clearTimeout(toastTimerRef.current);
    setToast({ message, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }

  function addToList(product) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.title} agregado a tu lista`);
  }

  function removeOne(productId) {
    setItems((prev) => {
      const found = prev.find((i) => i.id === productId);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((i) => i.id !== productId);
      return prev.map((i) =>
        i.id === productId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }

  function deleteItem(productId) {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }

  function clearList() {
    setItems([]);
  }

  function getQty(productId) {
    const found = items.find((i) => i.id === productId);
    return found ? found.qty : 0;
  }

  function setQty(productId, qty) {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== productId);
      return prev.map((i) => (i.id === productId ? { ...i, qty } : i));
    });
  }

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [items]);

  const count = useMemo(() => {
    return items.reduce((acc, it) => acc + it.qty, 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addToList,
      removeOne,
      deleteItem,
      clearList,
      getQty,
      setQty,
      total,
      count,
      toast,
    }),
    [items, total, count, toast]
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useList() {
  const ctx = useContext(ListContext);
  if (!ctx) {
    throw new Error("useList debe usarse dentro de <ListProvider />");
  }
  return ctx;
}
