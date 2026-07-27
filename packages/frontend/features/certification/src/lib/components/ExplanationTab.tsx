import React from 'react';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface ExplanationTabProps {
  explanation: string;
  referenceType: string | null;
  passageSource: string | null;
  highlight: string | null;
  onExplanationChange: (value: string) => void;
}

export const ExplanationTab: React.FC<ExplanationTabProps> = ({
  explanation,
  referenceType,
  passageSource,
  highlight,
  onExplanationChange,
}) => {
  const text = CERTIFICATION_UI_TEXT.explanationTab;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {text.explanationLabel}
        </label>
        <textarea
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder={text.explanationPlaceholder}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{text.referenceLabel}</h4>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-500">{text.typeLabel}</span>
            <span className="ml-2 text-sm text-gray-900">
              {referenceType || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500">{text.passageSourceLabel}</span>
            <span className="ml-2 text-sm text-gray-900">
              {passageSource || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500">{text.highlightLabel}</span>
            <span className="ml-2 text-sm text-gray-900">
              {highlight || CERTIFICATION_UI_TEXT.shared.none}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
