export const fetchJson = async <T>(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
};
