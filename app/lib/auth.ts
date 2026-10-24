// Simple auth utilities
const AUTH_TOKEN_KEY = "portfolio_auth_token";
const TOKEN_VALUE = "authenticated_session";

export function setAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, TOKEN_VALUE);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY) === TOKEN_VALUE;
  }
  return false;
}
