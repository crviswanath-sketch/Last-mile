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
- **Pickup Stats Row**: Total Pickups, Pending Pickups, Completed Pickups
- Pickup type breakdown (Seller, Return, Shopping)
- Shipment Status Breakdown
- Payment Collection (Cash/Card)

### 2. Shipments (/shipments)
- AWB listing with recipient, route, payment, value, status
- In-Scan functionality with barcode scanning
- Add Shipment modal
- Filter by status
- 10+ test AWBs available (AWB000001-AWB000010)

### 3. Pickups (/pickups) ✨ NEW
- **Seller Pickup**: Categories (Apparel, Footwear, Accessories, Handbags) with quantities
- **Customer Return**: Customer details, original AWB, return reason
- **Personal Shopping Order**: Item list with values, partial delivery support
- Champ assignment
- **Complete with Proof**: Photo capture, GPS location, notes
- **Delivery History**: Track all partial deliveries for Personal Shopping

### 4. Bins (/bin-locations)
- Bin location management

### 5. Champs (/champs)
- Champ (delivery agent) management
- Active/inactive status

### 6. Run Sheets (/run-sheets)
- Run sheet creation and management

### 7. Delivery (/delivery)
- Delivery tracking and outcomes

### 8. Returns (/returns)
- Return shipment management

## Recent Updates (Feb 2, 2026)
- Added 10 test AWBs for inscan testing
- Added Pickup counts to Dashboard stats
- Implemented Pickup completion with proof capture (photo + GPS)
- Added Personal Shopping partial delivery history tracking

## API Endpoints

### Pickup APIs
- `POST /api/pickups/seller` - Create seller pickup
- `POST /api/pickups/customer-return` - Create customer return
- `POST /api/pickups/personal-shopping` - Create personal shopping order
- `GET /api/pickups` - List pickups with filters
- `GET /api/pickups/{id}` - Get pickup details
- `PUT /api/pickups/{id}` - Update pickup
- `POST /api/pickups/{id}/assign/{champ_id}` - Assign champ
- `POST /api/pickups/{id}/complete-with-proof` - Complete with proof
- `GET /api/pickups/{id}/history` - Get delivery history
- `POST /api/pickups/{id}/add-delivery` - Add partial delivery

## Backlog / Future Features
- SMS/WhatsApp notifications for pickup assignment
- Route optimization for champs
- Analytics and reporting dashboard
- Customer tracking portal
- Mobile app (PWA)
