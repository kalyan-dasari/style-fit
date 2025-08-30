import React, { useState } from 'react';
import { DownloadIcon, SparklesIcon, SendIcon } from './icons';

interface GeneratedImageDisplayProps {
  isLoading: boolean;
  isEditing: boolean;
  generatedImage: string | null;
  responseText: string | null;
  onDownload: () => void;
  onFollowUpSubmit: (prompt: string) => void;
}

const LoadingState: React.FC = () => (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-8 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-700">Dressing you up...</h3>
        <p className="text-gray-500 mt-2">The AI is working its magic. This can take a moment.</p>
    </div>
);

const EmptyState: React.FC = () => (
     <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-2xl p-8 text-center border border-gray-200">
        <SparklesIcon />
        <h3 className="text-2xl font-bold text-gray-800 mt-4">Your Virtual Look Will Appear Here</h3>
        <p className="text-gray-500 mt-2 max-w-md">Upload your photo and a clothing item, then click the "Virtually Try On" button to generate your new style.</p>
    </div>
);

const FollowUpForm: React.FC<{ isEditing: boolean, onSubmit: (prompt: string) => void }> = ({ isEditing, onSubmit }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isEditing) return;
        onSubmit(prompt);
        setPrompt('');
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Refine Your Look</h3>
            <p className="text-sm text-gray-500 mb-3">Want to change something? Type a command below, e.g., "change the color to red" or "add a pocket".</p>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tell the AI what to change..."
                    disabled={isEditing}
                    className="flex-grow px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    aria-label="Edit prompt"
                />
                <button
                    type="submit"
                    disabled={isEditing || !prompt.trim()}
                    className="flex-shrink-0 px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Submit edit"
                >
                    {isEditing ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SendIcon />
                    )}
                </button>
            </form>
        </div>
    )
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ isLoading, isEditing, generatedImage, responseText, onDownload, onFollowUpSubmit }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!generatedImage) {
    return <EmptyState />;
  }

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Here's Your New Look!</h2>
                <div className="relative aspect-square w-full max-w-xl mx-auto bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    <img src={generatedImage} alt="Generated virtual try-on" className="w-full h-full object-contain" />
                    {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center transition-opacity duration-300">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                             <p className="text-white text-lg font-semibold">Updating your look...</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="md:w-1/3 flex flex-col">
                 <h3 className="text-xl font-semibold text-gray-700 mb-3">Actions & Details</h3>
                 <button
                    onClick={onDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                >
                    <DownloadIcon />
                    <span>Download Image</span>
                </button>
                {responseText && (
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h4 className="font-semibold text-indigo-800">AI Feedback:</h4>
                        <p className="text-sm text-indigo-700 mt-1">{responseText}</p>
                    </div>
                )}

                <div className="mt-auto pt-6">
                    <FollowUpForm isEditing={isEditing} onSubmit={onFollowUpSubmit} />
                </div>
            </div>
        </div>
    </div>
  );
};