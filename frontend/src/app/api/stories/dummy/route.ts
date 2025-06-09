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

// POST /api/stories/dummy - Create dummy stories
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id?.trim()) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const dummyStories = [
      {
        title: 'User Authentication',
        content: 'Implement secure user authentication system',
        config: {
          focus: 'Security',
          tone: 'Technical',
          format: 'Detailed',
          length: 'Medium'
        },
        user_id,
        status: 'completed',
        story_style: 'Scrum',
        ac_style: 'Given-When-Then'
      },
      {
        title: 'Profile Management',
        content: 'Allow users to manage their profile information',
        config: {
          focus: 'User Experience',
          tone: 'Professional',
          format: 'Detailed',
          length: 'Medium'
        },
        user_id,
        status: 'in_progress',
        story_style: 'Scrum',
        ac_style: 'Given-When-Then'
      }
    ];

    const result = await pool.query(
      `INSERT INTO stories (
        title, content, config, user_id, status, story_style, ac_style
      ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7),
      ($8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        dummyStories[0].title,
        dummyStories[0].content,
        dummyStories[0].config,
        dummyStories[0].user_id,
        dummyStories[0].status,
        dummyStories[0].story_style,
        dummyStories[0].ac_style,
        dummyStories[1].title,
        dummyStories[1].content,
        dummyStories[1].config,
        dummyStories[1].user_id,
        dummyStories[1].status,
        dummyStories[1].story_style,
        dummyStories[1].ac_style
      ]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return handleDbError(error);
  }
} 