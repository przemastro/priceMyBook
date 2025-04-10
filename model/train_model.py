import tensorflow as tf
from tensorflow.keras import layers, models, utils
import numpy as np
import os
import cv2
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt
import gc

# Parametry
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
NUM_CLASSES = 10  # 10 typów wad

# Ścieżki do danych
dataset_path = "book_defects_dataset"

# Funkcja do wizualizacji wyników treningu
def plot_training_history(history):
    plt.figure(figsize=(15, 5))

    # Accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend()

    # Loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()

    plt.tight_layout()
    plt.savefig('training_metrics.png')
    plt.close()

# Ładowanie danych z obsługą błędów
def load_data():
    images = []
    labels = []
    class_names = sorted([d for d in os.listdir(dataset_path)
                          if os.path.isdir(os.path.join(dataset_path, d))])

    print(f"Found {len(class_names)} classes: {class_names}")

    for class_idx, class_name in enumerate(class_names):
        class_dir = os.path.join(dataset_path, class_name)
        print(f"Loading {class_name}...")

        for img_name in os.listdir(class_dir):
            img_path = os.path.join(class_dir, img_name)
            try:
                img = cv2.imread(img_path)
                if img is None:
                    continue

                img = cv2.cvtColor(cv2.resize(img, (IMG_SIZE, IMG_SIZE)), cv2.COLOR_BGR2RGB)
                images.append(img)
                labels.append(class_idx)
            except Exception as e:
                print(f"Error processing {img_path}: {str(e)}")

    if not images:
        raise ValueError("No images found in the dataset directory")

    return np.array(images), np.array(labels), class_names

# Główny proces
def main():
    # Ładowanie danych
    print("Loading data...")
    X, y, class_names = load_data()
    print(f"Loaded {len(X)} images")

    # Przygotowanie danych
    X = X.astype('float32') / 255.0
    y = utils.to_categorical(y, NUM_CLASSES)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Augmentacja danych
    train_datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    # Budowa modelu
    def build_model():
        model = models.Sequential([
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),

            layers.GlobalAveragePooling2D(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(NUM_CLASSES, activation='softmax')
        ])

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'Precision', 'Recall']
        )
        return model

    # Trenowanie modelu
    print("Building model...")
    model = build_model()
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ModelCheckpoint('best_model.h5', save_best_only=True)  # Zmienione na .h5
    ]

    print("Training model...")
    history = model.fit(
        train_datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        epochs=EPOCHS,
        validation_data=(X_test, y_test),
        callbacks=callbacks,
        verbose=1
    )

    # Ewaluacja
    print("Evaluating model...")
    results = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {results[1]:.4f}")
    print(f"Test Precision: {results[2]:.4f}")
    print(f"Test Recall: {results[3]:.4f}")

    # Raport klasyfikacji
    y_pred = np.argmax(model.predict(X_test), axis=1)
    y_true = np.argmax(y_test, axis=1)
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))

    # Wizualizacja
    plot_training_history(history)

    # Zapisywanie modelu
    print("Saving final model...")
    model.save('book_defects_model.h5')  # Zmienione na .h5
    with open('class_names.txt', 'w') as f:
        f.write('\n'.join(class_names))

    print("Process completed successfully!")

if __name__ == "__main__":
    main()
