import type { FastifyInstance } from 'fastify';
import { aiMockResult } from '../mocks/index.js';
import { ok, fail } from '../utils/response.js';
import { isMockMode } from '../utils/env.js';
import { chatCompletion } from '../services/deepseek.js';
import { generateImage, multimodalDescribe } from '../services/doubao.js';

export const registerAiRoutes = async (app: FastifyInstance) => {
  app.post('/ai/scene', async (request, reply) => {
    if (isMockMode()) {
      return ok({ input: request.body ?? null, result: aiMockResult.scene });
    }

    const body = request.body as { text?: string; imageUrl?: string } | undefined;
    try {
      const result = await multimodalDescribe({
        text: body?.text ?? '请描述这张图片的主要场景。',
        imageUrl: body?.imageUrl,
      });
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'AI scene request failed.');
    }
  });

  app.post('/ai/context', async (request, reply) => {
    if (isMockMode()) {
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
      reply.status(500);
      return fail(error.message || 'AI context request failed.');
    }
  });

  app.post('/ai/image', async (request, reply) => {
    if (isMockMode()) {
      return ok({ input: request.body ?? null, result: aiMockResult.image });
    }

    const body = request.body as { prompt?: string } | undefined;
    try {
      const result = await generateImage(body?.prompt ?? '中国城市夜景，电影感风格');
      return ok(result);
    } catch (error: any) {
      reply.status(500);
      return fail(error.message || 'AI image request failed.');
    }
  });

  app.post('/ai/tags', async (request, reply) => {
    if (isMockMode()) {
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
      reply.status(500);
      return fail(error.message || 'AI tags request failed.');
    }
  });
};
