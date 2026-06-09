import * as z from "zod";
import { DifficultyLevel, PARTS_OF_SPEECH, VocabularySetType } from "../types";

export const WordItemSchema = z.object({
  id: z.string().optional(),
  word: z.string().min(1, "Word is required"),
  definition: z.string().min(1, "Definition is required"),
  partOfSpeech: z.enum(PARTS_OF_SPEECH).optional(),
  example: z.string().optional(),
  notes: z.string().optional(),
});

export const VocabularySetFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  // category is now part of tags
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  type: z.nativeEnum(VocabularySetType),
  difficulty: z.nativeEnum(DifficultyLevel),
  tags: z.array(z.string()).min(1, "At least one category is required"),
  words: z.array(WordItemSchema),
});

export type VocabularySetFormValues = z.infer<typeof VocabularySetFormSchema>;
export type WordItemFormValues = z.infer<typeof WordItemSchema>;

export const DEFAULT_WORD_ITEM: WordItemFormValues = {
  word: "",
  definition: "",
  partOfSpeech: "noun",
  example: "",
  notes: "",
};

export const defaultVocabularySetValues: VocabularySetFormValues = {
  title: "",
  description: "",
  visibility: "PUBLIC",
  type: VocabularySetType.FLASHCARD,
  difficulty: DifficultyLevel.BEGINNER,
  tags: [],
  words: [DEFAULT_WORD_ITEM],
};
