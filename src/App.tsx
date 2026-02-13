import React from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ChatBot } from './components/ChatBot';
import { ImageGen } from './components/ImageGen';
import { FilterBar } from './components/FilterBar';
import { Wishlist } from './components/Wishlist';
import { useStore } from './store/useStore';
import { Zap, Tag, Box, Heart } from 'lucide-react';

function App() {
  const { products, isLoading, viewMode, setViewMode, wishlist, filters } = useStore();

  // Filter Logic
  const filteredProducts = products.filter(product => {
    // 1. Retailer Filter
    if (filters.retailers.length > 0 && !filters.retailers.includes(product.retailer)) {
      return false;
    }
    // 2. Price Filter
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      {/* Sticky Header Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('search')}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
               <Zap className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-xl tracking-tight text-white hidden md:block">Prism Price</span>
          </div>

          <button 
            onClick={() => setViewMode(viewMode === 'wishlist' ? 'search' : 'wishlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
              viewMode === 'wishlist' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)]' 
              : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${viewMode === 'wishlist' ? 'fill-white' : ''}`} />
            <span className="font-medium">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs font-bold">{wishlist.length}</span>
            )}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-24 relative z-10">
        
        {viewMode === 'search' ? (
          <>
            {/* Header */}
            <header className="text-center mb-12 space-y-4 animate-in slide-in-from-top-10 fade-in duration-700">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Perfect Deal</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto font-light">
                Search across major retailers instantly. AI-powered price analysis and history tracking.
              </p>
            </header>

            {/* Search Section */}
            <section className="mb-12">
              <SearchBar />
            </section>

            {/* Filters */}
            {products.length > 0 && !isLoading && (
              <FilterBar />
            )}

            {/* Results Grid */}
            {products.length > 0 && (
              <section className="mb-24">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Tag className="text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">Found Deals</h2>
                    <span className="text-white/40 text-sm font-normal">({filteredProducts.length} results)</span>
                  </div>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-white/50">No products match your filters.</p>
                    <button 
                       onClick={() => useStore.getState().resetFilters()}
                       className="mt-4 text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product, idx) => (
                      <div key={idx} style={{ animationDelay: `${idx * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="font-light tracking-wide animate-pulse">Analyzing retailers & crunching numbers...</p>
              </div>
            )}

            {/* Features / Image Gen Section */}
            <section className="max-w-5xl mx-auto">
              <ImageGen />
            </section>

            {/* Empty State / Decor */}
            {!isLoading && products.length === 0 && (
              <div className="text-center text-white/20 py-10">
                <Box className="w-24 h-24 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Start by searching for a product or upload an image.</p>
              </div>
            )}
          </>
        ) : (
          <Wishlist />
        )}
      </div>

      <ChatBot />
    </div>
  );
}

export default App;