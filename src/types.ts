export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  retailer: 'Amazon' | 'Flipkart' | 'Croma' | 'Reliance Digital' | 'Other';
  imageUrl: string;
  link: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '16:9',
  WIDE = '21:9',
  ULTRAWIDE = '4:3'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}
