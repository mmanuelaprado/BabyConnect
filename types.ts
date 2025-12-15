
export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  image: string;
  category: 'amamentacao' | 'enxoval' | 'essenciais' | 'mae' | 'bebe';
  shopeeLink: string;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'mae' | 'bebe' | 'acompanhante' | 'documentos';
  shopeeLink?: string; // Optional override link
  checked: boolean;
}

export interface WeekInfo {
  week: number;
  babySize: string; // e.g., "Semente de papoula"
  development: string;
  bodyChanges: string;
  symptoms: string;
  tips: string;
  recommendedProductId?: string; // Link to a product in the store
  weeklyChecklist?: string[]; // List of tasks for this specific week
}

export interface NameMeaning {
  name: string;
  meaning: string;
  origin: string;
  personality: string;
  suggestions: string[];
}

export interface AppConfig {
  appName: string;
  logoUrl: string;
  bannerUrl: string;
  footerText: string;
  socialLink: string;
  whatsappGroupLink?: string; // New field for WhatsApp Group
  doulaSystemInstruction: string;
  adminPassword?: string; // In a real app, this would be salted/hashed backend side
}

export interface UserSettings {
  dueDate: string | null;
  nameFavorites: NameMeaning[];
  checklistProgress: string[]; // IDs of checked items
  weeklyTasksCompleted: string[]; // Strings of completed weekly tasks (using format "week-taskindex")
}

export enum UserRole {
  GUEST = 'guest',
  ADMIN = 'admin',
}