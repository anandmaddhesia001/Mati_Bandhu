import requests
import json

# Test the crop prediction endpoint with different inputs
url = 'http://127.0.0.1:7000/crop-predict'

test_cases = [
    {'nitrogen': 56, 'phosphorous': 67, 'pottasium': 45, 'temperature': 24.1, 'humidity': 65, 'ph': 6.5, 'rainfall': 220},
    {'nitrogen': 90, 'phosphorous': 42, 'pottasium': 43, 'temperature': 20.5, 'humidity': 80, 'ph': 6.5, 'rainfall': 200},
    {'nitrogen': 50, 'phosphorous': 30, 'pottasium': 30, 'temperature': 25, 'humidity': 60, 'ph': 6.0, 'rainfall': 150},
    {'nitrogen': 100, 'phosphorous': 50, 'pottasium': 50, 'temperature': 30, 'humidity': 90, 'ph': 7.0, 'rainfall': 250},
    {'nitrogen': 0, 'phosphorous': 0, 'pottasium': 0, 'temperature': 0, 'humidity': 0, 'ph': 0, 'rainfall': 0}
]

for i, data in enumerate(test_cases, 1):
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f'Test {i}: Status {response.status_code}')
        if response.status_code == 200:
            result = response.json()
            print(f'  Input: {data}')
            print(f'  Prediction: {result.get("prediction", "No prediction")}')

            # Check if prediction varies
            if i == 1:
                first_prediction = result.get("prediction")
            elif result.get("prediction") != first_prediction:
                print('  ✓ Prediction varies!')
        else:
            print(f'  Error: {response.text}')
        print()
    except Exception as e:
        print(f'Test {i}: Exception - {str(e)}')
        print()