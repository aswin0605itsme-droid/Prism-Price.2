import React, { useState, useEffect } from 'react';
import { ExternalLink, BrainCircuit, X, Heart, TrendingUp, ShoppingBag, ShieldCheck, Sparkles, Loader2, Scale, ArrowRight, ImageOff } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);
  
  const { wishlist, toggleWishlist, comparisonList, toggleComparison, addToRecentlyViewed } = useStore();
  
  const isWishlisted = wishlist.some(p => p.id === product.id || p.name === product.name);
  const isComparing = comparisonList.some(p => p.id === product.id);

  // Reset image error state when product changes
  useEffect(() => {
    setImageError(false);
  }, [product.imageUrl]);

  // Retailer specific styling with gradients
  const getRetailerTheme = (retailer: string) => {
    switch (retailer.toLowerCase()) {
      case 'amazon': return { 
        bg: 'from-amber-500/10 to-transparent',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
        border: 'group-hover:border-amber-500/30',
        glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      };
      case 'flipkart': return { 
        bg: 'from-blue-500/10 to-transparent',
        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
        border: 'group-hover:border-blue-500/30',
        glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      };
      case 'croma': return { 
        bg: 'from-teal-500/10 to-transparent',
        badge: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
        border: 'group-hover:border-teal-500/30',
        glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]',
      };
      case 'reliance digital': return { 
        bg: 'from-red-500/10 to-transparent',
        badge: 'bg-red-500/20 text-red-400 border-red-500/20',
        border: 'group-hover:border-red-500/30',
        glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
      };
      default: return { 
        bg: 'from-indigo-500/10 to-transparent',
        badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
        border: 'group-hover:border-indigo-500/30',
        glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
      };
    }
  };

  const theme = getRetailerTheme(product.retailer);

  const handleDeepThink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    addToRecentlyViewed(product); // Track Interaction
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
    addToRecentlyViewed(product);
    trackAndRedirect(product);
  };

  const handleShowChart = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToRecentlyViewed(product);
      setShowChart(true);
  }

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col h-full ${theme.border} ${theme.glow}`}>
      
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      {/* Top Media Section */}
      <div className="relative h-60 p-6 flex items-center justify-center overflow-hidden">
         {/* Floating Actions */}
         <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
           <button 
             onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
             className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 ${
               isWishlisted ? 'bg-red-500/80 text-white shadow-red-500/30 shadow-lg' : 'bg-black/30 text-white/70 hover:bg-white/10 hover:text-white'
             }`}
             title="Add to Wishlist"
           >
             <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); toggleComparison(product); }}
             className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 ${
               isComparing ? 'bg-cyan-500/80 text-white shadow-cyan-500/30 shadow-lg' : 'bg-black/30 text-white/70 hover:bg-white/10 hover:text-white'
             }`}
             title="Compare"
           >
             <Scale className="w-4 h-4" />
           </button>
         </div>

         {/* Product Image with Fallback */}
         {!imageError ? (
            <img 
            src={product.imageUrl} 
            alt={product.name} 
            onError={handleImageError}
            className="w-full h-full object-contain z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out" 
            />
         ) : (
             <div className="w-full h-full flex flex-col items-center justify-center z-10 opacity-40">
                <ImageOff className="w-12 h-12 mb-2" />
                <span className="text-xs uppercase tracking-wider font-bold">No Image</span>
             </div>
         )}
         
         
         {/* Verification Badge */}
         <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified
         </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative z-10 bg-gradient-to-t from-slate-950/80 to-transparent">
        
        {/* Retailer & Title */}
        <div className="mb-4">
           <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 border backdrop-blur-sm ${theme.badge}`}>
             <ShoppingBag className="w-3 h-3" />
             {product.retailer}
           </div>
           <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors min-h-[3.5rem]">
             {product.name}
           </h3>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/5">
           <div className="flex flex-col">
              <span className="text-xs text-white/40 font-medium mb-0.5">Current Price</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-sm font-bold text-indigo-400">₹</span>
                 <span className="text-3xl font-black text-white tracking-tight">{product.price.toLocaleString('en-IN')}</span>
              </div>
           </div>
           <button 
             onClick={handleShowChart}
             className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-indigo-400 transition-colors"
             title="View Price History"
           >
             <TrendingUp className="w-5 h-5" />
           </button>
        </div>

        {/* Buttons */}
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-3">
           <a 
             href={product.link}
             onClick={handleGetDeal}
             className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] hover:bg-indigo-50 transition-all group/btn"
           >
             Get Deal 
             <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
           </a>

           <button 
             onClick={handleDeepThink}
             disabled={isAnalyzing}
             className={`flex items-center justify-center p-3.5 rounded-xl border transition-all ${
               isAnalyzing 
                 ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                 : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 text-white/60 hover:text-indigo-400'
             }`}
             title="AI Deep Analysis"
           >
             {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
           </button>
        </div>
      </div>

      {/* Overlays (Chart & Analysis) */}
      {showChart && (
        <div className="absolute inset-0 z-40 bg-slate-950/98 backdrop-blur-2xl p-6 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <span className="text-xs font-black uppercase tracking-widest text-white/40">Price History</span>
             <button onClick={() => setShowChart(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
               <X className="w-4 h-4 text-white" />
             </button>
           </div>
           <div className="flex-grow">
              <PriceChart currentPrice={product.price} productName={product.name} />
           </div>
        </div>
      )}

      {analysis && (
        <div className="absolute inset-0 z-50 bg-indigo-950/95 backdrop-blur-xl p-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-2 text-indigo-300">
               <Sparkles className="w-5 h-5" />
               <span className="font-bold text-sm uppercase tracking-wider">AI Verdict</span>
             </div>
             <button onClick={() => setAnalysis(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
               <X className="w-4 h-4 text-white" />
             </button>
           </div>
           
           <div className="prose prose-invert prose-sm">
             <p className="text-white/90 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4">
               "{analysis}"
             </p>
           </div>
           
           <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-white/30 font-mono uppercase">
             <span>Gemini 3 Pro Analysis</span>
             <span>Prism Intelligence</span>
           </div>
        </div>
      )}
    </div>
  );
};