import React, { useState } from 'react';

interface SkillInputProps {
  skills: string[];
  placeholder: string;
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

export const SkillInput = ({ skills, placeholder, onAdd, onRemove }: SkillInputProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !skills.includes(input.trim())) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemove(skill)}
              className="ml-1 text-green-600 hover:text-green-800"
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
