import { useState } from 'react';
import { ItineraryForm, ItineraryRecord } from '../itinerary.types';
import { apiPost, ApiError } from '@/shared/lib/api';
import { readLocalString } from '@/shared/lib/storage';
import { AUTH_TOKEN_KEY } from '@/shared/lib/storageKeys';

export function useItineraryGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ItineraryRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryForm, setRetryForm] = useState<ItineraryForm | null>(null);

  const startGeneration = async (form: ItineraryForm) => {
    // Check authentication
    const token = readLocalString(AUTH_TOKEN_KEY);
    if (!token) {
      setError('请先登录以使用行程规划功能');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRetryForm(form);

    try {
      // Call API to generate itinerary
      const response = await apiPost<ItineraryRecord>('/itineraries', form);
      setResult(response);
      setError(null);
      setRetryForm(null);
    } catch (err) {
      setIsGenerating(false);
      
      if (err instanceof ApiError) {
        // Handle specific error cases
        if (err.status === 401) {
          setError('登录已过期，请重新登录');
        } else if (err.status === 400) {
          // Validation error
          const payload = err.payload as any;
          if (payload?.details) {
            // Extract first error message from details
            const firstError = Object.values(payload.details)[0] as string;
            setError(firstError || '表单数据无效，请检查输入');
          } else {
            setError(payload?.message || '表单数据无效，请检查输入');
          }
        } else if (err.status === 500) {
          setError('服务器繁忙，请稍后重试');
        } else {
          setError(err.message || '生成行程失败，请重试');
        }
      } else if (err instanceof Error) {
        // Network or other errors
        if (err.message.includes('fetch')) {
          setError('网络连接失败，请检查网络后重试');
        } else {
          setError(err.message || '生成行程失败，请重试');
        }
      } else {
        setError('生成行程失败，请重试');
      }
    }
  };

  const finishGeneration = () => {
    // Called by ItineraryAgentFlow after animation completes
    setIsGenerating(false);
  };

  const retry = () => {
    if (retryForm) {
      startGeneration(retryForm);
    }
  };

  const reset = () => {
    setResult(null);
    setIsGenerating(false);
    setError(null);
    setRetryForm(null);
  };

  const clearError = () => {
    setError(null);
  };

  return { 
    isGenerating, 
    result, 
    error,
    startGeneration, 
    finishGeneration, 
    retry,
    reset,
    clearError
  };
}
