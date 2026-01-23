import { fetchJson } from '../utils/http.js';
import { requireEnv } from '../utils/env.js';

const AMAP_BASE = 'https://restapi.amap.com/v3';

const ensureAmapOk = (payload: any) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('AMap empty response');
  }
  const status = String(payload.status ?? '');
  if (status && status !== '1') {
    const info = payload.info ?? 'AMap request failed';
    const code = payload.infocode ?? 'unknown';
    throw new Error(`AMap error ${code}: ${info}`);
  }
  return payload;
};

export const searchPoi = async (keyword: string, city?: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
  const url = `${AMAP_BASE}/place/text?key=${key}&keywords=${encodeURIComponent(keyword)}${cityParam}&offset=10&page=1&extensions=base`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const searchPoiAround = async (keyword: string, location: string, radius = 2000) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/place/around?key=${key}&location=${encodeURIComponent(location)}&keywords=${encodeURIComponent(keyword)}&radius=${radius}&offset=10&page=1&extensions=base`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const getWalkingRoute = async (origin: string, destination: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/walking?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const getDrivingRoute = async (origin: string, destination: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/driving?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const getTransitRoute = async (origin: string, destination: string, city: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/transit/integrated?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&city=${encodeURIComponent(city)}`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const getWeather = async (city: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/weather/weatherInfo?key=${key}&city=${encodeURIComponent(city)}&extensions=base`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const geocodeAddress = async (address: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/geocode/geo?key=${key}&address=${encodeURIComponent(address)}`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};

export const reverseGeocode = async (location: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/geocode/regeo?key=${key}&location=${encodeURIComponent(location)}&extensions=base&batch=false&roadlevel=0`;
  const data = await fetchJson<any>(url);
  return ensureAmapOk(data);
};
