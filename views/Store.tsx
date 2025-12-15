
import React, { useState, useEffect } from 'react';
import { ExternalLink, Filter, Share2 } from 'lucide-react';
import { getProducts } from '../services/storage';
import { Product } from '../types';

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  useEffect(() => {
    // Only show active products
    setProducts(getProducts().filter(p => p.active));
  }, []);

  const handleShare = async (product: Product) => {
    const shareData = {
      title: product.name,
      text: `Olha que achadinho lindo para o enxoval: ${product.name}`,
      url: product.shopeeLink || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop browsers
        await navigator.clipboard.writeText(shareData.url);
        alert('Link do produto copiado para a área de transferência! 📋');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const categories = [
    { id: 'todos', label: 'Vitrine' },
    { id: 'amamentacao', label: 'Amamentação' },
    { id: 'enxoval', label: 'Enxoval' },
    { id: 'essenciais', label: 'Essenciais' },
    { id: 'mae', label: 'Para Mamãe' },
  ];

  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-lilac-dark">Lojinha da Mamãe</h2>
        <div className="bg-white p-2 rounded-full shadow-sm">
           <Filter className="w-5 h-5 text-gray-400" />
        </div>
      </div>

       {/* Categories */}
       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeCategory === cat.id 
                ? 'bg-baby-blue-dark text-white' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative group">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            
            <h3 className="font-bold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">{product.description}</p>
            
            <div className="mt-auto flex gap-2">
              <a 
                href={product.shopeeLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                Comprar
              </a>
              <button
                onClick={() => handleShare(product)}
                className="bg-lilac/50 text-lilac-dark hover:bg-lilac hover:text-lilac-darker px-3 rounded-xl flex items-center justify-center transition-colors"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
         <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
           <p>Nenhum produto encontrado nesta categoria.</p>
         </div>
      )}
    </div>
  );
};

export default Store;
