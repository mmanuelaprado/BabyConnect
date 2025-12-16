
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Image as ImageIcon, Sparkles, Camera, X, Loader2, Trash, LogOut, AlertTriangle } from 'lucide-react';
import { 
  getPosts, 
  savePost, 
  deletePost, 
  getUserSettings, 
  syncProfile,
  getSession,
  fileToBase64
} from '../services/storage';
import { supabase, uploadImageToBucket } from '../services/supabaseClient';
import { Post, UserSettings } from '../types';
import AdBanner from '../components/AdBanner';

const Social: React.FC = () => {
  const [user, setUser] = useState<UserSettings>(getUserSettings());
  const [posts, setPosts] = useState<Post[]>([]);
  const [session, setSession] = useState<any>(null);
  
  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Create Post State
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    if (!supabase) return; // Proteção contra null
    try {
      const sess = await getSession();
      setSession(sess);
      if (sess) {
        await syncProfile();
        setUser(getUserSettings());
        loadPosts();
      }
    } catch (e) {
      console.error("Erro ao verificar sessão", e);
    }
  };

  const loadPosts = async () => {
    if (!supabase) return;
    try {
      const cloudPosts = await getPosts();
      setPosts(cloudPosts);
    } catch (e) {
      console.error("Erro ao carregar posts", e);
    }
  };

  // --- Auth Real (Supabase) ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("Erro: Supabase não configurado.");
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        alert("Conta criada! Verifique seu email para confirmar ou faça login.");
      }
      await checkSession();
    } catch (error: any) {
      setAuthError(error.message || "Erro na autenticação. Verifique suas credenciais.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
      setPosts([]);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      const base64 = await fileToBase64(file);
      setNewImagePreview(base64);
    }
  };

  const handleCreatePost = async () => {
    if (!newContent.trim() && !newImageFile) return;
    if (!supabase) return alert("Erro de configuração.");
    
    setPosting(true);

    let imageUrl = '';
    if (newImageFile) {
      const url = await uploadImageToBucket(newImageFile, 'posts');
      if (url) imageUrl = url;
    }

    // Determine author name
    let authorName = 'Mamãe';
    if (session?.user?.user_metadata?.username) {
      authorName = session.user.user_metadata.username;
    }

    // Calculate current week
    let currentWeek = 0;
    if (user.dueDate) {
       const today = new Date();
       const due = new Date(user.dueDate + "T12:00:00");
       const daysRemaining = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
       currentWeek = Math.floor((280 - daysRemaining) / 7) + 1;
    }

    const newPost: Post = {
      id: '', // Supabase gera
      authorName: authorName,
      authorWeek: currentWeek > 0 && currentWeek <= 42 ? currentWeek : 0,
      authorPhoto: user.userPhoto,
      content: newContent,
      image: imageUrl,
      likes: 0,
      likedByMe: false,
      comments: [],
      timestamp: Date.now()
    };

    try {
      const updated = await savePost(newPost);
      setPosts(updated);
      setNewContent('');
      setNewImageFile(null);
      setNewImagePreview('');
      setShowCreate(false);
    } catch (e) {
      alert("Erro ao publicar.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Deseja apagar este post?")) {
      const updated = await deletePost(id);
      setPosts(updated);
    }
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

  // --- AVISO SE SUPABASE NÃO CONFIGURADO ---
  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 max-w-sm">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-gray-700 mb-2">Configuração Necessária</h2>
           <p className="text-gray-500 text-sm mb-4">
             Para usar os recursos online (Login e Rede Social), você precisa configurar o banco de dados.
           </p>
           <div className="bg-white p-3 rounded-lg text-xs text-left text-gray-600 font-mono border border-gray-200 overflow-x-auto">
             Edite: <strong>services/supabaseClient.ts</strong><br/>
             1. Crie projeto no supabase.com<br/>
             2. Cole a URL e a KEY no arquivo.
           </div>
        </div>
      </div>
    );
  }

  // --- TELA DE LOGIN (Se não houver sessão) ---
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-xl border border-gray-100 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
             <div className="bg-lilac/20 p-4 rounded-full">
                <Heart className="w-10 h-10 text-lilac-dark fill-current" />
             </div>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            {isLoginMode ? 'Bem-vinda de volta!' : 'Criar Conta'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Entre para conectar-se com outras mamães e salvar seus momentos na nuvem.
          </p>
          
          {authError && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl mb-4 text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <input 
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Seu nome ou apelido"
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20"
                required
              />
            )}
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu email"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20"
              required
            />
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha (mín. 6 dígitos)"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/20"
              required
              minLength={6}
            />
            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-lilac-dark text-white py-3 rounded-xl font-bold hover:bg-purple-400 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {authLoading && <Loader2 className="animate-spin w-4 h-4" />}
              {isLoginMode ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }}
            className="mt-4 text-sm text-gray-500 hover:text-lilac-dark underline"
          >
            {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400 text-center max-w-xs">
          Nota: Seus dados serão sincronizados em todos os dispositivos que você fizer login.
        </div>
      </div>
    );
  }

  // --- FEED (Usuário Logado) ---
  return (
    <div className="space-y-4 pb-20 relative animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center sticky top-0 bg-soft-white/95 backdrop-blur-sm z-20 py-3 px-1">
         <h2 className="text-2xl font-bold text-lilac-dark flex items-center gap-2" style={{ fontFamily: 'Grand Hotel, cursive' }}>
            Momentos <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
         </h2>
         <div className="flex gap-2">
            <button onClick={handleLogout} className="bg-gray-100 p-2 rounded-xl text-gray-500 hover:bg-gray-200" title="Sair">
               <LogOut className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-lilac-dark text-white p-2 rounded-xl shadow-md hover:bg-purple-400 transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
            </button>
         </div>
      </div>

      <AdBanner />

      {/* Create Post Modal Overlay */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
             <div className="p-4 border-b flex justify-between items-center">
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-800">Cancelar</button>
                <h3 className="font-bold text-gray-700">Nova Publicação</h3>
                <button 
                  onClick={handleCreatePost} 
                  disabled={posting || (!newContent.trim() && !newImagePreview)}
                  className="text-lilac-dark font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {posting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Compartilhar
                </button>
             </div>
             
             <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <div className="w-full h-full flex items-center justify-center bg-lilac/20 text-lilac-dark font-bold">
                       {session.user.user_metadata.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder={`No que você está pensando, ${session.user.user_metadata.username}?`}
                    className="w-full h-24 text-sm outline-none resize-none placeholder-gray-400"
                    autoFocus
                  />
                  
                  {newImagePreview && (
                    <div className="relative rounded-xl overflow-hidden mt-2 border border-gray-100">
                      <img src={newImagePreview} alt="Preview" className="w-full max-h-60 object-cover" />
                      <button 
                        onClick={() => { setNewImagePreview(''); setNewImageFile(null); }} 
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
                     onChange={handleImageSelect} 
                   />
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {posts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 mx-4">
             <Camera className="w-12 h-12 mx-auto text-gray-200 mb-2" />
             <p className="text-gray-400">Nenhum post ainda.</p>
             <p className="text-lilac-dark text-sm font-bold">Seja a primeira a compartilhar!</p>
          </div>
        )}

        {posts.map(post => {
          const isMine = post.authorName === session.user.user_metadata.username;
          return (
            <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Delete Option (Only for owner) */}
              {isMine && (
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 p-1 rounded-full"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}

              {/* Post Header */}
              <div className="p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-gradient-to-tr from-lilac to-baby-pink rounded-full p-[2px]">
                      <div className="bg-white w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                         {post.authorPhoto ? (
                           <img src={post.authorPhoto} className="w-full h-full object-cover" />
                         ) : (
                           <span className="font-bold text-gray-400 text-xs">{post.authorName.substring(0,2).toUpperCase()}</span>
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
              </div>

              {/* Content */}
              {post.image && (
                <div className="w-full bg-gray-50 relative">
                   <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-[500px]" />
                </div>
              )}
              
              <div className="px-4 py-3">
                 <div className="text-sm text-gray-800 leading-tight">
                   <span className="font-bold mr-1">{post.authorName}</span>
                   <span className="whitespace-pre-wrap">{post.content}</span>
                 </div>
                 
                 <div className="flex gap-4 mt-3 pt-2 border-t border-gray-50">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition-colors">
                       <Heart className="w-5 h-5" /> <span className="text-xs">Curtir</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-lilac-dark transition-colors">
                       <MessageCircle className="w-5 h-5" /> <span className="text-xs">Comentar</span>
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Social;
