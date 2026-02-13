
import { create } from 'zustand';
import { Product, ChatMessage, FilterState, ViewMode } from '../types';

interface AppState {
  searchQuery: string;
  products: Product[];
  isLoading: boolean;
  loadingStatus: string; // New State for detailed feedback
  isThinking: boolean;
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  wishlist: Product[];
  comparisonList: Product[];
  recentlyViewed: Product[];
  viewMode: ViewMode;
  filters: FilterState;
  
  setSearchQuery: (query: string) => void;
  setProducts: (products: Product[]) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingStatus: (status: string) => void; // New Action
  setIsThinking: (thinking: boolean) => void;
  addChatMessage: (message: ChatMessage) => void;
  toggleChat: () => void;
  toggleWishlist: (product: Product) => void;
  toggleComparison: (product: Product) => void;
  addToRecentlyViewed: (product: Product) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const useStore = create<AppState>((set) => ({
  searchQuery: '',
  products: [],
  isLoading: false,
  loadingStatus: 'Initializing Search...',
  isThinking: false,
  chatMessages: [{
    id: 'init',
    role: 'model',
    text: 'Hello! I am Prism AI. Ask me anything about tech products or price trends.',
    timestamp: Date.now()
  }],
  isChatOpen: false,
  wishlist: loadFromStorage('prism_wishlist'),
  comparisonList: [], 
  recentlyViewed: loadFromStorage('prism_recent'),
  viewMode: 'search',
  filters: {
    retailers: [],
    minPrice: '',
    maxPrice: ''
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setProducts: (products) => set({ products }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingStatus: (loadingStatus) => set({ loadingStatus }),
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
    saveToStorage('prism_wishlist', newWishlist);
    return { wishlist: newWishlist };
  }),

  toggleComparison: (product) => set((state) => {
    const exists = state.comparisonList.some((p) => p.id === product.id);
    if (exists) {
      return { comparisonList: state.comparisonList.filter((p) => p.id !== product.id) };
    }
    if (state.comparisonList.length >= 4) {
      return state; 
    }
    return { comparisonList: [...state.comparisonList, product] };
  }),

  addToRecentlyViewed: (product) => set((state) => {
    const exists = state.recentlyViewed.some((p) => p.id === product.id);
    if (exists) return state;
    
    // Keep max 10 items
    const newRecent = [product, ...state.recentlyViewed].slice(0, 10);
    saveToStorage('prism_recent', newRecent);
    return { recentlyViewed: newRecent };
  }),

  setViewMode: (viewMode) => set({ viewMode }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  resetFilters: () => set({
    filters: { retailers: [], minPrice: '', maxPrice: '' }
  })
}));
