import { useCallback, useEffect, useRef, useState } from 'react';
import type { TravelMode } from '@/features/atlas/atlas.utils';

export const useAtlasUiState = () => {
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [autoLocate, setAutoLocate] = useState(true);
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const toastTimerRef = useRef<number | null>(null);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return {
    mode,
    setMode,
    headerCollapsed,
    setHeaderCollapsed,
    mapCollapsed,
    setMapCollapsed,
    showNearbyModal,
    setShowNearbyModal,
    showRouteDetail,
    setShowRouteDetail,
    toast,
    pushToast,
    autoLocate,
    setAutoLocate,
    travelMode,
    setTravelMode,
  };
};
