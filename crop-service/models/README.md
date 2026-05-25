This folder should contain the trained RandomForest model file named `RandomForest.pkl`.

For local development you can create a symlink or copy the file from the monolith:

  cp ../flask-backend/models/RandomForest.pkl ./RandomForest.pkl

The service will also fall back to the original monolith path if the file is not present locally.
