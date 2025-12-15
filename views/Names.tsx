import React, { useState } from 'react';
import { Search, Heart, Loader2, Info } from 'lucide-react';
import { getNameMeaning } from '../services/ai';
import { NameMeaning } from '../types';
import { toggleFavoriteName, getUserSettings } from '../services/storage';

const Names: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameMeaning | null>(null);
  const [favorites, setFavorites] = useState<NameMeaning[]>(getUserSettings().nameFavorites);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getNameMeaning(query);
      setResult(data);
    } catch (e) {
      alert('Ocorreu um erro ao buscar o nome. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (item: NameMeaning) => {
    toggleFavoriteName(item);
    setFavorites(getUserSettings().nameFavorites);
  };

  const isFavorite = (name: string) => favorites.some(f => f.name === name);

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'search' ? 'bg-white shadow text-lilac-dark' : 'text-gray-400'}`}
        >
          Pesquisar
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-white shadow text-lilac-dark' : 'text-gray-400'}`}
        >
          Favoritos ({favorites.length})
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite um nome (ex: Sofia)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-lilac-dark"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button 
              onClick={handleSearch}
              disabled={loading || !query}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-lilac text-lilac-dark font-bold px-4 py-2 rounded-xl text-sm hover:bg-lilac-dark hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Ver'}
            </button>
          </div>

          {result && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-lilac-dark mb-1">{result.name}</h2>
                  <span className="bg-blue-50 text-blue-500 text-xs px-2 py-1 rounded-full font-bold uppercase">{result.origin}</span>
                </div>
                <button onClick={() => handleFavorite(result)} className="p-2 rounded-full hover:bg-gray-50">
                  <Heart className={`w-6 h-6 ${isFavorite(result.name) ? 'fill-pink-400 text-pink-400' : 'text-gray-300'}`} />
                </button>
              </div>

              <div className="bg-lilac/20 p-4 rounded-xl">
                <h3 className="font-bold text-lilac-dark text-sm mb-1">Significado</h3>
                <p className="text-gray-700">{result.meaning}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-600 text-sm mb-1 flex items-center gap-2">
                   <Info className="w-4 h-4" /> Personalidade
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{result.personality}</p>
              </div>

              {result.suggestions?.length > 0 && (
                <div>
                   <h3 className="font-bold text-gray-600 text-sm mb-2">Nomes parecidos</h3>
                   <div className="flex flex-wrap gap-2">
                     {result.suggestions.map(s => (
                       <button key={s} onClick={() => { setQuery(s); handleSearch(); }} className="bg-gray-50 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-lilac hover:text-lilac-dark transition-colors">
                         {s}
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 gap-4">
          {favorites.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Nenhum nome favoritado ainda.</p>
            </div>
          ) : (
            favorites.map((fav, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-700">{fav.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{fav.meaning}</p>
                </div>
                <button onClick={() => handleFavorite(fav)}>
                   <Heart className="fill-pink-400 text-pink-400 w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Names;