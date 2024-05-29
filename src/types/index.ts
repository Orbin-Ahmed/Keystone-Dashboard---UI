export interface ImageFile {
  readonly file: File;
  readonly filename?: string;
}

export type RegisterLoginFormData = {
  username: string;
  email?: string;
  password: string;
};

export type SocialLinkBody = {
  platform: string;
  link: string;
};

export type UpdateSocialLinkParams = {
  social_link: SocialLinkBody[];
};

export interface User {
  id: number;
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  bio?: string | null;
  password?: string | null;
}

export type USER = {
  id: number;
  image: string;
  username: string;
  email: string;
  is_active: boolean;
  role: Role;
};

export enum Role {
  SuperUser = 0,
  Admin = 1,
  Moderator = 2,
  Designer = 3,
}

export interface CompanyData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  company_intro?: string;
  license?: string;
  logo?: ImageFile;
}

export interface ImageData {
  id?: number;
  photo: string;
  source?: string;
  nationality?: string;
  room_type?: string;
  temperature?: string;
  theme?: string;
  is_url: string;
}

export type ImageFiles = {
  photo: File;
  nationality: string;
  room_type: string;
  source: string;
  temperature: string;
  theme: string;
  color: string;
  is_url: string;
};

export interface ChatData {
  prompt: string;
  input_image_link: string;
  num_outputs: number;
  aspect_ratio: string;
  studio_options: {
    style: string[];
  };
}

export interface CompanyLogoData {
  name: string;
  logo?: string | null;
}

export type BRAND = {
  logo: string;
  name: string;
  category: string;
  target_images: number;
  current_images: number;
  percentage: number;
};

export type SocialLink = {
  platform: "facebook" | "twitter" | "linkedin" | "website" | "github";
  link: string;
};

export interface PinClickEvent {
  index: number;
}

export interface ImageObject {
  id: string;
  url: string;
  lightBoxUrl: string;
}

export type TabListProps = {
  id: number;
  value: string;
  logo: string;
};
