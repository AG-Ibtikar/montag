import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { UpdateStoryInput } from '@/lib/types';

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

// PUT /api/stories/[id] - Update a story
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const story: UpdateStoryInput = await request.json();

    // Validate required fields
    if (!story.user_id?.trim()) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if story exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM stories WHERE id = $1 AND user_id = $2',
      [id, story.user_id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Story not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update story
    const result = await pool.query(
      `UPDATE stories
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          config = COALESCE($3, config),
          status = COALESCE($4, status),
          story_style = COALESCE($5, story_style),
          ac_style = COALESCE($6, ac_style),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *`,
      [
        story.title,
        story.content,
        story.config,
        story.status,
        story.story_style,
        story.ac_style,
        id,
        story.user_id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return handleDbError(error);
  }
}

// DELETE /api/stories/[id] - Delete a story
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { user_id } = await request.json();

    if (!user_id?.trim()) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Story not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Story deleted successfully' });
  } catch (error) {
    return handleDbError(error);
  }
} 