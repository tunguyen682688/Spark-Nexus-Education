import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getQuestionTypeLabel } from '../../../constants/question-type-labels.constants';

interface QuestionTypePickerProps {
  value: string;
  onChange: (type: string) => void;
  allowedTypes?: string[];
}

const ALL_QUESTION_TYPES = [
  'mc', 'true_false_not_given', 'yes_no_not_given',
  'matching', 'matching_headings', 'sentence_completion',
  'note_completion', 'form_completion', 'short_answer', 'map_labeling',
  'incomplete_sentence', 'text_completion',
  'reading_comprehension_single', 'reading_comprehension_double', 'reading_comprehension_triple',
  'photograph_choice', 'question_response', 'conversation_mc', 'short_talk_mc',
  'writing_task_1_academic', 'writing_task_2', 'email_writing', 'essay_writing_vstep', 'essay_writing', 'long_writing',
  'speaking_part_1', 'speaking_part_2', 'speaking_part_3',
  'speaking_interview', 'speaking_picture', 'speaking_discussion_vstep',
  'speaking_long_turn', 'speaking_collaborative', 'speaking_discussion',
  'short_conv_mc', 'long_conv_mc', 'short_talk_gap', 'lecture_mc',
  'factual_reading_mc', 'opinion_tfng', 'argument_matching',
  'multiple_choice_cloze', 'open_cloze', 'word_formation', 'key_word_transformation',
  'multiple_choice_reading', 'gapped_text', 'multiple_matching',
  'listening_mc', 'sentence_completion_listening', 'multiple_matching_listening',
];

export function QuestionTypePicker({ value, onChange, allowedTypes }: QuestionTypePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const types = (allowedTypes && allowedTypes.length > 0
    ? ALL_QUESTION_TYPES.filter((t) => allowedTypes.includes(t))
    : ALL_QUESTION_TYPES
  ).filter((t) => getQuestionTypeLabel(t).toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
      >
        {getQuestionTypeLabel(value)}
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-56 max-h-64 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-1.5 border-b border-border">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50">
              <Search className="w-3 h-3 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm loại câu hỏi..."
                className="flex-1 text-[10px] bg-transparent outline-none text-foreground"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-52 p-1">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => { onChange(type); setIsOpen(false); setSearch(''); }}
                className={`w-full text-left px-2.5 py-1.5 text-[10px] font-medium rounded-lg cursor-pointer transition-colors ${
                  value === type
                    ? 'bg-indigo-600 text-white'
                    : 'text-foreground hover:bg-muted/50'
                }`}
              >
                {getQuestionTypeLabel(type)}
              </button>
            ))}
            {types.length === 0 && (
              <div className="px-2.5 py-3 text-[10px] text-muted-foreground text-center">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
