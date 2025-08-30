import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

type ImageResult = { image: string | null; text: string | null };

const parseGeminiResponse = (response: GenerateContentResponse): ImageResult => {
    let image: string | null = null;
    let text: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                image = part.inlineData.data;
            } else if (part.text) {
                text = part.text;
            }
        }
    }
    
    if (!image) {
        console.warn("Model response did not contain an image part.", response);
    }

    return { image, text };
};


export const generateVirtualTryOn = async (
    userImageBase64: string,
    userImageMimeType: string,
    clothingItems: { base64: string, mimeType: string }[]
): Promise<ImageResult> => {

    const userImagePart = {
        inlineData: {
            data: userImageBase64,
            mimeType: userImageMimeType,
        },
    };

    const clothingImageParts = clothingItems.map(item => ({
        inlineData: {
            data: item.base64,
            mimeType: item.mimeType,
        },
    }));

    const prompt = `Take the clothing item(s) from the subsequent image(s) and realistically place it onto the person in the first image. If there are two clothing items, layer them naturally (e.g., a jacket over a shirt). Make sure the fit, perspective, and lighting look natural. The output should be just the final image.`;

    const textPart = { text: prompt };
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [userImagePart, ...clothingImageParts, textPart]
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        return parseGeminiResponse(response);

    } catch (error) {
        console.error("Error calling Gemini API for generation:", error);
        throw new Error("Failed to generate virtual try-on image.");
    }
};

export const editGeneratedImage = async (
    imageBase64: string,
    imageMimeType: string,
    prompt: string
): Promise<ImageResult> => {
    
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
        },
    };

    const textPart = { text: prompt };
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [imagePart, textPart]
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        return parseGeminiResponse(response);

    } catch (error) {
        console.error("Error calling Gemini API for editing:", error);
        throw new Error("Failed to edit virtual try-on image.");
    }
};