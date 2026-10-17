// اتصال الواجهة بخادم «على قدّك»

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: { 'content-type': 'application/json', ...(init.headers || {}) },
    });
  } catch {
    throw new ApiError('لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مجدداً.', 0);
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // رد بلا محتوى
  }
  if (!res.ok) {
    throw new ApiError(data?.error || 'حدث خطأ غير متوقع. حاول مرة أخرى.', res.status);
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: AuthUser }>('/api/auth/me'),
  register: (name: string, email: string, password: string) =>
    request<{ user: AuthUser; isNew: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  changePassword: (current: string, next: string) =>
    request<{ ok: true }>('/api/auth/password', { method: 'POST', body: JSON.stringify({ current, next }) }),
  updateName: (name: string) =>
    request<{ user: AuthUser }>('/api/account/name', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteAccount: (password: string) =>
    request<{ ok: true }>('/api/account/delete', { method: 'POST', body: JSON.stringify({ password }) }),
  checkReset: (token: string) =>
    request<{ name: string; email: string }>(`/api/auth/reset?token=${encodeURIComponent(token)}`),
  completeReset: (token: string, password: string) =>
    request<{ user: AuthUser }>('/api/auth/reset', { method: 'POST', body: JSON.stringify({ token, password }) }),
  adminUsers: () =>
    request<{
      users: { id: string; email: string; name: string; createdAt: number; lastSavedAt: number | null }[];
    }>('/api/admin/users'),
  adminResetLink: (userId: string) =>
    request<{ url: string; expiresAt: number; name: string; email: string }>('/api/admin/reset-link', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  getState: () => request<{ data: Record<string, unknown> | null; updatedAt: number | null }>('/api/state'),
  putState: (data: Record<string, unknown>, keepalive = false) =>
    request<{ ok: true; updatedAt: number }>('/api/state', {
      method: 'PUT',
      body: JSON.stringify({ data }),
      keepalive,
    }),
};
