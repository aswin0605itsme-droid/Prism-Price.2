
import React from 'react';
import { ArrowLeft, X, AlertCircle, ShoppingCart, CheckCircle2, TrendingDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { trackAndRedirect } from '../services/tracker';
import { identifyWinners } from '../utils/comparisonUtils';

export const ComparisonView: React.FC = () => {
  const { comparisonList, toggleComparison, setViewMode } = useStore();

  if (comparisonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in">
        <div className="bg-white/5 p-8 rounded-full mb-6 ring-1 ring-white/10">
          <AlertCircle className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Comparison Matrix Empty</h2>
        <p className="text-white/50 max-w-md mb-8">
          Select up to 4 products from your search results to see a detailed side-by-side technical breakdown.
        </p>
        <button
          onClick={() => setViewMode('search')}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/40"
        >
          Return to Market
        </button>
      </div>
    );
  }

  // Extract all unique spec keys from all products
  const allSpecKeys = Array.from(new Set(
    comparisonList.flatMap(p => p.specs ? Object.keys(p.specs) : [])
  )) as string[];

  // Calculate Price Winners
  const prices = comparisonList.map(p => p.price);
  const minPrice = Math.min(...prices);

  return (
    <div className="container mx-auto pb-20 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewMode('search')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-all border border-white/5 hover:border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white">Technical Matrix</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">{comparisonList.length} Products Selected</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[900px] grid rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ gridTemplateColumns: `220px repeat(${comparisonList.length}, minmax(260px, 1fr))` }}>
          
          {/* Header Row (Product Images & Names) */}
          <div className="p-6 flex flex-col justify-end font-black text-white/30 uppercase tracking-[0.2em] text-xs border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
            Product DNA
          </div>
          {comparisonList.map((product) => {
            const isBestPrice = product.price === minPrice;
            return (
              <div key={product.id} className="relative p-6 border-b border-l border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col items-center text-center gap-4 group transition-colors hover:bg-white/5">
                {isBestPrice && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-b-lg border-x border-b border-green-500/30 flex items-center gap-1 shadow-[0_4px_12px_rgba(34,197,94,0.2)]">
                        <TrendingDown className="w-3 h-3" /> BEST VALUE
                    </div>
                )}
                <button 
                  onClick={() => toggleComparison(product)}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-40 h-40 bg-white/5 rounded-2xl p-4 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-500">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-xl" />
                </div>
                <h3 className="font-bold text-white text-base line-clamp-2 leading-tight min-h-[3rem]">{product.name}</h3>
                <div className="flex flex-col gap-3 w-full mt-auto">
                  <div className="flex flex-col items-center">
                     <span className={`text-3xl font-black tracking-tighter ${isBestPrice ? 'text-green-400' : 'text-white'}`}>
                        ₹{product.price.toLocaleString()}
                     </span>
                     {isBestPrice && <span className="text-[10px] text-green-400/60 uppercase font-bold tracking-widest">Lowest Price</span>}
                  </div>
                  <button
                     onClick={() => trackAndRedirect(product)}
                     className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1 ${
                         isBestPrice 
                         ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                         : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                     }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Buy Now
                  </button>
                </div>
              </div>
            );
          })}

          {/* Retailer Row */}
          <div className="p-5 flex items-center font-bold text-white/50 text-xs uppercase tracking-wider border-b border-white/5 bg-slate-950/60">
            Source Retailer
          </div>
          {comparisonList.map((product) => (
            <div key={`${product.id}-retailer`} className="p-5 border-b border-l border-white/5 flex items-center justify-center bg-slate-900/30">
              <span className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider text-white/70">
                {product.retailer}
              </span>
            </div>
          ))}

          {/* Dynamic Specs Rows with Diffing */}
          {allSpecKeys.map((key) => {
            const rowValues = comparisonList.map(p => p.specs ? p.specs[key] : undefined);
            const winners = identifyWinners(key, rowValues);

            return (
              <React.Fragment key={key}>
                <div className="p-5 flex items-center font-medium text-white/60 text-sm border-b border-white/5 bg-slate-950/60 capitalize">
                  {key}
                </div>
                {comparisonList.map((product, idx) => {
                   const val = product.specs ? product.specs[key] : '-';
                   const isWinner = winners[idx];
                   
                   return (
                    <div 
                        key={`${product.id}-${key}`} 
                        className={`p-5 border-b border-l border-white/5 flex items-center justify-center text-sm font-medium transition-colors ${
                            isWinner 
                            ? 'bg-indigo-500/10 text-indigo-300 font-bold' 
                            : 'bg-slate-900/30 text-white/70'
                        }`}
                    >
                      {isWinner && <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-indigo-400" />}
                      {val}
                    </div>
                   );
                })}
              </React.Fragment>
            );
          })}
          
        </div>
      </div>
    </div>
  );
};
