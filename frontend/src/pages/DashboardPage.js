import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Package, Truck, Users, Clock, CheckCircle, UserPlus, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

export default DashboardPage;
