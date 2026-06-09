import React from 'react';
import { Star, Edit2, Trash2, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  Progress,
} from '@spark-nest-ed/frontend-shared-components';
import { VocabularyWord, levelColors } from '../PersonalVocabularyCard';

export interface VocabularyDetailsSetProps {
  word: VocabularyWord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFavoriteToggle: (id: string) => void;
  onPlayPronunciation: (word: string) => void;
  onEdit?: (word: VocabularyWord) => void;
  onDelete?: (word: VocabularyWord) => void;
  onPractice?: (word: VocabularyWord) => void;
}

const VocabularyDetailsSet: React.FC<VocabularyDetailsSetProps> = ({
  word,
  open,
  onOpenChange,
  onFavoriteToggle,
  onPlayPronunciation,
  onEdit,
  onDelete,
  onPractice,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0F172A] border-blue-800/30">
        <DialogHeader className="bg-gradient-to-br from-blue-900 to-[#1E293B] p-6 rounded-t-xl border-b border-blue-800/30 -m-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">
                  {word.word}
                </DialogTitle>
                {word.tags[0] && (
                  <Badge variant="outline" className="bg-blue-950/50 border-blue-800/30 text-blue-300">
                    {word.tags[0]}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-950/50 border-blue-800/30 text-blue-300">
                    UK/US
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-400 hover:text-blue-300 h-8 w-8"
                    onClick={() => onPlayPronunciation(word.word)}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <span className="text-blue-200 font-medium">{word.pronunciation}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className={`${
                  word.isFavorite
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                onClick={() => onFavoriteToggle(word.id)}
              >
                <Star className="h-6 w-6" />
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-400"
                  onClick={() => onEdit(word)}
                >
                  <Edit2 className="h-6 w-6" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-400"
                  onClick={() => onDelete(word)}
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Badge
              variant="outline"
              className={`border-blue-800/30 ${
                levelColors[word.level].dark
              }`}
            >
              {word.level.replace("_", " ")}
            </Badge>
            <span className="text-blue-300/70 text-sm">
              Last reviewed: {new Date(word.lastReviewed).toLocaleDateString()}
            </span>
          </div>
        </DialogHeader>

        {/* Content Section */}
        <div className="p-6 space-y-6 bg-[#0F172A]">
          {/* Meaning Section */}
          <div className="bg-[#1E293B] p-4 rounded-lg border border-blue-800/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Meaning</h3>
            <p className="text-gray-200 text-lg leading-relaxed">{word.meaning}</p>
          </div>

          {/* Example Section */}
          <div className="bg-[#1E293B] p-4 rounded-lg border border-blue-800/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Example</h3>
            <p className="text-gray-200 italic text-lg">"{word.example}"</p>
          </div>

          {/* Tags Section */}
          <div className="bg-[#1E293B] p-4 rounded-lg border border-blue-800/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {word.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-blue-950/50 border-blue-800/30 text-blue-200"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mastery Progress Section */}
          <div className="bg-[#1E293B] p-4 rounded-lg border border-blue-800/20">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Mastery Progress</h3>
            <Progress value={word.mastery} className="h-3 mb-3 bg-blue-950" />
            <div className="flex justify-between text-sm">
              <span className="text-blue-300/70">Beginner</span>
              <span className="text-blue-400 font-medium">{word.mastery}%</span>
              <span className="text-blue-300/70">Mastered</span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-blue-800/30 p-6 bg-[#1E293B] -m-6 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onPractice && (
            <Button
              onClick={() => onPractice(word)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              Practice Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VocabularyDetailsSet;
