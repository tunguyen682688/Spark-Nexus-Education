import { X } from 'lucide-react';
import { Card, Badge, Input } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { QuestionPropertiesForm } from '../../../hooks/container-logic/exam/use-question-builder-container-logic';

interface PropertiesSidebarProps {
  properties: QuestionPropertiesForm;
  onPropertiesChange: (value: QuestionPropertiesForm | ((prev: QuestionPropertiesForm) => QuestionPropertiesForm)) => void;
  onRemoveTag: (tag: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function PropertiesSidebar({ properties, onPropertiesChange, onRemoveTag, onRemoveSkill }: PropertiesSidebarProps) {
  const questionBuilderText = CERTIFICATION_UI_TEXT.questionBuilder;

  return (
    <Card className="border-border shadow-sm bg-card p-4 space-y-4">
      <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-2 border-b border-border">
        {questionBuilderText.propertiesSidebar.title}
      </h3>

      <div className="space-y-3.5 text-xs font-medium">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              {questionBuilderText.propertiesSidebar.idLabel}
            </span>
            <span className="font-black text-foreground">{properties.id}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              {questionBuilderText.propertiesSidebar.pointsLabel}
            </span>
            <select
              value={properties.points}
              onChange={(e) => onPropertiesChange({ ...properties, points: Number(e.target.value) })}
              className="w-full bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg"
            >
              {questionBuilderText.pointsOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            {questionBuilderText.propertiesSidebar.estimatedTimeLabel}
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={properties.estimatedTime}
              onChange={(e) => onPropertiesChange({ ...properties, estimatedTime: e.target.value })}
              className="text-xs bg-background py-1 h-8 rounded-xl font-bold w-24"
            />
            <span className="text-[10px] text-muted-foreground font-bold">{questionBuilderText.timeFormatHint}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            {questionBuilderText.propertiesSidebar.tagsLabel}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {properties.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1"
              >
                <span>{tag}</span>
                <button onClick={() => onRemoveTag(tag)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            {questionBuilderText.propertiesSidebar.skillsLabel}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {properties.skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1"
              >
                <span>{skill}</span>
                <button onClick={() => onRemoveSkill(skill)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            {questionBuilderText.propertiesSidebar.cognitiveLevelLabel}
          </label>
          <select
            value={properties.cognitiveLevel}
            onChange={(e) => onPropertiesChange({ ...properties, cognitiveLevel: e.target.value })}
            className="w-full bg-background border border-border text-xs font-bold text-foreground py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {questionBuilderText.cognitiveLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 border-t border-border space-y-1 text-[10px] text-muted-foreground font-semibold">
          <div>
            <span>{questionBuilderText.propertiesSidebar.timeAdded}: </span>
            <span className="text-foreground">{properties.createdDate}</span>
          </div>
          <div>
            <span>{questionBuilderText.propertiesSidebar.lastUpdated}: </span>
            <span className="text-foreground">{properties.lastUpdatedDate}</span>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <span>{questionBuilderText.propertiesSidebar.createdBy}: </span>
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
              MA
            </div>
            <span className="text-foreground font-bold">{properties.createdBy}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
