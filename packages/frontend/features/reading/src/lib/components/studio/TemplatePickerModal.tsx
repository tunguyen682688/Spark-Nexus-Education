import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import { STUDIO_TEMPLATES } from '../../constants/studio-templates';
import type { StudioFormValues } from '../../types';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Partial<StudioFormValues>) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!selectedTemplateId) return;
    const template = STUDIO_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      onSelectTemplate(template.defaultValues);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{STUDIO_UI_TEXT.TEMPLATE_MODAL_TITLE}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{STUDIO_UI_TEXT.TEMPLATE_MODAL_DESC}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDIO_TEMPLATES.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 group relative",
                    isSelected 
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md dark:hover:shadow-blue-900/10"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-blue-600 dark:text-blue-400">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400">{template.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{template.description}</p>
                  
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {template.contentType}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {template.defaultValues.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Huỷ bỏ
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!selectedTemplateId}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {STUDIO_UI_TEXT.TEMPLATE_BTN_USE}
          </Button>
        </div>

      </div>
    </div>
  );
};
