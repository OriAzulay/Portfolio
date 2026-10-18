"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";
import {
  contactMessageSchema,
  type ContactFieldErrors,
  type ContactMessageInput,
} from "@/lib/validation/contact";
import { cn } from "@/lib/utils";
import { SendIcon } from "@/components/ui/icons";
import form from "@/components/ui/Form.module.css";
import typo from "@/components/ui/Typography.module.css";
import styles from "./ContactSection.module.css";

const EMPTY: Required<ContactMessageInput> = { name: "", email: "", message: "", website: "" };

type Status = { type: "idle" } | { type: "sending" } | { type: "success" } | { type: "error"; message: string };

function toFieldErrors(details: Record<string, string[] | undefined> | undefined): ContactFieldErrors {
  return {
    name: details?.name?.[0],
    email: details?.email?.[0],
    message: details?.message?.[0],
  };
}

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const update = (field: keyof typeof EMPTY) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = contactMessageSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(z.flattenError(parsed.error).fieldErrors));
      return;
    }

    setStatus({ type: "sending" });
    try {
      await api.sendContactMessage(parsed.data);
      setValues(EMPTY);
      setErrors({});
      setStatus({ type: "success" });
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) setErrors(toFieldErrors(error.details));
      setStatus({
        type: "error",
        message: error instanceof ApiError ? error.message : "Could not send the message. Please try again.",
      });
    }
  };

  const sending = status.type === "sending";

  return (
    <section className={form.box}>
      <h3 className={cn(typo.h3, form.title)}>Contact Form</h3>

      {status.type === "success" && (
        <p className={cn(form.status, form.success)} role="status">
          Thanks! Your message was sent - I&apos;ll get back to you soon.
        </p>
      )}
      {status.type === "error" && (
        <p className={cn(form.status, form.error)} role="alert">
          {status.message}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={form.grid}>
          <div className={form.field}>
            <label className="visually-hidden" htmlFor="contact-name">
              Full name
            </label>
            <input
              id="contact-name"
              className={form.input}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Full Name"
              value={values.name}
              onChange={(e) => update("name")(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              required
            />
            {errors.name && (
              <span id="contact-name-error" className={form.fieldError}>
                {errors.name}
              </span>
            )}
          </div>

          <div className={form.field}>
            <label className="visually-hidden" htmlFor="contact-email">
              Email address
            </label>
            <input
              id="contact-email"
              className={form.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email Address"
              value={values.email}
              onChange={(e) => update("email")(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              required
            />
            {errors.email && (
              <span id="contact-email-error" className={form.fieldError}>
                {errors.email}
              </span>
            )}
          </div>
        </div>

        <div className={form.field}>
          <label className="visually-hidden" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            className={cn(form.input, form.textarea)}
            name="message"
            placeholder="Your Message"
            value={values.message}
            onChange={(e) => update("message")(e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            required
          />
          {errors.message && (
            <span id="contact-message-error" className={form.fieldError}>
              {errors.message}
            </span>
          )}
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => update("website")(e.target.value)}
          />
        </div>

        <button className={form.button} type="submit" disabled={sending}>
          <span className={styles.sendIcon}>
            <SendIcon />
          </span>
          <span>{sending ? "Sending..." : "Send Message"}</span>
        </button>
      </form>
    </section>
  );
}
