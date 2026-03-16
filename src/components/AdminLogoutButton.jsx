import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/auth";

export default function AdminLogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/admin-login");
    } catch (error) {
      console.error(error);
      alert("No se pudo cerrar sesión.");
    }
  }

  return (
    <button className="btn btn-outline" type="button" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
}