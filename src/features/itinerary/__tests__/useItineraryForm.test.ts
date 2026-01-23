import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItineraryForm } from '../hooks/useItineraryForm';

describe('useItineraryForm', () => {
  describe('Unit Tests - Form State Management', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      expect(result.current.step).toBe(1);
      expect(result.current.formData.city).toBe('');
      expect(result.current.formData.days).toBe(3);
      expect(result.current.formData.travelers.type).toBe('solo');
      expect(result.current.formData.interests).toEqual([]);
      expect(result.current.formData.intensity).toBe('moderate');
      expect(result.current.formData.budget).toBe('comfortable');
      expect(result.current.formData.transport).toBe('public');
    });

    it('should update field values', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.updateField('city', '日本京都');
      });
      
      expect(result.current.formData.city).toBe('日本京都');
    });

    it('should navigate between steps', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.step).toBe(2);
      
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.step).toBe(1);
    });

    it('should not go below step 1 or above step 4', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.step).toBe(1);
      
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep();
      });
      expect(result.current.step).toBe(4);
    });
  });

  describe('Unit Tests - Step 1 Validation', () => {
    it('should validate city field', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      expect(result.current.isStepValid()).toBe(false);
      
      act(() => {
        result.current.updateField('city', '日本京都');
        result.current.updateField('startDate', '2024-04-01');
      });
      
      expect(result.current.isStepValid()).toBe(true);
    });

    it('should validate days range', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.updateField('city', '日本京都');
        result.current.updateField('startDate', '2024-04-01');
        result.current.updateField('days', 0);
      });
      
      expect(result.current.isStepValid()).toBe(false);
      
      act(() => {
        result.current.updateField('days', 5);
      });
      
      expect(result.current.isStepValid()).toBe(true);
      
      act(() => {
        result.current.updateField('days', 31);
      });
      
      expect(result.current.isStepValid()).toBe(false);
    });

    it('should show error messages for invalid step 1 fields', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.validateStep();
      });
      
      expect(result.current.errors.city).toBe('请选择目的地');
      expect(result.current.errors.startDate).toBe('请选择出发日期');
    });

    it('should clear errors when field is updated', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.validateStep();
      });
      
      expect(result.current.errors.city).toBeDefined();
      
      act(() => {
        result.current.updateField('city', '日本京都');
      });
      
      expect(result.current.errors.city).toBeUndefined();
    });
  });

  describe('Unit Tests - Step 2 Validation', () => {
    it('should require at least 3 interests', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.nextStep();
      });
      
      expect(result.current.isStepValid()).toBe(false);
      
      act(() => {
        result.current.updateField('interests', ['历史古迹', '地道美食']);
      });
      
      expect(result.current.isStepValid()).toBe(false);
      
      act(() => {
        result.current.updateField('interests', ['历史古迹', '地道美食', '自然风光']);
      });
      
      expect(result.current.isStepValid()).toBe(true);
    });

    it('should show error message when interests < 3', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.nextStep(); // Move to step 2
      });
      
      act(() => {
        result.current.validateStep();
      });
      
      expect(result.current.errors.interests).toBe('请至少选择 3 个兴趣标签');
    });
  });

  describe('Unit Tests - Step 3 Validation', () => {
    it('should validate budget and transport selection', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
      });
      
      // Default values should make step 3 valid
      expect(result.current.isStepValid()).toBe(true);
      
      act(() => {
        result.current.updateField('budget', '' as any);
      });
      
      expect(result.current.isStepValid()).toBe(false);
    });
  });

  describe('Unit Tests - Step 4 (Confirmation)', () => {
    it('should always be valid', () => {
      const { result } = renderHook(() => useItineraryForm());
      
      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.nextStep();
      });
      
      expect(result.current.isStepValid()).toBe(true);
    });
  });
});
