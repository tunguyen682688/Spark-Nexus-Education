/**
 * Central image management for the application
 * 
 * This file serves as the main entry point for all image-related imports and utilities.
 * Import from this file rather than directly using image paths in your components.
 */

import imageCatalog, { vocabularySets } from './catalog';
import {
  ImageExport,
  createImageExport,
  getRandomImage,
  getRandomImageExport,
  formatImageUrl,
  imageExists,
  getImageDimensions
} from './utils/imageUtils';

// Re-export everything for convenient imports
export {
  imageCatalog,
  vocabularySets,
  createImageExport,
  getRandomImage,
  getRandomImageExport,
  formatImageUrl,
  imageExists,
  getImageDimensions
};

export type { ImageExport };

// Default export for backwards compatibility
export default imageCatalog;
