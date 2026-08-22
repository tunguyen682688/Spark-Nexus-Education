import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface ExplanationTabProps {
  explanation: string;
  referenceType: string | null;
  passageSource: string | null;
  highlight: string | null;
  onExplanationChange: (value: string) => void;
}

export const ExplanationTab = ({
  explanation,
  referenceType,
  passageSource,
  highlight,
  onExplanationChange,
}: ExplanationTabProps) => {
  const text = CERTIFICATION_UI_TEXT.explanationTab;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {text.explanationLabel}
        </label>
        <textarea
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder={text.explanationPlaceholder}
          className="w-full h-32 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-background text-foreground"
        />
      </div>

      <div className="bg-secondary/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">{text.referenceLabel}</h4>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">{text.typeLabel}</span>
            <span className="ml-2 text-sm text-foreground">
              {referenceType || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{text.passageSourceLabel}</span>
            <span className="ml-2 text-sm text-foreground">
              {passageSource || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{text.highlightLabel}</span>
            <span className="ml-2 text-sm text-foreground">
              {highlight || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
