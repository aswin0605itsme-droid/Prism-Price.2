
import React, { useState } from 'react';
import { ExternalLink, BrainCircuit, X, Heart, TrendingUp, ShoppingBag, ShieldCheck, Sparkles, Loader2, Scale } from 'lucide-react';
import { Product } from '../types';
import { analyzeProductDeeply } from '../services/gemini';
import { useStore } from '../store/useStore';
import { PriceChart } from './PriceChart';
import { trackAndRedirect } from '../services/tracker';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  const { wishlist, toggleWishlist, comparisonList, toggleComparison } = useStore();
  
  const isWishlisted = wishlist.some(p => p.id === product.id || p.name === product.name);
  const isComparing = comparisonList.some(p => p.id === product.id);

  const getRetailerTheme = (retailer: string) => {
    switch (retailer.toLowerCase()) {
      case 'amazon': return { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20',
        glow: 'group-hover:shadow-amber-500/20',
      };
      case 'flipkart': return { 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-400', 
        border: 'border-blue-500/20',
        glow: 'group-hover:shadow-blue-500/20',
      };
      case 'croma': return { 
        bg: 'bg-teal-500/10', 
        text: 'text-teal-400', 
        border: 'border-teal-500/20',
        glow: 'group-hover:shadow-teal-500/20',
      };
      case 'reliance digital': return { 
        bg: 'bg-red-500/10', 
        text: 'text-red-400', 
        border: 'border-red-500/20',
        glow: 'group-hover:shadow-red-500/20',
      };
      default: return { 
        bg: 'bg-indigo-500/10', 
        text: 'text-indigo-400', 
        border: 'border-indigo-500/20',
        glow: 'group-hover:shadow-indigo-500/20',
      };
    }
  };

  const theme = getRetailerTheme(product.retailer);

  const handleDeepThink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analysis) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeProductDeeply(product.name);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetDeal = (e: React.MouseEvent) => {
    e.preventDefault();
    trackAndRedirect(product);
  };

  return (
    <div className={`group relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 flex flex-col h-full ${theme.glow} hover:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.5)]`}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Media Section */}
      <div className="relative h-56 overflow-hidden bg-slate-950/20 p-8 flex items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" 
        />
        
        {/* Floating Controls */}
        <div className="absolute top-5 right-5 z-20 flex flex-col gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90 ${
              isWishlisted ? 'bg-red-500/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-black/40 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white/60 group-hover:text-red-400'}`} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleComparison(product); }}
            className={`p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90 ${
              isComparing ? 'bg-cyan-500/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/40 hover:bg-white/10'
            }`}
          >
            <Scale className={`w-4 h-4 ${isComparing ? 'fill-cyan-500 text-cyan-500' : 'text-white/60 group-hover:text-cyan-400'}`} />
          </button>
        </div>

        {/* Floating AI badge */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest backdrop-blur-xl group-hover:border-indigo-500/40 transition-colors">
          <Sparkles className="w-3 h-3 animate-pulse" />
          AI Tracked
        </div>
      </div>

      {/* Main Info Section */}
      <div className="p-6 flex flex-col flex-grow relative z-20 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-2">
            <ShieldCheck className="w-3 h-3 text-indigo-500" /> Verified Deal
          </div>
          <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug tracking-tight min-h-[3rem] group-hover:text-indigo-200 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Integrated Footer (Retailer + Price) */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/[0.08] transition-colors">
          <div className="flex flex-col">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black border backdrop-blur-sm uppercase tracking-widest mb-2 w-fit ${theme.bg} ${theme.text} ${theme.border}`}>
              <ShoppingBag className="w-3 h-3" />
              {product.retailer}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-indigo-400 font-black">₹</span>
              <span className="text-2xl font-black text-white tracking-tighter">
                {product.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setShowChart(true)}
            className="p-3 rounded-xl bg-slate-950/40 hover:bg-indigo-500/20 text-white/30 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 transition-all shadow-xl"
            title="Price History"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={handleDeepThink}
            disabled={isAnalyzing}
            className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all relative overflow-hidden ${
              isAnalyzing 
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                : 'bg-white/5 hover:bg-indigo-500/10 border-white/10 hover:border-indigo-500/30 text-white/70'
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                Deep Think
              </>
            )}
          </button>
          
          <a 
            href={product.link} 
            onClick={handleGetDeal}
            className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black shadow-lg hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 uppercase tracking-widest cursor-pointer"
          >
            Get Deal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Overlays */}
      {showChart && (
        <div className="absolute inset-0 z-40 bg-slate-950/98 backdrop-blur-3xl p-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex justify-between items-center mb-6">
             <div className="text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Market Volatility
             </div>
             <button onClick={() => setShowChart(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60">
               <X className="w-5 h-5" />
             </button>
           </div>
           <PriceChart currentPrice={product.price} productName={product.name} />
        </div>
      )}

      {analysis && (
        <div className="absolute inset-0 bg-indigo-950/98 z-50 p-8 overflow-y-auto backdrop-blur-3xl animate-in slide-in-from-bottom-8 duration-700">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-indigo-400" />
               <h4 className="text-indigo-300 font-black text-xs uppercase tracking-[0.2em]">AI Intelligence Verdict</h4>
             </div>
             <button onClick={() => setAnalysis(null)} className="p-2 bg-white/10 rounded-full">
               <X className="w-5 h-5 text-white/60" />
             </button>
           </div>
           <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl">
              <p className="text-white/90 leading-relaxed text-sm font-medium italic">
                "{analysis}"
              </p>
           </div>
           <div className="mt-6 flex items-center gap-3 opacity-40">
              <div className="h-px flex-1 bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Prism Intelligence Engine v3.1</p>
              <div className="h-px flex-1 bg-white/20" />
           </div>
        </div>
      )}
    </div>
  );
};
