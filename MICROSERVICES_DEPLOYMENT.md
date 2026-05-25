Microservices split: crop-service and disease-service

Quick steps to run locally:

- Create virtualenv and install requirements for each service

  # Crop service
  python -m venv .venv && .venv\Scripts\activate
  pip install -r crop-service\requirements.txt
  # copy model if needed
  copy flask-backend\models\RandomForest.pkl crop-service\models\RandomForest.pkl
  set PORT=7001
  python crop-service\app.py

  # Disease service
  python -m venv .venv && .venv\Scripts\activate
  pip install -r disease-service\requirements.txt
  # copy model if needed
  copy flask-backend\models\plant_disease_model.pth disease-service\models\plant_disease_model.pth
  set PORT=7002
  python disease-service\app.py

Render deployment notes:

- Each service contains a `Procfile` and `runtime.txt` prepared for Render / Heroku style deployments.
- On Render, create two Python Web Services pointing to repository subpaths `crop-service` and `disease-service` respectively. Render will run `gunicorn app:app` from those folders.

Frontend integration:

- Use `vite-project/.env.example` to set `VITE_CROP_API` and `VITE_DISEASE_API` in production to point to deployed service URLs.
- Example usage in code: `import.meta.env.VITE_CROP_API` and `import.meta.env.VITE_DISEASE_API`.
