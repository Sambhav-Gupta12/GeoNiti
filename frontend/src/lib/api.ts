import { ApiErrorPayload } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;
  status: number;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || 'API Error');
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code || 'UNKNOWN_ERROR';
    this.details = payload.details;
  }
}

export const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (t: string) => localStorage.setItem('token', t),
  clearToken: () => localStorage.removeItem('token'),

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    const token = this.getToken();
    
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response = await fetch(url, { ...options, headers });

    // Handle 401 refresh logic once
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Relies on httpOnly cookies sent automatically if credentials: 'include' was set
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          const { data } = await refreshResponse.json();
          this.setToken(data.access_token);
          // Retry original request
          headers.set('Authorization', `Bearer ${data.access_token}`);
          response = await fetch(url, { ...options, headers });
        } else {
          this.clearToken();
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      } catch (e) {
        this.clearToken();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    if (!response.ok) {
      let errorPayload: ApiErrorPayload = { code: 'HTTP_ERROR', message: `HTTP ${response.status}` };
      try {
        const body = await response.json();
        if (body.error) errorPayload = body.error;
      } catch (e) {}
      throw new ApiError(response.status, errorPayload);
    }

    // 204 No Content
    if (response.status === 204) return {} as T;

    const result = await response.json();
    return result.data as T;
  },

  get<T>(path: string, options?: RequestInit) {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  },
  post<T>(path: string, body?: any, options?: RequestInit) {
    return this.fetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  },
  patch<T>(path: string, body?: any, options?: RequestInit) {
    return this.fetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },
  delete<T>(path: string, options?: RequestInit) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  }
};
