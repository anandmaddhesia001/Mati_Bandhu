import requests

BASE_URL = "http://127.0.0.1:7000"

# -----------------------------
# Test Crop Prediction Model
# -----------------------------
crop_payloads = [
    {
        "name": "Rice Test",
        "data": {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 20.8,
            "humidity": 82,
            "ph": 6.5,
            "rainfall": 202
        }
    },
    {
        "name": "Maize Test",
        "data": {
            "N": 71,
            "P": 54,
            "K": 16,
            "temperature": 22.6,
            "humidity": 63,
            "ph": 5.7,
            "rainfall": 88
        }
    },
    {
        "name": "Chickpea Test",
        "data": {
            "N": 40,
            "P": 72,
            "K": 77,
            "temperature": 17,
            "humidity": 17,
            "ph": 7.4,
            "rainfall": 88
        }
    }
]

print("\n========== TESTING CROP MODEL ==========\n")

for test in crop_payloads:
    try:
        response = requests.post(
            f"{BASE_URL}/crop-predict",
            json=test["data"]
        )

        print(f"TEST: {test['name']}")
        print("INPUT:", test["data"])
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.json())
        print("-" * 60)

    except Exception as e:
        print(f"ERROR in {test['name']}:", str(e))


# -----------------------------
# Test Fertilizer Prediction Model
# -----------------------------
fertilizer_payload = {
    "Phosphorus (M3)": 25,
    "Organic Carbon": 1.2,
    "Field Size": 5,
    "Target Yield": 40,
    "Total Nitrogen": 60,
    "Potassium (exch.)": 30,
    "Crop Name": "Rice",
    "pH (water)": 6.5
}

print("\n========== TESTING FERTILIZER MODEL ==========\n")

try:
    response = requests.post(
        f"{BASE_URL}/predict/fertilizer",
        json=fertilizer_payload
    )

    print("INPUT:", fertilizer_payload)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.json())

except Exception as e:
    print("Fertilizer Model Error:", str(e))


# -----------------------------
# Test Disease Prediction Model
# -----------------------------
# Put a sample image in same folder
# Example: test_leaf.jpg

IMAGE_PATH = "test_leaf.jpg"

print("\n========== TESTING DISEASE MODEL ==========\n")

try:
    with open(IMAGE_PATH, "rb") as img_file:
        files = {
            "file": img_file
        }

        response = requests.post(
            f"{BASE_URL}/disease-predict",
            files=files
        )

        print("IMAGE:", IMAGE_PATH)
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.json())

except FileNotFoundError:
    print(f"Image file '{IMAGE_PATH}' not found.")
except Exception as e:
    print("Disease Model Error:", str(e))