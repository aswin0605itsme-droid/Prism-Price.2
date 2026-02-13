
import React from 'react';
import { ArrowLeft, Check, X, AlertCircle, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { trackAndRedirect } from '../services/tracker';

export const ComparisonView: React.FC = () => {
  const { comparisonList, toggleComparison, setViewMode } = useStore();

  if (comparisonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in">
        <div className="bg-white/5 p-8 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Comparison Matrix Empty</h2>
        <p className="text-white/50 max-w-md mb-8">
          Select up to 3 products from your search results to see a detailed side-by-side technical breakdown.
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

  return (
    <div className="container mx-auto pb-20 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewMode('search')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-all border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>
        <h2 className="text-2xl font-bold text-white">Technical Matrix</h2>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `200px repeat(${comparisonList.length}, minmax(250px, 1fr))` }}>
          
          {/* Header Row (Product Images & Names) */}
          <div className="p-4 flex items-end font-bold text-white/40 uppercase tracking-widest text-xs border-b border-white/10">
            Specifications
          </div>
          {comparisonList.map((product) => (
            <div key={product.id} className="relative p-6 border-b border-white/10 bg-white/5 first:rounded-tl-3xl last:rounded-tr-3xl flex flex-col items-center text-center gap-4">
              <button 
                onClick={() => toggleComparison(product)}
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-32 h-32 bg-white/5 rounded-2xl p-4 flex items-center justify-center">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain drop-shadow-lg" />
              </div>
              <h3 className="font-bold text-white text-sm line-clamp-2">{product.name}</h3>
              <div className="flex flex-col gap-2 w-full">
                <div className="text-2xl font-black text-indigo-400">₹{product.price.toLocaleString()}</div>
                <button
                   onClick={() => trackAndRedirect(product)}
                   className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
                >
                  <ShoppingCart className="w-3 h-3" /> Buy Now
                </button>
              </div>
            </div>
          ))}

          {/* Retailer Row */}
          <div className="p-4 flex items-center font-bold text-white/60 text-sm border-b border-white/5 bg-slate-900/40">
            Retailer
          </div>
          {comparisonList.map((product) => (
            <div key={`${product.id}-retailer`} className="p-4 border-b border-white/5 flex items-center justify-center bg-slate-900/20">
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold uppercase tracking-wider text-white/80">
                {product.retailer}
              </span>
            </div>
          ))}

          {/* Dynamic Specs Rows */}
          {allSpecKeys.map((key) => (
            <React.Fragment key={key}>
              <div className="p-4 flex items-center font-medium text-white/60 text-sm border-b border-white/5 bg-slate-900/40 capitalize">
                {key}
              </div>
              {comparisonList.map((product) => {
                 const val = product.specs ? product.specs[key] : '-';
                 return (
                  <div key={`${product.id}-${key}`} className="p-4 border-b border-white/5 flex items-center justify-center bg-slate-900/20 text-white/90 font-medium">
                    {val}
                  </div>
                 );
              })}
            </React.Fragment>
          ))}
          
          {/* Empty Row Filler if needed */}
          {allSpecKeys.length === 0 && (
            <div className="col-span-full p-12 text-center text-white/30 italic">
               No technical specifications available for these products.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
