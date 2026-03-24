import { promises as fs } from 'fs';
import * as path from 'path';
import pool from '../connection';

/**
 * Migration runner that executes SQL files in order
 * Reads all .sql files from the migrations directory and runs them sequentially
 */

export const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    // Get all SQL files in migrations directory
    const migrationsDir = path.join(__dirname);
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter((f) => f.endsWith('.sql'))
      .sort(); // Sort to ensure order (001, 002, etc.)

    if (sqlFiles.length === 0) {
      console.log('✅ No migration files found');
      return;
    }

    console.log(`🔄 Running ${sqlFiles.length} migration(s)...`);

    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`📄 Executing: ${file}`);

      const sql = await fs.readFile(filePath, 'utf-8');

      try {
        await client.query(sql);
        console.log(`✅ Migration completed: ${file}`);
      } catch (error) {
        // Ignore "already exists" errors for idempotent migrations
        if (
          error instanceof Error &&
          (error.message.includes('already exists') ||
            error.message.includes('duplicate key'))
        ) {
          console.log(`⚠️  Migration already applied: ${file}`);
        } else {
          console.error(`❌ Migration failed: ${file}`, error);
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully');
  } finally {
    client.release();
  }
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migrations complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
