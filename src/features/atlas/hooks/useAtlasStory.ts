import { useCallback, useMemo, useRef, useState } from 'react';
import { apiPost } from '@/shared/lib/api';
import type { StoryArc, StoryPoi, StoryScene } from '@/shared/types';
import type { PoiItem } from '@/features/atlas/atlas.utils';

type StartStoryParams = {
  theme?: string;
  keyword?: string;
  sceneCount?: number;
};

type StoryRequestPayload = {
  city: string;
  theme?: string;
  keyword?: string;
  location: { lng: number; lat: number };
  sceneCount?: number;
};

type UseAtlasStoryOptions = {
  city: string;
  location: { lng: number; lat: number };
  onSelectPoi?: (poi: PoiItem) => void;
  onCheckin?: (poi: PoiItem) => void;
};

const toPoiItem = (poi: StoryPoi): PoiItem => ({
  id: poi.id,
  name: poi.name,
  lng: poi.lng,
  lat: poi.lat,
  address: poi.address,
});

export const useAtlasStory = ({ city, location, onSelectPoi, onCheckin }: UseAtlasStoryOptions) => {
  const [open, setOpen] = useState(false);
  const [arc, setArc] = useState<StoryArc | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastParamsRef = useRef<StartStoryParams | null>(null);

  const scenes = arc?.scenes ?? [];
  const currentScene = scenes[currentIndex] ?? null;

  const focusScene = useCallback(
    (scene: StoryScene | null) => {
      if (!scene) return;
      onSelectPoi?.(toPoiItem(scene.poi));
    },
    [onSelectPoi],
  );

  const applyArc = useCallback(
    (nextArc: StoryArc) => {
      setArc(nextArc);
      setCurrentIndex(0);
      focusScene(nextArc.scenes?.[0] ?? null);
    },
    [focusScene],
  );

  const startStory = useCallback(
    async (params: StartStoryParams = {}) => {
      lastParamsRef.current = params;
      setOpen(true);
      setLoading(true);
      setError(null);

      const payload: StoryRequestPayload = {
        city,
        theme: params.theme,
        keyword: params.keyword,
        location,
        sceneCount: params.sceneCount,
      };

      try {
        const data = await apiPost<StoryArc>('/story/arc', payload);
        if (data) {
          applyArc(data);
        } else {
          setError('生成失败，请稍后再试');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    },
    [applyArc, city, location],
  );

  const regenerateStory = useCallback(() => {
    startStory(lastParamsRef.current ?? {});
  }, [startStory]);

  const selectScene = useCallback(
    (index: number) => {
      if (!scenes.length) return;
      const next = Math.max(0, Math.min(index, scenes.length - 1));
      setCurrentIndex(next);
      focusScene(scenes[next] ?? null);
    },
    [focusScene, scenes],
  );

  const nextScene = useCallback(() => {
    selectScene(currentIndex + 1);
  }, [currentIndex, selectScene]);

  const prevScene = useCallback(() => {
    selectScene(currentIndex - 1);
  }, [currentIndex, selectScene]);

  const checkinScene = useCallback(() => {
    if (!currentScene) return;
    onCheckin?.(toPoiItem(currentScene.poi));
  }, [currentScene, onCheckin]);

  const closeStory = useCallback(() => {
    setOpen(false);
  }, []);

  const hasScenes = useMemo(() => scenes.length > 0, [scenes.length]);

  return {
    open,
    arc,
    scenes,
    currentScene,
    currentIndex,
    loading,
    error,
    hasScenes,
    startStory,
    regenerateStory,
    selectScene,
    nextScene,
    prevScene,
    checkinScene,
    closeStory,
    setOpen,
  };
};
