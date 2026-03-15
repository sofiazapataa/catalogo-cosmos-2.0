import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyListPage from "./pages/MyListPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import WhatsAppFab from "./components/WhatsAppFab";

import AdminPage from "./pages/admin/AdminPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCombosPage from "./pages/admin/AdminCombosPage";
import AdminSeedPage from "./pages/admin/AdminSeedPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mi-lista" element={<MyListPage />} />
        <Route path="/sobre-la-marca" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/productos" element={<AdminProductsPage />} />
        <Route path="/admin/combos" element={<AdminCombosPage />} />
        <Route path="/admin/seed" element={<AdminSeedPage />} />
      </Routes>

      <WhatsAppFab />
    </BrowserRouter>
  );
}