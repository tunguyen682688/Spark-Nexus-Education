import React from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  level:
    | "BEGINNER"
    | "ELEMENTARY"
    | "INTERMEDIATE"
    | "UPPER_INTERMEDIATE"
    | "ADVANCED";
  pronunciation: string;
  isFavorite: boolean;
  lastReviewed: string;
  mastery: number;
  tags: string[];
}

export interface LevelColorScheme {
  light: string;
  dark: string;
}

export const levelColors: Record<VocabularyWord["level"], LevelColorScheme> = {
  BEGINNER: {
    light: "bg-green-800 text-green-200",
    dark: "bg-green-900 text-green-200",
  },
  ELEMENTARY: {
    light: "bg-blue-800 text-blue-200",
    dark: "bg-blue-900 text-blue-200",
  },
  INTERMEDIATE: {
    light: "bg-yellow-800 text-yellow-100",
    dark: "bg-yellow-900 text-yellow-200",
  },
  UPPER_INTERMEDIATE: {
    light: "bg-orange-800 text-orange-100",
    dark: "bg-orange-900 text-orange-200",
  },
  ADVANCED: {
    light: "bg-red-800 text-red-100",
    dark: "bg-red-900 text-red-200",
  },
};

interface PersonalVocabularyCardProps {
  word: VocabularyWord;
  onFavoriteToggle: (id: string) => void;
  onPlayPronunciation: (word: string) => void;
  onTagClick: (tag: string) => void;
  onCardClick: (word: VocabularyWord) => void;
}

const PersonalVocabularyCard: React.FC<PersonalVocabularyCardProps> = ({
  word,
  onFavoriteToggle,
  onPlayPronunciation,
  onTagClick,
  onCardClick,
}) => {
  return (
    <motion.div
      className="h-full dark:bg-gray-800 bg-white rounded-2xl dark:shadow-dark dark:hover:shadow-dark-lg shadow-lg hover:shadow-xl overflow-hidden transition-all border border-gray-200 dark:border-gray-700 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.02 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => onCardClick(word)}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold dark:text-white text-gray-800 transition-colors truncate max-w-[70%]">
            {word.word}
          </h3>
          <div className="flex space-x-3">
            <button
              className="dark:text-gray-400 dark:hover:text-blue-400 text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onPlayPronunciation(word.word);
              }}
            >
              <Volume2 size={20} />
            </button>
            <button
              className={`${
                word.isFavorite
                  ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30"
                  : "dark:text-gray-400 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              } p-1.5 rounded-full transition-all`}
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(word.id);
              }}
            >
              <Star size={20} />
            </button>
          </div>
        </div>

        {/* Pronunciation & Level */}
        <div className="flex items-center gap-3 mb-4">
          <span className="dark:text-gray-300 text-gray-600 font-medium">
            {word.pronunciation}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              levelColors[word.level].dark
            } dark:${levelColors[word.level].dark} ${
              levelColors[word.level].light
            } transition-colors`}
          >
            {word.level.replace("_", " ")}
          </span>
        </div>

        {/* Meaning */}
        <p className="dark:text-gray-300 text-gray-600 mb-4 text-base leading-relaxed line-clamp-3">
          {word.meaning}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {word.tags.map((tag) => (
            <span
              key={tag}
              className="dark:bg-gray-700 dark:text-gray-300 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Example */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
          <div className="flex flex-col gap-3">
            <p className="text-base text-gray-700 dark:text-gray-300 italic line-clamp-2 text-ellipsis">
              "{word.example}"
            </p>
            <div className="flex items-center">
              <span className="inline-flex items-center bg-gray-200 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm">
                <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 900 600">
                  <rect width="900" height="600" fill="#da251d" />
                  <path
                    d="M450 150l123.17 379.24-322.42-234.16h398.5l-322.42 234.16z"
                    fill="#ffff00"
                  />
                </svg>
                <span className="text-blue-600 dark:text-blue-400 font-medium line-clamp-2 text-ellipsis">
                  {word.meaning}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${word.mastery}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm dark:text-gray-400 text-gray-500 font-medium">
              Mastery: {word.mastery}%
            </span>
            <span className="text-sm dark:text-gray-400 text-gray-500">
              Last reviewed: {new Date(word.lastReviewed).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalVocabularyCard;
