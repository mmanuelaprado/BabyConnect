
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Sparkles, ShoppingBag, Users } from 'lucide-react';
import { getUserSettings, getWeeksData, getConfig } from '../services/storage';
import { UserSettings, WeekInfo, AppConfig } from '../types';

const Home: React.FC = () => {
  const [user, setUser] = useState<UserSettings>(getUserSettings());
  const [currentWeekInfo, setCurrentWeekInfo] = useState<WeekInfo | null>(null);
  const [config, setConfig] = useState<AppConfig>(getConfig());

  // Update logic when user settings or config changes
  useEffect(() => {
    const handleUpdate = () => {
       setConfig(getConfig());
       setUser(getUserSettings());
       // Re-run week calc logic if needed (handled in dependency below)
    };
    window.addEventListener('local-data-change', handleUpdate);
    return () => window.removeEventListener('local-data-change', handleUpdate);
  }, []);

  useEffect(() => {
    if (user.dueDate) {
      const today = new Date();
      const due = new Date(user.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeksLeft = Math.floor(diffDays / 7);
      const currentWeek = 40 - weeksLeft;
      
      const weeksData = getWeeksData();
      // Ensure we get data, fallback to week 1 safely
      const info = weeksData.find(w => w.week === currentWeek) || weeksData[0];
      setCurrentWeekInfo(info);
    }
  }, [user]);

  const MenuItem = ({ to, icon: Icon, title, color }: any) => (
    <Link to={to} className={`${color} p-6 rounded-3xl shadow-sm hover:shadow-md transition-transform active:scale-95 flex flex-col items-center justify-center gap-3 text-center h-40`}>
      <div className="bg-white/40 p-3 rounded-full">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="font-bold text-white text-lg">{title}</span>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div 
        className="bg-gradient-to-r from-lilac-dark to-lilac p-6 rounded-3xl text-white shadow-lg relative overflow-hidden bg-cover bg-center"
        style={config.bannerUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${config.bannerUrl})` } : {}}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Olá, Mamãe! 🌸</h2>
          <p className="opacity-90 mb-4">Como você está se sentindo hoje?</p>
          
          {currentWeekInfo ? (
             <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
               <div className="flex items-center gap-3 mb-2">
                 <Calendar className="w-5 h-5" />
                 <span className="font-bold text-lg">Semana {currentWeekInfo.week}</span>
               </div>
               <p className="text-sm">{currentWeekInfo.babySize}</p>
             </div>
          ) : (
            <Link to="/tracker" className="bg-white text-lilac-dark px-4 py-2 rounded-full text-sm font-bold shadow-sm inline-block">
              Configurar data do parto
            </Link>
          )}
        </div>
        
        {/* Decorative circles - only if no banner */}
        {!config.bannerUrl && (
          <>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </>
        )}
      </div>

      {/* WhatsApp Community Button */}
      {config.whatsappGroupLink && (
        <a 
          href={config.whatsappGroupLink} 
          target="_blank" 
          rel="noreferrer"
          className="bg-[#25D366] p-4 rounded-2xl shadow-sm shadow-green-200 flex items-center justify-between hover:bg-[#1faa52] transition-colors"
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-2 rounded-full">
                <Users className="w-6 h-6 text-white" />
             </div>
             <div>
                <h3 className="text-white font-bold text-lg leading-tight">Entre no Grupo VIP</h3>
                <p className="text-white/90 text-xs">Comunidade exclusiva de mamães</p>
             </div>
          </div>
          <div className="bg-white text-[#25D366] px-4 py-2 rounded-full text-sm font-bold">
             Entrar
          </div>
        </a>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MenuItem to="/doula" icon={MessageCircle} title="Doula AI" color="bg-baby-pink-dark" />
        <MenuItem to="/names" icon={Sparkles} title="Nomes" color="bg-baby-blue-dark" />
        <MenuItem to="/checklist" icon={ShoppingBag} title="Enxoval" color="bg-orange-300" />
        <MenuItem to="/tracker" icon={Calendar} title="Diário" color="bg-purple-300" />
      </div>

      {/* Daily Tip */}
      {currentWeekInfo && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lilac-dark mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Dica da semana
          </h3>
          <p className="text-gray-600 leading-relaxed">{currentWeekInfo.tips}</p>
        </div>
      )}
    </div>
  );
};

export default Home;