import { readLocalString } from './storage';
import { AUTH_TOKEN_KEY } from './storageKeys';

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8787';

const isFormData = (body: RequestInit['body']) =>
  typeof FormData !== 'undefined' && body instanceof FormData;

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return readLocalString(AUTH_TOKEN_KEY);
};

const parsePayload = async (res: Response) => {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

export const apiRequest = async <T>(path: string, init: RequestInit = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body && !headers.has('Content-Type') && !isFormData(init.body)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers });
  const payload = await parsePayload(res);

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, payload);
  }

  if (payload && typeof payload === 'object' && 'ok' in payload) {
    const wrapped = payload as ApiResponse<T>;
    if (!wrapped.ok) {
      throw new ApiError(wrapped.error || 'Request failed', res.status, payload);
    }
    return wrapped.data;
  }

  return payload as T;
};

export const apiGet = <T>(path: string, init: RequestInit = {}) =>
  apiRequest<T>(path, { ...init, method: 'GET' });

export const apiPost = <T>(path: string, body?: unknown, init: RequestInit = {}) => {
  const hasBody = typeof body !== 'undefined';
  const finalInit: RequestInit = { ...init, method: 'POST' };
  if (hasBody) {
    finalInit.body = body instanceof FormData || typeof body === 'string' ? body : JSON.stringify(body);
  }
  return apiRequest<T>(path, finalInit);
};

export const apiDelete = <T>(path: string, init: RequestInit = {}) =>
  apiRequest<T>(path, { ...init, method: 'DELETE' });
