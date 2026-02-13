import React from 'react';
import { Filter, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, products } = useStore();
  
  // Extract available retailers dynamically from current products
  const availableRetailers = Array.from(new Set(products.map(p => p.retailer))) as string[];
  const allRetailers: string[] = availableRetailers.length > 0 ? availableRetailers : ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital'];

  const toggleRetailer = (retailer: string) => {
    const current = filters.retailers;
    if (current.includes(retailer)) {
      setFilters({ retailers: current.filter(r => r !== retailer) });
    } else {
      setFilters({ retailers: [...current, retailer] });
    }
  };

  const hasFilters = filters.retailers.length > 0 || filters.minPrice !== '' || filters.maxPrice !== '';

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-lg">
        
        {/* Retailer Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium mr-2">
            <Filter className="w-4 h-4" />
            <span>Retailers:</span>
          </div>
          {allRetailers.map((retailer) => (
            <button
              key={retailer}
              onClick={() => toggleRetailer(retailer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                filters.retailers.includes(retailer)
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {retailer}
            </button>
          ))}
        </div>

        {/* Price Filters */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
            <span className="text-white/30 text-xs pl-2">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ minPrice: e.target.value })}
              className="w-20 bg-transparent border-none text-white text-sm focus:outline-none p-1 placeholder-white/20"
            />
            <span className="text-white/30">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ maxPrice: e.target.value })}
              className="w-20 bg-transparent border-none text-white text-sm focus:outline-none p-1 placeholder-white/20"
            />
          </div>
          
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="p-2 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};