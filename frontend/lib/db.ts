import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'aradhyagupta',
  host: 'localhost',
  database: 'aegis',
  password: process.env.DB_PASSWORD || undefined,
  port: 5432,
});

export default pool;