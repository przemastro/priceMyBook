# 📚 Aestilibrum

<div align="center">

![Aestilibrum](https://img.shields.io/badge/Aestilibrum-Book%20Valuation%20App-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.74.5-green)
![Expo](https://img.shields.io/badge/Expo-51.0.4-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)

**Inteligentna aplikacja do wyceny i zarządzania kolekcjami książek**

[Instalacja](#-instalacja) •
[Funkcje](#-główne-funkcje) •
[Szybki start](#-szybki-start) •
[Budowanie](#-budowanie-aplikacji) •
[Wsparcie](#-wsparcie)

</div>

---

## 📖 O aplikacji

**Aestilibrum** to zaawansowana aplikacja mobilna dla kolekcjonerów książek, która umożliwia:

- 🏷️ Skanowanie kodów ISBN przy użyciu kamery
- 📊 Automatyczną wycenę książek z uwzględnieniem stanu i unikalności
- 📚 Zarządzanie kolekcjami z importem/exportem do CSV
- 💰 Analizę rynku książek z danymi z Amazon i Google Books

<div align="center">
  <img src="https://via.placeholder.com/300x600/4a90e2/ffffff?text=Scan+Screen" width="150" alt="Skanowanie" />
  <img src="https://via.placeholder.com/300x600/50c878/ffffff?text=Analysis" width="150" alt="Analiza" />
  <img src="https://via.placeholder.com/300x600/ff6b6b/ffffff?text=Collections" width="150" alt="Kolekcje" />
</div>

---

## ✨ Główne funkcje

### 🔍 Skanowanie i rozpoznawanie
- Skaner kodów kreskowych – błyskawiczne rozpoznawanie ISBN
- Integracja z API – Google Books i Amazon
- Tryb manualny – ręczne wprowadzanie danych książek

### 📈 Inteligentna wycena
- Analiza defektów – automatyczne wykrywanie uszkodzeń
- Czynniki unikalności – pierwsze wydania, autografy, edycje limitowane
- Algorytm rynkowy – dostosowanie ceny do podaży i popytu
- Raport szczegółowy – rozbicie wyceny na czynniki

### 📚 Zarządzanie kolekcjami
- Organizacja – wielopoziomowe kategorie i tagi
- Import / Export – obsługa plików CSV
- Statystyki – wartość kolekcji, sprzedane pozycje
- Status aukcji – śledzenie książek na platformach sprzedażowych

### 🌐 Dodatkowe funkcje
- Wielojęzyczność – 🇵🇱 polski, 🇬🇧 angielski
- Offline-first – dane przechowywane lokalnie
- Cache obrazów – szybki dostęp do okładek
- Responsywny UI – dopasowany do różnych ekranów

---

## 🚀 Szybki start

### Wymagania wstępne
- Node.js **18+**
- npm lub yarn
- Expo CLI
- Emulator lub fizyczne urządzenie Android / iOS

---

## 📥 Instalacja

### Klonowanie repozytorium
```bash
git clone <repo-url>
cd aestilibrum
```

### Instalacja zależności
```bash
npm install
# lub
yarn install
```

### Uruchomienie w trybie developerskim
```bash
npm start
```

### Po uruchomieniu:

a – Android emulator

i – iOS simulator

Skan QR – urządzenie fizyczne

## 📱 Uruchamianie na urządzeniu

### Android 

```bash
npm run android
```

### iOS (macOS)

```bash
npm run ios
```

## 🏗️ 🔧 Zaawansowana konfiguracja

## Klucze API (opcjonalnie)

Utwórz plik .env:

```bash
GOOGLE_BOOKS_API_KEY=your_key_here
```
## 📊 Limity systemu

 - Kolekcje: 10

 - Książki na kolekcję: 50

 - Łącznie książek: 200

 - Max obraz: 200 KB

 - Cache obrazów: 7 dni

## 🔒 Bezpieczeństwo

 - Dane lokalne (AsyncStorage)

 - Brak backendu

 - Minimalne uprawnienia

 - Automatyczne czyszczenie cache



