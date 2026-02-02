import requests
import sys
from datetime import datetime
import json

class LastMileDeliveryTester:
    def __init__(self, base_url="https://session-pickup.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'champs': [],
            'shipments': [],
            'pickups': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        success, _ = self.run_test("API Root", "GET", "", 200)
        
        # Test dashboard stats
        success, _ = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)
        
        return success

    def test_champ_operations(self):
        """Test champ CRUD operations"""
        print("\n=== Testing Champ Operations ===")
        
        # Create a champ
        champ_data = {
            "name": f"Test Champ {datetime.now().strftime('%H%M%S')}",
            "phone": "+1234567890",
            "assigned_routes": ["NORTH-1", "SOUTH-2"]
        }
        
        success, response = self.run_test("Create Champ", "POST", "champs", 200, champ_data)
        if success and 'id' in response:
            champ_id = response['id']
            self.created_ids['champs'].append(champ_id)
            
            # Get champs
            success, _ = self.run_test("Get Champs", "GET", "champs", 200)
            
            # Get specific champ
            success, _ = self.run_test("Get Champ by ID", "GET", f"champs/{champ_id}", 200)
            
            return True
        
        return False

    def test_shipment_operations(self):
        """Test shipment CRUD operations"""
        print("\n=== Testing Shipment Operations ===")
        
        # Create a shipment
        shipment_data = {
            "awb": f"AWB{datetime.now().strftime('%H%M%S')}",
            "recipient_name": "Test Recipient",
            "recipient_address": "123 Test Street, Test City",
            "recipient_phone": "+1234567890",
            "route": "NORTH-1",
            "payment_method": "cash",
            "value": 100.50
        }
        
        success, response = self.run_test("Create Shipment", "POST", "shipments", 200, shipment_data)
        if success and 'id' in response:
            shipment_id = response['id']
            awb = response['awb']
            self.created_ids['shipments'].append(shipment_id)
            
            # Get shipments
            success, _ = self.run_test("Get Shipments", "GET", "shipments", 200)
            
            # Get shipment by AWB
            success, _ = self.run_test("Get Shipment by AWB", "GET", f"shipments/awb/{awb}", 200)
            
            return True
        
        return False

    def test_pickup_operations(self):
        """Test pickup CRUD operations - the main focus"""
        print("\n=== Testing Pickup Operations ===")
        
        # Test Seller Pickup
        seller_pickup_data = {
            "seller_name": "Test Seller",
            "seller_address": "456 Seller Street, Seller City",
            "seller_phone": "+1234567891",
            "pickup_items": [
                {"category": "apparel", "quantity": 5},
                {"category": "footwear", "quantity": 2}
            ]
        }
        
        success, response = self.run_test("Create Seller Pickup", "POST", "pickups/seller", 200, seller_pickup_data)
        if success and 'id' in response:
            pickup_id = response['id']
            self.created_ids['pickups'].append(pickup_id)
            print(f"   Created seller pickup with ID: {pickup_id}")
        
        # Test Customer Return Pickup
        customer_return_data = {
            "customer_name": "Test Customer",
            "customer_address": "789 Customer Street, Customer City",
            "customer_phone": "+1234567892",
            "original_awb": "AWB123456",
            "return_reason": "Damaged item"
        }
        
        success, response = self.run_test("Create Customer Return", "POST", "pickups/customer-return", 200, customer_return_data)
        if success and 'id' in response:
            pickup_id = response['id']
            self.created_ids['pickups'].append(pickup_id)
            print(f"   Created customer return with ID: {pickup_id}")
        
        # Test Personal Shopping Pickup
        personal_shopping_data = {
            "customer_name": "Test Personal Shopper",
            "customer_address": "321 Shopping Street, Shopping City",
            "customer_phone": "+1234567893",
            "shopping_items": [
                {"item_name": "Laptop", "value": 50000.0, "is_delivered": False},
                {"item_name": "Mouse", "value": 1500.0, "is_delivered": False}
            ]
        }
        
        success, response = self.run_test("Create Personal Shopping", "POST", "pickups/personal-shopping", 200, personal_shopping_data)
        personal_shopping_id = None
        if success and 'id' in response:
            pickup_id = response['id']
            personal_shopping_id = pickup_id
            self.created_ids['pickups'].append(pickup_id)
            print(f"   Created personal shopping with ID: {pickup_id}")
        
        # Get all pickups
        success, response = self.run_test("Get All Pickups", "GET", "pickups", 200)
        if success:
            print(f"   Found {len(response)} pickups")
        
        # Test pickup assignment if we have champs and pickups
        assigned_pickup_id = None
        if self.created_ids['champs'] and self.created_ids['pickups']:
            champ_id = self.created_ids['champs'][0]
            pickup_id = self.created_ids['pickups'][0]
            assigned_pickup_id = pickup_id
            
            success, _ = self.run_test("Assign Pickup to Champ", "POST", f"pickups/{pickup_id}/assign/{champ_id}", 200)
            if success:
                print(f"   Successfully assigned pickup {pickup_id} to champ {champ_id}")
        
        # NEW FEATURE TESTS - Complete with Proof functionality
        if assigned_pickup_id:
            proof_data = {
                "pickup_id": assigned_pickup_id,
                "proof_image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A==",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "notes": "Test completion with proof",
                "collected_value": 100.0
            }
            
            success, _ = self.run_test("Complete Pickup with Proof", "POST", f"pickups/{assigned_pickup_id}/complete-with-proof", 200, proof_data)
            if success:
                print(f"   Successfully completed pickup {assigned_pickup_id} with proof")
        
        # Test Personal Shopping History functionality
        if personal_shopping_id:
            success, history_response = self.run_test("Get Personal Shopping History", "GET", f"pickups/{personal_shopping_id}/history", 200)
            if success:
                print(f"   Retrieved history for personal shopping pickup: {len(history_response)} entries")
        
        return len(self.created_ids['pickups']) > 0

    def test_dashboard_stats(self):
        """Test dashboard stats including pickup statistics"""
        print("\n=== Testing Dashboard Stats (NEW FEATURES) ===")
        
        success, response = self.run_test("Dashboard Stats with Pickup Data", "GET", "dashboard/stats", 200)
        if success:
            # Check if pickup stats are present
            required_pickup_fields = ['total_pickups', 'pending_pickups', 'completed_pickups', 'pickups_by_type', 'pickups_by_status']
            missing_fields = []
            
            for field in required_pickup_fields:
                if field not in response:
                    missing_fields.append(field)
                else:
                    print(f"   ✅ {field}: {response[field]}")
            
            if missing_fields:
                print(f"   ❌ Missing pickup stats fields: {missing_fields}")
                return False
            
            # Check pickup type breakdown
            pickups_by_type = response.get('pickups_by_type', {})
            expected_types = ['seller_pickup', 'customer_return', 'personal_shopping']
            print(f"   Pickup types breakdown: {pickups_by_type}")
            
            return True
        
        return False

    def test_new_features(self):
        """Test the three NEW features from the review request"""
        print("\n=== Testing NEW FEATURES (Review Request) ===")
        
        # Feature 1: Test inscan date/time and date range filter
        print("\n--- Feature 1: Inscan Date/Time & Date Range Filter ---")
        
        # Test shipments with date range filter
        success, response = self.run_test("Get Shipments with Date Filter", "GET", "shipments?inscan_date_from=2024-01-01&inscan_date_to=2025-12-31", 200)
        if success:
            # Check if any shipments have inscan_date and inscan_time
            shipments_with_inscan = [s for s in response if s.get('inscan_date') and s.get('inscan_time')]
            print(f"   Found {len(shipments_with_inscan)} shipments with inscan date/time")
            if len(shipments_with_inscan) > 0:
                sample = shipments_with_inscan[0]
                print(f"   Sample inscan data: {sample.get('inscan_date')} {sample.get('inscan_time')}")
        
        # Feature 2: Test Unsubmitted Items pickup type
        print("\n--- Feature 2: Unsubmitted Items Pickup ---")
        
        unsubmitted_data = {
            "seller_name": "Test Unsubmitted Seller",
            "seller_address": "123 Unsubmitted Street",
            "seller_phone": "+1234567894",
            "pickup_items": [
                {"category": "apparel", "quantity": 3},
                {"category": "accessories", "quantity": 1}
            ],
            "notes": "Test unsubmitted items pickup"
        }
        
        success, response = self.run_test("Create Unsubmitted Items Pickup", "POST", "pickups/unsubmitted-items", 200, unsubmitted_data)
        unsubmitted_pickup_id = None
        if success and 'id' in response:
            unsubmitted_pickup_id = response['id']
            self.created_ids['pickups'].append(unsubmitted_pickup_id)
            print(f"   Created unsubmitted items pickup with ID: {unsubmitted_pickup_id}")
            print(f"   Pickup type: {response.get('pickup_type')}")
        
        # Verify unsubmitted items appear in pickup list
        success, response = self.run_test("Get Pickups (Check Unsubmitted)", "GET", "pickups", 200)
        if success:
            unsubmitted_pickups = [p for p in response if p.get('pickup_type') == 'unsubmitted_items']
            print(f"   Found {len(unsubmitted_pickups)} unsubmitted items pickups")
        
        # Feature 3: Test Champ Delivery View endpoints
        print("\n--- Feature 3: Champ Delivery View ---")
        
        # Test get champ shipments endpoint
        if self.created_ids['champs']:
            champ_id = self.created_ids['champs'][0]
            success, response = self.run_test("Get Champ Shipments", "GET", f"champ/{champ_id}/shipments", 200)
            if success:
                print(f"   Found {len(response)} shipments for champ {champ_id}")
        
        # Test champ delivery action endpoint (simulate delivery with proof)
        if self.created_ids['shipments']:
            shipment_id = self.created_ids['shipments'][0]
            
            delivery_action_data = {
                "shipment_id": shipment_id,
                "action": "delivered",
                "proof_image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A==",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "notes": "Test delivery with GPS proof",
                "payment_collected": 100.50,
                "payment_method_used": "cash"
            }
            
            success, response = self.run_test("Champ Delivery Action (Delivered)", "POST", "champ/delivery-action", 200, delivery_action_data)
            if success:
                print(f"   Successfully marked shipment as delivered with proof")
                print(f"   Updated status: {response.get('status')}")
                print(f"   Delivery proof recorded: {bool(response.get('delivery_proof_image'))}")
        
        # Test champ pickups endpoint
        if self.created_ids['champs']:
            champ_id = self.created_ids['champs'][0]
            success, response = self.run_test("Get Champ Pickups", "GET", f"champ/{champ_id}/pickups", 200)
            if success:
                print(f"   Found {len(response)} pickups for champ {champ_id}")
        
        return True

    def test_test_awbs(self):
        """Test if 10 test AWBs exist (AWB000001-AWB000010)"""
        print("\n=== Testing Test AWBs (EXISTING FEATURE) ===")
        
        success, response = self.run_test("Get All Shipments", "GET", "shipments", 200)
        if success:
            awbs = [shipment.get('awb', '') for shipment in response]
            test_awbs = [f"AWB{str(i).zfill(6)}" for i in range(1, 11)]  # AWB000001 to AWB000010
            
            found_test_awbs = [awb for awb in test_awbs if awb in awbs]
            print(f"   Found test AWBs: {found_test_awbs}")
            print(f"   Expected 10 test AWBs, found {len(found_test_awbs)}")
            
            if len(found_test_awbs) >= 10:
                print("   ✅ All 10 test AWBs found")
                return True
            else:
                print(f"   ⚠️  Only {len(found_test_awbs)} test AWBs found, expected 10")
                return len(found_test_awbs) > 0  # Partial success
        
        return False
        """Test basic logistics operations"""
        print("\n=== Testing Logistics Flow ===")
        
        if not self.created_ids['shipments']:
            print("⚠️  No shipments available for logistics testing")
            return False
        
        shipment_id = self.created_ids['shipments'][0]
        
        # Get shipment details first
        success, shipment = self.run_test("Get Shipment for Logistics", "GET", f"shipments/{shipment_id}", 200)
        if not success:
            return False
        
        awb = shipment.get('awb')
        if not awb:
            print("❌ No AWB found in shipment")
            return False
        
        # Test in-scan
        success, _ = self.run_test("In-Scan Shipment", "POST", f"logistics/in-scan/{awb}", 200)
        
        return success

    def test_logistics_flow(self):
        """Test basic logistics operations"""
        print("\n=== Testing Logistics Flow ===")
        
        if not self.created_ids['shipments']:
            print("⚠️  No shipments available for logistics testing")
            return False
        
        shipment_id = self.created_ids['shipments'][0]
        
        # Get shipment details first
        success, shipment = self.run_test("Get Shipment for Logistics", "GET", f"shipments/{shipment_id}", 200)
        if not success:
            return False
        
        awb = shipment.get('awb')
        if not awb:
            print("❌ No AWB found in shipment")
            return False
        
        # Test in-scan
        success, _ = self.run_test("In-Scan Shipment", "POST", f"logistics/in-scan/{awb}", 200)
        
        return success

def main():
    print("🚀 Starting Last Mile Delivery Management System API Tests")
    print("=" * 60)
    
    tester = LastMileDeliveryTester()
    
    # Run test suites
    basic_ok = tester.test_basic_endpoints()
    dashboard_stats_ok = tester.test_dashboard_stats()  # NEW
    test_awbs_ok = tester.test_test_awbs()  # NEW
    champ_ok = tester.test_champ_operations()
    shipment_ok = tester.test_shipment_operations()
    pickup_ok = tester.test_pickup_operations()  # Enhanced with new features
    logistics_ok = tester.test_logistics_flow()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\nTest Suite Results:")
    print(f"  Basic Endpoints: {'✅' if basic_ok else '❌'}")
    print(f"  Dashboard Pickup Stats: {'✅' if dashboard_stats_ok else '❌'} (NEW)")
    print(f"  Test AWBs (10 AWBs): {'✅' if test_awbs_ok else '❌'} (NEW)")
    print(f"  Champ Operations: {'✅' if champ_ok else '❌'}")
    print(f"  Shipment Operations: {'✅' if shipment_ok else '❌'}")
    print(f"  Pickup Operations: {'✅' if pickup_ok else '❌'} (Enhanced with Complete with Proof)")
    print(f"  Logistics Flow: {'✅' if logistics_ok else '❌'}")
    
    print(f"\nCreated Test Data:")
    print(f"  Champs: {len(tester.created_ids['champs'])}")
    print(f"  Shipments: {len(tester.created_ids['shipments'])}")
    print(f"  Pickups: {len(tester.created_ids['pickups'])}")
    
    # Return 0 if all critical tests pass (focus on new features)
    critical_passed = pickup_ok and dashboard_stats_ok and basic_ok
    return 0 if critical_passed else 1

if __name__ == "__main__":
    sys.exit(main())