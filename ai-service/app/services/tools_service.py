from datetime import datetime, timedelta
from app.services.backend_client import appeler_backend
from app.services.vector_store_service import rechercher_documentation


def get_deals_stats(token: str, **kwargs) -> dict:
    return appeler_backend("/deals/stats", token)


ETAPES_VALIDES = {"PROSPECT", "QUALIFICATION", "PROPOSITION", "NEGOCIATION", "GAGNE", "PERDU"}


def get_deals(token: str, page: int = 0, limit: int = 20, **kwargs) -> dict:
    limit = min(limit, 100)
    deals = appeler_backend("/deals", token, {"page": page, "size": limit})
    liste = deals.get("content", [])
    return {
        "page": page,
        "total": deals.get("totalElements", len(liste)),
        "deals": [
            {"id": d.get("id"), "titre": d.get("titre"), "montant": d.get("montant"),
             "stage": d.get("stage"), "probabilite": d.get("probabilite")}
            for d in liste
        ]
    }


def get_deals_by_stage(token: str, stage: str = "PROSPECT", **kwargs) -> dict:
    stage = (stage or "").strip().upper()
    if stage not in ETAPES_VALIDES:
        return {"error": f"Étape inconnue '{stage}'. Valeurs valides : {', '.join(sorted(ETAPES_VALIDES))}"}
    deals = appeler_backend(f"/deals/stage/{stage}", token)
    if isinstance(deals, list):
        return {
            "stage": stage,
            "count": len(deals),
            "deals": [
                {"titre": d.get("titre"), "montant": d.get("montant"),
                 "probabilite": d.get("probabilite")}
                for d in deals[:10]
            ]
        }
    return deals


def get_top_contacts(token: str, limit: int = 5, **kwargs) -> dict:
    # Tri côté backend pour éviter de charger 1000 contacts en mémoire
    contacts = appeler_backend("/contacts", token, {"page": 0, "size": limit, "sort": "scoreIA,desc"})
    liste = contacts.get("content", [])
    return {
        "top_contacts": [
            {"nom": f"{c.get('prenom')} {c.get('nom')}",
             "email": c.get("email"),
             "score": c.get("scoreIA"),
             "etape": c.get("leadStage")}
            for c in liste
        ]
    }


def get_contacts(token: str, page: int = 0, limit: int = 20, **kwargs) -> dict:
    limit = min(limit, 100)
    contacts = appeler_backend("/contacts", token, {"page": page, "size": limit})
    liste = contacts.get("content", [])
    return {
        "page": page,
        "total": contacts.get("totalElements", len(liste)),
        "contacts": [
            {"id": c.get("id"), "nom": f"{c.get('prenom')} {c.get('nom')}",
             "email": c.get("email"), "telephone": c.get("telephone"),
             "statut": c.get("status"), "etape": c.get("leadStage")}
            for c in liste
        ]
    }


def get_inactive_contacts(token: str, days: int = 30, **kwargs) -> dict:
    # On charge par pages pour éviter de récupérer 1000 contacts d'un coup
    contacts = appeler_backend("/contacts", token, {"page": 0, "size": 200})
    liste = contacts.get("content", [])
    seuil = datetime.now() - timedelta(days=days)
    inactifs = []
    for c in liste:
        date_str = c.get("updateAt") or c.get("creatAt")
        if date_str:
            try:
                date_obj = datetime.fromisoformat(date_str.split(".")[0])
                if date_obj < seuil:
                    inactifs.append(c)
            except Exception:
                pass
    return {
        "jours_inactivite": days,
        "count": len(inactifs),
        "contacts": [
            {"nom": f"{c.get('prenom')} {c.get('nom')}", "email": c.get("email")}
            for c in inactifs[:15]
        ]
    }


def get_entreprises(token: str, page: int = 0, limit: int = 20, **kwargs) -> dict:
    limit = min(limit, 100)
    entreprises = appeler_backend("/entreprises", token, {"page": page, "size": limit})
    liste = entreprises.get("content", [])
    return {
        "page": page,
        "total": entreprises.get("totalElements", len(liste)),
        "entreprises": [
            {"id": e.get("id"), "nom": e.get("nom"), "email": e.get("email"),
             "telephone": e.get("telephone"), "secteur": e.get("secteur"),
             "taille": e.get("taille")}
            for e in liste
        ]
    }


def get_activites(token: str, page: int = 0, limit: int = 20, **kwargs) -> dict:
    limit = min(limit, 100)
    activites = appeler_backend("/activites", token, {"page": page, "size": limit})
    liste = activites.get("content", [])
    return {
        "page": page,
        "total": activites.get("totalElements", len(liste)),
        "activites": [
            {"id": a.get("id"), "type": a.get("type"), "titre": a.get("titre"),
             "statut": a.get("statut"), "priorite": a.get("priorite"),
             "date_echeance": a.get("dateEcheance")}
            for a in liste
        ]
    }


def get_campaigns_performance(token: str, **kwargs) -> dict:
    campagnes = appeler_backend("/campaigns", token, {"page": 0, "size": 100})
    liste = campagnes.get("content", [])
    total_sent = sum(c.get("totalSent", 0) for c in liste)
    envoyees = [c for c in liste if c.get("statut") == "SENT"]
    return {
        "total_campagnes": len(liste),
        "campagnes_envoyees": len(envoyees),
        "total_emails_envoyes": total_sent,
        "details": [
            {"nom": c.get("name"), "statut": c.get("statut"), "envoyes": c.get("totalSent")}
            for c in liste[:10]
        ]
    }


def get_activites_stats(token: str, **kwargs) -> dict:
    return appeler_backend("/activites/stats", token)


def get_contacts_count(token: str, status: str = None, leadStage: str = None, **kwargs) -> dict:
    params = {"page": 0, "size": 1}  # On veut juste le total — page de 1 suffit
    contacts = appeler_backend("/contacts", token, params)
    # Si le backend renvoie la pagination, on lit totalElements directement
    if "totalElements" in contacts:
        total = contacts["totalElements"]
        # Filtrage côté client seulement si un filtre est demandé (on recharge alors)
        if status or leadStage:
            all_contacts = appeler_backend("/contacts", token, {"page": 0, "size": 500})
            liste = all_contacts.get("content", [])
            if status:
                liste = [c for c in liste if c.get("status") == status]
            if leadStage:
                liste = [c for c in liste if c.get("leadStage") == leadStage]
            return {"count": len(liste)}
        return {"count": total}
    # Fallback si le backend ne renvoie pas de pagination
    liste = contacts.get("content", [])
    if status:
        liste = [c for c in liste if c.get("status") == status]
    if leadStage:
        liste = [c for c in liste if c.get("leadStage") == leadStage]
    return {"count": len(liste)}


def get_contact_details(token: str, contact_id: int, **kwargs) -> dict:
    return appeler_backend(f"/contacts/{contact_id}", token)


def update_contact_phone(token: str, contact_id: int, telephone: str, **kwargs) -> dict:
    # On récupère le contact existant pour ne modifier que le téléphone
    contact = appeler_backend(f"/contacts/{contact_id}", token)
    if "error" in contact:
        return contact
    contact["telephone"] = telephone
    result = appeler_backend(f"/contacts/{contact_id}", token, method="PUT", body=contact)
    if "error" in result:
        return result
    return {"success": True, "contact_id": contact_id, "nouveau_telephone": telephone}


def get_templates(token: str, **kwargs) -> dict:
    templates = appeler_backend("/templates", token, {"page": 0, "size": 50})
    liste = templates.get("content", [])
    return {
        "count": len(liste),
        "templates": [
            {"nom": t.get("nom"), "subject": t.get("subject"), "type": t.get("type")}
            for t in liste
        ]
    }


def rechercher_documentation_tool(token: str, question: str, **kwargs) -> dict:
    resultats = rechercher_documentation(question, top_k=3)
    if not resultats:
        return {"resultats": [], "message": "Aucune documentation pertinente trouvée"}
    return {"resultats": resultats}


# ── Registre des fonctions exécutables ────────────────────────────────────────
FONCTIONS_DISPONIBLES = {
    "get_deals_stats":            get_deals_stats,
    "get_deals_by_stage":         get_deals_by_stage,
    "get_deals":                  get_deals,
    "get_contacts":               get_contacts,
    "get_top_contacts":           get_top_contacts,
    "get_inactive_contacts":      get_inactive_contacts,
    "get_entreprises":            get_entreprises,
    "get_campaigns_performance":  get_campaigns_performance,
    "get_activites_stats":        get_activites_stats,
    "get_activites":              get_activites,
    "get_contacts_count":         get_contacts_count,
    "get_contact_details":        get_contact_details,
    "update_contact_phone":       update_contact_phone,
    "get_templates":              get_templates,
    "rechercher_documentation":   rechercher_documentation_tool,
}


def executer_fonction(nom_fonction: str, arguments: dict, token: str) -> dict:
    fonction = FONCTIONS_DISPONIBLES.get(nom_fonction)
    if not fonction:
        return {"error": f"Fonction inconnue: {nom_fonction}"}
    return fonction(token=token, **arguments)
