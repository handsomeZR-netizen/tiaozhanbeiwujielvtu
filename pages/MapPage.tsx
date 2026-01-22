import React, { useEffect, useMemo, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  CloudSun,
  List,
  Loader2,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Navigation,
  Route,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap?: any;
  }
}

type PoiItem = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
  reason?: string;
  tags?: string[];
  distance?: number;
};

type WeatherInfo = {
  city: string;
  weather: string;
  temperature: string;
  windDirection?: string;
};

type RouteInfo = {
  distanceMeters: number;
  durationSeconds: number;
  steps: { instruction: string }[];
};

type TravelMode = 'walking' | 'driving' | 'transit';

type CitySuggestion = {
  name: string;
  district?: string;
};

type CachedPois = {
  items: PoiItem[];
  ts: number;
};

type CachedWeather = {
  data: WeatherInfo;
  ts: number;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';
const AMAP_KEY = import.meta.env.VITE_AMAP_KEY as string | undefined;
const AMAP_SECURITY = import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined;

const DEFAULT_CITY = '北京';
const DEFAULT_LOCATION = { lng: 116.397428, lat: 39.90923 };

const CATEGORIES = ['推荐', '咖啡', '美食', '博物馆', '夜景', '公园'];
const CITY_OPTIONS = ['北京', '上海', '广州', '成都', '西安'];
const CACHE_PREFIX = 'atlas';
const FAVORITES_KEY = `${CACHE_PREFIX}_favorites`;
const CHECKINS_KEY = `${CACHE_PREFIX}_checkins`;
const SEARCH_HISTORY_KEY = `${CACHE_PREFIX}_search_history`;

const toNumber = (value: string | number | undefined) => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const readLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const normalizePoiList = (payload: any): PoiItem[] => {
  const data = payload?.data ?? payload;
  if (!data) return [];

  if (Array.isArray(data.items)) {
    return data.items.map((item: any, index: number) => ({
      id: item.id ?? `mock_${index}`,
      name: item.name ?? '未知地点',
      lng: toNumber(item.lng),
      lat: toNumber(item.lat),
      reason: item.reason,
      address: item.address,
      tags: item.tags ?? [],
    }));
  }

  if (Array.isArray(data.pois)) {
    return data.pois.map((poi: any, index: number) => {
      const [lng, lat] = String(poi.location ?? '').split(',').map(Number);
      return {
        id: poi.id ?? `poi_${index}`,
        name: poi.name ?? '未知地点',
        lng: lng || 0,
        lat: lat || 0,
        address: poi.address,
        tags: poi.type ? [poi.type] : [],
        distance: toNumber(poi.distance),
      };
    });
  }

  return [];
};

const normalizeWeather = (payload: any): WeatherInfo | null => {
  const data = payload?.data ?? payload;
  if (!data) return null;
  if (data.weather && data.temperature) return data as WeatherInfo;
  const live = data?.lives?.[0];
  if (!live) return null;
  return {
    city: live.city,
    weather: live.weather,
    temperature: `${live.temperature}°C`,
    windDirection: live.winddirection,
  };
};

const normalizeRoute = (payload: any): RouteInfo | null => {
  const data = payload?.data ?? payload;
  if (!data) return null;
  if (data.distanceMeters) return data as RouteInfo;
  const path = data?.route?.paths?.[0];
  if (!path) return null;
  return {
    distanceMeters: toNumber(path.distance),
    durationSeconds: toNumber(path.duration),
    steps: (path.steps ?? []).map((step: any) => ({ instruction: step.instruction })),
  };
};

const formatDistance = (meters: number) => {
  if (!meters) return '未知距离';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '未知时长';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} 分钟`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return `${hours} 小时 ${rest} 分钟`;
};

export const MapPage: React.FC = () => {
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [cityInput, setCityInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('推荐');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<PoiItem | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [aiContext, setAiContext] = useState<string | null>(null);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<PoiItem[]>(() => readLocal(FAVORITES_KEY, []));
  const [checkins, setCheckins] = useState<PoiItem[]>(() => readLocal(CHECKINS_KEY, []));
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [cityHistory, setCityHistory] = useState<string[]>(() => readLocal(`${CACHE_PREFIX}_city_history`, []));
  const [autoLocate, setAutoLocate] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => readLocal(SEARCH_HISTORY_KEY, []));
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showCityPanel, setShowCityPanel] = useState(false);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  const watchIdRef = useRef<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const locationMarkerRef = useRef<any>(null);
  const toastTimerRef = useRef<number | null>(null);
  const citySearchTimerRef = useRef<number | null>(null);

  const activeKeyword = keyword.trim() || (activeCategory === '推荐' ? '景点' : activeCategory);
  const cityOptions = useMemo(() => {
    if (!city) return CITY_OPTIONS;
    return CITY_OPTIONS.includes(city) ? CITY_OPTIONS : [city, ...CITY_OPTIONS];
  }, [city]);
  const cacheKey = useMemo(() => `${CACHE_PREFIX}_pois_${city}_${activeKeyword}`, [city, activeKeyword]);
  const weatherKey = useMemo(() => `${CACHE_PREFIX}_weather_${city}`, [city]);

  const bounds = useMemo(() => {
    if (!pois.length) {
      return { minLng: location.lng, maxLng: location.lng, minLat: location.lat, maxLat: location.lat };
    }
    const lngs = pois.map((p) => p.lng);
    const lats = pois.map((p) => p.lat);
    return {
      minLng: Math.min(...lngs, location.lng),
      maxLng: Math.max(...lngs, location.lng),
      minLat: Math.min(...lats, location.lat),
      maxLat: Math.max(...lats, location.lat),
    };
  }, [pois, location]);

  const pushToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2000);
  };

  const requestJson = async (path: string, init?: RequestInit) => {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  };

  const handleSelectPoi = (poi: PoiItem) => {
    setSelectedPoi(poi);
    setRouteInfo(null);
    setShowRouteDetail(false);
    setAiContext(null);
    setAiTags([]);
  };

  const applyCity = async (nextCity?: string) => {
    const target = (nextCity ?? cityInput).trim();
    if (!target) return;
    setCity(target);
    setKeyword('');
    if (!cityHistory.includes(target)) {
      const next = [target, ...cityHistory].slice(0, 6);
      setCityHistory(next);
      writeLocal(`${CACHE_PREFIX}_city_history`, next);
    }
    try {
      const data = await requestJson(`/map/geocode?address=${encodeURIComponent(target)}`);
      const geocode = data?.data?.geocodes?.[0] ?? data?.geocodes?.[0];
      const locationStr = geocode?.location;
      if (locationStr) {
        const [lng, lat] = String(locationStr).split(',').map(Number);
        if (lng && lat) {
          setLocation({ lng, lat });
          resolveCityFromLocation(lng, lat);
        }
      }
    } catch {
      // ignore
    }
  };

  const addSearchHistory = (term: string) => {
    if (!term) return;
    const next = [term, ...searchHistory.filter((item) => item !== term)].slice(0, 8);
    setSearchHistory(next);
    writeLocal(SEARCH_HISTORY_KEY, next);
  };

  const getPosition = (poi: PoiItem) => {
    const { minLng, maxLng, minLat, maxLat } = bounds;
    const lngRange = maxLng - minLng || 0.01;
    const latRange = maxLat - minLat || 0.01;
    const x = ((poi.lng - minLng) / lngRange) * 80 + 10;
    const y = (1 - (poi.lat - minLat) / latRange) * 70 + 15;
    return { left: `${x}%`, top: `${y}%` };
  };

  const loadPois = async (override?: { keyword?: string; category?: string; city?: string }) => {
    setLoadingPois(true);
    const searchCity = override?.city ?? city;
    const inputKeyword = override?.keyword ?? keyword;
    const activeCategoryLocal = override?.category ?? activeCategory;
    const searchKeyword =
      inputKeyword.trim() || (activeCategoryLocal === '推荐' ? '景点' : activeCategoryLocal);
    const keyForCache = `${CACHE_PREFIX}_pois_${searchCity}_${searchKeyword}`;
    const cached = readLocal<CachedPois | null>(keyForCache, null);
    if (!isOnline && cached?.items?.length) {
      setPois(cached.items);
      setLoadingPois(false);
      pushToast('离线模式：已使用缓存数据');
      return;
    }
    try {
      const locationParam = location?.lng && location?.lat ? `&location=${location.lng},${location.lat}&radius=2000` : '';
      const data = await requestJson(
        `/map/poi?city=${encodeURIComponent(searchCity)}&keyword=${encodeURIComponent(searchKeyword)}${locationParam}`
      );
      const normalized = normalizePoiList(data);
      setPois(normalized);
      writeLocal(keyForCache, { items: normalized, ts: Date.now() });
      addSearchHistory(searchKeyword);
      setLastQuery(searchKeyword);
    } catch {
      if (cached?.items?.length) {
        setPois(cached.items);
        pushToast('已使用缓存数据');
      } else {
        setPois([]);
      }
    } finally {
      setLoadingPois(false);
    }
  };

  const loadWeather = async () => {
    const cached = readLocal<CachedWeather | null>(weatherKey, null);
    if (!isOnline && cached?.data) {
      setWeather(cached.data);
      return;
    }
    try {
      const data = await requestJson(`/map/weather?city=${encodeURIComponent(city)}`);
      const normalized = normalizeWeather(data);
      if (normalized) {
        setWeather(normalized);
        writeLocal(weatherKey, { data: normalized, ts: Date.now() });
      }
    } catch {
      if (cached?.data) setWeather(cached.data);
      else setWeather(null);
    }
  };

  const resolveCityFromLocation = async (lng: number, lat: number) => {
    if (window.AMap?.Geocoder) {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getAddress([lng, lat], (status: string, result: any) => {
        if (status !== 'complete') return;
        const comp = result?.regeocode?.addressComponent;
        if (!comp) return;
        const rawCity = Array.isArray(comp.city) ? comp.city[0] : comp.city;
        const detected = rawCity || comp.province || comp.district;
        if (detected) setCity(detected);
      });
      return;
    }

    try {
      const data = await requestJson(`/map/regeo?location=${lng},${lat}`);
      const comp = data?.data?.regeocode?.addressComponent ?? data?.regeocode?.addressComponent;
      if (!comp) return;
      const rawCity = Array.isArray(comp.city) ? comp.city[0] : comp.city;
      const detected = rawCity || comp.province || comp.district;
      if (detected) setCity(detected);
    } catch {
      // ignore
    }
  };

  const locateUser = () => {
    const fallbackNavigator = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const raw = { lng: pos.coords.longitude, lat: pos.coords.latitude };
          setAccuracyMeters(Math.round(pos.coords.accuracy));
          if (window.AMap?.convertFrom) {
            window.AMap.convertFrom([raw.lng, raw.lat], 'gps', (status: string, result: any) => {
              if (status === 'complete' && result?.locations?.length) {
                const loc = result.locations[0];
                setLocation({ lng: loc.lng, lat: loc.lat });
                resolveCityFromLocation(loc.lng, loc.lat);
                setLocating(false);
                return;
              }
              setLocation(raw);
              resolveCityFromLocation(raw.lng, raw.lat);
              setLocating(false);
            });
          } else {
            setLocation(raw);
            resolveCityFromLocation(raw.lng, raw.lat);
            setLocating(false);
          }
        },
        () => {
          setLocating(false);
          pushToast('定位失败，请手动选择城市');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    setLocating(true);

    if (window.AMap?.Geolocation && mapReady) {
      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        needAddress: false,
        convert: true,
      });
      geolocation.getCurrentPosition((status: string, result: any) => {
        if (status === 'complete' && result?.position) {
          setLocation({ lng: result.position.lng, lat: result.position.lat });
          if (typeof result.accuracy === 'number') {
            setAccuracyMeters(Math.round(result.accuracy));
          }
          const detected = result?.addressComponent?.city || result?.addressComponent?.province;
          if (detected) {
            setCity(detected);
          } else {
            resolveCityFromLocation(result.position.lng, result.position.lat);
          }
          setLocating(false);
        } else {
          fallbackNavigator();
        }
      });
      return;
    }

    fallbackNavigator();
  };

  const loadCitySuggestions = (query: string) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      return;
    }
    if (!window.AMap?.AutoComplete) {
      setCitySuggestions([]);
      return;
    }
    setCitySearchLoading(true);
    const auto = new window.AMap.AutoComplete({ city: '' });
    auto.search(query, (_status: string, result: any) => {
      const tips = result?.tips ?? [];
      const next = tips
        .filter((tip: any) => tip?.name)
        .map((tip: any) => ({ name: tip.name, district: tip.district }));
      setCitySuggestions(next.slice(0, 6));
      setCitySearchLoading(false);
    });
  };

  const loadRoute = async (poi: PoiItem) => {
    setRouteInfo(null);
    setShowRouteDetail(false);
    try {
      const from = `${location.lng},${location.lat}`;
      const to = `${poi.lng},${poi.lat}`;
      const data = await requestJson(`/map/route?from=${from}&to=${to}&mode=${travelMode}`);
      setRouteInfo(normalizeRoute(data));
      setShowRouteDetail(true);
    } catch {
      setRouteInfo(null);
    }
  };

  const loadAiContext = async (poi: PoiItem) => {
    setLoadingAi(true);
    try {
      const [contextRes, tagsRes] = await Promise.all([
        requestJson('/ai/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `请解释 ${poi.name} 的文化意义或旅行价值。` }),
        }),
        requestJson('/ai/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: poi.name }),
        }),
      ]);

      const context =
        contextRes?.data?.result?.summary ||
        contextRes?.data?.choices?.[0]?.message?.content ||
        '暂无文化解码内容。';

      const tags = contextRes?.data?.result?.tags || tagsRes?.data?.result || [];

      setAiContext(context);
      setAiTags(Array.isArray(tags) ? tags : []);
    } catch {
      setAiContext('暂无文化解码内容。');
      setAiTags([]);
    } finally {
      setLoadingAi(false);
    }
  };

  const toggleFavorite = async (poi: PoiItem) => {
    const exists = favorites.some((item) => item.id === poi.id);
    const next = exists ? favorites.filter((item) => item.id !== poi.id) : [poi, ...favorites];
    setFavorites(next);
    pushToast(exists ? '已取消收藏' : '已收藏');
    try {
      await requestJson('/atlas/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poi, remove: exists }),
      });
    } catch {
      // ignore
    }
  };

  const addCheckin = async (poi: PoiItem) => {
    if (checkins.some((item) => item.id === poi.id)) {
      pushToast('已打卡');
      return;
    }
    const next = [poi, ...checkins];
    setCheckins(next);
    pushToast('打卡成功');
    try {
      await requestJson('/atlas/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poi }),
      });
    } catch {
      // ignore
    }
  };

  const sharePoi = async (poi: PoiItem) => {
    try {
      const shareRes = await requestJson('/share', { method: 'POST' });
      const shareData = shareRes?.data;
      if (navigator.share) {
        await navigator.share({
          title: shareData?.title ?? poi.name,
          text: shareData?.description ?? poi.address ?? '',
          url: window.location.href,
        });
      }
      pushToast('分享卡片已生成');
    } catch {
      pushToast('分享失败，请稍后再试');
    }
  };

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    writeLocal(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    writeLocal(CHECKINS_KEY, checkins);
  }, [checkins]);

  useEffect(() => {
    const cached = readLocal<CachedPois | null>(cacheKey, null);
    if (cached?.items?.length) {
      setPois(cached.items);
    }
  }, [cacheKey]);

  useEffect(() => {
    setCityInput(city);
  }, [city]);

  useEffect(() => {
    if (citySearchTimerRef.current) {
      window.clearTimeout(citySearchTimerRef.current);
    }
    if (!showCityPanel) return;
    citySearchTimerRef.current = window.setTimeout(() => {
      loadCitySuggestions(cityInput);
    }, 300);
    return () => {
      if (citySearchTimerRef.current) {
        window.clearTimeout(citySearchTimerRef.current);
      }
    };
  }, [cityInput, showCityPanel]);

  useEffect(() => {
    if (!autoLocate) return;
    if (watchIdRef.current !== null) return;
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setAccuracyMeters(Math.round(pos.coords.accuracy));
        resolveCityFromLocation(pos.coords.longitude, pos.coords.latitude);
      },
      () => {
        // ignore
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoLocate]);

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
    loadWeather();
  }, [city]);

  useEffect(() => {
    if (keyword.trim() === '') {
      loadPois();
    }
  }, [city, activeCategory, keyword]);

  useEffect(() => {
    const sync = async () => {
      try {
        const favoritesRes = await requestJson('/atlas/favorites');
        if (Array.isArray(favoritesRes?.data)) {
          setFavorites(favoritesRes.data);
        }
      } catch {
        // ignore
      }
      try {
        const checkinsRes = await requestJson('/atlas/checkins');
        if (Array.isArray(checkinsRes?.data)) {
          setCheckins(checkinsRes.data);
        }
      } catch {
        // ignore
      }
    };
    sync();
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
  }, [mode]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    mapRef.current.setCenter([location.lng, location.lat]);
  }, [location, mapReady]);

  useEffect(() => {
    if (!mapRef.current || !mapReady || !window.AMap) return;
    if (!locationMarkerRef.current) {
      locationMarkerRef.current = new window.AMap.Marker({
        position: [location.lng, location.lat],
        content:
          '<div class="atlas-location"><div class="atlas-location__dot"></div></div>',
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
      marker.on('click', () => handleSelectPoi(poi));
      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });
    const fitMarkers = [...markersRef.current];
    if (locationMarkerRef.current) fitMarkers.push(locationMarkerRef.current);
    if (fitMarkers.length > 0) {
      mapRef.current.setFitView(fitMarkers);
    }
  }, [pois, mapReady]);

  useEffect(() => {
    if (!selectedPoi || !mapRef.current || !mapReady) return;
    mapRef.current.setCenter([selectedPoi.lng, selectedPoi.lat]);
  }, [selectedPoi, mapReady]);

  const isFavorite = selectedPoi ? favorites.some((item) => item.id === selectedPoi.id) : false;
  const hasCheckin = selectedPoi ? checkins.some((item) => item.id === selectedPoi.id) : false;
  const showMapFallback = !AMAP_KEY || mapError;

  return (
    <div className="min-h-screen bg-paper pb-24 bg-texture">
      <div className="bg-white border-b border-stone-200 p-5 pt-10 rounded-b-[2rem] shadow-paper">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Atlas</p>
            <h1 className="text-3xl font-serif font-bold text-ink">城市图鉴</h1>
          </div>
          <button
            onClick={() => setMode(mode === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-full text-xs font-bold text-stone-600 border border-stone-200"
          >
            {mode === 'map' ? <List size={14} /> : <MapIcon size={14} />}
            {mode === 'map' ? '列表' : '地图'}
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-3 py-2 flex items-center gap-2">
            <Search size={16} className="text-stone-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadPois();
              }}
              placeholder="搜索图鉴地点，比如：咖啡、博物馆..."
              className="bg-transparent w-full text-sm outline-none text-ink"
            />
          </div>
          <button
            onClick={() => loadPois()}
            className="bg-ink text-paper px-4 py-2 rounded-full text-xs font-bold"
          >
            搜索
          </button>
        </div>

        {searchHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] text-stone-500">
            <span className="uppercase tracking-widest text-stone-400">历史</span>
            {searchHistory.slice(0, 6).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setKeyword(item);
                  setActiveCategory('推荐');
                  loadPois({ keyword: item, category: '推荐' });
                }}
                className="px-2 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-400"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                setSearchHistory([]);
                writeLocal(SEARCH_HISTORY_KEY, []);
              }}
              className="text-stone-400 hover:text-stone-600"
            >
              清空
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setKeyword('');
                loadPois({ category, keyword: '' });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                activeCategory === category
                  ? 'bg-stamp text-white border-stamp'
                  : 'bg-white text-stone-500 border-stone-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-3 py-1">
                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onFocus={() => setShowCityPanel(true)}
                  onBlur={() => setTimeout(() => setShowCityPanel(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyCity();
                  }}
                  placeholder="搜索城市"
                  className="bg-transparent text-xs w-20 outline-none"
                />
                <button
                  onClick={() => applyCity()}
                  className="text-[10px] font-bold text-stone-500 hover:text-stone-700"
                >
                  切换
                </button>
              </div>
              {showCityPanel && (citySuggestions.length > 0 || cityHistory.length > 0) && (
                <div className="absolute left-0 top-9 z-30 w-48 bg-white border border-stone-200 rounded-xl shadow-lg p-2 text-[11px] text-stone-600">
                  {citySearchLoading && (
                    <div className="flex items-center gap-2 px-2 py-1 text-stone-400">
                      <Loader2 size={12} className="animate-spin" /> 搜索中...
                    </div>
                  )}
                  {citySuggestions.map((item) => (
                    <button
                      key={`${item.name}-${item.district}`}
                      onClick={() => applyCity(item.name)}
                      className="w-full text-left px-2 py-1 rounded-lg hover:bg-stone-50"
                    >
                      {item.name}
                      {item.district ? <span className="text-stone-400 ml-1">{item.district}</span> : null}
                    </button>
                  ))}
                  {citySuggestions.length === 0 && cityHistory.length > 0 && (
                    <div className="px-2 py-1 text-stone-400">最近访问</div>
                  )}
                  {cityHistory.map((name) => (
                    <button
                      key={`history-${name}`}
                      onClick={() => applyCity(name)}
                      className="w-full text-left px-2 py-1 rounded-lg hover:bg-stone-50"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              value={city}
              onChange={(e) => applyCity(e.target.value)}
              className="bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-xs"
            >
              {cityHistory.length > 0 && (
                <optgroup label="最近">
                  {cityHistory.map((c) => (
                    <option key={`recent-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              )}
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {weather && (
              <div className="flex items-center gap-2 text-stone-600">
                <CloudSun size={14} />
                <span>
                  {weather.weather} {weather.temperature}
                </span>
              </div>
            )}
          </div>
          <button onClick={locateUser} className="flex items-center gap-1 text-stone-500 hover:text-stone-700">
            {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            定位
          </button>
        </div>
        {accuracyMeters && (
          <div className="mt-2 text-[10px] text-stone-400">
            定位精度约 {accuracyMeters} 米
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} />
          当前离线，正在使用缓存数据
        </div>
      )}

      <div className="p-5 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-2 py-1 text-[10px] text-stone-600">
            <span>自动定位</span>
            <button
              onClick={() => setAutoLocate((prev) => !prev)}
              className={`px-2 py-0.5 rounded-full font-bold ${autoLocate ? 'bg-emerald-600 text-white' : 'bg-white text-stone-500'}`}
            >
              {autoLocate ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-2 py-1 text-[10px] text-stone-600">
            <span>出行方式</span>
            {(['walking', 'driving', 'transit'] as TravelMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTravelMode(mode)}
                className={`px-2 py-0.5 rounded-full font-bold ${
                  travelMode === mode ? 'bg-stamp text-white' : 'bg-white text-stone-500'
                }`}
              >
                {mode === 'walking' ? '步行' : mode === 'driving' ? '驾车' : '公交'}
              </button>
            ))}
          </div>
        </div>
        {mode === 'map' && (
          <div className="space-y-4">
            <div className="relative h-[380px] rounded-2xl border border-stone-200 overflow-hidden shadow-paper">
              {!showMapFallback && (
                <div className="absolute inset-0 bg-stone-100">
                  <div ref={mapContainerRef} className="absolute inset-0" />
                  {!mapReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-500 bg-white/70">
                      <Loader2 className="animate-spin mr-2" size={16} /> 正在加载地图...
                    </div>
                  )}
                </div>
              )}

              {showMapFallback && (
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),rgba(0,0,0,0))]" />
                  <div className="absolute top-3 left-3 text-[10px] bg-white/80 px-2 py-1 rounded-full border border-stone-200">
                    图鉴模式 {AMAP_KEY ? '' : '· 未配置高德Key'}
                  </div>

                  <div
                    className="absolute w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                    style={{ left: '50%', top: '55%' }}
                    title="当前位置"
                  />

                  {pois.map((poi) => (
                    <button
                      key={poi.id}
                      onClick={() => handleSelectPoi(poi)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 ${
                        selectedPoi?.id === poi.id ? 'text-stamp' : 'text-ink'
                      }`}
                      style={getPosition(poi)}
                    >
                      <div
                        className={`p-2 rounded-full shadow-md border ${
                          selectedPoi?.id === poi.id ? 'bg-stamp text-white border-stamp' : 'bg-white border-stone-200'
                        }`}
                      >
                        <MapPin size={16} />
                      </div>
                      <span className="text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
                        {poi.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {mapError && (
                <div className="absolute bottom-3 left-3 text-[10px] bg-white/90 px-2 py-1 rounded-full border border-stone-200">
                  {mapError}
                </div>
              )}

              {loadingPois && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="animate-spin text-stone-500" />
                </div>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-paper">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">附近结果</div>
                <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full border border-stone-200">
                  {pois.length} 条
                </span>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {pois.slice(0, 10).map((poi) => (
                  <button
                    key={`card-${poi.id}`}
                    onClick={() => handleSelectPoi(poi)}
                    className={`min-w-[180px] text-left bg-stone-50 border rounded-xl p-3 transition-all duration-300 ${
                      selectedPoi?.id === poi.id
                        ? 'border-stamp shadow-float -translate-y-1'
                        : 'border-stone-200 hover:border-stone-300 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="text-sm font-serif font-bold text-ink line-clamp-2">{poi.name}</div>
                    <div className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                      {poi.address || poi.reason || '附近推荐'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(poi.tags && poi.tags.length ? poi.tags : ['#图鉴']).slice(0, 2).map((tag) => (
                        <span
                          key={`${poi.id}-${tag}`}
                          className="text-[9px] bg-white text-stone-500 px-2 py-0.5 rounded-full border border-stone-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                {pois.length === 0 && (
                  <div className="text-xs text-stone-400">暂无结果，试试切换类别或扩大搜索范围。</div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'list' && (
          <div className="space-y-4">
            {loadingPois && (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Loader2 size={14} className="animate-spin" /> 正在加载图鉴...
              </div>
            )}
            {!loadingPois && pois.length === 0 && (
              <div className="text-sm text-stone-400">
                暂无结果：{lastQuery || '当前条件'}，请换个关键词或城市。
              </div>
            )}
            {pois.map((poi) => (
              <button
                key={poi.id}
                onClick={() => handleSelectPoi(poi)}
                className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 shadow-paper"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-ink">{poi.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">{poi.address || poi.reason || '城市精选推荐点'}</p>
                  </div>
                  <span className="text-xs text-stone-400">{poi.distance ? formatDistance(poi.distance) : ''}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(poi.tags && poi.tags.length ? poi.tags : ['#图鉴']).slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedPoi && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-float relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-full" />
            <div className="relative">
              <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
                <MapPin size={18} className="text-stamp" /> {selectedPoi.name}
              </h2>
              <p className="text-xs text-stone-500 mt-2">{selectedPoi.address || selectedPoi.reason || '城市图鉴推荐点'}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {(selectedPoi.tags && selectedPoi.tags.length ? selectedPoi.tags : ['#图鉴']).slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => loadRoute(selectedPoi)}
                  className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-full text-xs font-bold"
                >
                  <Route size={14} /> 一键路线
                </button>
                <button
                  onClick={() => loadAiContext(selectedPoi)}
                  className="flex items-center gap-2 bg-stone-100 text-stone-700 px-4 py-2 rounded-full text-xs font-bold"
                >
                  <Sparkles size={14} /> 文化解码
                </button>
                <button
                  onClick={() => toggleFavorite(selectedPoi)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
                    isFavorite ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  <Bookmark size={14} /> {isFavorite ? '已收藏' : '收藏'}
                </button>
                <button
                  onClick={() => addCheckin(selectedPoi)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
                    hasCheckin ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  <CheckCircle2 size={14} /> {hasCheckin ? '已打卡' : '打卡'}
                </button>
                <button
                  onClick={() => sharePoi(selectedPoi)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-stone-100 text-stone-700"
                >
                  <Share2 size={14} /> 分享
                </button>
              </div>

              {routeInfo && (
                <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                      <Navigation size={14} /> 路线建议
                    </div>
                    <button
                      onClick={() => setShowRouteDetail((prev) => !prev)}
                      className="text-[10px] font-bold text-stone-500 uppercase tracking-widest"
                    >
                      {showRouteDetail ? '收起' : '展开'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatDistance(routeInfo.distanceMeters)} · {formatDuration(routeInfo.durationSeconds)}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-stone-600 max-h-32 overflow-auto">
                    {(showRouteDetail ? routeInfo.steps : routeInfo.steps.slice(0, 3)).map((step, index) => (
                      <li key={index}>- {step.instruction}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(loadingAi || aiContext) && (
                <div className="mt-4 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                    <Sparkles size={14} /> 文化解码
                  </div>
                  {loadingAi ? (
                    <div className="mt-2 text-xs text-blue-700 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> 正在生成解码内容...
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-blue-800 leading-relaxed">{aiContext}</p>
                  )}

                  {aiTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {aiTags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] bg-white text-blue-700 border border-blue-200 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs px-4 py-2 rounded-full shadow-float">
          {toast}
        </div>
      )}

      {routeInfo && showRouteDetail && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-ink flex items-center gap-2">
              <Navigation size={14} /> 路线详情
            </div>
            <button
              onClick={() => setShowRouteDetail(false)}
              className="text-[10px] font-bold text-stone-400 uppercase tracking-widest"
            >
              关闭
            </button>
          </div>
          <p className="text-xs text-stone-500">
            {formatDistance(routeInfo.distanceMeters)} · {formatDuration(routeInfo.durationSeconds)}
          </p>
          <ul className="mt-3 max-h-40 overflow-auto space-y-1 text-xs text-stone-600">
            {routeInfo.steps.map((step, index) => (
              <li key={index}>- {step.instruction}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            {(['walking', 'driving', 'transit'] as TravelMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTravelMode(mode)}
                className={`px-2 py-1 rounded-full font-bold border ${
                  travelMode === mode ? 'bg-stamp text-white border-stamp' : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {mode === 'walking' ? '步行' : mode === 'driving' ? '驾车' : '公交'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
