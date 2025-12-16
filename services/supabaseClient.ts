
import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// ⚠️ PASSO OBRIGATÓRIO: COLOQUE SUAS CHAVES DO SUPABASE AQUI
// ==============================================================================
const SUPABASE_URL = 'COLE_SUA_URL_SUPABASE_AQUI'; 
const SUPABASE_ANON_KEY = 'COLE_SUA_CHAVE_ANON_AQUI';

// Verificação de segurança: Só tenta conectar se a URL for válida (começa com http)
// e não for o texto padrão de exemplo.
const isValidUrl = (url: string) => {
  try { 
    return url.startsWith('http') && !url.includes('COLE_SUA_URL');
  } catch { 
    return false; 
  }
};

const isConfigured = isValidUrl(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes('COLE_SUA_CHAVE');

// Se não estiver configurado corretamente, exporta null em vez de crashar o app
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const uploadImageToBucket = async (file: File, path: string) => {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro upload:', error);
    return null;
  }
};
