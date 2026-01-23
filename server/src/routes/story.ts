import type { FastifyInstance } from 'fastify';
import { ok } from '../utils/response.js';
import { isMockMode } from '../utils/env.js';
import { storyMockArc } from '../mocks/index.js';
import { chatCompletion } from '../services/deepseek.js';
import { searchPoi, searchPoiAround } from '../services/amap.js';

type StoryPoi = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address?: string;
};

type StoryScene = {
  id: string;
  title: string;
  timeOfDay?: string;
  poi: StoryPoi;
  shot: string;
  narration: string;
  task: string;
  tip?: string;
  durationMinutes?: number;
};

type StoryArc = {
  id: string;
  city: string;
  theme: string;
  title: string;
  logline: string;
  summary?: string;
  scenes: StoryScene[];
};

type StoryRequest = {
  city?: string;
  theme?: string;
  keyword?: string;
  location?: { lng: number; lat: number } | string;
  radius?: number;
  sceneCount?: number;
};

const hasDeepseekKey = () => Boolean(process.env.DEEPSEEK_API_KEY);
const hasAmapKey = () => Boolean(process.env.AMAP_WEB_SERVICE_KEY);

const THEME_KEYWORDS: Record<string, string> = {
  夜景: '夜景',
  美食: '美食',
  非遗: '非遗',
  街巷: '老街',
  古城: '古城',
  公园: '公园',
  文化地标: '地标',
};

const resolveKeyword = (theme: string, keyword?: string) => {
  const trimmed = keyword?.trim();
  if (trimmed) return trimmed;
  return THEME_KEYWORDS[theme] ?? '景点';
};

const extractText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) return payload.map(extractText).filter(Boolean).join('\n');
  if (typeof payload === 'object') {
    if (payload.text) return extractText(payload.text);
    if (payload.content) return extractText(payload.content);
    if (payload.message?.content) return extractText(payload.message.content);
    if (payload.output_text) return extractText(payload.output_text);
    if (payload.output) return extractText(payload.output);
    if (payload.choices) return extractText(payload.choices);
    if (payload.result) return extractText(payload.result);
  }
  return '';
};

const parseJsonFromText = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
};

const toNumber = (value: string | number | undefined) => {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizePois = (payload: any): StoryPoi[] => {
  const data = payload?.pois ?? payload?.data?.pois ?? payload?.data?.items ?? payload?.items ?? [];
  if (!Array.isArray(data)) return [];
  return data
    .map((item: any, index: number) => {
      const rawLocation = String(item.location ?? '');
      const [lng, lat] = rawLocation.split(',').map(Number);
      return {
        id: String(item.id ?? `poi_${index}`),
        name: String(item.name ?? '未知地点'),
        lng: toNumber(item.lng ?? lng),
        lat: toNumber(item.lat ?? lat),
        address: item.address,
      };
    })
    .filter((poi) => poi.lng && poi.lat);
};

const resolveLocation = (input?: StoryRequest['location']) => {
  if (!input) return null;
  if (typeof input === 'string') return input;
  if (typeof input === 'object' && typeof input.lng === 'number' && typeof input.lat === 'number') {
    return `${input.lng},${input.lat}`;
  }
  return null;
};

const buildFallbackScene = (poi: StoryPoi, index: number): StoryScene => {
  const sceneIndex = index + 1;
  const timeOfDay = ['清晨', '上午', '午后', '傍晚', '夜晚'][index % 5];
  return {
    id: `scene_${sceneIndex}`,
    title: `第${sceneIndex}幕`,
    timeOfDay,
    poi,
    shot: `在${poi.name}完成一组环境与细节镜头。`,
    narration: `镜头停留在${poi.name}，城市的气息逐渐清晰。`,
    task: `拍摄1张${poi.name}的标志性画面。`,
    tip: '注意光线方向，尽量保留自然阴影与人流动线。',
    durationMinutes: 30,
  };
};

const buildFallbackArc = (
  city: string,
  theme: string,
  pois: StoryPoi[],
  sceneCount: number,
): StoryArc => {
  const selected = pois.slice(0, sceneCount);
  const scenes = selected.map(buildFallbackScene);
  return {
    id: `arc_${Date.now()}`,
    city,
    theme,
    title: `${city} · 片场故事`,
    logline: `在${city}完成一条围绕“${theme}”的三幕式城市叙事。`,
    summary: '用镜头串联城市空间与文化细节，形成完整旅程叙事。',
    scenes,
  };
};

const normalizeArc = (input: any, fallback: StoryArc, poiFallbacks: StoryPoi[]): StoryArc => {
  if (!input || typeof input !== 'object') return fallback;
  const scenesRaw = Array.isArray(input.scenes) ? input.scenes : [];
  if (scenesRaw.length === 0) return fallback;
  const scenes = scenesRaw.map((scene: any, index: number) => {
    const fallbackPoi = poiFallbacks[index] ?? poiFallbacks[poiFallbacks.length - 1];
    const poi = {
      id: String(scene?.poi?.id ?? fallbackPoi?.id ?? `poi_${index}`),
      name: String(scene?.poi?.name ?? fallbackPoi?.name ?? '未知地点'),
      lng: toNumber(scene?.poi?.lng ?? fallbackPoi?.lng),
      lat: toNumber(scene?.poi?.lat ?? fallbackPoi?.lat),
      address: scene?.poi?.address ?? fallbackPoi?.address,
    };
    return {
      id: String(scene?.id ?? `scene_${index + 1}`),
      title: String(scene?.title ?? `第${index + 1}幕`),
      timeOfDay: scene?.timeOfDay ?? undefined,
      poi,
      shot: String(scene?.shot ?? `在${poi.name}完成一组镜头。`),
      narration: String(scene?.narration ?? ''),
      task: String(scene?.task ?? ''),
      tip: scene?.tip ? String(scene.tip) : undefined,
      durationMinutes: scene?.durationMinutes ? Number(scene.durationMinutes) : undefined,
    };
  });
  return {
    id: String(input.id ?? fallback.id),
    city: String(input.city ?? fallback.city),
    theme: String(input.theme ?? fallback.theme),
    title: String(input.title ?? fallback.title),
    logline: String(input.logline ?? fallback.logline),
    summary: input.summary ?? fallback.summary,
    scenes,
  };
};

export const registerStoryRoutes = async (app: FastifyInstance) => {
  app.post('/story/arc', async (request) => {
    const body = request.body as StoryRequest | undefined;
    const city = body?.city?.trim() || storyMockArc.city;
    const theme = body?.theme?.trim() || storyMockArc.theme;
    const sceneCount = Math.max(2, Math.min(5, Number(body?.sceneCount ?? 3)));
    const keyword = resolveKeyword(theme, body?.keyword);
    const location = resolveLocation(body?.location);
    const radius = Number(body?.radius ?? 2000);

    if (isMockMode()) {
      return ok(storyMockArc);
    }

    let pois: StoryPoi[] = [];
    if (hasAmapKey()) {
      try {
        const result = location
          ? await searchPoiAround(keyword, location, radius)
          : await searchPoi(keyword, city);
        pois = normalizePois(result);
      } catch (error: any) {
        app.log.warn({ error: error.message }, 'Story POI request failed, fallback to mock POIs.');
      }
    }

    if (pois.length === 0) {
      pois = storyMockArc.scenes.map((scene) => scene.poi);
    }

    const fallbackArc = buildFallbackArc(city, theme, pois, sceneCount);
    if (!hasDeepseekKey()) {
      return ok(fallbackArc);
    }

    const poiSummary = pois.slice(0, Math.max(sceneCount, 3)).map((poi) => ({
      id: poi.id,
      name: poi.name,
      lng: poi.lng,
      lat: poi.lat,
      address: poi.address,
    }));

    const prompt = [
      '你是城市片场导演与文案策划，请基于给定城市与POI列表输出JSON。',
      '只输出JSON，不要Markdown，不要解释。',
      `城市: ${city}`,
      `主题: ${theme}`,
      `场景数量: ${sceneCount}`,
      `POI列表: ${JSON.stringify(poiSummary)}`,
      '返回字段：',
      'title(片名)、logline(一句话剧情)、summary(两句概述)、scenes(数组)。',
      'scenes每项字段：id, title, timeOfDay, poi{id,name,lng,lat,address}, shot(镜头建议), narration(旁白), task(任务), tip(礼仪/拍摄提示), durationMinutes。',
      '旁白要简短、氛围感强，任务要可操作。',
    ].join('\n');

    try {
      const result = await chatCompletion([
        { role: 'system', content: 'You are a travel story director.' },
        { role: 'user', content: prompt },
      ]);
      const rawText = extractText(result);
      const parsed = parseJsonFromText(rawText) ?? result;
      const normalized = normalizeArc(parsed, fallbackArc, pois);
      return ok(normalized);
    } catch (error: any) {
      app.log.warn({ error: error.message }, 'Story arc generation failed, fallback to template.');
      return ok(fallbackArc);
    }
  });
};
