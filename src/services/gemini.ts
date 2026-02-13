import { GoogleGenAI, Type } from "@google/genai";
import { Product, AspectRatio } from "../types";

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// 1. Search Products with Grounding (Gemini 3 Flash + Google Search)
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find current prices for "${query}" from major Indian retailers like Amazon.in, Flipkart, Croma, and Reliance Digital. 
      Return a JSON array of 4-6 distinct products. 
      For each product, strictly allow "Amazon", "Flipkart", "Croma", "Reliance Digital" as retailers.
      Include a realistic price in INR (number only), a product name, and a direct purchase link if found (or a search link).
      Use placeholder image URLs from https://picsum.photos/400/400 if specific ones aren't available.`,
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
            },
            required: ["name", "price", "retailer"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Product[];
    }
    return [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

// 2. Chat with Gemini 3 Pro (General Assistant)
export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      history: history,
    });
    
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};

// 3. Deep Analysis with Thinking Mode (Gemini 3 Pro + Thinking Config)
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Provide a deep technical analysis and "should you buy" verdict for: ${productName}. 
      Compare it with its top 2 competitors. Be critical and concise.`,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // allocating budget for reasoning
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Analysis unavailable.";
  }
};

// 4. Generate Product Concept (Image Gen)
export const generateConceptImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// 5. Analyze Uploaded Image
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: "Identify this product and estimate its price in INR." }
        ]
      }
    });
    return response.text || "Could not identify image.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "Error analyzing image.";
  }
};
