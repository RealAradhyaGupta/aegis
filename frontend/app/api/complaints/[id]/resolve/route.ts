import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query(
      `UPDATE complaints SET status = 'Resolved' WHERE report_id = $1`,
      [params.id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}