import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Users, Plus, Phone, Mail, Car, Edit, Trash2, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

export default DriversPage;
