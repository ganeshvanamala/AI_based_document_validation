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
        # return await self.db.screenings.find_one({"_id": screening_id})
        return None

    async def create_screening(self, screening_id: str, data: dict):
        if self.is_mock_mode:
            self.mock_db["screenings"][screening_id] = data
            return data
        # await self.db.screenings.insert_one({"_id": screening_id, **data})
        return data

# Singleton instance
db_layer = DatabaseLayer()
