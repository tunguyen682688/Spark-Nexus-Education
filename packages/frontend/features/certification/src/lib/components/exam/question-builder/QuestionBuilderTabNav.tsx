import type { CertificationUIText } from '../../../constants/certification.constants';

interface QuestionBuilderTabNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questionBuilderText: CertificationUIText['questionBuilder'];
}

export const QuestionBuilderTabNav = ({ activeTab, setActiveTab, questionBuilderText }: QuestionBuilderTabNavProps) => {
  const tabs = [
    questionBuilderText.tabs.question,
    questionBuilderText.tabs.explanation,
    questionBuilderText.tabs.tagsSkills,
    questionBuilderText.tabs.history,
  ] as const;

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};