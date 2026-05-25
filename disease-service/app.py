from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import torch
from torchvision import transforms
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Local model path (prefer service-local models folder)
def _resolve_model_path():
    local = os.path.join(BASE_DIR, "models", "plant_disease_model.pth")
    upstream = os.path.join(BASE_DIR, "..", "flask-backend", "models", "plant_disease_model.pth")
    if os.path.exists(local):
        return local
    if os.path.exists(upstream):
        return upstream
    return None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# import local utils
from utils.model import ResNet9
from utils.disease import disease_dic

# disease classes (same order as training)
disease_classes = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy", "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy", "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot",
    "Peach___healthy", "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot",
    "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

# Build and load model once
disease_model = None
model_path = _resolve_model_path()
if model_path:
    try:
        disease_model = ResNet9(3, len(disease_classes))
        disease_model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        disease_model.eval()
    except Exception:
        disease_model = None


def predict_image(img_bytes):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.ToTensor(),
    ])

    image = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img_t = transform(image)
    img_u = torch.unsqueeze(img_t, 0)

    with torch.no_grad():
        yb = disease_model(img_u)
        _, preds = torch.max(yb, dim=1)
        prediction = disease_classes[preds[0].item()]
    return prediction


@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/disease-predict', methods=['POST'])
def disease_predict():
    try:
        if disease_model is None:
            return jsonify({"error": "disease model not loaded"}), 503

        if 'file' not in request.files:
            return jsonify({"error": "no file provided"}), 400

        file = request.files['file']
        img = file.read()

        pred_key = predict_image(img)
        result = disease_dic.get(pred_key, {"Crop": "Unknown", "Disease": pred_key})

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 7002)))
