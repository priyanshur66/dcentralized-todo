"use client";
import { Brain, X } from 'lucide-react';
import { useState } from 'react';

interface AiSuggestionBannerProps {
  suggestion: string;
}

const AiSuggestionBanner = ({ suggestion }: AiSuggestionBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null; 
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 flex items-center text-sm shadow-md">
      <Brain size={18} className="mr-2 flex-shrink-0" />
      <p className="flex-grow">{suggestion}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="text-white/70 hover:text-white ml-2"
        title="Dismiss suggestion"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AiSuggestionBanner;