import React, { useState } from 'react';
import { ExternalLink, Cpu, X, Heart, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { analyzeProductDeeply } from '../services/gemini';
import { useStore } from '../store/useStore';
import { PriceChart } from './PriceChart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChart, setShowChart] = useState(false);
  
  const { wishlist, toggleWishlist } = useStore();
  
  const isWishlisted = wishlist.some(p => p.id === product.id || p.name === product.name);

  const getRetailerColor = (retailer: string) => {
    switch (retailer.toLowerCase()) {
      case 'amazon': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'flipkart': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'croma': return 'bg-teal-500/20 text-teal-200 border-teal-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const handleDeepThink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (analysis) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    const result = await analyzeProductDeeply(product.name);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(79,_70,_229,_0.15)] flex flex-col h-full">
      {/* Image Area */}
      <div className="relative h-64 overflow-hidden bg-black/20 p-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-overlay group-hover:scale-110 transition-transform duration-700 relative z-0 opacity-80 group-hover:opacity-100" 
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-white/10 transition-all active:scale-95 group/heart"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white group-hover/heart:text-red-400'}`} />
        </button>

        <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md uppercase tracking-wide ${getRetailerColor(product.retailer)}`}>
          {product.retailer}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-baseline justify-between mt-auto mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-white/60">{product.currency}</span>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              {product.price.toLocaleString('en-IN')}
            </span>
          </div>
          
          <button 
            onClick={() => setShowChart(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-white/50 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 transition-all"
            title="View Price History"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>

        {/* Chart Modal Overlay */}
        {showChart && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl p-6 animate-in fade-in zoom-in-95 duration-200">
             <button 
              onClick={() => setShowChart(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
             >
               <X className="w-5 h-5" />
             </button>
             <PriceChart currentPrice={product.price} productName={product.name} />
          </div>
        )}

        {/* Analysis Result Overlay */}
        {analysis && (
          <div className="absolute inset-0 bg-slate-900/95 z-30 p-6 overflow-y-auto backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-4">
               <h4 className="text-indigo-400 font-bold flex items-center gap-2">
                 <Cpu className="w-4 h-4" /> AI Verdict
               </h4>
               <button onClick={() => setAnalysis(null)} className="p-1 hover:bg-white/10 rounded-full">
                 <X className="w-5 h-5 text-white" />
               </button>
             </div>
             <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-light">
               {analysis}
             </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={handleDeepThink}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-all border border-white/5 hover:border-white/20"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">Thinking...</span>
            ) : (
              <>
                <Cpu className="w-4 h-4" /> Analyze
              </>
            )}
          </button>
          
          <a 
            href={product.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          >
            Buy Now <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};