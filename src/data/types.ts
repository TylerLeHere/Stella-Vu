import type { ImageMetadata } from 'astro';

export interface ProfileLink {
  label: string;
  href: `https://${string}`;
}

export interface Profile {
  name: string;
  introduction: string;
  about: string;
  links: readonly ProfileLink[];
  metadata: {
    title: string;
    description: string;
    socialImage: {
      /** Root-relative path to a file in public/. */
      path: `/${string}`;
      alt: string;
      width: number;
      height: number;
    };
  };
}

export interface Photo {
  id: string;
  image: ImageMetadata;
  source: {
    filename: string;
    originalFilename: string;
    /** Stored JPEG dimensions, before any orientation transform. */
    width: number;
    height: number;
    /** Observed EXIF orientation: 1 is upright; null means no tag. */
    orientation: 1 | null;
  };
  alt: string;
  caption: string | null;
  /** Presentation preference only; the original JPEG is never cropped. */
  crop: {
    fit: 'contain' | 'cover';
    position: `${number}% ${number}%`;
  };
  /** Degrees; separate from the source image’s EXIF orientation. */
  restingRotation: number;
}

/** Serializable build-time image data for the on-demand viewer. */
export interface ViewerPhoto {
  id: string;
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
}
