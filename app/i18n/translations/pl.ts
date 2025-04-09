export default {
    defects: {
        tornPages: 'Podarte strony',
        brokenSpine: 'Uszkodzony grzbiet',
        waterDamage: 'Uszkodzenie wodne',
        missingPages: 'Brakujące strony',
        heavyWear: 'Silne zużycie',
        stainedPages: 'Poplamione strony',
        looseBinding: 'Luźne oprawienie',
        writtingMarks: 'Notatki/znaczki',
        foldedCorners: 'Zagięte rogi',
        fadedCover: 'Wyblakła okładka'
    },
    alerts: {
        error: 'Błąd',
        noISBN: 'Nie znaleziono ISBN. Proszę zeskanować książkę.',
        selectCollection: 'Proszę wybrać kolekcję.',
        success: 'Sukces',
        bookAdded: 'Książka dodana do kolekcji',
        enterCollectionName: 'Proszę wprowadzić poprawną nazwę kolekcji.',
        fetchError: 'Błąd pobierania informacji o książce',
        enterPrice: 'Proszę wprowadzić cenę lub poczekać na odpowiedź API.',
        confirmDeleteTitle: "Usuń kolekcję",
        confirmDeleteMessage: "Czy na pewno chcesz usunąć kolekcję '{{collectionName}}'? Spowoduje to usunięcie {{bookCount}} książek.",
        confirmEmptyDeleteMessage: "Czy na pewno chcesz usunąć pustą kolekcję '{{collectionName}}'?",
        exchangeRateError: "Uwaga: Nie udało się pobrać aktualnego kursu walut. Używamy kursu domyślnego (1 USD = 3.80 PLN). Proszę uwzględnić to w wycenie.",
        bookUpdated: "Książka zaktualizowana pomyślnie",
        lowBattery: 'Niski poziom baterii',
        lowBatteryCamera: 'Wydajność kamery może być ograniczona'
    },
    bookInfo: {
        isbn: 'ISBN',
        title: 'Tytuł',
        authors: 'Autorzy',
        unknown: 'Nieznany',
        finalPrice: 'Cena końcowa',
        noISBN: 'Brak zeskanowanego ISBN',
        basePrice: 'Cena pierwotna',
        scannedISBN: 'Zeskanowany ISBN',
        publisher: 'Wydawca',
        description: 'Opis',
        averagePrice: 'Średnia cena',
        loadingTitle: 'Wczytywanie tytułu...',
        loadingAuthors: 'Wczytywanie autorów...',
        loadingPublisher: 'Wczytywanie wydawcy...',
        loadingDescription: 'Wczytywanie opisu...',
        unknownTitle: 'Nieznany tytuł',
        originalPrice: "Cena pierwotna",
        priceNotAvailable: 'Cena niedostępna',
        suggestedPrice: 'Sugerowana cena', // lub 'Cena rekomendowana'
        noPrice: 'Brak dostępnej ceny',   // lub 'Cena niedostępna'
    },
    labels: {
        selectCollection: 'Wybierz kolekcję',
        selectDefects: 'Wybierz wady',
        collections: 'Kolekcje',
        total: 'Razem',
        noCollections: 'Brak kolekcji',
        noBooksInCollection: 'Brak książek w kolekcji',
        lastRateUpdate: "Kurs zaktualizowany o",
        noScanHistory: 'Brak historii skanowań',
        defects: "Wady"
    },
    titles: {
        scan: 'Skanuj ISBN',
        analyzeCondition: 'Analiza',
        manageCollections: 'Zarządzanie',
        history: 'Historia',
        editBook: "Analiza"
    },
    buttons: {
        addToCollection: 'Dodaj do kolekcji',
        addCollection: 'Dodaj kolekcję',
        requestPermission: 'Poproś o dostęp do kamery',
        price: 'Wyceń',
        cancel: 'Anuluj',
        useAPIPrices: 'Użyj cen z API',
        enterPriceManually: 'Wprowadź cenę ręcznie',
        continue: 'Kontynuuj',
        createCollection: "Utwórz kolekcję",
        createFirstCollection: "Utwórz swoją pierwszą kolekcję",
        deleteCollection: "Usuń kolekcję",
        confirm: "Potwierdź",
        clearHistory: 'Wyczyść historię',
        saveChanges: "Zapisz zmiany"
    },
    placeholders: {
        enterCollectionName: 'Wprowadź nazwę kolekcji',
        enterPrice: 'Wprowadź cenę ręcznie',
        searchHistory: 'Szukaj po ISBN/tytule'
    },
    status: {
        requestingPermission: 'Proszę czekać...',
        noCameraAccess: 'Brak dostępu do kamery',
        scanning: "Skanowanie...",
        found: 'Znalezione w bazie danych',
        notFound: 'Nieznalezione w bazie danych'
    }
};