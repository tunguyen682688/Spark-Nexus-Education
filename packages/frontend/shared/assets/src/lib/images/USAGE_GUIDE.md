# Image Management System Usage Guide

This document provides guidance on how to properly use our image management system in the ReelNet frontend application.

## Basic Image Import

Import specific images or image categories directly from the central image catalog:

```tsx
// Import specific image categories
import { vocabularySets } from '@/shared/assets/images/images';

function MyComponent() {
  return <img src={vocabularySets.defaultSet1} alt="Default Set 1" />;
}

// Or import all images
import imageCatalog from '@/shared/assets/images/images';

function AnotherComponent() {
  return <img src={imageCatalog.defaultVocabularySet2} alt="Default Set 2" />;
}
```

## Using Image Utilities

### Creating Image Export Objects

```tsx
import { createImageExport } from '@/shared/assets/images/images';
import imageCatalog from '@/shared/assets/images/images';

// Create an image export with metadata
const myImage = createImageExport(
  imageCatalog.defaultVocabularySet1,
  'Vocabulary Set Image',
  300, // width
  200  // height
);

function MyComponent() {
  return (
    <img 
      src={myImage.src} 
      alt={myImage.alt} 
      width={myImage.width} 
      height={myImage.height}
    />
  );
}
```

### Random Images

```tsx
import { getRandomImageExport } from '@/shared/assets/images/images';

function RandomImageComponent() {
  const randomImage = getRandomImageExport();
  
  return (
    <img 
      src={randomImage.src} 
      alt={randomImage.alt || 'Random image'} 
      width={randomImage.width}
      height={randomImage.height}
    />
  );
}
```

### Formatting Image URLs

```tsx
import { formatImageUrl } from '@/shared/assets/images/images';

function ImageWithSizing() {
  const imageUrl = '/path/to/image.jpg';
  const formattedUrl = formatImageUrl(imageUrl, { width: 400, height: 300 });
  
  return <img src={formattedUrl} alt="Sized image" />;
}
```

### Checking Image Existence

```tsx
import { imageExists } from '@/shared/assets/images/images';
import { useState, useEffect } from 'react';

function ImageWithFallback({ src, fallbackSrc }) {
  const [imageSrc, setImageSrc] = useState(src);
  
  useEffect(() => {
    async function checkImage() {
      const exists = await imageExists(src);
      if (!exists) {
        setImageSrc(fallbackSrc);
      }
    }
    
    checkImage();
  }, [src, fallbackSrc]);
  
  return <img src={imageSrc} alt="Image with fallback" />;
}
```

### Getting Image Dimensions

```tsx
import { getImageDimensions } from '@/shared/assets/images/images';
import { useState, useEffect } from 'react';

function ImageWithDimensions({ src }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    async function loadDimensions() {
      try {
        const dims = await getImageDimensions(src);
        setDimensions(dims);
      } catch (error) {
        console.error('Failed to load image dimensions:', error);
      }
    }
    
    loadDimensions();
  }, [src]);
  
  return (
    <div>
      <img src={src} alt="Image" />
      <p>Dimensions: {dimensions.width} x {dimensions.height}</p>
    </div>
  );
}
```

## Adding New Images

To add new images to the application:

1. Place your image files in the `src/shared/assets/images/` directory
2. Add the image imports to the `catalog.ts` file:

```ts
// Import the new image
import myNewImage from './myNewImage.png';

// Add to a category
export const myCategory = {
  newImage: myNewImage,
};

// Add to the default export
export default {
  // Existing images
  defaultVocabularySet1,
  defaultVocabularySet2,
  // New image
  myNewImage,
};
```

## Best Practices

1. **Never use direct image paths** in your components
2. **Always import images** from the central image catalog
3. **Use appropriate utilities** for common image operations
4. **Add metadata** (alt text, dimensions) when possible
5. **Categorize images** in the catalog for better organization
6. **Use lazy loading** for images below the fold

## Example Component

```tsx
import React from 'react';
import { vocabularySets, createImageExport } from '@/shared/assets/images/images';

interface ImageCardProps {
  title: string;
  description: string;
}

export function ImageCard({ title, description }: ImageCardProps) {
  const image = createImageExport(
    vocabularySets.defaultSet1,
    title,
    400,
    300
  );
  
  return (
    <div className="card">
      <img 
        src={image.src} 
        alt={image.alt} 
        width={image.width} 
        height={image.height}
        loading="lazy"
      />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```
