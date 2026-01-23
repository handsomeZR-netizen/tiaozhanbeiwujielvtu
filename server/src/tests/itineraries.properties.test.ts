import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateItinerary, type ItineraryForm } from '../services/itineraryGenerator.js';

/**
 * Property-Based Tests for Backend Itinerary Generation
 * 
 * These tests verify correctness properties across all valid inputs
 */

describe('Backend Property-Based Tests - Itinerary Generation', () => {
  // Arbitraries for generating test data
  const cityArb = fc.oneof(
    fc.constant('日本京都'),
    fc.constant('中国北京'),
    fc.constant('法国巴黎'),
    fc.constant('意大利罗马'),
    fc.constant('泰国曼谷')
  );

  const travelerTypeArb = fc.constantFrom('solo', 'couple', 'family', 'friends');
  const intensityArb = fc.constantFrom('relaxed', 'moderate', 'packed');
  const budgetArb = fc.constantFrom('economy', 'comfortable', 'luxury');
  const transportArb = fc.constantFrom('walking', 'public', 'taxi', 'driving');

  const interestsArb = fc.array(
    fc.constantFrom('历史古迹', '地道美食', '自然风光', '现代艺术', '购物娱乐', '夜生活'),
    { minLength: 3, maxLength: 6 }
  ).map(arr => Array.from(new Set(arr))); // Remove duplicates

  const formArb = fc.record({
    city: cityArb,
    startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
      .map(d => d.toISOString().split('T')[0]),
    days: fc.integer({ min: 1, max: 10 }), // Reduced max for performance
    travelers: fc.record({
      count: fc.integer({ min: 1, max: 10 }),
      type: travelerTypeArb,
    }),
    interests: interestsArb,
    intensity: intensityArb,
    budget: budgetArb,
    transport: transportArb,
  }).map(partial => ({
    ...partial,
    endDate: new Date(new Date(partial.startDate).getTime() + partial.days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0],
    requirements: [],
  })) as fc.Arbitrary<ItineraryForm>;

  /**
   * Feature: itinerary-planner-integration, Property 23: 天数匹配
   * 
   * 对于任何行程生成请求，返回的行程应包含与请求中 days 字段相等数量的 ItineraryDay 对象
   * 
   * **Validates: Requirements 10.2**
   */
  it('Property 23: generated itinerary should have correct number of days', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        expect(result.days.length).toBe(form.days);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 24: 活动数据完整性
   * 
   * 对于任何生成的活动，应包含所有必需字段（id, time, duration, title, description, category）
   * 
   * **Validates: Requirements 10.4**
   */
  it('Property 24: all activities should have required fields', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        for (const day of result.days) {
          for (const activity of day.activities) {
            // Check all required fields exist
            expect(activity.id).toBeDefined();
            expect(activity.time).toBeDefined();
            expect(activity.duration).toBeDefined();
            expect(activity.title).toBeDefined();
            expect(activity.description).toBeDefined();
            expect(activity.category).toBeDefined();
            
            // Check types
            expect(typeof activity.id).toBe('string');
            expect(typeof activity.time).toBe('string');
            expect(typeof activity.duration).toBe('number');
            expect(typeof activity.title).toBe('string');
            expect(typeof activity.description).toBe('string');
            expect(typeof activity.category).toBe('string');
            
            // Check non-empty
            expect(activity.id.length).toBeGreaterThan(0);
            expect(activity.title.length).toBeGreaterThan(0);
            expect(activity.duration).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 25: 每日统计计算
   * 
   * 对于任何生成的 ItineraryDay，应包含 totalDistance 和 totalCost 字段且值为非负数
   * 
   * **Validates: Requirements 10.5**
   */
  it('Property 25: each day should have valid statistics', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        for (const day of result.days) {
          expect(day.totalDistance).toBeDefined();
          expect(day.totalCost).toBeDefined();
          expect(day.totalDistance).toBeGreaterThanOrEqual(0);
          expect(day.totalCost).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 26: 行程记录结构完整性
   * 
   * 对于任何生成的行程记录，应包含所有必需字段
   * 
   * **Validates: Requirements 10.6**
   */
  it('Property 26: result should have all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        expect(result.days).toBeDefined();
        expect(result.summary).toBeDefined();
        expect(result.totalSpots).toBeDefined();
        expect(result.totalBudget).toBeDefined();
        
        expect(Array.isArray(result.days)).toBe(true);
        expect(typeof result.summary).toBe('string');
        expect(typeof result.totalSpots).toBe('number');
        expect(typeof result.totalBudget).toBe('number');
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 27: 摘要文本存在性
   * 
   * 对于任何生成的行程记录，summary 字段应为非空字符串
   * 
   * **Validates: Requirements 10.7**
   */
  it('Property 27: summary should be non-empty', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        expect(result.summary).toBeTruthy();
        expect(result.summary.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional Property: Total spots consistency
   * 
   * 对于任何生成的行程，totalSpots 应等于所有活动的总数
   */
  it('Property: totalSpots should equal sum of all activities', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        const actualSpots = result.days.reduce((sum, day) => sum + day.activities.length, 0);
        expect(result.totalSpots).toBe(actualSpots);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional Property: Total budget consistency
   * 
   * 对于任何生成的行程，totalBudget 应等于所有每日费用的总和
   */
  it('Property: totalBudget should equal sum of daily costs', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        const actualBudget = result.days.reduce((sum, day) => sum + (day.totalCost || 0), 0);
        expect(result.totalBudget).toBe(actualBudget);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional Property: Day numbering consistency
   * 
   * 对于任何生成的行程，天数编号应该是连续的从 1 开始
   */
  it('Property: day numbers should be sequential starting from 1', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        result.days.forEach((day, index) => {
          expect(day.dayNumber).toBe(index + 1);
        });
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional Property: Activity count based on intensity
   * 
   * 对于任何生成的行程，活动数量应该与强度设置相符
   */
  it('Property: activity count should match intensity level', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        const avgActivities = result.days.reduce((sum, day) => sum + day.activities.length, 0) / result.days.length;
        
        if (form.intensity === 'relaxed') {
          expect(avgActivities).toBeGreaterThanOrEqual(2);
          expect(avgActivities).toBeLessThanOrEqual(3);
        } else if (form.intensity === 'moderate') {
          expect(avgActivities).toBeGreaterThanOrEqual(3);
          expect(avgActivities).toBeLessThanOrEqual(4);
        } else if (form.intensity === 'packed') {
          expect(avgActivities).toBeGreaterThanOrEqual(4);
          expect(avgActivities).toBeLessThanOrEqual(6);
        }
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Additional Property: Each day should have at least one activity
   * 
   * 对于任何生成的行程，每一天都应该至少有一个活动
   */
  it('Property: each day should have at least one activity', async () => {
    await fc.assert(
      fc.asyncProperty(formArb, async (form) => {
        const result = await generateItinerary(form);
        
        for (const day of result.days) {
          expect(day.activities.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 20 }
    );
  });
});
