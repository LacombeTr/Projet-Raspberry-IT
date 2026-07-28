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
| `LATITUDE` | Latitude **par défaut** (utilisée si le navigateur ne partage pas la position GPS) |
| `LONGITUDE` | Longitude **par défaut** (utilisée si le navigateur ne partage pas la position GPS) |
| `VIGICRUES_STATION_CODE` | Code station Vigicrues **par défaut** (repli si la station la plus proche est introuvable) |
| `METEOFRANCE_API_KEY` | Clé API Météo-France |
| `METEOFRANCE_DEPT` | Département **par défaut** (repli si le département ne peut être déduit des coordonnées) |

> **Localisation dynamique** : le front-end demande la position GPS du navigateur et
> la transmet aux endpoints via les paramètres `?lat=&lon=`. Les hazards (vent, chaleur,
> incendies) sont alors calculés autour de ce point ; pour les inondations, le
> département (via `geo.api.gouv.fr`) et la station Vigicrues la plus proche (via le
> référentiel Opendatasoft) sont déduits des coordonnées. Le libellé affiché correspond
> au tronçon de vigilance crues le plus proche (flux `InfoVigiCru.geojson` de Vigicrues,
> ex. « Seine à Paris »), avec repli sur le cours d'eau de la station puis son code. Les
> variables ci-dessus servent de valeurs de repli lorsqu'aucune position n'est disponible.

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
