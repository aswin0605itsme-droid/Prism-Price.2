import { GoogleGenerativeAI } from "@google/generative-ai"; // <--- SWITCHED TO STABLE SDK
import { Product } from "../types";

// --- CONFIGURATION ---

// Use the standard VITE env variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("CRITICAL: API Key missing. Check .env file.");
}

// Initialize the Stable Client
const genAI = new GoogleGenerativeAI(API_KEY);

// --- MAIN SEARCH FUNCTION ---

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Use the reliable 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert shopping assistant. Estimate the current market price for: "${query}" in India.
            
    OUTPUT RULES:
    1. Return a JSON array ONLY.
    2. Suggest 3 reliable retailers (e.g., Amazon.in, Flipkart, Croma).
    3. Use realistic estimated pricing in INR.
    
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
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text.replace(/^```json\n?|\n?```$/g, '').trim();

    const rawProducts = JSON.parse(jsonStr);

    return rawProducts.map((p: any) => ({
      id: p.id || Math.random().toString(36).substring(7),
      name: p.name,
      price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^0-9]/g, '')) : p.price,
      currency: p.currency || "INR",
      retailer: p.retailer || "Unknown",
      imageUrl: p.imageUrl || "https://placehold.co/400?text=Product",
      link: p.link || "#",
      specs: (p.specs && !Array.isArray(p.specs)) ? p.specs : {}
    }));

  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

// --- ADDITIONAL FEATURES ---

export const chatWithGemini = async (history: any[], newMessage: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'ai' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }))
    });
    
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Fix Base64 format if needed (remove "data:image/..." header)
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    
    const result = await model.generateContent([
        "Identify this product and estimate its price in India (INR).",
        {
            inlineData: {
                data: cleanBase64,
                mimeType: mimeType
            }
        }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Vision Error:", error);
    return "Could not identify image.";
  }
};

export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Analyze the value for money of "${productName}" in 50 words.`);
    return result.response.text();
  } catch (error) {
    return "Analysis unavailable.";
  }
};

export const generateConceptImage = async (prompt: string): Promise<string> => {
    return "https://placehold.co/600x400?text=Concept+Image";
};