import type { Profile } from './types';

// Draft copy based only on supplied interests; replace with approved wording here.
export const profile = {
  name: 'Quynh Mai Vu',
  introduction: 'Hi, I’m Mai. I enjoy fashion, travel, and photography.',
  about: 'Fashion, travel, and photography are three of my interests.',
  links: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/quynhmaivux/',
    },
  ],
  metadata: {
    title: 'Quynh Mai Vu',
    description:
      'The personal website of Quynh Mai Vu, with photographs and a little about her interests in fashion, travel, and photography.',
    socialImage: {
      path: '/social-card.jpg',
      alt: 'The name Quynh Mai Vu beside a photograph of Mai in a white blouse with green foliage behind her.',
      width: 1200,
      height: 630,
    },
  },
} satisfies Profile;
