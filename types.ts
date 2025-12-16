
export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  image: string;
  category: 'amamentacao' | 'enxoval' | 'essenciais' | 'mae' | 'bebe' | 'comunidade';
  shopeeLink: string;
  active: boolean;
  // User Store specific
  ownerId?: string;
  ownerName?: string; // Nome da mamãe que está vendendo
  ownerPhone?: string; // WhatsApp para contato
  createdAt?: number;
  city?: string;
  state?: string;
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
  apiKey?: string; // Field to manually store API Key if env vars fail
}

export interface JournalEntry {
  id: string;
  week: number;
  date: string;
  content: string;
  mood: 'happy' | 'tired' | 'anxious' | 'excited' | 'sick';
}

export interface KickSession {
  id: string;
  date: string; // ISO string
  durationSeconds: number;
  count: number;
}

export interface Contraction {
  id: string;
  startTime: number;
  endTime: number | null; // null if active
  durationSeconds?: number;
  intervalSeconds?: number; // Time since previous contraction start
}

export interface UserSettings {
  dueDate: string | null;
  nameFavorites: NameMeaning[];
  checklistProgress: string[]; // IDs of checked items
  weeklyTasksCompleted: string[]; // Strings of completed weekly tasks (using format "week-taskindex")
  // Social Profile
  userName?: string;
  userBio?: string;
  userPhoto?: string;
  userPhone?: string; // Added for marketplace contact
  // New Features
  journalEntries: JournalEntry[];
  kickSessions: KickSession[];
  contractions: Contraction[];
}

// --- Auth Types ---
export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 Hash
  createdAt: number;
}

export interface AuthSession {
  username: string;
  token: string; // Simple session token
  expiresAt: number;
}

// --- Social Network Types ---
export interface Comment {
  id: string;
  authorName: string;
  text: string;
  timestamp: number;
  isDev?: boolean; // Highlight admin/dev comments
}

export interface Post {
  id: string;
  authorName: string; // Or "Mamãe Anônima"
  authorWeek: number; // Gestational week at time of posting
  authorPhoto?: string;
  content: string;
  image?: string; // URL
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  timestamp: number;
}

export enum UserRole {
  GUEST = 'guest',
  ADMIN = 'admin',
}
