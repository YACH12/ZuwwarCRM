import json
import os
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

from app.services.tools_definitions import TOOLS
from app.services.tools_service import executer_fonction

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError(
        "GROQ_API_KEY manquante — ajoutez-la dans votre fichier .env "
        "sous la forme : GROQ_API_KEY=gsk_..."
    )

GROQ_MODEL = "openai/gpt-oss-20b"

# ── LLM LangChain branché sur Groq ─────────────────
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model=GROQ_MODEL,
    temperature=0.3,
    max_tokens=600,
)
llm_with_tools = llm.bind_tools(TOOLS)


SYSTEM_PROMPT = """Tu es l'assistant IA de Zuwwar, un CRM intelligent marocain.
Tu réponds aux questions de l'utilisateur (rôle: {role}).

SÉPARATION STRICTE DES SOURCES :

1. DONNÉES CRM EN TEMPS RÉEL (chiffres, listes, contacts, deals, campagnes)
   → utilise OBLIGATOIREMENT les outils CRM : get_deals_stats, get_deals_by_stage,
   get_top_contacts, get_inactive_contacts, get_campaigns_performance,
   get_contacts_count, get_contact_details, update_contact_phone.

2. EXPLICATIONS, DÉFINITIONS, RÈGLES MÉTIER, FONCTIONNEMENT DU SYSTÈME
   → utilise OBLIGATOIREMENT rechercher_documentation. Exemples : "c'est quoi
   un score IA", "comment fonctionne le pipeline", "quels sont les rôles
   disponibles", "comment classifier un email".

3. Les deux sources sont STRICTEMENT séparées : ne jamais répondre à une
   question chiffrée avec rechercher_documentation, et ne jamais répondre
   à une question de définition avec les outils CRM.

4. Ne jamais inventer de chiffres ou de définitions — uniquement ce qui
   est retourné par les outils.

5. Réponds dans la langue de la question (français, arabe, ou darija).
6. Sois concis et professionnel."""


def construire_historique_langchain(historique: list, role: str):
    messages = [SystemMessage(content=SYSTEM_PROMPT.format(role=role))]
    for msg in historique[-6:]:  
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))
    return messages


def chat_avec_rag(question: str, token: str, role: str, historique: list) -> dict:
    """
    Orchestration complète : LangChain décide quel(s) outil(s) appeler
    (function calling structuré OU rag vectoriel), exécute les outils
    réels, puis génère la réponse finale.
    """
    messages = construire_historique_langchain(historique, role)
    messages.append(HumanMessage(content=question))

    try:
        ai_message = llm_with_tools.invoke(messages)
        messages.append(ai_message)

        fonctions_utilisees = []
        sources_rag = []

        if ai_message.tool_calls:
            for tool_call in ai_message.tool_calls:
                nom_fonction = tool_call["name"]
                arguments = tool_call["args"]

                resultat = executer_fonction(nom_fonction, arguments, token)
                fonctions_utilisees.append(nom_fonction)

                if nom_fonction == "rechercher_documentation":
                    sources_rag = resultat.get("resultats", [])
                    print(f"🔍 RAG documentation déclenché — {len(sources_rag)} résultat(s) trouvé(s)")

                messages.append(ToolMessage(
                    content=json.dumps(resultat, ensure_ascii=False),
                    tool_call_id=tool_call["id"]
                ))

            # 2e appel — génération finale avec les résultats des outils
            reponse_finale = llm.invoke(messages)
            texte_reponse = reponse_finale.content
        else:
            texte_reponse = ai_message.content

        return {
            "reponse": texte_reponse,
            "fonctions_utilisees": fonctions_utilisees,
            "sources_rag": sources_rag,
            "model": GROQ_MODEL
        }

    except Exception as e:
        import traceback
        print(f"❌ Erreur chat_avec_rag: {type(e).__name__}: {e}")
        traceback.print_exc()
        return {
            "reponse": "Désolé, une erreur est survenue. Réessayez.",
            "fonctions_utilisees": [],
            "sources_rag": [],
            "model": GROQ_MODEL,
            "error": str(e)
        }