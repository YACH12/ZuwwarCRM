from fastapi import APIRouter, HTTPException
from app.schemas.nlp_schema import TexteEntrant
from app.services.nlp_service import classifier_texte

router = APIRouter(prefix="/api/nlp", tags=["NLP"])

MAX_TEXT_LENGTH = 2000

@router.post("/classifier")
def classifier_message(data: TexteEntrant):
    if len(data.texte) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=422,
            detail=f"Texte trop long ({len(data.texte)} caractères, max {MAX_TEXT_LENGTH})"
        )
    try:
        return classifier_texte(data.texte)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
