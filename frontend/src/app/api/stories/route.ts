import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { Story, CreateStoryInput } from '@/lib/types';
import prisma from '@/lib/prisma';

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

// GET /api/stories - Get all stories for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const stories = await prisma.story.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create a new story
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body); // Debug log

    const { title, content, configuration, userId, status } = body;

    if (!title || !content || !userId) {
      console.log('Missing required fields:', { title, content, userId }); // Debug log
      return NextResponse.json(
        { error: 'Title, content, and user ID are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // If user doesn't exist, create them
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: body.email || `${userId}@user.com`, // Fallback email if not provided
            company: body.company || null,
            role: body.role || null
          }
        });
      } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }
    }

    console.log('Creating story with data:', { // Debug log
      title,
      contentLength: content.length,
      configuration,
      userId
    });

    const story = await prisma.story.create({
      data: {
        title,
        content,
        configuration: configuration || {},
        userId,
        status: status || 'in_progress',
      },
    });

    console.log('Story created successfully:', story); // Debug log
    return NextResponse.json(story);
  } catch (error) {
    console.error('Detailed error saving story:', error); // Enhanced error logging
    return NextResponse.json(
      { error: 'Failed to save story', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 