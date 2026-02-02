import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Package, Truck, Users, Plus, X, MapPin, Calendar, MessageSquare, 
  Upload, Download, UserPlus, CheckCircle, ChevronRight 
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      await axios.post(`${API}/shipments/${selectedShipment.id}/reschedule`, {
        reschedule_date: rescheduleData.reschedule_date,
        reschedule_time: rescheduleData.reschedule_time || null,
        reason: rescheduleData.reason || null
      });
      
      if (rescheduleData.reassign_driver && rescheduleData.new_driver_id) {
        await axios.post(`${API}/shipments/${selectedShipment.id}/assign/${rescheduleData.new_driver_id}`);
        toast.success("Shipment rescheduled and driver reassigned!");
      } else if (rescheduleData.reassign_driver && !rescheduleData.new_driver_id) {
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
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const response = await axios.post(`${API}/shipments/bulk-upload`, uploadFormData, {
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
        toast.error("Failed to get location");
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
          <button onClick={() => { setUploadResult(null); setShowUploadModal(true); }} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 transition-all" data-testid="bulk-upload-btn">
            <Upload className="w-5 h-5" /> Bulk Upload
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all" data-testid="add-shipment-btn">
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
                    {shipment.is_cod && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">COD ₹{shipment.cod_amount}</span>}
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
                  {shipment.driver_name && <p className="mt-2 text-sm text-slate-600 flex items-center gap-1"><Users className="w-4 h-4" /> Assigned to: <span className="font-medium">{shipment.driver_name}</span></p>}
                  {shipment.reschedule_date && <p className="mt-2 text-sm text-orange-600 flex items-center gap-1"><Calendar className="w-4 h-4" /> Rescheduled: {shipment.reschedule_date}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {shipment.status === 'pending' && (
                    <button onClick={() => { setSelectedShipment(shipment); setShowAssignModal(true); }} className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-all text-sm" data-testid={`assign-driver-btn-${shipment.id}`}>
                      <UserPlus className="w-4 h-4" /> Assign Driver
                    </button>
                  )}
                  {shipment.shipment_type === 'delivery' && (shipment.status === 'assigned' || shipment.status === 'in_transit') && (
                    <button onClick={() => handleMarkDelivered(shipment)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm" data-testid={`mark-delivered-btn-${shipment.id}`}>
                      <CheckCircle className="w-4 h-4" /> Mark as Delivered
                    </button>
                  )}
                  {shipment.shipment_type === 'pickup' && (shipment.status === 'assigned' || shipment.status === 'in_transit') && (
                    <button onClick={() => handleOpenPickupConfirm(shipment)} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all text-sm" data-testid={`pickup-completed-btn-${shipment.id}`}>
                      <CheckCircle className="w-4 h-4" /> Pickup Completed
                    </button>
                  )}
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
                  <img src={shipment.delivery_proof_image} alt="Delivery proof" className="w-24 h-24 object-cover rounded-lg" />
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Shipment Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, shipment_type: "delivery", pickup_subtype: ""})} className={`p-4 rounded-lg border-2 transition-all ${formData.shipment_type === 'delivery' ? 'border-primary bg-primary/5' : 'border-slate-200'}`} data-testid="shipment-type-delivery">
                    <Truck className={`w-6 h-6 mx-auto mb-2 ${formData.shipment_type === 'delivery' ? 'text-primary' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${formData.shipment_type === 'delivery' ? 'text-primary' : 'text-slate-600'}`}>Delivery</p>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, shipment_type: "pickup", pickup_subtype: "pickup"})} className={`p-4 rounded-lg border-2 transition-all ${formData.shipment_type === 'pickup' ? 'border-primary bg-primary/5' : 'border-slate-200'}`} data-testid="shipment-type-pickup">
                    <Package className={`w-6 h-6 mx-auto mb-2 ${formData.shipment_type === 'pickup' ? 'text-primary' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${formData.shipment_type === 'pickup' ? 'text-primary' : 'text-slate-600'}`}>Pickup</p>
                  </button>
                </div>
              </div>
              {formData.shipment_type === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData({...formData, pickup_subtype: "pickup"})} className={`p-3 rounded-lg border-2 ${formData.pickup_subtype === 'pickup' ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`} data-testid="pickup-subtype-pickup">
                      <p className={`text-sm font-medium ${formData.pickup_subtype === 'pickup' ? 'text-purple-700' : 'text-slate-600'}`}>Regular Pickup</p>
                    </button>
                    <button type="button" onClick={() => setFormData({...formData, pickup_subtype: "customer_return"})} className={`p-3 rounded-lg border-2 ${formData.pickup_subtype === 'customer_return' ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`} data-testid="pickup-subtype-return">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Address *</label>
                <textarea value={formData.pickup_address} onChange={(e) => setFormData({...formData, pickup_address: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} required data-testid="shipment-pickup-address" />
              </div>
              {formData.shipment_type === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address *</label>
                  <textarea value={formData.delivery_address} onChange={(e) => setFormData({...formData, delivery_address: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} required data-testid="shipment-delivery-address" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content/Description *</label>
                  <input type="text" value={formData.package_description} onChange={(e) => setFormData({...formData, package_description: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-description" />
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
                      <input type="number" value={formData.cod_amount} onChange={(e) => setFormData({...formData, cod_amount: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="shipment-cod-amount" />
                    </div>
                  )}
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-primary text-white rounded-md hover:bg-primary/90" data-testid="create-shipment-btn">Create Shipment</button>
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
                    <button key={driver.id} onClick={() => handleAssignDriver(driver.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100" data-testid={`select-driver-${driver.id}`}>
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

      {/* Delivery Proof Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">MARK AS DELIVERED</h3>
              <button onClick={() => setShowDeliveryModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDeliveryProof} className="p-6 space-y-4">
              {selectedShipment && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700"><span className="font-medium">Customer:</span> {selectedShipment.customer_name}</p>
                  <p className="text-sm text-green-700"><span className="font-medium">Address:</span> {selectedShipment.delivery_address}</p>
                  {selectedShipment.is_cod && <p className="text-sm text-orange-700 mt-2"><span className="font-medium">COD:</span> ₹{selectedShipment.cod_amount}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capture POD Image *</label>
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="w-full text-sm" required data-testid="delivery-image-input" />
                {deliveryProof.image_base64 && <img src={deliveryProof.image_base64} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />}
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
              <button type="button" onClick={getCurrentLocation} disabled={gettingLocation} className="w-full h-10 border border-primary text-primary rounded-md hover:bg-primary/5 flex items-center justify-center gap-2" data-testid="get-location-btn">
                {gettingLocation ? "Getting Location..." : <><MapPin className="w-4 h-4" /> Get Current Location</>}
              </button>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Notes</label>
                <textarea value={deliveryProof.notes} onChange={(e) => setDeliveryProof({...deliveryProof, notes: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} data-testid="delivery-notes" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={!deliveryProof.image_base64} className="flex-1 h-10 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50" data-testid="submit-delivery-proof-btn">Confirm Delivery</button>
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
              <h3 className="text-lg font-semibold text-slate-900">FOLLOW UPS</h3>
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
                <button type="submit" className="w-full h-10 bg-primary text-white rounded-md hover:bg-primary/90" data-testid="add-follow-up-btn">Add Follow Up</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">RESCHEDULE SHIPMENT</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reschedule Date *</label>
                <input type="date" value={rescheduleData.reschedule_date} onChange={(e) => setRescheduleData({...rescheduleData, reschedule_date: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="reschedule-date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reschedule Time</label>
                <input type="time" value={rescheduleData.reschedule_time} onChange={(e) => setRescheduleData({...rescheduleData, reschedule_time: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" data-testid="reschedule-time" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea value={rescheduleData.reason} onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} data-testid="reschedule-reason" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-orange-600 text-white rounded-md hover:bg-orange-700" data-testid="confirm-reschedule-btn">Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Confirm Modal */}
      {showPickupConfirmModal && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">CONFIRM PICKUP</h3>
              <button onClick={() => setShowPickupConfirmModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePickupCompleted} className="p-6 space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700"><span className="font-medium">Customer:</span> {selectedShipment.customer_name}</p>
                <p className="text-sm text-purple-700"><span className="font-medium">Address:</span> {selectedShipment.pickup_address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Number of Items *</label>
                <input type="number" min="1" value={pickupConfirmData.confirmed_items} onChange={(e) => setPickupConfirmData({...pickupConfirmData, confirmed_items: e.target.value})} className="w-full h-10 px-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" required data-testid="confirm-items-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Content *</label>
                <textarea value={pickupConfirmData.confirmed_content} onChange={(e) => setPickupConfirmData({...pickupConfirmData, confirmed_content: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-primary outline-none" rows={2} required data-testid="confirm-content-input" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPickupConfirmModal(false)} className="flex-1 h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 h-10 bg-green-600 text-white rounded-md hover:bg-green-700" data-testid="confirm-pickup-btn">Confirm Pickup</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">BULK UPLOAD</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h4>
                <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm" data-testid="download-template-btn">
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">Step 2: Upload CSV</h4>
                <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileUpload} className="w-full text-sm" data-testid="upload-csv-input" />
                {uploading && <div className="mt-3 text-sm text-slate-600">Processing file...</div>}
              </div>
              {uploadResult && (
                <div className={`p-4 rounded-lg border ${uploadResult.error_count > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-sm text-green-700">✓ {uploadResult.created_count} shipments created</p>
                  {uploadResult.error_count > 0 && <p className="text-sm text-red-700">✗ {uploadResult.error_count} rows failed</p>}
                </div>
              )}
              <button onClick={() => setShowUploadModal(false)} className="w-full h-10 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsPage;
