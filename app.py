from flask import Flask, jsonify
from flask_cors import CORS

# Initialisation de l'application Flask
app = Flask(__name__)

# Configuration de CORS pour autoriser les requêtes depuis notre fichier HTML
# C'est une étape de sécurité essentielle pour que le navigateur ne bloque pas la requête
CORS(app)

# Définition d'une "route" API. C'est l'URL que notre JavaScript va appeler.
@app.route('/api/travail')
def get_travail_data():
    """Cette fonction est exécutée quand on accède à l'URL /api/travail."""
    
    # On simule ici la récupération des données (plus tard, ce sera pronotepy, etc.)
    # La structure doit être identique à l'ancien objet JavaScript.
    dashboard_data = {
        "notes": {
            "moyenneGenerale": 15.8,
            "matieres": [
                { "nom": "Mathématiques", "moyenne": 17.5 },
                { "nom": "Physique-Chimie", "moyenne": 16 },
                { "nom": "Spé. SIN", "moyenne": 18 },
                { "nom": "Anglais", "moyenne": 14.5 }
            ],
            "historiqueMoyenne": {
                "labels": ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév"],
                "points": [14.2, 14.8, 15.1, 15.0, 15.5, 15.8]
            }
        },
        "devoirs": { "total": 8, "faits": 6 },
        "duolingo": { "streak": 412, "xpDuJour": 80 }
    }
    
    # On retourne les données au format JSON, que le JavaScript peut comprendre
    return jsonify(dashboard_data)

# Ce bloc permet de lancer le serveur quand on exécute le script `python app.py`
if __name__ == '__main__':
    # debug=True permet de recharger le serveur automatiquement si on modifie le code
    app.run(debug=True)