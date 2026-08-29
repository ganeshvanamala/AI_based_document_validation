from typing import Dict, Any, List
from datetime import datetime

class IdentityManager:
    def __init__(self, db_layer):
        self.db_layer = db_layer

    async def verify_history(self, current_name: str, current_dob: str) -> Dict[str, Any]:
        """
        Cross-checks the extracted name and DOB against historical records in MongoDB.
        """
        if not current_name or current_name == "Unknown Person":
            return {"status": "NO_HISTORY", "message": "Cannot verify history without a valid name."}

        # If we are in mock mode without MongoDB, we can't do historical checks properly
        if self.db_layer.is_mock_mode:
            return {"status": "NO_HISTORY", "message": "Database not connected."}

        # Search for an existing identity by name (in a real app, this would use a unique ID like SSN or Aadhaar)
        collection = self.db_layer.db.identities
        existing_record = await collection.find_one({"name": current_name})

        if not existing_record:
            # First time seeing this person
            new_record = {
                "name": current_name,
                "dob": current_dob,
                "first_seen": datetime.now().isoformat(),
                "history": [f"Initial verification on {datetime.now().strftime('%Y-%m-%d')}"]
            }
            await collection.insert_one(new_record)
            return {
                "status": "FIRST_SEEN",
                "message": "First time screening for this identity.",
                "history": new_record["history"]
            }

        # Identity exists! Check for consistency
        historical_dob = existing_record.get("dob")
        
        # Log this new screening
        await collection.update_one(
            {"_id": existing_record["_id"]},
            {"$push": {"history": f"Screened again on {datetime.now().strftime('%Y-%m-%d')}"}}
        )

        history_log = existing_record.get("history", [])

        if historical_dob and current_dob and historical_dob != current_dob:
            return {
                "status": "MISMATCH",
                "severity": "HIGH",
                "reason": f"DOB mismatch: Document shows {current_dob} but historical record shows {historical_dob}.",
                "history": history_log
            }

        return {
            "status": "CONSISTENT",
            "message": "Historical data is consistent.",
            "history": history_log
        }
