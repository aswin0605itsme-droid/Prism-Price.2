import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// --- 1. CONFIGURATION & SETUP ---

// Use the correct Vite environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to get the client safely
const getAiClient = (): GoogleGenAI => {
  if (!API_KEY) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing in .env file");
    throw new Error("API Key is missing. Please check your .env configuration.");
  }
  // Initialize the specific Google Gen AI SDK
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- 2. MAIN SEARCH FUNCTION (Used by SearchBar) ---

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const ai = getAiClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Using the fast, stable model
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

    // Safe JSON Parsing
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
      specs: Array.isArray(p.specs) ?