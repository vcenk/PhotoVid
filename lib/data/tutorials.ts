export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'Basics' | 'Advanced' | 'Video' | 'Editing';
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Pro';
  thumbnail: string;
  steps: { title: string; content: string }[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'virtual-staging-basics',
    title: 'Mastering Virtual Staging',
    description: 'Learn how to transform empty rooms into beautifully furnished spaces that sell.',
    category: 'Basics',
    duration: '3 min',
    level: 'Beginner',
    thumbnail: '/showcase/real-estate/after/virtual-staging.jpg',
    steps: [
      { title: 'Upload High-Res Photo', content: 'Always start with a clear, wide-angle shot of the empty room for the best AI perspective.' },
      { title: 'Select Style', content: 'Choose between Modern, Scandinavian, or Luxury to match the property architecture.' },
      { title: 'Refine Furniture', content: 'Use the "Regenerate" tool on specific areas if you want different furniture pieces.' }
    ]
  },
  {
    id: 'day-to-twilight-guide',
    title: 'Golden Hour Mastery',
    description: 'The secret to turning any daylight photo into a cinematic dusk masterpiece.',
    category: 'Editing',
    duration: '5 min',
    level: 'Intermediate',
    thumbnail: '/showcase/real-estate/after/day-to-twilight.jpg',
    steps: [
      { title: 'Sun Position', content: 'AI works best when you select a sky that matches the existing shadows of the house.' },
      { title: 'Interior Lighting', content: 'Turn on the "Auto-Light" feature to make windows glow from within.' },
      { title: 'Color Grade', content: 'Use the warmth slider to give the lawn and driveway that sunset reflection.' }
    ]
  },
  {
    id: 'cinematic-property-reveals',
    title: 'Cinematic Property Reveals',
    description: 'Create high-end drone-style video tours using only 5 static listing photos.',
    category: 'Video',
    duration: '8 min',
    level: 'Pro',
    thumbnail: '/showcase/real-estate/after/sky-replacement.jpg',
    steps: [
      { title: 'Sequence Selection', content: 'Arrange photos from Exterior -> Kitchen -> Master Bedroom for a natural flow.' },
      { title: 'Transition Timing', content: 'Set transitions to 2.5 seconds for a premium, slow-motion feel.' },
      { title: 'Audio Sync', content: 'Upload your voiceover or use our AI to generate a property narration.' }
    ]
  },
  {
    id: 'object-removal-declutter',
    title: 'The Clean Slate Method',
    description: 'How to remove personal items and clutter while maintaining realistic textures.',
    category: 'Editing',
    duration: '4 min',
    level: 'Beginner',
    thumbnail: '/showcase/real-estate/after/item-removal.jpg',
    steps: [
      { title: 'Masking Clutter', content: 'Use the brush tool to cover the item you want to remove. Stay close to the edges.' },
      { title: 'Floor Recovery', content: 'The AI will automatically rebuild the hardwood or carpet texture beneath the object.' },
      { title: 'Shadow Check', content: 'Ensure you mask the shadow of the object as well for a perfect disappearing act.' }
    ]
  }
];
