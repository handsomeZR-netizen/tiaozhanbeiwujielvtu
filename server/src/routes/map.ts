import type { FastifyInstance } from 'fastify';
import { mapRecommendations } from '../mocks/index.js';
import { ok, fail } from '../utils/response.js';
import { isMockMode } from '../utils/env.js';
import {
  geocodeAddress,
  getDrivingRoute,
  getTransitRoute,
  getWalkingRoute,
  getWeather,
  reverseGeocode,
  searchPoi,
  searchPoiAround,
} from '../services/amap.js';

export const registerMapRoutes = async (app: FastifyInstance) => {
  app.get('/map/poi', async (request, reply) => {
    const { keyword, city, location, radius } = request.query as {
      keyword?: string;
      city?: string;
      location?: string;
      radius?: string;
    };
    if (isMockMode()) {
      return ok({
        city: city ?? '北京',
        keyword: keyword ?? '',
        items: mapRecommendations,
      });
    }

    try {
      if (location) {
        const result = await searchPoiAround(
          keyword ?? '景点',
          location,
          radius ? Number(radius) : 2000
        );
        return ok(result);
      }

      const result = await searchPoi(keyword ?? '景点', city ?? '北京');
      const count = Number(result?.count ?? 0);
      if ((!result?.pois || result.pois.length === 0 || count === 0) && city) {
        const fallback = await searchPoi(keyword ?? '景点');
        return ok(fallback);
      }
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'Map POI request failed.');
    }
  });

  app.get('/map/route', async (request, reply) => {
    const { from, to, mode } = request.query as { from?: string; to?: string; mode?: string };
    if (isMockMode()) {
      return ok({
        from: from ?? '116.379028,39.865042',
        to: to ?? '116.427281,39.903719',
        distanceMeters: 4200,
        durationSeconds: 1800,
        steps: [
          { instruction: '向北直行 300 米' },
          { instruction: '右转进入主路' },
          { instruction: '到达目的地' },
        ],
      });
    }

    try {
      if (mode === 'driving') {
        const result = await getDrivingRoute(from ?? '116.379028,39.865042', to ?? '116.427281,39.903719');
        return ok(result);
      }
      if (mode === 'transit') {
        const result = await getTransitRoute(
          from ?? '116.379028,39.865042',
          to ?? '116.427281,39.903719',
          '北京'
        );
        return ok(result);
      }
      const result = await getWalkingRoute(from ?? '116.379028,39.865042', to ?? '116.427281,39.903719');
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'Map route request failed.');
    }
  });

  app.get('/map/weather', async (request, reply) => {
    const { city } = request.query as { city?: string };
    if (isMockMode()) {
      return ok({
        city: city ?? '北京',
        weather: '晴',
        temperature: '24°C',
        windDirection: '东北风',
      });
    }

    try {
      const result = await getWeather(city ?? '北京');
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'Map weather request failed.');
    }
  });

  app.get('/map/geocode', async (request, reply) => {
    const { address } = request.query as { address?: string };
    if (isMockMode()) {
      return ok({
        address: address ?? '天安门广场',
        location: { lng: 116.397428, lat: 39.90923 },
      });
    }

    try {
      const result = await geocodeAddress(address ?? '天安门广场');
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'Map geocode request failed.');
    }
  });

  app.get('/map/regeo', async (request, reply) => {
    const { location } = request.query as { location?: string };
    if (isMockMode()) {
      return ok({
        regeocode: {
          addressComponent: {
            city: '北京',
            province: '北京',
            district: '东城区',
          },
        },
      });
    }

    try {
      const loc = location ?? '116.397428,39.90923';
      const result = await reverseGeocode(loc);
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'Map reverse geocode request failed.');
    }
  });
};
