import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateItinerary, type ItineraryForm } from '../services/itineraryGenerator.js';

/**
 * Backend Unit Tests for Itinerary API
 * 
 * Note: These tests focus on the generation service logic.
 * Full API endpoint tests would require Fastify app setup.
 */

describe('Backend Unit Tests - Itinerary Generation Service', () => {
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

  describe('Form Validation', () => {
    it('should accept valid form data', async () => {
      const result = await generateItinerary(mockForm);
      
      expect(result).toBeDefined();
      expect(result.days).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle different traveler types', async () => {
      const forms: ItineraryForm[] = [
        { ...mockForm, travelers: { count: 1, type: 'solo' } },
        { ...mockForm, travelers: { count: 2, type: 'couple' } },
        { ...mockForm, travelers: { count: 4, type: 'family' } },
        { ...mockForm, travelers: { count: 3, type: 'friends' } },
      ];

      for (const form of forms) {
        const result = await generateItinerary(form);
        expect(result).toBeDefined();
        expect(result.days.length).toBe(form.days);
      }
    });

    it('should handle different intensity levels', async () => {
      const intensities: Array<'relaxed' | 'moderate' | 'packed'> = ['relaxed', 'moderate', 'packed'];

      for (const intensity of intensities) {
        const result = await generateItinerary({ ...mockForm, intensity });
        expect(result).toBeDefined();
        
        // Verify activity count varies by intensity
        const avgActivities = result.days.reduce((sum, day) => sum + day.activities.length, 0) / result.days.length;
        
        if (intensity === 'relaxed') {
          expect(avgActivities).toBeGreaterThanOrEqual(2);
          expect(avgActivities).toBeLessThanOrEqual(3);
        } else if (intensity === 'moderate') {
          expect(avgActivities).toBeGreaterThanOrEqual(3);
          expect(avgActivities).toBeLessThanOrEqual(4);
        } else if (intensity === 'packed') {
          expect(avgActivities).toBeGreaterThanOrEqual(4);
          expect(avgActivities).toBeLessThanOrEqual(6);
        }
      }
    });

    it('should handle different budget levels', async () => {
      const budgets: Array<'economy' | 'comfortable' | 'luxury'> = ['economy', 'comfortable', 'luxury'];

      for (const budget of budgets) {
        const result = await generateItinerary({ ...mockForm, budget });
        expect(result).toBeDefined();
        expect(result.totalBudget).toBeGreaterThan(0);
        
        // Verify budget affects total cost
        const avgDailyCost = result.totalBudget / result.days.length;
        
        if (budget === 'economy') {
          expect(avgDailyCost).toBeLessThan(30000); // < 300 CNY per day
        } else if (budget === 'luxury') {
          expect(avgDailyCost).toBeGreaterThan(50000); // > 500 CNY per day
        }
      }
    });
  });

  describe('Generation Output Structure', () => {
    it('should return all required fields', async () => {
      const result = await generateItinerary(mockForm);
      
      expect(result).toHaveProperty('days');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('totalSpots');
      expect(result).toHaveProperty('totalBudget');
      expect(Array.isArray(result.days)).toBe(true);
      expect(typeof result.summary).toBe('string');
      expect(typeof result.totalSpots).toBe('number');
      expect(typeof result.totalBudget).toBe('number');
    });

    it('should generate correct number of days', async () => {
      const testCases = [1, 3, 5, 7, 14, 30];
      
      for (const days of testCases) {
        const result = await generateItinerary({ ...mockForm, days });
        expect(result.days.length).toBe(days);
      }
    });

    it('should include all required activity fields', async () => {
      const result = await generateItinerary(mockForm);
      
      for (const day of result.days) {
        expect(day.activities.length).toBeGreaterThan(0);
        
        for (const activity of day.activities) {
          expect(activity).toHaveProperty('id');
          expect(activity).toHaveProperty('time');
          expect(activity).toHaveProperty('duration');
          expect(activity).toHaveProperty('title');
          expect(activity).toHaveProperty('description');
          expect(activity).toHaveProperty('category');
          
          expect(typeof activity.id).toBe('string');
          expect(typeof activity.time).toBe('string');
          expect(typeof activity.duration).toBe('number');
          expect(typeof activity.title).toBe('string');
          expect(typeof activity.description).toBe('string');
          expect(typeof activity.category).toBe('string');
          
          expect(activity.id.length).toBeGreaterThan(0);
          expect(activity.title.length).toBeGreaterThan(0);
          expect(activity.duration).toBeGreaterThan(0);
        }
      }
    });

    it('should include day statistics', async () => {
      const result = await generateItinerary(mockForm);
      
      for (const day of result.days) {
        expect(day).toHaveProperty('totalDistance');
        expect(day).toHaveProperty('totalCost');
        expect(day.totalDistance).toBeGreaterThanOrEqual(0);
        expect(day.totalCost).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate non-empty summary', async () => {
      const result = await generateItinerary(mockForm);
      
      expect(result.summary).toBeTruthy();
      expect(result.summary.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should have totalSpots equal to sum of all activities', async () => {
      const result = await generateItinerary(mockForm);
      
      const actualSpots = result.days.reduce((sum, day) => sum + day.activities.length, 0);
      expect(result.totalSpots).toBe(actualSpots);
    });

    it('should have totalBudget equal to sum of all daily costs', async () => {
      const result = await generateItinerary(mockForm);
      
      const actualBudget = result.days.reduce((sum, day) => sum + (day.totalCost || 0), 0);
      expect(result.totalBudget).toBe(actualBudget);
    });

    it('should have sequential day numbers', async () => {
      const result = await generateItinerary(mockForm);
      
      result.days.forEach((day, index) => {
        expect(day.dayNumber).toBe(index + 1);
      });
    });

    it('should have valid date progression', async () => {
      const result = await generateItinerary(mockForm);
      
      for (let i = 0; i < result.days.length - 1; i++) {
        const currentDate = new Date(result.days[i].date);
        const nextDate = new Date(result.days[i + 1].date);
        
        const diffDays = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(1);
      }
    });
  });

  describe('Interest-Based Generation', () => {
    it('should include activities matching selected interests', async () => {
      const result = await generateItinerary(mockForm);
      
      const allCategories = result.days.flatMap(day => 
        day.activities.map(act => act.category)
      );
      
      // At least some activities should match the interests
      const hasMatchingInterests = mockForm.interests.some(interest => 
        allCategories.some(category => 
          category.includes(interest) || interest.includes(category)
        )
      );
      
      expect(hasMatchingInterests).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum days (1 day)', async () => {
      const result = await generateItinerary({ ...mockForm, days: 1 });
      
      expect(result.days.length).toBe(1);
      expect(result.days[0].activities.length).toBeGreaterThan(0);
    });

    it('should handle maximum days (30 days)', async () => {
      const result = await generateItinerary({ ...mockForm, days: 30 });
      
      expect(result.days.length).toBe(30);
      result.days.forEach(day => {
        expect(day.activities.length).toBeGreaterThan(0);
      });
    });

    it('should handle single interest', async () => {
      const result = await generateItinerary({
        ...mockForm,
        interests: ['历史古迹']
      });
      
      expect(result.days.length).toBe(mockForm.days);
    });

    it('should handle many interests', async () => {
      const result = await generateItinerary({
        ...mockForm,
        interests: ['历史古迹', '地道美食', '自然风光', '现代艺术', '购物娱乐', '夜生活']
      });
      
      expect(result.days.length).toBe(mockForm.days);
    });
  });
});
