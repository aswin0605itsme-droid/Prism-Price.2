import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

declare var process: {
  env: {
    API_KEY: string;
  };
};

// Lazy initialization holder
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (aiClient) return aiClient;
  
  // Access the API key using process.env as per guidelines
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Configuration Error: API_KEY is undefined. Please check your .env file.");
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
      contents: `You are an expert shopping assistant. Your task is to find the Best Price for: "${query}".

      INSTRUCTIONS:
      1. If the query is generic (e.g., "Harry Potter Books"), pick the most popular specific item (e.g., "Harry Potter Box Set: The Complete Collection") and find prices for THAT specific item.
      2. Search across major Indian retailers: Amazon.in, Flipkart, Croma, Reliance Digital.
      3. EXTRACT THE DIRECT PRODUCT URL (Deep Link). Do NOT return search result pages or homepages.
      4. Ensure the price is current.

      OUTPUT FORMAT:
      Return a JSON array.
      
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
            { "key": "Language", "value": "English" },
            { "key": "Format", "value": "Paperback" }
          ]
        }
      ]

      The "link" MUST be a valid, direct URL starting with https://.`,
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
                },
                description: "List of technical specifications as key-value pairs"
              }
            },
            required: ["name", "price", "retailer", "link", "imageUrl"],
          },
        },
      },
    });

    // Robust JSON extraction
    const text = response.text || "";
    // Attempt to extract JSON if it's wrapped in markdown blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    let jsonStr = "";
    if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
    } else {
        // Fallback: try to clean raw string
        jsonStr = text.replace(/^```json\n?|\n?```$/g, '').trim();
    }

    if (!jsonStr) {
      console.warn("Gemini returned invalid JSON structure:", text);
      return [];
    }
    
    const rawProducts = JSON.parse(jsonStr);
    
    // Post-process to ensure valid links and convert specs array to object
    return rawProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        currency: p.currency,
        retailer: p.retailer,
        imageUrl: p.imageUrl,
        link: p.link?.startsWith('http') ? p.link : `https://${p.link}`,
        specs: Array.isArray(p.specs) ? p.specs.reduce((acc: any, item: any) => {
           if(item.key && item.value) acc[item.key] = item.value;
           return acc;
        }, {}) : {}
    }));

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