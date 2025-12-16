
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Image as ImageIcon, Sparkles, User, MoreHorizontal, Bookmark, X, Settings, Camera, Check, Bell, Lock, LogIn, UserPlus, Eye, EyeOff, LogOut, ShoppingBag, Trash, Activity, Clock } from 'lucide-react';
import { getPosts, savePost, toggleLikePost, addCommentToPost, getUserSettings, saveUserSettings, fileToBase64, getSession, loginUser, registerUser, logoutUser, getMarketplaceProducts, deleteMarketplaceProduct } from '../services/storage';
import { Post, Comment, UserSettings, Product } from '../types';
import AdBanner from '../components/AdBanner';

const Social: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // App State
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  
  // Create Post State
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [myProducts, setMyProducts] = useState<Product[]>([]); // Store items
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // User Info for Context
  const [myWeek, setMyWeek] = useState(0);

  // Stories State
  const [viewingStory, setViewingStory] = useState<string | null>(null);

  useEffect(() => {
    // Check Session
    const session = getSession();
    if (session) {
      setIsAuthenticated(true);
      setPosts(getPosts());
      loadUserData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        setIsAuthenticated(true);
        loadUserData(); // Refresh user settings in memory
        setPosts(getPosts());
      } else {
        setAuthError(result.message);
      }
    } catch (err) {
      setAuthError('Erro ao conectar. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const result = await registerUser(username, password);
      if (result.success) {
        setIsAuthenticated(true);
        loadUserData();
        setPosts(getPosts());
      } else {
        setAuthError(result.message);
      }
    } catch (err) {
      setAuthError('Erro ao criar conta. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Story Timer
  useEffect(() => {
    if (viewingStory) {
      const timer = setTimeout(() => {
        setViewingStory(null);
      }, 5000); // 5 seconds per story
      return () => clearTimeout(timer);
    }
  }, [viewingStory]);

  const loadUserData = () => {
    const user = getUserSettings();
    setUserSettings(user);
    
    if (user.dueDate) {
      const today = new Date();
      const due = new Date(user.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const week = 40 - Math.floor(diffDays / 7);
      setMyWeek(week > 0 && week <= 42 ? week : 0);
    }
  };

  const handleCreatePost = () => {
    if (!newContent.trim() && !newImage) return;

    const post: Post = {
      id: Date.now().toString(),
      authorName: userSettings.userName || 'Mamãe',
      authorWeek: myWeek || 0,
      authorPhoto: userSettings.userPhoto,
      content: newContent,
      image: newImage || undefined,
      likes: 0,
      likedByMe: false,
      comments: [],
      timestamp: Date.now()
    };

    const updated = savePost(post);
    setPosts(updated);
    setNewContent('');
    setNewImage('');
    setShowCreate(false);
  };

  const handleLike = (id: string) => {
    const updated = toggleLikePost(id);
    setPosts(updated);
  };

  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const handleComment = (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      authorName: userSettings.userName || 'Mamãe',
      text: text,
      timestamp: Date.now()
    };

    const updated = addCommentToPost(postId, comment);
    setPosts(updated);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProfile = false) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        if (isProfile) {
          setEditPhoto(base64);
        } else {
          setNewImage(base64);
        }
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  const openProfile = () => {
    setEditName(userSettings.userName || 'Mamãe');
    setEditBio(userSettings.userBio || '');
    setEditPhoto(userSettings.userPhoto || '');
    
    // Load my products
    const allProducts = getMarketplaceProducts();
    const mine = allProducts.filter(p => p.ownerName === userSettings.userName);
    setMyProducts(mine);
    
    setShowProfileModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    if(confirm('Tem certeza que deseja remover este produto?')) {
      const updatedAll = deleteMarketplaceProduct(id);
      const mine = updatedAll.filter(p => p.ownerName === userSettings.userName);
      setMyProducts(mine);
    }
  };

  const saveProfile = () => {
    const updated = {
      ...userSettings,
      userName: editName,
      userBio: editBio,
      userPhoto: editPhoto
    };
    saveUserSettings(updated);
    setUserSettings(updated);
    setShowProfileModal(false);
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Fake Stories Data
  const stories = [
    { id: 'me', name: 'Seu Story', img: userSettings.userPhoto, isAdd: true },
    { id: '1', name: 'Dicas', img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80', isAdd: false, contentImg: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=600' },
    { id: '2', name: 'Parto', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80', isAdd: false, contentImg: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600' },
    { id: '3', name: 'Enxoval', img: 'https://images.unsplash.com/photo-1522771753035-4a50423a5a63?w=400&q=80', isAdd: false, contentImg: 'https://images.unsplash.com/photo-1522771753035-4a50423a5a63?auto=format&fit=crop&q=80&w=600' },
    { id: '4', name: 'Relatos', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80', isAdd: false, contentImg: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600' },
  ];

  const notifications = [
    { id: 1, text: "Ana (24 sem) curtiu sua foto", time: "2 min", read: false },
    { id: 2, text: "Dica: Hidrate-se hoje! 💧", time: "1h", read: false },
    { id: 3, text: "Mamães de 32 semanas estão postando", time: "3h", read: true },
  ];

  const currentStory = stories.find(s => s.id === viewingStory);

  // --- AUTH SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
             <div className="bg-lilac/20 p-4 rounded-full">
                <Heart className="w-10 h-10 text-lilac-dark fill-current" />
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">
            {authMode === 'login' ? 'Bem-vinda de volta!' : 'Criar Conta'}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            {authMode === 'login' 
              ? 'Entre para ver o que as mamães estão compartilhando.' 
              : 'Junte-se à nossa comunidade segura de mamães.'}
          </p>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Nome de Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Seu nome exclusivo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20 transition-all bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20 transition-all bg-gray-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lilac-dark">
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">
                 <X className="w-4 h-4" /> {authError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading || !username || !password}
              className="w-full bg-lilac-dark text-white py-3 rounded-xl font-bold hover:bg-purple-400 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-purple-200"
            >
              {authLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (authMode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
              {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {authMode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button 
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="text-lilac-dark font-bold hover:underline mt-1"
            >
              {authMode === 'login' ? 'Cadastre-se agora' : 'Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN SOCIAL FEED ---
  return (
    <div className="space-y-4 pb-20 relative animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-soft-white/95 backdrop-blur-sm z-20 py-3 px-1">
         <h2 className="text-2xl font-bold text-lilac-dark flex items-center gap-2" style={{ fontFamily: 'Grand Hotel, cursive' }}>
            Momentos <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
         </h2>
         <div className="flex gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="bg-white text-gray-600 p-2 rounded-xl shadow-sm border border-gray-100 hover:text-lilac-dark transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-fade-in overflow-hidden">
                  <div className="p-3 border-b bg-gray-50 text-xs font-bold text-gray-500">NOTIFICAÇÕES</div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                         <p className="text-sm text-gray-700">{n.text}</p>
                         <span className="text-xs text-gray-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
             onClick={() => setShowCreate(true)}
             className="bg-lilac-dark text-white p-2 rounded-xl shadow-md hover:bg-purple-400 transition-all"
           >
             <Camera className="w-5 h-5" />
           </button>
           <button 
             onClick={openProfile}
             className="bg-white text-gray-600 p-2 rounded-xl shadow-sm border border-gray-100 hover:text-lilac-dark transition-all"
           >
             <User className="w-5 h-5" />
           </button>
         </div>
      </div>

      {/* Stories Bar */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
        {stories.map(story => (
          <div 
            key={story.id} 
            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
            onClick={() => {
              if (story.isAdd) {
                // Add story logic here in future
              } else {
                setViewingStory(story.id);
              }
            }}
          >
            <div className={`w-16 h-16 rounded-full p-[3px] ${story.isAdd ? 'border-2 border-dashed border-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'}`}>
              <div className="w-full h-full bg-white rounded-full p-[2px] overflow-hidden relative">
                {story.img ? (
                  <img src={story.img} alt={story.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                {story.isAdd && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="bg-blue-500 text-white rounded-full p-1 border-2 border-white translate-x-4 translate-y-4">
                      <div className="w-2 h-2 flex items-center justify-center font-bold text-[10px]">+</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{story.name}</span>
          </div>
        ))}
      </div>

      <AdBanner />

      {/* Story Viewer Overlay */}
      {viewingStory && currentStory && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 p-2 z-20 flex gap-1">
            <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
               <div className="h-full bg-white animate-progress w-full" style={{ animationDuration: '5s' }}></div>
            </div>
          </div>
          
          {/* Header */}
          <div className="absolute top-4 left-0 right-0 p-4 z-20 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
               <img src={currentStory.img} className="w-8 h-8 rounded-full border border-white" />
               <span className="font-bold text-sm shadow-black drop-shadow-md">{currentStory.name}</span>
               <span className="text-xs opacity-80">2h</span>
            </div>
            <button onClick={() => setViewingStory(null)}>
              <X className="w-8 h-8 drop-shadow-md" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center bg-gray-900">
             {currentStory.contentImg ? (
                <img src={currentStory.contentImg} className="w-full max-h-full object-contain" />
             ) : (
                <div className="text-white text-center">Imagem indisponível</div>
             )}
          </div>

          {/* Reply Area (Fake) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/50 to-transparent">
             <div className="border border-white/50 rounded-full p-3 text-white/70 text-sm">
                Enviar mensagem...
             </div>
          </div>
        </div>
      )}

      {/* Create Post Modal Overlay */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
             <div className="p-4 border-b flex justify-between items-center">
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-800">Cancelar</button>
                <h3 className="font-bold text-gray-700">Nova Publicação</h3>
                <button 
                  onClick={handleCreatePost} 
                  disabled={(!newContent.trim() && !newImage)}
                  className="text-lilac-dark font-bold disabled:opacity-50"
                >
                  Compartilhar
                </button>
             </div>
             
             <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {userSettings.userPhoto ? (
                    <img src={userSettings.userPhoto} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-white bg-baby-pink" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="No que você está pensando, mamãe?"
                    className="w-full h-24 text-sm outline-none resize-none placeholder-gray-400"
                    autoFocus
                  />
                  
                  {newImage && (
                    <div className="relative rounded-xl overflow-hidden mt-2 border border-gray-100">
                      <img src={newImage} alt="Preview" className="w-full max-h-60 object-cover" />
                      <button 
                        onClick={() => setNewImage('')} 
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
             </div>

             <div className="p-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">Adicionar à publicação</span>
                <div className="flex gap-2">
                   <button onClick={() => fileInputRef.current?.click()} className="text-green-500 p-2 hover:bg-green-50 rounded-full transition-colors">
                      <ImageIcon className="w-6 h-6" />
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={(e) => handleImageUpload(e)} 
                   />
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-gray-400">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">Editar Perfil</h3>
              
              <div className="flex flex-col items-center mb-6 relative">
                 <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg cursor-pointer group" onClick={() => profileFileInputRef.current?.click()}>
                    {editPhoto ? (
                      <img src={editPhoto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-lilac/20 text-lilac-dark">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                       <Camera className="w-6 h-6 text-white" />
                    </div>
                 </div>
                 <input 
                   type="file" 
                   ref={profileFileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={(e) => handleImageUpload(e, true)} 
                 />
                 <p className="text-xs text-lilac-dark font-bold mt-2">Alterar foto</p>
              </div>

              <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Nome</label>
                   <input 
                     value={editName}
                     readOnly
                     className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                     title="O nome de usuário não pode ser alterado"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
                   <input 
                     value={editBio}
                     onChange={e => setEditBio(e.target.value)}
                     className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-lilac"
                     placeholder="Uma frase curta sobre você..."
                     maxLength={50}
                   />
                 </div>

                 {/* Meus Desapegos Section */}
                 <div className="mt-4 border-t pt-4">
                   <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                     <ShoppingBag className="w-4 h-4 text-pink-500"/> Meus Desapegos
                   </h4>
                   <div className="space-y-2">
                     {myProducts.length > 0 ? (
                       myProducts.map(p => (
                         <div key={p.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0">
                               <img src={p.image} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-gray-700 truncate">{p.name}</p>
                               <p className="text-[10px] text-gray-500">{p.price}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              title="Excluir Produto"
                            >
                               <Trash className="w-4 h-4" />
                            </button>
                         </div>
                       ))
                     ) : (
                       <p className="text-xs text-gray-400 italic text-center py-2">Você ainda não anunciou nada.</p>
                     )}
                   </div>
                 </div>

                 <button 
                   onClick={saveProfile}
                   className="w-full bg-lilac-dark text-white py-3 rounded-xl font-bold hover:bg-purple-400 transition-colors mt-2"
                 >
                   Salvar Alterações
                 </button>
                 <button 
                   onClick={handleLogout}
                   className="w-full bg-red-50 text-red-500 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                 >
                   <LogOut className="w-4 h-4" /> Sair
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Post Header */}
            <div className="p-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-gradient-to-tr from-lilac to-baby-pink rounded-full p-[2px]">
                    <div className="bg-white w-full h-full rounded-full overflow-hidden">
                       {post.authorPhoto ? (
                         <img src={post.authorPhoto} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                           <User className="w-4 h-4 text-gray-300" />
                         </div>
                       )}
                    </div>
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{post.authorName}</h3>
                    <div className="flex items-center gap-1">
                      {post.authorWeek > 0 && <span className="text-[10px] text-lilac-dark bg-lilac/10 px-1.5 py-0.5 rounded-full font-bold">🤰 {post.authorWeek} sem</span>}
                      <span className="text-[10px] text-gray-400">• {getTimeAgo(post.timestamp)}</span>
                    </div>
                 </div>
               </div>
               <button className="text-gray-300">
                 <MoreHorizontal className="w-5 h-5" />
               </button>
            </div>

            {/* Content */}
            {post.image && (
              <div className="w-full bg-gray-50 relative group">
                 <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-[500px]" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
              </div>
            )}
            
            {/* Actions */}
            <div className="px-4 pt-3 flex items-center gap-4">
               <button 
                 onClick={() => handleLike(post.id)}
                 className={`flex items-center gap-1.5 transition-transform active:scale-125 ${post.likedByMe ? 'text-pink-500' : 'text-gray-700 hover:text-gray-500'}`}
               >
                  <Heart className={`w-7 h-7 ${post.likedByMe ? 'fill-current' : ''}`} strokeWidth={1.5} />
               </button>
               <button className="text-gray-700 hover:text-gray-500 transition-transform active:scale-110">
                  <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
               </button>
               <button className="text-gray-700 hover:text-gray-500 transition-transform active:scale-110">
                  <Send className="w-7 h-7 -rotate-45 -mt-1" strokeWidth={1.5} />
               </button>
               <button className="ml-auto text-gray-700 hover:text-gray-500">
                  <Bookmark className="w-7 h-7" strokeWidth={1.5} />
               </button>
            </div>

            {/* Likes Count & Text */}
            <div className="px-4 py-2">
               <p className="text-sm font-bold text-gray-800 mb-1">
                 {post.likes} curtidas
               </p>
               <div className="text-sm text-gray-800 leading-tight">
                 <span className="font-bold mr-1">{post.authorName}</span>
                 <span className="whitespace-pre-wrap">{post.content}</span>
               </div>
            </div>

            {/* Comments */}
            <div className="px-4 pb-4 space-y-3">
               {post.comments.length > 0 && (
                 <div className="space-y-1 mt-1">
                    {post.comments.slice(-3).map(comment => (
                      <div key={comment.id} className="text-sm">
                         <span className={`font-bold mr-2 ${comment.isDev ? 'text-purple-600' : 'text-gray-800'}`}>
                           {comment.authorName} {comment.isDev && <Sparkles className="w-3 h-3 inline text-purple-500" />}
                         </span>
                         <span className="text-gray-700">{comment.text}</span>
                      </div>
                    ))}
                    {post.comments.length > 3 && (
                      <button className="text-xs text-gray-400 mt-1">Ver todos os {post.comments.length} comentários</button>
                    )}
                 </div>
               )}

               {/* Add Comment Input */}
               <div className="flex gap-2 items-center mt-3">
                 <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-gray-100">
                    {userSettings.userPhoto ? (
                      <img src={userSettings.userPhoto} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-1 text-gray-400" />
                    )}
                 </div>
                 <input 
                   type="text" 
                   value={commentText[post.id] || ''}
                   onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                   placeholder="Adicione um comentário..." 
                   className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
                   onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                 />
                 {commentText[post.id] && (
                   <button onClick={() => handleComment(post.id)} className="text-blue-500 font-bold text-sm hover:text-blue-700">Publicar</button>
                 )}
               </div>
            </div>
          </div>
        ))}
        
        {/* End of Feed */}
        <div className="flex flex-col items-center justify-center py-8 text-gray-300">
           <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2">
             <Check className="w-6 h-6 text-gray-200" />
           </div>
           <p className="text-sm">Você viu tudo</p>
        </div>
      </div>
    </div>
  );
};

export default Social;
