export interface GalleryMockup {
  src: string;
  width: number;
  height: number;
  alt: string;
  kind: 'canvas' | 'framed' | 'poster' | 'skateboard';
}

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
  /** Print mockup shown in the expanded card (source: images/mockups/mockups.json). */
  mockup?: GalleryMockup;
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
    mockup: {
      src: '/images/myart/Mockups/in-danger-canvas.webp',
      width: 1600,
      height: 1067,
      alt: 'In Danger as a stretched canvas print on a warm off-white wall',
      kind: 'canvas',
    },
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
    mockup: {
      src: '/images/myart/Mockups/chill-poster.webp',
      width: 1600,
      height: 1067,
      alt: 'Chill as a paper poster taped to a sand-coloured wall',
      kind: 'poster',
    },
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
    mockup: {
      src: '/images/myart/Mockups/gross-skateboard.webp',
      width: 1067,
      height: 1600,
      alt: 'Gross printed on the underside of a skateboard deck, lying on concrete',
      kind: 'skateboard',
    },
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
    mockup: {
      src: '/images/myart/Mockups/emergence-canvas.webp',
      width: 1600,
      height: 1067,
      alt: 'Emergence as a stretched canvas print on a light grey plaster wall',
      kind: 'canvas',
    },
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
    mockup: {
      src: '/images/myart/Mockups/faces-framed.webp',
      width: 1600,
      height: 1067,
      alt: 'Faces in a thin black frame with a white mat on a light grey plaster wall',
      kind: 'framed',
    },
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
    mockup: {
      src: '/images/myart/Mockups/lollipop-poster.webp',
      width: 1600,
      height: 1067,
      alt: 'Lollipop as a paper poster taped to a warm off-white wall',
      kind: 'poster',
    },
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
    mockup: {
      src: '/images/myart/Mockups/overflow-canvas.webp',
      width: 1600,
      height: 1067,
      alt: 'Overflow as a stretched canvas print on a sand-coloured wall',
      kind: 'canvas',
    },
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
    mockup: {
      src: '/images/myart/Mockups/stairs-framed.webp',
      width: 1600,
      height: 1067,
      alt: 'Stairs in a thin black frame with a white mat on a warm off-white wall',
      kind: 'framed',
    },
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
    mockup: {
      src: '/images/myart/Mockups/beheaded-canvas.webp',
      width: 1600,
      height: 1067,
      alt: 'Beheaded as a stretched canvas print on a light grey plaster wall',
      kind: 'canvas',
    },
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
    mockup: {
      src: '/images/myart/Mockups/shadow-framed.webp',
      width: 1600,
      height: 1067,
      alt: 'Shadow in a thin black frame with a white mat on a sand-coloured wall',
      kind: 'framed',
    },
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
    mockup: {
      src: '/images/myart/Mockups/texas-lake-landscape-poster.webp',
      width: 1600,
      height: 1067,
      alt: 'Texas Lake Landscape as a paper poster taped to a light grey plaster wall',
      kind: 'poster',
    },
  },
  {
    src: '/images/myart/Gallery/MoonlightFinal.webp',
    alt: 'Moonlight',
    caption: 'Moonlight',
    width: 1200,
    height: 800,
    tags: ['Digital'],
    tools: ['Procreate'],
    description: '',
    mockup: {
      src: '/images/myart/Mockups/moonlight-framed.webp',
      width: 1600,
      height: 1067,
      alt: 'Moonlight in a thin black frame with a white mat on a warm off-white wall',
      kind: 'framed',
    },
  },
];
