import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import BarcodeScanner from "@/components/BarcodeScanner";
import { 
  Package, 
  Truck, 
  Users, 
  FileText, 
  BarChart3, 
  ScanLine, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Plus,
  ArrowRight,
  Home,
  Box,
  Camera,
  Keyboard
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Status color mapping
const statusColors = {
  pending_handover: "bg-gray-500",
  in_scanned: "bg-blue-500",
  assigned_to_bin: "bg-indigo-500",
  assigned_to_champ: "bg-purple-500",
  out_for_delivery: "bg-amber-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
  no_response: "bg-orange-500",
  rescheduled: "bg-cyan-500",
  returned_to_wh: "bg-pink-500"
};

const statusLabels = {
  pending_handover: "Pending Handover",
  in_scanned: "In Scanned",
  assigned_to_bin: "Assigned to Bin",
  assigned_to_champ: "Assigned to Champ",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  no_response: "No Response",
  rescheduled: "Rescheduled",
  returned_to_wh: "Returned to WH"
};

// ==================== DASHBOARD ====================
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (e) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-6" data-testid="dashboard">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-total-shipments">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_shipments || 0}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-today-delivered">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.today_delivered || 0}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-active-runsheets">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Run Sheets</CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_run_sheets || 0}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-active-champs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Champs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_active_champs || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pickup Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="stat-total-pickups">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
            <Box className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pickups || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Seller: {stats?.pickups_by_type?.seller_pickup || 0} | 
              Return: {stats?.pickups_by_type?.customer_return || 0} | 
              Shopping: {stats?.pickups_by_type?.personal_shopping || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-pending-pickups">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pending_pickups || 0}</div>
          </CardContent>
        </Card>
        
        <Card data-testid="stat-completed-pickups">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Pickups</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed_pickups || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="shipment-status-breakdown">
          <CardHeader>
            <CardTitle>Shipment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.shipments_by_status && Object.entries(stats.shipments_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                    <span className="text-sm">{statusLabels[status] || status}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {(!stats?.shipments_by_status || Object.keys(stats.shipments_by_status).length === 0) && (
                <p className="text-muted-foreground text-sm">No shipments yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="payment-collection">
          <CardHeader>
            <CardTitle>Payment Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <span className="font-medium">Cash Collected</span>
                <span className="text-xl font-bold text-green-600">₹{stats?.cash_collected?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <span className="font-medium">Card Collected</span>
                <span className="text-xl font-bold text-blue-600">₹{stats?.card_collected?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ==================== SHIPMENTS ====================
const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanAwb, setScanAwb] = useState("");
  const [useCameraScanner, setUseCameraScanner] = useState(true);
  const [scannedList, setScannedList] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [newShipment, setNewShipment] = useState({
    awb: "",
    recipient_name: "",
    recipient_address: "",
    recipient_phone: "",
    route: "",
    payment_method: "cash",
    value: ""
  });

  const fetchShipments = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateFrom) params.inscan_date_from = dateFrom;
      if (dateTo) params.inscan_date_to = dateTo;
      const response = await axios.get(`${API}/shipments`, { params });
      setShipments(response.data);
    } catch (e) {
      toast.error("Failed to fetch shipments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleCreateShipment = async () => {
    try {
      await axios.post(`${API}/shipments`, {
        ...newShipment,
        value: parseFloat(newShipment.value)
      });
      toast.success("Shipment created successfully");
      setDialogOpen(false);
      setNewShipment({
        awb: "",
        recipient_name: "",
        recipient_address: "",
        recipient_phone: "",
        route: "",
        payment_method: "cash",
        value: ""
      });
      fetchShipments();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create shipment");
    }
  };

  const handleInScan = async (awbToScan) => {
    const awb = awbToScan || scanAwb;
    if (!awb) return;
    try {
      await axios.post(`${API}/logistics/in-scan/${awb}`);
      toast.success(`Shipment ${awb} in-scanned successfully`);
      setScannedList(prev => [...prev, { awb, status: 'success', time: new Date().toLocaleTimeString() }]);
      setScanAwb("");
      fetchShipments();
    } catch (e) {
      const errorMsg = e.response?.data?.detail || "Failed to in-scan";
      toast.error(`${awb}: ${errorMsg}`);
      setScannedList(prev => [...prev, { awb, status: 'error', error: errorMsg, time: new Date().toLocaleTimeString() }]);
    }
  };

  const handleBarcodeScan = (scannedCode) => {
    handleInScan(scannedCode);
  };

  const closeScanDialog = () => {
    setScanDialogOpen(false);
    setScanAwb("");
    setScannedList([]);
  };

  return (
    <div className="space-y-6" data-testid="shipments-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Shipments</h1>
        <div className="flex gap-2">
          <Dialog open={scanDialogOpen} onOpenChange={(open) => {
            if (open) {
              setScanDialogOpen(true);
            } else {
              closeScanDialog();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="in-scan-btn">
                <ScanLine className="h-4 w-4 mr-2" />
                In-Scan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>In-Scan Shipments</DialogTitle>
                <DialogDescription>Scan barcodes or enter AWB to mark as received</DialogDescription>
              </DialogHeader>
              
              {/* Toggle between camera and manual input */}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={useCameraScanner ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUseCameraScanner(true)}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button 
                  variant={!useCameraScanner ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setUseCameraScanner(false)}
                  className="flex-1"
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Manual
                </Button>
              </div>

              <div className="space-y-4">
                {useCameraScanner ? (
                  <BarcodeScanner 
                    onScan={handleBarcodeScan}
                    isActive={scanDialogOpen && useCameraScanner}
                    onError={(err) => toast.error(err)}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="scan-awb">AWB Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="scan-awb"
                        value={scanAwb}
                        onChange={(e) => setScanAwb(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInScan()}
                        placeholder="Enter AWB and press Enter"
                        data-testid="scan-awb-input"
                        autoFocus
                      />
                      <Button onClick={() => handleInScan()} data-testid="confirm-scan-btn">
                        Scan
                      </Button>
                    </div>
                  </div>
                )}

                {/* Scanned items list */}
                {scannedList.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground">Scanned Items ({scannedList.length})</Label>
                    <div className="mt-2 max-h-40 overflow-auto border rounded-lg">
                      {scannedList.slice().reverse().map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 border-b last:border-0 text-sm ${
                            item.status === 'success' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                          }`}
                        >
                          <span className="font-mono">{item.awb}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                            {item.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeScanDialog}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-shipment-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shipment</DialogTitle>
                <DialogDescription>Add a new shipment to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="awb">AWB Number</Label>
                  <Input
                    id="awb"
                    value={newShipment.awb}
                    onChange={(e) => setNewShipment({ ...newShipment, awb: e.target.value })}
                    data-testid="shipment-awb-input"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient_name">Recipient Name</Label>
                  <Input
                    id="recipient_name"
                    value={newShipment.recipient_name}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient_name: e.target.value })}
                    data-testid="shipment-recipient-input"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient_address">Address</Label>
                  <Textarea
                    id="recipient_address"
                    value={newShipment.recipient_address}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient_address: e.target.value })}
                    data-testid="shipment-address-input"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient_phone">Phone</Label>
                  <Input
                    id="recipient_phone"
                    value={newShipment.recipient_phone}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient_phone: e.target.value })}
                    data-testid="shipment-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    value={newShipment.route}
                    onChange={(e) => setNewShipment({ ...newShipment, route: e.target.value })}
                    placeholder="e.g., NORTH-1, SOUTH-2"
                    data-testid="shipment-route-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      value={newShipment.payment_method}
                      onValueChange={(v) => setNewShipment({ ...newShipment, payment_method: v })}
                    >
                      <SelectTrigger data-testid="shipment-payment-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="prepaid">Prepaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value (₹)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newShipment.value}
                      onChange={(e) => setNewShipment({ ...newShipment, value: e.target.value })}
                      data-testid="shipment-value-input"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateShipment} data-testid="create-shipment-btn">Create Shipment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label>Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_handover">Pending Handover</SelectItem>
            <SelectItem value="in_scanned">In Scanned</SelectItem>
            <SelectItem value="assigned_to_bin">Assigned to Bin</SelectItem>
            <SelectItem value="assigned_to_champ">Assigned to Champ</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_response">No Response</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
            <SelectItem value="returned_to_wh">Returned to WH</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchShipments} data-testid="refresh-btn">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AWB</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
              ) : shipments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No shipments found</TableCell></TableRow>
              ) : (
                shipments.map((shipment) => (
                  <TableRow key={shipment.id} data-testid={`shipment-row-${shipment.awb}`}>
                    <TableCell className="font-mono font-medium">{shipment.awb}</TableCell>
                    <TableCell>
                      <div>{shipment.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{shipment.recipient_phone}</div>
                    </TableCell>
                    <TableCell>{shipment.route}</TableCell>
                    <TableCell>
                      <Badge variant={shipment.payment_method === "prepaid" ? "secondary" : "outline"}>
                        {shipment.payment_method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{shipment.value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[shipment.status]} text-white`}>
                        {statusLabels[shipment.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== BIN LOCATIONS ====================
const BinLocations = () => {
  const [binLocations, setBinLocations] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [newBin, setNewBin] = useState({ name: "", route: "", capacity: 100 });
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [scanAwb, setScanAwb] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [binsRes, shipmentsRes] = await Promise.all([
        axios.get(`${API}/bin-locations`),
        axios.get(`${API}/shipments`, { params: { status: "in_scanned" } })
      ]);
      setBinLocations(binsRes.data);
      setShipments(shipmentsRes.data);
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBin = async () => {
    try {
      await axios.post(`${API}/bin-locations`, newBin);
      toast.success("Bin location created");
      setDialogOpen(false);
      setNewBin({ name: "", route: "", capacity: 100 });
      fetchData();
    } catch (e) {
      toast.error("Failed to create bin location");
    }
  };

  const handleAssignToBin = async () => {
    if (!selectedBin || selectedShipments.length === 0) return;
    try {
      await axios.post(`${API}/logistics/assign-bin?bin_location_id=${selectedBin}`, selectedShipments);
      toast.success(`${selectedShipments.length} shipments assigned to bin`);
      setAssignDialogOpen(false);
      setSelectedShipments([]);
      setSelectedBin(null);
      fetchData();
    } catch (e) {
      toast.error("Failed to assign shipments");
    }
  };

  const handleBarcodeScan = (scannedCode) => {
    // Find shipment by AWB and add to selected
    const shipment = shipments.find(s => s.awb === scannedCode);
    if (shipment) {
      if (!selectedShipments.includes(shipment.id)) {
        setSelectedShipments(prev => [...prev, shipment.id]);
        toast.success(`Added: ${scannedCode}`);
      } else {
        toast.info(`Already added: ${scannedCode}`);
      }
    } else {
      toast.error(`Shipment not found or not in-scanned: ${scannedCode}`);
    }
  };

  const handleManualAdd = () => {
    if (!scanAwb) return;
    handleBarcodeScan(scanAwb);
    setScanAwb("");
  };

  return (
    <div className="space-y-6" data-testid="bin-locations-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Bin Locations</h1>
        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={(open) => {
            setAssignDialogOpen(open);
            if (!open) {
              setUseCameraScanner(false);
              setSelectedShipments([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="assign-to-bin-btn">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan & Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Assign Shipments to Bin</DialogTitle>
                <DialogDescription>Scan barcodes or select shipments to assign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Bin Location</Label>
                  <Select value={selectedBin || ""} onValueChange={setSelectedBin}>
                    <SelectTrigger data-testid="select-bin">
                      <SelectValue placeholder="Choose bin location" />
                    </SelectTrigger>
                    <SelectContent>
                      {binLocations.map((bin) => (
                        <SelectItem key={bin.id} value={bin.id}>
                          {bin.name} ({bin.route})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBin && (
                  <>
                    {/* Toggle scanner */}
                    <div className="flex gap-2">
                      <Button 
                        variant={useCameraScanner ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setUseCameraScanner(true)}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Scan Barcode
                      </Button>
                      <Button 
                        variant={!useCameraScanner ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setUseCameraScanner(false)}
                        className="flex-1"
                      >
                        <Keyboard className="h-4 w-4 mr-2" />
                        Manual Select
                      </Button>
                    </div>

                    {useCameraScanner ? (
                      <div className="space-y-3">
                        <BarcodeScanner 
                          onScan={handleBarcodeScan}
                          isActive={assignDialogOpen && useCameraScanner}
                          onError={(err) => toast.error(err)}
                        />
                        <div className="flex gap-2">
                          <Input
                            value={scanAwb}
                            onChange={(e) => setScanAwb(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                            placeholder="Or type AWB..."
                          />
                          <Button onClick={handleManualAdd} size="sm">Add</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label>In-Scanned Shipments</Label>
                        <div className="border rounded-lg max-h-64 overflow-auto mt-2">
                          {shipments.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-center">No in-scanned shipments</p>
                          ) : (
                            shipments.map((shipment) => (
                              <div key={shipment.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                                <Checkbox
                                  checked={selectedShipments.includes(shipment.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedShipments([...selectedShipments, shipment.id]);
                                    } else {
                                      setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="font-mono text-sm">{shipment.awb}</div>
                                  <div className="text-xs text-muted-foreground">{shipment.route} - {shipment.recipient_name}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected shipments */}
                    {selectedShipments.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedShipments.length} shipments selected</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedShipments([])}>Clear</Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedShipments.map(id => {
                            const s = shipments.find(sh => sh.id === id);
                            return s ? (
                              <Badge key={id} variant="secondary" className="text-xs">
                                {s.awb}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAssignToBin} disabled={!selectedBin || selectedShipments.length === 0} data-testid="confirm-assign-bin">
                  Assign {selectedShipments.length} Shipments
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-bin-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Bin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Bin Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newBin.name}
                    onChange={(e) => setNewBin({ ...newBin, name: e.target.value })}
                    placeholder="e.g., BIN-A1"
                    data-testid="bin-name-input"
                  />
                </div>
                <div>
                  <Label>Route</Label>
                  <Input
                    value={newBin.route}
                    onChange={(e) => setNewBin({ ...newBin, route: e.target.value })}
                    placeholder="e.g., NORTH-1"
                    data-testid="bin-route-input"
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={newBin.capacity}
                    onChange={(e) => setNewBin({ ...newBin, capacity: parseInt(e.target.value) })}
                    data-testid="bin-capacity-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateBin} data-testid="create-bin-btn">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : binLocations.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">No bin locations created yet</p>
        ) : (
          binLocations.map((bin) => (
            <Card key={bin.id} data-testid={`bin-card-${bin.name}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  {bin.name}
                </CardTitle>
                <CardDescription>Route: {bin.route}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="font-medium">{bin.current_count} / {bin.capacity}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${(bin.current_count / bin.capacity) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== CHAMPS ====================
const Champs = () => {
  const [champs, setChamps] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [useCameraScanner, setUseCameraScanner] = useState(false);
  const [scanAwb, setScanAwb] = useState("");
  const [newChamp, setNewChamp] = useState({ name: "", phone: "", assigned_routes: "" });

  const fetchData = useCallback(async () => {
    try {
      const [champsRes, shipmentsRes] = await Promise.all([
        axios.get(`${API}/champs`),
        axios.get(`${API}/shipments`, { params: { status: "assigned_to_bin" } })
      ]);
      setChamps(champsRes.data);
      setShipments(shipmentsRes.data);
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateChamp = async () => {
    try {
      await axios.post(`${API}/champs`, {
        name: newChamp.name,
        phone: newChamp.phone,
        assigned_routes: newChamp.assigned_routes.split(",").map(r => r.trim()).filter(Boolean)
      });
      toast.success("Champ created successfully");
      setDialogOpen(false);
      setNewChamp({ name: "", phone: "", assigned_routes: "" });
      fetchData();
    } catch (e) {
      toast.error("Failed to create champ");
    }
  };

  const handleAssignToChamp = async () => {
    if (!selectedChamp || selectedShipments.length === 0) return;
    try {
      await axios.post(`${API}/logistics/assign-champ?champ_id=${selectedChamp}`, selectedShipments);
      toast.success(`${selectedShipments.length} shipments assigned to champ`);
      setAssignDialogOpen(false);
      setSelectedShipments([]);
      setSelectedChamp(null);
      fetchData();
    } catch (e) {
      toast.error("Failed to assign shipments");
    }
  };

  const handleBarcodeScan = (scannedCode) => {
    const shipment = shipments.find(s => s.awb === scannedCode);
    if (shipment) {
      if (!selectedShipments.includes(shipment.id)) {
        setSelectedShipments(prev => [...prev, shipment.id]);
        toast.success(`Added: ${scannedCode}`);
      } else {
        toast.info(`Already added: ${scannedCode}`);
      }
    } else {
      toast.error(`Shipment not found or not ready: ${scannedCode}`);
    }
  };

  const handleManualAdd = () => {
    if (!scanAwb) return;
    handleBarcodeScan(scanAwb);
    setScanAwb("");
  };

  return (
    <div className="space-y-6" data-testid="champs-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Delivery Champs</h1>
        <div className="flex gap-2">
          <Dialog open={assignDialogOpen} onOpenChange={(open) => {
            setAssignDialogOpen(open);
            if (!open) {
              setUseCameraScanner(false);
              setSelectedShipments([]);
              setSelectedChamp(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="assign-to-champ-btn">
                <ScanLine className="h-4 w-4 mr-2" />
                Scan & Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Assign Shipments to Champ</DialogTitle>
                <DialogDescription>Scan barcodes or select shipments to assign</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Delivery Champ</Label>
                  <Select value={selectedChamp || ""} onValueChange={setSelectedChamp}>
                    <SelectTrigger data-testid="select-champ-assign">
                      <SelectValue placeholder="Choose champ" />
                    </SelectTrigger>
                    <SelectContent>
                      {champs.filter(c => c.is_active).map((champ) => (
                        <SelectItem key={champ.id} value={champ.id}>
                          {champ.name} ({champ.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChamp && (
                  <>
                    <div className="flex gap-2">
                      <Button 
                        variant={useCameraScanner ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setUseCameraScanner(true)}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Scan Barcode
                      </Button>
                      <Button 
                        variant={!useCameraScanner ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setUseCameraScanner(false)}
                        className="flex-1"
                      >
                        <Keyboard className="h-4 w-4 mr-2" />
                        Manual Select
                      </Button>
                    </div>

                    {useCameraScanner ? (
                      <div className="space-y-3">
                        <BarcodeScanner 
                          onScan={handleBarcodeScan}
                          isActive={assignDialogOpen && useCameraScanner}
                          onError={(err) => toast.error(err)}
                        />
                        <div className="flex gap-2">
                          <Input
                            value={scanAwb}
                            onChange={(e) => setScanAwb(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                            placeholder="Or type AWB..."
                          />
                          <Button onClick={handleManualAdd} size="sm">Add</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label>Available Shipments (Assigned to Bin)</Label>
                        <div className="border rounded-lg max-h-64 overflow-auto mt-2">
                          {shipments.length === 0 ? (
                            <p className="p-4 text-muted-foreground text-center">No shipments ready for assignment</p>
                          ) : (
                            shipments.map((shipment) => (
                              <div key={shipment.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                                <Checkbox
                                  checked={selectedShipments.includes(shipment.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedShipments([...selectedShipments, shipment.id]);
                                    } else {
                                      setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="font-mono text-sm">{shipment.awb}</div>
                                  <div className="text-xs text-muted-foreground">{shipment.route} - {shipment.recipient_name}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {selectedShipments.length > 0 && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedShipments.length} shipments selected</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedShipments([])}>Clear</Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedShipments.map(id => {
                            const s = shipments.find(sh => sh.id === id);
                            return s ? (
                              <Badge key={id} variant="secondary" className="text-xs">{s.awb}</Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleAssignToChamp} disabled={!selectedChamp || selectedShipments.length === 0} data-testid="confirm-assign-champ">
                  Assign {selectedShipments.length} Shipments
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-champ-btn">
                <Plus className="h-4 w-4 mr-2" />
                Add Champ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Champ</DialogTitle>
                <DialogDescription>Add a new delivery personnel</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newChamp.name}
                    onChange={(e) => setNewChamp({ ...newChamp, name: e.target.value })}
                    data-testid="champ-name-input"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newChamp.phone}
                    onChange={(e) => setNewChamp({ ...newChamp, phone: e.target.value })}
                    data-testid="champ-phone-input"
                  />
                </div>
                <div>
                  <Label>Assigned Routes (comma separated)</Label>
                  <Input
                    value={newChamp.assigned_routes}
                    onChange={(e) => setNewChamp({ ...newChamp, assigned_routes: e.target.value })}
                    placeholder="NORTH-1, NORTH-2"
                    data-testid="champ-routes-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateChamp} data-testid="create-champ-btn">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : champs.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">No champs added yet</p>
        ) : (
          champs.map((champ) => (
            <Card key={champ.id} data-testid={`champ-card-${champ.name}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {champ.name}
                </CardTitle>
                <CardDescription>{champ.phone}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={champ.is_active ? "default" : "secondary"}>
                    {champ.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {champ.assigned_routes?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {champ.assigned_routes.map((route) => (
                      <Badge key={route} variant="outline" className="text-xs">{route}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== RUN SHEETS ====================
const RunSheets = () => {
  const [runSheets, setRunSheets] = useState([]);
  const [champs, setChamps] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState(null);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [activeTab, setActiveTab] = useState("active");

  const fetchData = useCallback(async () => {
    try {
      const [runSheetsRes, champsRes, shipmentsRes] = await Promise.all([
        axios.get(`${API}/run-sheets`),
        axios.get(`${API}/champs`, { params: { is_active: true } }),
        axios.get(`${API}/shipments`, { params: { status: "assigned_to_champ" } })
      ]);
      setRunSheets(runSheetsRes.data);
      setChamps(champsRes.data);
      setShipments(shipmentsRes.data);
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRunSheet = async () => {
    if (!selectedChamp || selectedShipments.length === 0) return;
    try {
      await axios.post(`${API}/run-sheets`, {
        champ_id: selectedChamp,
        shipment_ids: selectedShipments
      });
      toast.success("Run sheet created successfully");
      setCreateDialogOpen(false);
      setSelectedChamp(null);
      setSelectedShipments([]);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create run sheet");
    }
  };

  const handleScanOut = async (runSheetId) => {
    try {
      await axios.post(`${API}/run-sheets/${runSheetId}/scan-out`);
      toast.success("Run sheet scanned out");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to scan out");
    }
  };

  const handleScanIn = async (runSheetId) => {
    try {
      await axios.post(`${API}/run-sheets/${runSheetId}/scan-in`);
      toast.success("Run sheet scanned in");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to scan in");
    }
  };

  const champShipments = selectedChamp 
    ? shipments.filter(s => s.champ_id === selectedChamp && !s.run_sheet_id)
    : [];

  const activeRunSheets = runSheets.filter(rs => !rs.is_scanned_in);
  const completedRunSheets = runSheets.filter(rs => rs.is_scanned_in);

  return (
    <div className="space-y-6" data-testid="run-sheets-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Run Sheets</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-runsheet-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Run Sheet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Run Sheet</DialogTitle>
              <DialogDescription>Select a champ and their assigned shipments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Select Champ</Label>
                <Select value={selectedChamp || ""} onValueChange={(v) => {
                  setSelectedChamp(v);
                  setSelectedShipments([]);
                }}>
                  <SelectTrigger data-testid="select-champ">
                    <SelectValue placeholder="Choose delivery champ" />
                  </SelectTrigger>
                  <SelectContent>
                    {champs.map((champ) => (
                      <SelectItem key={champ.id} value={champ.id}>
                        {champ.name} ({champ.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedChamp && (
                <div>
                  <Label>Assigned Shipments</Label>
                  <div className="border rounded-lg max-h-64 overflow-auto mt-2">
                    {champShipments.length === 0 ? (
                      <p className="p-4 text-muted-foreground text-center">No shipments assigned to this champ</p>
                    ) : (
                      champShipments.map((shipment) => (
                        <div key={shipment.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                          <Checkbox
                            checked={selectedShipments.includes(shipment.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedShipments([...selectedShipments, shipment.id]);
                              } else {
                                setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-mono text-sm">{shipment.awb}</div>
                            <div className="text-xs text-muted-foreground">
                              {shipment.recipient_name} - ₹{shipment.value} ({shipment.payment_method})
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateRunSheet} 
                disabled={!selectedChamp || selectedShipments.length === 0}
                data-testid="confirm-create-runsheet"
              >
                Generate Run Sheet ({selectedShipments.length} shipments)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" data-testid="active-tab">Active ({activeRunSheets.length})</TabsTrigger>
          <TabsTrigger value="completed" data-testid="completed-tab">Completed ({completedRunSheets.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <p>Loading...</p>
            ) : activeRunSheets.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">No active run sheets</p>
            ) : (
              activeRunSheets.map((rs) => (
                <Card key={rs.id} data-testid={`runsheet-card-${rs.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {rs.champ_name}
                      </span>
                      <Badge variant={rs.is_scanned_out ? "default" : "secondary"}>
                        {rs.is_scanned_out ? "Out for Delivery" : "Pending Scan Out"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {rs.shipment_ids.length} shipments • ID: {rs.id.slice(0, 8)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Value:</span>
                        <span className="font-medium">₹{rs.total_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cash to Collect:</span>
                        <span className="font-medium text-green-600">₹{rs.cash_to_collect.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Card to Collect:</span>
                        <span className="font-medium text-blue-600">₹{rs.card_to_collect.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!rs.is_scanned_out ? (
                        <Button size="sm" onClick={() => handleScanOut(rs.id)} data-testid={`scan-out-${rs.id}`}>
                          <ScanLine className="h-4 w-4 mr-1" /> Scan Out
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleScanIn(rs.id)} data-testid={`scan-in-${rs.id}`}>
                          <ScanLine className="h-4 w-4 mr-1" /> Scan In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Champ</TableHead>
                    <TableHead>Shipments</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Scanned Out</TableHead>
                    <TableHead>Scanned In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRunSheets.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No completed run sheets</TableCell></TableRow>
                  ) : (
                    completedRunSheets.map((rs) => (
                      <TableRow key={rs.id}>
                        <TableCell className="font-mono text-xs">{rs.id.slice(0, 8)}</TableCell>
                        <TableCell>{rs.champ_name}</TableCell>
                        <TableCell>{rs.shipment_ids.length}</TableCell>
                        <TableCell>₹{rs.total_value.toFixed(2)}</TableCell>
                        <TableCell className="text-xs">{rs.scanned_out_at?.split("T")[0]}</TableCell>
                        <TableCell className="text-xs">{rs.scanned_in_at?.split("T")[0]}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ==================== DELIVERY TRACKING ====================
const DeliveryTracking = () => {
  const [runSheets, setRunSheets] = useState([]);
  const [selectedRunSheet, setSelectedRunSheet] = useState(null);
  const [runSheetShipments, setRunSheetShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [deliveryData, setDeliveryData] = useState({
    outcome: "",
    payment_collected: "",
    payment_method_used: "",
    notes: "",
    rescheduled_date: ""
  });

  const fetchRunSheets = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/run-sheets`, { params: { is_active: true } });
      const activeRs = response.data.filter(rs => rs.is_scanned_out && !rs.is_scanned_in);
      setRunSheets(activeRs);
    } catch (e) {
      toast.error("Failed to fetch run sheets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunSheets();
  }, [fetchRunSheets]);

  const fetchRunSheetShipments = async (runSheetId) => {
    try {
      const response = await axios.get(`${API}/shipments`);
      const filtered = response.data.filter(s => s.run_sheet_id === runSheetId);
      setRunSheetShipments(filtered);
    } catch (e) {
      toast.error("Failed to fetch shipments");
    }
  };

  useEffect(() => {
    if (selectedRunSheet) {
      fetchRunSheetShipments(selectedRunSheet);
    }
  }, [selectedRunSheet]);

  const handleRecordDelivery = async () => {
    if (!selectedShipment || !deliveryData.outcome) return;
    try {
      await axios.post(`${API}/delivery-attempts`, {
        shipment_id: selectedShipment.id,
        run_sheet_id: selectedRunSheet,
        outcome: deliveryData.outcome,
        payment_collected: parseFloat(deliveryData.payment_collected) || 0,
        payment_method_used: deliveryData.payment_method_used || null,
        notes: deliveryData.notes || null,
        rescheduled_date: deliveryData.rescheduled_date || null
      });
      toast.success("Delivery recorded successfully");
      setDeliveryDialogOpen(false);
      setSelectedShipment(null);
      setDeliveryData({
        outcome: "",
        payment_collected: "",
        payment_method_used: "",
        notes: "",
        rescheduled_date: ""
      });
      fetchRunSheetShipments(selectedRunSheet);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to record delivery");
    }
  };

  const openDeliveryDialog = (shipment) => {
    setSelectedShipment(shipment);
    setDeliveryData({
      outcome: "",
      payment_collected: shipment.payment_method !== "prepaid" ? shipment.value.toString() : "0",
      payment_method_used: shipment.payment_method !== "prepaid" ? shipment.payment_method : "",
      notes: "",
      rescheduled_date: ""
    });
    setDeliveryDialogOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="delivery-tracking-page">
      <h1 className="text-3xl font-bold">Delivery Tracking</h1>

      <div className="flex items-center gap-4">
        <Label>Select Active Run Sheet:</Label>
        <Select value={selectedRunSheet || ""} onValueChange={setSelectedRunSheet}>
          <SelectTrigger className="w-64" data-testid="select-active-runsheet">
            <SelectValue placeholder="Choose run sheet" />
          </SelectTrigger>
          <SelectContent>
            {runSheets.map((rs) => (
              <SelectItem key={rs.id} value={rs.id}>
                {rs.champ_name} - {rs.shipment_ids.length} shipments
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRunSheet && (
        <Card>
          <CardHeader>
            <CardTitle>Shipments in Run Sheet</CardTitle>
            <CardDescription>Record delivery outcomes for each shipment</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AWB</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runSheetShipments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No shipments found</TableCell></TableRow>
                ) : (
                  runSheetShipments.map((shipment) => (
                    <TableRow key={shipment.id} data-testid={`delivery-row-${shipment.awb}`}>
                      <TableCell className="font-mono">{shipment.awb}</TableCell>
                      <TableCell>
                        <div>{shipment.recipient_name}</div>
                        <div className="text-xs text-muted-foreground">{shipment.recipient_phone}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{shipment.recipient_address}</TableCell>
                      <TableCell>
                        ₹{shipment.value}
                        <Badge variant="outline" className="ml-2 text-xs">{shipment.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[shipment.status]} text-white`}>
                          {statusLabels[shipment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.status === "out_for_delivery" && (
                          <Button size="sm" onClick={() => openDeliveryDialog(shipment)} data-testid={`record-delivery-${shipment.awb}`}>
                            Record
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Delivery Outcome</DialogTitle>
            <DialogDescription>
              AWB: {selectedShipment?.awb} - {selectedShipment?.recipient_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Outcome</Label>
              <Select value={deliveryData.outcome} onValueChange={(v) => setDeliveryData({ ...deliveryData, outcome: v })}>
                <SelectTrigger data-testid="outcome-select">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivered">
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Delivered</span>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <span className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Cancelled</span>
                  </SelectItem>
                  <SelectItem value="no_response">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> No Response</span>
                  </SelectItem>
                  <SelectItem value="rescheduled">
                    <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-cyan-500" /> Rescheduled</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {deliveryData.outcome === "delivered" && selectedShipment?.payment_method !== "prepaid" && (
              <>
                <div>
                  <Label>Payment Collected (₹)</Label>
                  <Input
                    type="number"
                    value={deliveryData.payment_collected}
                    onChange={(e) => setDeliveryData({ ...deliveryData, payment_collected: e.target.value })}
                    data-testid="payment-collected-input"
                  />
                </div>
                <div>
                  <Label>Payment Method Used</Label>
                  <Select value={deliveryData.payment_method_used} onValueChange={(v) => setDeliveryData({ ...deliveryData, payment_method_used: v })}>
                    <SelectTrigger data-testid="payment-method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {deliveryData.outcome === "rescheduled" && (
              <div>
                <Label>Rescheduled Date</Label>
                <Input
                  type="date"
                  value={deliveryData.rescheduled_date}
                  onChange={(e) => setDeliveryData({ ...deliveryData, rescheduled_date: e.target.value })}
                  data-testid="rescheduled-date-input"
                />
              </div>
            )}
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                placeholder="Optional notes..."
                data-testid="delivery-notes-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRecordDelivery} disabled={!deliveryData.outcome} data-testid="confirm-delivery-btn">
              Record Outcome
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== RETURNS ====================
const Returns = () => {
  const [undelivered, setUndelivered] = useState([]);
  const [champs, setChamps] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [assignChampDialogOpen, setAssignChampDialogOpen] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [undeliveredRes, champsRes, binsRes] = await Promise.all([
        axios.get(`${API}/logistics/undelivered`),
        axios.get(`${API}/champs`, { params: { is_active: true } }),
        axios.get(`${API}/bin-locations`)
      ]);
      setUndelivered(undeliveredRes.data);
      setChamps(champsRes.data);
      setBinLocations(binsRes.data);
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReturnToWarehouse = async () => {
    if (selectedShipments.length === 0) return;
    try {
      await axios.post(`${API}/logistics/return-to-warehouse`, selectedShipments);
      toast.success(`${selectedShipments.length} shipments returned to warehouse`);
      setSelectedShipments([]);
      fetchData();
    } catch (e) {
      toast.error("Failed to return shipments");
    }
  };

  const handleReassignToChamp = async () => {
    if (!selectedChamp || selectedShipments.length === 0) return;
    try {
      await axios.post(`${API}/logistics/assign-champ?champ_id=${selectedChamp}`, selectedShipments);
      toast.success(`${selectedShipments.length} shipments reassigned`);
      setAssignChampDialogOpen(false);
      setSelectedChamp(null);
      setSelectedShipments([]);
      fetchData();
    } catch (e) {
      toast.error("Failed to reassign shipments");
    }
  };

  const selectableStatuses = ["cancelled", "no_response", "returned_to_wh", "rescheduled"];
  const selectableShipments = undelivered.filter(s => selectableStatuses.includes(s.status));

  return (
    <div className="space-y-6" data-testid="returns-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Returns & Re-assignment</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleReturnToWarehouse}
            disabled={selectedShipments.length === 0}
            data-testid="return-to-wh-btn"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to WH ({selectedShipments.length})
          </Button>
          
          <Dialog open={assignChampDialogOpen} onOpenChange={setAssignChampDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={selectedShipments.length === 0} data-testid="reassign-btn">
                <Users className="h-4 w-4 mr-2" />
                Re-assign ({selectedShipments.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Re-assign Shipments</DialogTitle>
                <DialogDescription>
                  Assign {selectedShipments.length} shipments to a delivery champ
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label>Select Champ</Label>
                <Select value={selectedChamp || ""} onValueChange={setSelectedChamp}>
                  <SelectTrigger data-testid="reassign-champ-select">
                    <SelectValue placeholder="Choose champ" />
                  </SelectTrigger>
                  <SelectContent>
                    {champs.map((champ) => (
                      <SelectItem key={champ.id} value={champ.id}>
                        {champ.name} ({champ.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleReassignToChamp} disabled={!selectedChamp} data-testid="confirm-reassign-btn">
                  Re-assign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Undelivered Shipments</CardTitle>
          <CardDescription>
            Select shipments to return to warehouse or re-assign to champs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedShipments.length === selectableShipments.length && selectableShipments.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedShipments(selectableShipments.map(s => s.id));
                      } else {
                        setSelectedShipments([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>AWB</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
              ) : undelivered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No undelivered shipments</TableCell></TableRow>
              ) : (
                undelivered.map((shipment) => (
                  <TableRow key={shipment.id} data-testid={`return-row-${shipment.awb}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedShipments.includes(shipment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedShipments([...selectedShipments, shipment.id]);
                          } else {
                            setSelectedShipments(selectedShipments.filter(id => id !== shipment.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{shipment.awb}</TableCell>
                    <TableCell>
                      <div>{shipment.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{shipment.recipient_phone}</div>
                    </TableCell>
                    <TableCell>{shipment.route}</TableCell>
                    <TableCell>₹{shipment.value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[shipment.status]} text-white`}>
                        {statusLabels[shipment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {shipment.delivery_notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== PICKUPS ====================
const Pickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("seller_pickup");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createType, setCreateType] = useState("seller_pickup");
  const [champs, setChamps] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [partialDeliveryDialogOpen, setPartialDeliveryDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [pickupHistory, setPickupHistory] = useState([]);
  const [completionProof, setCompletionProof] = useState({
    proof_image_base64: "",
    latitude: "",
    longitude: "",
    notes: ""
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Seller pickup form
  const [sellerForm, setSellerForm] = useState({
    seller_name: "",
    seller_address: "",
    seller_phone: "",
    pickup_items: [
      { category: "apparel", quantity: 0 },
      { category: "footwear", quantity: 0 },
      { category: "accessories", quantity: 0 },
      { category: "handbags", quantity: 0 }
    ]
  });
  
  // Customer return form
  const [returnForm, setReturnForm] = useState({
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    original_awb: "",
    return_reason: ""
  });
  
  // Personal shopping form
  const [shoppingForm, setShoppingForm] = useState({
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    shopping_items: [{ item_name: "", value: 0 }]
  });

  const fetchPickups = useCallback(async () => {
    try {
      const params = activeTab !== "all" ? { pickup_type: activeTab } : {};
      const response = await axios.get(`${API}/pickups`, { params });
      setPickups(response.data);
    } catch (e) {
      toast.error("Failed to fetch pickups");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchChamps = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/champs`);
      setChamps(response.data.filter(c => c.is_active));
    } catch (e) {
      console.error("Failed to fetch champs");
    }
  }, []);

  useEffect(() => {
    fetchPickups();
    fetchChamps();
  }, [fetchPickups, fetchChamps]);

  const handleCreateSellerPickup = async () => {
    try {
      const items = sellerForm.pickup_items.filter(item => item.quantity > 0);
      if (items.length === 0) {
        toast.error("Please add at least one item with quantity > 0");
        return;
      }
      await axios.post(`${API}/pickups/seller`, {
        ...sellerForm,
        pickup_items: items
      });
      toast.success("Seller pickup created successfully");
      setDialogOpen(false);
      resetForms();
      fetchPickups();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create pickup");
    }
  };

  const handleCreateCustomerReturn = async () => {
    try {
      await axios.post(`${API}/pickups/customer-return`, returnForm);
      toast.success("Customer return pickup created successfully");
      setDialogOpen(false);
      resetForms();
      fetchPickups();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create pickup");
    }
  };

  const handleCreatePersonalShopping = async () => {
    try {
      const items = shoppingForm.shopping_items.filter(item => item.item_name && item.value > 0);
      if (items.length === 0) {
        toast.error("Please add at least one item with name and value");
        return;
      }
      await axios.post(`${API}/pickups/personal-shopping`, {
        ...shoppingForm,
        shopping_items: items.map(i => ({ ...i, is_delivered: false }))
      });
      toast.success("Personal shopping order created successfully");
      setDialogOpen(false);
      resetForms();
      fetchPickups();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create pickup");
    }
  };

  const handleAssignChamp = async (champId) => {
    try {
      await axios.post(`${API}/pickups/${selectedPickup.id}/assign/${champId}`);
      toast.success("Champ assigned successfully");
      setAssignDialogOpen(false);
      setSelectedPickup(null);
      fetchPickups();
    } catch (e) {
      toast.error("Failed to assign champ");
    }
  };

  const handleUpdateShoppingItems = async (items) => {
    try {
      await axios.put(`${API}/pickups/${selectedPickup.id}/shopping-items`, items);
      toast.success("Delivery status updated");
      setPartialDeliveryDialogOpen(false);
      setSelectedPickup(null);
      fetchPickups();
    } catch (e) {
      toast.error("Failed to update delivery status");
    }
  };

  const handleCompleteWithProof = async () => {
    try {
      const deliveredIndices = selectedPickup.shopping_items
        ?.map((item, i) => item.is_delivered ? i : -1)
        .filter(i => i >= 0) || [];
      
      const collectedValue = selectedPickup.shopping_items
        ?.filter(item => item.is_delivered)
        .reduce((sum, item) => sum + item.value, 0) || 0;

      await axios.post(`${API}/pickups/${selectedPickup.id}/complete-with-proof`, {
        pickup_id: selectedPickup.id,
        proof_image_base64: completionProof.proof_image_base64,
        latitude: parseFloat(completionProof.latitude) || null,
        longitude: parseFloat(completionProof.longitude) || null,
        notes: completionProof.notes,
        collected_value: collectedValue,
        delivered_item_indices: deliveredIndices
      });
      toast.success("Pickup completed with proof!");
      setCompletionDialogOpen(false);
      setCompletionProof({ proof_image_base64: "", latitude: "", longitude: "", notes: "" });
      setSelectedPickup(null);
      fetchPickups();
    } catch (e) {
      toast.error("Failed to complete pickup");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionProof({ ...completionProof, proof_image_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCompletionProof({
          ...completionProof,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        toast.success("Location captured!");
        setGettingLocation(false);
      },
      () => {
        toast.error("Failed to get location");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const fetchHistory = async (pickupId) => {
    try {
      const response = await axios.get(`${API}/pickups/${pickupId}/history`);
      setPickupHistory(response.data);
    } catch (e) {
      setPickupHistory([]);
    }
  };

  const openHistoryDialog = (pickup) => {
    setSelectedPickup(pickup);
    fetchHistory(pickup.id);
    setHistoryDialogOpen(true);
  };

  const resetForms = () => {
    setSellerForm({
      seller_name: "",
      seller_address: "",
      seller_phone: "",
      pickup_items: [
        { category: "apparel", quantity: 0 },
        { category: "footwear", quantity: 0 },
        { category: "accessories", quantity: 0 },
        { category: "handbags", quantity: 0 }
      ]
    });
    setReturnForm({
      customer_name: "",
      customer_address: "",
      customer_phone: "",
      original_awb: "",
      return_reason: ""
    });
    setShoppingForm({
      customer_name: "",
      customer_address: "",
      customer_phone: "",
      shopping_items: [{ item_name: "", value: 0 }]
    });
  };

  const addShoppingItem = () => {
    setShoppingForm({
      ...shoppingForm,
      shopping_items: [...shoppingForm.shopping_items, { item_name: "", value: 0 }]
    });
  };

  const updateShoppingItem = (index, field, value) => {
    const items = [...shoppingForm.shopping_items];
    items[index][field] = field === "value" ? parseFloat(value) || 0 : value;
    setShoppingForm({ ...shoppingForm, shopping_items: items });
  };

  const removeShoppingItem = (index) => {
    const items = shoppingForm.shopping_items.filter((_, i) => i !== index);
    setShoppingForm({ ...shoppingForm, shopping_items: items.length ? items : [{ item_name: "", value: 0 }] });
  };

  const statusColors = {
    pending: "bg-gray-500",
    assigned: "bg-blue-500",
    in_progress: "bg-amber-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    partial: "bg-orange-500"
  };

  const pickupTypeLabels = {
    seller_pickup: "Seller Pickup",
    customer_return: "Customer Return",
    personal_shopping: "Personal Shopping"
  };

  const categoryLabels = {
    apparel: "Apparel",
    footwear: "Footwear",
    accessories: "Accessories",
    handbags: "Handbags"
  };

  return (
    <div className="space-y-6" data-testid="pickups-page">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold">Pickups</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-pickup-btn">
              <Plus className="h-4 w-4 mr-2" />
              New Pickup
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Pickup</DialogTitle>
              <DialogDescription>Select pickup type and fill in details</DialogDescription>
            </DialogHeader>
            
            <Tabs value={createType} onValueChange={setCreateType} className="mt-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="seller_pickup" data-testid="tab-seller-pickup">Seller Pickup</TabsTrigger>
                <TabsTrigger value="customer_return" data-testid="tab-customer-return">Customer Return</TabsTrigger>
                <TabsTrigger value="personal_shopping" data-testid="tab-personal-shopping">Personal Shopping</TabsTrigger>
              </TabsList>
              
              {/* Seller Pickup Form */}
              <TabsContent value="seller_pickup" className="space-y-4 mt-4">
                <div>
                  <Label>Seller Name</Label>
                  <Input
                    value={sellerForm.seller_name}
                    onChange={(e) => setSellerForm({ ...sellerForm, seller_name: e.target.value })}
                    data-testid="seller-name-input"
                  />
                </div>
                <div>
                  <Label>Seller Address</Label>
                  <Textarea
                    value={sellerForm.seller_address}
                    onChange={(e) => setSellerForm({ ...sellerForm, seller_address: e.target.value })}
                    data-testid="seller-address-input"
                  />
                </div>
                <div>
                  <Label>Seller Phone</Label>
                  <Input
                    value={sellerForm.seller_phone}
                    onChange={(e) => setSellerForm({ ...sellerForm, seller_phone: e.target.value })}
                    data-testid="seller-phone-input"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Categories & Quantities</Label>
                  {sellerForm.pickup_items.map((item, index) => (
                    <div key={item.category} className="flex items-center gap-3">
                      <span className="w-28 text-sm font-medium">{categoryLabels[item.category]}</span>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...sellerForm.pickup_items];
                          items[index].quantity = parseInt(e.target.value) || 0;
                          setSellerForm({ ...sellerForm, pickup_items: items });
                        }}
                        className="w-24"
                        data-testid={`quantity-${item.category}`}
                      />
                      <span className="text-sm text-muted-foreground">units</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleCreateSellerPickup} className="w-full" data-testid="create-seller-pickup-btn">
                  Create Seller Pickup
                </Button>
              </TabsContent>
              
              {/* Customer Return Form */}
              <TabsContent value="customer_return" className="space-y-4 mt-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={returnForm.customer_name}
                    onChange={(e) => setReturnForm({ ...returnForm, customer_name: e.target.value })}
                    data-testid="return-customer-name"
                  />
                </div>
                <div>
                  <Label>Customer Address</Label>
                  <Textarea
                    value={returnForm.customer_address}
                    onChange={(e) => setReturnForm({ ...returnForm, customer_address: e.target.value })}
                    data-testid="return-customer-address"
                  />
                </div>
                <div>
                  <Label>Customer Phone</Label>
                  <Input
                    value={returnForm.customer_phone}
                    onChange={(e) => setReturnForm({ ...returnForm, customer_phone: e.target.value })}
                    data-testid="return-customer-phone"
                  />
                </div>
                <div>
                  <Label>Original AWB (Optional)</Label>
                  <Input
                    value={returnForm.original_awb}
                    onChange={(e) => setReturnForm({ ...returnForm, original_awb: e.target.value })}
                    data-testid="return-original-awb"
                  />
                </div>
                <div>
                  <Label>Return Reason</Label>
                  <Textarea
                    value={returnForm.return_reason}
                    onChange={(e) => setReturnForm({ ...returnForm, return_reason: e.target.value })}
                    data-testid="return-reason"
                  />
                </div>
                <Button onClick={handleCreateCustomerReturn} className="w-full" data-testid="create-return-btn">
                  Create Customer Return Pickup
                </Button>
              </TabsContent>
              
              {/* Personal Shopping Form */}
              <TabsContent value="personal_shopping" className="space-y-4 mt-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={shoppingForm.customer_name}
                    onChange={(e) => setShoppingForm({ ...shoppingForm, customer_name: e.target.value })}
                    data-testid="shopping-customer-name"
                  />
                </div>
                <div>
                  <Label>Customer Address</Label>
                  <Textarea
                    value={shoppingForm.customer_address}
                    onChange={(e) => setShoppingForm({ ...shoppingForm, customer_address: e.target.value })}
                    data-testid="shopping-customer-address"
                  />
                </div>
                <div>
                  <Label>Customer Phone</Label>
                  <Input
                    value={shoppingForm.customer_phone}
                    onChange={(e) => setShoppingForm({ ...shoppingForm, customer_phone: e.target.value })}
                    data-testid="shopping-customer-phone"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Shopping Items</Label>
                    <Button variant="outline" size="sm" onClick={addShoppingItem} data-testid="add-item-btn">
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                  {shoppingForm.shopping_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <Input
                        placeholder="Item name"
                        value={item.item_name}
                        onChange={(e) => updateShoppingItem(index, "item_name", e.target.value)}
                        className="flex-1"
                        data-testid={`item-name-${index}`}
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={item.value || ""}
                        onChange={(e) => updateShoppingItem(index, "value", e.target.value)}
                        className="w-28"
                        data-testid={`item-value-${index}`}
                      />
                      <span className="text-sm">₹</span>
                      {shoppingForm.shopping_items.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeShoppingItem(index)}>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="text-right text-sm font-medium">
                    Total: ₹{shoppingForm.shopping_items.reduce((sum, i) => sum + (i.value || 0), 0).toLocaleString()}
                  </div>
                </div>
                <Button onClick={handleCreatePersonalShopping} className="w-full" data-testid="create-shopping-btn">
                  Create Personal Shopping Order
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="seller_pickup">Seller Pickups</TabsTrigger>
          <TabsTrigger value="customer_return">Customer Returns</TabsTrigger>
          <TabsTrigger value="personal_shopping">Personal Shopping</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Pickups Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Champ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : pickups.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No pickups found</TableCell></TableRow>
              ) : (
                pickups.map((pickup) => (
                  <TableRow key={pickup.id} data-testid={`pickup-row-${pickup.id}`}>
                    <TableCell>
                      <Badge variant="outline">{pickupTypeLabels[pickup.pickup_type]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {pickup.seller_name || pickup.customer_name}
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {pickup.seller_address || pickup.customer_address}
                    </TableCell>
                    <TableCell>{pickup.seller_phone || pickup.customer_phone}</TableCell>
                    <TableCell>
                      {pickup.pickup_type === "seller_pickup" && pickup.pickup_items?.length > 0 && (
                        <div className="text-xs space-y-0.5">
                          {pickup.pickup_items.map((item, i) => (
                            <div key={i}>{categoryLabels[item.category]}: {item.quantity}</div>
                          ))}
                        </div>
                      )}
                      {pickup.pickup_type === "personal_shopping" && (
                        <div className="text-xs">
                          <div>{pickup.shopping_items?.length || 0} items</div>
                          <div className="font-medium">₹{pickup.total_value?.toLocaleString()}</div>
                          {pickup.status === "partial" && (
                            <div className="text-orange-600">Collected: ₹{pickup.collected_value?.toLocaleString()}</div>
                          )}
                        </div>
                      )}
                      {pickup.pickup_type === "customer_return" && pickup.notes && (
                        <div className="text-xs text-muted-foreground truncate max-w-32">{pickup.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>{pickup.champ_name || "-"}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[pickup.status]} text-white`}>
                        {pickup.status?.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {pickup.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedPickup(pickup); setAssignDialogOpen(true); }}
                            data-testid={`assign-btn-${pickup.id}`}
                          >
                            Assign
                          </Button>
                        )}
                        {pickup.pickup_type === "personal_shopping" && pickup.status === "assigned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedPickup(pickup); setPartialDeliveryDialogOpen(true); }}
                            data-testid={`mark-delivery-btn-${pickup.id}`}
                          >
                            Mark Delivery
                          </Button>
                        )}
                        {(pickup.status === "assigned" || pickup.status === "partial") && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => { 
                              setSelectedPickup(pickup); 
                              setCompletionProof({ proof_image_base64: "", latitude: "", longitude: "", notes: "" });
                              setCompletionDialogOpen(true); 
                            }}
                            data-testid={`complete-btn-${pickup.id}`}
                          >
                            Complete with Proof
                          </Button>
                        )}
                        {pickup.pickup_type === "personal_shopping" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryDialog(pickup)}
                            data-testid={`history-btn-${pickup.id}`}
                          >
                            History
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Champ Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Champ</DialogTitle>
            <DialogDescription>Select a champ to assign this pickup</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {champs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active champs available</p>
            ) : (
              champs.map((champ) => (
                <Button
                  key={champ.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAssignChamp(champ.id)}
                  data-testid={`select-champ-${champ.id}`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {champ.name} - {champ.phone}
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Partial Delivery Dialog for Personal Shopping */}
      <Dialog open={partialDeliveryDialogOpen} onOpenChange={setPartialDeliveryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Delivery Status</DialogTitle>
            <DialogDescription>
              Check items that have been delivered. Unchecked items will be marked as not delivered (partial delivery).
            </DialogDescription>
          </DialogHeader>
          {selectedPickup?.shopping_items && (
            <div className="space-y-3">
              {selectedPickup.shopping_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.is_delivered}
                      onCheckedChange={(checked) => {
                        const items = [...selectedPickup.shopping_items];
                        items[index].is_delivered = checked;
                        setSelectedPickup({ ...selectedPickup, shopping_items: items });
                      }}
                      data-testid={`delivery-check-${index}`}
                    />
                    <span className={item.is_delivered ? "" : "text-muted-foreground"}>{item.item_name}</span>
                  </div>
                  <span className="font-medium">₹{item.value?.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Delivered Value:</span>
                <span className="font-bold text-green-600">
                  ₹{selectedPickup.shopping_items.filter(i => i.is_delivered).reduce((sum, i) => sum + i.value, 0).toLocaleString()}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={() => handleUpdateShoppingItems(selectedPickup.shopping_items)}
                data-testid="confirm-delivery-btn"
              >
                Confirm Delivery Status
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion with Proof Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Pickup with Proof</DialogTitle>
            <DialogDescription>
              Capture proof of pickup completion with photo and location
            </DialogDescription>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm"><strong>Type:</strong> {pickupTypeLabels[selectedPickup.pickup_type]}</p>
                <p className="text-sm"><strong>Customer:</strong> {selectedPickup.seller_name || selectedPickup.customer_name}</p>
                <p className="text-sm"><strong>Address:</strong> {selectedPickup.seller_address || selectedPickup.customer_address}</p>
              </div>

              {selectedPickup.pickup_type === "personal_shopping" && selectedPickup.shopping_items && (
                <div className="space-y-2">
                  <Label className="font-semibold">Items to Deliver:</Label>
                  {selectedPickup.shopping_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <Checkbox
                        checked={item.is_delivered}
                        onCheckedChange={(checked) => {
                          const items = [...selectedPickup.shopping_items];
                          items[index].is_delivered = checked;
                          setSelectedPickup({ ...selectedPickup, shopping_items: items });
                        }}
                      />
                      <span className="flex-1">{item.item_name}</span>
                      <span className="font-medium">₹{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label>Proof Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="mt-1"
                  data-testid="proof-image-input"
                />
                {completionProof.proof_image_base64 && (
                  <img src={completionProof.proof_image_base64} alt="Proof" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    value={completionProof.latitude}
                    onChange={(e) => setCompletionProof({ ...completionProof, latitude: e.target.value })}
                    placeholder="12.9716"
                    data-testid="proof-latitude"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    value={completionProof.longitude}
                    onChange={(e) => setCompletionProof({ ...completionProof, longitude: e.target.value })}
                    placeholder="77.5946"
                    data-testid="proof-longitude"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                data-testid="get-location-btn"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {gettingLocation ? "Getting Location..." : "Get Current Location"}
              </Button>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={completionProof.notes}
                  onChange={(e) => setCompletionProof({ ...completionProof, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  data-testid="proof-notes"
                />
              </div>

              <Button className="w-full" onClick={handleCompleteWithProof} data-testid="submit-proof-btn">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Pickup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog for Personal Shopping */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery History</DialogTitle>
            <DialogDescription>
              Track all delivery attempts and partial deliveries for this order
            </DialogDescription>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium">{selectedPickup.customer_name}</p>
                <p className="text-xs text-muted-foreground">Total Value: ₹{selectedPickup.total_value?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Collected: ₹{selectedPickup.collected_value?.toLocaleString()}</p>
              </div>

              {selectedPickup.shopping_items && (
                <div>
                  <Label className="text-sm font-semibold">Current Item Status:</Label>
                  <div className="mt-2 space-y-1">
                    {selectedPickup.shopping_items.map((item, i) => (
                      <div key={i} className={`flex justify-between text-sm p-2 rounded ${item.is_delivered ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span>{item.item_name}</span>
                        <span className={item.is_delivered ? 'text-green-600' : 'text-gray-500'}>
                          {item.is_delivered ? '✓ Delivered' : 'Pending'} - ₹{item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold">Delivery History:</Label>
                {pickupHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No delivery history yet</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {pickupHistory.map((entry, i) => (
                      <div key={entry.id || i} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <Badge variant={entry.action === "full_delivery" ? "default" : "secondary"}>
                            {entry.action.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleString()}
                          </span>
                        </div>
                        {entry.items_delivered?.length > 0 && (
                          <p className="text-sm mt-1">Items: {entry.items_delivered.join(", ")}</p>
                        )}
                        <p className="text-sm text-green-600">Value: ₹{entry.value_collected?.toLocaleString()}</p>
                        {entry.champ_name && <p className="text-xs text-muted-foreground">By: {entry.champ_name}</p>}
                        {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                        {entry.proof_image && (
                          <img src={entry.proof_image} alt="Proof" className="mt-2 w-20 h-20 object-cover rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== NAVIGATION ====================
const Navigation = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { path: "/", icon: BarChart3, label: "Dashboard" },
    { path: "/shipments", icon: Package, label: "Shipments" },
    { path: "/pickups", icon: Box, label: "Pickups" },
    { path: "/bin-locations", icon: MapPin, label: "Bins" },
    { path: "/champs", icon: Users, label: "Champs" },
    { path: "/run-sheets", icon: FileText, label: "Run Sheets" },
    { path: "/delivery", icon: Truck, label: "Delivery" },
    { path: "/returns", icon: RefreshCw, label: "Returns" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <nav 
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-4 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        data-testid="main-nav"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Last Mile
            </h1>
            <p className="text-xs text-slate-400 mt-1">Delivery Management</p>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-slate-800 rounded"
            onClick={() => setIsOpen(false)}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

// Mobile Header
const MobileHeader = ({ setIsOpen }) => (
  <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white flex items-center px-4 z-30">
    <button 
      onClick={() => setIsOpen(true)} 
      className="p-2 hover:bg-slate-800 rounded"
      data-testid="mobile-menu-btn"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="ml-3 font-bold flex items-center gap-2">
      <Truck className="h-5 w-5" />
      Last Mile
    </h1>
  </header>
);

// ==================== MAIN APP ====================
function App() {
  const [navOpen, setNavOpen] = useState(false);
  
  return (
    <div className="App min-h-screen bg-slate-50 dark:bg-slate-950">
      <BrowserRouter>
        <MobileHeader setIsOpen={setNavOpen} />
        <Navigation isOpen={navOpen} setIsOpen={setNavOpen} />
        <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/pickups" element={<Pickups />} />
            <Route path="/bin-locations" element={<BinLocations />} />
            <Route path="/champs" element={<Champs />} />
            <Route path="/run-sheets" element={<RunSheets />} />
            <Route path="/delivery" element={<DeliveryTracking />} />
            <Route path="/returns" element={<Returns />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
