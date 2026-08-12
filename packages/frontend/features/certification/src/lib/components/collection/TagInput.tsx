import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  placeholder: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export const TagInput = ({ tags, placeholder, onAdd, onRemove }: TagInputProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !tags.includes(input.trim())) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
    </div>
  );
};
