export default {
    defects: {
        tornPages: 'Torn Pages',
        brokenSpine: 'Broken Spine',
        waterDamage: 'Water Damage',
        missingPages: 'Missing Pages',
        heavyWear: 'Heavy Wear',
        stainedPages: 'Stained Pages',
        looseBinding: 'Loose Binding',
        writtingMarks: 'Writing/Marks',
        foldedCorners: 'Folded Corners',
        fadedCover: 'Faded Cover'
    },
    alerts: {
        error: 'Error',
        noISBN: 'No ISBN found. Please scan a book first.',
        selectCollection: 'Please select a collection.',
        success: 'Success',
        bookAdded: 'Book added to collection',
        enterCollectionName: 'Please enter a valid collection name.',
        fetchError: 'Failed to fetch book info',
        enterPrice: 'Please enter a price or wait for the API response.',
        noCollectionsTitle: 'No Collections',
        noCollectionsMessage: 'You need to create a collection first. Would you like to create one now?',
        confirmDeleteTitle: "Delete Collection",
        confirmDeleteMessage: "Are you sure you want to delete the collection '{{collectionName}}'? This will remove {{bookCount}} books.",
        confirmEmptyDeleteMessage: "Are you sure you want to delete the empty collection '{{collectionName}}'?",
        exchangeRateError: "Warning: Failed to fetch current exchange rates. Using default rate (1 USD = 3.80 PLN). Please consider this in your valuation."
    },
    bookInfo: {
        isbn: 'ISBN',
        title: 'Title',
        authors: 'Authors',
        unknown: 'Unknown',
        finalPrice: 'Final Price',
        noISBN: 'No ISBN scanned',
        basePrice: 'Base Price',
        scannedISBN: 'Scanned ISBN',
        publisher: 'Publisher',
        description: 'Description',
        averagePrice: 'Average Price',
        loadingTitle: 'Loading title...',
        loadingAuthors: 'Loading authors...',
        loadingPublisher: 'Loading publisher...',
        loadingDescription: 'Loading description...'
    },
    labels: {
        selectCollection: 'Select Collection',
        selectDefects: 'Select Defects',
        collections: 'Collections',
        total: 'Total',
        noCollections: 'No collections yet',
        noBooksInCollection: 'No books in this collection',
        lastRateUpdate: "Rate updated at"
    },
    titles: {
        scan: 'Scan ISBN',
        analyzeCondition: 'Analyze Book Condition',
        manageCollections: 'Manage Collections'
    },
    buttons: {
        addToCollection: 'Add to Collection',
        addCollection: 'Add Collection',
        requestPermission: 'Request Camera Permission',
        price: 'Price',
        cancel: 'Cancel',
        useAPIPrices: 'Use API Prices',
        enterPriceManually: 'Enter Price Manually',
        continue: 'Continue',
        createCollection: 'Create Collection',
        createFirstCollection: 'Create Your First Collection',
        deleteCollection: "Delete Collection",
        confirm: "Confirm",
    },
    placeholders: {
        enterCollectionName: 'Enter collection name',
        enterPrice: 'Enter price manually'
    },
    status: {
        requestingPermission: 'Requesting camera permission...',
        noCameraAccess: 'No access to camera',
        scanning: "Scanning...",
    },
    currency: {
        symbol: '$',
        code: 'USD'
    }
};