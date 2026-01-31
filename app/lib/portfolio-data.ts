// Portfolio data types and storage utilities

export interface PersonalInfo {
  name: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  qrCodeUrl: string;
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
  imageUrl: string;
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
    qrCodeUrl: "",
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
      imageUrl: "",
    },
    {
      title: "Project Two",
      description: "Mobile-responsive e-commerce platform with payment integration",
      tags: ["Next.js", "Stripe", "Tailwind"],
      link: "#",
      imageUrl: "",
    },
    {
      title: "Project Three",
      description: "Real-time chat application with WebSocket support",
      tags: ["React", "Socket.io", "Express"],
      link: "#",
      imageUrl: "",
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

// Helper to merge data with defaults
function mergeWithDefaults(parsed: Partial<PortfolioData>): PortfolioData {
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
    projects: (parsed.projects ?? defaultPortfolioData.projects).map((proj) => ({
      ...proj,
      imageUrl: (proj as Project).imageUrl ?? "",
    })),
    gallery: parsed.gallery ?? defaultPortfolioData.gallery,
  };
}

// Get data from localStorage (fallback/cache)
export function getPortfolioData(): PortfolioData {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<PortfolioData>;
        return mergeWithDefaults(parsed);
      } catch {
        return defaultPortfolioData;
      }
    }
  }
  return defaultPortfolioData;
}

// Save to localStorage (for immediate UI update)
export function savePortfolioData(data: PortfolioData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// ============== SUPABASE FUNCTIONS ==============

import { supabase } from "./supabase";

// Fetch portfolio data from Supabase
export async function fetchPortfolioFromSupabase(): Promise<PortfolioData> {
  try {
    const { data, error } = await supabase
      .from("portfolio")
      .select("data")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching from Supabase:", error);
      return getPortfolioData(); // Fallback to localStorage
    }

    if (data?.data) {
      const portfolioData = mergeWithDefaults(data.data as Partial<PortfolioData>);
      // Cache in localStorage
      savePortfolioData(portfolioData);
      return portfolioData;
    }

    return defaultPortfolioData;
  } catch (error) {
    console.error("Supabase fetch error:", error);
    return getPortfolioData(); // Fallback to localStorage
  }
}

// Save portfolio data to Supabase
export async function savePortfolioToSupabase(data: PortfolioData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("portfolio")
      .upsert({
        id: 1,
        data: data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error saving to Supabase:", error);
      return false;
    }

    // Also cache in localStorage
    savePortfolioData(data);
    return true;
  } catch (error) {
    console.error("Supabase save error:", error);
    return false;
  }
}

// Upload image to Supabase Storage
export async function uploadImageToSupabase(
  file: File,
  folder: "avatar" | "project" | "gallery"
): Promise<string | null> {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local";
      console.error(errorMsg);
      alert(errorMsg);
      return null;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    console.log("Uploading to Supabase Storage:", fileName);

    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      const errorMsg = `Upload error: ${uploadError.message}`;
      console.error("Upload error details:", uploadError);
      alert(errorMsg);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(fileName);

    console.log("Upload successful, URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    const errorMsg = `Image upload error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg, error);
    alert(errorMsg);
    return null;
  }
}
