
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ShoppingBag, Calendar, Settings, Home, ListTodo, Sparkles, Instagram, ArrowLeft } from 'lucide-react';
import { getConfig } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [config, setConfig] = useState(getConfig());
  
  // Listen for storage/config updates triggered by Admin
  useEffect(() => {
    const handleUpdate = () => setConfig(getConfig());
    window.addEventListener('local-data-change', handleUpdate);
    return () => window.removeEventListener('local-data-change', handleUpdate);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === '/';

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/tracker', icon: Calendar, label: 'Semanas' },
    { path: '/doula', icon: MessageCircle, label: 'Doula' },
    { path: '/checklist', icon: ListTodo, label: 'Kit' },
    { path: '/store', icon: ShoppingBag, label: 'Lojinha' },
    { path: '/names', icon: Sparkles, label: 'Nomes' },
  ];

  return (
    <div className="min-h-screen bg-soft-white text-gray-700 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            {!isHome && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-1 mr-1 text-gray-400 hover:text-lilac-dark transition-colors rounded-full hover:bg-gray-50"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="h-8 w-auto object-contain bg-white rounded-full" />
            ) : (
              <div className="bg-lilac p-2 rounded-full">
                <Heart className="text-white w-6 h-6 fill-current" />
              </div>
            )}
            <h1 className="text-xl font-bold text-lilac-dark tracking-tight">{config.appName}</h1>
          </div>
          <Link to="/admin" className="text-gray-400 hover:text-lilac-dark transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'text-purple-500 scale-105' 
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'fill-current opacity-20 stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-2xl p-4 space-y-4">
         {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'bg-lilac text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}
      </div>
      
      {/* Footer info */}
      <footer className="hidden md:block text-center text-gray-400 text-sm py-8 border-t border-gray-100 mt-8">
        <p className="mb-2">© 2024 {config.appName}. {config.footerText}</p>
        {config.socialLink && (
           <div className="flex justify-center gap-2">
             <a href={config.socialLink} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-500 flex items-center gap-1">
               <Instagram className="w-4 h-4" /> Instagram
             </a>
           </div>
        )}
      </footer>
    </div>
  );
};

export default Layout;
