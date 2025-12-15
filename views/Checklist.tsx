import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, ExternalLink } from 'lucide-react';
import { getChecklistDefinitions, getUserSettings, toggleChecklistItem } from '../services/storage';
import { ChecklistItem } from '../types';

const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [progress, setProgress] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  useEffect(() => {
    setItems(getChecklistDefinitions());
    setProgress(getUserSettings().checklistProgress);
  }, []);

  const handleToggle = (id: string) => {
    toggleChecklistItem(id);
    setProgress(getUserSettings().checklistProgress);
  };

  const isChecked = (id: string) => progress.includes(id);

  const categories = [
    { id: 'todos', label: 'Tudo' },
    { id: 'mae', label: 'Mãe' },
    { id: 'bebe', label: 'Bebê' },
    { id: 'acompanhante', label: 'Pai/Acomp.' },
    { id: 'documentos', label: 'Docs' },
  ];

  const filteredItems = activeCategory === 'todos' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  const progressPercentage = Math.round((progress.length / items.length) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-bold text-gray-700">Meu Kit Maternidade</h2>
          <span className="text-lilac-dark font-bold text-2xl">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-lilac h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeCategory === cat.id 
                ? 'bg-lilac-dark text-white' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all ${
              isChecked(item.id) ? 'opacity-60 bg-gray-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-1" onClick={() => handleToggle(item.id)}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                isChecked(item.id) ? 'bg-green-400 border-green-400' : 'border-gray-300'
              }`}>
                {isChecked(item.id) && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className={`text-sm font-medium ${isChecked(item.id) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.name}
              </span>
            </div>

            {item.shopeeLink && (
              <a 
                href={item.shopeeLink} 
                target="_blank" 
                rel="noreferrer"
                className="bg-orange-50 text-orange-500 hover:bg-orange-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                Comprar <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
           <div className="text-center py-8 text-gray-400">
             <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
             <p>Nenhum item nesta categoria.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Checklist;