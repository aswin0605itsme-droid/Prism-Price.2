import React, { useState, useRef, useEffect } from 'react';
import { Search, Camera, Loader2, History, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { searchProducts, analyzeImage } from '../services/gemini';
import { useSearchHistory } from '../hooks/useSearchHistory';

// Expanded Mock Predictive Suggestions
const TRENDING_SEARCHES = [
  "iPhone 15 Pro Max", 
  "Samsung Galaxy S24 Ultra", 
  "Sony WH-1000XM5", 
  "MacBook Air M3", 
  "PlayStation 5 Slim", 
  "Nintendo Switch OLED", 
  "iPad Air 2024", 
  "Dell XPS 13", 
  "GoPro Hero 12",
  "Nothing Phone 2",
  "Xbox Series X",
  "Dyson Airwrap",
  "Garmin Fenix 7",
  "Fujifilm X100VI",
  "Kindle Paperwhite Signature"
];

// Messages to cycle through while loading
const LOADING_MESSAGES = [
  "Connecting to Neural Network...",
  "Scanning Amazon.in...",
  "Browsing Flipkart...",
  "Checking Reliance Digital...",
  "Comparing Croma Deals...",
  "Analyzing Price Trends...",
  "Verifying Sellers...",
  "Finalizing Comparison..."
];

export const SearchBar: React.FC = () => {
  const [localQuery, setLocalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setSearchQuery, setProducts, setIsLoading, setLoadingStatus, isLoading, loadingStatus } = useStore();
  const { history, addToHistory } = useSearchHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    setProducts([]); 
    
    // Status message simulation
    let msgIndex = 0;
    setLoadingStatus(LOADING_MESSAGES[0]);
    const statusInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
        setLoadingStatus(LOADING_MESSAGES[msgIndex]);
    }, 800);

    try {
        const results = await searchProducts(query);
        setProducts(results);
    } catch (e) {
        console.error("Search failed", e);
    } finally {
        clearInterval(statusInterval);
        setIsLoading(false);
    }
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
    setLoadingStatus("Processing Visual Data...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        const analysis = await analyzeImage(base64String, file.type);
        setLocalQuery(analysis.slice(0, 50) + "...");
        setLoadingStatus("Searching for products...");
        const results = await searchProducts(analysis);
        setProducts(results);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Filter History based on input
  const filteredHistory = history.filter(item => 
    item.toLowerCase().includes(localQuery.toLowerCase())
  ).slice(0, 5);

  // Filter Trending based on input and exclude what's already in history
  const filteredTrending = TRENDING_SEARCHES.filter(
    s => s.toLowerCase().includes(localQuery.toLowerCase()) && !history.includes(s)
  ).slice(0, 5);

  const showDropdown = isFocused && (filteredHistory.length > 0 || filteredTrending.length > 0);

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
            disabled={isLoading}
            placeholder={isLoading ? "Searching..." : "Search for iPhone 15, Sony Headphones..."}
            className="w-full bg-transparent border-none outline-none text-white text-lg px-4 py-3 placeholder-white/30 font-light disabled:opacity-50"
          />
          
          <div className="flex items-center gap-2 pr-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white disabled:opacity-30"
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
              disabled={isLoading}
              className={`bg-white text-indigo-900 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all active:scale-95 flex items-center gap-2 ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search Prices'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Loading Indicator Status Text */}
      {isLoading && (
        <div className="absolute -bottom-8 left-4 right-0 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">{loadingStatus}</span>
        </div>
      )}

      {/* Unified Dropdown */}
      {showDropdown && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-white/5">
          
          {filteredHistory.length > 0 && (
            <div>
                <div className="px-4 py-3 flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5">
                    <Clock className="w-3 h-3" /> Recent
                </div>
                <ul className="py-1">
                    {filteredHistory.map((term, index) => (
                    <li key={`hist-${index}`}>
                        <button
                        onClick={() => executeSearch(term)}
                        className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/80 hover:text-indigo-300 transition-colors flex items-center gap-3 group"
                        >
                        <History className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-medium text-sm">{term}</span>
                        </button>
                    </li>
                    ))}
                </ul>
            </div>
          )}

          {filteredTrending.length > 0 && (
             <div>
                <div className="px-4 py-3 flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5">
                    <TrendingUp className="w-3 h-3 text-purple-400" /> Trending Products
                </div>
                <ul className="py-1">
                    {filteredTrending.map((term, index) => (
                    <li key={`trend-${index}`}>
                        <button
                        onClick={() => executeSearch(term)}
                        className="w-full text-left px-5 py-3 hover:bg-white/5 text-white/80 hover:text-purple-300 transition-colors flex items-center gap-3 group"
                        >
                        <Sparkles className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors" />
                        <span className="font-medium text-sm">{term}</span>
                        </button>
                    </li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};