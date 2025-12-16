
import { Product, ChecklistItem, WeekInfo, AppConfig, UserSettings, NameMeaning, Post, Comment, JournalEntry, KickSession, Contraction, UserAccount, AuthSession } from '../types';

// Data Version Control
const DATA_VERSION = 'v7_safe_storage';

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Almofada de Amamentação',
    description: 'Conforto para mamãe e bebê durante a amamentação.',
    image: 'https://picsum.photos/400/400?random=1',
    category: 'amamentacao',
    shopeeLink: 'https://shopee.com.br',
    price: 'R$ 89,90',
    active: true,
  },
  {
    id: '2',
    name: 'Kit Higiene Bebê',
    description: 'Tudo que você precisa para a troca de fraldas.',
    image: 'https://picsum.photos/400/400?random=2',
    category: 'enxoval',
    shopeeLink: 'https://shopee.com.br',
    price: 'R$ 45,50',
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
  logoUrl: '', // Will use default icon in Layout if empty
  bannerUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=1200&h=400', // Default nice banner
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
  MARKETPLACE: 'bc_marketplace_products',
};

// --- STATIC CONTENT GENERATOR ---
const WEEKS_DATA_SOURCE: Partial<WeekInfo>[] = [
  {
    week: 1,
    babySize: "Microscópico",
    development: "A jornada começou! Embora você ainda não saiba, seu corpo está se preparando para a concepção.",
    bodyChanges: "Seu ciclo menstrual está acontecendo e o útero se prepara para receber o óvulo fertilizado.",
    symptoms: "Nenhum sintoma de gravidez ainda.",
    tips: "Comece a tomar ácido fólico se ainda não começou.",
    weeklyChecklist: ["Iniciar ácido fólico", "Cortar álcool e cigarros", "Manter dieta saudável"]
  },
  {
    week: 2,
    babySize: "Microscópico",
    development: "A ovulação ocorre e a fertilização pode acontecer. O óvulo encontra o espermatozoide!",
    bodyChanges: "O revestimento do útero fica mais espesso para acolher o bebê.",
    symptoms: "Pode haver um leve aumento na temperatura corporal.",
    tips: "Tente relaxar e evite estresse excessivo.",
    weeklyChecklist: ["Acompanhar ciclo fértil", "Beber bastante água"]
  },
  {
    week: 3,
    babySize: "Sementinha de Papoula",
    development: "O óvulo fertilizado (zigoto) viaja para o útero e começa a se dividir rapidamente.",
    bodyChanges: "A implantação ocorre, podendo causar um leve sangramento (nidação).",
    symptoms: "Leve cólica ou escape.",
    tips: "Evite medicamentos sem orientação médica.",
    weeklyChecklist: ["Evitar remédios sem prescrição", "Descansar bem"]
  },
  {
    week: 4,
    babySize: "Semente de Papoula",
    development: "O blastocisto se fixa no útero. A placenta começa a se formar.",
    bodyChanges: "Atraso menstrual! É a hora de fazer o teste.",
    symptoms: "Mamas sensíveis, cansaço e possíveis náuseas leves.",
    tips: "Faça o teste de gravidez!",
    weeklyChecklist: ["Fazer teste de gravidez", "Marcar primeira consulta pré-natal"]
  },
  {
    week: 5,
    babySize: "Semente de Gergelim",
    development: "O coração começa a bater! O tubo neural (futuro cérebro e medula) se fecha.",
    bodyChanges: "Hormônios HCG em alta.",
    symptoms: "Náuseas matinais, vontade frequente de urinar, cansaço.",
    tips: "Fracione as refeições para aliviar o enjoo.",
    weeklyChecklist: ["Comer pequenas porções", "Evitar cheiros fortes"]
  },
  {
    week: 6,
    babySize: "Ervilha",
    development: "Nariz, boca e orelhas começam a tomar forma. O coração bate 100-160 vezes por minuto.",
    bodyChanges: "O útero está crescendo, pressionando a bexiga.",
    symptoms: "Enjoos podem piorar, mudanças de humor, aversão a alimentos.",
    tips: "Gengibre pode ajudar com os enjoos.",
    weeklyChecklist: ["Primeiro ultrassom (geralmente entre 6-9 semanas)", "Usar sutiã confortável"]
  },
  {
    week: 7,
    babySize: "Mirtilo",
    development: "Braços e pernas começam a brotar. O cérebro está se tornando mais complexo.",
    bodyChanges: "O tampão mucoso se forma no colo do útero.",
    symptoms: "Acne, sensibilidade nos seios, cansaço extremo.",
    tips: "Tire cochilos sempre que possível.",
    weeklyChecklist: ["Atualizar carteira de vacinação", "Cuidar da pele"]
  },
  {
    week: 8,
    babySize: "Framboesa",
    development: "Dedos das mãos e pés estão se formando (ainda com membranas). Ele já se mexe!",
    bodyChanges: "O útero tem o tamanho de uma laranja.",
    symptoms: "Indigestão, azia, olfato apurado.",
    tips: "Coma devagar e evite comidas muito gordurosas.",
    weeklyChecklist: ["Comprar sutiã de sustentação", "Marcar exames de sangue"]
  },
  {
    week: 9,
    babySize: "Azeitona",
    development: "O coração já tem 4 câmaras. Os dentes começam a se formar sob a gengiva.",
    bodyChanges: "Cintura pode começar a alargar levemente.",
    symptoms: "Mudanças de humor intensas, cansaço.",
    tips: "Converse com seu parceiro sobre como se sente.",
    weeklyChecklist: ["Pesquisar sobre planos de saúde/maternidade", "Hidratar a barriga"]
  },
  {
    week: 10,
    babySize: "Ameixa Seca",
    development: "Unhas e cabelos começam a aparecer. Os órgãos vitais já estão funcionando.",
    bodyChanges: "As veias podem ficar mais visíveis (aumento do volume sanguíneo).",
    symptoms: "Constipação, tonturas ocasionais.",
    tips: "Aumente a ingestão de fibras e água.",
    weeklyChecklist: ["Fazer Sexagem Fetal (opcional)", "Comer fibras"]
  },
  {
    week: 11,
    babySize: "Limão",
    development: "O bebê já consegue abrir e fechar as mãos. A pele ainda é transparente.",
    bodyChanges: "Cabelos e unhas da mãe crescem mais rápido.",
    symptoms: "Enjoos podem começar a diminuir.",
    tips: "Planeje o anúncio da gravidez se desejar.",
    weeklyChecklist: ["Ultrassom Morfológico do 1º Trimestre (11-14 sem)", "Anunciar para família (opcional)"]
  },
  {
    week: 12,
    babySize: "Maracujá",
    development: "Reflexos estão presentes. O bebê pode chupar o dedo.",
    bodyChanges: "O útero sobe para fora da pelve.",
    symptoms: "Menos vontade de urinar, mais energia retornando.",
    tips: "Pratique exercícios leves como caminhada.",
    weeklyChecklist: ["Contar para o chefe (se aplicável)", "Iniciar rotina de exercícios leves"]
  },
  {
    week: 13,
    babySize: "Pêssego",
    development: "Impressões digitais se formam. Cordas vocais em desenvolvimento.",
    bodyChanges: "Fim do primeiro trimestre! Risco de aborto cai drasticamente.",
    symptoms: "Aumento da libido, 'brilho' da gravidez.",
    tips: "Comemore o fim do primeiro trimestre!",
    weeklyChecklist: ["Começar a planejar o enxoval", "Tirar foto da barriga"]
  },
  {
    week: 14,
    babySize: "Limão Siciliano",
    development: "O bebê faz caretas e pode começar a ter soluços.",
    bodyChanges: "A barriga começa a ficar evidente para algumas.",
    symptoms: "Dores no ligamento redondo (pontadas na virilha).",
    tips: "Levante-se devagar para evitar tonturas.",
    weeklyChecklist: ["Hidratar bem a pele contra estrias", "Comprar calças confortáveis"]
  },
  {
    week: 15,
    babySize: "Maçã",
    development: "O bebê percebe luz através das pálpebras fechadas. Pernas mais longas que os braços.",
    bodyChanges: "Nariz entupido (rinite gestacional) é comum.",
    symptoms: "Sangramento na gengiva ao escovar os dentes.",
    tips: "Vá ao dentista para um check-up.",
    weeklyChecklist: ["Consulta odontológica", "Dormir de lado (lado esquerdo é melhor)"]
  },
  {
    week: 16,
    babySize: "Abacate",
    development: "O coração bombeia 25 litros de sangue por dia. Orelhas na posição correta.",
    bodyChanges: "Você pode começar a sentir os primeiros movimentos (borboletas).",
    symptoms: "Dores nas costas, olhos secos.",
    tips: "Use colírio se os olhos estiverem secos.",
    weeklyChecklist: ["Descobrir o sexo (se não fez sexagem)", "Planejar Chá Revelação"]
  },
  {
    week: 17,
    babySize: "Pera",
    development: "Esqueleto está endurecendo (passando de cartilagem para osso).",
    bodyChanges: "Ganho de peso constante. O centro de gravidade muda.",
    symptoms: "Desequilíbrio, sonhos vívidos.",
    tips: "Use sapatos confortáveis e baixos.",
    weeklyChecklist: ["Escolher nomes do bebê", "Montar lista de presentes"]
  },
  {
    week: 18,
    babySize: "Pimentão",
    development: "O bebê ouve sons externos! Ele pode se assustar com barulhos.",
    bodyChanges: "Apetite aumenta consideravelmente.",
    symptoms: "Fome constante, pressão baixa.",
    tips: "Converse e cante para o bebê.",
    weeklyChecklist: ["Fazer playlist para o bebê", "Lanchinhos saudáveis na bolsa"]
  },
  {
    week: 19,
    babySize: "Manga",
    development: "Vernix (camada cerosa) cobre a pele do bebê para proteção.",
    bodyChanges: "Pode aparecer a linha nigra (linha escura na barriga).",
    symptoms: "Cãibras nas pernas, dor no quadril.",
    tips: "Alongue as panturrilhas antes de dormir.",
    weeklyChecklist: ["Comprar travesseiro de corpo", "Verificar móveis do quarto"]
  },
  {
    week: 20,
    babySize: "Banana",
    development: "Meio da gravidez! O bebê engole líquido amniótico.",
    bodyChanges: "Umbigo pode começar a saltar para fora.",
    symptoms: "Inchaço leve nos pés e tornozelos.",
    tips: "Eleve as pernas ao final do dia.",
    weeklyChecklist: ["Ultrassom Morfológico do 2º Trimestre", "Comprar roupas de maternidade"]
  },
  {
    week: 21,
    babySize: "Cenoura",
    development: "Sobrancelhas e cílios estão formados. O bebê dorme e acorda.",
    bodyChanges: "Estrias podem começar a aparecer (avermelhadas).",
    symptoms: "Varizes, aumento da oleosidade da pele.",
    tips: "Continue hidratando muito a pele.",
    weeklyChecklist: ["Pesquisar sobre parto humanizado", "Visitar maternidades"]
  },
  {
    week: 22,
    babySize: "Mamão Papaya",
    development: "Lábios e papilas gustativas formados. Ele sente o gosto do que você come.",
    bodyChanges: "Pés podem crescer um pouco (inchaço/relaxina).",
    symptoms: "Calor excessivo, transpiração.",
    tips: "Use roupas leves e de algodão.",
    weeklyChecklist: ["Organizar Chá de Bebê", "Verificar licença maternidade"]
  },
  {
    week: 23,
    babySize: "Toranja",
    development: "Pulmões estão treinando respiração. Audição apurada.",
    bodyChanges: "Contrações de Braxton Hicks (treinamento) podem começar.",
    symptoms: "Barriga dura ocasionalmente, esquecimento ('mommy brain').",
    tips: "Anote tudo para não esquecer.",
    weeklyChecklist: ["Começar a lavar roupinhas", "Anotar dúvidas para o médico"]
  },
  {
    week: 24,
    babySize: "Espiga de Milho",
    development: "Viabilidade fetal: pulmões têm alvéolos se formando.",
    bodyChanges: "Umbigo definitivamente para fora (para algumas).",
    symptoms: "Olhos sensíveis à luz, coceira na barriga.",
    tips: "Não coce! Passe creme.",
    weeklyChecklist: ["Exame de curva glicêmica (diabetes)", "Hidratar umbigo"]
  },
  {
    week: 25,
    babySize: "Couve-flor",
    development: "Gordura do bebê começa a se acumular, pele menos enrugada.",
    bodyChanges: "Cabelo da mãe volumoso e brilhante.",
    symptoms: "Hemorroidas ou constipação, ronco.",
    tips: "Durma com um travesseiro extra para elevar a cabeça.",
    weeklyChecklist: ["Planejar ensaio de gestante", "Beber muita água"]
  },
  {
    week: 26,
    babySize: "Alface",
    development: "Olhos começam a abrir! Ele pode piscar.",
    bodyChanges: "Dor nas costelas (útero subindo).",
    symptoms: "Dificuldade para dormir, azia intensa.",
    tips: "Evite comer muito perto da hora de dormir.",
    weeklyChecklist: ["Escolher pediatra", "Conversar com a Doula"]
  },
  {
    week: 27,
    babySize: "Nabo",
    development: "Cérebro muito ativo. Ele sonha!",
    bodyChanges: "Fim do segundo trimestre.",
    symptoms: "Cãibras, inchaço, falta de ar leve.",
    tips: "Faça pausas frequentes se trabalha sentada.",
    weeklyChecklist: ["Montar o berço", "Preparar a mala da maternidade (básico)"]
  },
  {
    week: 28,
    babySize: "Berinjela",
    development: "Pode abrir e fechar os olhos e virar a cabeça em direção à luz.",
    bodyChanges: "Início do 3º trimestre! Barriga pesada.",
    symptoms: "Ciático (dor no bumbum/perna), cansaço voltando.",
    tips: "Massagens ou compressa morna ajudam na dor.",
    weeklyChecklist: ["Tomar vacina DTPA (consultar médico)", "Contagem de chutes diária"]
  },
  {
    week: 29,
    babySize: "Abóbora Menina",
    development: "Ossos totalmente desenvolvidos, mas ainda moles.",
    bodyChanges: "Varizes podem incomodar.",
    symptoms: "Vontade frequente de urinar (de novo), azia.",
    tips: "Use meias de compressão se necessário.",
    weeklyChecklist: ["Lavar itens de cama do bebê", "Estocar fraldas"]
  },
  {
    week: 30,
    babySize: "Repolho",
    development: "Lanugo (pelinhos) começa a cair. Cérebro com sulcos.",
    bodyChanges: "Mudança no caminhar (marcha de ganso).",
    symptoms: "Fadiga, pés inchados, falta de ar.",
    tips: "Peça ajuda para tarefas domésticas.",
    weeklyChecklist: ["Treinar respiração para o parto", "Deixar documentos organizados"]
  },
  {
    week: 31,
    babySize: "Coco",
    development: "Os 5 sentidos estão funcionais. Ele reconhece sua voz.",
    bodyChanges: "Colostro (pré-leite) pode vazar dos seios.",
    symptoms: "Contrações de treinamento mais frequentes.",
    tips: "Use absorventes de seios se vazar.",
    weeklyChecklist: ["Comprar absorventes de seios", "Finalizar o quarto"]
  },
  {
    week: 32,
    babySize: "Jicama",
    development: "Unhas dos pés formadas. Pratica respiração e deglutição.",
    bodyChanges: "Volume de sangue aumentou 40-50%.",
    symptoms: "Falta de ar (bebê pressiona diafragma), dor lombar.",
    tips: "Mantenha a postura correta ao sentar.",
    weeklyChecklist: ["Ultrassom do 3º Trimestre", "Lavar roupas de cama da mãe"]
  },
  {
    week: 33,
    babySize: "Abacaxi",
    development: "Sistema imunológico recebendo anticorpos da mãe.",
    bodyChanges: "Metabolismo acelerado, calor.",
    symptoms: "Insônia, dificuldade para achar posição.",
    tips: "Travesseiro de amamentação ajuda a dormir.",
    weeklyChecklist: ["Instalar cadeirinha no carro", "Fazer plano de parto"]
  },
  {
    week: 34,
    babySize: "Melão",
    development: "Testículos descem (meninos). Vernix ficando mais espesso.",
    bodyChanges: "Visão pode ficar embaçada (hormônios/fluidos).",
    symptoms: "Inchaço mãos e pés, fadiga.",
    tips: "Se o inchaço for súbito, avise o médico (pressão).",
    weeklyChecklist: ["Mala da maternidade pronta!", "Deixar refeições congeladas"]
  },
  {
    week: 35,
    babySize: "Melão Honeydew",
    development: "Rins totalmente desenvolvidos. Fígado processando resíduos.",
    bodyChanges: "Bebê pode encaixar na pelve (barriga baixa).",
    symptoms: "Pressão na bexiga, alívio na respiração (se encaixou).",
    tips: "Caminhadas leves ajudam o bebê a encaixar.",
    weeklyChecklist: ["Revisar rota para maternidade", "Higienizar carrinho e bebê conforto"]
  },
  {
    week: 36,
    babySize: "Alface Romana",
    development: "Perdendo o lanugo. Ganhando cerca de 30g por dia.",
    bodyChanges: "Consultas pré-natais passam a ser semanais.",
    symptoms: "Dor pélvica, instinto de aninhamento (arrumar tudo).",
    tips: "Não exagere na limpeza da casa.",
    weeklyChecklist: ["Consultas semanais iniciam", "Deixar telefones de emergência visíveis"]
  },
  {
    week: 37,
    babySize: "Acelga",
    development: "Considerado a termo (pode nascer a qualquer hora).",
    bodyChanges: "Tampão mucoso pode sair (geleia rosada/marrom).",
    symptoms: "Contrações mais ritmadas, diarreia (pré-parto).",
    tips: "Fique atenta aos sinais de trabalho de parto.",
    weeklyChecklist: ["Monitorar contrações", "Descansar o máximo possível"]
  },
  {
    week: 38,
    babySize: "Alho-poró",
    development: "Órgãos prontos. Cérebro e pulmões continuam amadurecendo.",
    bodyChanges: "Sensação de choque elétrico na pelve (cabeça do bebê).",
    symptoms: "Ansiedade, inchaço.",
    tips: "Mantenha a calma, está quase!",
    weeklyChecklist: ["Relaxar", "Agendar drenagem linfática (se liberado)"]
  },
  {
    week: 39,
    babySize: "Melancia Pequena",
    development: "Pele nova se formando sob a antiga. Pulmões produzem surfactante.",
    bodyChanges: "Colo do útero apagando e dilatando.",
    symptoms: "Contrações irregulares, rompimento da bolsa (pode ocorrer).",
    tips: "Cronometre as contrações: 5-1-1 (A cada 5 min, duram 1 min, por 1 hora).",
    weeklyChecklist: ["Ficar atenta à movimentação fetal", "Últimos preparativos"]
  },
  {
    week: 40,
    babySize: "Abóbora Moranga",
    development: "Pronto para conhecer o mundo! Ossos do crânio flexíveis para o parto.",
    bodyChanges: "Data prevista do parto!",
    symptoms: "Ansiedade extrema, desconforto total.",
    tips: "Caminhar, namorar e comida apimentada (dizem que ajuda).",
    weeklyChecklist: ["Ter paciência", "Ir para a maternidade na hora certa"]
  },
  {
    week: 41,
    babySize: "Jaca",
    development: "Pós-termo. Monitoramento constante do líquido amniótico.",
    bodyChanges: "Indução pode ser discutida.",
    symptoms: "Cansaço físico e mental.",
    tips: "Confie no seu corpo e na sua equipe.",
    weeklyChecklist: ["Monitoramento fetal frequente", "Conversar sobre indução"]
  },
  {
    week: 42,
    babySize: "Melancia Grande",
    development: "Pele pode estar ressecada ao nascer. Unhas compridas.",
    bodyChanges: "O parto vai acontecer, de um jeito ou de outro!",
    symptoms: "Expectativa máxima.",
    tips: "Respire fundo, você vai conhecer o amor da sua vida.",
    weeklyChecklist: ["Conhecer seu bebê!", "Aproveitar o momento"]
  }
];

const generateStaticWeeks = (): WeekInfo[] => {
  // Use the detailed data source
  return WEEKS_DATA_SOURCE.map(weekData => ({
    week: weekData.week || 0,
    babySize: weekData.babySize || "Tamanho Surpresa",
    development: weekData.development || "Seu bebê está crescendo.",
    bodyChanges: weekData.bodyChanges || "Seu corpo está mudando.",
    symptoms: weekData.symptoms || "Sintomas variados.",
    tips: weekData.tips || "Cuide-se bem.",
    recommendedProductId: '',
    weeklyChecklist: weekData.weeklyChecklist || ["Beber água", "Descansar"]
  }));
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

export const registerUser = async (username: string, password: string) => {
  const users = getAuthUsers();
  if (users.find(u => u.username === username)) {
    return { success: false, message: 'Usuário já existe' };
  }
  const passwordHash = await hashPassword(password);
  const newUser: UserAccount = { id: Date.now().toString(), username, passwordHash, createdAt: Date.now() };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
  
  // Auto login
  const token = Math.random().toString(36).substring(2);
  const session: AuthSession = { username, token, expiresAt: Date.now() + 1000 * 60 * 60 * 24 };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  
  // Update local UserSettings with name
  const settings = getUserSettings();
  settings.userName = username;
  saveUserSettings(settings);

  return { success: true };
};

export const loginUser = async (username: string, password: string) => {
  const users = getAuthUsers();
  const user = users.find(u => u.username === username);
  if (!user) return { success: false, message: 'Usuário não encontrado' };
  
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { success: false, message: 'Senha incorreta' };

  const token = Math.random().toString(36).substring(2);
  const session: AuthSession = { username, token, expiresAt: Date.now() + 1000 * 60 * 60 * 24 };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

  // Sync settings
  const settings = getUserSettings();
  settings.userName = username;
  saveUserSettings(settings);

  return { success: true };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
};

export const getSession = (): AuthSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!data) return null;
  const session: AuthSession = JSON.parse(data);
  if (session.expiresAt < Date.now()) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    return null;
  }
  return session;
};

// --- DATA ACCESS ---

export const initStorage = () => {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
  
  if (currentVersion !== DATA_VERSION) {
    // Only initialize if keys don't exist to PREVENT OVERWRITING user edits
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKLIST_DEF)) {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST_DEF, JSON.stringify(INITIAL_CHECKLIST));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
       localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
      localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify([]));
    }

    // UPDATED: Now checks if WEEKS exists before writing. 
    // This ensures AI-generated or Admin-edited week info is NOT lost on update.
    if (!localStorage.getItem(STORAGE_KEYS.WEEKS)) {
      localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(STATIC_WEEKS_DB));
    }
    
    // Config migration - keeps existing config but ensures structure
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const config = savedConfig ? { ...INITIAL_CONFIG, ...JSON.parse(savedConfig) } : INITIAL_CONFIG;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
  }
};

export const getProducts = (): Product[] => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

// --- MARKETPLACE FUNCTIONS ---
export const getMarketplaceProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MARKETPLACE);
  return data ? JSON.parse(data) : [];
};

export const saveMarketplaceProduct = (product: Product) => {
  const products = getMarketplaceProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(products));
  return products;
};

export const deleteMarketplaceProduct = (id: string) => {
  const products = getMarketplaceProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(products));
  return products;
}

export const getChecklistDefinitions = (): ChecklistItem[] => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLIST_DEF) || '[]');
};

export const saveChecklistDefinitions = (items: ChecklistItem[]) => {
  localStorage.setItem(STORAGE_KEYS.CHECKLIST_DEF, JSON.stringify(items));
};

export const getWeeksData = (): WeekInfo[] => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKS) || '[]');
};

export const saveWeeksData = (weeks: WeekInfo[]) => {
  localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));
};

export const getConfig = (): AppConfig => {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}');
};

export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// --- USER SETTINGS ---
const DEFAULT_USER: UserSettings = {
  dueDate: null,
  nameFavorites: [],
  checklistProgress: [],
  weeklyTasksCompleted: [],
  journalEntries: [],
  kickSessions: [],
  contractions: []
};

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  return data ? { ...DEFAULT_USER, ...JSON.parse(data) } : DEFAULT_USER;
};

export const saveUserSettings = (settings: UserSettings) => {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
};

export const toggleFavoriteName = (name: NameMeaning) => {
  const user = getUserSettings();
  const exists = user.nameFavorites.some(n => n.name === name.name);
  if (exists) {
    user.nameFavorites = user.nameFavorites.filter(n => n.name !== name.name);
  } else {
    user.nameFavorites.push(name);
  }
  saveUserSettings(user);
};

export const toggleChecklistItem = (itemId: string) => {
  const user = getUserSettings();
  if (user.checklistProgress.includes(itemId)) {
    user.checklistProgress = user.checklistProgress.filter(id => id !== itemId);
  } else {
    user.checklistProgress.push(itemId);
  }
  saveUserSettings(user);
};

export const toggleWeeklyTask = (taskKey: string) => {
  const user = getUserSettings();
  const current = user.weeklyTasksCompleted || [];
  if (current.includes(taskKey)) {
    user.weeklyTasksCompleted = current.filter(k => k !== taskKey);
  } else {
    user.weeklyTasksCompleted = [...current, taskKey];
  }
  saveUserSettings(user);
}

// --- JOURNAL & TOOLS ---
export const addJournalEntry = (entry: JournalEntry) => {
  const user = getUserSettings();
  const entries = user.journalEntries || [];
  user.journalEntries = [entry, ...entries];
  saveUserSettings(user);
}

export const deleteJournalEntry = (id: string) => {
  const user = getUserSettings();
  user.journalEntries = user.journalEntries.filter(e => e.id !== id);
  saveUserSettings(user);
}

export const saveKickSession = (session: KickSession) => {
  const user = getUserSettings();
  const sessions = user.kickSessions || [];
  user.kickSessions = [session, ...sessions];
  saveUserSettings(user);
}

export const saveContractions = (contractions: Contraction[]) => {
  const user = getUserSettings();
  user.contractions = contractions;
  saveUserSettings(user);
}

// --- AI USAGE LIMITS ---
interface AiUsage {
  date: string;
  count: number;
}

const MAX_DAILY_REQUESTS = 50; // Increased to 50 for testing, was 3

export const getAiUsageStatus = () => {
  const today = new Date().toDateString();
  const data = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
  const usage: AiUsage = data ? JSON.parse(data) : { date: today, count: 0 };

  if (usage.date !== today) {
    return { count: 0, remaining: MAX_DAILY_REQUESTS, isBlocked: false };
  }

  return {
    count: usage.count,
    remaining: Math.max(0, MAX_DAILY_REQUESTS - usage.count),
    isBlocked: usage.count >= MAX_DAILY_REQUESTS
  };
};

export const incrementAiUsage = () => {
  const today = new Date().toDateString();
  const current = getAiUsageStatus();
  
  if (current.isBlocked) return current;

  const newCount = current.count + 1;
  const usage: AiUsage = { date: today, count: newCount };
  localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(usage));
  
  return {
    count: newCount,
    remaining: Math.max(0, MAX_DAILY_REQUESTS - newCount),
    isBlocked: newCount >= MAX_DAILY_REQUESTS
  };
};

// --- SOCIAL NETWORK LOGIC ---
export const getPosts = (): Post[] => {
  const data = localStorage.getItem(STORAGE_KEYS.POSTS);
  return data ? JSON.parse(data) : INITIAL_POSTS;
};

export const savePost = (post: Post) => {
  const posts = getPosts();
  const newPosts = [post, ...posts];
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(newPosts));
  return newPosts;
};

export const deletePost = (postId: string) => {
   const posts = getPosts().filter(p => p.id !== postId);
   localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
   return posts;
}

export const toggleLikePost = (postId: string) => {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex >= 0) {
    const post = posts[postIndex];
    if (post.likedByMe) {
      post.likes--;
      post.likedByMe = false;
    } else {
      post.likes++;
      post.likedByMe = true;
    }
    posts[postIndex] = post;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }
  return posts;
};

export const addCommentToPost = (postId: string, comment: Comment) => {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex >= 0) {
    posts[postIndex].comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }
  return posts;
};

// --- UTILS ---
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
