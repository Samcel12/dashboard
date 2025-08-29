import json
import pronotepy
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import date

app = Flask(__name__)
CORS(app)

def load_config():
    with open('config.json', 'r') as f:
        return json.load(f)

@app.route('/api/travail')
def get_travail_data():
    """
    Tente de récupérer les données de Pronote et retourne TOUJOURS une structure de données complète,
    en indiquant le statut (succès/échec) de chaque module.
    """
    
    # Structure de base de la réponse
    dashboard_data = {
        "notes": {"status": "success", "data": {}},
        "devoirs": {"status": "success", "data": {}},
        "duolingo": {"status": "success", "data": {"streak": 412, "xpDuJour": 80}} # Duolingo est toujours un succès pour l'instant
    }

    # On essaie de récupérer les données de Pronote dans un seul bloc
    try:
        config = load_config()
        client = pronotepy.Client(
            config['pronote_url'],
            username=config['pronote_username'],
            password=config['pronote_password'],
            ent_cas=config['pronote_cas']
        )

        if not client.logged_in:
            raise Exception("La connexion à Pronote a échoué. Vérifiez les identifiants dans config.json.")

        # --- Récupération des notes ---
        current_period = client.periods[0]
        matieres_data = [{"nom": s.name, "moyenne": s.average} for s in current_period.subjects]
        
        dashboard_data["notes"]["data"] = {
            "moyenneGenerale": float(current_period.overall_average.replace(',', '.')),
            "matieres": matieres_data,
            "historiqueMoyenne": {
                "labels": ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév"],
                "points": [14.2, 14.8, 15.1, 15.0, 15.5, float(current_period.overall_average.replace(',', '.'))]
            }
        }

        # --- Récupération des devoirs ---
        homeworks = client.homework(from_date=date.today())
        dashboard_data["devoirs"]["data"] = {
            "total": len(homeworks),
            "faits": sum(1 for h in homeworks if h.done)
        }

    except Exception as e:
        # Si QUOI QUE CE SOIT échoue, on met à jour le statut des modules Pronote
        print(f"Erreur Pronote: {e}")
        error_message = "Nous avons rencontré un problème. Réessayez plus tard."
        dashboard_data["notes"]["status"] = "error"
        dashboard_data["notes"]["message"] = error_message
        dashboard_data["devoirs"]["status"] = "error"
        dashboard_data["devoirs"]["message"] = error_message

    return jsonify(dashboard_data)

if __name__ == '__main__':
    app.run(debug=True)