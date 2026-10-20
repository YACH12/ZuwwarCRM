from pydantic import BaseModel

class ContactData(BaseModel):
    total_time_spent: float
    total_visits: float
    page_views_per_visit: float
    last_activity: str
    lead_origin: str
    lead_source: str
    occupation: str