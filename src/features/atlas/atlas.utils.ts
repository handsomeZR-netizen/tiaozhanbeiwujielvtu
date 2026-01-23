export type PoiItem = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
  reason?: string;
  tags?: string[];
  distance?: number;
};

export type WeatherInfo = {
  city: string;
  weather: string;
  temperature: string;
  windDirection?: string;
};

export type RouteInfo = {
  distanceMeters: number;
  durationSeconds: number;
  steps: { instruction: string }[];
};

export type TravelMode = 'walking' | 'driving' | 'transit';

export type CitySuggestion = {
  name: string;
  district?: string;
};

export const toNumber = (value: string | number | undefined) => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const normalizePoiList = (payload: any): PoiItem[] => {
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

export const normalizeWeather = (payload: any): WeatherInfo | null => {
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

export const normalizeRoute = (payload: any): RouteInfo | null => {
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

export const formatDistance = (meters: number) => {
  if (!meters) return '未知距离';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number) => {
  if (!seconds) return '未知时长';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} 分钟`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return `${hours} 小时 ${rest} 分钟`;
};
