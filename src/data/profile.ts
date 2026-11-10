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
} satisfies Profile;
