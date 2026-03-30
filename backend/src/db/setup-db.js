const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'aegis',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function setup() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        report_id VARCHAR(20) UNIQUE NOT NULL,
        type VARCHAR(100) NOT NULL,
        location VARCHAR(200) NOT NULL,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        description TEXT,
        risk_level VARCHAR(10) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        evidence_hash VARCHAR(64),
        reported_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Complaints table created successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();