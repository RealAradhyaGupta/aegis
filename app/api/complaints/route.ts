import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT 
        report_id as id,
        type,
        location,
        latitude,
        longitude,
        description,
        risk_level as risk,
        status,
        evidence_hash as hash,
        to_char(reported_at, 'YYYY-MM-DD HH24:MI') as time
       FROM complaints 
       ORDER BY reported_at DESC
       LIMIT 50`
    );
    return NextResponse.json({ complaints: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}