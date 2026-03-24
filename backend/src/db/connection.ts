import { Pool } from 'pg';

// Create pool from DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mission_control',
  max: 20,                    // max connections
  idleTimeoutMillis: 30000,   // close idle clients after 30s
  connectionTimeoutMillis: 2000,
});

// Error handlers
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Exports for testing
export const connectDB = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected at:', result.rows[0].now);
  } finally {
    client.release();
  }
};

export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

export const closePool = async (): Promise<void> => {
  await pool.end();
};

export default pool;
