export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  tags: string[];
  /** Media/tools used, rendered under the caption (source: TODO.md tool table). */
  tools: string[];
  description: string;
}

export const galleryItems: GalleryItem[] = [
  {
    src: '/images/myart/Gallery/SelfPortraitSeries/Self Portrait Series - In Danger - Final.webp',
    alt: 'In Danger',
    caption: 'In Danger',
    width: 1200,
    height: 1600,
    tags: ['Digital'],
    tools: ['Adobe Photoshop', 'Photography'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/chillFinal.webp',
    alt: 'Chill',
    caption: 'Chill',
    width: 1200,
    height: 1970,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Colored Pencil'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/grossFinal.webp',
    alt: 'Gross',
    caption: 'Gross',
    width: 1200,
    height: 1481,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/EmergenceFinal.webp',
    alt: 'Emergence',
    caption: 'Emergence',
    width: 1200,
    height: 1600,
    tags: ['Digital'],
    tools: ['Procreate'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/FacesFinal.webp',
    alt: 'Faces',
    caption: 'Faces',
    width: 1200,
    height: 1556,
    tags: ['Traditional'],
    tools: ['Watercolor Paint', 'Marker', 'Photography'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/lollypopFinal.webp',
    alt: 'Lollipop',
    caption: 'Lollipop',
    width: 1200,
    height: 1559,
    tags: ['Traditional'],
    tools: ['Acrylic Paint', 'Photography'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/overflowFinal.webp',
    alt: 'Overflow',
    caption: 'Overflow',
    width: 1200,
    height: 1643,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/stairsFinal.webp',
    alt: 'Stairs',
    caption: 'Stairs',
    width: 1200,
    height: 1953,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Colored Pencil', 'Photography'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/beheadedFinal.webp',
    alt: 'Beheaded',
    caption: 'Beheaded',
    width: 1200,
    height: 1571,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/ShadowFinal.webp',
    alt: 'Shadow',
    caption: 'Shadow',
    width: 1200,
    height: 1440,
    tags: ['Traditional'],
    tools: ['Acrylic Paint', 'Photography'],
    description: '',
  },
  {
    src: '/images/myart/Gallery/txlakelandscapeFinal.webp',
    alt: 'Texas Lake Landscape',
    caption: 'Texas Lake Landscape',
    width: 1200,
    height: 1011,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Chalk Pastel', 'Photography'],
    description: '',
  },
];
