
import { Product, ChecklistItem, WeekInfo, AppConfig, UserSettings, NameMeaning, Post, JournalEntry, KickSession, Contraction } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  PRODUCTS: 'bc_products',
  CHECKLIST_DEF: 'bc_checklist_def',
  WEEKS: 'bc_weeks',
  CONFIG: 'bc_config',
  USER_SETTINGS: 'bc_user_settings',
  POSTS: 'bc_posts', 
  DOULA_CHAT: 'bc_doula_chat',
  MARKETPLACE: 'bc_marketplace_products',
};

// --- AUTH & SYNC ---

export const getSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Sincroniza o perfil do usuário (Nuvem -> Local)
export const syncProfile = async () => {
  if (!supabase) return;
  const session = await getSession();
  if (!session) return;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_data')
      .eq('id', session.user.id)
      .single();

    if (data?.user_data) {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.user_data));
      window.dispatchEvent(new Event('local-data-change'));
    }
  } catch (e) {
    console.error("Erro sync profile:", e);
  }
};

// --- USER SETTINGS (Híbrido - Prioriza Nuvem se logado) ---

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  const defaultSettings: UserSettings = { 
    dueDate: null, nameFavorites: [], checklistProgress: [], 
    weeklyTasksCompleted: [], journalEntries: [], kickSessions: [], 
    contractions: [], userName: '', userPhoto: ''
  };
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

export const saveUserSettings = async (settings: UserSettings) => {
  // 1. Salva Local (Instantâneo)
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  window.dispatchEvent(new Event('local-data-change'));

  // 2. Salva Nuvem (Background) se configurado
  if (supabase) {
    const session = await getSession();
    if (session) {
      await supabase.from('profiles').update({
        user_data: settings,
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);
    }
  }
};

// --- POSTS (CLOUD ONLY - Sincronização Real) ---

export const getPosts = async (): Promise<Post[]> => {
  if (!supabase) return []; // Retorna vazio se não configurado, evita crash

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    authorName: p.author_name,
    authorWeek: p.author_week,
    authorPhoto: p.author_photo,
    content: p.content,
    image: p.image_url,
    likes: p.likes,
    likedByMe: false, 
    comments: [],
    timestamp: new Date(p.created_at).getTime()
  }));
};

export const savePost = async (post: Post) => {
  if (!supabase) throw new Error("Erro: Banco de dados não configurado.");
  
  const session = await getSession();
  if (!session) throw new Error("Você precisa estar logada.");

  const { error } = await supabase.from('posts').insert({
    user_id: session.user.id,
    author_name: post.authorName,
    author_week: post.authorWeek,
    author_photo: post.authorPhoto,
    content: post.content,
    image_url: post.image,
    likes: 0
  });

  if (error) throw error;
  return await getPosts();
};

export const deletePost = async (id: string) => {
  if (!supabase) return [];
  
  const session = await getSession();
  if (session) {
    await supabase.from('posts').delete().eq('id', id).eq('user_id', session.user.id);
  }
  return await getPosts();
};

// --- DADOS LOCAIS (Produtos do App, Textos, etc) ---

export const getProducts = (): Product[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
export const getChecklistDefinitions = (): ChecklistItem[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_DEF) || '[]');
export const getWeeksData = (): WeekInfo[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKS) || '[]');
export const getConfig = (): AppConfig => JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}');
export const getMarketplaceProducts = (): Product[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKETPLACE) || '[]');
export const getDoulaChatHistory = (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DOULA_CHAT) || '[]');

export const saveProducts = (d: Product[]) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(d));
export const saveChecklistDefinitions = (d: ChecklistItem[]) => localStorage.setItem(STORAGE_KEYS.CHECKLIST_DEF, JSON.stringify(d));
export const saveWeeksData = (d: WeekInfo[]) => localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(d));
export const saveConfig = (d: AppConfig) => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(d));
export const saveDoulaChatHistory = (d: any[]) => localStorage.setItem(STORAGE_KEYS.DOULA_CHAT, JSON.stringify(d));

export const saveMarketplaceProduct = (product: Product): Product[] => {
  const products = getMarketplaceProducts();
  const updated = [product, ...products];
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(updated));
  return updated;
};

export const deleteMarketplaceProduct = (id: string): Product[] => {
  const products = getMarketplaceProducts();
  const updated = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(updated));
  return updated;
};

// --- FEATURE TOGGLES ---

export const toggleFavoriteName = (nameData: NameMeaning) => {
  const settings = getUserSettings();
  const exists = settings.nameFavorites.some(n => n.name === nameData.name);
  if (exists) settings.nameFavorites = settings.nameFavorites.filter(n => n.name !== nameData.name);
  else settings.nameFavorites.push(nameData);
  saveUserSettings(settings);
};

export const toggleChecklistItem = (id: string) => {
  const settings = getUserSettings();
  const index = settings.checklistProgress.indexOf(id);
  if (index > -1) settings.checklistProgress.splice(index, 1);
  else settings.checklistProgress.push(id);
  saveUserSettings(settings);
};

export const toggleWeeklyTask = (taskId: string) => {
  const settings = getUserSettings();
  const index = settings.weeklyTasksCompleted.indexOf(taskId);
  if (index > -1) settings.weeklyTasksCompleted.splice(index, 1);
  else settings.weeklyTasksCompleted.push(taskId);
  saveUserSettings(settings);
};

export const addJournalEntry = (entry: JournalEntry) => {
  const settings = getUserSettings();
  settings.journalEntries.unshift(entry);
  saveUserSettings(settings);
};

export const deleteJournalEntry = (id: string) => {
  const settings = getUserSettings();
  settings.journalEntries = settings.journalEntries.filter(e => e.id !== id);
  saveUserSettings(settings);
};

export const saveKickSession = (session: KickSession) => {
  const settings = getUserSettings();
  settings.kickSessions.unshift(session);
  saveUserSettings(settings);
};

export const saveContractions = (contractions: Contraction[]) => {
  const settings = getUserSettings();
  settings.contractions = contractions;
  saveUserSettings(settings);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const createBackup = () => {
  const data = {
    products: getProducts(),
    checklist: getChecklistDefinitions(),
    weeks: getWeeksData(),
    config: getConfig(),
    userSettings: getUserSettings(),
    marketplace: getMarketplaceProducts()
  };
  return JSON.stringify(data, null, 2);
};

export const restoreBackup = (json: string) => {
  try {
    const data = JSON.parse(json);
    if (data.products) saveProducts(data.products);
    if (data.checklist) saveChecklistDefinitions(data.checklist);
    if (data.weeks) saveWeeksData(data.weeks);
    if (data.config) saveConfig(data.config);
    if (data.userSettings) saveUserSettings(data.userSettings);
    if (data.marketplace) localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(data.marketplace));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
