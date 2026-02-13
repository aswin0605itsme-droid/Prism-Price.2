
import { create } from 'zustand';
import { Product, ChatMessage, FilterState, ViewMode } from '../types';

interface AppState {
  searchQuery: string;
  products: Product[];
  isLoading: boolean;
  isThinking: boolean;
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  wishlist: Product[];
  comparisonList: Product[];
  viewMode: ViewMode;
  filters: FilterState;
  
  setSearchQuery: (query: string) => void;
  setProducts: (products: Product[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsThinking: (thinking: boolean) => void;
  addChatMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  toggleWishlist: (product: Product) => void;
  toggleComparison: (product: Product) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const saveWishlist = (wishlist: Product[]) => {
  try {
    localStorage.setItem('prism_wishlist', JSON.stringify(wishlist));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
};

const loadWishlist = (): Product[] => {
  try {
    const saved = localStorage.getItem('prism_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const useStore = create<AppState>((set) => ({
  searchQuery: '',
  products: [],
  isLoading: false,
  isThinking: false,
  chatMessages: [{
    id: 'init',
    role: 'model',
    text: 'Hello! I am Prism AI. Ask me anything about tech products or price trends.',
    timestamp: Date.now()
  }],
  isChatOpen: false,
  wishlist: loadWishlist(),
  comparisonList: [], // New Comparison State
  viewMode: 'search',
  filters: {
    retailers: [],
    minPrice: '',
    maxPrice: ''
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setProducts: (products) => set({ products }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsThinking: (isThinking) => set({ isThinking }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.some((p) => p.id === product.id || p.name === product.name);
    let newWishlist;
    if (exists) {
      newWishlist = state.wishlist.filter((p) => p.id !== product.id && p.name !== product.name);
    } else {
      newWishlist = [...state.wishlist, product];
    }
    saveWishlist(newWishlist);
    return { wishlist: newWishlist };
  }),

  // Toggle Comparison Logic (Max 4 items)
  toggleComparison: (product) => set((state) => {
    const exists = state.comparisonList.some((p) => p.id === product.id);
    if (exists) {
      return { comparisonList: state.comparisonList.filter((p) => p.id !== product.id) };
    }
    if (state.comparisonList.length >= 3) {
      // Optional: Add a toast notification here in a real app
      return state; 
    }
    return { comparisonList: [...state.comparisonList, product] };
  }),

  setViewMode: (viewMode) => set({ viewMode }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  resetFilters: () => set({
    filters: { retailers: [], minPrice: '', maxPrice: '' }
  })
}));
