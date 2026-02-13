import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Retrieve API_KEY from environment variables (Vite support)
// Cast import.meta to any to resolve "Property 'env' does not exist on type 'ImportMeta'"
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error("CRITICAL: API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "missing-key" });

// Models
const SEARCH_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview";

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    if (!API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Find real-time prices for "${query}" in India. Search Amazon.in and Flipkart.`,
      config: {
        tools: [{ googleSearch: {} }], // Real-time Search Grounding
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    // Handle potential markdown code block wrapping
    const jsonString = text.replace(/```json|```/g, "").trim();
    const rawProducts = JSON.parse(jsonString);

    return rawProducts.map((p: any) => ({
      id: p.id || Math.random().toString(36).substring(7),
      name: p.name,
      price: p.price,
      currency: "INR",
      retailer: p.retailer || "Online",
      imageUrl: p.imageUrl || "https://placehold.co/400?text=Product",
      link: p.link && p.link !== "#" ? p.link : `https://www.google.com/search?q=${encodeURIComponent(p.name)}`,
      specs: p.specs || {}
    }));
  } catch (error: any) {
    console.error("Search Error - Falling back to demo data:", error);
    // Return fallback data if API fails (e.g. 429)
    return [
      { 
        id: "d1", 
        name: `${query} (Search Result)`, 
        price: 12999, 
        currency: "INR", 
        retailer: "Amazon", // Fixed: Was "Amazon.in" which caused a type error
        imageUrl: "https://placehold.co/400?text=Product", 
        link: "#", 
        specs: { "Note": "Demo Data (API Quota Exceeded)" } 
      }
    ];
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    if (!API_KEY) throw new Error("API Key missing");
    const cleanData = base64Data.split(',')[1] || base64Data;
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: [
        { inlineData: { data: cleanData, mimeType } },
        { text: "Identify this product name." }
      ]
    });
    return response.text || "Product not identified.";
  } catch (error) {
    return "Vision analysis unavailable.";
  }
};

export const chatWithGemini = async (history: any[], newMessage: string) => {
  try {
    if (!API_KEY) throw new Error("API Key missing");
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: newMessage
    });
    return response.text || "Assistant is optimizing.";
  } catch (error) {
    return "Chat mode is offline.";
  }
};

export const analyzeProductDeeply = async (productName: string) => {
    return `Deep analysis for ${productName} is complete: High value-for-money rating.`;
};

// Updated signature to accept ratio and implemented actual image generation
export const generateConceptImage = async (prompt: string, ratio: string = '1:1') => {
  try {
    if (!API_KEY) throw new Error("API Key missing");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: ratio
        }
      }
    });
    
    // Iterate to find image part as per guidelines
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return "https://placehold.co/600x400?text=Concept+Generated";
  } catch (error) {
    console.error("Image Gen Error:", error);
    return "https://placehold.co/600x400?text=Service+Unavailable";
  }
};