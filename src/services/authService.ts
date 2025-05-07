// src/services/authService.ts
import api from './api';

// The shape of the JSON you get back from /login and /check-token
export interface AuthResponse {
  token: string;
  _id: string;
  role: string;
  [key: string]: any;
}

/**
 * Log in with email & password.
 * Calls POST /api/auth/login (passport-local).
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', {
    email,
    password,
  });
  return data;
};

/**
 * Validate the stored JWT and get fresh user info.
 * Calls GET /api/auth/check-token (passport-jwt).
 */
export const checkToken = async (): Promise<AuthResponse> => {
  console.log("📦 Checking token...");
  const { data } = await api.get<AuthResponse>('/api/auth/check-token');
  console.log("✅ Token is valid:", data);
  return data;
};
