import React from 'react';
import BilingualAudioPlayer from '../components/BilingualAudioPlayer';
import { Eye, Loader2, Send } from 'lucide-react';
import { LISTENING_CONTRIBUTE_TEXT } from '../constants';
import { ListeningMaterial } from '../types';

interface ContributePreviewStepProps {
  mockMaterialPreview: ListeningMaterial;
  isPublishing: boolean;
  onPrevStep: () => void;
  onSubmitPublish: () => void;
}

export const ContributePreviewStep: React.FC<ContributePreviewStepProps> = ({
  mockMaterialPreview,
  isPublishing,
  onPrevStep,
  onSubmitPublish,
}) => {
  const text = LISTENING_CONTRIBUTE_TEXT.STEP_4_PREVIEW;

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
      <div>
        <h2 className="text-sm font-black uppercase text-purple-400 flex items-center gap-2">
          <Eye className="w-4.5 h-4.5" />
          {text.TITLE}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {text.DESC}
        </p>
      </div>

      {/* Simulating Bilingual Player inside Studio */}
      <div className="border border-slate-850 bg-slate-950/80 rounded-2xl overflow-hidden min-h-[400px]">
        <BilingualAudioPlayer
          material={mockMaterialPreview}
          onBack={onPrevStep}
        />
      </div>

      {/* Submit layout buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-850">
        <button
          onClick={onPrevStep}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-955 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs"
        >
          {text.BACK_CTA}
        </button>
        <button
          onClick={onSubmitPublish}
          disabled={isPublishing}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold text-xs active:scale-98 transition-all shadow-lg shadow-purple-500/20"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {text.PUBLISHING_CTA}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {text.PUBLISH_CTA}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContributePreviewStep;
