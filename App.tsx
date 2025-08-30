import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { generateVirtualTryOn, editGeneratedImage } from './services/geminiService';
import type { ImageData } from './types';
import { ArrowRightIcon } from './components/icons';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<ImageData | null>(null);
  const [clothingImage1, setClothingImage1] = useState<ImageData | null>(null);
  const [clothingImage2, setClothingImage2] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string | null>(null);

  const handleTryOn = useCallback(async () => {
    if (!userImage || (!clothingImage1 && !clothingImage2)) {
      setError("Please upload a person and at least one clothing item.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setResponseText(null);

    try {
      const clothingItems = [clothingImage1, clothingImage2]
        .filter((img): img is ImageData => img !== null)
        .map(img => ({
          base64: img.base64.split(',')[1],
          mimeType: img.file.type,
        }));

      const result = await generateVirtualTryOn(
        userImage.base64.split(',')[1],
        userImage.file.type,
        clothingItems
      );
      
      if (result.image) {
        setGeneratedImage(`data:image/png;base64,${result.image}`);
      }
      if (result.text) {
        setResponseText(result.text);
      }
      if (!result.image && !result.text) {
        setError("The AI model did not return an image or text. Please try again with different images.");
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [userImage, clothingImage1, clothingImage2]);

  const handleFollowUpSubmit = useCallback(async (prompt: string) => {
    if (!prompt || !generatedImage) return;

    setIsEditing(true);
    setError(null);

    try {
        const imageBase64 = generatedImage.split(',')[1];
        // A simple way to infer mime type, assuming PNG from the previous step.
        const mimeType = 'image/png'; 

        const result = await editGeneratedImage(imageBase64, mimeType, prompt);

        if (result.image) {
            setGeneratedImage(`data:image/png;base64,${result.image}`);
        }
        if (result.text) {
            setResponseText(result.text);
        }
        if (!result.image && !result.text) {
           setError("The AI model did not return an updated image or text.");
        }

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during image editing.");
    } finally {
        setIsEditing(false);
    }
  }, [generatedImage]);
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'stylefit-try-on.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isButtonDisabled = !userImage || (!clothingImage1 && !clothingImage2) || isLoading;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <Header />
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ImageUploader 
              title="Your Photo" 
              description="Upload a full-body photo."
              onImageUpload={setUserImage} 
            />
            <ImageUploader 
              title="Clothing Item 1"
              description="Upload a shirt, pants, etc."
              onImageUpload={setClothingImage1} 
            />
            <ImageUploader 
              title="Clothing Item 2 (Optional)"
              description="Upload a jacket, hat, etc."
              onImageUpload={setClothingImage2} 
            />
        </div>
        
        <div className="mt-8 flex justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 text-center">Ready to Try?</h3>
                <p className="text-sm text-gray-500 text-center mt-1 mb-4">Once your images are uploaded, click below to see the magic happen.</p>
                <button
                onClick={handleTryOn}
                disabled={isButtonDisabled}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out
                    ${isButtonDisabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1'
                    }`}
                >
                <span>{isLoading ? 'Generating...' : 'Virtually Try On'}</span>
                {!isLoading && <ArrowRightIcon />}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </div>
        </div>

        <div className="mt-12">
           <GeneratedImageDisplay 
              isLoading={isLoading} 
              isEditing={isEditing}
              generatedImage={generatedImage}
              responseText={responseText}
              onDownload={handleDownload}
              onFollowUpSubmit={handleFollowUpSubmit}
            />
        </div>
      </main>
    </div>
  );
};

export default App;