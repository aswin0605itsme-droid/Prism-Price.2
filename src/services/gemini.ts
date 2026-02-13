import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Product, AspectRatio } from "../types";

// Initialize Gemini Client using the VITE_ prefixed env variable as per Vite standards
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to get model instance
export const getGeminiModel = (modelName: string = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

// 1. Search Products (Gemini 1.5 Flash)
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING },
              price: { type: SchemaType.NUMBER },
              currency: { type: SchemaType.STRING },
              retailer: { type: SchemaType.STRING },
              imageUrl: { type: SchemaType.STRING },
              link: { type: SchemaType.STRING },
            },
            required: ["name", "price", "retailer"],
          },
        },
      },
    });

    const prompt = `Find current prices for "${query}" from major Indian retailers like Amazon.in, Flipkart, Croma, and Reliance Digital. 
    Return a JSON array of 4-6 distinct products. 
    For each product, strictly allow "Amazon", "Flipkart", "Croma", "Reliance Digital" as retailers.
    Include a realistic price in INR (number only), a product name, and a direct purchase link if found (or a search link).
    Use placeholder image URLs from https://picsum.photos/400/400 if specific ones aren't available.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (responseText) {
      return JSON.parse(responseText) as Product[];
    }
    return [];
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

// 2. Chat with Gemini (Gemini 1.5 Pro)
export const chatWithGemini = async (history: { role: string, parts: { text: string }[] }[], newMessage: string) => {
  try {
    const model = getGeminiModel("gemini-1.5-pro");
    
    // Filter history to ensure valid roles (user/model) and correct structure
    const validHistory = history
      .filter(h => h.role === 'user' || h.role === 'model')
      .map(h => ({
        role: h.role as "user" | "model",
        parts: h.parts
      }));

    const chat = model.startChat({
      history: validHistory,
    });
    
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};

// 3. Deep Analysis (Gemini 1.5 Pro)
export const analyzeProductDeeply = async (productName: string): Promise<string> => {
  try {
    const model = getGeminiModel("gemini-1.5-pro");
    const prompt = `Provide a deep technical analysis and "should you buy" verdict for: ${productName}. 
      Compare it with its top 2 competitors. Be critical and concise.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Analysis unavailable.";
  }
};

// 4. Generate Product Concept (Stub - standard SDK doesn't support image gen yet)
export const generateConceptImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  console.log("Image generation requested:", prompt, aspectRatio);
  // Returning null as gemini-1.5-flash does not support image generation via this SDK method
  return null;
};

// 5. Analyze Uploaded Image (Gemini 1.5 Flash Vision)
export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const model = getGeminiModel("gemini-1.5-flash");
    
    const result = await model.generateContent([
      "Identify this product and estimate its price in INR. Return the name and price.",
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error("Vision Error:", error);
    return "Error analyzing image.";
  }
};