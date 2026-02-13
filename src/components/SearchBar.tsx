import React, { useState, useRef } from 'react';
import { Search, Upload, Loader2, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchProducts, analyzeImage } from '../services/gemini';

export const SearchBar: React.FC = () => {
  const [localQuery, setLocalQuery] = useState('');
  const { setSearchQuery, setProducts, setIsLoading } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;

    setSearchQuery(localQuery);
    setIsLoading(true);
    setProducts([]); // Clear previous

    const results = await searchProducts(localQuery);
    setProducts(results);
    setIsLoading(false);
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
        setLocalQuery(analysis.slice(0, 50) + "..."); // Simplified for demo
        // Trigger search based on analysis
        const results = await searchProducts(analysis);
        setProducts(results);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
          <Search className="text-white/50 ml-4 w-6 h-6" />
          <input
            type="text"
            value={localQuery}
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
    </div>
  );
};