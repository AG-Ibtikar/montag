import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { Story } from './firebase';

// Migration version tracking
const MIGRATION_VERSION = '1.0.0';

// Migration history interface
interface MigrationHistory {
  version: string;
  timestamp: Date;
  description: string;
  status: 'completed' | 'failed';
  error?: string;
}

// Migration function type
type MigrationFunction = () => Promise<void>;

// Migration registry
const migrations: Record<string, MigrationFunction> = {
  // Add new migrations here as needed
  '1.0.0': async () => {
    const batch = writeBatch(db);
    const storiesRef = collection(db, 'stories');
    const storiesSnapshot = await getDocs(storiesRef);

    storiesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Add missing fields with default values
      const updatedData = {
        ...data,
        config: {
          focus: data.config?.focus || 'General',
          tone: data.config?.tone || 'Neutral',
          format: data.config?.format || 'User Story',
          length: data.config?.length || 'Medium'
        },
        storyStyle: data.storyStyle || 'Standard',
        acStyle: data.acStyle || 'Standard',
        _version: MIGRATION_VERSION,
        _updatedAt: new Date()
      };

      batch.update(doc.ref, updatedData);
    });

    await batch.commit();
  }
};

// Function to run migrations
export const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Get all stories
    const storiesRef = collection(db, 'stories');
    const storiesSnapshot = await getDocs(storiesRef);
    
    // Check if any stories need migration
    const needsMigration = storiesSnapshot.docs.some(doc => {
      const data = doc.data();
      return !data._version || data._version !== MIGRATION_VERSION;
    });

    if (!needsMigration) {
      console.log('No migrations needed');
      return;
    }

    // Run migrations
    for (const [version, migrationFn] of Object.entries(migrations)) {
      try {
        console.log(`Running migration ${version}...`);
        await migrationFn();
        console.log(`Migration ${version} completed successfully`);
      } catch (error) {
        console.error(`Migration ${version} failed:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Function to validate story data structure
export const validateStoryStructure = (data: any): boolean => {
  const requiredFields = [
    'title',
    'content',
    'config',
    'userId',
    'status',
    'createdAt',
    '_version'
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
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check config fields
  if (!data.config || typeof data.config !== 'object') {
    console.error('Invalid config object');
    return false;
  }

  for (const field of requiredConfigFields) {
    if (!data.config[field]) {
      console.error(`Missing required config field: ${field}`);
      return false;
    }
  }

  return true;
};

// Function to fix story data structure
export const fixStoryStructure = async (storyId: string) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }

    const data = storyDoc.data();
    const fixedData = {
      ...data,
      config: {
        focus: data.config?.focus || 'General',
        tone: data.config?.tone || 'Neutral',
        format: data.config?.format || 'User Story',
        length: data.config?.length || 'Medium'
      },
      storyStyle: data.storyStyle || 'Standard',
      acStyle: data.acStyle || 'Standard',
      _version: MIGRATION_VERSION,
      _updatedAt: new Date()
    };

    await updateDoc(storyRef, fixedData);
    return true;
  } catch (error) {
    console.error('Error fixing story structure:', error);
    return false;
  }
};

// Function to check database health
export const checkDatabaseHealth = async () => {
  try {
    const storiesRef = collection(db, 'stories');
    const storiesSnapshot = await getDocs(storiesRef);
    
    const stats = {
      totalStories: storiesSnapshot.size,
      validStories: 0,
      invalidStories: 0,
      needsMigration: 0
    };

    storiesSnapshot.forEach(doc => {
      const data = doc.data();
      if (validateStoryStructure(data)) {
        stats.validStories++;
      } else {
        stats.invalidStories++;
      }
      if (!data._version || data._version !== MIGRATION_VERSION) {
        stats.needsMigration++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error checking database health:', error);
    throw error;
  }
};