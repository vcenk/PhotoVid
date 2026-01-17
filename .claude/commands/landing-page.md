# Landing Page Development Skill

This skill helps with creating, modifying, and maintaining landing page sections for Photovid.

## Entry Point

The landing page is rendered by `components/pages/LandingPage.tsx` and accessed at the `/` route.

## Section Components Location

All landing page sections are in `components/landing/`:
- `Hero.tsx` - Main hero section with MosaicSlideshow background
- `LogoMarquee.tsx` - Scrolling logo strip
- `WorkflowDemo.tsx` - Interactive workflow demonstration
- `MosaicSlideshow.tsx` - Full-width image mosaic
- `UseCasesSection.tsx` - Use case showcases
- `TemplatePacks.tsx` - Template gallery
- `KineticShowcaseWall.tsx` - Dynamic showcase grid
- `PricingSection.tsx` - Pricing tiers
- `FaqAndFinalCtaSection.tsx` - FAQ accordion and final CTA
- `Footer.tsx` - Site footer
- `HowItWorks.tsx` - Step-by-step explainer
- `PreviewMarquee.tsx` - Preview content marquee
- `MarqueeDivider.tsx` - Animated divider
- `PricingCTA.tsx` - Pricing call-to-action
- `CreatorPresets.tsx` - Creator preset showcase

## Adding a New Section

1. Create component in `components/landing/NewSection.tsx`
2. Import and add to `LandingPage.tsx` in desired position
3. Follow existing animation patterns

## Animation Patterns

### Framer Motion (preferred for most animations)
```tsx
import { motion } from 'framer-motion';

// Fade in on scroll
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>

// Staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

### GSAP (for complex scroll-based animations)
```tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.animate-target', {
      scrollTrigger: {
        trigger: ref.current,
        start: 'top center',
        end: 'bottom center',
        scrub: true
      },
      y: -100,
      opacity: 1
    });
  }, ref);

  return () => ctx.revert();
}, []);
```

## Styling Guidelines

### Color Palette
- Backgrounds: `bg-zinc-950`, `bg-zinc-900`, `bg-[#09090b]`
- Text: `text-zinc-100`, `text-zinc-400`, `text-white`
- Accents: `text-indigo-500`, `bg-indigo-600`, `text-violet-500`
- Borders: `border-white/10`, `border-zinc-800`

### Typography
- Headings: `font-serif` (Playfair Display)
- Body: `font-sans` (Inter)
- Hero titles: `text-5xl md:text-7xl font-bold`
- Section titles: `text-3xl md:text-5xl font-bold`
- Body text: `text-lg text-zinc-400`

### Spacing
- Section padding: `py-24 md:py-32`
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card gaps: `gap-6` or `gap-8`

### Common Patterns
```tsx
// Section wrapper
<section className="py-24 md:py-32 bg-zinc-950">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* content */}
  </div>
</section>

// Gradient text
<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
  Gradient Text
</span>

// Glass card
<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
  {/* content */}
</div>

// CTA button
<button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-colors">
  Get Started
</button>
```

## Dark Mode

The landing page is dark-mode first. Always use dark variants as the base:
- Use `bg-zinc-950` not `bg-white`
- Use `text-zinc-100` not `text-zinc-900`
- Add `dark:` variants only if light mode support is needed

## Responsive Design

Follow mobile-first approach:
```tsx
// Mobile first, then tablet, then desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

Common breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

## Testing Changes

```bash
npm run dev
```
View at http://localhost:3100

## Checklist for New Sections

- [ ] Component created in `components/landing/`
- [ ] Imported and placed in `LandingPage.tsx`
- [ ] Animations use Framer Motion or GSAP appropriately
- [ ] Responsive design (mobile-first)
- [ ] Dark mode styling
- [ ] Consistent spacing with other sections
- [ ] Performance: lazy load images, optimize animations
