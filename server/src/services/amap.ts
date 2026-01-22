import { fetchJson } from '../utils/http.js';
import { requireEnv } from '../utils/env.js';

const AMAP_BASE = 'https://restapi.amap.com/v3';

export const searchPoi = async (keyword: string, city?: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
  const url = `${AMAP_BASE}/place/text?key=${key}&keywords=${encodeURIComponent(keyword)}${cityParam}&offset=10&page=1&extensions=base`;
  return fetchJson<any>(url);
};

export const searchPoiAround = async (keyword: string, location: string, radius = 2000) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/place/around?key=${key}&location=${encodeURIComponent(location)}&keywords=${encodeURIComponent(keyword)}&radius=${radius}&offset=10&page=1&extensions=base`;
  return fetchJson<any>(url);
};

export const getWalkingRoute = async (origin: string, destination: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/walking?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  return fetchJson<any>(url);
};

export const getDrivingRoute = async (origin: string, destination: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/driving?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  return fetchJson<any>(url);
};

export const getTransitRoute = async (origin: string, destination: string, city: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/direction/transit/integrated?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&city=${encodeURIComponent(city)}`;
  return fetchJson<any>(url);
};

export const getWeather = async (city: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/weather/weatherInfo?key=${key}&city=${encodeURIComponent(city)}&extensions=base`;
  return fetchJson<any>(url);
};

export const geocodeAddress = async (address: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/geocode/geo?key=${key}&address=${encodeURIComponent(address)}`;
  return fetchJson<any>(url);
};

export const reverseGeocode = async (location: string) => {
  const key = requireEnv('AMAP_WEB_SERVICE_KEY');
  const url = `${AMAP_BASE}/geocode/regeo?key=${key}&location=${encodeURIComponent(location)}&extensions=base&batch=false&roadlevel=0`;
  return fetchJson<any>(url);
};
