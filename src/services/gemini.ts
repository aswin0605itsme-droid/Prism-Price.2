import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Lazy initialization holder
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (aiClient) return aiClient;
  
  // FIX: Use import.meta.env for Vite instead of process.env
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Debug Log
  console.log("Checking Key:", API_KEY ? "Key Found" : "Key Missing");
  
  if (!API_KEY) {
    console.error("CRITICAL ERROR: VITE_GEMINI_API_KEY is missing. Check your .env file.");
    throw new Error('API Key missing. Please check console for details.');
  }
  
  aiClient = new GoogleGenAI({ apiKey: API_KEY });
  return aiClient;
};

/**
 * Searches for products using Gemini 3 Flash with Google Search Grounding.
 * Actively browses for current real-world prices.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Switched to stable model (Preview models often 404)
      contents: {
        parts: [
          { 
            text: `You are an expert shopping assistant. Your task is to find the Best Price for: "${query}".

            INSTRUCTIONS:
            1. If the query is generic (e.g., "Harry Potter Books"), pick the most popular specific item.
            2. Search across major Indian retailers: Amazon.in, Flipkart, Croma, Reliance Digital.
            3. EXTRACT THE DIRECT PRODUCT URL.
            4. Ensure the price is current.

            OUTPUT FORMAT:
            Return a JSON array ONLY.
            [
              {
                "id": "unique_id",
                "name": "Full Product Title",
                "price": 3500,
                "currency": "INR",
                "retailer": "Amazon",
                "imageUrl": "https://...",
                "link": "https://www.amazon.in/dp/...", 
                "specs": [
                  { "key": "Language", "value": "English" }
                ]
              }
            ]`
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    // Robust JSON extraction
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Attempt to extract JSON if it's wrapped in markdown blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    let jsonStr = "";
    if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
    } else {
        jsonStr = text.replace(/^```json\n?|\n?```$/g, '').trim();
    }

    if (!jsonStr) {
      console.warn("Gemini returned invalid JSON structure:", text);
      throw new Error("Received invalid data format from AI. Please try again.");
    }
    
    const rawProducts = JSON.parse(jsonStr);
    
    // Post-process
    return rawProducts.map((p: any) => ({
        id: p.id || Math.random().toString(36).substr(2, 9),
        name: p.name,
        price: p.price,
        currency: p.currency,
        retailer: p.retailer,
        imageUrl: p.imageUrl || "https://placehold.co/400",
        link: p.link?.startsWith('http') ? p.link : `https://${p.link}`,
        specs: Array.isArray(p.specs) ? p.specs.reduce((acc: any, item: any) => {
           if(item.key && item.value) acc[item.key] = item.value;
           return acc;
        }, {}) : {}
    }));

  } catch (error: any) {
    console.error("Search Error:", error);
    if (error.message.includes("API_KEY")) throw error;
    throw new Error("Failed to fetch product data. " + error.message);
  }
};

/**
 * Generates a chatbot response using Gemini
 */
export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const ai = getAiClient();
    // Use standard model name
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'ai' ? 'model' : 'user',
            parts: h.parts
        })),
        systemInstruction: "You are Prism Assistant, a specialist in price tracking and gadget advice."
    });
    
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm currently offline due to a connection error.";
  }
};