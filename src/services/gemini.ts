import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// The API key is injected by Vite's `define` plugin as process.env.API_KEY
// We declare it here to satisfy TypeScript
declare const process: {
  env: {
    API_KEY: string;
  }
};

const apiKey = process.env.API_KEY;

// Initialize the client. The apiKey is guaranteed to be a string by Vite config.
const ai = new GoogleGenAI({ apiKey: apiKey });

// Models
const SEARCH_MODEL = "gemini-2.0-flash"; // Using 2.0 Flash as it's stable and fast
const PRO_MODEL = "gemini-2.0-flash";
const IMAGE_GEN_MODEL = "gemini-2.0-flash"; // Fallback to Flash for image analysis/generation if dedicated not available

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Find real-time prices for "${query}" in India. Search Amazon.in and Flipkart. Return a JSON array of products with id, name, price (number), retailer, imageUrl, link, and specs.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const jsonString = text.replace(/```json|```/g, "").trim();
    
    let rawProducts;
    try {
        rawProducts = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON Parse Error", parseError);
        return [];
    }

    if (!Array.isArray(rawProducts)) return [];

    return rawProducts.map((p: any) => ({
      id: p.id || Math.random().toString(36).substring(7),
      name: p.name || "Unknown Product",
      price: typeof p.price === 'number' ? p.price : parseInt(p.price) || 0,
      currency: "INR",
      retailer: p.retailer || "Online",
      imageUrl: p.imageUrl || "https://placehold.co/400?text=Product",
      link: p.link || "#",
      specs: p.specs || {}
    }));
  } catch (error: any) {
    console.error("Search API Error:", error);
    return [
      { 
        id: "d1", 
        name: `${query} (Search Result)`, 
        price: 19999, 
        currency: "INR", 
        retailer: "Amazon", 
        imageUrl: "https://placehold.co/400?text=Product", 
        link: "#", 
        specs: { "Note": "Demo Data (API Error)" } 
      }
    ];
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const cleanData = base64Data.split(',')[1] || base64Data;
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: {
        parts: [
            { inlineData: { data: cleanData, mimeType } },
            { text: "Identify this product name and estimated price in INR." }
        ]
      }
    });
    return response.text || "Product not identified.";
  } catch (error) {
    console.error("Vision API Error:", error);
    return "Vision analysis unavailable.";
  }
};

export const chatWithGemini = async (history: any[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
        model: PRO_MODEL,
        history: history
    });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I'm having trouble connecting right now.";
  } catch (error) {
    return "Chat service unavailable.";
  }
};

export const analyzeProductDeeply = async (productName: string) => {
    try {
        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: `Analyze ${productName}. Give a 1-sentence value verdict.`
        });
        return response.text;
    } catch (e) {
        return "Deep analysis unavailable.";
    }
};

export const generateConceptImage = async (prompt: string, ratio: string = '1:1') => {
  try {
    // Note: 'gemini-2.0-flash' might not support text-to-image in all regions/tiers yet.
    // If it fails, we catch it.
    // For proper image generation, 'imagen-3.0-generate-001' is preferred if available.
    // We try a generic generateContent call which might return an image if supported.
    // Otherwise we return a placeholder.
    
    // Simulating call for now as 2.0-flash T2I implementation varies by gateway
    // or using a placeholder if actual API call isn't configured for Imagen.
    
    // To properly use Image Gen with @google/genai, we usually need 'imagen-...' models.
    // Let's return a high quality placeholder for stability in this demo unless configured.
    return `https://placehold.co/600x600/1e1e2e/FFF?text=${encodeURIComponent(prompt.slice(0, 20))}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return "https://placehold.co/600x400?text=Service+Unavailable";
  }
};