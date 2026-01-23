import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '@/shared/lib/api';
import { readLocal, writeLocal } from '@/shared/lib/storage';
import { DIARY_HISTORY_KEY } from '@/shared/lib/storageKeys';
import type { PosterRecord } from '@/features/diary/diary.utils';

type GeneratePosterPayload = {
  city: string;
  theme: string;
  style: string;
  language: string;
  platform: string;
  size: string;
  keywords: string[];
  prompt?: string;
  promptPolished?: string;
  copyTitlePolished?: string;
  copySubtitlePolished?: string;
};

type PolishPosterPayload = {
  city: string;
  theme: string;
  style: string;
  language: string;
  platform: string;
  size: string;
  keywords: string[];
  prompt?: string;
};

type UseDiaryPostersOptions = {
  limit?: number;
};

type DiaryPosterCache = {
  history: PosterRecord[];
  currentId?: string | null;
};

const readPosterCache = (): DiaryPosterCache => readLocal(DIARY_HISTORY_KEY, { history: [] });

export const useDiaryPosters = (options: UseDiaryPostersOptions = {}) => {
  const limit = options.limit ?? 12;
  const initialCache = useMemo(() => readPosterCache(), []);
  const [history, setHistory] = useState<PosterRecord[]>(initialCache.history ?? []);
  const [current, setCurrent] = useState<PosterRecord | null>(() => {
    const currentId = initialCache.currentId;
    if (!currentId) return initialCache.history?.[0] ?? null;
    return (
      initialCache.history?.find((item) => item.id === currentId) ??
      initialCache.history?.[0] ??
      null
    );
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishError, setPolishError] = useState('');

  useEffect(() => {
    writeLocal(DIARY_HISTORY_KEY, {
      history,
      currentId: current?.id ?? null,
    });
  }, [history, current]);

  const refreshHistory = useCallback(async () => {
    setError('');
    try {
      const data = await apiGet<PosterRecord[]>(`/posters?limit=${limit}`);
      const next = data ?? [];
      if (next.length === 0) {
        setHistory((prev) => (prev.length ? prev : []));
        setCurrent((prev) => (prev ? prev : null));
        return;
      }
      setHistory(next);
      setCurrent((prev) => {
        if (!prev) return next[0];
        return next.some((item) => item.id === prev.id) ? prev : next[0];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }, [limit]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const generatePoster = useCallback(
    async (payload: GeneratePosterPayload) => {
      setError('');
      setLoading(true);
      try {
        const data = await apiPost<PosterRecord>('/posters/generate', payload);
        if (data) {
          setHistory((prev) => {
            const next = [data, ...prev.filter((item) => item.id !== data.id)];
            return next.slice(0, limit);
          });
        }
        setCurrent(data);
        await refreshHistory();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [limit, refreshHistory]
  );

  const polishPoster = useCallback(async (payload: PolishPosterPayload) => {
    setPolishError('');
    setPolishLoading(true);
    try {
      const data = await apiPost<{
        copyTitlePolished?: string;
        copySubtitlePolished?: string;
        promptPolished?: string;
      }>('/posters/polish', payload);
      return data;
    } catch (err) {
      setPolishError(err instanceof Error ? err.message : '润色失败');
      return null;
    } finally {
      setPolishLoading(false);
    }
  }, []);

  const deletePoster = useCallback(async (id: string) => {
    setError('');
    try {
      await apiDelete(`/posters/${id}`);
      setHistory((prev) => {
        const next = prev.filter((item) => item.id !== id);
        setCurrent((prevCurrent) => (prevCurrent?.id === id ? next[0] ?? null : prevCurrent));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  }, []);

  const selectPoster = useCallback((record: PosterRecord) => {
    setCurrent(record);
  }, []);

  return {
    history,
    current,
    loading,
    error,
    refreshHistory,
    generatePoster,
    deletePoster,
    selectPoster,
    setCurrent,
    polishPoster,
    polishLoading,
    polishError,
  };
};
