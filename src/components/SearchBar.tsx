
import React, { useState, useRef, useEffect } from 'react';
import { Search, Camera, Loader2, History, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchProducts, analyzeImage } from '../services/gemini';
import { useSearchHistory } from '../hooks/useSearchHistory';

export const SearchBar: React.FC = () => {
  const [localQuery, setLocalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setSearchQuery, setProducts, setIsLoading } = useStore();
  const { history, addToHistory } = useSearchHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setLocalQuery(query);
    setIsFocused(false);
    addToHistory(query);
    setIsLoading(true);
    setProducts([]); // Clear previous

    const results = await searchProducts(query);
    setProducts(results);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(localQuery);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSearchQuery("Analyzing Image...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        const analysis = await analyzeImage(base64String, file.type);
        setLocalQuery(analysis.slice(0, 50) + "...");
        const results = await searchProducts(analysis);
        setProducts(results);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-30" ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
          <Search className="text-white/50 ml-4 w-6 h-6" />
          <input
            type="text"
            value={localQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for iPhone 15, Sony Headphones..."
            className="w-full bg-transparent border-none outline-none text-white text-lg px-4 py-3 placeholder-white/30 font-light"
          />
          
          <div className="flex items-center gap-2 pr-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload} 
            />
            
            <button
              type="submit"
              className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              {useStore.getState().isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Compare'}
            </button>
          </div>
        </div>
      </form>

      {/* Intelligent Autocomplete Dropdown */}
      {isFocused && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
            <Clock className="w-3 h-3" /> Recent Searches
          </div>
          <ul className="py-2">
            {history.map((term, index) => (
              <li key={index}>
                <button
                  onClick={() => executeSearch(term)}
                  className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/80 hover:text-indigo-300 transition-colors flex items-center gap-3 group"
                >
                  <History className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
                  <span className="font-medium">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
