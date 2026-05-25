import requests

BASE_URL = "http://127.0.0.1:7002"

IMAGE_PATH = "test_leaf.jpg"

print("\n========== TESTING DISEASE SERVICE ==========\n")

try:

    with open(IMAGE_PATH, "rb") as img:

        files = {
            "file": img
        }

        response = requests.post(
            f"{BASE_URL}/disease-predict",
            files=files
        )

        print("STATUS:", response.status_code)
        print("RESPONSE:", response.json())

except FileNotFoundError:

    print("ERROR: test_leaf.jpg not found")

except Exception as e:

    print("ERROR:", str(e))