import React from 'react';
import { Music, ChevronRight } from 'lucide-react';
import { LISTENING_CONTRIBUTE_TEXT } from '../constants';

interface ContributeMetadataStepProps {
  title: string;
  setTitle: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  mediaUrl: string;
  setMediaUrl: (val: string) => void;
  thumbnailUrl: string;
  setThumbnailUrl: (val: string) => void;
  category: 'podcast' | 'audio' | 'exam' | 'video';
  setCategory: (val: 'podcast' | 'audio' | 'exam' | 'video') => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  duration: number;
  setDuration: (val: number) => void;
  tagsText: string;
  setTagsText: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  onNextStep: () => void;
}

export const ContributeMetadataStep: React.FC<ContributeMetadataStepProps> = ({
  title,
  setTitle,
  author,
  setAuthor,
  mediaUrl,
  setMediaUrl,
  thumbnailUrl,
  setThumbnailUrl,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  tagsText,
  setTagsText,
  description,
  setDescription,
  onNextStep,
}) => {
  const text = LISTENING_CONTRIBUTE_TEXT.STEP_1_FORM;

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
      <div>
        <h2 className="text-sm font-black uppercase text-purple-400 flex items-center gap-2">
          <Music className="w-4 h-4" />
          {LISTENING_CONTRIBUTE_TEXT.STEPS.STEP_1}
        </h2>
        <p className="text-xs text-slate-500 mt-1">{LISTENING_CONTRIBUTE_TEXT.STEPS.STEP_1_DESC}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-bold">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-slate-400">{text.TITLE_LABEL}</label>
          <input
            type="text"
            placeholder={text.TITLE_PLACEHOLDER}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-655 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <label className="text-slate-400">{text.AUTHOR_LABEL}</label>
          <input
            type="text"
            placeholder={text.AUTHOR_PLACEHOLDER}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-655 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Media URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-400">{text.MEDIA_LABEL}</label>
          <input
            type="text"
            placeholder={text.MEDIA_PLACEHOLDER}
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-655 focus:border-purple-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            {text.MEDIA_TIP}
          </p>
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-400">{text.THUMBNAIL_LABEL}</label>
          <input
            type="text"
            placeholder={text.THUMBNAIL_PLACEHOLDER}
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-655 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Category, Difficulty, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:col-span-2">
          <div className="space-y-1.5">
            <label className="text-slate-400">{text.CATEGORY_LABEL}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'podcast' | 'audio' | 'exam' | 'video')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-355 focus:border-purple-500 focus:outline-none"
            >
              <option value="podcast">Podcast</option>
              <option value="audio">Audio bài học</option>
              <option value="exam">Luyện thi</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-400">{text.DIFFICULTY_LABEL}</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-355 focus:border-purple-500 focus:outline-none"
            >
              <option value="A1">A1 - Sơ cấp</option>
              <option value="A2">A2 - Sơ trung cấp</option>
              <option value="B1">B1 - Trung cấp</option>
              <option value="B2">B2 - Trung cấp cấp cao</option>
              <option value="C1">C1 - Cao cấp</option>
              <option value="C2">C2 - Bản xứ</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-400">{text.DURATION_LABEL}</label>
            <input
              type="number"
              min="1"
              placeholder="180"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-400">{text.TAGS_LABEL}</label>
          <input
            type="text"
            placeholder={text.TAGS_PLACEHOLDER}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-655 focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-slate-400">{text.DESC_LABEL}</label>
          <textarea
            placeholder={text.DESC_PLACEHOLDER}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-purple-500 focus:outline-none resize-none"
          />
        </div>

      </div>

      {/* Step navigation buttons */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-850">
        <button
          onClick={onNextStep}
          disabled={!mediaUrl}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-600 disabled:opacity-50 text-white font-extrabold active:scale-98 transition-all"
        >
          {text.CONTINUE_CTA}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContributeMetadataStep;
