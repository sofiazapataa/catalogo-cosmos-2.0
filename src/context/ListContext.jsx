import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// ─── Contexts ──────────────────────────────────────────────
// Split into read / write so components that only mutate the list
// (addToList, removeOne, etc.) don't re-render when items change.
const ListReadContext  = createContext(null);
const ListWriteContext = createContext(null);

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

  // ─── Write operations (stable refs — no deps that change) ───
  const showToast = useCallback((message) => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, id: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const addToList = useCallback((product) => {
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
  }, [showToast]);

  const removeOne = useCallback((productId) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === productId);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((i) => i.id !== productId);
      return prev.map((i) =>
        i.id === productId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  }, []);

  const deleteItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const setQty = useCallback((productId, qty) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== productId);
      return prev.map((i) => (i.id === productId ? { ...i, qty } : i));
    });
  }, []);

  // ─── WriteContext value — stable, never changes ──────────────
  const writeValue = useMemo(
    () => ({ addToList, removeOne, deleteItem, clearList, setQty }),
    [addToList, removeOne, deleteItem, clearList, setQty]
  );

  // ─── Read-only derived values ────────────────────────────────
  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((acc, it) => acc + it.qty, 0),
    [items]
  );

  const getQty = useCallback(
    (productId) => {
      const found = items.find((i) => i.id === productId);
      return found ? found.qty : 0;
    },
    [items]
  );

  // ─── ReadContext value — changes when items / toast change ───
  const readValue = useMemo(
    () => ({ items, count, total, getQty, toast }),
    [items, count, total, getQty, toast]
  );

  return (
    <ListWriteContext.Provider value={writeValue}>
      <ListReadContext.Provider value={readValue}>
        {children}
      </ListReadContext.Provider>
    </ListWriteContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────

/** Read-only: items, count, total, getQty, toast */
export function useListRead() {
  const ctx = useContext(ListReadContext);
  if (!ctx) throw new Error("useListRead debe usarse dentro de <ListProvider />");
  return ctx;
}

/** Write-only: addToList, removeOne, deleteItem, clearList, setQty */
export function useListWrite() {
  const ctx = useContext(ListWriteContext);
  if (!ctx) throw new Error("useListWrite debe usarse dentro de <ListProvider />");
  return ctx;
}

/** Convenience: merges read + write (use only when you need both, e.g. MyListPage) */
export function useList() {
  return { ...useListRead(), ...useListWrite() };
}
