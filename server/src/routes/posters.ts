import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { generateImage } from '../services/doubao.js';
import { getPool } from '../db.js';
import { store } from '../store.js';
import { ok, fail } from '../utils/response.js';

type PosterInput = {
  city?: string;
  theme?: string;
  style?: string;
  language?: 'zh' | 'en' | 'bilingual';
  platform?: string;
  size?: string;
  keywords?: string[];
};

type PosterRecord = {
  id: string;
  city?: string | null;
  theme?: string | null;
  style?: string | null;
  language?: string | null;
  platform?: string | null;
  size?: string | null;
  prompt: string;
  imageUrl: string;
  copyTitle?: string | null;
  copySubtitle?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const isMockMode = () => (process.env.MOCK_MODE ?? 'false') === 'true';

const mapRow = (row: {
  id: string;
  city: string | null;
  theme: string | null;
  style: string | null;
  language: string | null;
  platform: string | null;
  size: string | null;
  prompt: string;
  image_url: string;
  copy_title: string | null;
  copy_subtitle: string | null;
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
  prompt: row.prompt,
  imageUrl: row.image_url,
  copyTitle: row.copy_title,
  copySubtitle: row.copy_subtitle,
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

const buildPrompt = (input: PosterInput, copyTitle: string, copySubtitle: string) => {
  const keywords = (input.keywords ?? []).filter(Boolean);
  const subject = input.city ? `${input.city} 旅游` : '中国旅游';
  const theme = input.theme ?? '城市漫游';
  const style = input.style ?? '国潮';
  const size = input.size ?? '1024x1024';
  const language = input.language ?? 'bilingual';
  return [
    `Create a tourism poster illustration of ${subject}.`,
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
  app.get('/posters', async (request) => {
    const { limit } = request.query as { limit?: string };
    if (isMockMode()) {
      const items = store.listPosters();
      return ok(limit ? items.slice(0, Number(limit)) : items);
    }
    const db = getPool();
    const rows = await db.query(
      `SELECT id, city, theme, style, language, platform, size, prompt, image_url, copy_title, copy_subtitle, tags, created_at, updated_at
       FROM posters
       ORDER BY created_at DESC
       LIMIT $1`,
      [Number(limit ?? 20)],
    );
    return ok(rows.rows.map(mapRow));
  });

  app.post('/posters/generate', async (request, reply) => {
    const body = request.body as PosterInput;

    const { copyTitle, copySubtitle } = buildCopy(body);
    const prompt = buildPrompt(body, copyTitle, copySubtitle);
    const tags = [body.city, body.theme, body.style].filter(Boolean) as string[];
    const size = body.size ?? '1024x1024';

    let imageUrl = '';
    if (isMockMode()) {
      imageUrl = `https://picsum.photos/seed/poster-${Date.now()}/1024/1024`;
    } else {
      const result = await generateImage(prompt);
      imageUrl = extractImageUrl(result);
      if (!imageUrl) {
        reply.status(502);
        return fail('Image generation failed.');
      }
    }

    if (isMockMode()) {
      const entry = {
        id: `poster_${Date.now()}`,
        city: body.city,
        theme: body.theme,
        style: body.style,
        language: body.language,
        platform: body.platform,
        size,
        prompt,
        imageUrl,
        copyTitle,
        copySubtitle,
        tags,
        createdAt: new Date().toISOString(),
      };
      store.addPoster(entry);
      return ok(entry);
    }

    const db = getPool();
    const id = randomUUID();
    const created = await db.query(
      `INSERT INTO posters (id, city, theme, style, language, platform, size, prompt, image_url, copy_title, copy_subtitle, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, city, theme, style, language, platform, size, prompt, image_url, copy_title, copy_subtitle, tags, created_at, updated_at`,
      [
        id,
        body.city ?? null,
        body.theme ?? null,
        body.style ?? null,
        body.language ?? null,
        body.platform ?? null,
        size,
        prompt,
        imageUrl,
        copyTitle ?? null,
        copySubtitle ?? null,
        tags,
      ],
    );
    return ok(mapRow(created.rows[0]));
  });

  app.delete('/posters/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (isMockMode()) {
      store.removePoster(id);
      return ok({ id });
    }
    const db = getPool();
    const result = await db.query('DELETE FROM posters WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      reply.status(404);
      return fail('Poster not found.');
    }
    return ok({ id });
  });
};
