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
  /** Print mockups shown in the expanded card, two per piece (source: images/mockups/mockups.json). */
  mockups: GalleryMockup[];
}

export const galleryItems: GalleryItem[] = [
  {
    src: '/images/myart/Gallery/SelfPortraitSeries/Self Portrait Series - In Danger - Final.webp',
    alt:
      'A glowing red and blue line drawing on black of a subject resting their chin on one hand, staring blankly.',
    caption: 'In Danger',
    width: 1200,
    height: 1600,
    tags: ['Digital'],
    tools: ['Adobe Photoshop', 'Photography'],
    description:
      "A portrait drawn from a photograph in Photoshop, its hand-drawn lines altered to glow an urgent red and blue. The subject's bored stare shows how one grows numb to emergencies just to survive.",
    mockups: [
      {
        src: '/images/myart/Mockups/in-danger-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'In Danger as a stretched canvas print on a warm off-white wall',
        kind: 'canvas',
      },
      {
        src: '/images/myart/Mockups/in-danger-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'In Danger in a thin black frame with a white mat on a light grey plaster wall',
        kind: 'framed',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/chillFinal.webp',
    alt:
      'A cartoon subject in a green T-shirt raises both hands under a speech bubble that reads "Chill", against swirling pink, orange and red waves.',
    caption: 'Chill',
    width: 1200,
    height: 1970,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Colored Pencil'],
    description:
      'A colored pencil drawing, flattened in Photoshop. The subject protects his chill vibes with both arms raised in defense, while bright pink and orange waves swirl all around.',
    mockups: [
      {
        src: '/images/myart/Mockups/chill-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Chill as a paper poster taped to a sand-colored wall',
        kind: 'poster',
      },
      {
        src: '/images/myart/Mockups/chill-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Chill as a stretched canvas print on a light grey plaster wall',
        kind: 'canvas',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/grossFinal.webp',
    alt:
      'A blue-skinned subject with red bangs and braids winces in disgust, lip curled, against a black background.',
    caption: 'Gross',
    width: 1200,
    height: 1481,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description:
      'An acrylic painting, flattened in Photoshop. The subject recoils in full-face disgust, with eyes squeezed into a wince and lip curled, the cool blue skin popping against a red collar and a black background.',
    mockups: [
      {
        src: '/images/myart/Mockups/gross-skateboard.webp',
        width: 1067,
        height: 1600,
        alt: 'Gross printed on the underside of a skateboard deck, lying on concrete',
        kind: 'skateboard',
      },
      {
        src: '/images/myart/Mockups/gross-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Gross as a paper poster taped to a warm off-white wall',
        kind: 'poster',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/EmergenceFinal.webp',
    alt:
      'Two subjects rise from a purple haze, one in blue bowed forward with head in hand, one in orange arched back toward the light.',
    caption: 'Emergence',
    width: 1200,
    height: 1600,
    tags: ['Digital'],
    tools: ['Procreate'],
    description:
      'A digital painting in Procreate. Two subjects rise out of a dark purple haze like smoke: one bows forward in deep blue, head in hand, while the other arches back in fiery orange, face turned up to the light.',
    mockups: [
      {
        src: '/images/myart/Mockups/emergence-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Emergence as a stretched canvas print on a light grey plaster wall',
        kind: 'canvas',
      },
      {
        src: '/images/myart/Mockups/emergence-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Emergence as a paper poster taped to a sand-colored wall',
        kind: 'poster',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/FacesFinal.webp',
    alt:
      'A crowd of brightly colored faces with no eyes, each only a nose and an open mouth, fills the whole page.',
    caption: 'Faces',
    width: 1200,
    height: 1556,
    tags: ['Traditional'],
    tools: ['Watercolor Paint', 'Marker', 'Photography'],
    description:
      'A watercolor and marker painting drawn from an assortment of photographs. Faces with no eyes crowd every inch of the page in a rainbow of colors, each one only a nose and an open mouth: some lick their lips, some gasp, some bare their teeth.',
    mockups: [
      {
        src: '/images/myart/Mockups/faces-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Faces in a thin black frame with a white mat on a light grey plaster wall',
        kind: 'framed',
      },
      {
        src: '/images/myart/Mockups/faces-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Faces as a stretched canvas print on a warm off-white wall',
        kind: 'canvas',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/lollypopFinal.webp',
    alt:
      'A close-up of a violet-skinned face, eyes closed, with a blue lollipop on a red stick between parted lips.',
    caption: 'Lollipop',
    width: 1200,
    height: 1559,
    tags: ['Traditional'],
    tools: ['Acrylic Paint', 'Photography'],
    description:
      'An acrylic painting made from a photograph. A face tilts back in close-up, eyes closed, as a glossy blue lollipop on a red stick slips between parted lips. Soft violet and periwinkle skin sits against a warm brown background.',
    mockups: [
      {
        src: '/images/myart/Mockups/lollipop-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Lollipop as a paper poster taped to a warm off-white wall',
        kind: 'poster',
      },
      {
        src: '/images/myart/Mockups/lollipop-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Lollipop in a thin black frame with a white mat on a sand-colored wall',
        kind: 'framed',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/overflowFinal.webp',
    alt:
      'A close-up portrait of a subject with blond hair rolling their eyes back as black ink drips from the eyes and mouth.',
    caption: 'Overflow',
    width: 1200,
    height: 1643,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description:
      'An acrylic painting, color corrected in Photoshop. A subject with pale blond hair and flushed pink skin rolls their eyes back into their head, leaving only the whites. Thick black ink runs down from both eyes and the mouth, set against a smeared grey background and a red collar.',
    mockups: [
      {
        src: '/images/myart/Mockups/overflow-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Overflow as a stretched canvas print on a sand-colored wall',
        kind: 'canvas',
      },
      {
        src: '/images/myart/Mockups/overflow-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Overflow in a thin black frame with a white mat on a warm off-white wall',
        kind: 'framed',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/stairsFinal.webp',
    alt:
      'Seen from below, a subject in a blue sweater climbs green carpeted stairs, with the sole of a brown boot in the foreground.',
    caption: 'Stairs',
    width: 1200,
    height: 1953,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Colored Pencil', 'Photography'],
    description:
      'A colored pencil drawing made from a photograph, color corrected in Photoshop. Seen from below, a subject in a ribbed blue sweater climbs a green carpeted stairwell. The worn sole of a brown boot fills the foreground, framed by the black rails of the banister and the yellow light of the hall above.',
    mockups: [
      {
        src: '/images/myart/Mockups/stairs-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Stairs in a thin black frame with a white mat on a warm off-white wall',
        kind: 'framed',
      },
      {
        src: '/images/myart/Mockups/stairs-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Stairs as a paper poster taped to a light grey plaster wall',
        kind: 'poster',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/beheadedFinal.webp',
    alt:
      'A severed head with pink and orange hair and black X\'s for eyes, dripping black paint, on a swirling blue background.',
    caption: 'Beheaded',
    width: 1200,
    height: 1571,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Acrylic Paint'],
    description:
      'An acrylic painting, color corrected in Photoshop. A severed head with a shock of hot pink and orange hair floats in a churning blue background. Black X\'s mark the eyes, and thick black paint drips from the mouth and the cut at the neck.',
    mockups: [
      {
        src: '/images/myart/Mockups/beheaded-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Beheaded as a stretched canvas print on a light grey plaster wall',
        kind: 'canvas',
      },
      {
        src: '/images/myart/Mockups/beheaded-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Beheaded as a paper poster taped to a sand-colored wall',
        kind: 'poster',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/ShadowFinal.webp',
    alt:
      'Shadow, a black puppy with his tongue out, under a graffiti-covered bridge beside a red and orange skateboard.',
    caption: 'Shadow',
    width: 1200,
    height: 1440,
    tags: ['Traditional'],
    tools: ['Acrylic Paint', 'Photography'],
    description:
      'An acrylic painting made from a photograph. Shadow, a scruffy black puppy, grins at the viewer with his pink tongue out and one ear flopped over, his tail a blur of white strokes. He stands under a graffiti-covered bridge, with shrubs lining the edges of the concrete and a red and orange skateboard tipped up beside him.',
    mockups: [
      {
        src: '/images/myart/Mockups/shadow-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Shadow in a thin black frame with a white mat on a sand-colored wall',
        kind: 'framed',
      },
      {
        src: '/images/myart/Mockups/shadow-canvas.webp',
        width: 1600,
        height: 1067,
        alt: 'Shadow as a stretched canvas print on a warm off-white wall',
        kind: 'canvas',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/txlakelandscapeFinal.webp',
    alt:
      'Sand dunes with green shrubs and tall grass above Canyon Lake, under white and pink clouds.',
    caption: 'Texas Lake Landscape',
    width: 1200,
    height: 1011,
    tags: ['Traditional', 'Digital'],
    tools: ['Adobe Photoshop', 'Chalk Pastel', 'Photography'],
    description:
      'A chalk pastel drawing of Canyon Lake, Texas, made from a photograph and color corrected in Photoshop. Sandy dunes dotted with green shrubs and tall brown grasses roll down to deep blue water and whitecaps. Above, a billowing white cloud rises from a band of pink clouds along the horizon.',
    mockups: [
      {
        src: '/images/myart/Mockups/texas-lake-landscape-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Texas Lake Landscape as a paper poster taped to a light grey plaster wall',
        kind: 'poster',
      },
      {
        src: '/images/myart/Mockups/texas-lake-landscape-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Texas Lake Landscape in a thin black frame with a white mat on a sand-colored wall',
        kind: 'framed',
      },
    ],
  },
  {
    src: '/images/myart/Gallery/MoonlightFinal.webp',
    alt:
      'Looking up through bare trees at a crescent moon casting violet rays, with three black birds flying past.',
    caption: 'Moonlight',
    width: 1200,
    height: 800,
    tags: ['Digital'],
    tools: ['Procreate'],
    description:
      'A digital painting in Procreate. Looking straight up through a ring of bare, olive-toned trees, a thin crescent moon glows in a deep indigo sky. Its light pours out in long violet rays, and three black birds cross the sky beside it.',
    mockups: [
      {
        src: '/images/myart/Mockups/moonlight-framed.webp',
        width: 1600,
        height: 1067,
        alt: 'Moonlight in a thin black frame with a white mat on a warm off-white wall',
        kind: 'framed',
      },
      {
        src: '/images/myart/Mockups/moonlight-poster.webp',
        width: 1600,
        height: 1067,
        alt: 'Moonlight as a paper poster taped to a light grey plaster wall',
        kind: 'poster',
      },
    ],
  },
];
