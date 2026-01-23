import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useItineraryGenerator } from '../hooks/useItineraryGenerator';
import * as api from '@/shared/lib/api';
import * as storage from '@/shared/lib/storage';
import { ItineraryForm, ItineraryRecord } from '../itinerary.types';

// Mock modules
vi.mock('@/shared/lib/api', async () => {
  const actual = await vi.importActual('@/shared/lib/api');
  return {
    ...actual,
    apiPost: vi.fn(),
  };
});
vi.mock('@/shared/lib/storage');

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

const mockResult: ItineraryRecord = {
  id: 'test-id',
  form: mockForm,
  days: [
    {
      date: '2024-04-01',
      dayNumber: 1,
      theme: '古都探索',
      activities: [
        {
          id: 'act-1',
          time: '09:00',
          duration: 120,
          title: '清水寺',
          description: '参观著名的清水寺',
          category: '历史古迹',
        },
      ],
      totalDistance: 5,
      totalCost: 5000,
    },
  ],
  summary: '京都三日游',
  createdAt: '2024-01-01T00:00:00Z',
  totalSpots: 1,
  totalBudget: 5000,
};

describe('useItineraryGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests - Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useItineraryGenerator());
      
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Unit Tests - Authentication Check', () => {
    it('should show error when user is not authenticated', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue(null);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBe('请先登录以使用行程规划功能');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should proceed with generation when authenticated', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Unit Tests - Successful Generation', () => {
    it('should set isGenerating to true during generation', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResult), 100))
      );
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      act(() => {
        result.current.startGeneration(mockForm);
      });
      
      expect(result.current.isGenerating).toBe(true);
      
      await waitFor(() => {
        expect(result.current.result).not.toBeNull();
      });
    });

    it('should store result on successful generation', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should call finishGeneration to complete the flow', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.isGenerating).toBe(true);
      
      act(() => {
        result.current.finishGeneration();
      });
      
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Unit Tests - Error Handling', () => {
    it('should handle 401 authentication error', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      
      // Import the actual ApiError class and create a real instance
      const { ApiError } = await import('@/shared/lib/api');
      const error = new ApiError('Request failed: 401', 401, {});
      
      vi.mocked(api.apiPost).mockRejectedValue(error);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBe('登录已过期，请重新登录');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle 400 validation error', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      
      const { ApiError } = await import('@/shared/lib/api');
      const error = new ApiError('Request failed: 400', 400, {
        message: '表单数据无效',
        details: { city: '目的地不能为空' }
      });
      
      vi.mocked(api.apiPost).mockRejectedValue(error);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBe('目的地不能为空');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle 500 server error', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      
      const { ApiError } = await import('@/shared/lib/api');
      const error = new ApiError('Request failed: 500', 500, {});
      
      vi.mocked(api.apiPost).mockRejectedValue(error);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBe('服务器繁忙，请稍后重试');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should handle network error', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockRejectedValue(
        new Error('fetch failed')
      );
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBe('网络连接失败，请检查网络后重试');
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Unit Tests - Retry Functionality', () => {
    it('should allow retry after error', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResult);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBeTruthy();
      
      await act(async () => {
        result.current.retry();
      });
      
      await waitFor(() => {
        expect(result.current.result).toEqual(mockResult);
      });
    });
  });

  describe('Unit Tests - Reset Functionality', () => {
    it('should reset all state', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockResolvedValue(mockResult);
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.result).not.toBeNull();
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.result).toBeNull();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Unit Tests - Clear Error', () => {
    it('should clear error message', async () => {
      vi.mocked(storage.readLocalString).mockReturnValue('valid-token');
      vi.mocked(api.apiPost).mockRejectedValue(new Error('Test error'));
      
      const { result } = renderHook(() => useItineraryGenerator());
      
      await act(async () => {
        await result.current.startGeneration(mockForm);
      });
      
      expect(result.current.error).toBeTruthy();
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });
});
