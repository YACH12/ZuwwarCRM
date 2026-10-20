from fastapi import APIRouter, HTTPException
from app.schemas.scoring_schema import ContactData
from app.services.scoring_service import calculer_score

router = APIRouter(prefix="/api/scoring", tags=["Lead Scoring"])

@router.post("/predict")
def scorer_contact(data: ContactData):
    try:
        return calculer_score(data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))