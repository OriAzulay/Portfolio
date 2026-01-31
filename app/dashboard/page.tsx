"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, removeAuthToken } from "../lib/auth";
import {
  PortfolioData,
  defaultPortfolioData,
  getPortfolioData,
  savePortfolioData,
  fetchPortfolioFromSupabase,
  savePortfolioToSupabase,
  uploadImageToSupabase,
  Skill,
  Experience,
  Education,
  Project,
  GalleryItem,
} from "../lib/portfolio-data";

type TabType = "sidebar" | "about" | "resume" | "projects" | "contact" | "gallery";

const tabs: { id: TabType; label: string }[] = [
  { id: "sidebar", label: "Sidebar" },
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "gallery", label: "Gallery" },
];

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function RichTextEditor({ value, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div>
      <div className="editor-toolbar">
        <button
          type="button"
          className="editor-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
        >
          Bold
        </button>
        <button
          type="button"
          className="editor-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
        >
          Italic
        </button>
        <button
          type="button"
          className="editor-btn"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
        >
          Bullets
        </button>
        <select
          className="editor-select"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("fontSize", e.target.value)}
          defaultValue="3"
        >
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">XL</option>
        </select>
        <input
          className="editor-color"
          type="color"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => exec("foreColor", e.target.value)}
          title="Text color"
        />
      </div>
      <div
        ref={editorRef}
        className="editor-surface"
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    
    // Load data from Supabase (with localStorage fallback)
    const loadData = async () => {
      try {
        const portfolioData = await fetchPortfolioFromSupabase();
        setData(portfolioData);
      } catch (error) {
        console.error("Failed to load from Supabase, using localStorage:", error);
        setData(getPortfolioData());
      }
      setLoading(false);
    };
    
    loadData();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    
    // Save to both Supabase and localStorage
    const success = await savePortfolioToSupabase(data);
    
    if (!success) {
      // Fallback: save to localStorage only
      savePortfolioData(data);
      console.warn("Saved to localStorage only (Supabase unavailable)");
    }
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const handleReset = () => {
    if (confirm("Reset all data to defaults?")) {
      setData(defaultPortfolioData);
      savePortfolioData(defaultPortfolioData);
    }
  };

  // Personal info
  const updatePersonalInfo = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSocial = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        social: { ...prev.personalInfo.social, [field]: value },
      },
    }));
  };

  const updateStats = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        stats: { ...prev.personalInfo.stats, [field]: value },
      },
    }));
  };

  // Skills
  const addSkill = () => {
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "New Skill", level: 50 }],
    }));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Experience
  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "New Position", company: "Company", period: "20XX - Present", description: "" },
      ],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Education
  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "Degree Name", school: "School Name", period: "20XX - 20XX" },
      ],
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Projects
  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "New Project", description: "", tags: [], link: "#", imageUrl: "" },
      ],
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const removeProject = (index: number) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Gallery
  const addGalleryItem = () => {
    setData((prev) => ({
      ...prev,
      gallery: [
        ...(prev.gallery ?? []),
        { title: "New Item", description: "Gallery highlight", imageUrl: "" },
      ],
    }));
  };

  const updateGalleryItem = (
    index: number,
    field: keyof GalleryItem,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      gallery: prev.gallery.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeGalleryItem = (index: number) => {
    setData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <main>
        <article className="active">
          <p>Loading...</p>
        </article>
      </main>
    );
  }

  const initials = data.personalInfo.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");
  const encodeText = (text: string) => encodeURIComponent(text);
  
  // Upload file to Supabase Storage
  const uploadFile = async (file: File, kind: "avatar" | "project" | "gallery") => {
    const url = await uploadImageToSupabase(file, kind);
    if (!url) {
      throw new Error("Upload failed");
    }
    return url;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "avatar");
      updatePersonalInfo("avatarUrl", url);
    } catch {
      alert("Avatar upload failed.");
    }
  };

  const handleProjectImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "project");
      updateProject(index, "imageUrl", url);
    } catch {
      alert("Project image upload failed.");
    }
  };

  const handleGalleryImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "gallery");
      updateGalleryItem(index, "imageUrl", url);
    } catch {
      alert("Gallery image upload failed.");
    }
  };

  return (
    <main>
      <article className="active">
        <div className="admin-topbar">
          <div className="admin-title">Admin Dashboard</div>
          <div className="admin-actions">
            <button
              className="admin-btn primary"
              type="button"
              onClick={handleSave}
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </button>
            <a
              className="admin-btn"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Site
            </a>
            <button className="admin-btn" type="button" onClick={handleReset}>
              Reset
            </button>
            <button className="admin-btn danger" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </article>

      <nav className="navbar">
        <ul className="navbar-list">
          {tabs.map((tab) => (
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

      <article className={`sidebar ${activeTab === "sidebar" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Sidebar</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Profile</h3>
            <div className="avatar-box" style={{ width: "140px" }}>
              <img
                src={
                  data.personalInfo.avatarUrl
                    ? data.personalInfo.avatarUrl
                    : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='55%' text-anchor='middle' font-size='64' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(initials)}</text></svg>`
                }
                alt="Avatar preview"
              />
            </div>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.avatarUrl}
                onChange={(e) => updatePersonalInfo("avatarUrl", e.target.value)}
                placeholder="Avatar Image URL"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.name}
                onChange={(e) => updatePersonalInfo("name", e.target.value)}
                placeholder="Full Name"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.title}
                onChange={(e) => updatePersonalInfo("title", e.target.value)}
                placeholder="Title"
              />
            </div>
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Sidebar Contacts</h3>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="Email"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="Phone"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="Location"
              />
            </div>
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Social Links</h3>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.github}
                onChange={(e) => updateSocial("github", e.target.value)}
                placeholder="GitHub URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.linkedin}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="Twitter/X URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.instagram}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="Instagram URL"
              />
            </div>
          </div>
        </section>
      </article>

      <article className={`about ${activeTab === "about" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">About</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Basic Info</h3>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.name}
                onChange={(e) => updatePersonalInfo("name", e.target.value)}
                placeholder="Full Name"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.title}
                onChange={(e) => updatePersonalInfo("title", e.target.value)}
                placeholder="Title"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.avatarUrl}
                onChange={(e) => updatePersonalInfo("avatarUrl", e.target.value)}
                placeholder="Avatar Image URL"
              />
            </div>
            <textarea
              className="form-input"
              value={data.personalInfo.about}
              onChange={(e) => updatePersonalInfo("about", e.target.value)}
              placeholder="About"
            />
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Stats</h3>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.stats.yearsExperience}
                onChange={(e) => updateStats("yearsExperience", e.target.value)}
                placeholder="Years of Experience"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.stats.projectsCompleted}
                onChange={(e) => updateStats("projectsCompleted", e.target.value)}
                placeholder="Projects Completed"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.stats.certificationsAwards}
                onChange={(e) => updateStats("certificationsAwards", e.target.value)}
                placeholder="Certifications/Awards"
              />
            </div>
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Social Links</h3>
            <div className="input-wrapper">
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.github}
                onChange={(e) => updateSocial("github", e.target.value)}
                placeholder="GitHub URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.linkedin}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="Twitter/X URL"
              />
              <input
                className="form-input"
                type="url"
                value={data.personalInfo.social.instagram}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="Instagram URL"
              />
            </div>
          </div>
        </section>
      </article>

      <article className={`resume ${activeTab === "resume" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Resume</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Experience</h3>
            <div className="buttonContainer">
              <button className="toolBtn" type="button" onClick={addExperience}>
                Add Experience
              </button>
            </div>
            {data.experience.map((exp, index) => (
              <div className="content-card" key={`${exp.company}-${index}`}>
                <div className="input-wrapper">
                  <input
                    className="form-input"
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(index, "title", e.target.value)}
                    placeholder="Role Title"
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    placeholder="Company"
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateExperience(index, "period", e.target.value)}
                    placeholder="Period"
                  />
                </div>
                <RichTextEditor
                  value={exp.description}
                  onChange={(value) => updateExperience(index, "description", value)}
                />
                <div className="buttonContainer">
                  <button className="toolBtn" type="button" onClick={() => removeExperience(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Education</h3>
            <div className="buttonContainer">
              <button className="toolBtn" type="button" onClick={addEducation}>
                Add Education
              </button>
            </div>
            {data.education.map((edu, index) => (
              <div className="content-card" key={`${edu.school}-${index}`}>
                <div className="input-wrapper">
                  <input
                    className="form-input"
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    placeholder="Degree"
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                    placeholder="School"
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={edu.period}
                    onChange={(e) => updateEducation(index, "period", e.target.value)}
                    placeholder="Period"
                  />
                </div>
                <div className="buttonContainer">
                  <button className="toolBtn" type="button" onClick={() => removeEducation(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <h3 className="h3 form-title">Skills</h3>
            <div className="buttonContainer">
              <button className="toolBtn" type="button" onClick={addSkill}>
                Add Skill
              </button>
            </div>
            {data.skills.map((skill, index) => (
              <div className="content-card" key={`${skill.name}-${index}`}>
                <div className="input-wrapper">
                  <input
                    className="form-input"
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, "name", e.target.value)}
                    placeholder="Skill Name"
                  />
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={100}
                    value={skill.level}
                    onChange={(e) => updateSkill(index, "level", Number(e.target.value))}
                    placeholder="Level (0-100)"
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={skill.level}
                    onChange={(e) => updateSkill(index, "level", Number(e.target.value))}
                    style={{ width: "120px" }}
                  />
                </div>
                <div className="buttonContainer">
                  <button className="toolBtn" type="button" onClick={() => removeSkill(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      <article className={`portfolio ${activeTab === "projects" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Projects</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <div className="buttonContainer">
              <button className="toolBtn" type="button" onClick={addProject}>
                Add Project
              </button>
            </div>
            {data.projects.map((project, index) => (
              <div className="content-card" key={`${project.title}-${index}`}>
                <div className="input-wrapper">
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "6px" }}>
                      Project image
                    </div>
                    <label className="toolBtn" style={{ display: "inline-flex" }}>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProjectImageUpload(index, e)}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <input
                    className="form-input"
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    placeholder="Project Title"
                  />
                  <input
                    className="form-input"
                    type="url"
                    value={project.link}
                    onChange={(e) => updateProject(index, "link", e.target.value)}
                    placeholder="Project Link"
                  />
                </div>
                <textarea
                  className="form-input"
                  value={project.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  placeholder="Project Description"
                />
                <input
                  className="form-input"
                  type="text"
                  value={project.tags.join(", ")}
                  onChange={(e) =>
                    updateProject(
                      index,
                      "tags",
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Tags (comma-separated)"
                />
                <div className="buttonContainer">
                  <button className="toolBtn" type="button" onClick={() => removeProject(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>

      <article className={`contact ${activeTab === "contact" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Contact</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <div className="input-wrapper">
              <input
                className="form-input"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="Email"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="Phone"
              />
              <input
                className="form-input"
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="Location"
              />
            </div>
          </div>
        </section>
      </article>

      <article className={`gallery ${activeTab === "gallery" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Gallery</h2>
        </header>

        <section className="contact-form-box">
          <div className="contact-form-wrapper">
            <div className="buttonContainer">
              <button className="toolBtn" type="button" onClick={addGalleryItem}>
                Add Gallery Item
              </button>
            </div>
            {(data.gallery ?? []).map((item, index) => (
              <div className="content-card" key={`${item.title}-${index}`}>
                <div className="input-wrapper">
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "6px" }}>
                      Gallery image
                    </div>
                    <label className="toolBtn" style={{ display: "inline-flex" }}>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGalleryImageUpload(index, e)}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                  <input
                    className="form-input"
                    type="text"
                    value={item.title}
                    onChange={(e) => updateGalleryItem(index, "title", e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    className="form-input"
                    type="text"
                    value={item.description}
                    onChange={(e) => updateGalleryItem(index, "description", e.target.value)}
                    placeholder="Description"
                  />
                  <input
                    className="form-input"
                    type="url"
                    value={item.imageUrl}
                    onChange={(e) => updateGalleryItem(index, "imageUrl", e.target.value)}
                    placeholder="Image URL"
                  />
                </div>
                <div className="buttonContainer">
                  <button className="toolBtn" type="button" onClick={() => removeGalleryItem(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
