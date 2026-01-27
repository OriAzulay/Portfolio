"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import {
  PortfolioData,
  defaultPortfolioData,
  getPortfolioData,
} from "./lib/portfolio-data";

const Icons = {
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 8l-8.97 5.98a2 2 0 01-2.06 0L2 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 012 5.18 2 2 0 014 3h3a2 2 0 012 1.72c.12.81.32 1.6.57 2.36a2 2 0 01-.45 2.11L8.09 10.09a16 16 0 006.82 6.82l1.9-1.03a2 2 0 012.11.45c.76.25 1.55.45 2.36.57A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Pin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Link: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 13a5 5 0 007.07 0l2.12-2.12a5 5 0 10-7.07-7.07L10.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 00-7.07 0L4.8 13.12a5 5 0 007.07 7.07L13.5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const tabItems = [
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
  { id: "portfolio", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "gallery", label: "Gallery" },
];

function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setData(getPortfolioData());
    setMounted(true);
  }, []);

  return { data, mounted };
}

// Main Page Component
export default function Home() {
  const { data, mounted } = usePortfolioData();
  const [activeTab, setActiveTab] = useState("about");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = useMemo(() => {
    return data.personalInfo.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("");
  }, [data.personalInfo.name]);
  const encodeText = (text: string) => encodeURIComponent(text);
  const sanitizeHtml = (html: string) =>
    DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "ul", "ol", "li", "p", "br", "font", "span"],
      ALLOWED_ATTR: ["color", "size", "style"],
    });

  if (!mounted) {
    return <main />;
  }

  return (
    <main>
      <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <div className="sidebar-info">
          <figure className="avatar-box">
            <img
              src={
                data.personalInfo.avatarUrl
                  ? data.personalInfo.avatarUrl
                  : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='55%' text-anchor='middle' font-size='64' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(initials)}</text></svg>`
              }
              alt="Profile avatar"
            />
          </figure>

          <div className="info-content">
            <div className="courgette-head">
              <h1 className="name">{data.personalInfo.name}</h1>
            </div>
            <p className="title">{data.personalInfo.title}</p>
          </div>

          <button
            className="info_more-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            type="button"
          >
            <span>{sidebarOpen ? "Hide Contacts" : "Show Contacts"}</span>
          </button>
        </div>

        <div className="sidebar-info_more">
          <div className="separator"></div>

          <ul className="contacts-list">
            <li className="contact-item">
              <div className="icon-box">
                <Icons.Mail />
              </div>
              <div className="contact-info">
                <p className="contact-title">Email</p>
                <a className="contact-link" href={`mailto:${data.personalInfo.email}`}>
                  {data.personalInfo.email}
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <Icons.Phone />
              </div>
              <div className="contact-info">
                <p className="contact-title">Phone</p>
                <a className="contact-link" href={`tel:${data.personalInfo.phone}`}>
                  {data.personalInfo.phone}
                </a>
              </div>
            </li>

            <li className="contact-item">
              <div className="icon-box">
                <Icons.Pin />
              </div>
              <div className="contact-info">
                <p className="contact-title">Location</p>
                <address>{data.personalInfo.location}</address>
              </div>
            </li>
          </ul>

          <div className="separator"></div>

          <ul className="social-list">
            {data.personalInfo.social.linkedin && (
              <li className="social-item">
                <a
                  className="social-link"
                  href={data.personalInfo.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </li>
            )}
            {data.personalInfo.social.instagram && (
              <li className="social-item">
                <a
                  className="social-link"
                  href={data.personalInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </li>
            )}
            {data.personalInfo.social.twitter && (
              <li className="social-item">
                <a
                  className="social-link"
                  href={data.personalInfo.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X
                </a>
              </li>
            )}
            {data.personalInfo.social.github && (
              <li className="social-item">
                <a
                  className="social-link"
                  href={data.personalInfo.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </li>
            )}
          </ul>
        </div>
      </aside>

      <div className="main-content">
        <nav className="navbar">
          <ul className="navbar-list">
            {tabItems.map((tab) => (
              <li key={tab.id} className="navbar-item">
                <button
                  type="button"
                  className={`navbar-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article className={`about ${activeTab === "about" ? "active" : ""}`}>
          <header>
            <h2 className="h2 article-title">Digital Identity</h2>
          </header>

          <section className="about-text">
            {data.personalInfo.about.split("\n").map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </section>

          <section className="highlights">
            <h3 className="h3 highlights-title">★ Highlights & Successes</h3>
            <ul className="highlights-list has-scrollbar">
              <li className="highlights-item content-card">
                <h4 className="h4">{data.personalInfo.stats.yearsExperience}</h4>
                <p className="showcase-text">Years of Experience</p>
              </li>
              <li className="highlights-item content-card">
                <h4 className="h4">{data.personalInfo.stats.projectsCompleted}</h4>
                <p className="showcase-text">Projects Completed</p>
              </li>
              <li className="highlights-item content-card">
                <h4 className="h4">{data.personalInfo.stats.certificationsAwards}</h4>
                <p className="showcase-text">Certifications & Awards</p>
              </li>
            </ul>
          </section>

          <section className="portfolio-posts">
            <div className="showcase-header">
              <h3 className="h3 showcase-title">Featured Projects</h3>
            </div>
            <ul className="portfolio-posts-list">
              {data.projects.slice(0, 2).map((project, index) => (
                <li className="portfolio-post-item" key={`${project.title}-${index}`}>
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <figure className="portfolio-banner-box">
                      <img
                        src={
                          project.imageUrl
                            ? project.imageUrl
                            : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380'><rect width='100%' height='100%' fill='%23151515'/><text x='50%' y='50%' text-anchor='middle' font-size='24' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(project.title)}</text></svg>`
                        }
                        alt={project.title}
                      />
                    </figure>
                    <div className="portfolio-content">
                      <div className="portfolio-meta">
                        <span className="portfolio-category">{project.tags[0] || "Project"}</span>
                        <span className="dot"></span>
                        <span className="portfolio-link">View</span>
                      </div>
                      <h3 className="h3 portfolio-item-title">{project.title}</h3>
                      <p className="portfolio-text">{project.description}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <article className={`resume ${activeTab === "resume" ? "active" : ""}`}>
          <header>
            <h2 className="h2 article-title">Resume</h2>
          </header>

          <section className="timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <Icons.Link />
              </div>
              <h3 className="h3">Experience</h3>
            </div>

            <ol className="timeline-list">
              {data.experience.map((item, index) => (
                <li className="timeline-item" key={`${item.company}-${index}`}>
                  <h4 className="h4 timeline-item-title">{item.title}</h4>
                  <span>{item.period}</span>
                  <div
                    className="timeline-text"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        item.description?.includes("<")
                          ? item.description
                          : (item.description || "").replace(/\n/g, "<br />")
                      ),
                    }}
                  />
                </li>
              ))}
            </ol>
          </section>

          <section className="timeline">
            <div className="title-wrapper">
              <div className="icon-box">
                <Icons.Link />
              </div>
              <h3 className="h3">Education</h3>
            </div>

            <ol className="timeline-list">
              {data.education.map((item, index) => (
                <li className="timeline-item" key={`${item.school}-${index}`}>
                  <h4 className="h4 timeline-item-title">{item.degree}</h4>
                  <span>{item.period}</span>
                  <p className="timeline-text">{item.school}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="skill">
            <h3 className="h3 skills-title">My Skills</h3>
            <ul className="skills-list content-card">
              {data.skills.map((item) => (
                <li className="skills-item" key={item.name}>
                  <div className="title-wrapper">
                    <h5 className="h5">{item.name}</h5>
                    <data value={item.level}>{item.level}%</data>
                  </div>
                  <div className="skill-progress-bg">
                    <div
                      className="skill-progress-fill"
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <article className={`portfolio ${activeTab === "portfolio" ? "active" : ""}`}>
          <header>
            <h2 className="h2 article-title">Projects</h2>
          </header>

          <section className="portfolio-posts">
            <ul className="portfolio-posts-list">
              {data.projects.map((project, index) => (
                <li className="portfolio-post-item" key={`${project.title}-${index}`}>
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <div className="portfolio-banner-box">
                      <img
                        src={
                          project.imageUrl
                            ? project.imageUrl
                            : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380'><rect width='100%' height='100%' fill='%23151515'/><text x='50%' y='50%' text-anchor='middle' font-size='24' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(project.title)}</text></svg>`
                        }
                        alt={project.title}
                      />
                    </div>
                    <div className="portfolio-content">
                      <div className="portfolio-meta">
                        <p className="portfolio-category">{project.tags[0] || "Project"}</p>
                        <span className="dot"></span>
                        <span className="portfolio-link">View</span>
                      </div>
                      <h3 className="h3 portfolio-item-title">{project.title}</h3>
                      <p className="portfolio-text">{project.description}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <article className={`contact ${activeTab === "contact" ? "active" : ""}`}>
          <header>
            <h2 className="h2 article-title">Contact</h2>
          </header>

          <section className="contact-details-wrapper">
            <div className="contact-details">
              <h3 className="h3">Contact Details</h3>
              <ul className="contact-info-list">
                <li>
                  <span className="contact-text">{data.personalInfo.phone}</span>
                </li>
                <li>
                  <span className="contact-text">{data.personalInfo.email}</span>
                </li>
                <li>
                  <span className="contact-text">{data.personalInfo.location}</span>
                </li>
              </ul>
            </div>
            <div className="qr-box">
              <img
                className="qr-image"
                src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23252525'/><text x='50%' y='50%' text-anchor='middle' font-size='14' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText("QR")}</text></svg>`}
                alt="QR placeholder"
              />
            </div>
          </section>

          <section className="contact-form-box">
            <div className="contact-form-wrapper">
              <h3 className="h3 form-title">Contact Form</h3>
              <form className="contact-form">
                <div className="input-wrapper">
                  <input className="form-input" type="text" placeholder="Full Name" />
                  <input className="form-input" type="email" placeholder="Email Address" />
                </div>
                <textarea className="form-input" placeholder="Your Message"></textarea>
                <button className="form-btn" type="submit">
                  Send Message
                </button>
              </form>
            </div>
          </section>
        </article>

        <article className={`gallery ${activeTab === "gallery" ? "active" : ""}`}>
          <header>
            <h2 className="h2 article-title">Gallery</h2>
          </header>

          <div className="container">
            {(data.gallery?.length ? data.gallery : [
              { title: "One", description: "Gallery highlight", imageUrl: "" },
              { title: "Two", description: "Gallery highlight", imageUrl: "" },
              { title: "Three", description: "Gallery highlight", imageUrl: "" },
              { title: "Four", description: "Gallery highlight", imageUrl: "" },
              { title: "Five", description: "Gallery highlight", imageUrl: "" },
              { title: "Six", description: "Gallery highlight", imageUrl: "" },
            ]).map((item, index) => (
              <div className="card-wrap" key={`${item.title}-${index}`}>
                <div className="card">
                  <div className="card-bg">
                    <img
                      src={
                        item.imageUrl
                          ? item.imageUrl
                          : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'><rect width='100%' height='100%' fill='%23161616'/><text x='50%' y='50%' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(item.title)}</text></svg>`
                      }
                      alt={item.title}
                    />
                  </div>
                  <div className="card-info">
                    <h2>{item.title}</h2>
                    <p>{item.description || "Gallery highlight"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
