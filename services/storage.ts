
import { Product, ChecklistItem, WeekInfo, AppConfig, UserSettings, NameMeaning, Post, Comment, JournalEntry, KickSession, Contraction, UserAccount, AuthSession } from '../types';

// Data Version Control - Alterado para forçar a regeneração dos dados
const DATA_VERSION = 'v4_fix_weeks_generation';

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

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    authorName: 'Júlia S.',
    authorWeek: 32,
    content: 'O quarto do Léo está quase pronto! Tão ansiosa para ver ele nesse bercinho. Alguém mais na reta final sentindo essa mistura de alegria e ansiedade? 💕🤰',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800',
    likes: 24,
    likedByMe: false,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    comments: [
      { id: 'c1', authorName: 'Mariana (28 sem)', text: 'Que lindo, Ju! Por aqui também estamos na correria final. Muita luz!', timestamp: Date.now() }
    ]
  },
  {
    id: 'p2',
    authorName: 'Ana Clara',
    authorWeek: 14,
    content: 'Hoje ouvi o coraçãozinho pela primeira vez no doppler. É o som mais lindo do mundo! O enjoo finalmente passou e estou me sentindo radiante. ✨',
    likes: 56,
    likedByMe: false,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    comments: []
  },
];

const INITIAL_CONFIG: AppConfig = {
  appName: 'BabyConnect',
  logoUrl: '',
  bannerUrl: '',
  footerText: 'Feito com amor para mamães.',
  socialLink: '',
  whatsappGroupLink: 'https://chat.whatsapp.com/GXMM6PFQhKAIrrgT42zbdA',
  doulaSystemInstruction: `Você é a Doula AI, uma assistente virtual carinhosa...`, // Shortened for brevity
  apiKey: '',
};

const STORAGE_KEYS = {
  PRODUCTS: 'bc_products',
  CHECKLIST_DEF: 'bc_checklist_def',
  WEEKS: 'bc_weeks',
  CONFIG: 'bc_config',
  USER_SETTINGS: 'bc_user_settings',
  AI_USAGE: 'bc_ai_daily_usage',
  DATA_VERSION: 'bc_data_version',
  POSTS: 'bc_social_posts', 
  AUTH_USERS: 'bc_auth_users',
  AUTH_SESSION: 'bc_auth_session',
};

// --- STATIC CONTENT GENERATOR ---
// This ensures the app always has week data, even if not manually populated
const generateStaticWeeks = (): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  const sizes = [
    "Semente de Papoula", "Grão de Gergelim", "Lentilha", "Mirtilo", "Framboesa", 
    "Azeitona", "Ameixa", "Limão", "Pêssego", "Abacate", "Manga", "Banana", 
    "Romã", "Mamão", "Melão", "Abacaxi", "Repolho", "Coco", "Abóbora", "Melancia"
  ];

  for (let i = 1; i <= 42; i++) {
    const size = sizes[Math.min(i - 4, sizes.length - 1)] || "Tamanho Surpresa";
    weeks.push({
      week: i,
      babySize: i < 4 ? "Microscópico" : size,
      development: `Na ${i}ª semana, o desenvolvimento do seu bebê está a todo vapor. ${i < 12 ? 'Os órgãos vitais estão se formando.' : 'Ele está crescendo e ganhando peso rapidamente.'}`,
      bodyChanges: `Você pode notar mudanças no seu corpo. ${i < 12 ? 'Enjoos e cansaço são comuns.' : 'Sua barriga está começando a aparecer mais.'}`,
      symptoms: i < 12 ? "Enjoo, sono, sensibilidade nos seios." : "Azia, dor nas costas, inchaço leve.",
      tips: "Lembre-se de beber muita água, manter uma alimentação equilibrada e descansar sempre que possível.",
      weeklyChecklist: [
        "Beber 2 litros de água",
        "Passar hidratante na barriga",
        "Tirar uma foto da evolução"
      ],
      recommendedProductId: ''
    });
  }
  return weeks;
};

const STATIC_WEEKS_DB: WeekInfo[] = generateStaticWeeks();

// --- AUTH ---
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const getAuthUsers = (): UserAccount[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
  return data ? JSON.parse(data) : [];
};

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  const users = getAuthUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return { success: false, message: 'Este nome de usuário já está em uso.' };

  const passwordHash = await hashPassword(password);
  const newUser: UserAccount = { id: Date.now().toString(), username, passwordHash, createdAt: Date.now() };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
  
  await loginUser(username, password);
  
  // Preserve existing settings if possible, just update name
  const settings = getUserSettings();
  settings.userName = username;
  saveUserSettings(settings);

  return { success: true, message: 'Conta criada com sucesso!' };
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  const users = getAuthUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return { success: false, message: 'Usuário não encontrado.' };

  const inputHash = await hashPassword(password);
  if (inputHash !== user.passwordHash) return { success: false, message: 'Senha incorreta.' };

  const session: AuthSession = {
    username: user.username,
    token: Date.now().toString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

  const settings = getUserSettings();
  settings.userName = user.username;
  saveUserSettings(settings);

  return { success: true, message: 'Login realizado!' };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

export const getSession = (): AuthSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!data) return null;
  const session: AuthSession = JSON.parse(data);
  if (Date.now() > session.expiresAt) {
    logoutUser();
    return null;
  }
  return session;
};

// --- AI USAGE ---
const AI_DAILY_LIMIT = 3;
interface AiUsageData { date: string; count: number; }

export const getAiUsageStatus = () => {
  const today = new Date().toDateString();
  const raw = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
  let data: AiUsageData = raw ? JSON.parse(raw) : { date: today, count: 0 };
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
  if (data.date !== today) data = { date: today, count: 0 };
  
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

// --- DATA ACCESS ---
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : INITIAL_PRODUCTS;
};
export const saveProducts = (products: Product[]) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

export const getChecklistDefinitions = (): ChecklistItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST_DEF);
  return data ? JSON.parse(data) : INITIAL_CHECKLIST;
};
export const saveChecklistDefinitions = (items: ChecklistItem[]) => localStorage.setItem(STORAGE_KEYS.CHECKLIST_DEF, JSON.stringify(items));

export const getWeeksData = (): WeekInfo[] => {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
  const data = localStorage.getItem(STORAGE_KEYS.WEEKS);
  
  // If version mismatch or no data, return STATIC_WEEKS_DB and save it
  if (!data || currentVersion !== DATA_VERSION) {
    localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(STATIC_WEEKS_DB));
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    return STATIC_WEEKS_DB;
  }
  
  return JSON.parse(data);
};

export const saveWeeksData = (weeks: WeekInfo[]) => localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));

export const getConfig = (): AppConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return data ? { ...INITIAL_CONFIG, ...JSON.parse(data) } : INITIAL_CONFIG;
};
export const saveConfig = (config: AppConfig) => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));

// --- USER SETTINGS ---
const INITIAL_USER: UserSettings = {
  dueDate: null,
  nameFavorites: [],
  checklistProgress: [],
  weeklyTasksCompleted: [],
  userName: 'Mamãe',
  userBio: 'Vivendo a melhor fase! 💕',
  userPhoto: '',
  journalEntries: [],
  kickSessions: [],
  contractions: []
};

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  return data ? { ...INITIAL_USER, ...JSON.parse(data) } : INITIAL_USER;
};

export const saveUserSettings = (settings: UserSettings) => localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));

export const toggleChecklistItem = (itemId: string) => {
  const settings = getUserSettings();
  const index = settings.checklistProgress.indexOf(itemId);
  if (index > -1) settings.checklistProgress.splice(index, 1);
  else settings.checklistProgress.push(itemId);
  saveUserSettings(settings);
};

export const toggleWeeklyTask = (taskKey: string) => {
  const settings = getUserSettings();
  if (!settings.weeklyTasksCompleted) settings.weeklyTasksCompleted = [];
  const index = settings.weeklyTasksCompleted.indexOf(taskKey);
  if (index > -1) settings.weeklyTasksCompleted.splice(index, 1);
  else settings.weeklyTasksCompleted.push(taskKey);
  saveUserSettings(settings);
};

export const toggleFavoriteName = (nameData: NameMeaning) => {
  const settings = getUserSettings();
  const exists = settings.nameFavorites.find(n => n.name === nameData.name);
  if (exists) settings.nameFavorites = settings.nameFavorites.filter(n => n.name !== nameData.name);
  else settings.nameFavorites.push(nameData);
  saveUserSettings(settings);
};

export const addJournalEntry = (entry: JournalEntry) => {
  const settings = getUserSettings();
  settings.journalEntries = [entry, ...(settings.journalEntries || [])];
  saveUserSettings(settings);
  return settings.journalEntries;
};

export const deleteJournalEntry = (id: string) => {
  const settings = getUserSettings();
  settings.journalEntries = settings.journalEntries.filter(e => e.id !== id);
  saveUserSettings(settings);
  return settings.journalEntries;
}

export const saveKickSession = (session: KickSession) => {
  const settings = getUserSettings();
  settings.kickSessions = [session, ...(settings.kickSessions || [])];
  saveUserSettings(settings);
};

export const saveContractions = (list: Contraction[]) => {
  const settings = getUserSettings();
  settings.contractions = list;
  saveUserSettings(settings);
};

// --- SOCIAL ---
export const getPosts = (): Post[] => {
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : INITIAL_POSTS;
};

export const savePost = (newPost: Post) => {
  const posts = getPosts();
  const updated = [newPost, ...posts];
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return updated;
};

export const deletePost = (postId: string) => {
  const posts = getPosts();
  const updated = posts.filter(p => p.id !== postId);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return updated;
};

export const toggleLikePost = (postId: string) => {
  const posts = getPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      return {
        ...p,
        likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
        likedByMe: !p.likedByMe
      };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return updated;
};

export const addCommentToPost = (postId: string, comment: Comment) => {
  const posts = getPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      return { ...p, comments: [...p.comments, comment] };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
  return updated;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
