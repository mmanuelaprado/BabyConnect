
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Filter, Share2, Plus, User, MessageCircle, Phone, X, Upload, Image as ImageIcon, Trash, ShoppingBag, AlertTriangle, MapPin, Search } from 'lucide-react';
import { getProducts, getMarketplaceProducts, saveMarketplaceProduct, deleteMarketplaceProduct, getUserSettings, saveUserSettings, fileToBase64 } from '../services/storage';
import { Product, UserSettings } from '../types';
import AdBanner from '../components/AdBanner';

const Store: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  
  // Data State
  const [officialProducts, setOfficialProducts] = useState<Product[]>([]);
  const [communityProducts, setCommunityProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<UserSettings>(getUserSettings());
  
  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [filterCity, setFilterCity] = useState('');
  const [filterState, setFilterState] = useState('');
  
  // Create Product State
  const [showSellModal, setShowSellModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCity, setNewItemCity] = useState('');
  const [newItemState, setNewItemState] = useState('');
  const [userPhone, setUserPhone] = useState(user.userPhone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BRAZIL_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    setOfficialProducts(getProducts().filter(p => p.active));
    setCommunityProducts(getMarketplaceProducts());
    setUser(getUserSettings());
  }, []);

  const handleShare = async (product: Product) => {
    const shareData = {
      title: product.name,
      text: `Olha que achadinho lindo: ${product.name}`,
      url: product.shopeeLink || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copiado! 📋');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setNewItemImage(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateProduct = () => {
    if (!newItemName || !newItemPrice || !userPhone || !newItemCity || !newItemState) {
      alert("Preencha todos os campos obrigatórios: Nome, Preço, WhatsApp, Cidade e Estado.");
      return;
    }

    // Save user phone if updated
    if (userPhone !== user.userPhone) {
      const updatedUser = { ...user, userPhone };
      saveUserSettings(updatedUser);
      setUser(updatedUser);
    }

    // Generate WhatsApp Link
    const cleanPhone = userPhone.replace(/\D/g, '');
    const locationText = newItemCity && newItemState ? ` (${newItemCity}/${newItemState})` : '';
    const waLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá! Vi seu anúncio "${newItemName}"${locationText} no BabyConnect e tenho interesse.`)}`;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newItemName,
      description: newItemDesc,
      price: newItemPrice,
      category: 'comunidade',
      image: newItemImage || '', // Placeholder handled in render
      shopeeLink: waLink,
      active: true,
      ownerId: user.userName || 'user',
      ownerName: user.userName || 'Mamãe',
      ownerPhone: cleanPhone,
      city: newItemCity,
      state: newItemState,
      createdAt: Date.now()
    };

    const updatedList = saveMarketplaceProduct(newProduct);
    setCommunityProducts(updatedList);
    
    // Reset Form
    setShowSellModal(false);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    setNewItemImage('');
    setNewItemCity('');
    setNewItemState('');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Remover este produto da sua lojinha?')) {
      const updated = deleteMarketplaceProduct(id);
      setCommunityProducts(updated);
    }
  }

  const clearFilters = () => {
    setFilterCity('');
    setFilterState('');
  };

  const categories = [
    { id: 'todos', label: 'Tudo' },
    { id: 'amamentacao', label: 'Amamentação' },
    { id: 'enxoval', label: 'Enxoval' },
    { id: 'essenciais', label: 'Essenciais' },
  ];

  // Filtering Logic
  let displayProducts = activeTab === 'official' ? officialProducts : communityProducts;

  // 1. Filter by Category (Official Only)
  if (activeTab === 'official' && activeCategory !== 'todos') {
    displayProducts = displayProducts.filter(p => p.category === activeCategory);
  }

  // 2. Filter by Location (Community Only)
  if (activeTab === 'community') {
    if (filterState) {
      displayProducts = displayProducts.filter(p => p.state === filterState);
    }
    if (filterCity) {
      displayProducts = displayProducts.filter(p => 
        p.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }
  }

  return (
    <div className="space-y-6">
      <AdBanner />
      {/* Header Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('official')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'official' 
              ? 'bg-white shadow-sm text-lilac-dark' 
              : 'text-gray-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Oficial
        </button>
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'community' 
              ? 'bg-white shadow-sm text-pink-500' 
              : 'text-gray-400'
          }`}
        >
          <User className="w-4 h-4" />
          Das Mamães
        </button>
      </div>

      {/* Official Filters */}
      {activeTab === 'official' && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-lilac-dark text-white' 
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Community Intro & Location Search */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl flex items-center justify-between">
             <div>
               <h3 className="font-bold text-pink-500 text-sm">Desapegos da Comunidade</h3>
               <p className="text-xs text-pink-400">Compre e venda itens com outras mães</p>
             </div>
             <button 
               onClick={() => setShowSellModal(true)}
               className="bg-pink-400 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-pink-500 transition-colors"
             >
               <Plus className="w-4 h-4" /> Desapegar
             </button>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Buscar por cidade..." 
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-pink-200"
              />
            </div>
            <select 
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-gray-50 text-sm px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-pink-200 text-gray-600 font-medium"
            >
              <option value="">UF</option>
              {BRAZIL_STATES.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          
          {(filterCity || filterState) && (
            <div className="flex justify-end">
               <button onClick={clearFilters} className="text-xs text-pink-500 font-bold hover:underline flex items-center gap-1">
                 <X className="w-3 h-3" /> Limpar Filtros
               </button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3">
             <div className="bg-yellow-100 p-2 rounded-full shrink-0">
               <AlertTriangle className="w-5 h-5 text-yellow-600" />
             </div>
             <div>
               <h3 className="font-bold text-yellow-700 text-sm">Cuidado com Golpes</h3>
               <p className="text-xs text-yellow-600 mt-1 leading-relaxed">
                 O BabyConnect conecta mamães, mas não intermedia pagamentos. 
                 <strong> Nunca faça transferências antecipadas.</strong> Combine a entrega em locais públicos e verifique o produto pessoalmente.
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4">
        {displayProducts.map(product => {
           const isOwner = activeTab === 'community' && product.ownerName === (user.userName || 'Mamãe'); // Simple check, ideally use IDs

           return (
            <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative group">
              {/* Image */}
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                     <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {product.price && (
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                    {product.price}
                  </span>
                )}
                {/* Delete Button for Owner */}
                {isOwner && (
                  <button 
                    onClick={(e) => { e.preventDefault(); handleDeleteProduct(product.id); }}
                    className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-700 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                
                {/* Location Badge */}
                {activeTab === 'community' && product.city && product.state && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium mb-1 bg-gray-50 p-1 rounded-md w-fit">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span className="truncate max-w-[100px]">{product.city}, {product.state}</span>
                  </div>
                )}

                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
                
                {activeTab === 'community' && product.ownerName && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center">
                       <User className="w-2.5 h-2.5 text-pink-400" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium truncate">
                      {product.ownerName}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-2 flex gap-2">
                 <a 
                   href={product.shopeeLink} 
                   target="_blank" 
                   rel="noreferrer"
                   className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                     activeTab === 'community' 
                       ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                       : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                   }`}
                 >
                   {activeTab === 'community' ? (
                     <><MessageCircle className="w-3 h-3" /> WhatsApp</>
                   ) : (
                     <><ExternalLink className="w-3 h-3" /> Comprar</>
                   )}
                 </a>
                 <button 
                   onClick={() => handleShare(product)}
                   className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-lilac hover:text-white transition-colors"
                 >
                   <Share2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
           );
        })}
      </div>

      {displayProducts.length === 0 && (
         <div className="text-center py-10 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Nenhum produto encontrado.</p>
            {activeTab === 'community' && (
              <>
               {(filterCity || filterState) ? (
                 <p className="text-xs mt-1 text-pink-400">Tente mudar a cidade ou estado.</p>
               ) : (
                 <p className="text-xs mt-1">Seja a primeira a desapegar!</p>
               )}
              </>
            )}
         </div>
      )}

      {/* Modal Desapegar */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
           <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl animate-slide-up max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-gray-700 flex items-center gap-2">
                   <Plus className="w-5 h-5 text-pink-500" /> Novo Anúncio
                 </h3>
                 <button onClick={() => setShowSellModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                   <X className="w-4 h-4 text-gray-500" />
                 </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                 {/* Image Upload */}
                 <div className="flex flex-col items-center justify-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-pink-300 transition-colors relative overflow-hidden"
                    >
                       {newItemImage ? (
                         <img src={newItemImage} className="w-full h-full object-cover" alt="Preview" />
                       ) : (
                         <>
                           <Upload className="w-8 h-8 text-gray-300 mb-2" />
                           <span className="text-xs text-gray-400 font-bold">Toque para adicionar foto</span>
                         </>
                       )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                 </div>

                 <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Nome do Produto</label>
                      <input 
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        placeholder="Ex: Carrinho de Bebê Burigotto"
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Preço</label>
                        <input 
                          value={newItemPrice}
                          onChange={e => setNewItemPrice(e.target.value)}
                          placeholder="Ex: R$ 250,00"
                          className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      </div>
                      <div className="flex-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Cidade</label>
                         <input 
                           value={newItemCity}
                           onChange={e => setNewItemCity(e.target.value)}
                           placeholder="Ex: São Paulo"
                           className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200"
                         />
                      </div>
                      <div className="w-24">
                         <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Estado</label>
                         <select 
                           value={newItemState} 
                           onChange={e => setNewItemState(e.target.value)}
                           className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                         >
                            <option value="">UF</option>
                            {BRAZIL_STATES.map(uf => (
                              <option key={uf} value={uf}>{uf}</option>
                            ))}
                         </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Descrição (Estado, Tempo de uso)</label>
                      <textarea 
                        value={newItemDesc}
                        onChange={e => setNewItemDesc(e.target.value)}
                        placeholder="Ex: Pouco uso, sem detalhes. Acompanha bebê conforto."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                      />
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <label className="block text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Seu WhatsApp (Para contato)
                      </label>
                      <input 
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value)}
                        placeholder="Ex: 11999999999"
                        className="w-full p-3 rounded-xl border border-green-200 bg-white outline-none focus:ring-2 focus:ring-green-300"
                      />
                      <p className="text-[10px] text-green-600 mt-1">As interessadas entrarão em contato direto com você.</p>
                    </div>
                 </div>
              </div>

              <div className="p-4 border-t bg-white shrink-0 pb-safe md:pb-4 rounded-b-3xl">
                 <button 
                   onClick={handleCreateProduct}
                   className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold shadow-md hover:bg-pink-600 transition-colors"
                 >
                   Publicar Anúncio
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Store;
