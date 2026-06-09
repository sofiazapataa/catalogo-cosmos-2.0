import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import WhatsAppFab from "./components/WhatsAppFab";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";

// Páginas secundarias — se cargan solo cuando se navega a ellas
const NotFoundPage      = lazy(() => import("./pages/NotFoundPage"));
const MyListPage        = lazy(() => import("./pages/MyListPage"));
const ProductPage       = lazy(() => import("./pages/ProductPage"));
const AboutPage         = lazy(() => import("./pages/AboutPage"));
const ContactPage       = lazy(() => import("./pages/ContactPage"));

// Admin — nunca se carga para las clientas del catálogo
const AdminLoginPage        = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminPage             = lazy(() => import("./pages/admin/AdminPage"));
const AdminProductsPage     = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminCombosPage       = lazy(() => import("./pages/admin/AdminCombosPage"));
const AdminOrdersPage       = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminTestimonialsPage = lazy(() => import("./pages/admin/AdminTestimonialsPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/mi-lista"       element={<MyListPage />} />
          <Route path="/producto/:id"   element={<ProductPage />} />
          <Route path="/sobre-la-marca" element={<AboutPage />} />
          <Route path="/contacto"       element={<ContactPage />} />

          <Route path="/admin-login" element={<AdminLoginPage />} />

          <Route path="/admin" element={
            <ProtectedRoute><AdminPage /></ProtectedRoute>
          } />
          <Route path="/admin/productos" element={
            <ProtectedRoute><AdminProductsPage /></ProtectedRoute>
          } />
          <Route path="/admin/combos" element={
            <ProtectedRoute><AdminCombosPage /></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute><AdminOrdersPage /></ProtectedRoute>
          } />
          <Route path="/admin/testimonios" element={
            <ProtectedRoute><AdminTestimonialsPage /></ProtectedRoute>
          } />

          {/* 404 — cualquier ruta no definida */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <WhatsAppFab />
    </BrowserRouter>
  );
}
