
import React, { useState, useCallback, useRef } from 'react';
import type { ImageData } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  title: string;
  description: string;
  onImageUpload: (imageData: ImageData) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, description, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload({ file, base64: base64String });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
    }
  };

  const onButtonClick = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="w-full h-full bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
      <h3 className="text-xl font-bold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div 
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onButtonClick}
        className={`w-full h-80 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors duration-300 cursor-pointer 
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
      >
        <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />
        {preview ? (
          <img src={preview} alt={title} className="w-full h-full object-contain rounded-lg p-2" />
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon />
            <p className="mt-2 font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
