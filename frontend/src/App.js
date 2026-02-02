import { useState, useEffect, createContext, useContext, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  Truck, Package, Users, BarChart3, LogOut, Menu, X, Plus, 
  MapPin, Camera, DollarSign, Clock, CheckCircle, AlertCircle,
  Search, Filter, Eye, Edit, Trash2, UserPlus, ChevronRight,
  Phone, Mail, Car, FileText, Calendar, MessageSquare, Upload, Download
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await axios.post(`${API}/auth/login`, { username, password });
    const { token, ...userData } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return response.data;
  };

  const register = async (username, password, name) => {
    const response = await axios.post(`${API}/auth/register`, { username, password, name });
    const { token, ...userData } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Login Page
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
        toast.success("Welcome back!");
      } else {
        await register(username, password, name);
        toast.success("Account created successfully!");
      }
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1746985106190-6c116edec9bc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBkZWxpdmVyeSUyMHRydWNrJTIwY2l0eXxlbnwwfHx8fDE3Njk0MTkyMDh8MA&ixlib=rb-4.1.0&q=85"
          alt="Delivery truck"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Truck className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>LOGITRACK PRO</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>Streamline Your Deliveries</h1>
          <p className="text-lg opacity-90">Manage drivers, track shipments, and reconcile COD with precision.</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Truck className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>LOGITRACK PRO</span>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 mb-6">
              {isLogin ? "Sign in to your admin account" : "Register a new admin account"}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="John Doe"
                    required={!isLogin}
                    data-testid="register-name-input"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="admin"
                  required
                  data-testid="login-username-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                  data-testid="login-password-input"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                data-testid="login-submit-btn"
              >
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline text-sm"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar
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

// Admin Layout
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

// Dashboard Page
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, shipmentsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/shipments`)
      ]);
      setStats(statsRes.data);
      setRecentShipments(shipmentsRes.data.slice(0, 5));
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  const statCards = [
    { label: "Total Shipments", value: stats?.total_shipments || 0, icon: Package, color: "bg-blue-500" },
    { label: "Pending", value: stats?.pending_shipments || 0, icon: Clock, color: "bg-yellow-500" },
    { label: "In Transit", value: stats?.in_transit || 0, icon: Truck, color: "bg-purple-500" },
    { label: "Delivered", value: stats?.delivered || 0, icon: CheckCircle, color: "bg-green-500" },
    { label: "Total Drivers", value: stats?.total_drivers || 0, icon: Users, color: "bg-indigo-500" },
    { label: "Active Drivers", value: stats?.active_drivers || 0, icon: UserPlus, color: "bg-teal-500" },
  ];

  return (
    <div data-testid="dashboard-page">
      <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>DASHBOARD OVERVIEW</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow" data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>COD SUMMARY</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Total COD Amount</span>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{stats?.total_cod_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-700">Pending Reconciliation</span>
              <span className="text-xl font-bold text-yellow-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{stats?.pending_cod_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700">Reconciled</span>
              <span className="text-xl font-bold text-green-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{stats?.reconciled_cod_amount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>RECENT SHIPMENTS</h3>
            <button onClick={() => window.location.href = '/admin/shipments'} className="text-primary text-sm hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {recentShipments.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No shipments yet</p>
          ) : (
            <div className="space-y-3">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{shipment.tracking_number}</p>
                    <p className="text-sm text-slate-500">{shipment.customer_name}</p>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    assigned: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    picked_up: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    in_transit: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
    delivered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    completed: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    rescheduled: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    cancelled: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};

// Drivers Page
const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", vehicle_number: "", vehicle_type: "bike" });

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${API}/drivers`);
      setDrivers(res.data);
    } catch (err) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await axios.put(`${API}/drivers/${editingDriver.id}`, formData);
        toast.success("Driver updated successfully");
      } else {
        await axios.post(`${API}/drivers`, formData);
        toast.success("Driver created successfully");
      }
      setShowModal(false);
      setEditingDriver(null);
      setFormData({ name: "", phone: "", email: "", vehicle_number: "", vehicle_type: "bike" });
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || "",
      vehicle_number: driver.vehicle_number,
      vehicle_type: driver.vehicle_type
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`${API}/drivers/${id}`);
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (err) {
      toast.error("Failed to delete driver");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="drivers-page">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>DRIVERS</h2>
        <button
          onClick={() => { setEditingDriver(null); setFormData({ name: "", phone: "", email: "", vehicle_number: "", vehicle_type: "bike" }); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all"
          data-testid="add-driver-btn"
        >
          <Plus className="w-5 h-5" /> Add Driver
        </button>
      </div>

      {drivers.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No drivers yet. Add your first driver to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`driver-row-${driver.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{driver.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3" /> {driver.phone}</p>
                      {driver.email && <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {driver.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 flex items-center gap-1"><Car className="w-3 h-3" /> {driver.vehicle_number}</p>
                      <p className="text-xs text-slate-500 capitalize">{driver.vehicle_type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${driver.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                        {driver.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{driver.total_deliveries} deliveries</p>
                      <p className="text-sm text-yellow-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{driver.pending_cod?.toLocaleString() || 0} pending</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(driver)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md transition-all" data-testid={`edit-driver-${driver.id}`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(driver.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" data-testid={`delete-driver-${driver.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {editingDriver ? "EDIT DRIVER" : "ADD NEW DRIVER"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" required data-testid="driver-name-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" required data-testid="driver-phone-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" data-testid="driver-email-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number *</label>
                <input type="text" value={formData.vehicle_number} onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" required data-testid="driver-vehicle-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type *</label>
                <select value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" data-testid="driver-vehicle-type-select">
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-primary text-white rounded-md hover:bg-primary/90 transition-all" data-testid="save-driver-btn">{editingDriver ? "Update" : "Create"} Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Shipments Page
const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [formData, setFormData] = useState({
    shipment_type: "delivery",
    pickup_subtype: "",
    customer_name: "", 
    customer_phone: "", 
    pickup_address: "", 
    delivery_address: "",
    package_description: "", 
    number_of_items: 1,
    weight: "", 
    is_cod: false, 
    cod_amount: ""
  });
  const [deliveryProof, setDeliveryProof] = useState({ image_base64: "", latitude: "", longitude: "", notes: "" });
  const [followUpNote, setFollowUpNote] = useState("");
  const [rescheduleData, setRescheduleData] = useState({ reschedule_date: "", reschedule_time: "", reason: "", reassign_driver: false, new_driver_id: "" });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showPickupConfirmModal, setShowPickupConfirmModal] = useState(false);
  const [pickupConfirmData, setPickupConfirmData] = useState({ confirmed_items: "", confirmed_content: "" });
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [shipmentsRes, driversRes] = await Promise.all([
        axios.get(`${API}/shipments`),
        axios.get(`${API}/drivers`)
      ]);
      setShipments(shipmentsRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      shipment_type: "delivery",
      pickup_subtype: "",
      customer_name: "", 
      customer_phone: "", 
      pickup_address: "", 
      delivery_address: "",
      package_description: "", 
      number_of_items: 1,
      weight: "", 
      is_cod: false, 
      cod_amount: ""
    });
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        number_of_items: parseInt(formData.number_of_items) || 1,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        cod_amount: formData.is_cod ? parseFloat(formData.cod_amount) : 0
      };
      await axios.post(`${API}/shipments`, payload);
      toast.success("Shipment created successfully");
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create shipment");
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      await axios.post(`${API}/shipments/${selectedShipment.id}/assign/${driverId}`);
      toast.success("Driver assigned successfully");
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to assign driver");
    }
  };

  const handleMarkDelivered = async (shipment) => {
    // Open delivery proof modal instead of directly marking as delivered
    setSelectedShipment(shipment);
    setDeliveryProof({ image_base64: "", latitude: "", longitude: "", notes: "" });
    setShowDeliveryModal(true);
  };

  const handleOpenPickupConfirm = (shipment) => {
    setSelectedShipment(shipment);
    setPickupConfirmData({ 
      confirmed_items: shipment.number_of_items?.toString() || "1", 
      confirmed_content: shipment.package_description || "" 
    });
    setShowPickupConfirmModal(true);
  };

  const handlePickupCompleted = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/shipments/${selectedShipment.id}/pickup-completed`);
      toast.success("Pickup marked as completed!");
      setShowPickupConfirmModal(false);
      setPickupConfirmData({ confirmed_items: "", confirmed_content: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to complete pickup");
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      // First reschedule
      await axios.post(`${API}/shipments/${selectedShipment.id}/reschedule`, {
        reschedule_date: rescheduleData.reschedule_date,
        reschedule_time: rescheduleData.reschedule_time || null,
        reason: rescheduleData.reason || null
      });
      
      // If reassign driver is selected
      if (rescheduleData.reassign_driver && rescheduleData.new_driver_id) {
        await axios.post(`${API}/shipments/${selectedShipment.id}/assign/${rescheduleData.new_driver_id}`);
        toast.success("Shipment rescheduled and driver reassigned!");
      } else if (rescheduleData.reassign_driver && !rescheduleData.new_driver_id) {
        // Unassign driver using new endpoint
        await axios.post(`${API}/shipments/${selectedShipment.id}/unassign`);
        toast.success("Shipment rescheduled and driver unassigned!");
      } else {
        toast.success("Shipment rescheduled successfully");
      }
      
      setShowRescheduleModal(false);
      setRescheduleData({ reschedule_date: "", reschedule_time: "", reason: "", reassign_driver: false, new_driver_id: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to reschedule shipment");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${API}/shipments/template/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shipment_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded!");
    } catch (err) {
      toast.error("Failed to download template");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/shipments/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadResult(response.data);
      if (response.data.created_count > 0) {
        toast.success(`${response.data.created_count} shipments created!`);
        fetchData();
      }
      if (response.data.error_count > 0) {
        toast.warning(`${response.data.error_count} rows had errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeliveryProof = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/shipments/${selectedShipment.id}/delivery-proof`, {
        shipment_id: selectedShipment.id,
        image_base64: deliveryProof.image_base64,
        latitude: parseFloat(deliveryProof.latitude),
        longitude: parseFloat(deliveryProof.longitude),
        notes: deliveryProof.notes
      });
      toast.success("Delivery proof submitted successfully");
      setShowDeliveryModal(false);
      setDeliveryProof({ image_base64: "", latitude: "", longitude: "", notes: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to submit delivery proof");
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/shipments/${selectedShipment.id}/follow-up`, {
        shipment_id: selectedShipment.id,
        notes: followUpNote
      });
      toast.success("Follow-up added successfully");
      setShowFollowUpModal(false);
      setFollowUpNote("");
      fetchData();
    } catch (err) {
      toast.error("Failed to add follow-up");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryProof({...deliveryProof, image_base64: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    
    setGettingLocation(true);
    toast.info("Requesting location access...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryProof({
          ...deliveryProof,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        toast.success("Location captured successfully!");
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let errorMsg = "Failed to get location";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out.";
            break;
          default:
            errorMsg = "An unknown error occurred.";
        }
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const getShipmentTypeLabel = (shipment) => {
    if (shipment.shipment_type === "pickup") {
      return shipment.pickup_subtype === "customer_return" ? "Customer Return" : "Pickup";
    }
    return "Delivery";
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="shipments-page">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>SHIPMENTS</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setUploadResult(null); setShowUploadModal(true); }}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 transition-all"
            data-testid="bulk-upload-btn"
          >
            <Upload className="w-5 h-5" /> Bulk Upload
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all"
            data-testid="add-shipment-btn"
          >
            <Plus className="w-5 h-5" /> New Shipment
          </button>
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No shipments yet. Create your first shipment to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow" data-testid={`shipment-card-${shipment.id}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-sm font-medium text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{shipment.tracking_number}</span>
                    <StatusBadge status={shipment.status} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${shipment.shipment_type === 'pickup' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                      {getShipmentTypeLabel(shipment)}
                    </span>
                    {shipment.is_cod && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                        COD ₹{shipment.cod_amount}
                      </span>
                    )}
                    {shipment.number_of_items > 1 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {shipment.number_of_items} items
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900">{shipment.customer_name} • {shipment.customer_phone}</p>
                  <div className="flex items-start gap-2 mt-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      {shipment.shipment_type === "pickup" ? (
                        <p><span className="text-slate-400">Pickup from:</span> {shipment.pickup_address}</p>
                      ) : (
                        <>
                          <p><span className="text-slate-400">From:</span> {shipment.pickup_address}</p>
                          <p><span className="text-slate-400">To:</span> {shipment.delivery_address}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {shipment.driver_name && (
                    <p className="mt-2 text-sm text-slate-600 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Assigned to: <span className="font-medium">{shipment.driver_name}</span>
                    </p>
                  )}
                  {shipment.reschedule_date && (
                    <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Rescheduled: {shipment.reschedule_date} {shipment.reschedule_time && `at ${shipment.reschedule_time}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {shipment.status === 'pending' && (
                    <button onClick={() => { setSelectedShipment(shipment); setShowAssignModal(true); }} className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-all text-sm" data-testid={`assign-driver-btn-${shipment.id}`}>
                      <UserPlus className="w-4 h-4" /> Assign Driver
                    </button>
                  )}
                  
                  {/* Mark as Delivered for delivery shipments */}
                  {shipment.shipment_type === 'delivery' && (shipment.status === 'assigned' || shipment.status === 'in_transit') && (
                    <button onClick={() => handleMarkDelivered(shipment)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm" data-testid={`mark-delivered-btn-${shipment.id}`}>
                      <CheckCircle className="w-4 h-4" /> Mark as Delivered
                    </button>
                  )}
                  
                  {/* Pickup Completed for pickup shipments */}
                  {shipment.shipment_type === 'pickup' && (shipment.status === 'assigned' || shipment.status === 'in_transit') && (
                    <button onClick={() => handleOpenPickupConfirm(shipment)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm" data-testid={`pickup-completed-btn-${shipment.id}`}>
                      <CheckCircle className="w-4 h-4" /> Pickup Completed
                    </button>
                  )}
                  
                  {/* Mark as Delivered - opens delivery proof modal */}
                  {shipment.shipment_type === 'delivery' && (shipment.status === 'assigned' || shipment.status === 'in_transit') && (
                    <button onClick={() => handleMarkDelivered(shipment)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm" data-testid={`mark-delivered-btn-${shipment.id}`}>
                      <CheckCircle className="w-4 h-4" /> Mark as Delivered
                    </button>
                  )}
                  
                  {/* Reschedule button */}
                  {(shipment.status === 'pending' || shipment.status === 'assigned' || shipment.status === 'rescheduled') && (
                    <button onClick={() => { setSelectedShipment(shipment); setShowRescheduleModal(true); }} className="flex items-center gap-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-all text-sm" data-testid={`reschedule-btn-${shipment.id}`}>
                      <Calendar className="w-4 h-4" /> Reschedule
                    </button>
                  )}
                  
                  <button onClick={() => { setSelectedShipment(shipment); setShowFollowUpModal(true); }} className="flex items-center gap-1 px-3 py-2 bg-slate-50 text-slate-700 rounded-md hover:bg-slate-100 transition-all text-sm" data-testid={`follow-up-btn-${shipment.id}`}>
                    <MessageSquare className="w-4 h-4" /> Follow Up ({shipment.follow_ups?.length || 0})
                  </button>
                </div>
              </div>
              
              {shipment.delivery_proof_image && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">Delivery Proof</p>
                  <div className="flex items-start gap-4">
                    <img src={shipment.delivery_proof_image} alt="Delivery proof" className="w-24 h-24 object-cover rounded-lg" />
                    <div className="text-sm text-green-700">
                      <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lat: {shipment.delivery_latitude}</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lng: {shipment.delivery_longitude}</p>
                      {shipment.delivery_notes && <p className="mt-1">{shipment.delivery_notes}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Shipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>NEW SHIPMENT</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateShipment} className="p-6 space-y-4">
              {/* Shipment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shipment Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, shipment_type: "delivery", pickup_subtype: ""})}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.shipment_type === 'delivery' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                    data-testid="shipment-type-delivery"
                  >
                    <Truck className={`w-6 h-6 mx-auto mb-2 ${formData.shipment_type === 'delivery' ? 'text-primary' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${formData.shipment_type === 'delivery' ? 'text-primary' : 'text-slate-600'}`}>Delivery</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, shipment_type: "pickup", pickup_subtype: "pickup"})}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.shipment_type === 'pickup' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                    data-testid="shipment-type-pickup"
                  >
                    <Package className={`w-6 h-6 mx-auto mb-2 ${formData.shipment_type === 'pickup' ? 'text-primary' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${formData.shipment_type === 'pickup' ? 'text-primary' : 'text-slate-600'}`}>Pickup</p>
                  </button>
                </div>
              </div>

              {/* Pickup Subtype (only for pickup) */}
              {formData.shipment_type === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, pickup_subtype: "pickup"})}
                      className={`p-3 rounded-lg border-2 transition-all ${formData.pickup_subtype === 'pickup' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
                      data-testid="pickup-subtype-pickup"
                    >
                      <p className={`text-sm font-medium ${formData.pickup_subtype === 'pickup' ? 'text-purple-700' : 'text-slate-600'}`}>Regular Pickup</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, pickup_subtype: "customer_return"})}
                      className={`p-3 rounded-lg border-2 transition-all ${formData.pickup_subtype === 'customer_return' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
                      data-testid="pickup-subtype-return"
                    >
                      <p className={`text-sm font-medium ${formData.pickup_subtype === 'customer_return' ? 'text-purple-700' : 'text-slate-600'}`}>Customer Return</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-customer-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input type="tel" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-customer-phone" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.shipment_type === 'pickup' ? 'Pickup Address *' : 'Pickup Address *'}
                </label>
                <textarea value={formData.pickup_address} onChange={(e) => setFormData({...formData, pickup_address: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} required data-testid="shipment-pickup-address" />
              </div>

              {formData.shipment_type === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address *</label>
                  <textarea value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} required={formData.shipment_type === 'delivery'} data-testid="shipment-delivery-address" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content/Description *</label>
                  <input type="text" value={formData.package_description} onChange={(e) => setFormData({...formData, package_description: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-description" placeholder="e.g., Documents, Electronics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Items *</label>
                  <input type="number" min="1" value={formData.number_of_items} onChange={(e) => setFormData({...formData, number_of_items: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-items" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" data-testid="shipment-weight" />
              </div>

              {formData.shipment_type === 'delivery' && (
                <>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="is_cod" checked={formData.is_cod} onChange={(e) => setFormData({...formData, is_cod: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" data-testid="shipment-is-cod" />
                    <label htmlFor="is_cod" className="text-sm font-medium text-slate-700">Cash on Delivery (COD)</label>
                  </div>
                  {formData.is_cod && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">COD Amount (₹) *</label>
                      <input type="number" value={formData.cod_amount} onChange={(e) => setFormData({...formData, cod_amount: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required={formData.is_cod} data-testid="shipment-cod-amount" />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-primary text-white rounded-md hover:bg-primary/90 transition-all" data-testid="create-shipment-btn">Create Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>ASSIGN DRIVER</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {drivers.filter(d => d.status === 'active').length === 0 ? (
                <p className="text-center text-slate-500 py-4">No active drivers available</p>
              ) : (
                <div className="space-y-2">
                  {drivers.filter(d => d.status === 'active').map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleAssignDriver(driver.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                      data-testid={`select-driver-${driver.id}`}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{driver.name}</p>
                        <p className="text-sm text-slate-500">{driver.vehicle_number} • {driver.vehicle_type}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>RESCHEDULE SHIPMENT</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reschedule Date *</label>
                <input type="date" value={rescheduleData.reschedule_date} onChange={(e) => setRescheduleData({...rescheduleData, reschedule_date: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="reschedule-date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reschedule Time (Optional)</label>
                <input type="time" value={rescheduleData.reschedule_time} onChange={(e) => setRescheduleData({...rescheduleData, reschedule_time: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" data-testid="reschedule-time" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                <textarea value={rescheduleData.reason} onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} placeholder="Customer not available, address change, etc." data-testid="reschedule-reason" />
              </div>
              
              {/* Reassign Driver Option */}
              {selectedShipment?.driver_id && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input 
                      type="checkbox" 
                      id="reassign_driver" 
                      checked={rescheduleData.reassign_driver} 
                      onChange={(e) => setRescheduleData({...rescheduleData, reassign_driver: e.target.checked, new_driver_id: ""})} 
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                      data-testid="reassign-driver-checkbox" 
                    />
                    <label htmlFor="reassign_driver" className="text-sm font-medium text-slate-700">Reassign to different driver</label>
                  </div>
                  
                  {rescheduleData.reassign_driver && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setRescheduleData({...rescheduleData, new_driver_id: ""})}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${!rescheduleData.new_driver_id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                        data-testid="unassign-driver-option"
                      >
                        <p className={`text-sm font-medium ${!rescheduleData.new_driver_id ? 'text-orange-700' : 'text-slate-600'}`}>Unassign Driver</p>
                        <p className="text-xs text-slate-500">Remove current driver assignment</p>
                      </button>
                      
                      {drivers.filter(d => d.status === 'active' && d.id !== selectedShipment?.driver_id).map((driver) => (
                        <button
                          key={driver.id}
                          type="button"
                          onClick={() => setRescheduleData({...rescheduleData, new_driver_id: driver.id})}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${rescheduleData.new_driver_id === driver.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
                          data-testid={`reassign-driver-${driver.id}`}
                        >
                          <p className={`text-sm font-medium ${rescheduleData.new_driver_id === driver.id ? 'text-primary' : 'text-slate-900'}`}>{driver.name}</p>
                          <p className="text-xs text-slate-500">{driver.vehicle_number} • {driver.vehicle_type}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all" data-testid="confirm-reschedule-btn">Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Confirmation Modal */}
      {showPickupConfirmModal && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>CONFIRM PICKUP</h3>
              <button onClick={() => setShowPickupConfirmModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePickupCompleted} className="p-6 space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-800 mb-2">Please verify pickup details:</p>
                <p className="text-sm text-purple-700"><span className="font-medium">Customer:</span> {selectedShipment.customer_name}</p>
                <p className="text-sm text-purple-700"><span className="font-medium">Address:</span> {selectedShipment.pickup_address}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Number of Items *</label>
                <input 
                  type="number" 
                  min="1" 
                  value={pickupConfirmData.confirmed_items} 
                  onChange={(e) => setPickupConfirmData({...pickupConfirmData, confirmed_items: e.target.value})} 
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                  required 
                  data-testid="confirm-items-input" 
                />
                <p className="text-xs text-slate-500 mt-1">Expected: {selectedShipment.number_of_items} item(s)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Content/Description *</label>
                <textarea 
                  value={pickupConfirmData.confirmed_content} 
                  onChange={(e) => setPickupConfirmData({...pickupConfirmData, confirmed_content: e.target.value})} 
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" 
                  rows={2} 
                  required 
                  data-testid="confirm-content-input" 
                />
                <p className="text-xs text-slate-500 mt-1">Expected: {selectedShipment.package_description}</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPickupConfirmModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all" data-testid="confirm-pickup-btn">Confirm Pickup</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Proof Modal - Mark as Delivered */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>MARK AS DELIVERED</h3>
              <button onClick={() => setShowDeliveryModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDeliveryProof} className="p-6 space-y-4">
              {selectedShipment && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">Delivery Details:</p>
                  <p className="text-sm text-green-700"><span className="font-medium">Customer:</span> {selectedShipment.customer_name}</p>
                  <p className="text-sm text-green-700"><span className="font-medium">Address:</span> {selectedShipment.delivery_address}</p>
                  {selectedShipment.is_cod && (
                    <p className="text-sm text-orange-700 mt-2"><span className="font-medium">COD Amount:</span> ₹{selectedShipment.cod_amount}</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capture POD Image *</label>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90" required data-testid="delivery-image-input" />
                {deliveryProof.image_base64 && (
                  <img src={deliveryProof.image_base64} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />
                )}
                {!deliveryProof.image_base64 && (
                  <p className="text-xs text-red-500 mt-1">* Image is required for proof of delivery</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude *</label>
                  <input type="text" value={deliveryProof.latitude} onChange={(e) => setDeliveryProof({...deliveryProof, latitude: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none font-mono text-sm" required data-testid="delivery-latitude" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude *</label>
                  <input type="text" value={deliveryProof.longitude} onChange={(e) => setDeliveryProof({...deliveryProof, longitude: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none font-mono text-sm" required data-testid="delivery-longitude" />
                </div>
              </div>
              <button type="button" onClick={getCurrentLocation} disabled={gettingLocation} className="w-full h-10 border border-primary text-primary rounded-md hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50" data-testid="get-location-btn">
                {gettingLocation ? (
                  <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Getting Location...</>
                ) : (
                  <><MapPin className="w-4 h-4" /> Get Current Location</>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center">Or enter coordinates manually. Tip: Get from Google Maps.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Notes</label>
                <textarea value={deliveryProof.notes} onChange={(e) => setDeliveryProof({...deliveryProof, notes: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} placeholder="e.g., Left with security, handed to customer..." data-testid="delivery-notes" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={!deliveryProof.image_base64} className="flex-1 h-10 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" data-testid="submit-delivery-proof-btn">
                  <CheckCircle className="w-4 h-4 inline mr-1" /> Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow Up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>FOLLOW UPS</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {selectedShipment?.follow_ups?.length > 0 && (
                <div className="mb-6 space-y-3">
                  {selectedShipment.follow_ups.map((fu, idx) => (
                    <div key={fu.id || idx} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{fu.notes}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(fu.created_at).toLocaleString()} by {fu.created_by}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddFollowUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Add Follow Up Note *</label>
                  <textarea value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={3} required data-testid="follow-up-note" />
                </div>
                <button type="submit" className="w-full h-10 bg-primary text-white rounded-md hover:bg-primary/90 transition-all" data-testid="add-follow-up-btn">Add Follow Up</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>BULK UPLOAD SHIPMENTS</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Step 1: Download Template */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h4>
                <p className="text-sm text-blue-700 mb-3">Download the CSV template and fill in your shipment details.</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all text-sm"
                  data-testid="download-template-btn"
                >
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">Step 2: Upload Filled CSV</h4>
                <p className="text-sm text-slate-600 mb-3">Upload your completed CSV file to create multiple shipments.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                  data-testid="upload-csv-input"
                />
                {uploading && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Processing file...
                  </div>
                )}
              </div>

              {/* Upload Results */}
              {uploadResult && (
                <div className={`p-4 rounded-lg border ${uploadResult.error_count > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <h4 className={`font-medium mb-2 ${uploadResult.error_count > 0 ? 'text-yellow-900' : 'text-green-900'}`}>Upload Results</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-green-700">✓ {uploadResult.created_count} shipments created successfully</p>
                    {uploadResult.error_count > 0 && (
                      <>
                        <p className="text-red-700">✗ {uploadResult.error_count} rows failed</p>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {uploadResult.errors.map((err, idx) => (
                            <p key={idx} className="text-xs text-red-600">Row {err.row}: {err.error}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Template Instructions */}
              <div className="text-xs text-slate-500">
                <p className="font-medium mb-1">CSV Columns:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li><strong>shipment_type</strong>: "delivery" or "pickup"</li>
                  <li><strong>pickup_subtype</strong>: "pickup" or "customer_return" (for pickup type only)</li>
                  <li><strong>customer_name, customer_phone</strong>: Required</li>
                  <li><strong>pickup_address</strong>: Required</li>
                  <li><strong>delivery_address</strong>: Required for delivery type</li>
                  <li><strong>package_description, number_of_items</strong>: Package details</li>
                  <li><strong>is_cod</strong>: "true" or "false"</li>
                  <li><strong>cod_amount</strong>: Amount if COD is true</li>
                </ul>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// COD Reconciliation Page
const CODPage = () => {
  const [pendingCOD, setPendingCOD] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [reconcileData, setReconcileData] = useState({ amount_collected: "", reconciliation_notes: "" });

  useEffect(() => { fetchPendingCOD(); }, []);

  const fetchPendingCOD = async () => {
    try {
      const res = await axios.get(`${API}/cod/pending`);
      setPendingCOD(res.data);
    } catch (err) {
      toast.error("Failed to load pending COD");
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/shipments/${selectedShipment.id}/reconcile`, {
        shipment_id: selectedShipment.id,
        amount_collected: parseFloat(reconcileData.amount_collected),
        reconciliation_notes: reconcileData.reconciliation_notes
      });
      toast.success("COD reconciled successfully");
      setShowModal(false);
      setReconcileData({ amount_collected: "", reconciliation_notes: "" });
      fetchPendingCOD();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reconcile COD");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div data-testid="cod-page">
      <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>COD RECONCILIATION</h2>

      {pendingCOD.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No pending COD to reconcile. All caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">COD Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered At</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingCOD.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`cod-row-${shipment.id}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{shipment.tracking_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{shipment.customer_name}</p>
                      <p className="text-sm text-slate-500">{shipment.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{shipment.driver_name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{shipment.cod_amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedShipment(shipment); setReconcileData({ amount_collected: shipment.cod_amount.toString(), reconciliation_notes: "" }); setShowModal(true); }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm"
                        data-testid={`reconcile-btn-${shipment.id}`}
                      >
                        Reconcile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>RECONCILE COD</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReconcile} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Expected Amount</p>
                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>₹{selectedShipment?.cod_amount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount Collected (₹) *</label>
                <input type="number" value={reconcileData.amount_collected} onChange={(e) => setReconcileData({...reconcileData, amount_collected: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none font-mono" required data-testid="reconcile-amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={reconcileData.reconciliation_notes} onChange={(e) => setReconcileData({...reconcileData, reconciliation_notes: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} placeholder="Any discrepancy notes..." data-testid="reconcile-notes" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all" data-testid="confirm-reconcile-btn">Confirm Reconciliation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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
