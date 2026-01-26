// Portfolio data types and storage utilities

export interface PersonalInfo {
  name: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  stats: {
    yearsExperience: string;
    projectsCompleted: string;
    certificationsAwards: string;
  };
}

export interface Skill {
  name: string;
  level: number;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  period: string;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface GalleryItem {
  title: string;
  description: string;
  imageUrl: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  gallery: GalleryItem[];
}

// Default data
export const defaultPortfolioData: PortfolioData = {
  personalInfo: {
    name: "Your Name",
    title: "Software Developer",
    avatarUrl: "",
    email: "your.email@example.com",
    phone: "+1 234 567 8900",
    location: "Your City, Country",
    about: `I'm a passionate Software Developer with expertise in building modern web applications. 
I love creating elegant solutions to complex problems and am always eager to learn new technologies.

With a strong foundation in both frontend and backend development, I strive to deliver 
high-quality, scalable solutions that make a real impact.`,
    social: {
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourusername",
      twitter: "",
      instagram: "",
    },
    stats: {
      yearsExperience: "3+",
      projectsCompleted: "15+",
      certificationsAwards: "5+",
    },
  },
  skills: [
    { name: "JavaScript", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "React", level: 90 },
    { name: "Next.js", level: 80 },
    { name: "Node.js", level: 75 },
    { name: "Python", level: 70 },
    { name: "SQL", level: 75 },
    { name: "Git", level: 85 },
  ],
  experience: [
    {
      title: "Software Developer",
      company: "Company Name",
      period: "2023 - Present",
      description: "Developing and maintaining web applications using React and Node.js.",
    },
    {
      title: "Junior Developer",
      company: "Previous Company",
      period: "2021 - 2023",
      description: "Built responsive web interfaces and collaborated with cross-functional teams.",
    },
  ],
  education: [
    {
      degree: "Bachelor's in Computer Science",
      school: "University Name",
      period: "2017 - 2021",
    },
  ],
  projects: [
    {
      title: "Project One",
      description: "A full-stack web application built with React and Node.js",
      tags: ["React", "Node.js", "MongoDB"],
      link: "#",
    },
    {
      title: "Project Two",
      description: "Mobile-responsive e-commerce platform with payment integration",
      tags: ["Next.js", "Stripe", "Tailwind"],
      link: "#",
    },
    {
      title: "Project Three",
      description: "Real-time chat application with WebSocket support",
      tags: ["React", "Socket.io", "Express"],
      link: "#",
    },
  ],
  gallery: [
    {
      title: "Gallery One",
      description: "Creative snapshot",
      imageUrl: "",
    },
    {
      title: "Gallery Two",
      description: "Design moment",
      imageUrl: "",
    },
    {
      title: "Gallery Three",
      description: "Work in focus",
      imageUrl: "",
    },
  ],
};

const STORAGE_KEY = "portfolio_data";

export function getPortfolioData(): PortfolioData {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<PortfolioData>;
        return {
          ...defaultPortfolioData,
          ...parsed,
          personalInfo: {
            ...defaultPortfolioData.personalInfo,
            ...parsed.personalInfo,
            social: {
              ...defaultPortfolioData.personalInfo.social,
              ...parsed.personalInfo?.social,
            },
            stats: {
              ...defaultPortfolioData.personalInfo.stats,
              ...parsed.personalInfo?.stats,
            },
          },
          skills: parsed.skills ?? defaultPortfolioData.skills,
          experience: parsed.experience ?? defaultPortfolioData.experience,
          education: parsed.education ?? defaultPortfolioData.education,
          projects: parsed.projects ?? defaultPortfolioData.projects,
          gallery: parsed.gallery ?? defaultPortfolioData.gallery,
        };
      } catch {
        return defaultPortfolioData;
      }
    }
  }
  return defaultPortfolioData;
}

export function savePortfolioData(data: PortfolioData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
