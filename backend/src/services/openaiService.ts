import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Validate API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OpenAI API key is not configured in environment variables');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

interface Story {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  negativeScenarios: string[];
  testCases?: {
    positive: string[];
    negative: string[];
  };
  platform: string;
  phase: string;
}

interface GenerateStoriesRequest {
  notes: string;
  platforms: string[];
  productPhase: string[];
  storyStyle: 'Scrum' | 'BDD' | 'Simple';
  acStyle: 'Given-When-Then' | 'Checklist';
  includeTestCases: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseResponse(content: string): { stories: Story[] } {
  try {
    // Remove any markdown code block markers
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const stories = JSON.parse(cleanContent) as { stories: Story[] };

    // Validate response structure
    if (!stories.stories || !Array.isArray(stories.stories)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    // Validate each story
    stories.stories.forEach((story, index) => {
      if (!story.title || !story.description || !Array.isArray(story.acceptanceCriteria)) {
        throw new Error(`Invalid story structure at index ${index}`);
      }
      if (!story.negativeScenarios || !Array.isArray(story.negativeScenarios)) {
        throw new Error(`Missing negative scenarios at index ${index}`);
      }
    });

    return stories;
  } catch (error) {
    console.error('Failed to parse response:', content);
    throw new Error('Failed to parse OpenAI response as JSON');
  }
}

export async function generateStoriesFromNotes(
  request: GenerateStoriesRequest
): Promise<{ stories: Story[] }> {
  const { notes, platforms, productPhase, storyStyle, acStyle, includeTestCases } = request;
  
  const storyFormatGuide = {
    'Scrum': 'As a [type of user], I want [goal] so that [benefit]',
    'BDD': 'In order to [business value], as a [type of user], I want [goal]',
    'Simple': 'I want [goal] so that [benefit]'
  };

  const acFormatGuide = {
    'Given-When-Then': 'Given [context], When [action], Then [outcome]',
    'Checklist': '• [criterion]'
  };

  const prompt = `You are an expert Agile Product Owner and QA Engineer. Based on the following feature notes, generate user stories for each platform (${platforms.join(', ')}) and phase (${productPhase.join(', ')}).

Feature Notes:
${notes}

For each platform and phase combination, generate user stories in ${storyStyle} format using this template:
${storyFormatGuide[storyStyle]}

And acceptance criteria in ${acStyle} format using this template:
${acFormatGuide[acStyle]}

For each user story, include:
1. A clear title
2. A detailed description
3. Acceptance criteria (3-5 items)
4. Negative scenarios (2-3 items)
${includeTestCases ? `5. Test cases:
   - Positive test cases (2-3 items)
   - Negative test cases (2-3 items)` : ''}
6. Platform tag (${platforms.join(', ')})
7. Phase tag (${productPhase.join(', ')})

Guidelines:
1. Each user story should be clear, concise, and focused on a single feature
2. Acceptance criteria should be specific, measurable, and testable
3. Negative scenarios should cover edge cases and error conditions
${includeTestCases ? '4. Test cases should be detailed and cover both happy path and error scenarios' : ''}
${includeTestCases ? '5. Use active voice and present tense' : '4. Use active voice and present tense'}
${includeTestCases ? '6. Focus on business value and user needs' : '5. Focus on business value and user needs'}
${includeTestCases ? '7. Break down complex features into smaller, manageable stories' : '6. Break down complex features into smaller, manageable stories'}
8. Consider platform-specific requirements and constraints
9. Adapt the story to the specific phase (Design/Development)

Format the response as a JSON object with the following structure:
{
  "stories": [
    {
      "title": "string",
      "description": "string",
      "acceptanceCriteria": ["string"],
      "negativeScenarios": ["string"]${includeTestCases ? `,
      "testCases": {
        "positive": ["string"],
        "negative": ["string"]
      }` : ''},
      "platform": "string",
      "phase": "string"
    }
  ]
}

Only return the JSON object, no additional text.`;

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${MAX_RETRIES}...`);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert Agile Product Owner and QA Engineer who generates comprehensive user stories, acceptance criteria, negative scenarios${includeTestCases ? ', and test cases' : ''}. You are precise, clear, and follow best practices in Agile requirements engineering and software testing. You understand platform-specific requirements and can adapt stories to different phases of product development.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      console.log('Received response from OpenAI');
      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const stories = parseResponse(responseContent);
      
      // Validate platform and phase tags
      stories.stories.forEach((story, index) => {
        if (!story.platform || !story.phase) {
          throw new Error(`Missing platform or phase information in story at index ${index}`);
        }
        if (!platforms.includes(story.platform)) {
          throw new Error(`Invalid platform "${story.platform}" in story at index ${index}`);
        }
        if (!productPhase.includes(story.phase)) {
          throw new Error(`Invalid phase "${story.phase}" in story at index ${index}`);
        }
      });

      return stories;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error as Error;

      if (attempt < MAX_RETRIES) {
        console.log(`Waiting ${RETRY_DELAY}ms before retry...`);
        await delay(RETRY_DELAY);
      }
    }
  }

  throw lastError || new Error('Failed to generate stories after multiple attempts');
} 