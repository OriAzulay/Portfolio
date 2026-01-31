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
        { title: "New Position", company: "Company", period: "20XX - Present", description: "", tags: [] },
      ],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
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
      // Update state and auto-save
      setData((prev) => {
        const newData = {
          ...prev,
          personalInfo: { ...prev.personalInfo, avatarUrl: url },
        };
        // Auto-save to Supabase
        savePortfolioToSupabase(newData);
        return newData;
      });
      alert("Avatar uploaded and saved!");
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
      // Update state and auto-save
      setData((prev) => {
        const newData = {
          ...prev,
          projects: prev.projects.map((proj, i) =>
            i === index ? { ...proj, imageUrl: url } : proj
          ),
        };
        // Auto-save to Supabase
        savePortfolioToSupabase(newData);
        return newData;
      });
      alert("Project image uploaded and saved!");
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
      // Update state and auto-save
      setData((prev) => {
        const newData = {
          ...prev,
          gallery: prev.gallery.map((item, i) =>
            i === index ? { ...item, imageUrl: url } : item
          ),
        };
        // Auto-save to Supabase
        savePortfolioToSupabase(newData);
        return newData;
      });
      alert("Gallery image uploaded and saved!");
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

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div className="avatar-box" style={{ width: "100px", height: "100px", flexShrink: 0 }}>
                <img
                  src={
                    data.personalInfo.avatarUrl
                      ? data.personalInfo.avatarUrl
                      : `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='55%' text-anchor='middle' font-size='64' fill='%23ffffff' font-family='Poppins,Arial'>${encodeText(initials)}</text></svg>`
                  }
                  alt="Avatar preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label className="toolBtn" style={{ display: "inline-flex", marginBottom: "10px" }}>
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
            
            <div className="dashboard-input-grid">
              <div className="dashboard-field">
                <label className="dashboard-label">Avatar URL</label>
                <input
                  className="dashboard-input"
                  type="url"
                  value={data.personalInfo.avatarUrl}
                  onChange={(e) => updatePersonalInfo("avatarUrl", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">Full Name</label>
                <input
                  className="dashboard-input"
                  type="text"
                  value={data.personalInfo.name}
                  onChange={(e) => updatePersonalInfo("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="dashboard-field">
                <label className="dashboard-label">Title / Role</label>
                <input
                  className="dashboard-input"
                  type="text"
                  value={data.personalInfo.title}
                  onChange={(e) => updatePersonalInfo("title", e.target.value)}
                  placeholder="Software Developer"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">Contact Information</h3>
          <div className="dashboard-input-grid">
            <div className="dashboard-field">
              <label className="dashboard-label">Email Address</label>
              <input
                className="dashboard-input"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Phone Number</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Location</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">Social Links</h3>
          <div className="dashboard-input-grid">
            <div className="dashboard-field">
              <label className="dashboard-label">GitHub</label>
              <input
                className="dashboard-input"
                type="url"
                value={data.personalInfo.social.github}
                onChange={(e) => updateSocial("github", e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">LinkedIn</label>
              <input
                className="dashboard-input"
                type="url"
                value={data.personalInfo.social.linkedin}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Twitter / X</label>
              <input
                className="dashboard-input"
                type="url"
                value={data.personalInfo.social.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Instagram</label>
              <input
                className="dashboard-input"
                type="url"
                value={data.personalInfo.social.instagram}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </section>
      </article>

      <article className={`about ${activeTab === "about" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">About</h2>
        </header>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">About Me</h3>
          <div className="dashboard-field">
            <label className="dashboard-label">Bio / Description</label>
            <textarea
              className="dashboard-input"
              value={data.personalInfo.about}
              onChange={(e) => updatePersonalInfo("about", e.target.value)}
              placeholder="Write a brief description about yourself..."
              style={{ minHeight: "150px", resize: "vertical" }}
            />
          </div>
        </section>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">Highlights & Stats</h3>
          <div className="dashboard-input-grid">
            <div className="dashboard-field">
              <label className="dashboard-label">Years of Experience</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.stats.yearsExperience}
                onChange={(e) => updateStats("yearsExperience", e.target.value)}
                placeholder="3+"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Projects Completed</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.stats.projectsCompleted}
                onChange={(e) => updateStats("projectsCompleted", e.target.value)}
                placeholder="15+"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Certifications & Awards</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.stats.certificationsAwards}
                onChange={(e) => updateStats("certificationsAwards", e.target.value)}
                placeholder="5+"
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
              <div className="content-card" key={`exp-${index}`}>
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
                <div className="dashboard-field" style={{ marginTop: "16px" }}>
                  <label className="dashboard-label">Tags</label>
                  <div className="tags-container">
                    {(exp.tags || []).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag-chip">
                        {tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => {
                            const newTags = (exp.tags || []).filter((_, i) => i !== tagIndex);
                            updateExperience(index, "tags", newTags);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      className="tag-input"
                      type="text"
                      placeholder="Add tag + Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const newTag = input.value.trim();
                          if (newTag && !(exp.tags || []).includes(newTag)) {
                            updateExperience(index, "tags", [...(exp.tags || []), newTag]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--light-gray-70)", marginTop: "6px" }}>
                    Press Enter to add a tag. Click × to remove.
                  </p>
                </div>
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
              <div className="content-card" key={`edu-${index}`}>
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
              <div className="content-card" key={`skill-${index}`}>
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

        <section className="dashboard-section">
          <div className="buttonContainer" style={{ marginBottom: "20px" }}>
            <button className="toolBtn" type="button" onClick={addProject}>
              + Add Project
            </button>
          </div>
          {data.projects.map((project, index) => (
            <div className="dashboard-section" key={`project-${index}`} style={{ marginBottom: "20px", background: "var(--eerie-black-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ color: "var(--white-2)", fontSize: "var(--fs-5)" }}>
                  {project.title || `Project ${index + 1}`}
                </h4>
                <button 
                  className="toolBtn" 
                  type="button" 
                  onClick={() => removeProject(index)}
                  style={{ color: "var(--bittersweet-shimmer)" }}
                >
                  Remove
                </button>
              </div>
              
              <div className="dashboard-input-grid">
                <div className="dashboard-field">
                  <label className="dashboard-label">Project Image</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {project.imageUrl && (
                      <img 
                        src={project.imageUrl} 
                        alt="Preview" 
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    )}
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
                </div>
                <div className="dashboard-field">
                  <label className="dashboard-label">Project Title</label>
                  <input
                    className="dashboard-input"
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(index, "title", e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div className="dashboard-field">
                  <label className="dashboard-label">Project Link</label>
                  <input
                    className="dashboard-input"
                    type="url"
                    value={project.link}
                    onChange={(e) => updateProject(index, "link", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div className="dashboard-field" style={{ marginTop: "16px" }}>
                <label className="dashboard-label">Description</label>
                <textarea
                  className="dashboard-input"
                  value={project.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  placeholder="Describe your project..."
                  style={{ minHeight: "80px", resize: "vertical" }}
                />
              </div>
              
              <div className="dashboard-field" style={{ marginTop: "16px" }}>
                <label className="dashboard-label">Tags</label>
                <div className="tags-container">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag-chip">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => {
                          const newTags = project.tags.filter((_, i) => i !== tagIndex);
                          updateProject(index, "tags", newTags);
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    type="text"
                    placeholder="Add tag + Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const newTag = input.value.trim();
                        if (newTag && !project.tags.includes(newTag)) {
                          updateProject(index, "tags", [...project.tags, newTag]);
                          input.value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p style={{ fontSize: "11px", color: "var(--light-gray-70)", marginTop: "6px" }}>
                  Press Enter to add a tag. Click × to remove.
                </p>
              </div>
            </div>
          ))}
        </section>
      </article>

      <article className={`contact ${activeTab === "contact" ? "active" : ""}`}>
        <header>
          <h2 className="h2 article-title">Contact</h2>
        </header>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">Contact Information</h3>
          <div className="dashboard-input-grid">
            <div className="dashboard-field">
              <label className="dashboard-label">Email Address</label>
              <input
                className="dashboard-input"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Phone Number</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="dashboard-field">
              <label className="dashboard-label">Location</label>
              <input
                className="dashboard-input"
                type="text"
                value={data.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h3 className="dashboard-section-title">QR Code</h3>
          <p style={{ fontSize: "12px", color: "var(--light-gray-70)", marginBottom: "16px" }}>
            Upload a QR code image that visitors can scan (e.g., link to your vCard, LinkedIn, or website)
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {data.personalInfo.qrCodeUrl ? (
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "12px", 
                overflow: "hidden",
                border: "1px solid var(--jet)",
                background: "var(--eerie-black-2)"
              }}>
                <img
                  src={data.personalInfo.qrCodeUrl}
                  alt="QR Code preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "12px", 
                border: "1px dashed var(--jet)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--light-gray-70)",
                fontSize: "12px",
                textAlign: "center",
                padding: "10px"
              }}>
                No QR Code
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label className="toolBtn" style={{ display: "inline-flex" }}>
                Upload QR Code
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadFile(file, "avatar");
                      setData((prev) => {
                        const newData = {
                          ...prev,
                          personalInfo: { ...prev.personalInfo, qrCodeUrl: url },
                        };
                        savePortfolioToSupabase(newData);
                        return newData;
                      });
                      alert("QR Code uploaded and saved!");
                    } catch {
                      alert("QR Code upload failed.");
                    }
                  }}
                  style={{ display: "none" }}
                />
              </label>
              {data.personalInfo.qrCodeUrl && (
                <button
                  type="button"
                  className="toolBtn"
                  style={{ color: "var(--bittersweet-shimmer)" }}
                  onClick={() => {
                    setData((prev) => {
                      const newData = {
                        ...prev,
                        personalInfo: { ...prev.personalInfo, qrCodeUrl: "" },
                      };
                      savePortfolioToSupabase(newData);
                      return newData;
                    });
                  }}
                >
                  Remove QR Code
                </button>
              )}
            </div>
          </div>
          <div className="dashboard-field" style={{ marginTop: "16px" }}>
            <label className="dashboard-label">Or paste QR Code URL</label>
            <input
              className="dashboard-input"
              type="url"
              value={data.personalInfo.qrCodeUrl || ""}
              onChange={(e) => updatePersonalInfo("qrCodeUrl", e.target.value)}
              placeholder="https://example.com/qr-code.png"
            />
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
              <div className="content-card" key={`gallery-${index}`}>
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
