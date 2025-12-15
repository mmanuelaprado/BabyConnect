
import { Product, ChecklistItem, WeekInfo, AppConfig, UserSettings, NameMeaning } from '../types';

// Data Version Control - Update this to force clients to reload STATIC_WEEKS_DB
const DATA_VERSION = 'v3_static_humanized_content';

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
  logoUrl: '',
  bannerUrl: '',
  footerText: 'Feito com amor para mamães.',
  socialLink: '',
  whatsappGroupLink: 'https://chat.whatsapp.com/GXMM6PFQhKAIrrgT42zbdA',
  doulaSystemInstruction: `Você é a Doula AI, uma assistente virtual carinhosa, calma e acolhedora para gestantes. 
  Responda sempre com um tom gentil, infantil e seguro. 
  Você DEVE responder sobre: sintomas comuns, autocuidado, sinais de parto, amamentação e itens de maternidade.
  IMPORTANTE: Você NÃO é médica. NÃO dê diagnósticos médicos. 
  Se a usuária relatar dor intensa, sangramento ou algo preocupante, recomende IMEDIATAMENTE procurar um médico ou emergência.`,
  apiKey: '',
};

const STORAGE_KEYS = {
  PRODUCTS: 'bc_products',
  CHECKLIST_DEF: 'bc_checklist_def',
  WEEKS: 'bc_weeks',
  CONFIG: 'bc_config',
  USER_SETTINGS: 'bc_user_settings',
  AI_USAGE: 'bc_ai_daily_usage',
  DATA_VERSION: 'bc_data_version', // Key to track version
};

// --- AI Usage Logic ---
interface AiUsageData {
  date: string;
  count: number;
}
const AI_DAILY_LIMIT = 3;

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
  if (data.date !== today) {
    data = { date: today, count: 0 };
  }
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
  if (data) return { ...INITIAL_CONFIG, ...JSON.parse(data) };
  return INITIAL_CONFIG;
};
export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// --- STATIC CONTENT DATABASE (WEEKS 1-42) ---
const STATIC_WEEKS_DB: WeekInfo[] = [
  // SEMANAS 1-4 (Descoberta)
  {
    week: 1,
    babySize: "Sementinha invisível",
    development: "Tudo começa agora! Embora você ainda não saiba, seu corpo está se preparando para uma jornada incrível. O óvulo e o espermatozoide estão prestes a se encontrar.",
    bodyChanges: "Por fora, nada mudou. Por dentro, um milagre silencioso está acontecendo.",
    symptoms: "Você ainda não sente nada diferente, pois a concepção está ocorrendo.",
    tips: "Comece a tomar ácido fólico se ainda não começou. Cuide da alimentação!",
    weeklyChecklist: ["Iniciar ácido fólico", "Cortar álcool e cigarro", "Alimentação saudável"],
    recommendedProductId: ""
  },
  {
    week: 2,
    babySize: "Sementinha invisível",
    development: "A fertilização aconteceu! Uma única célula agora começa a se multiplicar rapidamente. Parabéns, mamãe, a mágica começou.",
    bodyChanges: "Seu útero está criando um 'ninho' fofinho para receber o bebê.",
    symptoms: "Pode ocorrer um leve sangramento de nidação (bem pouquinho).",
    tips: "Tente descansar e reduzir o estresse. Seu corpo está trabalhando muito.",
    weeklyChecklist: ["Beber muita água", "Evitar remédios sem prescrição", "Descansar"],
    recommendedProductId: ""
  },
  {
    week: 3,
    babySize: "Grão de sal",
    development: "O blastocisto (grupo de células) chegou ao útero e está se acomodando. O sexo do bebê já está definido geneticamente!",
    bodyChanges: "Hormônios como o HCG começam a ser produzidos.",
    symptoms: "Talvez sinta um leve inchaço ou sensibilidade nos seios.",
    tips: "Evite alimentos crus e carnes mal passadas.",
    weeklyChecklist: ["Marcar ginecologista", "Evitar esforços pesados", "Comer vegetais verdes escuros"],
    recommendedProductId: ""
  },
  {
    week: 4,
    babySize: "Semente de Papoula",
    development: "Agora é oficial! O embrião está implantado. O saco gestacional começa a se formar para proteger seu pequeno tesouro.",
    bodyChanges: "Sua menstruação atrasou. É o sinal que você esperava!",
    symptoms: "Sono, leve cólica (parecida com a menstrual) e mamas sensíveis.",
    tips: "Hora de fazer o teste de farmácia ou de sangue (Beta HCG).",
    weeklyChecklist: ["Fazer teste de gravidez", "Contar para o parceiro(a)", "Agendar pré-natal"],
    recommendedProductId: ""
  },
  // SEMANAS 5-8
  {
    week: 5,
    babySize: "Semente de Maçã",
    development: "O coraçãozinho do bebê já começa a se formar e a bater de forma primitiva. O sistema nervoso também está em construção.",
    bodyChanges: "O útero começa a crescer, pressionando levemente a bexiga.",
    symptoms: "Vontade frequente de fazer xixi, cansaço excessivo e talvez os primeiros enjoos.",
    tips: "Coma porções menores várias vezes ao dia para aliviar o enjoo.",
    weeklyChecklist: ["Primeira consulta pré-natal", "Exames de sangue de rotina", "Comprar sutiã confortável"],
    recommendedProductId: "1" // Almofada (exemplo)
  },
  {
    week: 6,
    babySize: "Grão de Ervilha",
    development: "O rosto do bebê começa a tomar forma, com manchinhas escuras onde serão os olhos. Pequenos brotos aparecem: serão os braços e pernas!",
    bodyChanges: "Seu olfato pode estar super apurado (e enjoado com cheiros fortes).",
    symptoms: "Enjoos matinais podem intensificar. Mudanças de humor são normais.",
    tips: "Gengibre e limão podem ajudar nos enjoos.",
    weeklyChecklist: ["Ultrassom inicial (se médico pedir)", "Hidratar a pele", "Descansar mais"],
    recommendedProductId: ""
  },
  {
    week: 7,
    babySize: "Mirtilo (Blueberry)",
    development: "O cordão umbilical está formado, conectando vocês dois. O cérebro está crescendo rapidamente, ficando mais complexo a cada minuto.",
    bodyChanges: "Pode surgir um tampão mucoso no colo do útero para proteger o bebê.",
    symptoms: "Enjoos, aversão a comidas e acne devido aos hormônios.",
    tips: "Use protetor solar, sua pele pode manchar mais fácil agora.",
    weeklyChecklist: ["Atualizar carteira de vacinação", "Cuidar da pele do rosto", "Caminhada leve"],
    recommendedProductId: ""
  },
  {
    week: 8,
    babySize: "Framboesa",
    development: "Os dedinhos das mãos e dos pés estão se formando (ainda com membranas). O bebê já se mexe, mas você não sente.",
    bodyChanges: "O útero tem o tamanho de uma laranja grande agora.",
    symptoms: "Cansaço extremo. Seu corpo está fabricando uma vida, isso gasta energia!",
    tips: "Durma sempre que puder. Seu corpo pede cama.",
    weeklyChecklist: ["Comprar calcinhas confortáveis", "Beber 2L de água", "Consultar dentista"],
    recommendedProductId: ""
  },
  // SEMANAS 9-13
  {
    week: 9,
    babySize: "Azeitona Verde",
    development: "O coração já está dividido em 4 câmaras e as válvulas estão se formando. Os órgãos essenciais já estão no lugar.",
    bodyChanges: "A cintura começa a alargar levemente. Roupas apertadas incomodam.",
    symptoms: "Azia e mudanças de humor. Um dia chora, no outro ri.",
    tips: "Use roupas leves e que não apertem a barriga.",
    weeklyChecklist: ["Pesquisar cremes anti-estrias", "Lanche saudável na bolsa", "Evitar café em excesso"],
    recommendedProductId: ""
  },
  {
    week: 10,
    babySize: "Ameixa Seca",
    development: "Ele deixou de ser embrião e agora é um feto! Ossos e cartilagens estão se formando. As unhas começam a aparecer.",
    bodyChanges: "O volume de sangue no seu corpo aumentou muito, você pode sentir calor.",
    symptoms: "Veias mais visíveis nos seios e barriga. Prisão de ventre.",
    tips: "Coma fibras (mamão, ameixa, aveia) para ajudar o intestino.",
    weeklyChecklist: ["Comer mais fibras", "Ultrassom Morfológico (marcar)", "Tirar fotos da barriga"],
    recommendedProductId: ""
  },
  {
    week: 11,
    babySize: "Limão Siciliano",
    development: "A cabeça ainda é grande em relação ao corpo. Ele chuta e se espreguiça, treinando os movimentos.",
    bodyChanges: "Cabelos e unhas da mamãe podem estar crescendo mais rápido e fortes.",
    symptoms: "Os enjoos costumam começar a diminuir (ufa!).",
    tips: "Ótima semana para o ultrassom de translucência nucal (TN).",
    weeklyChecklist: ["Fazer ultrassom TN", "Conversar com o bebê", "Hidratar a barriga"],
    recommendedProductId: ""
  },
  {
    week: 12,
    babySize: "Maracujá",
    development: "Todos os sistemas do corpo estão formados. Agora é hora de amadurecer. Os reflexos estão aguçados.",
    bodyChanges: "O útero sai da pélvis e sobe. A barriguinha começa a despontar.",
    symptoms: "Menos enjoos, mais apetite. Dores de cabeça podem ocorrer.",
    tips: "Cuidado com tonturas ao levantar rápido.",
    weeklyChecklist: ["Anunciar gravidez (se quiser)", "Comprar calça de gestante", "Exercícios pélvicos"],
    recommendedProductId: ""
  },
  {
    week: 13,
    babySize: "Pêssego",
    development: "Fim do primeiro trimestre! O risco de perda gestacional cai drasticamente. O bebê já tem impressões digitais.",
    bodyChanges: "Sua energia está voltando! Você se sente mais disposta.",
    symptoms: "A libido pode aumentar ou diminuir. Corrimento vaginal aumenta (normal se for claro).",
    tips: "Aproveite a volta da energia para fazer exercícios leves.",
    weeklyChecklist: ["Hidratação intensiva", "Planejar enxoval", "Namorar um pouquinho"],
    recommendedProductId: ""
  },
  // SEMANAS 14-18
  {
    week: 14,
    babySize: "Limão Tahiti",
    development: "O pescoço alongou e o queixo não está mais no peito. O bebê pode fazer caretas e chupar o dedo.",
    bodyChanges: "A barriga já é notada por quem te conhece.",
    symptoms: "Apetite voraz! Cuidado para comer com qualidade.",
    tips: "Evite ficar muitas horas sem comer para não ter hipoglicemia.",
    weeklyChecklist: ["Comprar roupas largas", "Lanchinhos saudáveis", "Visitar lojas de bebê"],
    recommendedProductId: ""
  },
  {
    week: 15,
    babySize: "Maçã",
    development: "Ele percebe luz, mesmo de olhos fechados. As pernas estão crescendo mais que os braços agora.",
    bodyChanges: "Pode surgir a 'Linea Nigra', aquela linha escura na barriga.",
    symptoms: "Nariz entupido ou sangramento nasal (rinite gestacional) é comum.",
    tips: "Use soro fisiológico no nariz se precisar.",
    weeklyChecklist: ["Limpeza nasal", "Protetor solar sempre", "Conversar com amigas mães"],
    recommendedProductId: ""
  },
  {
    week: 16,
    babySize: "Abacate",
    development: "O coração bombeia cerca de 25 litros de sangue por dia! A musculatura das costas está ficando forte.",
    bodyChanges: "Você sente o útero cerca de 3 dedos abaixo do umbigo.",
    symptoms: "Pele brilhante (o 'glow' da gravidez).",
    tips: "Se for menina ou menino, talvez já dê para ver no ultrassom!",
    weeklyChecklist: ["Ultrassom de sexagem (opcional)", "Lista de nomes", "Dormir de lado"],
    recommendedProductId: "2" // Kit Higiene
  },
  {
    week: 17,
    babySize: "Pera",
    development: "O esqueleto está mudando de cartilagem para osso endurecido. O cordão umbilical está mais grosso e forte.",
    bodyChanges: "Seu centro de gravidade muda, cuidado com o equilíbrio.",
    symptoms: "Pode sentir dor no ligamento redondo (pontadas na virilha ao levantar).",
    tips: "Levante-se devagar e evite movimentos bruscos.",
    weeklyChecklist: ["Usar sapatos baixos", "Cuidado ao levantar", "Ouvir música relaxante"],
    recommendedProductId: ""
  },
  {
    week: 18,
    babySize: "Batata Doce",
    development: "Os ouvidos estão na posição final. O bebê pode ouvir seus batimentos e sua voz! Cante para ele.",
    bodyChanges: "A barriga cresce rápido agora.",
    symptoms: "Talvez você sinta os primeiros 'chutinhos' (parecem borboletas).",
    tips: "Converse com o bebê, ele já te escuta.",
    weeklyChecklist: ["Falar com o bebê", "Pesquisar maternidades", "Massagem nos pés"],
    recommendedProductId: ""
  },
  // SEMANAS 19-23
  {
    week: 19,
    babySize: "Manga",
    development: "A pele do bebê está coberta pelo vernix (uma cera branca protetora). Os neurônios motores estão conectando músculos ao cérebro.",
    bodyChanges: "Pode sentir cãibras nas pernas à noite.",
    symptoms: "Dor nas costas e leve inchaço nos pés.",
    tips: "Alongue as panturrilhas antes de dormir e coma bananas (potássio).",
    weeklyChecklist: ["Comer banana e água de coco", "Alongamento diário", "Pesquisar parto humanizado"],
    recommendedProductId: ""
  },
  {
    week: 20,
    babySize: "Banana",
    development: "Metade do caminho! Parabéns! O bebê engole líquido amniótico para treinar a digestão.",
    bodyChanges: "O umbigo pode começar a querer sair para fora.",
    symptoms: "Fome constante e chutes mais fortes.",
    tips: "É hora do Ultrassom Morfológico do 2º trimestre (o mais detalhado).",
    weeklyChecklist: ["Morfológico do 2º tri", "Planejar Chá de Bebê", "Verificar pressão arterial"],
    recommendedProductId: ""
  },
  {
    week: 21,
    babySize: "Cenoura Grande",
    development: "O sistema digestivo está amadurecendo. As sobrancelhas e pálpebras estão formadas.",
    bodyChanges: "Varizes ou vasinhos podem aparecer nas pernas.",
    symptoms: "Inchaço nos pés no final do dia.",
    tips: "Coloque as pernas para cima sempre que sentar.",
    weeklyChecklist: ["Meias de compressão (se médico indicar)", "Pés para cima", "Lista de presentes"],
    recommendedProductId: ""
  },
  {
    week: 22,
    babySize: "Mamão Papaya",
    development: "O bebê percebe o toque! Se você apertar a barriga, ele pode empurrar de volta. Ele dorme e acorda em ciclos.",
    bodyChanges: "Seus pés podem ter crescido (inchaço e relaxina).",
    symptoms: "Calor excessivo e suor.",
    tips: "Use roupas de algodão para a pele respirar.",
    weeklyChecklist: ["Roupas frescas", "Beber muita água", "Brincar de 'tocar' a barriga"],
    recommendedProductId: ""
  },
  {
    week: 23,
    babySize: "Toranja (Grapefruit)",
    development: "Os pulmões estão se preparando para respirar, produzindo surfactante. O bebê ouve sons externos (latidos, músicas).",
    bodyChanges: "A linha nigra na barriga fica mais escura.",
    symptoms: "Gengiva sangrando ao escovar os dentes é comum.",
    tips: "Use escova de dentes macia e não deixe de usar fio dental.",
    weeklyChecklist: ["Escova de dentes macia", "Visita ao dentista", "Montar playlist de parto"],
    recommendedProductId: ""
  },
  // SEMANAS 24-28
  {
    week: 24,
    babySize: "Espiga de Milho",
    development: "O rosto está praticamente pronto. Se nascesse agora, teria chances de sobrevivência (prematuro extremo), mas é melhor ficar aí!",
    bodyChanges: "O útero subiu acima do umbigo.",
    symptoms: "Olhos secos e visão levemente embaçada.",
    tips: "Teste de glicose (curva glicêmica) geralmente é pedido nessa fase.",
    weeklyChecklist: ["Exame de glicose", "Colírio lubrificante (se precisar)", "Hidratar barriga e seios"],
    recommendedProductId: ""
  },
  {
    week: 25,
    babySize: "Couve-Flor",
    development: "A pele está ficando menos translúcida e mais rosada, acumulando gordura. O cabelo começa a ter cor.",
    bodyChanges: "O cabelo da mamãe está cheio e brilhante (queda diminui).",
    symptoms: "Azia e refluxo podem incomodar mais.",
    tips: "Evite comer e deitar logo em seguida. Use travesseiros altos.",
    weeklyChecklist: ["Elevar cabeceira da cama", "Comer devagar", "Pesquisar pediatras"],
    recommendedProductId: ""
  },
  {
    week: 26,
    babySize: "Alface Americana",
    development: "Os olhos do bebê começam a se abrir! Ele pisca e pode ver luzes fortes através da sua barriga.",
    bodyChanges: "Dor nas costelas, pois o bebê está alto e chutando.",
    symptoms: "Dores nas costas e dificuldade para achar posição de dormir.",
    tips: "Use um travesseiro no meio das pernas para dormir.",
    weeklyChecklist: ["Travesseiro de corpo", "Exercícios de alongamento", "Começar a lavar roupinhas"],
    recommendedProductId: ""
  },
  {
    week: 27,
    babySize: "Brócolis",
    development: "O cérebro está fazendo conexões complexas. Ele sonha! O bebê reconhece a voz do pai/parceiro.",
    bodyChanges: "Cãibras e formigamento nas mãos (túnel do carpo).",
    symptoms: "Falta de ar leve ao subir escadas.",
    tips: "Descanse as mãos e evite movimentos repetitivos.",
    weeklyChecklist: ["Conversar com o bebê (pai também)", "Organizar chá de bebê", "Descansar as mãos"],
    recommendedProductId: ""
  },
  {
    week: 28,
    babySize: "Berinjela",
    development: "Bem-vinda ao terceiro trimestre! O bebê já tem cílios. Ele está ficando gordinho e a pele mais lisa.",
    bodyChanges: "A barriga está pesada. Pode ser difícil amarrar os sapatos.",
    symptoms: "Ciático (dor que desce pela perna/bumbum).",
    tips: "Peça ajuda para tarefas domésticas pesadas. Não seja super-heroína.",
    weeklyChecklist: ["Pedir ajuda em casa", "Fisioterapia se doer muito", "Lavar roupas do bebê"],
    recommendedProductId: ""
  },
  // SEMANAS 29-34
  {
    week: 29,
    babySize: "Abóbora Menina",
    development: "Os ossos estão endurecendo, consumindo muito cálcio. Ele chuta com força!",
    bodyChanges: "Varizes, hemorroidas ou prisão de ventre podem surgir.",
    symptoms: "Cansaço volta a aparecer.",
    tips: "Consuma alimentos ricos em cálcio (leite, iogurte, queijo, brócolis).",
    weeklyChecklist: ["Ingerir mais cálcio", "Banho de assento se precisar", "Organizar mala maternidade"],
    recommendedProductId: ""
  },
  {
    week: 30,
    babySize: "Repolho Grande",
    development: "O cérebro ganha suas dobras características (ficando mais inteligente). A medula óssea produz glóbulos vermelhos.",
    bodyChanges: "Seu andar pode ficar gingado ('andar de pato') para equilibrar.",
    symptoms: "Dificuldade para dormir e sonhos estranhos.",
    tips: "Reduza o ritmo. Tire sonecas se possível.",
    weeklyChecklist: ["Preparar mala da maternidade", "Tirar sonecas", "Verificar documentos"],
    recommendedProductId: ""
  },
  {
    week: 31,
    babySize: "Coco Verde",
    development: "Ele gira a cabeça de um lado para o outro. Os cinco sentidos estão funcionando.",
    bodyChanges: "Vazamento de colostro (leite) pode acontecer.",
    symptoms: "Falta de ar, o útero empurra o diafragma.",
    tips: "Use absorventes de seios se vazar colostro. É normal!",
    weeklyChecklist: ["Absorventes de seios", "Treinar respiração", "Finalizar quarto do bebê"],
    recommendedProductId: "1"
  },
  {
    week: 32,
    babySize: "Couve Chinesa",
    development: "O bebê treina respirar, engolir e chutar. As unhas já chegam na ponta dos dedos.",
    bodyChanges: "O útero está 12cm acima do umbigo.",
    symptoms: "Contrações de Braxton Hicks (barriga dura sem dor) ficam comuns.",
    tips: "Beba água quando sentir contrações de treino.",
    weeklyChecklist: ["Consultas quinzenais agora", "Beber água", "Monitorar movimentos"],
    recommendedProductId: ""
  },
  {
    week: 33,
    babySize: "Abacaxi",
    development: "O sistema imunológico está recebendo anticorpos da mamãe. O crânio continua maleável para o parto.",
    bodyChanges: "Você se sente superaquecida. O metabolismo está a mil.",
    symptoms: "Insônia e desconforto pélvico.",
    tips: "Conheça a maternidade onde vai parir (visita virtual ou presencial).",
    weeklyChecklist: ["Visitar maternidade", "Instalar bebê conforto", "Deixar mala pronta na porta"],
    recommendedProductId: ""
  },
  {
    week: 34,
    babySize: "Melão Cantaloupe",
    development: "A vernix (cera branca) começa a diminuir. A pele está macia. Os testículos (meninos) descem para a bolsa.",
    bodyChanges: "Visão pode ficar turva por retenção de líquido (avise o médico se for forte).",
    symptoms: "Inchaço nas mãos e pés.",
    tips: "Tire anéis e alianças antes que fiquem presos.",
    weeklyChecklist: ["Tirar anéis", "Plano de parto escrito", "Estocar fraldas"],
    recommendedProductId: ""
  },
  // SEMANAS 35-42 (Reta Final)
  {
    week: 35,
    babySize: "Melão Amarelo",
    development: "O bebê está gordinho e tem pouco espaço. Os chutes viram empurrões e rolagens.",
    bodyChanges: "A barriga atinge o ponto mais alto.",
    symptoms: "Vontade de fazer xixi a cada 30 minutos.",
    tips: "Faça o exame do Cotonete (Estreptococos B) essa semana ou na próxima.",
    weeklyChecklist: ["Exame do Cotonete (GBS)", "Estocar congelados em casa", "Descansar muito"],
    recommendedProductId: ""
  },
  {
    week: 36,
    babySize: "Alface Romana",
    development: "Os pulmões estão prontos! O bebê começa a descer para a pélvis (encaixar).",
    bodyChanges: "Respirar fica mais fácil quando ele desce, mas a pressão na bexiga aumenta.",
    symptoms: "Pressão na vagina (pontadas).",
    tips: "Consultas agora são semanais. Fique atenta aos sinais de parto.",
    weeklyChecklist: ["Consultas semanais", "Lembrancinhas maternidade", "Revisar rota para hospital"],
    recommendedProductId: ""
  },
  {
    week: 37,
    babySize: "Acelga",
    development: "O bebê não é mais prematuro! É considerado 'a termo inicial'. Ele treina sucção.",
    bodyChanges: "O tampão mucoso pode sair (uma gelatina rosada/marrom).",
    symptoms: "Ansiedade e instinto de aninhamento (arrumar a casa toda).",
    tips: "Não faça faxina pesada! Guarde energia para o parto.",
    weeklyChecklist: ["Não fazer esforço", "Deixar documentos fáceis", "Aguardar sinais"],
    recommendedProductId: ""
  },
  {
    week: 38,
    babySize: "Alho-Poró",
    development: "Todos os órgãos funcionam. Ele está apenas ganhando peso e esperando o momento dele.",
    bodyChanges: "A barriga pode estar bem baixa.",
    symptoms: "Choquinhos na vagina (cabeça do bebê pressionando nervos).",
    tips: "Relaxe. O bebê virá na hora certa.",
    weeklyChecklist: ["Relaxar", "Assistir filmes leves", "Massagem perineal"],
    recommendedProductId: ""
  },
  {
    week: 39,
    babySize: "Mini Melancia",
    development: "A pele nova está se formando por baixo da velha. O bebê está pronto para conhecer o mundo!",
    bodyChanges: "Contrações podem ficar ritmadas. Colo do útero pode estar dilatando.",
    symptoms: "Ansiedade total! 'Será que é hoje?'",
    tips: "Cronometre as contrações: se forem regulares e dolorosas, ligue para o médico.",
    weeklyChecklist: ["Cronometrar contrações", "Carregar celular", "Avisar acompanhante"],
    recommendedProductId: ""
  },
  {
    week: 40,
    babySize: "Jaca Pequena",
    development: "A data prevista chegou! Mas é apenas uma estimativa. Ele está confortável e nutrido.",
    bodyChanges: "Você se sente enorme e pronta para 'explodir' de amor.",
    symptoms: "Cansaço e expectativa.",
    tips: "Caminhadas leves e namorar podem ajudar a estimular o parto naturalmente.",
    weeklyChecklist: ["Caminhada leve", "Ter paciência", "Monitorar movimentos fetais"],
    recommendedProductId: ""
  },
  {
    week: 41,
    babySize: "Abóbora Moranga",
    development: "Ele continua engordando. O médico vai monitorar o líquido amniótico de perto.",
    bodyChanges: "Monitoramento constante da saúde do bebê.",
    symptoms: "Impaciência.",
    tips: "Confie no seu corpo e no seu bebê. Vai dar tudo certo.",
    weeklyChecklist: ["Cardiotocografia (monitoragem)", "Manter a calma", "Visualizar o parto"],
    recommendedProductId: ""
  },
  {
    week: 42,
    babySize: "Melancia Grande",
    development: "Última chamada! O bebê provavelmente descamará um pouco ao nascer (pele seca).",
    bodyChanges: "Indução do parto é provável se não nascer logo.",
    symptoms: "Alívio: não passa dessa semana!",
    tips: "Respire fundo. Em poucas horas ou dias, seu amor estará nos seus braços.",
    weeklyChecklist: ["Ir para a maternidade", "Boa hora!", "Bem-vindo, bebê!"],
    recommendedProductId: ""
  }
];

// --- GENERATE / GET DATA ---

export const getWeeksData = (): WeekInfo[] => {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
  const data = localStorage.getItem(STORAGE_KEYS.WEEKS);
  
  // If we have data AND the version matches our latest static content, use local data
  if (data && currentVersion === DATA_VERSION) {
    return JSON.parse(data);
  }

  // Otherwise, FORCE update to our new static DB
  saveWeeksData(STATIC_WEEKS_DB);
  localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
  return STATIC_WEEKS_DB;
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
