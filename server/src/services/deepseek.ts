import { fetchJson } from '../utils/http.js';
import { requireEnv } from '../utils/env.js';

const DEEPSEEK_BASE = 'https://api.deepseek.com';

export const chatCompletion = async (messages: { role: string; content: string }[]) => {
  const apiKey = requireEnv('DEEPSEEK_API_KEY');
  const url = `${DEEPSEEK_BASE}/chat/completions`;
  return fetchJson<any>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
    }),
  });
};
