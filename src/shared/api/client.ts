export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

let getAccessToken: TokenGetter = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

export function bindAuth(options: {
  getAccessToken: TokenGetter;
  onUnauthorized: UnauthorizedHandler;
}): void {
  getAccessToken = options.getAccessToken;
  onUnauthorized = options.onUnauthorized;
}

const BASE_URL = 'https://dummyjson.com';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  skipUnauthorizedHandler?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, skipUnauthorizedHandler, headers, ...rest } = options;
  const token = skipAuth ? null : getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (response.status === 401 && !skipUnauthorizedHandler) {
    onUnauthorized();
  }

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null) {
    const record = data as { message?: unknown; error?: unknown };
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error === 'string') return record.error;
  }
  return null;
}
