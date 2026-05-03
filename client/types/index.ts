export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  createdAt?: string;
}

export interface Model {
  id: string;
  title: string;
  description: string;
  category: string;
  previewImage: string;
  fileUrl?: string;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  userId: string;
  user: { id?: string; username: string };
}

export interface SavedModel {
  id: string;
  userId: string;
  modelId: string;
  createdAt: string;
  model: Model;
}

export interface DashboardData {
  uploads: Model[];
  saved: Model[];
}

export const CATEGORIES = [
  'Gaming',
  'Architecture',
  'VR/AR',
  'Animation',
  'Product Design',
  'Digital Art',
] as const;

export type Category = typeof CATEGORIES[number];
