import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatWithGemini } from '../services/gemini';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const { isChatOpen, toggleChat, chatMessages, addChatMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Format history for Gemini
    const history = chatMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithGemini(history, userMsg.text);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };
    addChatMessage(aiMsg);
    setIsTyping(false);
  };

  if (!isChatOpen) {
    return (
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group border border-white/10"
      >
        <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute right-10 top-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask Prism AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">Prism Assistant</h3>
        </div>
        <button onClick={toggleChat} className="text-white/50 hover:text-white transition-colors">
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};