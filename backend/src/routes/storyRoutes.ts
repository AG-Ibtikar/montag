import { Router } from 'express';
import {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  searchStories,
  getStoryStats,
  CreateStoryInput,
  UpdateStoryInput
} from '../services/storyService';

const router = Router();

// Get all stories for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      console.error('Missing userId in request query');
      return res.status(400).json({ error: 'User ID is required' });
    }
    console.log('Fetching stories for user:', userId);
    const stories = await getStories(userId);
    console.log('Successfully fetched stories:', { count: stories.length });
    res.json(stories);
  } catch (error) {
    console.error('Error getting stories:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      query: req.query
    });
    res.status(500).json({ 
      error: 'Failed to get stories', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get a single story
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    console.log('Fetching story:', { id, userId });
    const story = await getStory(id, userId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    console.error('Error getting story:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ error: 'Failed to get story', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Create a new story
router.post('/', async (req, res) => {
  try {
    const storyInput: CreateStoryInput = req.body;
    console.log('Creating story:', { 
      title: storyInput.title,
      userId: storyInput.user_id,
      status: storyInput.status,
      storyStyle: storyInput.story_style,
      acStyle: storyInput.ac_style
    });
    
    if (!storyInput.user_id || !storyInput.title || !storyInput.content) {
      console.error('Missing required fields:', { 
        hasUserId: !!storyInput.user_id,
        hasTitle: !!storyInput.title,
        hasContent: !!storyInput.content
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const story = await createStory(storyInput);
    console.log('Successfully created story:', { id: story.id });
    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Failed to create story', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Update a story
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.body.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    console.log('Updating story:', { id, userId, body: req.body });
    const storyInput: UpdateStoryInput = req.body;
    const story = await updateStory(id, userId, storyInput);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ error: 'Failed to update story', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete a story
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.body.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    console.log('Deleting story:', { id, userId });
    const success = await deleteStory(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting story:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ error: 'Failed to delete story', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Search stories
router.get('/search', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const term = req.query.term as string;
    if (!userId || !term) {
      return res.status(400).json({ error: 'User ID and search term are required' });
    }
    console.log('Searching stories:', { userId, term });
    const stories = await searchStories(userId, term);
    res.json(stories);
  } catch (error) {
    console.error('Error searching stories:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ error: 'Failed to search stories', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get story statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    console.log('Getting story stats for user:', userId);
    const stats = await getStoryStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error getting story stats:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    res.status(500).json({ error: 'Failed to get story statistics', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 