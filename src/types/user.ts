// src/types/user.ts

export interface User {
  _id: string;
  name: string;
  phone: number;
  email?: string;
  serpApiKey?: string;

  location: string;

  image?: string;
  bannerImage?: string;

  roleId?: number;
  status?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile edit form
 */
export interface UserProfileForm {
  name: string;
  phone: string;
  location: string;
  password: string;
  serpApiKey: string;
}

/**
 * Image preview state
 */
export interface UserProfilePreview {
  image: string | null;
  banner: string | null;
}
