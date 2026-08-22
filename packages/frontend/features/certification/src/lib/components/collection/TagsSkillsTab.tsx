import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { TagInput } from './TagInput';
import { SkillInput } from './SkillInput';

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
  const text = CERTIFICATION_UI_TEXT.tagsSkillsTab;

  return (
    <div className="space-y-6">
      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {text.tagsLabel}
        </label>
        <TagInput
          tags={tags}
          placeholder={text.addTagPlaceholder}
          onAdd={(tag) => onTagsChange([...tags, tag])}
          onRemove={(tag) => onTagsChange(tags.filter((t) => t !== tag))}
        />
      </div>

      {/* Skills Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {text.skillsLabel}
        </label>
        <SkillInput
          skills={skills}
          placeholder={text.addSkillPlaceholder}
          onAdd={(skill) => onSkillsChange([...skills, skill])}
          onRemove={(skill) => onSkillsChange(skills.filter((s) => s !== skill))}
        />
      </div>

      {/* Cognitive Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {text.cognitiveLevelLabel}
        </label>
        <select
          value={cognitiveLevel}
          onChange={(e) => onCognitiveLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-background text-foreground"
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
