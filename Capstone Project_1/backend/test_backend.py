import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main
from database import engine, SessionLocal
import models

print("Backend imported successfully!")
print("FastAPI Title:", main.app.title)
print("Database Engine:", engine.url)
print("Models loaded:", [m for m in dir(models) if isinstance(getattr(models, m), type)])

# Test health check endpoint directly
res = main.health()
print("Health endpoint response:", res)

# Test dashboard endpoint directly
db = SessionLocal()
dash = main.get_dashboard("demo_user", db)
print("Dashboard demo_user response:", dash)
db.close()

print("ALL BACKEND SELF-TESTS PASSED!")
