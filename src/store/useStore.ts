import { create } from 'zustand';
import { Product, ChatMessage, GeneratedImage } from '../types';

interface AppState {
  searchQuery: string;
  products: Product[];
  isLoading: boolean;
  isThinking: boolean;
  chatMessages: ChatMessage[];
  generatedImages: GeneratedImage[];
  isChatOpen: boolean;
  
  setSearchQuery: (query: string) => void;
  setProducts: (products: Product[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsThinking: (thinking: boolean) => void;
  addChatMessage: (message: ChatMessage) => void;
  addGeneratedImage: (image: GeneratedImage) => void;
  toggleChat: () => void;
}

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
  generatedImages: [],
  isChatOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setProducts: (products) => set({ products }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsThinking: (isThinking) => set({ isThinking }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  addGeneratedImage: (image) => set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));