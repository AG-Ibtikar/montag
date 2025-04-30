'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc, updateDoc, writeBatch, deleteDoc, limit, startAfter, DocumentSnapshot, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Timestamp } from 'firebase/firestore';

// Log environment variables for debugging
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not Set',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not Set',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not Set',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not Set',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not Set',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not Set',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'Set' : 'Not Set'
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Add connection status tracking
let isConnected = false;

// Initialize Firebase with connection monitoring
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

// Monitor connection status using onSnapshot
const connectionRef = doc(db, '_health', 'connection');
onSnapshot(connectionRef, 
  () => {
    isConnected = true;
    console.log('Firebase connected successfully');
  },
  (error) => {
    console.error('Firebase connection error:', error);
    isConnected = false;
  }
);

// Connection status check function
const checkConnection = async (): Promise<boolean> => {
  if (!isConnected) {
    try {
      // Try a simple read operation to check connection
      await getDoc(connectionRef);
      isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to establish connection:', error);
      return false;
    }
  }
  return true;
};

// Retry utility function
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check connection before each attempt
      if (!await checkConnection()) {
        throw new Error('No connection to Firebase');
      }
      
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  throw lastError;
};

// Enhanced error logging
const logError = (operation: string, error: any, context?: any) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    operation,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: 'code' in error ? (error as any).code : undefined
    } : error,
    context,
    connectionStatus: isConnected
  };
  
  console.error('Firebase Operation Error:', errorDetails);
  return errorDetails;
};

let analytics;

try {
  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize collections
export const storiesCollection = collection(db, 'stories');

export interface StoryConfig {
  industry: string;
  companySize: string;
  role: string;
  experience: string;
  focus: string;
  tone: string;
  format: string;
  length: string;
}

export interface Story {
  id?: string;
  title: string;
  content: string;
  config: StoryConfig;
  userId: string;
  status: 'completed' | 'in_progress' | 'failed';
  createdAt: Timestamp;
  error?: StoryGenerationError;
  generationAttempts?: number;
  lastAttemptAt?: any;
  storyStyle: string;
  acStyle: string;
}

// Custom error types for better error handling
export class FirebaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// Enhanced validation function
const validateStory = (story: Omit<Story, 'id' | 'createdAt'>) => {
  const errors: string[] = [];

  // Required fields validation
  if (!story.title?.trim()) errors.push('Title is required');
  if (!story.content?.trim()) errors.push('Content is required');
  if (!story.userId?.trim()) errors.push('User ID is required');

  // Config validation
  if (!story.config) {
    errors.push('Configuration is required');
  } else {
    const { focus, tone, format, length } = story.config;
    if (!focus?.trim()) errors.push('Focus is required');
    if (!tone?.trim()) errors.push('Tone is required');
    if (!format?.trim()) errors.push('Format is required');
    if (!length?.trim()) errors.push('Length is required');
  }

  // Status validation
  if (!story.status || !['completed', 'in_progress', 'failed'].includes(story.status)) {
    errors.push('Invalid status');
  }

  // Content length validation
  if (story.content.length < 50) {
    errors.push('Content must be at least 50 characters long');
  }

  if (errors.length > 0) {
    throw new FirebaseError(errors.join(', '), 'INVALID_DATA', 400);
  }
};

// Function to get stories for the current user
export const getStories = async () => {
  return withRetry(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new FirebaseError('User must be authenticated to fetch stories', 'UNAUTHENTICATED', 401);
      }

      const q = query(
        storiesCollection,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logError('getStories', error, { userId: auth.currentUser?.uid });
      if (error instanceof FirebaseError) {
        throw error;
      }
      throw new FirebaseError(
        'Failed to fetch stories. Please try again later.',
        'FETCH_ERROR',
        500
      );
    }
  });
};

// Check if Stories collection exists and create it if it doesn't
export const ensureStoriesCollection = async () => {
  try {
    // Try to get a document from the collection
    const q = query(storiesCollection, limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Stories collection exists');
      return true;
    }

    // If collection is empty, create a dummy document to ensure collection exists
    const dummyDoc = {
      title: 'Dummy Story',
      content: 'This is a dummy story to initialize the collection',
      config: {
        focus: 'dummy',
        tone: 'dummy',
        format: 'dummy',
        length: 'dummy'
      },
      userId: 'system',
      status: 'completed' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      generationAttempts: 0,
      lastAttemptAt: serverTimestamp(),
      storyStyle: 'dummy',
      acStyle: 'dummy'
    };

    await addDoc(storiesCollection, dummyDoc);
    console.log('Stories collection created');
    return true;
  } catch (error) {
    console.error('Error checking/creating Stories collection:', error);
    throw new FirebaseError(
      'Failed to initialize Stories collection',
      'INIT_ERROR',
      500
    );
  }
};

// Update saveStory to ensure collection exists
export const saveStory = async (story: Omit<Story, 'id' | 'createdAt'>): Promise<string> => {
  return withRetry(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new FirebaseError('User must be authenticated to save stories', 'UNAUTHENTICATED', 401);
      }

      // Ensure Stories collection exists
      await ensureStoriesCollection();

      validateStory(story);

      const storyData = {
        ...story,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'completed' as const,
        generationAttempts: 0,
        lastAttemptAt: serverTimestamp()
      };
      
      const docRef = await addDoc(storiesCollection, storyData);
      return docRef.id;
    } catch (error) {
      logError('saveStory', error, { 
        userId: auth.currentUser?.uid,
        storyTitle: story.title,
        storyConfig: story.config
      });
      
      if (error instanceof Error) {
        if ('code' in error) {
          const firebaseError = error as { code: string; message: string };
          switch (firebaseError.code) {
            case 'permission-denied':
              throw new FirebaseError('Permission denied. Please check your authentication status.', 'PERMISSION_DENIED', 403);
            case 'unauthenticated':
              throw new FirebaseError('Please sign in to save stories.', 'UNAUTHENTICATED', 401);
            case 'invalid-argument':
              throw new FirebaseError('Invalid story data provided.', 'INVALID_DATA', 400);
            case 'failed-precondition':
              throw new FirebaseError('Operation failed. Please try again.', 'FAILED_PRECONDITION', 400);
            case 'unavailable':
              throw new FirebaseError('Service temporarily unavailable. Please try again.', 'UNAVAILABLE', 503);
            default:
              throw new FirebaseError('Failed to save story. Please try again.', 'SAVE_ERROR', 500);
          }
        }
      }
      
      throw new FirebaseError(
        'Failed to save story. Please try again.',
        'SAVE_ERROR',
        500
      );
    }
  });
};

// Function to update a story
export const updateStory = async (storyId: string, updates: Partial<Omit<Story, 'id' | 'createdAt' | 'userId'>>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new FirebaseError('User must be authenticated to update stories', 'UNAUTHENTICATED', 401);
    }

    // Get the existing story to verify ownership
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (!storySnap.exists()) {
      throw new FirebaseError('Story not found', 'NOT_FOUND', 404);
    }

    const storyData = storySnap.data() as Story;
    if (storyData.userId !== user.uid) {
      throw new FirebaseError('Unauthorized to update this story', 'UNAUTHORIZED', 403);
    }

    // Validate the updated data
    const updatedStory = { ...storyData, ...updates };
    validateStory(updatedStory);

    // Update the story
    await updateDoc(storyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return storyId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw error;
    }
    console.error('Error updating story:', error);
    throw new FirebaseError(
      'Failed to update story',
      'UPDATE_ERROR',
      error instanceof Error && 'code' in error ? 500 : 500
    );
  }
};

// Function to get a single story
export const getStory = async (storyId: string): Promise<Story | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new FirebaseError('User must be authenticated to get stories', 'UNAUTHENTICATED', 401);
    }

    const storyDoc = await getDoc(doc(db, 'stories', storyId));
    if (!storyDoc.exists()) {
      throw new FirebaseError('Story not found', 'NOT_FOUND', 404);
    }

    const storyData = storyDoc.data() as Story;
    if (storyData.userId !== user.uid) {
      throw new FirebaseError('Unauthorized to access this story', 'UNAUTHORIZED', 403);
    }

    return {
      id: storyDoc.id,
      ...storyData
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw error;
    }
    console.error('Error getting story:', error);
    throw new FirebaseError(
      'Failed to get story',
      'FETCH_ERROR',
      error instanceof Error && 'code' in error ? 500 : 500
    );
  }
};

// Add new error types for story generation
export interface StoryGenerationError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  retryCount?: number;
}

// Function to create a story with initial status and error tracking
export const createStoryWithStatus = async (
  story: Omit<Story, 'id' | 'createdAt' | 'status'>,
  status: 'in_progress' | 'failed' = 'in_progress',
  error?: StoryGenerationError
) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new FirebaseError('User must be authenticated to create stories', 'UNAUTHENTICATED', 401);
    }

    // Create initial story document with error tracking
    const docRef = await addDoc(storiesCollection, {
      ...story,
      userId: user.uid,
      status,
      createdAt: serverTimestamp(),
      error: error ? {
        ...error,
        timestamp: new Date().toISOString()
      } : null,
      generationAttempts: 0,
      lastAttemptAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw error;
    }
    console.error('Error creating story:', error);
    throw new FirebaseError(
      'Failed to create story',
      'CREATE_ERROR',
      error instanceof Error && 'code' in error ? 500 : 500
    );
  }
};

// Function to update story generation status with detailed error tracking
export const updateStoryStatus = async (
  storyId: string,
  status: 'completed' | 'in_progress' | 'failed',
  error?: StoryGenerationError
) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new FirebaseError('User must be authenticated to update story status', 'UNAUTHENTICATED', 401);
    }

    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (!storySnap.exists()) {
      throw new FirebaseError('Story not found', 'NOT_FOUND', 404);
    }

    const storyData = storySnap.data() as Story;
    if (storyData.userId !== user.uid) {
      throw new FirebaseError('Unauthorized to update this story', 'UNAUTHORIZED', 403);
    }

    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
      lastAttemptAt: serverTimestamp()
    };

    if (error) {
      updates.error = {
        ...error,
        timestamp: new Date().toISOString()
      };
      updates.generationAttempts = (storyData.generationAttempts || 0) + 1;
    }

    await updateDoc(storyRef, updates);
    return storyId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw error;
    }
    console.error('Error updating story status:', error);
    throw new FirebaseError(
      'Failed to update story status',
      'UPDATE_ERROR',
      error instanceof Error && 'code' in error ? 500 : 500
    );
  }
};

// Function to get story generation status
export const getStoryGenerationStatus = async (storyId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new FirebaseError('User must be authenticated to get story status', 'UNAUTHENTICATED', 401);
    }

    const docRef = doc(db, 'stories', storyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new FirebaseError('Story not found', 'NOT_FOUND', 404);
    }

    const storyData = docSnap.data() as Story;
    if (storyData.userId !== user.uid) {
      throw new FirebaseError('Unauthorized to access this story', 'UNAUTHORIZED', 403);
    }

    return {
      status: storyData.status,
      error: storyData.error,
      generationAttempts: storyData.generationAttempts || 0,
      lastAttemptAt: storyData.lastAttemptAt
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw error;
    }
    console.error('Error getting story status:', error);
    throw new FirebaseError(
      'Failed to get story status',
      'FETCH_ERROR',
      error instanceof Error && 'code' in error ? 500 : 500
    );
  }
};

// Batch operations
export const batchSaveStories = async (stories: Omit<Story, 'id' | 'createdAt'>[]): Promise<string[]> => {
  try {
    const batch = writeBatch(db);
    const storyIds: string[] = [];

    stories.forEach(story => {
      validateStory(story);
      const storyRef = doc(collection(db, 'stories'));
      batch.set(storyRef, {
        ...story,
        createdAt: serverTimestamp(),
        status: 'completed' as const
      });
      storyIds.push(storyRef.id);
    });

    await batch.commit();
    return storyIds;
  } catch (error) {
    console.error('Error batch saving stories:', error);
    throw new Error('Failed to batch save stories');
  }
};

export const batchDeleteStories = async (storyIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    storyIds.forEach(id => {
      const storyRef = doc(db, 'stories', id);
      batch.delete(storyRef);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error batch deleting stories:', error);
    throw new Error('Failed to batch delete stories');
  }
};

// Pagination support
export const getStoriesPaginated = async (
  userId: string,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ stories: Story[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const stories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Story));

    return {
      stories,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
  } catch (error) {
    console.error('Error getting paginated stories:', error);
    throw new Error('Failed to get paginated stories');
  }
};

// Search stories
export const searchStories = async (
  userId: string,
  searchTerm: string
): Promise<Story[]> => {
  try {
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(storiesQuery);
    const stories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Story));

    // Client-side search for better flexibility
    return stories.filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.config.focus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.config.tone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching stories:', error);
    throw new Error('Failed to search stories');
  }
};

// Story statistics
export const getStoryStats = async (userId: string): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  byFocus: Record<string, number>;
  byTone: Record<string, number>;
}> => {
  try {
    const storiesQuery = query(
      collection(db, 'stories'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(storiesQuery);
    const stories = querySnapshot.docs.map(doc => doc.data() as Story);

    const stats = {
      total: stories.length,
      completed: 0,
      inProgress: 0,
      failed: 0,
      byFocus: {} as Record<string, number>,
      byTone: {} as Record<string, number>
    };

    stories.forEach(story => {
      // Count by status
      stats[story.status]++;
      
      // Count by focus
      stats.byFocus[story.config.focus] = (stats.byFocus[story.config.focus] || 0) + 1;
      
      // Count by tone
      stats.byTone[story.config.tone] = (stats.byTone[story.config.tone] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting story stats:', error);
    throw new Error('Failed to get story statistics');
  }
};

export { app, auth, db, analytics }; 