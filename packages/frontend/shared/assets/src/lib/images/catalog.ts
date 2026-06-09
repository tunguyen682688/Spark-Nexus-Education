/**
 * Central catalog of all application images
 * 
 * This file imports and exports all images used in the application.
 * Always import images from this file instead of direct paths.
 */

// Import all images using relative paths
import defaultVocabularySet1 from './defaultVocabulySet1.png';
import defaultVocabularySet2 from './defaultVocabularySet2.png';

// Add more imports as needed

// Export categorized images
export const vocabularySets = {
  defaultSet1: defaultVocabularySet1,
  defaultSet2: defaultVocabularySet2,
};

// Export all images as a flat structure (for compatibility)
export default {
  defaultVocabularySet1,
  defaultVocabularySet2,
  // Add more images as needed
};
