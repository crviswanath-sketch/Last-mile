from fastapi import FastAPI, APIRouter, HTTPException, Query
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
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== ENUMS ====================
class ShipmentStatus(str, Enum):
    PENDING_HANDOVER = "pending_handover"
    IN_SCANNED = "in_scanned"
    ASSIGNED_TO_BIN = "assigned_to_bin"
    ASSIGNED_TO_CHAMP = "assigned_to_champ"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    NO_RESPONSE = "no_response"
    RESCHEDULED = "rescheduled"
    RETURNED_TO_WH = "returned_to_wh"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    PREPAID = "prepaid"

class DeliveryOutcome(str, Enum):
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    NO_RESPONSE = "no_response"
    RESCHEDULED = "rescheduled"

class PickupType(str, Enum):
    SELLER_PICKUP = "seller_pickup"
    CUSTOMER_RETURN = "customer_return"
    PERSONAL_SHOPPING = "personal_shopping"

class PickupStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    PARTIAL = "partial"

class PickupCategory(str, Enum):
    APPAREL = "apparel"
    FOOTWEAR = "footwear"
    ACCESSORIES = "accessories"
    HANDBAGS = "handbags"

# ==================== MODELS ====================

# Bin Location Models
class BinLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    route: str
    capacity: int = 100
    current_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BinLocationCreate(BaseModel):
    name: str
    route: str
    capacity: int = 100

# Champ (Delivery Personnel) Models
class Champ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    assigned_routes: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChampCreate(BaseModel):
    name: str
    phone: str
    assigned_routes: List[str] = []

# Shipment Models
class Shipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    awb: str  # Air Waybill - unique identifier
    recipient_name: str
    recipient_address: str
    recipient_phone: str
    route: str
    payment_method: PaymentMethod
    value: float
    status: ShipmentStatus = ShipmentStatus.PENDING_HANDOVER
    bin_location_id: Optional[str] = None
    champ_id: Optional[str] = None
    run_sheet_id: Optional[str] = None
    delivery_notes: Optional[str] = None
    rescheduled_date: Optional[str] = None
    inscan_date: Optional[str] = None
    inscan_time: Optional[str] = None
    # Delivery proof fields
    delivery_proof_image: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    delivery_timestamp: Optional[str] = None
    delivered_by_champ_id: Optional[str] = None
    delivered_by_champ_name: Optional[str] = None
    cancellation_reason: Optional[str] = None
    reschedule_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShipmentCreate(BaseModel):
    awb: str
    recipient_name: str
    recipient_address: str
    recipient_phone: str
    route: str
    payment_method: PaymentMethod
    value: float

class ShipmentUpdate(BaseModel):
    status: Optional[ShipmentStatus] = None
    bin_location_id: Optional[str] = None
    champ_id: Optional[str] = None
    delivery_notes: Optional[str] = None
    rescheduled_date: Optional[str] = None

# Run Sheet Models
class RunSheet(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    champ_id: str
    champ_name: str
    shipment_ids: List[str] = []
    total_value: float = 0
    cash_to_collect: float = 0
    card_to_collect: float = 0
    is_scanned_out: bool = False
    is_scanned_in: bool = False
    scanned_out_at: Optional[str] = None
    scanned_in_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RunSheetCreate(BaseModel):
    champ_id: str
    shipment_ids: List[str]

# Delivery Attempt Models
class DeliveryAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shipment_id: str
    run_sheet_id: str
    champ_id: str
    outcome: DeliveryOutcome
    payment_collected: float = 0
    payment_method_used: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    rescheduled_date: Optional[str] = None
    attempted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DeliveryAttemptCreate(BaseModel):
    shipment_id: str
    run_sheet_id: str
    outcome: DeliveryOutcome
    payment_collected: float = 0
    payment_method_used: Optional[PaymentMethod] = None
    notes: Optional[str] = None
    rescheduled_date: Optional[str] = None

# Pickup Item Model (for seller pickup categories)
class PickupItem(BaseModel):
    category: PickupCategory
    quantity: int

# Personal Shopping Item Model
class PersonalShoppingItem(BaseModel):
    item_name: str
    value: float
    is_delivered: bool = False

# Pickup Models
class Pickup(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pickup_type: PickupType
    status: PickupStatus = PickupStatus.PENDING
    seller_name: Optional[str] = None
    seller_address: Optional[str] = None
    seller_phone: Optional[str] = None
    customer_name: Optional[str] = None
    customer_address: Optional[str] = None
    customer_phone: Optional[str] = None
    # For seller pickup
    pickup_items: List[PickupItem] = []
    # For personal shopping
    shopping_items: List[PersonalShoppingItem] = []
    total_value: float = 0
    collected_value: float = 0
    champ_id: Optional[str] = None
    champ_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SellerPickupCreate(BaseModel):
    seller_name: str
    seller_address: str
    seller_phone: str
    pickup_items: List[PickupItem]

class CustomerReturnCreate(BaseModel):
    customer_name: str
    customer_address: str
    customer_phone: str
    original_awb: Optional[str] = None
    return_reason: Optional[str] = None

class PersonalShoppingCreate(BaseModel):
    customer_name: str
    customer_address: str
    customer_phone: str
    shopping_items: List[PersonalShoppingItem]

class PickupUpdate(BaseModel):
    status: Optional[PickupStatus] = None
    champ_id: Optional[str] = None
    notes: Optional[str] = None
    collected_value: Optional[float] = None
    shopping_items: Optional[List[PersonalShoppingItem]] = None

# Pickup Completion with Proof
class PickupCompletionProof(BaseModel):
    pickup_id: str
    proof_image_base64: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    collected_value: float = 0
    # For partial delivery of personal shopping items
    delivered_item_indices: Optional[List[int]] = None

# Personal Shopping History Entry
class ShoppingHistoryEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pickup_id: str
    action: str  # "partial_delivery", "full_delivery", "item_returned"
    items_delivered: List[str] = []
    value_collected: float = 0
    champ_id: Optional[str] = None
    champ_name: Optional[str] = None
    proof_image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================
def serialize_datetime(obj):
    """Convert datetime objects to ISO string for MongoDB storage"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def prepare_doc_for_db(doc: dict) -> dict:
    """Prepare document for MongoDB by converting datetime fields"""
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

# ==================== BIN LOCATION ROUTES ====================
@api_router.post("/bin-locations", response_model=BinLocation)
async def create_bin_location(input: BinLocationCreate):
    bin_loc = BinLocation(**input.model_dump())
    doc = prepare_doc_for_db(bin_loc.model_dump())
    await db.bin_locations.insert_one(doc)
    return bin_loc

@api_router.get("/bin-locations", response_model=List[BinLocation])
async def get_bin_locations(route: Optional[str] = None):
    query = {} if not route else {"route": route}
    locations = await db.bin_locations.find(query, {"_id": 0}).to_list(1000)
    return locations

@api_router.get("/bin-locations/{bin_id}", response_model=BinLocation)
async def get_bin_location(bin_id: str):
    location = await db.bin_locations.find_one({"id": bin_id}, {"_id": 0})
    if not location:
        raise HTTPException(status_code=404, detail="Bin location not found")
    return location

# ==================== CHAMP ROUTES ====================
@api_router.post("/champs", response_model=Champ)
async def create_champ(input: ChampCreate):
    champ = Champ(**input.model_dump())
    doc = prepare_doc_for_db(champ.model_dump())
    await db.champs.insert_one(doc)
    return champ

@api_router.get("/champs", response_model=List[Champ])
async def get_champs(is_active: Optional[bool] = None):
    query = {} if is_active is None else {"is_active": is_active}
    champs = await db.champs.find(query, {"_id": 0}).to_list(1000)
    return champs

@api_router.get("/champs/{champ_id}", response_model=Champ)
async def get_champ(champ_id: str):
    champ = await db.champs.find_one({"id": champ_id}, {"_id": 0})
    if not champ:
        raise HTTPException(status_code=404, detail="Champ not found")
    return champ

@api_router.put("/champs/{champ_id}", response_model=Champ)
async def update_champ(champ_id: str, input: ChampCreate):
    result = await db.champs.update_one(
        {"id": champ_id},
        {"$set": input.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Champ not found")
    return await get_champ(champ_id)

# ==================== SHIPMENT ROUTES ====================
@api_router.post("/shipments", response_model=Shipment)
async def create_shipment(input: ShipmentCreate):
    # Check if AWB already exists
    existing = await db.shipments.find_one({"awb": input.awb})
    if existing:
        raise HTTPException(status_code=400, detail="AWB already exists")
    
    shipment = Shipment(**input.model_dump())
    doc = prepare_doc_for_db(shipment.model_dump())
    await db.shipments.insert_one(doc)
    return shipment

@api_router.post("/shipments/bulk", response_model=List[Shipment])
async def create_shipments_bulk(inputs: List[ShipmentCreate]):
    shipments = []
    for input in inputs:
        existing = await db.shipments.find_one({"awb": input.awb})
        if not existing:
            shipment = Shipment(**input.model_dump())
            doc = prepare_doc_for_db(shipment.model_dump())
            await db.shipments.insert_one(doc)
            shipments.append(shipment)
    return shipments

@api_router.get("/shipments", response_model=List[Shipment])
async def get_shipments(
    status: Optional[ShipmentStatus] = None,
    route: Optional[str] = None,
    champ_id: Optional[str] = None,
    bin_location_id: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status.value
    if route:
        query["route"] = route
    if champ_id:
        query["champ_id"] = champ_id
    if bin_location_id:
        query["bin_location_id"] = bin_location_id
    
    shipments = await db.shipments.find(query, {"_id": 0}).to_list(1000)
    return shipments

@api_router.get("/shipments/{shipment_id}", response_model=Shipment)
async def get_shipment(shipment_id: str):
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@api_router.get("/shipments/awb/{awb}", response_model=Shipment)
async def get_shipment_by_awb(awb: str):
    shipment = await db.shipments.find_one({"awb": awb}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@api_router.put("/shipments/{shipment_id}", response_model=Shipment)
async def update_shipment(shipment_id: str, input: ShipmentUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.shipments.update_one(
        {"id": shipment_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return await get_shipment(shipment_id)

# ==================== LOGISTICS OPERATIONS ====================

# Step 1: In-Scan shipment (Warehouse to Logistics)
@api_router.post("/logistics/in-scan/{awb}", response_model=Shipment)
async def in_scan_shipment(awb: str):
    shipment = await db.shipments.find_one({"awb": awb}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    if shipment["status"] != ShipmentStatus.PENDING_HANDOVER.value:
        raise HTTPException(status_code=400, detail=f"Shipment already in status: {shipment['status']}")
    
    await db.shipments.update_one(
        {"awb": awb},
        {"$set": {
            "status": ShipmentStatus.IN_SCANNED.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return await get_shipment_by_awb(awb)

# Step 2: Assign to Bin Location based on Route
@api_router.post("/logistics/assign-bin", response_model=List[Shipment])
async def assign_to_bin(shipment_ids: List[str], bin_location_id: str):
    # Verify bin location exists
    bin_loc = await db.bin_locations.find_one({"id": bin_location_id}, {"_id": 0})
    if not bin_loc:
        raise HTTPException(status_code=404, detail="Bin location not found")
    
    updated_shipments = []
    for sid in shipment_ids:
        result = await db.shipments.update_one(
            {"id": sid, "status": ShipmentStatus.IN_SCANNED.value},
            {"$set": {
                "bin_location_id": bin_location_id,
                "status": ShipmentStatus.ASSIGNED_TO_BIN.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if result.modified_count > 0:
            shipment = await db.shipments.find_one({"id": sid}, {"_id": 0})
            updated_shipments.append(shipment)
    
    # Update bin location count
    await db.bin_locations.update_one(
        {"id": bin_location_id},
        {"$inc": {"current_count": len(updated_shipments)}}
    )
    
    return updated_shipments

# Step 3: Assign to Champ (AWB wise)
@api_router.post("/logistics/assign-champ", response_model=List[Shipment])
async def assign_to_champ(shipment_ids: List[str], champ_id: str):
    # Verify champ exists
    champ = await db.champs.find_one({"id": champ_id}, {"_id": 0})
    if not champ:
        raise HTTPException(status_code=404, detail="Champ not found")
    
    updated_shipments = []
    for sid in shipment_ids:
        result = await db.shipments.update_one(
            {"id": sid, "status": {"$in": [ShipmentStatus.ASSIGNED_TO_BIN.value, ShipmentStatus.RESCHEDULED.value, ShipmentStatus.RETURNED_TO_WH.value]}},
            {"$set": {
                "champ_id": champ_id,
                "status": ShipmentStatus.ASSIGNED_TO_CHAMP.value,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if result.modified_count > 0:
            shipment = await db.shipments.find_one({"id": sid}, {"_id": 0})
            updated_shipments.append(shipment)
    
    return updated_shipments

# ==================== RUN SHEET ROUTES ====================

# Step 4: Generate Run Sheet
@api_router.post("/run-sheets", response_model=RunSheet)
async def create_run_sheet(input: RunSheetCreate):
    # Verify champ exists
    champ = await db.champs.find_one({"id": input.champ_id}, {"_id": 0})
    if not champ:
        raise HTTPException(status_code=404, detail="Champ not found")
    
    # Get shipments and calculate totals
    shipments = await db.shipments.find(
        {"id": {"$in": input.shipment_ids}, "champ_id": input.champ_id},
        {"_id": 0}
    ).to_list(1000)
    
    if not shipments:
        raise HTTPException(status_code=400, detail="No valid shipments found for this champ")
    
    total_value = sum(s["value"] for s in shipments)
    cash_to_collect = sum(s["value"] for s in shipments if s["payment_method"] == PaymentMethod.CASH.value)
    card_to_collect = sum(s["value"] for s in shipments if s["payment_method"] == PaymentMethod.CARD.value)
    
    run_sheet = RunSheet(
        champ_id=input.champ_id,
        champ_name=champ["name"],
        shipment_ids=[s["id"] for s in shipments],
        total_value=total_value,
        cash_to_collect=cash_to_collect,
        card_to_collect=card_to_collect
    )
    
    doc = prepare_doc_for_db(run_sheet.model_dump())
    await db.run_sheets.insert_one(doc)
    
    # Update shipments with run sheet ID
    for s in shipments:
        await db.shipments.update_one(
            {"id": s["id"]},
            {"$set": {"run_sheet_id": run_sheet.id}}
        )
    
    return run_sheet

@api_router.get("/run-sheets", response_model=List[RunSheet])
async def get_run_sheets(champ_id: Optional[str] = None, is_active: Optional[bool] = None):
    query = {}
    if champ_id:
        query["champ_id"] = champ_id
    if is_active is not None:
        if is_active:
            query["is_scanned_in"] = False
        else:
            query["is_scanned_in"] = True
    
    run_sheets = await db.run_sheets.find(query, {"_id": 0}).to_list(1000)
    return run_sheets

@api_router.get("/run-sheets/{run_sheet_id}", response_model=RunSheet)
async def get_run_sheet(run_sheet_id: str):
    run_sheet = await db.run_sheets.find_one({"id": run_sheet_id}, {"_id": 0})
    if not run_sheet:
        raise HTTPException(status_code=404, detail="Run sheet not found")
    return run_sheet

# Step 5: Scan Run Sheet at Outbound Security
@api_router.post("/run-sheets/{run_sheet_id}/scan-out", response_model=RunSheet)
async def scan_out_run_sheet(run_sheet_id: str):
    run_sheet = await db.run_sheets.find_one({"id": run_sheet_id}, {"_id": 0})
    if not run_sheet:
        raise HTTPException(status_code=404, detail="Run sheet not found")
    
    if run_sheet["is_scanned_out"]:
        raise HTTPException(status_code=400, detail="Run sheet already scanned out")
    
    await db.run_sheets.update_one(
        {"id": run_sheet_id},
        {"$set": {
            "is_scanned_out": True,
            "scanned_out_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update all shipments to out for delivery
    await db.shipments.update_many(
        {"run_sheet_id": run_sheet_id},
        {"$set": {
            "status": ShipmentStatus.OUT_FOR_DELIVERY.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return await get_run_sheet(run_sheet_id)

# Step 8: Scan Run Sheet on Return
@api_router.post("/run-sheets/{run_sheet_id}/scan-in", response_model=RunSheet)
async def scan_in_run_sheet(run_sheet_id: str):
    run_sheet = await db.run_sheets.find_one({"id": run_sheet_id}, {"_id": 0})
    if not run_sheet:
        raise HTTPException(status_code=404, detail="Run sheet not found")
    
    await db.run_sheets.update_one(
        {"id": run_sheet_id},
        {"$set": {
            "is_scanned_in": True,
            "scanned_in_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return await get_run_sheet(run_sheet_id)

# ==================== DELIVERY ATTEMPT ROUTES ====================

# Step 6 & 7: Record Delivery Attempt
@api_router.post("/delivery-attempts", response_model=DeliveryAttempt)
async def create_delivery_attempt(input: DeliveryAttemptCreate):
    # Verify shipment exists
    shipment = await db.shipments.find_one({"id": input.shipment_id}, {"_id": 0})
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Get run sheet to get champ_id
    run_sheet = await db.run_sheets.find_one({"id": input.run_sheet_id}, {"_id": 0})
    if not run_sheet:
        raise HTTPException(status_code=404, detail="Run sheet not found")
    
    attempt = DeliveryAttempt(
        **input.model_dump(),
        champ_id=run_sheet["champ_id"]
    )
    
    doc = prepare_doc_for_db(attempt.model_dump())
    await db.delivery_attempts.insert_one(doc)
    
    # Update shipment status based on outcome
    new_status = None
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if input.outcome == DeliveryOutcome.DELIVERED:
        new_status = ShipmentStatus.DELIVERED.value
    elif input.outcome == DeliveryOutcome.CANCELLED:
        new_status = ShipmentStatus.CANCELLED.value
    elif input.outcome == DeliveryOutcome.NO_RESPONSE:
        new_status = ShipmentStatus.NO_RESPONSE.value
    elif input.outcome == DeliveryOutcome.RESCHEDULED:
        new_status = ShipmentStatus.RESCHEDULED.value
        if input.rescheduled_date:
            update_data["rescheduled_date"] = input.rescheduled_date
    
    if new_status:
        update_data["status"] = new_status
        if input.notes:
            update_data["delivery_notes"] = input.notes
        
        await db.shipments.update_one(
            {"id": input.shipment_id},
            {"$set": update_data}
        )
    
    return attempt

@api_router.get("/delivery-attempts", response_model=List[DeliveryAttempt])
async def get_delivery_attempts(
    shipment_id: Optional[str] = None,
    run_sheet_id: Optional[str] = None,
    champ_id: Optional[str] = None
):
    query = {}
    if shipment_id:
        query["shipment_id"] = shipment_id
    if run_sheet_id:
        query["run_sheet_id"] = run_sheet_id
    if champ_id:
        query["champ_id"] = champ_id
    
    attempts = await db.delivery_attempts.find(query, {"_id": 0}).to_list(1000)
    return attempts

# ==================== RETURN TO WAREHOUSE ====================

# Step 9: Return undelivered shipments to warehouse
@api_router.post("/logistics/return-to-warehouse", response_model=List[Shipment])
async def return_to_warehouse(shipment_ids: List[str]):
    updated_shipments = []
    for sid in shipment_ids:
        result = await db.shipments.update_one(
            {"id": sid, "status": {"$in": [
                ShipmentStatus.CANCELLED.value,
                ShipmentStatus.NO_RESPONSE.value
            ]}},
            {"$set": {
                "status": ShipmentStatus.RETURNED_TO_WH.value,
                "champ_id": None,
                "run_sheet_id": None,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if result.modified_count > 0:
            shipment = await db.shipments.find_one({"id": sid}, {"_id": 0})
            updated_shipments.append(shipment)
    
    return updated_shipments

# Get undelivered shipments (for common location assignment)
@api_router.get("/logistics/undelivered", response_model=List[Shipment])
async def get_undelivered_shipments():
    shipments = await db.shipments.find(
        {"status": {"$in": [
            ShipmentStatus.CANCELLED.value,
            ShipmentStatus.NO_RESPONSE.value,
            ShipmentStatus.RETURNED_TO_WH.value,
            ShipmentStatus.RESCHEDULED.value
        ]}},
        {"_id": 0}
    ).to_list(1000)
    return shipments

# ==================== PICKUP ROUTES ====================
@api_router.post("/pickups/seller", response_model=Pickup)
async def create_seller_pickup(input: SellerPickupCreate):
    total_qty = sum(item.quantity for item in input.pickup_items)
    pickup = Pickup(
        pickup_type=PickupType.SELLER_PICKUP,
        seller_name=input.seller_name,
        seller_address=input.seller_address,
        seller_phone=input.seller_phone,
        pickup_items=[item.model_dump() for item in input.pickup_items],
        total_value=0
    )
    doc = prepare_doc_for_db(pickup.model_dump())
    await db.pickups.insert_one(doc)
    return pickup

@api_router.post("/pickups/customer-return", response_model=Pickup)
async def create_customer_return(input: CustomerReturnCreate):
    pickup = Pickup(
        pickup_type=PickupType.CUSTOMER_RETURN,
        customer_name=input.customer_name,
        customer_address=input.customer_address,
        customer_phone=input.customer_phone,
        notes=f"Original AWB: {input.original_awb}, Reason: {input.return_reason}" if input.original_awb else input.return_reason
    )
    doc = prepare_doc_for_db(pickup.model_dump())
    await db.pickups.insert_one(doc)
    return pickup

@api_router.post("/pickups/personal-shopping", response_model=Pickup)
async def create_personal_shopping(input: PersonalShoppingCreate):
    total_value = sum(item.value for item in input.shopping_items)
    pickup = Pickup(
        pickup_type=PickupType.PERSONAL_SHOPPING,
        customer_name=input.customer_name,
        customer_address=input.customer_address,
        customer_phone=input.customer_phone,
        shopping_items=[item.model_dump() for item in input.shopping_items],
        total_value=total_value
    )
    doc = prepare_doc_for_db(pickup.model_dump())
    await db.pickups.insert_one(doc)
    return pickup

@api_router.get("/pickups", response_model=List[Pickup])
async def get_pickups(
    pickup_type: Optional[PickupType] = None,
    status: Optional[PickupStatus] = None
):
    query = {}
    if pickup_type:
        query["pickup_type"] = pickup_type.value
    if status:
        query["status"] = status.value
    pickups = await db.pickups.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return pickups

@api_router.get("/pickups/{pickup_id}", response_model=Pickup)
async def get_pickup(pickup_id: str):
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    return pickup

@api_router.put("/pickups/{pickup_id}", response_model=Pickup)
async def update_pickup(pickup_id: str, input: PickupUpdate):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # If assigning champ, get champ name
    if input.champ_id:
        champ = await db.champs.find_one({"id": input.champ_id}, {"_id": 0})
        if champ:
            update_data["champ_name"] = champ["name"]
    
    result = await db.pickups.update_one(
        {"id": pickup_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

@api_router.post("/pickups/{pickup_id}/assign/{champ_id}", response_model=Pickup)
async def assign_pickup_to_champ(pickup_id: str, champ_id: str):
    champ = await db.champs.find_one({"id": champ_id}, {"_id": 0})
    if not champ:
        raise HTTPException(status_code=404, detail="Champ not found")
    
    result = await db.pickups.update_one(
        {"id": pickup_id},
        {"$set": {
            "champ_id": champ_id,
            "champ_name": champ["name"],
            "status": PickupStatus.ASSIGNED.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

@api_router.post("/pickups/{pickup_id}/complete", response_model=Pickup)
async def complete_pickup(pickup_id: str, collected_value: float = 0, partial_items: List[str] = None):
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    update_data = {
        "status": PickupStatus.COMPLETED.value,
        "collected_value": collected_value,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # For personal shopping, check if partial delivery
    if pickup.get("pickup_type") == PickupType.PERSONAL_SHOPPING.value:
        if collected_value < pickup.get("total_value", 0):
            update_data["status"] = PickupStatus.PARTIAL.value
    
    await db.pickups.update_one({"id": pickup_id}, {"$set": update_data})
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

@api_router.put("/pickups/{pickup_id}/shopping-items", response_model=Pickup)
async def update_shopping_items(pickup_id: str, shopping_items: List[PersonalShoppingItem]):
    """Update shopping items delivery status for partial delivery"""
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    items_data = [item.model_dump() for item in shopping_items]
    delivered_value = sum(item.value for item in shopping_items if item.is_delivered)
    total_value = sum(item.value for item in shopping_items)
    
    status = PickupStatus.PARTIAL.value if delivered_value < total_value and delivered_value > 0 else (
        PickupStatus.COMPLETED.value if delivered_value == total_value else PickupStatus.ASSIGNED.value
    )
    
    await db.pickups.update_one(
        {"id": pickup_id},
        {"$set": {
            "shopping_items": items_data,
            "collected_value": delivered_value,
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

@api_router.post("/pickups/{pickup_id}/complete-with-proof", response_model=Pickup)
async def complete_pickup_with_proof(pickup_id: str, proof: PickupCompletionProof):
    """Complete a pickup with proof (image, location, notes)"""
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    update_data = {
        "status": PickupStatus.COMPLETED.value,
        "collected_value": proof.collected_value,
        "proof_image": proof.proof_image_base64,
        "proof_latitude": proof.latitude,
        "proof_longitude": proof.longitude,
        "completion_notes": proof.notes,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # For personal shopping with partial delivery
    if pickup.get("pickup_type") == PickupType.PERSONAL_SHOPPING.value:
        shopping_items = pickup.get("shopping_items", [])
        if proof.delivered_item_indices is not None:
            for i, item in enumerate(shopping_items):
                item["is_delivered"] = i in proof.delivered_item_indices
            update_data["shopping_items"] = shopping_items
            
            delivered_value = sum(item["value"] for item in shopping_items if item.get("is_delivered"))
            total_value = sum(item["value"] for item in shopping_items)
            
            if delivered_value < total_value and delivered_value > 0:
                update_data["status"] = PickupStatus.PARTIAL.value
            
            update_data["collected_value"] = delivered_value
        
        # Create history entry
        delivered_items = [item["item_name"] for item in shopping_items if item.get("is_delivered")]
        history_entry = ShoppingHistoryEntry(
            pickup_id=pickup_id,
            action="partial_delivery" if update_data["status"] == PickupStatus.PARTIAL.value else "full_delivery",
            items_delivered=delivered_items,
            value_collected=update_data["collected_value"],
            champ_id=pickup.get("champ_id"),
            champ_name=pickup.get("champ_name"),
            proof_image=proof.proof_image_base64,
            latitude=proof.latitude,
            longitude=proof.longitude,
            notes=proof.notes
        )
        history_doc = prepare_doc_for_db(history_entry.model_dump())
        await db.shopping_history.insert_one(history_doc)
    
    await db.pickups.update_one({"id": pickup_id}, {"$set": update_data})
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

@api_router.get("/pickups/{pickup_id}/history", response_model=List[ShoppingHistoryEntry])
async def get_pickup_history(pickup_id: str):
    """Get delivery history for a personal shopping pickup"""
    history = await db.shopping_history.find(
        {"pickup_id": pickup_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return history

@api_router.post("/pickups/{pickup_id}/add-delivery", response_model=Pickup)
async def add_partial_delivery(pickup_id: str, proof: PickupCompletionProof):
    """Add another partial delivery to a personal shopping pickup"""
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup not found")
    
    if pickup.get("pickup_type") != PickupType.PERSONAL_SHOPPING.value:
        raise HTTPException(status_code=400, detail="This endpoint is only for personal shopping pickups")
    
    shopping_items = pickup.get("shopping_items", [])
    
    # Mark newly delivered items
    if proof.delivered_item_indices:
        for i in proof.delivered_item_indices:
            if i < len(shopping_items):
                shopping_items[i]["is_delivered"] = True
    
    delivered_value = sum(item["value"] for item in shopping_items if item.get("is_delivered"))
    total_value = sum(item["value"] for item in shopping_items)
    
    status = PickupStatus.PARTIAL.value if delivered_value < total_value else PickupStatus.COMPLETED.value
    
    # Create history entry
    delivered_items = [shopping_items[i]["item_name"] for i in (proof.delivered_item_indices or []) if i < len(shopping_items)]
    history_entry = ShoppingHistoryEntry(
        pickup_id=pickup_id,
        action="partial_delivery",
        items_delivered=delivered_items,
        value_collected=sum(shopping_items[i]["value"] for i in (proof.delivered_item_indices or []) if i < len(shopping_items)),
        champ_id=pickup.get("champ_id"),
        champ_name=pickup.get("champ_name"),
        proof_image=proof.proof_image_base64,
        latitude=proof.latitude,
        longitude=proof.longitude,
        notes=proof.notes
    )
    history_doc = prepare_doc_for_db(history_entry.model_dump())
    await db.shopping_history.insert_one(history_doc)
    
    # Update pickup
    await db.pickups.update_one(
        {"id": pickup_id},
        {"$set": {
            "shopping_items": shopping_items,
            "collected_value": delivered_value,
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    pickup = await db.pickups.find_one({"id": pickup_id}, {"_id": 0})
    return pickup

# ==================== DASHBOARD STATS ====================
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    # Count shipments by status
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await db.shipments.aggregate(pipeline).to_list(100)
    status_dict = {s["_id"]: s["count"] for s in status_counts}
    
    # Today's deliveries
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_delivered = await db.shipments.count_documents({
        "status": ShipmentStatus.DELIVERED.value,
        "updated_at": {"$gte": today_start.isoformat()}
    })
    
    # Active run sheets
    active_run_sheets = await db.run_sheets.count_documents({
        "is_scanned_out": True,
        "is_scanned_in": False
    })
    
    # Total champs
    total_champs = await db.champs.count_documents({"is_active": True})
    
    # Payment collection stats
    cash_pipeline = [
        {"$match": {"payment_method_used": PaymentMethod.CASH.value}},
        {"$group": {"_id": None, "total": {"$sum": "$payment_collected"}}}
    ]
    cash_result = await db.delivery_attempts.aggregate(cash_pipeline).to_list(1)
    cash_collected = cash_result[0]["total"] if cash_result else 0
    
    card_pipeline = [
        {"$match": {"payment_method_used": PaymentMethod.CARD.value}},
        {"$group": {"_id": None, "total": {"$sum": "$payment_collected"}}}
    ]
    card_result = await db.delivery_attempts.aggregate(card_pipeline).to_list(1)
    card_collected = card_result[0]["total"] if card_result else 0
    
    # Pickup stats
    pickup_pipeline = [
        {"$group": {"_id": "$pickup_type", "count": {"$sum": 1}}}
    ]
    pickup_counts = await db.pickups.aggregate(pickup_pipeline).to_list(100)
    pickups_by_type = {p["_id"]: p["count"] for p in pickup_counts}
    
    pickup_status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    pickup_status_counts = await db.pickups.aggregate(pickup_status_pipeline).to_list(100)
    pickups_by_status = {p["_id"]: p["count"] for p in pickup_status_counts}
    
    total_pickups = sum(pickups_by_type.values()) if pickups_by_type else 0
    pending_pickups = pickups_by_status.get("pending", 0) + pickups_by_status.get("assigned", 0)
    completed_pickups = pickups_by_status.get("completed", 0) + pickups_by_status.get("partial", 0)
    
    return {
        "shipments_by_status": status_dict,
        "today_delivered": today_delivered,
        "active_run_sheets": active_run_sheets,
        "total_active_champs": total_champs,
        "cash_collected": cash_collected,
        "card_collected": card_collected,
        "total_shipments": sum(status_dict.values()) if status_dict else 0,
        "total_pickups": total_pickups,
        "pending_pickups": pending_pickups,
        "completed_pickups": completed_pickups,
        "pickups_by_type": pickups_by_type,
        "pickups_by_status": pickups_by_status
    }

# Get available routes
@api_router.get("/routes")
async def get_routes():
    routes = await db.shipments.distinct("route")
    return routes

# ==================== EXISTING ROUTES ====================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Last Mile Delivery System API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
