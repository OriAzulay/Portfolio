"use client";

import { useState } from "react";
import type { PersonalInfo } from "@/types/portfolio";
import { avatarSrc } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/IconBox";
import { Lightbox } from "@/components/ui/Lightbox/Lightbox";
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
  const [zoomed, setZoomed] = useState(false);
  const avatar = avatarSrc(info.avatarUrl, info.name);

  return (
    <Panel as="aside" className={cn(styles.sidebar, open && styles.open)}>
      <div className={styles.info}>
        <figure className={styles.avatarBox}>
          {info.avatarUrl ? (
            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => setZoomed(true)}
              aria-label={`Enlarge photo of ${info.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL or DB image */}
              <img className={styles.avatar} src={avatar} alt={info.name} />
            </button>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- generated placeholder
            <img className={styles.avatar} src={avatar} alt={info.name} />
          )}
        </figure>
        {info.avatarUrl && (
          <Lightbox src={avatar} alt={info.name} open={zoomed} onClose={() => setZoomed(false)} />
        )}

        <div>
          <h1 className={styles.name}>{info.name}</h1>
          <p className={styles.title}>{info.title}</p>
          {info.cvUrl && (
            <a className={styles.cvButton} href="/cv" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download CV
            </a>
          )}
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
