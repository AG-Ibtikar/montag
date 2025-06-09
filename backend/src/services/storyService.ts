import { query } from './dbService';

export interface Story {
  id: number;
  title: string;
  content: string;
  config: any;
  user_id: string;
  status: string;
  story_style: string;
  ac_style: string;
  created_at: Date;
  updated_at: Date;
  error?: any;
}

export interface CreateStoryInput {
  title: string;
  content: string;
  config?: any;
  user_id: string;
  status?: string;
  story_style?: string;
  ac_style?: string;
}

export interface UpdateStoryInput {
  title?: string;
  content?: string;
  config?: any;
  status?: string;
  story_style?: string;
  ac_style?: string;
}

export const getStories = async (userId: string): Promise<Story[]> => {
  const result = await query(
    'SELECT * FROM stories WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const getStory = async (id: number, userId: string): Promise<Story | null> => {
  const result = await query(
    'SELECT * FROM stories WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
};

export const createStory = async (story: CreateStoryInput): Promise<Story> => {
  const result = await query(
    `INSERT INTO stories (
      title, content, config, user_id, status, story_style, ac_style
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      story.title,
      story.content,
      story.config || {},
      story.user_id,
      story.status || 'draft',
      story.story_style || 'Scrum',
      story.ac_style || 'Given-When-Then'
    ]
  );
  return result.rows[0];
};

export const updateStory = async (id: number, userId: string, story: UpdateStoryInput): Promise<Story | null> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (story.title !== undefined) {
    updates.push(`title = $${paramCount}`);
    values.push(story.title);
    paramCount++;
  }
  if (story.content !== undefined) {
    updates.push(`content = $${paramCount}`);
    values.push(story.content);
    paramCount++;
  }
  if (story.config !== undefined) {
    updates.push(`config = $${paramCount}`);
    values.push(story.config);
    paramCount++;
  }
  if (story.status !== undefined) {
    updates.push(`status = $${paramCount}`);
    values.push(story.status);
    paramCount++;
  }
  if (story.story_style !== undefined) {
    updates.push(`story_style = $${paramCount}`);
    values.push(story.story_style);
    paramCount++;
  }
  if (story.ac_style !== undefined) {
    updates.push(`ac_style = $${paramCount}`);
    values.push(story.ac_style);
    paramCount++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updates.length === 0) {
    return getStory(id, userId);
  }

  values.push(id, userId);
  const result = await query(
    `UPDATE stories SET ${updates.join(', ')} 
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const deleteStory = async (id: number, userId: string): Promise<boolean> => {
  const result = await query(
    'DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rowCount > 0;
};

export const searchStories = async (userId: string, term: string): Promise<Story[]> => {
  const result = await query(
    `SELECT * FROM stories 
    WHERE user_id = $1 
    AND (title ILIKE $2 OR content ILIKE $2)
    ORDER BY created_at DESC`,
    [userId, `%${term}%`]
  );
  return result.rows;
};

export const getStoryStats = async (userId: string): Promise<any> => {
  const result = await query(
    `SELECT 
      COUNT(*) as total_stories,
      COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
      COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count
    FROM stories 
    WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}; 