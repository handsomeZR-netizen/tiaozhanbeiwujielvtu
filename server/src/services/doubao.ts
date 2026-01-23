import { fetchJson } from '../utils/http.js';
import { requireEnv } from '../utils/env.js';

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

export const multimodalDescribe = async (payload: {
  text: string;
  imageUrl?: string;
}) => {
  const apiKey = requireEnv('ARK_API_KEY');
  const url = `${ARK_BASE}/responses`;
  const content = [] as Array<{ type: string; text?: string; image_url?: string }>;
  if (payload.imageUrl) {
    content.push({ type: 'input_image', image_url: payload.imageUrl });
  }
  content.push({ type: 'input_text', text: payload.text });

  return fetchJson<any>(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-8-251228',
        input: [{ role: 'user', content }],
      }),
    },
    60000,
  );
};

export const generateImage = async (prompt: string, size: string = '2048x2048') => {
  const apiKey = requireEnv('ARK_API_KEY');
  const url = `${ARK_BASE}/images/generations`;
  // Use 60 second timeout for image generation
  return fetchJson<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      response_format: 'url',
      size,
      watermark: false,
    }),
  }, 60000);
};

export const createVideoTask = async (prompt: string, imageUrl?: string) => {
  const apiKey = requireEnv('ARK_API_KEY');
  const url = `${ARK_BASE}/contents/generations/tasks`;
  const content: any[] = [{ type: 'text', text: prompt }];
  if (imageUrl) {
    content.push({ type: 'image_url', image_url: { url: imageUrl } });
  }

  return fetchJson<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seedance-1-5-pro-251215',
      content,
    }),
  });
};
