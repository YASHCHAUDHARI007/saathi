import { runtimeConfig } from '../config/runtime';

const ACCESS_TOKEN_KEY = 'saathi.access_token';
const REFRESH_TOKEN_KEY = 'saathi.refresh_token';
const SESSION_EXPIRED_EVENT = 'saathi:session-expired';

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let tokenGeneration = 0;
let activeRefresh: {
  generation: number;
  refreshToken: string;
  promise: Promise<string>;
} | null = null;

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_display?: string;
  district?: string | null;
  district_name?: string | null;
  state?: string | null;
  state_name?: string | null;
  phone_number?: string | null;
  designation?: string;
  badge_number?: string;
  is_active?: boolean;
}

export interface AuthSession {
  access: string;
  refresh: string;
  user: ApiUser;
}

export interface StaffDirectoryEntry {
  id: string;
  display_name: string;
  role: string;
  district: string | null;
  district_name: string | null;
  designation: string;
}

export interface CollectionResult<T> {
  items: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getSessionStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const readStoredToken = (key: string, fallback: string | null): string | null => {
  try {
    return getSessionStorage()?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStoredToken = (key: string, value: string | null): void => {
  try {
    const storage = getSessionStorage();
    if (!storage) return;
    if (value) storage.setItem(key, value);
    else storage.removeItem(key);
  } catch {
    // In-memory storage remains available when browser storage is blocked.
  }
};

export const sessionTokens = {
  getAccess(): string | null {
    memoryAccessToken = readStoredToken(ACCESS_TOKEN_KEY, memoryAccessToken);
    return memoryAccessToken;
  },
  getRefresh(): string | null {
    memoryRefreshToken = readStoredToken(REFRESH_TOKEN_KEY, memoryRefreshToken);
    return memoryRefreshToken;
  },
  set(tokens: { access: string; refresh?: string | null }): void {
    tokenGeneration += 1;
    activeRefresh = null;
    memoryAccessToken = tokens.access;
    writeStoredToken(ACCESS_TOKEN_KEY, tokens.access);
    if (tokens.refresh !== undefined) {
      memoryRefreshToken = tokens.refresh;
      writeStoredToken(REFRESH_TOKEN_KEY, tokens.refresh);
    }
  },
  clear(): void {
    tokenGeneration += 1;
    activeRefresh = null;
    memoryAccessToken = null;
    memoryRefreshToken = null;
    writeStoredToken(ACCESS_TOKEN_KEY, null);
    writeStoredToken(REFRESH_TOKEN_KEY, null);
  },
  hasSession(): boolean {
    return Boolean(this.getAccess() || this.getRefresh());
  },
};

const firstString = (...values: unknown[]): string | undefined =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);

const firstNestedString = (value: unknown, depth = 0): string | undefined => {
  if (depth > 4) return undefined;
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstNestedString(item, depth + 1);
      if (found) return found;
    }
  } else if (isRecord(value)) {
    for (const item of Object.values(value)) {
      const found = firstNestedString(item, depth + 1);
      if (found) return found;
    }
  }
  return undefined;
};

const extractErrorMessage = (payload: unknown, fallback: string): { message: string; code?: string } => {
  if (!isRecord(payload)) return { message: fallback };

  const nestedError = isRecord(payload.error) ? payload.error : undefined;
  const fieldErrors = Object.values(payload).find(Array.isArray);
  const fieldError = Array.isArray(fieldErrors)
    ? firstString(...fieldErrors)
    : undefined;
  const directMessage = firstString(
    nestedError?.message,
    nestedError?.detail,
    payload.detail,
    payload.message,
    fieldError,
  );
  const detailsMessage = firstNestedString(nestedError?.details);
  const message = directMessage === 'Validation or processing error occurred.'
    ? detailsMessage ?? directMessage
    : directMessage ?? detailsMessage;
  const code = firstString(nestedError?.code, payload.code);

  return { message: message ?? fallback, code };
};

const readResponsePayload = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text.length <= 300 && !text.trimStart().startsWith('<') ? text : undefined;
  }
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status = 0, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'The request could not be completed. Please try again.';
};

export const unwrapData = <T>(payload: unknown): T => {
  if (isRecord(payload) && 'data' in payload) return payload.data as T;
  return payload as T;
};

export const unwrapCollection = <T>(payload: unknown): CollectionResult<T> => {
  const unwrapped = unwrapData<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return { items: unwrapped as T[], count: unwrapped.length, next: null, previous: null };
  }

  if (isRecord(unwrapped) && Array.isArray(unwrapped.results)) {
    const items = unwrapped.results as T[];
    return {
      items,
      count: typeof unwrapped.count === 'number' ? unwrapped.count : items.length,
      next: typeof unwrapped.next === 'string' ? unwrapped.next : null,
      previous: typeof unwrapped.previous === 'string' ? unwrapped.previous : null,
    };
  }

  if (isRecord(payload) && Array.isArray(payload.results)) {
    const items = payload.results as T[];
    return {
      items,
      count: typeof payload.count === 'number' ? payload.count : items.length,
      next: typeof payload.next === 'string' ? payload.next : null,
      previous: typeof payload.previous === 'string' ? payload.previous : null,
    };
  }

  return { items: [], count: 0, next: null, previous: null };
};

const apiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    throw new ApiError('External API URLs are not allowed by the SAATHI API client.');
  }
  return `${runtimeConfig.apiBaseUrl}/${path.replace(/^\/+/, '')}`;
};

const notifySessionExpired = (): void => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

const refreshAccessToken = async (): Promise<string> => {
  const refresh = sessionTokens.getRefresh();
  if (!refresh) throw new ApiError('Your session has expired. Please sign in again.', 401, 'NO_REFRESH_TOKEN');
  const generation = tokenGeneration;
  if (
    activeRefresh
    && activeRefresh.generation === generation
    && activeRefresh.refreshToken === refresh
  ) {
    return activeRefresh.promise;
  }

  const promise = (async () => {
    const response = await fetch(apiUrl('auth/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh }),
      credentials: 'same-origin',
    });
    const payload = await readResponsePayload(response);
    const isCurrentRefresh = (): boolean =>
      generation === tokenGeneration && sessionTokens.getRefresh() === refresh;

    if (!response.ok) {
      if (!isCurrentRefresh()) {
        throw new ApiError('A newer authenticated session replaced this refresh request.', 409, 'STALE_REFRESH');
      }
      const parsed = extractErrorMessage(payload, 'Your session has expired. Please sign in again.');
      throw new ApiError(parsed.message, response.status, parsed.code, payload);
    }

    if (!isCurrentRefresh()) {
      throw new ApiError('A newer authenticated session replaced this refresh request.', 409, 'STALE_REFRESH');
    }
    const data = unwrapData<UnknownRecord>(payload);
    const access = firstString(data.access);
    if (!access) {
      throw new ApiError('The server returned an invalid refresh response.', 502, 'INVALID_REFRESH_RESPONSE');
    }

    sessionTokens.set({ access, refresh: firstString(data.refresh) });
    return access;
  })()
    .catch((error: unknown) => {
      if (
        generation === tokenGeneration
        && sessionTokens.getRefresh() === refresh
        && (!(error instanceof ApiError) || error.code !== 'STALE_REFRESH')
      ) {
        sessionTokens.clear();
        notifySessionExpired();
      }
      throw error;
    })
    .finally(() => {
      if (activeRefresh?.promise === promise) activeRefresh = null;
    });

  activeRefresh = { generation, refreshToken: refresh, promise };
  return promise;
};

const request = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const {
    auth = true,
    retryOnUnauthorized = true,
    headers: suppliedHeaders,
    body,
    ...requestInit
  } = options;
  const headers = new Headers(suppliedHeaders);
  headers.set('Accept', 'application/json');

  const requestGeneration = tokenGeneration;
  const access = auth ? sessionTokens.getAccess() : null;
  if (access) headers.set('Authorization', `Bearer ${access}`);

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string' || body instanceof Blob) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...requestInit,
      headers,
      body: requestBody,
      credentials: requestInit.credentials ?? 'same-origin',
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error && error.message ? `Unable to reach the SAATHI API: ${error.message}` : 'Unable to reach the SAATHI API.',
      0,
      'NETWORK_ERROR',
    );
  }

  if (response.status === 401 && auth && retryOnUnauthorized) {
    if (
      requestGeneration !== tokenGeneration
      || sessionTokens.getAccess() !== access
    ) {
      throw new ApiError(
        'The authenticated session changed while this request was in flight.',
        409,
        'STALE_SESSION',
      );
    }
    const renewedAccess = await refreshAccessToken();
    if (sessionTokens.getAccess() !== renewedAccess) {
      throw new ApiError(
        'A newer authenticated session replaced this request.',
        409,
        'STALE_SESSION',
      );
    }
    const retryHeaders = new Headers(headers);
    retryHeaders.set('Authorization', `Bearer ${renewedAccess}`);
    return request<T>(path, {
      ...requestInit,
      headers: retryHeaders,
      body,
      auth,
      retryOnUnauthorized: false,
    });
  }

  const payload = await readResponsePayload(response);
  if (!response.ok) {
    const parsed = extractErrorMessage(payload, `Request failed with status ${response.status}.`);
    throw new ApiError(parsed.message, response.status, parsed.code, payload);
  }

  return unwrapData<T>(payload);
};

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'GET' }),
  getCollection: async <T>(path: string, options?: ApiRequestOptions): Promise<CollectionResult<T>> => {
    const payload = await request<unknown>(path, { ...options, method: 'GET' });
    return unwrapCollection<T>(payload);
  },
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiRequestOptions): Promise<T> =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export const onSessionExpired = (handler: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};
