
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Heart, HelpCircle, Baby, Calendar } from 'lucide-react';
import { DOULA_SCRIPTS, DoulaScript } from '../data/doulaScripts';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const Doula: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'model', text: 'Olá! Sou sua Doula Virtual. Estou aqui para te acolher com mensagens de carinho e informação. Escolha um tema abaixo ou digite o que está sentindo. 💖' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'Emoções', label: 'Emoções', icon: Heart },
    { id: 'Gestação', label: 'Gestação', icon: HelpCircle },
    { id: 'Trimestres', label: 'Fases', icon: Calendar },
    { id: 'Parto', label: 'Parto', icon: Sparkles },
    { id: 'Bebê', label: 'Bebê', icon: Baby },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestScript = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // 1. Tentar encontrar por palavra-chave exata
    const matches = DOULA_SCRIPTS.filter(script => 
      script.keywords.some(keyword => lowerText.includes(keyword)) ||
      script.title.toLowerCase().includes(lowerText)
    );

    if (matches.length > 0) {
      // Retorna um aleatório entre os que deram match
      const random = matches[Math.floor(Math.random() * matches.length)];
      return random.message;
    }

    // 2. Se não achar, retornar uma mensagem genérica aleatória
    const randomFallback = DOULA_SCRIPTS[Math.floor(Math.random() * DOULA_SCRIPTS.length)];
    return `Entendo. Sobre isso, aqui vai uma reflexão: "${randomFallback.message}"`;
  };

  const getRandomScriptByCategory = (category: string): string => {
    const filtered = DOULA_SCRIPTS.filter(s => s.category === category);
    if (filtered.length === 0) return "Estou aqui para te apoiar.";
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    return random.message;
  }

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate "thinking" time
    setTimeout(() => {
      let responseText = '';
      
      // Check if text matches a category exactly (button click)
      const catMatch = categories.find(c => c.label === textToSend || c.id === textToSend);
      if (catMatch) {
         responseText = getRandomScriptByCategory(catMatch.id);
      } else {
         responseText = findBestScript(textToSend);
      }

      const botMsg: Message = { id: Date.now() + 1, role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      {/* Header Info */}
      <div className="bg-lilac/20 p-2 rounded-t-xl flex justify-between items-center text-xs text-lilac-dark font-bold px-4 mb-2">
         <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Doula Virtual (Offline)</span>
         <span>
           Disponível 24h
         </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-lilac-dark' : 'bg-baby-pink-dark'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-lilac text-purple-900 rounded-tr-none' 
                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-baby-pink-dark flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100">
                  <Loader2 className="w-5 h-5 animate-spin text-baby-pink-dark" />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Categories */}
      <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleSend(cat.id)}
            disabled={isLoading}
            className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap hover:bg-lilac hover:text-lilac-dark hover:border-lilac transition-colors"
          >
            <cat.icon className="w-3 h-3" /> {cat.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="mt-2 sticky bottom-0">
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite 'ansiedade', 'enjoo' ou escolha um tema..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-baby-pink-dark/50"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-baby-pink-dark hover:bg-pink-400 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
      </div>
    </div>
  );
};

export default Doula;
