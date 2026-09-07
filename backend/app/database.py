import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "identityshield")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Create indexes
    await db.users.create_index("username", unique=True)
    await db.screenings.create_index("created_at")
    await db.screenings.create_index("risk_level")
    await db.audit_log.create_index("screening_id")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
