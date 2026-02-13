import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// --- CONFIGURATION ---

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getAiClient = (): GoogleGenAI => {
  if (!API_KEY) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing in .env file");
    throw new Error("API Key is missing. Please check your .env configuration.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- MAIN SEARCH FUNCTION ---

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const ai = getAiClient();
    
    // CHANGED TO 1.5-FLASH FOR BETTER STABILITY & FREE TIER LIMITS
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { 
            text: `You are an expert shopping assistant. Find the best price for: "${query}" in India.
            
            OUTPUT RULES:
            1. Return a JSON array ONLY.
            2. Search Amazon.in, Flipkart, and Croma.
            3. Use realistic pricing in INR.
            4. If exact matches aren't found, suggest the closest popular alternative.
            
            JSON FORMAT:
            [
              {
                "id": "unique_id",
                "name": "Product Name",
                "price": 0,
                "currency": "INR",
                "retailer": "Retailer Name",
                "imageUrl": "https://placehold.co/400?text=Product",
                "link": "https://amazon.in",
                "specs": { "Key": "Value" }
              }
            ]`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    // Robust JSON Extraction
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text.replace(/^```json\n?|\n?```$/g, '').trim();

    if (!jsonStr) throw new Error("Invalid JSON from AI");

    const rawProducts = JSON.parse(jsonStr);

    return rawProducts.map((p: any) => ({
      id: p.id || Math.random().toString(36).substring(7),
      name: p.name,
      price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^0-9]/g, '')) : p.price,
      currency: p.currency || "INR",
      retailer: p.retailer || "Unknown",
      imageUrl: p.imageUrl || "https://placehold.co/400?text=No+Image",
      link: p.link || "#",
      // Safe check for specs array
      specs: (p.specs && !Array.isArray(p.specs)) ? p.specs : {}
    }));

  } catch (error: any) {
    console.error("Search Error:", error);
    // Specific check for Quota limits
    if (error.message?.includes("429")) {
        console.warn("Quota exceeded. Please wait a minute.");
    }
    return [];
  }
};

// --- ADDITIONAL FEATURES (Fixes Build Errors) ---

/**
 * Chat functionality for the ChatBot component
 */
export const chatWithGemini = async (history: any[], newMessage: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [{ text: `User: ${newMessage}\nAI (You are a shopping assistant):` }]
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't catch that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Chat service is currently offline.";
  }
};

/**
 * Analyzes an image (Fixes SearchBar.tsx error)
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Identify this product and estimate its price in India (INR). Return just the product name and price." }
        ]
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "Could not identify image.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Image analysis failed.";
  }
};

/**
 * Deep analysis of a product (Fixes ProductDetails.tsx error)
 */
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: {
        parts: [{ text: `Analyze the value for money of "${productName}" in 50 words.` }]
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return "Deep analysis unavailable.";
  }
};

/**
 * Placeholder for Concept Image (Prevents future crashes)
 */
export const generateConceptImage = async (prompt: string): Promise<string> => {
    return "https://placehold.co/600x400?text=Concept+Image";
};