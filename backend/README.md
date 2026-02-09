# Last Mile Delivery System API

A comprehensive FastAPI-based backend system for managing last-mile delivery operations, including shipment tracking, delivery personnel management, pickup services, and run sheet generation.

## Features

### Core Functionality
- **Shipment Management**: Track shipments from warehouse handover to final delivery
- **Delivery Personnel (Champs)**: Manage delivery agents and their assignments
- **Run Sheet Generation**: Create and manage delivery run sheets with automatic calculations
- **Bin Location Management**: Organize shipments by route-based bin locations
- **Pickup Services**: Handle multiple pickup types (seller pickups, customer returns, personal shopping)
- **Delivery Proof**: Capture delivery confirmation with images and GPS coordinates
- **Payment Tracking**: Monitor cash and card collections with detailed reporting
- **Dashboard Analytics**: Real-time statistics and operational insights

### Shipment Status Flow
1. `PENDING_HANDOVER` - Initial state
2. `IN_SCANNED` - Scanned into logistics system
3. `ASSIGNED_TO_BIN` - Sorted by route into bin locations
4. `ASSIGNED_TO_CHAMP` - Assigned to delivery personnel
5. `OUT_FOR_DELIVERY` - On route with champ
6. `DELIVERED` / `CANCELLED` / `NO_RESPONSE` / `RESCHEDULED` - Final outcomes
7. `RETURNED_TO_WH` - Returned to warehouse for retry

## Technology Stack

- **Framework**: FastAPI
- **Database**: MongoDB (Motor async driver)
- **Validation**: Pydantic v2
- **Environment**: Python 3.8+
- **CORS**: Starlette middleware

## Installation

### Prerequisites
- Python 3.8 or higher
- MongoDB instance (local or cloud)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd last-mile-delivery
```

2. Install dependencies:
```bash
pip install fastapi motor python-dotenv pydantic starlette uvicorn
```

3. Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=last_mile_delivery
CORS_ORIGINS=*
```

4. Run the application:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Bin Locations
- `POST /api/bin-locations` - Create bin location
- `GET /api/bin-locations` - List all bin locations (filter by route)
- `GET /api/bin-locations/{bin_id}` - Get specific bin location

### Champs (Delivery Personnel)
- `POST /api/champs` - Create champ
- `GET /api/champs` - List all champs (filter by active status)
- `GET /api/champs/{champ_id}` - Get specific champ
- `PUT /api/champs/{champ_id}` - Update champ details

### Shipments
- `POST /api/shipments` - Create single shipment
- `POST /api/shipments/bulk` - Create multiple shipments
- `GET /api/shipments` - List shipments (multiple filters available)
- `GET /api/shipments/{shipment_id}` - Get shipment by ID
- `GET /api/shipments/awb/{awb}` - Get shipment by AWB
- `PUT /api/shipments/{shipment_id}` - Update shipment

### Logistics Operations
- `POST /api/logistics/in-scan/{awb}` - Scan shipment into system
- `POST /api/logistics/assign-bin` - Assign shipments to bin location
- `POST /api/logistics/assign-champ` - Assign shipments to champ
- `POST /api/logistics/return-to-warehouse` - Return undelivered shipments
- `GET /api/logistics/undelivered` - Get all undelivered shipments

### Run Sheets
- `POST /api/run-sheets` - Create run sheet for champ
- `GET /api/run-sheets` - List run sheets (filter by champ/status)
- `GET /api/run-sheets/{run_sheet_id}` - Get specific run sheet
- `POST /api/run-sheets/{run_sheet_id}/scan-out` - Scan out at security
- `POST /api/run-sheets/{run_sheet_id}/scan-in` - Scan in on return

### Delivery Attempts
- `POST /api/delivery-attempts` - Record delivery attempt
- `GET /api/delivery-attempts` - List delivery attempts (filter by shipment/champ)

### Pickups
- `POST /api/pickups/seller` - Create seller pickup
- `POST /api/pickups/customer-return` - Create customer return
- `POST /api/pickups/personal-shopping` - Create personal shopping order
- `POST /api/pickups/unsubmitted-items` - Create unsubmitted items pickup
- `GET /api/pickups` - List pickups (filter by type/status)
- `GET /api/pickups/{pickup_id}` - Get specific pickup
- `PUT /api/pickups/{pickup_id}` - Update pickup
- `POST /api/pickups/{pickup_id}/assign/{champ_id}` - Assign pickup to champ
- `POST /api/pickups/{pickup_id}/complete` - Mark pickup complete
- `POST /api/pickups/{pickup_id}/complete-with-proof` - Complete with proof
- `GET /api/pickups/{pickup_id}/history` - Get pickup delivery history
- `POST /api/pickups/{pickup_id}/add-delivery` - Add partial delivery

### Champ Mobile Interface
- `GET /api/champ/{champ_id}/shipments` - Get champ's assigned shipments
- `GET /api/champ/{champ_id}/pickups` - Get champ's assigned pickups
- `POST /api/champ/delivery-action` - Record delivery action with proof

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get system-wide statistics
- `GET /api/routes` - Get all available routes

## Data Models

### Shipment
```json
{
  "awb": "AWB123456",
  "recipient_name": "John Doe",
  "recipient_address": "123 Main St",
  "recipient_phone": "+1234567890",
  "route": "Route-A",
  "payment_method": "cash",
  "value": 1500.00,
  "status": "pending_handover"
}
```

### Champ
```json
{
  "name": "Delivery Agent",
  "phone": "+1234567890",
  "assigned_routes": ["Route-A", "Route-B"],
  "is_active": true
}
```

### Bin Location
```json
{
  "name": "Bin A1",
  "route": "Route-A",
  "capacity": 100,
  "current_count": 0
}
```

### Pickup (Seller)
```json
{
  "seller_name": "Fashion Store",
  "seller_address": "456 Market St",
  "seller_phone": "+1234567890",
  "pickup_items": [
    {
      "category": "apparel",
      "quantity": 10
    }
  ]
}
```

### Personal Shopping
```json
{
  "customer_name": "Jane Smith",
  "customer_address": "789 Oak Ave",
  "customer_phone": "+1234567890",
  "shopping_items": [
    {
      "item_name": "Designer Handbag",
      "value": 5000.00,
      "is_delivered": false
    }
  ]
}
```

## Enums

### ShipmentStatus
- `PENDING_HANDOVER`
- `IN_SCANNED`
- `ASSIGNED_TO_BIN`
- `ASSIGNED_TO_CHAMP`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`
- `NO_RESPONSE`
- `RESCHEDULED`
- `RETURNED_TO_WH`

### PaymentMethod
- `CASH`
- `CARD`
- `PREPAID`

### PickupType
- `SELLER_PICKUP`
- `CUSTOMER_RETURN`
- `PERSONAL_SHOPPING`
- `UNSUBMITTED_ITEMS`

### PickupStatus
- `PENDING`
- `ASSIGNED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `PARTIAL`

### PickupCategory
- `APPAREL`
- `FOOTWEAR`
- `ACCESSORIES`
- `HANDBAGS`

## Workflow Example

### Complete Delivery Flow

1. **Create Shipment**
```bash
POST /api/shipments
{
  "awb": "AWB001",
  "recipient_name": "Customer Name",
  "route": "Route-A",
  "payment_method": "cash",
  "value": 1000
}
```

2. **In-Scan Shipment**
```bash
POST /api/logistics/in-scan/AWB001
```

3. **Assign to Bin**
```bash
POST /api/logistics/assign-bin
{
  "shipment_ids": ["<shipment-id>"],
  "bin_location_id": "<bin-id>"
}
```

4. **Assign to Champ**
```bash
POST /api/logistics/assign-champ
{
  "shipment_ids": ["<shipment-id>"],
  "champ_id": "<champ-id>"
}
```

5. **Generate Run Sheet**
```bash
POST /api/run-sheets
{
  "champ_id": "<champ-id>",
  "shipment_ids": ["<shipment-id>"]
}
```

6. **Scan Out**
```bash
POST /api/run-sheets/{run_sheet_id}/scan-out
```

7. **Deliver Shipment**
```bash
POST /api/champ/delivery-action
{
  "shipment_id": "<shipment-id>",
  "action": "delivered",
  "proof_image_base64": "...",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "payment_collected": 1000,
  "payment_method_used": "cash"
}
```

8. **Scan In Run Sheet**
```bash
POST /api/run-sheets/{run_sheet_id}/scan-in
```

## Database Collections

- `bin_locations` - Storage bin locations
- `champs` - Delivery personnel
- `shipments` - Delivery shipments
- `run_sheets` - Delivery run sheets
- `delivery_attempts` - Delivery attempt records
- `pickups` - Pickup requests
- `shopping_history` - Personal shopping delivery history
- `status_checks` - System health checks

## Features in Detail

### Delivery Proof
Capture comprehensive delivery confirmation:
- Base64 encoded image
- GPS coordinates (latitude/longitude)
- Timestamp
- Delivery notes
- Payment collection details

### Personal Shopping
- Create shopping orders with multiple items
- Support for partial deliveries
- Track delivery history per order
- Calculate remaining value

### Payment Tracking
- Separate cash and card collections
- Automatic calculation of amounts to collect
- Link payments to delivery attempts
- Dashboard summaries

### Run Sheet Management
- Auto-calculate total values
- Track cash vs card collections
- Scan out/in tracking
- Associate multiple shipments

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors, duplicate AWB)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Development

### Running Tests
```bash
pytest
```

### Code Structure
```
.
├── main.py              # Main application file
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Security Considerations

1. **Environment Variables**: Store sensitive data in `.env`
2. **CORS**: Configure allowed origins properly
3. **Authentication**: Add authentication middleware for production
4. **Input Validation**: Pydantic models validate all inputs
5. **MongoDB Security**: Use authentication and secure connections

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time notifications (WebSocket)
- [ ] Route optimization algorithms
- [ ] Advanced analytics and reporting
- [ ] SMS/Email notifications
- [ ] Mobile app integration
- [ ] Barcode/QR code scanning
- [ ] Integration with payment gateways
- [ ] Multi-warehouse support
- [ ] Automated rescheduling logic

## License

[Add your license here]

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## Contributors

[Add contributors here]
