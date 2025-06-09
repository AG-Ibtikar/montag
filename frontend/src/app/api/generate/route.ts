import { NextResponse } from 'next/server';
import { FEATURE_CATEGORIES } from '@/data/features';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { features, platforms, phase, storyStyle, acStyle, notes, includeTestCases } = body;

    // Validate required fields
    if (!features || !platforms || !phase || !storyStyle || !acStyle || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get feature details from the features array
    const featureDetails = features.map((featureId: string) => {
      const feature = FEATURE_CATEGORIES.flatMap(cat => cat.features).find(f => f.id === featureId);
      return feature || { id: featureId, title: featureId, description: '' };
    });

    // Generate a story based on the input
    const story = `${featureDetails.map((feature: any, featureIndex: number) => `
==========================================
Feature ${featureIndex + 1}: ${feature.title}
==========================================

${featureIndex + 1}.1 User Story: ${feature.title} Creation
------------------------------------------
As a user, I want to create new ${feature.title.toLowerCase()} entries so that I can manage my ${feature.title.toLowerCase()} data effectively.

${featureIndex + 1}.1.1 Acceptance Criteria:
- The system should implement ${feature.title.toLowerCase()} creation
- The feature should be accessible on ${platforms.join(', ')} platforms
- The implementation should be appropriate for ${phase} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style
- ${feature.description}

${featureIndex + 1}.1.2 Negative Scenarios:
- System should handle invalid input gracefully
- System should prevent unauthorized access
- System should handle network failures
- System should maintain data consistency during failures
- System should handle concurrent access conflicts
- System should prevent data corruption

${includeTestCases ? `${featureIndex + 1}.1.3 Test Cases:
Positive:
- Verify successful creation of ${feature.title.toLowerCase()}
- Verify proper validation of all fields
- Verify correct error handling
- Verify proper platform compatibility
- Verify proper phase-specific functionality
- Verify proper style implementation

Negative:
- Verify system behavior with invalid input
- Verify system behavior with unauthorized access
- Verify system behavior during network failures
- Verify system behavior during concurrent access
- Verify system behavior with corrupted data
- Verify system behavior with invalid configurations` : ''}

${featureIndex + 1}.2 User Story: ${feature.title} Viewing
------------------------------------------
As a user, I want to view existing ${feature.title.toLowerCase()} entries so that I can access and review my ${feature.title.toLowerCase()} data.

${featureIndex + 1}.2.1 Acceptance Criteria:
- The system should implement ${feature.title.toLowerCase()} viewing
- The feature should be accessible on ${platforms.join(', ')} platforms
- The implementation should be appropriate for ${phase} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style
- ${feature.description}

${featureIndex + 1}.2.2 Negative Scenarios:
- System should handle empty result sets gracefully
- System should prevent unauthorized viewing
- System should handle network latency
- System should maintain data consistency during viewing
- System should handle concurrent access conflicts
- System should prevent data corruption

${includeTestCases ? `${featureIndex + 1}.2.3 Test Cases:
Positive:
- Verify successful viewing of ${feature.title.toLowerCase()}
- Verify proper search and filter functionality
- Verify correct detailed view display
- Verify proper platform compatibility
- Verify proper phase-specific functionality
- Verify proper style implementation

Negative:
- Verify system behavior with no results
- Verify system behavior with unauthorized access
- Verify system behavior during network issues
- Verify system behavior during concurrent access
- Verify system behavior with corrupted data
- Verify system behavior with invalid configurations` : ''}

==========================================`).join('\n\n')}`;

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
} 