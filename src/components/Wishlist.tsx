import React from 'react';
import { Heart, ArrowLeft, Box } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProductCard } from './ProductCard';

export const Wishlist: React.FC = () => {
  const { wishlist, setViewMode } = useStore();

  return (
    <div className="container mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewMode('search')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-all border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-full">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your Wishlist</h2>
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold">{wishlist.length}</span>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-white/10">
          <div className="p-6 bg-white/5 rounded-full mb-4">
            <Heart className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-white/50 max-w-md text-center mb-6">
            Start searching for products and tap the heart icon to save them for later price tracking.
          </p>
          <button 
            onClick={() => setViewMode('search')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
          >
            Find Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id || product.name} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};