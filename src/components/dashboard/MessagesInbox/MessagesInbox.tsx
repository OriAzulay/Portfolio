"use client";

import { useState } from "react";
import type { ContactMessage } from "@/types/contact";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ContentCard } from "@/components/ui/ContentCard";
import form from "@/components/ui/Form.module.css";
import { EditorSection, EmptyHint } from "../editors/EditorSection";
import styles from "./MessagesInbox.module.css";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

type Props = {
  messages: ContactMessage[];
  onMessagesChange: (messages: ContactMessage[]) => void;
};

export function MessagesInbox({ messages, onMessagesChange }: Props) {
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const run = async (id: number | null, action: () => Promise<void>) => {
    setError("");
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await run(null, async () => onMessagesChange((await api.listMessages()).messages));
    setRefreshing(false);
  };

  const toggleRead = (message: ContactMessage) =>
    run(message.id, async () => {
      await api.setMessageRead(message.id, !message.isRead);
      onMessagesChange(messages.map((m) => (m.id === message.id ? { ...m, isRead: !m.isRead } : m)));
    });

  const remove = (message: ContactMessage) => {
    if (!confirm(`Delete the message from ${message.name}?`)) return;
    return run(message.id, async () => {
      await api.deleteMessage(message.id);
      onMessagesChange(messages.filter((m) => m.id !== message.id));
    });
  };

  return (
    <EditorSection title="Messages" addLabel={refreshing ? "Refreshing..." : "Refresh"} onAdd={refresh}>
      {error && (
        <p className={cn(form.status, form.error)} role="alert">
          {error}
        </p>
      )}
      {messages.length === 0 && <EmptyHint>No messages yet. They will appear here when someone uses the contact form.</EmptyHint>}

      <ul className={styles.list}>
        {messages.map((message) => (
          <ContentCard as="li" compact key={message.id} className={cn(!message.isRead && styles.unread)}>
            <div className={styles.header}>
              <div>
                <p className={styles.name}>
                  {!message.isRead && <span className={styles.dot} aria-label="Unread" />}
                  {message.name}
                </p>
                <a className={styles.email} href={`mailto:${message.email}`}>
                  {message.email}
                </a>
              </div>
              <time className={styles.date} dateTime={message.createdAt}>
                {formatDate(message.createdAt)}
              </time>
            </div>

            <p className={styles.body}>{message.message}</p>

            <div className={styles.actions}>
              <a
                className={styles.action}
                href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message")}`}
              >
                Reply
              </a>
              <button
                type="button"
                className={styles.action}
                disabled={busyId === message.id}
                onClick={() => toggleRead(message)}
              >
                {message.isRead ? "Mark unread" : "Mark read"}
              </button>
              <button
                type="button"
                className={cn(styles.action, styles.danger)}
                disabled={busyId === message.id}
                onClick={() => remove(message)}
              >
                Delete
              </button>
            </div>
          </ContentCard>
        ))}
      </ul>
    </EditorSection>
  );
}
