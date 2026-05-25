import requests

BASE_URL = "http://127.0.0.1:7001"

tests = [
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

print("\n========== TESTING CROP SERVICE ==========\n")

for test in tests:

    try:

        response = requests.post(
            f"{BASE_URL}/crop-predict",
            json=test["data"]
        )

        print(f"TEST: {test['name']}")
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.json())
        print("-" * 60)

    except Exception as e:

        print(f"ERROR: {e}")