import type { FastifyInstance, FastifyRequest } from 'fastify';
import { aiMockResult, cultureMockResult } from '../mocks/index.js';
import { ok, fail } from '../utils/response.js';
import { isMockMode } from '../utils/env.js';
import { chatCompletion } from '../services/deepseek.js';
import { generateImage, multimodalDescribe } from '../services/doubao.js';
import { saveDataUrl } from '../utils/uploads.js';

const hasArkKey = () => Boolean(process.env.ARK_API_KEY);
const hasDeepseekKey = () => Boolean(process.env.DEEPSEEK_API_KEY);

const extractText = (payload: any): string => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) {
    return payload.map(extractText).filter(Boolean).join('\n');
  }
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

const normalizeCultureResult = (data: any) => {
  const elements = Array.isArray(data?.elements)
    ? data.elements
    : Array.isArray(data?.objects)
    ? data.objects
    : [];
  const tips = Array.isArray(data?.tips)
    ? data.tips
    : Array.isArray(data?.travelTips)
    ? data.travelTips
    : [];
  const rawInsights = Array.isArray(data?.insights) ? data.insights : [];
  const insights = rawInsights.map((item: any) => {
    if (typeof item === 'string') {
      return {
        title: item,
        subtitle: '',
        tags: [],
        description: item,
        detailedContent: item,
      };
    }
    return {
      title: item?.title ?? item?.name ?? '文化意象',
      subtitle: item?.subtitle ?? '',
      tags: Array.isArray(item?.tags) ? item.tags : [],
      description: item?.description ?? item?.what ?? '',
      detailedContent: item?.detailedContent ?? item?.culture ?? item?.why ?? '',
    };
  });
  const share = data?.share ?? {};
  const fallbackElement = elements?.[0] ?? '中国文化';
  const zh = share?.zh ?? share?.cn ?? `我在中国看到了${fallbackElement}，它承载着独特的文化意味。`;
  const en =
    share?.en ?? 'I saw a cultural symbol in China, and it carries unique meanings and stories.';

  return {
    elements,
    insights,
    tips,
    share: { zh, en },
  };
};

const getHeaderValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const buildPublicBase = (request: FastifyRequest) => {
  const envBase = process.env.PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  const proto = getHeaderValue(request.headers['x-forwarded-proto']) ?? 'http';
  const host =
    getHeaderValue(request.headers['x-forwarded-host']) ??
    getHeaderValue(request.headers.host) ??
    `localhost:${process.env.PORT ?? 8787}`;
  return `${proto}://${host}`;
};

const resolveImageUrl = async (request: FastifyRequest, imageUrl?: string, logger?: any) => {
  if (!imageUrl) return undefined;
  
  // 如果已经是完整的HTTP(S) URL，直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 如果是base64格式，保存并返回公共URL
  if (imageUrl.startsWith('data:image/')) {
    const { filename } = await saveDataUrl(imageUrl);
    return `${buildPublicBase(request)}/uploads/${filename}`;
  }
  
  // 如果是本地路径（如 /demo-images/xxx.jpg），转换为 base64
  if (imageUrl.startsWith('/demo-images/') || imageUrl.startsWith('/uploads/')) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      
      // 构建文件路径 - 从 server/src/routes 向上到项目根目录
      let filePath: string;
      if (imageUrl.startsWith('/demo-images/')) {
        // 从 server/src/routes -> server/src -> server -> 项目根 -> public
        filePath = path.join(__dirname, '../../../public', imageUrl);
      } else {
        // uploads 在 server 目录下
        filePath = path.join(__dirname, '../../..', imageUrl);
      }
      
      // 读取文件并转换为 base64
      const fileBuffer = await fs.readFile(filePath);
      const base64 = fileBuffer.toString('base64');
      const ext = path.extname(imageUrl).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error: any) {
      if (logger) {
        logger.warn({ error: error.message, imageUrl }, 'Failed to read local image file');
      }
      // 如果读取失败，回退到公共URL
      return `${buildPublicBase(request)}${imageUrl}`;
    }
  }
  
  // 如果是相对路径，转换为完整URL
  if (imageUrl.startsWith('/')) {
    return `${buildPublicBase(request)}${imageUrl}`;
  }
  
  // 其他情况，尝试作为相对路径处理
  return `${buildPublicBase(request)}/${imageUrl}`;
};

export const registerAiRoutes = async (app: FastifyInstance) => {
  app.post('/ai/scene', async (request, reply) => {
    if (isMockMode() || !hasArkKey()) {
      return ok({ input: request.body ?? null, result: aiMockResult.scene });
    }

    const body = request.body as { text?: string; imageUrl?: string } | undefined;
    try {
      const resolvedUrl = await resolveImageUrl(request, body?.imageUrl, app.log);
      const result = await multimodalDescribe({
        text: body?.text ?? '请描述这张图片的主要场景。',
        imageUrl: resolvedUrl,
      });
      return ok(result);
    } catch (error: any) {
      app.log.warn({ error: error.message }, 'AI scene request failed, fallback to mock.');
      return ok({ input: request.body ?? null, result: aiMockResult.scene, warning: 'ai_failed_fallback_mock' });
    }
  });

  app.post('/ai/context', async (request, reply) => {
    if (isMockMode() || !hasDeepseekKey()) {
      return ok({ input: request.body ?? null, result: aiMockResult.context });
    }

    const body = request.body as { text?: string } | undefined;
    try {
      const result = await chatCompletion([
        { role: 'system', content: 'You are a cultural translator.' },
        { role: 'user', content: body?.text ?? '请解释这段文化现象，并给出英文翻译。' },
      ]);
      return ok(result);
    } catch (error: any) {
      app.log.warn({ error: error.message }, 'AI context request failed, fallback to mock.');
      return ok({ input: request.body ?? null, result: aiMockResult.context, warning: 'ai_failed_fallback_mock' });
    }
  });

  app.post('/ai/image', async (request, reply) => {
    if (isMockMode() || !hasArkKey()) {
      return ok({ input: request.body ?? null, result: aiMockResult.image });
    }

    const body = request.body as { prompt?: string } | undefined;
    try {
      const result = await generateImage(body?.prompt ?? '中国城市夜景，电影感风格');
      return ok(result);
    } catch (error: any) {
      app.log.warn({ error: error.message }, 'AI image request failed, fallback to mock.');
      return ok({ input: request.body ?? null, result: aiMockResult.image, warning: 'ai_failed_fallback_mock' });
    }
  });

  app.post('/ai/tags', async (request, reply) => {
    if (isMockMode() || !hasDeepseekKey()) {
      return ok({ input: request.body ?? null, result: aiMockResult.tags });
    }

    const body = request.body as { text?: string } | undefined;
    try {
      const result = await chatCompletion([
        { role: 'system', content: 'Generate concise hashtags for social sharing.' },
        { role: 'user', content: body?.text ?? '为中国城市夜景生成 5 个标签。' },
      ]);
      return ok(result);
    } catch (error: any) {
      app.log.warn({ error: error.message }, 'AI tags request failed, fallback to mock.');
      return ok({ input: request.body ?? null, result: aiMockResult.tags, warning: 'ai_failed_fallback_mock' });
    }
  });

  app.post('/ai/culture', async (request, reply) => {
    const arkKeyExists = hasArkKey();
    const mockMode = isMockMode();
    
    app.log.info({ 
      arkKeyExists, 
      mockMode,
      arkKeyValue: process.env.ARK_API_KEY ? '***configured***' : 'missing'
    }, 'Culture API called');
    
    if (mockMode || !arkKeyExists) {
      app.log.warn('Using mock data for culture API');
      return ok({ input: request.body ?? null, result: cultureMockResult });
    }

    const body = request.body as { imageUrl?: string; preferences?: string[] } | undefined;
    const preferences = Array.isArray(body?.preferences) ? body?.preferences.filter(Boolean) : [];
    const preferenceHint = preferences.length ? `请重点关注：${preferences.join('、')}。` : '';
    const prompt = [
      '请根据图片识别文化意象，并仅输出 JSON（不要附带解释或 Markdown）。',
      '返回字段：',
      'elements: 数组，3-6 个文化元素，中文短语。',
      'insights: 数组，每项包含 title(中文)、subtitle(简短英文)、tags(带#)、description(一句话解释)、detailedContent(2-3 句深度解读)。',
      'tips: 数组，3-5 条旅行友好提示（礼仪/体验/拍摄）。',
      'share: 对象，包含 zh / en 的分享文案，各 1 句。',
      '内容面向外国游客，中文为主，简洁友好。',
      preferenceHint,
    ]
      .filter(Boolean)
      .join(' ');

    try {
      const resolvedUrl = await resolveImageUrl(request, body?.imageUrl, app.log);
      app.log.info({ imageUrl: body?.imageUrl, resolvedUrl }, 'Processing culture request');
      
      const response = await multimodalDescribe({
        text: prompt,
        imageUrl: resolvedUrl,
      });
      const rawText = extractText(response?.output ?? response ?? '');
      const parsed = parseJsonFromText(rawText) ?? response;
      const normalized = normalizeCultureResult(parsed);
      const hasContent = normalized.elements.length || normalized.insights.length || normalized.tips.length;
      return ok({
        result: normalized,
        raw: rawText,
        warning: hasContent ? undefined : 'AI result empty or unparseable.',
      });
    } catch (error: any) {
      app.log.warn({ error: error.message, stack: error.stack }, 'AI culture request failed, fallback to mock.');
      return ok({
        result: normalizeCultureResult(cultureMockResult),
        raw: '',
        warning: 'ai_failed_fallback_mock',
      });
    }
  });
};
