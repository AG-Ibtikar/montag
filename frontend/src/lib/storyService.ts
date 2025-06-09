import { Story, CreateStoryInput, UpdateStoryInput, StoryStats } from './types';

const API_BASE = '/api/stories';

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
};

// Helper function to validate story input
const validateStoryInput = (input: CreateStoryInput | UpdateStoryInput) => {
  if (!input.user_id?.trim()) {
    throw new Error('User ID is required');
  }
  if ('title' in input && !input.title?.trim()) {
    throw new Error('Title is required');
  }
  if ('content' in input && !input.content?.trim()) {
    throw new Error('Content is required');
  }
};

// Get all stories for a user
export const getStories = async (userId: string): Promise<Story[]> => {
  if (!userId?.trim()) {
    throw new Error('User ID is required');
  }
  const response = await fetch(`${API_BASE}?userId=${encodeURIComponent(userId)}`);
  return handleApiError(response);
};

// Get a single story by ID
export const getStory = async (id: number, userId: string): Promise<Story> => {
  if (!id || !userId?.trim()) {
    throw new Error('Story ID and User ID are required');
  }
  const response = await fetch(`${API_BASE}/${id}?userId=${encodeURIComponent(userId)}`);
  return handleApiError(response);
};

// Create a new story
export const createStory = async (story: CreateStoryInput): Promise<Story> => {
  validateStoryInput(story);
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(story),
  });
  return handleApiError(response);
};

// Update a story
export const updateStory = async (id: number, story: UpdateStoryInput): Promise<Story> => {
  validateStoryInput(story);
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(story),
  });
  return handleApiError(response);
};

// Delete a story
export const deleteStory = async (id: number, userId: string): Promise<void> => {
  if (!id || !userId?.trim()) {
    throw new Error('Story ID and User ID are required');
  }
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  await handleApiError(response);
};

// Search stories
export const searchStories = async (userId: string, term: string): Promise<Story[]> => {
  if (!userId?.trim() || !term?.trim()) {
    throw new Error('User ID and search term are required');
  }
  const response = await fetch(
    `${API_BASE}/search?userId=${encodeURIComponent(userId)}&term=${encodeURIComponent(term)}`
  );
  return handleApiError(response);
};

// Get story statistics
export const getStoryStats = async (userId: string): Promise<StoryStats> => {
  if (!userId?.trim()) {
    throw new Error('User ID is required');
  }
  const response = await fetch(`${API_BASE}/stats?userId=${encodeURIComponent(userId)}`);
  return handleApiError(response);
}; 