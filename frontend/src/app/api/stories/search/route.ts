import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Helper function to handle database errors
const handleDbError = (error: any) => {
  console.error('Database error:', error);
  return NextResponse.json(
    { message: 'An error occurred while processing your request' },
    { status: 500 }
  );
};

// GET /api/stories/search - Search stories
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const term = request.nextUrl.searchParams.get('term');

    if (!userId?.trim() || !term?.trim()) {
      return NextResponse.json(
        { message: 'User ID and search term are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM stories 
      WHERE user_id = $1 
      AND (title ILIKE $2 OR content ILIKE $2)
      ORDER BY created_at DESC`,
      [userId, `%${term}%`]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return handleDbError(error);
  }
} 