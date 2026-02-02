from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import hashlib
import base64
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'logitrack-secret-key-2024')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str
    name: str

class AdminResponse(BaseModel):
    id: str
    username: str
    name: str
    token: Optional[str] = None

class DriverCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    vehicle_number: str
    vehicle_type: str

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: Optional[str] = None

class DriverResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    vehicle_number: str
    vehicle_type: str
    status: str
    total_deliveries: int = 0
    pending_cod: float = 0.0
    created_at: str

class ShipmentCreate(BaseModel):
    shipment_type: str  # "delivery" or "pickup"
    pickup_subtype: Optional[str] = None  # "customer_return" or "pickup" (only for pickup type)
    customer_name: str
    customer_phone: str
    pickup_address: str
    delivery_address: Optional[str] = None  # Not required for pickup
    package_description: str
    number_of_items: int = 1
    weight: Optional[float] = None
    is_cod: bool = False
    cod_amount: float = 0.0

class ShipmentUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    pickup_address: Optional[str] = None
    delivery_address: Optional[str] = None
    package_description: Optional[str] = None
    number_of_items: Optional[int] = None
    weight: Optional[float] = None
    is_cod: Optional[bool] = None
    cod_amount: Optional[float] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None

class DeliveryProof(BaseModel):
    shipment_id: str
    image_base64: str
    latitude: float
    longitude: float
    notes: Optional[str] = None

class CODReconciliation(BaseModel):
    shipment_id: str
    amount_collected: float
    reconciliation_notes: Optional[str] = None

class FollowUp(BaseModel):
    shipment_id: str
    notes: str
    follow_up_date: Optional[str] = None

class RescheduleRequest(BaseModel):
    reschedule_date: str
    reschedule_time: Optional[str] = None
    reason: Optional[str] = None

class ShipmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tracking_number: str
    shipment_type: str = "delivery"
    pickup_subtype: Optional[str] = None
    customer_name: str
    customer_phone: str
    pickup_address: str
    delivery_address: Optional[str] = None
    package_description: str
    number_of_items: int = 1
    weight: Optional[float] = None
    is_cod: bool
    cod_amount: float
    cod_collected: bool
    cod_reconciled: bool
    status: str
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    delivery_proof_image: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    delivery_notes: Optional[str] = None
    delivered_at: Optional[str] = None
    completed_at: Optional[str] = None
    reschedule_date: Optional[str] = None
    reschedule_time: Optional[str] = None
    reschedule_reason: Optional[str] = None
    follow_ups: List[dict] = []
    created_at: str
    updated_at: str

class DashboardStats(BaseModel):
    total_shipments: int
    pending_shipments: int
    in_transit: int
    delivered: int
    total_drivers: int
    active_drivers: int
    total_cod_amount: float
    pending_cod_amount: float
    reconciled_cod_amount: float

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(admin_id: str, username: str) -> str:
    payload = {
        "admin_id": admin_id,
        "username": username,
        "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=AdminResponse)
async def register_admin(data: AdminCreate):
    existing = await db.admins.find_one({"username": data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "username": data.username,
        "password": hash_password(data.password),
        "name": data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    
    token = create_token(admin_id, data.username)
    return AdminResponse(id=admin_id, username=data.username, name=data.name, token=token)

@api_router.post("/auth/login", response_model=AdminResponse)
async def login_admin(data: AdminLogin):
    admin = await db.admins.find_one({"username": data.username}, {"_id": 0})
    if not admin or admin["password"] != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(admin["id"], admin["username"])
    return AdminResponse(id=admin["id"], username=admin["username"], name=admin["name"], token=token)

@api_router.get("/auth/me", response_model=AdminResponse)
async def get_current_admin(payload: dict = Depends(verify_token)):
    admin = await db.admins.find_one({"id": payload["admin_id"]}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return AdminResponse(**admin)

# ==================== DRIVER ENDPOINTS ====================

@api_router.post("/drivers", response_model=DriverResponse)
async def create_driver(data: DriverCreate, payload: dict = Depends(verify_token)):
    driver_id = str(uuid.uuid4())
    driver_doc = {
        "id": driver_id,
        "name": data.name,
        "phone": data.phone,
        "email": data.email,
        "vehicle_number": data.vehicle_number,
        "vehicle_type": data.vehicle_type,
        "status": "active",
        "total_deliveries": 0,
        "pending_cod": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.drivers.insert_one(driver_doc)
    return DriverResponse(**driver_doc)

@api_router.get("/drivers", response_model=List[DriverResponse])
async def get_drivers(payload: dict = Depends(verify_token)):
    drivers = await db.drivers.find({}, {"_id": 0}).to_list(1000)
    return [DriverResponse(**d) for d in drivers]

@api_router.get("/drivers/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: str, payload: dict = Depends(verify_token)):
    driver = await db.drivers.find_one({"id": driver_id}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return DriverResponse(**driver)

@api_router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: str, data: DriverUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.drivers.update_one({"id": driver_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver = await db.drivers.find_one({"id": driver_id}, {"_id": 0})
    return DriverResponse(**driver)

@api_router.delete("/drivers/{driver_id}")
async def delete_driver(driver_id: str, payload: dict = Depends(verify_token)):
    result = await db.drivers.delete_one({"id": driver_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver deleted successfully"}

# ==================== SHIPMENT ENDPOINTS ====================

def generate_tracking_number():
    return f"LT{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"

@api_router.post("/shipments", response_model=ShipmentResponse)
async def create_shipment(data: ShipmentCreate, payload: dict = Depends(verify_token)):
    shipment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    shipment_doc = {
        "id": shipment_id,
        "tracking_number": generate_tracking_number(),
        "shipment_type": data.shipment_type,
        "pickup_subtype": data.pickup_subtype if data.shipment_type == "pickup" else None,
        "customer_name": data.customer_name,
        "customer_phone": data.customer_phone,
        "pickup_address": data.pickup_address,
        "delivery_address": data.delivery_address if data.shipment_type == "delivery" else None,
        "package_description": data.package_description,
        "number_of_items": data.number_of_items,
        "weight": data.weight,
        "is_cod": data.is_cod if data.shipment_type == "delivery" else False,
        "cod_amount": data.cod_amount if (data.is_cod and data.shipment_type == "delivery") else 0.0,
        "cod_collected": False,
        "cod_reconciled": False,
        "status": "pending",
        "driver_id": None,
        "driver_name": None,
        "delivery_proof_image": None,
        "delivery_latitude": None,
        "delivery_longitude": None,
        "delivery_notes": None,
        "delivered_at": None,
        "completed_at": None,
        "reschedule_date": None,
        "reschedule_time": None,
        "reschedule_reason": None,
        "follow_ups": [],
        "created_at": now,
        "updated_at": now
    }
    await db.shipments.insert_one(shipment_doc)
    return ShipmentResponse(**shipment_doc)

@api_router.get("/shipments", response_model=List[ShipmentResponse])
async def get_shipments(status: Optional[str] = None, driver_id: Optional[str] = None, payload: dict = Depends(verify_token)):
    query = {}
    if status:
        query["status"] = status
    if driver_id:
        query["driver_id"] = driver_id
    
    shipments = await db.shipments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ShipmentResponse(**s) for s in shipments]

@api_router.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def get_shipment(shipment_id: str, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ShipmentResponse(**shipment)

@api_router.put("/shipments/{shipment_id}", response_model=ShipmentResponse)
async def update_shipment(shipment_id: str, data: ShipmentUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # If assigning driver, get driver name
    if "driver_id" in update_data and update_data["driver_id"]:
        driver = await db.drivers.find_one({"id": update_data["driver_id"]}, {"_id": 0})
        if driver:
            update_data["driver_name"] = driver["name"]
            if update_data.get("status") is None:
                update_data["status"] = "assigned"
    
    result = await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.post("/shipments/{shipment_id}/assign/{driver_id}", response_model=ShipmentResponse)
async def assign_driver(shipment_id: str, driver_id: str, payload: dict = Depends(verify_token)):
    driver = await db.drivers.find_one({"id": driver_id}, {"_id": 0})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = {
        "driver_id": driver_id,
        "driver_name": driver["name"],
        "status": "assigned",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.post("/shipments/{shipment_id}/unassign", response_model=ShipmentResponse)
async def unassign_driver(shipment_id: str, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    update_data = {
        "driver_id": None,
        "driver_name": None,
        "status": "pending",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: str, payload: dict = Depends(verify_token)):
    result = await db.shipments.delete_one({"id": shipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": "Shipment deleted successfully"}

# ==================== MARK AS DELIVERED / PICKUP COMPLETED ====================

@api_router.post("/shipments/{shipment_id}/mark-delivered", response_model=ShipmentResponse)
async def mark_as_delivered(shipment_id: str, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    if shipment.get("shipment_type") != "delivery":
        raise HTTPException(status_code=400, detail="This action is only for delivery shipments")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "status": "delivered",
        "delivered_at": now,
        "completed_at": now,
        "updated_at": now
    }
    
    # If COD, mark as collected
    if shipment.get("is_cod"):
        update_data["cod_collected"] = True
        if shipment.get("driver_id"):
            await db.drivers.update_one(
                {"id": shipment["driver_id"]},
                {"$inc": {"pending_cod": shipment["cod_amount"], "total_deliveries": 1}}
            )
    else:
        if shipment.get("driver_id"):
            await db.drivers.update_one(
                {"id": shipment["driver_id"]},
                {"$inc": {"total_deliveries": 1}}
            )
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.post("/shipments/{shipment_id}/pickup-completed", response_model=ShipmentResponse)
async def mark_pickup_completed(shipment_id: str, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    if shipment.get("shipment_type") != "pickup":
        raise HTTPException(status_code=400, detail="This action is only for pickup shipments")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "status": "completed",
        "completed_at": now,
        "updated_at": now
    }
    
    if shipment.get("driver_id"):
        await db.drivers.update_one(
            {"id": shipment["driver_id"]},
            {"$inc": {"total_deliveries": 1}}
        )
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.post("/shipments/{shipment_id}/reschedule", response_model=ShipmentResponse)
async def reschedule_shipment(shipment_id: str, data: RescheduleRequest, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "status": "rescheduled",
        "reschedule_date": data.reschedule_date,
        "reschedule_time": data.reschedule_time,
        "reschedule_reason": data.reason,
        "updated_at": now
    }
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

# ==================== DELIVERY PROOF ENDPOINT ====================

@api_router.post("/shipments/{shipment_id}/delivery-proof", response_model=ShipmentResponse)
async def submit_delivery_proof(shipment_id: str, data: DeliveryProof, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "delivery_proof_image": data.image_base64,
        "delivery_latitude": data.latitude,
        "delivery_longitude": data.longitude,
        "delivery_notes": data.notes,
        "delivered_at": now,
        "status": "delivered",
        "updated_at": now
    }
    
    # If COD, mark as collected
    if shipment.get("is_cod"):
        update_data["cod_collected"] = True
        # Update driver's pending COD
        if shipment.get("driver_id"):
            await db.drivers.update_one(
                {"id": shipment["driver_id"]},
                {
                    "$inc": {"pending_cod": shipment["cod_amount"], "total_deliveries": 1}
                }
            )
    else:
        # Update driver's delivery count
        if shipment.get("driver_id"):
            await db.drivers.update_one(
                {"id": shipment["driver_id"]},
                {"$inc": {"total_deliveries": 1}}
            )
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

# ==================== COD RECONCILIATION ====================

@api_router.post("/shipments/{shipment_id}/reconcile", response_model=ShipmentResponse)
async def reconcile_cod(shipment_id: str, data: CODReconciliation, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    if not shipment.get("is_cod"):
        raise HTTPException(status_code=400, detail="This shipment is not COD")
    
    if not shipment.get("cod_collected"):
        raise HTTPException(status_code=400, detail="COD not yet collected")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = {
        "cod_reconciled": True,
        "reconciliation_notes": data.reconciliation_notes,
        "reconciled_at": now,
        "updated_at": now
    }
    
    # Update driver's pending COD
    if shipment.get("driver_id"):
        await db.drivers.update_one(
            {"id": shipment["driver_id"]},
            {"$inc": {"pending_cod": -data.amount_collected}}
        )
    
    await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

@api_router.get("/cod/pending", response_model=List[ShipmentResponse])
async def get_pending_cod(payload: dict = Depends(verify_token)):
    shipments = await db.shipments.find(
        {"is_cod": True, "cod_collected": True, "cod_reconciled": False},
        {"_id": 0}
    ).to_list(1000)
    return [ShipmentResponse(**s) for s in shipments]

# ==================== FOLLOW-UP ENDPOINTS ====================

@api_router.post("/shipments/{shipment_id}/follow-up", response_model=ShipmentResponse)
async def add_follow_up(shipment_id: str, data: FollowUp, payload: dict = Depends(verify_token)):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    follow_up = {
        "id": str(uuid.uuid4()),
        "notes": data.notes,
        "follow_up_date": data.follow_up_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": payload["username"]
    }
    
    await db.shipments.update_one(
        {"id": shipment_id},
        {
            "$push": {"follow_ups": follow_up},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    return ShipmentResponse(**shipment)

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(payload: dict = Depends(verify_token)):
    # Shipment stats
    total_shipments = await db.shipments.count_documents({})
    pending_shipments = await db.shipments.count_documents({"status": "pending"})
    in_transit = await db.shipments.count_documents({"status": {"$in": ["assigned", "picked_up", "in_transit"]}})
    delivered = await db.shipments.count_documents({"status": "delivered"})
    
    # Driver stats
    total_drivers = await db.drivers.count_documents({})
    active_drivers = await db.drivers.count_documents({"status": "active"})
    
    # COD stats
    cod_pipeline = [
        {"$match": {"is_cod": True}},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$cod_amount"},
            "pending": {"$sum": {"$cond": [{"$and": [{"$eq": ["$cod_collected", True]}, {"$eq": ["$cod_reconciled", False]}]}, "$cod_amount", 0]}},
            "reconciled": {"$sum": {"$cond": ["$cod_reconciled", "$cod_amount", 0]}}
        }}
    ]
    cod_result = await db.shipments.aggregate(cod_pipeline).to_list(1)
    cod_stats = cod_result[0] if cod_result else {"total": 0, "pending": 0, "reconciled": 0}
    
    return DashboardStats(
        total_shipments=total_shipments,
        pending_shipments=pending_shipments,
        in_transit=in_transit,
        delivered=delivered,
        total_drivers=total_drivers,
        active_drivers=active_drivers,
        total_cod_amount=cod_stats.get("total", 0),
        pending_cod_amount=cod_stats.get("pending", 0),
        reconciled_cod_amount=cod_stats.get("reconciled", 0)
    )

# ==================== BULK UPLOAD ====================

@api_router.get("/shipments/template/download")
async def download_template(payload: dict = Depends(verify_token)):
    """Download CSV template for bulk shipment upload"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow([
        'shipment_type', 'pickup_subtype', 'customer_name', 'customer_phone',
        'pickup_address', 'delivery_address', 'package_description', 
        'number_of_items', 'weight', 'is_cod', 'cod_amount'
    ])
    
    # Example rows
    writer.writerow([
        'delivery', '', 'John Doe', '9876543210',
        '123 Warehouse St', '456 Customer Lane', 'Electronics',
        '2', '1.5', 'true', '1500'
    ])
    writer.writerow([
        'pickup', 'customer_return', 'Jane Smith', '8765432109',
        '789 Return Address', '', 'Return Package',
        '1', '0.5', 'false', ''
    ])
    writer.writerow([
        'pickup', 'pickup', 'Bob Wilson', '7654321098',
        '321 Pickup Location', '', 'Documents',
        '3', '', 'false', ''
    ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=shipment_template.csv"}
    )

@api_router.post("/shipments/bulk-upload")
async def bulk_upload_shipments(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    """Upload CSV file to create multiple shipments"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    created_shipments = []
    errors = []
    row_num = 1
    
    for row in reader:
        row_num += 1
        try:
            # Validate required fields
            if not row.get('customer_name') or not row.get('customer_phone') or not row.get('pickup_address'):
                errors.append({"row": row_num, "error": "Missing required fields (customer_name, customer_phone, pickup_address)"})
                continue
            
            shipment_type = row.get('shipment_type', 'delivery').lower()
            if shipment_type not in ['delivery', 'pickup']:
                errors.append({"row": row_num, "error": "Invalid shipment_type. Must be 'delivery' or 'pickup'"})
                continue
            
            if shipment_type == 'delivery' and not row.get('delivery_address'):
                errors.append({"row": row_num, "error": "delivery_address required for delivery shipments"})
                continue
            
            shipment_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()
            is_cod = row.get('is_cod', '').lower() in ['true', '1', 'yes']
            
            shipment_doc = {
                "id": shipment_id,
                "tracking_number": generate_tracking_number(),
                "shipment_type": shipment_type,
                "pickup_subtype": row.get('pickup_subtype') if shipment_type == 'pickup' else None,
                "customer_name": row['customer_name'].strip(),
                "customer_phone": row['customer_phone'].strip(),
                "pickup_address": row['pickup_address'].strip(),
                "delivery_address": row.get('delivery_address', '').strip() if shipment_type == 'delivery' else None,
                "package_description": row.get('package_description', '').strip() or 'Package',
                "number_of_items": int(row.get('number_of_items') or 1),
                "weight": float(row['weight']) if row.get('weight') else None,
                "is_cod": is_cod if shipment_type == 'delivery' else False,
                "cod_amount": float(row['cod_amount']) if (is_cod and row.get('cod_amount') and shipment_type == 'delivery') else 0.0,
                "cod_collected": False,
                "cod_reconciled": False,
                "status": "pending",
                "driver_id": None,
                "driver_name": None,
                "delivery_proof_image": None,
                "delivery_latitude": None,
                "delivery_longitude": None,
                "delivery_notes": None,
                "delivered_at": None,
                "completed_at": None,
                "reschedule_date": None,
                "reschedule_time": None,
                "reschedule_reason": None,
                "follow_ups": [],
                "created_at": now,
                "updated_at": now
            }
            
            await db.shipments.insert_one(shipment_doc)
            created_shipments.append({
                "tracking_number": shipment_doc["tracking_number"],
                "customer_name": shipment_doc["customer_name"]
            })
            
        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})
    
    return {
        "success": True,
        "created_count": len(created_shipments),
        "error_count": len(errors),
        "created_shipments": created_shipments,
        "errors": errors
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
