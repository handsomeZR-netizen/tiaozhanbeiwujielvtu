import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '@/shared/lib/api';
import { readLocal, writeLocal } from '@/shared/lib/storage';
import {
  normalizePoiList,
  normalizeRoute,
  normalizeWeather,
  type CitySuggestion,
  type PoiItem,
  type RouteInfo,
  type TravelMode,
  type WeatherInfo,
} from '@/features/atlas/atlas.utils';
import {
  CACHE_PREFIX,
  CHECKINS_KEY,
  CITY_HISTORY_KEY,
  CITY_OPTIONS,
  DEFAULT_CITY,
  DEFAULT_LOCATION,
  FAVORITES_KEY,
  SEARCH_HISTORY_KEY,
} from '@/features/atlas/atlas.data';

type CachedPois = {
  items: PoiItem[];
  ts: number;
};

type CachedWeather = {
  data: WeatherInfo;
  ts: number;
};

type UseAtlasDataOptions = {
  autoLocate: boolean;
  mapReady: boolean;
  travelMode: TravelMode;
  pushToast: (message: string) => void;
  setShowRouteDetail: (value: boolean) => void;
};

export const useAtlasData = ({ autoLocate, mapReady, travelMode, pushToast, setShowRouteDetail }: UseAtlasDataOptions) => {
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
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [favorites, setFavorites] = useState<PoiItem[]>(() => readLocal(FAVORITES_KEY, []));
  const [checkins, setCheckins] = useState<PoiItem[]>(() => readLocal(CHECKINS_KEY, []));
  const [cityHistory, setCityHistory] = useState<string[]>(() => readLocal(CITY_HISTORY_KEY, []));
  const [searchHistory, setSearchHistory] = useState<string[]>(() => readLocal(SEARCH_HISTORY_KEY, []));
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showCityPanel, setShowCityPanel] = useState(false);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [fitVersion, setFitVersion] = useState(0);
  const [centerVersion, setCenterVersion] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const citySearchTimerRef = useRef<number | null>(null);
  const locationRef = useRef(location);
  const lastLocateRef = useRef<{ lng: number; lat: number; ts: number } | null>(null);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const bumpFitVersion = useCallback(() => {
    setFitVersion((prev) => prev + 1);
  }, []);

  const bumpCenterVersion = useCallback(() => {
    setCenterVersion((prev) => prev + 1);
  }, []);

  const shouldUpdateLocation = useCallback((lng: number, lat: number) => {
    const now = Date.now();
    const prev = lastLocateRef.current;
    if (!prev) {
      lastLocateRef.current = { lng, lat, ts: now };
      return true;
    }

    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat - prev.lat);
    const dLng = toRad(lng - prev.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(prev.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371000 * c;

    // 提高阈值：100米或10秒，减少频繁更新
    if (distance < 100 && now - prev.ts < 10000) {
      return false;
    }

    lastLocateRef.current = { lng, lat, ts: now };
    return true;
  }, []);

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

  const requestJson = useCallback(<T,>(path: string, init?: RequestInit) => apiRequest<T>(path, init), []);

  const handleSelectPoi = useCallback(
    (poi: PoiItem) => {
      setSelectedPoi(poi);
      setRouteInfo(null);
      setShowRouteDetail(false);
      setAiContext(null);
      setAiTags([]);
    },
    [setShowRouteDetail]
  );

  const addSearchHistory = useCallback(
    (term: string) => {
      if (!term) return;
      const next = [term, ...searchHistory.filter((item) => item !== term)].slice(0, 8);
      setSearchHistory(next);
      writeLocal(SEARCH_HISTORY_KEY, next);
    },
    [searchHistory]
  );

  const resolveCityFromLocation = useCallback(
    async (lng: number, lat: number) => {
      if (window.AMap?.Geocoder) {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status !== 'complete') return;
          if (result?.info && result.info !== 'OK') return;
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
        const payload = data?.data ?? data;
        if (payload?.warning) return;
        const comp = payload?.regeocode?.addressComponent;
        if (!comp) return;
        const rawCity = Array.isArray(comp.city) ? comp.city[0] : comp.city;
        const detected = rawCity || comp.province || comp.district;
        if (detected) setCity(detected);
      } catch {
        // ignore
      }
    },
    [requestJson]
  );

  const applyCity = useCallback(
    async (nextCity?: string) => {
      const target = (nextCity ?? cityInput).trim();
      if (!target) return;
      
      // 如果城市没有变化，不需要重新加载
      if (target === city) return;
      
      setCity(target);
      setKeyword('');
      pushToast(`正在切换到 ${target}...`);
      
      if (!cityHistory.includes(target)) {
        const next = [target, ...cityHistory].slice(0, 6);
        setCityHistory(next);
        writeLocal(CITY_HISTORY_KEY, next);
      }
      try {
        const data = await requestJson(`/map/geocode?address=${encodeURIComponent(target)}`);
        const geocode = data?.data?.geocodes?.[0] ?? data?.geocodes?.[0];
        const locationStr = geocode?.location;
        if (locationStr) {
          const [lng, lat] = String(locationStr).split(',').map(Number);
          if (lng && lat) {
            setLocation({ lng, lat });
            bumpCenterVersion(); // 触发地图中心点更新
            resolveCityFromLocation(lng, lat);
            // 切换城市后自动加载该城市的 POI
            loadPoisRef.current({ city: target });
            pushToast(`已切换到 ${target}`);
          }
        } else {
          pushToast(`未找到城市：${target}`);
        }
      } catch {
        pushToast(`切换城市失败，请重试`);
      }
    },
    [bumpCenterVersion, city, cityHistory, cityInput, pushToast, requestJson, resolveCityFromLocation]
  );

  const getPosition = useCallback(
    (poi: PoiItem) => {
      const { minLng, maxLng, minLat, maxLat } = bounds;
      const lngRange = maxLng - minLng || 0.01;
      const latRange = maxLat - minLat || 0.01;
      const x = ((poi.lng - minLng) / lngRange) * 80 + 10;
      const y = (1 - (poi.lat - minLat) / latRange) * 70 + 15;
      return { left: `${x}%`, top: `${y}%` };
    },
    [bounds]
  );

  const loadPois = useCallback(
    async (override?: { keyword?: string; category?: string; city?: string }) => {
      setLoadingPois(true);
      const searchCity = override?.city ?? city;
      const inputKeyword = override?.keyword ?? keyword;
      const activeCategoryLocal = override?.category ?? activeCategory;
      const searchKeyword = inputKeyword.trim() || (activeCategoryLocal === '推荐' ? '景点' : activeCategoryLocal);
      const keyForCache = `${CACHE_PREFIX}_pois_${searchCity}_${searchKeyword}`;
      const cached = readLocal<CachedPois | null>(keyForCache, null);
      if (!isOnline && cached?.items?.length) {
        setPois(cached.items);
        bumpFitVersion();
        setLoadingPois(false);
        pushToast('离线模式：已使用缓存数据');
        return;
      }
      try {
      const currentLocation = locationRef.current;
      const locationParam =
        currentLocation?.lng && currentLocation?.lat
          ? `&location=${currentLocation.lng},${currentLocation.lat}&radius=2000`
          : '';
        const data = await requestJson(
          `/map/poi?city=${encodeURIComponent(searchCity)}&keyword=${encodeURIComponent(searchKeyword)}${locationParam}`
        );
        const normalized = normalizePoiList(data);
        setPois(normalized);
        bumpFitVersion();
        writeLocal(keyForCache, { items: normalized, ts: Date.now() });
        addSearchHistory(searchKeyword);
        setLastQuery(searchKeyword);
      } catch {
        if (cached?.items?.length) {
          setPois(cached.items);
          bumpFitVersion();
          pushToast('已使用缓存数据');
        } else {
          setPois([]);
          bumpFitVersion();
        }
      } finally {
        setLoadingPois(false);
      }
    },
    [activeCategory, addSearchHistory, bumpFitVersion, city, isOnline, keyword, pushToast, requestJson]
  );

  const loadPoisRef = useRef(loadPois);
  useEffect(() => {
    loadPoisRef.current = loadPois;
  }, [loadPois]);

  const loadWeather = useCallback(async () => {
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
  }, [city, isOnline, requestJson, weatherKey]);

  const locateUser = useCallback(() => {
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
                bumpCenterVersion();
                resolveCityFromLocation(loc.lng, loc.lat);
                setLocating(false);
                return;
              }
              setLocation(raw);
              bumpCenterVersion();
              resolveCityFromLocation(raw.lng, raw.lat);
              setLocating(false);
            });
          } else {
            setLocation(raw);
            bumpCenterVersion();
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
          bumpCenterVersion();
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
  }, [bumpCenterVersion, mapReady, pushToast, resolveCityFromLocation]);

  const loadCitySuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      setCitySearchLoading(false);
      return;
    }
    if (!window.AMap?.AutoComplete) {
      setCitySuggestions([]);
      setCitySearchLoading(false);
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
  }, []);

  const loadRoute = useCallback(
    async (poi: PoiItem) => {
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
    },
    [location, requestJson, setShowRouteDetail, travelMode]
  );

  const loadAiContext = useCallback(
    async (poi: PoiItem) => {
      setLoadingAi(true);
      try {
        const [contextRes, tagsRes] = await Promise.all([
          requestJson('/ai/context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: `请解读${poi.name}的文化意义或旅行价值。` }),
          }),
          requestJson('/ai/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: poi.name }),
          }),
        ]);

        const contextPayload = contextRes?.result ?? contextRes;
        const tagsPayload = tagsRes?.result ?? tagsRes;
        const context =
          contextPayload?.summary ||
          contextPayload?.choices?.[0]?.message?.content ||
          '暂无文化解读内容。';

        const tags = contextPayload?.tags || tagsPayload?.result || tagsPayload?.tags || [];

        setAiContext(context);
        setAiTags(Array.isArray(tags) ? tags : []);
      } catch {
        setAiContext('暂无文化解读内容。');
        setAiTags([]);
      } finally {
        setLoadingAi(false);
      }
    },
    [requestJson]
  );

  const toggleFavorite = useCallback(
    async (poi: PoiItem) => {
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
    },
    [favorites, pushToast, requestJson]
  );

  const addCheckin = useCallback(
    async (poi: PoiItem) => {
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
    },
    [checkins, pushToast, requestJson]
  );

  const sharePoi = useCallback(
    async (poi: PoiItem) => {
      try {
        const shareData = await requestJson('/share', { method: 'POST' });
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
    },
    [pushToast, requestJson]
  );

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    writeLocal(SEARCH_HISTORY_KEY, []);
  }, []);

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

  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (initialLoadRef.current) return;
    const cached = readLocal<CachedPois | null>(cacheKey, null);
    if (cached?.items?.length) {
      setPois(cached.items);
      bumpFitVersion();
      initialLoadRef.current = true;
    }
  }, [bumpFitVersion, cacheKey]);

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
  }, [cityInput, showCityPanel, loadCitySuggestions]);

  useEffect(() => {
    if (!autoLocate) return;
    if (watchIdRef.current !== null) return;
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const nextLng = pos.coords.longitude;
        const nextLat = pos.coords.latitude;
        setAccuracyMeters(Math.round(pos.coords.accuracy));
        if (!shouldUpdateLocation(nextLng, nextLat)) {
          return;
        }
        setLocation({ lng: nextLng, lat: nextLat });
        resolveCityFromLocation(nextLng, nextLat);
      },
      () => {
        // ignore
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoLocate, resolveCityFromLocation, shouldUpdateLocation]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    if (keyword.trim() === '') {
      loadPoisRef.current();
    }
  }, [activeCategory, city, keyword]);

  useEffect(() => {
    const sync = async () => {
      try {
        const favoritesRes = await requestJson<PoiItem[]>('/atlas/favorites');
        if (Array.isArray(favoritesRes)) {
          setFavorites(favoritesRes);
        }
      } catch {
        // ignore
      }
      try {
        const checkinsRes = await requestJson<PoiItem[]>('/atlas/checkins');
        if (Array.isArray(checkinsRes)) {
          setCheckins(checkinsRes);
        }
      } catch {
        // ignore
      }
    };
    sync();
  }, [requestJson]);

  return {
    city,
    setCity,
    cityInput,
    setCityInput,
    keyword,
    setKeyword,
    activeCategory,
    setActiveCategory,
    location,
    locating,
    pois,
    loadingPois,
    selectedPoi,
    weather,
    routeInfo,
    aiContext,
    aiTags,
    loadingAi,
    accuracyMeters,
    isOnline,
    favorites,
    checkins,
    cityHistory,
    searchHistory,
    citySuggestions,
    showCityPanel,
    setShowCityPanel,
    citySearchLoading,
    lastQuery,
    fitVersion,
    centerVersion,
    cityOptions,
    getPosition,
    handleSelectPoi,
    applyCity,
    loadPois,
    loadRoute,
    loadAiContext,
    locateUser,
    toggleFavorite,
    addCheckin,
    sharePoi,
    clearSearchHistory,
  };
};
