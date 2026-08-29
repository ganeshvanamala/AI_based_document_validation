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
        
        # Always initialize in-memory fallback cache
        self.mock_db = {
            "identities": {},
            "documents": {},
            "screenings": {},
            "relationships": {},
            "verification_history": {},
            "audit_records": {}
        }
        
        if not self.is_mock_mode:
            try:
                from motor.motor_asyncio import AsyncIOMotorClient
                self.client = AsyncIOMotorClient(MONGODB_URI)
                self.db = self.client[DATABASE_NAME]
                print(f"Connected to MongoDB Atlas: {DATABASE_NAME}")
            except Exception as e:
                print(f"Failed to connect to MongoDB, falling back to MOCK MODE: {e}")
                self.is_mock_mode = True

    async def get_screening(self, screening_id: str):
        if self.is_mock_mode:
            return self.mock_db["screenings"].get(screening_id)
        
        try:
            doc = await self.db.screenings.find_one({"_id": screening_id})
            if doc:
                doc["id"] = doc.pop("_id")
            return doc
        except Exception as e:
            print(f"Error fetching screening {screening_id}: {e}")
            return self.mock_db["screenings"].get(screening_id)

    async def create_screening(self, screening_id: str, data: dict):
        # Keep in-memory cache updated as well
        self.mock_db["screenings"][screening_id] = data
        
        if not self.is_mock_mode:
            try:
                db_doc = data.copy()
                db_doc["_id"] = screening_id
                await self.db.screenings.replace_one({"_id": screening_id}, db_doc, upsert=True)
            except Exception as e:
                print(f"Error writing screening to MongoDB: {e}")
        return data

    async def update_screening(self, screening_id: str, updates: dict):
        if screening_id in self.mock_db["screenings"]:
            self.mock_db["screenings"][screening_id].update(updates)
            
        if not self.is_mock_mode:
            try:
                await self.db.screenings.update_one({"_id": screening_id}, {"$set": updates})
            except Exception as e:
                print(f"Error updating screening in MongoDB: {e}")
        return await self.get_screening(screening_id)

    async def get_all_screenings(self, limit: int = 100):
        if self.is_mock_mode:
            screenings_list = list(self.mock_db["screenings"].values())
            screenings_list.reverse()
            return screenings_list[:limit]
        
        try:
            cursor = self.db.screenings.find({}).sort("created_at", -1).limit(limit)
            results = []
            async for doc in cursor:
                doc["id"] = doc.pop("_id")
                results.append(doc)
            return results
        except Exception as e:
            print(f"Error fetching all screenings: {e}")
            screenings_list = list(self.mock_db["screenings"].values())
            screenings_list.reverse()
            return screenings_list[:limit]

    async def get_dashboard_stats(self):
        all_s = await self.get_all_screenings(limit=1000)
        total = len(all_s)
        low = sum(1 for s in all_s if s.get("risk_level") == "LOW" or s.get("riskLevel") == "Low")
        review = sum(1 for s in all_s if s.get("risk_level") == "MEDIUM" or s.get("riskLevel") == "Medium")
        high = sum(1 for s in all_s if s.get("risk_level") == "HIGH" or s.get("riskLevel") == "High")
        
        return {
            "total": total,
            "low": low,
            "review": review,
            "high": high
        }

    async def get_identity(self, name_or_id: str):
        if not self.is_mock_mode:
            try:
                doc = await self.db.identities.find_one({"$or": [{"_id": name_or_id}, {"name": name_or_id}]})
                if doc:
                    doc["id"] = str(doc.pop("_id"))
                    return doc
            except Exception as e:
                print(f"Error fetching identity: {e}")
        return self.mock_db["identities"].get(name_or_id)

    async def get_all_identities(self):
        if not self.is_mock_mode:
            try:
                cursor = self.db.identities.find({}).limit(100)
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc.pop("_id"))
                    results.append(doc)
                return results
            except Exception as e:
                print(f"Error fetching identities: {e}")
        return list(self.mock_db["identities"].values())

# Singleton instance
db_layer = DatabaseLayer()
