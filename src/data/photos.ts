import gardenPortrait from '../assets/photos/mai-garden-portrait.jpeg';
import seasideCamera from '../assets/photos/mai-seaside-camera.jpeg';
import blueOutfit from '../assets/photos/mai-blue-outfit.jpeg';
import cafeCake from '../assets/photos/mai-cafe-cake.jpeg';
import pinkPajamas from '../assets/photos/mai-pink-pajamas.jpeg';
import graduation from '../assets/photos/mai-graduation.jpeg';
import sunglasses from '../assets/photos/mai-sunglasses.jpeg';
import manifest from '../assets/photos/manifest.json';
import type { Photo } from './types';

// Keep provenance in the existing manifest. Its "<nil>" orientation marker
// was inconclusive; orientation below was read from each actual JPEG.
function source(filename: string, orientation: Photo['source']['orientation']) {
  const entry = manifest.photos.find((photo) => photo.file === filename);
  if (!entry) throw new Error(`Photo missing from manifest: ${filename}`);

  return {
    filename: entry.file,
    originalFilename: entry.originalFilename,
    width: entry.width,
    height: entry.height,
    orientation,
  };
}

// Full frames are provisional. Review any cover crop at its final display size.
export const photos = {
  'mai-garden-portrait': {
    id: 'mai-garden-portrait',
    image: gardenPortrait,
    source: source('mai-garden-portrait.jpeg', 1),
    alt: 'Mai wearing a white blouse with green foliage behind her.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: -6,
  },
  'mai-seaside-camera': {
    id: 'mai-seaside-camera',
    image: seasideCamera,
    source: source('mai-seaside-camera.jpeg', null),
    alt: 'Mai holding a camera and wearing a sunhat beside a rocky shore.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 2,
  },
  'mai-blue-outfit': {
    id: 'mai-blue-outfit',
    image: blueOutfit,
    source: source('mai-blue-outfit.jpeg', null),
    alt: 'Mai smiling beneath a tree in a light blue outfit, with a building and water behind her.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 6,
  },
  'mai-cafe-cake': {
    id: 'mai-cafe-cake',
    image: cafeCake,
    source: source('mai-cafe-cake.jpeg', 1),
    alt: 'Mai smiling with a hand near her mouth, seated beside a cake.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 0,
  },
  'mai-pink-pajamas': {
    id: 'mai-pink-pajamas',
    image: pinkPajamas,
    source: source('mai-pink-pajamas.jpeg', 1),
    alt: 'Mai sitting on a bed in pink striped pajamas, holding a plush toy.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 0,
  },
  'mai-graduation': {
    id: 'mai-graduation',
    image: graduation,
    source: source('mai-graduation.jpeg', 1),
    alt: 'Mai wearing a graduation cap and gown and holding a bouquet.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 0,
  },
  'mai-sunglasses': {
    id: 'mai-sunglasses',
    image: sunglasses,
    source: source('mai-sunglasses.jpeg', 1),
    alt: 'Mai wearing sunglasses and a white patterned cover-up while sitting on a sofa.',
    caption: null,
    crop: { fit: 'contain', position: '50% 50%' },
    restingRotation: 0,
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;

// Array order is display order. Keep all seven in the future expanded gallery.
export const galleryOrder = [
  'mai-garden-portrait',
  'mai-seaside-camera',
  'mai-blue-outfit',
  'mai-cafe-cake',
  'mai-pink-pajamas',
  'mai-graduation',
  'mai-sunglasses',
] satisfies PhotoId[];

// Editable provisional selection, independent of gallery order.
export const openingOrder = [
  'mai-garden-portrait',
  'mai-seaside-camera',
  'mai-blue-outfit',
] satisfies PhotoId[];

export const galleryPhotos: Photo[] = galleryOrder.map((id) => photos[id]);
export const openingPhotos: Photo[] = openingOrder.map((id) => photos[id]);
