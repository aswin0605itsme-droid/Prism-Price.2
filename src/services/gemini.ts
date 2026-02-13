import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Declare process to avoid TypeScript errors in Vite environment
declare var process: {
  env: {
    API_KEY: string;
  };
};

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
// We assume this variable is pre-configured and accessible.
const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Models - Updated to use Gemini 3 and 2.5 series as per guidelines
const SEARCH_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview"; 
const IMAGE_GEN_MODEL = "gemini-2.5-flash-image";

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Find real-time prices for "${query}" in India. Search Amazon.in and Flipkart. Return a JSON array of products with id, name, price (number), retailer, imageUrl, link, and specs.`,
      config: {
        tools: [{ googleSearch: {} }], // Use Search Grounding with Gemini 3 Flash
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
    // Return fallback data
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
      model: PRO_MODEL, // Use Pro model for complex reasoning tasks
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
    // Use Chat API for correct context handling
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
    const response = await ai.models.generateContent({
      model: IMAGE_GEN_MODEL,
      contents: {
        parts: [
            { text: prompt }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: ratio as any // Cast to any to satisfy specific string literal types if needed
        }
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    
    return `https://placehold.co/600x600/1e1e2e/FFF?text=${encodeURIComponent(prompt.slice(0, 20))}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return "https://placehold.co/600x400?text=Service+Unavailable";
  }
};