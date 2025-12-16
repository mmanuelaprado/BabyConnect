
import { GoogleGenAI, Type } from "@google/genai";
import { getConfig } from "./storage";

// Helper to determine the best available API Key
const getApiKey = () => {
  // 1. Try Local Storage (User configured via Admin Panel)
  const config = getConfig();
  if (config.apiKey && config.apiKey.trim() !== '') {
    return config.apiKey;
  }

  // 2. Try Standard Environment Variable (Process - Webpack/CRA/Node) - SAFE ACCESS
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // ignore
  }

  // 3. Try Vite Environment Variable (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // ignore
  }

  return '';
};

// Dynamic client generator
const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. Configure in Admin or Env Vars.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
}

export const getDoulaChat = () => {
  const config = getConfig();
  const ai = getAiClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: config.doulaSystemInstruction,
      temperature: 0.7,
    },
  });
};

export const getNameMeaning = async (name: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Analise o nome "${name}". Forneça o significado, origem, personalidade associada e 3 sugestões de nomes parecidos.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            meaning: { type: Type.STRING },
            origin: { type: Type.STRING },
            personality: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error getting name meaning:", error);
    throw error;
  }
};

interface SimpleProduct {
  id: string;
  name: string;
}

export const generateWeeklyInfo = async (week: number, availableProducts: SimpleProduct[] = []) => {
  try {
    const ai = getAiClient();
    const productsList = availableProducts.map(p => `ID: "${p.id}", Nome: "${p.name}"`).join('\n');

    const prompt = `
      Gere um conteúdo completo, carinhoso e útil para uma gestante na ${week}ª semana de gravidez.
      
      Produtos Disponíveis na Loja do App:
      ${productsList}

      Tarefas:
      1. Descreva mudanças no corpo e sintomas.
      2. Dê uma dica valiosa ou aviso de segurança.
      3. Crie uma checklist com 3 a 4 tarefas curtas para fazer nesta semana.
      4. Da lista de "Produtos Disponíveis" acima, escolha o ID do produto que faz mais sentido recomendar para esta semana. Se nenhum for relevante, retorne string vazia.

      Tom de voz: Gentil, maternal e direto.
      Idioma: Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bodyChanges: { type: Type.STRING, description: "Resumo das mudanças no corpo." },
            symptoms: { type: Type.STRING, description: "Sintomas comuns." },
            tips: { type: Type.STRING, description: "Dica ou aviso importante." },
            recommendedProductId: { type: Type.STRING, description: "O ID do produto recomendado (deve ser um dos IDs fornecidos) ou vazio." },
            weeklyChecklist: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de 3 a 5 tarefas curtas." 
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating weekly info:", error);
    throw error;
  }
};
