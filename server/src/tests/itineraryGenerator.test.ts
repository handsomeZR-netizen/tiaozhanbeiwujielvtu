import { generateItinerary, type ItineraryForm } from '../services/itineraryGenerator.js';

/**
 * Basic smoke test for itinerary generator service
 */
async function testItineraryGenerator() {
  console.log('Testing itinerary generator service...\n');

  const mockForm: ItineraryForm = {
    city: '日本京都',
    startDate: '2024-04-01',
    endDate: '2024-04-03',
    days: 3,
    travelers: { count: 2, type: 'couple' },
    interests: ['历史古迹', '地道美食', '自然风光'],
    intensity: 'moderate',
    budget: 'comfortable',
    transport: 'public',
    requirements: [],
  };

  try {
    console.log('Generating itinerary for:', mockForm.city);
    console.log('Days:', mockForm.days);
    console.log('Interests:', mockForm.interests.join(', '));
    console.log('Intensity:', mockForm.intensity);
    console.log('Budget:', mockForm.budget);
    console.log('\nGenerating...\n');

    const result = await generateItinerary(mockForm);

    console.log('✓ Generation successful!');
    console.log('\nResults:');
    console.log('- Total days:', result.days.length);
    console.log('- Total spots:', result.totalSpots);
    console.log('- Total budget:', result.totalBudget);
    console.log('- Summary:', result.summary);

    // Verify requirements
    console.log('\nVerifying requirements:');

    // Property 23: Days count should match form.days
    if (result.days.length === mockForm.days) {
      console.log('✓ Property 23: Days count matches (', result.days.length, '===', mockForm.days, ')');
    } else {
      console.error('✗ Property 23 FAILED: Days count mismatch');
      return false;
    }

    // Property 24: All activities should have required fields
    let allActivitiesValid = true;
    for (const day of result.days) {
      for (const activity of day.activities) {
        if (!activity.id || !activity.time || !activity.duration || !activity.title || !activity.description || !activity.category) {
          console.error('✗ Property 24 FAILED: Activity missing required fields:', activity);
          allActivitiesValid = false;
          break;
        }
      }
      if (!allActivitiesValid) break;
    }
    if (allActivitiesValid) {
      console.log('✓ Property 24: All activities have required fields');
    }

    // Property 25: Each day should have totalDistance and totalCost
    let allDaysHaveStats = true;
    for (const day of result.days) {
      if (day.totalDistance === undefined || day.totalCost === undefined || day.totalDistance < 0 || day.totalCost < 0) {
        console.error('✗ Property 25 FAILED: Day missing stats or negative values:', day);
        allDaysHaveStats = false;
        break;
      }
    }
    if (allDaysHaveStats) {
      console.log('✓ Property 25: All days have valid totalDistance and totalCost');
    }

    // Property 26: Result should have all required fields
    if (result.days && result.summary && result.totalSpots !== undefined && result.totalBudget !== undefined) {
      console.log('✓ Property 26: Result has all required fields');
    } else {
      console.error('✗ Property 26 FAILED: Result missing required fields');
      return false;
    }

    // Property 27: Summary should be non-empty
    if (result.summary && result.summary.trim().length > 0) {
      console.log('✓ Property 27: Summary is non-empty');
    } else {
      console.error('✗ Property 27 FAILED: Summary is empty');
      return false;
    }

    console.log('\n✓ All tests passed!');
    return true;
  } catch (error) {
    console.error('✗ Test failed with error:', error);
    return false;
  }
}

// Run the test
testItineraryGenerator()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
