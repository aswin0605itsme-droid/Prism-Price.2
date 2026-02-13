import React from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ChatBot } from './components/ChatBot';
import { FilterBar } from './components/FilterBar';
import { Wishlist } from './components/Wishlist';
import { ComparisonView } from './components/ComparisonView';
import { useStore } from './store/useStore';
import { Zap, Tag, Heart, BarChart3, ShieldCheck, Scale, History as HistoryIcon, Flame, AlertCircle } from 'lucide-react';
import { Product } from './types';

// Mock Trending Data for Landing Page with reliable Placeholders
const TRENDING_PRODUCTS: Product[] = [
  {
    id: 't1',
    name: 'Sony WH-1000XM5 Noise Canceling',
    price: 29990,
    currency: 'INR',
    retailer: 'Amazon',
    imageUrl: 'https://placehold.co/600x600/1e293b/FFF?text=Sony+XM5',
    link: 'https://amazon.in',
    specs: { 'Battery': '30 Hours', 'Weight': '250g', 'Driver': '30mm', 'Connectivity': 'BT 5.2' }
  },
  {
    id: 't2',
    name: 'Apple MacBook Air M3',
    price: 114900,
    currency: 'INR',
    retailer: 'Croma',
    imageUrl: 'https://placehold.co/600x600/1e293b/FFF?text=MacBook+Air+M3',
    link: 'https://croma.com',
    specs: { 'Chip': 'M3', 'Ram': '8GB', 'SSD': '256GB', 'Display': '13.6 inch' }
  },
  {
    id: 't3',
    name: 'Samsung Galaxy S24 Ultra',
    price: 129999,
    currency: 'INR',
    retailer: 'Flipkart',
    imageUrl: 'https://placehold.co/600x600/1e293b/FFF?text=Galaxy+S24+Ultra',
    link: 'https://flipkart.com',
    specs: { 'Camera': '200MP', 'Battery': '5000 mAh', 'Processor': 'Snapdragon 8 Gen 3', 'Pen': 'Included' }
  }
];

function App() {
  const { products, isLoading, loadingStatus, viewMode, setViewMode, wishlist, filters, comparisonList, recentlyViewed, error, setError } = useStore();

  const filteredProducts = products.filter(product => {
    if (filters.retailers.length > 0 && !filters.retailers.includes(product.retailer)) {
      return false;
    }
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] relative overflow-x-hidden font-sans">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setViewMode('search')}>
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
               <Zap className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-xl tracking-tight text-white hidden md:block group-hover:text-indigo-200 transition-colors">Prism Price</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Compare Button with Badge */}
            <button 
              onClick={() => setViewMode('compare')}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-sm font-bold ${
                viewMode === 'compare' 
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Scale className={`w-4 h-4 ${viewMode === 'compare' ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">Compare</span>
              {comparisonList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-cyan-400 text-slate-900 rounded-full text-[10px] font-black border-2 border-slate-900">{comparisonList.length}</span>
              )}
            </button>

            <button 
              onClick={() => setViewMode(viewMode === 'wishlist' ? 'search' : 'wishlist')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border text-sm font-bold ${
                viewMode === 'wishlist' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)]' 
                : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${viewMode === 'wishlist' ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{wishlist.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Global Error Banner */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top-4">
           <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3 shadow-2xl">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                 <h4 className="font-bold text-sm mb-1 text-red-400">Error Occurred</h4>
                 <p className="text-sm opacity-90">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
                  <span className="sr-only">Dismiss</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-28 relative z-10">
        
        {viewMode === 'search' && (
          <>
            <header className="text-center mb-16 space-y-4 animate-in slide-in-from-top-10 fade-in duration-700">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
                Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Instantly</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Real-time pricing from Amazon, Flipkart, Croma, and Reliance Digital.
              </p>
            </header>

            <section className="mb-16">
              <SearchBar />
            </section>

            {/* Front Page Recommendations (Only show if no search results yet) */}
            {products.length === 0 && !isLoading && (
              <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Recently Viewed Carousel */}
                {recentlyViewed.length > 0 && (
                   <section>
                      <div className="flex items-center gap-3 mb-6 px-2">
                         <HistoryIcon className="text-indigo-400 w-5 h-5" />
                         <h2 className="text-xl font-bold text-white uppercase tracking-wider">Recently Viewed</h2>
                      </div>
                      <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {recentlyViewed.map((product) => (
                             <div key={`recent-${product.id}`} className="min-w-[280px] md:min-w-[320px] snap-center">
                                <ProductCard product={product} />
                             </div>
                          ))}
                      </div>
                   </section>
                )}

                {/* Trending Products */}
                <section>
                   <div className="flex items-center gap-3 mb-6 px-2">
                      <Flame className="text-orange-500 w-5 h-5" />
                      <h2 className="text-xl font-bold text-white uppercase tracking-wider">Trending Now</h2>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {TRENDING_PRODUCTS.map((product) => (
                          <ProductCard key={`trend-${product.id}`} product={product} />
                      ))}
                   </div>
                </section>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60 border-t border-white/5 pt-12">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                    <h3 className="font-bold text-white">Price History</h3>
                    <p className="text-sm text-white/60">Track 30-day trends for any product instantly.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
                    <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    <h3 className="font-bold text-white">Verified Sellers</h3>
                    <p className="text-sm text-white/60">We only source from top-tier trusted retailers.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <h3 className="font-bold text-white">AI Verdict</h3>
                    <p className="text-sm text-white/60">Get deep technical insights on every search.</p>
                  </div>
                </div>
              </div>
            )}

            {products.length > 0 && !isLoading && (
              <FilterBar />
            )}

            {products.length > 0 && (
              <section className="mb-24">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Tag className="text-indigo-400 w-5 h-5" />
                    <h2 className="text-2xl font-bold text-white">Market Results</h2>
                    <span className="text-white/40 text-sm font-normal">({filteredProducts.length} deals)</span>
                  </div>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/50">No matching deals found for your current filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product, idx) => (
                      <div key={idx} style={{ animationDelay: `${idx * 50}ms` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                   <p className="font-bold tracking-widest uppercase text-xs text-indigo-400 animate-pulse">{loadingStatus}</p>
                   <p className="text-xs text-white/30">Powered by Gemini 3 Flash</p>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === 'wishlist' && <Wishlist />}
        {viewMode === 'compare' && <ComparisonView />}
      </div>

      <ChatBot />
    </div>
  );
}

export default App;