import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product } from "../types";

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("CRITICAL: API Key is missing. Check .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- HELPER: RESILIENT MODEL GETTER ---
// This tries to get the standard model which is most likely to work
const getModel = () => {
    // 'gemini-pro' is the safest, most widely available model
    return genAI.getGenerativeModel({ model: "gemini-pro" }); 
};

// --- MAIN SEARCH FUNCTION ---
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const model = getModel();
    
    const prompt = `You are a shopping assistant. Estimate the price for: "${query}" in India (INR).
            
    OUTPUT FORMAT:
    Return ONLY a JSON array. Do not include markdown formatting like \`\`\`json.
    
    [
      {
        "id": "1",
        "name": "Product Name",
        "price": 1000,
        "currency": "INR",
        "retailer": "Amazon",
        "imageUrl": "https://placehold.co/400",
        "link": "#",
        "specs": { "Color": "Black" }
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // CLEANUP: Remove any accidental markdown marks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const rawProducts = JSON.parse(cleanText);

    return rawProducts.map((p: any) => ({
      id: p.id || Math.random().toString(36).substring(7),
      name: p.name,
      price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^0-9]/g, '')) : p.price,
      currency: "INR",
      retailer: p.retailer || "Unknown",
      imageUrl: "https://placehold.co/400?text=Product",
      link: "#",
      specs: (p.specs && !Array.isArray(p.specs)) ? p.specs : {}
    }));

  } catch (error) {
    console.error("Search Error:", error);
    // Return a dummy product so the UI shows SOMETHING instead of crashing
    return [{
        id: "error-fallback",
        name: "Search Error - Please Try Again",
        price: 0,
        currency: "INR",
        retailer: "System",
        imageUrl: "https://placehold.co/400?text=Error",
        link: "#",
        specs: {}
    }];
  }
};

// --- CHAT FUNCTION ---
export const chatWithGemini = async (history: any[], newMessage: string) => {
  try {
    const model = getModel();
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
    return "I'm having trouble connecting. Please try again.";
  }
};

// --- IMAGE ANALYSIS ---
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    // Note: gemini-pro-vision is needed for images if gemini-1.5 fails
    // But for now, let's try the standard pro model or fallback gracefully
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    const result = await model.generateContent([
        "Identify this product.",
        { inlineData: { data: cleanBase64, mimeType: mimeType } }
    ]);
    return result.response.text();
  } catch (error) {
    return "Image analysis unavailable.";
  }
};

// --- DEEP ANALYSIS ---
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const model = getModel();
    const result = await model.generateContent(`Analyze value for money: "${productName}"`);
    return result.response.text();
  } catch (error) {
    return "Analysis unavailable.";
  }
};

export const generateConceptImage = async (prompt: string): Promise<string> => {
    return "https://placehold.co/600x400?text=Concept+Image";
};