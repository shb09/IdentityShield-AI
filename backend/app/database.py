import os
from urllib.parse import quote_plus
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "identityshield")

client: AsyncIOMotorClient = None
db = None


def _encode_mongodb_url(url: str) -> str:
    """Auto-encode username/password in MongoDB URI if they contain special chars."""
    # Find the userinfo part between:// and @
    if "://" not in url:
        return url

    prefix, rest = url.split("://", 1)

    # Find the host part (after the last @ that's before the host)
    # mongodb+srv://user:pass@host or mongodb+srv://user:p@ss@host
    # We need to find the RIGHT @ that separates userinfo from host
    at_index = rest.rfind("@")
    if at_index == -1:
        return url

    userinfo = rest[:at_index]
    host_part = rest[at_index + 1:]

    # Split userinfo into user:password
    if ":" not in userinfo:
        return url

    user, password = userinfo.split(":", 1)

    # Encode if special chars present
    if any(c in user + password for c in ":@/?#[]"):
        user = quote_plus(user)
        password = quote_plus(password)

    return f"{prefix}://{user}:{password}@{host_part}"


async def connect_db():
    global client, db
    encoded_url = _encode_mongodb_url(MONGODB_URL)
    client = AsyncIOMotorClient(encoded_url)
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
