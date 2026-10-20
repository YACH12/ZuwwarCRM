import os
import joblib
import pandas as pd

# On récupère le chemin absolu pour trouver le dossier 'models' à la racine
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'super_modele_crm.pkl')

REQUIRED_KEYS = {'model', 'threshold', 'feature_names', 'cat_cols', 'categories',
                 'te_maps', 'global_mean', 'act_median', 'prof_median'}

print("Chargement du modèle IA de Lead Scoring...")
art = None
try:
    art = joblib.load(MODEL_PATH)
    missing = REQUIRED_KEYS - set(art.keys()) if isinstance(art, dict) else REQUIRED_KEYS
    if missing:
        print(f"ERREUR : le .pkl ne contient pas : {sorted(missing)}")
        art = None
    else:
        print("Modèle IA de Lead Scoring chargé avec succès !")
except FileNotFoundError:
    print(f"ERREUR : Le modèle est introuvable au chemin : {MODEL_PATH}")

# Correspondance valeurs du CRM -> valeurs connues du modèle (en minuscules).
# Le CRM envoie "Website", valeur que le modèle ne connaît pas.
ALIASES = {
    'Last Activity': {
        'website': 'page visited on website',
    },
    'Lead Source': {
        # 'website': 'direct traffic',   # à décider selon le sens métier
    },
}


def _cat(value, default, select_is_unknown=False):
    """Même nettoyage qu'à l'entraînement : défaut si vide, minuscules, trim."""
    if value is None or str(value).strip() == '':
        return default
    v = str(value).strip().lower()
    if select_is_unknown and v == 'select':
        return 'unknown'
    return v


def _num(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _flag(value):
    return int(str(value).strip().lower() in ('1', 'true', 'yes', 'oui'))


def _build_features(data: dict) -> pd.DataFrame:
    row = {
        'Total Time Spent on Website': _num(data.get('total_time_spent')),
        'TotalVisits':                 _num(data.get('total_visits')),
        'Page Views Per Visit':        _num(data.get('page_views_per_visit')),
        'Asymmetrique_Activity_Score': _num(data.get('asymmetrique_activity_score'), art['act_median']),
        'Asymmetrique_Profile_Score':  _num(data.get('asymmetrique_profile_score'), art['prof_median']),
        'Last Activity':               _cat(data.get('last_activity'), 'missing'),
        'Lead Origin':                 _cat(data.get('lead_origin'), 'missing'),
        'Lead Source':                 _cat(data.get('lead_source'), 'missing'),
        'Occupation':                  _cat(data.get('occupation'), 'unknown', True),
        'Specialization':              _cat(data.get('specialization'), 'unknown', True),
        'City':                        _cat(data.get('city'), 'unknown', True),
        'Last_Notable_Activity':       _cat(data.get('last_notable_activity'), 'missing'),
        'Asymmetrique_Activity_Index': _cat(data.get('asymmetrique_activity_index'), 'missing'),
        'Asymmetrique_Profile_Index':  _cat(data.get('asymmetrique_profile_index'), 'missing'),
        'Do_Not_Email':                _flag(data.get('do_not_email')),
        'Do_Not_Call':                 _flag(data.get('do_not_call')),
    }
    for col, mapping in ALIASES.items():
        row[col] = mapping.get(row[col], row[col])

    df = pd.DataFrame([row])

    # Feature engineering (identique au notebook d'entraînement)
    df['Time_Per_Visit'] = df['Total Time Spent on Website'] / (df['TotalVisits'] + 1)
    df['Global_Activity_Volume'] = df['TotalVisits'] * df['Page Views Per Visit']
    df['Is_Highly_Engaged'] = (df['Total Time Spent on Website'] > 300).astype(int)
    df['Origin_x_Occupation'] = df['Lead Origin'] + '__' + df['Occupation']
    df['Source_x_Specialization'] = df['Lead Source'] + '__' + df['Specialization']

    # Target encoding + catégories figées de l'entraînement
    for col in art['cat_cols']:
        value = df.at[0, col]
        if value not in art['categories'][col]:
            print(f"AVERTISSEMENT : valeur inconnue '{value}' pour '{col}' (traitée comme manquante)")
        df[col + '_TE'] = df[col].map(art['te_maps'][col]).fillna(art['global_mean'])
        df[col] = pd.Categorical(df[col], categories=art['categories'][col])

    return df[art['feature_names']]


def calculer_score(data: dict) -> dict:
    if art is None:
        raise ValueError("Le modèle ML n'est pas chargé.")

    print(f"Données reçues pour scoring : {data}")
    X = _build_features(data)

    try:
        probabilite = float(art['model'].predict_proba(X)[0][1])
    except Exception as pred_err:
        print(f"Erreur predict_proba : {type(pred_err).__name__}: {pred_err}")
        raise
    score = round(probabilite * 100, 2)

    # Logique métier CRM
    if score < 25:
        etape = "Nouveau"
    elif score < 62:
        etape = "Engagé"
    elif score < 85:
        etape = "Haute Intention"
    else:
        etape = "Prêt à Convertir"

    return {
        "scoreIA":       score,
        "etapeProspect": etape,
        "converti":      probabilite >= art['threshold'],
    }