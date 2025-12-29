from app.db.session import SessionLocal, engine, Base
from app.db.models import Business

# Create Tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Check if exists
if not db.query(Business).first():
    print("🌱 Seeding Database with 'Shopper Partner Shop'...")
    b = Business(
        name="Shopper Partner Bakery",
        phone_number="15550001111", 
        escalation_phone="15550001111",
        category="bakery",
        latitude=37.7749,
        longitude=-122.4194, # Same as mock location
        address="100 Partner Plaza",
        auth_code="123456"
    )
    db.add(b)
    db.commit()
    print("✅ Seed Complete!")
else:
    print("Database already seeded.")
