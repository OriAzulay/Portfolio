"use client";

import { useEffect, useMemo, useState } from "react";
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
                >
                  LinkedIn
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
                >
                  Instagram
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
                >
                  GitHub
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
                      __html: item.description?.includes("<")
                        ? item.description
                        : (item.description || "").replace(/\n/g, "<br />"),
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
                        src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='380'><rect width='100%' height='100%' fill='%23151515'/><text x='50%' y='50%' text-anchor='middle' font-size='24' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(project.title)}</text></svg>`}
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
