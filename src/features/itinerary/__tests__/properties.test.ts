import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useItineraryForm } from '../hooks/useItineraryForm';
import { useItineraryGenerator } from '../hooks/useItineraryGenerator';
import * as api from '@/shared/lib/api';
import * as storage from '@/shared/lib/storage';
import { ItineraryForm, ItineraryRecord } from '../itinerary.types';

// Mock modules
vi.mock('@/shared/lib/api');
vi.mock('@/shared/lib/storage');

describe('Property-Based Tests - Itinerary Planner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: itinerary-planner-integration, Property 2: 表单验证完整性
   * 
   * 对于任何向导步骤，当且仅当该步骤的所有必填字段都有效时，isStepValid() 应返回 true
   * 
   * **Validates: Requirements 2.2**
   */
  it('Property 2: form validation should be consistent with field validity', () => {
    fc.assert(
      fc.property(
        fc.record({
          city: fc.string({ minLength: 1, maxLength: 50 }),
          startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') })
            .map(d => d.toISOString().split('T')[0]),
          days: fc.integer({ min: 1, max: 30 }),
        }),
        (validData) => {
          const { result, unmount } = renderHook(() => useItineraryForm());
          
          try {
            // Update form with valid data
            act(() => {
              result.current.updateField('city', validData.city);
              result.current.updateField('startDate', validData.startDate);
              result.current.updateField('days', validData.days);
            });
            
            // Step 1 should be valid since all fields are valid
            expect(result.current.isStepValid()).toBe(true);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 } // Reduced for performance
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 2 (Negative): 表单验证完整性
   * 
   * 对于任何无效的表单数据，isStepValid() 应返回 false
   * 
   * **Validates: Requirements 2.2**
   */
  it('Property 2 (Negative): form validation should reject invalid data', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''), // Empty city
          fc.string({ maxLength: 0 }) // Empty string
        ),
        (invalidCity) => {
          const { result, unmount } = renderHook(() => useItineraryForm());
          
          try {
            act(() => {
              result.current.updateField('city', invalidCity);
              result.current.updateField('startDate', '2024-04-01');
              result.current.updateField('days', 3);
            });
            
            // Step 1 should be invalid with empty city
            expect(result.current.isStepValid()).toBe(false);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 2 (Step 2): 兴趣标签验证
   * 
   * 对于任何兴趣列表，当且仅当列表长度 >= 3 时，Step 2 应该有效
   * 
   * **Validates: Requirements 2.2**
   */
  it('Property 2 (Step 2): interests validation should require at least 3 items', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        (interests) => {
          const { result, unmount } = renderHook(() => useItineraryForm());
          
          try {
            act(() => {
              result.current.nextStep(); // Move to step 2
              result.current.updateField('interests', interests);
            });
            
            const shouldBeValid = interests.length >= 3;
            expect(result.current.isStepValid()).toBe(shouldBeValid);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 3: 状态转换一致性
   * 
   * 对于任何有效的表单提交，系统应从 wizard 状态转换到 generating 状态
   * 
   * **Validates: Requirements 2.3, 2.5**
   */
  it('Property 3: state transitions should be consistent', async () => {
    vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          city: fc.string({ minLength: 1, maxLength: 50 }),
          days: fc.integer({ min: 1, max: 30 }),
          interests: fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 5 }),
        }),
        async (formData) => {
          const mockResult: ItineraryRecord = {
            id: 'test-id',
            form: {
              city: formData.city,
              startDate: '2024-04-01',
              endDate: '2024-04-03',
              days: formData.days,
              travelers: { count: 1, type: 'solo' },
              interests: formData.interests,
              intensity: 'moderate',
              budget: 'comfortable',
              transport: 'public',
              requirements: [],
            },
            days: [],
            summary: 'Test summary',
            createdAt: '2024-01-01T00:00:00Z',
            totalSpots: 0,
            totalBudget: 0,
          };
          
          vi.mocked(api.apiPost).mockResolvedValue(mockResult);
          
          const { result, unmount } = renderHook(() => useItineraryGenerator());
          
          try {
            // Initially not generating
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.result).toBeNull();
            
            // Start generation
            await act(async () => {
              await result.current.startGeneration(mockResult.form);
            });
            
            // Should transition to generating state (still true until finishGeneration)
            expect(result.current.isGenerating).toBe(true);
            expect(result.current.result).not.toBeNull();
            
            // Finish generation
            act(() => {
              result.current.finishGeneration();
            });
            
            // Should transition to result state
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.result).not.toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 } // Reduced for async tests
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 10: 表单验证错误显示
   * 
   * 对于任何无效的表单字段，系统应显示该字段特定的错误消息
   * 
   * **Validates: Requirements 7.1**
   */
  it('Property 10: validation errors should be field-specific', () => {
    fc.assert(
      fc.property(
        fc.record({
          city: fc.constant(''),
          days: fc.integer({ min: 1, max: 30 }), // Use valid days range
          startDate: fc.constant(''), // Empty startDate to trigger error
        }),
        (invalidData) => {
          const { result, unmount } = renderHook(() => useItineraryForm());
          
          try {
            act(() => {
              result.current.updateField('city', invalidData.city);
              result.current.updateField('days', invalidData.days);
              result.current.updateField('startDate', invalidData.startDate);
              result.current.validateStep();
            });
            
            // Should have specific error for city
            expect(result.current.errors.city).toBeDefined();
            expect(result.current.errors.city).toBe('请选择目的地');
            
            // Should have specific error for startDate when empty
            expect(result.current.errors.startDate).toBeDefined();
            expect(result.current.errors.startDate).toBe('请选择出发日期');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 12: 未认证访问重定向
   * 
   * 对于任何未认证用户尝试访问行程规划器的操作，系统应显示错误
   * 
   * **Validates: Requirements 7.5, 9.1, 9.2**
   */
  it('Property 12: unauthenticated access should show error', async () => {
    vi.mocked(storage.readLocalString).mockReturnValue(null);
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          city: fc.string({ minLength: 1 }),
          days: fc.integer({ min: 1, max: 30 }),
        }),
        async (formData) => {
          const { result, unmount } = renderHook(() => useItineraryGenerator());
          
          try {
            const mockForm: ItineraryForm = {
              city: formData.city,
              startDate: '2024-04-01',
              endDate: '2024-04-03',
              days: formData.days,
              travelers: { count: 1, type: 'solo' },
              interests: ['历史古迹', '地道美食', '自然风光'],
              intensity: 'moderate',
              budget: 'comfortable',
              transport: 'public',
              requirements: [],
            };
            
            await act(async () => {
              await result.current.startGeneration(mockForm);
            });
            
            // Should show authentication error
            expect(result.current.error).toBe('请先登录以使用行程规划功能');
            expect(result.current.isGenerating).toBe(false);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: itinerary-planner-integration, Property 14: 登出状态清理
   * 
   * 对于任何登出操作（通过 reset），系统应清除所有行程相关的状态
   * 
   * **Validates: Requirements 9.4**
   */
  it('Property 14: reset should clear all itinerary state', async () => {
    vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          city: fc.string({ minLength: 1 }),
          days: fc.integer({ min: 1, max: 30 }),
        }),
        async (formData) => {
          const mockResult: ItineraryRecord = {
            id: 'test-id',
            form: {
              city: formData.city,
              startDate: '2024-04-01',
              endDate: '2024-04-03',
              days: formData.days,
              travelers: { count: 1, type: 'solo' },
              interests: ['历史古迹', '地道美食', '自然风光'],
              intensity: 'moderate',
              budget: 'comfortable',
              transport: 'public',
              requirements: [],
            },
            days: [],
            summary: 'Test',
            createdAt: '2024-01-01T00:00:00Z',
            totalSpots: 0,
            totalBudget: 0,
          };
          
          vi.mocked(api.apiPost).mockResolvedValue(mockResult);
          
          const { result, unmount } = renderHook(() => useItineraryGenerator());
          
          try {
            // Generate itinerary
            await act(async () => {
              await result.current.startGeneration(mockResult.form);
            });
            
            expect(result.current.result).not.toBeNull();
            
            // Reset
            act(() => {
              result.current.reset();
            });
            
            // All state should be cleared
            expect(result.current.result).toBeNull();
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.error).toBeNull();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
