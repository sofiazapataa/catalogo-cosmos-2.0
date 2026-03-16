import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { auth } from "../../services/auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <section className="admin-panel">
          <div className="admin-topbar">
            <div>
              <h2 className="page-title">Ingreso Admin</h2>
              <p className="page-lead">
                Solo vos podés acceder al panel de administración.
              </p>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kosmos.com"
                  required
                />
              </label>

              <label className="admin-field">
                <span>Contraseña</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </label>
            </div>

            {error ? (
              <p style={{ color: "crimson", margin: 0 }}>{error}</p>
            ) : null}

            <div className="admin-form-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Entrar"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}