import {
  Plus,
} from 'lucide-react';
import {
  Card,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { BuilderSection } from '../../../hooks/container-logic/exam/use-exam-builder-container-logic';
import { SectionListItem } from './SectionListItem';

const examBuilderText = CERTIFICATION_UI_TEXT.examBuilder;

interface SectionManagerProps {
  sections: BuilderSection[];
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  handleAddSection: () => void;
  handleDeleteSection: (id: string) => void;
}

export const SectionManager = ({
  sections,
  activeSectionId,
  setActiveSectionId,
  handleAddSection,
  handleDeleteSection,
}: SectionManagerProps) => {
  return (
    <Card className="border-border shadow-sm bg-card p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
          {examBuilderText.sectionsSidebar.title}
        </h3>
        <button
          onClick={handleAddSection}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {sections.map((section) => (
          <SectionListItem
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            canDelete={sections.length > 1}
            onSelect={setActiveSectionId}
            onDelete={handleDeleteSection}
          />
        ))}
      </div>

      <button
        onClick={handleAddSection}
        className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center space-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group"
      >
        <span className="text-xs font-bold text-indigo-600 group-hover:underline block">
          + Add Section
        </span>
        <span className="text-[10px] text-muted-foreground font-medium block">
          Drag to reorder
        </span>
      </button>
    </Card>
  );
};
