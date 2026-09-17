import { z } from 'zod';

import { apiRequest } from '../../shared/api/client';
import type { DummyUser, LoginResponse } from '../../shared/api/types';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const DEMO_LOGIN = {
  username: 'emilys',
  password: 'emilyspass',
} as const;

export function loginRequest(values: LoginForm): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    skipAuth: true,
    skipUnauthorizedHandler: true,
    body: JSON.stringify({
      username: values.username.trim(),
      password: values.password,
      expiresInMins: 1440,
    }),
  });
}

export function fetchMe(): Promise<DummyUser> {
  return apiRequest<DummyUser>('/auth/me', { skipUnauthorizedHandler: true });
}
