import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateStoriesFromNotes } from './services/openaiService';
import storyRoutes from './routes/storyRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // Local development
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Story routes
app.use('/api/stories', storyRoutes);

interface GenerateStoriesRequest {
  notes: string;
  platforms: string[];
  productPhase: string[];
  storyStyle: 'Scrum' | 'BDD' | 'Simple';
  acStyle: 'Given-When-Then' | 'Checklist';
  includeTestCases: boolean;
}

app.post('/api/generate-stories', async (req, res) => {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { notes, platforms, productPhase, storyStyle, acStyle, includeTestCases } = req.body as GenerateStoriesRequest;

    // Validate request
    if (!notes || !platforms || !productPhase || !storyStyle || !acStyle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Validate platforms
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one platform must be selected',
      });
    }

    // Validate product phases
    if (!Array.isArray(productPhase) || productPhase.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product phase must be selected',
      });
    }

    // Validate story style
    if (!['Scrum', 'BDD', 'Simple'].includes(storyStyle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid story style. Must be one of: Scrum, BDD, Simple',
      });
    }

    // Validate AC style
    if (!['Given-When-Then', 'Checklist'].includes(acStyle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid AC style. Must be one of: Given-When-Then, Checklist',
      });
    }

    // Validate notes length
    if (notes.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Notes must be at least 10 characters long',
      });
    }

    // Generate stories using the OpenAI service
    const stories = await generateStoriesFromNotes({
      notes,
      platforms,
      productPhase,
      storyStyle,
      acStyle,
      includeTestCases: includeTestCases ?? true
    });

    res.json({
      success: true,
      message: 'Stories generated successfully',
      data: stories
    });
  } catch (error) {
    console.error('Error generating stories:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: OpenAI API key is not set',
        });
      }
      if (error.message.includes('parse')) {
        return res.status(500).json({
          success: false,
          message: 'Error processing AI response',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate stories. Please try again later.',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 