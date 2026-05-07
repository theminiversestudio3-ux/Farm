import { createContext, useContext, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

// Order of models to try
const FALLBACK_MODELS = [
  'gemma-4-31b-it',
];

interface ModelContextType {
  generateContent: (prompt: string, systemInstruction?: string, isImage?: boolean, imageData?: string) => Promise<string>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  
  const generateContent = async (prompt: string, systemInstruction?: string, isImage?: boolean, imageData?: string): Promise<string> => {
    let lastError: any = null;

    for (const modelName of FALLBACK_MODELS) {
      try {
        let resultPromise;
        if (isImage && imageData) {
          // Extract base64 and mime type
          let base64Data = imageData;
          let mimeType = 'image/jpeg';
          
          if (imageData.includes(',')) {
            base64Data = imageData.split(',')[1];
            const mimeMatch = imageData.match(/^data:(image\/[a-zA-Z+]+);base64,/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
          }
          
          const ai = getAI();
          resultPromise = ai.models.generateContent({
            model: modelName,
            contents: [
              prompt,
              { inlineData: { data: base64Data, mimeType } }
            ],
            config: {
              systemInstruction: systemInstruction || "You are Ori, a helpful AI farming assistant."
            }
          });
        } else {
          const ai = getAI();
          resultPromise = ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || "You are Ori, a helpful AI farming assistant."
            }
          });
        }

        const result = await resultPromise;

        const text = result.text;
        if (text) return text;
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} failed, trying fallback...`, error);
        // continue trying next model
        continue;
      }
    }

    throw lastError || new Error("All AI models failed to respond.");
  };

  return (
    <ModelContext.Provider value={{ generateContent }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useAI must be used within a ModelProvider');
  }
  return context;
};
