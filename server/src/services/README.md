# Services

This directory contains business logic services that are used by the API routes.

## Itinerary Generator Service

**File**: `itineraryGenerator.ts`

### Overview

The itinerary generator service creates dynamic travel itineraries based on user preferences. It's currently implemented as a mock service that generates realistic itinerary data, but is designed to be easily replaced with a real AI service (e.g., Gemini API) in the future.

### Key Features

1. **Dynamic Generation**: Creates itineraries based on:
   - Number of days
   - User interests (历史古迹, 地道美食, 艺术展览, etc.)
   - Travel intensity (relaxed, moderate, packed)
   - Budget level (economy, comfortable, luxury)
   - Transport mode (walking, public, taxi, driving)

2. **Activity Templates**: Uses predefined templates for different interest categories, each with:
   - Multiple title variations
   - Contextual descriptions
   - Practical tips
   - Cost estimates

3. **Smart Scheduling**: 
   - Generates realistic time slots starting at 9:00 AM
   - Adjusts activity duration (90-150 minutes)
   - Includes break times between activities
   - Considers meal times

4. **Cost Calculation**:
   - Base costs vary by budget level
   - Random variation (0.7x to 1.3x) for realism
   - Aggregates daily and total costs

5. **Distance Estimation**:
   - Respects transport mode constraints
   - Walking: < 5km/day
   - Public transport: < 15km/day
   - Taxi/Driving: < 30km/day

### Usage

```typescript
import { generateItinerary } from './services/itineraryGenerator.js';

const form: ItineraryForm = {
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

const result = await generateItinerary(form);
// Returns: { days, summary, totalSpots, totalBudget }
```

### Properties Validated

The service ensures the following correctness properties:

- **Property 23**: Days count matches form.days
- **Property 24**: All activities have required fields (id, time, duration, title, description, category)
- **Property 25**: Each day has valid totalDistance and totalCost (non-negative)
- **Property 26**: Result has all required fields
- **Property 27**: Summary is non-empty

### Future Enhancements

To integrate with a real AI service (e.g., Gemini):

1. Replace the mock generation logic with API calls
2. Build a structured prompt from the form data
3. Parse the AI response into the expected format
4. Keep the same interface so routes don't need changes

Example:
```typescript
async function aiGenerateItinerary(form: ItineraryForm): Promise<GeneratedItinerary> {
  const prompt = buildPrompt(form);
  const response = await geminiClient.generateContent(prompt);
  return parseAIResponse(response);
}
```

### Testing

Run the test suite:
```bash
npm run build
node dist/tests/itineraryGenerator.test.js
```

The test verifies all correctness properties and ensures the service generates valid itineraries.
