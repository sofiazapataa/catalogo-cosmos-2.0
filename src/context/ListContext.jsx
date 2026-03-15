// Sirve para compartir datos entre componentes. Sirve para compartir datos entre componentes.
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ✅ Agrega producto o suma cantidad si ya existe
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
  }

  // ✅ Resta 1 (si llega a 0, lo saca)
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

  // ✅ Elimina el item completo
  function deleteItem(productId) {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }

  // ✅ Borra toda la lista
  function clearList() {
    setItems([]);
  }

  // ✅ Devuelve cantidad de un producto en la lista (0 si no está)
  function getQty(productId) {
    const found = items.find((i) => i.id === productId);
    return found ? found.qty : 0;
  }

  // ✅ Setea cantidad exacta (si <=0, elimina)
  function setQty(productId, qty) {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== productId);
      return prev.map((i) => (i.id === productId ? { ...i, qty } : i));
    });
  }

  // ✅ Total (sumatoria de price * qty)
  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.qty, 0);
  }, [items]);

  // ✅ Cantidad total de items (sumatoria de qty)
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
    }),
    [items, total, count]
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