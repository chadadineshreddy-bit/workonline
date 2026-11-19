export type ToolCategory = 'pdf' | 'student' | 'work' | 'ai' | 'image' | 'calculator';

export type ToolStatus = 'available' | 'coming-soon' | 'beta';

export interface ToolItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  category: ToolCategory;
  categoryLabel: string;
  iconName: string;
  isPopular?: boolean;
  isNew?: boolean;
  status: ToolStatus;
  badge?: string;
  acceptTypes?: string;
  maxFileSizeMB?: number;
  features?: string[];
}
