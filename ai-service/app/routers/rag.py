from fastapi import APIRouter, HTTPException
from app.schemas.rag_schema import ChatRequest, ChatResponse, IndexRequest
from app.services.rag_chat_service import chat_avec_rag
from app.services.vector_store_service import indexer_documentation_si_necessaire
from app.services.backend_client import appeler_backend


router = APIRouter(prefix="/rag", tags=["RAG Chatbot"])


def verifier_acces_chatbot(token: str) -> None:
    """Chatbot réservé aux plans DEMO/PREMIUM. Le staff (pas de planTier) n'est pas concerné."""
    profil = appeler_backend("/profile/me", token)
    if "error" in profil:
        print(f"❌ Erreur /profile/me : {profil['error']}") 
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    plan_tier = profil.get("planTier")
    if plan_tier is not None and not plan_tier.get("chatbotAccess", False):
        raise HTTPException(
            status_code=403,
            detail=f"Le chatbot IA n'est pas disponible dans le plan {plan_tier.get('code')} "
                   f"— passez au plan DEMO ou PREMIUM",
        )


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    verifier_acces_chatbot(request.token)
    resultat = chat_avec_rag(
        question=request.message,
        token=request.token,
        role=request.role,
        historique=request.historique
    )
    return resultat


@router.post("/index")
def indexer(request: IndexRequest):
    """À appeler après ajout/modification de notes ou templates,
    pour rafraîchir le vector store ChromaDB."""
    try:
        indexer_documentation_si_necessaire(force=True)
        return {"status": "ok", "message": "Documentation réindexée avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
