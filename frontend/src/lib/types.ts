// Story interface
export interface Story {
  id: number;
  title: string;
  content: string;
  config: {
    focus?: string;
    tone?: string;
    format?: string;
    length?: string;
    [key: string]: any;
  };
  user_id: string;
  status: string;
  story_style: string;
  ac_style: string;
  created_at: string;
  updated_at: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Story creation input
export interface CreateStoryInput {
  title: string;
  content: string;
  config?: Story['config'];
  user_id: string;
  status?: string;
  story_style?: string;
  ac_style?: string;
}

// Story update input
export interface UpdateStoryInput {
  title?: string;
  content?: string;
  config?: Story['config'];
  user_id: string;
  status?: string;
  story_style?: string;
  ac_style?: string;
}

// Story statistics
export interface StoryStats {
  total_stories: number;
  draft_count: number;
  published_count: number;
  archived_count: number;
} 