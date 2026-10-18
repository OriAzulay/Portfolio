import type { ContactMessage } from "@/types/contact";
import type { ImageKind, PortfolioData } from "@/types/portfolio";
import type { ContactMessageInput } from "./validation/contact";

/** Browser-side wrapper around the app's JSON API. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[] | undefined>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const response = await fetch(url, {
    ...init,
    headers: isForm ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });

  const body = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.error ?? "Something went wrong", response.status, body.details);
  }
  return body as T;
}

const json = (value: unknown) => JSON.stringify(value);

export const api = {
  login: (password: string) =>
    request<{ success: true }>("/api/auth/login", { method: "POST", body: json({ password }) }),

  logout: () => request<{ success: true }>("/api/auth/logout", { method: "POST" }),

  savePortfolio: (data: PortfolioData) =>
    request<{ data: PortfolioData }>("/api/portfolio", { method: "PUT", body: json({ data }) }),

  uploadImage: (file: File, kind: ImageKind) => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    return request<{ id: string; url: string }>("/api/images", { method: "POST", body: form });
  },

  sendContactMessage: (input: ContactMessageInput) =>
    request<{ success: true }>("/api/contact", { method: "POST", body: json(input) }),

  listMessages: () =>
    request<{ messages: ContactMessage[]; unread: number }>("/api/messages", { cache: "no-store" }),

  setMessageRead: (id: number, isRead: boolean) =>
    request<{ success: true }>(`/api/messages/${id}`, { method: "PATCH", body: json({ isRead }) }),

  deleteMessage: (id: number) =>
    request<{ success: true }>(`/api/messages/${id}`, { method: "DELETE" }),

  trackVisit: () => request<void>("/api/visits", { method: "POST", keepalive: true }),
};
