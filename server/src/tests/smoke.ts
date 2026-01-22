import { buildApp } from '../app.js';

process.env.MOCK_MODE = process.env.MOCK_MODE ?? 'true';

const run = async () => {
  const app = await buildApp({ logger: false });
  const endpoints = [
    { method: 'GET', url: '/health' },
    { method: 'POST', url: '/share' },
    { method: 'GET', url: '/community/feed' },
    { method: 'GET', url: '/map/poi?city=北京&keyword=咖啡' },
    { method: 'POST', url: '/ai/scene', payload: { image: 'mock' } },
    { method: 'GET', url: '/users/me' },
    {
      method: 'POST',
      url: '/users/profile',
      payload: {
        name: 'Traveler',
        originCountry: '法国',
        destinationCity: '北京',
      },
    },
    {
      method: 'POST',
      url: '/diaries',
      payload: { title: '初见北京', content: '第一次看到故宫。' },
    },
    {
      method: 'POST',
      url: '/atlas/favorites',
      payload: {
        poi: { id: 'poi_1', name: '天安门广场', lng: 116.397428, lat: 39.90923 },
      },
    },
    { method: 'GET', url: '/atlas/favorites' },
    {
      method: 'POST',
      url: '/atlas/checkins',
      payload: {
        poi: { id: 'poi_2', name: '前门大街', lng: 116.404136, lat: 39.899428 },
      },
    },
    { method: 'GET', url: '/atlas/checkins' },
    {
      method: 'POST',
      url: '/posters/generate',
      payload: {
        city: '合肥',
        theme: '城市夜景',
        style: '国潮',
        language: 'bilingual',
        platform: 'Instagram',
        keywords: ['夜色', '街巷'],
      },
    },
    { method: 'GET', url: '/posters?limit=5' },
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
