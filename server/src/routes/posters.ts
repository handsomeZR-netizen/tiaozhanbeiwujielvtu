import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { generateImage } from '../services/doubao.js';
import { chatCompletion } from '../services/deepseek.js';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';
import { requireAuthUser } from '../utils/auth.js';
import { uploadImageToOSS } from '../utils/aliyun-oss.js';

type PosterInput = {
  city?: string;
  theme?: string;
  style?: string;
  language?: 'zh' | 'en' | 'bilingual';
  platform?: string;
  size?: string;
  keywords?: string[];
  prompt?: string;
  promptPolished?: string;
  copyTitlePolished?: string;
  copySubtitlePolished?: string;
};

type PosterRecord = {
  id: string;
  city?: string | null;
  theme?: string | null;
  style?: string | null;
  language?: string | null;
  platform?: string | null;
  size?: string | null;
  promptRaw?: string | null;
  promptPolished?: string | null;
  prompt: string;
  imageUrl: string;
  copyTitle?: string | null;
  copySubtitle?: string | null;
  copyTitleRaw?: string | null;
  copySubtitleRaw?: string | null;
  copyTitlePolished?: string | null;
  copySubtitlePolished?: string | null;
  shareZh?: string | null;
  shareEn?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const isMockMode = () => (process.env.MOCK_MODE ?? 'false') === 'true';
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

const mapRow = (row: {
  id: string;
  city: string | null;
  theme: string | null;
  style: string | null;
  language: string | null;
  platform: string | null;
  size: string | null;
  prompt_raw: string | null;
  prompt_polished: string | null;
  prompt: string;
  image_url: string;
  copy_title: string | null;
  copy_subtitle: string | null;
  copy_title_raw: string | null;
  copy_subtitle_raw: string | null;
  copy_title_polished: string | null;
  copy_subtitle_polished: string | null;
  share_zh: string | null;
  share_en: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}): PosterRecord => ({
  id: row.id,
  city: row.city,
  theme: row.theme,
  style: row.style,
  language: row.language,
  platform: row.platform,
  size: row.size,
  promptRaw: row.prompt_raw,
  promptPolished: row.prompt_polished,
  prompt: row.prompt,
  imageUrl: row.image_url,
  copyTitle: row.copy_title,
  copySubtitle: row.copy_subtitle,
  copyTitleRaw: row.copy_title_raw,
  copySubtitleRaw: row.copy_subtitle_raw,
  copyTitlePolished: row.copy_title_polished,
  copySubtitlePolished: row.copy_subtitle_polished,
  shareZh: row.share_zh,
  shareEn: row.share_en,
  tags: row.tags ?? [],
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const buildCopy = (input: PosterInput) => {
  const city = input.city ?? '中国';
  const theme = input.theme ?? '城市漫游';
  const style = input.style ?? '国潮';
  switch (input.language) {
    case 'en':
      return {
        copyTitle: `Discover ${city}`,
        copySubtitle: `${theme} · ${style}`,
      };
    case 'bilingual':
      return {
        copyTitle: `${city} · Discover China`,
        copySubtitle: `${theme} · ${style}`,
      };
    default:
      return {
        copyTitle: `${city} · 旅行海报`,
        copySubtitle: `${theme} · ${style}`,
      };
  }
};

const buildShareFallback = (input: PosterInput, copyTitle: string, copySubtitle: string) => {
  const city = input.city ?? '中国';
  const theme = input.theme ?? '城市漫游';
  return {
    shareZh: `${copyTitle}｜${copySubtitle}。跟着镜头走进${city}的日常与温度。`,
    shareEn: `Discover ${city} through a ${theme} lens. ${copyTitle} — ${copySubtitle}.`,
  };
};

const generateShareCopy = async (
  input: PosterInput,
  copyTitle: string,
  copySubtitle: string,
  prompt: string,
) => {
  const keywords = (input.keywords ?? []).filter(Boolean).join(', ');
  const hint = [
    `城市: ${input.city ?? ''}`,
    `主题: ${input.theme ?? ''}`,
    `风格: ${input.style ?? ''}`,
    `平台: ${input.platform ?? ''}`,
    `语言: ${input.language ?? ''}`,
    keywords ? `关键词: ${keywords}` : '',
    prompt ? `描述: ${prompt}` : '',
    `标题: ${copyTitle}`,
    `副标题: ${copySubtitle}`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await chatCompletion([
    {
      role: 'system',
      content:
        'You are a travel social copywriter. Return JSON only with fields shareZh and shareEn. Each should be 1-2 short sentences.',
    },
    {
      role: 'user',
      content: `${hint}\n\nGenerate a concise bilingual share caption. Keep it friendly and vivid.`,
    },
  ]);

  const rawText = extractText(response);
  const parsed = parseJsonFromText(rawText) ?? {};
  return {
    shareZh: parsed.shareZh || parsed.zh || parsed.cn || '',
    shareEn: parsed.shareEn || parsed.en || '',
  };
};

const buildPrompt = (input: PosterInput, copyTitle: string, copySubtitle: string) => {
  const keywords = (input.keywords ?? []).filter(Boolean);
  const subject = input.city ? `${input.city} ???` : '??????';
  const theme = input.theme ?? '??????';
  const style = input.style ?? '???';
  const size = input.size ?? '1024x1024';
  const language = input.language ?? 'bilingual';
  const description = input.promptPolished ?? input.prompt ?? '';
  return [
    `Create a tourism poster illustration of ${subject}.`,
    description ? `Scene description: ${description}.` : '',
    `Theme: ${theme}. Visual style: ${style}.`,
    `Include rich atmosphere, inviting lighting, cinematic composition.`,
    `Leave clean space for overlay text; avoid embedded text.`,
    `Language hint: ${language}.`,
    `Suggested copy: "${copyTitle}" / "${copySubtitle}".`,
    keywords.length ? `Keywords: ${keywords.join(', ')}.` : '',
    `Output size: ${size}.`,
  ]
    .filter(Boolean)
    .join(' ');
};

const extractImageUrl = (response: any) => {
  if (!response) return '';
  if (Array.isArray(response?.data) && response.data[0]?.url) return response.data[0].url;
  if (Array.isArray(response?.data) && response.data[0]?.b64_json) return response.data[0].b64_json;
  if (response?.data?.url) return response.data.url;
  if (response?.url) return response.url;
  return '';
};

export const registerPosterRoutes = async (app: FastifyInstance) => {
  app.get('/posters', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const { limit } = request.query as { limit?: string };
    if (isMockMode()) {
      const items = store.listPosters();
      return ok(limit ? items.slice(0, Number(limit)) : items);
    }
    const db = getPool();
    const rows = await db.query(
      `SELECT id, city, theme, style, language, platform, size, prompt_raw, prompt_polished, prompt, image_url,
              copy_title, copy_subtitle, copy_title_raw, copy_subtitle_raw, copy_title_polished, copy_subtitle_polished,
              share_zh, share_en, tags, created_at, updated_at
       FROM posters
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [user.id, Number(limit ?? 20)],
    );
    return ok(rows.rows.map(mapRow));
  });

  app.post('/posters/polish', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as PosterInput;
    const { copyTitle: copyTitleRaw, copySubtitle: copySubtitleRaw } = buildCopy(body);
    const promptRaw = body.prompt?.trim() || '';

    if (isMockMode() || !hasDeepseekKey()) {
      return ok({
        copyTitlePolished: copyTitleRaw,
        copySubtitlePolished: copySubtitleRaw,
        promptPolished: promptRaw,
      });
    }

    const keywords = (body.keywords ?? []).filter(Boolean).join(', ');
    const hint = [
      `城市: ${body.city ?? ''}`,
      `主题: ${body.theme ?? ''}`,
      `风格: ${body.style ?? ''}`,
      `平台: ${body.platform ?? ''}`,
      `语言: ${body.language ?? ''}`,
      keywords ? `关键词: ${keywords}` : '',
      promptRaw ? `原始描述: ${promptRaw}` : '',
      `原始标题: ${copyTitleRaw}`,
      `原始副标题: ${copySubtitleRaw}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await chatCompletion([
        {
          role: 'system',
          content:
            'You are a travel poster copywriter. Return JSON only with fields copyTitlePolished, copySubtitlePolished, promptPolished.',
        },
        {
          role: 'user',
          content: `${hint}\n\nPolish the copy to be vivid and concise. Follow language preference. copyTitle <= 14 chars, copySubtitle <= 20 chars, promptPolished <= 80 chars.`,
        },
      ]);

      const rawText = extractText(response);
      const parsed = parseJsonFromText(rawText) ?? {};

      const copyTitlePolished =
        parsed.copyTitlePolished || parsed.copyTitle || parsed.title || copyTitleRaw;
      const copySubtitlePolished =
        parsed.copySubtitlePolished || parsed.copySubtitle || parsed.subtitle || copySubtitleRaw;
      const promptPolished = parsed.promptPolished || parsed.prompt || promptRaw;

      return ok({
        copyTitlePolished,
        copySubtitlePolished,
        promptPolished,
      });
    } catch (error: any) {
      return ok({
        copyTitlePolished: copyTitleRaw,
        copySubtitlePolished: copySubtitleRaw,
        promptPolished: promptRaw,
        warning: error?.message ?? 'deepseek_failed',
      });
    }
  });

  app.post('/posters/generate', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const body = request.body as PosterInput;

    const { copyTitle: copyTitleRaw, copySubtitle: copySubtitleRaw } = buildCopy(body);
    const copyTitlePolishedValue = body.copyTitlePolished?.trim();
    const copySubtitlePolishedValue = body.copySubtitlePolished?.trim();
    const copyTitlePolished = copyTitlePolishedValue || undefined;
    const copySubtitlePolished = copySubtitlePolishedValue || undefined;
    const copyTitle = copyTitlePolished ?? copyTitleRaw;
    const copySubtitle = copySubtitlePolished ?? copySubtitleRaw;
    const promptRaw = body.prompt?.trim() || '';
    const promptPolishedValue = body.promptPolished?.trim();
    const promptPolished = promptPolishedValue || undefined;
    const promptPolishedDb = promptPolishedValue || null;
    const prompt = buildPrompt(
      {
        ...body,
        prompt: promptRaw,
        promptPolished,
      },
      copyTitle,
      copySubtitle,
    );
    const tags = [body.city, body.theme, body.style].filter(Boolean) as string[];
    const size = body.size ?? '1024x1024';
    const shareFallback = buildShareFallback(body, copyTitle, copySubtitle);

    let imageUrl = '';
    const id = randomUUID();
    
    if (isMockMode()) {
      imageUrl = `https://picsum.photos/seed/poster-${Date.now()}/1024/1024`;
    } else {
      const sharePromise = hasDeepseekKey()
        ? generateShareCopy(body, copyTitle, copySubtitle, promptPolished ?? promptRaw).catch(() => shareFallback)
        : Promise.resolve(shareFallback);

      const [result, shareResult] = await Promise.all([generateImage(prompt, size), sharePromise]);
      const tempImageUrl = extractImageUrl(result);
      
      if (!tempImageUrl) {
        reply.status(502);
        return fail('Image generation failed.');
      }

      // ✅ 下载图片并上传到阿里云OSS
      try {
        console.log('📥 Downloading image from Doubao...');
        const response = await fetch(tempImageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        
        console.log('📤 Uploading to Aliyun OSS...');
        const filename = `${id}.png`;
        imageUrl = await uploadImageToOSS(Buffer.from(arrayBuffer), filename);
        console.log('✅ Image uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('❌ Failed to upload to OSS:', error);
        // 降级：使用原始URL（可能会过期）
        imageUrl = tempImageUrl;
        console.warn('⚠️  Using temporary URL as fallback');
      }

      shareFallback.shareZh = shareResult.shareZh || shareFallback.shareZh;
      shareFallback.shareEn = shareResult.shareEn || shareFallback.shareEn;
    }

    if (isMockMode() && hasDeepseekKey()) {
      try {
        const shareResult = await generateShareCopy(body, copyTitle, copySubtitle, promptPolished ?? promptRaw);
        shareFallback.shareZh = shareResult.shareZh || shareFallback.shareZh;
        shareFallback.shareEn = shareResult.shareEn || shareFallback.shareEn;
      } catch {
        // fallback already set
      }
    }

    if (isMockMode()) {
      const entry = {
        id,
        city: body.city,
        theme: body.theme,
        style: body.style,
        language: body.language,
        platform: body.platform,
        size,
        promptRaw,
        promptPolished,
        prompt,
        imageUrl,
        copyTitle,
        copySubtitle,
        copyTitleRaw,
        copySubtitleRaw,
        copyTitlePolished,
        copySubtitlePolished,
        shareZh: shareFallback.shareZh,
        shareEn: shareFallback.shareEn,
        tags,
        createdAt: new Date().toISOString(),
      };
      store.addPoster(entry);
      return ok(entry);
    }

    const db = getPool();
    const created = await db.query(
      `INSERT INTO posters (id, user_id, city, theme, style, language, platform, size, prompt_raw, prompt_polished, prompt, image_url,
                            copy_title, copy_subtitle, copy_title_raw, copy_subtitle_raw, copy_title_polished, copy_subtitle_polished,
                            share_zh, share_en, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING id, city, theme, style, language, platform, size, prompt_raw, prompt_polished, prompt, image_url,
                 copy_title, copy_subtitle, copy_title_raw, copy_subtitle_raw, copy_title_polished, copy_subtitle_polished,
                 share_zh, share_en, tags, created_at, updated_at`,
      [
        id,
        user.id,
        body.city ?? null,
        body.theme ?? null,
        body.style ?? null,
        body.language ?? null,
        body.platform ?? null,
        size,
        promptRaw || null,
        promptPolishedDb,
        prompt,
        imageUrl,
        copyTitle ?? null,
        copySubtitle ?? null,
        copyTitleRaw ?? null,
        copySubtitleRaw ?? null,
        copyTitlePolishedValue ?? null,
        copySubtitlePolishedValue ?? null,
        shareFallback.shareZh ?? null,
        shareFallback.shareEn ?? null,
        tags,
      ],
    );
    return ok(mapRow(created.rows[0]));
  });

  app.delete('/posters/:id', async (request, reply) => {
    const user = await requireAuthUser(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    if (isMockMode()) {
      store.removePoster(id);
      return ok({ id });
    }
    const db = getPool();
    const result = await db.query('DELETE FROM posters WHERE id = $1 AND user_id = $2 RETURNING id', [
      id,
      user.id,
    ]);
    if (result.rowCount === 0) {
      reply.status(404);
      return fail('Poster not found.');
    }
    return ok({ id });
  });
};
