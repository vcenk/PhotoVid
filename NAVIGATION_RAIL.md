# Navigation Rail Implementation

## Overview
Implemented an imagine.art-style vertical navigation rail with flyout panels for the PhotoVid dashboard.

## Components Created

### 1. NavigationRail.tsx (components/dashboard/NavigationRail.tsx:1)
**Fixed-width vertical sidebar (72px) with:**
- **Logo**: Top section with PhotoVid branding
- **Main Navigation**:
  - Home
  - Apps
  - Image (with flyout)
  - Video (with flyout)
  - Edit (with flyout)
  - Lipsync
- **Utility Section** (bottom):
  - Theme toggle (Dark/Light)
  - Help
  - More (popup menu)

**Features:**
- Icon (24px) on top, text label (10px) below
- Rounded-2xl squircle background on hover/active
- Active state with indigo color and left indicator bar
- Smooth transitions and animations

### 2. FlyoutPanels.tsx (components/dashboard/FlyoutPanels.tsx:1)
**320px wide panels that appear when clicking Image/Video/Edit:**

**Image Panel:**
- Quick Actions: Text to Image, Image Variation, Upscale, Remove Background
- Style Presets: 6 industry-specific presets (lighting, composition, color-grading)

**Video Panel:**
- Quick Actions: Text to Video, Image to Video, Extend Video, Upscale Video
- Motion Styles: Slow Pan, Dolly Zoom, Aerial Glide, Room Flow

**Edit Panel:**
- Editing Tools: Inpaint, Outpaint, Object Remove, Color Correction, Relighting, Style Transfer

**Features:**
- Backdrop overlay with blur
- Close button and ESC key support
- Navigates to /dashboard/studio with query parameters
- Industry-aware (uses activeIndustry from store)

### 3. Updated DashboardPage.tsx (components/pages/DashboardPage.tsx:1)
- Removed old DashboardSidebar
- Added NavigationRail + FlyoutPanels
- Main content offset by 72px (rail width)
- State management for activeFlyout

### 4. Updated DashboardTopbar.tsx (components/dashboard/DashboardTopbar.tsx:1)
- Removed mobile menu button
- Simplified layout for rail-based navigation

## Visual Design

### Navigation Items
```
┌─────────────┐
│     PV      │ ← Logo (40px rounded square)
├─────────────┤
│   [icon]    │ ← Icon in 40px squircle
│    Home     │ ← 10px text label
├─────────────┤
│   [icon]    │
│    Apps     │
├─────────────┤
│   [icon]    │ ← Has flyout indicator
│   Image     │
└─────────────┘
```

### States
- **Normal**: Gray icon/text
- **Hover**: Light gray background on icon squircle
- **Active**: Indigo background + indigo text + left bar indicator

### Flyout Panel
```
┌──────────────────────────┐
│ [Icon] Image Tools    [×]│ ← Header
├──────────────────────────┤
│                          │
│  Quick Actions           │
│  ┌────────────────────┐  │
│  │ [icon] Text to...  │  │ ← Action cards
│  └────────────────────┘  │
│                          │
│  Style Presets           │
│  ┌────┐ ┌────┐ ┌────┐   │ ← 2-column grid
│  │    │ │    │ │    │   │
│  └────┘ └────┘ └────┘   │
└──────────────────────────┘
```

## Integration Points

### State Management
```typescript
const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
// FlyoutType = 'image' | 'video' | 'edit' | null
```

### Navigation Flow
1. User clicks Image/Video/Edit → Opens flyout
2. User clicks action in flyout → Navigates to `/dashboard/studio?mode=X&action=Y&industry=Z`
3. User clicks outside or Close → Closes flyout

### Theme Integration
- Uses existing ThemeProvider
- Dark mode fully supported
- Smooth theme transitions

## Usage

```tsx
import { NavigationRail } from '../dashboard/NavigationRail';
import { FlyoutPanels } from '../dashboard/FlyoutPanels';

function DashboardPage() {
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

  return (
    <div>
      <NavigationRail
        activeFlyout={activeFlyout}
        onFlyoutChange={setActiveFlyout}
      />
      <FlyoutPanels
        activeFlyout={activeFlyout}
        onClose={() => setActiveFlyout(null)}
      />
      <main style={{ marginLeft: '72px' }}>
        {/* Content */}
      </main>
    </div>
  );
}
```

## Icons Used (lucide-react)
- Home, LayoutGrid (Apps)
- Image, Video, Wand2 (Edit)
- Mic2 (Lipsync)
- Moon/Sun (Theme)
- HelpCircle, MoreHorizontal
- X (Close), ArrowRight (Actions)
- Sparkles (AI features)

## Styling
- Width: 72px (rail), 320px (flyout)
- Colors: Indigo for active states, Zinc for neutrals
- Borders: 1px zinc-200/800
- Radius: rounded-2xl (squircles), rounded-xl (panels)
- Shadows: shadow-2xl on flyouts
- Transitions: 200ms duration
- Font: 10-11px for labels, medium weight

## Accessibility
- ARIA labels on icon-only buttons
- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure

## Future Enhancements
- Mobile responsive drawer
- Keyboard shortcuts
- Tooltips on hover
- Breadcrumb navigation
- Recent items in flyouts
- Favorites/pinned tools
