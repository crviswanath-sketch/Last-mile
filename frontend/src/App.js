import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DriversPage from "@/pages/DriversPage";
import ShipmentsPage from "@/pages/ShipmentsPage";
import CODPage from "@/pages/CODPage";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/shipments" element={<ProtectedRoute><AdminLayout><ShipmentsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/drivers" element={<ProtectedRoute><AdminLayout><DriversPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/cod" element={<ProtectedRoute><AdminLayout><CODPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
