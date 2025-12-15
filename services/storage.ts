
import { Product, ChecklistItem, WeekInfo, AppConfig, UserSettings, NameMeaning } from '../types';

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Almofada de Amamentação',
    description: 'Conforto para mamãe e bebê durante a amamentação.',
    image: 'https://picsum.photos/400/400?random=1',
    category: 'amamentacao',
    shopeeLink: 'https://shopee.com.br',
    active: true,
  },
  {
    id: '2',
    name: 'Kit Higiene Bebê',
    description: 'Tudo que você precisa para a troca de fraldas.',
    image: 'https://picsum.photos/400/400?random=2',
    category: 'enxoval',
    shopeeLink: 'https://shopee.com.br',
    active: true,
  },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', name: 'Camisolas com abertura', category: 'mae', checked: false },
  { id: 'c2', name: 'Absorventes noturnos', category: 'mae', checked: false },
  { id: 'c3', name: 'Saída de maternidade', category: 'bebe', checked: false },
  { id: 'c4', name: 'Fraldas RN', category: 'bebe', checked: false },
  { id: 'c5', name: 'Documentos Pessoais', category: 'documentos', checked: false },
  { id: 'c6', name: 'Lanche para o pai', category: 'acompanhante', checked: false },
];

const INITIAL_CONFIG: AppConfig = {
  appName: 'BabyConnect',
  logoUrl: '', // Reverted to empty to use default Heart Icon
  bannerUrl: '',
  footerText: 'Feito com amor para mamães.',
  socialLink: '',
  whatsappGroupLink: 'https://chat.whatsapp.com/GXMM6PFQhKAIrrgT42zbdA',
  doulaSystemInstruction: `Você é a Doula AI, uma assistente virtual carinhosa, calma e acolhedora para gestantes. 
  Responda sempre com um tom gentil, infantil e seguro. 
  Você DEVE responder sobre: sintomas comuns, autocuidado, sinais de parto, amamentação e itens de maternidade.
  IMPORTANTE: Você NÃO é médica. NÃO dê diagnósticos médicos. 
  Se a usuária relatar dor intensa, sangramento ou algo preocupante, recomende IMEDIATAMENTE procurar um médico ou emergência.`,
};

const STORAGE_KEYS = {
  PRODUCTS: 'bc_products',
  CHECKLIST_DEF: 'bc_checklist_def', // The definitions (admin side)
  WEEKS: 'bc_weeks',
  CONFIG: 'bc_config',
  USER_SETTINGS: 'bc_user_settings',
  AI_USAGE: 'bc_ai_daily_usage', // New key for AI limits
};

// --- AI Usage Logic (Free Tier Limit) ---

interface AiUsageData {
  date: string; // YYYY-MM-DD
  count: number;
}

const AI_DAILY_LIMIT = 3;

export const getAiUsageStatus = () => {
  const today = new Date().toDateString(); // Unique string for "today"
  const raw = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
  let data: AiUsageData = raw ? JSON.parse(raw) : { date: today, count: 0 };

  // Reset if date changed
  if (data.date !== today) {
    data = { date: today, count: 0 };
    localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(data));
  }

  return {
    used: data.count,
    limit: AI_DAILY_LIMIT,
    remaining: Math.max(0, AI_DAILY_LIMIT - data.count),
    isBlocked: data.count >= AI_DAILY_LIMIT
  };
};

export const incrementAiUsage = () => {
  const today = new Date().toDateString();
  const raw = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
  let data: AiUsageData = raw ? JSON.parse(raw) : { date: today, count: 0 };

  // If date changed, reset first
  if (data.date !== today) {
    data = { date: today, count: 0 };
  }

  // Increment if valid
  if (data.count < AI_DAILY_LIMIT) {
    data.count += 1;
    localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(data));
  }
  
  return {
    used: data.count,
    limit: AI_DAILY_LIMIT,
    remaining: Math.max(0, AI_DAILY_LIMIT - data.count),
    isBlocked: data.count >= AI_DAILY_LIMIT
  };
};

// --- Admin / Data Helpers ---

export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getChecklistDefinitions = (): ChecklistItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST_DEF);
  return data ? JSON.parse(data) : INITIAL_CHECKLIST;
};

export const saveChecklistDefinitions = (items: ChecklistItem[]) => {
  localStorage.setItem(STORAGE_KEYS.CHECKLIST_DEF, JSON.stringify(items));
};

export const getConfig = (): AppConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (data) {
    // Merge with initial config to ensure new fields (like whatsappGroupLink) exist if data is old
    return { ...INITIAL_CONFIG, ...JSON.parse(data) };
  }
  return INITIAL_CONFIG;
};

export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// Medical Measurements approx (Weeks 1-42)
// Replaces fruits with scientific approximations
const WEEKLY_MEASUREMENTS = [
  "Microscópico", // Week 1
  "Microscópico", // Week 2
  "Microscópico", // Week 3
  "< 1 mm", // Week 4
  "2 mm", // Week 5
  "5 mm", // Week 6
  "1.3 cm", // Week 7
  "1.6 cm", // Week 8
  "2.3 cm", // Week 9
  "3.1 cm", // Week 10
  "4.1 cm", // Week 11
  "5.4 cm", // Week 12
  "7.4 cm", // Week 13
  "8.7 cm", // Week 14
  "10.1 cm", // Week 15
  "11.6 cm", // Week 16
  "13 cm", // Week 17
  "14.2 cm", // Week 18
  "15.3 cm", // Week 19
  "25.6 cm", // Week 20
  "26.7 cm", // Week 21
  "27.8 cm", // Week 22
  "28.9 cm", // Week 23
  "30 cm", // Week 24
  "34.6 cm", // Week 25
  "35.6 cm", // Week 26
  "36.6 cm", // Week 27
  "37.6 cm", // Week 28
  "38.6 cm", // Week 29
  "39.9 cm", // Week 30
  "41.1 cm", // Week 31
  "42.4 cm", // Week 32
  "43.7 cm", // Week 33
  "45 cm", // Week 34
  "46.2 cm", // Week 35
  "47.4 cm", // Week 36
  "48.6 cm", // Week 37
  "49.8 cm", // Week 38
  "50.7 cm", // Week 39
  "51.2 cm", // Week 40
  "51.5 cm", // Week 41
  "51.7 cm", // Week 42
];

// Generate 42 weeks of seed data if not exists
const generateWeeksData = (): WeekInfo[] => {
  return Array.from({ length: 42 }, (_, i) => {
    const weekNum = i + 1;
    // Safe fallback if array index is out of bounds (though it covers 42)
    const size = WEEKLY_MEASUREMENTS[i] || "Em crescimento"; 
    
    return {
      week: weekNum,
      babySize: `Aprox. ${size}`,
      development: 'O bebê está crescendo muito essa semana!',
      bodyChanges: 'Você pode sentir mais sono e mudanças no apetite.',
      symptoms: 'Náuseas matinais ou cansaço podem ocorrer.',
      tips: 'Beba muita água e descanse sempre que possível.',
      recommendedProductId: i % 2 === 0 ? '1' : '2',
      weeklyChecklist: ['Beber 2 litros de água', 'Caminhada leve de 20min', 'Tomar vitaminas pré-natais'],
    };
  });
};

export const getWeeksData = (): WeekInfo[] => {
  const data = localStorage.getItem(STORAGE_KEYS.WEEKS);
  
  if (data) {
    const parsed = JSON.parse(data);
    // BUG FIX: Removed logic that was overwriting saved data with default measurements on every load.
    // Now we trust the data in localStorage completely.
    return parsed;
  }

  const initial = generateWeeksData();
  localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(initial));
  return initial;
};

export const saveWeeksData = (weeks: WeekInfo[]) => {
  localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));
};

// --- User Specific Helpers ---

const INITIAL_USER: UserSettings = {
  dueDate: null,
  nameFavorites: [],
  checklistProgress: [],
  weeklyTasksCompleted: [],
};

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  return data ? JSON.parse(data) : INITIAL_USER;
};

export const saveUserSettings = (settings: UserSettings) => {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
};

export const toggleChecklistItem = (itemId: string) => {
  const settings = getUserSettings();
  const index = settings.checklistProgress.indexOf(itemId);
  if (index > -1) {
    settings.checklistProgress.splice(index, 1);
  } else {
    settings.checklistProgress.push(itemId);
  }
  saveUserSettings(settings);
};

export const toggleWeeklyTask = (taskKey: string) => {
  const settings = getUserSettings();
  // Ensure array exists
  if (!settings.weeklyTasksCompleted) settings.weeklyTasksCompleted = [];
  
  const index = settings.weeklyTasksCompleted.indexOf(taskKey);
  if (index > -1) {
    settings.weeklyTasksCompleted.splice(index, 1);
  } else {
    settings.weeklyTasksCompleted.push(taskKey);
  }
  saveUserSettings(settings);
};

export const toggleFavoriteName = (nameData: NameMeaning) => {
  const settings = getUserSettings();
  const exists = settings.nameFavorites.find(n => n.name === nameData.name);
  if (exists) {
    settings.nameFavorites = settings.nameFavorites.filter(n => n.name !== nameData.name);
  } else {
    settings.nameFavorites.push(nameData);
  }
  saveUserSettings(settings);
};
