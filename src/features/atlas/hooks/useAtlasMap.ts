import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import type { PoiItem } from '@/features/atlas/atlas.utils';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY as string | undefined;
const AMAP_SECURITY = import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined;

type UseAtlasMapOptions = {
  mode: 'map' | 'list';
  location: { lng: number; lat: number };
  pois: PoiItem[];
  selectedPoi: PoiItem | null;
  onSelectPoi: (poi: PoiItem) => void;
  mapCollapsed: boolean;
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
  autoLocate: boolean;
  fitVersion: number;
  centerVersion: number;
};

export const useAtlasMap = ({
  mode,
  location,
  pois,
  selectedPoi,
  onSelectPoi,
  mapCollapsed,
  mapReady,
  setMapReady,
  autoLocate,
  fitVersion,
  centerVersion,
}: UseAtlasMapOptions) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const locationMarkerRef = useRef<any>(null);
  const lastFitVersionRef = useRef<number>(0);
  const lastCenterVersionRef = useRef<number>(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('atlas-location-style')) return;
    const style = document.createElement('style');
    style.id = 'atlas-location-style';
    style.textContent = `
      .atlas-location {
        position: relative;
        width: 16px;
        height: 16px;
      }
      .atlas-location::before {
        content: '';
        position: absolute;
        inset: -10px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.2);
        animation: atlas-pulse 2.2s infinite;
      }
      .atlas-location__dot {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: #2563eb;
        border: 2px solid #fff;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.6);
      }
      @keyframes atlas-pulse {
        0% { transform: scale(0.4); opacity: 0.7; }
        70% { transform: scale(1.5); opacity: 0; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (mode !== 'map') return;
    if (!AMAP_KEY || !mapContainerRef.current) return;
    let cancelled = false;
    setMapError(null);

    if (AMAP_SECURITY) {
      window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY };
    }

    AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.Geolocation', 'AMap.Geocoder', 'AMap.AutoComplete'],
    })
      .then((AMap) => {
        if (cancelled) return;
        const map = new AMap.Map(mapContainerRef.current, {
          zoom: 12,
          center: [location.lng, location.lat],
          viewMode: '2D',
        });
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
        mapRef.current = map;
        setMapReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMapError('地图加载失败');
        setMapReady(false);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      markersRef.current = [];
      setMapReady(false);
    };
  }, [mode, setMapReady]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    // 只在手动切换中心点时更新（不跟随 autoLocate 的实时位置）
    if (centerVersion !== lastCenterVersionRef.current) {
      lastCenterVersionRef.current = centerVersion;
      // 平滑移动到新位置，并设置合适的缩放级别
      mapRef.current.setZoomAndCenter(12, [location.lng, location.lat], true, 500);
    }
  }, [centerVersion, location, mapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    const timer = window.setTimeout(() => {
      mapRef.current?.resize?.();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [mapCollapsed]);

  useEffect(() => {
    if (!mapRef.current || !mapReady || !window.AMap) return;
    if (!locationMarkerRef.current) {
      locationMarkerRef.current = new window.AMap.Marker({
        position: [location.lng, location.lat],
        content: '<div class="atlas-location"><div class="atlas-location__dot"></div></div>',
        offset: new window.AMap.Pixel(-8, -8),
      });
      locationMarkerRef.current.setMap(mapRef.current);
    } else {
      locationMarkerRef.current.setPosition([location.lng, location.lat]);
    }
  }, [location, mapReady]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const AMap = window.AMap;
    if (!AMap) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    pois.forEach((poi) => {
      if (!poi.lng || !poi.lat) return;
      const marker = new AMap.Marker({
        position: [poi.lng, poi.lat],
        title: poi.name,
      });
      marker.on('click', () => onSelectPoi(poi));
      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [mapReady, onSelectPoi, pois]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    if (fitVersion !== lastFitVersionRef.current && fitVersion > 0) {
      lastFitVersionRef.current = fitVersion;
      const fitMarkers = [...markersRef.current];
      if (locationMarkerRef.current) fitMarkers.push(locationMarkerRef.current);
      if (fitMarkers.length > 0) {
        mapRef.current.setFitView(fitMarkers, false, [60, 60, 60, 60]);
      }
    }
  }, [fitVersion, mapReady]);

  useEffect(() => {
    if (!selectedPoi || !mapRef.current || !mapReady) return;
    // 平滑移动到选中的 POI
    mapRef.current.setCenter([selectedPoi.lng, selectedPoi.lat], true, 300);
  }, [selectedPoi, mapReady]);

  return {
    mapContainerRef,
    mapError,
    hasMapKey: Boolean(AMAP_KEY),
    showMapFallback: !AMAP_KEY || Boolean(mapError),
  };
};
