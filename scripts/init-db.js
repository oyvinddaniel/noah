import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './database/app.db';
const schemaPath = join(__dirname, '..', 'database', 'schema.sql');

console.log('Initializing database...');
console.log('Database path:', dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const schema = readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('Database initialized successfully!');
db.close();
