import 'dotenv/config';
import { ensureDbSchema } from '../src/lib/db';

async function main() {
  console.log('--- [Upton] Initializing Database Schema ---');
  try {
    await ensureDbSchema();
    console.log('✓ Database schema created / verified successfully in PostgreSQL.');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

main();
