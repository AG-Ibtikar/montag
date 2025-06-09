import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

// Initialize Firestore database structure
export const initializeFirestore = async () => {
  try {
    // Create stories collection with initial document
    const storiesRef = collection(db, 'stories');
    const initialStoryRef = doc(storiesRef, '_initial');
    
    // Check if initial document exists
    const initialDoc = await getDoc(initialStoryRef);
    
    if (!initialDoc.exists()) {
      // Create initial document with metadata
      await setDoc(initialDoc.ref, {
        _type: 'metadata',
        createdAt: new Date(),
        version: '1.0.0',
        description: 'Initial document for stories collection'
      });
      
      console.log('Firestore database initialized successfully');
    } else {
      console.log('Firestore database already initialized');
    }

    // Create required indexes (these will be created automatically when queries are made)
    // 1. userId + createdAt (for story listing)
    // 2. userId + status (for filtering by status)
    // 3. userId + config.focus (for filtering by focus)
    // 4. userId + config.tone (for filtering by tone)

    return true;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
};

// Function to validate story data structure
export const validateStoryData = (data: any) => {
  const requiredFields = [
    'title',
    'content',
    'config',
    'userId',
    'status',
    'createdAt'
  ];

  const requiredConfigFields = [
    'focus',
    'tone',
    'format',
    'length'
  ];

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Check config fields
  if (!data.config || typeof data.config !== 'object') {
    throw new Error('Invalid config object');
  }

  for (const field of requiredConfigFields) {
    if (!data.config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }

  // Validate status
  const validStatuses = ['completed', 'in_progress', 'failed'];
  if (!validStatuses.includes(data.status)) {
    throw new Error(`Invalid status: ${data.status}`);
  }

  return true;
};

// Function to create a new story document
export const createStoryDocument = async (storyData: any) => {
  try {
    // Validate story data
    validateStoryData(storyData);

    // Add metadata
    const storyWithMetadata = {
      ...storyData,
      _type: 'story',
      _createdAt: new Date(),
      _updatedAt: new Date(),
      _version: '1.0.0'
    };

    return storyWithMetadata;
  } catch (error) {
    console.error('Error creating story document:', error);
    throw error;
  }
};

// Function to update a story document
export const updateStoryDocument = async (storyData: any) => {
  try {
    // Validate story data
    validateStoryData(storyData);

    // Add metadata
    const storyWithMetadata = {
      ...storyData,
      _updatedAt: new Date()
    };

    return storyWithMetadata;
  } catch (error) {
    console.error('Error updating story document:', error);
    throw error;
  }
}; 