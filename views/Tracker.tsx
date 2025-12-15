
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Info, AlertCircle, CheckCircle, ExternalLink, ListTodo, BookHeart, Activity, Clock, Play, Pause, Trash } from 'lucide-react';
import { getWeeksData, getUserSettings, saveUserSettings, toggleWeeklyTask, addJournalEntry, deleteJournalEntry, saveKickSession, saveContractions } from '../services/storage';
import { WeekInfo, UserSettings, JournalEntry, KickSession, Contraction } from '../types';

const Tracker: React.FC = () => {
  const [user, setUser] = useState<UserSettings>(getUserSettings());
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [inputDate, setInputDate] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'guia' | 'diario' | 'tools'>('guia');

  // Journal State
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState<JournalEntry['mood']>('happy');

  // Kick Counter State
  const [kickCount, setKickCount] = useState(0);
  const [kickTimer, setKickTimer] = useState(0);
  const [isKicking, setIsKicking] = useState(false);
  const kickIntervalRef = useRef<any>(null);

  // Contraction Timer State
  const [contractions, setContractions] = useState<Contraction[]>([]);

  // Initial Load and Event Listener for updates from Admin
  useEffect(() => {
    // Load initial data if exists
    if (user.dueDate) {
      calculateWeek(user.dueDate);
      setInputDate(user.dueDate);
      setContractions(user.contractions || []);
    }

    // Function to reload data when 'local-data-change' event fires (from Admin save)
    const handleDataUpdate = () => {
      const updatedUser = getUserSettings();
      setUser(updatedUser);
      setContractions(updatedUser.contractions || []);
      if (updatedUser.dueDate) {
        calculateWeek(updatedUser.dueDate);
      }
    };

    window.addEventListener('local-data-change', handleDataUpdate);
    return () => window.removeEventListener('local-data-change', handleDataUpdate);
  }, []); 

  useEffect(() => {
    if (isKicking) {
      kickIntervalRef.current = setInterval(() => {
        setKickTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(kickIntervalRef.current);
    }
    return () => clearInterval(kickIntervalRef.current);
  }, [isKicking]);

  const calculateWeek = (dueDateStr: string) => {
    const today = new Date();
    // Append time to prevent timezone shift causing 1 day off errors
    const due = new Date(dueDateStr + "T12:00:00");
    
    // Calculate difference in days
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const daysRemaining = (due.getTime() - today.getTime()) / MS_PER_DAY;
    
    const daysElapsed = 280 - daysRemaining;
    
    let week = Math.floor(daysElapsed / 7) + 1;
    
    // Clamp to valid range 1-42
    if (week < 1) week = 1;
    if (week > 42) week = 42;

    setCurrentWeek(week);
    
    const allWeeks = getWeeksData();
    const info = allWeeks.find(w => w.week === week) || allWeeks[0]; // Fallback to avoid crash
    setWeekInfo(info || null);
  };

  const handleSaveDate = () => {
    if (!inputDate) return;
    const newUser = { ...user, dueDate: inputDate };
    saveUserSettings(newUser);
    setUser(newUser);
    calculateWeek(inputDate);
  };

  const handleToggleTask = (taskIndex: number) => {
    if (!currentWeek) return;
    const key = `${currentWeek}-${taskIndex}`;
    toggleWeeklyTask(key);
    setUser(getUserSettings()); // Refresh UI
  };

  // --- JOURNAL FUNCTIONS ---
  const handleSaveJournal = () => {
    if (!journalText.trim() || !currentWeek) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      week: currentWeek,
      date: new Date().toISOString(),
      content: journalText,
      mood: journalMood
    };
    addJournalEntry(entry);
    setJournalText('');
    setUser(getUserSettings());
  };

  const handleDeleteEntry = (id: string) => {
    if(confirm('Apagar esta memória?')) {
      deleteJournalEntry(id);
      setUser(getUserSettings());
    }
  }

  // --- KICK COUNTER FUNCTIONS ---
  const handleKick = () => {
    if (!isKicking) setIsKicking(true);
    setKickCount(c => c + 1);
  };

  const finishKickSession = () => {
    const session: KickSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationSeconds: kickTimer,
      count: kickCount
    };
    saveKickSession(session);
    setUser(getUserSettings());
    setKickCount(0);
    setKickTimer(0);
    setIsKicking(false);
  };

  // --- CONTRACTION TIMER FUNCTIONS ---
  const startContraction = () => {
    const active = contractions.find(c => c.endTime === null);
    if (active) return; // Already active

    const newC: Contraction = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      intervalSeconds: contractions.length > 0 ? (Date.now() - contractions[0].startTime) / 1000 : 0
    };
    
    const updated = [newC, ...contractions];
    setContractions(updated);
    saveContractions(updated);
  };

  const stopContraction = () => {
    const activeIndex = contractions.findIndex(c => c.endTime === null);
    if (activeIndex === -1) return;

    const updated = [...contractions];
    const active = updated[activeIndex];
    active.endTime = Date.now();
    active.durationSeconds = (active.endTime - active.startTime) / 1000;

    setContractions(updated);
    saveContractions(updated);
  };

  const resetContractions = () => {
    if(confirm('Limpar histórico de contrações?')) {
      setContractions([]);
      saveContractions([]);
    }
  }

  // Helper to format seconds mm:ss
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentWeek || !weekInfo) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center space-y-4 mt-10">
        <div className="bg-lilac p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-700">Vamos configurar sua gestação?</h2>
        <p className="text-gray-500 text-sm">Insira a Data Prevista do Parto para acompanharmos juntas.</p>
        <div className="flex flex-col gap-3">
          <input 
            type="date" 
            className="border p-3 rounded-xl w-full text-center"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />
          <button 
            onClick={handleSaveDate}
            className="bg-lilac-dark text-white font-bold py-3 rounded-xl hover:bg-purple-400 transition-colors"
          >
            Começar Acompanhamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
         <div className="flex items-center gap-3">
           <div className="bg-baby-pink p-2 rounded-full">
             <Calendar className="w-5 h-5 text-white" />
           </div>
           <div>
             <h3 className="font-bold text-gray-700 leading-none">Semana {currentWeek}</h3>
             <button onClick={() => { setCurrentWeek(null); setWeekInfo(null); }} className="text-xs text-lilac-dark font-medium">
                DPP: {new Date(user.dueDate!).toLocaleDateString('pt-BR')} (Alterar)
             </button>
           </div>
         </div>
         <div className="bg-lilac/20 px-3 py-1 rounded-full text-lilac-dark text-xs font-bold">
            {weekInfo.babySize}
         </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('guia')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'guia' ? 'bg-white shadow text-lilac-dark' : 'text-gray-400'}`}
        >
          Guia
        </button>
        <button 
          onClick={() => setActiveTab('diario')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'diario' ? 'bg-white shadow text-lilac-dark' : 'text-gray-400'}`}
        >
          Diário
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'tools' ? 'bg-white shadow text-lilac-dark' : 'text-gray-400'}`}
        >
          Ferramentas
        </button>
      </div>

      {/* === GUIA TAB === */}
      {activeTab === 'guia' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Development Text */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="text-lilac-dark font-bold mb-3 flex items-center gap-2 text-lg">
                 ✨ Desenvolvimento
             </h3>
             <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {weekInfo.development}
             </p>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="text-blue-500 font-bold mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" /> Mudanças no Corpo
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{weekInfo.bodyChanges}</p>
             </div>

             <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                <h3 className="text-orange-500 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Sintomas Comuns
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{weekInfo.symptoms}</p>
             </div>
          </div>

          {/* Weekly Checklist */}
          {weekInfo.weeklyChecklist && weekInfo.weeklyChecklist.length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lilac-dark mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5" /> Checklist da Semana
              </h3>
              <div className="space-y-3">
                {weekInfo.weeklyChecklist.map((task, idx) => {
                  const isDone = user.weeklyTasksCompleted?.includes(`${currentWeek}-${idx}`);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleToggleTask(idx)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${isDone ? 'bg-gray-50' : 'bg-white border border-gray-100 hover:border-lilac'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isDone ? 'bg-green-400 border-green-400' : 'border-gray-300'
                      }`}>
                        {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Tip */}
          <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
            <h3 className="text-purple-500 font-bold mb-2 flex items-center gap-2">
                💡 Dica da Semana
            </h3>
            <p className="text-gray-600 text-sm italic whitespace-pre-line">"{weekInfo.tips}"</p>
          </div>

           {/* Recommendation */}
          {weekInfo.recommendedProductId && (
            <div className="bg-gradient-to-r from-baby-blue to-white p-5 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Recomendação da Semana</span>
                    <p className="font-bold text-gray-700 mt-1">Confira este item essencial</p>
                </div>
                <a href="/#/store" className="bg-white text-blue-400 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                    Ver Loja <ExternalLink className="w-4 h-4" />
                </a>
            </div>
          )}
        </div>
      )}

      {/* === DIARIO TAB === */}
      {activeTab === 'diario' && (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <BookHeart className="w-5 h-5 text-lilac-dark" /> Como você está se sentindo?
              </h3>
              
              <div className="flex gap-2 mb-4">
                 {['happy', 'excited', 'tired', 'anxious', 'sick'].map((m) => (
                   <button 
                     key={m}
                     onClick={() => setJournalMood(m as any)}
                     className={`p-2 rounded-xl text-2xl border transition-colors ${journalMood === m ? 'bg-lilac/20 border-lilac' : 'border-gray-100 hover:bg-gray-50'}`}
                   >
                     {m === 'happy' && '😊'}
                     {m === 'excited' && '🤩'}
                     {m === 'tired' && '😴'}
                     {m === 'anxious' && '😰'}
                     {m === 'sick' && '🤢'}
                   </button>
                 ))}
              </div>

              <textarea
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
                placeholder={`Escreva sobre sua ${currentWeek}ª semana...`}
                className="w-full h-32 p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-lilac resize-none text-sm text-gray-700"
              />
              
              <div className="flex justify-end mt-2">
                 <button 
                   onClick={handleSaveJournal}
                   disabled={!journalText.trim()}
                   className="bg-lilac-dark text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-purple-400 transition-colors disabled:opacity-50"
                 >
                   Salvar Memória
                 </button>
              </div>
           </div>

           {/* Entries List */}
           <div className="space-y-4">
             {user.journalEntries && user.journalEntries.length > 0 ? (
               user.journalEntries.map(entry => (
                 <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-lilac/20 text-lilac-dark text-xs font-bold px-2 py-1 rounded-full">
                         {entry.week}ª Semana
                       </span>
                       <span className="text-gray-400 text-xs">
                         {new Date(entry.date).toLocaleDateString()}
                       </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{entry.content}</p>
                    <div className="mt-2 text-xl">
                      {entry.mood === 'happy' && '😊'}
                      {entry.mood === 'excited' && '🤩'}
                      {entry.mood === 'tired' && '😴'}
                      {entry.mood === 'anxious' && '😰'}
                      {entry.mood === 'sick' && '🤢'}
                    </div>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)} 
                      className="absolute bottom-4 right-4 text-gray-300 hover:text-red-400"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                 </div>
               ))
             ) : (
               <div className="text-center py-8 text-gray-400">
                  <BookHeart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Nenhuma memória salva ainda.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* === TOOLS TAB === */}
      {activeTab === 'tools' && (
        <div className="space-y-6 animate-fade-in">
           {/* Kick Counter */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-baby-pink-dark" /> Contador de Chutes
                   </h3>
                   <p className="text-xs text-gray-400">Monitore a atividade do bebê</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-2xl font-bold text-gray-800">{kickCount}</span>
                    <span className="text-xs text-gray-400">chutes</span>
                 </div>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                 <button 
                   onClick={handleKick}
                   className="w-32 h-32 rounded-full bg-gradient-to-tr from-baby-pink to-lilac shadow-lg flex flex-col items-center justify-center text-white transition-transform active:scale-95 hover:shadow-xl"
                 >
                    <div className="text-4xl">👣</div>
                    <span className="font-bold text-sm mt-1">CHUTOU!</span>
                 </button>
                 
                 <div className="mt-6 flex items-center gap-2 text-gray-500 font-mono bg-gray-100 px-4 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(kickTimer / 60)}:{(kickTimer % 60).toString().padStart(2, '0')}</span>
                 </div>
              </div>

              {kickCount > 0 && (
                <div className="flex gap-2 mt-4">
                   <button onClick={() => { setKickCount(0); setKickTimer(0); setIsKicking(false); }} className="flex-1 py-3 text-gray-500 bg-gray-100 rounded-xl font-bold text-sm">
                      Reiniciar
                   </button>
                   <button onClick={finishKickSession} className="flex-1 py-3 text-white bg-green-400 rounded-xl font-bold text-sm shadow-md hover:bg-green-500">
                      Salvar Sessão
                   </button>
                </div>
              )}

              {/* Mini History */}
              {user.kickSessions && user.kickSessions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                   <h4 className="font-bold text-xs text-gray-400 uppercase mb-2">Últimas Sessões</h4>
                   <div className="space-y-2">
                      {user.kickSessions.slice(0, 3).map(s => (
                        <div key={s.id} className="flex justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                           <span>{new Date(s.date).toLocaleDateString()}</span>
                           <span>{s.count} chutes em {Math.floor(s.durationSeconds / 60)}m</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* Contraction Timer */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" /> Contrações
                   </h3>
                   <p className="text-xs text-gray-400">Cronômetro para o parto</p>
                 </div>
                 <button onClick={resetContractions} className="text-gray-300 hover:text-red-400">
                    <Trash className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex gap-3 mb-6">
                 {!contractions.find(c => c.endTime === null) ? (
                   <button 
                     onClick={startContraction}
                     className="flex-1 bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                   >
                      <Play className="w-6 h-6 fill-current" />
                      INICIAR
                   </button>
                 ) : (
                   <button 
                     onClick={stopContraction}
                     className="flex-1 bg-red-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-500 transition-all active:scale-95 flex flex-col items-center justify-center gap-1 animate-pulse"
                   >
                      <Pause className="w-6 h-6 fill-current" />
                      PARAR
                   </button>
                 )}
              </div>

              {/* Active Contraction Display */}
              {contractions.find(c => c.endTime === null) && (
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center mb-4">
                    <p className="text-blue-500 font-bold text-sm uppercase">Contração em andamento</p>
                    <p className="text-3xl font-mono font-bold text-gray-700 mt-1">
                      ...
                    </p>
                 </div>
              )}

              {/* Table Header */}
              <div className="grid grid-cols-3 text-xs font-bold text-gray-400 mb-2 px-2">
                 <div>Duração</div>
                 <div>Intervalo</div>
                 <div className="text-right">Hora</div>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                 {contractions.filter(c => c.endTime !== null).map((c, i) => (
                   <div key={c.id} className="grid grid-cols-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg items-center">
                      <div className="font-bold text-blue-500">{fmtTime(c.durationSeconds || 0)}</div>
                      <div>{c.intervalSeconds ? fmtTime(c.intervalSeconds) : '-'}</div>
                      <div className="text-right text-xs text-gray-400">{new Date(c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                   </div>
                 ))}
                 {contractions.length === 0 && (
                   <p className="text-center text-gray-400 text-xs py-4">Nenhuma contração registrada.</p>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tracker;
