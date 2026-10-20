from transformers import pipeline

print("⏳ Chargement du modèle NLP mDeBERTa-v3 (multilingue, français inclus)...")
try:
    classificateur_nlp = pipeline(
        "zero-shot-classification",
        model="MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
    )
    print("✅ Modèle NLP chargé avec succès !")
except Exception as e:
    print(f"❌ ERREUR lors du chargement du modèle NLP : {e}")
    classificateur_nlp = None

def classifier_texte(texte: str) -> dict:
    if classificateur_nlp is None:
        raise ValueError("Le pipeline NLP n'est pas disponible.")

    categories = [
        "Demande de devis ou d'information produit",
        "Réclamation",
        "Support technique",
        "Suivi de commande",
        "Spam ou hors sujet"
    ]
    traduction = {
        "Demande de devis ou d'information produit": "devis_info_produit",
        "Réclamation":                               "reclamation",
        "Support technique":                         "support_technique",
        "Suivi de commande":                          "suivi_commande",
        "Spam ou hors sujet":                         "spam_hors_sujet"
    }

    resultat = classificateur_nlp(texte, candidate_labels=categories)

    return {
        "texte":     texte,
        "categorie": traduction[resultat["labels"][0]],
        "confiance": round(resultat["scores"][0], 4)
    }