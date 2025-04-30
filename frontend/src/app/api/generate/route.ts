import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { focus, tone, format, length, notes, selectedFeatures, platforms, productPhase, storyStyle, acStyle, includeTestCases } = body;

    // Validate required fields
    if (!focus || !tone || !format || !length || !notes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a story based on the input
    const story = `${selectedFeatures.map((feature: string, featureIndex: number) => `
==========================================
Feature ${featureIndex + 1}: ${feature}
==========================================

${featureIndex + 1}.1 User Story: ${feature} Creation
------------------------------------------
As a user, I want to create new ${feature.toLowerCase()} entries so that I can manage my ${feature.toLowerCase()} data effectively.

${featureIndex + 1}.1.1 Acceptance Criteria:
- The system should implement ${feature.toLowerCase()} creation according to ${format} format
- The implementation should follow ${tone} tone
- The feature should be optimized for ${length} usage
- The feature should be accessible on ${platforms.join(', ')} platforms
- The system should handle errors gracefully
- The implementation should be appropriate for ${productPhase.join(', ')} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style

${featureIndex + 1}.1.2 Negative Scenarios:
- System should handle invalid input gracefully
- System should prevent unauthorized access
- System should handle network failures
- System should maintain data consistency during failures
- System should handle concurrent access conflicts
- System should prevent data corruption

${featureIndex + 1}.1.3 Test Cases:
Positive:
- Verify successful creation of ${feature.toLowerCase()}
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
- Verify system behavior with invalid configurations

${featureIndex + 1}.2 User Story: ${feature} Viewing
------------------------------------------
As a user, I want to view existing ${feature.toLowerCase()} entries so that I can access and review my ${feature.toLowerCase()} data.

${featureIndex + 1}.2.1 Acceptance Criteria:
- The system should implement ${feature.toLowerCase()} viewing according to ${format} format
- The implementation should follow ${tone} tone
- The feature should be optimized for ${length} usage
- The feature should be accessible on ${platforms.join(', ')} platforms
- The system should handle errors gracefully
- The implementation should be appropriate for ${productPhase.join(', ')} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style

${featureIndex + 1}.2.2 Negative Scenarios:
- System should handle empty result sets gracefully
- System should prevent unauthorized viewing
- System should handle network latency
- System should maintain data consistency during viewing
- System should handle concurrent access conflicts
- System should prevent data corruption

${featureIndex + 1}.2.3 Test Cases:
Positive:
- Verify successful viewing of ${feature.toLowerCase()}
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
- Verify system behavior with invalid configurations

${featureIndex + 1}.3 User Story: ${feature} Modification
------------------------------------------
As a user, I want to modify existing ${feature.toLowerCase()} entries so that I can update my ${feature.toLowerCase()} data as needed.

${featureIndex + 1}.3.1 Acceptance Criteria:
- The system should implement ${feature.toLowerCase()} modification according to ${format} format
- The implementation should follow ${tone} tone
- The feature should be optimized for ${length} usage
- The feature should be accessible on ${platforms.join(', ')} platforms
- The system should handle errors gracefully
- The implementation should be appropriate for ${productPhase.join(', ')} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style

${featureIndex + 1}.3.2 Negative Scenarios:
- System should prevent unauthorized modifications
- System should handle edit conflicts
- System should maintain data integrity
- System should prevent invalid updates
- System should handle concurrent access conflicts
- System should prevent data corruption

${featureIndex + 1}.3.3 Test Cases:
Positive:
- Verify successful modification of ${feature.toLowerCase()}
- Verify proper validation of modified fields
- Verify correct version history maintenance
- Verify proper platform compatibility
- Verify proper phase-specific functionality
- Verify proper style implementation

Negative:
- Verify system behavior with unauthorized edits
- Verify system behavior with concurrent modifications
- Verify system behavior with invalid updates
- Verify system behavior during network issues
- Verify system behavior with corrupted data
- Verify system behavior with invalid configurations

${featureIndex + 1}.4 User Story: ${feature} Deletion
------------------------------------------
As a user, I want to delete ${feature.toLowerCase()} entries so that I can remove unnecessary data.

${featureIndex + 1}.4.1 Acceptance Criteria:
- The system should implement ${feature.toLowerCase()} deletion according to ${format} format
- The implementation should follow ${tone} tone
- The feature should be optimized for ${length} usage
- The feature should be accessible on ${platforms.join(', ')} platforms
- The system should handle errors gracefully
- The implementation should be appropriate for ${productPhase.join(', ')} phase
- The system should follow ${storyStyle} style
- The acceptance criteria should follow ${acStyle} style

${featureIndex + 1}.4.2 Negative Scenarios:
- System should prevent unauthorized deletion
- System should handle dependent records
- System should prevent accidental deletion
- System should maintain data consistency
- System should handle concurrent access conflicts
- System should prevent data corruption

${featureIndex + 1}.4.3 Test Cases:
Positive:
- Verify successful deletion of ${feature.toLowerCase()}
- Verify proper confirmation mechanism
- Verify correct handling of dependent records
- Verify proper platform compatibility
- Verify proper phase-specific functionality
- Verify proper style implementation

Negative:
- Verify system behavior with unauthorized deletion
- Verify system behavior with dependent records
- Verify system behavior with accidental deletion
- Verify system behavior during network issues
- Verify system behavior with corrupted data
- Verify system behavior with invalid configurations

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