TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_deals_stats",
            "description": "Récupère les statistiques globales des deals : pipeline actif, montants par étape, nombre de deals gagnés/perdus",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_deals_by_stage",
            "description": "Liste les deals d'une étape précise du pipeline de vente",
            "parameters": {
                "type": "object",
                "properties": {
                    "stage": {
                        "type": "string",
                        "description": "L'étape du pipeline à filtrer. Valeurs possibles : "
                                        "PROSPECT, QUALIFICATION, PROPOSITION, NEGOCIATION, GAGNE, PERDU"
                    }
                },
                "required": ["stage"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_contacts",
            "description": "Liste les contacts (nom, email, téléphone, statut, étape) avec pagination. À utiliser pour toute demande de liste/noms de contacts qui n'est pas un classement par score (get_top_contacts) ni un filtre d'inactivité (get_inactive_contacts).",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer", "description": "Numéro de page, défaut 0"},
                    "limit": {"type": "integer", "description": "Nombre de contacts par page, défaut 20, max 100"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_deals",
            "description": "Liste tous les deals (titre, montant, étape, probabilité) avec pagination, toutes étapes confondues. À utiliser pour une liste générale de deals qui n'est pas filtrée par étape (get_deals_by_stage) ni agrégée (get_deals_stats).",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer", "description": "Numéro de page, défaut 0"},
                    "limit": {"type": "integer", "description": "Nombre de deals par page, défaut 20, max 100"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_entreprises",
            "description": "Liste les entreprises (nom, email, téléphone, secteur, taille) avec pagination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer", "description": "Numéro de page, défaut 0"},
                    "limit": {"type": "integer", "description": "Nombre d'entreprises par page, défaut 20, max 100"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_activites",
            "description": "Liste les activités et tâches CRM (type, titre, statut, priorité, échéance) avec pagination. À utiliser pour une liste détaillée d'activités, contrairement à get_activites_stats qui ne donne que des totaux agrégés.",
            "parameters": {
                "type": "object",
                "properties": {
                    "page": {"type": "integer", "description": "Numéro de page, défaut 0"},
                    "limit": {"type": "integer", "description": "Nombre d'activités par page, défaut 20, max 100"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_contacts",
            "description": "Récupère les meilleurs contacts/prospects/leads, triés par score IA décroissant (les plus susceptibles de convertir). À utiliser pour toute question du type « mes meilleurs prospects/leads/contacts »",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Nombre de contacts à retourner, défaut 5"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_inactive_contacts",
            "description": "Récupère les contacts qui n'ont pas été mis à jour depuis un certain nombre de jours",
            "parameters": {
                "type": "object",
                "properties": {
                    "days": {"type": "integer", "description": "Nombre de jours d'inactivité, défaut 30"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_campaigns_performance",
            "description": "Récupère les statistiques des campagnes email : nombre envoyées, total envoyés",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_activites_stats",
            "description": "Récupère les statistiques des activités et tâches CRM : nombre total d'activités, répartition des tâches par statut (à faire, en cours, terminée, annulée), nombre de notes et d'événements système",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_contacts_count",
            "description": "Compte le nombre total de contacts, filtré optionnellement par statut ou étape",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "ABONNE, DESABONNE ou BOUNCED (optionnel)"},
                    "leadStage": {"type": "string", "description": "New, Engaged, ou High_Intent (optionnel)"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_contact_details",
            "description": "Récupère les détails complets d'un contact par son ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_id": {"type": "integer", "description": "L'identifiant numérique du contact"}
                },
                "required": ["contact_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_contact_phone",
            "description": "Met à jour le numéro de téléphone d'un contact existant dans le CRM",
            "parameters": {
                "type": "object",
                "properties": {
                    "contact_id": {"type": "integer", "description": "L'identifiant numérique du contact à modifier"},
                    "telephone": {"type": "string", "description": "Le nouveau numéro de téléphone"}
                },
                "required": ["contact_id", "telephone"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_templates",
            "description": "Liste les modèles (templates) d'emails disponibles dans le CRM : nom, sujet, type. À utiliser pour toute question sur les modèles/templates d'emails existants",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "rechercher_documentation",
            "description": "Recherche dans la documentation statique du CRM Zuwwar : définitions, règles métier, fonctionnement du pipeline, rôles utilisateurs, guides d'utilisation. À utiliser UNIQUEMENT pour des questions d'explication ou de compréhension générale du système — jamais pour des données CRM réelles (deals, contacts, chiffres), qui doivent passer par les autres outils.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "La question ou le sujet à chercher dans la documentation"}
                },
                "required": ["question"]
            }
        }
    },
]
