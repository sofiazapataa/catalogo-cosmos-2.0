import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/auth";

export default function AdminLogoutButton() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    try {
      setError("");
      await signOut(auth);
      navigate("/admin-login");
    } catch (err) {
      console.error(err);
      setError("No se pudo cerrar sesión.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button className="btn btn-outline" type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
      {error ? <span style={{ fontSize: 12, color: "var(--color-error)" }}>{error}</span> : null}
    </div>
  );
}
