
import React, { useState, useEffect } from 'react';
import { Lock, Save, Plus, Trash, Edit, X, ArrowLeft, Check, ShoppingBag, ListTodo, Calendar, Settings, MessageCircle, Sparkles, Loader2, Users, Key, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getProducts, saveProducts, 
  getChecklistDefinitions, saveChecklistDefinitions,
  getWeeksData, saveWeeksData,
  getConfig, saveConfig,
  getPosts, deletePost,
  fileToBase64
} from '../services/storage';
import { generateWeeklyInfo } from '../services/ai';
import { Product, ChecklistItem, WeekInfo, AppConfig, Post } from '../types';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [weeks, setWeeks] = useState<WeekInfo[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistItem | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [newChecklistTask, setNewChecklistTask] = useState('');
  
  // Loading States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load Data
  useEffect(() => {
    if (isAuthenticated) {
      setProducts(getProducts());
      setChecklist(getChecklistDefinitions());
      setWeeks(getWeeksData());
      setConfig(getConfig());
      setPosts(getPosts());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mmanuelaprado' && password === 'mp222426') {
      setIsAuthenticated(true);
    } else {
      alert('Credenciais inválidas');
    }
  };

  // --- Helpers ---
  const saveData = async () => {
    setIsSaving(true);
    try {
      // Force a small delay to ensure UI updates and simulate backend transaction
      await new Promise(resolve => setTimeout(resolve, 500));

      saveProducts(products);
      saveChecklistDefinitions(checklist);
      saveWeeksData(weeks); // Critical: Saves the current 'weeks' state to persistence
      if (config) saveConfig(config);
      
      // Dispatch custom event to update UI components immediately (Tracker, Layout, etc)
      window.dispatchEvent(new Event('local-data-change'));
      
      alert('✅ Dados salvos com sucesso no banco de dados!');
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Products Logic ---
  const handleAddProduct = () => {
    const newP: Product = {
      id: Date.now().toString(),
      name: 'Novo Produto',
      description: 'Descrição do produto...',
      category: 'enxoval',
      image: 'https://picsum.photos/400/400',
      shopeeLink: '',
      price: '',
      active: true,
    };
    setProducts([...products, newP]);
    setEditingProduct(newP);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleUpdateProduct = (field: keyof Product, value: any) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        handleUpdateProduct('image', base64);
      } catch (error) {
        console.error("Error uploading image", error);
        alert("Erro ao processar a imagem.");
      }
    }
  };

  const saveProductEdit = () => {
    if (!editingProduct) return;
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  // --- Checklist Logic ---
  const handleAddChecklist = () => {
    const newI: ChecklistItem = {
      id: Date.now().toString(),
      name: 'Novo Item',
      category: 'mae',
      checked: false
    };
    setChecklist([...checklist, newI]);
    setEditingChecklist(newI);
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklist(checklist.filter(i => i.id !== id));
  };

  const handleUpdateChecklist = (field: keyof ChecklistItem, value: any) => {
    if (!editingChecklist) return;
    setEditingChecklist({ ...editingChecklist, [field]: value });
  };

  const saveChecklistEdit = () => {
    if (!editingChecklist) return;
    setChecklist(checklist.map(i => i.id === editingChecklist.id ? editingChecklist : i));
    setEditingChecklist(null);
  };

  // --- Weeks Logic ---
  const currentWeekInfo = weeks.find(w => w.week === selectedWeek);

  const handleUpdateWeek = (field: keyof WeekInfo, value: any) => {
    if (!currentWeekInfo) return;
    const updated = { ...currentWeekInfo, [field]: value };
    setWeeks(weeks.map(w => w.week === selectedWeek ? updated : w));
  };

  const addWeeklyTask = () => {
    if (!newChecklistTask.trim() || !currentWeekInfo) return;
    const currentTasks = currentWeekInfo.weeklyChecklist || [];
    handleUpdateWeek('weeklyChecklist', [...currentTasks, newChecklistTask]);
    setNewChecklistTask('');
  };

  const removeWeeklyTask = (index: number) => {
    if (!currentWeekInfo?.weeklyChecklist) return;
    const newTasks = [...currentWeekInfo.weeklyChecklist];
    newTasks.splice(index, 1);
    handleUpdateWeek('weeklyChecklist', newTasks);
  };

  const handleGenerateAIContent = async () => {
    if (!currentWeekInfo) return;
    setIsGeneratingAI(true);
    try {
      // Create a simplified list of products for the AI to choose from
      const availableProducts = products.map(p => ({ id: p.id, name: p.name }));
      
      const data = await generateWeeklyInfo(selectedWeek, availableProducts);
      
      if (data) {
        const updated = { 
          ...currentWeekInfo, 
          bodyChanges: data.bodyChanges || currentWeekInfo.bodyChanges,
          symptoms: data.symptoms || currentWeekInfo.symptoms,
          tips: data.tips || currentWeekInfo.tips,
          weeklyChecklist: data.weeklyChecklist || currentWeekInfo.weeklyChecklist,
          // Only update product if AI returned a valid ID that exists in our list
          recommendedProductId: (data.recommendedProductId && products.some(p => p.id === data.recommendedProductId)) 
            ? data.recommendedProductId 
            : currentWeekInfo.recommendedProductId
        };
        
        setWeeks(weeks.map(w => w.week === selectedWeek ? updated : w));
        alert('✨ Conteúdo gerado! Clique em "Salvar Alterações da Semana" para confirmar.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar conteúdo. Verifique sua chave API.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // --- Social Moderation ---
  const handleDeletePost = (id: string) => {
    if(confirm('Tem certeza que deseja deletar este post da comunidade?')) {
       const updated = deletePost(id);
       setPosts(updated);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-lilac p-3 rounded-full">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Painel Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lilac outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lilac outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-lilac-dark text-white font-bold py-3 rounded-xl hover:bg-purple-400 transition-colors"
            >
              Entrar
            </button>
            <Link to="/" className="block text-center text-sm text-gray-400 mt-4 hover:text-lilac-dark">
              Voltar ao App
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
        activeTab === id ? 'bg-lilac-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-soft-white pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-700">Painel BabyConnect</h1>
          </div>
          <button
            onClick={saveData}
            disabled={isSaving}
            className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {isSaving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto p-4 flex gap-2 overflow-x-auto no-scrollbar">
        <TabButton id="dashboard" icon={Settings} label="Geral" />
        <TabButton id="products" icon={ShoppingBag} label="Lojinha" />
        <TabButton id="checklist" icon={ListTodo} label="Kit Maternidade" />
        <TabButton id="weeks" icon={Calendar} label="Semanas" />
        <TabButton id="doula" icon={MessageCircle} label="Doula AI" />
        <TabButton id="community" icon={Users} label="Comunidade" />
      </div>

      <main className="max-w-6xl mx-auto p-4">
        {/* === CONFIG / DASHBOARD === */}
        {activeTab === 'dashboard' && config && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-700">Identidade Visual e Configurações</h2>
            
            {/* API Key Section */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-6">
               <h3 className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                 <Key className="w-5 h-5" /> Configuração da IA (Importante)
               </h3>
               <p className="text-sm text-orange-800 mb-3">
                 Para que a Doula AI funcione corretamente após o deploy (Vercel), cole sua Gemini API Key abaixo. Ela será salva de forma segura no navegador.
               </p>
               <div className="relative">
                 <input 
                   type={showApiKey ? "text" : "password"}
                   value={config.apiKey || ''}
                   onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                   placeholder="Cole sua chave aqui (começa com AIza...)"
                   className="w-full p-3 pr-12 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-400"
                 />
                 <button 
                   onClick={() => setShowApiKey(!showApiKey)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 font-bold text-xs"
                 >
                   {showApiKey ? "Ocultar" : "Mostrar"}
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Nome do Aplicativo</label>
                <input 
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac"
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Texto do Rodapé</label>
                <input 
                  value={config.footerText}
                  onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">URL do Logotipo</label>
                <input 
                  value={config.logoUrl}
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">URL do Banner Principal</label>
                <input 
                  value={config.bannerUrl}
                  onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                   placeholder="https://exemplo.com/banner.jpg"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac"
                />
              </div>
               <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Link do Instagram (Rodapé)</label>
                <input 
                  value={config.socialLink}
                  onChange={(e) => setConfig({ ...config, socialLink: e.target.value })}
                   placeholder="https://instagram.com/seuperfil"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1 text-green-600 flex items-center gap-1">
                  <Users className="w-4 h-4" /> Link do Grupo WhatsApp
                </label>
                <input 
                  value={config.whatsappGroupLink || ''}
                  onChange={(e) => setConfig({ ...config, whatsappGroupLink: e.target.value })}
                   placeholder="https://chat.whatsapp.com/..."
                  className="w-full p-3 rounded-xl border border-green-200 outline-none focus:ring-2 focus:ring-green-400 bg-green-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* === DOULA AI CONFIG === */}
        {activeTab === 'doula' && config && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-700">Configuração da Doula AI</h2>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Instruções do Sistema (Prompt)</label>
              <p className="text-xs text-gray-400 mb-2">Defina como a IA deve se comportar, o tom de voz e o que ela pode ou não responder.</p>
              <textarea 
                value={config.doulaSystemInstruction}
                onChange={(e) => setConfig({ ...config, doulaSystemInstruction: e.target.value })}
                className="w-full h-64 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-lilac text-sm leading-relaxed font-mono"
              />
            </div>
          </div>
        )}

        {/* === COMMUNITY MODERATION === */}
        {activeTab === 'community' && (
           <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-700">Moderação de Comunidade</h2>
              <p className="text-sm text-gray-500">Gerencie os posts da rede social. Exclua conteúdo impróprio.</p>
              
              <div className="grid grid-cols-1 gap-4">
                 {posts.map(post => (
                   <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                      {post.image ? (
                        <img src={post.image} className="w-24 h-24 object-cover rounded-xl shrink-0 bg-gray-100" />
                      ) : (
                        <div className="w-24 h-24 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center">
                           <MessageCircle className="text-gray-300 w-8 h-8" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <div>
                               <h3 className="font-bold text-gray-700">{post.authorName} <span className="text-xs text-gray-400 font-normal ml-2">({new Date(post.timestamp).toLocaleString()})</span></h3>
                               <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                            </div>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                              title="Excluir Post"
                            >
                               <Trash className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="flex gap-4 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {post.likes} likes</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments.length} comentários</span>
                         </div>
                      </div>
                   </div>
                 ))}

                 {posts.length === 0 && (
                   <div className="text-center py-10 text-gray-400">
                     <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                     <p>Nenhum post na comunidade.</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {/* === PRODUCTS (LOJINHA) === */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">Gerenciar Produtos</h2>
              <button onClick={handleAddProduct} className="bg-lilac text-lilac-dark px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-lilac-dark hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative">
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                    {p.price && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">{p.price}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h3 className="font-bold text-gray-700 truncate">{p.name}</h3>
                       <div className="flex gap-1">
                          <button onClick={() => setEditingProduct(p)} className="p-1 text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Editar Produto</h3>
                  <div className="space-y-4">
                    <input className="w-full border p-2 rounded-xl" placeholder="Nome" value={editingProduct.name} onChange={e => handleUpdateProduct('name', e.target.value)} />
                    <textarea className="w-full border p-2 rounded-xl" placeholder="Descrição" value={editingProduct.description} onChange={e => handleUpdateProduct('description', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                       <input className="w-full border p-2 rounded-xl" placeholder="Preço (ex: R$ 50,00)" value={editingProduct.price || ''} onChange={e => handleUpdateProduct('price', e.target.value)} />
                       <select className="w-full border p-2 rounded-xl" value={editingProduct.category} onChange={e => handleUpdateProduct('category', e.target.value)}>
                        <option value="amamentacao">Amamentação</option>
                        <option value="enxoval">Enxoval</option>
                        <option value="essenciais">Essenciais</option>
                        <option value="mae">Mãe</option>
                        <option value="bebe">Bebê</option>
                      </select>
                    </div>

                    {/* Image Upload Area */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                       <label className="block text-sm font-bold text-gray-500 mb-2">Imagem do Produto</label>
                       <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-300">
                             {editingProduct.image ? (
                               <img src={editingProduct.image} className="w-full h-full object-cover" />
                             ) : (
                               <ImageIcon className="text-gray-400 w-8 h-8" />
                             )}
                          </div>
                          <div className="flex-1 space-y-2">
                             <input 
                               className="w-full border p-2 rounded-xl text-sm" 
                               placeholder="Ou cole a URL da imagem aqui..." 
                               value={editingProduct.image} 
                               onChange={e => handleUpdateProduct('image', e.target.value)} 
                             />
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">ou</span>
                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                                   <Upload className="w-3 h-3" /> Fazer Upload
                                   <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                                </label>
                             </div>
                          </div>
                       </div>
                    </div>

                    <input className="w-full border p-2 rounded-xl" placeholder="Link de Compra" value={editingProduct.shopeeLink} onChange={e => handleUpdateProduct('shopeeLink', e.target.value)} />
                    
                    <div className="flex items-center gap-2">
                       <input type="checkbox" checked={editingProduct.active} onChange={e => handleUpdateProduct('active', e.target.checked)} />
                       <label>Produto Ativo</label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500">Cancelar</button>
                    <button onClick={saveProductEdit} className="flex-1 bg-lilac-dark text-white py-3 rounded-xl font-bold">Salvar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === CHECKLIST (KIT MATERNIDADE) === */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">Gerenciar Kit Maternidade</h2>
              <button onClick={handleAddChecklist} className="bg-lilac text-lilac-dark px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-lilac-dark hover:text-white transition-colors">
                <Plus className="w-4 h-4" /> Novo Item
              </button>
            </div>
            
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg text-xs font-bold text-gray-500 uppercase w-24 text-center">{item.category}</div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                   </div>
                   <div className="flex gap-1">
                      <button onClick={() => setEditingChecklist(item)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteChecklist(item.id)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
            </div>

            {/* Checklist Edit Modal */}
            {editingChecklist && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl p-6 w-full max-w-md">
                 <h3 className="text-xl font-bold mb-4">Editar Item</h3>
                 <div className="space-y-4">
                   <input className="w-full border p-2 rounded-xl" placeholder="Nome do item" value={editingChecklist.name} onChange={e => handleUpdateChecklist('name', e.target.value)} />
                   <select className="w-full border p-2 rounded-xl" value={editingChecklist.category} onChange={e => handleUpdateChecklist('category', e.target.value)}>
                     <option value="mae">Mãe</option>
                     <option value="bebe">Bebê</option>
                     <option value="acompanhante">Acompanhante</option>
                     <option value="documentos">Documentos</option>
                   </select>
                   <input className="w-full border p-2 rounded-xl" placeholder="Link Shopee (Opcional)" value={editingChecklist.shopeeLink || ''} onChange={e => handleUpdateChecklist('shopeeLink', e.target.value)} />
                 </div>
                 <div className="flex gap-2 mt-6">
                   <button onClick={() => setEditingChecklist(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500">Cancelar</button>
                   <button onClick={saveChecklistEdit} className="flex-1 bg-lilac-dark text-white py-3 rounded-xl font-bold">Salvar</button>
                 </div>
               </div>
             </div>
            )}
          </div>
        )}

        {/* === WEEKS (ACOMPANHAMENTO) === */}
        {activeTab === 'weeks' && currentWeekInfo && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex items-center gap-4">
                 <span className="font-bold text-gray-700">Semana:</span>
                 <select 
                  value={selectedWeek} 
                  onChange={e => setSelectedWeek(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-bold text-lilac-dark outline-none"
                 >
                   {Array.from({length: 42}, (_, i) => i + 1).map(w => (
                     <option key={w} value={w}>Semana {w}</option>
                   ))}
                 </select>
               </div>
               
               <button 
                onClick={handleGenerateAIContent}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
               >
                 {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 Gerar Texto com IA
               </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Tamanho do Bebê (Frase fofa)</label>
                    <input className="w-full border p-2 rounded-xl" value={currentWeekInfo.babySize} onChange={e => handleUpdateWeek('babySize', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center justify-between">
                      Mudanças no Corpo
                      <span className="text-[10px] text-purple-400 font-normal">Edite ou gere com IA acima</span>
                    </label>
                    <textarea rows={5} className="w-full border p-2 rounded-xl text-sm" value={currentWeekInfo.bodyChanges} onChange={e => handleUpdateWeek('bodyChanges', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center justify-between">
                      Sintomas Comuns
                       <span className="text-[10px] text-purple-400 font-normal">Edite ou gere com IA acima</span>
                    </label>
                    <textarea rows={5} className="w-full border p-2 rounded-xl text-sm" value={currentWeekInfo.symptoms} onChange={e => handleUpdateWeek('symptoms', e.target.value)} />
                  </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center justify-between">
                      Dica / Aviso
                       <span className="text-[10px] text-purple-400 font-normal">Edite ou gere com IA acima</span>
                    </label>
                    <textarea rows={3} className="w-full border p-2 rounded-xl" value={currentWeekInfo.tips} onChange={e => handleUpdateWeek('tips', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 flex items-center justify-between">
                      Produto Recomendado
                      <span className="text-[10px] text-purple-400 font-normal">A IA pode sugerir se houver estoque</span>
                    </label>
                    <select 
                      className="w-full border p-2 rounded-xl"
                      value={currentWeekInfo.recommendedProductId || ''}
                      onChange={e => handleUpdateWeek('recommendedProductId', e.target.value)}
                    >
                       <option value="">Nenhum</option>
                       {products.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                    </select>
                  </div>
               </div>
               
               {/* Weekly Checklist Editor */}
               <div className="md:col-span-2 border-t pt-4">
                 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                   <ListTodo className="w-4 h-4" /> Checklist da Semana (Tarefas sugeridas)
                 </label>
                 
                 <div className="flex gap-2 mb-3">
                   <input 
                      className="flex-1 border p-2 rounded-xl" 
                      placeholder="Ex: Beber 2L de água, Agendar ultrassom..." 
                      value={newChecklistTask}
                      onChange={e => setNewChecklistTask(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addWeeklyTask()}
                   />
                   <button onClick={addWeeklyTask} className="bg-lilac text-lilac-dark px-4 rounded-xl font-bold hover:bg-lilac-dark hover:text-white transition-colors">
                     Adicionar
                   </button>
                 </div>

                 <div className="space-y-2">
                   {currentWeekInfo.weeklyChecklist?.map((task, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                       <span className="text-sm text-gray-600">{task}</span>
                       <button onClick={() => removeWeeklyTask(idx)} className="text-red-400 hover:text-red-600">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                   {(!currentWeekInfo.weeklyChecklist || currentWeekInfo.weeklyChecklist.length === 0) && (
                     <p className="text-gray-400 text-sm italic">Nenhuma tarefa cadastrada para esta semana.</p>
                   )}
                 </div>
               </div>
               
               {/* Explicit Save Button for Weeks */}
               <div className="md:col-span-2 flex justify-end mt-4">
                  <button 
                    onClick={saveData}
                    disabled={isSaving}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-green-600 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                     {isSaving ? 'Salvando...' : 'Salvar Alterações da Semana'}
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
