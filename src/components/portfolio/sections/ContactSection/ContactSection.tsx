import type { PersonalInfo } from "@/types/portfolio";
import { ArticleTitle } from "@/components/ui/ArticleTitle";
import { IconBox } from "@/components/ui/IconBox";
import { Panel } from "@/components/ui/Panel";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import typo from "@/components/ui/Typography.module.css";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

export function ContactSection({ info }: { info: PersonalInfo }) {
  const hasDetails = info.email || info.phone || info.location;

  return (
    <Panel>
      <ArticleTitle>Contact</ArticleTitle>

      {hasDetails && (
        <section className={styles.details}>
          <h3 className={typo.h3}>Contact Details</h3>
          <ul className={styles.detailsList}>
            {info.email && (
              <li className={styles.detailsItem}>
                <IconBox>
                  <MailIcon />
                </IconBox>
                <a className={styles.detailsText} href={`mailto:${info.email}`}>
                  {info.email}
                </a>
              </li>
            )}
            {info.phone && (
              <li className={styles.detailsItem}>
                <IconBox>
                  <PhoneIcon />
                </IconBox>
                <a className={styles.detailsText} href={`tel:${info.phone.replace(/\s+/g, "")}`}>
                  {info.phone}
                </a>
              </li>
            )}
            {info.location && (
              <li className={styles.detailsItem}>
                <IconBox>
                  <PinIcon />
                </IconBox>
                <address className={styles.detailsText}>{info.location}</address>
              </li>
            )}
          </ul>
        </section>
      )}

      <ContactForm />
    </Panel>
  );
}
