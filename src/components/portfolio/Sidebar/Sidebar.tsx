"use client";

import { useState } from "react";
import type { PersonalInfo } from "@/types/portfolio";
import { avatarSrc } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/IconBox";
import { Panel } from "@/components/ui/Panel";
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  XIcon,
} from "@/components/ui/icons";
import styles from "./Sidebar.module.css";

const SOCIAL_LINKS = [
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "twitter", label: "X (Twitter)", Icon: XIcon },
  { key: "github", label: "GitHub", Icon: GitHubIcon },
] as const;

export function Sidebar({ info }: { info: PersonalInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <Panel as="aside" className={cn(styles.sidebar, open && styles.open)}>
      <div className={styles.info}>
        <figure className={styles.avatarBox}>
          {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
          <img className={styles.avatar} src={avatarSrc(info.avatarUrl, info.name)} alt={info.name} />
        </figure>

        <div>
          <h1 className={styles.name}>{info.name}</h1>
          <p className={styles.title}>{info.title}</p>
        </div>

        <button
          className={styles.moreBtn}
          type="button"
          aria-expanded={open}
          aria-controls="sidebar-contacts"
          aria-label={open ? "Hide contacts" : "Show contacts"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className={styles.moreLabel}>{open ? "Hide Contacts" : "Show Contacts"}</span>
          <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.more} id="sidebar-contacts">
        <div className={styles.separator} />

        <ul className={styles.contactsList}>
          {info.email && (
            <li className={styles.contactItem}>
              <IconBox>
                <MailIcon />
              </IconBox>
              <div className={styles.contactInfo}>
                <p className={styles.contactTitle}>Email</p>
                <a className={styles.contactValue} href={`mailto:${info.email}`}>
                  {info.email}
                </a>
              </div>
            </li>
          )}

          {info.phone && (
            <li className={styles.contactItem}>
              <IconBox>
                <PhoneIcon />
              </IconBox>
              <div className={styles.contactInfo}>
                <p className={styles.contactTitle}>Phone</p>
                <a className={styles.contactValue} href={`tel:${info.phone.replace(/\s+/g, "")}`}>
                  {info.phone}
                </a>
              </div>
            </li>
          )}

          {info.location && (
            <li className={styles.contactItem}>
              <IconBox>
                <PinIcon />
              </IconBox>
              <div className={styles.contactInfo}>
                <p className={styles.contactTitle}>Location</p>
                <address className={styles.contactValue}>{info.location}</address>
              </div>
            </li>
          )}
        </ul>

        <div className={cn(styles.separator, styles.separatorLast)} />

        <ul className={styles.socialList}>
          {SOCIAL_LINKS.filter(({ key }) => info.social[key]).map(({ key, label, Icon }) => (
            <li key={key}>
              <a
                className={styles.socialLink}
                href={info.social[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
