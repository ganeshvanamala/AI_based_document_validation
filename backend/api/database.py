import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "identityguard")

class DatabaseLayer:
    def __init__(self):
        self.is_mock_mode = not bool(MONGODB_URI)
        self.client = None
        self.db = None
        
        if not self.is_mock_mode:
            try:
                from motor.motor_asyncio import AsyncIOMotorClient
                self.client = AsyncIOMotorClient(MONGODB_URI)
                self.db = self.client[DATABASE_NAME]
                print(f"Connected to MongoDB Atlas: {DATABASE_NAME}")
            except Exception as e:
                print(f"Failed to connect to MongoDB, falling back to MOCK MODE: {e}")
                self.is_mock_mode = True
        
        if self.is_mock_mode:
            print("Database Layer running in MOCK MODE.")
            # In-memory mock storage
            self.mock_db = {
                "identities": {},
                "documents": {},
                "screenings": {},
                "relationships": {},
                "verification_history": {},
                "audit_records": {}
            }

    async def get_screening(self, screening_id: str):
        if self.is_mock_mode:
            return self.mock_db["screenings"].get(screening_id)
        
        # Real MongoDB call
        doc = await self.db.screenings.find_one({"_id": screening_id})
        if doc:
            # Re-map the _id to match our logic
            doc["id"] = doc.pop("_id")
        return doc

    async def create_screening(self, screening_id: str, data: dict):
        if self.is_mock_mode:
            self.mock_db["screenings"][screening_id] = data
            return data
        
        # Real MongoDB call (upsert)
        db_doc = data.copy()
        db_doc["_id"] = screening_id
        await self.db.screenings.replace_one({"_id": screening_id}, db_doc, upsert=True)
        return data

# Singleton instance
db_layer = DatabaseLayer()
