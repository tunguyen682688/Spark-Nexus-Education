import React, { useState } from 'react';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface TagsSkillsTabProps {
  tags: string[];
  skills: string[];
  cognitiveLevel: string;
  onTagsChange: (tags: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onCognitiveLevelChange: (level: string) => void;
}

const COGNITIVE_LEVELS = CERTIFICATION_UI_TEXT.tagsSkillsTab.cognitiveLevels;

export const TagsSkillsTab = ({
  tags,
  skills,
  cognitiveLevel,
  onTagsChange,
  onSkillsChange,
  onCognitiveLevelChange,
}: TagsSkillsTabProps) => {
  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim() && !skills.includes(skillInput.trim())) {
      onSkillsChange([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    onSkillsChange(skills.filter((s) => s !== skill));
  };

  const text = CERTIFICATION_UI_TEXT.tagsSkillsTab;

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {text.tagsLabel}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder={text.addTagPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Skills Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {text.skillsLabel}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder={text.addSkillPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Cognitive Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {text.cognitiveLevelLabel}
        </label>
        <select
          value={cognitiveLevel}
          onChange={(e) => onCognitiveLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {COGNITIVE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
