import { createClient } from "@supabase/supabase-js";

// These will be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbPortfolioData {
  id: number;
  data: PortfolioDataJson;
  updated_at: string;
}

export interface PortfolioDataJson {
  personalInfo: {
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
  };
  skills: Array<{ name: string; level: number }>;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    period: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    tags: string[];
    link: string;
    imageUrl: string;
  }>;
  gallery: Array<{
    title: string;
    description: string;
    imageUrl: string;
  }>;
}

// Fetch portfolio data from Supabase
export async function fetchPortfolioData(): Promise<PortfolioDataJson | null> {
  const { data, error } = await supabase
    .from("portfolio")
    .select("data")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching portfolio data:", error);
    return null;
  }

  return data?.data as PortfolioDataJson;
}

// Save portfolio data to Supabase
export async function savePortfolioDataToDb(
  portfolioData: PortfolioDataJson
): Promise<boolean> {
  const { error } = await supabase
    .from("portfolio")
    .upsert({
      id: 1,
      data: portfolioData,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error saving portfolio data:", error);
    return false;
  }

  return true;
}

// Upload file to Supabase Storage
export async function uploadFileToStorage(
  file: File,
  bucket: string,
  folder: string
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file:", error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}


