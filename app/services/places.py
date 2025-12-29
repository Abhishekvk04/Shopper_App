from sqlalchemy.orm import Session
from app.db.models import Business
import math

# Mock Data for "External" Places (simulating Google Places API)
MOCK_EXTERNAL_PLACES = [
    {
        "name": "City Bakery (External)",
        "category": "bakery",
        "latitude": 37.7749, # Example Coords
        "longitude": -122.4194, 
        "address": "123 Market St",
        "is_affiliated": False
    },
    {
        "name": "Dr. Smith Clinic (External)",
        "category": "clinic",
        "latitude": 37.7750,
        "longitude": -122.4180,
        "address": "456 Main St",
        "is_affiliated": False
    },
     {
        "name": "Super Salon (External)",
        "category": "salon",
        "latitude": 37.7750,
        "longitude": -122.4180,
        "address": "789 Broadway",
        "is_affiliated": False
    }
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371  # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    d = R * c
    return d

def search_nearby_places(db: Session, category: str, lat: float, lon: float, radius_km: float = 5.0):
    """
    Returns a list of businesses (both internal and external) matching the category 
    within the radius.
    """
    results = []
    category = category.lower().strip()

    # 1. Search Internal DB (Affiliated)
    # in real world, use PostGIS or specialized geo-query.
    # For MVP SQLite, fetch all in category and filter by py-distance
    internal_candidates = db.query(Business).filter(Business.category == category).all()
    
    for biz in internal_candidates:
        if biz.latitude and biz.longitude:
            dist = haversine_distance(lat, lon, biz.latitude, biz.longitude)
            if dist <= radius_km:
                # Ranking Logic
                score = 0
                badges = []
                
                # 1. Partner Boost
                score += 50
                badges.append("✅ Verified")
                badges.append("⚡ Fast Reply") # Hardcoded for MVP, real logic later

                # 2. Distance Score (Closer is better)
                if dist < 2.0:
                    score += 40
                elif dist < 5.0:
                    score += 20
                
                results.append({
                    "id": biz.id,
                    "name": biz.name + " ⭐ (Partner)",
                    "address": biz.address,
                    "distance": round(dist, 2),
                    "is_affiliated": True,
                    "ranking_score": score,
                    "badges": badges
                })
        else:
            # Fallback if no location set for business (just show it for demo?)
            # Or skip. Let's skip to be strict about location.
            pass

    # 2. Search External Mock Data
    for place in MOCK_EXTERNAL_PLACES:
        if place['category'] == category:
             # Basic score for external
             score = 10
             results.append({
                 "id": f"ext_{place['name']}",
                 "name": place['name'],
                 "address": place['address'],
                 "distance": 0.5, # Fake distance
                 "is_affiliated": False,
                 "ranking_score": score,
                 "badges": []
             })

    # Sort by Ranking Score (Descending)
    results.sort(key=lambda x: x['ranking_score'], reverse=True)

    return results[:5] # Return top 5
