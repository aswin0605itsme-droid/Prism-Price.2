
export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  retailer: 'Amazon' | 'Flipkart' | 'Croma' | 'Reliance Digital' | 'Other';
  imageUrl: string;
  link: string;
  description?: string;
  // Dynamic specs for comparison (e.g., { "RAM": "8GB", "Battery": "5000mAh" })
  specs?: Record<string, string | number>; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FilterState {
  retailers: string[];
  minPrice: string;
  maxPrice: string;
}

export type ViewMode = 'search' | 'wishlist' | 'compare';

// AspectRatio enum for Gemini image generation models
export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
}
