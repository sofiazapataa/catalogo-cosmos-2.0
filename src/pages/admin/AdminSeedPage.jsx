import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { seedFirestore } from "../../services/seedFirestore";

export default function AdminSeedPage() {
  async function handleSeed() {
    try {
      await seedFirestore();
      alert("Firestore cargado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al cargar Firestore");
    }
  }

  return (
    <>
      <Header />

      <main className="container">
        <h2 className="page-title">Seed Firestore</h2>
        <p className="page-lead">
          Esto carga todos tus productos y combos en Firebase.
        </p>

        <div className="page-card">
          <button className="btn" type="button" onClick={handleSeed}>
            Cargar productos y combos
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}