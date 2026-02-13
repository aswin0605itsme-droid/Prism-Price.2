
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize Gemini Client using the mandatory process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for products using Gemini 3 Flash with Google Search Grounding.
 * Actively browses for current real-world prices.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a real-time web search for the latest prices of "${query}" across major Indian electronics retailers: Amazon.in, Flipkart, Croma, and Reliance Digital. 
      Return a JSON array of specific, currently available products.
      
      CRITICAL: Include a "specs" object with 3-4 key technical specifications (e.g., RAM, Storage, Battery, Screen Size) for comparison.
      
      Format:
      {
        "id": "unique_string",
        "name": "Full product name including specs",
        "price": number,
        "currency": "INR",
        "retailer": "Amazon" | "Flipkart" | "Croma" | "Reliance Digital",
        "imageUrl": "valid_image_url",
        "link": "direct_product_page_url",
        "specs": {
            "key": "value"
        }
      }
      If exact prices vary, provide the most current one found.`,
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
                properties: {}, // Allow any key
                description: "Key-value pairs of technical specifications"
              }
            },
            required: ["name", "price", "retailer", "link", "imageUrl"],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
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
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are Prism Assistant, a specialist in price tracking and gadget advice. Help users find the best value for their money."
      }
    });
    
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having a bit of trouble connecting right now.";
  }
};

/**
 * Provides a deep technical analysis using Gemini 3 Pro.
 */
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide a detailed value-for-money analysis for "${productName}". Compare its current price against its performance and competitors.`,
    });
    return response.text;
  } catch (error) {
    console.error("Deep Analysis Error:", error);
    return "Deep analysis is currently unavailable.";
  }
};

/**
 * Analyzes an uploaded image using Gemini 3 Pro.
 */
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
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
    return response.text;
  } catch (error) {
    console.error("Vision Error:", error);
    return "I couldn't identify the product.";
  }
};

/**
 * Generates a concept image using Gemini 2.5 Flash Image.
 * Following guidelines for nano banana series image generation.
 */
export const generateConceptImage = async (prompt: string, aspectRatio: string): Promise<string> => {
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
