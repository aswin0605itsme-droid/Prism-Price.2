import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Lazy initialization holder
let aiClient: GoogleGenAI | null = null;

// Ensure process is defined for TS to avoid "Cannot find name 'process'"
declare const process: any;

const getAiClient = (): GoogleGenAI => {
  if (aiClient) return aiClient;
  
  // Define the key explicitly from process.env as per guidelines
  const API_KEY = process.env.API_KEY;
  
  // Debug Log as requested
  console.log("Checking Key:", API_KEY ? "Key Found" : "Key Missing");
  
  if (!API_KEY) {
    throw new Error('CRITICAL: API_KEY is missing from environment variables');
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
      model: 'gemini-3-flash-preview',
      contents: `You are an expert shopping assistant. Your task is to find the ACTUAL CURRENT PRICE for: "${query}" in India.

      INSTRUCTIONS:
      1. USE THE GOOGLE SEARCH TOOL to find real-time listings on Amazon.in, Flipkart, Croma, and Reliance Digital.
      2. If the user searches for a general term (e.g. "Iphone"), find specific popular models.
      3. EXTRACT THE DIRECT PRODUCT URL.
      4. DO NOT ESTIMATE PRICES. Use the price found in the search results.

      OUTPUT FORMAT:
      Return a JSON array of objects.
      
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
      ]`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              retailer: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              link: { type: Type.STRING },
              specs: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["key", "value"]
                }
              }
            },
            required: ["name", "price", "retailer", "link", "imageUrl"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const rawProducts = JSON.parse(text);
    
    // Convert specs array to object if needed by the frontend, or pass through
    // The schema returns an array of {key, value}, but frontend Types might expect Record<string,string>
    // Let's map it to ensure compatibility with Product type
    return rawProducts.map((p: any) => ({
        id: p.id || Math.random().toString(36).substring(7),
        name: p.name,
        price: p.price,
        currency: p.currency || 'INR',
        retailer: p.retailer || 'Online',
        imageUrl: p.imageUrl || "https://placehold.co/400?text=No+Image",
        link: p.link || "#",
        specs: Array.isArray(p.specs) ? p.specs.reduce((acc: any, item: any) => {
           if(item.key && item.value) acc[item.key] = item.value;
           return acc;
        }, {}) : {}
    }));

  } catch (error: any) {
    console.error("Search Error:", error);
    if (error.message.includes("API_KEY")) throw error;
    throw new Error("Failed to fetch product data. Please check your connection or API limit.");
  }
};

/**
 * Analyzes an uploaded image using Gemini 3 Pro.
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAiClient();
    // Ensure no data URI prefix
    const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: cleanData, mimeType } },
          { text: "Identify this exact product. Return just the product name so I can search for it." }
        ]
      },
    });
    return response.text ?? "I couldn't identify the product.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "I couldn't identify the product.";
  }
};

/**
 * Generates a chatbot response using Gemini 3 Pro.
 */
export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are Prism Assistant, a specialist in price tracking and gadget advice."
      }
    });
    
    // Note: In a real app, you would pass 'history' to chat.create or maintain session.
    // For this stateless function, we just send the new message or use generateContent if history is needed.
    // Using sendMessage on a new chat for simplicity as per previous structure.
    const response = await chat.sendMessage({ message: newMessage });
    return response.text ?? "I'm having a bit of trouble connecting right now.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm currently offline due to a missing API Key configuration.";
  }
};

/**
 * Provides a deep technical analysis using Gemini 3 Pro.
 */
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide a detailed value-for-money analysis for "${productName}". Compare its current price against its performance.`,
    });
    return response.text ?? "Analysis unavailable.";
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return "Deep analysis is currently unavailable.";
  }
};

/**
 * Generates a concept image using Gemini 2.5 Flash Image.
 */
export const generateConceptImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("No image data returned from model");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};