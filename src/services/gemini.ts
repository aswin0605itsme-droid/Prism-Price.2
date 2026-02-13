import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Declare process to ensure TypeScript compatibility as we must use process.env.API_KEY
declare const process: { env: { API_KEY: string } };

// Lazy initialization holder
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  
  // Guideline: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key is missing. Check process.env.API_KEY.");
    return null;
  }
  
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

/**
 * Searches for products using Gemini 3 Flash with Google Search Grounding.
 * Actively browses for current real-world prices.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert shopping assistant. Your goal is to find the specific product "${query}" across multiple Indian retailers (Amazon.in, Flipkart, Croma, Reliance Digital) to help the user compare prices.

      INSTRUCTIONS:
      1. Search specifically for "${query}" on the web.
      2. Find distinct listings for this product from different retailers.
      3. Extract the PRECISE Deep Link (URL) to the specific product page. Do NOT return the retailer's homepage.
      4. Extract the current price.

      OUTPUT FORMAT:
      Return a JSON array of objects. 
      
      {
        "id": "unique_id_from_retailer",
        "name": "Exact Product Title found on site",
        "price": 12345 (number),
        "currency": "INR",
        "retailer": "Amazon" | "Flipkart" | "Croma" | "Reliance Digital",
        "imageUrl": "url_of_product_image",
        "link": "https://www.amazon.in/dp/B0...", // MUST BE A DEEP LINK
        "specs": {
            "RAM": "8GB",
            "Storage": "256GB" 
            // etc
        }
      }

      Strictly ensure the "link" field is a direct link to the product page.`,
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
                type: Type.OBJECT,
                properties: {}, 
                description: "Key-value pairs of technical specifications"
              }
            },
            required: ["name", "price", "retailer", "link", "imageUrl"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) return [];
    const cleanedJson = jsonStr.replace(/^```json\n?|\n?```$/g, '');
    return JSON.parse(cleanedJson) as Product[];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

/**
 * Generates a chatbot response using Gemini 3 Pro.
 */
export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  const ai = getAiClient();
  if (!ai) return "I'm currently offline due to a missing configuration.";

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are Prism Assistant, a specialist in price tracking and gadget advice. Help users find the best value for their money."
      }
    });
    
    const response = await chat.sendMessage({ message: newMessage });
    return response.text ?? "I'm having a bit of trouble connecting right now.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having a bit of trouble connecting right now.";
  }
};

/**
 * Provides a deep technical analysis using Gemini 3 Pro.
 */
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Analysis unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide a detailed value-for-money analysis for "${productName}". Compare its current price against its performance and competitors.`,
    });
    return response.text ?? "Analysis unavailable.";
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return "Deep analysis is currently unavailable.";
  }
};

/**
 * Analyzes an uploaded image using Gemini 3 Pro.
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Image analysis unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Identify this exact product and its estimated current price in INR. Give me a name I can search for." }
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
 * Generates a concept image using Gemini 2.5 Flash Image.
 */
export const generateConceptImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) throw new Error("Image generation unavailable");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    // Iterate through all parts to find the image part
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