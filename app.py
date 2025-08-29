import json
import pronotepy
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import date

# Initialisation de l'application Flask
app = Flask(__name__)
# Configuration de CORS pour autoriser les requêtes depuis les fichiers HTML
CORS(app)

# Fonction pour charger la configuration depuis le fichier config.json
def load_config():
    with open('config.json', 'r') as f:
        return json.load(f)

@app.route('/api/travail')
def get_travail_data():
    """
    Tente de récupérer les données de Pronote et retourne TOUJOURS une structure de données complète,
    en indiquant le statut (succès/échec) de chaque module.
    """
    
    # Structure de base de la réponse avec un statut de succès par défaut.
    dashboard_data = {
        "notes": {"status": "success", "data": {}},
        "devoirs": {"status": "success", "data": {}},
        "duolingo": {"status": "success", "data": {"streak": 412, "xpDuJour": 80}}
    }

    # Essayer de récupérer les données de Pronote dans un bloc try/except.
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

        # --- Si la connexion réussit, on remplit les données ---
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

        homeworks = client.homework(from_date=date.today())
        dashboard_data["devoirs"]["data"] = {
            "total": len(homeworks),
            "faits": sum(1 for h in homeworks if h.done)
        }

    except Exception as e:
        # Si une erreur survient, on met à jour le statut des modules concernés.
        print(f"Erreur Pronote: {e}")
        error_message = "Nous avons rencontré un problème. Réessayez plus tard."
        dashboard_data["notes"]["status"] = "error"
        dashboard_data["notes"]["message"] = error_message
        dashboard_data["devoirs"]["status"] = "error"
        dashboard_data["devoirs"]["message"] = error_message

    # On retourne TOUJOURS la structure complète, sans erreur HTTP.
    return jsonify(dashboard_data)

@app.route('/api/sante/analyse')
def get_sante_analysis():
    """
    Récupère des données de santé (fictives), construit un prompt
    et interroge l'API de LM Studio.
    """
    frequence_cardiaque = [62, 60, 58, 55, 54, 56, 58, 61]
    frequence_respiratoire = [16, 15, 15, 14, 14, 14, 15, 16]
    prompt = f"En tant qu'assistant de santé, analyse brièvement (2-3 phrases) ces données nocturnes:\n- BPM heure/heure: {frequence_cardiaque}\n- Fréq. Resp.: {frequence_respiratoire}"

    lm_studio_url = "http://127.0.0.1:1234/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "local-model",
        "messages": [
            {"role": "system", "content": "Tu es un assistant de santé concis."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "stream": False
    }

    try:
        response = requests.post(lm_studio_url, headers=headers, json=payload, timeout=45)
        response.raise_for_status()
        
        ai_response = response.json()
        
        print("Réponse complète de LM Studio:", json.dumps(ai_response, indent=2))
        
        if 'choices' in ai_response and len(ai_response['choices']) > 0:
            analysis_text = ai_response['choices'][0]['message']['content']
            return jsonify({"analysis": analysis_text})
        else:
            raise Exception("La réponse de l'IA est mal formée.")

    except requests.exceptions.ConnectionError:
        error_message = "Impossible de se connecter à LM Studio. Le serveur API est-il bien démarré ?"
        print(f"ERREUR: {error_message}")
        return jsonify({"error": error_message}), 503
    except Exception as e:
        error_message = f"Une erreur est survenue lors de la communication avec l'IA: {e}"
        print(f"ERREUR: {error_message}")
        return jsonify({"error": "Une erreur est survenue lors de la communication avec l'IA."}), 500

# Ce bloc permet de lancer le serveur quand on exécute le script `python app.py`
if __name__ == '__main__':
    # debug=True permet de recharger le serveur automatiquement si on modifie le code
    app.run(debug=True)