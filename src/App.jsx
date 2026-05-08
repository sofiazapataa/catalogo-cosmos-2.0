import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyListPage from "./pages/MyListPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import WhatsAppFab from "./components/WhatsAppFab";

import AdminPage from "./pages/admin/AdminPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminCombosPage from "./pages/admin/AdminCombosPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mi-lista" element={<MyListPage />} />
        <Route path="/sobre-la-marca" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        <Route path="/admin-login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/combos"
          element={
            <ProtectedRoute>
              <AdminCombosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <WhatsAppFab />
    </BrowserRouter>
  );
}