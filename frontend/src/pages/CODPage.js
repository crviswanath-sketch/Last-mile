import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

export default CODPage;
