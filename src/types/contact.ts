export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  /** ISO 8601 (UTC) */
  createdAt: string;
};
