import 'dotenv/config';
import { cleanupExpiredFiles } from '../src/lib/cleanup/service';

async function main() {
  console.log('--- [Upton] Starting Expired Files Cleanup ---');
  const startTime = Date.now();

  try {
    const result = await cleanupExpiredFiles();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`--- [Upton] Cleanup Finished in ${duration}s ---`);
    console.log(`  - Expired files detected: ${result.totalExpired}`);
    console.log(`  - Disk files removed:     ${result.filesDeleted}`);
    console.log(`  - DB records removed:       ${result.recordsDeleted}`);

    if (result.errors.length > 0) {
      console.warn(`  - Encountered ${result.errors.length} non-fatal error(s):`);
      result.errors.forEach((e) => console.warn(`    * ${e}`));
    }
    process.exit(0);
  } catch (error) {
    console.error('--- [Upton] Cleanup Failed with unexpected error ---', error);
    process.exit(1);
  }
}

main();
