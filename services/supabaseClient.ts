
import { createClient } from '@supabase/supabase-js';
import { getConfig } from './storage';

// INSTRUÇÕES:
// 1. Crie uma conta em https://supabase.com
// 2. Crie um novo projeto
// 3. Vá em Project Settings > API
// 4. Copie a "Project URL" e a "anon public key"
// 5. Substitua abaixo ou use variáveis de ambiente (.env)

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'SUA_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função auxiliar para upload de imagens
export const uploadImageToBucket = async (file: File, path: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images') // Certifique-se de criar um bucket chamado 'images' no Supabase
      .upload(filePath, file);

    if (error) throw error;

    // Pegar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Erro no upload:', error);
    return null;
  }
};
