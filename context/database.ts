import { openDatabaseSync } from 'expo-sqlite';

interface SQLResultSet {
    insertId?: number;
    rowsAffected: number;
    rows: {
        _array: any[];
        length: number;
        item: (index: number) => any;
    };
}

interface Collection {
    id: number;
    name: string;
    created_at: string;
}

interface Book {
    id: number;
    collection_id: number;
    isbn: string;
    title: string;
    authors: string;
    price: number;
    displayPrice: string;
    condition?: string;
    defects?: string[];
    created_at: string;
}

class AppDatabase {
    private db: any;

    constructor() {
        this.db = openDatabaseSync('priceMyBook.db');
        this.initDB();
    }

    private async initDB(): Promise<void> {
        await this.execTransaction([
            `CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            `,
            `CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                collection_id INTEGER,
                isbn TEXT NOT NULL,
                title TEXT NOT NULL,
                authors TEXT,
                price REAL NOT NULL,
                displayPrice TEXT NOT NULL,
                condition TEXT,
                defects TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
            `,
            `CREATE INDEX IF NOT EXISTS idx_books_collection ON books(collection_id)`
        ]);
    }

    public async execTransaction(queries: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.transaction(
                (tx: any) => {
                    queries.forEach(q => tx.executeSql(q));
                },
                (err: any) => reject(err),
                () => resolve()
            );
        });
    }

    public async query<T>(sql: string, args: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx: any) => {
                tx.executeSql(
                    sql,
                    args,
                    (_: any, result: any) => resolve(result.rows._array),
                    (_: any, error: any) => {
                        reject(error);
                        return true;
                    }
                );
            });
        });
    }

    // Collections CRUD
    public async getCollections(): Promise<Collection[]> {
        return this.query<Collection>('SELECT * FROM collections ORDER BY created_at DESC');
    }

    public async addCollection(name: string): Promise<number> {
        const result = await this.query<SQLResultSet>(
            'INSERT INTO collections (name) VALUES (?)',
            [name]
        );
        return result[0].insertId!;
    }

    public async deleteCollection(id: number): Promise<void> {
        await this.query('DELETE FROM collections WHERE id = ?', [id]);
    }

    // Books CRUD
    public async getBooksByCollection(collectionId: number): Promise<Book[]> {
        return this.query<Book>(
            'SELECT * FROM books WHERE collection_id = ? ORDER BY created_at DESC',
            [collectionId]
        );
    }

    public async addBook(book: Omit<Book, 'id' | 'created_at'>): Promise<number> {
        const result = await this.query<SQLResultSet>(
            `INSERT INTO books 
             (collection_id, isbn, title, authors, price, displayPrice, condition, defects)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                book.collection_id,
                book.isbn,
                book.title,
                book.authors,
                book.price,
                book.displayPrice,
                book.condition,
                book.defects ? JSON.stringify(book.defects) : null
            ]
        );
        return result[0].insertId!;
    }

    public async deleteBook(id: number): Promise<void> {
        await this.query('DELETE FROM books WHERE id = ?', [id]);
    }
}

export const db = new AppDatabase();
export type { Collection, Book };