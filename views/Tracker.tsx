
import React, { useState, useEffect } from 'react';
import { Calendar, Info, AlertCircle, CheckCircle, ExternalLink, ListTodo } from 'lucide-react';
import { getWeeksData, getUserSettings, saveUserSettings, toggleWeeklyTask } from '../services/storage';
import { WeekInfo, UserSettings } from '../types';

const Tracker: React.FC = () => {
  const [user, setUser] = useState<UserSettings>(getUserSettings());
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
  const [inputDate, setInputDate] = useState('');

  // Initial Load and Event Listener for updates from Admin
  useEffect(() => {
    // Load initial data if exists
    if (user.dueDate) {
      calculateWeek(user.dueDate);
      setInputDate(user.dueDate);
    }

    // Function to reload data when 'local-data-change' event fires (from Admin save)
    const handleDataUpdate = () => {
      const updatedUser = getUserSettings();
      setUser(updatedUser);
      if (updatedUser.dueDate) {
        calculateWeek(updatedUser.dueDate);
      }
    };

    window.addEventListener('local-data-change', handleDataUpdate);
    return () => window.removeEventListener('local-data-change', handleDataUpdate);
  }, []); // Dependency array empty to set up listener once

  const calculateWeek = (dueDateStr: string) => {
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let week = 40 - Math.floor(diffDays / 7);
    
    // Clamp
    if (week < 1) week = 1;
    if (week > 42) week = 42;

    setCurrentWeek(week);
    
    const allWeeks = getWeeksData();
    const info = allWeeks.find(w => w.week === week);
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
      {/* Date Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>DPP: {new Date(user.dueDate!).toLocaleDateString('pt-BR')}</span>
         </div>
         <button onClick={() => { setCurrentWeek(null); setWeekInfo(null); }} className="text-xs text-lilac-dark font-bold underline">
            Alterar
         </button>
      </div>

      {/* Hero Week Display */}
      <div className="bg-lilac text-white p-8 rounded-3xl shadow-lg text-center relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-2">{currentWeek}ª Semana</h1>
            <p className="text-lg opacity-90 mb-4">{weekInfo.babySize}</p>
         </div>
         
         {/* Decorative */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" /> Mudanças no Corpo
            </h3>
            <p className="text-gray-600 text-sm">{weekInfo.bodyChanges}</p>
         </div>

         <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
            <h3 className="text-orange-500 font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Sintomas Comuns
            </h3>
            <p className="text-gray-600 text-sm">{weekInfo.symptoms}</p>
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
  );
};

export default Tracker;
