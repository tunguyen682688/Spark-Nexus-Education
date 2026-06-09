/**
 * Image utility functions for the application
 * 
 * This file contains various utility functions for working with images,
 * including checking existence, formatting URLs, and optimizing images.
 */

import { sample } from 'lodash';
import images from '../catalog';

// Image export interfaces
export interface ImageExport {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Creates an image export object with default properties
 */
export function createImageExport(
  src: string, 
  alt = '',
  width?: number,
  height?: number
): ImageExport {
  return {
    src,
    alt,
    width,
    height
  };
}

/**
 * Gets a random image from the provided array or from default images
 */
export function getRandomImage(imageArray?: string[]): string {
  const defaultImages = Object.values(images);
  const sourcesToUse = imageArray || defaultImages;
  return sample(sourcesToUse) || defaultImages[0];
}

/**
 * Gets a random image export object
 */
export function getRandomImageExport(
  imageArray?: string[],
  alt = 'Random image',
  width?: number,
  height?: number
): ImageExport {
  return createImageExport(getRandomImage(imageArray), alt, width, height);
}

/**
 * Formats an image URL for proper display
 */
export function formatImageUrl(url: string, size?: { width: number, height: number }): string {
  if (!url) return '';
  
  // Handle already formatted URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle relative paths
  if (url.startsWith('/')) {
    // Add sizing parameters if provided
    if (size) {
      return `${url}?w=${size.width}&h=${size.height}`;
    }
    return url;
  }
  
  // Default case: treat as relative path
  return `/${url}`;
}

/**
 * Checks if an image exists at the specified URL
 */
export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error: unknown) {
    console.error('Error checking image existence:', error);
    return false;
  }
}

/**
 * Gets image dimensions asynchronously
 */
export function getImageDimensions(src: string): Promise<{width: number, height: number}> {
  return new Promise<{width: number, height: number}>((resolve, reject) => {
    const img: HTMLImageElement = new window.Image() as HTMLImageElement;
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    img.src = src;
  });
}
