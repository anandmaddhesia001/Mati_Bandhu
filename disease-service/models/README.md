This folder should contain the trained PyTorch model file named `plant_disease_model.pth`.

For local development you can copy the file from the original monolith:

  cp ../flask-backend/models/plant_disease_model.pth ./plant_disease_model.pth

The service will fall back to the monolith path if the file is not present locally.
