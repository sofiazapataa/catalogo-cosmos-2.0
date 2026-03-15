import { useEffect, useState } from "react";
import { getProducts } from "../services/productsServices";

export function useProducts() {
  const [stock, setStock] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setStock(data.stock || []);
      setCombos(data.combos || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    stock,
    combos,
    loading,
    error,
    reload: loadProducts,
  };
}