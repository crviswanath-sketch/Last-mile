# Last Mile Delivery Management - PRD

## Project Overview
A comprehensive last-mile delivery management system for logistics operations.

## Tech Stack
- **Frontend**: React.js with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB

## Core Features Implemented

### 1. Dashboard (/)
- Total Shipments, Today Delivered, Active Run Sheets, Active Champs stats
- Pickup Stats Row: Total Pickups, Pending/Completed by type
- Shipment Status Breakdown
- Payment Collection (Cash/Card)

### 2. Shipments (/shipments)
- AWB listing with recipient, route, payment, value, status
- **NEW: Inscan Date/Time column** showing when shipments were scanned
- **NEW: Date range filter** for filtering by inscan date
- In-Scan functionality with barcode scanning
- Add Shipment modal
- Filter by status

### 3. Pickups (/pickups)
- **Seller Pickup**: Categories (Apparel, Footwear, Accessories, Handbags) with quantities
- **NEW: Unsubmitted Items**: Same structure as seller pickup
- **Customer Return**: Customer details, original AWB, return reason
- **Personal Shopping Order**: Item list with values, partial delivery support
- Complete with Proof: Photo capture, GPS location
- Delivery History tracking

### 4. Champ View (/champ-view) ✨ NEW
- Select champ from dropdown
- View assigned shipments and pickups
- **Mark shipments as**:
  - ✅ Delivered (with payment collection)
  - 📅 Rescheduled (with new date)
  - ❌ Cancelled (with reason)
- **Proof of Delivery**: Photo upload, GPS coordinates, notes

### 5. Other Pages
- Bins (/bin-locations): Bin location management
- Champs (/champs): Delivery agent management
- Run Sheets (/run-sheets): Run sheet creation
- Delivery (/delivery): Delivery tracking
- Returns (/returns): Return shipment management

## API Endpoints

### Champ Delivery APIs (NEW)
- `GET /api/champ/{champ_id}/shipments` - Get champ's assigned shipments
- `POST /api/champ/delivery-action` - Mark delivery as delivered/rescheduled/cancelled
- `GET /api/champ/{champ_id}/pickups` - Get champ's assigned pickups

### Pickup APIs
- `POST /api/pickups/unsubmitted-items` - Create unsubmitted items pickup (NEW)
- All existing pickup endpoints preserved

## Planned Features

### 1. Notifications (Priority: High)
**Plan:**
- SMS notifications via Twilio for:
  - Pickup assignment to champ
  - Delivery status updates to customer
  - Reschedule confirmations
- WhatsApp integration for richer notifications
- In-app notification center

**Implementation Steps:**
1. Add Twilio integration for SMS
2. Create notification service with templates
3. Trigger notifications on status changes
4. Add notification preferences per customer

### 2. Route Optimization (Priority: Medium)
**Plan:**
- Integrate Google Maps API for:
  - Optimal route calculation
  - Real-time traffic consideration
  - Multi-stop optimization
- Display route on map in Champ View
- Estimated delivery times

**Implementation Steps:**
1. Add Google Maps integration
2. Create route optimization algorithm
3. Display optimized routes on map
4. Add ETA calculations

### 3. Analytics Dashboard (Priority: Medium)
**Plan:**
- Delivery performance metrics
  - Success rate by champ/route
  - Average delivery time
  - Peak delivery hours
- Revenue reports
  - COD collection by day/week/month
  - Outstanding payments
- Pickup analytics
  - Items by category
  - Return rates

**Implementation Steps:**
1. Create analytics API endpoints with aggregations
2. Build charts using Recharts library
3. Add date range filtering
4. Export to CSV/PDF

## Recent Updates (Feb 2, 2026)
- Added inscan date/time to shipments with date range filter
- Added Unsubmitted Items pickup type
- Created Champ Delivery View for marking deliveries
- Full proof of delivery capture (image + GPS)

## Backlog
- [ ] SMS notifications for pickup assignments
- [ ] Route optimization with maps
- [ ] Analytics and reporting dashboard
- [ ] Customer tracking portal
- [ ] Mobile PWA optimization
