import { config } from 'dotenv';
import type { InjectOptions } from 'fastify';
import { buildApp } from '../app.js';
import { initDb } from '../db.js';

config({ path: '.env.server' });
process.env.MOCK_MODE = process.env.MOCK_MODE ?? 'true';

const parseJson = (res: { body: string }) => {
  try {
    return JSON.parse(res.body);
  } catch {
    return null;
  }
};

const run = async () => {
  await initDb();
  const app = await buildApp({ logger: false });

  const email = `smoke_${Date.now()}@test.local`;
  const username = `smoke_${Date.now()}`;
  const password = 'password123';

  const registerRes = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: { email, password, username },
  });
  if (registerRes.statusCode >= 400) {
    throw new Error(`POST /auth/register failed: ${registerRes.statusCode}`);
  }
  const registerJson = parseJson(registerRes);
  const token = registerJson?.data?.token as string | undefined;
  if (!token) {
    throw new Error('Missing auth token in register response');
  }

  const authHeaders = { authorization: `Bearer ${token}` };

  const endpoints: InjectOptions[] = [
    { method: 'GET', url: '/health' },
    { method: 'POST', url: '/share' },
    { method: 'GET', url: '/community/feed' },
    { method: 'POST', url: '/community/posts', payload: { title: 'Hello community' } },
    { method: 'GET', url: '/map/poi?city=北京&keyword=咖啡' },
    { method: 'POST', url: '/ai/scene', payload: { image: 'mock' } },
    { method: 'POST', url: '/ai/culture', payload: { imageUrl: 'mock', preferences: ['建筑与街巷'] } },
    { method: 'GET', url: '/users/me', headers: authHeaders },
    {
      method: 'POST',
      url: '/users/profile',
      headers: authHeaders,
      payload: {
        name: 'Traveler',
        originCountry: '法国',
        destinationCity: '北京',
      },
    },
    {
      method: 'POST',
      url: '/diaries',
      headers: authHeaders,
      payload: { title: '初见北京', content: '第一次看到故宫。' },
    },
    {
      method: 'POST',
      url: '/atlas/favorites',
      headers: authHeaders,
      payload: {
        poi: { id: 'poi_1', name: '天安门广场', lng: 116.397428, lat: 39.90923 },
      },
    },
    { method: 'GET', url: '/atlas/favorites', headers: authHeaders },
    {
      method: 'POST',
      url: '/atlas/checkins',
      headers: authHeaders,
      payload: {
        poi: { id: 'poi_2', name: '前门大街', lng: 116.404136, lat: 39.899428 },
      },
    },
    { method: 'GET', url: '/atlas/checkins', headers: authHeaders },
    {
      method: 'POST',
      url: '/posters/generate',
      headers: authHeaders,
      payload: {
        city: '合肥',
        theme: '城市夜景',
        style: '国潮',
        language: 'bilingual',
        platform: 'Instagram',
        keywords: ['夜色', '街巷'],
      },
    },
    { method: 'GET', url: '/posters?limit=5', headers: authHeaders },
    { method: 'GET', url: '/studio/history?limit=5', headers: authHeaders },
    {
      method: 'POST',
      url: '/studio/history',
      headers: authHeaders,
      payload: { image: 'mock-image', result: { elements: ['灯笼'], insights: [], tips: [], share: { zh: '', en: '' } } },
    },
  ];

  for (const endpoint of endpoints) {
    const res = await app.inject(endpoint);
    if (res.statusCode >= 400) {
      throw new Error(`${endpoint.method} ${endpoint.url} failed: ${res.statusCode}`);
    }
  }

  await app.close();
  console.log('smoke: ok');
};

run().catch((error) => {
  console.error('smoke: failed');
  console.error(error);
  process.exit(1);
});
