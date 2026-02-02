import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

export default LoginPage;
