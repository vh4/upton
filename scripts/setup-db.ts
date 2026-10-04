import 'dotenv/config';
import { ensureDbSchema } from '../src/lib/db';

async function main() {
  console.log('--- [Upton] Initializing Database Schema ---');
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
      console.log(`[Target] PostgreSQL: ${isLocal ? 'Lokal Laptop (' + dbUrl + ')' : 'Remote Database'}`);
      await ensureDbSchema();
      console.log(`✓ Database schema berhasil dibuat/diverifikasi di PostgreSQL ${isLocal ? '(LOKAL SAJA)' : '(REMOTE)'}.`);
      
      if (isLocal) {
        console.log('\n⚠️ PERHATIAN: Script ini hanya membuat tabel di database PostgreSQL lokal laptop Anda (upton_db).');
        console.log('Agar Vercel dapat berfungsi, Anda harus menjalankan SQL di Supabase SQL Editor:');
        console.log('👉 https://supabase.com/dashboard/project/vqqjsehanioqcmzfxqex/sql/new\n');
      }
    } else {
      console.log('DATABASE_URL tidak diset.');
      console.log('Untuk Supabase Cloud, silakan jalankan query dari sql/schema.sql di Supabase SQL Editor:');
      console.log('👉 https://supabase.com/dashboard/project/vqqjsehanioqcmzfxqex/sql/new');
    }
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

main();
