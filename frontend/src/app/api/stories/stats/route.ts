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

// GET /api/stories/stats - Get story statistics
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId?.trim()) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN story_style = 'Scrum' THEN 1 END) as scrum_stories,
        COUNT(CASE WHEN story_style = 'Kanban' THEN 1 END) as kanban_stories,
        COUNT(CASE WHEN ac_style = 'Given-When-Then' THEN 1 END) as gwt_stories,
        COUNT(CASE WHEN ac_style = 'User Story' THEN 1 END) as user_stories
      FROM stories
      WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json(stats.rows[0]);
  } catch (error) {
    return handleDbError(error);
  }
} 