from keras.models import load_model

model = load_model("model.keras")
model.save("model.h5")  # Zapis do formatu HDF5 (kompatybilny z TFJS)
