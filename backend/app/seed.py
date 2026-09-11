from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Customer


SAMPLE_CUSTOMERS = [
    ("Aarav Mehta", "aarav@novacore.in", "NovaCore", "active", 2),
    ("Diya Sharma", "diya@pixelcraft.in", "PixelCraft", "active", 5),
    ("Kabir Rao", "kabir@northstar.io", "NorthStar", "inactive", 9),
    ("Meera Iyer", "meera@cloudnine.co", "CloudNine", "active", 14),
    ("Rohan Gupta", "rohan@brightpath.in", "BrightPath", "active", 22),
    ("Ananya Singh", "ananya@vertexlabs.io", "Vertex Labs", "inactive", 31),
    ("Vihaan Patel", "vihaan@orbitworks.in", "OrbitWorks", "active", 46),
    ("Sara Khan", "sara@lumen.co", "Lumen", "active", 63),
    ("Arjun Nair", "arjun@greystone.in", "GreyStone", "inactive", 81),
    ("Ishita Verma", "ishita@alphawave.io", "AlphaWave", "active", 105),
    ("Aditya Joshi", "aditya@bluepeak.in", "BluePeak", "active", 128),
    ("Nisha Das", "nisha@urbanloop.co", "UrbanLoop", "inactive", 154),
]


def seed_customers(database: Session) -> None:
    if database.scalar(select(func.count()).select_from(Customer)):
        return

    now = datetime.utcnow()
    for name, email, company, status, days_ago in SAMPLE_CUSTOMERS:
        created_at = now - timedelta(days=days_ago)
        database.add(
            Customer(
                name=name,
                email=email,
                company=company,
                status=status,
                created_at=created_at,
                updated_at=created_at + timedelta(days=1),
            )
        )
    database.commit()
