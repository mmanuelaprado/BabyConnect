
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getDoulaChat } from '../services/ai';
import { getAiUsageStatus, incrementAiUsage } from '../services/storage';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

const Doula: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'model', text: 'Olá! Sou sua Doula Virtual. Como posso ajudar você e seu bebê hoje? Estou aqui para tirar dúvidas sobre sintomas, enxoval, amamentação ou apenas conversar. 💖' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageStatus, setUsageStatus] = useState(getAiUsageStatus());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep the chat instance in a ref to maintain context
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = getDoulaChat();
    }
    // Refresh usage status on mount
    setUsageStatus(getAiUsageStatus());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Strict double check before sending
    const currentStatus = getAiUsageStatus();
    if (currentStatus.isBlocked) {
      setUsageStatus(currentStatus);
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Consume one credit
      const newStatus = incrementAiUsage();
      setUsageStatus(newStatus);

      const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || 'Desculpe, não consegui entender. Pode repetir?';
      
      const botMsg: Message = { id: Date.now() + 1, role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: Date.now() + 1, role: 'model', text: 'Tive um pequeno problema técnico. Tente novamente em instantes. 🌸' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      {/* Header Info with Remaining Credits */}
      <div className="bg-lilac/20 p-2 rounded-t-xl flex justify-between items-center text-xs text-lilac-dark font-bold px-4 mb-2">
         <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Assistente Inteligente</span>
         <span>
           {usageStatus.isBlocked 
             ? "Limite diário atingido" 
             : `${usageStatus.remaining} interações restantes hoje`}
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

      {/* Conditional Input Area */}
      <div className="mt-2 sticky bottom-0">
        {usageStatus.isBlocked ? (
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-red-100 flex flex-col items-center text-center gap-2">
             <div className="bg-lilac p-3 rounded-full">
               <AlertCircle className="w-6 h-6 text-lilac-dark" />
             </div>
             <p className="text-gray-700 font-bold text-sm">
               Você utilizou as 3 interações gratuitas de hoje.
             </p>
             <p className="text-gray-400 text-xs">
               O limite será renovado automaticamente amanhã.
             </p>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre sintomas, enxoval..."
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-baby-pink-dark/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-baby-pink-dark hover:bg-pink-400 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doula;
