import React from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ChatBot } from './components/ChatBot';
import { ImageGen } from './components/ImageGen';
import { useStore } from './store/useStore';
import { Zap, Tag, Box } from 'lucide-react';

function App() {
  const { products, isLoading } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium backdrop-blur-md mb-4">
            <Zap className="w-4 h-4 fill-indigo-300" />
            <span>Powered by Gemini 3 Flash & Pro</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white">
            Prism <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Price</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            The next-generation price comparison engine. AI-driven insights, real-time tracking, and visual intelligence.
          </p>
        </header>

        {/* Search Section */}
        <section className="mb-20">
          <SearchBar />
        </section>

        {/* Results Grid */}
        {products.length > 0 && (
          <section className="mb-24 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex items-center gap-3 mb-8">
              <Tag className="text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Found Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <div key={idx} style={{ animationDelay: `${idx * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
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
          <div className="text-center text-white/20 py-20">
            <Box className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Start by searching for a product or upload an image.</p>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}

export default App;