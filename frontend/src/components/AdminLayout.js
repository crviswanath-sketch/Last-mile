import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Package, Users, BarChart3, LogOut, Menu, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/admin", icon: BarChart3, label: "Dashboard" },
    { path: "/admin/shipments", icon: Package, label: "Shipments" },
    { path: "/admin/drivers", icon: Users, label: "Drivers" },
    { path: "/admin/cod", icon: DollarSign, label: "COD Reconciliation" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-slate-200 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>LOGITRACK PRO</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all cursor-pointer select-none ${isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                style={{ pointerEvents: 'auto' }}
              >
                <Icon className="w-5 h-5 pointer-events-none" />
                <span className="font-medium pointer-events-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-all"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-md"
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>Admin Panel</h1>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
