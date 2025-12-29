
import httpx
import time

# Configuration
API_URL = "http://localhost:8000/api/webhook/whatsapp"

BUSINESS_NUMBER = "15550001111" 
CUSTOMER_NUMBER = "15559998888"

def send_message(from_number, to_number, body, lat=None, lon=None):
    data = {
        "From": f"whatsapp:{from_number}",
        "To": f"whatsapp:{to_number}",
        "Body": body
    }
    if lat and lon:
        data['Latitude'] = lat
        data['Longitude'] = lon

    print(f"👉 Sending: '{body}' (Lat: {lat})")
    try:
        response = httpx.post(API_URL, data=data, timeout=30.0)
        if response.status_code == 200:
            print("   ✅ Request Successful")
        else:
            print(f"   ❌ Server Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ❌ Connection Error: {e}")

print("=================================================")
print("🚀 STARTING SHOPPER DISCOVERY SIMULATION")
print("=================================================")

# 1. Start Conversation
print("\n--- [PHASE 1] User Starts Conversation ---")
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "Hi")
print("👀 Expect: Welcome message + Ask for Category")
time.sleep(2)

# 2. Provide Category
print("\n--- [PHASE 2] User Asks for Bakery ---")
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "Bakery")
print("👀 Expect: Ask for Location")
time.sleep(2)

# 3. Share Location (Mock)
print("\n--- [PHASE 3] User Shares Location ---")
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "", lat=37.7749, lon=-122.4194)
print("👀 Expect: List of Nearby Bakeries (Inc. External)")
time.sleep(2)

# 4. Select Non-Affiliated (External)
print("\n--- [PHASE 4] User Selects External Shop (2) ---")
# Assuming City Bakery is 2 (External)
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "2")
print("👀 Expect: 'Not Affiliated' info + Reset")
time.sleep(2)

# 5. Search Again & Select Affiliated
print("\n--- [PHASE 5] User Search Again & Selects Affiliated ---")
# Reset session implicitly by category search
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "Clinic")
time.sleep(1)
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "", lat=37.7749, lon=-122.4194)
time.sleep(1)
# Assuming 1 is Demo Clinic (automatically created if db empty) - wait, db reset. 
# Logic.py creates 'Demo Clinic' if table empty only on INCOMING routing? No.
# Actually logic.py L25 creates Demo Clinic if none exists.
# But router() bypasses that if not chatting.
# Let's fix Logic.py to ensure we have a demo business for testing.
# Only creating business if it exists in DB. Our `places` service queries DB.
# Since we wiped DB, we have 0 businesses.
# So `search_nearby_places` will only return external mocks.
# Let's see what happens.
send_message(CUSTOMER_NUMBER, BUSINESS_NUMBER, "1") 
print("👀 Expect: Info if external, or Connect if we manage to create a Biz.")

