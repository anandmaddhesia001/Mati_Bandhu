from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def _resolve_model_path():
    # Prefer local models folder, fall back to original monolith models location
    local = os.path.join(BASE_DIR, "models", "RandomForest.pkl")
    upstream = os.path.join(BASE_DIR, "..", "flask-backend", "models", "RandomForest.pkl")
    if os.path.exists(local):
        return local
    if os.path.exists(upstream):
        return upstream
    return None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model once globally
model = None
model_path = _resolve_model_path()
if model_path:
    try:
        model = joblib.load(model_path)
    except Exception:
        model = None


@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route('/crop-predict', methods=['POST'])
def crop_predict():
    try:
        if model is None:
            return jsonify({"error": "model not loaded"}), 503

        body = request.get_json(force=True)

        # Accept both original keys (N,P,K) and frontend keys (nitrogen, phosphorous, pottasium)
        def _get(key, alt=None):
            if key in body:
                return body[key]
            if alt and alt in body:
                return body[alt]
            return None

        N = _get('N', 'nitrogen')
        P = _get('P', 'phosphorous')
        K = _get('K', 'pottasium')
        temperature = _get('temperature')
        humidity = _get('humidity')
        ph = _get('ph')
        rainfall = _get('rainfall')

        missing = [k for k,v in [('N',N),('P',P),('K',K),('temperature',temperature),('humidity',humidity),('ph',ph),('rainfall',rainfall)] if v is None]
        if missing:
            return jsonify({"error": f"missing fields: {', '.join(missing)}"}), 400

        df = pd.DataFrame([{
            'N': float(N),
            'P': float(P),
            'K': float(K),
            'temperature': float(temperature),
            'humidity': float(humidity),
            'ph': float(ph),
            'rainfall': float(rainfall)
        }])

        pred = model.predict(df)

        return jsonify({"prediction": str(pred[0])})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 7001)))
