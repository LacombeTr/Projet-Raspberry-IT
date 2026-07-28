# Hazard Monitor

Application de surveillance des risques naturels (incendies, vents, chaleur, inondations) basée sur des APIs externes.

## Stack

- **Backend** : FastAPI (Python) + SQLAlchemy
- **Frontend** : React + TypeScript + Vite + Tailwind CSS

---

## Backend

### Prérequis

- Python 3.10+
- Un fichier `.env` configuré (voir ci-dessous)

### Installation

```bash
cd backend

# Créer et activer un environnement virtuel
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# ou
.venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Configuration

Copier le fichier d'exemple et remplir les clés API :

```bash
cp .env.example .env
```

Variables à renseigner dans `.env` :

| Variable | Description |
|---|---|
| `OPENWEATHERMAP_API_KEY` | Clé API OpenWeatherMap |
| `NASA_FIRMS_API_KEY` | Clé API NASA FIRMS (détection incendies) |
| `FIRE_RADIUS_KM` | Rayon de détection des incendies (en km) |
| `FIRMS_URL` | URL de l'API FIRMS |
| `FIRMS_SOURCE` | Source satellite (ex: `VIIRS_NOAA20_NRT`) |
| `LATITUDE` | Latitude de la localisation à surveiller |
| `LONGITUDE` | Longitude de la localisation à surveiller |
| `VIGICRUES_STATION_CODE` | Code station Vigicrues (inondations) |
| `METEOFRANCE_API_KEY` | Clé API Météo-France |
| `METEOFRANCE_DEPT` | Numéro de département (ex: `69`) |

### Lancer le serveur

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

Le serveur tourne sur `http://localhost:8000`.

### Endpoints disponibles

| Route | Description |
|---|---|
| `GET /api/health` | Vérification que le serveur est en ligne |
| `GET /api/wind` | Données de vent |
| `GET /api/heat` | Données de chaleur |
| `GET /api/fire` | Détection d'incendies (NASA FIRMS) |
| `GET /api/flood` | Données d'inondations |

---

## Frontend

### Prérequis

- Node.js 18+

### Installation et lancement

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur `http://localhost:5173`.

---

## Lancer l'application complète

Ouvrir deux terminaux :

**Terminal 1 — Backend :**
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

Ouvrir `http://localhost:5173` dans le navigateur.
